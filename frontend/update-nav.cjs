const fs = require('fs');
const files = fs.readdirSync('frontend').filter(f => f.endsWith('.html') && !f.includes('admin') && !f.includes('driver'));

for (const file of files) {
    const p = 'frontend/' + file;
    let html = fs.readFileSync(p, 'utf8');
    if (html.includes('<li><a href="/galeri.html">Galeri</a></li>') && !html.includes('wishlist.html">Wishlist')) {
        html = html.replace('<li><a href="/galeri.html">Galeri</a></li>', '<li><a href="/galeri.html">Galeri</a></li>\n        <li><a href="/wishlist.html">Wishlist <i class="fa-solid fa-heart" style="color:#ef4444; font-size:0.8em; margin-left:3px;"></i></a></li>');
        fs.writeFileSync(p, html);
        console.log('Updated', file);
    }
}
