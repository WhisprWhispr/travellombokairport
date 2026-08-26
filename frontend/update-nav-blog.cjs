const fs = require('fs');

const files = fs.readdirSync('frontend').filter(f => f.endsWith('.html'));

const blogLinkDesktop = '<li><a href="/blog.html"><i class="fa-solid fa-newspaper"></i> Blog</a></li>';
const blogLinkMobile = '<a href="/blog.html" class="mobile-nav-link"><i class="fa-solid fa-newspaper"></i> Blog</a>';

for (let file of files) {
    if (file === 'admin.html') continue;
    
    let html = fs.readFileSync(`frontend/${file}`, 'utf8');
    let changed = false;

    // Add to desktop nav before wishlist
    if (!html.includes('href="/blog.html"') && html.includes('<li><a href="/wishlist.html"')) {
        html = html.replace('<li><a href="/wishlist.html"', `${blogLinkDesktop}\n            <li><a href="/wishlist.html"`);
        changed = true;
    }

    // Add to mobile nav before wishlist
    if (!html.includes('href="/blog.html"') && html.includes('<a href="/wishlist.html" class="mobile-nav-link"')) {
        html = html.replace('<a href="/wishlist.html" class="mobile-nav-link"', `${blogLinkMobile}\n          <a href="/wishlist.html" class="mobile-nav-link"`);
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(`frontend/${file}`, html);
        console.log(`Updated ${file}`);
    }
}
