const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/PlacementTest.jsx', 'utf8');

const backButtonCode = (target) => `
        <div style={{ marginBottom: '16px' }}>
          <button className="pt-btn pt-btn-ghost" style={{ padding: '4px 8px', minHeight: 'unset', color: 'var(--text-muted)' }} onClick={() => setScreen('${target}')}>&larr; Back</button>
        </div>`;

// 1. renderTrack (Back to welcome)
code = code.replace(
  '<div className="pt-eyebrow">Step 1</div>',
  backButtonCode('welcome') + '\n          <div className="pt-eyebrow">Step 1</div>'
);

// 2. renderProgram (Back to track)
code = code.replace(
  '<div className="pt-eyebrow">Step 2</div>',
  backButtonCode('track') + '\n          <div className="pt-eyebrow">Step 2</div>'
);

// 3. renderTestIntro (Back to program)
code = code.replace(
  '<div className="pt-eyebrow">{track?.label} • {program.label}</div>',
  backButtonCode('program') + '\n          <div className="pt-eyebrow">{track?.label} • {program.label}</div>'
);

// 4. renderSelfReport (Back to testintro)
code = code.replace(
  '<div className="pt-eyebrow">{track?.label} • {program.label}</div>\n          <h1 className="pt-display-sm">{sr.prompt}</h1>',
  backButtonCode('testintro') + '\n          <div className="pt-eyebrow">{track?.label} • {program.label}</div>\n          <h1 className="pt-display-sm">{sr.prompt}</h1>'
);

fs.writeFileSync('frontend/src/pages/PlacementTest.jsx', code);
console.log('Added back buttons');
