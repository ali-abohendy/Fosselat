const fs = require('fs');
function walk(dir) {
  let list;
  try { list = fs.readdirSync(dir); } catch(e) { return []; }
  let results = [];
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
    const path = dir + '/' + file;
    if (fs.statSync(path).isDirectory()) {
      results = results.concat(walk(path));
    } else if (path.endsWith('.jsx') || path.endsWith('.js')) {
      const txt = fs.readFileSync(path, 'utf8');
      const lines = txt.split('\n');
      for (let i=0; i<lines.length; i++) {
        if (lines[i].includes('<a ') && lines[i].includes('href=') && !lines[i].includes('http') && !lines[i].includes('mailto:') && !lines[i].includes('download')) {
          results.push({path, line: i+1, content: lines[i].trim()});
        }
      }
    }
  }
  return results;
}
console.log(walk('frontend/src'));
