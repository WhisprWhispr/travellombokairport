const API_URL = '/api';
let globalItems = [];

// Format currency
const formatPrice = (price) => {
    return price;
};

// Fetch items from backend
const fetchItems = async (category = null) => {
    try {
        let url = `${API_URL}/items`;
        if (category) {
            url += `?category=${category}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching items:', error);
        return [];
    }
};

// Parse newlines to array
const parseLines = (text) => {
    if (!text) return [];
    return text.split('\n').map(t => t.trim()).filter(t => t.length > 0);
};

// Modal functions (attached to window for global access)
window.closeTourModal = () => {
    document.getElementById('tour-modal').classList.remove('active');
};

window.openTourModal = (id) => {
    const item = globalItems.find(i => i.id === id);
    if (!item) return;

    const modalBody = document.getElementById('tour-modal-body');
    
    // Parse itineraries
    let itineraryHTML = '';
    const itins = parseLines(item.itinerary);
    // Asumsikan format: "DAY 1: Title" lalu diikuti "-"
    let currentDay = '';
    let currentTitle = '';
    let currentDests = [];
    
    const commitDay = () => {
        if(currentDay) {
            itineraryHTML += `
            <div class="tm-day">
                <div class="tm-day-header">
                    <div class="tm-day-badge">DAY<br><span>${currentDay.replace('DAY','').trim()}</span></div>
                    <div class="tm-day-title">${currentTitle}</div>
                </div>
                <ul class="tm-day-list">
                    ${currentDests.map(d => `<li>${d}</li>`).join('')}
                </ul>
            </div>`;
        }
    };

    itins.forEach(line => {
        if(line.toUpperCase().startsWith('DAY')) {
            commitDay();
            const parts = line.split(':');
            currentDay = parts[0];
            currentTitle = parts.slice(1).join(':').trim();
            currentDests = [];
        } else if (line.startsWith('-')) {
            currentDests.push(line.substring(1).trim());
        } else {
            currentDests.push(line);
        }
    });
    commitDay();

    // Parse include/exclude
    const includes = parseLines(item.include);
    const excludes = parseLines(item.exclude);

    modalBody.innerHTML = `
        <div style="width: 100%; height: 400px; position: relative;">
            <img src="${item.imageUrl}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200'">
            <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 150px; background: linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0));"></div>
        </div>
        <div class="tm-header" style="margin-top: -100px; position: relative; background: transparent; padding-top: 0; border: none;">
            <div class="tm-top premium-card">
                <div class="tm-title" style="flex: 1;">
                    <h4 style="letter-spacing: 2px; color: var(--primary-green); margin-bottom: 10px; font-weight: 800; font-size: 0.9rem;"><i class="fa-solid fa-map-location-dot"></i> ${item.packageType || 'PAKET TOUR'}</h4>
                    <h2 style="color: var(--text-dark); font-size: 2.5rem; margin-bottom: 20px; line-height: 1.2; font-weight: 800;">${item.title.toUpperCase()}</h2>
                    <div class="tm-badges" style="margin-bottom: 20px;">
                        <span class="tm-badge-blue" style="background: #f0f9ff; color: var(--primary-blue); font-size: 1rem; padding: 8px 20px; border-radius: 30px; font-weight: bold;"><i class="fa-regular fa-clock"></i> ${item.duration || 'N/A'}</span>
                    </div>
                    <p style="color: #475569; font-size: 1.1rem; line-height: 1.7;">${item.description || 'Deskripsi detail tidak tersedia.'}</p>
                </div>
                <div class="tm-price-box premium-price-box">
                    <span class="price-label" style="background: var(--primary-green); color: white; font-size: 0.85rem; padding: 6px 15px; border-radius: 20px; font-weight: bold; align-self: flex-end;">HARGA PAKET</span>
                    <h3 style="color: var(--primary-blue); margin-top: 15px; font-size: 2.2rem; font-weight: 900;">${formatPrice(item.price)}</h3>
                    <p style="color: var(--text-gray); margin-top: 5px; font-size: 0.95rem;">Mulai harga terendah</p>
                </div>
            </div>
        </div>
        <div class="tm-body">
            <div class="tm-left">
                ${itineraryHTML ? `
                <h4 style="margin-bottom: 20px; color: var(--text-dark); font-weight: 800;"><i class="fa-solid fa-route" style="color: var(--primary-green);"></i> JADWAL PERJALANAN</h4>
                <div class="tm-timeline">
                    ${itineraryHTML}
                </div>` : ''}
                
                <div class="tm-box tm-box-blue mt-4" style="background: #f8fafc; border: 1px solid #cbd5e1;">
                    <div class="tm-box-title" style="background: var(--text-dark);"><i class="fa-solid fa-shield-halved"></i> KEBIJAKAN PEMBATALAN</div>
                    <ul class="tm-list" style="color:var(--text-dark);">
                        <li><i class="fa-solid fa-hourglass-half" style="color:var(--text-gray);"></i> Pembatalan H-7: 50% deposit dikembalikan.</li>
                        <li><i class="fa-solid fa-check" style="color:var(--text-gray);"></i> Pembatalan pihak travel: 100% deposit dikembalikan.</li>
                        <li><i class="fa-regular fa-calendar-days" style="color:var(--text-gray);"></i> Perubahan jadwal sesuai ketersediaan.</li>
                    </ul>
                </div>
            </div>
            
            <div class="tm-right">
                <div class="tm-box tm-box-green">
                    <div class="tm-box-title"><i class="fa-solid fa-check"></i> FASILITAS INCLUDE</div>
                    <ul class="tm-list">
                        ${includes.map(i => `<li><i class="fa-solid fa-check-circle"></i> ${i}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="tm-box tm-box-red">
                    <div class="tm-box-title"><i class="fa-solid fa-xmark"></i> TIDAK TERMASUK</div>
                    <ul class="tm-list">
                        ${excludes.map(i => `<li><i class="fa-solid fa-times-circle"></i> ${i}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="tm-box tm-box-blue" style="background: white; border: 2px solid var(--primary-blue);">
                    <div class="tm-box-title" style="background: var(--primary-blue); box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.3);"><i class="fa-regular fa-calendar-check"></i> CARA RESERVASI</div>
                    <p style="color: var(--text-gray); font-size: 0.9rem; margin-bottom: 15px;">Untuk mengamankan jadwal perjalanan, silakan transfer deposit (booking fee) sebesar <strong>Rp 500.000</strong> ke rekening berikut:</p>
                    <div class="bank-item" style="background: #f8fafc; border: none;">
                        <img src="/mandiri.svg" alt="Mandiri" style="height: 25px; object-fit: contain;">
                        <div>LALU RENGGANE<br><span style="color: var(--primary-blue); font-size: 1.1rem; letter-spacing: 1px;">1610017191425</span></div>
                    </div>
                    <div class="bank-item" style="background: #f8fafc; border: none;">
                        <img src="/bri.svg" alt="BRI" style="height: 25px; object-fit: contain;">
                        <div>LALU RENGGANE<br><span style="color: var(--primary-blue); font-size: 1.1rem; letter-spacing: 1px;">759801017387536</span></div>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <a href="https://wa.me/6289676963255?text=Halo%20admin,%20saya%20ingin%20booking%20${encodeURIComponent(item.title)}" target="_blank" class="btn" style="flex:1; background: #e0f2fe; color: var(--primary-blue); padding: 12px; border-radius: 8px;"><i class="fa-brands fa-whatsapp"></i> via WA</a>
                        <button onclick="openCheckoutModal('${item.title}', ${item.price})" class="btn btn-blue" style="flex:1; padding: 12px; border-radius: 8px;"><i class="fa-solid fa-desktop"></i> via Web</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="tm-footer" style="background: var(--bg-light); color: var(--text-gray); border-top: 1px solid #e2e8f0;">
            <span><i class="fa-regular fa-face-smile" style="color: var(--primary-green);"></i> LIBURAN NYAMAN</span>
            <span><i class="fa-solid fa-lock" style="color: var(--primary-blue);"></i> AMAN & TERPERCAYA</span>
            <span><i class="fa-solid fa-user-tie" style="color: var(--text-dark);"></i> ANTI RIBET</span>
        </div>
    `;

    document.getElementById('tour-modal').classList.add('active');
};

// Render Service Card (Layanan)
const createServiceCard = (item) => `
    <div class="card service-card">
        <div class="service-icon"><i class="fa-solid fa-plane"></i></div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
    </div>
`;

// Render Package Card (Paket Tour)
const createPackageCard = (item) => `
    <div class="card package-card">
        <div class="img-wrapper">
            <span class="tag"><i class="fa-regular fa-clock" style="margin-right: 4px;"></i> ${item.duration || '1 HARI'}</span>
            <img src="${item.imageUrl}" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'">
        </div>
        <div class="content">
            <h3>${item.title}</h3>
            <ul>
                <li><i class="fa-solid fa-check"></i> ${item.description.substring(0, 50)}...</li>
            </ul>
            <div class="price-row">
                <div class="price"><span>Mulai dari</span>${formatPrice(item.price)}</div>
                <button onclick="openTourModal('${item.id}')" class="btn" style="background: var(--bg-light); color: var(--primary-blue); border: none; font-size: 0.85rem; padding: 8px 16px; border-radius: 20px; font-weight: 700;">DETAIL</button>
            </div>
        </div>
    </div>
`;

// Render Fleet Card (Armada/Rental)
const createFleetCard = (item) => `
    <div class="card fleet-card">
        <img src="${item.imageUrl}" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800'">
        <h3>${item.title}</h3>
        <div class="fleet-features">
            <span><i class="fa-solid fa-user-group"></i> 4 Seat</span>
            <span><i class="fa-solid fa-gear"></i> Matic</span>
        </div>
        <div class="fleet-price">${formatPrice(item.price)} / hari</div>
        <div style="display: flex; gap: 10px; margin-top: 10px;">
            <a href="https://wa.me/6289676963255?text=Halo%20saya%20ingin%20sewa%20${encodeURIComponent(item.title)}" target="_blank" class="btn" style="flex:1; background: white; color: var(--primary-green); border: 2px solid var(--primary-green); padding: 8px;"><i class="fa-brands fa-whatsapp"></i> WA</a>
            <button onclick="openCheckoutModal('${item.title}', ${item.price})" class="btn btn-green" style="flex:1; padding: 8px;"><i class="fa-solid fa-desktop"></i> Web</button>
        </div>
    </div>
`;

// Initialize Page
const init = async () => {
    const servicesContainer = document.getElementById('services-container');
    const packagesContainer = document.getElementById('packages-container');
    const fleetContainer = document.getElementById('fleet-container');
    
    // Fetch all data
    globalItems = await fetchItems();
    
    // Categorize data
    const packages = globalItems.filter(item => item.category.toLowerCase().includes('paket') || item.category.toLowerCase() === 'package');
    const fleets = globalItems.filter(item => {
        const cat = item.category.toLowerCase();
        return cat.includes('rental') || cat.includes('armada') || cat.includes('sewa') || cat === 'car' || cat === 'motorcycle';
    });
    const services = globalItems.filter(item => !packages.includes(item) && !fleets.includes(item));

    // Render Services
    if (servicesContainer) {
        if (services.length > 0) {
            servicesContainer.innerHTML = services.map(createServiceCard).join('');
        } else {
            servicesContainer.innerHTML = '<p class="text-center w-100" style="grid-column: 1/-1;">Belum ada layanan yang ditambahkan.</p>';
        }
    }

    // Render Packages
    if (packagesContainer) {
        if (packages.length > 0) {
            packagesContainer.innerHTML = packages.map(createPackageCard).join('');
        } else {
            packagesContainer.innerHTML = '<p class="text-center w-100" style="grid-column: 1/-1;">Belum ada paket yang ditambahkan.</p>';
        }
    }
    
    // Render Fleets
    if (fleetContainer) {
        if (fleets.length > 0) {
            fleetContainer.innerHTML = fleets.map(createFleetCard).join('');
        } else {
            fleetContainer.innerHTML = '<p class="text-center w-100" style="grid-column: 1/-1;">Belum ada armada yang ditambahkan.</p>';
        }
    }
};

// Cek Booking Status
window.cekStatusBooking = async (event, type = 'booking') => {
    event.preventDefault();
    const inputId = type === 'booking' ? 'input-cek-booking' : 'input-cek-orderan';
    const btnId = type === 'booking' ? 'btn-cek-booking' : 'btn-cek-orderan';
    
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    const trxId = input.value.trim();
    
    if(!trxId) return;
    
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengecek...';
    btn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/bookings/check/${trxId}`);
        
        if (response.ok) {
            const data = await response.json();
            const statusColor = data.status === 'PAID' ? '#22c55e' : (data.status === 'PENDING' ? '#f59e0b' : '#ef4444');
            const statusIcon = data.status === 'PAID' ? 'fa-circle-check' : (data.status === 'PENDING' ? 'fa-clock' : 'fa-circle-xmark');
            
            const htmlContent = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 3rem; color: ${statusColor}; margin-bottom: 10px;">
                        <i class="fa-solid ${statusIcon}"></i>
                    </div>
                    <span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 0.85rem;">${data.status}</span>
                </div>
                
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: left;">
                    <div style="margin-bottom: 10px;">
                        <span style="font-size: 0.8rem; color: #64748b;">ID Transaksi</span>
                        <div style="font-weight: bold; color: #1e293b;">${data.transactionId}</div>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <span style="font-size: 0.8rem; color: #64748b;">Atas Nama</span>
                        <div style="font-weight: bold; color: #1e293b;">${data.customerName}</div>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <span style="font-size: 0.8rem; color: #64748b;">Item / Layanan</span>
                        <div style="font-weight: bold; color: #1e293b;">${data.itemName}</div>
                    </div>
                    <div>
                        <span style="font-size: 0.8rem; color: #64748b;">Jadwal</span>
                        <div style="font-weight: bold; color: #1e293b;">${new Date(data.startDate).toLocaleDateString('id-ID')} s/d ${new Date(data.endDate).toLocaleDateString('id-ID')}</div>
                    </div>
                </div>
            `;
            
            Swal.fire({
                title: 'Status Pesanan',
                html: htmlContent,
                confirmButtonColor: '#22c55e',
                confirmButtonText: 'Tutup',
                customClass: {
                    container: 'my-swal-container'
                }
            });
            
        } else {
            let errorMsg = "Pastikan ID Transaksi yang Anda masukkan benar.";
            try {
                const err = await response.json();
                if (err && err.message) errorMsg = err.message;
            } catch(e) {}
            
            Swal.fire({
                icon: 'error',
                title: 'Tidak Ditemukan',
                text: errorMsg,
                confirmButtonColor: '#22c55e'
            });
        }
        
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error', 
            title: 'Gagal', 
            text: "Terjadi kesalahan jaringan saat mengecek status.", 
            confirmButtonColor: '#22c55e'
        });
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
        input.value = '';
    }
};

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Dynamic sub-layanan options
window.updateSubLayanan = () => {
    const layanan = document.getElementById("qb-layanan").value;
    const subContainer = document.getElementById("qb-sub-container");
    const subSelect = document.getElementById("qb-sub-layanan");
    
    subSelect.innerHTML = "";
    let options = [];
    
    if (layanan === "Sewa Mobil") {
        options = globalItems.filter(item => {
            const cat = item.category.toLowerCase();
            return cat.includes("rental") || cat.includes("armada") || cat.includes("sewa") || cat === "car";
        });
        
        // Fallback mock data jika tidak ada data dari backend
        if (options.length === 0) {
            options = [
                {title: "Toyota Avanza"},
                {title: "Toyota Innova Reborn"},
                {title: "Toyota Hiace Commuter"}
            ];
        }
    } else if (layanan === "Paket Tour") {
        options = globalItems.filter(item => {
            const cat = item.category.toLowerCase();
            return cat.includes("paket") || cat === "package";
        });
        
        // Fallback mock data jika tidak ada data dari backend
        if (options.length === 0) {
            options = [
                {title: "Paket Sasak Tour (1 Hari)"},
                {title: "Paket Explore Gili (1 Hari)"},
                {title: "Paket Honeymoon Romantis (3H2M)"},
                {title: "Paket Family Vacation (4H3M)"}
            ];
        }
    }
    
    if (options.length > 0) {
        options.forEach(item => {
            const opt = document.createElement("option");
            opt.value = item.title;
            opt.textContent = item.title;
            subSelect.appendChild(opt);
        });
        subContainer.style.display = "block";
    } else {
        subContainer.style.display = "none";
        subSelect.innerHTML = "<option value='-'>-</option>";
    }
};

// Run init when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init().then(() => {
        window.updateSubLayanan(); // initialize dropdowns
    });
});

// Handle Quick Booking form
window.submitBooking = (method) => {
    const layanan = document.getElementById("qb-layanan").value;
    const subLayanan = document.getElementById("qb-sub-layanan").value;
    const tanggal = document.getElementById("qb-tanggal").value;
    const jumlah = document.getElementById("qb-jumlah").value;
    
    if(!tanggal) {
        Swal.fire({icon: 'info', title: 'Pemberitahuan', text: "Mohon pilih tanggal terlebih dahulu.", confirmButtonColor: '#22c55e'});
        return;
    }

    let itemDetail = layanan;
    if (subLayanan && subLayanan !== "-") {
        itemDetail = `${layanan} - ${subLayanan}`;
    }
    const itemName = `${itemDetail} (${jumlah} - ${tanggal})`;

    if(method === "wa") {
        const text = `Halo Admin Travel Lombok Airport,\n\nSaya ingin melakukan pemesanan (Booking) dengan rincian sebagai berikut:\n\n- Layanan: ${layanan}\n${subLayanan !== "-" ? `- Pilihan: ${subLayanan}\n` : ""}- Tanggal: ${tanggal}\n- Jumlah Orang: ${jumlah}\n\nMohon informasi mengenai ketersediaan dan proses selanjutnya. Terima kasih!`;
        window.open(`https://wa.me/6289676963255?text=${encodeURIComponent(text)}`, "_blank");
    } else {
        openCheckoutModal(itemName, 0); // 0 means calculate later or follow up
    }
};
// Checkout & QRIS Flow
window.closeCheckoutModal = () => {
    document.getElementById("checkout-modal").classList.remove("active");
};

window.openCheckoutModal = async (itemName, price) => {
    const modalBody = document.getElementById("checkout-modal-body");
    const isOrder = price > 0;
    const displayPrice = isOrder ? formatPrice(price) : "";
    
    // Fetch bookings to show availability
    try {
        const res = await fetch(`${API_URL}/bookings?public=true`);
        const allBookings = await res.json();
        const itemBookings = allBookings.filter(b => {
            const bName = b.itemName || "";
            const matchesName = bName === itemName || itemName.includes(bName) || (bName && bName.includes(itemName));
            return matchesName && (b.status === 'PAID' || b.status === 'PENDING');
        });
        
        window.currentBookings = itemBookings;
    } catch (e) {
        console.error("Failed to fetch bookings:", e);
    }

    let html = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: var(--primary-blue);">${isOrder ? "Checkout Pesanan" : "Form Booking"}</h2>
            <p style="color: #64748b; font-size: 0.9rem;">${isOrder ? "Selesaikan pesanan item Anda." : "Lengkapi data untuk proses booking."}</p>
        </div>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; border: 1px solid #e2e8f0;">
            <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 5px;">${isOrder ? "Item yang diorder:" : "Rincian Booking:"}</p>
            <h3 style="color: var(--text-dark); margin-bottom: 5px;">${itemName}</h3>
            ${isOrder ? `<p style="font-weight: bold; color: var(--primary-green); font-size: 1.1rem;">${displayPrice}</p>` : ""}
        </div>

        <form id="checkout-form" onsubmit="event.preventDefault(); processCheckout('${itemName}', ${price || 0});">
            <div class="form-group mb-3">
                <label>Nama Lengkap</label>
                <input type="text" id="co-name" class="form-control" required placeholder="Masukkan nama Anda">
            </div>
            <div class="form-group mb-3">
                <label>Nomor WhatsApp</label>
                <input type="text" id="co-phone" class="form-control" required placeholder="Contoh: 08123456789">
            </div>
            <div style="display: flex; gap: 15px;">
                <div class="form-group mb-3" style="flex: 1;">
                    <label>Tanggal Mulai</label>
                    <input type="date" id="co-start-date" class="form-control" required onchange="if(window.checkDateOverlap) window.checkDateOverlap()">
                </div>
                <div class="form-group mb-3" style="flex: 1;">
                    <label>Tanggal Selesai</label>
                    <input type="date" id="co-end-date" class="form-control" required onchange="if(window.checkDateOverlap) window.checkDateOverlap()">
                </div>
            </div>
            <div id="dynamic-date-warning" style="display: none; margin-bottom: 15px; font-size: 0.85rem; color: #ef4444; background: #fff1f2; padding: 10px; border-radius: 8px; border: 1px solid #fecdd3;">
                <strong><i class="fa-solid fa-triangle-exclamation"></i> Maaf, rentang tanggal yang Anda pilih bentrok dengan jadwal yang sudah dipesan! Silakan pilih tanggal lain.</strong>
            </div>`;

    if (isOrder) {
        html += `
            <div class="form-group mb-4">
                <label>Metode Pembayaran</label>
                <select id="co-payment" class="form-control" required onchange="const d = document.getElementById('bank-details'); if(this.value==='manual') d.style.display='block'; else d.style.display='none';">
                    <option value="qris">QRIS Otomatis (Verifikasi Instan)</option>
                    <option value="manual">Transfer Manual (Verifikasi WA)</option>
                </select>
            </div>
            
            <div id="bank-details" style="display: none; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #cbd5e1;">
                <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 10px;">Silakan transfer ke salah satu rekening berikut:</p>
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px; background: white; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <img src="/mandiri.svg" style="height: 25px; object-fit: contain;" alt="Mandiri">
                    <div>
                        <div style="font-weight: bold; color: var(--text-dark); font-size: 0.9rem;">LALU RENGGANE</div>
                        <div style="color: var(--primary-blue); font-weight: bold; letter-spacing: 1px;">1610017191425</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 15px; background: white; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <img src="/bri.svg" style="height: 25px; object-fit: contain;" alt="BRI">
                    <div>
                        <div style="font-weight: bold; color: var(--text-dark); font-size: 0.9rem;">LALU RENGGANE</div>
                        <div style="color: var(--primary-blue); font-weight: bold; letter-spacing: 1px;">759801017387536</div>
                    </div>
                </div>
            </div>

            <button type="submit" class="btn btn-green w-100" style="padding: 12px; font-size: 1.1rem;">LANJUTKAN PEMBAYARAN</button>
        `;
    } else {
        html += `
            <input type="hidden" id="co-payment" value="booking_only">
            <button type="submit" class="btn btn-green w-100" style="padding: 12px; font-size: 1.1rem;">KIRIM BOOKING</button>
        `;
    }

    html += `</form>
        <div id="qris-result" style="margin-top: 25px;"></div>
    `;
    
    modalBody.innerHTML = html;
    document.getElementById("checkout-modal").classList.add("active");
};

window.checkDateOverlap = () => {
    const startDate = document.getElementById("co-start-date").value;
    const endDate = document.getElementById("co-end-date").value;
    const warningDiv = document.getElementById("dynamic-date-warning");
    const submitBtn = document.querySelector("#checkout-form button[type='submit']");
    
    if (!startDate || !endDate) {
        warningDiv.style.display = 'none';
        if(submitBtn) submitBtn.disabled = false;
        return;
    }
    
    const selStart = new Date(startDate);
    const selEnd = new Date(endDate);
    
    let isOverlap = false;
    if (window.currentBookings && window.currentBookings.length > 0) {
        for (let b of window.currentBookings) {
            const bStart = new Date(b.startDate);
            const bEnd = new Date(b.endDate);
            if (selStart <= bEnd && selEnd >= bStart) {
                isOverlap = true;
                break;
            }
        }
    }
    
    if (isOverlap) {
        warningDiv.style.display = 'block';
        if(submitBtn) submitBtn.disabled = true;
    } else {
        warningDiv.style.display = 'none';
        if(submitBtn) submitBtn.disabled = false;
    }
};

window.processCheckout = async (itemName, price) => {
    const name = document.getElementById("co-name").value;
    const phone = document.getElementById("co-phone").value;
    const startDate = document.getElementById("co-start-date").value;
    const endDate = document.getElementById("co-end-date").value;
    const payment = document.getElementById("co-payment").value;
    const modalBody = document.getElementById("checkout-modal-body");

    if (!startDate || !endDate) {
        Swal.fire({icon: 'info', title: 'Pemberitahuan', text: "Mohon isi tanggal mulai dan selesai.", confirmButtonColor: '#22c55e'});
        return;
    }

    const selStart = new Date(startDate);
    const selEnd = new Date(endDate);
    if (selStart > selEnd) {
        Swal.fire({icon: 'info', title: 'Pemberitahuan', text: "Tanggal selesai tidak boleh lebih awal dari tanggal mulai.", confirmButtonColor: '#22c55e'});
        return;
    }
    
    if (window.currentBookings && window.currentBookings.length > 0) {
        for (let b of window.currentBookings) {
            const bStart = new Date(b.startDate);
            const bEnd = new Date(b.endDate);
            if (selStart <= bEnd && selEnd >= bStart) {
                Swal.fire({icon: 'info', title: 'Pemberitahuan', text: "Maaf, rentang tanggal tersebut sudah dipesan. Silakan pilih tanggal lain.", confirmButtonColor: '#22c55e'});
                return;
            }
        }
    }

    const bookingData = {
        itemName,
        customerName: name,
        phone,
        startDate,
        endDate,
        price
    };
    
    // Store temporarily for QRIS success
    window.currentCheckoutData = bookingData;

    if (payment === "booking_only") {
        const transactionId = "BKG-" + Math.floor(Math.random() * 10000);
        try {
            await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...bookingData, status: 'PENDING', transactionId })
            });
        } catch (e) { console.error(e); }
        simulateQrisSuccess(true, transactionId);
        return;
    }

    if (payment === "manual") {
        const transactionId = "BKG-" + Math.floor(Math.random() * 10000);
        try {
            await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...bookingData, status: 'PENDING', transactionId })
            });
        } catch (e) { console.error(e); }

        const text = `Halo Admin Travel Lombok Airport,\n\nSaya telah melakukan Booking via Website dengan rincian:\n\n- ID Booking: ${transactionId}\n- Item: ${itemName}\n- Atas Nama: ${name}\n- WhatsApp: ${phone}\n- Tanggal: ${startDate} s/d ${endDate}\n- Metode: Transfer Manual\n\nMohon instruksi untuk pembayaran selanjutnya. Terima kasih!`;
        window.open(`https://wa.me/6289676963255?text=${encodeURIComponent(text)}`, "_blank");
        closeCheckoutModal();
        return;
    }

    const qrisResult = document.getElementById("qris-result");
    const submitBtn = document.querySelector("#checkout-form button[type='submit']");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> MEMPROSES...';
    }

    // Real QRIS Flow via Backend Instanpay
    qrisResult.innerHTML = `
        <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #cbd5e1;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-blue); margin-bottom: 10px;"></i>
            <p style="color: var(--text-gray); font-size: 0.9rem;">Sedang membuat kode pembayaran QRIS...</p>
        </div>
    `;

    try {
        fetch(`${API_URL}/payment/qris`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: price, customer_name: name })
        }).then(res => res.json()).then(result => {
            if (result.success) {
                const data = result.data;
                qrisResult.innerHTML = `
                    <div style="background: white; padding: 20px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center; border: 2px dashed var(--primary-green);">
                        <h3 style="color: var(--primary-blue); margin-bottom: 5px;">Scan QRIS</h3>
                        <p style="color: #64748b; font-size: 0.85rem; margin-bottom: 15px;">Buka aplikasi M-Banking / E-Wallet Anda lalu scan kode di bawah.</p>
                        
                        <div style="display: flex; justify-content: center; margin-bottom: 15px;">
                            ${data.qrCodeSvg}
                        </div>
                        
                        <h4 style="color: var(--text-dark); margin-bottom: 5px;">${itemName}</h4>
                        <p style="font-size: 1.5rem; font-weight: bold; color: var(--primary-green); margin-bottom: 10px;">${data.totalFormatted}</p>
                        
                        <div style="background: #fff1f2; color: #e11d48; padding: 8px; border-radius: 8px; font-size: 0.85rem; display: inline-block; margin-bottom: 15px;">
                            <i class="fa-regular fa-clock"></i> Batas Waktu: ${data.expiredAt}
                        </div>
                        
                        <div style="color: var(--primary-blue); font-size: 0.9rem; margin-bottom: 15px;">
                            <i class="fa-solid fa-spinner fa-spin"></i> Sistem sedang menunggu pembayaran...
                        </div>
                        <div id="manual-check-msg" style="color: #ef4444; font-size: 0.85rem; margin-bottom: 10px; font-weight: bold;"></div>
                        <button type="button" class="btn btn-blue" style="width: 100%; padding: 10px; font-weight: bold; border-radius: 8px;" onclick="forcePaymentSuccess('${data.transactionId}', this)">SAYA SUDAH BAYAR</button>
                    </div>
                `;

                window.forcePaymentSuccess = async (txId, btnElement) => {
                    const originalText = btnElement.innerHTML;
                    btnElement.disabled = true;
                    btnElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> MENGECEK...';
                    const msgDiv = document.getElementById('manual-check-msg');
                    if (msgDiv) msgDiv.innerHTML = '';
                    
                    try {
                        const statusRes = await fetch(`${API_URL}/payment/status/${txId}`);
                        const statusData = await statusRes.json();
                        if (statusData.success && statusData.data.status === 'PAID') {
                            if (window.activePollInterval) clearInterval(window.activePollInterval);
                            window.simulateQrisSuccess(false, "ORD-" + txId);
                        } else {
                            if (msgDiv) msgDiv.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Maaf anda belum melakukan pembayaran, Harap selesaikan pembayaran terlebih dahulu.';
                        }
                    } catch (e) {
                        if (msgDiv) msgDiv.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Terjadi kesalahan jaringan. Gagal mengecek.';
                    } finally {
                        btnElement.disabled = false;
                        btnElement.innerHTML = originalText;
                    }
                };

                const pollInterval = setInterval(async () => {
                    try {
                        const statusRes = await fetch(`${API_URL}/payment/status/${data.transactionId}`);
                        const statusData = await statusRes.json();
                        
                        if (statusData.success && statusData.data.status === 'PAID') {
                            clearInterval(pollInterval);
                            window.simulateQrisSuccess(false, "ORD-" + data.transactionId);
                        } else if (statusData.success && statusData.data.status === 'EXPIRED') {
                            clearInterval(pollInterval);
                            qrisResult.innerHTML = `
                                <div style="text-align: center; padding: 20px; background: #fff1f2; border: 1px solid #fda4af; border-radius: 12px; margin-top: 20px;">
                                    <i class="fa-solid fa-circle-xmark" style="font-size: 3rem; color: #ef4444; margin-bottom: 15px;"></i>
                                    <h3 style="color: #ef4444;">Pembayaran Kedaluwarsa</h3>
                                    <p style="color: var(--text-dark); font-size: 0.9rem;">Waktu pembayaran telah habis. Silakan tutup dan buat pesanan ulang.</p>
                                </div>
                            `;
                        }
                    } catch (e) { console.error(e); }
                }, 5000);
                window.activePollInterval = pollInterval;

            } else {
                qrisResult.innerHTML = `<div class="text-center text-danger p-4" style="background: #fff1f2; border-radius: 12px; margin-top: 20px;">Gagal memuat kode QRIS. Silakan coba lagi.</div>`;
                if(submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'COBA LAGI'; }
            }
        }).catch(e => {
            qrisResult.innerHTML = `<div class="text-center text-danger p-4" style="background: #fff1f2; border-radius: 12px; margin-top: 20px;">Koneksi error. Silakan coba lagi.</div>`;
            if(submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'COBA LAGI'; }
        });
    } catch (e) {
        qrisResult.innerHTML = `<div class="text-center text-danger p-4" style="background: #fff1f2; border-radius: 12px; margin-top: 20px;">Terjadi kesalahan internal.</div>`;
        if(submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'COBA LAGI'; }
    }
};

