const fs = require('fs');

let html = fs.readFileSync('frontend/jadwal-sholat.html', 'utf8');

const sectionStart = html.indexOf('<section class="section"');
const sectionEnd = html.indexOf('<!-- Footer -->');

const newSection = `
  <section class="section prayer-section" style="position: relative; min-height: calc(100vh - 80px); display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 120px 20px 60px;">
    <!-- Dynamic Background Elements -->
    <div id="prayer-bg" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: -1; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); transition: background 1s ease;"></div>
    <div style="position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(0,0,0,0) 70%); top: -200px; left: -200px; border-radius: 50%; z-index: -1;"></div>
    <div style="position: absolute; width: 400px; height: 400px; background: radial-gradient(circle, rgba(56,189,248,0.1) 0%, rgba(0,0,0,0) 70%); bottom: -100px; right: -100px; border-radius: 50%; z-index: -1;"></div>

    <div class="container" style="max-width: 500px; width: 100%;">
      
      <div style="background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); padding: 40px 30px; border-radius: 30px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: white;">
        
        <div class="text-center" style="margin-bottom: 30px;">
            <h2 style="font-weight: 800; font-size: 2rem; margin-bottom: 5px; background: linear-gradient(to right, #34d399, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Jadwal Sholat</h2>
            <div id="prayer-city" style="color: #94a3b8; font-size: 1rem; font-weight: 500;"><i class="fa-solid fa-location-dot"></i> Memuat Lokasi...</div>
            <div id="prayer-date" style="color: #64748b; font-size: 0.85rem; margin-top: 5px;"></div>
        </div>

        <div id="location-prompt" style="text-align: center; display: none; padding: 40px 0;">
            <div style="width: 80px; height: 80px; background: rgba(52, 211, 153, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <i class="fa-solid fa-location-crosshairs" style="font-size: 2.5rem; color: #34d399;"></i>
            </div>
            <h3 style="margin-bottom: 15px; font-weight: 600;">Akses Lokasi Diperlukan</h3>
            <p style="color: #94a3b8; margin-bottom: 25px; font-size: 0.95rem;">Kami membutuhkan izin lokasi Anda untuk menghitung jadwal sholat yang paling akurat.</p>
            <button onclick="window.requestPrayerLocation(true)" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 12px 30px; border-radius: 50px; font-weight: 600; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);">Izinkan Sekarang</button>
        </div>

        <div id="prayer-loading" style="text-align: center; padding: 40px 0;">
            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 3rem; color: #34d399; margin-bottom: 20px;"></i>
            <p style="color: #94a3b8;">Menghitung jadwal sholat presisi...</p>
        </div>

        <div id="prayer-content" style="display: none;">
            <!-- Countdown Section -->
            <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 20px; text-align: center; margin-bottom: 25px; border: 1px solid rgba(255,255,255,0.05); position: relative; overflow: hidden;">
                <div style="position: absolute; bottom: 0; left: 0; height: 4px; background: linear-gradient(90deg, #34d399, #38bdf8); width: 0%; transition: width 1s linear;" id="prayer-progress"></div>
                <h4 style="color: #94a3b8; font-size: 0.9rem; font-weight: 500; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Menuju <span id="next-prayer-name" style="color: white; font-weight: 700;">...</span></h4>
                <div id="next-prayer-countdown" style="font-size: 3rem; font-weight: 800; font-family: 'Inter', monospace; letter-spacing: -1px; line-height: 1; text-shadow: 0 4px 10px rgba(0,0,0,0.3);">--:--:--</div>
            </div>

            <!-- Schedule List -->
            <div id="prayer-cards" style="display: flex; flex-direction: column; gap: 10px;">
                <!-- Injected via JS -->
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
                <button onclick="window.requestPrayerLocation(true)" style="background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; padding: 8px 20px; border-radius: 50px; font-size: 0.8rem; cursor: pointer; transition: all 0.3s;"><i class="fa-solid fa-rotate-right"></i> Perbarui Lokasi</button>
            </div>
        </div>

      </div>
    </div>
  </section>
`;

const newHtml = html.substring(0, sectionStart) + newSection + html.substring(sectionEnd);
fs.writeFileSync('frontend/jadwal-sholat.html', newHtml);
