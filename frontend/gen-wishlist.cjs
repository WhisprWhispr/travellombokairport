const fs = require('fs');
let html = fs.readFileSync('frontend/tentang-kami.html', 'utf8');

// replace title
html = html.replace(/<title>.*?<\/title>/, '<title>Wishlist Saya | Travel Lombok Airport</title>');

// replace section
const startIdx = html.indexOf('<section class="section">');
const endIdx = html.indexOf('<!-- Footer -->');
if (startIdx !== -1 && endIdx !== -1) {
    const newSection = `  <section class="section">
    <div class="container">
      <div class="section-title text-center" style="margin-top: 80px;">
        <span class="subtitle text-green">DISIMPAN</span>
        <h2>Wishlist Saya</h2>
        <div class="title-divider"><i class="fa-solid fa-heart"></i></div>
      </div>
      
      <div id="wishlist-empty" style="display: none; text-align: center; padding: 60px 20px; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
        <i class="fa-regular fa-heart" style="font-size: 4rem; color: #cbd5e1; margin-bottom: 20px;"></i>
        <h3 style="color: #475569; margin-bottom: 10px;">Wishlist Anda masih kosong</h3>
        <p style="color: #64748b; margin-bottom: 30px;">Cari dan simpan paket tour atau layanan rental favorit Anda untuk dilihat nanti.</p>
        <a href="/#packages" class="btn btn-green">Jelajahi Paket Tour</a>
      </div>

      <div id="wishlist-grid" class="packages-grid">
        <!-- Rendered by JS -->
      </div>
    </div>
  </section>

  <script>
    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(() => {
            if (!window.globalItems || window.globalItems.length === 0) return;
            
            const wishlist = window.getWishlist ? window.getWishlist() : [];
            const grid = document.getElementById("wishlist-grid");
            const emptyState = document.getElementById("wishlist-empty");
            
            if (wishlist.length === 0) {
                grid.style.display = 'none';
                emptyState.style.display = 'block';
                return;
            }
            
            grid.style.display = 'grid';
            emptyState.style.display = 'none';
            
            const savedItems = window.globalItems.filter(item => wishlist.includes(item.id));
            
            grid.innerHTML = savedItems.map(item => {
                const formattedPrice = item.price ? (window.formatPrice ? window.formatPrice(item.price) : item.price) : '';
                return \`
                <div style="background:white; border:none; border-radius:16px; overflow:hidden; box-shadow:0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04); cursor:pointer; display:flex; flex-direction:column; transition: transform 0.3s ease, box-shadow 0.3s ease;"
                     onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)';"
                     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)';"
                     onclick="window.openTourModal('\${item.id}');">
                    <div style="position:relative; height:180px; overflow:hidden;">
                        <button onclick="event.stopPropagation(); window.toggleWishlist('\${item.id}'); window.location.reload();" style="position:absolute; top:10px; right:10px; background:rgba(255,255,255,0.9); color:#ef4444; border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" title="Hapus dari Wishlist"><i class="fa-solid fa-heart"></i></button>
                        <img src="\${item.imageUrl}" alt="\${item.title}" style="width:100%; height:100%; object-fit:cover; transition: transform 0.5s ease;"
                             onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'"
                             onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600'">
                        \${formattedPrice ? \`<div style="position:absolute; bottom:12px; right:12px; background:rgba(255, 255, 255, 0.95); backdrop-filter:blur(4px); color:#0f172a; font-size:0.65rem; font-weight:800; padding:4px 8px; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.4);">\${formattedPrice}</div>\` : ''}
                    </div>
                    <div style="padding:16px 20px; display:flex; flex-direction:column; flex:1;">
                        <h4 style="margin:0 0 8px; font-size:0.95rem; font-weight:800; color:#0f172a; line-height:1.4;">\${item.title}</h4>
                        <div style="display:flex; gap:3px; margin-bottom:16px; align-items:center;">
                            <i class="fa-solid fa-star" style="color:#fbbf24; font-size:0.75rem;"></i>
                            <i class="fa-solid fa-star" style="color:#fbbf24; font-size:0.75rem;"></i>
                            <i class="fa-solid fa-star" style="color:#fbbf24; font-size:0.75rem;"></i>
                            <i class="fa-solid fa-star" style="color:#fbbf24; font-size:0.75rem;"></i>
                            <i class="fa-solid fa-star" style="color:#fbbf24; font-size:0.75rem;"></i>
                            <span style="font-size:0.7rem; color:#64748b; margin-left:6px; font-weight:500;">(Top Rated)</span>
                        </div>
                        <div style="margin-top:auto; padding-top:12px; border-top:1px dashed #e2e8f0; text-align:center;">
                            <span style="font-size:0.85rem; font-weight:700; color:var(--primary-blue); display:flex; align-items:center; justify-content:center; gap:6px;">Lihat Detail <i class="fa-solid fa-arrow-right" style="font-size:0.75rem;"></i></span>
                        </div>
                    </div>
                </div>
                \`;
            }).join('');
        }, 500);
    });
  </script>
`;
    html = html.substring(0, startIdx) + newSection + html.substring(endIdx);
}
fs.writeFileSync('frontend/wishlist.html', html);
console.log('done');
