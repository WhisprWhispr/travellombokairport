import { getDb } from './api/config/firebase.js';

export async function onRequest(context) {
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Halaman Utama -->
  <url>
    <loc>https://travellombokairport.com/</loc>
    <lastmod>2026-08-24</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Halaman Publik -->
  <url>
    <loc>https://travellombokairport.com/tentang-kami</loc>
    <lastmod>2026-08-24</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://travellombokairport.com/galeri</loc>
    <lastmod>2026-08-24</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://travellombokairport.com/drone</loc>
    <lastmod>2026-08-24</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://travellombokairport.com/kontak</loc>
    <lastmod>2026-08-24</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://travellombokairport.com/syarat</loc>
    <lastmod>2026-08-24</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://travellombokairport.com/kebijakan</loc>
    <lastmod>2026-08-24</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://travellombokairport.com/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;

    try {
        const db = getDb(context);
        const blogsSnapshot = await db.collection('blogs').get();
        
        blogsSnapshot.forEach(doc => {
            const blog = doc.data();
            const date = blog.createdAt ? new Date(blog.createdAt).toISOString().split('T')[0] : '2026-08-24';
            sitemap += `  <url>
    <loc>https://travellombokairport.com/article.html?id=${doc.id}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
        });
    } catch (error) {
        console.error("Error generating dynamic sitemap:", error);
    }

    sitemap += `</urlset>`;

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600' // Cache for 1 hour to reduce DB reads
        }
    });
}
