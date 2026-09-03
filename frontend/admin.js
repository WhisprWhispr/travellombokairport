let authToken = localStorage.getItem('adminToken') || null;
const API_URL = "/api";

// Elements
const loginContainer = document.getElementById("login-container");
const adminDashboard = document.getElementById("admin-dashboard");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");

const tableBody = document.getElementById("admin-items-table");
const addBtn = document.getElementById("add-item-btn");
const modal = document.getElementById("item-modal");
const closeModalBtn = document.getElementById("close-modal");
const form = document.getElementById("item-form");

const idInput = document.getElementById("item-id");
const categoryInput = document.getElementById("item-category");
const isParentInput = document.getElementById("item-is-parent");
const parentIdInput = document.getElementById("item-parent-id");
const titleQuickSelect = document.getElementById("title-quick-select");
const titleInput = document.getElementById("item-title");
const orderInput = document.getElementById("item-order");
const descriptionInput = document.getElementById("item-description");
const priceInput = document.getElementById("item-price");
const imageInput = document.getElementById("item-image");
const droneVideoInput = document.getElementById("item-droneVideo");
const packageTypeInput = document.getElementById("item-packageType");
const durationInput = document.getElementById("item-duration");
const itineraryInput = document.getElementById("item-itinerary");
const includeInput = document.getElementById("item-include");
const excludeInput = document.getElementById("item-exclude");
const transmissionInput = document.getElementById("item-transmission");
const driverOptionsInput = document.getElementById("item-driverOptions");
const seatsInput = document.getElementById("item-seats");
const termsCategoryInput = document.getElementById("item-terms-category");
const termsCustomGroup = document.getElementById("item-terms-custom-group");
const termsInput = document.getElementById("item-terms");
const modalTitle = document.getElementById("modal-title");

// Auto-format price input while typing
priceInput.addEventListener('input', function(e) {
    let value = this.value.replace(/\D/g, ''); // Remove non-digits
    if (value) {
        this.value = parseInt(value, 10).toLocaleString('id-ID');
    } else {
        this.value = '';
    }
});

// ====== TRANSFER MATRIX STATE & FUNCTIONS ======
let transferMatrixData = {
    vehicles: ['Avanza Grand/FL', 'New Avanza', 'Innova Reborn', 'Hiace Komuter', 'Hiace Premio'],
    areas: []
};

const renderTransferMatrix = () => {
    const container = document.getElementById('transfer-matrix-container');
    if (!container) return;
    if (transferMatrixData.areas.length === 0) {
        container.innerHTML = '<p style="padding: 20px; color: #94a3b8; text-align: center; font-size: 0.9rem;">Belum ada data area. Klik "Tambah Area" atau gunakan AI Scan untuk mengisi otomatis.</p>';
        return;
    }
    let html = `<table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
        <thead>
            <tr style="background: var(--primary-blue); color: white;">
                <th style="padding: 10px 12px; text-align: left; white-space: nowrap; position: sticky; left: 0; background: var(--primary-blue); z-index: 1;">Area Tujuan</th>
                ${transferMatrixData.vehicles.map((v, vi) => `<th style="padding: 10px 12px; text-align: center; white-space: nowrap;">${v} <button type="button" onclick="window.removeTransferVehicle(${vi})" style="background: none; border: none; color: #fca5a5; cursor: pointer; font-size: 0.75rem; margin-left: 4px;" title="Hapus kendaraan"><i class='fa-solid fa-xmark'></i></button></th>`).join('')}
                <th style="padding: 10px 12px; text-align: center;">Aksi</th>
            </tr>
        </thead>
        <tbody>`;
    transferMatrixData.areas.forEach((area, ai) => {
        html += `<tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px 12px; font-weight: 700; color: var(--text-dark); white-space: nowrap; position: sticky; left: 0; background: white; z-index: 1;"><input type="text" value="${area.area}" onchange="window.updateTransferAreaName(${ai}, this.value)" style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; font-weight: 700; width: 100%; min-width: 160px;"></td>
            ${transferMatrixData.vehicles.map((v, vi) => {
                const price = area.prices[v] || '';
                return `<td style="padding: 8px 6px; text-align: center;"><input type="text" value="${price ? parseInt(price).toLocaleString('id-ID') : ''}" onchange="window.updateTransferPrice(${ai}, '${v.replace(/'/g, "\\'")}', this.value)" placeholder="0" style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 4px; width: 100%; min-width: 90px; text-align: center; font-size: 0.85rem;"></td>`;
            }).join('')}
            <td style="padding: 8px 6px; text-align: center;"><button type="button" onclick="window.removeTransferArea(${ai})" class="btn" style="background: #fee2e2; color: #ef4444; padding: 6px 10px; font-size: 0.8rem; border: none;"><i class='fa-solid fa-trash'></i></button></td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
};

window.addTransferArea = () => {
    transferMatrixData.areas.push({ area: 'Area Baru', prices: {} });
    renderTransferMatrix();
};

window.removeTransferArea = (index) => {
    transferMatrixData.areas.splice(index, 1);
    renderTransferMatrix();
};

window.updateTransferAreaName = (index, name) => {
    transferMatrixData.areas[index].area = name;
};

window.updateTransferPrice = (areaIndex, vehicle, value) => {
    const num = parseInt(value.replace(/\D/g, ''), 10);
    transferMatrixData.areas[areaIndex].prices[vehicle] = isNaN(num) ? 0 : num;
};

window.addTransferVehicle = () => {
    Swal.fire({
        title: 'Nama Kendaraan Baru',
        input: 'text',
        inputPlaceholder: 'e.g. Toyota Hiace',
        showCancelButton: true,
        confirmButtonColor: '#22c55e',
        confirmButtonText: 'Tambah',
        cancelButtonText: 'Batal'
    }).then(result => {
        if (result.isConfirmed && result.value) {
            transferMatrixData.vehicles.push(result.value.trim());
            renderTransferMatrix();
        }
    });
};

window.removeTransferVehicle = (index) => {
    const name = transferMatrixData.vehicles[index];
    transferMatrixData.vehicles.splice(index, 1);
    transferMatrixData.areas.forEach(a => delete a.prices[name]);
    renderTransferMatrix();
};

const toggleTransferMatrixVisibility = () => {
    const isTransfer = categoryInput.value === 'transfer';
    const matrixGroup = document.getElementById('transfer-matrix-group');
    const priceDurationGroup = document.getElementById('price-duration-group');
    if (matrixGroup) matrixGroup.style.display = isTransfer ? 'block' : 'none';
    if (priceDurationGroup) priceDurationGroup.style.display = isTransfer ? 'none' : 'flex';
    if (isTransfer) renderTransferMatrix();
};

categoryInput.addEventListener('change', toggleTransferMatrixVisibility);
// Run on load to handle default value
toggleTransferMatrixVisibility();

// AI Auto-Fill Functionality
window.scanImageWithAI = async () => {
    const fileInput = document.getElementById('ai-image-input');
    const loadingDiv = document.getElementById('ai-loading');
    const errorDiv = document.getElementById('ai-error');
    const btn = document.getElementById('ai-scan-btn');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        errorDiv.textContent = "Silakan pilih file gambar brosur terlebih dahulu!";
        errorDiv.style.display = 'block';
        return;
    }
    
    const file = fileInput.files[0];
    if (file.size > 4 * 1024 * 1024) {
        errorDiv.textContent = "Ukuran gambar terlalu besar (maksimal 4MB).";
        errorDiv.style.display = 'block';
        return;
    }

    errorDiv.style.display = 'none';
    loadingDiv.style.display = 'block';
    btn.disabled = true;

    try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Data = reader.result;
            try {
                const response = await fetch(`${API_URL}/ai/scan-image`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                    body: JSON.stringify({ imageBase64: base64Data })
                });
                
                const result = await response.json();
                if (result.success && result.data) {
                    const aiData = result.data;
                    
                    // 1. Auto-select category FIRST (triggers visibility of related fields)
                    if (aiData.category) {
                        const catLower = aiData.category.toLowerCase();
                        if (catLower.includes('motor')) categoryInput.value = 'motorcycle';
                        else if (catLower.includes('mobil')) categoryInput.value = 'car';
                        else if (catLower.includes('kereta')) categoryInput.value = 'train';
                        else if (catLower.includes('hanimun') || catLower.includes('honeymoon')) categoryInput.value = 'honeymoon';
                        else if (catLower.includes('tour') || catLower.includes('paket')) categoryInput.value = 'tour';
                        else if (catLower.includes('antar') || catLower.includes('jemput') || catLower.includes('transfer')) categoryInput.value = 'transfer';
                        else if (catLower.includes('drone')) categoryInput.value = 'drone';
                        categoryInput.dispatchEvent(new Event('change'));
                    }
                    
                    // 2. Title
                    if (aiData.title) titleInput.value = aiData.title;
                    
                    // 3. Price
                    if (aiData.price) {
                        priceInput.value = parseInt(aiData.price, 10).toLocaleString('id-ID');
                    }
                    
                    // 4. Description
                    if (aiData.description) {
                        descriptionInput.value = aiData.description;
                    }
                    
                    // 5. Duration
                    if (aiData.duration && durationInput) {
                        durationInput.value = aiData.duration;
                    }
                    
                    // 6. Transmission (Sewa Mobil/Motor)
                    if (aiData.transmission && transmissionInput) {
                        const transLower = aiData.transmission.toLowerCase();
                        if (transLower.includes('manual') && transLower.includes('matic')) {
                            transmissionInput.value = 'Matic / Manual';
                        } else if (transLower.includes('matic') || transLower.includes('automatic') || transLower.includes('otomatis')) {
                            transmissionInput.value = 'Matic';
                        } else if (transLower.includes('manual')) {
                            transmissionInput.value = 'Manual';
                        }
                    }
                    
                    // 7. Driver Options (Mobil)
                    if (aiData.driverOptions && driverOptionsInput) {
                        const drvLower = aiData.driverOptions.toLowerCase();
                        if (drvLower.includes('include') || drvLower.includes('dengan')) {
                            driverOptionsInput.value = 'Include Driver';
                        } else if (drvLower.includes('tidak') || drvLower.includes('lepas') || drvLower.includes('tanpa')) {
                            driverOptionsInput.value = 'Tidak Include Driver';
                        }
                    }
                    
                    // 8. Seats
                    if (aiData.seats && seatsInput) {
                        seatsInput.value = parseInt(aiData.seats, 10) || '';
                    }
                    
                    // 9. Package Type (Tour)
                    if (aiData.packageType && packageTypeInput) {
                        packageTypeInput.value = aiData.packageType;
                    }
                    
                    // 10. Itinerary (Tour)
                    if (aiData.itinerary && itineraryInput) {
                        itineraryInput.value = aiData.itinerary.replace(/\\n/g, '\n');
                    }
                    
                    // 11. Include
                    if (aiData.include && includeInput) {
                        includeInput.value = aiData.include.replace(/\\n/g, '\n').replace(/•/g, '-');
                    }
                    
                    // 12. Exclude
                    if (aiData.exclude && excludeInput) {
                        excludeInput.value = aiData.exclude.replace(/\\n/g, '\n').replace(/•/g, '-');
                    }

                    // 12.5 Terms / Syarat & Ketentuan
                    if (aiData.terms && termsInput && termsCategoryInput) {
                        termsCategoryInput.value = 'custom';
                        termsCategoryInput.dispatchEvent(new Event('change'));
                        termsInput.value = aiData.terms.replace(/\\n/g, '\n').replace(/•/g, '-');
                    }

                    // 13. Transfer Matrix (Antar Jemput)
                    if (aiData.transferMatrix && Array.isArray(aiData.transferMatrix) && aiData.transferMatrix.length > 0) {
                        // Extract unique vehicle names from all areas
                        const allVehicles = new Set();
                        aiData.transferMatrix.forEach(tm => {
                            if (tm.prices) Object.keys(tm.prices).forEach(v => allVehicles.add(v));
                        });
                        transferMatrixData.vehicles = [...allVehicles];
                        transferMatrixData.areas = aiData.transferMatrix.map(tm => ({
                            area: tm.area || 'Unknown Area',
                            prices: tm.prices || {}
                        }));
                        renderTransferMatrix();
                    }

                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: 'Semua field form telah diisi secara otomatis oleh AI. Silakan periksa dan sesuaikan jika perlu.',
                        confirmButtonColor: '#22c55e'
                    });
                } else {
                    throw new Error(result.message || 'Gagal membaca gambar');
                }
            } catch (err) {
                console.error(err);
                errorDiv.textContent = err.message || "Terjadi kesalahan saat memproses gambar dengan AI.";
                errorDiv.style.display = 'block';
            } finally {
                loadingDiv.style.display = 'none';
                btn.disabled = false;
            }
        };
        reader.onerror = () => {
            throw new Error("Gagal membaca file lokal.");
        };
    } catch (err) {
        loadingDiv.style.display = 'none';
        btn.disabled = false;
        errorDiv.textContent = err.message;
        errorDiv.style.display = 'block';
    }
};

const DEFAULT_MOTOR_TERMS = `🛵 SYARAT & KETENTUAN SEWA MOTOR 

1. Identitas Penyewa
   • WNI: KTP & SIM C aktif.
   • WNA: Paspor & SIM yang berlaku.

2. Booking
   • Booking dinyatakan sah setelah pembayaran lock booking sebesar Rp 50.000.
   • Pelunasan dilakukan sebelum kendaraan digunakan.

3. Deposit / Uang Jaminan
   • Deposit: Rp 500.000
   • Deposit dibayarkan sebelum kendaraan diserahkan.
   • Deposit dikembalikan setelah kendaraan dikembalikan dan kondisi unit dinyatakan baik.
   • Jika terdapat kerusakan, kehilangan, atau denda akibat penyewa, biaya dapat dipotong dari deposit.

4. Penggunaan Kendaraan
   • Kendaraan hanya digunakan untuk keperluan pribadi dan sesuai aturan lalu lintas.
   • Dilarang menyewakan kembali kendaraan kepada pihak lain.
   • Dilarang menggunakan kendaraan untuk balapan, off-road ekstrem, atau kegiatan ilegal.

5. Tanggung Jawab Penyewa
   • Penyewa bertanggung jawab atas kendaraan selama masa sewa.
   • Tilang, denda, parkir, kehilangan kunci, dan kerusakan akibat kelalaian menjadi tanggung jawab penyewa.
   • Jika terjadi kecelakaan atau kerusakan, segera hubungi pihak rental.

6. Pengembalian
   • Kendaraan wajib dikembalikan sesuai waktu yang telah disepakati.
   • Keterlambatan dapat dikenakan biaya tambahan.
   • Kendaraan dikembalikan dalam kondisi seperti saat diterima.

💰 DEPOSIT: Rp 500.000

Deposit akan dikembalikan setelah kendaraan diperiksa dan tidak terdapat kerusakan, kehilangan, atau kewajiban lainnya.

TRAVEL LOMBOK AIRPORT 🚙`;

const DEFAULT_CAR_TERMS = `🚙 SYARAT & KETENTUAN SEWA MOBIL LEPAS KUNCI 

1. Identitas Penyewa
   • WNI: KTP & SIM A aktif.
   • WNA: Paspor & SIM yang berlaku.

2. Booking
   • Booking dinyatakan sah setelah pembayaran lock booking sebesar Rp 200.000.
   • Pelunasan dilakukan sebelum kendaraan digunakan.

3. Deposit / Uang Jaminan
   • Deposit: Rp 1.000.000
   • Deposit dibayarkan sebelum kendaraan diserahkan.
   • Deposit dikembalikan setelah kendaraan dikembalikan dan kondisi unit dinyatakan baik.
   • Jika terdapat kerusakan, kehilangan, atau denda akibat penyewa, biaya dapat dipotong dari deposit.

4. Penggunaan Kendaraan
   • Kendaraan hanya digunakan untuk keperluan pribadi dan sesuai aturan lalu lintas.
   • Dilarang menyewakan kembali kendaraan kepada pihak lain.
   • Dilarang menggunakan kendaraan untuk balapan, off-road ekstrem, atau kegiatan ilegal.

5. Tanggung Jawab Penyewa
   • Penyewa bertanggung jawab atas kendaraan selama masa sewa.
   • Tilang, denda, parkir, kehilangan kunci, dan kerusakan akibat kelalaian menjadi tanggung jawab penyewa.
   • Jika terjadi kecelakaan atau kerusakan, segera hubungi pihak rental.

6. Pengembalian
   • Kendaraan wajib dikembalikan sesuai waktu yang telah disepakati.
   • Keterlambatan dapat dikenakan biaya tambahan.
   • Kendaraan dikembalikan dalam kondisi seperti saat diterima.

💰 DEPOSIT: Rp 1.000.000

Deposit akan dikembalikan setelah kendaraan diperiksa dan tidak terdapat kerusakan, kehilangan, atau kewajiban lainnya.

TRAVEL LOMBOK AIRPORT 🚙`;

const checkAuth = () => {
    if (authToken) {
        loginContainer.style.display = "none";
        adminDashboard.style.display = "";
        fetchAdminItems();
        fetchGlobalSettings();
        
        if (!localStorage.getItem('adminTutorialSeen')) {
            setTimeout(showAdminTutorial, 1000);
        }
    } else {
        loginContainer.style.display = "flex";
        adminDashboard.style.display = "none";
    }
};



// Login Handler
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.style.display = "none";
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const btn = document.getElementById("login-btn");
    
    // Ambil turnstile token
    let turnstileResponse = '';
    const formData = new FormData(loginForm);
    if (formData.has('cf-turnstile-response')) {
        turnstileResponse = formData.get('cf-turnstile-response');
    }

    if (!turnstileResponse) {
        loginError.style.display = "block";
        loginError.innerText = "Harap selesaikan verifikasi keamanan (Turnstile).";
        return;
    }

    btn.disabled = true;
    btn.innerText = "Loading...";
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, turnstileToken: turnstileResponse })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            authToken = data.token;
            localStorage.setItem('adminToken', authToken);
            if (data.admin && data.admin.email) {
                localStorage.setItem('adminEmail', data.admin.email);
            } else if (data.user && data.user.email) {
                localStorage.setItem('adminEmail', data.user.email);
            }
            // Tandai sesi sudah aktif, agar refresh halaman berikutnya tercatat sebagai 'refresh' bukan fresh login
            sessionStorage.setItem('adminSessionActive', '1');
            checkAuth();
        } else {
            throw new Error(data.error || "Email atau password salah");
        }
    } catch (error) {
        loginError.style.display = "block";
        loginError.innerText = "Login Gagal: " + error.message;
        if (window.turnstile) window.turnstile.reset();
    } finally {
        btn.disabled = false;
        btn.innerText = "Login";
    }
});

// ====== LOG AKTIVITAS SESI (login, refresh, logout) ======
async function logSessionActivity(type = 'refresh') {
    const token = authToken;
    if (!token) return; // Hanya log jika sudah login
    try {
        await fetch(`${API_URL}/session-log`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ type })
        });
    } catch (e) {
        console.warn('Session log gagal:', e);
    }
}

// Logout Handler
logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    // Catat aktivitas logout SEBELUM token dihapus
    await logSessionActivity('logout');
    authToken = null;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    sessionStorage.removeItem('adminSessionActive');
    checkAuth();
});

// Forgot Password Handler
document.getElementById('forgot-password-link').addEventListener('click', async (e) => {
    e.preventDefault();
    const { value: email } = await Swal.fire({
        title: 'Lupa Sandi?',
        text: 'Masukkan email admin Anda untuk menerima link reset sandi dari Firebase.',
        input: 'email',
        inputPlaceholder: 'admin@example.com',
        showCancelButton: true,
        confirmButtonText: 'Kirim Link Reset',
        cancelButtonText: 'Batal'
    });

    if (email) {
        Swal.fire({ title: 'Mengirim...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                Swal.fire('Berhasil!', data.message, 'success');
            } else {
                throw new Error(data.error || 'Gagal mengirim email reset sandi');
            }
        } catch (error) {
            Swal.fire('Gagal!', error.message, 'error');
        }
    }
});

// Reset Password Handler (Ubah Sandi Saya)
document.getElementById('reset-password-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    
    // Coba ambil email dari token JWT
    let defaultEmail = '';
    if (authToken) {
        try {
            const payload = JSON.parse(atob(authToken.split('.')[1]));
            defaultEmail = payload.email || '';
        } catch (err) {
            console.error("Gagal parse token:", err);
        }
    }

    const { value: email } = await Swal.fire({
        title: 'Ubah Sandi Saya',
        text: 'Masukkan email akun ini untuk menerima link perubahan sandi yang dikirimkan oleh Firebase.',
        input: 'email',
        inputValue: defaultEmail,
        inputPlaceholder: 'admin@example.com',
        showCancelButton: true,
        confirmButtonText: 'Kirim Link Ubah Sandi',
        cancelButtonText: 'Batal'
    });

    if (email) {
        Swal.fire({ title: 'Mengirim...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                Swal.fire('Berhasil!', data.message + '\n\nSilakan cek email Anda (termasuk folder Spam/Junk) lalu klik link untuk mengubah sandi.', 'success');
            } else {
                throw new Error(data.error || 'Gagal mengirim email reset sandi');
            }
        } catch (error) {
            Swal.fire('Gagal!', error.message, 'error');
        }
    }
});

// Utility to get auth headers
const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${authToken}`
});

