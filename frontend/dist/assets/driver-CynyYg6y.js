import"./modulepreload-polyfill-P2Xu9kJm.js";import"./pwa-DYmKx9RI.js";/* empty css              */var e=`/api`;document.addEventListener(`DOMContentLoaded`,()=>{t(),document.getElementById(`driver-login-form`).addEventListener(`submit`,async n=>{n.preventDefault();let r=document.getElementById(`d-phone`).value,i=document.getElementById(`d-pin`).value;try{let n=await fetch(`${e}/drivers/login`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({phone:r,pin:i})}),a=await n.json();n.ok&&a.success?(localStorage.setItem(`driverId`,a.driverId),localStorage.setItem(`driverName`,a.name),t()):Swal.fire({icon:`error`,title:`Login Gagal`,text:a.error||`Terjadi kesalahan.`})}catch{Swal.fire({icon:`error`,title:`Error`,text:`Koneksi bermasalah.`})}})}),document.addEventListener(`click`,e=>{let t=document.querySelector(`.menu-wrapper`);t&&!t.contains(e.target)&&(document.getElementById(`driver-dropdown`)?.classList.remove(`open`),document.getElementById(`hamburger-btn`)?.classList.remove(`active`))}),window.toggleDriverMenu=()=>{let e=document.getElementById(`driver-dropdown`),t=document.getElementById(`hamburger-btn`);e.classList.toggle(`open`),t.classList.toggle(`active`)},window.installDriverPWA=async()=>{typeof window.installPWA==`function`?await window.installPWA():Swal.fire({icon:`info`,title:`Unduh Aplikasi`,html:`
                <p style="margin-bottom:15px;">Untuk memasang aplikasi Portal Supir ini di layar HP Anda:</p>
                <ol style="text-align:left; padding-left:20px; line-height:2;">
                    <li>Di browser Chrome, ketuk ikon <b>⋮</b> (titik tiga) di pojok kanan atas.</li>
                    <li>Pilih <b>"Tambahkan ke layar utama"</b>.</li>
                    <li>Ketuk <b>"Tambahkan"</b> dan selesai!</li>
                </ol>
            `,confirmButtonColor:`#3b82f6`,confirmButtonText:`Mengerti`})},window.showDriverTutorial=()=>{Swal.fire({title:`<strong style="color: #1e293b; font-size: 1.6rem; letter-spacing: -0.5px;">Panduan Portal Supir</strong>`,html:`
            <style>
                .driver-tutorial-container {
                    text-align: left; 
                    font-size: 0.95rem; 
                    color: #475569; 
                    max-height: 75vh; 
                    overflow-y: auto; 
                    padding-right: 5px;
                }
                .driver-tutorial-container::-webkit-scrollbar { width: 6px; }
                .driver-tutorial-container::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
                .driver-tutorial-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                
                .tutorial-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 15px;
                }

                .step-card {
                    background: white;
                    padding: 20px;
                    border-radius: 16px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.2s;
                    display: flex;
                    flex-direction: column;
                }
                .step-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.06); }
                
                .step-card h4 {
                    margin: 0 0 10px 0;
                    font-size: 1.05rem;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .step-card p {
                    margin: 0;
                    line-height: 1.5;
                    font-size: 0.85rem;
                    flex-grow: 1;
                }
                
                .step-1 { border-top: 4px solid #3b82f6; }
                .step-1 h4 { color: #1d4ed8; }
                .step-1 .icon-bg { background: #eff6ff; color: #3b82f6; }
                
                .step-2 { border-top: 4px solid #10b981; }
                .step-2 h4 { color: #047857; }
                .step-2 .icon-bg { background: #ecfdf5; color: #10b981; }
                
                .step-3 { border-top: 4px solid #f59e0b; }
                .step-3 h4 { color: #b45309; }
                .step-3 .icon-bg { background: #fffbeb; color: #f59e0b; }

                .icon-bg {
                    width: 32px; height: 32px;
                    border-radius: 8px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1rem;
                    flex-shrink: 0;
                }
                
                .badge-demo {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: white;
                    margin-top: 8px;
                    margin-bottom: 8px;
                }
            </style>
            
            <div class="driver-tutorial-container">
                <p style="margin-bottom: 25px; text-align: center; font-size: 1rem;">Selamat bertugas! Aplikasi ini dirancang khusus untuk mempermudah pekerjaan Anda.</p>

                <div class="tutorial-grid">
                    <div class="step-card step-1">
                        <h4><div class="icon-bg"><i class="fa-solid fa-calendar-check"></i></div> 1. Cek Jadwal</h4>
                        <p>Setelah login, Anda akan langsung melihat daftar <strong>Jadwal Trip</strong>. Semua kartu yang tampil di sini adalah tugas resmi yang diberikan oleh Bos/Admin.</p>
                    </div>

                    <div class="step-card step-2">
                        <h4><div class="icon-bg"><i class="fa-brands fa-whatsapp"></i></div> 2. Chat Tamu</h4>
                        <p>Tekan tombol <span class="badge-demo" style="background: #128C7E;"><i class="fa-brands fa-whatsapp"></i> Chat Penumpang</span>. <br>WhatsApp akan otomatis terbuka dengan pesan sapaan profesional lengkap dengan detail jemputan.</p>
                    </div>

                    <div class="step-card step-3">
                        <h4><div class="icon-bg"><i class="fa-solid fa-flag-checkered"></i></div> 3. Selesaikan Tugas</h4>
                        <p>Jika tamu sudah diantar dengan selamat, Anda <strong>WAJIB</strong> menekan tombol <span class="badge-demo" style="background: #2563eb;"><i class="fa-solid fa-flag-checkered"></i> Selesaikan Trip</span> sebagai laporan ke Admin.</p>
                    </div>
                </div>
            </div>
        `,width:800,showCloseButton:!0,confirmButtonText:`<i class="fa-solid fa-thumbs-up"></i> Siap, Laksanakan!`,confirmButtonColor:`#10b981`,padding:`2.5em`,background:`#ffffff`,backdrop:`rgba(15, 23, 42, 0.85)`,customClass:{confirmButton:`btn-driver-ready`}}).then(()=>{localStorage.setItem(`driverTutorialSeen`,`true`)})};function t(){let e=localStorage.getItem(`driverId`);e?(document.getElementById(`login-section`).style.display=`none`,document.getElementById(`dashboard-section`).style.display=`block`,document.getElementById(`driver-name-display`).innerText=localStorage.getItem(`driverName`),n(e),localStorage.getItem(`driverTutorialSeen`)||setTimeout(showDriverTutorial,1e3)):(document.getElementById(`login-section`).style.display=`block`,document.getElementById(`dashboard-section`).style.display=`none`)}window.logoutDriver=()=>{localStorage.removeItem(`driverId`),localStorage.removeItem(`driverName`),t()};async function n(t){let n=document.getElementById(`trips-container`);n.innerHTML=`<div style="text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat...</div>`;try{let r=await(await fetch(`${e}/drivers/my-bookings`,{headers:{"X-Driver-ID":t}})).json();if(r.length===0){n.innerHTML=`<div style="text-align:center; padding: 20px; color: #64748b;">Belum ada jadwal trip yang ditugaskan kepada Anda.</div>`;return}n.innerHTML=``,r.forEach(e=>{let t=e.status===`COMPLETED`,r=`badge-pending`,i=`Pending`;e.status===`PAID`&&(r=`badge-paid`,i=`Lunas`),e.status===`COMPLETED`&&(r=`badge-completed`,i=`Selesai`);let a=e.phone?e.phone.replace(/[^0-9]/g,``):``,o=a.startsWith(`0`)?`62`+a.substring(1):a,s=e.details?.pickup?`\n📍 *Lokasi Jemput:*\n${e.details.pickup}\n`:``,c=e.details?.dropoff?`\n📍 *Tujuan / Drop-off:*\n${e.details.dropoff}\n`:``,l=e.details?.time?`\n⏰ *Jam Penjemputan:*\n${e.details.time}\n`:``,u=e.details?.flightNumber?`\n✈️ *No. Penerbangan:*\n${e.details.flightNumber}\n`:``,d=e.details?.pax?`\n👥 *Jumlah Peserta:*\n${e.details.pax} Orang\n`:``,f=e.details?.vehicle?`\n🚗 *Pilihan Kendaraan:*\n${e.details.vehicle}\n`:``,p=e.details?.notes?`\n📝 *Catatan Khusus:*\n${e.details.notes}\n`:``,m=`Halo Kak ${e.customerName},\n\nPerkenalkan saya *${localStorage.getItem(`driverName`)||`Supir`}* dari *Travel Lombok Airport*.\n\nSaya menghubungi terkait pesanan Kakak untuk layanan:\n🚗 *${e.itemName}*\n📅 *${new Date(e.startDate).toLocaleDateString(`id-ID`)}*\n${l}${s}${c}${u}${d}${f}${p}\nApakah ada detail tambahan mengenai lokasi penjemputan atau jam yang spesifik?\n\nTerima kasih dan saya tunggu konfirmasinya ya Kak! 🙏`,h=`https://wa.me/${o}?text=${encodeURIComponent(m)}`,g=document.createElement(`div`);g.className=`trip-card ${t?`completed`:``}`,g.innerHTML=`
                <div class="trip-header">
                    <strong class="trip-title">${e.itemName}</strong>
                    <span class="badge ${r}">${i}</span>
                </div>
                <div class="info-row">
                    <i class="fa-solid fa-user"></i> <span>${e.customerName}</span>
                </div>
                <div class="info-row">
                    <i class="fa-solid fa-calendar"></i> <span>${new Date(e.startDate).toLocaleDateString(`id-ID`)}</span>
                </div>
                ${t?`<div style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #e2e8f0; color: #10b981; font-weight: 700; text-align: center;"><i class="fa-solid fa-circle-check"></i> Trip Telah Diselesaikan</div>`:`
                    <div class="action-buttons">
                        <a href="${h}" target="_blank" class="wa-btn"><i class="fa-brands fa-whatsapp"></i> Chat Penumpang</a>
                        <button class="complete-btn" onclick="markCompleted('${e.id}')"><i class="fa-solid fa-flag-checkered"></i> Selesaikan Trip</button>
                    </div>
                `}
            `,n.appendChild(g)})}catch{n.innerHTML=`<div style="text-align:center; color: #ef4444;">Gagal mengambil data jadwal.</div>`}}window.markCompleted=async t=>{Swal.fire({title:`Konfirmasi`,text:`Apakah tamu sudah selesai diantar dan trip dinyatakan selesai?`,icon:`question`,showCancelButton:!0,confirmButtonText:`Ya, Selesai`,cancelButtonText:`Batal`}).then(async r=>{if(r.isConfirmed)try{(await fetch(`${e}/bookings/${t}/complete`,{method:`PUT`,headers:{"Content-Type":`application/json`,"X-Driver-ID":localStorage.getItem(`driverId`)}})).ok?(Swal.fire(`Berhasil!`,`Trip diselesaikan.`,`success`),n(localStorage.getItem(`driverId`))):Swal.fire(`Gagal`,`Terjadi kesalahan.`,`error`)}catch{Swal.fire(`Error`,`Gagal menghubungi server.`,`error`)}})};