const fs = require('fs');
let content = fs.readFileSync('src/Chapter1.jsx', 'utf8');
const before = content.includes("onComplete('diary')");
content = content.replace("onComplete('diary')", 'setDiaryOpen(true)');
const after = content.includes('setDiaryOpen(true)');
fs.writeFileSync('src/Chapter1.jsx', content, 'utf8');
console.log('before:', before, 'after:', after);
