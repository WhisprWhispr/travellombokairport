import fs from 'fs';
import path from 'path';

async function generateSitemap() {
  console.log("Generating dynamic sitemap at build time...");
  
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
    const res = await fetch('https://travellombokairport.com/api/blogs?list=true');
    if (res.ok) {
      const blogs = await res.json();
      blogs.forEach(blog => {
        const date = blog.createdAt ? new Date(blog.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        sitemap += `  <url>
    <loc>https://travellombokairport.com/article.html?id=${blog.id}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
      });
      console.log(`Successfully added ${blogs.length} blogs to sitemap.`);
    } else {
      console.error("Failed to fetch blogs from API during build.");
    }
  } catch (e) {
    console.error("Error fetching blogs for sitemap:", e);
  }

  sitemap += `</urlset>\n`;
  
  // Write to public/sitemap.xml
  const sitemapPath = path.resolve(import.meta.dirname, 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
  console.log("Sitemap written to", sitemapPath);
}

generateSitemap();
