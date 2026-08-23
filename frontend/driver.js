const API_URL = '/api';

document.addEventListener("DOMContentLoaded", () => {
    checkDriverAuth();
    
    document.getElementById("driver-login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const phone = document.getElementById("d-phone").value;
        const pin = document.getElementById("d-pin").value;
        
        try {
            const res = await fetch(`${API_URL}/drivers/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, pin })
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                localStorage.setItem("driverId", data.driverId);
                localStorage.setItem("driverName", data.name);
                checkDriverAuth();
            } else {
                Swal.fire({icon: 'error', title: 'Login Gagal', text: data.error || 'Terjadi kesalahan.'});
            }
        } catch (error) {
            Swal.fire({icon: 'error', title: 'Error', text: 'Koneksi bermasalah.'});
        }
    });
});

window.showDriverTutorial = () => {
    Swal.fire({
        title: '<strong style="color: #1e293b; font-size: 1.6rem; letter-spacing: -0.5px;">Panduan Portal Supir</strong>',
        html: `
            <style>
                .driver-tutorial-container {
                    text-align: left; 
                    font-size: 0.95rem; 
                    color: #475569; 
                    max-height: 65vh; 
                    overflow-y: auto; 
                    padding-right: 5px;
                }
                .driver-tutorial-container::-webkit-scrollbar { width: 6px; }
                .driver-tutorial-container::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
                .driver-tutorial-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                
                .step-card {
                    background: white;
                    padding: 20px;
                    border-radius: 16px;
                    margin-bottom: 15px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.2s;
                }
                .step-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.06); }
                
                .step-card h4 {
                    margin: 0 0 10px 0;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .step-card p {
                    margin: 0;
                    line-height: 1.5;
                    font-size: 0.9rem;
                }
                
                .step-1 { border-left: 6px solid #3b82f6; }
                .step-1 h4 { color: #1d4ed8; }
                .step-1 .icon-bg { background: #eff6ff; color: #3b82f6; }
                
                .step-2 { border-left: 6px solid #10b981; }
                .step-2 h4 { color: #047857; }
                .step-2 .icon-bg { background: #ecfdf5; color: #10b981; }
                
                .step-3 { border-left: 6px solid #f59e0b; }
                .step-3 h4 { color: #b45309; }
                .step-3 .icon-bg { background: #fffbeb; color: #f59e0b; }

                .icon-bg {
                    width: 32px; height: 32px;
                    border-radius: 8px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1rem;
                }
                
                .badge-demo {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: white;
                    margin-top: 5px;
                }
            </style>
            
            <div class="driver-tutorial-container">
                <p style="margin-bottom: 25px; text-align: center; font-size: 1rem;">Selamat bertugas! Aplikasi ini dirancang khusus untuk mempermudah pekerjaan Anda.</p>

                <div class="step-card step-1">
                    <h4><div class="icon-bg"><i class="fa-solid fa-calendar-check"></i></div> 1. Cek Jadwal Penjemputan</h4>
                    <p>Setelah login, Anda akan langsung melihat daftar <strong>Jadwal Trip</strong>. Semua kartu jadwal yang tampil di sini adalah tugas resmi yang diberikan oleh Bos/Admin kepada Anda.</p>
                </div>

                <div class="step-card step-2">
                    <h4><div class="icon-bg"><i class="fa-brands fa-whatsapp"></i></div> 2. Hubungi Tamu Secara Otomatis</h4>
                    <p>Tidak perlu lagi repot menyimpan nomor tamu ke kontak HP Anda! Cukup tekan tombol <span class="badge-demo" style="background: #128C7E;"><i class="fa-brands fa-whatsapp"></i> Chat Penumpang</span>. <br><br>Sistem akan otomatis membuka aplikasi WhatsApp Anda yang sudah dilengkapi dengan <strong>pesan sapaan profesional</strong> (berisi nama Anda, nama tamu, dan tujuan penjemputan).</p>
                </div>

                <div class="step-card step-3">
                    <h4><div class="icon-bg"><i class="fa-solid fa-flag-checkered"></i></div> 3. Selesaikan Tugas (Wajib!)</h4>
                    <p>Jika tamu sudah diantar sampai tujuan dengan selamat, Anda <strong>WAJIB</strong> menekan tombol <span class="badge-demo" style="background: #2563eb;"><i class="fa-solid fa-flag-checkered"></i> Selesaikan Trip</span>. <br><br>Langkah ini sangat penting karena ini adalah bukti / laporan otomatis Anda ke Bos bahwa tugas telah diselesaikan.</p>
                </div>
            </div>
        `,
        width: 650,
        showCloseButton: true,
        confirmButtonText: '<i class="fa-solid fa-thumbs-up"></i> Siap, Laksanakan!',
        confirmButtonColor: '#10b981',
        padding: '2.5em',
        background: '#ffffff',
        backdrop: `rgba(15, 23, 42, 0.85)`,
        customClass: {
            confirmButton: 'btn-driver-ready'
        }
    }).then(() => {
        localStorage.setItem('driverTutorialSeen', 'true');
    });
};

function checkDriverAuth() {
    const driverId = localStorage.getItem("driverId");
    if (driverId) {
        document.getElementById("login-section").style.display = "none";
        document.getElementById("dashboard-section").style.display = "block";
        document.getElementById("driver-name-display").innerText = localStorage.getItem("driverName");
        fetchTrips(driverId);
        
        if (!localStorage.getItem('driverTutorialSeen')) {
            setTimeout(showDriverTutorial, 1000);
        }
    } else {
        document.getElementById("login-section").style.display = "block";
        document.getElementById("dashboard-section").style.display = "none";
    }
}

window.logoutDriver = () => {
    localStorage.removeItem("driverId");
    localStorage.removeItem("driverName");
    checkDriverAuth();
};

async function fetchTrips(driverId) {
    const container = document.getElementById("trips-container");
    container.innerHTML = '<div style="text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat...</div>';
    
    try {
        const res = await fetch(`${API_URL}/drivers/my-bookings`, {
            headers: { 'X-Driver-ID': driverId }
        });
        const bookings = await res.json();
        
        if (bookings.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding: 20px; color: #64748b;">Belum ada jadwal trip yang ditugaskan kepada Anda.</div>';
            return;
        }
        
        container.innerHTML = '';
        bookings.forEach(b => {
            const isCompleted = b.status === 'COMPLETED';
            
            let badgeClass = 'badge-pending';
            let statusText = 'Pending';
            if (b.status === 'PAID') { badgeClass = 'badge-paid'; statusText = 'Lunas'; }
            if (b.status === 'COMPLETED') { badgeClass = 'badge-completed'; statusText = 'Selesai'; }
            
            const waNumber = b.phone ? b.phone.replace(/[^0-9]/g, '') : '';
            const cleanWa = waNumber.startsWith('0') ? '62' + waNumber.substring(1) : waNumber;
            const msg = `Halo Kak ${b.customerName},\n\nPerkenalkan saya *${localStorage.getItem('driverName') || 'Supir'}* dari *Travel Lombok Airport*.\n\nSaya menghubungi terkait pesanan Kakak untuk layanan:\n🚗 *${b.itemName}*\n📅 *${new Date(b.startDate).toLocaleDateString('id-ID')}*\n\nApakah ada detail tambahan mengenai lokasi penjemputan atau jam yang spesifik?\n\nTerima kasih dan saya tunggu konfirmasinya ya Kak! 🙏`;
            const waLink = `https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`;
            
            const card = document.createElement("div");
            card.className = `trip-card ${isCompleted ? 'completed' : ''}`;
            card.innerHTML = `
                <div class="trip-header">
                    <strong class="trip-title">${b.itemName}</strong>
                    <span class="badge ${badgeClass}">${statusText}</span>
                </div>
                <div class="info-row">
                    <i class="fa-solid fa-user"></i> <span>${b.customerName}</span>
                </div>
                <div class="info-row">
                    <i class="fa-solid fa-calendar"></i> <span>${new Date(b.startDate).toLocaleDateString('id-ID')}</span>
                </div>
                ${!isCompleted ? `
                    <div class="action-buttons">
                        <a href="${waLink}" target="_blank" class="wa-btn"><i class="fa-brands fa-whatsapp"></i> Chat Penumpang</a>
                        <button class="complete-btn" onclick="markCompleted('${b.id}')"><i class="fa-solid fa-flag-checkered"></i> Selesaikan Trip</button>
                    </div>
                ` : '<div style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #e2e8f0; color: #10b981; font-weight: 700; text-align: center;"><i class="fa-solid fa-circle-check"></i> Trip Telah Diselesaikan</div>'}
            `;
            container.appendChild(card);
        });
        
    } catch (error) {
        container.innerHTML = '<div style="text-align:center; color: #ef4444;">Gagal mengambil data jadwal.</div>';
    }
}

window.markCompleted = async (bookingId) => {
    Swal.fire({
        title: 'Konfirmasi',
        text: "Apakah tamu sudah selesai diantar dan trip dinyatakan selesai?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Selesai',
        cancelButtonText: 'Batal'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}/bookings/${bookingId}/complete`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-Driver-ID': localStorage.getItem('driverId')
                    }
                });
                
                // If it fails, we will need to fix the backend.
                if (res.ok) {
                    Swal.fire('Berhasil!', 'Trip diselesaikan.', 'success');
                    fetchTrips(localStorage.getItem('driverId'));
                } else {
                    Swal.fire('Gagal', 'Terjadi kesalahan.', 'error');
                }
            } catch (e) {
                Swal.fire('Error', 'Gagal menghubungi server.', 'error');
            }
        }
    });
};
