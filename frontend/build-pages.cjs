const fs = require('fs');
const path = require('path');

const indexContent = fs.readFileSync(path.join(__dirname, './index.html'), 'utf-8');

// Extract header and footer
const headMatch = indexContent.match(/([\s\S]*?<!-- Hero Section -->)/);
const footerMatch = indexContent.match(/(<!-- Footer -->[\s\S]*?<\/html>)/);

const head = headMatch[1].replace('<!-- Hero Section -->', '');
// Fix title
const getHead = (title) => head.replace('<title>Travel Lombok Airport | Tour & Travel Lombok</title>', `<title>${title} | Travel Lombok Airport</title>`);

const footer = footerMatch[1];

const pages = [
    {
        name: 'galeri.html',
        title: 'Galeri',
        content: `
  <section class="section">
    <div class="container">
      <div class="section-title text-center" style="margin-top: 80px;">
        <span class="subtitle text-green">DOKUMENTASI KAMI</span>
        <h2>Galeri Perjalanan</h2>
        <div class="title-divider"><i class="fa-solid fa-camera"></i></div>
        <p class="text-gray" style="max-width: 600px; margin: 0 auto;">Berikut adalah beberapa momen indah yang kami abadikan selama menemani perjalanan pelanggan kami menjelajahi pesona Pulau Lombok.</p>
      </div>
      
      <div style="column-count: 3; column-gap: 20px; padding: 20px 0;">
        <img src="https://images.unsplash.com/photo-1570788647565-38dfc633a9bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Lombok" style="width: 100%; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <img src="https://images.unsplash.com/photo-1596404987455-802cbb3e85e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Gili" style="width: 100%; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <img src="https://images.unsplash.com/photo-1627885078516-568eb2a1d2bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Rinjani" style="width: 100%; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <img src="https://images.unsplash.com/photo-1518182170546-076616fdfaaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Culture" style="width: 100%; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <img src="https://images.unsplash.com/photo-1563177652-32a21fc7d23d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Beach" style="width: 100%; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <img src="https://images.unsplash.com/photo-1629813292415-467ceba7ebec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Boat" style="width: 100%; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      </div>
    </div>
  </section>
`
    },
    {
        name: 'tentang-kami.html',
        title: 'Tentang Kami',
        content: `
  <section class="section">
    <div class="container" style="max-width: 800px;">
      <div class="section-title text-center" style="margin-top: 80px;">
        <span class="subtitle text-green">PROFIL PERUSAHAAN</span>
        <h2>Tentang Kami</h2>
        <div class="title-divider"><i class="fa-solid fa-users"></i></div>
      </div>
      
      <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); line-height: 1.8; color: #475569;">
        <h3 style="color: var(--primary-blue); margin-bottom: 15px;">Mengenal Travel Lombok Airport</h3>
        <p style="margin-bottom: 20px;">Kami adalah penyedia layanan perjalanan wisata dan transportasi terkemuka yang berpusat di Pulau Lombok. Berdiri dengan dedikasi penuh untuk menyajikan pengalaman liburan yang tak terlupakan, kami menawarkan solusi lengkap untuk perjalanan Anda—mulai dari antar-jemput bandara yang tepat waktu, penyewaan armada yang terawat, hingga paket wisata (*tour*) yang dirancang secara khusus.</p>
        
        <h3 style="color: var(--primary-blue); margin-bottom: 15px;">Visi Kami</h3>
        <p style="margin-bottom: 20px;">Menjadi mitra perjalanan wisata nomor satu di Lombok yang dipercaya oleh wisatawan lokal maupun mancanegara berkat profesionalisme, kejujuran, dan kualitas layanan yang prima.</p>

        <h3 style="color: var(--primary-blue); margin-bottom: 15px;">Misi Kami</h3>
        <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
          <li style="margin-bottom: 10px;"><i class="fa-solid fa-check text-green" style="margin-right: 10px;"></i> Menyediakan armada transportasi yang selalu dalam kondisi prima dan bersih.</li>
          <li style="margin-bottom: 10px;"><i class="fa-solid fa-check text-green" style="margin-right: 10px;"></i> Memberikan pelayanan ramah dari tim driver yang juga berperan sebagai pemandu wisata berpengalaman.</li>
          <li style="margin-bottom: 10px;"><i class="fa-solid fa-check text-green" style="margin-right: 10px;"></i> Menawarkan paket wisata dengan harga yang transparan dan bersaing.</li>
        </ul>
      </div>
    </div>
  </section>
`
    },
    {
        name: 'kontak.html',
        title: 'Kontak',
        content: `
  <section class="section">
    <div class="container">
      <div class="section-title text-center" style="margin-top: 80px;">
        <span class="subtitle text-green">HUBUNGI KAMI</span>
        <h2>Kontak Kami</h2>
        <div class="title-divider"><i class="fa-solid fa-envelope"></i></div>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; margin-top: 40px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          <h3 style="color: var(--primary-blue); margin-bottom: 25px;">Informasi Kontak</h3>
          
          <div style="display: flex; gap: 15px; margin-bottom: 20px; align-items: flex-start;">
            <div style="background: #f1f5f9; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--primary-green);">
              <i class="fa-brands fa-whatsapp"></i>
            </div>
            <div>
              <h4 style="margin: 0; color: #1e293b;">WhatsApp / Telepon</h4>
              <p style="margin: 5px 0 0; color: #64748b;">+62 896-7696-3255</p>
            </div>
          </div>
          
          <div style="display: flex; gap: 15px; margin-bottom: 20px; align-items: flex-start;">
            <div style="background: #f1f5f9; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--primary-blue);">
              <i class="fa-solid fa-envelope"></i>
            </div>
            <div>
              <h4 style="margin: 0; color: #1e293b;">Email</h4>
              <p style="margin: 5px 0 0; color: #64748b;">info@travellombokairport.com</p>
            </div>
          </div>

          <div style="display: flex; gap: 15px; margin-bottom: 20px; align-items: flex-start;">
            <div style="background: #f1f5f9; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--primary-green);">
              <i class="fa-solid fa-location-dot"></i>
            </div>
            <div>
              <h4 style="margin: 0; color: #1e293b;">Alamat Kantor</h4>
              <p style="margin: 5px 0 0; color: #64748b; line-height: 1.6;">Jl. Raya Tanak Awu, Ketara, Kec. Pujut,<br>Kabupaten Lombok Tengah,<br>Nusa Tenggara Barat 83573</p>
            </div>
          </div>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          <h3 style="color: var(--primary-blue); margin-bottom: 25px;">Kirim Pesan</h3>
          <form onsubmit="event.preventDefault(); window.open('https://wa.me/6289676963255?text=Halo%20Admin,%20saya%20punya%20pertanyaan:%20' + document.getElementById('msg').value, '_blank');">
            <div class="form-group mb-3">
              <label>Nama Anda</label>
              <input type="text" class="form-control" placeholder="Nama lengkap" required>
            </div>
            <div class="form-group mb-3">
              <label>Pesan Pertanyaan</label>
              <textarea id="msg" class="form-control" rows="4" placeholder="Tuliskan pertanyaan Anda..." required></textarea>
            </div>
            <button type="submit" class="btn btn-green w-100">KIRIM VIA WHATSAPP</button>
          </form>
        </div>
      </div>
    </div>
  </section>
`
    },
    {
        name: 'drone.html',
        title: 'Dokumentasi Drone',
        content: `
  <section class="section">
    <div class="container" style="max-width: 900px;">
      <div class="section-title text-center" style="margin-top: 80px;">
        <span class="subtitle text-green">LAYANAN PREMIUM</span>
        <h2>Dokumentasi Drone</h2>
        <div class="title-divider"><i class="fa-solid fa-plane-up"></i></div>
      </div>
      
      <div style="text-align: center; margin-bottom: 40px;">
        <img src="https://images.unsplash.com/photo-1579822606820-25e2e8e34272?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Drone" style="width: 100%; border-radius: 20px; box-shadow: 0 15px 40px rgba(0,0,0,0.1);">
      </div>

      <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); line-height: 1.8; color: #475569;">
        <h3 style="color: var(--primary-blue); margin-bottom: 15px; text-align: center;">Abadikan Momen dari Udara</h3>
        <p style="text-align: center; margin-bottom: 30px;">Jadikan liburan Anda di Lombok terlihat seperti adegan film sinematik dengan layanan dokumentasi udara menggunakan drone profesional kami. Sangat cocok untuk liburan keluarga, *honeymoon*, *company gathering*, atau sekadar konten media sosial yang estetis.</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center;">
            <i class="fa-solid fa-video text-green" style="font-size: 2rem; margin-bottom: 15px;"></i>
            <h4 style="color: var(--primary-blue);">Kualitas 4K</h4>
            <p style="font-size: 0.9rem;">Resolusi super tajam untuk setiap momen.</p>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center;">
            <i class="fa-solid fa-user-astronaut text-green" style="font-size: 2rem; margin-bottom: 15px;"></i>
            <h4 style="color: var(--primary-blue);">Pilot Berlisensi</h4>
            <p style="font-size: 0.9rem;">Aman dan profesional untuk pengambilan gambar ekstrem.</p>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center;">
            <i class="fa-solid fa-wand-magic-sparkles text-green" style="font-size: 2rem; margin-bottom: 15px;"></i>
            <h4 style="color: var(--primary-blue);">Free Editing</h4>
            <p style="font-size: 0.9rem;">Termasuk color grading dan video reel pendek.</p>
          </div>
        </div>

        <div style="text-align: center;">
          <h2 style="color: var(--primary-green); margin-bottom: 20px;">Mulai dari Rp 500.000 / Hari</h2>
          <a href="https://wa.me/6289676963255?text=Halo%20Admin,%20saya%20ingin%20sewa%20layanan%20Dokumentasi%20Drone" target="_blank" class="btn btn-green btn-large">SEWA SEKARANG</a>
        </div>
      </div>
    </div>
  </section>
`
    },
    {
        name: 'kebijakan.html',
        title: 'Kebijakan Privasi',
        content: `
  <section class="section">
    <div class="container" style="max-width: 800px;">
      <div class="section-title text-center" style="margin-top: 80px;">
        <span class="subtitle text-green">LEGALITAS</span>
        <h2>Kebijakan Privasi</h2>
        <div class="title-divider"><i class="fa-solid fa-shield-halved"></i></div>
      </div>
      
      <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); line-height: 1.8; color: #475569;">
        <p>Terakhir diperbarui: Agustus 2026</p>
        <p>Di Travel Lombok Airport, kami sangat menghargai privasi Anda. Dokumen ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.</p>
        
        <h4 style="color: var(--primary-blue); margin: 20px 0 10px;">1. Pengumpulan Informasi</h4>
        <p>Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami saat Anda melakukan pemesanan (booking), mengisi formulir kontak, atau berkomunikasi dengan kami via WhatsApp. Informasi tersebut dapat berupa nama, alamat email, nomor telepon, dan rincian perjalanan.</p>

        <h4 style="color: var(--primary-blue); margin: 20px 0 10px;">2. Penggunaan Informasi</h4>
        <p>Kami menggunakan informasi Anda semata-mata untuk memproses pemesanan Anda, menghubungi Anda terkait layanan, dan meningkatkan kualitas layanan kami.</p>

        <h4 style="color: var(--primary-blue); margin: 20px 0 10px;">3. Keamanan Data</h4>
        <p>Kami tidak akan menjual, menyewakan, atau menukar informasi pribadi Anda kepada pihak ketiga mana pun tanpa izin eksplisit dari Anda, kecuali diwajibkan oleh hukum.</p>
      </div>
    </div>
  </section>
`
    },
    {
        name: 'syarat.html',
        title: 'Syarat & Ketentuan',
        content: `
  <section class="section">
    <div class="container" style="max-width: 800px;">
      <div class="section-title text-center" style="margin-top: 80px;">
        <span class="subtitle text-green">LEGALITAS</span>
        <h2>Syarat & Ketentuan</h2>
        <div class="title-divider"><i class="fa-solid fa-file-contract"></i></div>
      </div>
      
      <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); line-height: 1.8; color: #475569;">
        <h4 style="color: var(--primary-blue); margin: 20px 0 10px;">1. Reservasi dan Pembayaran</h4>
        <p>Pemesanan layanan dapat dilakukan melalui website atau WhatsApp resmi kami. Uang muka (Down Payment) sebesar 30% dari total biaya diperlukan untuk mengamankan jadwal reservasi Anda. Pelunasan dapat dilakukan pada hari-H kedatangan.</p>

        <h4 style="color: var(--primary-blue); margin: 20px 0 10px;">2. Kebijakan Pembatalan (Cancellation)</h4>
        <ul style="padding-left: 20px;">
            <li>Pembatalan maksimal H-7: Uang muka dikembalikan 100%.</li>
            <li>Pembatalan H-3 hingga H-6: Uang muka dikembalikan 50%.</li>
            <li>Pembatalan kurang dari H-3: Uang muka hangus.</li>
        </ul>

        <h4 style="color: var(--primary-blue); margin: 20px 0 10px;">3. Layanan Lepas Kunci (Self-Drive)</h4>
        <p>Untuk penyewaan mobil lepas kunci, penyewa wajib menyerahkan foto identitas asli (KTP/Paspor), tiket penerbangan pulang-pergi, dan bersedia difoto saat serah terima kendaraan. Segala kerusakan atau kecelakaan yang terjadi selama masa sewa menjadi tanggung jawab penuh penyewa.</p>
      </div>
    </div>
  </section>
`
    }
];

pages.forEach(p => {
    const html = getHead(p.title) + p.content + footer;
    fs.writeFileSync(path.join(__dirname, './', p.name), html);
});
console.log("Created 6 HTML files.");
