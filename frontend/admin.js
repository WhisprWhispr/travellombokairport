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
const titleInput = document.getElementById("item-title");
const descriptionInput = document.getElementById("item-description");
const priceInput = document.getElementById("item-price");
const imageInput = document.getElementById("item-image");
const packageTypeInput = document.getElementById("item-packageType");
const durationInput = document.getElementById("item-duration");
const itineraryInput = document.getElementById("item-itinerary");
const includeInput = document.getElementById("item-include");
const excludeInput = document.getElementById("item-exclude");
const modalTitle = document.getElementById("modal-title");

const checkAuth = () => {
    if (authToken) {
        loginContainer.style.display = "none";
        adminDashboard.style.display = "block";
        fetchAdminItems();
        
        if (!localStorage.getItem('adminTutorialSeen')) {
            setTimeout(showAdminTutorial, 1000);
        }
    } else {
        loginContainer.style.display = "flex";
        adminDashboard.style.display = "none";
    }
};

// Panggil saat halaman dimuat
checkAuth();

// Login Handler
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.style.display = "none";
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const btn = document.getElementById("login-btn");
    
    btn.disabled = true;
    btn.innerText = "Loading...";
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            authToken = data.token;
            localStorage.setItem('adminToken', authToken);
            checkAuth();
        } else {
            throw new Error(data.error || "Email atau password salah");
        }
    } catch (error) {
        loginError.innerText = "Login Gagal: " + error.message;
        loginError.style.display = "block";
    } finally {
        btn.disabled = false;
        btn.innerText = "Login";
    }
});