// Fetch and render items
let allAdminItems = [];

const populateParentDropdown = (items) => {
    const parentSelect = document.getElementById("item-parent-id");
    if (!parentSelect) return;
    const parents = items.filter(i => i.isParent === true);
    let html = '<option value="">-- Tidak ada (Tampil di halaman depan) --</option>';
    parents.forEach(p => {
        html += `<option value="${p.id}">${p.title}</option>`;
    });
    parentSelect.innerHTML = html;
};

const fetchAdminItems = async () => {
    try {
        const response = await fetch(`${API_URL}/items`);
        const items = await response.json();
        window.globalItems = items; // Populate for promos dropdown
        renderTable(items);
        renderDroneTable(items);
        allAdminItems = items;
        populateParentDropdown(items);
    } catch (error) {
        console.error("Error:", error);
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Failed to load items. Is backend running?</td></tr>`;
    }
};

const renderTable = (items) => {
    if (items.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No items found.</td></tr>`;
        return;
    }
    
    tableBody.innerHTML = items.map(item => {
        const isParentBadge = item.isParent ? `<span style="background:#fef3c7; color:#92400e; padding:2px 7px; border-radius:4px; font-size:0.7rem; font-weight:700; margin-left:5px;"><i class="fa-solid fa-layer-group"></i> FOLDER</span>` : '';
        const isChildBadge = item.parentId ? `<span style="background:#dbeafe; color:#1e40af; padding:2px 7px; border-radius:4px; font-size:0.7rem; font-weight:700; margin-left:5px;"><i class="fa-solid fa-arrow-turn-down"></i> SUB-PAKET</span>` : '';
        const parentName = item.parentId ? allAdminItems.find(i => i.id === item.parentId)?.title || item.parentId : '';
        const parentInfo = item.parentId ? `<br><small style="color:#3b82f6;">↳ ${parentName}</small>` : '';
        return `
        <tr>
            <td><img src="${item.imageUrl}" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=100'"></td>
            <td><strong>${item.title}</strong>${isParentBadge}${isChildBadge}${parentInfo} <br><small style="color: #64748b;">Urutan: ${item.order || 0}</small></td>
            <td><span style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${item.category}</span></td>
            <td>${item.price}</td>
            <td>
                <button class="action-btn btn-edit" onclick="editItem('${item.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
                <button class="action-btn btn-delete" onclick="deleteItem('${item.id}')"><i class="fa-solid fa-trash"></i> Delete</button>
            </td>
        </tr>
    `;
    }).join('');
};

const renderDroneTable = (items) => {
    const droneList = document.getElementById("drone-list");
    if (!droneList) return;
    
    const droneItems = items.filter(item => item.category === 'Drone');
    
    if (droneItems.length === 0) {
        droneList.innerHTML = `<tr><td colspan="4" class="text-center">Belum ada portofolio drone.</td></tr>`;
        return;
    }
    
    droneList.innerHTML = droneItems.map(item => `
        <tr>
            <td>
                <div style="width: 80px; height: 50px; background: #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    ${item.imageUrl 
                        ? `<img src="${item.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;">` 
                        : `<i class="fa-solid fa-video" style="color: #94a3b8; font-size: 1.5rem;"></i>`
                    }
                </div>
            </td>
            <td><strong>${item.title}</strong><br><a href="${item.droneVideoUrl}" target="_blank" style="font-size: 0.8rem; color: var(--primary-blue);"><i class="fa-solid fa-link"></i> Buka Tautan</a></td>
            <td><span style="font-size: 0.85rem; color: #64748b;">${item.date || '-'}</span></td>
            <td>
                <button class="action-btn btn-edit" onclick="editItem('${item.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
                <button class="action-btn btn-delete" onclick="deleteItem('${item.id}')"><i class="fa-solid fa-trash"></i> Delete</button>
            </td>
        </tr>
    `).join('');
};

// Helper: get next available package title
// Sequence: Paket A → Paket A 2 → Paket A 3 → Paket B → Paket B 2 → ...
const getNextPackageTitle = async () => {
    try {
        const res = await fetch(`${API_URL}/items`);
        const items = await res.json();
        const packageItems = items.filter(i =>
            i.category && (i.category.toLowerCase().includes('paket') || i.category.toLowerCase().includes('package') || i.category.toLowerCase() === 'package' || i.category.toLowerCase() === 'tour' || i.category.toLowerCase() === 'honeymoon')
        );

        // Build a set of ALL exact used prefixes: "A", "A 2", "A 3", "B", etc.
        const usedTitles = new Set();
        packageItems.forEach(i => {
            // Match "Paket A", "Paket A 2", "Paket B 3" etc. (case-insensitive)
            const m = (i.title || '').match(/paket\s+([a-z])(\s+(\d+))?/i);
            if (m) {
                const letter = m[1].toUpperCase();
                const num = m[3] ? parseInt(m[3]) : 1;
                usedTitles.add(`${letter}-${num}`);
            }
        });

        // Try each letter, and for each letter try variant numbers 1, 2, 3...
        for (let code = 65; code <= 90; code++) {
            const letter = String.fromCharCode(code);
            for (let num = 1; num <= 99; num++) {
                if (!usedTitles.has(`${letter}-${num}`)) {
                    // Return title string
                    return num === 1 ? `Paket ${letter} ` : `Paket ${letter} ${num} `;
                }
            }
        }
        return null;
    } catch (e) { return null; }
};

// Auto-fill title when category = package (for new items only)
const autoFillPackageTitle = async () => {
    if (idInput.value) return; // skip if editing existing item
    if (categoryInput.value === 'package' || categoryInput.value === 'tour' || categoryInput.value === 'honeymoon') {
        const suggestedTitle = await getNextPackageTitle();
        if (suggestedTitle && !titleInput.value) {
            titleInput.value = suggestedTitle;
            titleInput.focus();
            // Move cursor to end
            const len = titleInput.value.length;
            titleInput.setSelectionRange(len, len);
        }
    }
};

// Modal handlers
const openModal = async () => {
    modal.classList.add("active");
    // If opening for new item and category is already 'tour', auto-fill title
    await autoFillPackageTitle();
};

categoryInput.addEventListener('change', () => {
    autoFillPackageTitle();
    if (categoryInput.value === 'tour' || categoryInput.value === 'honeymoon' || categoryInput.value === 'package') {
        titleQuickSelect.style.display = 'flex';
    } else {
        titleQuickSelect.style.display = 'none';
    }
});

// Setup quick select badges
document.querySelectorAll('.btn-quick-title').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const prefix = e.target.innerText;
        let currentTitle = titleInput.value.replace(/^Paket [A-Z](\s+)?/i, '').trim();
        titleInput.value = `${prefix} ${currentTitle}`.trim();
        titleInput.focus();
    });
});

window.openDroneModal = () => {
    document.getElementById("drone-form").reset();
    document.getElementById("drone-id").value = "";
    document.getElementById("drone-modal").classList.add("active");
};
const closeModal = () => { 
    modal.classList.remove("active");
    form.reset();
    idInput.value = "";
    if(isParentInput) isParentInput.checked = false;
    if(parentIdInput) parentIdInput.value = "";
    orderInput.value = "0";
    termsCustomGroup.style.display = "none";
    modalTitle.textContent = "Add New Item";
    // Reset transfer matrix
    transferMatrixData.areas = [];
    transferMatrixData.vehicles = ['Avanza Grand/FL', 'New Avanza', 'Innova Reborn', 'Hiace Komuter', 'Hiace Premio'];
    toggleTransferMatrixVisibility();
};

addBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
    if(e.target === modal) closeModal();
});
termsCategoryInput.addEventListener("change", (e) => {
    if (e.target.value === "custom") {
        termsCustomGroup.style.display = "block";
    } else {
        termsCustomGroup.style.display = "none";
    }
});

