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
        title: '<strong style="color: #1e293b; font-size: 1.5rem;">Panduan Aplikasi Supir</strong>',
        html: `
            <div style="text-align: left; font-size: 0.9rem; color: #475569; max-height: 60vh; overflow-y: auto; padding-right: 10px;">
                <p style="margin-bottom: 20px;">Selamat bekerja! Aplikasi ini akan mempermudah Anda dalam mengatur jadwal penjemputan tamu.</p>

                <div style="background: #eff6ff; padding: 15px; border-radius: 12px; margin-bottom: 15px; border-left: 5px solid #3b82f6; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h4 style="margin: 0 0 8px 0; color: #1e40af; font-size: 1rem;"><i class="fa-solid fa-calendar-check"></i> 1. Lihat Jadwal Trip</h4>
                    <p style="margin: 0;">Di halaman utama, Anda akan melihat kartu jadwal yang berisi <strong>Nama Tamu</strong>, <strong>Layanan (Tujuan)</strong>, dan <strong>Tanggal Jemput</strong> yang ditugaskan oleh Admin kepada Anda.</p>
                </div>

                <div style="background: #f0fdf4; padding: 15px; border-radius: 12px; margin-bottom: 15px; border-left: 5px solid #22c55e; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h4 style="margin: 0 0 8px 0; color: #166534; font-size: 1rem;"><i class="fa-brands fa-whatsapp"></i> 2. Hubungi Tamu Otomatis</h4>
                    <p style="margin: 0;">Tidak perlu repot mencatat nomor HP tamu. Cukup tekan tombol <span style="background: #22c55e; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem;">Hubungi Tamu</span> dan WhatsApp Anda akan otomatis terbuka dengan pesan sapaan awal.</p>
                </div>

                <div style="background: #fff1f2; padding: 15px; border-radius: 12px; margin-bottom: 15px; border-left: 5px solid #e11d48; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h4 style="margin: 0 0 8px 0; color: #9f1239; font-size: 1rem;"><i class="fa-solid fa-flag-checkered"></i> 3. Selesaikan Trip (Penting!)</h4>
                    <p style="margin: 0;">Jika tamu sudah diantar sampai tujuan dengan selamat, Anda <strong>WAJIB</strong> menekan tombol <span style="background: #3b82f6; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem;">Selesaikan Trip</span>. Ini sebagai laporan otomatis ke Bos/Admin bahwa tugas Anda telah selesai.</p>
                </div>
            </div>
        `,
        width: 600,
        icon: 'info',
        confirmButtonText: '<i class="fa-solid fa-thumbs-up"></i> Siap, Laksanakan!',
        confirmButtonColor: '#10b981',
        padding: '2em',
        background: '#ffffff',
        backdrop: `rgba(15, 23, 42, 0.8)`
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
