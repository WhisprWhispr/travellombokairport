const fs = require('fs');
let html = fs.readFileSync('frontend/wishlist.html', 'utf8');

// Replace titles
html = html.replace(/<title>Wishlist.*?<\/title>/, '<title>Blog & Artikel Wisata - Travel Lombok</title>');

// Replace header content
html = html.replace(/<h1 style="margin-top: 80px.*?>.*?<\/h1>/, '<h1 style="margin-top: 80px; text-align: center; color: var(--primary-blue); font-size: 2.5rem; margin-bottom: 10px;">Blog & Artikel Wisata</h1><p style="text-align: center; color: var(--text-gray); max-width: 600px; margin: 0 auto 40px;">Temukan tips liburan, rekomendasi destinasi, dan cerita seru seputar wisata Lombok.</p>');

// Replace wishlist-container
html = html.replace(/<div id="wishlist-container".*?<\/div>/s,
`<div id="blog-container" class="grid" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px; min-height: 400px; padding: 20px; max-width: 1200px; margin: 0 auto;">
      <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
        <i class="fa-solid fa-spinner fa-spin fa-2x" style="color: var(--primary-blue); margin-bottom: 20px;"></i>
        <p style="color: var(--text-gray);">Memuat artikel...</p>
      </div>
    </div>`);

html = html.replace('</head>', '<script src="./blog.js" defer></script>\n</head>');
html = html.replace('<script src="./main.js" type="module"></script>', '<script src="./main.js"></script>');

fs.writeFileSync('frontend/blog.html', html);
console.log('blog.html created');

// For article.html
let articleHtml = fs.readFileSync('frontend/wishlist.html', 'utf8');
articleHtml = articleHtml.replace(/<title>Wishlist.*?<\/title>/, '<title>Membaca Artikel - Travel Lombok</title>');
articleHtml = articleHtml.replace(/<h1 style="margin-top: 80px.*?>.*?<\/h1>/, '');

articleHtml = articleHtml.replace(/<div id="wishlist-container".*?<\/div>/s,
`<div id="article-container" style="max-width: 800px; margin: 80px auto; padding: 20px; min-height: 500px;">
      <div style="text-align: center; padding: 50px;">
        <i class="fa-solid fa-spinner fa-spin fa-2x" style="color: var(--primary-blue); margin-bottom: 20px;"></i>
        <p style="color: var(--text-gray);">Memuat artikel...</p>
      </div>
    </div>`);

articleHtml = articleHtml.replace('</head>', '<script src="./article.js" defer></script>\n</head>');
articleHtml = articleHtml.replace('<script src="./main.js" type="module"></script>', '<script src="./main.js"></script>');

fs.writeFileSync('frontend/article.html', articleHtml);
console.log('article.html created');
