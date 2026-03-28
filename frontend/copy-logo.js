const fs = require('fs');
const source = 'C:\\Users\\Super\\.gemini\\antigravity\\brain\\de8f2892-633d-4bba-9c53-fb99e4e9f256\\media__1774438051486.png';
const dest = './public/logo.png';
fs.copyFileSync(source, dest);
console.log('Logo copied successfully!');