// Booking Modal Handlers
const bookingModal = document.getElementById("booking-modal");
const openBookingModal = async () => {
    // Populate items in select
    try {
        const response = await fetch(`${API_URL}/items`);
        const items = await response.json();
        const select = document.getElementById("booking-item-name");
        select.innerHTML = '<option value="">Pilih Item...</option>' + 
            items.map(i => `<option value="${i.title}">${i.title}</option>`).join('');
    } catch (e) {
        console.error("Failed to load items for booking modal", e);
    }
    bookingModal.classList.add("active");
};
const closeBookingModal = () => {
    bookingModal.classList.remove("active");
    document.getElementById("booking-form").reset();
};
document.getElementById("add-booking-btn").addEventListener("click", openBookingModal);
document.getElementById("close-booking-modal").addEventListener("click", closeBookingModal);
bookingModal.addEventListener("click", (e) => {
    if(e.target === bookingModal) closeBookingModal();
});

// Form Submission (Create / Update Item)
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!authToken) return Swal.fire({icon: 'info', title: 'Pemberitahuan', text: "Anda harus login!", confirmButtonColor: '#22c55e'});
    
    let finalTerms = "";
    if (termsCategoryInput.value === 'custom') {
        finalTerms = termsInput.value;
    } else if (termsCategoryInput.value === 'default') {
        if (categoryInput.value === 'motorcycle') finalTerms = DEFAULT_MOTOR_TERMS;
        else if (categoryInput.value === 'car') finalTerms = DEFAULT_CAR_TERMS;
    }
    
    const itemData = {
        title: titleInput.value,
        description: descriptionInput.value,
        category: categoryInput.value,
        isParent: isParentInput ? isParentInput.checked : false,
        parentId: (parentIdInput && parentIdInput.value) ? parentIdInput.value : null,
        order: parseInt(orderInput.value) || 0,
        price: priceInput.value.replace(/\./g, ''), // Strip dots before saving
        imageUrl: imageInput.value,
        droneVideoUrl: droneVideoInput.value,
        packageType: packageTypeInput.value,
        duration: durationInput.value,
        itinerary: itineraryInput.value,
        include: includeInput.value,
        exclude: excludeInput.value,
        transmission: transmissionInput.value,
        driverOptions: driverOptionsInput.value,
        seats: seatsInput.value,
        terms: finalTerms
    };
    
    // Include transfer matrix data if category is transfer
    if (categoryInput.value === 'transfer') {
        itemData.transferMatrix = transferMatrixData.areas;
        itemData.transferVehicles = transferMatrixData.vehicles;
    }
    
    const itemId = idInput.value;
    const method = itemId ? "PUT" : "POST";
    const url = itemId ? `${API_URL}/items/${itemId}` : `${API_URL}/items`;
    
    Swal.fire({title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => {Swal.showLoading()}});
    
    try {
        const response = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify(itemData)
        });
        
        if (response.ok) {
            closeModal();
            fetchAdminItems();
            Swal.fire({icon: 'success', title: 'Berhasil', text: "Item berhasil disimpan!", confirmButtonColor: '#22c55e'});
        } else {
            const err = await response.json();
            Swal.fire({icon: 'info', title: 'Pemberitahuan', text: "Gagal: " + (err.error || err.message), confirmButtonColor: '#22c55e'});
        }
    } catch (error) {
        console.error("Error saving item:", error);
        Swal.fire({icon: 'info', title: 'Pemberitahuan', text: "Error saving item", confirmButtonColor: '#22c55e'});
    }
});

// Handle Drone Form Submit
document.getElementById("drone-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const id = document.getElementById("drone-id").value;
    const title = document.getElementById("drone-title").value;
    const date = document.getElementById("drone-date").value;
    const description = document.getElementById("drone-description").value;
    const videoUrl = document.getElementById("drone-video-url").value;
    
    const itemData = {
        category: "Drone",
        title: title,
        date: date, // Custom date field
        description: description,
        droneVideoUrl: videoUrl,
        imageUrl: "", // Not used
        price: "0",   // Not used, but kept for schema compatibility
    };
    
    Swal.fire({title: 'Menyimpan Video Drone...', allowOutsideClick: false, didOpen: () => {Swal.showLoading()}});
    
    try {
        const url = id ? `${API_URL}/items/${id}` : `${API_URL}/items`;
        const method = id ? "PUT" : "POST";
        
        const response = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(itemData)
        });
        
        if (response.ok) {
            document.getElementById("drone-modal").classList.remove("active");
            fetchAdminItems(); // Refresh the main table
            Swal.fire({icon: 'success', title: 'Berhasil', text: "Video drone berhasil disimpan!", confirmButtonColor: '#22c55e'});
        } else {
            const err = await response.json();
            Swal.fire({icon: 'error', title: 'Gagal', text: "Gagal menyimpan video drone: " + (err.error || err.message), confirmButtonColor: '#22c55e'});
        }
    } catch (error) {
        console.error("Error saving drone video:", error);
        Swal.fire({icon: 'error', title: 'Gagal', text: "Terjadi kesalahan saat menyimpan video", confirmButtonColor: '#22c55e'});
    }
});

// Form Submission (Manual Booking)
document.getElementById("booking-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!authToken) return Swal.fire({icon: 'info', title: 'Pemberitahuan', text: "Anda harus login!", confirmButtonColor: '#22c55e'});
    
    const bookingData = {
        itemId: "manual", // We don't have itemId easily available here, so we use "manual" or generate one. The schema uses itemName.
        itemName: document.getElementById("booking-item-name").value,
        customerName: document.getElementById("booking-customer").value || "Booking Manual",
        phone: document.getElementById("booking-phone").value || "-",
        startDate: document.getElementById("booking-start").value,
        endDate: document.getElementById("booking-end").value,
        status: "PAID",
        transactionId: "MANUAL-" + Math.floor(Math.random() * 10000)
    };
    
    Swal.fire({title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => {Swal.showLoading()}});
    
    try {
        const response = await fetch(`${API_URL}/bookings`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(bookingData)
        });
        
        if (response.ok) {
            closeBookingModal();
            fetchAdminBookings();
            Swal.fire({icon: 'info', title: 'Pemberitahuan', text: "Jadwal manual berhasil ditambahkan!", confirmButtonColor: '#22c55e'});
        } else {
            const err = await response.json();
            Swal.fire({icon: 'info', title: 'Pemberitahuan', text: "Gagal: " + (err.error || err.message), confirmButtonColor: '#22c55e'});
        }
    } catch (error) {
        console.error("Error saving manual booking:", error);
        Swal.fire({icon: 'info', title: 'Pemberitahuan', text: "Error saving manual booking", confirmButtonColor: '#22c55e'});
    }
});

// Edit & Delete Handlers (Attached to window for inline onclick)
window.editItem = async (id) => {
    try {
        const response = await fetch(`${API_URL}/items/${id}`);
        const item = await response.json();
        
        if (item.category === 'Drone') {
            document.getElementById('drone-id').value = item.id;
            document.getElementById('drone-title').value = item.title;
            document.getElementById('drone-date').value = item.date || "";
            document.getElementById('drone-description').value = item.description || "";
            document.getElementById('drone-video-url').value = item.droneVideoUrl || "";
            document.getElementById('drone-modal').classList.add('active');
            return;
        }

        idInput.value = item.id;
        
        let titleStr = item.title || "";
        if (item.category === 'tour' || item.category === 'honeymoon' || item.category === 'package') {
            titleQuickSelect.style.display = 'flex';
        } else {
            titleQuickSelect.style.display = 'none';
        }
        titleInput.value = titleStr;

        orderInput.value = item.order || 0;
        descriptionInput.value = item.description;
        categoryInput.value = item.category;
        if(isParentInput) isParentInput.checked = !!item.isParent;
        if(parentIdInput) parentIdInput.value = item.parentId || "";
        
        // Format price with dots for display in form
        if (item.price) {
            priceInput.value = parseInt(item.price.toString().replace(/\D/g, ''), 10).toLocaleString('id-ID');
        } else {
            priceInput.value = "";
        }
        
        imageInput.value = item.imageUrl || "";
        droneVideoInput.value = item.droneVideoUrl || "";
        packageTypeInput.value = item.packageType || "";
        durationInput.value = item.duration || "";
        itineraryInput.value = item.itinerary || "";
        includeInput.value = item.include || "";
        excludeInput.value = item.exclude || "";
        transmissionInput.value = item.transmission || "";
        driverOptionsInput.value = item.driverOptions || "";
        seatsInput.value = item.seats || "";
        
        // Load transfer matrix if available
        if (item.category === 'transfer' && item.transferMatrix && item.transferMatrix.length > 0) {
            transferMatrixData.areas = item.transferMatrix;
            transferMatrixData.vehicles = item.transferVehicles || ['Avanza Grand/FL', 'New Avanza', 'Innova Reborn', 'Hiace Komuter', 'Hiace Premio'];
        } else {
            transferMatrixData.areas = [];
            transferMatrixData.vehicles = ['Avanza Grand/FL', 'New Avanza', 'Innova Reborn', 'Hiace Komuter', 'Hiace Premio'];
        }
        toggleTransferMatrixVisibility();
        
        if (!item.terms || item.terms.trim() === "") {
            termsCategoryInput.value = "none";
            termsInput.value = "";
            termsCustomGroup.style.display = "none";
        } else if (item.terms === DEFAULT_CAR_TERMS || item.terms === DEFAULT_MOTOR_TERMS) {
            termsCategoryInput.value = "default";
            termsInput.value = "";
            termsCustomGroup.style.display = "none";
        } else {
            termsCategoryInput.value = "custom";
            termsInput.value = item.terms;
            termsCustomGroup.style.display = "block";
        }
        
        modalTitle.textContent = "Edit Item";
        openModal();
    } catch (error) {
        console.error("Error fetching item details:", error);
    }
};

window.deleteItem = async (id) => {
    if (!authToken) return Swal.fire({icon: 'info', title: 'Pemberitahuan', text: "Anda harus login!", confirmButtonColor: '#22c55e'});
    
    Swal.fire({
        title: 'Hapus Item?',
        text: "Apakah Anda yakin ingin menghapus item ini?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}/items/${id}`, { 
                    method: "DELETE",
                    headers: getAuthHeaders()
                });
                if (!res.ok) throw new Error("Delete failed");
                fetchAdminItems();
                Swal.fire({icon: 'success', title: 'Terhapus!', text: 'Item berhasil dihapus.', confirmButtonColor: '#22c55e'});
            } catch (error) {
                console.error("Error deleting item:", error);
                Swal.fire({icon: 'error', title: 'Gagal', text: "Error deleting item", confirmButtonColor: '#22c55e'});
            }
        }
    });
};

// Stats & Bookings logic
window.showTab = (tab) => {
    document.querySelectorAll(".sidebar-menu a").forEach(el => el.classList.remove("active"));
    event.currentTarget.classList.add("active");
    document.querySelector('.admin-sidebar').classList.remove('active');
    
    document.getElementById("items-section").style.display = "none";
    document.getElementById("stats-section").style.display = "none";
    const analyticsSection = document.getElementById("analytics-section");
    if (analyticsSection) analyticsSection.style.display = "none";
    const aiChatsSection = document.getElementById("ai-chats-section");
    if (aiChatsSection) aiChatsSection.style.display = "none";
    const aiKnowledgeSection = document.getElementById("ai-knowledge-section");
    if (aiKnowledgeSection) aiKnowledgeSection.style.display = "none";
    document.getElementById("bookings-section").style.display = "none";
    document.getElementById("orders-section").style.display = "none";
    document.getElementById("web-bookings-section").style.display = "none";
    document.getElementById("gallery-section").style.display = "none";
    const reviewsSection = document.getElementById("reviews-section");
      if (reviewsSection) reviewsSection.style.display = "none";
    const itemReviewsSection = document.getElementById("item-reviews-section");
      if (itemReviewsSection) itemReviewsSection.style.display = "none";
      const promosSection = document.getElementById("promos-section");
      if (promosSection) promosSection.style.display = "none";
      const blogsSection = document.getElementById("blogs-section");
      if (blogsSection) blogsSection.style.display = "none";
    document.getElementById("withdrawal-section").style.display = "none";
    document.getElementById("settings-section").style.display = "none";
    const usersSection = document.getElementById("users-section");
    if (usersSection) usersSection.style.display = "none";
    const loginLogsSection = document.getElementById("login-logs-section");
    if (loginLogsSection) loginLogsSection.style.display = "none";
    document.getElementById("drivers-section").style.display = "none";
    document.getElementById("guide-item-btn").style.display = "none";
    document.getElementById("add-item-btn").style.display = "none";
    document.getElementById("add-booking-btn").style.display = "none";
    document.getElementById("add-gallery-btn").style.display = "none";
    document.getElementById("add-driver-btn").style.display = "none";
      const addPromoBtn = document.getElementById("add-promo-btn");
      if (addPromoBtn) addPromoBtn.style.display = "none";
      const addBlogBtn = document.getElementById("add-blog-btn");
      if (addBlogBtn) addBlogBtn.style.display = "none";
    
    if (tab === "items") {
        document.getElementById("items-section").style.display = "block";
        document.getElementById("guide-item-btn").style.display = "inline-block";
        document.getElementById("add-item-btn").style.display = "inline-block";
    } else if (tab === "bookings") {
        document.getElementById("bookings-section").style.display = "block";
        document.getElementById("add-booking-btn").style.display = "inline-block";
        fetchAdminBookings();
    } else if (tab === "orders") {
        document.getElementById("orders-section").style.display = "block";
        fetchAdminBookings();
    } else if (tab === "web-bookings") {
        document.getElementById("web-bookings-section").style.display = "block";
        fetchAdminBookings();
    } else if (tab === "stats") {
        document.getElementById("stats-section").style.display = "block";
        fetchAdminStats();
    } else if (tab === "analytics") {
        const analyticsSection = document.getElementById("analytics-section");
        if (analyticsSection) {
            analyticsSection.style.display = "block";
            fetchVisitorAnalytics();
        }
    } else if (tab === "ai-chats") {
        const aiChatsSection = document.getElementById("ai-chats-section");
        if (aiChatsSection) {
            aiChatsSection.style.display = "block";
            fetchAdminAiChats();
        }
    } else if (tab === "ai-knowledge") {
        const aiKnowledgeSection = document.getElementById("ai-knowledge-section");
        if (aiKnowledgeSection) {
            aiKnowledgeSection.style.display = "block";
            fetchAiKnowledgeBase();
        }
    } else if (tab === "gallery") {
        document.getElementById("gallery-section").style.display = "block";
        document.getElementById("add-gallery-btn").style.display = "inline-block";
        fetchAdminGallery();
    } else if (tab === "reviews") {
        const reviewsSection = document.getElementById("reviews-section");
        if (reviewsSection) reviewsSection.style.display = "block";
        fetchAdminReviews();
    } else if (tab === "item-reviews") {
        const itemReviewsSection = document.getElementById("item-reviews-section");
        if (itemReviewsSection) itemReviewsSection.style.display = "block";
        fetchAdminItemReviews();
    } else if (tab === "promos") {
          const promosSection = document.getElementById("promos-section");
          if (promosSection) promosSection.style.display = "block";
          const addPromoBtn = document.getElementById("add-promo-btn");
          if (addPromoBtn) addPromoBtn.style.display = "inline-block";
          if (typeof loadPromos === 'function') loadPromos();
      } else if (tab === "blogs") {
          const blogsSection = document.getElementById("blogs-section");
          if (blogsSection) blogsSection.style.display = "block";
          const addBlogBtn = document.getElementById("add-blog-btn");
          if (addBlogBtn) addBlogBtn.style.display = "inline-block";
          if (typeof loadBlogs === 'function') loadBlogs();
      } else if (tab === "withdrawals") {
        document.getElementById("withdrawal-section").style.display = "block";
        fetchWithdrawals();
    } else if (tab === "drivers") {
        document.getElementById("drivers-section").style.display = "block";
        document.getElementById("add-driver-btn").style.display = "inline-block";
        fetchAdminDrivers();
    } else if (tab === "settings") {
        document.getElementById("settings-section").style.display = "block";
        fetchGlobalSettings();
    } else if (tab === "users") {
        const usersSection = document.getElementById("users-section");
        if (usersSection) usersSection.style.display = "block";
        fetchAdminUsers();
    } else if (tab === "login-logs") {
        const loginLogsSection = document.getElementById("login-logs-section");
        if (loginLogsSection) loginLogsSection.style.display = "block";
        fetchLoginLogs();
    }
};

