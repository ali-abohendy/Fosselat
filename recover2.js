const fs = require('fs');
const path = require('path');

const targetFile = 'C:/Users/Ali Abo Hendy/.gemini/antigravity/brain/32be80b0-7417-49ae-89b9-01b8747548ea/.system_generated/logs/transcript_full.jsonl';

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
                            file: call.args.TargetFile
                        });
                    }
                }
            }
        }
    } catch (e) {}
}

allEdits.sort((a, b) => a.time - b.time);
console.log("Total edits found: " + allEdits.length);

let fileStates = {};

for (const edit of allEdits) {
    const filename = path.basename(edit.file);
    if (edit.call.name === 'write_to_file') {
        fileStates[filename] = edit.call.args.CodeContent;
    } else if (edit.call.name === 'replace_file_content') {
        const target = edit.call.args.TargetContent;
        const repl = edit.call.args.ReplacementContent;
        if (fileStates[filename]) {
            fileStates[filename] = fileStates[filename].replace(target, repl);
        }
    } else if (edit.call.name === 'multi_replace_file_content') {
        for (const r of edit.call.args.Replacements) {
             if (fileStates[filename]) {
                 fileStates[filename] = fileStates[filename].replace(r.TargetContent, r.ReplacementContent);
             }
        }
    }
}

fs.writeFileSync('recovered_PlacementTest.jsx', fileStates['PlacementTest.jsx'] || '');
fs.writeFileSync('recovered_PlacementTest.css', fileStates['PlacementTest.css'] || '');
console.log('Recovered files saved from 32be80b0.');
