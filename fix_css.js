const fs = require('fs');
let buffer = fs.readFileSync('frontend/src/pages/PlacementTest.css');

let lastBrace = -1;
for(let i = buffer.length - 1; i >= 0; i--) {
    if (buffer[i] === 0x00) continue;
    if (buffer[i] === 0x7D) {
        if (i > 0 && buffer[i-1] === 0x00) {
            continue;
        }
        lastBrace = i;
        break;
    }
}

let cleanBuffer = buffer.slice(0, lastBrace + 1);
let text = cleanBuffer.toString('utf8');

const appendedCSS = `
/* Form Styles */
.pt-userinfo-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pt-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.pt-form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-cream);
}

.pt-form-group input {
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(240, 230, 211, 0.16);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  font-size: 0.95rem;
  color: var(--color-cream);
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.pt-form-group input:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow: 0 0 0 3px rgba(200, 167, 99, 0.15);
}

.pt-form-group input.pt-input-error {
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.05);
}

.pt-error-text {
  color: #ff6b6b;
  font-size: 0.82rem;
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.pt-error-text::before {
  content: '⚠️';
  font-size: 0.85rem;
}
`;

fs.writeFileSync('frontend/src/pages/PlacementTest.css', text + '\n' + appendedCSS, 'utf8');
console.log('Fixed CSS encoding!');