window.simulateQrisSuccess = async (isBookingOnly, transactionId) => {
    const modalBody = document.getElementById("checkout-modal-body");
    const idPrefix = isBookingOnly ? "BKG-" : "ORD-";
    const id = transactionId || (idPrefix + Math.floor(Math.random() * 10000));
    
    if (window.activePollInterval) clearInterval(window.activePollInterval);
    
    // Save PAID booking for QRIS if data exists
    if (!isBookingOnly && window.currentCheckoutData) {
        try {
            await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...window.currentCheckoutData, status: 'PAID', transactionId: id })
            });
        } catch (e) { console.error("Failed to save QRIS booking:", e); }
        window.currentCheckoutData = null; // Clear it
    }
    
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            <i class="fa-solid fa-circle-check" style="font-size: 5rem; color: var(--primary-green); margin-bottom: 20px;"></i>
            <h2 style="color: var(--text-dark); margin-bottom: 10px;">${isBookingOnly ? "Booking Berhasil!" : "Pembayaran Berhasil!"}</h2>
            <p style="color: #64748b; margin-bottom: 20px;">Terima kasih, pesanan Anda telah kami terima.</p>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px dashed #cbd5e1; margin-bottom: 25px;">
                <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 5px;">Nomor Refrensi Anda:</p>
                <h3 style="color: var(--primary-blue); font-family: monospace; font-size: 1.5rem; letter-spacing: 2px;">${id}</h3>
            </div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <button onclick="downloadPdfInvoice('${id}')" class="btn btn-primary" style="flex: 1; background: #10b981;"><i class="fa-solid fa-file-pdf"></i> Unduh e-Tiket</button>
            </div>
            <button onclick="closeCheckoutModal()" class="btn btn-outline" style="width: 100%;">TUTUP</button>
            
            <!-- Hidden PDF Template -->
            <div id="pdf-template" style="display: none; text-align: left; padding: 40px; font-family: sans-serif; color: #333;">
                <div style="border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h1 style="color: #2563eb; margin: 0; font-size: 24px;">TRAVEL LOMBOK AIRPORT</h1>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">e-Tiket & Kwitansi Resmi</p>
                    </div>
                    <div style="text-align: right;">
                        <h3 style="margin: 0; color: #10b981;">LUNAS</h3>
                        <p style="margin: 5px 0 0 0; font-size: 14px;">Ref: ${id}</p>
                    </div>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd; background: #f8fafc; width: 40%; font-weight: bold;">Layanan</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${window.currentCheckoutData ? window.currentCheckoutData.itemName : 'Layanan Travel Lombok'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd; background: #f8fafc; font-weight: bold;">Nama Tamu</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${window.currentCheckoutData ? window.currentCheckoutData.customerName : '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd; background: #f8fafc; font-weight: bold;">Tanggal Jemput</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${window.currentCheckoutData ? new Date(window.currentCheckoutData.startDate).toLocaleDateString('id-ID') : '-'}</td>
                    </tr>
                </table>
                
                <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 8px;">
                    <p style="margin: 0; font-size: 14px; color: #666;">Terima kasih telah mempercayakan perjalanan Anda kepada kami.</p>
                    <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold;">Simpan e-Tiket ini dan tunjukkan kepada supir kami saat penjemputan.</p>
                </div>
            </div>
        </div>
    `;
};

window.downloadPdfInvoice = (id) => {
    const element = document.getElementById('pdf-template');
    element.style.display = 'block';
    
    const opt = {
      margin:       0.5,
      filename:     `e-Tiket_${id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
        element.style.display = 'none';
    });
};

// Load dynamic stats
const loadStats = async () => {
    try {
        const res = await fetch(`${API_URL}/stats`);
        if (res.ok) {
            const stats = await res.json();
            if (stats.customers) document.getElementById("stat-val-customers").innerText = stats.customers;
            if (stats.fleet) document.getElementById("stat-val-fleet").innerText = stats.fleet;
            if (stats.trips) document.getElementById("stat-val-trips").innerText = stats.trips;
            if (stats.support) document.getElementById("stat-val-support").innerText = stats.support;
        }
    } catch (e) {
        console.error("Failed to load stats:", e);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    loadStats();
});



