const fs = require('fs');
let js = fs.readFileSync('frontend/admin.js', 'utf8');

// Replace literal backslash followed by backtick with just backtick
js = js.replace(/\\\`/g, '`');
js = js.replace(/\\\$/g, '$');

fs.writeFileSync('frontend/admin.js', js);
console.log('fixed admin.js');