const fetchAdminBookings = async () => {
    const bookingsTableBody = document.getElementById("admin-bookings-table");
    const ordersTableBody = document.getElementById("admin-orders-table");
    const webBookingsTableBody = document.getElementById("admin-web-bookings-table");
    
    try {
        const response = await fetch(`${API_URL}/bookings`, {
            headers: getAuthHeaders()
        });
        const allBookings = await response.json();
        
        // Filter
        const manualBookings = allBookings.filter(b => b.transactionId && b.transactionId.startsWith('MANUAL'));
        const webOrders = allBookings.filter(b => b.transactionId && b.transactionId.startsWith('ORD-'));
        const webBookings = allBookings.filter(b => !b.transactionId || b.transactionId.startsWith('BKG-'));
        
        // Helper renderer
        const renderRows = (bookingsArray, emptyMsg, tableElem) => {
            if (bookingsArray.length === 0) {
                tableElem.innerHTML = `<tr><td colspan="6" class="text-center">${emptyMsg}</td></tr>`;
            } else {
                tableElem.innerHTML = bookingsArray.map(b => {
                    let statusColor = '#64748b';
                    if (b.status === 'PAID') statusColor = 'var(--primary-green)';
                    if (b.status === 'PENDING') statusColor = '#f59e0b';
                    if (b.status === 'PROCESSING') statusColor = '#3b82f6';
                    if (b.status === 'COMPLETED') statusColor = '#10b981';
                    
                    const trxId = b.transactionId || b.id.substring(0, 8);
                    const orderDateStr = b.createdAt ? new Date(b.createdAt).toLocaleString('id-ID') : '-';
                    const waNumber = b.phone ? b.phone.replace(/[^0-9]/g, '') : '';
                    const cleanWa = waNumber.startsWith('0') ? '62' + waNumber.substring(1) : waNumber;
                    const startDateStr = new Date(b.startDate).toLocaleDateString('id-ID');
                    const waMsg = encodeURIComponent(
`Assalamu'alaikum Wr. Wb. / Selamat ${new Date().getHours() < 11 ? 'Pagi' : new Date().getHours() < 15 ? 'Siang' : new Date().getHours() < 19 ? 'Sore' : 'Malam'}, Bapak/Ibu *${b.customerName}* 🙏

Kami dari *Travel Lombok Airport* ingin menginformasikan detail pesanan Anda berikut ini:

〰〰〰 📋 *DETAIL PESANAN* 〰〰〰

🆔 *ID Transaksi:*
${trxId}

🛎️ *Layanan:*
${b.itemName}

📅 *Tanggal Mulai:*
${startDateStr}

〰〰〰〰〰〰〰〰〰〰〰〰〰〰

Apabila Bapak/Ibu memiliki pertanyaan, ingin mengkonfirmasi jadwal, atau ada hal lain yang perlu disampaikan, jangan ragu untuk membalas pesan ini.

Terima kasih telah mempercayakan perjalanan Anda kepada kami. 🌴

Salam hangat,
- *Admin Travel Lombok Airport* -

📞 +62 896-7696-3255 (WhatsApp)
🌐 www.travellombokairport.com`);
                    const assignDriverBtn = `<button class="action-btn btn-edit" onclick="assignDriver('${b.id}')" style="margin-top: 5px; background: var(--primary-green); color: white;"><i class="fa-solid fa-car"></i> Assign Supir</button>`;
                    
                    return `
                    <tr>
                        <td style="font-size: 0.85rem; color: #475569; white-space: nowrap;">
                            <i class="fa-regular fa-clock"></i> ${orderDateStr}
                        </td>
                        <td>
                            <strong style="color:var(--primary-blue); font-size: 0.9rem;">${trxId}</strong>
                            <i class="fa-regular fa-copy" onclick="navigator.clipboard.writeText('${trxId}'); Swal.fire({toast:true, position:'top-end', icon:'success', title:'ID disalin!', showConfirmButton:false, timer:1500})" style="cursor:pointer; color:#94a3b8; transition:color 0.2s; margin-left:4px;" onmouseover="this.style.color='var(--primary-blue)'" onmouseout="this.style.color='#94a3b8'" title="Salin ID"></i>
                            <br><small>${startDateStr} - ${new Date(b.endDate).toLocaleDateString('id-ID')}</small>
                        </td>
                        <td>
                            <strong>${b.itemName}</strong>
                            ${b.details?.pickup ? `<br><small style="color: #64748b; font-size: 0.75rem;"><b>Pickup:</b> ${b.details.pickup}</small>` : ''}
                            ${b.details?.dropoff ? `<br><small style="color: #64748b; font-size: 0.75rem;"><b>Drop-off:</b> ${b.details.dropoff}</small>` : ''}
                            ${b.details?.flightNumber ? `<br><small style="color: #64748b; font-size: 0.75rem;"><b>Flight:</b> ${b.details.flightNumber}</small>` : ''}
                            ${b.details?.pax ? `<br><small style="color: #64748b; font-size: 0.75rem;"><b>Pax:</b> ${b.details.pax}</small>` : ''}
                            ${b.details?.vehicle ? `<br><small style="color: #64748b; font-size: 0.75rem;"><b>Vehicle:</b> ${b.details.vehicle}</small>` : ''}
                            ${b.details?.notes ? `<br><small style="color: #64748b; font-size: 0.75rem;"><b>Notes:</b> ${b.details.notes}</small>` : ''}
                        </td>
                        <td>${b.customerName}<br>
                            <small>
                                <a href="https://wa.me/${cleanWa}?text=${waMsg}" target="_blank" style="color: #10b981; text-decoration: none; font-weight: bold;">
                                    <i class="fa-brands fa-whatsapp"></i> ${b.phone}
                                </a>
                                <br>${assignDriverBtn}
                            </small>
                        </td>
                        <td><span style="background: ${statusColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${b.status}</span></td>
                        <td>
                            <select onchange="updateOrderStatus('${b.id}', this.value)" style="padding: 4px; border-radius: 4px; font-size: 0.8rem; margin-bottom: 5px;">
                                <option value="">Ubah Status...</option>
                                <option value="PAID">Konfirmasi (PAID)</option>
                                <option value="PENDING">Menunggu (PENDING)</option>
                                <option value="PROCESSING">Sedang Proses</option>
                                <option value="COMPLETED">Close (Selesai)</option>
                            </select>
                            <button class="action-btn btn-delete" onclick="deleteBooking('${b.id}')"><i class="fa-solid fa-trash"></i> Hapus</button>
                        </td>
                    </tr>
                    `;
                }).join('');
            }
        };

        renderRows(manualBookings, "Belum ada jadwal manual.", bookingsTableBody);
        renderRows(webOrders, "Belum ada pesanan web (Paket Tour).", ordersTableBody);
        renderRows(webBookings, "Belum ada booking web (Quick Booking).", webBookingsTableBody);
        
    } catch (error) {
        console.error("Error fetching bookings:", error);
        bookingsTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Gagal memuat jadwal.</td></tr>`;
        ordersTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Gagal memuat pesanan.</td></tr>`;
        webBookingsTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Gagal memuat booking.</td></tr>`;
    }
};

window.deleteBooking = async (id) => {
    if (!authToken) return Swal.fire({icon: 'info', title: 'Pemberitahuan', text: "Anda harus login!", confirmButtonColor: '#22c55e'});
    
    Swal.fire({
        title: 'Hapus Jadwal?',
        text: "Anda yakin ingin menghapus jadwal ini?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}/bookings/${id}`, { 
                    method: "DELETE",
                    headers: getAuthHeaders()
                });
                if (!res.ok) throw new Error("Delete failed");
                fetchAdminBookings();
                Swal.fire({icon: 'success', title: 'Terhapus!', text: 'Jadwal berhasil dihapus.', confirmButtonColor: '#22c55e'});
            } catch (error) {
                console.error("Error deleting booking:", error);
                Swal.fire({icon: 'error', title: 'Gagal', text: "Error deleting booking", confirmButtonColor: '#22c55e'});
            }
        }
    });
};

window.updateOrderStatus = async (id, status) => {
    if (!authToken) return Swal.fire({icon: 'info', title: 'Pemberitahuan', text: "Anda harus login!", confirmButtonColor: '#22c55e'});
    if (!status) return; // User selected "Ubah Status..."
    
    Swal.fire({
        title: 'Ubah Status',
        text: `Anda yakin ingin mengubah status pesanan ini menjadi ${status}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#22c55e',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Ubah!',
        cancelButtonText: 'Batal'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}/bookings/${id}/status`, { 
                    method: "PUT",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ status })
                });
                if (!res.ok) throw new Error("Update status failed");
                fetchAdminBookings();
                Swal.fire({icon: 'success', title: 'Berhasil', text: 'Status pesanan telah diubah.', confirmButtonColor: '#22c55e'});
            } catch (error) {
                console.error("Error updating status:", error);
                Swal.fire({icon: 'error', title: 'Gagal', text: "Gagal mengubah status pesanan. Pastikan server backend sudah di-restart.", confirmButtonColor: '#22c55e'});
            }
        } else {
            // Reset dropdown if cancelled
            fetchAdminBookings();
        }
    });
};

const fetchAdminStats = async () => {
    try {
        const res = await fetch(`${API_URL}/stats`);
        const stats = await res.json();
        document.getElementById("stat-customers").value = stats.customers || "500+";
        document.getElementById("stat-fleet").value = stats.fleet || "20+";
        document.getElementById("stat-trips").value = stats.trips || "100+";
        document.getElementById("stat-support").value = stats.support || "24/7";
    } catch (e) {
        console.error(e);
    }
};

window.showAdminTutorial = () => {
    Swal.fire({
        title: '<strong style="color: #1e293b; font-size: 1.5rem;">Panduan Lengkap Panel Admin</strong>',
        html: `
            <style>
                .tutorial-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 15px;
                    max-height: 60vh;
                    overflow-y: auto;
                    padding-right: 10px;
                }
                @media (min-width: 600px) {
                    .tutorial-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }
                .tutorial-card {
                    padding: 15px;
                    border-radius: 12px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    text-align: left;
                    display: flex;
                    flex-direction: column;
                }
                .tutorial-card h4 {
                    margin: 0 0 8px 0;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .tutorial-card p {
                    margin: 0;
                    font-size: 0.85rem;
                    line-height: 1.5;
                    flex-grow: 1;
                    color: #475569;
                }
                /* Custom Scrollbar for the tutorial */
                .tutorial-grid::-webkit-scrollbar {
                    width: 6px;
                }
                .tutorial-grid::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 4px;
                }
                .tutorial-grid::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
            </style>
            <div style="text-align: left; font-size: 0.9rem; color: #475569;">
                <p style="margin-bottom: 20px; text-align: center;">Selamat datang di Pusat Kendali Travel Anda. Berikut panduan lengkap untuk setiap menu:</p>
                
                <div class="tutorial-grid">
                    <div class="tutorial-card" style="background: #eff6ff; border-left: 5px solid #3b82f6;">
                        <h4 style="color: #1e40af;"><i class="fa-solid fa-list"></i> 1. Manage Items</h4>
                        <p>Menu untuk mengatur "Etalase" website Anda. Di sini Anda dapat <strong>menambahkan, mengedit, atau menghapus</strong> daftar armada mobil, motor, dan paket tour yang ditampilkan kepada pelanggan beserta harganya.</p>
                    </div>

                    <div class="tutorial-card" style="background: #fdf4ff; border-left: 5px solid #d946ef;">
                        <h4 style="color: #86198f;"><i class="fa-solid fa-shopping-cart"></i> 2. Pesanan Web (Order)</h4>
                        <p>Menampilkan riwayat pesanan (Paket Tour) yang melakukan pembayaran otomatis via QRIS. Jika statusnya "PAID", pesanan sudah lunas. Anda bisa melihat bukti dan detail pesanan tamu di sini.</p>
                    </div>

                    <div class="tutorial-card" style="background: #e0f2fe; border-left: 5px solid #0ea5e9;">
                        <h4 style="color: #0369a1;"><i class="fa-solid fa-laptop"></i> 3. Booking Web</h4>
                        <p>Semua request booking rental kendaraan atau antar-jemput yang masuk dari website akan muncul di sini. Di sini Anda <strong>WAJIB menugaskan supir</strong> (Assign Supir) agar pesanan dapat diproses oleh driver.</p>
                    </div>

                    <div class="tutorial-card" style="background: #fff7ed; border-left: 5px solid #f97316;">
                        <h4 style="color: #9a3412;"><i class="fa-solid fa-calendar-alt"></i> 4. Jadwal Manual</h4>
                        <p>Gunakan menu ini jika Anda mendapat pesanan dari telepon/WA (offline). Input data tamu secara manual ke sistem agar jadwal supir/armada tidak bentrok dengan pesanan dari website.</p>
                    </div>

                    <div class="tutorial-card" style="background: #f8fafc; border-left: 5px solid #64748b;">
                        <h4 style="color: #334155;"><i class="fa-solid fa-camera"></i> 5. Kelola Galeri</h4>
                        <p>Tempat untuk mengunggah foto-foto dokumentasi perjalanan atau armada. Foto yang diunggah di sini akan otomatis tampil di halaman "Galeri" pada website utama.</p>
                    </div>

                    <div class="tutorial-card" style="background: #f0fdf4; border-left: 5px solid #22c55e;">
                        <h4 style="color: #166534;"><i class="fa-solid fa-car"></i> 6. Manajemen Supir</h4>
                        <p>Tempat mendaftarkan tim supir. Masukkan <strong>Nomor HP</strong> dan buat <strong>PIN 6 Angka</strong>. Nomor dan PIN ini akan digunakan oleh supir untuk login ke portal Driver mereka.</p>
                    </div>

                    <div class="tutorial-card" style="background: #fef2f2; border-left: 5px solid #ef4444;">
                        <h4 style="color: #991b1b;"><i class="fa-solid fa-star"></i> 7. Kelola Ulasan</h4>
                        <p>Memantau review atau ulasan yang diberikan oleh pelanggan di website. Anda bisa menghapus ulasan yang spam atau tidak pantas agar tidak tampil di publik.</p>
                    </div>

                    <div class="tutorial-card" style="background: #f0fdfa; border-left: 5px solid #14b8a6;">
                        <h4 style="color: #115e59;"><i class="fa-solid fa-money-bill-wave"></i> 8. Penarikan Dana</h4>
                        <p>Pusat keuangan Anda. Semua pendapatan dari tamu via pembayaran online masuk ke Saldo Aktif. Tarik uang ke rekening pribadi dengan menekan tombol <strong>Ajukan Penarikan</strong>.</p>
                    </div>

                    <div class="tutorial-card" style="background: #fffbeb; border-left: 5px solid #f59e0b;">
                        <h4 style="color: #b45309;"><i class="fa-solid fa-chart-bar"></i> 9. Statistik Web</h4>
                        <p>Atur angka statistik yang tampil di halaman utama website, seperti jumlah "Customer Puas", "Armada Terawat", atau "Trip Selesai" untuk meyakinkan calon pelanggan.</p>
                    </div>

                    <div class="tutorial-card" style="background: #f3f4f6; border-left: 5px solid #9ca3af;">
                        <h4 style="color: #374151;"><i class="fa-solid fa-cog"></i> 10. Pengaturan Global</h4>
                        <p>Menu untuk menghidupkan/mematikan fitur di website (misal: fitur Sewa Drone), serta mengelola video portofolio hasil dokumentasi drone Anda.</p>
                    </div>
                </div>
            </div>
        `,
        width: 800,
        icon: 'info',
        confirmButtonText: '<i class="fa-solid fa-check-circle"></i> Saya Mengerti',
        confirmButtonColor: '#2563eb',
        padding: '2em',
        background: '#ffffff',
        backdrop: `rgba(15, 23, 42, 0.8)`
    }).then(() => {
        localStorage.setItem('adminTutorialSeen', 'true');
    });
};

