const fs = require('fs');
const html = fs.readFileSync('Final Placement tests/fosselat-placement-v4_2-preview.html', 'utf8');

// We want to see the CSS blocks
const cssMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/g);
if (cssMatches) {
    fs.writeFileSync('extracted_styles.css', cssMatches.join('\n'));
    console.log('Extracted CSS to extracted_styles.css');
}

// We want to see the HTML structure of the question card
const qCardMatch = html.match(/<div[^>]*class="pt-screen"[^>]*id="screen-question"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/);
if (qCardMatch) {
    fs.writeFileSync('extracted_qcard.html', qCardMatch[0]);
    console.log('Extracted Question Card to extracted_qcard.html');
}

// We want to see the intro screens HTML
const screens = [];
let screenMatch;
const screenRegex = /<div[^>]*class="pt-screen"[^>]*id="screen-([^"]+)"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g;
while ((screenMatch = screenRegex.exec(html)) !== null) {
    screens.push(`<!-- Screen: ${screenMatch[1]} -->\n${screenMatch[0]}`);
}
if (screens.length > 0) {
    fs.writeFileSync('extracted_screens.html', screens.join('\n\n'));
    console.log('Extracted Intro Screens to extracted_screens.html');
}
