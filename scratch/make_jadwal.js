const fs = require('fs');
let html = fs.readFileSync('frontend/tentang-kami.html', 'utf8');

// Replace Meta Tags
html = html.replace(/<title>.*?<\/title>/, '<title>Jadwal Sholat | Travel Lombok Airport</title>');
html = html.replace(/<meta name="description" content=".*?">/, '<meta name="description" content="Jadwal sholat harian yang akurat berdasarkan lokasi Anda.">');
html = html.replace(/<meta name="keywords" content=".*?">/, '<meta name="keywords" content="jadwal sholat, waktu sholat, travel lombok airport">');
html = html.replace(/<meta property="og:title" content=".*?">/, '<meta property="og:title" content="Jadwal Sholat | Travel Lombok Airport">');
html = html.replace(/<meta property="og:description" content=".*?">/, '<meta property="og:description" content="Jadwal sholat harian yang akurat berdasarkan lokasi Anda.">');
html = html.replace(/<meta property="twitter:title" content=".*?">/, '<meta property="twitter:title" content="Jadwal Sholat | Travel Lombok Airport">');
html = html.replace(/<meta property="twitter:description" content=".*?">/, '<meta property="twitter:description" content="Jadwal sholat harian yang akurat berdasarkan lokasi Anda.">');

// Find the section to replace
const sectionStart = html.indexOf('<section class="section">');
const sectionEnd = html.indexOf('<!-- Footer -->');

const newSection = `
  <section class="section" style="background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%); min-height: calc(100vh - 200px);">
    <div class="container" style="max-width: 800px; margin-top: 80px;">
      <div class="section-title text-center">
        <span class="subtitle text-green">INFO PENTING</span>
        <h2>Jadwal Sholat</h2>
        <div class="title-divider"><i class="fa-solid fa-mosque"></i></div>
      </div>
      
      <div style="background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); padding: 40px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border: 1px solid rgba(255,255,255,1);">
        
        <div id="location-prompt" style="text-align: center; display: none;">
            <i class="fa-solid fa-location-dot" style="font-size: 3rem; color: var(--primary-blue); margin-bottom: 20px;"></i>
            <h3 style="color: var(--text-dark); margin-bottom: 10px;">Izinkan Akses Lokasi</h3>
            <p style="color: var(--text-gray); margin-bottom: 20px;">Untuk menampilkan jadwal sholat yang akurat di daerah Anda, kami memerlukan izin lokasi (GPS).</p>
            <button onclick="window.requestPrayerLocation(true)" class="btn btn-blue" style="border-radius: 30px; padding: 12px 30px; font-size: 1rem;"><i class="fa-solid fa-location-crosshairs"></i> Izinkan Lokasi</button>
        </div>

        <div id="prayer-loading" style="text-align: center;">
            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 3rem; color: var(--primary-green); margin-bottom: 20px;"></i>
            <p style="color: var(--text-gray);">Sedang mengambil data jadwal sholat...</p>
        </div>

        <div id="prayer-content" style="display: none;">
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary-blue);" id="prayer-city">Kota Anda</div>
                <div style="color: var(--text-gray);" id="prayer-date">Tanggal</div>
            </div>

            <div style="background: linear-gradient(135deg, var(--primary-green), #059669); color: white; padding: 25px; border-radius: 15px; text-align: center; margin-bottom: 30px; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);">
                <h4 style="margin-bottom: 10px; font-size: 1.1rem; opacity: 0.9;">Waktu Sholat Berikutnya: <span id="next-prayer-name" style="font-weight: 800; opacity: 1;">-</span></h4>
                <div id="next-prayer-countdown" style="font-size: 2.5rem; font-weight: 900; font-family: monospace; letter-spacing: 2px;">00:00:00</div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px;" id="prayer-cards">
                <!-- Injected via JS -->
            </div>
            
            <p style="text-align: center; font-size: 0.8rem; color: #94a3b8; margin-top: 30px;">
                * Jadwal dihitung menggunakan metode akurat dengan penambahan waktu ihtiyat (+3 menit).<br>
                <button onclick="window.requestPrayerLocation(true)" style="background: none; border: none; color: var(--primary-blue); font-size: 0.8rem; cursor: pointer; margin-top: 5px; text-decoration: underline;"><i class="fa-solid fa-location-arrow"></i> Perbarui Lokasi</button>
            </p>
        </div>

      </div>
    </div>
  </section>
`;

const newHtml = html.substring(0, sectionStart) + newSection + html.substring(sectionEnd);
fs.writeFileSync('frontend/jadwal-sholat.html', newHtml);
console.log('jadwal-sholat.html generated successfully.');