window.showManageItemTutorial = () => {
    Swal.fire({
        title: '<strong style="color: #1e293b; font-size: 1.5rem;">Panduan Kelola & Tambah Item</strong>',
        html: `
            <div style="text-align: left; font-size: 0.9rem; color: #475569; max-height: 65vh; overflow-y: auto; padding-right: 10px;">
                <p>Bagian ini sangat penting karena data yang Anda masukkan di sini akan <strong>langsung tampil di website utama</strong> yang dilihat oleh pelanggan.</p>
                
                <h4 style="color: #2563eb; margin-top: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;"><i class="fa-solid fa-wand-magic-sparkles"></i> A. AI Auto-Fill (Otomatis Isi)</h4>
                <p>Ini adalah asisten pintar untuk mempercepat kerja Anda. Jika Anda memiliki foto brosur (contoh: brosur Paket Tour Lombok), Anda bisa mengunggahnya di sini. Klik tombol <strong>Scan dengan AI</strong>, maka AI akan secara otomatis membaca teks di gambar brosur tersebut dan mengisikan Judul, Harga, Deskripsi, dan Fitur secara otomatis untuk Anda. Sangat menghemat waktu!</p>

                <h4 style="color: #2563eb; margin-top: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;"><i class="fa-solid fa-layer-group"></i> B. Kategori (Category) & Folder</h4>
                <p>Pilih kategori yang tepat agar item muncul di bagian yang benar pada website:</p>
                <ul style="margin-top: 5px; padding-left: 20px;">
                    <li><strong>cars:</strong> Akan tampil di bagian "Sewa Mobil".</li>
                    <li><strong>motorcycles:</strong> Akan tampil di bagian "Sewa Motor".</li>
                    <li><strong>packages:</strong> Akan tampil di bagian "Paket Tour Populer".</li>
                    <li><strong>transfer:</strong> Akan tampil sebagai opsi untuk Jasa Antar Jemput Bandara.</li>
                    <li><strong>drone:</strong> Akan tampil di halaman layanan Dokumentasi Drone.</li>
                </ul>
                <p style="margin-top: 10px;"><strong>Fungsi "Jadikan sebagai Kategori/Paket Utama (Folder)":</strong><br>
                Centang ini HANYA JIKA Anda ingin membuat "Bungkus" atau "Induk" paket. Contoh: Anda mencentang ini lalu membuat judul "Paket Tour Gili". Saat pelanggan mengklik Paket Tour Gili, akan terbuka halaman baru yang berisi rincian (misal: Paket Tour Gili A, Paket Tour Gili B). Untuk membuat rinciannya, buat item baru dan pilih "Paket Tour Gili" di dropdown <em>"Masukkan ke dalam Paket Utama"</em>.</p>

                <h4 style="color: #2563eb; margin-top: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;"><i class="fa-solid fa-heading"></i> C. Judul (Title)</h4>
                <p>Ketikkan nama mobil, motor, atau nama paket tour secara jelas. Contoh: <em>Toyota Avanza Baru</em> atau <em>Paket Gili Trawangan 3D2N</em>. Untuk kategori tour, akan ada pilihan cepat otomatis seperti "Paket A", "Paket B" untuk mempercepat penulisan.</p>

                <h4 style="color: #2563eb; margin-top: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;"><i class="fa-solid fa-tag"></i> D. Harga (Price) & Durasi</h4>
                <p>Ketikkan angka harga <strong>tanpa titik/koma/Rp</strong>. Contoh: Jika harganya Rp 300.000, cukup ketikkan <strong>300000</strong>. Kolom di sebelahnya adalah untuk durasi (misal: <em>12 Jam</em>, <em>Per Hari</em>, <em>3 Hari 2 Malam</em>).</p>

                <h4 style="color: #2563eb; margin-top: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;"><i class="fa-solid fa-list-check"></i> E. Fitur / Detail Tambahan</h4>
                <p>Ini adalah poin-poin fasilitas atau spesifikasi. (Misal: <em>5 Kursi, AC Dingin, Termasuk Supir</em>).<br>
                <strong>Cara Penulisan:</strong> Wajib pisahkan setiap poin dengan tanda koma. <br>
                <em>Contoh:</em> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #ef4444;">Termasuk Supir, BBM, Mineral Water</code></p>

                <h4 style="color: #2563eb; margin-top: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;"><i class="fa-solid fa-image"></i> F. Link Gambar (Image URL)</h4>
                <p>Ini adalah alamat foto/gambar yang akan ditampilkan sebagai *thumbnail* utama.</p>
                <ul style="margin-top: 5px; padding-left: 20px;">
                    <li><strong>Cara Terbaik:</strong> Anda bisa menggunakan menu <strong>Kelola Galeri</strong> (di menu samping) untuk meng-upload foto dari perangkat Anda. Setelah terupload, klik "Copy URL", lalu Paste/Tempel di kolom Image URL ini.</li>
                    <li>Atau Anda bisa men-copy link gambar (Copy Image Address) dari Google atau website lain.</li>
                </ul>

                <h4 style="color: #2563eb; margin-top: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;"><i class="fa-solid fa-pen-to-square"></i> G. Edit & Hapus</h4>
                <p>Setelah item ditambahkan, Anda bisa melihatnya di daftar. Anda bisa menekan tombol warna <span style="color: #f59e0b; font-weight: bold;">Kuning (Edit)</span> pada tabel untuk mengubah harga atau foto, atau tombol <span style="color: #ef4444; font-weight: bold;">Merah (Hapus)</span> jika armada/paket tersebut sudah tidak tersedia lagi.</p>
            </div>
        `,
        width: 700,
        icon: 'info',
        confirmButtonText: '<i class="fa-solid fa-check"></i> Siap, Paham!',
        confirmButtonColor: '#2563eb',
        padding: '2em'
    });
};

document.getElementById("stats-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!authToken) return Swal.fire({icon: 'info', title: 'Pemberitahuan', text: "Anda harus login!", confirmButtonColor: '#22c55e'});
    const stats = {
        customers: document.getElementById("stat-customers").value,
        fleet: document.getElementById("stat-fleet").value,
        trips: document.getElementById("stat-trips").value,
        support: document.getElementById("stat-support").value
    };
    try {
        const res = await fetch(`${API_URL}/stats`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(stats)
        });
        if(res.ok) Swal.fire({icon: 'info', title: 'Pemberitahuan', text: "Statistik berhasil disimpan!", confirmButtonColor: '#22c55e'});
        else Swal.fire({icon: 'info', title: 'Pemberitahuan', text: "Gagal menyimpan statistik.", confirmButtonColor: '#22c55e'});
    } catch (e) {
        console.error(e);
        Swal.fire({icon: 'info', title: 'Pemberitahuan', text: "Gagal menyimpan statistik.", confirmButtonColor: '#22c55e'});
    }
});

