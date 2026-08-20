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
            const waLink = `https://wa.me/${cleanWa}?text=Halo%20${b.customerName},%20saya%20supir%20dari%20Travel%20Lombok%20Airport%20yang%20akan%20menjemput%20Anda.`;
            
            const card = document.createElement("div");
            card.className = `trip-card ${isCompleted ? 'completed' : ''}`;
            card.innerHTML = `
                <div class="trip-header">
                    <strong>${b.itemName}</strong>
                    <span class="badge ${badgeClass}">${statusText}</span>
                </div>
                <div style="margin-bottom: 8px;">
                    <i class="fa-solid fa-user" style="color: var(--text-gray); width: 20px;"></i> ${b.customerName}
                </div>
                <div style="margin-bottom: 8px;">
                    <i class="fa-solid fa-calendar" style="color: var(--text-gray); width: 20px;"></i> ${new Date(b.startDate).toLocaleDateString('id-ID')}
                </div>
                ${!isCompleted ? `
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <a href="${waLink}" target="_blank" class="wa-btn"><i class="fa-brands fa-whatsapp"></i> Hubungi Tamu</a>
                        <button class="complete-btn" onclick="markCompleted('${b.id}')"><i class="fa-solid fa-check"></i> Selesaikan Trip</button>
                    </div>
                ` : '<div style="margin-top: 15px; color: var(--primary-green); font-weight: bold;"><i class="fa-solid fa-check-double"></i> Trip Telah Selesai</div>'}
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
