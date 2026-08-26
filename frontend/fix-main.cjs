const fs = require('fs');
let js = fs.readFileSync('frontend/main.js', 'utf8');

// Replace literal backslash followed by backtick with just backtick
js = js.replace(/\\\`/g, '`');
js = js.replace(/\\\$/g, '$');

fs.writeFileSync('frontend/main.js', js);
console.log('fixed main.js');
