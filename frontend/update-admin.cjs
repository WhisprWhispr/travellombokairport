const fs = require('fs');
let html = fs.readFileSync('frontend/admin.html', 'utf8');

// add promos-section
if (!html.includes('id="promos-section"')) {
    html = html.replace('<section id="orders-section"', 
`        <!-- Promos Section -->
        <section id="promos-section" class="admin-content glass-panel mt-4" style="display: none;">
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Kode Promo</th>
                  <th>Diskon</th>
                  <th>Batas Waktu</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody id="promos-tbody">
                <!-- Data loaded via JS -->
              </tbody>
            </table>
          </div>
        </section>

        <section id="orders-section"`);
}

// add promo modal
if (!html.includes('id="promo-modal"')) {
    html = html.replace('<!-- Driver Modal -->',
`<!-- Promo Modal -->
    <div id="promo-modal" class="modal" style="display: none;">
      <div class="modal-content glass-panel" style="max-width: 500px;">
        <div class="modal-header">
          <h2 id="promo-modal-title" style="margin: 0; color: var(--primary-blue); font-size: 1.5rem;">Tambah Promo</h2>
          <span class="close-btn" onclick="closePromoModal()">&times;</span>
        </div>
        <form id="promo-form">
          <input type="hidden" id="promo-id">
          <div class="form-group mb-3">
            <label>Kode Promo</label>
            <input type="text" id="promo-code" class="form-control" required placeholder="Misal: LOMBOK20" style="text-transform: uppercase;">
          </div>
          <div class="form-group mb-3">
            <label>Tipe Diskon</label>
            <select id="promo-type" class="form-control" required>
              <option value="nominal">Nominal (Rp)</option>
              <option value="percent">Persentase (%)</option>
            </select>
          </div>
          <div class="form-group mb-3">
            <label>Nilai Diskon</label>
            <input type="number" id="promo-value" class="form-control" required>
          </div>
          <div class="form-group mb-3">
            <label>Maksimal Diskon (Rp) - opsional</label>
            <input type="number" id="promo-max" class="form-control" placeholder="Kosongkan jika tidak ada batas">
          </div>
          <div class="form-group mb-3">
            <label>Batas Waktu Berlaku</label>
            <input type="date" id="promo-valid" class="form-control">
          </div>
          <div class="form-group mb-4">
            <label>
              <input type="checkbox" id="promo-active" checked> Promo Aktif
            </label>
          </div>
          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn btn-outline" style="flex: 1;" onclick="closePromoModal()">Batal</button>
            <button type="submit" class="btn btn-primary" style="flex: 1;">Simpan</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Driver Modal -->`);
}

fs.writeFileSync('frontend/admin.html', html);
console.log('done');
