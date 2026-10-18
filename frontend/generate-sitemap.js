import fs from 'fs';
import path from 'path';

async function generateSitemap() {
  console.log("Generating professional dynamic sitemap at build time...");
  
  const today = new Date().toISOString().split('T')[0];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Halaman Beranda (Landing Page Utama) -->
  <url>
    <loc>https://travellombokairport.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>https://travellombokairport.com/logo.png</image:loc>
      <image:title>Travel Lombok Airport - Rental Mobil &amp; Paket Wisata Lombok</image:title>
      <image:caption>Layanan sewa mobil lepas kunci, include supir, antar jemput bandara BIL, dan paket tour Lombok</image:caption>
    </image:image>
  </url>

  <!-- Halaman Blog & Artikel Wisata -->
  <url>
    <loc>https://travellombokairport.com/blog.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://travellombokairport.com/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Galeri Foto & Dokumentasi Liburan -->
  <url>
    <loc>https://travellombokairport.com/galeri.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>https://travellombokairport.com/galeri</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>

  <!-- Jasa Dokumentasi Drone -->
  <url>
    <loc>https://travellombokairport.com/drone.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://travellombokairport.com/drone</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Tentang Kami -->
  <url>
    <loc>https://travellombokairport.com/tentang-kami.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>
  <url>
    <loc>https://travellombokairport.com/tentang-kami</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>

  <!-- Kontak & Layanan Pelanggan 24 Jam -->
  <url>
    <loc>https://travellombokairport.com/kontak.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>
  <url>
    <loc>https://travellombokairport.com/kontak</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>

  <!-- Jadwal Sholat Lombok & Sekitarnya -->
  <url>
    <loc>https://travellombokairport.com/jadwal-sholat.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://travellombokairport.com/jadwal-sholat</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Syarat & Ketentuan Sewa / Tour -->
  <url>
    <loc>https://travellombokairport.com/syarat.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://travellombokairport.com/syarat</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Kebijakan Privasi -->
  <url>
    <loc>https://travellombokairport.com/kebijakan.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://travellombokairport.com/kebijakan</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;

  try {
    const res = await fetch('https://travellombokairport.com/api/blogs?list=true');
    if (res.ok) {
      const blogs = await res.json();
      blogs.forEach(blog => {
        const date = blog.updatedAt ? new Date(blog.updatedAt).toISOString().split('T')[0] : (blog.createdAt ? new Date(blog.createdAt).toISOString().split('T')[0] : today);
        const imageTag = blog.imageUrl ? `
    <image:image>
      <image:loc>${blog.imageUrl}</image:loc>
      <image:title>${(blog.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}</image:title>
    </image:image>` : '';

        sitemap += `  <!-- Artikel: ${blog.title ? blog.title.replace(/&/g, '&amp;') : ''} -->
  <url>
    <loc>https://travellombokairport.com/article.html?id=${blog.id}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageTag}
  </url>\n`;
      });
      console.log(`Successfully added ${blogs.length} dynamic blog articles to sitemap.`);
    } else {
      console.warn("API blogs response not OK, skipping dynamic blog URLs.");
    }
  } catch (e) {
    console.warn("Could not fetch remote blogs during build:", e.message);
  }

  sitemap += `</urlset>\n`;
  
  // Write to public/sitemap.xml
  const publicPath = path.resolve(import.meta.dirname, 'public', 'sitemap.xml');
  fs.writeFileSync(publicPath, sitemap, 'utf-8');
  console.log("Sitemap written to", publicPath);

  // Write to dist/sitemap.xml if dist folder exists
  const distPath = path.resolve(import.meta.dirname, 'dist', 'sitemap.xml');
  if (fs.existsSync(path.resolve(import.meta.dirname, 'dist'))) {
    fs.writeFileSync(distPath, sitemap, 'utf-8');
    console.log("Sitemap also synced to", distPath);
  }
}

generateSitemap();