// Gallery Logic
window.fetchAdminGallery = async () => {
    try {
        const response = await fetch(`${API_URL}/gallery`);
        const gallery = await response.json();
        const list = document.getElementById("gallery-list");
        list.innerHTML = "";
        
        if(gallery.length === 0) {
            list.innerHTML = `<tr><td colspan="4" class="text-center">Belum ada foto galeri.</td></tr>`;
            return;
        }
        
        gallery.forEach(item => {
            list.innerHTML += `
                <tr>
                    <td><img src="${item.imageUrl}" alt="${item.title}" style="width: 100px; height: 60px; object-fit: cover; border-radius: 4px;"></td>
                    <td><strong>${item.title}</strong><br><small>${item.description || ''}</small></td>
                    <td>${item.date}</td>
                    <td>
                        <button class="btn btn-sm" style="background: #ef4444; color: white;" onclick="deleteGallery('${item.id}')"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
    } catch (e) {
        console.error("Error fetching gallery:", e);
    }
};

document.getElementById("add-gallery-btn").addEventListener("click", () => {
    Swal.fire({
        title: 'Tambah Foto Galeri',
        html: `
            <div style="display: flex; gap: 10px; margin: 1em auto; justify-content: center; width: 100%; max-width: 100%; box-sizing: border-box; align-items: center;">
              <input id="swal-g-img" class="swal2-input" placeholder="URL Gambar (JPG/PNG)" style="margin: 0; flex: 1; width: auto;">
              <input type="file" id="swal-g-img-upload" accept="image/*" style="display: none;" onchange="uploadImageToServer(this, 'swal-g-img')">
              <button type="button" class="swal2-confirm swal2-styled" style="margin: 0; background-color: transparent; color: #3b82f6; border: 1px solid #3b82f6; width: auto; padding: 0 15px; height: 3.375em; white-space: nowrap;" onclick="document.getElementById('swal-g-img-upload').click()"><i class="fa-solid fa-cloud-arrow-up"></i> Upload</button>
            </div>
            <input id="swal-g-title" class="swal2-input" placeholder="Judul (contoh: Trip Gili Trawangan)">
            <input id="swal-g-desc" class="swal2-input" placeholder="Deskripsi Singkat (Opsional)">
            <input id="swal-g-date" type="date" class="swal2-input">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Simpan',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#22c55e',
        preConfirm: () => {
            const imageUrl = document.getElementById('swal-g-img').value;
            const title = document.getElementById('swal-g-title').value;
            const description = document.getElementById('swal-g-desc').value;
            const date = document.getElementById('swal-g-date').value;
            
            if (!imageUrl || !title || !date) {
                Swal.showValidationMessage('Semua kolom (kecuali deskripsi) harus diisi!');
                return false;
            }
            return { imageUrl, title, description, date };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}/gallery`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(result.value)
                });
                if (res.ok) {
                    Swal.fire({icon: 'success', title: 'Tersimpan!', text: 'Foto berhasil ditambahkan ke galeri.', confirmButtonColor: '#22c55e'});
                    fetchAdminGallery();
                } else {
                    throw new Error('Gagal menambah galeri');
                }
            } catch (e) {
                Swal.fire({icon: 'error', title: 'Gagal', text: 'Gagal menambahkan foto.', confirmButtonColor: '#22c55e'});
            }
        }
    });
});

window.deleteGallery = async (id) => {
    Swal.fire({
        title: 'Hapus Foto?',
        text: "Anda yakin ingin menghapus foto ini dari galeri?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}/gallery/${id}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                if (res.ok) {
                    Swal.fire({icon: 'success', title: 'Terhapus!', text: 'Foto berhasil dihapus.', confirmButtonColor: '#22c55e'});
                    fetchAdminGallery();
                }
            } catch (e) {
                Swal.fire({icon: 'error', title: 'Gagal', text: 'Gagal menghapus foto.', confirmButtonColor: '#22c55e'});
            }
        }
    });
};

// Withdrawal Logic
let currentBalance = 0;

window.fetchWithdrawals = async () => {
    try {
        // Cek apakah admin utama
        const currentAdminEmail = localStorage.getItem('adminEmail');
        const isMainAdmin = currentAdminEmail === 'ridhosandhika18022022@gmail.com';
        
        // Show/hide table headers
        if (isMainAdmin) {
            document.getElementById('th-admin-email').style.display = 'table-cell';
            document.getElementById('th-admin-aksi').style.display = 'table-cell';
        } else {
            document.getElementById('th-admin-email').style.display = 'none';
            document.getElementById('th-admin-aksi').style.display = 'none';
        }
        
        // Fetch all bookings to calculate revenue
        const bReq = await fetch(`${API_URL}/bookings`, { headers: getAuthHeaders() });
        const bookings = await bReq.json();
        
        let totalRevenue = 0;
        bookings.forEach(b => {
            if (b.status === 'PAID' || b.status === 'COMPLETED') {
                totalRevenue += (b.price || 0);
            }
        });
        
        // Fetch withdrawals
        const wReq = await fetch(`${API_URL}/withdrawals`, { headers: getAuthHeaders() });
        const withdrawals = await wReq.json();
        
        let totalWithdrawn = 0;
        const list = document.getElementById("withdrawal-list");
        list.innerHTML = "";
        
        if (withdrawals.length === 0) {
            const colspan = isMainAdmin ? 7 : 5;
            list.innerHTML = `<tr><td colspan="${colspan}" class="text-center">Belum ada riwayat penarikan.</td></tr>`;
        } else {
            withdrawals.forEach(w => {
                if (w.status !== 'REJECTED') totalWithdrawn += (w.amount || 0);
                
                let statusBadge = '';
                if (w.status === 'PENDING') statusBadge = '<span style="background: #f59e0b; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">Pending</span>';
                if (w.status === 'COMPLETED') statusBadge = '<span style="background: #10b981; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">Selesai</span>';
                if (w.status === 'REJECTED') statusBadge = '<span style="background: #ef4444; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">Ditolak</span>';
                
                let actions = '';
                if (isMainAdmin && w.status === 'PENDING') {
                    actions = `
                        <button onclick="updateWithdrawalStatus('${w.id}', 'COMPLETED')" class="btn" style="background: #10b981; color: white; padding: 4px 8px; font-size: 0.8rem; border: none; border-radius: 4px; margin-right: 4px;">Terima</button>
                        <button onclick="updateWithdrawalStatus('${w.id}', 'REJECTED')" class="btn" style="background: #ef4444; color: white; padding: 4px 8px; font-size: 0.8rem; border: none; border-radius: 4px;">Tolak</button>
                    `;
                }
                
                list.innerHTML += `
                    <tr>
                        <td>${w.id.substring(0,8)}</td>
                        ${isMainAdmin ? `<td><small style="color: #475569;">${w.adminEmail || '-'}</small></td>` : ''}
                        <td>${new Date(w.createdAt?._seconds ? w.createdAt._seconds * 1000 : (w.createdAt || Date.now())).toLocaleDateString('id-ID')}</td>
                        <td><strong>${w.bankName}</strong><br><small>${w.accountNumber}</small></td>
                        <td>Rp ${w.amount.toLocaleString('id-ID')}</td>
                        <td>${statusBadge}</td>
                        ${isMainAdmin ? `<td>${actions}</td>` : ''}
                    </tr>
                `;
            });
        }
        
        currentBalance = totalRevenue - totalWithdrawn;
        document.getElementById("total-balance-display").innerText = `Rp ${currentBalance.toLocaleString('id-ID')}`;
        
    } catch (e) {
        console.error("Error fetching withdrawals:", e);
        document.getElementById("withdrawal-list").innerHTML = `<tr><td colspan="7" class="text-center text-danger">Gagal memuat data penarikan.</td></tr>`;
    }
};

window.updateWithdrawalStatus = async (id, status) => {
    try {
        const result = await Swal.fire({
            title: status === 'COMPLETED' ? 'Setujui Penarikan?' : 'Tolak Penarikan?',
            text: status === 'COMPLETED' ? 'Pastikan Anda telah mentransfer dana ke rekening yang dituju.' : 'Penarikan ini akan dibatalkan.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: status === 'COMPLETED' ? '#10b981' : '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Lanjutkan',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            Swal.fire({title: 'Memproses...', allowOutsideClick: false, didOpen: () => {Swal.showLoading()}});
            const res = await fetch(`${API_URL}/withdrawals/${id}/status`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            
            if (res.ok) {
                Swal.fire('Berhasil!', data.message, 'success');
                fetchWithdrawals();
            } else {
                throw new Error(data.error || 'Gagal mengubah status');
            }
        }
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
};

document.getElementById("btn-request-withdrawal").addEventListener("click", () => {
    if (currentBalance < 100000) {
        return Swal.fire({icon: 'warning', title: 'Saldo Tidak Cukup', text: 'Minimal penarikan adalah Rp 100.000', confirmButtonColor: '#22c55e'});
    }
    
    Swal.fire({
        title: 'Ajukan Penarikan Dana',
        html: `
            <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 15px;">Saldo maksimal yang bisa ditarik: <strong>Rp ${currentBalance.toLocaleString('id-ID')}</strong></p>
            <input id="swal-w-bank" class="swal2-input" placeholder="Nama Bank (misal: BCA, Mandiri)">
            <input id="swal-w-acc" class="swal2-input" placeholder="Nomor Rekening">
            <input id="swal-w-name" class="swal2-input" placeholder="Nama Pemilik Rekening">
            <input id="swal-w-amount" type="number" class="swal2-input" placeholder="Jumlah Penarikan (Min: 100000)">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Ajukan',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#10b981',
        preConfirm: () => {
            const bankName = document.getElementById('swal-w-bank').value;
            const accountNumber = document.getElementById('swal-w-acc').value;
            const accountName = document.getElementById('swal-w-name').value;
            const amount = parseInt(document.getElementById('swal-w-amount').value);
            
            if (!bankName || !accountNumber || !accountName || !amount) {
                Swal.showValidationMessage('Semua kolom harus diisi!');
                return false;
            }
            if (amount < 100000) {
                Swal.showValidationMessage('Minimal penarikan Rp 100.000!');
                return false;
            }
            if (amount > currentBalance) {
                Swal.showValidationMessage('Saldo tidak mencukupi!');
                return false;
            }
            return { bankName, accountNumber, accountName, amount };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({title: 'Memproses...', allowOutsideClick: false, didOpen: () => {Swal.showLoading()}});
            try {
                const res = await fetch(`${API_URL}/withdrawals`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(result.value)
                });
                const data = await res.json();
                if (res.ok) {
                    Swal.fire({icon: 'success', title: 'Berhasil Diajukan', text: 'Penarikan dana Anda akan diproses maksimal dalam 3 hari kerja.', confirmButtonColor: '#22c55e'});
                    fetchWithdrawals();
                } else {
                    throw new Error(data.error || 'Gagal mengajukan penarikan');
                }
            } catch (e) {
                Swal.fire({icon: 'error', title: 'Gagal', text: e.message, confirmButtonColor: '#22c55e'});
            }
        }
    });
});

// === Drivers Logic ===
window.fetchAdminDrivers = async () => {
    try {
        const res = await fetch(`${API_URL}/drivers`, { headers: getAuthHeaders() });
        const tbody = document.getElementById('admin-drivers-table');
        if (!res.ok) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">Gagal memuat supir</td></tr>';
            return;
        }
        const drivers = await res.json();
        window.allDrivers = drivers; // Save globally for dropdowns
        
        if (drivers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">Belum ada supir terdaftar.</td></tr>';
            return;
        }
        
        let html = '';
        drivers.forEach(d => {
            html += `<tr>
                <td style="font-weight:600;">${d.name}</td>
                <td>${d.phone}</td>
                <td style="font-family:monospace; font-size:1.1rem; color:var(--primary-blue);">${d.pin}</td>
                <td>
                    <button class="btn" style="background:#fee2e2; color:#ef4444; padding:5px 10px; font-size:0.8rem;" onclick="deleteDriver('${d.id}')"><i class="fa-solid fa-trash"></i> Hapus</button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    } catch (e) {
        console.error("Error fetching drivers", e);
    }
};

window.fetchAdminReviews = async () => {
    try {
        const res = await fetch(`${API_URL}/reviews`, { headers: getAuthHeaders() });
        const tbody = document.getElementById('admin-reviews-table');
        if (!tbody) return;
        if (!res.ok) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Gagal memuat ulasan</td></tr>';
            return;
        }
        
        let reviews = await res.json();
        reviews = reviews.filter(r => !r.itemId); // Only web reviews
        
        if (reviews.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Belum ada ulasan web.</td></tr>';
            return;
        }
        
        let html = '';
        reviews.forEach(r => {
            let dateStr = '-';
            if (r.createdAt) {
                const d = new Date(r.createdAt);
                dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            }
            let stars = '';
            for (let i = 0; i < 5; i++) {
                if (i < r.rating) stars += '<i class="fa-solid fa-star" style="color:#f59e0b;"></i>';
                else stars += '<i class="fa-regular fa-star" style="color:#cbd5e1;"></i>';
            }
            
            html += `<tr>
                <td>${dateStr}</td>
                <td style="font-weight:600;">${r.name}</td>
                <td>${stars}</td>
                <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${r.comment}">${r.comment}</td>
                <td>
                    <button class="btn" style="background:#fee2e2; color:#ef4444; padding:5px 10px; font-size:0.8rem;" onclick="deleteReview('${r.id}')"><i class="fa-solid fa-trash"></i> Hapus</button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    } catch (e) {
        console.error("Error fetching web reviews", e);
    }
};

window.fetchAdminItemReviews = async () => {
    try {
        const [res, itemsRes] = await Promise.all([
            fetch(`${API_URL}/reviews`, { headers: getAuthHeaders() }),
            fetch(`${API_URL}/items`)
        ]);
        
        const tbody = document.getElementById('admin-item-reviews-table');
        if (!tbody) return;
        if (!res.ok) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Gagal memuat ulasan item</td></tr>';
            return;
        }
        
        let reviews = await res.json();
        reviews = reviews.filter(r => r.itemId); // Only item reviews
        
        const items = itemsRes.ok ? await itemsRes.json() : [];
        const itemMap = {};
        items.forEach(item => itemMap[item.id] = item.title);
        
        if (reviews.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Belum ada ulasan item.</td></tr>';
            return;
        }
        
        let html = '';
        reviews.forEach(r => {
            let dateStr = '-';
            if (r.createdAt) {
                const d = new Date(r.createdAt);
                dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            }
            let stars = '';
            for (let i = 0; i < 5; i++) {
                if (i < r.rating) stars += '<i class="fa-solid fa-star" style="color:#f59e0b;"></i>';
                else stars += '<i class="fa-regular fa-star" style="color:#cbd5e1;"></i>';
            }
            
            const itemName = itemMap[r.itemId] || 'Item Tidak Diketahui';
            
            html += `<tr>
                <td>${dateStr}</td>
                <td style="font-size:0.9rem;">${itemName}</td>
                <td style="font-weight:600;">${r.name}</td>
                <td>${stars}</td>
                <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${r.comment}">${r.comment}</td>
                <td>
                    <button class="btn" style="background:#fee2e2; color:#ef4444; padding:5px 10px; font-size:0.8rem;" onclick="deleteReview('${r.id}')"><i class="fa-solid fa-trash"></i> Hapus</button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    } catch (e) {
        console.error("Error fetching item reviews", e);
    }
};

window.deleteReview = (id) => {
    Swal.fire({
        title: 'Hapus Ulasan?',
        text: 'Tindakan ini tidak dapat dibatalkan',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Ya, Hapus!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}/reviews/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
                if (res.ok) {
                    Swal.fire('Terhapus!', 'Ulasan telah dihapus.', 'success');
                    if (document.getElementById("reviews-section").style.display === "block") {
                        fetchAdminReviews();
                    }
                    if (document.getElementById("item-reviews-section") && document.getElementById("item-reviews-section").style.display === "block") {
                        fetchAdminItemReviews();
                    }
                } else {
                    Swal.fire('Gagal!', 'Terjadi kesalahan.', 'error');
                }
            } catch (e) {
                Swal.fire('Gagal!', 'Koneksi bermasalah.', 'error');
            }
        }
    });
};

document.getElementById("add-driver-btn").addEventListener("click", () => {
    Swal.fire({
        title: 'Tambah Supir Baru',
        html: `
            <input id="swal-d-name" class="swal2-input" placeholder="Nama Supir">
            <input type="tel" id="swal-d-phone" class="swal2-input" placeholder="Nomor HP">
            <input type="number" id="swal-d-pin" class="swal2-input" placeholder="PIN (6 Angka)" maxlength="6">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Simpan',
        preConfirm: () => {
            const name = document.getElementById('swal-d-name').value;
            const phone = document.getElementById('swal-d-phone').value;
            const pin = document.getElementById('swal-d-pin').value;
            if (!name || !phone || !pin) {
                Swal.showValidationMessage('Semua harus diisi!');
                return false;
            }
            return { name, phone, pin };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}/drivers`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(result.value)
                });
                if (res.ok) {
                    Swal.fire('Berhasil!', 'Supir ditambahkan.', 'success');
                    fetchAdminDrivers();
                } else {
                    Swal.fire('Gagal!', 'Terjadi kesalahan.', 'error');
                }
            } catch (e) {
                Swal.fire('Gagal!', 'Koneksi bermasalah.', 'error');
            }
        }
    });
});

window.deleteDriver = (id) => {
    Swal.fire({
        title: 'Hapus Supir?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Ya, Hapus!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await fetch(`${API_URL}/drivers/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
                Swal.fire('Terhapus!', 'Supir telah dihapus.', 'success');
                fetchAdminDrivers();
            } catch (e) {
                Swal.fire('Gagal!', 'Terjadi kesalahan.', 'error');
            }
        }
    });
};

