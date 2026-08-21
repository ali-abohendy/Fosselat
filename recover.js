const fs = require('fs');
const path = require('path');

const brainPath = 'C:\\Users\\Ali Abo Hendy\\.gemini\\antigravity\\brain';

function getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(getFiles(file));
        } else { 
            if (file.endsWith('transcript_full.jsonl')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = getFiles(brainPath);
let allEdits = [];

for (const file of files) {
    if (file.includes('cc9e60c5')) continue; // skip current
    const lines = fs.readFileSync(file, 'utf8').split('\n');
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
    }
}

fs.writeFileSync('recovered_PlacementTest.jsx', fileStates['PlacementTest.jsx'] || '');
fs.writeFileSync('recovered_PlacementTest.css', fileStates['PlacementTest.css'] || '');
console.log('Recovered files saved.');