// Logout Handler
logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    authToken = null;
    localStorage.removeItem('adminToken');
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
    
    // We try to get the email from the logged in user context. 
    // Since we don't store the email in localStorage explicitly, we can ask for it, 
    // or we can prompt them to confirm. Let's just prompt them for their email to be safe.
    const { value: email } = await Swal.fire({
        title: 'Ubah Sandi Saya',
        text: 'Masukkan email akun ini untuk menerima link perubahan sandi yang dikirimkan oleh Firebase.',
        input: 'email',
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
const fetchAdminItems = async () => {
    try {
        const response = await fetch(`${API_URL}/items`);
        const items = await response.json();
        renderTable(items);
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
    
    tableBody.innerHTML = items.map(item => `
        <tr>
            <td><img src="${item.imageUrl}" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=100'"></td>
            <td><strong>${item.title}</strong></td>
            <td><span style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${item.category}</span></td>
            <td>${item.price}</td>
            <td>
                <button class="action-btn btn-edit" onclick="editItem('${item.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
                <button class="action-btn btn-delete" onclick="deleteItem('${item.id}')"><i class="fa-solid fa-trash"></i> Delete</button>
            </td>
        </tr>
    `).join('');
};

// Modal handlers
const openModal = () => { modal.classList.add("active"); };
const closeModal = () => { 
    modal.classList.remove("active");
    form.reset();
    idInput.value = "";
    modalTitle.textContent = "Add New Item";
};

addBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
    if(e.target === modal) closeModal();
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
    
    const itemData = {
        title: titleInput.value,
        description: descriptionInput.value,
        category: categoryInput.value,
        price: priceInput.value,
        imageUrl: imageInput.value,
        packageType: packageTypeInput.value,
        duration: durationInput.value,
        itinerary: itineraryInput.value,
        include: includeInput.value,
        exclude: excludeInput.value
    };
    
    const itemId = idInput.value;
    const method = itemId ? "PUT" : "POST";
    const url = itemId ? `${API_URL}/items/${itemId}` : `${API_URL}/items`;
    
    try {
        const response = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify(itemData)
        });
        
        if (response.ok) {
            closeModal();
            fetchAdminItems();
        } else {
            const err = await response.json();
            Swal.fire({icon: 'info', title: 'Pemberitahuan', text: "Gagal: " + (err.error || err.message), confirmButtonColor: '#22c55e'});
        }
    } catch (error) {
        console.error("Error saving item:", error);
        Swal.fire({icon: 'info', title: 'Pemberitahuan', text: "Error saving item", confirmButtonColor: '#22c55e'});
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
        
        idInput.value = item.id;
        titleInput.value = item.title;
        descriptionInput.value = item.description;
        categoryInput.value = item.category;
        priceInput.value = item.price;
        imageInput.value = item.imageUrl;
        packageTypeInput.value = item.packageType || "";
        durationInput.value = item.duration || "";
        itineraryInput.value = item.itinerary || "";
        includeInput.value = item.include || "";
        excludeInput.value = item.exclude || "";
        
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
    document.getElementById("bookings-section").style.display = "none";
    document.getElementById("orders-section").style.display = "none";
    document.getElementById("web-bookings-section").style.display = "none";
    document.getElementById("gallery-section").style.display = "none";
    document.getElementById("withdrawal-section").style.display = "none";
    document.getElementById("drivers-section").style.display = "none";
    document.getElementById("add-item-btn").style.display = "none";
    document.getElementById("add-booking-btn").style.display = "none";
    document.getElementById("add-gallery-btn").style.display = "none";
    document.getElementById("add-driver-btn").style.display = "none";
    
    if (tab === "items") {
        document.getElementById("items-section").style.display = "block";
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
    } else if (tab === "gallery") {
        document.getElementById("gallery-section").style.display = "block";
        document.getElementById("add-gallery-btn").style.display = "inline-block";
        fetchAdminGallery();
    } else if (tab === "withdrawals") {
        document.getElementById("withdrawal-section").style.display = "block";
        fetchWithdrawals();
    } else if (tab === "drivers") {
        document.getElementById("drivers-section").style.display = "block";
        document.getElementById("add-driver-btn").style.display = "inline-block";
        fetchAdminDrivers();
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
        const webBookings = allBookings.filter(b => !b.transactionId || b.transactionId.startsWith('BKG-') || (!b.transactionId.startsWith('MANUAL') && !b.transactionId.startsWith('ORD-')));
        
        // Helper renderer
        const renderRows = (bookingsArray, emptyMsg, tableElem) => {
            if (bookingsArray.length === 0) {
                tableElem.innerHTML = `<tr><td colspan="5" class="text-center">${emptyMsg}</td></tr>`;
            } else {
                tableElem.innerHTML = bookingsArray.map(b => {
                    let statusColor = '#64748b';
                    if (b.status === 'PAID') statusColor = 'var(--primary-green)';
                    if (b.status === 'PENDING') statusColor = '#f59e0b';
                    if (b.status === 'PROCESSING') statusColor = '#3b82f6';
                    if (b.status === 'COMPLETED') statusColor = '#10b981';
                    
                    const trxId = b.transactionId || b.id.substring(0, 8);
                    const waNumber = b.phone ? b.phone.replace(/[^0-9]/g, '') : '';
                    const cleanWa = waNumber.startsWith('0') ? '62' + waNumber.substring(1) : waNumber;
                    const startDateStr = new Date(b.startDate).toLocaleDateString('id-ID');
                    const waMsg = encodeURIComponent(`Halo ${b.customerName}, ini Admin Travel Lombok Airport. Terkait pesanan Anda (ID: ${trxId}) untuk layanan ${b.itemName} pada tanggal ${startDateStr}. `);
                    
                    return `
                    <tr>
                        <td><strong style="color:var(--primary-blue); font-size: 0.9rem;">${trxId}</strong><br><small>${startDateStr} - ${new Date(b.endDate).toLocaleDateString('id-ID')}</small></td>
                        <td><strong>${b.itemName}</strong></td>
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
        title: '<strong style="color: #1e293b; font-size: 1.5rem;">Panduan Panel Admin</strong>',
        html: `
            <div style="text-align: left; font-size: 0.9rem; color: #475569;">
                <p style="margin-bottom: 20px;">Selamat datang di Pusat Kendali Travel Anda. Berikut adalah fungsi utama dari setiap menu:</p>
                
                <div style="background: #eff6ff; padding: 15px; border-radius: 12px; margin-bottom: 15px; border-left: 5px solid #3b82f6; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h4 style="margin: 0 0 8px 0; color: #1e40af; font-size: 1rem;"><i class="fa-solid fa-laptop"></i> 1. Booking Web</h4>
                    <p style="margin: 0;">Semua pesanan yang masuk dari website akan muncul di sini. Anda bisa melihat status pembayaran (PAID/PENDING). Di menu ini, Anda WAJIB menugaskan supir dengan menekan tombol <strong>Assign Supir</strong>.</p>
                </div>

                <div style="background: #fdf4ff; padding: 15px; border-radius: 12px; margin-bottom: 15px; border-left: 5px solid #d946ef; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h4 style="margin: 0 0 8px 0; color: #86198f; font-size: 1rem;"><i class="fa-solid fa-calendar-alt"></i> 2. Jadwal Manual</h4>
                    <p style="margin: 0;">Gunakan menu ini jika Anda mendapat pesanan dari telepon/WA (offline). Anda bisa menginput data secara manual agar jadwal tidak bentrok dengan pesanan dari website.</p>
                </div>

                <div style="background: #fff7ed; padding: 15px; border-radius: 12px; margin-bottom: 15px; border-left: 5px solid #f97316; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h4 style="margin: 0 0 8px 0; color: #9a3412; font-size: 1rem;"><i class="fa-solid fa-car"></i> 3. Manajemen Supir</h4>
                    <p style="margin: 0;">Tempat Anda mendaftarkan tim supir/tour guide. Masukkan <strong>Nomor HP</strong> dan buatkan <strong>PIN 6 Angka</strong>. Nomor HP dan PIN ini digunakan supir untuk login ke portal mereka.</p>
                </div>

                <div style="background: #f0fdf4; padding: 15px; border-radius: 12px; margin-bottom: 15px; border-left: 5px solid #22c55e; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h4 style="margin: 0 0 8px 0; color: #166534; font-size: 1rem;"><i class="fa-solid fa-money-bill-wave"></i> 4. Penarikan Dana</h4>
                    <p style="margin: 0;">Pusat keuangan Anda. Semua pendapatan dari tamu yang membayar lunas via QRIS akan masuk ke Saldo Aktif. Anda bisa menarik uang ke rekening pribadi dengan menekan tombol <strong>Ajukan Penarikan</strong>.</p>
                </div>

                <div style="background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 15px; border-left: 5px solid #64748b; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h4 style="margin: 0 0 8px 0; color: #334155; font-size: 1rem;"><i class="fa-solid fa-camera"></i> 5. Kelola Galeri & Item</h4>
                    <p style="margin: 0;">Tempat untuk mengatur "Etalase" website Anda. Tambahkan foto-foto perjalanan menarik atau atur ulang harga dan detail paket wisata Anda kapan saja.</p>
                </div>
            </div>
        `,
        width: 700,
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
            <input id="swal-g-img" class="swal2-input" placeholder="URL Gambar (JPG/PNG)">
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
            list.innerHTML = `<tr><td colspan="5" class="text-center">Belum ada riwayat penarikan.</td></tr>`;
        } else {
            withdrawals.forEach(w => {
                if (w.status !== 'REJECTED') totalWithdrawn += (w.amount || 0);
                
                let statusBadge = '';
                if (w.status === 'PENDING') statusBadge = '<span style="background: #f59e0b; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">Pending</span>';
                if (w.status === 'COMPLETED') statusBadge = '<span style="background: #10b981; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">Selesai</span>';
                if (w.status === 'REJECTED') statusBadge = '<span style="background: #ef4444; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">Ditolak</span>';
                
                list.innerHTML += `
                    <tr>
                        <td>${w.id.substring(0,8)}</td>
                        <td>${new Date(w.createdAt?._seconds ? w.createdAt._seconds * 1000 : Date.now()).toLocaleDateString('id-ID')}</td>
                        <td><strong>${w.bankName}</strong><br><small>${w.accountNumber}</small></td>
                        <td>Rp ${w.amount.toLocaleString('id-ID')}</td>
                        <td>${statusBadge}</td>
                    </tr>
                `;
            });
        }
        
        currentBalance = totalRevenue - totalWithdrawn;
        document.getElementById("total-balance-display").innerText = `Rp ${currentBalance.toLocaleString('id-ID')}`;
        
    } catch (e) {
        console.error("Error fetching withdrawals:", e);
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

// Driver Logic
window.fetchAdminDrivers = async () => {
    try {
        const res = await fetch(`${API_URL}/drivers`, { headers: getAuthHeaders() });
        const drivers = await res.json();
        
        // Cache drivers globally for assignment
        window.allDrivers = drivers;
        
        const tableBody = document.getElementById("admin-drivers-table");
        if (drivers.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center">Belum ada supir terdaftar.</td></tr>';
            return;
        }
        
        tableBody.innerHTML = drivers.map(d => `
            <tr>
                <td><strong>${d.name}</strong></td>
                <td>${d.phone}</td>
                <td>${d.pin}</td>
                <td>
                    <button class="btn btn-sm btn-outline" style="border-color: #ef4444; color: #ef4444;" onclick="deleteDriver('${d.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join("");
    } catch (e) {
        console.error("Error fetching drivers:", e);
    }
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
