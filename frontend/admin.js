import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA6iPEJgUiZpRkt6YMaIk4Z2tglVF1MiBs",
  authDomain: "travellombokairport.firebaseapp.com",
  projectId: "travellombokairport",
  storageBucket: "travellombokairport.firebasestorage.app",
  messagingSenderId: "1091706966192",
  appId: "1:1091706966192:web:4eea0b5132e7c353c8ab75"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let authToken = null;
const API_URL = "http://192.168.18.67:5000/api";

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

// Auth State Listener
onAuthStateChanged(auth, async (user) => {
    if (user) {
        authToken = await user.getIdToken();
        loginContainer.style.display = "none";
        adminDashboard.style.display = "block";
        fetchAdminItems();
    } else {
        authToken = null;
        loginContainer.style.display = "flex";
        adminDashboard.style.display = "none";
    }
});

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
        await signInWithEmailAndPassword(auth, email, password);
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
    signOut(auth);
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
    document.getElementById("add-item-btn").style.display = "none";
    document.getElementById("add-booking-btn").style.display = "none";
    document.getElementById("add-gallery-btn").style.display = "none";
    
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