window.assignDriver = (bookingId, currentDriverId) => {
    if (!window.allDrivers || window.allDrivers.length === 0) {
        return Swal.fire('Oops', 'Anda belum menambahkan supir sama sekali.', 'warning');
    }
    
    let optionsHtml = '<option value="">-- Pilih Supir --</option>';
    window.allDrivers.forEach(d => {
        optionsHtml += `<option value="${d.id}" ${currentDriverId === d.id ? 'selected' : ''}>${d.name} (${d.phone})</option>`;
    });
    
    Swal.fire({
        title: 'Tugaskan Supir',
        html: `<select id="swal-assign-driver" class="swal2-input" style="width: 80%;">${optionsHtml}</select>`,
        showCancelButton: true,
        confirmButtonText: 'Simpan',
        preConfirm: () => {
            const select = document.getElementById('swal-assign-driver');
            const driverId = select.value;
            const driverName = driverId ? select.options[select.selectedIndex].text.split(' (')[0] : '';
            return { driverId, driverName };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}/bookings/${bookingId}/driver`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(result.value)
                });
                if (res.ok) {
                    Swal.fire('Berhasil!', 'Supir ditugaskan.', 'success');
                    fetchAdminBookings(); // Refresh bookings
                }
            } catch (e) {
                Swal.fire('Gagal', 'Gagal menugaskan supir.', 'error');
            }
        }
    });
};

// Global Settings (Sewa Drone)
window.fetchGlobalSettings = async () => {
    try {
        const res = await fetch(`${API_URL}/settings`);
        if (res.ok) {
            const data = await res.json();
            const droneStatus = document.getElementById('setting-drone-status');
            const dronePrice = document.getElementById('setting-drone-price');
            const maintenanceToggle = document.getElementById('setting-maintenance-mode');
            const aiMaintenanceToggle = document.getElementById('setting-ai-maintenance');
            const qrisMaintenanceToggle = document.getElementById('setting-qris-maintenance');
            
            if (droneStatus && data.droneAvailable) {
                droneStatus.value = data.droneAvailable;
            }
            if (dronePrice && data.dronePrice) {
                // Format price with dots
                dronePrice.value = data.dronePrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            }
            if (maintenanceToggle) {
                maintenanceToggle.checked = data.maintenanceMode === true;
                
                // Restrict toggle for non-main admins
                const currentAdminEmail = localStorage.getItem('adminEmail');
                if (currentAdminEmail !== 'ridhosandhika18022022@gmail.com') {
                    maintenanceToggle.disabled = true;
                    
                    // Style the slider to look disabled
                    const slider = maintenanceToggle.nextElementSibling;
                    if (slider) {
                        slider.style.cursor = 'not-allowed';
                        slider.style.opacity = '0.5';
                    }

                    const toggleContainer = maintenanceToggle.closest('.form-group');
                    if (toggleContainer) {
                        // Avoid adding multiple warnings if fetched multiple times
                        if (!toggleContainer.querySelector('.admin-warn-text')) {
                            const warnText = document.createElement('p');
                            warnText.className = 'admin-warn-text';
                            warnText.style.color = '#ef4444';
                            warnText.style.fontSize = '0.85rem';
                            warnText.style.marginTop = '10px';
                            warnText.innerHTML = '<strong>Akses Ditolak:</strong> Hanya Admin Pusat (ridhosandhika18022022@gmail.com) yang dapat mengubah Mode Pemeliharaan.';
                            toggleContainer.appendChild(warnText);
                        }
                    }
                }
            }
            if (aiMaintenanceToggle) {
                aiMaintenanceToggle.checked = data.aiMaintenanceMode === true;
            }
            if (qrisMaintenanceToggle) {
                qrisMaintenanceToggle.checked = data.qrisMaintenanceMode === true;
            }
        }
    } catch (e) {
        console.error("Error fetching settings:", e);
    }
};

window.saveGlobalSettings = async () => {
    const droneStatus = document.getElementById('setting-drone-status').value;
    const dronePriceRaw = document.getElementById('setting-drone-price').value || "";
    const dronePrice = dronePriceRaw.replace(/\./g, '');
    const maintenanceMode = document.getElementById('setting-maintenance-mode') ? document.getElementById('setting-maintenance-mode').checked : false;
    const aiMaintenanceMode = document.getElementById('setting-ai-maintenance') ? document.getElementById('setting-ai-maintenance').checked : false;
    const qrisMaintenanceMode = document.getElementById('setting-qris-maintenance') ? document.getElementById('setting-qris-maintenance').checked : false;
    
    try {
        Swal.fire({title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => {Swal.showLoading()}});
        const res = await fetch(`${API_URL}/settings`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
                droneAvailable: droneStatus, 
                dronePrice: dronePrice,
                maintenanceMode: maintenanceMode,
                aiMaintenanceMode: aiMaintenanceMode,
                qrisMaintenanceMode: qrisMaintenanceMode
            })
        });
        if (res.ok) {
            Swal.fire({icon: 'success', title: 'Berhasil', text: 'Pengaturan berhasil disimpan.', confirmButtonColor: '#22c55e'});
        } else {
            Swal.fire({icon: 'error', title: 'Gagal', text: 'Gagal menyimpan pengaturan.', confirmButtonColor: '#22c55e'});
        }
    } catch (e) {
        Swal.fire({icon: 'error', title: 'Error', text: e.message, confirmButtonColor: '#22c55e'});
    }
};

let analyticsChartInstance = null;

window.fetchVisitorAnalytics = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_URL}/analytics/stats`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success && data.logs) {
            const logs = data.logs;
            
            // 1. Hitung Total Pageviews
            document.getElementById("analytics-total-views").innerText = logs.length;
            
            // 2. Hitung Unique Visitors (berdasarkan ipHash)
            const uniqueVisitors = new Set(logs.map(log => log.ipHash));
            document.getElementById("analytics-unique-visitors").innerText = uniqueVisitors.size;
            
            // 3. Render Tabel (50 Terakhir)
            const tbody = document.getElementById("analytics-table-body");
            tbody.innerHTML = '';
            const recentLogs = logs.slice(0, 50);
            
            if (recentLogs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center">Belum ada data pengunjung.</td></tr>';
            } else {
                recentLogs.forEach(log => {
                    const date = new Date(log.timestamp).toLocaleString('id-ID');
                    
                    // Ekstrak nama browser dari userAgent untuk tampilan yang lebih bersih
                    let browser = "Unknown";
                    if (log.userAgent.includes("Firefox")) browser = "Firefox";
                    else if (log.userAgent.includes("Chrome")) browser = "Chrome";
                    else if (log.userAgent.includes("Safari")) browser = "Safari";
                    else if (log.userAgent.includes("Edge")) browser = "Edge";
                    else browser = log.userAgent.substring(0, 30) + "...";
                    
                    // Deteksi mobile
                    const isMobile = log.screenWidth > 0 && log.screenWidth <= 768;
                    const deviceIcon = isMobile ? '<i class="fa-solid fa-mobile-screen"></i>' : '<i class="fa-solid fa-desktop"></i>';

                    tbody.innerHTML += `
                        <tr>
                            <td>${date}</td>
                            <td><span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${log.path}</span></td>
                            <td>${deviceIcon} ${browser}</td>
                            <td>${log.screenWidth || '?'}px</td>
                        </tr>
                    `;
                });
            }
            
            // 4. Render Chart.js (Tren 7 Hari Terakhir)
            renderAnalyticsChart(logs);
        } else {
            document.getElementById("analytics-table-body").innerHTML = `<tr><td colspan="4" class="text-center text-danger">Gagal memuat data dari server.</td></tr>`;
        }
    } catch (e) {
        console.error("Gagal mengambil data analytics:", e);
        document.getElementById("analytics-table-body").innerHTML = `<tr><td colspan="4" class="text-center text-danger">Gagal mengambil data analytics: ${e.message}</td></tr>`;
    }
};

const renderAnalyticsChart = (logs) => {
    const ctx = document.getElementById('analyticsChart');
    if (!ctx) return;
    
    // Siapkan label 7 hari terakhir
    const dates = [];
    const pageviews = [];
    const uniqueVisits = [];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        dates.push(dateString);
        
        // Filter log untuk hari ini
        const logsOnDay = logs.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate.getDate() === d.getDate() && logDate.getMonth() === d.getMonth();
        });
        
        pageviews.push(logsOnDay.length);
        const unique = new Set(logsOnDay.map(l => l.ipHash)).size;
        uniqueVisits.push(unique);
    }

    if (analyticsChartInstance) {
        analyticsChartInstance.destroy();
    }

    analyticsChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Pageviews',
                    data: pageviews,
                    borderColor: '#2563eb', // primary-blue
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Unique Visitors',
                    data: uniqueVisits,
                    borderColor: '#10b981', // primary-green
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            },
            plugins: {
                legend: { position: 'top' }
            }
        }
    });
};

// Panggil saat halaman dimuat (setelah semua fungsi siap)
checkAuth();

// --- PROMOS LOGIC ---
let promosData = [];
async function loadPromos() {
    try {
        const res = await fetch(`${API_URL}/promos`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to load promos');
        promosData = await res.json();
        renderPromos();
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Gagal memuat promo', 'error');
    }
}

function renderPromos() {
    const tbody = document.getElementById('promos-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = promosData.map(p => {
        const discountStr = p.discountType === 'percent' ? `${p.discountValue}% ${p.maxDiscount ? '(Max: Rp ' + p.maxDiscount.toLocaleString('id-ID') + ')' : ''}` : `Rp ${p.discountValue.toLocaleString('id-ID')}`;
        const validStr = p.validUntil ? new Date(p.validUntil).toLocaleDateString('id-ID') : 'Tanpa Batas';
        const statusBadge = p.isActive ? '<span class="badge bg-success">Aktif</span>' : '<span class="badge bg-secondary">Tidak Aktif</span>';
        
        let itemName = 'Semua Paket';
        if (p.itemId) {
            const found = typeof allAdminItems !== 'undefined' ? allAdminItems.find(i => i.id === p.itemId) : null;
            itemName = found ? found.title : (window.globalItems?.find(i => i.id === p.itemId)?.title || 'Item Khusus');
        }
        
        return `
        <tr>
            <td style="font-weight: bold; color: var(--primary-blue);">${p.code}<br><span style="font-size:0.75rem; color:#64748b; font-weight:normal;">${itemName}</span></td>
            <td>${discountStr}</td>
            <td>${validStr}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm" style="background:#f59e0b;color:white;" onclick="editPromo('${p.id}')"><i class="fa-solid fa-edit"></i> Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deletePromo('${p.id}')"><i class="fa-solid fa-trash"></i> Hapus</button>
            </td>
        </tr>
        `;
    }).join('');
}

async function populatePromoItems() {
    const sel = document.getElementById('promo-item');
    if (!sel) return;
    const currentVal = sel.value;
    sel.innerHTML = '<option value="">-- Memuat paket... --</option>';
    try {
        // Always fetch fresh from API to ensure items are available
        const res = await fetch(`${API_URL}/items`);
        const items = await res.json();
        sel.innerHTML = '<option value="">-- Semua Paket --</option>';
        items.forEach(item => {
            sel.innerHTML += `<option value="${item.id}">${item.title}</option>`;
        });
    } catch (e) {
        sel.innerHTML = '<option value="">-- Semua Paket --</option>';
        console.error('Failed to load items for promo dropdown', e);
    }
    sel.value = currentVal;
}

  const addPromoBtnRef = document.getElementById('add-promo-btn');
  if(addPromoBtnRef) addPromoBtnRef.onclick = () => window.openPromoModal();
  
  window.openPromoModal = async (promo = null) => {
    await populatePromoItems();
    document.getElementById('promo-form').reset();
    if (promo) {
        document.getElementById('promo-modal-title').innerText = 'Edit Promo';
        document.getElementById('promo-id').value = promo.id;
        document.getElementById('promo-item').value = promo.itemId || '';
        document.getElementById('promo-code').value = promo.code;
        document.getElementById('promo-type').value = promo.discountType;
        document.getElementById('promo-value').value = promo.discountValue;
        document.getElementById('promo-max').value = promo.maxDiscount || '';
        document.getElementById('promo-valid').value = promo.validUntil || '';
        document.getElementById('promo-active').checked = promo.isActive;
    } else {
        document.getElementById('promo-modal-title').innerText = 'Tambah Promo';
        document.getElementById('promo-id').value = '';
        document.getElementById('promo-item').value = '';
    }
    document.getElementById('promo-modal').style.display = 'block';
};

window.closePromoModal = () => {
    document.getElementById('promo-modal').style.display = 'none';
};

if (document.getElementById('promo-form')) {
    document.getElementById('promo-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('promo-id').value;
        const itemId = document.getElementById('promo-item').value;
        const data = {
            itemId: itemId || null,
            code: document.getElementById('promo-code').value,
            discountType: document.getElementById('promo-type').value,
            discountValue: Number(document.getElementById('promo-value').value),
            maxDiscount: document.getElementById('promo-max').value ? Number(document.getElementById('promo-max').value) : null,
            validUntil: document.getElementById('promo-valid').value || null,
            isActive: document.getElementById('promo-active').checked
        };
        
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/promos/${id}` : `${API_URL}/promos`;
        
        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
            
            if (res.ok) {
                Swal.fire('Sukses', `Promo berhasil ${id ? 'diperbarui' : 'ditambahkan'}`, 'success');
                closePromoModal();
                loadPromos();
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Gagal menyimpan promo', 'error');
        }
    });
}

window.editPromo = (id) => {
    const promo = promosData.find(p => p.id === id);
    if (promo) openPromoModal(promo);
};

window.deletePromo = async (id) => {
    const res = await Swal.fire({
        title: 'Hapus Promo?',
        text: 'Tindakan ini tidak bisa dibatalkan.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, hapus!'
    });
    
    if (res.isConfirmed) {
        try {
            const req = await fetch(`${API_URL}/promos/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (req.ok) {
                Swal.fire('Terhapus!', 'Promo telah dihapus.', 'success');
                loadPromos();
            }
        } catch (error) {
            Swal.fire('Error', 'Gagal menghapus promo', 'error');
        }
    }
};

// --- BLOGS LOGIC ---
let blogsData = [];
async function loadBlogs() {
    try {
        const res = await fetch(`${API_URL}/blogs?list=true`);
        if (!res.ok) throw new Error('Failed to load blogs');
        blogsData = await res.json();
        renderBlogs();
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Gagal memuat artikel blog', 'error');
    }
}

function renderBlogs() {
    const tbody = document.getElementById('blogs-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = blogsData.map(b => {
        return `
        <tr>
            <td><img src="${b.coverImage || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600'}" alt="${b.title}" style="width: 80px; height: 50px; object-fit: cover; border-radius: 8px;"></td>
            <td style="font-weight: 600; color: var(--primary-blue);">${b.title}</td>
            <td style="color: #64748b; font-size: 0.85rem;">/${b.slug}</td>
            <td><span class="badge bg-secondary"><i class="fa-solid fa-eye"></i> ${b.views || 0}</span></td>
            <td>
                <button class="btn btn-sm" style="background:#f59e0b;color:white;" onclick="editBlog('${b.id}')"><i class="fa-solid fa-edit"></i> Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteBlog('${b.id}')"><i class="fa-solid fa-trash"></i> Hapus</button>
            </td>
        </tr>
        `;
    }).join('');
}

  const addBlogBtnRef = document.getElementById('add-blog-btn');
  if(addBlogBtnRef) addBlogBtnRef.onclick = () => window.openBlogModal();
  
  window.openBlogModal = (blog = null) => {
    document.getElementById('blog-form').reset();
    if (blog) {
        document.getElementById('blog-modal-title').innerText = 'Edit Artikel Blog';
        document.getElementById('blog-id').value = blog.id;
        document.getElementById('blog-title').value = blog.title;
        document.getElementById('blog-summary').value = blog.summary;
        document.getElementById('blog-image').value = blog.coverImage || '';
        document.getElementById('blog-content').value = blog.content || '';
        document.getElementById('blog-tags').value = (blog.tags || []).join(', ');
    } else {
        document.getElementById('blog-modal-title').innerText = 'Tambah Artikel Blog';
        document.getElementById('blog-id').value = '';
    }
    document.getElementById('blog-modal').style.display = 'block';
};

window.closeBlogModal = () => {
    document.getElementById('blog-modal').style.display = 'none';
};

