const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const targetFile = 'C:/Users/Ali Abo Hendy/.gemini/antigravity/brain/cc9e60c5-6ba2-40d0-a65d-3e50b5297992/.system_generated/logs/transcript_full.jsonl';

let allEdits = [];

const lines = fs.readFileSync(targetFile, 'utf8').split('\n');
for (const line of lines) {
    if (!line) continue;
    try {
        const obj = JSON.parse(line);
        if (obj.type === 'PLANNER_RESPONSE' && obj.tool_calls) {
            for (const call of obj.tool_calls) {
                if (call.name === 'write_to_file' || call.name === 'replace_file_content' || call.name === 'multi_replace_file_content') {
                    if (call.args.TargetFile && (call.args.TargetFile.includes('PlacementTest.jsx') || call.args.TargetFile.includes('PlacementTest.css'))) {
                        allEdits.push({
                            time: new Date(obj.created_at).getTime(),
                            call: call,
                            file: call.args.TargetFile,
                            summary: call.args.toolSummary
                        });
                    }
                }
            }
        }
    } catch (e) {}
}

allEdits.sort((a, b) => a.time - b.time);

const cutoffTime = new Date('2026-08-21T01:00:00Z').getTime();

let baseJsx = cp.execSync('git show b765078:frontend/src/pages/PlacementTest.jsx').toString().replace(/\r\n/g, '\n');
let baseCss = cp.execSync('git show b765078:frontend/src/pages/PlacementTest.css').toString().replace(/\r\n/g, '\n');

let fileStates = {
    'PlacementTest.jsx': baseJsx,
    'PlacementTest.css': baseCss
};

function norm(s) {
    return s.replace(/\r\n/g, '\n');
}

let applied = 0;
for (const edit of allEdits) {
    if (edit.time > cutoffTime) break;
    
    const filename = path.basename(edit.file);
    if (edit.call.name === 'write_to_file') {
        fileStates[filename] = norm(edit.call.args.CodeContent);
        applied++;
    } else if (edit.call.name === 'replace_file_content') {
        const target = norm(edit.call.args.TargetContent);
        const repl = norm(edit.call.args.ReplacementContent);
        if (fileStates[filename] && fileStates[filename].includes(target)) {
            fileStates[filename] = fileStates[filename].replace(target, repl);
            applied++;
        } else {
            console.log("Failed to match target for", edit.summary);
        }
    } else if (edit.call.name === 'multi_replace_file_content') {
        for (const r of edit.call.args.ReplacementChunks) {
             const rt = norm(r.TargetContent);
             const rr = norm(r.ReplacementContent);
             if (fileStates[filename] && fileStates[filename].includes(rt)) {
                 fileStates[filename] = fileStates[filename].replace(rt, rr);
                 applied++;
             } else {
                 console.log("Failed to match multi target for", edit.summary);
             }
        }
    }
}

fs.writeFileSync('recovered_PlacementTest.jsx', fileStates['PlacementTest.jsx'] || '');
fs.writeFileSync('recovered_PlacementTest.css', fileStates['PlacementTest.css'] || '');
console.log('Recovered files saved up to cutoff. Edits applied:', applied);
