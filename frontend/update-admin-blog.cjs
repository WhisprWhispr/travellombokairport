const fs = require('fs');
let html = fs.readFileSync('frontend/admin.html', 'utf8');

// Add Blogs to Sidebar
if (!html.includes('id="blogs-section"')) {
    html = html.replace('<li><a href="#" onclick="showTab(\'promos\')"><i class="fa-solid fa-tags"></i> Kelola Promo</a></li>',
        '<li><a href="#" onclick="showTab(\'promos\')"><i class="fa-solid fa-tags"></i> Kelola Promo</a></li>\n          <li><a href="#" onclick="showTab(\'blogs\')"><i class="fa-solid fa-newspaper"></i> Kelola Blog</a></li>');
    
    // Add Add Blog Button
    html = html.replace('<button id="add-promo-btn" class="btn btn-primary" style="display: none;"><i class="fa-solid fa-plus"></i> Tambah Promo</button>',
        '<button id="add-promo-btn" class="btn btn-primary" style="display: none;"><i class="fa-solid fa-plus"></i> Tambah Promo</button>\n            <button id="add-blog-btn" class="btn btn-primary" style="display: none;"><i class="fa-solid fa-plus"></i> Tambah Artikel Blog</button>');
        
    // Add Blogs Section
    html = html.replace('<section id="orders-section"',
`        <!-- Blogs Section -->
        <section id="blogs-section" class="admin-content glass-panel mt-4" style="display: none;">
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Gambar</th>
                  <th>Judul</th>
                  <th>Slug</th>
                  <th>Dilihat</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody id="blogs-tbody">
                <!-- Data loaded via JS -->
              </tbody>
            </table>
          </div>
        </section>

        <section id="orders-section"`);
}

// Add Blog Modal
if (!html.includes('id="blog-modal"')) {
    html = html.replace('<!-- Driver Modal -->',
`<!-- Blog Modal -->
    <div id="blog-modal" class="modal" style="display: none; z-index: 2000;">
      <div class="modal-content glass-panel" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header">
          <h2 id="blog-modal-title" style="margin: 0; color: var(--primary-blue); font-size: 1.5rem;">Tambah Artikel Blog</h2>
          <span class="close-btn" onclick="closeBlogModal()">&times;</span>
        </div>
        <form id="blog-form">
          <input type="hidden" id="blog-id">
          <div class="form-group mb-3">
            <label>Judul Artikel</label>
            <input type="text" id="blog-title" class="form-control" required placeholder="Judul menarik...">
          </div>
          <div class="form-group mb-3">
            <label>Ringkasan Singkat (Summary)</label>
            <textarea id="blog-summary" class="form-control" rows="2" required placeholder="Ringkasan untuk ditampilkan di daftar blog..."></textarea>
          </div>
          <div class="form-group mb-3">
            <label>Gambar Cover (URL)</label>
            <input type="text" id="blog-image" class="form-control" required placeholder="https://...">
          </div>
          <div class="form-group mb-3">
            <label>Konten Artikel (Mendukung HTML dasar)</label>
            <textarea id="blog-content" class="form-control" rows="10" required placeholder="Isi artikel..."></textarea>
          </div>
          <div class="form-group mb-4">
            <label>Tags (pisahkan dengan koma)</label>
            <input type="text" id="blog-tags" class="form-control" placeholder="wisata, lombok, pantai">
          </div>
          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn btn-outline" style="flex: 1;" onclick="closeBlogModal()">Batal</button>
            <button type="submit" class="btn btn-primary" style="flex: 1;">Simpan Artikel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Driver Modal -->`);
}

fs.writeFileSync('frontend/admin.html', html);
console.log('done');
