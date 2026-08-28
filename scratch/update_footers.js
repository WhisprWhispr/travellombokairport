const fs = require('fs');
const path = require('path');

const dir = 'frontend';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let html = fs.readFileSync(filePath, 'utf8');

    // Add Jadwal Sholat link in footer if not already present
    if (html.includes('<li><a href="/wishlist.html">Wishlist</a></li>') && !html.includes('<li><a href="/jadwal-sholat.html">Jadwal Sholat</a></li>')) {
        html = html.replace(
            '<li><a href="/wishlist.html">Wishlist</a></li>',
            '<li><a href="/wishlist.html">Wishlist</a></li>\n              <li><a href="/jadwal-sholat.html">Jadwal Sholat</a></li>'
        );
        fs.writeFileSync(filePath, html);
        console.log(`Updated footer in ${file}`);
    }
});
