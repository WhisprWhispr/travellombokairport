const fs = require('fs');
let html = fs.readFileSync('frontend/admin.html', 'utf8');

// Add Item dropdown to Promo form
if (!html.includes('id="promo-item"')) {
    html = html.replace(/<div class="form-group mb-3">\s*<label>Kode Promo<\/label>/,
`<div class="form-group mb-3">
            <label>Berlaku Untuk Paket (Opsional)</label>
            <select id="promo-item" class="form-control">
              <option value="">-- Semua Paket --</option>
            </select>
          </div>
          <div class="form-group mb-3">
            <label>Kode Promo</label>`);
}

// Change default discount type to nominal
html = html.replace(/<option value="percent">Persentase \(%\)<\/option>\s*<option value="nominal">Nominal \(Rp\)<\/option>/,
`<option value="nominal">Nominal (Rp)</option>\n              <option value="percent">Persentase (%)</option>`);

fs.writeFileSync('frontend/admin.html', html);
console.log('fixed admin.html');