if (document.getElementById('blog-form')) {
    document.getElementById('blog-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('blog-id').value;
        const data = {
            title: document.getElementById('blog-title').value,
            summary: document.getElementById('blog-summary').value,
            coverImage: document.getElementById('blog-image').value,
            content: document.getElementById('blog-content').value,
            tags: document.getElementById('blog-tags').value
        };
        
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/blogs/${id}` : `${API_URL}/blogs`;
        
        // Show loading state
        Swal.fire({
            title: 'Menyimpan...',
            allowEscapeKey: false,
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });
        
        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
            
            if (res.ok) {
                Swal.fire('Sukses', `Artikel berhasil ${id ? 'diperbarui' : 'ditambahkan'}`, 'success');
                closeBlogModal();
                loadBlogs();
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Gagal menyimpan artikel blog', 'error');
        }
    });
}

window.editBlog = async (id) => {
    // We need to fetch full blog data to get content
    try {
        Swal.fire({
            title: 'Memuat...',
            allowEscapeKey: false,
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });
        
        const res = await fetch(`${API_URL}/blogs/${id}`);
        if (!res.ok) throw new Error('Not found');
        const blog = await res.json();
        
        Swal.close();
        openBlogModal(blog);
    } catch (e) {
        Swal.fire('Error', 'Gagal memuat data artikel', 'error');
    }
};

window.deleteBlog = async (id) => {
    const res = await Swal.fire({
        title: 'Hapus Artikel?',
        text: 'Tindakan ini tidak bisa dibatalkan.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, hapus!'
    });
    
    if (res.isConfirmed) {
        try {
            const req = await fetch(`${API_URL}/blogs/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (req.ok) {
                Swal.fire('Terhapus!', 'Artikel telah dihapus.', 'success');
                loadBlogs();
            }
        } catch (error) {
            Swal.fire('Error', 'Gagal menghapus artikel', 'error');
        }
    }
};

// ==========================================
// AI CHAT HISTORY MANAGEMENT
// ==========================================
window.fetchAdminAiChats = async () => {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/ai/sessions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        const tbody = document.getElementById('admin-ai-chats-table');
        tbody.innerHTML = '';
        
        if (!data.success) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">API Error: ${data.message} ${data.error ? '('+data.error+')' : ''}</td></tr>`;
            return;
        }

        if (data.data.length > 0) {
            data.data.forEach(session => {
                const tr = document.createElement('tr');
                const lastUpdate = new Date(session.lastUpdate).toLocaleString('id-ID');
                const msgCount = (session.history || []).filter(msg => msg.role === 'user').length;
                
                tr.innerHTML = `
                    <td>${lastUpdate}</td>
                    <td>${session.sessionId}</td>
                    <td>
                        <span class="badge ${session.isGuest ? 'bg-secondary' : 'bg-primary'}" style="padding: 5px 10px; border-radius: 4px; color: white; background: ${session.isGuest ? '#6b7280' : '#3b82f6'};">
                            ${session.isGuest ? 'Guest' : 'Member'}
                        </span>
                    </td>
                    <td>${msgCount}</td>
                    <td>
                        <button class="btn btn-sm" style="background: #10b981; color: white;" onclick='viewChatHistory(${JSON.stringify(session.history || []).replace(/'/g, "&#39;")})'>
                            <i class="fa-solid fa-eye"></i> Lihat
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Belum ada riwayat chat AI.</td></tr>';
        }
    } catch (error) {
        console.error('Error fetching AI chats:', error);
        document.getElementById('admin-ai-chats-table').innerHTML = '<tr><td colspan="5" class="text-center text-danger">Gagal memuat riwayat.</td></tr>';
    }
};

window.viewChatHistory = (history) => {
    let html = '<div style="text-align: left; max-height: 400px; overflow-y: auto; background: #f8fafc; padding: 15px; border-radius: 8px;">';
    
    if (!history || history.length === 0) {
        html += '<p>Tidak ada pesan.</p>';
    } else {
        history.forEach(msg => {
            const role = msg.role === 'user' ? 'User' : 'AI';
            const color = msg.role === 'user' ? '#1d4ed8' : '#ca8a04';
            const bg = msg.role === 'user' ? '#dbeafe' : '#fef3c7';
            const text = msg.parts[0].text;
            html += `
                <div style="margin-bottom: 10px; padding: 10px; border-radius: 6px; background: ${bg}; border-left: 4px solid ${color};">
                    <strong>${role}:</strong><br>
                    <span style="font-size: 0.9rem; white-space: pre-wrap;">${text}</span>
                </div>
            `;
        });
    }
    html += '</div>';

    Swal.fire({
        title: 'Detail Chat',
        html: html,
        width: 600,
        showCloseButton: true,
        showConfirmButton: true,
        confirmButtonText: '<i class="fa-solid fa-brain"></i> Ajari AI dari Chat Ini',
        confirmButtonColor: '#3b82f6',
        showCancelButton: true,
        cancelButtonText: 'Tutup'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.close();
            showAddRuleModal();
        }
    });
};

// --- IMAGE UPLOAD TO CLOUDINARY VIA API ---
window.uploadImageToServer = async function(fileInput, targetInputId) {
    const file = fileInput.files[0];
    if (!file) return;

    const targetInput = document.getElementById(targetInputId);
    const btn = fileInput.nextElementSibling;
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengunggah...';
    btn.disabled = true;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
            }
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Gagal mengupload gambar');
        }

        const data = await response.json();
        
        let isSuccess = false;
        
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });

        if (data.url) {
            targetInput.value = data.url;
            isSuccess = true;
            
            // Tampilkan tulisan "Selesai diunggah!" di bawahnya
            let oldMsg = targetInput.parentNode.parentNode.querySelector('.upload-msg');
            if (oldMsg) oldMsg.remove();
            
            const msgNode = document.createElement('div');
            msgNode.className = 'upload-msg';
            msgNode.style.color = '#10b981';
            msgNode.style.fontSize = '0.85rem';
            msgNode.style.marginTop = '8px';
            msgNode.style.fontWeight = '600';
            msgNode.style.textAlign = 'left';
            msgNode.innerHTML = '<i class="fa-solid fa-circle-check"></i> Proses mengunggah selesai!';
            targetInput.parentNode.parentNode.insertBefore(msgNode, targetInput.parentNode.nextSibling);
        }
    } catch (error) {
        console.error('Upload Error:', error);
        
        let oldMsg = targetInput.parentNode.parentNode.querySelector('.upload-msg');
        if (oldMsg) oldMsg.remove();
        
        const msgNode = document.createElement('div');
        msgNode.className = 'upload-msg';
        msgNode.style.color = '#ef4444';
        msgNode.style.fontSize = '0.85rem';
        msgNode.style.marginTop = '8px';
        msgNode.style.fontWeight = '600';
        msgNode.style.textAlign = 'left';
        msgNode.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Gagal: ' + (error.message || 'Terjadi kesalahan saat mengunggah gambar');
        targetInput.parentNode.parentNode.insertBefore(msgNode, targetInput.parentNode.nextSibling);

    } finally {
        if (typeof isSuccess !== 'undefined' && isSuccess) {
            btn.innerHTML = '<i class="fa-solid fa-check" style="color: #4CAF50;"></i> Berhasil Upload';
            setTimeout(() => {
                if (btn) btn.innerHTML = originalText;
            }, 3000);
        } else {
            btn.innerHTML = originalText;
        }
        btn.disabled = false;
        fileInput.value = ''; // Reset input
    }
};

// ====== AI KNOWLEDGE BASE ======
window.fetchAiKnowledgeBase = async () => {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/ai/knowledge-base`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        const tbody = document.getElementById('ai-knowledge-table');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        if (data.success && data.data && data.data.length > 0) {
            data.data.forEach(rule => {
                const tr = document.createElement('tr');
                const date = new Date(rule.createdAt).toLocaleString('id-ID');
                tr.innerHTML = `
                    <td style="white-space: nowrap;">${date}</td>
                    <td style="white-space: pre-wrap;">${rule.rule}</td>
                    <td>
                        <button class="btn btn-sm" style="background: #ef4444; color: white;" onclick="deleteAiKnowledgeRule('${rule.id}')">
                            <i class="fa-solid fa-trash"></i> Hapus
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">Belum ada aturan Knowledge Base.</td></tr>';
        }
    } catch (error) {
        console.error('Error fetching knowledge base:', error);
    }
};

window.showAddRuleModal = () => {
    document.getElementById('ai-knowledge-form').reset();
    document.getElementById('ai-knowledge-modal').style.display = 'block';
};

window.closeKnowledgeModal = () => {
    document.getElementById('ai-knowledge-modal').style.display = 'none';
};

document.getElementById('ai-knowledge-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rule = document.getElementById('ai-knowledge-rule').value;
    if (!rule) return;

    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/ai/knowledge-base`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rule })
        });
        
        const data = await response.json();
        if (data.success) {
            Swal.fire({icon: 'success', title: 'Berhasil', text: 'Aturan baru untuk AI disimpan!', timer: 2000, showConfirmButton: false});
            closeKnowledgeModal();
            fetchAiKnowledgeBase();
        } else {
            Swal.fire('Gagal', data.message || 'Gagal menyimpan aturan', 'error');
        }
    } catch (error) {
        console.error('Error saving rule:', error);
        Swal.fire('Error', 'Terjadi kesalahan sistem', 'error');
    }
});

window.deleteAiKnowledgeRule = (id) => {
    Swal.fire({
        title: 'Hapus aturan ini?',
        text: "AI tidak akan lagi menggunakan aturan ini.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Ya, Hapus!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await fetch(`${API_URL}/ai/knowledge-base/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    Swal.fire({icon: 'success', title: 'Terhapus!', timer: 1500, showConfirmButton: false});
                    fetchAiKnowledgeBase();
                } else {
                    Swal.fire('Gagal', data.message || 'Gagal menghapus aturan', 'error');
                }
            } catch (error) {
                console.error('Error deleting rule:', error);
            }
        }
    });
};

// ====== USERS MANAGEMENT ======
window.fetchAdminUsers = async () => {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;
    
    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: getAuthHeaders()
        });
        const users = await response.json();
        
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Belum ada akun pengguna.</td></tr>';
            return;
        }
        
        tbody.innerHTML = users.map(user => {
            const date = user.createdAt ? new Date(user.createdAt).toLocaleString('id-ID') : '-';
            return `
                <tr>
                    <td>${date}</td>
                    <td>${user.name || '-'}</td>
                    <td>${user.email || '-'}</td>
                    <td><span style="font-family: monospace; background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px;">${user.password || '-'}</span></td>
                    <td>
                        <button class="action-btn btn-delete" onclick="deleteUser('${user.id}')"><i class="fa-solid fa-trash"></i> Hapus</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error fetching users:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Gagal memuat pengguna.</td></tr>';
    }
};

window.deleteUser = async (id) => {
    if (!authToken) return Swal.fire({icon: 'info', title: 'Pemberitahuan', text: "Anda harus login!", confirmButtonColor: '#22c55e'});
    
    Swal.fire({
        title: 'Hapus Pengguna?',
        text: "Apakah Anda yakin ingin menghapus data pengguna ini dari tabel admin? (Ini tidak menghapus akun di sistem otentikasi Firebase)",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}/users/${id}`, { 
                    method: "DELETE",
                    headers: getAuthHeaders()
                });
                if (!res.ok) throw new Error("Delete failed");
                fetchAdminUsers();
                Swal.fire({icon: 'success', title: 'Terhapus!', text: 'Data pengguna berhasil dihapus.', confirmButtonColor: '#22c55e'});
            } catch (error) {
                console.error("Error deleting user:", error);
                Swal.fire({icon: 'error', title: 'Gagal', text: "Gagal menghapus pengguna", confirmButtonColor: '#22c55e'});
            }
        }
    });
};

// ====== AUTO LOGOUT ON INACTIVITY ======
let inactivityTimer;
const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes

const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    // Only run timer if admin is logged in
    if (localStorage.getItem('adminToken') || localStorage.getItem('auth_token')) {
        inactivityTimer = setTimeout(autoLogout, INACTIVITY_LIMIT);
    }
};

const autoLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    Swal.fire({
        icon: 'warning',
        title: 'Sesi Berakhir',
        text: 'Anda telah logout otomatis karena tidak ada aktivitas (idle) selama 15 menit untuk keamanan.',
        confirmButtonColor: '#22c55e'
    }).then(() => {
        window.location.href = '/login.html';
    });
};

// Listen for user activity events on the page
['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(evt => 
    document.addEventListener(evt, resetInactivityTimer, { passive: true })
);

// Initialize timer on load
resetInactivityTimer();

// ====== LOGIN LOGS ======
window.fetchLoginLogs = async () => {
    const tbody = document.getElementById('login-logs-tbody');
    if (!tbody) return;
    
    try {
        const response = await fetch(`${API_URL}/login-logs`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            let errorMsg = 'Gagal memuat';
            try {
                const errData = await response.json();
                errorMsg = errData.error || errData.message || errorMsg;
            } catch(e) {
                errorMsg = `Status ${response.status} - ${response.statusText}`;
            }
            throw new Error(errorMsg);
        }
        
        const logs = await response.json();
        
        if (logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Belum ada log aktivitas.</td></tr>';
            return;
        }
        
        tbody.innerHTML = logs.map(log => {
            const date = log.timestamp ? new Date(log.timestamp).toLocaleString('id-ID') : '-';
            const type = log.type || 'login';
            let typeBadge;
            if (type === 'login') {
                typeBadge = `<span style="background:#dcfce7;color:#15803d;padding:3px 10px;border-radius:20px;font-size:0.78rem;font-weight:600;white-space:nowrap;"><i class="fa-solid fa-right-to-bracket" style="margin-right:4px;"></i>Login</span>`;
            } else if (type === 'refresh') {
                typeBadge = `<span style="background:#dbeafe;color:#1d4ed8;padding:3px 10px;border-radius:20px;font-size:0.78rem;font-weight:600;white-space:nowrap;"><i class="fa-solid fa-rotate" style="margin-right:4px;"></i>Refresh</span>`;
            } else if (type === 'logout') {
                typeBadge = `<span style="background:#fee2e2;color:#dc2626;padding:3px 10px;border-radius:20px;font-size:0.78rem;font-weight:600;white-space:nowrap;"><i class="fa-solid fa-right-from-bracket" style="margin-right:4px;"></i>Logout</span>`;
            } else {
                typeBadge = `<span style="background:#f1f5f9;color:#475569;padding:3px 10px;border-radius:20px;font-size:0.78rem;font-weight:600;">${type}</span>`;
            }
            return `
                <tr>
                    <td>${date}</td>
                    <td>${log.email || '-'}</td>
                    <td>${log.ip || '-'}</td>
                    <td>${typeBadge}</td>
                    <td style="font-size: 0.8rem; color: #64748b; max-width: 250px; word-wrap: break-word; white-space: normal;">${log.userAgent || '-'}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error fetching login logs:', error);
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Gagal memuat log: ${error.message}</td></tr>`;
    }
};

// ====== DETEKSI REFRESH HALAMAN ======
// sessionStorage tidak persisten antar tab baru/close, tapi persisten saat refresh
if (authToken) {
    if (sessionStorage.getItem('adminSessionActive')) {
        // Ini adalah refresh - kirim log refresh
        logSessionActivity('refresh');
    } else {
        // Pertama kali buka tab baru dengan token sudah ada
        sessionStorage.setItem('adminSessionActive', '1');
    }
}
