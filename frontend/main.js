if (!window.location.pathname.includes("admin") && !window.location.pathname.includes("driver")) { document.addEventListener("contextmenu", e => e.preventDefault()); document.addEventListener("keydown", e => { if (e.ctrlKey && (e.key === "c" || e.key === "u" || e.key === "s" || e.key === "p")) { e.preventDefault(); } if (e.key === "F12") { e.preventDefault(); } }); }
// ====== API ENDPOINT ======
// Changed so that localhost hits Vite proxy on /api exactly like production
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '/api' : '/api';

window.forcePaymentSuccess = async (txId, btnElement) => {
    const originalText = btnElement.innerHTML;
    btnElement.disabled = true;
    btnElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> MENGECEK...';
    const msgDiv = document.getElementById('manual-check-msg');
    if (msgDiv) msgDiv.innerHTML = '';

    try {
        const statusRes = await fetch(`${API_URL}/payment/status/${txId}`);
        const statusData = await statusRes.json();
        if (statusData.success && ['PAID', 'SUCCESS', 'SETTLEMENT', 'COMPLETED'].includes(statusData.data.status?.toUpperCase())) {
            if (window.activePollInterval) clearInterval(window.activePollInterval);
            window.simulateQrisSuccess(false, txId);
        } else {
            if (msgDiv) msgDiv.innerHTML = '<i class="fa-solid fa-clock"></i> Sistem masih memproses/menunggu pembayaran Anda. Jika Anda sudah membayar, harap tunggu beberapa saat atau periksa di <a href="/riwayat.html" style="color: inherit; text-decoration: underline;">Riwayat Transaksi</a>.';
        }
    } catch (e) {
        if (msgDiv) msgDiv.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Terjadi kesalahan jaringan. Gagal mengecek.';
    } finally {
        btnElement.disabled = false;
        btnElement.innerHTML = originalText;
    }
};

window.generateTicketId = (prefix) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const nums = '0123456789';
    let res = prefix;
    for (let i = 0; i < 5; i++) {
        res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    res += nums.charAt(Math.floor(Math.random() * nums.length));
    return res;
};

window.copyText = (text, btnElement, successHtml, defaultHtml, event) => {
    if (event) event.stopPropagation();
    
    const handleSuccess = () => {
        if (btnElement) {
            btnElement.innerHTML = successHtml;
            if (btnElement.tagName === 'BUTTON' && !successHtml.includes('fa-check')) {
                 btnElement.style.background = '#10b981';
            }
            setTimeout(() => { 
                btnElement.innerHTML = defaultHtml; 
                if (btnElement.tagName === 'BUTTON' && !successHtml.includes('fa-check')) {
                    btnElement.style.background = '';
                }
            }, 2000);
        } else {
            Swal.fire({icon: 'success', title: 'Tersalin!', toast: true, position: 'top', showConfirmButton: false, timer: 1500});
        }
    };

    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(handleSuccess).catch(err => {
            console.error('Gagal menyalin:', err);
        });
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            handleSuccess();
        } catch (err) {
            console.error('Gagal menyalin:', err);
        }
        document.body.removeChild(textArea);
    }
};

// ====== MAINTENANCE MODE CHECK + EVENT MODE FETCH ======
// Run ASAP before page renders, skip for admin/maintenance/login pages
(async () => {
    const path = window.location.pathname;
    const skipPaths = ['/admin', '/maintenance', '/login', '/register', '/verify', '/driver'];
    const isSkipped = skipPaths.some(p => path.includes(p));
    if (isSkipped) return;

    try {
        const res = await fetch('/api/settings', { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            
            // Check if admin is logged in (admins bypass maintenance)
            const adminToken = localStorage.getItem('adminToken');
            
            if (data.maintenanceMode === true && !adminToken) {
                localStorage.setItem('maintenanceMode', 'true');
                window.location.replace('/maintenance.html');
                return;
            } else if (!adminToken) {
                localStorage.setItem('maintenanceMode', 'false');
                const antiFlash = document.getElementById('anti-flash');
                if (antiFlash) antiFlash.remove();
                document.body.style.opacity = '1';
                document.body.style.visibility = 'visible';
                document.body.style.pointerEvents = 'auto';
            } else if (adminToken) {
                // Admin also needs to remove anti-flash if present (usually handled by other scripts but good to have)
                const antiFlash = document.getElementById('anti-flash');
                if (antiFlash) antiFlash.remove();
                document.body.style.opacity = '1';
                document.body.style.visibility = 'visible';
                document.body.style.pointerEvents = 'auto';
            }

            // ====== STORE EVENT MODE SETTINGS GLOBALLY ======
            window.globalEventSettings = {
                eventMode: data.eventMode === true,
                eventName: data.eventName || '',
                eventPriceIncrease: parseInt(data.eventPriceIncrease) || 0
            };

            // Inject event banner jika event aktif
            if (data.eventMode === true && data.eventPriceIncrease > 0) {
                const eventBanner = document.createElement('div');
                eventBanner.id = 'event-mode-banner';
                eventBanner.innerHTML = `
                    <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; text-align: center; padding: 12px 52px 12px 16px; font-size: 0.85rem; font-weight: 600; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999; box-shadow: 0 -4px 15px rgba(0,0,0,0.2); transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);">
                        <i class="fa-solid fa-fire" style="margin-right: 6px;"></i>
                        🎉 ${data.eventName ? `EVENT: <strong>${data.eventName}</strong> —` : 'HIGH SEASON!'} 
                        Harga Motor & Mobil naik <strong>Rp ${parseInt(data.eventPriceIncrease).toLocaleString('id-ID')}</strong>/unit &nbsp;|&nbsp; 
                        <i class="fa-solid fa-calendar-days"></i> Min. sewa <strong>4 Hari</strong>
                        <button onclick="window.dismissEventBanner()" class="event-banner-close-btn" title="Sembunyikan Pengumuman" aria-label="Sembunyikan Pengumuman">
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                `;
                // Insert at top of body
                if (document.body.firstChild) {
                    document.body.insertBefore(eventBanner, document.body.firstChild);
                } else {
                    document.body.appendChild(eventBanner);
                }
                
                // Fix overlay chat widget
                const styleObj = document.createElement('style');
                styleObj.id = 'event-chat-fix';
                styleObj.innerHTML = `
                    #ai-chat-widget { bottom: 65px !important; }
                    @media (max-width: 480px) {
                        #ai-chat-btn { bottom: 60px !important; }
                    }
                `;
                document.head.appendChild(styleObj);

                window.dismissEventBanner = () => {
                    const banner = document.getElementById('event-mode-banner');
                    if (banner) {
                        banner.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
                        banner.style.transform = 'translateX(100%)';
                        banner.style.opacity = '0';
                        setTimeout(() => {
                            banner.remove();
                            document.getElementById('event-chat-fix')?.remove();
                        }, 350);
                    }
                };

                // Show professional popup for event
                if (!sessionStorage.getItem('eventPopupShown')) {
                    sessionStorage.setItem('eventPopupShown', 'true');
                    setTimeout(() => {
                        const evtName = data.eventName || 'High Season';
                        Swal.fire({
                            title: `🔥 Info Event: ${evtName}`,
                            html: `
                                <div style="text-align: left; color: #334155; margin-top: 10px;">
                                    <div style="display: flex; align-items: center; gap: 15px; background: #fffbeb; padding: 15px; border-radius: 16px; margin-bottom: 12px; border: 1px solid #fde68a;">
                                        <div style="background: #f59e0b; color: white; width: 45px; height: 45px; border-radius: 12px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; font-size: 1.3rem;">
                                            <i class="fa-solid fa-car"></i>
                                        </div>
                                        <div>
                                            <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #b45309;">Sewa Mobil & Motor</h4>
                                            <p style="margin: 4px 0 0; font-size: 0.85rem; line-height: 1.4;">Terdapat penyesuaian harga khusus event. Minimum sewa <strong>4 Hari</strong>.</p>
                                        </div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 15px; background: #f0f9ff; padding: 15px; border-radius: 16px; border: 1px solid #bae6fd;">
                                        <div style="background: #0ea5e9; color: white; width: 45px; height: 45px; border-radius: 12px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; font-size: 1.3rem;">
                                            <i class="fa-solid fa-umbrella-beach"></i>
                                        </div>
                                        <div>
                                            <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #0369a1;">Paket Wisata</h4>
                                            <p style="margin: 4px 0 0; font-size: 0.85rem; line-height: 1.4;">Harga paket tour/honeymoon dapat berubah. Hubungi <strong>Admin</strong> untuk info final.</p>
                                        </div>
                                    </div>
                                </div>
                            `,
                            showConfirmButton: true,
                            confirmButtonText: '<i class="fa-solid fa-check"></i> Saya Mengerti',
                            confirmButtonColor: '#0ea5e9',
                            width: '480px',
                            customClass: { popup: 'modern-popup-radius' },
                            backdrop: `rgba(15,23,42,0.8)`
                        });
                    }, 1000); // delay 1 second after load
                }
            }
            // ====== END EVENT MODE ======

        }
    } catch (e) {
        // If API fails, don't block the page
    }
})();



// ====== ANALYTICS TRACKING ======
if (!window.location.pathname.includes("admin") && !window.location.pathname.includes("driver")) {
    const trackVisitor = async () => {
        try {
            // Generate a simple pseudo-hash for the IP/session using User-Agent + Date
            // In a real app, the backend usually gets the IP, but here we can pass a session ID
            let sessionId = localStorage.getItem('visitor_session_id');
            if (!sessionId) {
                sessionId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
                localStorage.setItem('visitor_session_id', sessionId);
            }
            
            await fetch(`${API_URL}/analytics/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: window.location.pathname + window.location.hash,
                    userAgent: navigator.userAgent,
                    ipHash: sessionId, // Using session ID as proxy for unique IP
                    screenWidth: window.innerWidth || screen.width
                })
            });
        } catch (e) {
            console.error('Failed to track visitor:', e);
        }
    };
    // Run after a short delay so it doesn't block main render
    setTimeout(trackVisitor, 2000);
}
// Pre-populated fallback catalog so AIRA and checkout have item data available instantly from millisecond 0
const DEFAULT_ITEMS_FALLBACK = [
    { id: "LvfuiPmrQtrnNHfNwm41", title: "Beat Streat", category: "motorcycle", price: 100000, imageUrl: "https://pdftourl.net/images/1787666229953-31797ace-36c3-4ac6-b353-02a4256b218c.jpg" },
    { id: "971yg94u5mOOkP69GuIc", title: "Vario 125cc", category: "motorcycle", price: 125000, imageUrl: "https://pdftourl.net/images/1787666283472-9c2b6ec1-f1df-49f1-9ecf-82b70101908b.png" },
    { id: "r1KZVYC4Mzflorog0wCw", title: "Nmax", category: "motorcycle", price: 150000, imageUrl: "https://pdftourl.net/images/1787666283472-9c2b6ec1-f1df-49f1-9ecf-82b70101908b.png" },
    { id: "CFEX6jKm1VEQEnNKYb4z", title: "Pcx", category: "motorcycle", price: 150000, imageUrl: "https://pdftourl.net/images/1787666336366-952b61ef-3795-4d17-814b-6485282e5954.jpg" },
    { id: "UklBI5U9PjfqV3W1AJTA", title: "Adv", category: "motorcycle", price: 200000, imageUrl: "https://pdftourl.net/images/1787666384358-67e0ac79-97b0-42ea-9849-f1e230d8468c.jpg" },
    { id: "alF6YcOxeGy7X3eM2m9l", title: "Pricelist Airport Transfer | Travel Lombok Airport", category: "transfer", price: 180000, imageUrl: "https://res.cloudinary.com/mvhjuh83/image/upload/v1791628291/du5jt1ufpwakypfhbplg.png" },
    { id: "9AePXs8BuY9TMuxhonNF", title: "Agya", category: "car", price: 350000, imageUrl: "https://res.cloudinary.com/mvhjuh83/image/upload/v1790903895/ageeuoal2iijfchxg1n3.jpg" },
    { id: "0gbR6thtAobaUckQROR7", title: "Honda Brio", category: "car", price: 350000, imageUrl: "https://res.cloudinary.com/mvhjuh83/image/upload/v1790903796/oyrisbvzwrgeeihzmjfq.webp" },
    { id: "1zLiCgu9QdlmrLBM9XRo", title: "Avanza fl", category: "car", price: 400000, imageUrl: "https://pdftourl.net/images/1787667131060-f9567cf8-e0c6-4538-9f35-a96b4b5a3969.jpg" },
    { id: "l4VmQB0wOvORB7q59hhV", title: "Xpander", category: "car", price: 450000, imageUrl: "https://res.cloudinary.com/mvhjuh83/image/upload/v1790898576/t3lw5gcgxyglbmga6763.jpg" },
    { id: "ok86nCsbfCfg2oKHxylW", title: "New Avanza", category: "car", price: 450000, imageUrl: "https://res.cloudinary.com/mvhjuh83/image/upload/v1790898806/k76ir1sgjezdp6lzh204.jpg" },
    { id: "L3f5b2E7afIh2OXB0hJ1", title: "Rize", category: "car", price: 500000, imageUrl: "https://res.cloudinary.com/mvhjuh83/image/upload/v1790898703/wgylkctz4pran9vi8xgd.jpg" },
    { id: "gkRMusGXBBrdiFk8x5JN", title: "WRV", category: "car", price: 500000, imageUrl: "https://cdn.phototourl.com/member/2026-08-22-7a447edb-0644-48f0-8f40-e73dd097a8c0.jpg" },
    { id: "kNMm9aaYG5zrznB3mLvE", title: "Innova Reborn", category: "car", price: 600000, imageUrl: "https://cdn.phototourl.com/member/2026-08-22-4bda7fe9-8dc4-40b9-8454-2ea59a5acb3e.jpg" },
    { id: "WRRBiBx73GZsxS7w8BDS", title: "Innova Zenix", category: "car", price: 850000, imageUrl: "https://cdn.phototourl.com/member/2026-08-22-b241e068-085c-4fa9-8db4-632a54dba214.jpg" },
    { id: "qK4z4XVgCpyUckkZwtDQ", title: "Fortuner", category: "car", price: 1300000, imageUrl: "https://cdn.phototourl.com/member/2026-08-22-bcb238f0-9388-4982-937e-a69c11a4cf43.jpg" },
    { id: "wHBwON7FyLVavUciRARk", title: "Hiace Commuter", category: "car", price: 1350000, imageUrl: "https://res.cloudinary.com/mvhjuh83/image/upload/v1790898388/sms6mx4ccouyzbsdugb6.jpg" },
    { id: "Egwn14A72dGJ2gPY7OUb", title: "Hiace Premio", category: "car", price: 1500000, imageUrl: "https://pdftourl.net/images/1787666454044-9eb1ffae-e7da-449e-ab9f-ac00d9739dc0.jpg" },
    { id: "i8vdprFaGGLPY33wm5A5", title: "Alphard", category: "car", price: 3600000, imageUrl: "https://cdn.phototourl.com/member/2026-08-22-790c32ad-1aa6-433f-8742-32a8994e63f3.jpg" },
    { id: "u24hdfCU7XWQ7kZpgAI2", title: "Paket Private Trip Lombok 3H 2M (Paket C)", category: "package", price: 2600000, imageUrl: "https://res.cloudinary.com/mvhjuh83/image/upload/v1791629985/scuwan3qaepi5zick1e7.jpg" },
    { id: "yPiSiYL5WawMkbZ7zUtw", title: "Paket C Private Honeymoon Lombok 3H 2M", category: "honeymoon", price: 2600000, imageUrl: "https://res.cloudinary.com/mvhjuh83/image/upload/v1787939859/ilvig5w6gimlkpqirqeg.jpg" },
    { id: "CPme14FRrFmi1hmjkTSr", title: "Paket B Private Honeymoon Lombok 3H 2M", category: "honeymoon", price: 3100000, imageUrl: "https://res.cloudinary.com/mvhjuh83/image/upload/v1791630120/qjawxa9umiqrs9bijhjt.jpg" }
];
let globalItems = [...DEFAULT_ITEMS_FALLBACK];
window.globalItems = globalItems;


// ====== WISHLIST SYSTEM ======
window.getWishlist = () => {
    try {
        return JSON.parse(localStorage.getItem('app_wishlist')) || [];
    } catch (e) {
        return [];
    }
};

window.isInWishlist = (id) => {
    return window.getWishlist().includes(id);
};

window.toggleWishlist = (id) => {
    let wishlist = window.getWishlist();
    if (wishlist.includes(id)) {
        wishlist = wishlist.filter(item => item !== id);
    } else {
        wishlist.push(id);
    }
    localStorage.setItem('app_wishlist', JSON.stringify(wishlist));
    
    // Update UI if the button exists on the screen
    const btn = document.getElementById(`btn-wishlist-${id}`);
    if (btn) {
        const icon = btn.querySelector('i');
        if (wishlist.includes(id)) {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            icon.style.color = '#ef4444';
        } else {
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
            icon.style.color = '';
        }
    }
    
    // Optional: show a small toast notification
    // alert(wishlist.includes(id) ? 'Disimpan ke Wishlist!' : 'Dihapus dari Wishlist');
};

let EXCHANGE_RATES = {
    IDR: 1,
    USD: 15500,
    AUD: 10000,
    EUR: 16500,
    SGD: 11600,
    MYR: 3500,
    GBP: 19700,
    CNY: 2200,
    JPY: 105
};

// Fetch real-time exchange rates
const fetchRealtimeRates = async () => {
    try {
        const response = await fetch(`${API_URL}/rates`);
        if (!response.ok) return;
        const rates = await response.json();
        
        // Rates are relative to USD usually in free APIs, wait, we fetched open.er-api.com/v6/latest/IDR
        // So the rates are relative to IDR.
        // e.g., 1 IDR = 0.000064 USD
        // Our formula converted = num / rate. So rate = IDR per 1 USD (e.g. 15500)
        // If API gives USD = 0.000064, then rate = 1 / 0.000064 = ~15625
        if (rates && rates.USD) {
            EXCHANGE_RATES = {
                USD: 1 / rates.USD,
                AUD: 1 / rates.AUD,
                EUR: 1 / rates.EUR,
                SGD: 1 / rates.SGD,
                MYR: 1 / rates.MYR,
                GBP: 1 / rates.GBP,
                CNY: 1 / rates.CNY,
                JPY: 1 / rates.JPY,
                SAR: 1 / rates.SAR
            };
            
            // Re-render items if they are already loaded
            if (document.getElementById('packages-grid') && document.getElementById('packages-grid').innerHTML !== '') {
                loadItems('paket');
            }
            if (document.getElementById('cars-grid') && document.getElementById('cars-grid').innerHTML !== '') {
                loadItems('mobil');
            }
        }
    } catch (error) {
        console.error('Failed to fetch realtime rates:', error);
    }
};

// Call fetch on load
fetchRealtimeRates();

const formatPrice = (price) => {
    const currency = localStorage.getItem('app_currency') || 'IDR';
    const rate = EXCHANGE_RATES[currency] || 1;

    if (!price) {
        if (currency === 'USD') return '$0';
        if (currency === 'AUD') return 'A$0';
        if (currency === 'EUR') return '€0';
        if (currency === 'SGD') return 'S$0';
        if (currency === 'MYR') return 'RM0';
        if (currency === 'GBP') return '£0';
        if (currency === 'CNY') return '¥0';
        if (currency === 'JPY') return '¥0';
        if (currency === 'SAR') return 'ر.س0';
        return 'Rp 0';
    }
    
    // Parse the number regardless of existing formatting
    let num = 0;
    if (typeof price === 'string' && price.toLowerCase().includes('rp')) {
        num = parseInt(price.replace(/\D/g, ''), 10);
    } else {
        num = parseInt(price.toString().replace(/\D/g, ''), 10);
    }
    
    if (isNaN(num)) return price;

    const converted = num / rate;

    if (currency === 'USD') {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(converted);
    } else if (currency === 'AUD') {
        return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0 }).format(converted);
    } else if (currency === 'EUR') {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(converted);
    } else if (currency === 'SGD') {
        return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', minimumFractionDigits: 0 }).format(converted);
    } else if (currency === 'MYR') {
        return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0 }).format(converted);
    } else if (currency === 'GBP') {
        return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0 }).format(converted);
    } else if (currency === 'CNY') {
        return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', minimumFractionDigits: 0 }).format(converted);
    } else if (currency === 'JPY') {
        return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', minimumFractionDigits: 0 }).format(converted);
    } else if (currency === 'SAR') {
        return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(converted);
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(num);
};

window.formatPrice = formatPrice;

// ====== CATEGORY & ICON HELPER ======
window.getItemCategoryMeta = (itemOrName, optCategory = '') => {
    const rawName = typeof itemOrName === 'string' 
        ? itemOrName 
        : (itemOrName?.itemName || itemOrName?.title || itemOrName?.serviceName || '');
    const nameLower = (rawName || '').toLowerCase();
    let cat = (optCategory || (typeof itemOrName === 'object' ? itemOrName?.category : '') || '').toLowerCase();

    // Cek item di global catalog (window.globalItems) jika kategori belum diketahui
    if (!cat && window.globalItems && Array.isArray(window.globalItems)) {
        const found = window.globalItems.find(g => 
            g.title === rawName || 
            (rawName && rawName.toLowerCase().includes((g.title || '').toLowerCase())) ||
            (g.id && typeof itemOrName === 'object' && (g.id === itemOrName?.itemId || g.id === itemOrName?.id))
        );
        if (found && found.category) cat = found.category.toLowerCase();
    }

    // 1. HONEYMOON (Hanya jika category memang honeymoon atau judul jelas mengandung honeymoon/bulan madu)
    if (
        cat === 'honeymoon' ||
        nameLower.includes('honeymoon') ||
        nameLower.includes('bulan madu')
    ) {
        return {
            key: 'honeymoon',
            label: 'Paket Honeymoon',
            icon: 'fa-heart',
            color: '#e11d48',
            bgColor: '#fff1f2',
            gradient: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
            borderColor: '#fecdd3',
            shadow: 'rgba(225, 29, 72, 0.18)'
        };
    }

    // 2. MOTOR / MOTORCYCLE
    if (
        cat === 'motorcycle' || cat === 'motor' ||
        /(motor|motorcycle|nmax|vario|pcx|beat|scoopy|aerox|fazzio|adv|vespa|lexi|genio|mio)/i.test(nameLower)
    ) {
        return {
            key: 'motor',
            label: 'Rental Motor',
            icon: 'fa-motorcycle',
            color: '#d97706',
            bgColor: '#fffbeb',
            gradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            borderColor: '#fde68a',
            shadow: 'rgba(217, 119, 6, 0.18)'
        };
    }

    // 3. AIRPORT TRANSFER / ANTAR JEMPUT BANDARA
    if (
        cat === 'transfer' || cat === 'airport' ||
        /(transfer|airport|bandara|antar jemput|drop off|dropoff|pick up|pickup)/i.test(nameLower)
    ) {
        return {
            key: 'transfer',
            label: 'Airport Transfer',
            icon: 'fa-plane-departure',
            color: '#0284c7',
            bgColor: '#f0f9ff',
            gradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            borderColor: '#bae6fd',
            shadow: 'rgba(2, 132, 199, 0.18)'
        };
    }

    // 4. PAKET TOUR / WISATA / PRIVATE TRIP (Kecuali mobil/motor murni)
    if (
        cat !== 'car' && cat !== 'mobil' && cat !== 'motorcycle' && cat !== 'motor' &&
        (cat === 'package' || cat === 'tour' ||
        /(tour|trip|paket|wisata|liburan|gili|mandalika|sembalun|sasak|snorkeling|rinjani|pantai)/i.test(nameLower))
    ) {
        return {
            key: 'tour',
            label: 'Paket Tour Wisata',
            icon: 'fa-umbrella-beach',
            color: '#16a34a',
            bgColor: '#f0fdf4',
            gradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            borderColor: '#bbf7d0',
            shadow: 'rgba(22, 163, 74, 0.18)'
        };
    }

    // 5. MOBIL / SEWA MOBIL / RENTAL MOBIL (Semua tipe mobil, lepas kunci & driver)
    if (
        cat === 'car' || cat === 'mobil' ||
        /(mobil|car|rental|sewa|lepas kunci|include driver|driver|supir|sopir|avanza|innova|hiace|brio|xpander|alphard|fortuner|agya|ayla|calya|sigra|raize|rocky|rize|wrv|wr-v|ertiga|xl7|terios|rush|zenix|reborn|commuter|premio|pajero|sedan|camry|veloz|stargazer|creta|brv|br-v|hrv|hr-v|crv|cr-v)/i.test(nameLower)
    ) {
        return {
            key: 'mobil',
            label: 'Sewa Mobil',
            icon: 'fa-car',
            color: '#2563eb',
            bgColor: '#eff6ff',
            gradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            borderColor: '#bfdbfe',
            shadow: 'rgba(37, 99, 235, 0.18)'
        };
    }

    // 6. DRONE / DOKUMENTASI / FOTOGRAFI
    if (
        cat === 'drone' ||
        /(drone|kamera|camera|gopro|fotografi|video|dokumentasi)/i.test(nameLower)
    ) {
        return {
            key: 'drone',
            label: 'Sewa Drone',
            icon: 'fa-camera',
            color: '#9333ea',
            bgColor: '#faf5ff',
            gradient: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
            borderColor: '#e9d5ff',
            shadow: 'rgba(147, 51, 234, 0.18)'
        };
    }

    // 7. WEBSITE / IT / JASA DIGITAL
    if (/(website|web|jasa|aplikasi|software|it)/i.test(nameLower)) {
        return {
            key: 'it',
            label: 'Layanan Digital',
            icon: 'fa-laptop-code',
            color: '#0d9488',
            bgColor: '#f0fdfa',
            gradient: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
            borderColor: '#99f6e4',
            shadow: 'rgba(13, 148, 136, 0.18)'
        };
    }

    // 8. FALLBACK DEFAULT
    return {
        key: 'other',
        label: 'Layanan Travel',
        icon: 'fa-receipt',
        color: '#475569',
        bgColor: '#f8fafc',
        gradient: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderColor: '#e2e8f0',
        shadow: 'rgba(71, 85, 105, 0.12)'
    };
};

// Fetch items from backend
const fetchItems = async (category = null) => {
    try {
        let url = `${API_URL}/items?_t=${new Date().getTime()}`;
        if (category) {
            url += `&category=${category}`;
        }
        const response = await fetch(url, { cache: 'no-store' });
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

const DEFAULT_CAR_TERMS = `🚙 SYARAT & KETENTUAN SEWA MOBIL LEPAS KUNCI 

1. Identitas Penyewa
   • WNI: KTP & SIM A aktif.
   • WNA: Paspor & SIM yang berlaku.

2. Booking
   • Booking dinyatakan sah setelah pembayaran lock booking sebesar Rp 200.000.
   • Pelunasan dilakukan sebelum kendaraan digunakan.

3. Deposit / Uang Jaminan
   • Deposit: Rp 1.000.000 (100% Refundable).
   • Deposit dibayarkan sebelum kendaraan diserahkan.
   • Deposit dikembalikan setelah unit dikembalikan dan kondisi unit dinyatakan baik.
   • Jika terdapat kerusakan, kehilangan, atau denda akibat kelalaian, biaya dipotong dari deposit.

4. Penggunaan Kendaraan
   • Durasi pemakaian penuh 24 Jam sejak unit diserahkan.
   • Kendaraan hanya digunakan untuk keperluan pribadi dan sesuai aturan lalu lintas resmi di Pulau Lombok.
   • Dilarang menyewakan kembali unit atau membawanya keluar Pulau Lombok tanpa izin.
   • Dilarang menggunakan kendaraan untuk balapan, off-road ekstrem, atau kegiatan ilegal.

5. Tanggung Jawab Penyewa
   • BBM, biaya parkir, tol, dan tilang menjadi tanggung jawab penyewa.
   • Jika terjadi kendala darurat, segera hubungi admin kami.

6. Pengembalian
   • Kendaraan wajib dikembalikan tepat waktu sesuai kesepakatan.
   • Keterlambatan dikenakan biaya overtime per jam.

💰 DEPOSIT: Rp 1.000.000 (100% Dikembalikan)

TRAVEL LOMBOK AIRPORT 🚙`;

const DEFAULT_CAR_DRIVER_TERMS = `🚙 SYARAT & KETENTUAN SEWA MOBIL + DRIVER (12 JAM)

1. Durasi Layanan
   • Durasi pemakaian 12 Jam per hari sesuai rute dan jadwal yang disepakati.
   • Pemakaian melebihi 12 jam (overtime) dikenakan biaya overtime per jam.

2. Fasilitas Termasuk (Include)
   • Unit mobil bersih, ber-AC dingin, dan siap jalan.
   • Driver profesional, ramah, dan berpengalaman rute wisata Lombok.
   • Bahan Bakar Minyak (BBM) selama rute pemakaian.
   • Antar / Jemput di Bandara Lombok (BIL) atau Hotel (Area Kota).

3. Ketentuan Bebas Deposit
   • Layanan dengan Driver BEBAS DEPOSIT (Rp 0 / tanpa jaminan uang deposit).
   • Penyewa tidak perlu memberikan jaminan SIM atau uang deposit.

4. Biaya Tidak Termasuk (Exclude)
   • Tiket masuk objek wisata dan biaya parkir/tol.
   • Makan supir dan pengeluaran pribadi penyewa.
   • Tips supir (sukarela).

5. Booking & Pelunasan
   • Booking sah setelah pembayaran DP sebesar Rp 200.000.
   • Sisa pembayaran dapat dilunasi saat bertemu driver di lokasi.

TRAVEL LOMBOK AIRPORT 🚙`;

const DEFAULT_MOTOR_TERMS = `🛵 SYARAT & KETENTUAN SEWA MOTOR 

1. Identitas Penyewa
   • WNI: KTP & SIM C aktif.
   • WNA: Paspor & SIM yang berlaku.

2. Booking
   • Booking dinyatakan sah setelah pembayaran lock booking / DP sebesar Rp 50.000.
   • Pelunasan dilakukan sebelum kendaraan digunakan.

3. Deposit / Uang Jaminan
   • Deposit: Rp 500.000 (100% dikembalikan setelah masa sewa berakhir).
   • Deposit dibayarkan sebelum kendaraan diserahkan.

4. Penggunaan Kendaraan
   • Kendaraan hanya digunakan untuk keperluan pribadi dan sesuai aturan lalu lintas.
   • Wajib mengenakan helm SNI yang telah disediakan.

5. Tanggung Jawab Penyewa
   • BBM, parkir, dan tilang menjadi tanggung jawab penyewa.

TRAVEL LOMBOK AIRPORT 🛵`;

// Format terms into HTML list
const formatTerms = (termsText) => {
    if (!termsText) return '';
    const lines = termsText.split('\n');
    let html = '';
    let inList = false;

    lines.forEach(line => {
        let trimmed = line.trim();

        // Skip redundant headers or footer signatures
        if (trimmed.startsWith('🚙 SYARAT') || trimmed.startsWith('🛵 SYARAT') || trimmed.toUpperCase().includes('TRAVEL LOMBOK AIRPORT')) {
            return;
        }

        // Auto-format numbers (4 digits or more) with dots (e.g. 500000 -> 500.000)
        trimmed = trimmed.replace(/\b(\d{4,})\b/g, (match) => parseInt(match, 10).toLocaleString('id-ID'));

        const numMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
        if (numMatch) {
            if (inList) { html += '</ul>'; inList = false; }
            const num = numMatch[1];
            const sectionTitle = numMatch[2];
            html += `
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 14px; margin-bottom: 6px;">
                <span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; background: #e0f2fe; color: #0284c7; border-radius: 50%; font-size: 0.72rem; font-weight: 800; flex-shrink: 0;">${num}</span>
                <span style="font-weight: 800; font-size: 0.9rem; color: #0f172a;">${sectionTitle}</span>
            </div>`;
        } else if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
            if (!inList) { html += '<ul style="margin: 2px 0 8px 30px; padding: 0; list-style-type: none;">'; inList = true; }
            const cleanText = trimmed.replace(/^[•\-\*]\s*/, '');
            html += `<li style="position: relative; margin-bottom: 5px; color: #475569; font-size: 0.85rem; line-height: 1.5; padding-left: 14px;"><span style="position: absolute; left: 0; top: 0; color: #0284c7; font-weight: 900;">•</span>${cleanText}</li>`;
        } else if (trimmed === '') {
            if (inList) { html += '</ul>'; inList = false; }
            html += '<div style="height: 4px;"></div>';
        } else {
            if (inList) { html += '</ul>'; inList = false; }
            if (trimmed.includes('DEPOSIT')) {
                html += `<div style="display: inline-flex; align-items: center; gap: 6px; background: #fef3c7; color: #92400e; padding: 6px 14px; border-radius: 20px; font-weight: 800; font-size: 0.8rem; margin: 8px 0; border: 1px solid #fde68a;"><i class="fa-solid fa-shield-halved"></i> ${trimmed}</div>`;
            } else {
                html += `<div style="color: #475569; font-size: 0.85rem; margin-bottom: 4px;">${trimmed}</div>`;
            }
        }
    });
    if (inList) { html += '</ul>'; }
    return html;
};

// Modal functions (attached to window for global access)
window.closeGalleryModal = () => {
    document.getElementById('gallery-modal').classList.remove('active');
};

// Video Modal Injection
const injectVideoModal = () => {
    if (document.getElementById('video-modal')) return;
    const modalHtml = `
    <div id="video-modal" class="modal-overlay" style="z-index: 9999; display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); align-items: center; justify-content: center; flex-direction: column;">
        <div style="position: relative; width: 90%; max-width: 800px; height: 80vh; background: #000; border-radius: 12px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
            <button onclick="closeVideoModal()" style="position: absolute; top: 15px; right: 15px; background: rgba(255,255,255,0.2); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); transition: all 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.4)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'"><i class="fa-solid fa-xmark"></i></button>
            <div id="video-modal-content" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"></div>
        </div>
        <div style="margin-top: 20px; text-align: center;">
            <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 8px;">Video tidak memutar atau error (layar abu-abu)?</p>
            <a id="video-modal-fallback-link" href="#" target="_blank" style="color: white; background: var(--primary-blue); padding: 8px 20px; border-radius: 20px; text-decoration: none; font-size: 0.95rem; font-weight: bold; display: inline-block; transition: background 0.3s;" onmouseover="this.style.background='#0284c7'" onmouseout="this.style.background='var(--primary-blue)'"><i class="fa-solid fa-arrow-up-right-from-square"></i> Buka Langsung dari Sumbernya</a>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.openVideoModal = (url) => {
    injectVideoModal();
    const modal = document.getElementById('video-modal');
    const content = document.getElementById('video-modal-content');

    // Attempt to convert to embed URL
    let embedUrl = url;
    try {
        const u = new URL(url);
        if (u.hostname.includes('instagram.com')) {
            const pathParts = u.pathname.split('/').filter(p => p);
            if (pathParts.length >= 2 && (pathParts[0] === 'p' || pathParts[0] === 'reel')) {
                embedUrl = `https://www.instagram.com/p/${pathParts[1]}/embed`;
            }
        } else if (u.hostname.includes('tiktok.com')) {
            const pathParts = u.pathname.split('/').filter(p => p);
            if (pathParts.includes('video')) {
                const vid = pathParts[pathParts.indexOf('video') + 1];
                embedUrl = `https://www.tiktok.com/embed/v2/${vid}`;
            }
        } else if (u.hostname.includes('facebook.com') && u.pathname.includes('/watch')) {
            embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0`;
        } else if (u.hostname.includes('streamable.com')) {
            const sid = u.pathname.replace('/e/', '').replace('/', '');
            if (sid) embedUrl = `https://streamable.com/e/${sid}?autoplay=1`;
        } else if (u.hostname.includes('drive.google.com')) {
            embedUrl = url.replace('/view', '/preview');
        } else if (u.hostname.includes('youtube.com') && url.includes('watch?v=')) {
            const v = u.searchParams.get('v');
            if (v) embedUrl = `https://www.youtube.com/embed/${v}?autoplay=1`;
        }
    } catch (e) { }

    content.innerHTML = `<iframe width="100%" height="100%" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="background: #000;"></iframe>`;

    // Set fallback link
    const fallbackLink = document.getElementById('video-modal-fallback-link');
    if (fallbackLink) fallbackLink.href = url;

    modal.style.display = 'flex';
};

window.closeVideoModal = () => {
    const modal = document.getElementById('video-modal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('video-modal-content').innerHTML = ''; // Stop video playing
    }
};

// ====== CAR SERVICE CHOICE MODAL (INCLUDE DRIVER vs TIDAK INCLUDE DRIVER) ======
window.openCarChoiceModal = (id) => {
    const item = globalItems.find(i => i.id === id);
    if (!item) return;

    const modal = document.getElementById('car-choice-modal');
    const titleEl = document.getElementById('car-choice-title');
    const subtitleEl = document.getElementById('car-choice-subtitle');
    const bodyEl = document.getElementById('car-choice-body');
    if (!modal || !bodyEl) return;

    if (titleEl) titleEl.textContent = `Pilih Layanan: ${item.title}`;
    if (subtitleEl) subtitleEl.textContent = `Tersedia opsi Lepas Kunci (Setir Sendiri) atau Include Driver (Dengan Supir & BBM)`;

    const rawLepasKunciPrice = Number(item.price) || 0;
    const rawDriverPrice = (item.priceWithDriver && Number(item.priceWithDriver) > 0)
        ? Number(item.priceWithDriver)
        : (rawLepasKunciPrice > 0 ? rawLepasKunciPrice + 200000 : 650000);

    const lepasKunciFormatted = formatPrice(rawLepasKunciPrice);
    const driverFormatted = formatPrice(rawDriverPrice);

    bodyEl.innerHTML = `
        <div class="car-choice-grid">
            <!-- Card 1: Include Driver (Rekomendasi / Paling Populer) -->
            <div class="car-choice-card car-choice-card-driver" onclick="window.selectCarMode('${item.id}', 'include_driver')">
                <div class="car-choice-card-badge">
                    <i class="fa-solid fa-crown" style="color: #f59e0b;"></i> PALING PRAKTIS & POPULER
                </div>
                <div class="car-choice-card-header">
                    <div class="car-choice-icon-wrap" style="background: #ecfdf5; color: #059669;">
                        <i class="fa-solid fa-user-tie"></i>
                    </div>
                    <div>
                        <h4 class="car-choice-option-title">Include Driver</h4>
                        <span class="car-choice-option-sub">Dengan Supir Berpengalaman + BBM (12 Jam)</span>
                    </div>
                </div>

                <div class="car-choice-price-box">
                    <span class="car-choice-price-label">Tarif Termasuk Supir & BBM</span>
                    <div class="car-choice-price-val">${driverFormatted}</div>
                    <span class="car-choice-price-unit">/ 12 Jam Pemakaian</span>
                </div>

                <div class="car-choice-features">
                    <div class="car-choice-feature-item">
                        <i class="fa-solid fa-clock" style="color: #10b981;"></i>
                        <span><strong>Durasi 12 Jam Penuh</strong> - Fleksibel keliling rute wisata</span>
                    </div>
                    <div class="car-choice-feature-item">
                        <i class="fa-solid fa-circle-check" style="color: #10b981;"></i>
                        <span><strong>Bebas Deposit Jaminan (Rp 0)</strong> - Tanpa tahan deposit</span>
                    </div>
                    <div class="car-choice-feature-item">
                        <i class="fa-solid fa-circle-check" style="color: #10b981;"></i>
                        <span><strong>Sudah Termasuk BBM</strong> selama pemakaian rute tour</span>
                    </div>
                    <div class="car-choice-feature-item">
                        <i class="fa-solid fa-circle-check" style="color: #10b981;"></i>
                        <span><strong>Driver Ramah & Berpengalaman</strong> merangkap pemandu lokal</span>
                    </div>
                    <div class="car-choice-feature-item">
                        <i class="fa-solid fa-circle-check" style="color: #10b981;"></i>
                        <span>Antar & Jemput di Bandara / Hotel (Area Kota)</span>
                    </div>
                </div>

                <button type="button" class="btn btn-car-choice btn-car-choice-driver">
                    <i class="fa-solid fa-user-check"></i> Pilih Include Driver (12 Jam)
                </button>
            </div>

            <!-- Card 2: Tidak Include Driver (Lepas Kunci) -->
            <div class="car-choice-card car-choice-card-self" onclick="window.selectCarMode('${item.id}', 'lepas_kunci')">
                <div class="car-choice-card-badge" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;">
                    <i class="fa-solid fa-key" style="color: #2563eb;"></i> FLEKSIBEL SETIR SENDIRI
                </div>
                <div class="car-choice-card-header">
                    <div class="car-choice-icon-wrap" style="background: #eff6ff; color: #2563eb;">
                        <i class="fa-solid fa-car-side"></i>
                    </div>
                    <div>
                        <h4 class="car-choice-option-title">Tidak Include Driver</h4>
                        <span class="car-choice-option-sub">Lepas Kunci (Setir Sendiri 24 Jam)</span>
                    </div>
                </div>

                <div class="car-choice-price-box" style="background: #f1f5f9; border-color: #e2e8f0;">
                    <span class="car-choice-price-label" style="color: #64748b;">Tarif Sewa Lepas Kunci</span>
                    <div class="car-choice-price-val" style="color: #0f172a;">${lepasKunciFormatted}</div>
                    <span class="car-choice-price-unit">/ 24 Jam Pemakaian Penuh</span>
                </div>

                <div class="car-choice-features">
                    <div class="car-choice-feature-item">
                        <i class="fa-solid fa-circle-check" style="color: #3b82f6;"></i>
                        <span>Unit Mobil Prima, Bersih, AC Dingin & Nyaman</span>
                    </div>
                    <div class="car-choice-feature-item">
                        <i class="fa-solid fa-circle-check" style="color: #3b82f6;"></i>
                        <span>Bebas Menjelajah Seluruh Pulau Lombok 24 Jam</span>
                    </div>
                    <div class="car-choice-feature-item">
                        <i class="fa-solid fa-circle-info" style="color: #64748b;"></i>
                        <span>DP Pemesanan Rp 200.000 + Jaminan Deposit Rp 1.000.000</span>
                    </div>
                    <div class="car-choice-feature-item">
                        <i class="fa-solid fa-circle-info" style="color: #64748b;"></i>
                        <span>BBM & Biaya Parkir ditanggung penyewa</span>
                    </div>
                </div>

                <button type="button" class="btn btn-car-choice btn-car-choice-self">
                    <i class="fa-solid fa-key"></i> Pilih Lepas Kunci
                </button>
            </div>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeCarChoiceModal = () => {
    const modal = document.getElementById('car-choice-modal');
    if (modal) modal.classList.remove('active');
    const tourModal = document.getElementById('tour-modal');
    if (!tourModal || !tourModal.classList.contains('active')) {
        document.body.style.overflow = '';
    }
};

window.selectCarMode = (id, mode) => {
    window.closeCarChoiceModal();
    window.openTourModal(id, mode);
};

window.copyRekening = (nomor, bank, btnEl) => {
    const showSuccess = () => {
        if (btnEl) {
            const originalHtml = btnEl.innerHTML;
            btnEl.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin!';
            btnEl.style.background = '#dcfce7';
            btnEl.style.color = '#15803d';
            setTimeout(() => {
                btnEl.innerHTML = originalHtml;
                btnEl.style.background = '#e0f2fe';
                btnEl.style.color = '#0284c7';
            }, 2000);
        }
        Swal.fire({
            toast: true,
            position: 'top',
            icon: 'success',
            title: `Nomor Rekening ${bank} Berhasil Disalin!`,
            text: nomor,
            showConfirmButton: false,
            timer: 2200,
            timerProgressBar: true,
            background: '#ffffff',
            color: '#0f172a',
            customClass: {
                popup: 'my-swal-container'
            }
        });
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(nomor).then(showSuccess).catch(() => {
            const temp = document.createElement('input');
            temp.value = nomor;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand('copy');
            document.body.removeChild(temp);
            showSuccess();
        });
    } else {
        const temp = document.createElement('input');
        temp.value = nomor;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        showSuccess();
    }
};

// Overlay click listener for car choice modal
document.addEventListener('DOMContentLoaded', () => {
    const carModal = document.getElementById('car-choice-modal');
    if (carModal) {
        carModal.addEventListener('click', (e) => {
            if (e.target === carModal) window.closeCarChoiceModal();
        });
    }
});

window.openTourModal = (id, carMode = null) => {
    const item = globalItems.find(i => i.id === id);
    if (!item) return;

    // Khusus Sewa Mobil: jika belum ada mode layanan yang dipilih, tampilkan modal pilihan 2 opsi
    if (item.category === 'car' && !carMode) {
        window.openCarChoiceModal(id);
        return;
    }

    // Sembunyikan floating widget Tanya AIRA saat modal detail dibuka agar tidak menutupi tampilan
    const chatWidget = document.getElementById('ai-chat-widget');
    if (chatWidget) chatWidget.style.display = 'none';

    const modalBody = document.getElementById('tour-modal-body');

    // Penentuan kalkulasi khusus Sewa Mobil (Lepas Kunci vs Include Driver)
    const isCarCategory = (item.category === 'car');
    const isDriverMode = isCarCategory && (carMode === 'include_driver');
    const rawLepasKunciPrice = Number(item.price) || 0;
    const rawDriverPrice = (item.priceWithDriver && Number(item.priceWithDriver) > 0)
        ? Number(item.priceWithDriver)
        : (rawLepasKunciPrice > 0 ? rawLepasKunciPrice + 200000 : 650000);

    const activeItemPrice = isCarCategory ? (isDriverMode ? rawDriverPrice : rawLepasKunciPrice) : (Number(item.price) || 0);
    const activeItemTitle = isCarCategory ? `${item.title} (${isDriverMode ? 'Include Driver 12 Jam' : 'Lepas Kunci 24 Jam'})` : item.title;

    // Parse itineraries
    let itineraryHTML = '';
    const itins = parseLines(item.itinerary);
    let currentDay = '';
    let currentTitle = '';
    let currentDests = [];

    const commitDay = () => {
        if (currentDay) {
            let mapHtml = '';
            if (currentDests.length > 0) {
                if (currentDests.length === 1) {
                    const query = encodeURIComponent(currentDests[0] + ' Lombok');
                    mapHtml = `<a href="https://www.google.com/maps/search/?api=1&query=${query}" target="_blank" style="background:#e0f2fe; color:#0284c7; padding: 6px 14px; font-size:0.8rem; border-radius: 20px; margin-top:12px; display:inline-flex; align-items:center; gap:6px; font-weight:700; text-decoration:none; transition:all 0.2s;" onmouseover="this.style.background='#bae6fd'" onmouseout="this.style.background='#e0f2fe'"><i class="fa-solid fa-map-location-dot"></i> Lihat Peta di Google Maps</a>`;
                } else {
                    const dirUrl = `https://www.google.com/maps/dir/${currentDests.map(d => encodeURIComponent(d + ' Lombok')).join('/')}`;
                    mapHtml = `<a href="${dirUrl}" target="_blank" style="background:#e0f2fe; color:#0284c7; padding: 6px 14px; font-size:0.8rem; border-radius: 20px; margin-top:12px; display:inline-flex; align-items:center; gap:6px; font-weight:700; text-decoration:none; transition:all 0.2s;" onmouseover="this.style.background='#bae6fd'" onmouseout="this.style.background='#e0f2fe'"><i class="fa-solid fa-route"></i> Buka Rute di Google Maps</a>`;
                }
            }

            itineraryHTML += `
            <div class="tm-day">
                <div class="tm-day-header">
                    <div class="tm-day-badge">DAY<br><span>${currentDay.replace('DAY', '').trim()}</span></div>
                    <div class="tm-day-title">${currentTitle}</div>
                </div>
                <ul class="tm-day-list" style="margin-bottom: 8px;">
                    ${currentDests.map(d => `<li>${d}</li>`).join('')}
                </ul>
                ${mapHtml}
            </div>`;
        }
    };

    itins.forEach(line => {
        if (line.toUpperCase().startsWith('DAY')) {
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
    const rawIncludes = parseLines(item.include);
    const rawExcludes = parseLines(item.exclude);

    let includes = rawIncludes;
    let excludes = rawExcludes;

    if (isCarCategory) {
        if (isDriverMode) {
            includes = [
                'Durasi Pemakaian 12 Jam Penuh (Rute Wisata)',
                'Unit Mobil Bersih, Nyaman & AC Dingin',
                'Driver Profesional, Ramah & Berpengalaman',
                'Bahan Bakar Minyak (BBM) selama rute pemakaian',
                'Antar & Jemput di Bandara / Hotel (Area Kota)',
                'Bebas Uang Jaminan Deposit (Rp 0)'
            ];
            excludes = [
                'Tiket Masuk Objek Wisata',
                'Biaya Parkir & Tol (jika ada)',
                'Pengeluaran Pribadi & Makan Driver',
                'Tips Driver (Sukarela)'
            ];
        } else {
            includes = rawIncludes.length > 0 ? rawIncludes : [
                'Unit Mobil Bersih, Prima & AC Dingin',
                'Peralatan Standar Kendaraan (Ban Cadangan & Toolkit)',
                'Durasi Pemakaian Penuh 24 Jam'
            ];
            excludes = rawExcludes.length > 0 ? rawExcludes : [
                'Bahan Bakar Minyak (BBM)',
                'Biaya Parkir & Tol',
                'Driver / Supir (Setir Sendiri)',
                'Jaminan Deposit Rp 1.000.000 (Refundable 100%)'
            ];
        }
    }

    let activeTerms = item.terms;
    if (isCarCategory) {
        if (isDriverMode) {
            activeTerms = DEFAULT_CAR_DRIVER_TERMS;
        } else {
            activeTerms = (item.terms && item.terms.trim() && !item.terms.includes('DRIVER (12 JAM)'))
                ? item.terms
                : DEFAULT_CAR_TERMS;
        }
    } else if (item.category === 'motorcycle') {
        activeTerms = (item.terms && item.terms.trim()) ? item.terms : DEFAULT_MOTOR_TERMS;
    }

    modalBody.innerHTML = `
        <div style="width: 100%; height: clamp(280px, 45vw, 400px); position: relative;">
            <img src="${item.imageUrl}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200'">
            <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 120px; background: linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0));"></div>
        </div>
        <div class="tm-header" style="margin-top: -100px; position: relative; background: transparent; padding-top: 0; border: none;">
            ${isCarCategory ? `
            <div class="car-mode-switcher-bar">
                <button type="button" class="car-mode-tab-btn ${!isDriverMode ? 'active' : ''}" onclick="window.openTourModal('${item.id}', 'lepas_kunci')">
                    <div class="car-tab-header">
                        <i class="fa-solid fa-key"></i> Lepas Kunci
                    </div>
                    <div class="car-tab-sub">
                        <span class="car-tab-price">${formatPrice(rawLepasKunciPrice)}</span>
                        <span class="car-tab-dur">/ 24 Jam</span>
                    </div>
                </button>
                <button type="button" class="car-mode-tab-btn ${isDriverMode ? 'active' : ''}" onclick="window.openTourModal('${item.id}', 'include_driver')">
                    <span class="car-tab-highlight-chip">Bebas Deposit</span>
                    <div class="car-tab-header">
                        <i class="fa-solid fa-user-tie"></i> Include Driver
                    </div>
                    <div class="car-tab-sub">
                        <span class="car-tab-price">${formatPrice(rawDriverPrice)}</span>
                        <span class="car-tab-dur">/ 12 Jam</span>
                    </div>
                </button>
            </div>
            ` : ''}

            <div class="tm-top premium-card" style="position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.08); width: 100%; box-sizing: border-box;">
                <div class="tm-title" style="flex: 1; min-width: 0; width: 100%; max-width: 100%; box-sizing: border-box;">
                    ${(() => {
                        const meta = (typeof window.getItemCategoryMeta === 'function') 
                            ? window.getItemCategoryMeta(item) 
                            : { key: 'tour', icon: 'fa-umbrella-beach', color: '#16a34a', bgColor: '#f0fdf4', borderColor: '#bbf7d0', shadow: 'rgba(22, 163, 74, 0.15)', label: 'Paket Tour' };

                        let typeLabel = meta.label.toUpperCase();
                        if (isCarCategory) typeLabel = isDriverMode ? 'Sewa Mobil + Driver' : 'Sewa Mobil Lepas Kunci';
                        else if (item.category === 'motorcycle') typeLabel = 'Sewa Motor';
                        else if (item.category === 'drone') typeLabel = 'Sewa Drone';
                        else if (item.category === 'transfer') typeLabel = 'Antar Jemput Bandara';
                        if (item.packageType) typeLabel = item.packageType;

                        let durationLabel = item.duration ? item.duration.toUpperCase() : 'N/A';
                        if (!item.duration && (item.category === 'car' || item.category === 'motorcycle')) {
                            durationLabel = isDriverMode ? '12 Jam' : '24 Jam Penuh';
                        }

                        let driverPillsHtml = '';
                        if (isCarCategory) {
                            if (isDriverMode) {
                                driverPillsHtml = `
                                    <span style="background: #e0f2fe; color: #0284c7; font-size: 0.78rem; padding: 5px 12px; border-radius: 20px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;"><i class="fa-regular fa-clock"></i> 12 Jam</span>
                                    <span style="background: #ecfdf5; color: #059669; font-size: 0.78rem; padding: 5px 12px; border-radius: 20px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;"><i class="fa-solid fa-user-tie"></i> Supir & BBM</span>
                                    <span style="background: #fef3c7; color: #92400e; font-size: 0.78rem; padding: 5px 12px; border-radius: 20px; font-weight: 800; display: inline-flex; align-items: center; gap: 5px;"><i class="fa-solid fa-shield-halved"></i> Bebas Deposit</span>
                                `;
                            } else {
                                driverPillsHtml = `
                                    <span style="background: #e0f2fe; color: #0284c7; font-size: 0.78rem; padding: 5px 12px; border-radius: 20px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;"><i class="fa-regular fa-clock"></i> 24 Jam Penuh</span>
                                    <span style="background: #f1f5f9; color: #475569; font-size: 0.78rem; padding: 5px 12px; border-radius: 20px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;"><i class="fa-solid fa-key"></i> Setir Sendiri</span>
                                    <span style="background: #f0fdf4; color: #166534; font-size: 0.78rem; padding: 5px 12px; border-radius: 20px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;"><i class="fa-solid fa-car-side"></i> Unit Bersih & AC</span>
                                `;
                            }
                        } else if (item.driverOptions) {
                            const optText = item.driverOptions === 'Sertakan Pengemudi' ? 'Dengan Supir' : item.driverOptions === 'Tidak Include Driver' ? 'Lepas Kunci' : item.driverOptions;
                            driverPillsHtml = `
                                <span style="background: #f0fdf4; color: var(--primary-green); font-size: 0.78rem; padding: 5px 12px; border-radius: 20px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;"><i class="fa-solid fa-id-card"></i> ${optText}</span>
                            `;
                        }

                        return `
                            <div style="font-size: 0.8rem; font-weight: 800; color: ${meta.color}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 6px; background: ${meta.bgColor}; border: 1px solid ${meta.borderColor}; padding: 4px 14px; border-radius: 20px; box-shadow: 0 2px 6px ${meta.shadow || 'rgba(0,0,0,0.06)'};">
                                <i class="fa-solid ${meta.icon}"></i> ${typeLabel}
                            </div>
                            <h2 style="color: #0f172a; font-size: clamp(1.4rem, 5.5vw, 2.2rem); margin: 8px 0 12px 0; line-height: 1.2; font-weight: 900; letter-spacing: -0.02em; word-break: break-word; overflow-wrap: break-word;">${item.title.toUpperCase()}</h2>
                            <div class="tm-badges" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
                                ${!isCarCategory ? `<span style="background: ${meta.bgColor}; color: ${meta.color}; border: 1px solid ${meta.borderColor}; font-size: 0.78rem; padding: 5px 12px; border-radius: 20px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;"><i class="fa-regular fa-clock"></i> ${durationLabel}</span>` : ''}
                                ${driverPillsHtml}
                            </div>
                            <p style="color: #64748b; font-size: 0.95rem; line-height: 1.6; margin: 0; max-width: 600px;">${item.description || 'Deskripsi detail tidak tersedia.'}</p>
                        `;
                    })()}
                </div>
                <div class="tm-price-box premium-price-box">
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;">
                        <span style="font-size: 0.76rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px; white-space: nowrap;">
                            ${(() => {
                                const meta = (typeof window.getItemCategoryMeta === 'function') ? window.getItemCategoryMeta(item) : { key: 'tour' };
                                if (meta.key === 'honeymoon') return 'Harga Paket';
                                if (meta.key === 'tour') return 'Harga Paket';
                                if (isCarCategory) return isDriverMode ? 'Tarif + Supir' : 'Tarif Lepas Kunci';
                                if (item.category === 'motorcycle' || meta.key === 'motor') return 'Tarif Sewa Motor';
                                if (item.category === 'drone' || meta.key === 'drone') return 'Tarif Sewa Drone';
                                if (item.category === 'transfer' || meta.key === 'transfer') return 'Tarif Antar Jemput';
                                return 'Harga Paket';
                            })()}
                        </span>
                        ${(() => {
                            const meta = (typeof window.getItemCategoryMeta === 'function') 
                                ? window.getItemCategoryMeta(item) 
                                : { icon: 'fa-tag', color: '#0284c7', bgColor: '#e0f2fe', borderColor: '#bae6fd', label: 'Paket' };
                            if (isCarCategory) {
                                return `<span style="font-size: 0.74rem; font-weight: 800; color: ${isDriverMode ? '#15803d' : '#0284c7'}; background: ${isDriverMode ? '#dcfce7' : '#e0f2fe'}; border: 1px solid ${isDriverMode ? '#bbf7d0' : '#bae6fd'}; padding: 4px 12px; border-radius: 14px; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; flex-shrink: 0;">
                                    <i class="fa-solid ${isDriverMode ? 'fa-user-check' : 'fa-key'}"></i> ${isDriverMode ? 'Include Driver' : 'Lepas Kunci'}
                                </span>`;
                            }
                            return `<span style="font-size: 0.74rem; font-weight: 800; color: ${meta.color}; background: ${meta.bgColor}; border: 1px solid ${meta.borderColor}; padding: 4px 12px; border-radius: 14px; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; flex-shrink: 0;">
                                <i class="fa-solid ${meta.icon}"></i> ${meta.label}
                            </span>`;
                        })()}
                    </div>
                    <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
                        <h3 style="color: ${(() => {
                            const meta = (typeof window.getItemCategoryMeta === 'function') ? window.getItemCategoryMeta(item) : { color: '#0284c7' };
                            return isCarCategory ? '#0284c7' : meta.color;
                        })()}; margin: 0; font-size: clamp(1.8rem, 6vw, 2.2rem); font-weight: 900; line-height: 1; letter-spacing: -0.02em;">${formatPrice(activeItemPrice)}</h3>
                        <span style="color: #64748b; font-size: 0.88rem; font-weight: 700;">/ ${isCarCategory ? (isDriverMode ? '12 Jam' : '24 Jam') : (item.category === 'motorcycle' ? '24 Jam' : 'paket')}</span>
                    </div>
                    <div style="border-top: 1px dashed #cbd5e1; padding-top: 12px; font-size: 0.82rem; color: #475569; display: flex; flex-direction: column; gap: 8px; line-height: 1.45;">
                        ${(() => {
                            const meta = (typeof window.getItemCategoryMeta === 'function') ? window.getItemCategoryMeta(item) : { key: 'tour' };
                            if (isCarCategory) {
                                return isDriverMode 
                                    ? '<span style="display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-check" style="color: #10b981; width: 16px; text-align: center; flex-shrink: 0;"></i> <span>Termasuk Unit Mobil, Driver & BBM</span></span><span style="display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-check" style="color: #10b981; width: 16px; text-align: center; flex-shrink: 0;"></i> <span>Bebas Deposit Jaminan (Rp 0)</span></span>' 
                                    : '<span style="display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-check" style="color: #0284c7; width: 16px; text-align: center; flex-shrink: 0;"></i> <span>Durasi 24 Jam Penuh Setir Sendiri</span></span><span style="display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-check" style="color: #0284c7; width: 16px; text-align: center; flex-shrink: 0;"></i> <span>Unit Bersih, AC Dingin & Toolkit</span></span>';
                            }
                            if (meta.key === 'honeymoon') {
                                return '<span style="display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-heart" style="color: #e11d48; width: 16px; text-align: center; flex-shrink: 0;"></i> <span>Private Tour Romantis Sepasang (2 Pax)</span></span><span style="display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-car-side" style="color: #10b981; width: 16px; text-align: center; flex-shrink: 0;"></i> <span>Transport Private Full AC + Driver & BBM</span></span><span style="display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-camera" style="color: #e11d48; width: 16px; text-align: center; flex-shrink: 0;"></i> <span>Dokumentasi Foto</span></span>';
                            }
                            if (meta.key === 'tour') {
                                return '<span style="display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-umbrella-beach" style="color: #16a34a; width: 16px; text-align: center; flex-shrink: 0;"></i> <span>Rute Wisata Terbaik & Jadwal Fleksibel</span></span><span style="display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-car-side" style="color: #10b981; width: 16px; text-align: center; flex-shrink: 0;"></i> <span>Transportasi Private Full AC + Driver</span></span><span style="display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-circle-check" style="color: #10b981; width: 16px; text-align: center; flex-shrink: 0;"></i> <span>Fasilitas Lengkap Sesuai Rincian Paket</span></span>';
                            }
                            if (meta.key === 'motor' || item.category === 'motorcycle') {
                                return '<span style="display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-helmet-safety" style="color: #d97706; width: 16px; text-align: center; flex-shrink: 0;"></i> <span>Termasuk 2 Helm SNI & Jas Hujan</span></span><span style="display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-shield-halved" style="color: #10b981; width: 16px; text-align: center; flex-shrink: 0;"></i> <span>Unit Terawat, Bersih & Bebas Ribet</span></span>';
                            }
                            if (meta.key === 'transfer' || item.category === 'transfer') {
                                return '<span style="display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-plane-arrival" style="color: #0284c7; width: 16px; text-align: center; flex-shrink: 0;"></i> <span>Antar Jemput Bandara Tepat Waktu</span></span><span style="display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-circle-check" style="color: #10b981; width: 16px; text-align: center; flex-shrink: 0;"></i> <span>Driver Ramah & Bebas Parkir Bandara</span></span>';
                            }
                            if (meta.key === 'drone' || item.category === 'drone') {
                                return '<span style="display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-video" style="color: #9333ea; width: 16px; text-align: center; flex-shrink: 0;"></i> <span>Pilot Drone Berpengalaman</span></span><span style="display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-film" style="color: #10b981; width: 16px; text-align: center; flex-shrink: 0;"></i> <span>File Mentah & Hasil Video High-Res</span></span>';
                            }
                            return '<span style="display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-circle-check" style="color: #10b981; width: 16px; text-align: center; flex-shrink: 0;"></i> <span>Layanan Resmi Terpercaya</span></span><span style="display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-star" style="color: #f59e0b; width: 16px; text-align: center; flex-shrink: 0;"></i> <span>Jaminan Kepuasan Pelanggan</span></span>';
                        })()}
                    </div>
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
                
                ${(item.category === 'package' || itineraryHTML) ? `
                <div class="tm-box tm-box-blue mt-4" style="background: #f8fafc; border: 1px solid #cbd5e1;">
                    <div class="tm-box-title" style="background: var(--text-dark);"><i class="fa-solid fa-shield-halved"></i> KEBIJAKAN PEMBATALAN</div>
                    <ul class="tm-list" style="color:var(--text-dark);">
                        <li><i class="fa-solid fa-hourglass-half" style="color:var(--text-gray);"></i> Pembatalan H-7: 50% deposit dikembalikan.</li>
                        <li><i class="fa-solid fa-check" style="color:var(--text-gray);"></i> Pembatalan pihak travel: 100% deposit dikembalikan.</li>
                        <li><i class="fa-regular fa-calendar-days" style="color:var(--text-gray);"></i> Perubahan jadwal sesuai ketersediaan.</li>
                    </ul>
                </div>` : ''}
                
                ${activeTerms ? `
                <div class="tm-box tm-box-blue" style="border-radius: 16px; overflow: hidden; border: 1px solid #bae6fd; box-shadow: 0 4px 20px -4px rgba(2, 132, 199, 0.08); background: #ffffff;">
                    <div class="tm-box-title" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: white; padding: 14px 20px; font-size: 0.95rem; font-weight: 800; display: flex; align-items: center; justify-content: space-between;">
                        <span style="display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-file-contract"></i> SYARAT & KETENTUAN
                        </span>
                        <span style="background: rgba(255,255,255,0.22); color: white; font-size: 0.72rem; padding: 3px 10px; border-radius: 12px; font-weight: 700; text-transform: uppercase;">
                            ${isCarCategory ? (isDriverMode ? 'Dengan Driver' : 'Lepas Kunci') : (item.category === 'motorcycle' ? 'Rental Motor' : (item.category === 'drone' ? 'Sewa Drone' : 'Ketentuan Paket'))}
                        </span>
                    </div>
                    <div style="padding: 20px;">
                        ${isCarCategory ? (isDriverMode ? `
                        <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #a7f3d0; border-radius: 12px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
                            <div style="width: 36px; height: 36px; border-radius: 50%; background: #059669; color: white; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;">
                                <i class="fa-solid fa-shield-heart"></i>
                            </div>
                            <div>
                                <div style="font-weight: 800; font-size: 0.88rem; color: #065f46;">Bebas Uang Jaminan Deposit (Rp 0)</div>
                                <div style="font-size: 0.78rem; color: #047857; margin-top: 2px;">Layanan include driver tidak membutuhkan uang jaminan deposit atau jaminan SIM/KTP.</div>
                            </div>
                        </div>
                        ` : `
                        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #bfdbfe; border-radius: 12px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
                            <div style="width: 36px; height: 36px; border-radius: 50%; background: #0284c7; color: white; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;">
                                <i class="fa-solid fa-key"></i>
                            </div>
                            <div>
                                <div style="font-weight: 800; font-size: 0.88rem; color: #1e40af;">Jaminan Deposit Rp 1.000.000 (100% Refundable)</div>
                                <div style="font-size: 0.78rem; color: #1d4ed8; margin-top: 2px;">Wajib KTP & SIM A aktif. Uang jaminan dikembalikan penuh setelah sewa selesai dalam kondisi baik.</div>
                            </div>
                        </div>
                        `) : ''}

                        <div style="color: #334155; font-size: 0.88rem; line-height: 1.6;">
                            ${formatTerms(activeTerms)}
                        </div>
                    </div>
                </div>` : ''}
            </div>
            
            <div class="tm-right">
                ${includes.length > 0 ? `
                <div class="tm-box tm-box-green" style="border-radius: 16px; overflow: hidden; border: 1px solid #bbf7d0; box-shadow: 0 4px 20px -4px rgba(16, 185, 129, 0.08); background: #ffffff; margin-bottom: 20px;">
                    <div class="tm-box-title" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 14px 20px; font-size: 0.95rem; font-weight: 800; display: flex; align-items: center; justify-content: space-between;">
                        <span style="display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-circle-check"></i> FASILITAS INCLUDE
                        </span>
                        <span style="background: rgba(255,255,255,0.22); color: white; font-size: 0.72rem; padding: 3px 10px; border-radius: 12px; font-weight: 700;">
                            ${includes.length} Fasilitas
                        </span>
                    </div>
                    <ul class="tm-list" style="padding: 16px 20px; list-style: none; margin: 0;">
                        ${includes.map(i => `
                            <li style="display: flex; align-items: flex-start; gap: 10px; padding: 6px 0; border-bottom: 1px dashed #f1f5f9; font-size: 0.88rem; font-weight: 600; color: #334155;">
                                <i class="fa-solid fa-circle-check" style="color: #10b981; margin-top: 3px; font-size: 0.95rem; flex-shrink: 0;"></i>
                                <span>${i}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>` : ''}
                
                ${excludes.length > 0 ? `
                <div class="tm-box tm-box-red" style="border-radius: 16px; overflow: hidden; border: 1px solid #fecaca; box-shadow: 0 4px 20px -4px rgba(239, 68, 68, 0.08); background: #ffffff; margin-bottom: 20px;">
                    <div class="tm-box-title" style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 14px 20px; font-size: 0.95rem; font-weight: 800; display: flex; align-items: center; justify-content: space-between;">
                        <span style="display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-circle-xmark"></i> TIDAK TERMASUK (EXCLUDE)
                        </span>
                    </div>
                    <ul class="tm-list" style="padding: 16px 20px; list-style: none; margin: 0;">
                        ${excludes.map(i => `
                            <li style="display: flex; align-items: flex-start; gap: 10px; padding: 6px 0; border-bottom: 1px dashed #f1f5f9; font-size: 0.88rem; font-weight: 600; color: #475569;">
                                <i class="fa-solid fa-circle-xmark" style="color: #ef4444; margin-top: 3px; font-size: 0.95rem; flex-shrink: 0;"></i>
                                <span>${i}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>` : ''}
                
                <div class="tm-box tm-box-blue" style="border-radius: 16px; overflow: hidden; border: 1px solid #bae6fd; box-shadow: 0 4px 20px -4px rgba(2, 132, 199, 0.08); background: #ffffff;">
                    <div class="tm-box-title" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: white; padding: 14px 20px; font-size: 0.95rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-regular fa-credit-card"></i> CARA RESERVASI & PEMBAYARAN
                    </div>
                    <div style="padding: 20px;">
                        ${(() => {
                            if (item.category === 'motorcycle') {
                                return `<p style="color: #475569; font-size: 0.88rem; margin: 0 0 16px 0; line-height: 1.5;">Untuk mengamankan jadwal sewa motor, silakan transfer <strong>DP sebesar Rp 50.000 dan jaminan deposit Rp 500.000</strong> ke rekening resmi berikut:</p>`;
                            } else if (isCarCategory) {
                                if (isDriverMode) {
                                    return `<p style="color: #475569; font-size: 0.88rem; margin: 0 0 16px 0; line-height: 1.5;">Untuk mengamankan jadwal <strong>Include Driver (12 Jam)</strong>, silakan transfer <strong>DP sebesar Rp 200.000</strong> ke rekening berikut. <span style="color: #059669; font-weight: 700;">Bebas Deposit (Rp 0)!</span> Pelunasan dapat dibayarkan saat bertemu driver:</p>`;
                                } else {
                                    return `<p style="color: #475569; font-size: 0.88rem; margin: 0 0 16px 0; line-height: 1.5;">Untuk mengamankan jadwal sewa <strong>Lepas Kunci (24 Jam)</strong>, silakan transfer <strong>DP Rp 200.000 & jaminan deposit Rp 1.000.000</strong> ke rekening berikut (Deposit jaminan 100% dikembalikan setelah masa sewa):</p>`;
                                }
                            } else {
                                return `<p style="color: #475569; font-size: 0.88rem; margin: 0 0 16px 0; line-height: 1.5;">Untuk mengamankan jadwal perjalanan, silakan transfer <strong>DP sebesar Rp 500.000</strong> ke rekening resmi berikut:</p>`;
                            }
                        })()}
                        
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <div class="bank-item" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <img src="/mandiri.svg" alt="Mandiri" style="height: 24px; object-fit: contain;">
                                    <div>
                                        <div style="font-size: 0.72rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Bank Mandiri - LALU RENGGANE</div>
                                        <div style="color: #0284c7; font-size: 1.05rem; font-weight: 800; letter-spacing: 0.5px;">1610017191425</div>
                                    </div>
                                </div>
                                <button type="button" onclick="window.copyRekening('1610017191425', 'Mandiri', this);" style="background: #e0f2fe; color: #0284c7; border: none; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#bae6fd'" onmouseout="this.style.background='#e0f2fe'"><i class="fa-regular fa-copy"></i> Salin</button>
                            </div>
                            <div class="bank-item" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <img src="/bri.svg" alt="BRI" style="height: 24px; object-fit: contain;">
                                    <div>
                                        <div style="font-size: 0.72rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Bank BRI - LALU RENGGANE</div>
                                        <div style="color: #0284c7; font-size: 1.05rem; font-weight: 800; letter-spacing: 0.5px;">759801017387536</div>
                                    </div>
                                </div>
                                <button type="button" onclick="window.copyRekening('759801017387536', 'BRI', this);" style="background: #e0f2fe; color: #0284c7; border: none; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#bae6fd'" onmouseout="this.style.background='#e0f2fe'"><i class="fa-regular fa-copy"></i> Salin</button>
                            </div>
                        </div>

                        ${!localStorage.getItem('auth_token') ? `
                        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px; margin-top: 16px; text-align: center;">
                            <div style="font-size: 0.82rem; color: #d97706; margin-bottom: 10px; font-weight: 600;">
                                <i class="fa-solid fa-circle-exclamation"></i> Login akun Anda untuk memesan lebih cepat dan cek riwayat booking.
                            </div>
                            <div style="display: flex; gap: 8px; justify-content: center;">
                                <a href="#" onclick="event.preventDefault(); window.closeTourModal(); window._authMode='login'; window.openAuthModal();" class="btn" style="background: white; color: #d97706; border: 1px solid #d97706; padding: 6px 14px; border-radius: 6px; font-size: 0.78rem; font-weight: 700; flex:1; text-align: center;">LOGIN</a>
                                <a href="#" onclick="event.preventDefault(); window.closeTourModal(); window._authMode='register'; window.openAuthModal();" class="btn" style="background: #d97706; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-size: 0.78rem; font-weight: 700; flex:1; text-align: center;">DAFTAR</a>
                            </div>
                        </div>
                        ` : ''}

                        <div class="modal-booking-actions" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 18px; width: 100%; box-sizing: border-box;">
                            <a href="#" onclick="event.preventDefault(); openCheckoutModal('${activeItemTitle.replace(/'/g, "\\'")}', ${activeItemPrice}, 'wa');" 
                               class="btn-detail-booking-wa"
                               style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 13px 8px; border-radius: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.28); text-decoration: none; text-align: center; font-size: clamp(0.78rem, 3.4vw, 0.9rem); white-space: nowrap; transition: all 0.2s ease;"
                               onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 18px rgba(22, 163, 74, 0.38)';"
                               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 14px rgba(22, 163, 74, 0.28)';">
                                <i class="fa-brands fa-whatsapp" style="font-size: 1.25rem; flex-shrink: 0;"></i>
                                <span>Booking via WA</span>
                            </a>
                            <button type="button" onclick="openCheckoutModal('${activeItemTitle.replace(/'/g, "\\'")}', ${activeItemPrice})" 
                               class="btn-detail-booking-web"
                               style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: white; padding: 13px 8px; border-radius: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.28); border: none; cursor: pointer; text-align: center; font-size: clamp(0.78rem, 3.4vw, 0.9rem); white-space: nowrap; transition: all 0.2s ease;"
                               onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 18px rgba(2, 132, 199, 0.38)';"
                               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 14px rgba(2, 132, 199, 0.28)';">
                                <i class="fa-solid fa-calendar-check" style="font-size: 1.15rem; flex-shrink: 0;"></i>
                                <span>Booking via Web</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div style="padding: 22px 20px; background: white; border-top: 1px solid #e2e8f0; width: 100%; box-sizing: border-box; overflow-x: hidden;">
            <!-- Rating Box Header & Quick Interactive Stars -->
            <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1px solid #fde68a; border-radius: 14px; padding: 16px; margin-bottom: 15px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; width: 100%; max-width: 100%; box-sizing: border-box;">
                <div style="flex: 1; min-width: 160px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <h3 style="font-size: 1.05rem; color: #78350f; margin: 0; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                            <i class="fa-solid fa-star" style="color: #f59e0b;"></i> Rating Pelanggan
                        </h3>
                        <span id="item-rating-score-${item.id}" style="background: #f59e0b; color: white; font-weight: 800; font-size: 0.8rem; padding: 2px 10px; border-radius: 12px; box-shadow: 0 2px 5px rgba(245, 158, 11, 0.3);">
                            ${item.rating ? item.rating : '5.0'} ★
                        </span>
                    </div>
                    <div id="item-rating-subtitle-${item.id}" style="font-size: 0.8rem; color: #92400e;">
                        Berdasarkan ${item.reviewCount || 0} rating penilaian
                    </div>
                </div>

                <!-- 5 Clickable Stars (Hanya bintang aja!) -->
                <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center; min-width: 0;">
                    <div id="star-action-title-${item.id}" style="font-size: 0.78rem; font-weight: 700; color: #92400e; margin-bottom: 5px;">Ketuk Bintang untuk Menilai:</div>
                    <div id="star-bar-${item.id}" class="quick-item-stars" style="display: inline-flex; gap: 5px; font-size: clamp(1.2rem, 4.5vw, 1.5rem); cursor: pointer; user-select: none;">
                        <i class="fa-solid fa-star item-star" data-idx="1" style="color: #cbd5e1; transition: transform 0.15s ease, color 0.15s ease;" onclick="window.quickRateItem('${item.id}', 1)" onmouseover="window.previewItemStars('${item.id}', 1)" onmouseout="window.resetItemStars('${item.id}')"></i>
                        <i class="fa-solid fa-star item-star" data-idx="2" style="color: #cbd5e1; transition: transform 0.15s ease, color 0.15s ease;" onclick="window.quickRateItem('${item.id}', 2)" onmouseover="window.previewItemStars('${item.id}', 2)" onmouseout="window.resetItemStars('${item.id}')"></i>
                        <i class="fa-solid fa-star item-star" data-idx="3" style="color: #cbd5e1; transition: transform 0.15s ease, color 0.15s ease;" onclick="window.quickRateItem('${item.id}', 3)" onmouseover="window.previewItemStars('${item.id}', 3)" onmouseout="window.resetItemStars('${item.id}')"></i>
                        <i class="fa-solid fa-star item-star" data-idx="4" style="color: #cbd5e1; transition: transform 0.15s ease, color 0.15s ease;" onclick="window.quickRateItem('${item.id}', 4)" onmouseover="window.previewItemStars('${item.id}', 4)" onmouseout="window.resetItemStars('${item.id}')"></i>
                        <i class="fa-solid fa-star item-star" data-idx="5" style="color: #cbd5e1; transition: transform 0.15s ease, color 0.15s ease;" onclick="window.quickRateItem('${item.id}', 5)" onmouseover="window.previewItemStars('${item.id}', 5)" onmouseout="window.resetItemStars('${item.id}')"></i>
                    </div>
                    <div id="star-hint-${item.id}" style="font-size: 0.75rem; font-weight: 600; color: #b45309; min-height: 18px; margin-top: 3px; text-align: right;"></div>
                </div>
            </div>

            <!-- List of Ratings given -->
            <div id="item-reviews-container-${item.id}" style="display: flex; gap: 10px; overflow-x: auto; overscroll-behavior-x: contain; width: 100%; max-width: 100%; box-sizing: border-box; padding: 8px 4px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; margin-bottom: 5px;">
                <p style="font-size: 0.85rem; color: #64748b; text-align: center; padding: 12px 0; width: 100%;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat rating...</p>
            </div>
            <style>
                #item-reviews-container-${item.id}::-webkit-scrollbar { display: none; }
            </style>
        </div>

        <div class="tm-footer" style="background: linear-gradient(to right, #f8fafc, #f1f5f9); padding: 25px 20px; border-radius: 0 0 20px 20px; border-top: 1px solid #e2e8f0;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                <div style="background: white; padding: 15px 10px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; display: flex; flex-direction: column; align-items: center; text-align: center;">
                    <div style="width: 45px; height: 45px; background: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; margin-bottom: 8px;">
                        <i class="fa-regular fa-face-smile"></i>
                    </div>
                    <span style="font-size: 0.8rem; font-weight: 700; color: #334155; line-height: 1.2;">Liburan Nyaman</span>
                </div>
                <div style="background: white; padding: 15px 10px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; display: flex; flex-direction: column; align-items: center; text-align: center;">
                    <div style="width: 45px; height: 45px; background: #e0f2fe; color: #0284c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; margin-bottom: 8px;">
                        <i class="fa-solid fa-shield-halved"></i>
                    </div>
                    <span style="font-size: 0.8rem; font-weight: 700; color: #334155; line-height: 1.2;">Aman & Terpercaya</span>
                </div>
                <div style="background: white; padding: 15px 10px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; display: flex; flex-direction: column; align-items: center; text-align: center;">
                    <div style="width: 45px; height: 45px; background: #fef9c3; color: #ca8a04; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; margin-bottom: 8px;">
                        <i class="fa-solid fa-user-tie"></i>
                    </div>
                    <span style="font-size: 0.8rem; font-weight: 700; color: #334155; line-height: 1.2;">Layanan Anti Ribet</span>
                </div>
            </div>
        </div>
    `;

    document.getElementById('tour-modal').classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent double scrollbar
    
    // Fetch and render reviews
    window.loadItemReviews(item.id);
};

window.closeTourModal = () => {
    const modal = document.getElementById('tour-modal');
    if (modal) {
        modal.classList.remove('active');
        const subModal = document.getElementById('sub-package-modal');
        const isSubModalOpen = subModal && subModal.style.display !== 'none';
        if (!isSubModalOpen) {
            document.body.style.overflow = ''; // Restore scroll only if sub-package is closed
            const chatWidget = document.getElementById('ai-chat-widget');
            if (chatWidget) chatWidget.style.display = '';
        }
    }
};

window.previewItemStars = (itemId, val) => {
    if (localStorage.getItem('rated_item_' + itemId)) return;
    const starBar = document.getElementById(`star-bar-${itemId}`);
    if (!starBar) return;
    const stars = starBar.querySelectorAll('.item-star');
    stars.forEach(s => {
        const idx = parseInt(s.getAttribute('data-idx'));
        if (idx <= val) {
            s.style.color = '#f59e0b';
            s.style.transform = 'scale(1.15)';
        } else {
            s.style.color = '#cbd5e1';
            s.style.transform = 'scale(1)';
        }
    });
    const labels = [
        '★ Kurang',
        '★★ Cukup',
        '★★★ Bagus',
        '★★★★ Sangat Bagus',
        '★★★★★ Luar Biasa!'
    ];
    const hint = document.getElementById(`star-hint-${itemId}`);
    if (hint) hint.innerHTML = `<span style="color:#d97706; font-weight:700;">${labels[val - 1]}</span>`;
};

window.resetItemStars = (itemId) => {
    const starBar = document.getElementById(`star-bar-${itemId}`);
    if (!starBar) return;
    const saved = localStorage.getItem('rated_item_' + itemId);
    const stars = starBar.querySelectorAll('.item-star');
    const hint = document.getElementById(`star-hint-${itemId}`);
    const actionTitle = document.getElementById(`star-action-title-${itemId}`);
    
    if (saved) {
        const val = parseInt(saved);
        stars.forEach(s => {
            const idx = parseInt(s.getAttribute('data-idx'));
            if (idx <= val) {
                s.style.color = '#f59e0b';
                s.style.transform = 'scale(1)';
            } else {
                s.style.color = '#cbd5e1';
                s.style.transform = 'scale(1)';
            }
            s.style.cursor = 'default';
        });
        if (hint) hint.innerHTML = `<span style="color:#16a34a; font-weight:700;"><i class="fa-solid fa-circle-check"></i> Rating Anda: ${val}★ (Hanya 1x per item)</span>`;
        if (actionTitle) actionTitle.innerText = 'Rating Anda (Sudah Dinilai):';
    } else {
        stars.forEach(s => {
            s.style.color = '#cbd5e1';
            s.style.transform = 'scale(1)';
            s.style.cursor = 'pointer';
        });
        if (hint) hint.innerHTML = '';
        if (actionTitle) actionTitle.innerText = 'Ketuk Bintang untuk Menilai:';
    }
};

window.quickRateItem = async (itemId, ratingVal) => {
    // Cek apakah sudah pernah memberikan rating pada item ini
    const savedRating = localStorage.getItem('rated_item_' + itemId);
    if (savedRating) {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: `Anda sudah memberi rating ${savedRating}★!`,
            text: 'Setiap pelanggan hanya dapat memberi rating 1 kali per item.',
            showConfirmButton: false,
            timer: 3000
        });
        return;
    }

    if (window._isSubmittingRating) return;
    window._isSubmittingRating = true;

    // Highlight stars immediately
    window.previewItemStars(itemId, ratingVal);
    const hint = document.getElementById(`star-hint-${itemId}`);
    if (hint) hint.innerHTML = `<span style="color:#0284c7;"><i class="fa-solid fa-spinner fa-spin"></i> Menyimpan rating...</span>`;

    let nameValue = 'Pelanggan Terverifikasi';
    let userId = null;
    let photoUrl = null;
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user) {
                if (user.displayName) nameValue = user.displayName;
                else if (user.name) nameValue = user.name;
                userId = user.uid || user.id || null;
                photoUrl = user.photoUrl || null;
            }
        } catch(e) {}
    }

    try {
        const res = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                itemId,
                rating: Number(ratingVal),
                name: nameValue,
                comment: '',
                photoUrl,
                userId
            })
        });

        if (!res.ok) throw new Error('Failed to submit rating');

        // Simpan tanda sudah rating di localStorage
        localStorage.setItem('rated_item_' + itemId, ratingVal);

        if (hint) hint.innerHTML = `<span style="color:#16a34a; font-weight:700;"><i class="fa-solid fa-circle-check"></i> Rating ${ratingVal}★ berhasil disimpan!</span>`;

        const actionTitle = document.getElementById(`star-action-title-${itemId}`);
        if (actionTitle) actionTitle.innerText = 'Rating Anda (Sudah Dinilai):';

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Rating ${ratingVal} Bintang Berhasil! ⭐`,
            text: 'Terima kasih atas penilaian Anda!',
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true
        });

        // Reload reviews & update average score
        await window.loadItemReviews(itemId);
    } catch (error) {
        console.error("Quick rate error:", error);
        if (hint) hint.innerHTML = `<span style="color:#ef4444;"><i class="fa-solid fa-circle-exclamation"></i> Gagal menyimpan rating.</span>`;
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: 'Gagal mengirim rating',
            text: 'Silakan coba lagi.',
            showConfirmButton: false,
            timer: 3000
        });
    } finally {
        window._isSubmittingRating = false;
        window.resetItemStars(itemId);
    }
};

window.loadItemReviews = async (itemId) => {
    const container = document.getElementById(`item-reviews-container-${itemId}`);
    if (!container) return;
    
    try {
        const res = await fetch(`${API_URL}/reviews?itemId=${itemId}`);
        if (!res.ok) throw new Error('Failed to fetch item reviews');
        const reviews = await res.json();

        // Cek jika akun yang sedang login sudah pernah rating item ini di database
        const userStr = localStorage.getItem('auth_user');
        if (userStr && Array.isArray(reviews)) {
            try {
                const user = JSON.parse(userStr);
                const uName = (user.displayName || user.name || '').trim().toLowerCase();
                const uId = user.uid || user.id;
                const existing = reviews.find(r => (uId && r.userId === uId) || (uName && r.name && r.name.trim().toLowerCase() === uName));
                if (existing) {
                    localStorage.setItem('rated_item_' + itemId, existing.rating);
                }
            } catch(e) {}
        }
        
        // Deduplikasi review: Setiap user/nama unik hanya muncul 1 kali
        const seenKeys = new Set();
        const uniqueReviews = [];
        if (Array.isArray(reviews)) {
            for (const r of reviews) {
                let key = '';
                if (r.userId) {
                    key = 'u_' + r.userId;
                } else if (r.name && r.name.trim().toLowerCase() !== 'pelanggan terverifikasi') {
                    key = 'n_' + r.name.trim().toLowerCase();
                } else {
                    key = 'id_' + r.id;
                }
                if (!seenKeys.has(key)) {
                    seenKeys.add(key);
                    uniqueReviews.push(r);
                }
            }
        }

        // Update score badge and count berdasarkan data unik
        const scoreEl = document.getElementById(`item-rating-score-${itemId}`);
        const subtitleEl = document.getElementById(`item-rating-subtitle-${itemId}`);
        
        if (uniqueReviews.length > 0) {
            const avg = uniqueReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / uniqueReviews.length;
            const avgFormatted = avg.toFixed(1).replace('.0', '');
            if (scoreEl) scoreEl.innerText = `${avgFormatted} ★`;
            if (subtitleEl) subtitleEl.innerText = `Berdasarkan ${uniqueReviews.length} rating penilaian`;
            
            // Sync with globalItems
            if (window.globalItems) {
                const it = window.globalItems.find(i => i.id === itemId);
                if (it) {
                    it.rating = avgFormatted;
                    it.reviewCount = uniqueReviews.length;

                    if (it.parentId) {
                        const parent = window.globalItems.find(p => p.id === it.parentId);
                        if (parent) {
                            const siblings = window.globalItems.filter(s => s.parentId === parent.id);
                            const siblingIds = siblings.map(s => s.id);
                            if (window.allReviewsData) {
                                const parentReviews = window.allReviewsData.filter(r => (r.itemId === parent.id || siblingIds.includes(r.itemId)) && r.status === 'approved');
                                if (parentReviews.length > 0) {
                                    const pAvg = parentReviews.reduce((sum, r) => sum + r.rating, 0) / parentReviews.length;
                                    parent.rating = pAvg.toFixed(1).replace('.0', '');
                                    parent.reviewCount = parentReviews.length;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Initialize star display if previously rated
        window.resetItemStars(itemId);

        if (uniqueReviews.length === 0) {
            container.innerHTML = '<p style="font-size: 0.82rem; color: #64748b; text-align: center; padding: 8px 0; width: 100%;">Belum ada rating. Ketuk bintang di atas untuk memberi rating pertama! ⭐</p>';
            return;
        }
        
        container.innerHTML = uniqueReviews.map(r => {
            let stars = '';
            const rVal = Number(r.rating) || 5;
            for (let i = 0; i < 5; i++) {
                if (i < rVal) stars += '<i class="fa-solid fa-star" style="color: #f59e0b; font-size:0.75rem;"></i>';
                else stars += '<i class="fa-regular fa-star" style="color: #cbd5e1; font-size:0.75rem;"></i>';
            }
            const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : '';
            return `
            <div style="flex: 0 0 auto; min-width: 140px; background: white; padding: 10px 14px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 5px rgba(0,0,0,0.03);">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px; margin-bottom: 4px;">
                    <span style="font-weight: 700; font-size: 0.8rem; color: #1e293b; max-width: 95px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.name || 'Pelanggan'}</span>
                    <span style="font-size: 0.68rem; color: #94a3b8;">${dateStr}</span>
                </div>
                <div style="display: flex; gap: 2px; align-items: center;">
                    ${stars}
                    <span style="font-size: 0.75rem; font-weight: 700; color: #d97706; margin-left: 4px;">${rVal}.0</span>
                </div>
                ${r.comment ? `<p style="font-size: 0.78rem; color: #64748b; margin: 4px 0 0; line-height: 1.3;">${r.comment}</p>` : ''}
            </div>`;
        }).join('');
    } catch (e) {
        console.error("Failed to load item reviews:", e);
        container.innerHTML = '<p style="font-size: 0.82rem; color: #ef4444; text-align: center; padding: 8px 0; width: 100%;">Gagal memuat rating.</p>';
    }
};

window.toggleInlineReviewForm = (itemId, itemName) => {
    window.quickRateItem(itemId, 5);
};

window.submitInlineReview = async (itemId) => {
    window.quickRateItem(itemId, 5);
};

window.applyPromo = async () => {
    const promoCode = document.getElementById('co-promo-input').value.trim();
    const msg = document.getElementById('promo-message');
    const priceDisplay = document.getElementById('co-display-price');
    const appliedInput = document.getElementById('co-promo-applied');
    const discountInput = document.getElementById('co-promo-discount');
    
    if (!promoCode) {
        msg.style.display = 'block';
        msg.style.color = '#ef4444';
        msg.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Masukkan kode promo terlebih dahulu.';
        return;
    }
    
    msg.style.display = 'block';
    msg.style.color = '#0284c7';
    msg.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memeriksa kode promo...';
    
    try {
        const res = await fetch(`${API_URL}/promos/verify/${promoCode}?itemId=${window.currentCheckoutItemId || ""}`);
        const data = await res.json();
        
        if (!data.valid) {
            msg.style.color = '#ef4444';
            msg.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> ${data.message || 'Kode promo tidak valid.'}`;
            appliedInput.value = '';
            discountInput.value = '0';
            
            // Reset price display
            if (priceDisplay && priceDisplay.dataset.basePrice) {
                priceDisplay.innerHTML = formatPrice(Number(priceDisplay.dataset.basePrice));
            }
            return;
        }
        
        const basePrice = Number(priceDisplay.dataset.basePrice);
        let discount = 0;
        if (data.discountType === 'percent') {
            discount = basePrice * (data.discountValue / 100);
            if (data.maxDiscount && discount > data.maxDiscount) {
                discount = data.maxDiscount;
            }
        } else {
            discount = data.discountValue;
        }
        
        if (discount > basePrice) discount = basePrice; // Prevent negative price
        
        const finalPrice = basePrice - discount;
        
        msg.style.color = '#10b981';
        msg.innerHTML = `<i class="fa-solid fa-circle-check"></i> Kode berhasil digunakan! Diskon: ${formatPrice(discount)}`;
        appliedInput.value = promoCode;
        discountInput.value = discount;
        
        // Update UI price
        if (priceDisplay) {
            priceDisplay.innerHTML = `<span style="text-decoration:line-through; font-size:0.9rem; color:#94a3b8; margin-right:10px;">${formatPrice(basePrice)}</span> ${formatPrice(finalPrice)}`;
        }
        
    } catch (e) {
        msg.style.color = '#ef4444';
        msg.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Terjadi kesalahan saat memeriksa kode.';
        console.error(e);
    }
};

window.closeCheckoutModal = () => {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
    }
};

// Toggle Show All function
window.toggleShowAll = (containerId, btn, total) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const hiddenItems = container.querySelectorAll('[data-hidden="true"]');
    let isShowing = false;

    hiddenItems.forEach(item => {
        if (item.style.display === 'none') {
            item.style.display = '';
            isShowing = true;
        } else {
            item.style.display = 'none';
            isShowing = false;
        }
    });

    if (isShowing) {
        btn.innerHTML = `Tutup <i class="fa-solid fa-chevron-up" style="margin-left: 5px;"></i>`;
    } else {
        btn.innerHTML = `Lihat Semuanya (${total}) <i class="fa-solid fa-chevron-down" style="margin-left: 5px;"></i>`;
        const yOffset = -80; // Offset for sticky navbar
        const y = container.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
};

// Render Service Card (Layanan)
const createServiceCard = (item, index = 0) => `
    <div class="card service-card" data-aos="zoom-in" data-aos-delay="${(index % 3) * 100}">
        <div class="service-icon"><i class="fa-solid fa-plane"></i></div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
    </div>
`;

// Render Transfer Card (Jasa Antar Jemput - with pricing matrix)
const createTransferCard = (item, index = 0) => {
    if (!item.transferMatrix || item.transferMatrix.length === 0) {
        // Fallback to service card if no matrix
        return createServiceCard(item, index);
    }
    const vehicles = item.transferVehicles || Object.keys(item.transferMatrix[0]?.prices || {});
    let tableRows = '';
    item.transferMatrix.forEach(tm => {
        tableRows += `<tr>
            <td style="padding: 10px 14px; font-weight: 700; color: var(--text-dark); white-space: nowrap; border: 1px solid #e2e8f0;"><i class="fa-solid fa-location-dot" style="color: var(--primary-green); margin-right: 6px;"></i>${tm.area}</td>
            ${vehicles.map(v => {
            const price = tm.prices[v];
            return `<td style="padding: 10px 8px; text-align: center; border: 1px solid #e2e8f0; white-space: nowrap; font-weight: 600; color: var(--text-dark);">${price ? formatPrice(price) : '-'}</td>`;
        }).join('')}
        </tr>`;
    });

    return `
    <div class="card" data-aos="fade-up" data-aos-delay="${(index % 2) * 100}" style="grid-column: 1/-1; padding: 0; overflow: hidden; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, var(--primary-blue), #0369a1); padding: 25px 30px; color: white;">
            <h3 style="margin: 0 0 5px 0; font-size: 1.4rem; font-weight: 800;"><i class="fa-solid fa-plane-departure" style="margin-right: 10px;"></i>${item.title}</h3>
            <p style="margin: 0; opacity: 0.85; font-size: 0.95rem;">${item.description || 'Dari Airport / Sebaliknya'}</p>
        </div>
        <div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 600px; border: 1px solid #e2e8f0;">
                <thead>
                    <tr style="background: #f0f9ff;">
                        <th style="padding: 12px 14px; text-align: left; font-weight: 800; color: var(--primary-blue); border: 1px solid #bae6fd; border-bottom: 2px solid var(--primary-blue); white-space: nowrap;">AREA TUJUAN</th>
                        ${vehicles.map(v => `<th style="padding: 12px 8px; text-align: center; font-weight: 700; color: var(--primary-blue); border: 1px solid #bae6fd; border-bottom: 2px solid var(--primary-blue); white-space: nowrap;">${v}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
        <div style="padding: 15px 25px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; flex-wrap: wrap; gap: 20px; align-items: center; justify-content: space-between;">
            <div style="display: flex; gap: 15px; flex-wrap: wrap; font-size: 0.8rem; color: #475569;">
                <span><i class="fa-solid fa-check-circle" style="color: var(--primary-green); margin-right: 4px;"></i> Parkir Tolget</span>
                <span><i class="fa-solid fa-check-circle" style="color: var(--primary-green); margin-right: 4px;"></i> Driver Berpengalaman</span>
                <span><i class="fa-solid fa-check-circle" style="color: var(--primary-green); margin-right: 4px;"></i> BBM / Petrol</span>
            </div>
            <a href="https://wa.me/6289676963255?text=Halo%20Admin,%20saya%20ingin%20booking%20${encodeURIComponent(item.title)}" target="_blank" class="btn" style="background: #25D366; color: white; font-weight: 700; padding: 10px 20px; border-radius: 25px; font-size: 0.9rem; white-space: nowrap;"><i class="fa-brands fa-whatsapp" style="margin-right: 6px;"></i> Booking Sekarang</a>
        </div>
    </div>
    `;
};

// Render Package Card (Paket Tour)
const createPackageCard = (item, index = 0) => {
    const isParent = item.isParent === true;
    const isHoneymoon = (item.category === 'honeymoon') || 
        (item.title && (item.title.toLowerCase().includes('honeymoon') || item.title.toLowerCase().includes('bulan madu')));
    
    const parentBorder = isHoneymoon ? 'border:2px solid #ec4899; box-shadow:0 10px 20px rgba(236,72,153,0.15);' : (isParent ? 'border:2px solid #fbbf24;' : '');
    const gradientBtn = isHoneymoon ? 'linear-gradient(135deg, #ec4899, #be185d)' : 'linear-gradient(135deg,var(--primary-blue,#0ea5e9),#1e40af)';
    const btnHtml = isParent
        ? `<button onclick="window.openSubPackageModal('${item.id}')" class="btn" style="background:${gradientBtn}; color:white; border:none; font-size:0.85rem; padding:8px 16px; border-radius:20px; font-weight:700;"><i class="fa-solid fa-layer-group" style="margin-right:5px;"></i>LIHAT PAKET</button>`
        : `<button onclick="openTourModal('${item.id}')" class="btn" style="background: var(--bg-light); color: ${isHoneymoon ? '#ec4899' : 'var(--primary-blue)'}; border: none; font-size: 0.85rem; padding: 8px 16px; border-radius: 20px; font-weight: 700;">DETAIL</button>`;
    
    let badgeHtml = '';
    if (isHoneymoon) {
        badgeHtml = `<span style="position:absolute;top:10px;left:10px;background:linear-gradient(135deg,#ec4899,#be185d);color:white;font-size:0.65rem;font-weight:800;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;z-index:2;box-shadow:0 4px 10px rgba(236,72,153,0.3);"><i class="fa-solid fa-heart" style="margin-right:4px;"></i>Honeymoon Special</span>`;
    } else if (isParent) {
        badgeHtml = `<span style="position:absolute;top:10px;left:10px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#78350f;font-size:0.65rem;font-weight:800;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;z-index:2;"><i class="fa-solid fa-layer-group" style="margin-right:4px;"></i>Paket Pilihan</span>`;
    }
    
    const ratingBadge = item.rating 
        ? `<span style="position:absolute; ${(isParent || isHoneymoon) ? 'top:45px;' : 'top:10px;'} left:10px; background:rgba(255,255,255,0.95); color:#f59e0b; font-weight:800; font-size:0.8rem; padding:4px 10px; border-radius:20px; z-index:2; box-shadow:0 2px 4px rgba(0,0,0,0.1);"><i class="fa-solid fa-star" style="margin-right:4px;"></i>${item.rating}</span>` : '';
    return `
    <div class="card package-card" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}" style="${parentBorder} ${isHoneymoon ? 'background: linear-gradient(to bottom, #fff, #fdf2f8);' : ''}">
        <div class="img-wrapper" style="position:relative;">
            <button onclick="window.shareItem('${item.id}', '${item.title.replace(/'/g, "\\'")}', '${formatPrice(item.price)}')" style="position:absolute; top:10px; right:10px; background:rgba(255,255,255,0.9); color:var(--primary-blue); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Bagikan"><i class="fa-solid fa-share-nodes"></i></button>
            <button id="btn-wishlist-${item.id}" onclick="event.stopPropagation(); window.toggleWishlist('${item.id}')" style="position:absolute; top:10px; right:50px; background:rgba(255,255,255,0.9); color:var(--text-gray); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Simpan ke Wishlist"><i class="${window.isInWishlist && window.isInWishlist(item.id) ? 'fa-solid' : 'fa-regular'} fa-heart" ${window.isInWishlist && window.isInWishlist(item.id) ? 'style="color:#ef4444;"' : ''}></i></button>
            <span class="tag" style="${isHoneymoon ? 'background:#fce7f3; color:#db2777;' : ''}"><i class="fa-regular fa-clock" style="margin-right: 4px;"></i> ${item.duration || '1 HARI'}</span>
            ${badgeHtml}
            ${ratingBadge}
            <img src="${item.imageUrl}" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'">
        </div>
        <div class="content">
            <h3>${item.title}</h3>
            <ul>
                <li><i class="fa-solid fa-check"></i> ${item.description || ''}</li>
            </ul>
            <div class="price-row">
                  <div class="price" style="flex: 1; min-width: 0;">
                      ${(() => {
                          return `
                                  <div style="display: flex; flex-direction: column;">
                                      <span style="font-size: 0.7rem; color: #64748b;">Mulai dari</span>
                                      <span style="color: ${isHoneymoon ? '#db2777' : 'var(--primary-blue)'}; font-weight: 800; font-size: 1.05rem;">${formatPrice(item.price)}</span>
                                  </div>
                          `;
                      })()}
                  </div>
                ${btnHtml}
            </div>
        </div>
    </div>
`};

// ===== SUB-PACKAGE MODAL LOGIC =====
window.openSubPackageModal = (parentId) => {
    const parentItem = globalItems.find(i => i.id === parentId);
    if (!parentItem) return;

    // Sembunyikan floating widget Tanya AIRA saat modal sub-paket dibuka
    const chatWidget = document.getElementById('ai-chat-widget');
    if (chatWidget) chatWidget.style.display = 'none';

    const children = globalItems.filter(i => i.parentId === parentId);

    // Sync ratings for each child item from allReviewsData
    if (window.allReviewsData) {
        children.forEach(child => {
            const childReviews = window.allReviewsData.filter(r => r.itemId === child.id && r.status === 'approved');
            const seenKeys = new Set();
            const uniqueReviews = [];
            childReviews.forEach(r => {
                const key = r.userId ? ('u_' + r.userId) : (r.name && r.name.trim().toLowerCase() !== 'pelanggan terverifikasi' ? ('n_' + r.name.trim().toLowerCase()) : ('id_' + r.id));
                if (!seenKeys.has(key)) {
                    seenKeys.add(key);
                    uniqueReviews.push(r);
                }
            });
            if (uniqueReviews.length > 0) {
                const avg = uniqueReviews.reduce((sum, r) => sum + r.rating, 0) / uniqueReviews.length;
                child.rating = avg.toFixed(1).replace('.0', '');
                child.reviewCount = uniqueReviews.length;
            }
        });
    }

    const titleEl = document.getElementById('sub-modal-title');
    const descEl = document.getElementById('sub-modal-desc');
    const bodyEl = document.getElementById('sub-modal-body');
    const modal = document.getElementById('sub-package-modal');

    if (!titleEl || !bodyEl || !modal) return;

    titleEl.innerText = parentItem.title;
    if (descEl) descEl.innerText = parentItem.description || 'Pilih paket yang sesuai dengan keinginan Anda.';

    // Scroll modal to top
    modal.scrollTop = 0;

    if (children.length === 0) {
        bodyEl.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:#64748b;">
            <i class="fa-solid fa-box-open" style="font-size:3.5rem; margin-bottom:15px; display:block; color:#cbd5e1;"></i>
            <p style="font-size:1rem; font-weight:600;">Belum ada sub-paket.</p>
            <p style="font-size:0.85rem;">Silakan tambahkan sub-paket dari panel admin.</p>
        </div>`;
    } else {
        bodyEl.innerHTML = children
            .sort((a, b) => {
                const getPaketLetter = (title) => {
                    const match = (title || '').match(/paket\s+([a-z])/i);
                    return match ? match[1].toUpperCase() : null;
                };
                const letterA = getPaketLetter(a.title);
                const letterB = getPaketLetter(b.title);
                
                if (letterA && letterB) {
                    if (letterA !== letterB) return letterA.localeCompare(letterB);
                } else if (letterA) {
                    return -1;
                } else if (letterB) {
                    return 1;
                }
                
                const orderA = a.order || 0;
                const orderB = b.order || 0;
                if (orderA !== orderB) return orderA - orderB;
                
                return (a.title || '').localeCompare(b.title || '', 'id', { sensitivity: 'base' });
            })
            .map((child) => {
            const isHoneymoon = (child.category === 'honeymoon') || 
                (child.title && (child.title.toLowerCase().includes('honeymoon') || child.title.toLowerCase().includes('bulan madu'))) || 
                isParentHoneymoon;
            const formattedPrice = child.price ? formatPrice(child.price) : '';
            const borderStyle = isHoneymoon ? 'border: 1px solid #fbcfe8;' : 'border:none;';
            const bgStyle = isHoneymoon ? 'background: linear-gradient(to bottom, #ffffff, #fdf2f8);' : 'background:white;';
            const shadowStyle = isHoneymoon ? 'box-shadow: 0 10px 25px -5px rgba(236,72,153,0.15), 0 8px 10px -6px rgba(236,72,153,0.05);' : 'box-shadow:0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04);';
            const hoverShadow = isHoneymoon ? "this.style.boxShadow='0 20px 25px -5px rgba(236,72,153,0.25), 0 10px 10px -5px rgba(236,72,153,0.1)'" : "this.style.boxShadow='0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'";
            const normalShadow = isHoneymoon ? "this.style.boxShadow='0 10px 25px -5px rgba(236,72,153,0.15), 0 8px 10px -6px rgba(236,72,153,0.05)'" : "this.style.boxShadow='0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)'";
            const honeymoonBadge = isHoneymoon ? `<span style="position:absolute; top:8px; left:8px; background:linear-gradient(135deg, #ec4899, #be185d); color:white; font-size:clamp(0.55rem, 2vw, 0.65rem); font-weight:800; padding:3px 8px; border-radius:14px; text-transform:uppercase; letter-spacing:0.5px; z-index:2; box-shadow:0 4px 10px rgba(236,72,153,0.3);"><i class="fa-solid fa-heart" style="margin-right:3px;"></i>Honeymoon</span>` : '';
            const childRatingBadge = child.rating ? `<span style="position:absolute; ${isHoneymoon ? 'top:34px;' : 'top:8px;'} left:8px; background:rgba(255,255,255,0.95); color:#f59e0b; font-weight:800; font-size:clamp(0.68rem, 2vw, 0.78rem); padding:2px 7px; border-radius:14px; z-index:2; box-shadow:0 2px 4px rgba(0,0,0,0.1);"><i class="fa-solid fa-star" style="margin-right:3px;"></i>${child.rating}</span>` : '';
            
            return `
            <div class="sub-package-card" style="${bgStyle} ${borderStyle} border-radius:16px; overflow:hidden; ${shadowStyle} cursor:pointer; display:flex; flex-direction:column; min-width:0; width:100%; box-sizing:border-box; transition: transform 0.3s ease, box-shadow 0.3s ease;"
                 onmouseover="this.style.transform='translateY(-5px)'; ${hoverShadow};"
                 onmouseout="this.style.transform='translateY(0)'; ${normalShadow};"
                 onclick="openTourModal('${child.id}');">
                <!-- Image -->
                <div style="position:relative; height:clamp(120px, 34vw, 175px); overflow:hidden;">
                    ${honeymoonBadge}
                    ${childRatingBadge}
                    <button onclick="event.stopPropagation(); window.shareItem('${child.id}', '${child.title.replace(/'/g, "\\'")}', '${formatPrice(child.price)}')" style="position:absolute; top:8px; right:8px; background:rgba(255,255,255,0.92); color:var(--primary-blue); border:none; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Bagikan"><i class="fa-solid fa-share-nodes" style="font-size:0.75rem;"></i></button>
                    <button id="btn-wishlist-${child.id}" onclick="event.stopPropagation(); window.toggleWishlist('${child.id}')" style="position:absolute; top:8px; right:40px; background:rgba(255,255,255,0.92); color:var(--text-gray); border:none; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Simpan ke Wishlist"><i class="${window.isInWishlist && window.isInWishlist(child.id) ? 'fa-solid' : 'fa-regular'} fa-heart" ${window.isInWishlist && window.isInWishlist(child.id) ? 'style="color:#ef4444;"' : ''} style="font-size:0.75rem;"></i></button>
                    <img src="${child.imageUrl || parentItem.imageUrl}" alt="${child.title}"
                        style="width:100%; height:100%; object-fit:cover; transition: transform 0.5s ease;"
                        onmouseover="this.style.transform='scale(1.08)'"
                        onmouseout="this.style.transform='scale(1)'"
                        onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600'">
                    ${formattedPrice ? `<div style="position:absolute; bottom:8px; right:8px; background:rgba(255, 255, 255, 0.95); backdrop-filter:blur(4px); color:#0f172a; font-size:clamp(0.62rem, 2.3vw, 0.72rem); font-weight:800; padding:3px 7px; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.4);">${formattedPrice} <span style="font-size:0.48rem; font-weight:600; color:#64748b;">/orang</span></div>` : ''}
                </div>
                <!-- Content -->
                <div style="padding:10px 12px; display:flex; flex-direction:column; flex:1;">
                    <h4 style="margin:0 0 6px; font-size:clamp(0.82rem, 2.7vw, 0.95rem); font-weight:800; color:#0f172a; line-height:1.35;">${child.title}</h4>
                    <div style="display:flex; gap:2px; margin-bottom:8px; align-items:center; flex-wrap:wrap;">
                        ${(() => {
                            const rVal = parseFloat(child.rating) || 5.0;
                            let starsHtml = '';
                            for (let s = 0; s < 5; s++) {
                                if (s < Math.round(rVal)) starsHtml += '<i class="fa-solid fa-star" style="color:#fbbf24; font-size:0.65rem;"></i>';
                                else starsHtml += '<i class="fa-regular fa-star" style="color:#cbd5e1; font-size:0.65rem;"></i>';
                            }
                            const reviewText = child.reviewCount ? `(${child.reviewCount})` : '(Top)';
                            return `${starsHtml} <span style="font-size:0.75rem; font-weight:700; color:#d97706; margin-left:3px;">${child.rating || '5.0'}</span> <span style="font-size:0.65rem; color:#64748b; margin-left:3px; font-weight:500; white-space:nowrap;">${reviewText}</span>`;
                        })()}
                    </div>
                    <div style="margin-top:auto; padding-top:8px; border-top:1px dashed ${isHoneymoon ? '#fbcfe8' : '#e2e8f0'}; text-align:center;">
                        <span style="color:${isHoneymoon ? '#db2777' : '#0ea5e9'}; font-size:clamp(0.72rem, 2.4vw, 0.82rem); font-weight:700; display:flex; align-items:center; justify-content:center; gap:5px; transition: color 0.2s ease;">
                            Lihat Detail <i class="fa-solid fa-arrow-right" style="font-size:0.75rem;"></i>
                        </span>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
};

window.closeSubPackageModal = () => {
    const modal = document.getElementById('sub-package-modal');
    if (modal) modal.style.display = 'none';
    const tourModal = document.getElementById('tour-modal');
    const isTourModalOpen = tourModal && tourModal.classList.contains('active');
    if (!isTourModalOpen) {
        document.body.style.overflow = '';
        const chatWidget = document.getElementById('ai-chat-widget');
        if (chatWidget) chatWidget.style.display = '';
    }
};




// Render Fleet Card (Armada/Rental) - Redesigned to match Package Card style
const createFleetCard = (item, index = 0) => {
    const categoryIcon = item.category === 'motorcycle' ? 'fa-motorcycle' : 'fa-car';
    const categoryLabel = item.category === 'motorcycle' ? 'Motor' : 'Mobil';

    // Build feature tags
    let featureTags = '';
    if (item.seats) {
        featureTags += `<span class="fleet-tag"><i class="fa-solid fa-user-group"></i> ${item.seats} ${item.category === 'motorcycle' ? 'Helm' : 'Seat'}</span>`;
    }
    if (item.transmission) {
        featureTags += `<span class="fleet-tag"><i class="fa-solid fa-gear"></i> ${item.transmission}</span>`;
    }
    if (item.driverOptions) {
        featureTags += `<span class="fleet-tag"><i class="fa-solid fa-id-card"></i> ${item.driverOptions}</span>`;
    }

    // Build include list
    let includeHtml = '';
    if (item.include) {
        const includes = item.include.split('\n').filter(i => i.trim());
        includeHtml = includes.map(inc => `<li><i class="fa-solid fa-check"></i> ${inc.trim()}</li>`).join('');
    }
    if (item.description && !item.include) {
        includeHtml = `<li><i class="fa-solid fa-check"></i> ${item.description}</li>`;
    }

    const ratingBadge = item.rating 
        ? `<span style="position:absolute; top:10px; left:10px; background:rgba(255,255,255,0.95); color:#f59e0b; font-weight:800; font-size:0.8rem; padding:4px 10px; border-radius:20px; z-index:2; box-shadow:0 2px 4px rgba(0,0,0,0.1);"><i class="fa-solid fa-star" style="margin-right:4px;"></i>${item.rating}</span>` : '';

    return `
    <div class="card package-card fleet-card-v2" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
        <div class="img-wrapper" style="position:relative;">
            <button onclick="window.shareItem('${item.id}', '${item.title.replace(/'/g, "\\'")}', '${formatPrice(item.price)}')" style="position:absolute; top:10px; right:10px; background:rgba(255,255,255,0.9); color:var(--primary-blue); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Bagikan"><i class="fa-solid fa-share-nodes"></i></button>
            <button id="btn-wishlist-${item.id}" onclick="event.stopPropagation(); window.toggleWishlist('${item.id}')" style="position:absolute; top:10px; right:50px; background:rgba(255,255,255,0.9); color:var(--text-gray); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Simpan ke Wishlist"><i class="${window.isInWishlist && window.isInWishlist(item.id) ? 'fa-solid' : 'fa-regular'} fa-heart" ${window.isInWishlist && window.isInWishlist(item.id) ? 'style="color:#ef4444;"' : ''}></i></button>
            <span class="tag"><i class="fa-solid ${categoryIcon}" style="margin-right: 4px;"></i> ${categoryLabel}</span>
            ${ratingBadge}
            <img src="${item.imageUrl}" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800'">
        </div>
        <div class="content">
            <h3 class="notranslate">${item.title}</h3>
            ${featureTags ? `<div class="fleet-tags-row">${featureTags}</div>` : ''}
            ${includeHtml ? `<ul>${includeHtml}</ul>` : ''}
            <div class="price-row">
                  <div class="price" style="flex: 1; min-width: 0;">
                      <div style="display: flex; flex-direction: column; gap: 2px;">
                                  <div style="font-size: 0.7rem; color: #64748b;">Mulai dari</div>
                                  <div style="color: var(--primary-blue); font-weight: 800; font-size: 1.05rem; white-space: nowrap;">${formatPrice(item.price)}</div>
                                  <div style="font-size: 0.65rem; color: #64748b; font-weight: 500;">/ ${item.duration || 'hari'}</div>
                      </div>
                  </div>
                <div class="action-buttons">
                    <button onclick="openTourModal('${item.id}')" class="btn" style="background: var(--bg-light); color: var(--primary-blue); border: none; font-size: 0.85rem; padding: 8px 16px; border-radius: 20px; font-weight: 700;">DETAIL</button>
                    <button onclick="openCheckoutModal('${item.title.replace(/'/g, "\\'")}', ${item.price}, 'wa')" class="btn btn-green" style="padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 0.85rem; box-shadow: 0 4px 6px rgba(5,150,105,0.2);"><i class="fa-brands fa-whatsapp"></i></button>
                </div>
            </div>

        </div>
    </div>
    `;
};

// Render Drone Card (Dokumentasi Drone)
const createDroneCard = (item, index = 0) => {
    let iframeSrc = '';
    let isExternalLink = false;
    let externalUrl = '';
    let videoUrlStr = item.droneVideoUrl || '';

    if (videoUrlStr) {
        try {
            const url = new URL(videoUrlStr);
            if (url.hostname.includes('youtube.com')) {
                let v = '';
                if (url.pathname.startsWith('/shorts/')) v = url.pathname.split('/')[2];
                else if (url.pathname.startsWith('/embed/')) v = url.pathname.split('/')[2];
                else v = url.searchParams.get('v');
                if (v) iframeSrc = `https://www.youtube.com/embed/${v}?rel=0`;
            } else if (url.hostname.includes('youtu.be')) {
                iframeSrc = `https://www.youtube.com/embed/${url.pathname.slice(1)}?rel=0`;
            } else if (videoUrlStr.endsWith('.mp4')) {
                iframeSrc = videoUrlStr; // will be handled as <video>
            } else {
                // Any other URL (Streamable, TikTok, IG, GDrive, dll)
                // Banyak situs memblokir iframe (X-Frame-Options: DENY).
                // Solusi terbaik: Buka di tab baru dengan tombol play overlay.
                isExternalLink = true;
                externalUrl = videoUrlStr;
            }
        } catch (e) {
            if (videoUrlStr.length === 11) {
                iframeSrc = `https://www.youtube.com/embed/${videoUrlStr}?rel=0`;
            } else {
                isExternalLink = true;
                externalUrl = videoUrlStr;
            }
        }
    }

    const isAvailable = window.isDroneAvailable !== false;
    const buttonHtml = isAvailable
        ? `<a href="https://wa.me/6289676963255?text=Halo%20Admin,%20saya%20ingin%20pesan%20${encodeURIComponent(item.title)}" target="_blank" class="btn btn-green w-100"><i class="fa-brands fa-whatsapp"></i> PESAN SEKARANG</a>`
        : ``; // Jangan tampilkan tombol abu-abu gembok agar user tidak mengira videonya yang dikunci

    let dateHtml = '';
    if (item.date) {
        try {
            const dateObj = new Date(item.date);
            const formattedDate = dateObj.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
            dateHtml = `<div style="font-size: 0.85rem; color: #64748b; margin-bottom: 8px;"><i class="fa-regular fa-calendar" style="margin-right: 5px;"></i> ${formattedDate}</div>`;
        } catch (e) { }
    }

    let mediaHtml = `<img src="${item.imageUrl || 'https://images.unsplash.com/photo-1579822606820-25e2e8e34272?auto=format&fit=crop&q=80&w=800'}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 20px 20px 0 0;" onerror="this.src='https://images.unsplash.com/photo-1579822606820-25e2e8e34272?auto=format&fit=crop&q=80&w=800'">`;

    if (iframeSrc) {
        if (iframeSrc.endsWith('.mp4')) {
            mediaHtml = `<video width="100%" height="100%" controls style="border-radius: 20px 20px 0 0; object-fit: contain; background: #000;"><source src="${iframeSrc}" type="video/mp4">Your browser does not support HTML video.</video>`;
        } else {
            mediaHtml = `<iframe width="100%" height="100%" src="${iframeSrc}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 20px 20px 0 0; background: #000;"></iframe>`;
        }
    } else if (isExternalLink) {
        mediaHtml += `
            <div onclick="window.openVideoModal('${externalUrl}')" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); text-decoration: none; color: white; border-radius: 20px 20px 0 0; transition: all 0.3s ease; cursor: pointer;" onmouseover="this.style.background='rgba(0,0,0,0.3)'" onmouseout="this.style.background='rgba(0,0,0,0.5)'">
                <div style="text-align: center;">
                    <i class="fa-solid fa-play" style="font-size: 3.5rem; margin-bottom: 10px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));"></i>
                    <div style="font-weight: 800; letter-spacing: 1px; font-size: 1.1rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">TONTON VIDEO</div>
                </div>
            </div>
        `;
    }

    return `
    <div class="card drone-card" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
        <div class="img-wrapper" style="height: ${iframeSrc && iframeSrc.endsWith('.mp4') ? 'auto; min-height: 200px' : '250px'}; position: relative;">
            <button onclick="window.shareItem('${item.id}', '${item.title.replace(/'/g, "\\'")}', '${formatPrice(item.price)}')" style="position:absolute; top:10px; right:10px; background:rgba(255,255,255,0.9); color:var(--primary-blue); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Bagikan"><i class="fa-solid fa-share-nodes"></i></button>
            <button id="btn-wishlist-${item.id}" onclick="event.stopPropagation(); window.toggleWishlist('${item.id}')" style="position:absolute; top:10px; right:50px; background:rgba(255,255,255,0.9); color:var(--text-gray); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Simpan ke Wishlist"><i class="${window.isInWishlist && window.isInWishlist(item.id) ? 'fa-solid' : 'fa-regular'} fa-heart" ${window.isInWishlist && window.isInWishlist(item.id) ? 'style="color:#ef4444;"' : ''}></i></button>
            ${mediaHtml}
        </div>
        <div class="content" style="padding: 20px;">
            <h3 style="color: var(--primary-blue); font-size: 1.2rem; margin-bottom: 5px;">${item.title}</h3>
            ${dateHtml}
            <p style="color: var(--text-gray); font-size: 0.9rem; margin-bottom: 25px;">${(item.description || '').replace(/\n/g, '<br>')}</p>
            ${buttonHtml}
        </div>
    </div>
    `;
};

// Close Coming Soon Modal
window.closeComingSoonModal = () => {
    const modal = document.getElementById('coming-soon-modal');
    if (modal) {
        modal.style.animation = 'reviewFadeOut 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards';
        setTimeout(() => {
            modal.style.display = 'none';
            modal.style.animation = ''; // Reset for next time if needed
        }, 200);
    }
};

// Initialize Page
const init = async () => {
    window.isDroneAvailable = true;

    // Check Global Settings (e.g. Drone Availability and Maintenance Mode)
    try {
        const res = await fetch(`/api/settings?_t=${new Date().getTime()}`, { cache: 'no-store' });
        if (res.ok) {
            const settings = await res.json();
            window.globalSettings = settings;
            
            // Maintenance Mode Check
            if (settings.maintenanceMode === true && !window.location.pathname.includes('/admin')) {
                document.body.innerHTML = `
                    <style>
                        @keyframes float {
                            0% { transform: translateY(0px); }
                            50% { transform: translateY(-15px); }
                            100% { transform: translateY(0px); }
                        }
                        @keyframes pulse-ring {
                            0% { transform: scale(0.8); opacity: 0.5; }
                            100% { transform: scale(1.3); opacity: 0; }
                        }
                        .maint-card {
                            background: rgba(255, 255, 255, 0.95);
                            backdrop-filter: blur(10px);
                            padding: 50px 30px;
                            border-radius: 28px;
                            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15);
                            max-width: 450px;
                            width: calc(100% - 40px);
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            position: relative;
                            z-index: 2;
                            border: 1px solid rgba(255,255,255,0.5);
                        }
                        .maint-icon-container {
                            width: 90px;
                            height: 90px;
                            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-bottom: 25px;
                            position: relative;
                            animation: float 4s ease-in-out infinite;
                        }
                        .maint-icon-container::before {
                            content: '';
                            position: absolute;
                            width: 100%;
                            height: 100%;
                            background: #3b82f6;
                            border-radius: 50%;
                            z-index: -1;
                            animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                        }
                        .maint-bg {
                            position: fixed;
                            top: 0; left: 0; width: 100vw; height: 100vh;
                            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
                            z-index: 999999;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            text-align: center;
                            font-family: 'Outfit', sans-serif;
                        }
                        .maint-blob {
                            position: absolute;
                            width: 300px; height: 300px;
                            background: rgba(59, 130, 246, 0.15);
                            filter: blur(40px);
                            border-radius: 50%;
                            top: -100px; left: -100px;
                            z-index: 1;
                        }
                        .maint-blob2 {
                            position: absolute;
                            width: 250px; height: 250px;
                            background: rgba(16, 185, 129, 0.15);
                            filter: blur(40px);
                            border-radius: 50%;
                            bottom: -50px; right: -50px;
                            z-index: 1;
                        }
                        @media (max-width: 480px) {
                            .maint-card { padding: 40px 20px; }
                            .maint-title { font-size: 1.5rem !important; }
                        }
                    </style>
                    <div class="maint-bg">
                        <div class="maint-blob"></div>
                        <div class="maint-blob2"></div>
                        <div class="maint-card">
                            <img src="/logo.png" alt="Travel Lombok Airport Logo" style="height: 100px; object-fit: contain; margin-bottom: 30px;">
                            <div class="maint-icon-container">
                                <i class="fa-solid fa-person-digging" style="font-size: 2.5rem; color: #3b82f6;"></i>
                            </div>
                            <h1 class="maint-title" style="color: #0f172a; font-size: 1.8rem; font-weight: 800; margin-bottom: 15px; line-height: 1.3;">Sedang Pemeliharaan</h1>
                            <p style="color: #475569; font-size: 1rem; line-height: 1.6; margin-bottom: 30px;">Kami sedang meningkatkan sistem untuk memberikan pengalaman yang lebih baik. Silakan kembali beberapa saat lagi.</p>
                            <div style="display: flex; gap: 15px; width: 100%; flex-wrap: wrap;">
                                <a href="https://wa.me/6289676963255?text=Halo%20Travel%20Lombok%20Airport%2C%20saya%20ingin%20menanyakan%20informasi%20layanan%20karena%20saat%20ini%20website%20sedang%20dalam%20pemeliharaan.%20Mohon%20bantuannya." target="_blank" style="flex: 1; min-width: 140px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 14px; border-radius: 14px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); transition: transform 0.2s;">
                                    <i class="fa-brands fa-whatsapp"></i> Hubungi CS
                                </a>
                                <button onclick="window.location.reload()" style="flex: 1; min-width: 140px; background: white; color: #3b82f6; border: 2px solid #e2e8f0; padding: 14px; border-radius: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#3b82f6'; this.style.backgroundColor='#eff6ff';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.backgroundColor='white';">
                                    <i class="fa-solid fa-rotate-right"></i> Muat Ulang
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                return; // Stop further execution
            }

            if (settings.droneAvailable === 'unavailable') {
                window.isDroneAvailable = false;

                // If on drone.html, update the main booking button
                const mainBookBtn = document.getElementById('drone-main-book-btn');
                if (mainBookBtn) {
                    mainBookBtn.removeAttribute('href');
                    mainBookBtn.style.background = '#cbd5e1';
                    mainBookBtn.style.cursor = 'not-allowed';
                    mainBookBtn.style.borderColor = '#cbd5e1';
                    mainBookBtn.innerHTML = '<i class="fa-solid fa-lock"></i> LAYANAN BELUM TERSEDIA';
                }
            }

            if (settings.dronePrice) {
                // If a price is set, update it on drone.html
                const dronePriceEl = document.getElementById('drone-base-price');
                if (dronePriceEl) {
                    dronePriceEl.innerText = formatPrice(settings.dronePrice).replace('Rp ', '');
                }
            }

            // COMING SOON EVENT
            if (settings.comingSoonEnabled === true && !window.location.pathname.includes('/admin')) {
                setTimeout(() => {
                    let modal = document.getElementById('coming-soon-modal');
                    if (!modal) {
                        const modalHTML = `
                            <style>
                                @keyframes csModalIn { 0%{opacity:0;transform:scale(0.88) translateY(28px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
                                @keyframes csOverlayIn { 0%{opacity:0} 100%{opacity:1} }
                                @keyframes csPulseGlow { 0%,100%{box-shadow:0 0 0 1px rgba(99,102,241,0.3),0 0 20px rgba(99,102,241,0.1)} 50%{box-shadow:0 0 0 1px rgba(99,102,241,0.5),0 0 28px rgba(99,102,241,0.22)} }
                                @keyframes csShimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
                                @keyframes csCountPop { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
                                @keyframes csExpandIn { 0%{opacity:0;max-height:0} 100%{opacity:1;max-height:600px} }
                                #coming-soon-modal { animation: csOverlayIn 0.3s ease-out both; }
                                #coming-soon-modal .cs-card { animation: csModalIn 0.4s cubic-bezier(0.34,1.4,0.64,1) 0.05s both; }
                                #coming-soon-modal .cs-close-btn:hover { background:rgba(255,255,255,0.18)!important; transform:rotate(90deg) scale(1.08); }
                                #coming-soon-modal .cs-btn-primary:hover { transform:translateY(-2px); box-shadow:0 12px 28px rgba(79,70,229,0.45)!important; }
                                #coming-soon-modal .cs-btn-primary:active { transform:scale(0.97); }
                                #coming-soon-modal .cs-btn-secondary:hover { background:rgba(255,255,255,0.1)!important; }
                                .cs-title-clamp { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
                                .cs-desc-preview { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
                                #cs-detail-panel { animation: csExpandIn 0.4s ease-out both; overflow:hidden; }
                                .cs-typewriter-cursor { font-weight: bold; color: #a78bfa; animation: csBlink 1s step-end infinite; }
                                @keyframes csBlink { 50% { opacity: 0; } }
                            </style>
                            <div id="coming-soon-modal" style="z-index:10001;position:fixed;inset:0;background:rgba(2,6,23,0.92);display:none;justify-content:center;align-items:flex-end;padding:12px;-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);">
                                <div class="cs-card" style="background:linear-gradient(160deg,#0f172a,#171f38);border-radius:24px 24px 20px 20px;width:100%;max-width:430px;position:relative;box-shadow:0 -8px 40px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.07);overflow:hidden;max-height:92vh;display:flex;flex-direction:column;">

                                    <!-- Glow accents -->
                                    <div style="position:absolute;top:-40px;right:-40px;width:150px;height:150px;background:radial-gradient(circle,rgba(99,102,241,0.16),transparent 70%);pointer-events:none;z-index:0;"></div>
                                    <div style="position:absolute;bottom:-20px;left:-20px;width:120px;height:120px;background:radial-gradient(circle,rgba(16,185,129,0.09),transparent 70%);pointer-events:none;z-index:0;"></div>

                                    <!-- Close X -->
                                    <button class="cs-close-btn" onclick="document.getElementById('coming-soon-modal').style.display='none'" style="position:absolute;top:11px;right:11px;z-index:20;background:rgba(0,0,0,0.45);border:1px solid rgba(255,255,255,0.1);width:32px;height:32px;border-radius:50%;color:rgba(255,255,255,0.7);font-size:0.8rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.25s ease;">
                                        <i class="fa-solid fa-xmark"></i>
                                    </button>

                                    <!-- Scrollable content -->
                                    <div id="cs-scrollable" style="overflow-y:auto;flex:1;-webkit-overflow-scrolling:touch;">

                                        <!-- Image -->
                                        <div style="width:100%;height:165px;flex-shrink:0;overflow:hidden;position:relative;background:linear-gradient(135deg,#0f172a,#1e293b);">
                                            <img id="coming-soon-modal-img" src="" style="width:100%;height:100%;object-fit:cover;display:none;filter:brightness(0.8);">
                                            <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.05) 0%,rgba(15,23,42,0.88) 100%);"></div>
                                            <div style="position:absolute;bottom:13px;left:18px;z-index:3;">
                                                <span style="display:inline-flex;align-items:center;gap:5px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:4px 11px;border-radius:50px;font-size:0.63rem;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;box-shadow:0 4px 12px rgba(79,70,229,0.45);border:1px solid rgba(255,255,255,0.12);">
                                                    <i class="fa-solid fa-star" style="font-size:0.5rem;"></i> COMING SOON
                                                </span>
                                            </div>
                                        </div>

                                        <!-- Main compact content -->
                                        <div style="padding:18px 20px 0;position:relative;z-index:1;">
                                            <h2 id="coming-soon-modal-title" class="cs-title-clamp" style="margin:0 0 7px;color:#f1f5f9;font-size:1.1rem;font-weight:800;line-height:1.35;letter-spacing:-0.015em;">-</h2>
                                            <p id="coming-soon-modal-desc-preview" class="cs-desc-preview" style="margin:0 0 14px;color:#94a3b8;font-size:0.8rem;line-height:1.6;">-</p>

                                            <!-- Countdown timer -->
                                            <div style="display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1fr;align-items:center;gap:3px;margin-bottom:16px;">
                                                <div style="background:rgba(30,41,59,0.8);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:10px 4px;text-align:center;">
                                                    <div id="cs-days" style="font-size:1.4rem;font-weight:800;color:#818cf8;line-height:1;">00</div>
                                                    <div style="font-size:0.55rem;color:#475569;text-transform:uppercase;margin-top:4px;font-weight:700;letter-spacing:0.8px;">Hari</div>
                                                </div>
                                                <div style="color:rgba(148,163,184,0.3);font-size:0.9rem;font-weight:700;text-align:center;padding-bottom:12px;">:</div>
                                                <div style="background:rgba(30,41,59,0.8);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:10px 4px;text-align:center;">
                                                    <div id="cs-hours" style="font-size:1.4rem;font-weight:800;color:#818cf8;line-height:1;">00</div>
                                                    <div style="font-size:0.55rem;color:#475569;text-transform:uppercase;margin-top:4px;font-weight:700;letter-spacing:0.8px;">Jam</div>
                                                </div>
                                                <div style="color:rgba(148,163,184,0.3);font-size:0.9rem;font-weight:700;text-align:center;padding-bottom:12px;">:</div>
                                                <div style="background:rgba(30,41,59,0.8);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:10px 4px;text-align:center;">
                                                    <div id="cs-minutes" style="font-size:1.4rem;font-weight:800;color:#a78bfa;line-height:1;">00</div>
                                                    <div style="font-size:0.55rem;color:#475569;text-transform:uppercase;margin-top:4px;font-weight:700;letter-spacing:0.8px;">Menit</div>
                                                </div>
                                                <div style="color:rgba(148,163,184,0.3);font-size:0.9rem;font-weight:700;text-align:center;padding-bottom:12px;">:</div>
                                                <div style="background:rgba(79,70,229,0.15);border:1px solid rgba(99,102,241,0.3);border-radius:12px;padding:10px 4px;text-align:center;animation:csPulseGlow 2s ease-in-out infinite;">
                                                    <div id="cs-seconds" style="font-size:1.4rem;font-weight:800;color:#f472b6;line-height:1;">00</div>
                                                    <div style="font-size:0.55rem;color:#475569;text-transform:uppercase;margin-top:4px;font-weight:700;letter-spacing:0.8px;">Detik</div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Expanded detail panel (hidden by default) -->
                                        <div id="cs-detail-panel" style="display:none;padding:0 20px;z-index:1;position:relative;">
                                            <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(148,163,184,0.1),transparent);margin-bottom:14px;"></div>
                                            <p id="coming-soon-modal-desc-full" style="margin:0 0 14px;color:#cbd5e1;font-size:0.84rem;line-height:1.75;white-space:pre-wrap;">-</p>
                                        </div>

                                        <!-- Bottom padding -->
                                        <div style="height:4px;"></div>
                                    </div>

                                    <!-- Sticky action buttons at bottom -->
                                    <div style="padding:14px 20px 16px;background:linear-gradient(180deg,transparent,rgba(15,23,42,0.98) 30%);position:relative;z-index:10;flex-shrink:0;">
                                        <div id="cs-btn-group-compact" style="display:flex;gap:10px;">
                                            <!-- Lihat Nanti (blokir 5 jam) -->
                                            <button class="cs-btn-secondary" onclick="localStorage.setItem('cs_hide_until', Date.now() + 5*60*60*1000); document.getElementById('coming-soon-modal').style.display='none';" style="flex:1;background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.65);border:1px solid rgba(255,255,255,0.1);padding:12px 8px;border-radius:50px;font-size:0.83rem;font-weight:600;cursor:pointer;transition:all 0.2s ease;letter-spacing:0.1px;">
                                                Lihat Nanti
                                            </button>
                                            <!-- Lihat Sekarang -->
                                            <button class="cs-btn-primary" id="cs-see-now-btn" onclick="window._csExpandDetail()" style="flex:2;position:relative;overflow:hidden;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border:none;padding:12px 8px;border-radius:50px;font-size:0.88rem;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(79,70,229,0.32);transition:all 0.3s ease;display:flex;align-items:center;justify-content:center;gap:7px;">
                                                <i class="fa-solid fa-rocket" style="font-size:0.8rem;"></i>
                                                Lihat Sekarang
                                                <div style="position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent);animation:csShimmer 2.5s ease-in-out infinite;"></div>
                                            </button>
                                        </div>
                                        <!-- After expand: single close button -->
                                        <div id="cs-btn-group-expanded" style="display:none;">
                                            <button class="cs-btn-primary" onclick="document.getElementById('coming-soon-modal').style.display='none'" style="width:100%;position:relative;overflow:hidden;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border:none;padding:13px 8px;border-radius:50px;font-size:0.9rem;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(79,70,229,0.32);transition:all 0.3s ease;display:flex;align-items:center;justify-content:center;gap:8px;">
                                                <i class="fa-solid fa-check"></i>
                                                Oke, Siap!
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            `;
                            document.body.insertAdjacentHTML('beforeend', modalHTML);
                            modal = document.getElementById('coming-soon-modal');

                            // Expand detail function
                            window._csExpandDetail = () => {
                                const panel = document.getElementById('cs-detail-panel');
                                const compact = document.getElementById('cs-btn-group-compact');
                                const expanded = document.getElementById('cs-btn-group-expanded');
                                const scroller = document.getElementById('cs-scrollable');
                                const fullDesc = document.getElementById('coming-soon-modal-desc-full');

                                if (panel) { panel.style.display = 'block'; }
                                if (compact) compact.style.display = 'none';
                                if (expanded) expanded.style.display = 'block';

                                // Typewriter effect
                                if (fullDesc && window._csFullText && !window._csTyped) {
                                    window._csTyped = true;
                                    fullDesc.innerHTML = '<span class="cs-typewriter-cursor">|</span>';
                                    let i = 0;
                                    const text = window._csFullText;
                                    const speed = 15; // ms per character

                                    function typeWriter() {
                                        if (i < text.length) {
                                            fullDesc.innerHTML = text.substring(0, i + 1) + '<span class="cs-typewriter-cursor">|</span>';
                                            i++;
                                            setTimeout(typeWriter, speed);
                                            // Keep scrolling down as text expands
                                            if (scroller) scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'auto' });
                                        } else {
                                            fullDesc.innerHTML = text; // Remove cursor when done
                                            if (scroller) scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
                                        }
                                    }
                                    setTimeout(typeWriter, 100);
                                } else {
                                    setTimeout(() => { if (scroller) scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' }); }, 100);
                                }
                            };
                        }

                        if (modal) {
                            if (settings.comingSoonImage) {
                                document.getElementById('coming-soon-modal-img').src = settings.comingSoonImage;
                                document.getElementById('coming-soon-modal-img').style.display = 'block';
                            }
                            if (settings.comingSoonTitle) {
                                document.getElementById('coming-soon-modal-title').innerText = settings.comingSoonTitle;
                            }
                            if (settings.comingSoonDesc) {
                                // Show preview (clamped) and full text separately
                                document.getElementById('coming-soon-modal-desc-preview').innerText = settings.comingSoonDesc;
                                // Save full text for typewriter effect, clear container initially
                                window._csFullText = settings.comingSoonDesc;
                                window._csTyped = false;
                                document.getElementById('coming-soon-modal-desc-full').innerText = '';
                            }

                            // Check 5-hour block
                        const csHideUntil = localStorage.getItem('cs_hide_until');
                        if (csHideUntil && Date.now() < parseInt(csHideUntil)) {
                            // Still within block period, don't show
                        } else {
                            modal.style.display = 'flex';
                        }

                            // Setup countdown timer
                            if (settings.comingSoonDate) {
                                const updateTimer = () => {
                                    const eventDate = new Date(settings.comingSoonDate).getTime();
                                    const now = new Date().getTime();
                                    const distance = eventDate - now;
                                    if (distance < 0) {
                                        if (window.comingSoonInterval) clearInterval(window.comingSoonInterval);
                                        ['cs-days','cs-hours','cs-minutes','cs-seconds'].forEach(id => { const el = document.getElementById(id); if(el) el.innerText = '00'; });
                                        return;
                                    }
                                    const days = Math.floor(distance / 86400000);
                                    const hours = Math.floor((distance % 86400000) / 3600000);
                                    const minutes = Math.floor((distance % 3600000) / 60000);
                                    const seconds = Math.floor((distance % 60000) / 1000);
                                    const secEl = document.getElementById('cs-seconds');
                                    if (secEl) { secEl.style.animation='none'; secEl.offsetHeight; secEl.style.animation='csCountPop 0.3s ease-out'; }
                                    const pad = n => n < 10 ? '0'+n : n;
                                    document.getElementById('cs-days').innerText = pad(days);
                                    document.getElementById('cs-hours').innerText = pad(hours);
                                    document.getElementById('cs-minutes').innerText = pad(minutes);
                                    document.getElementById('cs-seconds').innerText = pad(seconds);
                                };
                                updateTimer();
                                window.comingSoonInterval = setInterval(updateTimer, 1000);
                            }
                        }
                    }, 800);
            }
        }
    } catch (e) {
        console.error("Failed to fetch settings", e);
    }

    const servicesContainer = document.getElementById('services-container');
    const fleetContainer = document.getElementById('fleet-container');

    // Fetch all data
    globalItems = await fetchItems();
    const validFetched = (globalItems && Array.isArray(globalItems)) ? globalItems.filter(i => Number(i.price || 0) > 0 && !i.isParent) : [];
    window.globalItems = validFetched.length > 0 ? validFetched : DEFAULT_ITEMS_FALLBACK;
    // Re-render chat history if chat was initialized before fetch completed
    if (document.getElementById('chat-messages') && typeof chatHistory !== 'undefined' && chatHistory.length > 0) {
        window.renderChatHistory();
    }

    try {
        const bReq = await fetch(`${API_URL}/bookings?public=true`);
        if (bReq.ok) {
            window.globalBookings = await bReq.json();
        } else {
            window.globalBookings = [];
        }
    } catch (e) {
        console.error("Failed to fetch bookings", e);
        window.globalBookings = [];
    }

    try {
        if (!window.allReviewsData) {
            const reviewsRes = await fetch(`${API_URL}/reviews`);
            if (reviewsRes.ok) {
                window.allReviewsData = await reviewsRes.json();
            }
        }
        if (window.allReviewsData) {
            globalItems.forEach(item => {
                const childrenIds = globalItems.filter(c => c.parentId === item.id).map(c => c.id);
                const itemReviews = window.allReviewsData.filter(r => {
                    if (r.status !== 'approved') return false;
                    if (r.itemId === item.id) return true;
                    if (childrenIds.length > 0 && childrenIds.includes(r.itemId)) return true;
                    return false;
                });
                const seenKeys = new Set();
                const uniqueReviews = [];
                itemReviews.forEach(r => {
                    const key = r.userId ? ('u_' + r.userId) : (r.name && r.name.trim().toLowerCase() !== 'pelanggan terverifikasi' ? ('n_' + r.name.trim().toLowerCase()) : ('id_' + r.id));
                    if (!seenKeys.has(key)) {
                        seenKeys.add(key);
                        uniqueReviews.push(r);
                    }
                });
                if (uniqueReviews.length > 0) {
                    const avg = uniqueReviews.reduce((sum, r) => sum + r.rating, 0) / uniqueReviews.length;
                    item.rating = avg.toFixed(1).replace('.0', '');
                    item.reviewCount = uniqueReviews.length;
                }
            });
        }
    } catch (e) {
        console.error("Failed to fetch reviews for items", e);
    }

    // Categorize data - exclude child items (parentId set) from all main sections
    const childItemIds = new Set(globalItems.filter(i => i.parentId).map(i => i.id));
    const visibleItems = globalItems.filter(i => !i.parentId); // Only top-level items

    const packages = visibleItems.filter(item => {
        const cat = item.category.toLowerCase();
        return cat.includes('paket') || cat === 'package' || cat === 'tour' || cat === 'honeymoon';
    });
    const cars = visibleItems.filter(item => {
        const cat = item.category.toLowerCase();
        return (cat.includes('rental') || cat.includes('armada') || cat.includes('sewa') || cat === 'car') && cat !== 'motorcycle';
    });

    const motorcycles = visibleItems.filter(item => item.category.toLowerCase() === 'motorcycle');

    const drones = visibleItems.filter(item => item.category.toLowerCase() === 'drone');
    const transfers = visibleItems.filter(item => item.category.toLowerCase() === 'transfer');
    const services = visibleItems.filter(item => !packages.includes(item) && !cars.includes(item) && !motorcycles.includes(item) && !drones.includes(item) && !transfers.includes(item));

    // Helper to render sections with "See All" button
    const renderSectionWithSeeAll = (containerId, items, renderFn, customMaxVisible = null) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (items.length === 0) {
            container.innerHTML = '<p class="text-center w-100" style="grid-column: 1/-1;">Belum ada data yang ditambahkan.</p>';
            return;
        }

        let maxVisible = customMaxVisible;
        if (maxVisible === null) {
            let cols = window.innerWidth >= 1200 ? (containerId.includes('cars') || containerId.includes('motor') ? 4 : 3) : 2;
            maxVisible = cols * 2;
        }
        let html = '';

        items.forEach((item, index) => {
            const isHidden = index >= maxVisible;
            let cardHtml = renderFn(item, index);
            if (isHidden) {
                // Add hidden-item class using regex to handle any whitespace before <div
                cardHtml = cardHtml.replace(/(<div\s+)/, '$1data-hidden="true" style="display: none;" ');
            }
            html += cardHtml;
        });

        container.innerHTML = html;

        if (items.length > maxVisible) {
            const btnHtml = `
            <div class="text-center w-100 mt-4 show-all-wrapper" style="grid-column: 1/-1;">
                <button onclick="toggleShowAll('${containerId}', this, ${items.length})" class="btn" style="background: var(--bg-light); color: var(--primary-blue); border: 2px solid var(--primary-blue); font-weight: 700; padding: 10px 25px; border-radius: 30px; transition: all 0.3s;">
                    Lihat Semuanya (${items.length}) <i class="fa-solid fa-chevron-down" style="margin-left: 5px;"></i>
                </button>
            </div>
            `;
            container.insertAdjacentHTML('beforeend', btnHtml);
        }
    };

    // Render Services (non-transfer layanan)
    renderSectionWithSeeAll('services-container', [...services, ...transfers], (item, index) => {
        if (item.category.toLowerCase() === 'transfer' && item.transferMatrix && item.transferMatrix.length > 0) {
            return createTransferCard(item, index);
        }
        return createServiceCard(item, index);
    });

    // Sort packages by identifier letter extracted from title
    // Supports formats: "(Paket A)", "(Paket B 2)", "Paket A", "Paket A 2", etc.
    const extractSortKey = (title) => {
        // Priority 1: match "(Paket A)" or "(Paket A 2)" inside parentheses
        let m = title.match(/(pakets+([a-z])(s+(d+))?s*)/i);
        if (!m) {
            // Priority 2: match "Paket A" where A is a SINGLE letter (not a full word like "Private")
            m = title.match(/pakets+([a-z])(s+(d+))?(?:s|$)/i);
        }
        if (!m) return title.toLowerCase(); // fallback: sort by full title

        const letter = m[1].toUpperCase();
        const num = m[3] ? parseInt(m[3]).toString().padStart(5, '0') : '00001';
        return `${letter}-${num}`;
    };
    const sortedPackages = [...packages].sort((a, b) =>
        extractSortKey(a.title).localeCompare(extractSortKey(b.title))
    );

    // Separate parent items (category folders) from regular packages
    const parentPackages = sortedPackages.filter(p => p.isParent === true);
    const regularPackages = sortedPackages.filter(p => !p.isParent);

    // ── Render Parent/Category Cards → dedicated "Paket Pilihan Kami" section ──
    const paketPilihanSection = document.getElementById('paket-pilihan');
    const parentContainer = document.getElementById('parent-packages-container');
    if (parentContainer && parentPackages.length > 0) {
        // Show the section
        if (paketPilihanSection) paketPilihanSection.style.display = 'block';

        parentContainer.innerHTML = parentPackages.map((item, idx) => `
        <div onclick="window.openSubPackageModal('${item.id}')" data-aos="zoom-in" data-aos-delay="${idx * 50}"
            style="cursor:pointer; position:relative; border-radius:14px; overflow:hidden; aspect-ratio:1/1; box-shadow:0 8px 25px rgba(0,0,0,0.12); transition:transform 0.3s,box-shadow 0.3s; display:flex; flex-direction:column; justify-content:center; align-items:center;"
            onmouseover="this.style.transform='scale(1.03)';this.style.boxShadow='0 12px 35px rgba(0,0,0,0.2)'"
            onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 8px 25px rgba(0,0,0,0.12)'">
            <button onclick="event.stopPropagation(); window.shareItem('${item.id}', '${item.title.replace(/'/g, "\\'")}', 'Berbagai Pilihan Tour Menarik!')" style="position:absolute; top:10px; right:10px; background:rgba(255,255,255,0.9); color:var(--primary-blue); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:4; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Bagikan"><i class="fa-solid fa-share-nodes"></i></button>
            <img src="${item.imageUrl}" alt="${item.title}"
                style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;z-index:1;"
                onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600'">
            <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(to bottom, rgba(10,20,50,0.3) 0%, rgba(10,20,50,0.85) 100%);z-index:2;"></div>
            
            <div style="position:relative; z-index:3; text-align:center; padding:10px 6px; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; width:100%; height:100%;">
                <h3 style="color:#fbb320; font-size:clamp(0.85rem,3vw,1.6rem); font-weight:900; margin:0 0 4px; text-shadow:0 2px 8px rgba(0,0,0,0.8); line-height:1.1; font-family:'Outfit',sans-serif; text-transform:uppercase;">${item.title.split(' ')[0]}</h3>
                <span style="color:white; font-size:clamp(0.6rem,2.2vw,0.75rem); font-weight:600; margin-bottom:10px; text-shadow:0 1px 4px rgba(0,0,0,0.8);">${item.title}</span>
                
                <span style="display:inline-flex; align-items:center; gap:4px; background:#fbb320; color:white; font-size:clamp(0.5rem,1.8vw,0.6rem); font-weight:800; padding:5px 10px; border-radius:20px; text-transform:uppercase; letter-spacing:0.5px; box-shadow:0 4px 10px rgba(251,179,32,0.4);">
                    LIHAT LAINNYA <i class="fa-solid fa-chevron-right" style="font-size:0.5rem;"></i>
                </span>
            </div>
        </div>`).join('');
    }

    // ── Render Regular Packages → "Paket Tour Populer" section ──
    renderSectionWithSeeAll('packages-container', regularPackages, createPackageCard, 6);

    // Render Cars
    renderSectionWithSeeAll('cars-container', cars, createFleetCard, 4);

    // Render Motorcycles
    renderSectionWithSeeAll('motorcycles-container', motorcycles, createFleetCard, 4);

    // Render Drones
    renderSectionWithSeeAll('drone-container', drones, createDroneCard);
};

// =====================================================
// Generate Professional e-Tiket PDF
// =====================================================
window.generateEtiketPDF = (data) => {
    if (!data) { alert('Data tiket tidak ditemukan, cek status dulu.'); return; }

    const paidAmt = Number(data.itemPrice || data.price || 0);
    const totalAmt = Number(data.fullPrice || 0);
    const isDpExplicit = data.isDp === true || data.isDp === 'true';
    const isDpPayment = isDpExplicit || (totalAmt > 0 && paidAmt > 0 && (totalAmt - paidAmt) > 50000);

    let sc = '#dc2626';
    let scBg = '#fee2e2';
    let stText = data.status || 'UNKNOWN';
    let stIcon = '&#10007;'; // X mark

    if (data.status === 'PAID' || data.status === 'COMPLETED') {
        sc = '#16a34a';
        scBg = '#dcfce7';
        stIcon = '&#10003;'; // Check mark
    } else if (data.status === 'PENDING') {
        sc = '#d97706';
        scBg = '#fef3c7';
        stIcon = '&#9203;'; // Hourglass
    } else if (data.status === 'PROCESSING') {
        sc = '#2563eb';
        scBg = '#dbeafe';
        stIcon = '&#9881;'; // Gear
    }

    const fmtDate = (d) => {
        if (!d) return '-';
        try { return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }); }
        catch (e) { return d; }
    };
    const isORD = data.transactionId && data.transactionId.startsWith('ORD-');
    const isBKG = data.transactionId && data.transactionId.startsWith('BKG-');
    
    const nameLower = (data.itemName || '').toLowerCase();
    
    let typeLbl = 'Reservasi';
    if (isBKG || nameLower.includes('transfer') || nameLower.includes('rental') || nameLower.includes('sewa') || nameLower.includes('mobil') || nameLower.includes('motor')) {
        typeLbl = 'Rental & Transfer';
    } else if (isORD) {
        const pm = (data.paymentMethod || '').toLowerCase();
        if (pm === 'va') {
            typeLbl = 'Paket Tour / Virtual Account';
        } else {
            typeLbl = 'Paket Tour / QRIS';
        }
    }
    
    const issuedAt = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const logoUrl = window.location.origin + '/logo.png';

    const is12HourDriverPdf = nameLower.includes("12 jam") || nameLower.includes("include driver");
    if (is12HourDriverPdf) {
        typeLbl = 'Sewa Mobil + Driver (12 Jam)';
    }

    let depositAmount = 0;
    const matchedItemPdf = window.globalItems ? window.globalItems.find(i => i.title === (data.itemName || '')) : null;
    let isMobilPdf = nameLower.includes("mobil") || nameLower.includes("avanza") || nameLower.includes("innova") || nameLower.includes("hiace") || nameLower.includes("brio") || nameLower.includes("xpander") || nameLower.includes("alphard") || nameLower.includes("fortuner");
    let isMotorPdf = nameLower.includes("motor");
    
    if (nameLower.includes("airport") || nameLower.includes("transfer") || nameLower.includes("tour") || nameLower.includes("paket")) {
        isMobilPdf = false;
        isMotorPdf = false;
    }

    if (matchedItemPdf && matchedItemPdf.category) {
        if (matchedItemPdf.category === 'car') isMobilPdf = true;
        else if (matchedItemPdf.category === 'motorcycle') isMotorPdf = true;
        else {
            isMobilPdf = false;
            isMotorPdf = false;
        }
    }
    
    if (isMotorPdf) depositAmount = 500000;
    else if (isMobilPdf) depositAmount = 1000000;
    
    // Deposit tidak berlaku jika include driver/supir
    let isWithDriver = is12HourDriverPdf || nameLower.includes("driver") || nameLower.includes("supir") || nameLower.includes("dengan supir");
    const matchedItem = window.globalItems ? window.globalItems.find(i => i.title === (data.itemName || '')) : null;
    if (matchedItem && matchedItem.driverOptions && matchedItem.driverOptions !== 'Tidak Include Driver') {
        isWithDriver = true;
    }
    if (isWithDriver) {
        depositAmount = 0;
    }

    // Hitung nominal DP murni dan sisa pelunasan
    let defaultDp = 200000;
    if (isMotorPdf) defaultDp = 50000;
    else if (nameLower.includes("tour") || nameLower.includes("paket")) defaultDp = 500000;

    let netDpPaid = defaultDp;
    if (paidAmt > 0) {
        let temp = paidAmt - depositAmount;
        if (temp > 6500 && (temp.toString().endsWith('500') || temp % 1000 !== 0)) {
            temp -= 6500;
        }
        if (temp > 0 && temp < (totalAmt || Infinity)) {
            netDpPaid = temp;
        }
    }
    const remainingAmt = totalAmt > 0 ? Math.max(0, totalAmt - netDpPaid) : 0;

    // Flag info DP: aktif selama jenis pembayaran adalah DP dan transaksi belum COMPLETED
    const isFullyCompleted = (data.status === 'COMPLETED');
    const showDpInfo = isDpPayment && !isFullyCompleted;

    if (showDpInfo) {
        if (data.status === 'PAID') {
            sc = '#16a34a';
            scBg = '#dcfce7';
            stText = 'DP TERBAYAR (BELUM LUNAS)';
            stIcon = '&#10003;';
        } else if (data.status === 'PENDING') {
            sc = '#ea580c';
            scBg = '#fff7ed';
            stText = 'MENUNGGU PEMBAYARAN DP';
            stIcon = '&#9203;';
        } else if (data.status === 'PROCESSING') {
            sc = '#2563eb';
            scBg = '#dbeafe';
            stText = 'DP SEDANG DIPROSES';
            stIcon = '&#9881;';
        }
    }
    
    let depositNote = '';
    if (depositAmount > 0) {
        depositNote = `
            <div style="background:#e0f2fe;border-left:4px solid #38bdf8;padding:8px 16px;margin-bottom:12px;border-radius:4px;">
                <div style="font-size:10px;font-weight:700;color:#0369a1;margin-bottom:2px;">&#8505; Catatan Deposit</div>
                <div style="font-size:10px;color:#0c4a6e;line-height:1.4;">Total pembayaran <b>sudah termasuk uang deposit</b> sebesar <strong>Rp ${depositAmount.toLocaleString('id-ID')}</strong>. Deposit akan dikembalikan 100% setelah masa sewa berakhir jika kondisi unit baik.</div>
            </div>`;
    }

    // ── Build content (NO full HTML wrapper – injected into live DOM) ──
    const page = document.createElement('div');
    page.style.cssText = `
        width:794px; background:#fff; margin:0; padding:0;
        font-family:'Segoe UI',Arial,sans-serif; font-size:14px; color:#1e293b;
        box-sizing:border-box; display:flex; flex-direction:column; overflow:hidden;
    `;

    page.innerHTML = `
<div style="background:linear-gradient(135deg,#1d4ed8 0%,#0369a1 60%,#0891b2 100%);padding:18px 30px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;margin:0;width:100%;box-sizing:border-box;">
            <div style="display:flex;align-items:center;gap:16px;">
                <img src="${logoUrl}" crossorigin="anonymous"
                     style="width:60px;height:60px;border-radius:12px;background:#fff;
                            padding:6px;object-fit:contain;flex-shrink:0;">
                <div>
                    <div style="color:#fff;font-size:21px;font-weight:800;line-height:1.2;">Travel Lombok Airport</div>
                    <div style="color:rgba(255,255,255,0.75);font-size:11px;margin-top:2px;">Tour &amp; Travel Lombok &middot; www.travellombokairport.com</div>
                </div>
            </div>
            <div style="text-align:right;color:#fff;">
                <div style="font-size:11px;opacity:0.7;text-transform:uppercase;letter-spacing:1px;">${isDpPayment ? 'Bukti Pembayaran DP' : 'Bukti Pembayaran'}</div>
                <div style="font-size:28px;font-weight:900;letter-spacing:-1px;line-height:1.1;">${isDpPayment ? 'e-Tiket DP' : 'e-Tiket'}</div>
            <div style="font-size:11px;opacity:0.65;font-family:monospace;margin-top:3px;">${data.transactionId}</div>
            </div>
        </div>
        <div style="background:${scBg};border-left:5px solid ${sc};padding:8px 30px;display:flex;align-items:center;gap:12px;flex-shrink:0;width:100%;box-sizing:border-box;">
            <div style="width:10px;height:10px;border-radius:50%;background:${sc};flex-shrink:0;"></div>
            <div style="font-size:12px;font-weight:700;color:${sc};">STATUS: ${stText}</div>
            <div style="font-size:10px;color:#475569;margin-left:auto;">Diterbitkan: ${issuedAt}</div>
        </div>

        <div style="padding:14px 30px;flex:1;width:100%;box-sizing:border-box;">

            <!-- ID Strip -->
            <div style="background:linear-gradient(135deg,#1d4ed8,#0891b2);border-radius:8px;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                <div>
                    <div style="font-size:10px;color:rgba(255,255,255,0.7);font-weight:600;
                                text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Nomor Transaksi</div>
                    <div style="font-size:18px;font-weight:800;color:#fff;
                                font-family:monospace;letter-spacing:1.5px;">${data.transactionId}</div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
                    <div style="width:52px;height:52px;border-radius:50%;background:${scBg};
                                border:2px solid ${sc};display:flex;align-items:center;
                                justify-content:center;font-size:22px;color:${sc};font-weight:700;">
                        ${stIcon}
                    </div>
                    <div style="font-size:10px;font-weight:800;color:#ffffff;
                                text-transform:uppercase;letter-spacing:1px;margin-top:2px;text-shadow: 0 1px 2px rgba(0,0,0,0.2);">${stText}</div>
                </div>
            </div>

            ${showDpInfo ? `
            <div style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2px solid #f59e0b;border-radius:10px;padding:12px 16px;margin-bottom:12px;display:flex;align-items:flex-start;gap:12px;">
                <div style="width:36px;height:36px;background:#f59e0b;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;color:white;font-weight:900;">
                    💳
                </div>
                <div style="flex:1;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <div style="font-size:11px;font-weight:800;color:#b45309;text-transform:uppercase;letter-spacing:0.8px;">
                            ${data.status === 'PAID' ? '✓ Pembayaran DP Diterima (Belum Lunas)' : '&#9888; Tagihan Pembayaran DP'}
                        </div>
                        <span style="background:${data.status === 'PAID' ? '#16a34a' : '#d97706'};color:white;padding:2px 8px;border-radius:12px;font-size:9px;font-weight:800;">
                            ${data.status === 'PAID' ? 'DP TERBAYAR' : 'MENUNGGU PEMBAYARAN'}
                        </span>
                    </div>
                    
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0;background:white;padding:8px 12px;border-radius:6px;border:1px solid #fde68a;">
                        <div>
                            <div style="font-size:9px;color:#78350f;font-weight:600;text-transform:uppercase;">Total Biaya Sewa</div>
                            <div style="font-size:13px;font-weight:800;color:#1e293b;">${totalAmt > 0 ? 'Rp ' + Number(totalAmt).toLocaleString('id-ID') : '-'}</div>
                        </div>
                        <div>
                            <div style="font-size:9px;color:#78350f;font-weight:600;text-transform:uppercase;">DP ${data.status === 'PAID' ? 'Sudah Diterima' : 'Yang Harus Dibayar'}</div>
                            <div style="font-size:13px;font-weight:800;color:${data.status === 'PAID' ? '#16a34a' : '#d97706'};">Rp ${Number(netDpPaid).toLocaleString('id-ID')}</div>
                        </div>
                        <div style="grid-column:1/-1;border-top:1px dashed #cbd5e1;padding-top:6px;display:flex;justify-content:space-between;align-items:center;">
                            <div style="font-size:10px;color:#b45309;font-weight:700;">SISA TAGIHAN WAJIB DILUNASI:</div>
                            <div style="font-size:14px;font-weight:900;color:#dc2626;">Rp ${Number(remainingAmt).toLocaleString('id-ID')}</div>
                        </div>
                    </div>
                    
                    <div style="font-size:10px;color:#78350f;line-height:1.5;">
                        📌 <strong>Instruksi Pelunasan:</strong> Sisa tagihan sebesar <strong>Rp ${Number(remainingAmt).toLocaleString('id-ID')}</strong> dapat dilunasi secara tunai atau transfer kepada driver / tim kami saat penjemputan / serah terima unit di lokasi.
                    </div>
                </div>
            </div>` : ''}
            ${depositNote}

            <!-- Informasi Pemesan -->
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;margin-bottom:6px;">Informasi Pemesan</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Nama Lengkap</div>
                    <div style="font-size:15px;font-weight:700;color:#1e293b;">${data.customerName || data.userEmail || '-'}</div>
                </div>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Email</div>
                    <div style="font-size:14px;font-weight:700;color:#1e293b;">${data.customerEmail || data.userEmail || '-'}</div>
                </div>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;grid-column:1/-1;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">No. WhatsApp / Telepon</div>
                    <div style="font-size:14px;font-weight:700;color:#1e293b;">${data.phone || data.details?.phone || '-'}</div>
                </div>
            </div>

            <!-- Divider -->
            <div style="border:none;border-top:2px dashed #e2e8f0;margin:8px 0;"></div>

            <!-- Detail Layanan -->
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;margin-bottom:6px;">Detail Layanan</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;
                            padding:13px 15px;grid-column:1/-1;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Layanan / Paket</div>
                    <div style="font-size:16px;font-weight:800;color:#1e293b;">${data.itemName || '-'}</div>
                </div>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Jenis Layanan</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${typeLbl}</div>
                </div>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Tanggal Pelaksanaan</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${fmtDate(data.startDate || data.details?.date)}</div>
                </div>
                ${(data.endDate && !is12HourDriverPdf) ? `
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Tanggal Selesai</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${fmtDate(data.endDate)}</div>
                </div>
                ` : ''}
                ${is12HourDriverPdf ? `
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Durasi Layanan</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${(data.startDate === data.endDate || !data.endDate) ? '12 Jam Pemakaian' : 'Paket 12 Jam Per Hari'}</div>
                </div>
                ` : `
                ${data.details?.time ? `
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Jam Pengambilan</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${data.details.pickupTime || data.details.time}</div>
                </div>
                ` : ''}
                ${data.details?.dropoffTime ? `
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Jam Pengembalian</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${data.details.dropoffTime}</div>
                </div>
                ` : ''}
                `}
                ${data.details?.pax ? `
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Jumlah Peserta</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${data.details.pax} Orang</div>
                </div>
                ` : ''}
                ${data.details?.pickup ? `
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;grid-column:1/-1;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">${is12HourDriverPdf ? 'Lokasi Penjemputan' : 'Lokasi Jemput'}</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${data.details.pickup}</div>
                </div>
                ` : ''}
                ${data.details?.dropoff ? `
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;grid-column:1/-1;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">${is12HourDriverPdf ? 'Lokasi Pengantaran / Selesai' : 'Tujuan / Drop-off'}</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${data.details.dropoff}</div>
                </div>
                ` : ''}
                ${data.details?.flightNumber ? `
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">No. Penerbangan</div>
                <div style="font-size:13px;font-weight:700;color:#1e293b;">${data.details.flightNumber}</div>
                </div>
                ` : ''}
                ${data.details?.vehicle ? `
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Pilihan Kendaraan</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${data.details.vehicle}</div>
                </div>
                ` : ''}
                ${data.details?.notes ? `
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;grid-column:1/-1;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Catatan Khusus</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${data.details.notes}</div>
                </div>
                ` : ''}
                ${showDpInfo ? `
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:12px 15px;">
                    <div style="font-size:10px;color:#166534;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:5px;">DP ${data.status === 'PAID' ? 'Terbayar' : 'Harus Dibayar'}</div>
                    <div style="font-size:14px;font-weight:800;color:${data.status === 'PAID' ? '#16a34a' : '#d97706'};">Rp ${Number(netDpPaid).toLocaleString('id-ID')}</div>
                </div>
                <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:12px 15px;">
                    <div style="font-size:10px;color:#991b1b;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:5px;">Sisa Pelunasan di Lokasi</div>
                    <div style="font-size:14px;font-weight:800;color:#dc2626;">Rp ${Number(remainingAmt).toLocaleString('id-ID')}</div>
                </div>
                ` : ''}
                ${data.endDate ? (() => {
            const itemName = (data.itemName || "").toLowerCase();
            const is12Hour = itemName.includes('12 jam') || itemName.includes('include driver');
            const isPackage = itemName.includes('paket') || itemName.includes('tour') || itemName.includes('trip') || itemName.includes('honeymoon') || (data.transactionId && data.transactionId.startsWith('ORD-'));
            let text = '';
            if (is12Hour) {
                text = (data.startDate === data.endDate || !data.endDate)
                    ? `Layanan sewa Include Driver berlaku selama <strong>12 Jam</strong> pada tanggal <strong>${fmtDate(data.startDate)}</strong>.`
                    : `Layanan sewa Include Driver (12 Jam per hari) berakhir pada <strong>${fmtDate(data.endDate)}</strong>.`;
            } else if (isPackage) {
                text = `Paket/layanan berakhir pada <strong>${fmtDate(data.endDate)}</strong>.`;
            } else {
                text = `Masa sewa berakhir pada <strong>${fmtDate(data.endDate)}</strong>.`;
            }
            return `
                    <div style="background:#eff6ff;border:1px solid #bae6fd;border-radius:8px;padding:8px 12px;grid-column:1/-1;display:flex;align-items:center;gap:10px;">
                        <div style="width:28px;height:28px;background:#0ea5e9;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px;">
                            ℹ️
                        </div>
                        <div>
                            <div style="font-size:10px;color:#0369a1;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">Info Waktu Berakhir</div>
                            <div style="font-size:12px;color:#0369a1;">${text}</div>
                        </div>
                    </div>
                    `;
        })() : ''}
                ${(() => {
                    const isEventActiveNow = window.globalEventSettings ? window.globalEventSettings.eventMode === true : false;
                    const showEventBadge = data.details?.isEvent && isEventActiveNow && !is12HourDriverPdf;
                    if (!showEventBadge) return '';
                    return `
                    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:8px 12px;grid-column:1/-1;display:flex;align-items:center;gap:10px;">
                        <div style="width:28px;height:28px;background:#f97316;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px;">
                            🔥
                        </div>
                        <div>
                            <div style="font-size:10px;color:#c2410c;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">Periode Event (High Season)</div>
                            <div style="font-size:12px;color:#c2410c;">Dipesan saat periode Event dengan penyesuaian harga dan minimal sewa 4 hari.</div>
                        </div>
                    </div>
                    `;
                })()}
            </div>

            <!-- Divider -->
            <div style="border:none;border-top:2px dashed #e2e8f0;margin:8px 0;"></div>

            <!-- Warning Box -->
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px 14px;">
                <div style="font-size:9px;color:#d97706;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:5px;">&#9888; Penting &mdash; Harap Dibaca</div>
                <div style="font-size:10px;color:#475569;line-height:1.8;">
                    &bull; Tunjukkan e-Tiket ini (cetak / digital) kepada petugas saat berangkat.<br>
                    &bull; Harap hadir 30 menit sebelum waktu penjemputan.<br>
                    &bull; Hubungi kami via WhatsApp jika ada perubahan jadwal.<br>
                    &bull; e-Tiket ini hanya berlaku untuk transaksi dengan status <strong>PAID</strong>.
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:10px 30px;flex-shrink:0;width:100%;box-sizing:border-box;">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;">
                <div>
                    <div style="font-size:11px;color:#1e293b;font-weight:700;margin-bottom:4px;">Travel Lombok Airport</div>
                    <div style="font-size:10px;color:#64748b;line-height:1.8;">
                        &#128222; +62 896-7696-3255 (WhatsApp)<br>
                        &#127760; www.travellombokairport.com<br>
                        &#128205; Lombok, Nusa Tenggara Barat, Indonesia
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:9px;color:#94a3b8;line-height:1.6;">
                        Dokumen ini diterbitkan secara digital oleh sistem<br>
                        Travel Lombok Airport dan sah tanpa tanda tangan fisik.
                    </div>
                    <div style="font-size:10px;color:#64748b;margin-top:4px;">Dicetak: ${issuedAt}</div>
                    <div style="margin-top:6px;display:inline-flex;align-items:center;gap:5px;background:linear-gradient(135deg,#1d4ed8,#0891b2);border-radius:20px;padding:3px 10px;">
                        <span style="font-size:9px;color:#fff;font-weight:700;letter-spacing:0.5px;">&#127760; Dipesan melalui website www.travellombokairport.com</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // ── Wrapper: off-screen tapi tetap di document flow ──
    const wrapper = document.createElement('div');
    // Menggunakan absolute positioning di ujung atas dokumen agar html2canvas tidak salah kalkulasi offset
    wrapper.style.cssText = 'position:absolute; left:0; top:0; width:794px; z-index:-9999; visibility:hidden; overflow:hidden; background:#fff; padding:0; margin:0;';
    page.style.minHeight = 'auto'; // Biarkan tingginya menyesuaikan isi
    wrapper.appendChild(page);
    document.body.appendChild(wrapper);

    // Dapatkan tinggi aslinya, berikan padding ekstra (+100px) untuk mencegah overflow ke halaman kedua
    const contentHeight = page.offsetHeight + 100;

    // Pastikan scrollY di-set 0 di html2canvas untuk mencegah white space di atas
    const opt = {
        margin: 0,
        filename: `e-Tiket_${data.transactionId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true, logging: false, backgroundColor: '#ffffff', scrollY: 0, windowY: 0 },
        jsPDF: { unit: 'px', format: [794, contentHeight], orientation: 'portrait', hotfixes: ['px_scaling'] },
        pagebreak: { mode: 'avoid-all' }
    };

    html2pdf().set(opt).from(page).save().then(() => {
        document.body.removeChild(wrapper);
    }).catch(err => {
        document.body.removeChild(wrapper);
        console.error('PDF generation error:', err);
    });
};

// Paste Order ID with custom branded permission request modal
window.pasteOrderId = async () => {
    const input = document.getElementById('input-cek-orderan');
    if (!input) return;

    // Fungsi internal untuk membaca dan menempelkan clipboard
    const performClipboardRead = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text && text.trim()) {
                input.value = text.trim().toUpperCase();
                input.focus();
                Swal.fire({
                    toast: true,
                    position: 'top',
                    icon: 'success',
                    title: 'ID Pesanan Ditempel!',
                    text: text.trim().toUpperCase(),
                    showConfirmButton: false,
                    timer: 2000,
                    background: '#ffffff',
                    color: '#0f172a'
                });
                return true;
            } else {
                Swal.fire({
                    toast: true,
                    position: 'top',
                    icon: 'info',
                    title: 'Papan Klip Kosong',
                    text: 'Silakan salin ID pesanan Anda terlebih dahulu.',
                    showConfirmButton: false,
                    timer: 2500
                });
                return true;
            }
        } catch (err) {
            Swal.fire({
                icon: 'warning',
                title: 'Akses Dibatasi Browser',
                html: `
                    <p style="font-size: 0.92rem; color: #475569; line-height: 1.5; margin-bottom: 12px;">
                        Browser Anda membatasi akses salinan otomatis.
                    </p>
                    <div style="background: #f8fafc; border: 1.5px dashed #cbd5e1; padding: 12px; border-radius: 12px; font-size: 0.88rem; color: #1e293b; text-align: left;">
                        👉 <strong>Cara alternatif:</strong><br>
                        Tahan (tekan lama) kolom input ID Pesanan, lalu pilih opsi <strong>"Tempel" / "Paste"</strong>.
                    </div>
                `,
                confirmButtonText: 'Mengerti',
                confirmButtonColor: '#059669'
            });
            input.focus();
            return false;
        }
    };

    // 1. Jika izin clipboard sudah pernah diizinkan secara permanen (state === 'granted')
    let isAlreadyGranted = false;
    try {
        if (navigator.permissions && navigator.permissions.query) {
            const perm = await navigator.permissions.query({ name: 'clipboard-read' });
            if (perm.state === 'granted') {
                isAlreadyGranted = true;
            }
        }
    } catch (e) {}

    if (isAlreadyGranted) {
        await performClipboardRead();
        return;
    }

    // 2. Tampilkan Pop-Up Izin Custom (sesuai permintaan: notifikasi meminta izin di-custom)
    Swal.fire({
        html: `
            <div style="text-align: center; padding: 8px 4px 4px;">
                <div style="width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 20px; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1.5px solid #a7f3d0; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px -4px rgba(16, 185, 129, 0.25);">
                    <i class="fa-solid fa-clipboard-check" style="font-size: 28px; color: #059669;"></i>
                </div>
                <div style="display: inline-flex; align-items: center; gap: 6px; background: #f1f5f9; padding: 4px 12px; border-radius: 20px; font-size: 0.76rem; font-weight: 700; color: #475569; margin-bottom: 12px;">
                    <i class="fa-solid fa-lock" style="color: #059669; font-size: 0.72rem;"></i> travellombokairport.com
                </div>
                <h3 style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; letter-spacing: -0.02em;">
                    Izin Akses Papan Klip
                </h3>
                <p style="font-size: 0.92rem; color: #475569; line-height: 1.55; margin: 0 0 16px 0;">
                    <strong style="color: #0f172a;">Travel Lombok Airport</strong> ingin melihat teks yang disalin ke papan klip untuk menempelkan ID Pesanan Anda secara otomatis.
                </p>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 14px; font-size: 0.8rem; color: #64748b; display: flex; align-items: center; gap: 8px; text-align: left;">
                    <i class="fa-solid fa-shield-check" style="color: #059669; font-size: 1.1rem; flex-shrink: 0;"></i>
                    <span>Privasi terjaga aman. Sistem hanya membaca kode ID pesanan (ORD-xxxx).</span>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="fa-solid fa-check"></i> Izinkan',
        cancelButtonText: 'Blokir',
        confirmButtonColor: '#059669',
        cancelButtonColor: '#94a3b8',
        reverseButtons: true, // Tombol Blokir di sebelah kiri, Izinkan di sebelah kanan
        focusConfirm: true,
        customClass: {
            popup: 'modern-popup-radius'
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            await performClipboardRead();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                toast: true,
                position: 'top',
                icon: 'info',
                title: 'Akses Ditolak',
                text: 'Anda tetap dapat mengetik atau menempel manual ID pesanan.',
                showConfirmButton: false,
                timer: 2200
            });
            input.focus();
        }
    });
};

// Cek Booking Status
window.cekStatusBooking = async (event, type = 'booking') => {
    event.preventDefault();
    // Gunakan input mana saja yang ada isinya (booking atau orderan)
    const inputId = type === 'booking' ? 'input-cek-booking' : 'input-cek-orderan';
    const btnId = type === 'booking' ? 'btn-cek-booking' : 'btn-cek-orderan';

    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    const trxId = input.value.trim();

    if (!trxId) return;

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengecek...';
    btn.disabled = true;

    try {
        // Satu endpoint yang cek keduanya (bookings + orders)
        const response = await fetch(`${API_URL}/bookings/check/${trxId}?_t=${new Date().getTime()}`, { cache: 'no-store' });

        if (response.ok) {
            const data = await response.json();
            let statusColor = '#ef4444';
            let statusIcon = 'fa-circle-xmark';
            
            if (data.status === 'PAID' || data.status === 'COMPLETED') {
                statusColor = '#10b981';
                statusIcon = 'fa-circle-check';
            } else if (data.status === 'PENDING') {
                statusColor = '#f59e0b';
                statusIcon = 'fa-clock';
            } else if (data.status === 'PROCESSING') {
                statusColor = '#3b82f6';
                statusIcon = 'fa-gears';
            }

            let typeLabel = '🚗 Rental & Transfer (BKG-)';
            if (data.type === 'order' || (data.transactionId && data.transactionId.startsWith('ORD-'))) {
                const isVa = (data.paymentMethod || '').toLowerCase() === 'va' || !!data.vaNumber;
                typeLabel = isVa ? '🛒 Pesanan Tour / Virtual Account (ORD-)' : '🛒 Pesanan Tour / QRIS (ORD-)';
            }

            let processInfo = '';
            if (data.status === 'PROCESSING') {
                processInfo = `
                <div style="margin-top: 15px; padding: 15px; background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #3b82f6; border-radius: 10px; text-align: left; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.05);">
                    <h5 style="color: #1e40af; margin: 0 0 6px; font-size: 0.9rem; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-circle-info"></i> Sedang Diproses
                    </h5>
                    <p style="color: #334155; font-size: 0.8rem; margin: 0; line-height: 1.5;">Pesanan Anda telah kami terima dan <b>sedang dalam tahap verifikasi serta penjadwalan</b> oleh tim profesional kami. Proses ini membutuhkan waktu yang singkat. Kami akan menghubungi Anda melalui WhatsApp jika diperlukan koordinasi lebih lanjut.</p>
                </div>`;
            } else if (data.status === 'PENDING') {
                processInfo = `
                <div style="margin-top: 15px; padding: 15px; background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 10px; text-align: left; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.05);">
                    <h5 style="color: #b45309; margin: 0 0 6px; font-size: 0.9rem; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-clock"></i> Menunggu Pembayaran
                    </h5>
                    <p style="color: #78350f; font-size: 0.8rem; margin: 0; line-height: 1.5;">Pesanan Anda telah tercatat, namun <b>pembayaran belum kami terima</b>. Silakan segera selesaikan pembayaran agar pesanan dapat kami proses lebih lanjut.</p>
                </div>`;
            } else if (data.status === 'PAID') {
                processInfo = `
                <div style="margin-top: 15px; padding: 15px; background: #ecfdf5; border: 1px solid #d1fae5; border-left: 4px solid #10b981; border-radius: 10px; text-align: left; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.05);">
                    <h5 style="color: #047857; margin: 0 0 6px; font-size: 0.9rem; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-check-double"></i> Pembayaran Berhasil
                    </h5>
                    <p style="color: #064e3b; font-size: 0.8rem; margin: 0; line-height: 1.5;">Terima kasih! Pembayaran Anda <b>telah berhasil kami verifikasi</b>. Tim kami akan segera menjadwalkan layanan Anda. Anda sudah dapat mengunduh e-Tiket sebagai bukti pemesanan yang sah.</p>
                </div>`;
            } else if (data.status === 'COMPLETED') {
                processInfo = `
                <div style="margin-top: 15px; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #64748b; border-radius: 10px; text-align: left; box-shadow: 0 4px 6px rgba(100, 116, 139, 0.05);">
                    <h5 style="color: #334155; margin: 0 0 6px; font-size: 0.9rem; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-flag-checkered"></i> Pesanan Selesai
                    </h5>
                    <p style="color: #1e293b; font-size: 0.8rem; margin: 0; line-height: 1.5;">Layanan untuk pesanan ini <b>telah selesai dilaksanakan</b>. Terima kasih telah mempercayakan perjalanan Anda bersama Travel Lombok Airport. Kami tunggu kedatangan Anda di perjalanan berikutnya!</p>
                </div>`;
            } else if (data.status === 'KADALUARSA') {
                processInfo = `
                <div style="margin-top: 15px; padding: 15px; background: #fef2f2; border: 1px solid #fee2e2; border-left: 4px solid #ef4444; border-radius: 10px; text-align: left; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.05);">
                    <h5 style="color: #b91c1c; margin: 0 0 6px; font-size: 0.9rem; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-triangle-exclamation"></i> Pesanan Kadaluarsa
                    </h5>
                    <p style="color: #7f1d1d; font-size: 0.8rem; margin: 0; line-height: 1.5;">Mohon maaf, pesanan ini <b>telah dibatalkan atau melewati batas waktu pembayaran</b>. Jika Anda masih membutuhkan layanan ini, silakan membuat pesanan baru melalui website kami.</p>
                </div>`;
            }

            const htmlContent = `
                <div style="text-align: center; margin-bottom: 20px; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <div style="font-size: 3.5rem; color: ${statusColor}; margin-bottom: 5px;">
                        <i class="fa-solid ${statusIcon}"></i>
                    </div>
                    <div>
                        <span style="background: ${statusColor}; color: white; padding: 6px 16px; border-radius: 20px; font-weight: 800; font-size: 0.9rem; letter-spacing: 0.5px;">${data.status}</span>
                    </div>
                    <div style="font-size: 0.78rem; color: #64748b; background: #f8fafc; padding: 4px 12px; border-radius: 20px; border: 1px solid #e2e8f0; margin-top: 2px;">${typeLabel}</div>
                </div>
                
                <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: left;">
                    <div style="margin-bottom: 10px;">
                        <span style="font-size: 0.78rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">ID Transaksi</span>
                        <div style="font-weight: 700; color: #1e293b; font-family: monospace; font-size: 0.95rem;">${data.transactionId}</div>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <span style="font-size: 0.78rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Atas Nama</span>
                        <div style="font-weight: 700; color: #1e293b;">${data.customerName || '-'}</div>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <span style="font-size: 0.78rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Email</span>
                        <div style="font-weight: 700; color: #1e293b;">${data.customerEmail || '-'}</div>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <span style="font-size: 0.78rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">No. HP / WA</span>
                        <div style="font-weight: 700; color: #1e293b;">${data.phone || '-'}</div>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <span style="font-size: 0.78rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Item / Layanan</span>
                        <div style="font-weight: 700; color: #1e293b;">${data.itemName || '-'}</div>
                    </div>
                    <div>
                        <span style="font-size: 0.78rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Jadwal</span>
                        <div style="font-weight: 700; color: #1e293b;">${data.startDate ? new Date(data.startDate).toLocaleDateString('id-ID') : '-'} ${(data.endDate && data.endDate !== data.startDate) ? '– ' + new Date(data.endDate).toLocaleDateString('id-ID') : ''}</div>
                    </div>
                    ${data.price ? `
                    <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #cbd5e1;">
                        <span style="font-size: 0.78rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Rincian Biaya</span>
                        <div style="font-size: 0.85rem; color: #334155; margin-top: 6px;">
                            ${(data.fullPrice || 0) > 0 ? `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                                <span>Harga Layanan / Sewa:</span>
                                <strong>Rp ${Number(data.fullPrice + (data.promoDiscount || 0)).toLocaleString('id-ID')}</strong>
                            </div>` : ''}
                            ${(data.promoDiscount || 0) > 0 ? `
                            <div style="display: flex; justify-content: space-between; color: #16a34a; margin-bottom: 3px;">
                                <span>Diskon Promo (${data.promoCode || ''}):</span>
                                <strong>-Rp ${Number(data.promoDiscount).toLocaleString('id-ID')}</strong>
                            </div>` : ''}
                            ${(data.deposit || 0) > 0 ? `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                                <span>Deposit (100% Refundable):</span>
                                <strong>Rp ${Number(data.deposit).toLocaleString('id-ID')}</strong>
                            </div>` : ''}
                            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                                <span>Biaya Layanan:</span>
                                <strong>Rp 6.500</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-top: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0; font-weight: 700; color: #1d4ed8; font-size: 0.95rem;">
                                <span>${data.isDp ? 'Total Tagihan DP' : 'Total Tagihan'}:</span>
                                <span>Rp ${Number(data.price).toLocaleString('id-ID')}</span>
                            </div>
                            ${data.isDp && (data.fullPrice || 0) > (data.dpAmount || (data.price - 6500 - (data.deposit || 0))) ? `
                            <div style="display: flex; justify-content: space-between; margin-top: 6px; color: #92400e; font-weight: 600; font-size: 0.85rem; background: #fffbeb; padding: 6px 8px; border-radius: 6px; border: 1px solid #fde68a;">
                                <span>Sisa Pelunasan di Lokasi:</span>
                                <span>Rp ${Number(data.fullPrice - (data.dpAmount || (data.price - 6500 - (data.deposit || 0)))).toLocaleString('id-ID')}</span>
                            </div>` : ''}
                        </div>
                    </div>` : ''}
                </div>
                
                <div style="margin-top: 16px;">
                    <button onclick="Swal.close(); setTimeout(()=> { window.generateEtiketPDF(window._lastBookingData); }, 300)" style="width:100%; background: linear-gradient(135deg,#1d4ed8,#0891b2); color:#fff; border:none; border-radius:10px; padding:13px 20px; font-size:0.95rem; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                        <i class="fa-solid fa-file-pdf"></i> Unduh e-Tiket PDF
                    </button>
                </div>
                ${processInfo}
            `;

            // Simpan data lengkap untuk PDF
            window._lastBookingData = data;

            Swal.fire({
                title: 'Status Pesanan',
                html: htmlContent,
                confirmButtonColor: '#22c55e',
                confirmButtonText: 'Tutup',
                customClass: { container: 'my-swal-container' }
            });

        } else {
            let errorMsg = "Pastikan ID Transaksi yang Anda masukkan benar (BKG-... atau ORD-...).";
            try {
                const err = await response.json();
                if (err && err.message) errorMsg = err.message;
            } catch (e) { }

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
                { title: "Toyota Avanza" },
                { title: "Toyota Innova Reborn" },
                { title: "Toyota Hiace Commuter" }
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
                { title: "Paket Sasak Tour (1 Hari)" },
                { title: "Paket Explore Gili (1 Hari)" },
                { title: "Paket Honeymoon Romantis (3H2M)" },
                { title: "Paket Family Vacation (4H3M)" }
            ];
        }
    } else if (layanan === "Airport Transfer") {
        const transferItems = globalItems.filter(item => {
            const cat = item.category?.toLowerCase() || '';
            return cat.includes("antar jemput") || cat.includes("transfer") || cat === "transfer";
        });

        // Extract unique combinations of area and vehicle from transferMatrix
        const uniqueOptions = new Set();
        transferItems.forEach(item => {
            if (item.transferMatrix && Array.isArray(item.transferMatrix)) {
                item.transferMatrix.forEach(matrix => {
                    let areaName = matrix.area;
                    if (areaName && !areaName.toLowerCase().includes("airport")) {
                        areaName = `Airport ⇔ ${areaName}`;
                    }

                    if (matrix.area && matrix.prices && Object.keys(matrix.prices).length > 0) {
                        Object.keys(matrix.prices).forEach(vehicle => {
                            uniqueOptions.add(`${areaName} (${vehicle})`);
                        });
                    } else if (matrix.area) {
                        uniqueOptions.add(areaName);
                    }
                });
            }
        });

        uniqueOptions.forEach(opt => {
            options.push({ title: opt });
        });

        // Fallback mock data
        if (options.length === 0) {
            options = [
                { title: "Airport ⇔ Mataram Kota (Avanza)" },
                { title: "Airport ⇔ Mataram Kota (Innova)" },
                { title: "Airport ⇔ Senggigi (Avanza)" },
                { title: "Airport ⇔ Senggigi (Innova)" }
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
        
        const qbTanggal = document.getElementById("qb-tanggal");
        if (qbTanggal) {
            // Validate date against existing bookings
            qbTanggal.addEventListener('change', (e) => {
                const selectedDate = e.target.value;
                const subLayanan = document.getElementById("qb-sub-layanan").value;
                if (!selectedDate || subLayanan === "-") return;
                
                if (window.globalBookings && window.globalBookings.length > 0) {
                    const isBooked = window.globalBookings.some(b => {
                        return b.startDate === selectedDate && b.itemName === subLayanan && (b.status === 'PAID' || b.status === 'CONFIRMED' || b.status === 'PENDING');
                    });
                    if (isBooked) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Tanggal Penuh',
                            text: 'Maaf, layanan ini sudah terisi pada tanggal tersebut. Silakan pilih tanggal lain.',
                            confirmButtonColor: '#22c55e'
                        });
                        e.target.value = ''; // clear the date
                    }
                }
            });

            const qbSubLayanan = document.getElementById("qb-sub-layanan");
            if (qbSubLayanan) {
                qbSubLayanan.addEventListener('change', () => {
                    if (qbTanggal.value) {
                        qbTanggal.dispatchEvent(new Event('change'));
                    }
                });
            }
        }
        
        // Auto-open shared item
        const urlParams = new URLSearchParams(window.location.search);
        const itemId = urlParams.get('item');
        if (itemId && globalItems) {
            const item = globalItems.find(i => i.id === itemId);
            if (item) {
                const isFleet = ['car', 'motorcycle', 'drone'].includes(item.category);
                const sectionId = isFleet ? (item.category === 'motorcycle' ? 'motorcycles' : (item.category === 'drone' ? 'drones' : 'cars')) : 'packages';
                const section = document.getElementById(sectionId);
                if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                window.history.replaceState({}, document.title, window.location.pathname);
                
                openTourModal(item.id);
            }
        }
    });
});



// Handle Quick Booking form
window.submitBooking = (method) => {
    const layanan = document.getElementById("qb-layanan").value;
    const subLayanan = document.getElementById("qb-sub-layanan").value;
    const tanggal = document.getElementById("qb-tanggal").value;
    const jumlah = document.getElementById("qb-jumlah").value;

    if (!tanggal) {
        Swal.fire({ icon: 'info', title: 'Pemberitahuan', text: "Mohon pilih tanggal terlebih dahulu.", confirmButtonColor: '#22c55e' });
        return;
    }

    let estimatedPrice = 0;
    if (subLayanan && subLayanan !== "-") {
        if (layanan === "Sewa Mobil" || layanan === "Paket Tour") {
            const matched = window.globalItems ? window.globalItems.find(i => i.title === subLayanan) : null;
            if (matched && matched.price) {
                estimatedPrice = matched.price;
            }
        } else if (layanan === "Airport Transfer") {
            const transferItems = window.globalItems ? window.globalItems.filter(item => {
                const cat = item.category?.toLowerCase() || '';
                return cat.includes("antar jemput") || cat.includes("transfer") || cat === "transfer";
            }) : [];
            
            // Try to parse "Airport ⇔ Area Name (Vehicle)" or "Area Name (Vehicle)"
            let areaName = subLayanan.replace("Airport ⇔ ", "");
            let vehicle = "";
            const match = areaName.match(/(.*?)\s*\((.*?)\)$/);
            if (match) {
                areaName = match[1].trim();
                vehicle = match[2].trim();
            }

            for (let item of transferItems) {
                if (item.transferMatrix && Array.isArray(item.transferMatrix)) {
                    for (let matrix of item.transferMatrix) {
                        let mArea = matrix.area || "";
                        if (mArea.trim() === areaName || mArea.trim() === subLayanan.replace("Airport ⇔ ", "").trim()) {
                            if (vehicle && matrix.prices && matrix.prices[vehicle]) {
                                estimatedPrice = Number(matrix.prices[vehicle]);
                                break;
                            }
                        }
                    }
                }
                if (estimatedPrice > 0) break;
            }
        }
    }

    let itemDetail = layanan;
    if (subLayanan && subLayanan !== "-") {
        itemDetail = `${layanan} - ${subLayanan}`;
    }
    const itemName = `${itemDetail} (${jumlah} - ${tanggal})`;

    if (method === "wa") {
        openCheckoutModal(itemName, estimatedPrice, 'wa');
    } else {
        // Require login for web checkout
        if (!window.checkAuthAndPrompt()) return;
        openCheckoutModal(itemName, estimatedPrice, 'web');
    }
};
// Cloudflare Turnstile Verification Helper for Checkout Modal
window.ensureTurnstileScript = () => {
    if (window.turnstile || document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) return;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
};

window.initCheckoutTurnstile = () => {
    window.ensureTurnstileScript();
    window._checkoutTurnstileToken = '';
    const container = document.getElementById('checkout-turnstile');
    if (!container) return;

    container.innerHTML = '';

    const tryRender = (attempts = 0) => {
        const el = document.getElementById('checkout-turnstile');
        if (!el) return;

        if (window.turnstile && typeof window.turnstile.render === 'function') {
            try {
                if (window._checkoutTurnstileWidgetId !== undefined) {
                    try { window.turnstile.remove(window._checkoutTurnstileWidgetId); } catch(e){}
                    window._checkoutTurnstileWidgetId = undefined;
                }
                window._checkoutTurnstileWidgetId = window.turnstile.render(el, {
                    sitekey: '0x4AAAAAAEY5_o0-MiC2wPpS',
                    theme: 'light',
                    callback: (token) => {
                        window._checkoutTurnstileToken = token;
                        const errMsg = document.getElementById('turnstile-error-msg');
                        if (errMsg) errMsg.style.display = 'none';
                    },
                    'expired-callback': () => {
                        window._checkoutTurnstileToken = '';
                    },
                    'error-callback': () => {
                        window._checkoutTurnstileToken = '';
                    }
                });
            } catch (err) {
                console.warn('Turnstile render warning:', err);
            }
        } else if (attempts < 30) {
            setTimeout(() => tryRender(attempts + 1), 200);
        }
    };

    setTimeout(() => tryRender(0), 100);
};

// Checkout & QRIS Flow
window.closeCheckoutModal = () => {
    // Stop any active QRIS polling when modal is closed
    if (window.activePollInterval) {
        clearInterval(window.activePollInterval);
        window.activePollInterval = null;
    }
    if (window.turnstile && window._checkoutTurnstileWidgetId !== undefined) {
        try { window.turnstile.remove(window._checkoutTurnstileWidgetId); } catch(e){}
        window._checkoutTurnstileWidgetId = undefined;
    }
    window._checkoutTurnstileToken = '';
    // Clear saved checkout state — user intentionally closed
    sessionStorage.removeItem('checkoutState');
    window._checkoutActive = false;
    window.removeEventListener('beforeunload', window._checkoutBeforeUnload);
    document.getElementById("checkout-modal").classList.remove("active");
};

window.openCheckoutModal = async (itemName, price, method = 'web') => {
    // Find itemId
    let matchedItem = window.globalItems ? window.globalItems.find(i => i.title === itemName) : null;
    window.currentCheckoutItemId = matchedItem ? matchedItem.id : null;
    if (method !== 'wa' && !window.checkAuthAndPrompt()) return;

    const modalBody = document.getElementById("checkout-modal-body");
    const isOrder = price > 0;
    const displayPrice = isOrder ? formatPrice(price) : "";

    // Fetch bookings to show availability
    try {
        const res = await fetch(`${API_URL}/bookings?public=true&_t=${new Date().getTime()}`, { cache: 'no-store' });
        const allBookings = await res.json();
        const itemBookings = allBookings.filter(b => {
            const bName = b.itemName || "";
            if (!bName) return false;
            const matchesName = bName === itemName || itemName.includes(bName) || bName.includes(itemName);
            return matchesName && (b.status === 'PAID' || b.status === 'PENDING');
        });

        window.currentBookings = itemBookings;
    } catch (e) {
        console.error("Failed to fetch bookings:", e);
    }

    // Auto-calculate end date based on package name (e.g., "5H 4M" -> 5 Hari)
    const matchDays = itemName.match(/(\d+)\s*H/i);
    const durationDays = matchDays ? parseInt(matchDays[1]) : 0;

    let category = "other";
    if (matchedItem && matchedItem.category) {
        if (matchedItem.category === 'car') category = 'mobil';
        else if (matchedItem.category === 'motorcycle') category = 'motor';
        else if (matchedItem.category === 'package') category = 'tour';
        else if (matchedItem.category === 'airport') category = 'airport';
    }
    const nameLower = itemName.toLowerCase();
    if (category === "other") {
        if (nameLower.includes("airport") || nameLower.includes("jemput") || nameLower.includes("antar") || nameLower.includes("transfer")) category = "airport";
        else if (nameLower.includes("motor")) category = "motor";
        else if (nameLower.includes("mobil") || nameLower.includes("avanza") || nameLower.includes("innova") || nameLower.includes("hiace") || nameLower.includes("brio") || nameLower.includes("xpander") || nameLower.includes("alphard") || nameLower.includes("fortuner")) category = "mobil";
        else if (nameLower.includes("paket") || nameLower.includes("tour")) category = "tour";
    }

    const is12HourDriver = (category === 'mobil' && (nameLower.includes("12 jam") || nameLower.includes("include driver")));
    window._is12HourDriver = is12HourDriver;

    // ====== APPLY EVENT MODE ======
    const evtSettings = window.globalEventSettings || { eventMode: false, eventPriceIncrease: 0 };
    const isEventActive = evtSettings.eventMode && evtSettings.eventPriceIncrease > 0;
    const isRentalItem = (category === 'motor' || category === 'mobil');
    const eventPriceIncrease = (isEventActive && isRentalItem && !is12HourDriver) ? evtSettings.eventPriceIncrease : 0;
    const EVENT_MIN_DAYS = 4; // Minimum sewa saat event
    // ====== END EVENT MODE ======


    let html = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: ${method === 'wa' ? '#22c55e' : 'var(--primary-blue)'};">${method === 'wa' ? '<i class="fa-brands fa-whatsapp"></i> Form Booking via WA' : (isOrder ? "Checkout Pesanan" : "Form Booking")}</h2>
            <p style="color: #64748b; font-size: 0.9rem;">${method === 'wa' ? "Silakan lengkapi rincian booking Anda (Tanpa wajib login)." : (isOrder ? "Selesaikan pesanan item Anda." : "Lengkapi data untuk proses booking.")}</p>
        </div>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; border: 1px solid #e2e8f0;">
            <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 5px;">${method === 'wa' ? "Item Booking:" : (isOrder ? "Item yang diorder:" : "Rincian Booking:")}</p>
            <h3 style="color: var(--text-dark); margin-bottom: 5px;">${itemName}</h3>
            ${isOrder ? `
                ${(isEventActive && isRentalItem && !is12HourDriver) ? `
                <div style="margin-bottom: 6px;">
                    <span id="co-crossed-price" style="text-decoration: line-through; color: #94a3b8; font-size: 0.9rem;">${formatPrice(price * EVENT_MIN_DAYS)}</span>
                    <span style="background: linear-gradient(135deg,#f59e0b,#ef4444); color: white; font-size: 0.7rem; font-weight: 700; padding: 2px 7px; border-radius: 10px; margin-left: 6px;">EVENT +${formatPrice(evtSettings.eventPriceIncrease)}</span>
                </div>
                <p id="co-display-price" data-base-price="${price}" data-event-increase="${eventPriceIncrease}" style="font-weight: bold; color: #ef4444; font-size: 1.25rem;">${formatPrice((price * EVENT_MIN_DAYS) + eventPriceIncrease)} <span style="font-size:0.85rem;color:#64748b;font-weight:normal;">(${EVENT_MIN_DAYS} Hari)</span></p>
                ` : `<p id="co-display-price" data-base-price="${price}" data-event-increase="0" style="font-weight: bold; color: var(--primary-green); font-size: 1.1rem;">${formatPrice(price)} ${is12HourDriver ? '<span style="font-size:0.85rem;color:#15803d;font-weight:normal;">/ 12 Jam</span>' : ''}</p>`}
            ` : ""}
        </div>

        ${(isEventActive && isRentalItem && !is12HourDriver) ? `
        <div style="background: linear-gradient(135deg, #fff7ed, #fef3c7); border: 1.5px solid #f59e0b; border-radius: 10px; padding: 10px 14px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px;">
            <i class="fa-solid fa-fire" style="color: #f59e0b; font-size: 1.2rem;"></i>
            <div>
                <div style="font-weight: 700; color: #92400e; font-size: 0.85rem;">🎉 ${evtSettings.eventName ? `Event: ${evtSettings.eventName}` : 'High Season!'}</div>
                <div style="font-size: 0.78rem; color: #78350f;">Harga naik Rp ${parseInt(evtSettings.eventPriceIncrease).toLocaleString('id-ID')} · Minimum sewa 4 hari</div>
            </div>
        </div>
        ` : ''}


        <form id="checkout-form" onsubmit="event.preventDefault(); processCheckout('${itemName}', ${price || 0}, '${method}');">

            <div class="form-group mb-3">
                <label>Nama Lengkap</label>
                <input type="text" id="co-name" class="form-control" required placeholder="Masukkan nama Anda">
            </div>
            <div style="display:flex; gap:15px;">
                <div class="form-group mb-3" style="flex:1;">
                    <label>Nomor WhatsApp</label>
                    <input type="text" id="co-phone" class="form-control" required placeholder="Contoh: 08123456789">
                </div>
                <div class="form-group mb-3" style="flex:1;">
                    <label>Email</label>
                    <input type="email" id="co-email" class="form-control" required placeholder="email@example.com">
                </div>
            </div>
            <div style="display: flex; gap: 15px;">
                <div class="form-group mb-3" style="flex: 1;">
                    <label>${category === 'airport' ? 'Tanggal' : (is12HourDriver ? 'Tanggal Pemakaian' : 'Tanggal Mulai')}</label>
                    <input type="date" id="co-start-date" class="form-control" required>
                </div>
                ${category === 'airport' ? `
                <input type="hidden" id="co-end-date" required>
                ` : (durationDays === 0 ? `
                <div class="form-group mb-3" style="flex: 1; display:flex; flex-direction:column;">
                    <label>${is12HourDriver ? 'Durasi Pemakaian (Paket 12 Jam)' : 'Durasi Sewa'}${ (isEventActive && isRentalItem && !is12HourDriver) ? ' <span style="font-size:0.75rem;color:#ef4444;font-weight:700;">⚠ Min. 4 Hari (Event)</span>' : '' }</label>
                    <div style="display:flex; gap:10px;">
                        <select id="co-duration-select" class="form-control" style="flex:1;" required onchange="const c = document.getElementById('co-duration-custom'); if(this.value==='custom') { c.style.display='block'; c.required=true; c.focus(); } else { c.style.display='none'; c.required=false; }">
                            ${is12HourDriver ? `
                                <option value="1" selected>12 Jam</option>
                                <option value="2">2 Hari (2x 12 Jam)</option>
                                <option value="3">3 Hari (3x 12 Jam)</option>
                                <option value="4">4 Hari (4x 12 Jam)</option>
                                <option value="5">5 Hari (5x 12 Jam)</option>
                                <option value="6">6 Hari (6x 12 Jam)</option>
                                <option value="7">1 Minggu (7x 12 Jam)</option>
                                <option value="custom">Custom (Berapa Hari?)</option>
                            ` : `
                                ${(isEventActive && isRentalItem) ? '' : '<option value="1">1 Hari</option>'}
                                ${(isEventActive && isRentalItem) ? '' : '<option value="2">2 Hari</option>'}
                                ${(isEventActive && isRentalItem) ? '' : '<option value="3">3 Hari</option>'}
                                <option value="4"${(isEventActive && isRentalItem) ? ' selected' : ''}>4 Hari${(isEventActive && isRentalItem) ? ' (Minimum Event)' : ''}</option>
                                <option value="5">5 Hari</option>
                                <option value="6">6 Hari</option>
                                <option value="7">1 Minggu (7 Hari)</option>
                                <option value="14">2 Minggu (14 Hari)</option>
                                <option value="custom">Custom (Ketik Sendiri)</option>
                            `}
                        </select>
                        <input type="number" id="co-duration-custom" class="form-control" min="${(isEventActive && isRentalItem && !is12HourDriver) ? EVENT_MIN_DAYS : 1}" max="60" placeholder="Berapa hari?" style="display:none; width:110px;" oninput="if(this.value>60){this.value=60;} else if(this.value<1 && this.value!==''){this.value=1;}">
                    </div>
                </div>
                <input type="hidden" id="co-end-date" required>
                ` : `
                <div class="form-group mb-3" style="flex: 1;">
                    <label>Tanggal Selesai <span style="font-size:0.75rem;color:#0ea5e9;font-weight:600;">● Otomatis</span></label>
                    <input type="date" id="co-end-date" class="form-control" required readonly style="background:#f1f5f9;cursor:not-allowed;">
                </div>
                `)}
            </div>
            <div id="date-duration-info" style="display:${durationDays > 0 ? 'flex' : 'none'}; align-items:center; gap:10px; margin-bottom:16px; background:linear-gradient(135deg,#eff6ff,#e0f2fe); border:1px solid #bae6fd; border-radius:12px; padding:12px 16px;">
                <div style="width:36px;height:36px;background:#0ea5e9;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <i class="fa-solid fa-calendar-check" style="color:white;font-size:1rem;"></i>
                </div>
                <div>
                    <div id="date-duration-title" style="font-size:0.8rem;font-weight:700;color:#0369a1;">
                        ${durationDays > 0 ? (itemName.match(/(\d+H\s*\d+M)/i)?.[1] || durationDays + 'H ' + (durationDays - 1) + 'M') + ' &mdash; Durasi Paket' : (is12HourDriver ? 'Info Durasi 12 Jam' : 'Info Pengembalian')}
                    </div>
                    <div id="date-duration-text" style="font-size:0.82rem;color:#0369a1;margin-top:2px;">
                        ${durationDays > 0 ? 'Pilih tanggal mulai, tanggal selesai akan otomatis terisi.' : ''}
                    </div>
                </div>
            </div>
            <div id="dynamic-date-warning" style="display: none; margin-bottom: 15px; font-size: 0.85rem; color: #ef4444; background: #fff1f2; padding: 10px; border-radius: 8px; border: 1px solid #fecdd3;">
                <strong><i class="fa-solid fa-triangle-exclamation"></i> Maaf, rentang tanggal yang Anda pilih bentrok dengan jadwal yang sudah dipesan! Silakan pilih tanggal lain.</strong>
            </div>`;

    if (category === 'motor' || category === 'mobil') {
        html += `
            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="font-size: 0.95rem; margin-bottom: 10px; color: #334155;"><i class="fa-solid fa-location-dot"></i> ${is12HourDriver ? 'Detail Lokasi Penjemputan' : 'Detail Lokasi & Waktu'}</h4>
                <div class="form-group mb-3">
                    <div style="display: flex; gap: 8px;">
                        <div style="flex: 1;">
                            <label>${is12HourDriver ? 'Lokasi Penjemputan (Hotel / Bandara / Alamat)' : 'Tempat Pengambilan (GPS/Alamat)'}</label>
                            <input type="text" id="co-pickup-loc" class="form-control" required placeholder="Contoh: Bandara LOP / Hotel X" style="width: 100%;">
                        </div>
                        <div>
                            <label style="font-size: 0.75rem; color: #64748b; display: block; text-align: center;">Lokasi Anda</label>
                            <button type="button" onclick="window.getCurrentLocation('co-pickup-loc', event)" class="btn" style="background: #e2e8f0; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0 15px; height: 38px; display: flex; align-items: center; justify-content: center;" title="Gunakan Lokasi Terkini"><i class="fa-solid fa-location-crosshairs"></i></button>
                        </div>
                    </div>
                </div>
                <div class="form-group mb-3">
                    <div style="display: flex; gap: 8px;">
                        <div style="flex: 1;">
                            <label>${is12HourDriver ? 'Lokasi Pengantaran / Selesai Tour (Hotel / Bandara / Alamat)' : 'Tempat Pengembalian (GPS/Alamat)'}</label>
                            <input type="text" id="co-dropoff-loc" class="form-control" required placeholder="Contoh: Bandara LOP / Hotel X" style="width: 100%;">
                        </div>
                        <div>
                            <label style="font-size: 0.75rem; color: #64748b; display: block; text-align: center;">Lokasi Anda</label>
                            <button type="button" onclick="window.getCurrentLocation('co-dropoff-loc', event)" class="btn" style="background: #e2e8f0; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0 15px; height: 38px; display: flex; align-items: center; justify-content: center;" title="Gunakan Lokasi Terkini"><i class="fa-solid fa-location-crosshairs"></i></button>
                        </div>
                    </div>
                </div>
                <div style="display: ${is12HourDriver ? 'none' : 'flex'}; gap: 15px;">
                    <div class="form-group mb-0" style="flex: 1;">
                        <label>Jam Pengambilan</label>
                        <input type="time" id="co-pickup-time" class="form-control" ${is12HourDriver ? '' : 'required'} value="${is12HourDriver ? '08:00' : ''}">
                    </div>
                    <div class="form-group mb-0" style="flex: 1;">
                        <label>Jam Pengembalian</label>
                        <input type="time" id="co-dropoff-time" class="form-control" ${is12HourDriver ? '' : 'required'} value="${is12HourDriver ? '20:00' : ''}">
                    </div>
                </div>
                ${is12HourDriver ? `
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 9px 12px; font-size: 0.8rem; color: #166534; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-circle-check" style="color: #16a34a; font-size: 0.95rem;"></i>
                    <span>Paket Include Driver berlaku <strong>12 Jam pemakaian</strong> per hari (Sudah termasuk Unit Mobil, Supir & BBM). Jam penjemputan fleksibel disesuaikan dengan driver saat di lokasi.</span>
                </div>
                ` : ''}
            </div>
        `;
    } else if (category === 'airport') {
        html += `
            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="font-size: 0.95rem; margin-bottom: 10px; color: #334155;"><i class="fa-solid fa-plane-arrival"></i> Detail Penjemputan</h4>
                <div class="form-group mb-3">
                    <div style="display: flex; gap: 8px;">
                        <div style="flex: 1;">
                            <label>Lokasi Penjemputan (GPS/Alamat)</label>
                            <input type="text" id="co-pickup-loc" class="form-control" required placeholder="Contoh: Bandara / Hotel" style="width: 100%;">
                        </div>
                        <div>
                            <label style="font-size: 0.75rem; color: #64748b; display: block; text-align: center;">Lokasi Anda</label>
                            <button type="button" onclick="window.getCurrentLocation('co-pickup-loc', event)" class="btn" style="background: #e2e8f0; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0 15px; height: 38px; display: flex; align-items: center; justify-content: center;" title="Gunakan Lokasi Terkini"><i class="fa-solid fa-location-crosshairs"></i></button>
                        </div>
                    </div>
                </div>
                <div class="form-group mb-3">
                    <div style="display: flex; gap: 8px;">
                        <div style="flex: 1;">
                            <label>Alamat Tujuan (GPS/Alamat)</label>
                            <input type="text" id="co-dropoff-loc" class="form-control" required placeholder="Tujuan Anda" style="width: 100%;">
                        </div>
                        <div>
                            <label style="font-size: 0.75rem; color: #64748b; display: block; text-align: center;">Lokasi Anda</label>
                            <button type="button" onclick="window.getCurrentLocation('co-dropoff-loc', event)" class="btn" style="background: #e2e8f0; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0 15px; height: 38px; display: flex; align-items: center; justify-content: center;" title="Gunakan Lokasi Terkini"><i class="fa-solid fa-location-crosshairs"></i></button>
                        </div>
                    </div>
                </div>
                <div class="form-group mb-3">
                    <label>Nomor Penerbangan</label>
                    <input type="text" id="co-flight-num" class="form-control" required placeholder="Contoh: GA-123">
                </div>
                <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                    <div class="form-group mb-0" style="flex: 1;">
                        <label>Jam Penjemputan</label>
                        <input type="time" id="co-pickup-time" class="form-control" required>
                    </div>
                    <div class="form-group mb-0" style="flex: 1;">
                        <label>Jumlah Penumpang</label>
                        <input type="number" id="co-pax" class="form-control" required min="1" placeholder="Misal: 2">
                    </div>
                </div>
                <div class="form-group mb-0">
                    <label>Catatan</label>
                    <textarea id="co-notes" class="form-control" placeholder="Tuliskan catatan khusus Anda..."></textarea>
                </div>
            </div>
        `;
    } else if (category === 'tour') {
        let vehicleOptions = '';
        if (window.globalItems) {
            const cars = window.globalItems.filter(i => {
                const cat = (i.category || '').toLowerCase();
                return (cat.includes('rental') || cat.includes('armada') || cat.includes('sewa') || cat === 'car' || cat === 'mobil') && !cat.includes('motor');
            });
            const multiplier = durationDays > 0 ? durationDays : 1;
            cars.forEach(car => {
                const totalCarPrice = car.price * multiplier;
                const dailyText = durationDays > 0 ? ` x ${multiplier} Hari` : ``;
                vehicleOptions += `<option value="${car.title}" data-price="${totalCarPrice}">${car.title} (+ ${formatPrice(car.price)}/hari${dailyText})</option>`;
            });
        }
        if (!vehicleOptions) {
            vehicleOptions = `<option value="Avanza" data-price="0">Pilihan Kendaraan Tidak Ditemukan</option>`;
        }

        html += `
            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="font-size: 0.95rem; margin-bottom: 10px; color: #334155;"><i class="fa-solid fa-map-location-dot"></i> Detail Tour</h4>
                <div class="form-group mb-3">
                    <div style="display: flex; gap: 8px;">
                        <div style="flex: 1;">
                            <label>Lokasi Jemput (GPS/Alamat)</label>
                            <input type="text" id="co-pickup-loc" class="form-control" required placeholder="Contoh: Bandara / Senggigi" style="width: 100%;">
                        </div>
                        <div>
                            <label style="font-size: 0.75rem; color: #64748b; display: block; text-align: center;">Lokasi Anda</label>
                            <button type="button" onclick="window.getCurrentLocation('co-pickup-loc', event)" class="btn" style="background: #e2e8f0; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0 15px; height: 38px; display: flex; align-items: center; justify-content: center;" title="Gunakan Lokasi Terkini"><i class="fa-solid fa-location-crosshairs"></i></button>
                        </div>
                    </div>
                </div>
                <div class="form-group mb-3">
                    <div style="display: flex; gap: 8px;">
                        <div style="flex: 1;">
                            <label>Lokasi Drop Off</label>
                            <input type="text" id="co-dropoff-loc" class="form-control" required placeholder="Contoh: Hotel Kuta" style="width: 100%;">
                        </div>
                        <div>
                            <label style="font-size: 0.75rem; color: #64748b; display: block; text-align: center;">Lokasi Anda</label>
                            <button type="button" onclick="window.getCurrentLocation('co-dropoff-loc', event)" class="btn" style="background: #e2e8f0; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0 15px; height: 38px; display: flex; align-items: center; justify-content: center;" title="Gunakan Lokasi Terkini"><i class="fa-solid fa-location-crosshairs"></i></button>
                        </div>
                    </div>
                </div>
                <div class="form-group mb-3">
                    <label>Pilihan Kendaraan</label>
                    <select id="co-tour-vehicle" class="form-control" required onchange="window.updateTourPrice(this)">
                        ${vehicleOptions}
                    </select>
                </div>
                <div class="form-group mb-0">
                    <label>Catatan / Request Khusus</label>
                    <textarea id="co-notes" class="form-control" placeholder="Tuliskan permintaan khusus Anda..."></textarea>
                </div>
            </div>
        `;
    }

    let dpAmount = 500200;
    let depositAmount = 0;
    if (category === 'motor') {
        dpAmount = 50000;
        depositAmount = 500000;
    } else if (category === 'mobil') {
        dpAmount = 200000;
        depositAmount = 1000000;
    } else if (category === 'tour') {
        dpAmount = 500200;
    }

    // Deposit tidak berlaku jika include driver/supir
    const nameLowerForDeposit = (itemName || '').toLowerCase();
    let isWithDriver = nameLowerForDeposit.includes("driver") || nameLowerForDeposit.includes("supir") || nameLowerForDeposit.includes("dengan supir");
    if (matchedItem && matchedItem.driverOptions && matchedItem.driverOptions !== 'Tidak Include Driver') {
        isWithDriver = true;
    }
    if (isWithDriver) {
        depositAmount = 0;
    }

    if (isOrder && method !== 'wa') {
        html += `
            ${depositAmount > 0 ? `
            <div style="background: #e0f2fe; border: 1.5px solid #38bdf8; border-radius: 10px; padding: 12px; margin-bottom: 16px; text-align: left;">
                <div style="font-weight: 700; color: #0369a1; font-size: 0.9rem; margin-bottom: 4px;">ℹ️ Catatan Penting: Tentang Uang Deposit</div>
                <div style="font-size: 0.8rem; color: #0c4a6e;">
                    Total pembayaran Anda saat ini sudah otomatis ditambahkan uang deposit sebesar <strong>${formatPrice(depositAmount)}</strong>. Uang deposit ini adalah jaminan yang akan <strong>dikembalikan 100%</strong> setelah masa sewa berakhir jika kendaraan dalam kondisi baik.
                </div>
            </div>
            ` : ''}
            ${price > dpAmount ? `
            <div class="form-group mb-4" style="text-align: left;">
                <label style="font-weight:700;color:var(--text-dark);">Tipe Pembayaran</label>
                <div style="display:flex;gap:10px;margin-top:8px;" id="payment-type-container">
                    <label id="pt-dp-label" onclick="window.setPaymentType('dp')" style="flex:1;display:flex;align-items:flex-start;gap:10px;background:#fffbeb;border:2px solid #f59e0b;border-radius:10px;padding:12px;cursor:pointer;transition:all .2s;">
                        <input type="radio" name="payment-type-radio" id="pt-dp" value="dp" checked style="accent-color:#f59e0b;width:16px;height:16px;margin-top:2px;">
                        <div>
                            <div style="font-weight:700;color:#d97706;font-size:0.88rem;">Bayar DP</div>
                            <div style="font-size:0.75rem;color:#92400e;margin-top:2px;">Bayar DP ${formatPrice(dpAmount)} ${depositAmount > 0 ? `+ Deposit ${formatPrice(depositAmount)}` : ''} + Layanan Rp 6.500 sekarang.</div>
                            <div style="font-size:0.75rem;font-weight:700;color:#d97706;margin-top:4px;">Total ditransfer: ${formatPrice(dpAmount + depositAmount + 6500)}</div>
                        </div>
                    </label>
                    <label id="pt-full-label" onclick="window.setPaymentType('full')" style="flex:1;display:flex;align-items:flex-start;gap:10px;background:#f0fdf4;border:2px solid #e2e8f0;border-radius:10px;padding:12px;cursor:pointer;transition:all .2s;">
                        <input type="radio" name="payment-type-radio" id="pt-full" value="full" style="accent-color:#22c55e;width:16px;height:16px;margin-top:2px;">
                        <div>
                            <div style="font-weight:700;color:#15803d;font-size:0.88rem;">Bayar Lunas</div>
                            <div style="font-size:0.75rem;color:#166534;margin-top:2px;">Lunas Sewa ${depositAmount > 0 ? `+ Deposit ${formatPrice(depositAmount)}` : ''} + Layanan Rp 6.500</div>
                            <div style="font-size:0.75rem;font-weight:700;color:#15803d;margin-top:4px;">Transfer sewa penuh + deposit</div>
                        </div>
                    </label>
                </div>
            </div>
            ` : ''}

            <!-- PROMO CODE -->
            <div class="form-group mb-4" id="promo-container">
                <label style="font-weight:700;color:var(--text-dark);">Kode Promo (Opsional)</label>
                <div style="display:flex; gap:10px; margin-top:8px;">
                    <input type="text" id="co-promo-input" class="form-control" placeholder="Masukkan kode promo" style="text-transform: uppercase;">
                    <button type="button" onclick="window.applyPromo()" class="btn btn-blue" style="padding: 8px 15px; border-radius: 8px; font-weight: bold;">Gunakan</button>
                </div>
                <div id="promo-message" style="margin-top: 8px; font-size: 0.85rem; display:none;"></div>
                <input type="hidden" id="co-promo-applied" value="">
                <input type="hidden" id="co-promo-discount" value="0">
            </div>
            <div class="form-group mb-4">
                <label>Metode Pembayaran</label>
                <select id="co-payment" class="form-control" required onchange="
                    const d = document.getElementById('bank-details');
                    const va = document.getElementById('va-bank-selector');
                    if(this.value==='manual') { d.style.display='block'; va.style.display='none'; }
                    else if(this.value==='va') { d.style.display='none'; va.style.display='block'; }
                    else { d.style.display='none'; va.style.display='none'; }
                ">
                    ${(() => {
                        const isQrisMaint = window.globalSettings && window.globalSettings.qrisMaintenanceMode;
                        const isVaMaint = window.globalSettings && window.globalSettings.vaMaintenanceMode;
                        const isManualMaint = window.globalSettings && window.globalSettings.manualMaintenanceMode;
                        const defaultOpt = !isQrisMaint ? 'qris' : (!isVaMaint ? 'va' : (!isManualMaint ? 'manual' : 'none'));
                        
                        let qrisOpt = isQrisMaint ? '<option value="qris" disabled>QRIS Otomatis (Sedang Pemeliharaan)</option>' : `<option value="qris" ${defaultOpt === 'qris' ? 'selected' : ''}>QRIS Otomatis (Verifikasi Instan) — 1 Jam</option>`;
                        let vaOpt = isVaMaint ? '<option value="va" disabled>Virtual Account (Sedang Pemeliharaan)</option>' : `<option value="va" ${defaultOpt === 'va' ? 'selected' : ''}>Virtual Account (Verifikasi Otomatis) — 24 Jam</option>`;
                        let manualOpt = isManualMaint ? '' : `<option value="manual" ${defaultOpt === 'manual' ? 'selected' : ''}>Transfer Manual (Verifikasi WA)</option>`;
                        return qrisOpt + vaOpt + manualOpt;
                    })()}
                </select>
            </div>

            <!-- VA Bank Selector (hanya muncul saat pilih Virtual Account) -->
            <div id="va-bank-selector" style="display: ${(() => {
                const isQrisMaint = window.globalSettings && window.globalSettings.qrisMaintenanceMode;
                const isVaMaint = window.globalSettings && window.globalSettings.vaMaintenanceMode;
                const isManualMaint = window.globalSettings && window.globalSettings.manualMaintenanceMode;
                const defaultOpt = !isQrisMaint ? 'qris' : (!isVaMaint ? 'va' : (!isManualMaint ? 'manual' : 'none'));
                return defaultOpt === 'va' ? 'block' : 'none';
            })()}; background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #bae6fd;">
                <p style="font-size: 0.85rem; color: #0369a1; margin-bottom: 10px; font-weight: 600;"><i class="fa-solid fa-building-columns"></i> Pilih Bank Virtual Account:</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    ${['BNI','BRI','MANDIRI','PERMATA','BCA'].map(bank => `
                    <label style="display:flex;align-items:center;gap:8px;background:white;border:2px solid #e0f2fe;border-radius:8px;padding:10px;cursor:pointer;transition:all .2s;" onclick="document.querySelectorAll('#va-bank-selector label').forEach(l=>l.style.borderColor='#e0f2fe'); this.style.borderColor='#0ea5e9';">
                        <input type="radio" name="va-bank" value="${bank}" style="accent-color:#0ea5e9;">
                        <span style="font-weight:bold;font-size:0.9rem;color:#0c4a6e;">${bank}</span>
                    </label>`).join('')}
                </div>
                <p style="font-size: 0.78rem; color: #64748b; margin-top: 8px;"><i class="fa-solid fa-clock"></i> Batas waktu pembayaran: <strong>24 jam</strong></p>
            </div>

            <div id="bank-details" style="display: ${(() => {
                const isQrisMaint = window.globalSettings && window.globalSettings.qrisMaintenanceMode;
                const isVaMaint = window.globalSettings && window.globalSettings.vaMaintenanceMode;
                const isManualMaint = window.globalSettings && window.globalSettings.manualMaintenanceMode;
                const defaultOpt = !isQrisMaint ? 'qris' : (!isVaMaint ? 'va' : (!isManualMaint ? 'manual' : 'none'));
                return defaultOpt === 'manual' ? 'block' : 'none';
            })()}; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #cbd5e1;">
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

            <!-- Cloudflare Turnstile Verification -->
            <div id="checkout-turnstile-container" style="margin: 15px 0 20px 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 68px;">
                <div id="checkout-turnstile"></div>
                <div id="turnstile-error-msg" style="color: #ef4444; font-size: 0.82rem; margin-top: 6px; font-weight: 600; display: none;">
                    <i class="fa-solid fa-triangle-exclamation"></i> Harap selesaikan verifikasi Cloudflare di atas.
                </div>
            </div>

            <button type="submit" class="btn btn-green w-100" style="padding: 12px; font-size: 1.1rem;">LANJUTKAN PEMBAYARAN</button>
        `;
    } else {
        html += `
            <input type="hidden" id="co-payment" value="booking_only">
            ${method !== 'wa' ? `
            <!-- Cloudflare Turnstile Verification -->
            <div id="checkout-turnstile-container" style="margin: 15px 0 20px 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 68px;">
                <div id="checkout-turnstile"></div>
                <div id="turnstile-error-msg" style="color: #ef4444; font-size: 0.82rem; margin-top: 6px; font-weight: 600; display: none;">
                    <i class="fa-solid fa-triangle-exclamation"></i> Harap selesaikan verifikasi Cloudflare di atas.
                </div>
            </div>` : ''}
            <button type="submit" class="btn btn-green w-100" style="padding: 12px; font-size: 1.1rem; background: ${method === 'wa' ? '#22c55e' : 'var(--primary-green)'}; border-color: ${method === 'wa' ? '#22c55e' : 'var(--primary-green)'};">${method === 'wa' ? '<i class="fa-brands fa-whatsapp"></i> LANJUTKAN VIA WA' : 'KIRIM BOOKING'}</button>
        `;
    }

    html += `</form>
        <div id="qris-result" style="margin-top: 25px;"></div>
    `;

    modalBody.innerHTML = html;
    document.getElementById("checkout-modal").classList.add("active");

    // Auto-pasang promo jika ada yang dipilih dari AIRA (khusus item terkait atau promo universal semua paket)
    if (window.savedAiraPromo) {
        setTimeout(() => {
            const promoObj = typeof window.savedAiraPromo === 'object'
                ? window.savedAiraPromo
                : { code: window.savedAiraPromo, itemId: null };

            // Cek kecocokan kupon:
            // 1. Promo universal (!promoObj.itemId) -> berlaku untuk SEMUA paket/armada
            // 2. Promo khusus -> hanya dipasang jika promoObj.itemId cocok dengan window.currentCheckoutItemId
            const isMatch = !promoObj.itemId || (window.currentCheckoutItemId && promoObj.itemId === window.currentCheckoutItemId);

            if (isMatch) {
                const pi = document.getElementById('co-promo-input');
                if (pi) {
                    pi.value = promoObj.code;
                    if (typeof window.applyPromo === 'function') window.applyPromo();
                }
            } else {
                console.log(`[AIRA] Kupon ${promoObj.code} disimpan untuk item lain (target: ${promoObj.itemId}), tidak otomatis dipasang pada item saat ini.`);
            }
        }, 300);
    }

    if (method !== 'wa') {
        window.initCheckoutTurnstile();
    }

    // Call updateTourPrice once to set the initial total including the default selected vehicle
    if (category === 'tour') {
        setTimeout(() => {
            const tourVehicleSelect = document.getElementById('co-tour-vehicle');
            if (tourVehicleSelect) window.updateTourPrice(tourVehicleSelect);
        }, 50);
    }

    // Auto-fill email dari akun login jika tersedia
    try {
        const _user = JSON.parse(localStorage.getItem('auth_user') || '{}');
        if (_user && _user.email) {
            const _emailEl = document.getElementById('co-email');
            if (_emailEl && !_emailEl.value) _emailEl.value = _user.email;
        }
    } catch (e) { }

    // Save checkout state so it survives an accidental page refresh
    sessionStorage.setItem('checkoutState', JSON.stringify({ itemName, price }));
    window._checkoutActive = true;

    // Warn user before they accidentally leave/refresh while checkout is open
    window._checkoutBeforeUnload = (e) => {
        if (!window._checkoutActive) return;
        e.preventDefault();
        e.returnValue = 'Anda sedang dalam proses checkout. Yakin ingin meninggalkan halaman ini?';
    };
    window.removeEventListener('beforeunload', window._checkoutBeforeUnload);
    window.addEventListener('beforeunload', window._checkoutBeforeUnload);

    // Auto-save form input values to sessionStorage as user types
    const saveFormState = () => {
        const saved = JSON.parse(sessionStorage.getItem('checkoutState') || '{}');
        const nameEl = document.getElementById('co-name');
        const phoneEl = document.getElementById('co-phone');
        const emailEl = document.getElementById('co-email');
        const startEl = document.getElementById('co-start-date');
        const endEl = document.getElementById('co-end-date');
        const payEl = document.getElementById('co-payment');
        if (nameEl) saved.name = nameEl.value;
        if (phoneEl) saved.phone = phoneEl.value;
        if (emailEl) saved.email = emailEl.value;
        if (startEl) saved.startDate = startEl.value;
        if (endEl) saved.endDate = endEl.value;
        if (payEl) saved.payment = payEl.value;
        sessionStorage.setItem('checkoutState', JSON.stringify(saved));
    };
    ['co-name', 'co-phone', 'co-email', 'co-start-date', 'co-end-date', 'co-payment'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', saveFormState);
        if (el) el.addEventListener('change', saveFormState);
    });

    window._currentDurationDays = durationDays;

    const startDateEl = document.getElementById('co-start-date');
    const endDateEl = document.getElementById('co-end-date');
    const durationSelectEl = document.getElementById('co-duration-select');
    const durationCustomEl = document.getElementById('co-duration-custom');

    const updateEndDateAndPrice = () => {
        if (window.updateRentalDisplayPrice) window.updateRentalDisplayPrice();
        if (!startDateEl || !startDateEl.value || !endDateEl) return;
        const sDate = new Date(startDateEl.value);
        let currentDuration = durationDays;

        if (durationSelectEl) {
            if (durationSelectEl.value === 'custom') {
                currentDuration = durationCustomEl && durationCustomEl.value ? parseInt(durationCustomEl.value) : 1;
                if (currentDuration > 60) currentDuration = 60;
                if (currentDuration < 1) currentDuration = 1;
            } else {
                currentDuration = parseInt(durationSelectEl.value);
            }
        }

        // Hitung End Date
        // Untuk rental mobil 12 jam (Include Driver):
        // - 1 pemakaian (12 jam) = hari yang sama (daysToAdd = 0)
        // - 2 pemakaian (2x 12 jam) = hari ke-2 (daysToAdd = 1), dst.
        // Untuk rental lepas kunci biasa (0), 1 hari = pengembalian besok (daysToAdd = currentDuration)
        // Untuk paket (>0), 5 hari 4 malam = pengembalian di hari ke-5 (daysToAdd = currentDuration - 1)
        let daysToAdd = 0;
        if (window._is12HourDriver) {
            daysToAdd = Math.max(0, currentDuration - 1);
        } else if (window._currentDurationDays === 0) {
            daysToAdd = currentDuration;
        } else {
            daysToAdd = Math.max(0, currentDuration - 1);
        }
        sDate.setDate(sDate.getDate() + daysToAdd);
        endDateEl.value = sDate.toISOString().split('T')[0];

        // Tampilkan info box tanggal selesai untuk semua pesanan (rental maupun paket)
        const infoBox = document.getElementById('date-duration-info');
        const infoText = document.getElementById('date-duration-text');
        if (infoBox && infoText) {
            infoBox.style.display = 'flex';
            const opt = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = sDate.toLocaleDateString('id-ID', opt);
            if (window._is12HourDriver) {
                if (currentDuration === 1) {
                    infoText.innerHTML = `Layanan sewa Include Driver berlaku selama <strong>12 Jam</strong> pada tanggal <strong>${formattedDate}</strong>.`;
                } else {
                    infoText.innerHTML = `Layanan sewa Include Driver (<strong>${currentDuration}x 12 Jam</strong>) berakhir pada <strong>${formattedDate}</strong>.`;
                }
            } else if (window._currentDurationDays === 0) {
                infoText.innerHTML = `Masa sewa berakhir pada <strong>${formattedDate}</strong>.`;
            } else {
                infoText.innerHTML = `Paket/layanan berakhir pada <strong>${formattedDate}</strong>.`;
            }
        }

        saveFormState();
        if (window.checkDateOverlap) window.checkDateOverlap();
    };

    if (startDateEl) startDateEl.addEventListener('change', updateEndDateAndPrice);
    if (durationSelectEl) durationSelectEl.addEventListener('change', updateEndDateAndPrice);
    if (durationCustomEl) durationCustomEl.addEventListener('input', updateEndDateAndPrice);
};

window.updateRentalDisplayPrice = () => {
    const basePriceEl = document.getElementById("co-display-price");
    if (basePriceEl && window._currentDurationDays === 0) {
        const basePrice = parseInt(basePriceEl.getAttribute("data-base-price") || 0);
        const eventIncrease = parseInt(basePriceEl.getAttribute("data-event-increase") || 0);
        if (basePrice > 0) {
            let diffDays = 1;
            const durationSelect = document.getElementById('co-duration-select');
            if (durationSelect) {
                if (durationSelect.value === 'custom') {
                    const customInput = document.getElementById('co-duration-custom');
                    diffDays = customInput && customInput.value ? parseInt(customInput.value) : 1;
                    if (diffDays > 60) diffDays = 60;
                    if (diffDays < 1) diffDays = 1;
                } else {
                    diffDays = parseInt(durationSelect.value);
                }
            }
            const baseTotal = basePrice * diffDays;
            const total = baseTotal + eventIncrease;
            
            const crossedPriceEl = document.getElementById("co-crossed-price");
            if (crossedPriceEl) {
                crossedPriceEl.innerHTML = formatPrice(baseTotal);
            }
            
            const durationLabel = window._is12HourDriver 
                ? (diffDays === 1 ? '(12 Jam)' : `(${diffDays}x 12 Jam)`)
                : `(${diffDays} Hari)`;
            basePriceEl.innerHTML = formatPrice(total) + ` <span style="font-size:0.85rem;color:#64748b;font-weight:normal;">${durationLabel}</span>`;
        }
    }
};

window.checkDateOverlap = () => {
    const startDate = document.getElementById("co-start-date").value;
    const endDate = document.getElementById("co-end-date").value;
    const warningDiv = document.getElementById("dynamic-date-warning");
    const submitBtn = document.querySelector("#checkout-form button[type='submit']");

    if (!startDate || !endDate) {
        warningDiv.style.display = 'none';
        if (submitBtn) submitBtn.disabled = false;
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
        if (submitBtn) submitBtn.disabled = true;
    } else {
        warningDiv.style.display = 'none';
        if (submitBtn) submitBtn.disabled = false;

        if (window.updateRentalDisplayPrice) window.updateRentalDisplayPrice();
    }
};

window.updateTourPrice = (selectEl) => {
    const basePriceEl = document.getElementById("co-display-price");
    if (!basePriceEl) return;
    
    const basePrice = parseInt(basePriceEl.getAttribute("data-original-price") || basePriceEl.getAttribute("data-base-price") || 0);
    
    if (!basePriceEl.hasAttribute("data-original-price")) {
        basePriceEl.setAttribute("data-original-price", basePrice);
    }
    
    const carPrice = parseInt(selectEl.selectedOptions[0].getAttribute('data-price') || 0);
    const newTotal = basePrice + carPrice;
    
    basePriceEl.setAttribute("data-base-price", newTotal);
    basePriceEl.innerHTML = formatPrice(newTotal);
};

window.getCurrentLocation = (inputId, event) => {
    if (navigator.geolocation) {
        const btn = event.currentTarget;
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                document.getElementById(inputId).value = `https://maps.google.com/?q=${lat},${lon}`;
                btn.innerHTML = originalHtml;
            },
            (error) => {
                Swal.fire({ icon: 'error', title: 'Gagal', text: 'Tidak dapat mengambil lokasi. Pastikan izin lokasi (GPS) diaktifkan di browser/HP Anda.' });
                btn.innerHTML = originalHtml;
            }
        );
    } else {
        Swal.fire({ icon: 'error', title: 'Oops', text: 'Browser Anda tidak mendukung fitur lokasi.' });
    }
};

window.setPaymentType = (type) => {
    const dpLabel = document.getElementById('pt-dp-label');
    const fullLabel = document.getElementById('pt-full-label');
    const dpRadio = document.getElementById('pt-dp');
    const fullRadio = document.getElementById('pt-full');
    if (!dpLabel || !fullLabel) return;
    if (type === 'dp') {
        dpRadio.checked = true;
        dpLabel.style.border = '2px solid #f59e0b';
        dpLabel.style.background = '#fffbeb';
        fullLabel.style.border = '2px solid #e2e8f0';
        fullLabel.style.background = '#f0fdf4';
    } else {
        fullRadio.checked = true;
        fullLabel.style.border = '2px solid #22c55e';
        fullLabel.style.background = '#dcfce7';
        dpLabel.style.border = '2px solid #e2e8f0';
        dpLabel.style.background = '#fffbeb';
    }
};

window.processCheckout = async (itemName, price, method = 'web') => {
    if (method !== 'wa' && !window.checkAuthAndPrompt()) return;

    if (method !== 'wa') {
        const turnstileToken = window._checkoutTurnstileToken || document.querySelector('#checkout-modal [name="cf-turnstile-response"]')?.value;
        if (!turnstileToken) {
            const errMsg = document.getElementById('turnstile-error-msg');
            if (errMsg) errMsg.style.display = 'block';

            Swal.fire({
                icon: 'warning',
                title: 'Verifikasi Keamanan Diperlukan',
                text: 'Harap selesaikan verifikasi Cloudflare Turnstile sebelum melanjutkan pembayaran.',
                confirmButtonColor: '#22c55e',
                confirmButtonText: 'Selesaikan Verifikasi'
            });
            return;
        }
    }

    const name = document.getElementById("co-name").value;
    const phone = document.getElementById("co-phone").value;
    const emailInput = document.getElementById("co-email")?.value || '';
    const startDate = document.getElementById("co-start-date").value;
    const endDate = document.getElementById("co-end-date").value;
    const payment = document.getElementById("co-payment").value;
    const modalBody = document.getElementById("checkout-modal-body");

    let category = "other";
    const matchedItemForCat = window.globalItems ? window.globalItems.find(i => i.title === itemName) : null;
    if (matchedItemForCat && matchedItemForCat.category) {
        if (matchedItemForCat.category === 'car') category = 'mobil';
        else if (matchedItemForCat.category === 'motorcycle') category = 'motor';
        else if (matchedItemForCat.category === 'package') category = 'tour';
        else if (matchedItemForCat.category === 'airport') category = 'airport';
    }
    const nameLower = itemName.toLowerCase();
    if (category === "other") {
        if (nameLower.includes("airport") || nameLower.includes("jemput") || nameLower.includes("antar") || nameLower.includes("transfer")) category = "airport";
        else if (nameLower.includes("motor")) category = "motor";
        else if (nameLower.includes("mobil") || nameLower.includes("avanza") || nameLower.includes("innova") || nameLower.includes("hiace") || nameLower.includes("brio") || nameLower.includes("xpander") || nameLower.includes("alphard") || nameLower.includes("fortuner")) category = "mobil";
        else if (nameLower.includes("paket") || nameLower.includes("tour")) category = "tour";
    }

    const pickupLoc = document.getElementById("co-pickup-loc")?.value || "";
    const dropoffLoc = document.getElementById("co-dropoff-loc")?.value || "";
    const pickupTime = document.getElementById("co-pickup-time")?.value || "";
    const dropoffTime = document.getElementById("co-dropoff-time")?.value || "";
    const flightNum = document.getElementById("co-flight-num")?.value || "";
    const pax = document.getElementById("co-pax")?.value || "";
    const tourVehicle = document.getElementById("co-tour-vehicle")?.value || "";
    const notes = document.getElementById("co-notes")?.value || "";

    if (!startDate || !endDate) {
        Swal.fire({ icon: 'info', title: 'Pemberitahuan', text: "Mohon isi tanggal mulai dan selesai.", confirmButtonColor: '#22c55e' });
        return;
    }

    const selStart = new Date(startDate);
    const selEnd = new Date(endDate);
    if (selStart > selEnd) {
        Swal.fire({ icon: 'info', title: 'Pemberitahuan', text: "Tanggal selesai tidak boleh lebih awal dari tanggal mulai.", confirmButtonColor: '#22c55e' });
        return;
    }

    if (window.currentBookings && window.currentBookings.length > 0) {
        for (let b of window.currentBookings) {
            const bStart = new Date(b.startDate);
            const bEnd = new Date(b.endDate);
            if (selStart <= bEnd && selEnd >= bStart) {
                Swal.fire({ icon: 'info', title: 'Pemberitahuan', text: "Maaf, rentang tanggal tersebut sudah dipesan. Silakan pilih tanggal lain.", confirmButtonColor: '#22c55e' });
                return;
            }
        }
    }

    // Ambil email: prioritaskan dari input form, fallback dari akun login
    const userStr = localStorage.getItem('auth_user');
    let customerEmail = emailInput;
    if (!customerEmail && userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.email) customerEmail = user.email;
        } catch (e) { }
    }

    let finalPrice = price;
    if (category === 'tour') {
        const vehicleSelect = document.getElementById('co-tour-vehicle');
        if (vehicleSelect && vehicleSelect.selectedOptions.length > 0) {
            const carPrice = parseInt(vehicleSelect.selectedOptions[0].getAttribute('data-price') || 0);
            finalPrice += carPrice;
        }
    }

    const matchDays = itemName.match(/(\d+)\s*H/i);
    const isPackage = matchDays && parseInt(matchDays[1]) > 0;
    if (!isPackage && price > 0) {
        let diffDays = 1;
        const durationSelect = document.getElementById('co-duration-select');
        if (durationSelect) {
            if (durationSelect.value === 'custom') {
                const customInput = document.getElementById('co-duration-custom');
                diffDays = customInput && customInput.value ? parseInt(customInput.value) : 1;
            } else {
                diffDays = parseInt(durationSelect.value);
            }
        } else {
            diffDays = Math.ceil((selEnd - selStart) / (1000 * 60 * 60 * 24));
    }
        if (diffDays < 1) diffDays = 1;
        finalPrice = price * diffDays;
    }
    
    // Add event price increase to total finalPrice
    const evtSettings = window.globalEventSettings || { eventMode: false, eventPriceIncrease: 0 };
    const isEventActive = evtSettings.eventMode && evtSettings.eventPriceIncrease > 0;
    const isRentalItem = (category === 'motor' || category === 'mobil');
    const is12HourDriverOrder = category === 'mobil' && (nameLower.includes("12 jam") || nameLower.includes("include driver"));
    const isEventApplicable = isEventActive && isRentalItem && !is12HourDriverOrder;
    if (isEventApplicable && finalPrice > 0) {
        finalPrice += evtSettings.eventPriceIncrease;
    }

    const getWaText = (isManual, transactionId = null, promoInfoText = "") => {
        let waText = "";
        let paymentInfo = "Catatan: Booking dinyatakan terkonfirmasi setelah pembayaran booking fee diterima.\n💳 Pembayaran dilakukan melalui tautan Midtrans (QRIS/Virtual Account) yang tersedia di halaman riwayat pesanan Anda, atau sesuai instruksi Admin.";
        let introText = isManual ? "Saya telah melakukan Booking via Website dengan rincian:" : "Saya ingin melakukan pesanan (Booking) dengan rincian sebagai berikut:";

        if (category === 'motor') {
            waText = `Halo Admin Travel Lombok Airport,\n\n${introText}\n\nFORM BOOKING SEWA MOTOR\nTempat Pengambilan (lokasi gps/alamat): ${pickupLoc}\nTempat Pengembalian (lokasi gps/alamat): ${dropoffLoc}\nJam Pengambilan: ${pickupTime}\nJam Pengembalian: ${dropoffTime}\nNama: ${name}\nLayanan: ${itemName}\nTgl Mulai: ${startDate}\nTgl Selesai: ${endDate}\nNo HP/WA: ${phone}\nEmail: ${customerEmail || '-'}\n\nCatatan: Booking dinyatakan terkonfirmasi setelah pembayaran booking fee (DP Rp 50.000) dan Deposit (Rp 500.000) diterima.\n💳 Pembayaran dilakukan melalui tautan Midtrans (QRIS/Virtual Account) yang tersedia di halaman riwayat pesanan Anda.`;
        } else if (category === 'mobil') {
            const is12HourDriverWA = nameLower.includes("12 jam") || nameLower.includes("include driver");
            if (is12HourDriverWA) {
                const durStr = diffDays === 1 ? '12 Jam' : `${diffDays}x 12 Jam (${diffDays} Hari)`;
                waText = `Halo Admin Travel Lombok Airport,\n\n${introText}\n\nFORM BOOKING SEWA MOBIL (INCLUDE DRIVER 12 JAM)\nTanggal Pemakaian: ${startDate}${startDate !== endDate ? ` s/d ${endDate}` : ''}\nDurasi: ${durStr}\nLokasi Penjemputan: ${pickupLoc}\nLokasi Pengantaran: ${dropoffLoc}\nNama: ${name}\nLayanan: ${itemName}\nNo HP/WA: ${phone}\nEmail: ${customerEmail || '-'}\n\nCatatan: Booking dinyatakan terkonfirmasi setelah pembayaran booking fee (DP Rp 200.000) diterima (Bebas Deposit Jaminan Rp 0).\n👇 Pembayaran dilakukan melalui tautan Midtrans (QRIS/Virtual Account) yang tersedia di halaman riwayat pesanan Anda.`;
            } else {
                waText = `Halo Admin Travel Lombok Airport,\n\n${introText}\n\nFORM BOOKING SEWA MOBIL\nTanggal Pengambilan: ${startDate}\nTanggal Pengembalian: ${endDate}\nTempat Pengambilan (lokasi gps/alamat): ${pickupLoc}\nTempat Pengembalian (lokasi gps/alamat): ${dropoffLoc}\nJam Pengambilan: ${pickupTime}\nJam Pengembalian: ${dropoffTime}\nNama: ${name}\nLayanan: ${itemName}\nNo HP/WA: ${phone}\nEmail: ${customerEmail || '-'}\n\nCatatan: Booking dinyatakan terkonfirmasi setelah pembayaran booking fee (DP Rp 200.000) dan Deposit (Rp 1.000.000) diterima.\n👇 Pembayaran dilakukan melalui tautan Midtrans (QRIS/Virtual Account) yang tersedia di halaman riwayat pesanan Anda.`;
            }
        } else if (category === 'airport') {
            waText = `Halo Admin Travel Lombok Airport,\n\n${introText}\n\nFORM BOOKING AIRPORT TRANSFER\nNama: ${name}\nNomor WA: ${phone}\nEmail: ${customerEmail || '-'}\nLokasi penjemputan (gps lokasi/alamat): ${pickupLoc}\nAlamat Tujuan (gps lokasi/alamat): ${dropoffLoc}\nNomor penerbangan: ${flightNum}\nTanggal: ${startDate}\nJam penjemputan: ${pickupTime}\nJumlah penumpang: ${pax}\nCatatan: ${notes}\n\n${paymentInfo}`;
        } else if (category === 'tour') {
            waText = `Halo Admin Travel Lombok Airport,\n\n${introText}\n\nFORM BOOKING PRIVATE TOUR LOMBOK\nMohon isi data berikut untuk proses booking:\nLokasi Jemput (berdasarkan GPS/Alamat): ${pickupLoc}\nLokasi Drop Off: ${dropoffLoc}\nJam Penjemputan: ${pickupTime}\nNomor Penerbangan: ${flightNum}\nJumlah Penumpang: ${pax}\n\nPaket yang Dipilih: ${itemName}\nKendaraan: ${tourVehicle}\n\nSubtotal: ${finalPrice > 0 ? formatPrice(finalPrice) : 'Rp __________'}\nBiaya Layanan: Rp 6.500\nTotal Harga: ${finalPrice > 0 ? formatPrice(finalPrice + 6500) : 'Rp __________'}\nDP/Booking Fee: Rp 500.000\nSisa Pembayaran: ${finalPrice > 500000 ? formatPrice(finalPrice - 500000) : 'Rp __________'}\nCatatan/Request: ${notes || '-'}\nNama: ${name}\nTanggal: ${startDate}\nNo HP/WA: ${phone}\n\n${paymentInfo}`;
        } else {
            waText = `Halo Admin Travel Lombok Airport,\n\n${introText}\n\n*Detail Pesanan*\n- Nama: ${name}\n- Layanan: ${itemName}\n- Tgl Mulai: ${startDate}\n- Tgl Selesai: ${endDate}\n${isPackage ? '' : `- Durasi: ${Math.ceil((selEnd - selStart) / (1000 * 60 * 60 * 24)) || 1} Hari\n`}${finalPrice > 0 ? `- Subtotal: ${formatPrice(finalPrice)}\n- Biaya Layanan: Rp 6.500\n- Total Estimasi: ${formatPrice(finalPrice + 6500)}\n` : ''}- No HP/WA: ${phone}\n- Email: ${customerEmail || '-'}\n\nMohon instruksi selanjutnya. Terima kasih.`;
        }
        
        if (isManual && transactionId) {
            waText = waText.replace('FORM BOOKING', `ID Booking: ${transactionId}\n\nFORM BOOKING`).replace('*Detail Pesanan*', `*Detail Pesanan*\n- ID Booking: ${transactionId}`);
            if (promoInfoText) waText += promoInfoText;
        }

        return waText;
    };

    if (method === 'wa') {
        const text = getWaText(false);
        window.open(`https://wa.me/6289676963255?text=${encodeURIComponent(text)}`, "_blank");
        closeCheckoutModal();
        return;
    }

    const baseTotal = finalPrice; // Simpan total asli sebelum diskon dan DP
    
    // Terapkan diskon promo
    const promoCode = document.getElementById('co-promo-applied')?.value || '';
    const promoDiscount = Number(document.getElementById('co-promo-discount')?.value || 0);
    let promoInfo = '';
    
    if (promoCode && promoDiscount > 0) {
        finalPrice -= promoDiscount;
        if (finalPrice < 0) finalPrice = 0;
        promoInfo = `\n- Promo Digunakan: ${promoCode} (Diskon ${formatPrice(promoDiscount)})`;
    }

    const discountedTotal = finalPrice; // Total setelah diskon

    let dpAmount = 500000;
    let depositAmount = 0;
    if (category === 'motor') {
        dpAmount = 50000;
        depositAmount = 500000;
    } else if (category === 'mobil') {
        dpAmount = 200000;
        depositAmount = 1000000;
    } else if (category === 'tour') {
        dpAmount = 500000;
    }

    // Deposit tidak berlaku jika include driver/supir
    const nameLowerForDepositProcess = (itemName || '').toLowerCase();
    let isWithDriverProc = nameLowerForDepositProcess.includes("driver") || nameLowerForDepositProcess.includes("supir") || nameLowerForDepositProcess.includes("dengan supir");
    const matchedItemProc = window.globalItems ? window.globalItems.find(i => i.title === itemName) : null;
    if (matchedItemProc && matchedItemProc.driverOptions && matchedItemProc.driverOptions !== 'Tidak Include Driver') {
        isWithDriverProc = true;
    }
    if (isWithDriverProc) {
        depositAmount = 0;
    }

    // Cek apakah user memilih DP
    const isDp = baseTotal > dpAmount && document.getElementById('pt-dp')?.checked === true;
    let paymentAmount = discountedTotal;
    
    if (isDp) {
        paymentAmount = dpAmount;
        // Don't cap at discountedTotal for rentals because we will add deposit later
        if (category !== 'motor' && category !== 'mobil' && paymentAmount > discountedTotal) {
            paymentAmount = discountedTotal;
        }
    } else {
        // Biaya tambahan 3000 dihilangkan (sesuai permintaan)
        // paymentAmount += 3000;
    }

    // Tambahkan Biaya Layanan
    paymentAmount += 6500;

    paymentAmount += depositAmount; // Selalu tambahkan deposit ke pembayaran saat ini

    const bookingData = {
        itemName,
        customerName: name,
        phone,
        startDate,
        endDate,
        price: paymentAmount,
        isDp: isDp,
        fullPrice: discountedTotal,
        deposit: depositAmount || 0,
        dpAmount: isDp ? dpAmount : 0,
        customerEmail,
        promoCode: promoCode,
        promoDiscount: promoDiscount,
        turnstileToken: method !== 'wa' ? (window._checkoutTurnstileToken || document.querySelector('#checkout-modal [name="cf-turnstile-response"]')?.value || '') : '',
        details: {
            pickup: pickupLoc,
            dropoff: dropoffLoc,
            time: pickupTime || dropoffTime,
            pickupTime: pickupTime,
            dropoffTime: dropoffTime,
            pax: pax,
            flightNumber: flightNum,
            vehicle: tourVehicle,
            notes: notes,
            isEvent: isEventApplicable
        }
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

        const text = getWaText(true, transactionId, promoInfo);
        window.open(`https://wa.me/6289676963255?text=${encodeURIComponent(text)}`, "_blank");
        closeCheckoutModal();
        return;
    }

    // ===== Virtual Account Flow =====
    if (payment === "va") {
        const selectedBank = document.querySelector('input[name="va-bank"]:checked');
        if (!selectedBank) {
            Swal.fire({ icon: 'warning', title: 'Pilih Bank', text: 'Silakan pilih bank Virtual Account terlebih dahulu.', confirmButtonColor: '#0ea5e9' });
            return;
        }
        const bankCode = selectedBank.value;

        const qrisResult = document.getElementById("qris-result");
        const submitBtn = document.querySelector("#checkout-form button[type='submit']");
        if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> MEMPROSES...'; }

        qrisResult.innerHTML = `<div style="text-align:center;padding:20px;background:#f0f9ff;border-radius:12px;border:1px solid #bae6fd;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size:2rem;color:#0ea5e9;margin-bottom:10px;"></i>
            <p style="color:#0369a1;font-size:0.9rem;">Sedang membuat Virtual Account ${bankCode}...</p>
        </div>`;

        const pendingTxId = window.generateTicketId('ORD-');
        try {
            await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...bookingData, status: 'PENDING', transactionId: pendingTxId })
            });
        } catch (e) { console.error('Failed to save pending booking:', e); }

        try {
            const vaRes = await fetch(`${API_URL}/payment/va`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: paymentAmount, bank_code: bankCode, reference_id: pendingTxId })
            });
            const vaResult = await vaRes.json();

            if (vaResult.success) {
                const d = vaResult.data;

                // SIMPAN INFO PAYMENT KE FIREBASE
                try {
                    await fetch(`${API_URL}/bookings/by-txid/${pendingTxId}/payment-info`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            paymentMethod: 'va',
                            vaBank: d.vaBank,
                            vaNumber: d.vaNumber,
                            expiredAt: d.expiredAt,
                            expiredAtISO: d.expiredAtISO
                        })
                    });
                } catch(e) { console.error('Gagal simpan payment-info VA', e); }

                qrisResult.innerHTML = `
                    <div style="background:white;padding:20px;border-radius:15px;box-shadow:0 10px 25px rgba(0,0,0,0.05);text-align:center;border:2px dashed #0ea5e9;">
                        <h3 style="color:#0c4a6e;margin-bottom:5px;">Virtual Account ${d.vaBank}</h3>
                        <p style="color:#64748b;font-size:0.85rem;margin-bottom:15px;">Transfer tepat sesuai jumlah ke nomor VA berikut:</p>
                        <div style="background:#f0f9ff;border:2px solid #0ea5e9;border-radius:12px;padding:20px;margin-bottom:15px;">
                            <div style="font-size:0.8rem;color:#64748b;margin-bottom:5px;">Nomor Virtual Account</div>
                            <div style="font-size:clamp(1.1rem, 5vw, 1.5rem);font-weight:900;color:#0c4a6e;letter-spacing:1px;word-break:break-all;">${d.vaNumber || '-'}</div>
                            <button onclick="window.copyText('${d.vaNumber}', this, '<i class=\\'fa-solid fa-check\\'></i> Tersalin!', '<i class=\\'fa-regular fa-copy\\'></i> Salin Nomor', event)" 
                                style="margin-top:10px;padding:8px 20px;background:#0ea5e9;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.9rem;font-weight:bold;">
                                <i class="fa-regular fa-copy"></i> Salin Nomor
                            </button>
                        </div>
                        <h4 style="color:#0c4a6e;margin-bottom:5px;">${itemName}</h4>
                        <p style="font-size:1.4rem;font-weight:bold;color:#16a34a;margin-bottom:10px;">${d.totalFormatted}</p>
                        <div style="background:#fef9c3;color:#854d0e;padding:8px;border-radius:8px;font-size:0.85rem;display:inline-block;margin-bottom:15px;">
                            <i class="fa-regular fa-clock"></i> Batas Waktu: ${d.expiredAtISO ? new Date(d.expiredAtISO).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : d.expiredAt}
                        </div>
                        <div style="color:#0369a1;font-size:0.9rem;margin-bottom:15px;">
                            <i class="fa-solid fa-spinner fa-spin"></i> Sistem sedang menunggu pembayaran...
                        </div>
                        <div id="manual-check-msg" style="color: #ef4444; font-size: 0.85rem; margin-bottom: 10px; font-weight: bold;"></div>
                        <button type="button" class="btn btn-blue" style="width:100%;padding:10px;font-weight:bold;border-radius:8px;" onclick="forcePaymentSuccess('${d.transactionId}', this)">SAYA SUDAH BAYAR</button>
                        <div style="margin-top:12px;padding:10px;background:#fff8f1;border-radius:8px;border:1px solid #ffedd5;font-size:0.8rem;color:#d97706;">
                            <i class="fa-solid fa-circle-info"></i> Pastikan transfer dilakukan ke nomor VA yang benar dengan jumlah yang tepat.
                        </div>
                    </div>`;

                // Poll status VA
                const vaPollInterval = setInterval(async () => {
                    try {
                        const stRes = await fetch(`${API_URL}/payment/status/${d.transactionId}`);
                        const stData = await stRes.json();
                        if (stData.success && ['PAID','SUCCESS','SETTLEMENT','COMPLETED'].includes(stData.data.status?.toUpperCase())) {
                            clearInterval(vaPollInterval);
                            window.simulateQrisSuccess(false, d.transactionId);
                        } else if (stData.success && stData.data.status === 'EXPIRED') {
                            clearInterval(vaPollInterval);
                            qrisResult.innerHTML = `<div style="text-align:center;padding:20px;background:#fff1f2;border:1px solid #fda4af;border-radius:12px;">
                                <i class="fa-solid fa-circle-xmark" style="font-size:3rem;color:#ef4444;"></i>
                                <h3 style="color:#ef4444;">Virtual Account Kedaluwarsa</h3>
                                <p>Waktu pembayaran telah habis. Silakan buat pesanan ulang.</p>
                            </div>`;
                        }
                    } catch(e) { console.error(e); }
                }, 5000);
                window.activePollInterval = vaPollInterval;

            } else {
                qrisResult.innerHTML = `<div class="text-center text-danger p-4" style="background:#fff1f2;border-radius:12px;margin-top:20px;">Gagal membuat Virtual Account. ${vaResult.error || ''} Silakan coba lagi.</div>`;
                if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'COBA LAGI'; }
            }
        } catch(e) {
            qrisResult.innerHTML = `<div class="text-center text-danger p-4" style="background:#fff1f2;border-radius:12px;margin-top:20px;">Koneksi error. Silakan coba lagi.</div>`;
            if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'COBA LAGI'; }
        }
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

    // Simpan booking PENDING ke DB SEBELUM QRIS dibuat, agar selalu tercatat di admin
    const pendingTxId = window.generateTicketId('ORD-');
    window._pendingQrisTxId = pendingTxId;
    try {
        await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...bookingData, status: 'PENDING', transactionId: pendingTxId })
        });
    } catch (e) { console.error('Failed to save pending booking:', e); }

    try {
        const qrisRes = await fetch(`${API_URL}/payment/qris`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: paymentAmount,          // gunakan paymentAmount (sudah diperhitungkan DP/promo)
                reference_id: pendingTxId       // hubungkan dengan booking Firebase
            })
        });
        const result = await qrisRes.json();

        if (result.success) {
            const data = result.data;

            // SIMPAN INFO PAYMENT KE FIREBASE
            try {
                await fetch(`${API_URL}/bookings/by-txid/${pendingTxId}/payment-info`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentMethod: 'qris',
                        qrCodeSvg: data.qrCodeSvg,
                        paymentUrl: data.payUrl,
                        expiredAt: data.expiredAt,
                        expiredAtISO: data.expiredAtISO,
                        rawQrisString: data.raw?.qr_string
                    })
                });
            } catch(e) { console.error('Gagal simpan payment-info QRIS', e); }

            qrisResult.innerHTML = `
                <div style="background: #f8fafc; border-radius: 20px; overflow: hidden; font-family: 'Inter', sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.02);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, var(--primary-blue), #1e3a8a); padding: 30px 20px; text-align: center;">
                        <h3 style="color: white; font-size: 1.6rem; font-weight: 800; margin: 0 0 5px;">Scan QRIS</h3>
                        <p style="color: rgba(255,255,255,0.85); font-size: 0.95rem; margin: 0;">Buka aplikasi M-Banking / E-Wallet Anda</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 30px 25px 25px; text-align: center;">
                        <div style="background: white; padding: 15px; border-radius: 16px; display: inline-block; box-shadow: 0 10px 25px rgba(0,0,0,0.08); margin-bottom: 20px;">
                            ${data.qrCodeSvg}
                        </div>
                        
                        <h4 style="color: #64748b; font-size: 1rem; font-weight: 600; margin: 0 0 5px;">${itemName}</h4>
                        <p style="font-size: 2.2rem; font-weight: 900; color: var(--primary-green); margin: 0 0 15px; letter-spacing: -0.5px;">${data.totalFormatted}</p>
                        
                        <div style="background: #fff1f2; color: #e11d48; padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; display: inline-block; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(225, 29, 72, 0.15);">
                            <i class="fa-regular fa-clock" style="margin-right: 5px;"></i> Batas Waktu: ${data.expiredAtISO ? new Date(data.expiredAtISO).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : data.expiredAt}
                        </div>
                        
                        <div style="background: rgba(59, 130, 246, 0.05); color: var(--primary-blue); padding: 12px; border-radius: 12px; font-size: 0.95rem; font-weight: 600; margin-bottom: 20px;">
                            <i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Sistem sedang menunggu pembayaran...
                        </div>
                        
                        <div id="manual-check-msg" style="color: #ef4444; font-size: 0.85rem; margin-bottom: 10px; font-weight: bold;"></div>
                        
                        <button type="button" style="background:linear-gradient(135deg, var(--primary-blue), #1e3a8a); color:white; border:none; padding:14px; font-weight:bold; border-radius:12px; width:100%; cursor:pointer; font-size:1rem; box-shadow:0 6px 15px rgba(12,74,110,0.25); transition:all 0.3s;" onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='translateY(0)';" onclick="forcePaymentSuccess('${data.transactionId}', this)">
                            SAYA SUDAH BAYAR
                        </button>
                        
                        <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; text-align: left;">
                            <p style="font-size: 0.85rem; color: #475569; margin-bottom: 12px; line-height: 1.5;">
                                <i class="fa-solid fa-circle-info" style="color:var(--primary-blue); margin-right: 5px;"></i> Jika konfirmasi otomatis lambat, pantau pesanan Anda melalui <b>Riwayat Transaksi</b>.
                            </p>
                            <a href="https://travellombokairport.com/riwayat" style="display: block; width: 100%; padding: 10px; font-size: 0.9rem; font-weight: bold; text-decoration: none; border-radius: 10px; text-align: center; color: var(--primary-blue); background: #f1f5f9; transition: all 0.2s;" onmouseover="this.style.background='var(--primary-blue)'; this.style.color='white'" onmouseout="this.style.background='#f1f5f9'; this.style.color='var(--primary-blue)'">Buka Riwayat Transaksi</a>
                        </div>
                    </div>
                </div>
            `;


            const pollInterval = setInterval(async () => {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 6000);
                try {
                    const statusRes = await fetch(`${API_URL}/payment/status/${data.transactionId}`, { signal: controller.signal });
                    clearTimeout(timeoutId);
                    const statusData = await statusRes.json();

                    if (statusData.success && ['PAID', 'SUCCESS', 'SETTLEMENT', 'COMPLETED'].includes(statusData.data.status?.toUpperCase())) {
                        clearInterval(pollInterval);
                        window.activePollInterval = null;
                        window.simulateQrisSuccess(false, data.transactionId);
                    } else if (statusData.success && statusData.data.status === 'EXPIRED') {
                        clearInterval(pollInterval);
                        window.activePollInterval = null;
                        qrisResult.innerHTML = `
                            <div style="text-align: center; padding: 20px; background: #fff1f2; border: 1px solid #fda4af; border-radius: 12px; margin-top: 20px;">
                                <i class="fa-solid fa-circle-xmark" style="font-size: 3rem; color: #ef4444; margin-bottom: 15px;"></i>
                                <h3 style="color: #ef4444;">Pembayaran Kedaluwarsa</h3>
                                <p style="color: var(--text-dark); font-size: 0.9rem;">Waktu pembayaran telah habis. Silakan tutup dan buat pesanan ulang.</p>
                            </div>
                        `;
                    }
                } catch (e) {
                    clearTimeout(timeoutId);
                    if (e.name !== 'AbortError') console.error(e);
                }
            }, 2000);
            window.activePollInterval = pollInterval;

        } else {
            // Tampilkan error asli dari Borderpay (details) untuk debugging
            const errMsg = result.details || result.error || result.message || 'Tidak ada detail error';
            console.error('QRIS API Error:', result);
            qrisResult.innerHTML = `<div class="text-center text-danger p-4" style="background: #fff1f2; border-radius: 12px; margin-top: 20px;">
                <b>Gagal memuat kode QRIS.</b><br>
                <small style="color:#64748b;">${result.error || ''} ${errMsg !== result.error ? '— ' + errMsg : ''}</small><br><br>
                Silakan coba lagi.
            </div>`;
            if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'COBA LAGI'; }
        }
    } catch (e) {
        console.error('QRIS fetch error:', e);
        qrisResult.innerHTML = `<div class="text-center text-danger p-4" style="background: #fff1f2; border-radius: 12px; margin-top: 20px;">Koneksi error: ${e.message}. Silakan coba lagi.</div>`;
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'COBA LAGI'; }
    }
};

window.simulateQrisSuccess = async (isBookingOnly, transactionId) => {
    const modalBody = document.getElementById("checkout-modal-body");
    const idPrefix = isBookingOnly ? "BKG-" : "ORD-";
    const id = transactionId || window.generateTicketId(idPrefix);

    if (window.activePollInterval) clearInterval(window.activePollInterval);

    // Checkout done — clear saved state and remove refresh warning
    sessionStorage.removeItem('checkoutState');
    window._checkoutActive = false;
    window.removeEventListener('beforeunload', window._checkoutBeforeUnload);

    // Update booking yang sudah PENDING menjadi PAID
    if (!isBookingOnly && window.currentCheckoutData) {
        const txIdToUpdate = window._pendingQrisTxId || id;
        // Update status booking ke PAID via endpoint by-txid
        fetch(`${API_URL}/bookings/by-txid/${txIdToUpdate}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'PAID' })
        }).catch(e => console.error('Failed to update QRIS booking to PAID:', e));
    }

    modalBody.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            <i class="fa-solid fa-circle-check" style="font-size: 5rem; color: var(--primary-green); margin-bottom: 20px;"></i>
            <h2 style="color: var(--text-dark); margin-bottom: 10px;">${isBookingOnly ? "Booking Berhasil!" : "Pembayaran Berhasil!"}</h2>
            <p style="color: #64748b; margin-bottom: 20px;">Terima kasih, pesanan Anda telah kami terima.</p>
            
            <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 20px; border-radius: 12px; border: 1px dashed #cbd5e1; margin-bottom: 25px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                <p style="font-size: 0.85rem; font-weight: 600; color: #64748b; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Nomor Referensi Anda</p>
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; background: white; padding: 12px 16px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                    <span style="color: var(--primary-blue); font-family: 'Courier New', monospace; font-size: 1.1rem; font-weight: 800; word-break: break-all; text-align: left; flex: 1; letter-spacing: 0.5px;">${id}</span>
                    <button onclick="navigator.clipboard.writeText('${id}'); const icon = this.querySelector('i'); icon.className='fa-solid fa-check text-green'; Swal.fire({icon: 'success', title: 'Tersalin', toast: true, position: 'top', showConfirmButton: false, timer: 2000}); setTimeout(()=>icon.className='fa-solid fa-copy', 2000)" style="flex-shrink: 0; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; cursor: pointer; color: var(--primary-blue); transition: all 0.2s; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px;" title="Salin / Copy" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'">
                        <i class="fa-solid fa-copy" style="font-size: 1.15rem;"></i>
                    </button>
                </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 10px;">
                <button onclick="downloadPdfInvoice('${id}')" class="btn btn-green" style="width: 100%; padding: 14px; border-radius: 10px; font-size: 1rem; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);"><i class="fa-solid fa-file-pdf"></i> Unduh e-Tiket / Invoice</button>
                <button onclick="closeCheckoutModal()" class="btn btn-outline" style="width: 100%; padding: 14px; border-radius: 10px; font-size: 1rem; border-color: #cbd5e1; color: #475569;">TUTUP</button>
            </div>
            
        </div>
    `;
};

window.downloadPdfInvoice = async (id) => {
    try {
        const response = await fetch(`${API_URL}/bookings/check/${id}?_t=${new Date().getTime()}`, { cache: 'no-store' });
        if (response.ok) {
            const data = await response.json();
            if (typeof window.generateEtiketPDF === 'function') {
                window.generateEtiketPDF(data);
            }
        } else {
            alert('Gagal mengambil detail lengkap transaksi untuk PDF.');
        }
    } catch (e) {
        console.error('PDF generation error:', e);
        alert('Terjadi kesalahan saat mengunduh PDF.');
    }
};

// Load dynamic stats
const loadStats = async () => {
    try {
        const res = await fetch(`${API_URL}/stats?_t=${new Date().getTime()}`, { cache: 'no-store' });
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

// Reviews Logic
window.allReviewsData = [];
window.showingAllReviews = false;

window.renderReviewsList = () => {
    const container = document.getElementById('reviews-container');
    if (!container) return;

    // Hanya tampilkan ulasan web utama (tanpa itemId)
    const generalReviews = (window.allReviewsData || []).filter(r => !r.itemId);

    if (generalReviews.length === 0) {
        container.innerHTML = '<p class="text-center w-100" style="grid-column: 1/-1;">Belum ada ulasan. Jadilah yang pertama memberikan ulasan!</p>';
        return;
    }

    const toShow = window.showingAllReviews ? generalReviews : generalReviews.slice(0, 3);

    let html = '';
    toShow.forEach(r => {
        let stars = '';
        for (let i = 0; i < 5; i++) {
            if (i < r.rating) stars += '<i class="fa-solid fa-star" style="color: #f59e0b;"></i>';
            else stars += '<i class="fa-regular fa-star" style="color: #cbd5e1;"></i>';
        }

        let dateStr = '';
        if (r.createdAt) {
            const d = new Date(r.createdAt);
            dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        let initial = r.name ? r.name.charAt(0).toUpperCase() : 'U';
        let avatarHtml = '';
        if (r.photoUrl) {
            avatarHtml = `<img src="${r.photoUrl}" alt="${r.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;">`;
        } else {
            avatarHtml = initial;
        }
        html += `
        <div class="review-card" data-aos="fade-up">
            <div class="review-content">
                <div style="display: flex; gap: 4px; margin-bottom: 12px; font-size: 0.9rem;">${stars}</div>
                <p class="review-text">"${r.comment}"</p>
            </div>
            <div class="review-author">
                <div class="review-author-avatar" style="${r.photoUrl ? 'padding: 0; overflow: hidden;' : ''}">${avatarHtml}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 800; color: var(--primary-blue); font-size: 1.05rem; letter-spacing: -0.3px;">${r.name}</div>
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 2px;">${dateStr}</div>
                </div>
            </div>
        </div>`;
    });

    // Add "See all" button if there are more than 3 reviews
    if (generalReviews.length > 3) {
        html += `
        <div class="text-center w-100 mt-3" style="grid-column: 1/-1;">
            <button onclick="window.toggleAllReviews()" class="btn btn-outline" style="border: 2px solid var(--primary-blue); color: var(--primary-blue); padding: 8px 24px; border-radius: 20px; font-weight: 600;">
                ${window.showingAllReviews ? 'Sembunyikan' : `Lihat Semua Ulasan (${generalReviews.length})`}
            </button>
        </div>
        `;
    }

    container.innerHTML = html;
};

window.toggleAllReviews = () => {
    window.showingAllReviews = !window.showingAllReviews;
    window.renderReviewsList();
};

window.loadReviews = async () => {
    const container = document.getElementById('reviews-container');
    if (!container) return;
    try {
        const res = await fetch(`${API_URL}/reviews`);
        if (!res.ok) throw new Error('Failed to fetch');
        window.allReviewsData = await res.json();
        window.renderReviewsList();
    } catch (e) {
        console.error("Failed to load reviews:", e);
        container.innerHTML = '<p class="text-center w-100 text-danger" style="grid-column: 1/-1;">Gagal memuat ulasan.</p>';
    }
};

window.submitReview = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-review');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';

    const name = document.getElementById('review-name').value;
    const comment = document.getElementById('review-comment').value;
    const ratingObj = document.querySelector('input[name="rating"]:checked');
    const rating = ratingObj ? ratingObj.value : 5; // default 5

    // Ambil foto profil dari user yang login
    const authUser = JSON.parse(localStorage.getItem('auth_user') || 'null');
    const photoUrl = authUser && authUser.photoUrl ? authUser.photoUrl : null;

    try {
        const res = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, rating, comment, photoUrl })
        });

        if (!res.ok) throw new Error('Failed to submit review');

        Swal.fire({
            icon: 'success',
            title: 'Terima Kasih!',
            text: 'Ulasan Anda berhasil dikirim.',
            confirmButtonColor: '#22c55e'
        });

        document.getElementById('review-form').reset();
        document.getElementById('review-modal').classList.remove('active');
        loadReviews(); // reload
    } catch (error) {
        console.error("Submit review error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: 'Gagal mengirim ulasan. Silakan coba lagi.',
            confirmButtonColor: '#22c55e'
        });
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Kirim Ulasan';
    }
};

document.addEventListener("DOMContentLoaded", () => {
    window.checkAuthUI();
    loadStats();
    loadReviews();

    // Multi-Currency Logic
    window.changeCurrency = (curr) => {
        localStorage.setItem('app_currency', curr);
        window.location.reload();
    };

    const navActions = document.querySelector('.nav-actions');
    const langSwitcher = document.querySelector('.lang-switcher');
    
    if (navActions && langSwitcher) {
        const curr = localStorage.getItem('app_currency') || 'IDR';
        const currencyHtml = `
        <div class="lang-switcher" id="curr-switcher" style="margin-right: 5px;">
           <button class="lang-btn" id="curr-btn" onclick="document.getElementById('curr-menu').classList.toggle('active')"><i class="fa-solid fa-coins"></i> ${curr} <i class="fa-solid fa-chevron-down" style="font-size: 0.7em; margin-left: 2px;"></i></button>
           <ul class="lang-menu" id="curr-menu">
             <li><a href="#" onclick="event.preventDefault(); window.changeCurrency('IDR')">🇮🇩 IDR</a></li>
             <li><a href="#" onclick="event.preventDefault(); window.changeCurrency('USD')">🇺🇸 USD</a></li>
             <li><a href="#" onclick="event.preventDefault(); window.changeCurrency('AUD')">🇦🇺 AUD</a></li>
             <li><a href="#" onclick="event.preventDefault(); window.changeCurrency('EUR')">🇪🇺 EUR</a></li>
             <li><a href="#" onclick="event.preventDefault(); window.changeCurrency('SGD')">🇸🇬 SGD</a></li>
             <li><a href="#" onclick="event.preventDefault(); window.changeCurrency('MYR')">🇲🇾 MYR</a></li>
             <li><a href="#" onclick="event.preventDefault(); window.changeCurrency('GBP')">🇬🇧 GBP</a></li>
             <li><a href="#" onclick="event.preventDefault(); window.changeCurrency('CNY')">🇨🇳 CNY</a></li>
             <li><a href="#" onclick="event.preventDefault(); window.changeCurrency('JPY')">🇯🇵 JPY</a></li>
           </ul>
        </div>
        `;
        langSwitcher.insertAdjacentHTML('beforebegin', currencyHtml);

        // Fix the original language switcher's onclick so it doesn't break due to multiple .lang-menu elements
        const langBtn = langSwitcher.querySelector('.lang-btn');
        if (langBtn) {
            langBtn.removeAttribute('onclick');
            langBtn.addEventListener('click', (e) => {
                const menu = langSwitcher.querySelector('.lang-menu');
                if (menu) menu.classList.toggle('active');
            });
        }

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#curr-switcher')) {
                const currMenu = document.getElementById('curr-menu');
                if (currMenu && currMenu.classList.contains('active')) {
                    currMenu.classList.remove('active');
                }
            }
            if (!e.target.closest('.lang-switcher:not(#curr-switcher)')) {
                const langMenu = langSwitcher.querySelector('.lang-menu');
                if (langMenu && langMenu.classList.contains('active')) {
                    langMenu.classList.remove('active');
                }
            }
        });
    }

    // ── Restore checkout modal if user accidentally refreshed the page ──
    const savedCheckout = sessionStorage.getItem('checkoutState');
    if (savedCheckout && (window.location.pathname === '/' || window.location.pathname === '/index.html')) {
        try {
            const state = JSON.parse(savedCheckout);
            if (state.itemName !== undefined && state.price !== undefined) {
                // Re-open modal, then restore form values after render
                openCheckoutModal(state.itemName, state.price).then(() => {
                    if (state.name) { const el = document.getElementById('co-name'); if (el) el.value = state.name; }
                    if (state.phone) { const el = document.getElementById('co-phone'); if (el) el.value = state.phone; }
                    if (state.startDate) { const el = document.getElementById('co-start-date'); if (el) el.value = state.startDate; }
                    if (state.endDate) { const el = document.getElementById('co-end-date'); if (el) el.value = state.endDate; }
                    if (state.payment) { const el = document.getElementById('co-payment'); if (el) { el.value = state.payment; el.dispatchEvent(new Event('change')); } }
                    // Re-run overlap check with restored dates
                    if (window.checkDateOverlap) window.checkDateOverlap();
                }).catch(() => sessionStorage.removeItem('checkoutState'));
            }
        } catch (e) { sessionStorage.removeItem('checkoutState'); }
    }
});



// trigger new build

// ── Auth Handling Logic ──
window._authMode = 'login';
window.openAuthModal = (mode) => {
    const finalMode = mode || window._authMode || 'login';

    // Remember where the user was trying to go (so they can come back)
    sessionStorage.setItem('redirect_after_auth', window.location.href);

    // Redirect to dedicated auth files
    if (finalMode === 'register') {
        window.location.href = '/register.html';
    } else {
        window.location.href = '/login.html';
    }
};
window.closeAuthModal = () => {
    // No-op for backwards compatibility
};
window.toggleAuthMode = () => {
    window.openAuthModal(window._authMode === 'login' ? 'register' : 'login');
};

window.checkAuthUI = () => {
    const token = localStorage.getItem('auth_token');
    const user = JSON.parse(localStorage.getItem('auth_user') || 'null');

    const authContainer = document.getElementById('footer-auth-container');
    const userContainer = document.getElementById('footer-user-container');
    const userNameDisplay = document.getElementById('footer-user-name');
    const userAvatarDisplay = document.getElementById('footer-user-avatar'); // Make sure to add id="footer-user-avatar" to the avatar wrapper in index.html if not present

    if (authContainer && userContainer) {
        if (token && user) {
            authContainer.style.display = 'none';
            userContainer.style.display = 'flex';
            if (userNameDisplay) userNameDisplay.innerText = user.name || user.email.split('@')[0] || 'Pengguna';
            
            // Check for avatar placeholder in index.html
            const avatarContainer = userContainer.querySelector('div[style*="width: 40px"]');
            if (avatarContainer) {
                if (user.photoUrl) {
                    avatarContainer.innerHTML = `<img src="${user.photoUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" alt="Avatar">`;
                } else {
                    avatarContainer.innerHTML = `<i class="fa-solid fa-user"></i>`;
                }
            }
            // Cek untuk notifikasi pending
            const footerNotifBadge = document.getElementById('footer-notif-badge');
            const footerProfileBadge = document.getElementById('footer-profile-badge');
            if (footerNotifBadge || footerProfileBadge) {
                fetch(`${API_URL}/bookings/my-history`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    if (data && Array.isArray(data)) {
                        const pendingCount = data.filter(item => {
                            if (item.status !== 'PENDING') return false;
                            const created = item.createdAt ? new Date(item.createdAt).getTime() : 0;
                            const isExpired = !isNaN(created) && (Date.now() - created) > 60 * 60 * 1000;
                            return !isExpired;
                        }).length;
                        
                        if (pendingCount > 0) {
                            if (footerNotifBadge) {
                                footerNotifBadge.innerText = pendingCount;
                                footerNotifBadge.style.display = 'flex';
                            }
                            if (footerProfileBadge) {
                                footerProfileBadge.innerText = pendingCount;
                                footerProfileBadge.style.display = 'flex';
                            }
                        } else {
                            if (footerNotifBadge) footerNotifBadge.style.display = 'none';
                            if (footerProfileBadge) footerProfileBadge.style.display = 'none';
                        }
                    }
                })
                .catch(e => console.error('Error fetching notif:', e));
            }
        } else {
            authContainer.style.display = 'flex';
            userContainer.style.display = 'none';
        }
    }
};

window.logoutUser = () => {
    Swal.fire({
        title: 'Konfirmasi',
        text: "Apakah Anda yakin ingin keluar?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Logout',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#ef4444'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            window.checkAuthUI();
            Swal.fire({ icon: 'success', title: 'Berhasil Logout', timer: 1500, showConfirmButton: false });
        }
    });
};

window.showRiwayatTransaksi = async (isPage = false) => {
    // Jika tidak dari page riwayat.html, redirect ke sana
    if (!isPage && window.location.pathname !== '/riwayat.html') {
        window.location.href = '/riwayat.html';
        return;
    }

    const container = document.getElementById('riwayat-page-container');
    const token = localStorage.getItem('auth_token');

    if (!container) return;

    if (!token) {
        container.innerHTML = `
            <div style="text-align:center; padding:60px 20px; color:#64748b; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                <i class="fa-solid fa-lock" style="font-size:3.5rem; margin-bottom:15px; display:block; color:#94a3b8;"></i>
                <h3 style="color: #1e293b; margin-bottom: 10px;">Akses Ditolak</h3>
                <p style="font-size: 1rem; margin-bottom: 20px;">Silakan login terlebih dahulu untuk melihat riwayat transaksi Anda.</p>
                <button onclick="window.openAuthModal();" style="background:linear-gradient(135deg, var(--primary-blue), #1e40af); color:white; border:none; padding:12px 25px; border-radius:10px; font-weight:bold; cursor:pointer; font-size: 1rem; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Login Sekarang</button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="text-align:center; padding:60px 20px; color:#64748b; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <i class="fa-solid fa-spinner fa-spin" style="font-size:2.5rem; margin-bottom:15px; display:block; color:#3b82f6;"></i>
            <p style="font-size: 1rem;">Sedang mengambil data riwayat transaksi Anda...</p>
        </div>
    `;

    try {
        const response = await fetch(`${API_URL}/bookings/my-history`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // Token kadaluarsa / invalid, paksa logout dan tampilkan prompt login
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                window.checkAuthUI();
                return window.showRiwayatTransaksi(isPage);
            }
            throw new Error(data.error || data.message || 'Gagal memuat riwayat');
        }

        if (data.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:60px 20px; color:#64748b; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                    <i class="fa-solid fa-box-open" style="font-size:4rem; margin-bottom:20px; display:block; color:#cbd5e1;"></i>
                    <h3 style="color:#1e293b; margin-bottom:10px; font-weight:700;">Belum Ada Transaksi</h3>
                    <p style="font-size:1rem; margin-bottom: 25px;">Anda belum pernah melakukan pemesanan apapun.</p>
                    <a href="/#packages" class="btn btn-green" style="padding: 12px 25px; border-radius: 10px; font-weight: bold; text-decoration: none;">Ayo Pesan Sekarang!</a>
                </div>
            `;
            return;
        }

        let html = `
        <div style="background: white; padding: 25px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
                <h3 style="color: #1e293b; margin: 0; font-size: 1.2rem;"><i class="fa-solid fa-list-check" style="color: var(--primary-blue); margin-right: 8px;"></i> Daftar Transaksi Anda</h3>
                <p style="color: #64748b; margin: 5px 0 0 0; font-size: 0.9rem;">Menampilkan ${data.length} transaksi terakhir.</p>
            </div>
            <div style="display:flex; flex-direction:column; gap:20px;">
        `;
        window.copyTxId = (btn, id, event) => {
            window.copyText(id, btn, '<i class="fa-solid fa-check"></i>', '<i class="fa-regular fa-copy"></i>', event);
        };

        window.resumePayment = async (transactionId, itemName) => {
            Swal.fire({
                title: 'Memuat Pembayaran...',
                html: 'Silakan tunggu sebentar.',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });
            try {
                let raw = {};
                let method = '';
                let amountFormatted = '-';
                let expiredAt = '-';
                
                // Coba ambil dari server Borderpay dulu
                try {
                    const res = await fetch(`${API_URL}/payment/status/${transactionId}`);
                    const result = await res.json();
                    if (result.success && result.data && result.data.raw) {
                        raw = result.data.raw;
                        method = (result.data.method || raw.method || '').toLowerCase();
                        const parsedPrice = parseInt(raw.amount || '0');
                        if (parsedPrice > 0) {
                            amountFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parsedPrice);
                        }
                        if (raw.expires_at) {
                            expiredAt = new Date(raw.expires_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                        }
                    }
                } catch (e) {
                    console.error('Gagal fetch dari borderpay API:', e);
                }

                // Fallback: Jika method kosong (karena error network atau Borderpay bermasalah),
                // kita ambil langsung dari database kita yang tersimpan di window._lastBookingData
                if (!method && window._lastBookingData) {
                    method = (window._lastBookingData.paymentMethod || '').toLowerCase();
                    const parsedPrice = parseInt((window._lastBookingData.itemPrice || '').toString().replace(/\\D/g, ''));
                    if (!isNaN(parsedPrice) && parsedPrice > 0) {
                        amountFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parsedPrice);
                    }
                    if (window._lastBookingData.expiredAtISO) {
                        expiredAt = new Date(window._lastBookingData.expiredAtISO).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                    } else if (window._lastBookingData.expiredAt) {
                        expiredAt = window._lastBookingData.expiredAt;
                    }
                }

                if (method === 'qris' && (raw.qr_string || window._lastBookingData?.rawQrisString)) {
                    // --- Cek apakah QRIS sudah expired sebelum ditampilkan ---
                    // Prioritas 1: gunakan raw.expires_at dari Borderpay live (format ISO, akurat)
                    // Prioritas 2: hitung dari createdAt + 1 jam jika tidak ada data live
                    let qrisExpired = false;

                    if (raw.expires_at) {
                        // Format ISO dari Borderpay - bisa langsung di-parse
                        qrisExpired = Date.now() > new Date(raw.expires_at).getTime();
                    } else if (window._lastBookingData?.createdAt) {
                        // Fallback: createdAt + 1 jam (standar QRIS)
                        const created = new Date(window._lastBookingData.createdAt).getTime();
                        qrisExpired = !isNaN(created) && (Date.now() - created) > 60 * 60 * 1000;
                    }

                    if (qrisExpired) {
                        // QRIS sudah expired - tandai KADALUARSA & tampilkan pesan
                        try {
                            await fetch(`${API_URL}/bookings/by-txid/${transactionId}/status`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'KADALUARSA' })
                            });
                        } catch(e) {}
                        Swal.fire({
                            icon: 'warning',
                            title: 'Pembayaran Kedaluwarsa',
                            html: `<p style="color:#475569;">Batas waktu pembayaran QRIS sudah <b>terlewat</b>. Kode ini tidak dapat digunakan lagi.</p><p style="color:#64748b;font-size:0.9rem;margin-top:10px;">Silakan buat pesanan baru untuk melanjutkan.</p>`,
                            confirmButtonText: 'Buat Pesanan Baru',
                            confirmButtonColor: 'var(--primary-blue)',
                            showCancelButton: true,
                            cancelButtonText: 'Tutup'
                        }).then(res => {
                            if (res.isConfirmed) window.location.href = '/#layanan';
                            else setTimeout(() => window.loadTransactionHistory?.(), 500);
                        });
                        return;
                    }

                    const qrString = raw.qr_string || window._lastBookingData.rawQrisString;
                    const encoded = encodeURIComponent(qrString);
                    const qrCodeSvg = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encoded}" alt="QRIS" style="width:220px;height:220px;border-radius:8px;" />`;
                    Swal.fire({
                        showCloseButton: false,
                        showConfirmButton: false,
                        width: '500px',
                        padding: '0',
                        html: `
                            <div style="background: #f8fafc; border-radius: 20px; overflow: hidden; font-family: 'Inter', sans-serif; text-align: center;">
                                <div style="background: linear-gradient(135deg, var(--primary-blue), #1e3a8a); padding: 30px 20px; text-align: center; position: relative;">
                                    <button onclick="Swal.close()" style="position: absolute; top: 15px; left: 15px; background: rgba(255,255,255,0.2); border: none; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; z-index: 10;" onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='scale(1.1)';" onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='scale(1)';"><i class="fa-solid fa-chevron-left" style="margin-right:2px;"></i></button>
                                    <h3 style="color: white; font-size: 1.6rem; font-weight: 800; margin: 0 0 5px;">Scan QRIS</h3>
                                    <p style="color: rgba(255,255,255,0.85); font-size: 0.95rem; margin: 0;">Lanjutkan pembayaran Anda.</p>
                                </div>
                                <div style="padding: 30px 25px 25px;">
                                    <div style="background: white; padding: 15px; border-radius: 16px; display: inline-block; box-shadow: 0 10px 25px rgba(0,0,0,0.08); margin-bottom: 20px;">
                                        ${qrCodeSvg}
                                    </div>
                                    <h4 style="color: #64748b; font-size: 1rem; font-weight: 600; margin: 0 0 5px;">${itemName}</h4>
                                    <p style="font-size: 2.2rem; font-weight: 900; color: var(--primary-green); margin: 0 0 15px; letter-spacing: -0.5px;">${amountFormatted}</p>
                                    <div style="background: #fff1f2; color: #e11d48; padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; display: inline-block; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(225, 29, 72, 0.15);">
                                        <i class="fa-regular fa-clock" style="margin-right: 5px;"></i> Batas Waktu: ${expiredAt}
                                    </div>
                                    <div style="background: rgba(59, 130, 246, 0.05); color: var(--primary-blue); padding: 12px; border-radius: 12px; font-size: 0.95rem; font-weight: 600;">
                                        <i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Sistem menunggu pembayaran...
                                    </div>
                                </div>
                            </div>
                        `
                    });
                    
                    // Start polling
                    if (window.activePollInterval) clearInterval(window.activePollInterval);
                    window.activePollInterval = setInterval(async () => {
                        try {
                            const stRes = await fetch(`${API_URL}/payment/status/${transactionId}`);
                            const stData = await stRes.json();
                            if (stData.success && ['PAID','SUCCESS','SETTLEMENT','COMPLETED'].includes(stData.data.status?.toUpperCase())) {
                                clearInterval(window.activePollInterval);
                                window.simulateQrisSuccess(false, transactionId);
                            }
                        } catch(e) {}
                    }, 5000);

                } else if (method === 'va' && (raw.va_number || window._lastBookingData?.vaNumber)) {
                    const vaBank = raw.bank_code || window._lastBookingData.vaBank || '';
                    const vaNumber = raw.va_number || window._lastBookingData.vaNumber;
                    Swal.fire({
                        showCloseButton: false,
                        showConfirmButton: false,
                        width: '500px',
                        padding: '0',
                        html: `
                            <div style="background: #f8fafc; border-radius: 20px; overflow: hidden; font-family: 'Inter', sans-serif; text-align: center;">
                                <div style="background: linear-gradient(135deg, var(--primary-blue), #1e3a8a); padding: 30px 20px; text-align: center; position: relative;">
                                    <button onclick="Swal.close()" style="position: absolute; top: 15px; left: 15px; background: rgba(255,255,255,0.2); border: none; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; z-index: 10;" onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='scale(1.1)';" onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='scale(1)';"><i class="fa-solid fa-chevron-left" style="margin-right:2px;"></i></button>
                                    <h3 style="color: white; font-size: 1.6rem; font-weight: 800; margin: 0 0 5px;">Virtual Account ${vaBank}</h3>
                                    <p style="color: rgba(255,255,255,0.85); font-size: 0.95rem; margin: 0;">Transfer tepat sesuai jumlah ke nomor di bawah.</p>
                                </div>
                                <div style="padding: 30px 25px 25px;">
                                    <div style="background: white; border: 2px dashed var(--primary-blue); border-radius: 16px; padding: 25px 20px; margin-bottom: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.03);">
                                        <div style="font-size: 0.9rem; color: #64748b; margin-bottom: 5px; font-weight: 600;">Nomor Virtual Account</div>
                                        <div style="font-size: clamp(1.2rem, 5vw, 2rem); font-weight: 900; color: var(--primary-blue); letter-spacing: 2px; margin-bottom: 15px; word-break: break-all;">${vaNumber}</div>
                                        <button onclick="window.copyText('${vaNumber}', this, '<i class=\\'fa-solid fa-check\\'></i> Tersalin!', '<i class=\\'fa-regular fa-copy\\'></i> Salin Nomor', event)" 
                                            style="padding:10px 24px; background:linear-gradient(135deg, var(--primary-blue), #1e3a8a); color:white; border:none; border-radius:12px; cursor:pointer; font-size:0.95rem; font-weight:bold; box-shadow:0 4px 10px rgba(12,74,110,0.25); transition:all 0.2s;" onmouseover="this.style.transform='scale(1.05)';" onmouseout="this.style.transform='scale(1)';">
                                            <i class="fa-regular fa-copy"></i> Salin Nomor
                                        </button>
                                    </div>
                                    <h4 style="color: #64748b; font-size: 1rem; font-weight: 600; margin: 0 0 5px;">${itemName}</h4>
                                    <p style="font-size: 2.2rem; font-weight: 900; color: var(--primary-green); margin: 0 0 15px; letter-spacing: -0.5px;">${amountFormatted}</p>
                                    <div style="background: #fff1f2; color: #e11d48; padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; display: inline-block; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(225, 29, 72, 0.15);">
                                        <i class="fa-regular fa-clock" style="margin-right: 5px;"></i> Batas Waktu: ${expiredAt}
                                    </div>
                                </div>
                            </div>
                        `
                    });
                    
                    // Start polling
                    if (window.activePollInterval) clearInterval(window.activePollInterval);
                    window.activePollInterval = setInterval(async () => {
                        try {
                            const stRes = await fetch(`${API_URL}/payment/status/${transactionId}`);
                            const stData = await stRes.json();
                            if (stData.success && ['PAID','SUCCESS','SETTLEMENT','COMPLETED'].includes(stData.data.status?.toUpperCase())) {
                                clearInterval(window.activePollInterval);
                                window.simulateQrisSuccess(false, transactionId);
                            }
                        } catch(e) {}
                    }, 5000);
                } else {
                    // Tidak ada data pembayaran - ini transaksi lama yang payment info-nya tidak tersimpan
                    // Otomatis tandai sebagai KADALUARSA agar tidak muncul terus sebagai PENDING
                    try {
                        await fetch(`${API_URL}/bookings/by-txid/${transactionId}/status`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'KADALUARSA' })
                        });
                    } catch(e) {}
                    Swal.fire({
                        icon: 'warning',
                        title: 'Pembayaran Kedaluwarsa',
                        html: `<p style="color:#475569;">Kode pembayaran untuk pesanan ini sudah <b>tidak berlaku lagi</b> karena terlalu lama tidak diselesaikan.</p><p style="color:#64748b;font-size:0.9rem;margin-top:10px;">Silakan buat pesanan baru untuk melanjutkan.</p>`,
                        confirmButtonText: 'Buat Pesanan Baru',
                        confirmButtonColor: 'var(--primary-blue)',
                        showCancelButton: true,
                        cancelButtonText: 'Tutup'
                    }).then(res => {
                        if (res.isConfirmed) window.location.href = '/#layanan';
                        else setTimeout(() => window.loadTransactionHistory?.(), 500);
                    });
                }
            } catch (err) {
                console.error(err);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Terjadi kesalahan jaringan atau memuat data.' });
            }
        };

        window.showTransactionDetail = (encodedData) => {
            const item = JSON.parse(decodeURIComponent(encodedData));
            const meta = window.getItemCategoryMeta(item);
            const isPaid = item.status === 'PAID';
            const statusColor = isPaid ? '#10b981' : (item.status === 'PENDING' ? '#f59e0b' : '#ef4444');
            const statusBg = isPaid ? 'rgba(16, 185, 129, 0.1)' : (item.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)');
            const parsedPrice = parseInt((item.itemPrice || '').toString().replace(/\D/g, ''));
            const price = !isNaN(parsedPrice) && parsedPrice > 0 ? 'Rp ' + parsedPrice.toLocaleString('id-ID') : '-';
            const tgl = item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

            // Set global data here directly so the PDF button can just use it without complex string passing
            window._lastBookingData = item;

            // Tombol Cetak PDF selalu ada (baik PAID maupun PENDING)
            let pdfBtn = `
        <button onclick="window.generateEtiketPDF(window._lastBookingData);" 
            style="background:linear-gradient(135deg, var(--primary-blue), #1e3a8a); border:none; color:white; font-size:1rem; padding:16px 20px; border-radius:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; font-weight:800; width:100%; margin-top:12px; box-shadow:0 8px 20px rgba(12,74,110,0.3); transition:all 0.3s;"
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 25px rgba(12,74,110,0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 20px rgba(12,74,110,0.3)';">
            <i class="fa-solid fa-file-pdf" style="font-size:1.2rem;"></i> Download E-Tiket (PDF)
        </button>
    `;

            let payBtn = '';
            if (item.status === 'PENDING') {
                payBtn = `
        <button onclick="window.resumePayment('${item.transactionId}', '${item.itemName}')" 
            style="background:linear-gradient(135deg, var(--primary-green), #15803d); border:none; color:white; font-size:1rem; padding:16px 20px; border-radius:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; font-weight:800; width:100%; margin-bottom:5px; box-shadow:0 8px 20px rgba(22,163,74,0.3); transition:all 0.3s;"
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 25px rgba(22,163,74,0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 20px rgba(22,163,74,0.3)';">
            <i class="fa-solid fa-qrcode" style="font-size:1.2rem;"></i> Lanjutkan Pembayaran
        </button>
                `;
            }

            let detailsHtml = '<div style="border-radius: 8px; overflow: hidden; border: 1px solid #94a3b8;"><table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; margin: 0;"><tbody>';
            const showRow = (label, val) => {
                if (!val || val === '-') return '';
                return `
            <tr>
                <td style="padding: 12px 15px; border: 1px solid #cbd5e1; color:#64748b; font-weight:600; width: 40%; background: #f8fafc; vertical-align: top;">${label}</td>
                <td style="padding: 12px 15px; border: 1px solid #cbd5e1; color:#1e293b; font-weight:700; word-break: break-word; background: white;">${val}</td>
            </tr>
        `;
            };

            const itemTitleLower = (item.itemName || '').toLowerCase();
            const is12HItem = itemTitleLower.includes('12 jam') || itemTitleLower.includes('include driver');

            detailsHtml += showRow('Nama Pemesan', item.customerName || item.userEmail);
            detailsHtml += showRow('Email', item.customerEmail || item.userEmail);
            detailsHtml += showRow('No. HP / WA', item.phone || item.details?.phone);
            detailsHtml += showRow(is12HItem ? 'Tgl Pemakaian' : 'Tgl Keberangkatan', item.startDate || item.details?.date);
            if (item.endDate && (!is12HItem || item.endDate !== item.startDate)) detailsHtml += showRow('Tgl Selesai', item.endDate);
            if (is12HItem) {
                detailsHtml += showRow('Durasi Layanan', (item.startDate === item.endDate || !item.endDate) ? '12 Jam' : 'Paket 12 Jam Per Hari');
            } else {
                if (item.details?.pickupTime) detailsHtml += showRow('Waktu Penjemputan', item.details.pickupTime);
                else if (item.details?.time) detailsHtml += showRow('Waktu', item.details.time);
                if (item.details?.dropoffTime) detailsHtml += showRow('Waktu Pengembalian', item.details.dropoffTime);
            }
            if (item.details?.pax) detailsHtml += showRow('Jumlah Peserta', item.details.pax + ' Orang');
            if (item.details?.pickup) detailsHtml += showRow(is12HItem ? 'Lokasi Penjemputan' : 'Lokasi Jemput', item.details.pickup);
            if (item.details?.dropoff) detailsHtml += showRow(is12HItem ? 'Lokasi Pengantaran / Selesai' : 'Tujuan', item.details.dropoff);
            if (item.details?.flightNumber) detailsHtml += showRow('No. Penerbangan', item.details.flightNumber);
            detailsHtml += '</tbody></table></div>';

            const container = document.getElementById('riwayat-page-container');
            if (!container) return;
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            container.innerHTML = `
            <div style="max-width: 520px; margin: 0 auto; padding-bottom: 40px; animation: slideInUp 0.3s ease-out forwards;">
                <div style="text-align: left; font-family: 'Inter', sans-serif; background: #f8fafc; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
                    <!-- Header Card (Premium Gradient) -->
                    <div style="background: linear-gradient(135deg, var(--primary-blue), #1e3a8a); padding: 40px 20px 50px; text-align: center; position: relative;">
                        <button onclick="window.showRiwayatTransaksi(true)" style="position: absolute; top: 15px; left: 15px; background: rgba(255,255,255,0.2); border: none; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; z-index: 10;" onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='scale(1.1)';" onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='scale(1)';"><i class="fa-solid fa-chevron-left" style="margin-right:2px;"></i></button>
                        <div style="width: 75px; height: 75px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; color: ${meta.color}; font-size: 2.2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                            <i class="fa-solid ${meta.icon}"></i>
                        </div>
                        <h3 style="color: white; font-size: 1.6rem; font-weight: 800; margin: 0 0 5px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">${meta.label}</h3>
                        <p style="color: rgba(255,255,255,0.85); font-size: 0.95rem; margin: 0;">${tgl}</p>
                        
                        <div style="position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%);">
                            <span style="display:inline-block; font-size:0.9rem; font-weight:800; color: white; background: ${isPaid ? 'var(--primary-green)' : (item.status === 'PENDING' ? '#f59e0b' : '#ef4444')}; padding:8px 24px; border-radius:30px; letter-spacing:1px; box-shadow: 0 6px 15px rgba(0,0,0,0.15); border: 3px solid white;">
                                ${item.status}
                            </span>
                        </div>
                    </div>
                    
                    <!-- Main Content Body -->
                    <div style="padding: 45px 25px 25px;">
                        <!-- Total Pembayaran -->
                        <div style="background: white; border-radius: 18px; padding: 25px; margin-bottom: 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.02);">
                            <p style="color: #64748b; font-size: 0.95rem; font-weight: 600; margin: 0 0 5px; text-transform: uppercase; letter-spacing: 0.5px;">Total Pembayaran</p>
                            <h2 style="color: var(--primary-green); font-size: 2.4rem; font-weight: 900; margin: 0; letter-spacing: -0.5px;">${price}</h2>
                        </div>

                        <!-- ID & Layanan Card -->
                        <div style="background: white; border-radius: 18px; padding: 22px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.02);">
                            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:15px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 15px;">
                                <span style="color:#64748b; font-size:0.95rem; font-weight: 600;"><i class="fa-solid fa-hashtag" style="opacity:0.6; margin-right:8px;"></i> ID Transaksi</span>
                                <div style="display:flex; align-items:center; gap:10px; width:100%;">
                                    <span style="font-family:monospace; font-weight:800; color:var(--primary-blue); font-size:1.1rem; letter-spacing:0.5px; word-break:break-all;">${item.transactionId}</span>
                                    <button onclick="window.copyText('${item.transactionId}', this, '<i class=\\'fa-solid fa-check\\'></i>', '<i class=\\'fa-regular fa-copy\\'></i>', event)" style="background:var(--primary-green); color:white; border:none; border-radius:8px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; box-shadow: 0 4px 10px rgba(22, 163, 74, 0.3); transition: all 0.2s;" title="Salin ID" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><i class="fa-regular fa-copy" style="font-size:0.95rem;"></i></button>
                                </div>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px;">
                                    <span style="color:#64748b; font-size:0.95rem; font-weight: 600;"><i class="fa-solid fa-layer-group" style="opacity:0.6; margin-right:8px;"></i> Layanan</span>
                                    <span style="display:inline-flex; align-items:center; gap:5px; font-size:0.75rem; font-weight:700; color:${meta.color}; background:${meta.bgColor}; padding:3px 10px; border-radius:8px; border:1px solid ${meta.borderColor};">
                                        <i class="fa-solid ${meta.icon}"></i> ${meta.label}
                                    </span>
                                </div>
                                <span style="font-weight:800; color:#1e293b; font-size:1.15rem; line-height: 1.4; padding-left: 26px; word-break:break-word;">${item.itemName}</span>
                            </div>
                        </div>

                        <!-- Informasi Pemesanan -->
                        <div style="background: white; border-radius: 18px; padding: 22px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.02); margin-bottom: 25px;">
                            <h4 style="color:#1e293b; font-size:1.1rem; margin-top:0; margin-bottom:20px; display:flex; align-items:center; gap:10px; font-weight: 800; border-bottom: 2px solid #f8fafc; padding-bottom: 15px;">
                                <i class="fa-solid fa-list-check" style="color:var(--primary-blue);"></i> Rincian Pesanan
                            </h4>
                            <div style="display: flex; flex-direction: column;">
                                ${detailsHtml}
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div style="margin-top: 20px;">
                            ${payBtn}
                            ${pdfBtn}
                        </div>
                    </div>
                </div>
            </div>
            `;

        };

        data.forEach(item => {
            // ── Cek expiry di sisi client ──────────────────────────────────
            if (item.status === 'PENDING') {
                const created = item.createdAt ? new Date(item.createdAt).getTime() : 0;
                const elapsed = Date.now() - created;
                const method = (item.paymentMethod || '').toLowerCase();
                if (method === 'va') {
                    if (created > 0 && elapsed > 24 * 60 * 60 * 1000) item.status = 'KADALUARSA';
                } else {
                    // QRIS atau tidak diketahui → 1 jam
                    if (created > 0 && elapsed > 60 * 60 * 1000) item.status = 'KADALUARSA';
                }
            }
            // ───────────────────────────────────────────────────────────────
            const isPaid = item.status === 'PAID';
            const statusColor = isPaid ? '#10b981' : (item.status === 'PENDING' ? '#f59e0b' : '#ef4444');
            const statusBg = isPaid ? 'rgba(16, 185, 129, 0.1)' : (item.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)');
            
            // Dynamic Icon & Category Badge based on itemName and catalog
            const meta = window.getItemCategoryMeta(item);

            const parsedPrice = parseInt((item.itemPrice || '').toString().replace(/\D/g, ''));
            const price = !isNaN(parsedPrice) && parsedPrice > 0 ? 'Rp ' + parsedPrice.toLocaleString('id-ID') : '-';
            const tgl = item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

            const encodedData = encodeURIComponent(JSON.stringify(item));

            html += `
                <div onclick="window.showTransactionDetail('${encodedData}')" style="background: white; border-radius: 20px; padding: 20px; border: 1px solid #f1f5f9; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.03); cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 20px 40px rgba(0,0,0,0.08)'; this.style.borderColor='#e2e8f0';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 25px rgba(0,0,0,0.03)'; this.style.borderColor='#f1f5f9';">
                    
                    <!-- Header: ID & Status -->
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                        <div style="display: flex; align-items: center; gap: 8px; background: #f8fafc; padding: 6px 12px; border-radius: 10px; border: 1px solid #f1f5f9; max-width: 65%;">
                            <i class="fa-solid fa-receipt" style="color: #94a3b8; font-size: 0.8rem; flex-shrink: 0;"></i>
                            <span style="font-size: 0.75rem; color: #475569; font-weight: 700; font-family: monospace; letter-spacing: 0; word-break: break-all;">${item.transactionId}</span>
                            <button onclick="window.copyText('${item.transactionId}', this, '<i class=\\'fa-solid fa-check\\'></i>', '<i class=\\'fa-regular fa-copy\\'></i>', event)" style="background: white; color: var(--primary-blue); border: 1px solid #e2e8f0; border-radius: 6px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; flex-shrink: 0;" title="Salin ID" onmouseover="this.style.background='var(--primary-blue)'; this.style.color='white';" onmouseout="this.style.background='white'; this.style.color='var(--primary-blue)';"><i class="fa-regular fa-copy" style="font-size: 0.65rem;"></i></button>
                        </div>
                        <span style="font-size: 0.7rem; font-weight: 800; color: ${statusColor}; background: ${statusBg}; padding: 6px 12px; border-radius: 20px; letter-spacing: 0.5px; text-transform: uppercase;">
                            ${item.status}
                        </span>
                    </div>

                    <!-- Body: Icon & Title -->
                    <div style="display: flex; gap: 16px; margin-bottom: 16px; flex: 1; align-items: center;">
                        <div style="width: 55px; height: 55px; border-radius: 14px; background: ${meta.gradient}; color: ${meta.color}; border: 1px solid ${meta.borderColor}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.45rem; box-shadow: inset 0 2px 4px rgba(255,255,255,0.6), 0 6px 14px ${meta.shadow};">
                            <i class="fa-solid ${meta.icon}"></i>
                        </div>
                        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; min-width: 0;">
                            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                                <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.7rem; font-weight: 700; color: ${meta.color}; background: ${meta.bgColor}; padding: 2px 8px; border-radius: 6px; border: 1px solid ${meta.borderColor};">
                                    <i class="fa-solid ${meta.icon}" style="font-size: 0.65rem;"></i> ${meta.label}
                                </span>
                            </div>
                            <h4 style="margin: 0 0 6px; font-size: 1.05rem; color: #0f172a; font-weight: 800; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word;">${item.itemName}</h4>
                            <div style="font-size: 0.8rem; color: #64748b; display: flex; align-items: center; gap: 6px; font-weight: 500;">
                                <i class="fa-regular fa-calendar-days" style="color: #94a3b8;"></i> Dipesan: ${tgl}
                            </div>
                        </div>
                    </div>

                    <!-- Footer: Price & Action -->
                    <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px dashed #e2e8f0;">
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-size: 0.7rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; margin-bottom: 2px;">Total Harga</span>
                            <span style="font-weight: 900; color: var(--primary-green); font-size: 1.2rem; letter-spacing: -0.5px;">${price}</span>
                        </div>
                        <div style="background: var(--primary-blue); color: white; padding: 8px 16px; border-radius: 12px; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(14, 165, 233, 0.2); transition: all 0.2s;" onmouseover="this.style.background='#0284c7'; this.style.boxShadow='0 6px 15px rgba(14, 165, 233, 0.3)';" onmouseout="this.style.background='var(--primary-blue)'; this.style.boxShadow='0 4px 10px rgba(14, 165, 233, 0.2)';">
                            Lihat Detail <i class="fa-solid fa-arrow-right" style="font-size: 0.9em;"></i>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div></div>';
        container.innerHTML = html;

    } catch (e) {
        console.error("Riwayat Error:", e);
        container.innerHTML = `
            <div style="text-align:center; padding:50px 20px; color:#ef4444; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border:1px solid #fee2e2;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size:3.5rem; margin-bottom:15px; display:block;"></i>
                <h3 style="margin-bottom:10px; font-weight:700;">Terjadi Kesalahan</h3>
                <p style="font-size:1rem; color:#b91c1c; margin-bottom: 20px;">${e.message}</p>
                <button onclick="window.showRiwayatTransaksi(true)" style="background: white; color:#ef4444; border:2px solid #ef4444; padding:10px 25px; border-radius:10px; font-weight:bold; cursor:pointer; font-size: 1rem; transition: background 0.2s;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='white'">Coba Lagi</button>
            </div>
        `;
    }
};

window.checkAuthAndPrompt = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        // Tutup modal lain agar fokus ke login
        if (typeof window.closeTourModal === 'function') window.closeTourModal();
        if (typeof window.closeSubPackageModal === 'function') window.closeSubPackageModal();

        window.openAuthModal();
        return false;
    }
    return true;
};

window.submitAuth = async (e) => {
    e.preventDefault();
    const isLogin = window._authMode === 'login';
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value;
    const btn = document.getElementById('btn-auth-submit');

    btn.disabled = true;
    btn.innerHTML = 'Memproses...';

    try {
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const body = { email, password };
        if (!isLogin) body.name = name;

        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Terjadi kesalahan');
        }

        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user || data.admin));

        window.closeAuthModal();
        window.checkAuthUI();

        Swal.fire({
            icon: 'success',
            title: isLogin ? 'Berhasil Login' : 'Berhasil Mendaftar',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000
        });

    } catch (err) {
        Swal.fire({ icon: 'error', title: 'Gagal', text: err.message, confirmButtonColor: '#1d4ed8' });
    } finally {
        btn.disabled = false;
        btn.innerHTML = isLogin ? 'Login' : 'Daftar';
    }
};

// Function to safely copy share text with feedback
window.copyShareText = (encodedText, badgeId) => {
    const text = decodeURIComponent(encodedText);
    const setSuccessUI = () => {
        const badge = document.getElementById(badgeId);
        if (badge) {
            badge.classList.add('copied');
            badge.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin!';
            setTimeout(() => {
                badge.classList.remove('copied');
                badge.innerHTML = '<i class="fa-solid fa-copy"></i> Salin';
            }, 2500);
        }
        Swal.fire({
            customClass: { container: 'swal-high-z' },
            icon: 'success',
            title: 'Tersalin ke Clipboard!',
            text: 'Link & detail penawaran siap dibagikan.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2500
        });
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(setSuccessUI).catch(() => {
            try {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                setSuccessUI();
            } catch (e) {
                console.error(e);
            }
        });
    } else {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setSuccessUI();
        } catch (e) {
            console.error(e);
        }
    }
};

// Function for native device sharing (mobile apps)
window.triggerNativeShare = (title, encodedText, url) => {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: decodeURIComponent(encodedText),
            url: decodeURIComponent(url)
        }).catch((err) => {
            if (err && err.name !== 'AbortError') console.warn(err);
        });
    }
};

window.shareItem = (id, title, priceStr) => {
    id = id || '';
    title = title || 'Penawaran Spesial Lombok';
    priceStr = priceStr || '';

    const url = window.location.origin + window.location.pathname + '?item=' + encodeURIComponent(id);
    const textWa = `Halo! 👋\n\nSaya menemukan penawaran menarik dari *Travel Lombok Airport* nih:\n\n📌 *${title}*` + (priceStr ? `\n💰 *${priceStr}*` : '') + `\n\nYuk, cek detail lengkapnya dan booking sekarang melalui link di bawah ini:\n📍 ${url}`;
    const textOther = `Ada rencana liburan ke Lombok? 🌴\n\nCek penawaran seru dari Travel Lombok Airport!\n📌 ${title}` + (priceStr ? `\n💰 ${priceStr}` : '') + `\n\nLangsung booking dan lihat detailnya di sini 👇\n📍 ${url}`;
    
    const waLink = `https://wa.me/?text=${encodeURIComponent(textWa)}`;
    const twLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textOther)}`;
    const threadsLink = `https://threads.net/intent/post?text=${encodeURIComponent(textOther)}`;

    const safeTitle = String(title).replace(/[<>&"']/g, m => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;'
    })[m]);

    const safePrice = priceStr ? String(priceStr).replace(/[<>&"']/g, m => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;'
    })[m]) : 'Penawaran Terbaik';

    const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

    Swal.fire({
        customClass: {
            container: 'swal-high-z swal-share-container',
            popup: 'swal-share-popup'
        },
        html: `
            <div class="share-modal-header">
                <div class="share-modal-header-icon">
                    <i class="fa-solid fa-share-nodes"></i>
                </div>
                <div class="share-modal-header-text">
                    <div class="share-modal-header-badge">
                        <i class="fa-solid fa-sparkles"></i> Travel Lombok Airport
                    </div>
                    <h3 class="share-modal-header-title">Bagikan Penawaran</h3>
                </div>
            </div>

            <div class="share-preview-card">
                <div class="share-preview-icon">
                    <i class="fa-solid fa-location-dot"></i>
                </div>
                <div class="share-preview-info">
                    <div class="share-preview-badge">
                        <span></span> Penawaran Pilihan
                    </div>
                    <div class="share-preview-title" title="${safeTitle}">${safeTitle}</div>
                    <div class="share-preview-price">${safePrice}</div>
                </div>
            </div>

            <div class="share-actions-list">
                <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="share-btn-item share-btn-wa">
                    <div class="share-btn-icon-wrap">
                        <i class="fa-brands fa-whatsapp"></i>
                    </div>
                    <div class="share-btn-content">
                        <div class="share-btn-title">Bagikan ke WhatsApp</div>
                        <div class="share-btn-desc">Kirim pesan langsung ke chat atau grup</div>
                    </div>
                    <i class="fa-solid fa-chevron-right share-btn-arrow"></i>
                </a>

                <a href="${twLink}" target="_blank" rel="noopener noreferrer" class="share-btn-item share-btn-tw">
                    <div class="share-btn-icon-wrap">
                        <i class="fa-brands fa-twitter"></i>
                    </div>
                    <div class="share-btn-content">
                        <div class="share-btn-title">Bagikan ke Twitter / X</div>
                        <div class="share-btn-desc">Tweet rekomendasi liburan ke followers</div>
                    </div>
                    <i class="fa-solid fa-chevron-right share-btn-arrow"></i>
                </a>

                <a href="${threadsLink}" target="_blank" rel="noopener noreferrer" class="share-btn-item share-btn-threads">
                    <div class="share-btn-icon-wrap">
                        <i class="fa-brands fa-threads"></i>
                    </div>
                    <div class="share-btn-content">
                        <div class="share-btn-title">Bagikan ke Threads</div>
                        <div class="share-btn-desc">Posting rekomendasi liburan di Threads</div>
                    </div>
                    <i class="fa-solid fa-chevron-right share-btn-arrow"></i>
                </a>

                ${canNativeShare ? `
                <button type="button" onclick="window.triggerNativeShare('${safeTitle.replace(/'/g, "\\'")}', '${encodeURIComponent(textOther)}', '${encodeURIComponent(url)}')" class="share-btn-item share-btn-native">
                    <div class="share-btn-icon-wrap">
                        <i class="fa-solid fa-share-nodes"></i>
                    </div>
                    <div class="share-btn-content">
                        <div class="share-btn-title">Bagikan ke Aplikasi Lain</div>
                        <div class="share-btn-desc">Instagram, Facebook, Telegram, dll</div>
                    </div>
                    <i class="fa-solid fa-chevron-right share-btn-arrow"></i>
                </button>
                ` : ''}

                <button type="button" onclick="window.copyShareText('${encodeURIComponent(textOther)}', 'copy-share-badge')" class="share-btn-item share-btn-copy">
                    <div class="share-btn-icon-wrap">
                        <i class="fa-solid fa-link"></i>
                    </div>
                    <div class="share-btn-content">
                        <div class="share-btn-title">Salin Link & Teks Promo</div>
                        <div class="share-btn-desc">Teks & link siap tempel di mana saja</div>
                    </div>
                    <span id="copy-share-badge" class="share-copy-badge">
                        <i class="fa-solid fa-copy"></i> Salin
                    </span>
                </button>
            </div>
        `,
        showConfirmButton: false,
        showCloseButton: true,
        closeButtonHtml: '<i class="fa-solid fa-arrow-left" title="Kembali"></i>'
    });
};

// ========== AI CHATBOT LOGIC ==========
let chatHistory = [];
try {
    const saved = localStorage.getItem('aiChatHistory');
    if (saved) chatHistory = JSON.parse(saved);
} catch (e) {
    console.error('Failed to load chat history', e);
}

// Function to render chat history on page load
window.renderChatHistory = () => {
    if (chatHistory.length === 0) return;
    
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    // Clear initial greeting if we have history
    messagesContainer.innerHTML = '';

    chatHistory.forEach(msg => {
        if (msg.role === 'user') {
            messagesContainer.insertAdjacentHTML('beforeend', `
                <div class="message user-message">
                    ${msg.parts[0].text}
                </div>
            `);
        } else {
            const htmlReply = parseMarkdownToHTML(msg.parts[0].text);
            messagesContainer.insertAdjacentHTML('beforeend', `
                <div class="message ai-message">
                    ${htmlReply}
                </div>
            `);
        }
    });
    
    // Prepend the greeting so it always starts with it.
    messagesContainer.insertAdjacentHTML('afterbegin', `
        <div class="message ai-message">
            Halo Kak! 👋 Saya AIRA, asisten virtual Travel Lombok Airport. Ada yang bisa saya bantu untuk rencana perjalanan Anda?
        </div>
    `);
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    window.checkGuestLimit();
};

// Call render when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('chat-messages')) {
        window.renderChatHistory();
    }
    if (typeof window.initChipsScroll === 'function') {
        window.initChipsScroll();
    }
});

window.clearChatHistory = () => {
    if (!confirm('Hapus semua riwayat percakapan dengan AIRA?')) return;
    chatHistory = [];
    localStorage.removeItem('aiChatHistory');
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer) {
        messagesContainer.innerHTML = `
            <div class="message ai-message">
                Halo Kak! 👋 Saya AIRA, asisten virtual Travel Lombok Airport. Ada yang bisa saya bantu untuk rencana perjalanan Anda?
            </div>
            <div id="ai-quick-replies" style="display: flex; flex-direction: column; gap: 8px; margin: 10px 15px;">
                <button onclick="window.checkAiraPromoDeals()" class="ai-quick-reply-btn ai-btn-rose-promo">
                    <i class="fa-solid fa-ticket" style="margin-right: 6px; color:#e11d48;"></i> 🎟️ Cek Promo Hari Ini & Klaim Kupon Diskon
                </button>
                <button onclick="window.showAiraRoadsideEmergencySOS()" class="ai-quick-reply-btn ai-btn-red-sos">
                    <i class="fa-solid fa-triangle-exclamation" style="margin-right: 6px; color:#ef4444;"></i> 🚨 Bantuan Darurat di Jalan & SOS 24/7 (SPBU, Bengkel, RS, CS Siaga)
                </button>
                <button onclick="window.askAiraAntiZonkSouvenirs()" class="ai-quick-reply-btn ai-btn-amber-oleholeh">
                    <i class="fa-solid fa-shield-halved" style="margin-right: 6px; color:#f59e0b;"></i> 🛍️ Panduan Anti-Zonk Belanja Oleh-Oleh (Cek Mutiara, Madu & Tenun Asli)
                </button>
                <button onclick="window.askAiraQuick('Ajarkan saya sapaan ramah bahasa Sasak Lombok sehari-hari dan tips menawar oleh-oleh di Sade atau Sukarara!')" class="ai-quick-reply-btn ai-btn-emerald-sasak">
                    <i class="fa-solid fa-comments" style="margin-right: 6px; color:#10b981;"></i> 🗣️ Kamus Bahasa Sasak (Sapaan Lokal & Tips Belanja)
                </button>
                <button onclick="window.askAiraQuick('Rekomendasikan kuliner legendaris khas Lombok yang paling wajib dicoba dan rute lokasinya dong!')" class="ai-quick-reply-btn ai-btn-orange">
                    <i class="fa-solid fa-pepper-hot" style="margin-right: 6px; color:#ea580c;"></i> 🌶️ Kuliner Khas Lombok (Taliwang, Rembiga, Puyung)
                </button>
                <button onclick="window.askAiraQuick('Rekomendasikan pusat oleh-oleh dan kerajinan hidden gems khas Lombok serta rute lokasinya dong!')" class="ai-quick-reply-btn ai-btn-purple">
                    <i class="fa-solid fa-gem" style="margin-right: 6px; color:#7c3aed;"></i> 💎 Hidden Gems & Kerajinan (Tenun Sukarara, Mutiara, Gerabah)
                </button>
                <button onclick="window.findNearestLombokFood()" class="ai-quick-reply-btn ai-btn-blue">
                    <i class="fa-solid fa-location-crosshairs" style="margin-right: 6px; color:#0284c7;"></i> 📍 Cari Kuliner Khas di Dekat Saya (GPS)
                </button>
                <button onclick="window.sendDeterministicReply('Saya mengalami kendala tidak bisa login, padahal sudah mereset kata sandi.', 'Mohon maaf atas ketidaknyamanan yang Anda alami. 🙏<br><br>Sehubungan dengan peningkatan infrastruktur keamanan data Travel Lombok Airport, sistem otentikasi kami saat ini sedang dalam masa transisi. Hal tersebut menyebabkan fitur **Masuk (Login)** maupun **Pengaturan Ulang Kata Sandi (Reset Password)** belum dapat beroperasi secara optimal untuk beberapa akun.<br><br>Sebagai solusi alternatif yang cepat dan aman, **kami merekomendasikan Anda untuk melakukan Registrasi ulang menggunakan alamat email yang sama**.<br><br>Anda tidak perlu khawatir, seluruh riwayat dan data akun Anda akan secara otomatis tersinkronisasi kembali dengan sistem keamanan kami yang terbaru sesaat setelah pendaftaran berhasil dilakukan.<br><br>Terima kasih atas pengertian serta kepercayaan Anda dalam menggunakan layanan kami.')" class="ai-quick-reply-btn ai-btn-blue">
                    <i class="fa-solid fa-circle-question" style="margin-right: 6px;"></i> Bantuan Akses Akun (Gagal Login / Reset Sandi)
                </button>
                <button onclick="window.showBugReportOptions()" class="ai-quick-reply-btn ai-btn-red">
                    <i class="fa-solid fa-triangle-exclamation" style="margin-right: 6px;"></i> Laporkan Masalah / Bug
                </button>
            </div>
        `;
    }
    const banner = document.getElementById('guest-limit-banner');
    if (banner) banner.style.display = 'none';
    const inputArea = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat-btn');
    if (inputArea) { inputArea.disabled = false; inputArea.placeholder = 'Tanya rekomendasi paket...'; inputArea.value = ''; }
    if (sendBtn) sendBtn.disabled = false;
    window.checkGuestLimit();
};

let airaRatingInterval = null;
let airaRatingTimeout = null;

function startAiraRatingTimer() {
    if (airaRatingInterval) clearInterval(airaRatingInterval);
    if (airaRatingTimeout) clearTimeout(airaRatingTimeout);
    
    const triggerRating = () => {
        const existingRating = localStorage.getItem('aira_user_rating');
        if (existingRating) {
            if (airaRatingInterval) clearInterval(airaRatingInterval);
            if (airaRatingTimeout) clearTimeout(airaRatingTimeout);
            return;
        }

        const blockUntil = localStorage.getItem('aira_rating_block');
        if (blockUntil && new Date().getTime() < parseInt(blockUntil)) return;
        
        const chatHistory = document.getElementById('chat-messages');
        const chatWindow = document.getElementById('ai-chat-window');
        if (!chatHistory || !chatWindow || chatWindow.classList.contains('hidden')) return;
        
        if (document.querySelector('.aira-rating-bubble')) return;
        
        const div = document.createElement('div');
        div.className = 'chat-message bot aira-rating-bubble';
        div.style.marginBottom = '15px';
        div.innerHTML = `
            <div class="chat-bubble" style="background:var(--bg-light); border:1px solid #e2e8f0; text-align:center; padding:15px; border-radius:15px; width:85%; max-width:280px; margin:0 auto;">
                <p style="margin:0 0 10px; font-weight:600; font-size:0.9rem; color:var(--text-dark);">Beri rating untuk AIRA ⭐</p>
                <div class="stars-container" style="display:flex; justify-content:center; gap:8px; margin-bottom:12px;">
                    <i class="fa-solid fa-star star-btn" data-val="1" style="color:#cbd5e1; font-size:1.5rem; cursor:pointer; transition:0.2s;"></i>
                    <i class="fa-solid fa-star star-btn" data-val="2" style="color:#cbd5e1; font-size:1.5rem; cursor:pointer; transition:0.2s;"></i>
                    <i class="fa-solid fa-star star-btn" data-val="3" style="color:#cbd5e1; font-size:1.5rem; cursor:pointer; transition:0.2s;"></i>
                    <i class="fa-solid fa-star star-btn" data-val="4" style="color:#cbd5e1; font-size:1.5rem; cursor:pointer; transition:0.2s;"></i>
                    <i class="fa-solid fa-star star-btn" data-val="5" style="color:#cbd5e1; font-size:1.5rem; cursor:pointer; transition:0.2s;"></i>
                </div>
                <button onclick="window.blockAiraRating(this)" style="background:none; border:none; color:#ef4444; font-size:0.75rem; text-decoration:underline; cursor:pointer;">Mengganggu (Blokir 1 Hari)</button>
            </div>
        `;
        chatHistory.appendChild(div);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        const stars = div.querySelectorAll('.star-btn');
        stars.forEach(s => {
            s.addEventListener('click', async (e) => {
                const rating = e.target.getAttribute('data-val');
                div.innerHTML = `<div class="chat-bubble" style="background:#dcfce3; color:#166534; padding:10px; border-radius:10px; text-align:center; font-size:0.85rem;"><i class="fa-solid fa-check-circle" style="margin-right:5px;"></i>Terima kasih atas rating ${rating} bintang Anda! ⭐</div>`;
                
                localStorage.setItem('aira_user_rating', rating);
                if (airaRatingInterval) clearInterval(airaRatingInterval);
                if (airaRatingTimeout) clearTimeout(airaRatingTimeout);
                
                try {
                    await fetch('/api/ai/rating', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ rating: parseInt(rating), sessionId: window.currentChatSessionId || 'unknown' })
                    });
                } catch(err) { console.error(err); }
            });
            s.addEventListener('mouseover', (e) => {
                const val = parseInt(e.target.getAttribute('data-val'));
                stars.forEach(st => {
                    st.style.color = parseInt(st.getAttribute('data-val')) <= val ? '#fbbf24' : '#cbd5e1';
                });
            });
            s.addEventListener('mouseout', () => {
                stars.forEach(st => st.style.color = '#cbd5e1');
            });
        });
    };

    // Tampilkan pertama kali setelah 10 detik, lalu rutin tiap 5 menit
    airaRatingTimeout = setTimeout(() => {
        triggerRating();
        airaRatingInterval = setInterval(triggerRating, 5 * 60 * 1000);
    }, 10000);
}

window.blockAiraRating = (btn) => {
    const oneDay = new Date().getTime() + (24 * 60 * 60 * 1000);
    localStorage.setItem('aira_rating_block', oneDay.toString());
    const bubble = btn.closest('.chat-message');
    bubble.innerHTML = `<div class="chat-bubble" style="background:#fee2e2; color:#991b1b; padding:10px; border-radius:10px; text-align:center; font-size:0.85rem;"><i class="fa-solid fa-bell-slash" style="margin-right:5px;"></i>Rating dinonaktifkan selama 1 hari.</div>`;
    setTimeout(() => { bubble.remove(); }, 3000);
};

// --- WHATSAPP-STYLE SCROLL TO BOTTOM LOGIC ---
let unreadAiraCount = 0;

window.scrollChatToBottom = (smooth = true) => {
    const msgs = document.getElementById('chat-messages');
    if (msgs) {
        msgs.scrollTo({
            top: msgs.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto'
        });
    }
    window.resetChatScrollBadge();
};

window.resetChatScrollBadge = () => {
    unreadAiraCount = 0;
    const badge = document.getElementById('chat-unread-badge');
    if (badge) {
        badge.style.display = 'none';
        badge.textContent = '0';
    }
    const btn = document.getElementById('chat-scroll-bottom-btn');
    if (btn) {
        btn.classList.remove('visible');
    }
};

window.updateChatScrollBtnVisibility = () => {
    const msgs = document.getElementById('chat-messages');
    const btn = document.getElementById('chat-scroll-bottom-btn');
    if (!msgs || !btn) return;

    // Distance from the bottom of chat
    const distFromBottom = msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight;
    if (distFromBottom > 75) {
        btn.classList.add('visible');
    } else {
        btn.classList.remove('visible');
        window.resetChatScrollBadge();
    }
};

window.handleNewIncomingAiraMessage = () => {
    const msgs = document.getElementById('chat-messages');
    const btn = document.getElementById('chat-scroll-bottom-btn');
    const badge = document.getElementById('chat-unread-badge');
    if (!msgs) return;

    const distFromBottom = msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight;
    if (distFromBottom > 90) {
        unreadAiraCount++;
        if (badge) {
            badge.textContent = unreadAiraCount > 9 ? '9+' : unreadAiraCount;
            badge.style.display = 'flex';
        }
        if (btn) btn.classList.add('visible');
    } else {
        msgs.scrollTop = msgs.scrollHeight;
        if (btn) btn.classList.remove('visible');
    }
};

window.initChatScrollListener = () => {
    const msgs = document.getElementById('chat-messages');
    if (msgs && !msgs.dataset.scrollBound) {
        msgs.dataset.scrollBound = 'true';
        msgs.addEventListener('scroll', window.updateChatScrollBtnVisibility, { passive: true });
    }
};

window.toggleChat = async () => {
    const chatWindow = document.getElementById('ai-chat-window');
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden')) {
        startAiraRatingTimer();
        window.initChatScrollListener();
        if (typeof window.initChipsScroll === 'function') {
            window.initChipsScroll();
        }
        const inputArea = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-chat-btn');
        const micBtn = document.getElementById('mic-chat-btn');
        const msgs = document.getElementById('chat-messages');

        try {
            const res = await fetch(`${API_URL}/settings`);
            if (res.ok) {
                const settings = await res.json();
                if (settings.aiMaintenanceMode) {
                    if (inputArea) { inputArea.disabled = true; inputArea.placeholder = 'AI sedang dalam perbaikan...'; }
                    if (sendBtn) sendBtn.disabled = true;
                    if (micBtn) micBtn.disabled = true;
                    
                    if (msgs && !msgs.innerHTML.includes('pemeliharaan')) {
                        msgs.innerHTML += `
                            <div class="message ai-message" style="background-color: #fef3c7; color: #92400e; border: 1px solid #f59e0b;">
                                <i class="fa-solid fa-person-digging"></i> Mohon maaf, fitur AIRA sedang dalam pemeliharaan dan peningkatan sistem. Silakan hubungi kami via WhatsApp sementara waktu.
                            </div>
                        `;
                        msgs.scrollTop = msgs.scrollHeight;
                    }
                    return; // Stop further checks
                } else {
                    // Reset if previously disabled
                    if (inputArea && inputArea.placeholder === 'AI sedang dalam perbaikan...') {
                        inputArea.disabled = false;
                        inputArea.placeholder = 'Tanya rekomendasi paket...';
                        if (sendBtn) sendBtn.disabled = false;
                        if (micBtn) micBtn.disabled = false;
                    }
                }
            }
        } catch (e) {
            console.error('Failed to check AI settings', e);
        }

        document.getElementById('chat-input').focus();
        // Check and show guest limit card if needed
        window.checkGuestLimit();
        // Scroll to bottom
        if (msgs) {
            msgs.scrollTop = msgs.scrollHeight;
            window.resetChatScrollBadge();
        }
    } else {
        if (airaRatingInterval) clearInterval(airaRatingInterval);
        if (airaRatingTimeout) clearTimeout(airaRatingTimeout);
    }
};

window.handleChatKeyPress = (event) => {
    if (event.key === 'Enter') {
        window.sendChatMessage();
    }
};

// --- AIRA INTERACTIVE PRODUCT & TOUR CARDS ---
function detectRecommendedItems(markdown) {
    if (!markdown) return [];
    const rawPool = (window.globalItems && window.globalItems.length > 0) 
        ? window.globalItems 
        : (typeof DEFAULT_ITEMS_FALLBACK !== 'undefined' ? DEFAULT_ITEMS_FALLBACK : []);
    if (!rawPool || rawPool.length === 0) return [];
    
    // Filter KETAT: Abaikan SEMUA item yang harganya 0, kosong, folder induk (parent), atau pricelist transfer bandara
    const itemsPool = rawPool.filter(i => {
        const p = Number(i.price || 0);
        const titleLower = (i.title || '').toLowerCase();
        const catLower = (i.category || '').toLowerCase();
        if (p <= 0 || i.isParent) return false;
        if (titleLower.includes('pricelist') || catLower === 'transfer' || catLower === 'airport' || (i.transferMatrix && i.transferMatrix.length > 0)) return false;
        return true;
    });
    if (itemsPool.length === 0) return [];
    
    const found = [];
    const seenIds = new Set();
    const mdLower = markdown.toLowerCase();
    
    // Normalisasi teks untuk toleransi typo / ejaan umum:
    // Contoh: "Beat Street" <-> "Beat Streat"
    const normalizedMd = mdLower
        .replace(/beat\s+street/g, 'beat streat beat street')
        .replace(/beat\s+streat/g, 'beat streat beat street')
        .replace(/inova/g, 'innova')
        .replace(/zenik/g, 'zenix')
        .replace(/all\s+new\s+/g, '')
        .replace(/grand\s+new\s+/g, '');
    
    // 1. Explicit item parameter: /?item=ID or ?item=ID
    const linkRegex = /(?:\?|&)item=([a-zA-Z0-9_\-]+)/gi;
    let match;
    while ((match = linkRegex.exec(markdown)) !== null) {
        const id = match[1];
        if (!seenIds.has(id)) {
            const item = itemsPool.find(i => i.id === id);
            if (item) {
                seenIds.add(id);
                found.push(item);
            }
        }
    }
    
    // 2. Exact or clean title match (case-insensitive & typo-tolerant)
    const sortedItems = [...itemsPool].sort((a, b) => (b.title?.length || 0) - (a.title?.length || 0));
    for (const item of sortedItems) {
        if (!item.title || seenIds.has(item.id)) continue;
        const titleLower = item.title.toLowerCase();
        
        if (normalizedMd.includes(titleLower) || 
            (titleLower.includes('streat') && normalizedMd.includes(titleLower.replace('streat', 'street'))) ||
            (titleLower.includes('street') && normalizedMd.includes(titleLower.replace('street', 'streat')))) {
            seenIds.add(item.id);
            found.push(item);
            if (found.length >= 3) break;
        }
    }
    
    // 3. Keyword / Alias Matcher jika belum ketemu atau masih kurang
    if (found.length < 3) {
        const keywordMap = [
            // Motor
            { keywords: ['beat street', 'beat streat', 'beat'], matchTitle: 'beat streat' },
            { keywords: ['vario 125', 'vario 160', 'vario'], matchTitle: 'vario' },
            { keywords: ['nmax', 'n-max'], matchTitle: 'nmax' },
            { keywords: ['pcx'], matchTitle: 'pcx' },
            { keywords: ['adv'], matchTitle: 'adv' },
            { keywords: ['scoopy'], matchTitle: 'scoopy' },
            
            // Mobil
            { keywords: ['innova zenix', 'zenix'], matchTitle: 'innova zenix' },
            { keywords: ['innova reborn', 'reborn'], matchTitle: 'innova reborn' },
            { keywords: ['innova'], matchTitle: 'innova' },
            { keywords: ['avanza fl', 'avanza facelift'], matchTitle: 'avanza fl' },
            { keywords: ['new avanza', 'all new avanza'], matchTitle: 'new avanza' },
            { keywords: ['avanza'], matchTitle: 'avanza' },
            { keywords: ['brio', 'honda brio'], matchTitle: 'brio' },
            { keywords: ['agya'], matchTitle: 'agya' },
            { keywords: ['xpander', 'mitsubishi xpander'], matchTitle: 'xpander' },
            { keywords: ['hiace premio', 'premio'], matchTitle: 'hiace premio' },
            { keywords: ['hiace commuter', 'commuter'], matchTitle: 'hiace commuter' },
            { keywords: ['hiace'], matchTitle: 'hiace' },
            { keywords: ['fortuner'], matchTitle: 'fortuner' },
            { keywords: ['alphard'], matchTitle: 'alphard' },
            { keywords: ['raize', 'rize'], matchTitle: 'rize' },
            { keywords: ['wrv', 'wr-v'], matchTitle: 'wrv' },
            
            // Tour & Honeymoon
            { keywords: ['honeymoon'], matchCat: 'honeymoon' },
            { keywords: ['gili', 'mandalika', 'sembalun', 'sasak', 'snorkeling', 'trip', 'paket wisata', 'paket tour'], matchCat: 'package' }
        ];
        
        for (const entry of keywordMap) {
            if (found.length >= 3) break;
            const hasKw = entry.keywords.some(kw => normalizedMd.includes(kw));
            if (!hasKw) continue;
            
            let matched = null;
            if (entry.matchTitle) {
                matched = itemsPool.find(i => !seenIds.has(i.id) && (i.title || '').toLowerCase().includes(entry.matchTitle));
            } else if (entry.matchCat) {
                matched = itemsPool.find(i => !seenIds.has(i.id) && ((i.category || '').toLowerCase() === entry.matchCat || (i.category || '').toLowerCase().includes(entry.matchCat)));
            }
            
            if (matched && !seenIds.has(matched.id)) {
                seenIds.add(matched.id);
                found.push(matched);
            }
        }
    }
    
    // 4. Kategori Umum Fallback: Jika membicarakan sewa motor/mobil/paket tapi belum ada spesifik
    if (found.length === 0) {
        if (/\b(motor|motorcycle|sewa motor|rental motor)\b/i.test(normalizedMd)) {
            const motors = itemsPool.filter(i => (i.category || '').toLowerCase() === 'motorcycle');
            if (motors.length > 0) found.push(motors[0]);
        } else if (/\b(mobil|car|rental mobil|sewa mobil|lepas kunci)\b/i.test(normalizedMd)) {
            const cars = itemsPool.filter(i => (i.category || '').toLowerCase() === 'car');
            if (cars.length > 0) found.push(cars[0]);
        } else if (/\b(tour|paket|wisata|trip|liburan|pantai|gili)\b/i.test(normalizedMd)) {
            const pkgs = itemsPool.filter(i => ['package', 'tour', 'honeymoon'].includes((i.category || '').toLowerCase()));
            if (pkgs.length > 0) found.push(pkgs[0]);
        }
    }
    
    return found;
}

function renderAiraMiniCards(items) {
    if (!items || items.length === 0) return '';
    
    // Filter KETAT: jangan pernah render kartu yang harganya 0, kosong, folder parent, atau pricelist airport transfer
    const validItems = items.filter(i => {
        const p = Number(i.price || 0);
        const titleLower = (i.title || '').toLowerCase();
        const catLower = (i.category || '').toLowerCase();
        if (p <= 0 || i.isParent) return false;
        if (titleLower.includes('pricelist') || catLower === 'transfer' || catLower === 'airport' || (i.transferMatrix && i.transferMatrix.length > 0)) return false;
        return true;
    });
    if (validItems.length === 0) return '';

    const cardsHtml = validItems.map(item => {
        let catIcon = 'fa-car';
        let catLabel = 'Rental Mobil';
        const cat = (item.category || '').toLowerCase();
        if (cat === 'motorcycle') { catIcon = 'fa-motorcycle'; catLabel = 'Rental Motor'; }
        else if (cat === 'package' || cat === 'tour') { catIcon = 'fa-umbrella-beach'; catLabel = 'Paket Wisata'; }
        else if (cat === 'honeymoon') { catIcon = 'fa-heart'; catLabel = 'Paket Honeymoon'; }
        else if (cat === 'drone') { catIcon = 'fa-plane-up'; catLabel = 'Sewa Drone'; }
        else if (cat === 'transfer' || cat === 'airport') { catIcon = 'fa-plane-departure'; catLabel = 'Antar Jemput'; }
        
        const priceFormatted = typeof formatPrice === 'function' ? formatPrice(item.price) : `Rp ${Number(item.price || 0).toLocaleString('id-ID')}`;
        const unit = item.duration ? `/ ${item.duration}` : (cat === 'package' ? '/ paket' : '/ hari');
        const safeTitle = (item.title || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const safeImg = item.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600';
        
        return `
        <div class="aira-mini-card">
            <div class="aira-card-img-box">
                <img src="${safeImg}" alt="${safeTitle}" onerror="this.src='/logo.png'">
                <span class="aira-card-badge"><i class="fa-solid ${catIcon}"></i> ${catLabel}</span>
            </div>
            <div class="aira-card-info">
                <h5 class="aira-card-name" title="${safeTitle}">${item.title}</h5>
                <div class="aira-card-pricing">
                    <span class="aira-card-price-start">Mulai dari</span>
                    <div class="aira-card-price-val">${priceFormatted} <small>${unit}</small></div>
                </div>
                <div class="aira-card-actions">
                    <button type="button" onclick="window.openTourModal('${item.id}')" class="aira-card-btn-detail" title="Lihat Detail & Fasilitas">
                        <i class="fa-solid fa-circle-info"></i> Detail Lengkap
                    </button>
                    <div class="aira-card-actions-row">
                        <button type="button" onclick="window.openCheckoutModal('${safeTitle}', ${item.price}, 'wa')" class="aira-card-btn-wa" title="Pesan via WhatsApp">
                            <i class="fa-brands fa-whatsapp"></i> via WA
                        </button>
                        <button type="button" onclick="window.openCheckoutModal('${safeTitle}', ${item.price}, 'web')" class="aira-card-btn-web" title="Pesan Form via Website Langsung">
                            <i class="fa-solid fa-desktop"></i> via Web
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    return `
    <div class="aira-mini-cards-wrapper">
        <div class="aira-mini-cards-scroll">
            ${cardsHtml}
        </div>
    </div>
    `;
}

function shouldShowAiraWaLead(markdown, recommendedItems) {
    if (recommendedItems && recommendedItems.length > 0) return true;
    if (!markdown) return false;
    const re = /(booking|pesan|sewa|rental|paket|tour|avanza|innova|hiace|brio|xpander|alphard|fortuner|motor|mobil|lepas kunci|driver|supir|sopir|jemput|antar jemput|transfer|bandara|dp|deposit|harga|tarif|biaya|tersedia|rekening|kunci jadwal)/i;
    return re.test(markdown);
}

// Helper cerdas: Klasifikasi kategori layanan (Mobil, Motor, Tour, Transfer) secara akurat
function getLeadServiceClassification(items, markdown, userQuery) {
    const uq = (userQuery || '').toLowerCase();
    const md = (markdown || '').toLowerCase();

    // 1. Cek dari items rekomendasi jika ada (prioritas tertinggi)
    if (items && items.length > 0) {
        const itemCategories = items.map(i => (i.category || '').toLowerCase());
        const itemTitles = items.map(i => (i.title || '').toLowerCase()).join(' ');

        if (itemCategories.includes('car') || itemCategories.includes('mobil') ||
            /(avanza|innova|hiace|brio|xpander|alphard|fortuner|calya|sigra|raize|rocky|agya|ayla|ertiga|xl7|mobil)/i.test(itemTitles)) {
            return 'mobil';
        }
        if (itemCategories.includes('motorcycle') || itemCategories.includes('motor') ||
            /(nmax|scoopy|pcx|vario|beat|aerox|vespa|fazzio|motor)/i.test(itemTitles)) {
            return 'motor';
        }
        if (itemCategories.includes('package') || itemCategories.includes('tour') ||
            /(tour|paket wisata|honeymoon|private trip|snorkeling)/i.test(itemTitles)) {
            return 'tour';
        }
        if (itemCategories.includes('transfer') || itemCategories.includes('airport')) {
            return 'transfer';
        }
    }

    // 2. Cek dari pertanyaan user langsung
    if (/(avanza|innova|hiace|brio|xpander|alphard|fortuner|calya|sigra|raize|rocky|agya|ayla|ertiga|xl7|mobil|sewa mobil|rental mobil)/i.test(uq)) {
        return 'mobil';
    }
    if (/(nmax|scoopy|pcx|vario|beat|aerox|vespa|fazzio|motor|sewa motor|rental motor)/i.test(uq)) {
        return 'motor';
    }
    if (/(antar jemput|drop off|pick up|jemput bandara|antar bandara|transfer bandara)/i.test(uq)) {
        return 'transfer';
    }
    if (/(paket tour|paket wisata|private trip|honeymoon|tour lombok)/i.test(uq)) {
        return 'tour';
    }

    // 3. Cek spesifik dari markdown AI
    if (/(avanza|innova|hiace|brio|xpander|alphard|fortuner|calya|sigra|sewa mobil|rental mobil)/i.test(md)) {
        return 'mobil';
    }
    if (/(sewa motor|rental motor|nmax|scoopy|pcx|vario|beat)/i.test(md)) {
        return 'motor';
    }
    if (/(antar jemput bandara|transfer bandara)/i.test(md)) {
        return 'transfer';
    }
    if (/(paket tour|paket wisata|private trip|honeymoon trip)/i.test(md)) {
        return 'tour';
    }

    return 'mobil';
}

function getIsWithDriver(items, markdown, userQuery) {
    const text = ((userQuery || '') + ' ' + (markdown || '')).toLowerCase();
    if (/(lepas kunci|tanpa supir|tanpa driver|tanpa sopir|self drive|self-drive)/i.test(text)) {
        return false;
    }
    if (/(dengan supir|dengan driver|dengan sopir|include supir|include driver|all in|all-in|plus supir|plus driver)/i.test(text)) {
        return true;
    }
    if (items && items.length > 0) {
        if (items.some(i => i.driverOptions && i.driverOptions !== 'Tidak Include Driver')) {
            return true;
        }
    }
    return false;
}

function getServicePaymentTerms(category, withDriver) {
    if (category === 'mobil') {
        if (withDriver) {
            return {
                dp: 'Rp 200.000 (Kunci mobil & supir resmi)',
                deposit: 'Rp 0 (BEBAS DEPOSIT karena didampingi supir resmi)',
                badgeDp: 'Rp 200rb (Kunci Mobil & Supir)',
                badgeDeposit: 'Bebas Deposit (Rp 0 include driver)'
            };
        } else {
            return {
                dp: 'Rp 200.000 (Kunci jadwal & unit mobil)',
                deposit: 'Rp 1.000.000 (100% Refund dikembalikan penuh saat mobil kembali aman)',
                badgeDp: 'Rp 200rb (Kunci Jadwal & Unit)',
                badgeDeposit: 'Rp 1jt (100% Refundable)'
            };
        }
    } else if (category === 'motor') {
        return {
            dp: 'Rp 50.000 (Kunci unit motor)',
            deposit: 'Rp 500.000 (100% Refund dikembalikan penuh saat motor kembali aman)',
            badgeDp: 'Rp 50rb (Kunci Unit)',
            badgeDeposit: 'Rp 500rb (100% Refundable)'
        };
    } else if (category === 'tour') {
        return {
            dp: 'Rp 500.000 (Kunci armada, jadwal & guide)',
            deposit: 'Rp 0 (BEBAS DEPOSIT untuk Paket Tour)',
            badgeDp: 'Rp 500rb (Kunci Armada & Guide)',
            badgeDeposit: 'Bebas Deposit (Rp 0)'
        };
    } else if (category === 'transfer') {
        return {
            dp: 'Rp 100.000 / Pelunasan saat tiba',
            deposit: 'Rp 0 (BEBAS DEPOSIT untuk Antar Jemput)',
            badgeDp: 'Rp 100rb / Pelunasan Tiba',
            badgeDeposit: 'Bebas Deposit (Rp 0)'
        };
    }
    return {
        dp: 'Rp 200.000 (Kunci jadwal & unit mobil)',
        deposit: 'Rp 1.000.000 (100% Refund dikembalikan penuh saat mobil kembali aman)',
        badgeDp: 'Rp 200rb (Kunci Jadwal & Unit)',
        badgeDeposit: 'Rp 1jt (100% Refundable)'
    };
}

function renderAiraWaLeadCard(markdown, recommendedItems) {
    const encodedText = encodeURIComponent(markdown || '').replace(/'/g, "\\'");
    
    // Ambil lastUserQuery jika ada
    let lastUserQuery = '';
    if (typeof chatHistory !== 'undefined' && Array.isArray(chatHistory)) {
        for (let i = chatHistory.length - 1; i >= 0; i--) {
            if (chatHistory[i].role === 'user' && chatHistory[i].parts && chatHistory[i].parts[0]?.text) {
                lastUserQuery = chatHistory[i].parts[0].text.trim();
                break;
            }
        }
    }

    const category = getLeadServiceClassification(recommendedItems, markdown, lastUserQuery);
    const withDriver = getIsWithDriver(recommendedItems, markdown, lastUserQuery);
    const terms = getServicePaymentTerms(category, withDriver);

    const isFreeDeposit = terms.deposit.includes('BEBAS DEPOSIT');
    const depositClass = isFreeDeposit ? 'style="color:#059669;"' : '';

    const highlightBadges = `
        <div class="aira-lead-terms-row">
            <span class="aira-lead-badge-item"><strong>DP:</strong> ${terms.badgeDp}</span>
            <span class="aira-lead-badge-item" ${depositClass}><strong>Deposit Jaminan:</strong> ${terms.badgeDeposit}</span>
        </div>
    `;

    return `
    <div class="aira-wa-lead-card">
        <div class="aira-wa-lead-header">
            <span class="aira-wa-lead-pill"><i class="fa-solid fa-bolt"></i> Auto-Summary Lead</span>
            <span class="aira-wa-lead-sub">Pesan instan via WhatsApp atau Web</span>
        </div>
        <div class="aira-wa-lead-buttons-group">
            <button type="button" onclick="window.orderViaWhatsAppFromAira(this, '${encodedText}')" class="aira-wa-lead-action-btn" title="Lanjut Booking via WhatsApp CS">
                <span class="aira-wa-lead-btn-icon"><i class="fa-brands fa-whatsapp"></i></span>
                <div class="aira-wa-lead-btn-content">
                    <span class="aira-wa-lead-btn-title">📲 Booking via WhatsApp CS</span>
                    <span class="aira-wa-lead-btn-desc">Buka WA dengan rangkuman detail pesanan otomatis</span>
                </div>
                <i class="fa-solid fa-arrow-right aira-wa-lead-arrow"></i>
            </button>
            <button type="button" onclick="window.orderViaWebFromAira(this, '${encodedText}')" class="aira-web-lead-action-btn" title="Buka Form Booking Online Resmi via Web">
                <span class="aira-wa-lead-btn-icon" style="color: #0284c7;"><i class="fa-solid fa-desktop"></i></span>
                <div class="aira-wa-lead-btn-content">
                    <span class="aira-wa-lead-btn-title" style="color: #0369a1; font-size: 0.9rem; font-weight: 800;">🌐 Form Booking via Web</span>
                    <span class="aira-wa-lead-btn-desc" style="color: #64748b; font-size: 0.72rem;">Buka formulir pemesanan resmi langsung di website</span>
                </div>
                <i class="fa-solid fa-chevron-right aira-wa-lead-arrow" style="color: #0284c7;"></i>
            </button>
        </div>
        <div class="aira-wa-lead-terms-box">
            <div class="aira-wa-lead-terms-title">
                <i class="fa-solid fa-shield-halved"></i> <strong>Ketentuan DP & Deposit Resmi:</strong>
            </div>
            ${highlightBadges}
            <div class="aira-wa-lead-terms-note">
                <i class="fa-solid fa-circle-check" style="color:#10b981;"></i> DP mengunci jadwal agar aman &bull; Deposit jaminan 100% kembali setelah sewa
            </div>
        </div>
    </div>
    `;
}

window.orderViaWhatsAppFromAira = (btnElem, encodedMarkdown) => {
    let md = '';
    try {
        md = decodeURIComponent(encodedMarkdown || '');
    } catch(e) {
        md = encodedMarkdown || '';
    }

    // 1. Ambil pesan terakhir user dari chatHistory
    let lastUserQuery = '';
    if (typeof chatHistory !== 'undefined' && Array.isArray(chatHistory)) {
        for (let i = chatHistory.length - 1; i >= 0; i--) {
            if (chatHistory[i].role === 'user' && chatHistory[i].parts && chatHistory[i].parts[0]?.text) {
                lastUserQuery = chatHistory[i].parts[0].text.trim();
                break;
            }
        }
    }

    // 2. Deteksi item rekomendasi
    const items = typeof detectRecommendedItems === 'function' ? detectRecommendedItems(md) : [];
    let itemTitle = '';
    let itemPrice = '';

    // Deteksi durasi hari
    let durationDays = 0;
    const durMatch = ((lastUserQuery || '') + ' ' + (md || '')).match(/(\d+)\s*(?:hari|day|h\b)/i);
    if (durMatch) {
        durationDays = parseInt(durMatch[1], 10);
    }

    if (items && items.length > 0) {
        itemTitle = items.map(i => i.title).join(' / ');
        const prices = items.map(i => Number(i.price || 0)).filter(p => p > 0);
        
        if (prices.length === 1) {
            const p = prices[0];
            const pFmt = typeof formatPrice === 'function' ? formatPrice(p) : `Rp ${p.toLocaleString('id-ID')}`;
            if (durationDays > 1) {
                const totalP = p * durationDays;
                const totalFmt = typeof formatPrice === 'function' ? formatPrice(totalP) : `Rp ${totalP.toLocaleString('id-ID')}`;
                itemPrice = `${pFmt} / hari (Total ${durationDays} Hari: ${totalFmt})`;
            } else {
                itemPrice = `${pFmt} / hari`;
            }
        } else if (prices.length > 1) {
            const minP = Math.min(...prices);
            const maxP = Math.max(...prices);
            const minFmt = typeof formatPrice === 'function' ? formatPrice(minP) : `Rp ${minP.toLocaleString('id-ID')}`;
            const maxFmt = typeof formatPrice === 'function' ? formatPrice(maxP) : `Rp ${maxP.toLocaleString('id-ID')}`;
            if (durationDays > 1) {
                const totalMin = minP * durationDays;
                const totalMax = maxP * durationDays;
                const totalMinFmt = typeof formatPrice === 'function' ? formatPrice(totalMin) : `Rp ${totalMin.toLocaleString('id-ID')}`;
                const totalMaxFmt = typeof formatPrice === 'function' ? formatPrice(totalMax) : `Rp ${totalMax.toLocaleString('id-ID')}`;
                itemPrice = `${minFmt} - ${maxFmt} / hari (Total ${durationDays} Hari: ${totalMinFmt} - ${totalMaxFmt})`;
            } else {
                itemPrice = `${minFmt} - ${maxFmt} / hari`;
            }
        } else {
            itemPrice = items.map(i => (typeof formatPrice === 'function' ? formatPrice(i.price) : `Rp ${Number(i.price || 0).toLocaleString('id-ID')}`)).join(', ');
        }
    } else {
        // Deteksi dari teks bila tidak ada ID eksplisit
        const combined = (lastUserQuery + ' ' + md).toLowerCase();
        if (combined.includes('avanza')) itemTitle = 'Toyota Avanza';
        else if (combined.includes('innova zenix')) itemTitle = 'Toyota Innova Zenix';
        else if (combined.includes('innova reborn')) itemTitle = 'Toyota Innova Reborn';
        else if (combined.includes('innova')) itemTitle = 'Toyota Innova';
        else if (combined.includes('hiace')) itemTitle = 'Toyota Hiace Commuter / Premio';
        else if (combined.includes('brio')) itemTitle = 'Honda Brio';
        else if (combined.includes('xpander')) itemTitle = 'Mitsubishi Xpander';
        else if (combined.includes('fortuner')) itemTitle = 'Toyota Fortuner';
        else if (combined.includes('alphard')) itemTitle = 'Toyota Alphard';
        else if (combined.includes('nmax') || combined.includes('scoopy') || combined.includes('sewa motor') || combined.includes('rental motor')) itemTitle = 'Sewa Motor Lombok';
        else if (combined.includes('tour') || combined.includes('paket')) itemTitle = 'Paket Tour Wisata Lombok';
        else if (combined.includes('antar jemput') || combined.includes('bandara') || combined.includes('transfer')) itemTitle = 'Antar Jemput Bandara BIL (Airport Transfer)';
        else itemTitle = 'Layanan Rekomendasi AIRA';
    }

    // Ekstraksi estimasi harga dari teks jika itemPrice belum terdeteksi
    if (!itemPrice) {
        const priceMatch = md.match(/Rp\s?[\d.,]+(?:\/\s?[a-zA-Z]+)?/i);
        if (priceMatch) {
            itemPrice = priceMatch[0];
            if (durationDays > 1 && !itemPrice.includes('Total')) {
                itemPrice += ` (Durasi ${durationDays} Hari)`;
            }
        }
    }

    // Klasifikasi kategori yang akurat
    const category = getLeadServiceClassification(items, md, lastUserQuery);
    const withDriver = getIsWithDriver(items, md, lastUserQuery);
    const terms = getServicePaymentTerms(category, withDriver);

    // Susun pesan WhatsApp yang rapi dan profesional
    let waMsg = `Halo CS Travel Lombok Airport, 👋\n` +
                 `Saya mau booking sesuai rekomendasi AIRA:\n\n` +
                 `📌 *Layanan:* ${itemTitle}\n`;

    if (itemPrice) {
        waMsg += `💰 *Estimasi Tarif:* ${itemPrice}\n`;
    }

    if (lastUserQuery) {
        const cleanQuery = lastUserQuery.replace(/[\r\n]+/g, ' ').trim();
        const displayQuery = cleanQuery.length > 140 ? cleanQuery.substring(0, 137) + '...' : cleanQuery;
        waMsg += `📝 *Kebutuhan Saya:* "${displayQuery}"\n`;
    }

    waMsg += `\nℹ️ *Ketentuan Pembayaran (DP & Deposit):*\n` +
             `• *DP (Booking Fee):* ${terms.dp}\n` +
             `• *Deposit Jaminan:* ${terms.deposit}\n\n` +
             `Apakah unit dan jadwal tersebut masih tersedia? Mohon info nomor rekening resmi admin untuk konfirmasi pembayaran DP. Terima kasih! 🙏`;

    const adminWa = '6289676963255';
    const targetUrl = `https://wa.me/${adminWa}?text=${encodeURIComponent(waMsg)}`;
    
    if (btnElem) {
        btnElem.style.transform = 'scale(0.97)';
        setTimeout(() => {
            if (btnElem) btnElem.style.transform = '';
        }, 150);
    }

    window.open(targetUrl, '_blank');
};

window.orderViaWebFromAira = (btnElem, encodedMarkdown) => {
    let md = '';
    try {
        md = decodeURIComponent(encodedMarkdown || '');
    } catch(e) {
        md = encodedMarkdown || '';
    }

    if (btnElem) {
        btnElem.style.transform = 'scale(0.97)';
        setTimeout(() => { if (btnElem) btnElem.style.transform = ''; }, 150);
    }

    // Ambil pesan terakhir user dari chatHistory
    let lastUserQuery = '';
    if (typeof chatHistory !== 'undefined' && Array.isArray(chatHistory)) {
        for (let i = chatHistory.length - 1; i >= 0; i--) {
            if (chatHistory[i].role === 'user' && chatHistory[i].parts && chatHistory[i].parts[0]?.text) {
                lastUserQuery = chatHistory[i].parts[0].text.trim();
                break;
            }
        }
    }

    const items = typeof detectRecommendedItems === 'function' ? detectRecommendedItems(md) : [];
    if (items && items.length > 0) {
        const first = items[0];
        window.openCheckoutModal(first.title, first.price, 'web');
        return;
    }

    // Fallback: deteksi kategori layanan
    const category = typeof getLeadServiceClassification === 'function' ? getLeadServiceClassification([], md, lastUserQuery) : 'mobil';
    let defaultTitle = 'Sewa Mobil';
    if (category === 'motor') defaultTitle = 'Sewa Motor';
    else if (category === 'tour') defaultTitle = 'Paket Tour';
    else if (category === 'transfer') defaultTitle = 'Airport Transfer';

    window.openCheckoutModal(defaultTitle, 0, 'web');
};

window.handleAiraBookingLinkClick = (text, url) => {
    const combined = ((text || '') + ' ' + (url || '')).toLowerCase();
    let matchedItem = null;

    if (window.globalItems && Array.isArray(window.globalItems)) {
        // Hanya cari item yang berharga valid (> 0) dan bukan folder parent
        const validPool = window.globalItems.filter(i => Number(i.price || 0) > 0 && !i.isParent);
        matchedItem = validPool.find(item => {
            const title = (item.title || '').toLowerCase();
            return combined.includes(title) || title.includes(combined.replace(/(form|pemesanan|sewa|rental|booking|order)/g, '').trim());
        });

        if (!matchedItem) {
            const keywords = ['beat', 'scoopy', 'nmax', 'pcx', 'vario', 'aerox', 'fazzio', 'avanza', 'innova', 'hiace', 'brio', 'xpander', 'alphard', 'fortuner', 'honeymoon'];
            for (const kw of keywords) {
                if (combined.includes(kw)) {
                    matchedItem = validPool.find(item => (item.title || '').toLowerCase().includes(kw));
                    if (matchedItem) break;
                }
            }
        }
    }

    if (matchedItem) {
        window.openCheckoutModal(matchedItem.title, matchedItem.price, 'web');
    } else {
        const cleanTitle = (text || '').replace(/^(form\s+pemesanan\s+|form\s+booking\s+|form\s+|sewa\s+|rental\s+)/i, '').trim();
        window.openCheckoutModal(cleanTitle || 'Pemesanan Layanan', 0, 'web');
    }
};

function parseMarkdownToHTML(markdown, isTyping = false) {
    let html = markdown;
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 1. Convert item links (?item=ID) to interactive modal links
    html = html.replace(/\[(.*?)\]\((.*?)(?:\?|&)item=([a-zA-Z0-9_\-]+)\)/gi, (match, text, url, id) => {
        return `<a href="javascript:void(0)" onclick="window.openTourModal('${id}')" class="aira-chat-pill-link"><i class="fa-solid fa-tag"></i> ${text}</a>`;
    });

    // 2. Cegah error 404: Intercept link booking/form/pemesanan markdown agar langsung buka popup form resmi web
    html = html.replace(/\[(.*?(?:form|booking|pesan|order|sewa|rental).*?)\]\((.*?)\)/gi, (match, text, url) => {
        const cleanText = text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const cleanUrl = url.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        return `<a href="javascript:void(0)" onclick="window.handleAiraBookingLinkClick('${cleanText}', '${cleanUrl}')" class="aira-chat-pill-link aira-chat-booking-link" title="Buka Form Booking Resmi Website"><i class="fa-solid fa-file-signature"></i> ${text} (Form Web)</a>`;
    });

    // 3. Links [Text](URL) umum - deteksi khusus Google Maps agar menjadi tombol navigasi rute mewah
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, (match, text, url) => {
        const trimmedUrl = (url || '').trim();
        const cleanText = text.replace(/'/g, "\\'").replace(/"/g, '&quot;');

        // Intercept Google Maps: ubah menjadi tombol navigasi rute Google Maps interaktif yang menarik
        if (trimmedUrl.includes('google.com/maps') || trimmedUrl.includes('maps.google.com') || trimmedUrl.includes('goo.gl/maps')) {
            const isFood = /kuliner|makan|taliwang|rembiga|puyung|bulayak|bebalung|warung|resto|pedas|inaq/i.test(text + ' ' + url);
            const extraClass = isFood ? 'aira-maps-btn-food' : '';
            return `<a href="${trimmedUrl}" target="_blank" rel="noopener noreferrer" class="aira-maps-btn ${extraClass}" title="Buka Rute di Google Maps"><i class="fa-solid fa-map-location-dot"></i> <span>${cleanText}</span> <i class="fa-solid fa-arrow-up-right-from-square aira-maps-ext-icon"></i></a>`;
        }

        if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://') && !trimmedUrl.startsWith('#') && !trimmedUrl.startsWith('mailto:') && !trimmedUrl.startsWith('tel:')) {
            const cleanUrl = trimmedUrl.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            return `<a href="javascript:void(0)" onclick="window.handleAiraBookingLinkClick('${cleanText}', '${cleanUrl}')" class="aira-chat-pill-link aira-chat-booking-link"><i class="fa-solid fa-circle-arrow-right"></i> ${text}</a>`;
        }
        return `<a href="${trimmedUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    });

    // Newlines
    html = html.replace(/\n/g, '<br>');
    
    if (!isTyping) {
        // Detect recommended items and append interactive mini-cards
        const recommendedItems = detectRecommendedItems(markdown);
        if (recommendedItems.length > 0) {
            html += renderAiraMiniCards(recommendedItems);
        }

        // WhatsApp Auto-Summary Lead Button & DP/Deposit Note
        if (shouldShowAiraWaLead(markdown, recommendedItems)) {
            html += renderAiraWaLeadCard(markdown, recommendedItems);
        }

        // Tambahkan tombol copy pesan
        const encodedText = encodeURIComponent(markdown).replace(/'/g, "\\'");
        html += `
        <div style="text-align: right; margin-top: 8px;">
            <button onclick="window.copyAiMessage(this, decodeURIComponent('${encodedText}'))" class="copy-ai-msg-btn" title="Salin Pesan" style="background: rgba(255,255,255,0.5); border: 1px solid #cbd5e1; border-radius: 6px; color: #475569; cursor: pointer; font-size: 0.75rem; font-weight: 600; padding: 4px 8px; transition: all 0.2s; display: inline-flex; align-items: center; gap: 5px;">
                <i class="fa-regular fa-copy"></i> Salin
            </button>
        </div>`;
    }

    return html;
}

window._simulateTyping = (containerId, markdownText, onComplete) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let i = 0;
    let currentText = '';
    const speed = 10; // ms per char

    function type() {
        if (i < markdownText.length) {
            // grab the next chunk to support fast typing
            const chunk = markdownText.substr(i, 2); 
            currentText += chunk;
            i += 2;
            container.innerHTML = parseMarkdownToHTML(currentText, true) + '<span class="cs-typewriter-cursor">|</span>';
            const msgs = document.getElementById('chat-messages');
            if (msgs) msgs.scrollTop = msgs.scrollHeight;
            setTimeout(type, speed);
        } else {
            container.innerHTML = parseMarkdownToHTML(markdownText, false);
            const msgs = document.getElementById('chat-messages');
            if (msgs) msgs.scrollTop = msgs.scrollHeight;
            if (onComplete) onComplete();
        }
    }
    setTimeout(type, 50);
};

window.copyAiMessage = (btnElem, text) => {
    navigator.clipboard.writeText(text).then(() => {
        const originalHtml = btnElem.innerHTML;
        const originalStyle = btnElem.style.cssText;
        
        btnElem.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin';
        btnElem.style.color = '#16a34a';
        btnElem.style.borderColor = '#16a34a';
        btnElem.style.background = '#dcfce7';
        
        setTimeout(() => {
            btnElem.innerHTML = originalHtml;
            btnElem.style.cssText = originalStyle;
        }, 2000);
    }).catch(err => console.error('Gagal menyalin:', err));
};

window.checkGuestLimit = () => {
    const isLogged = !!localStorage.getItem('auth_token') || !!localStorage.getItem('auth_user');
    const inputArea = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat-btn');
    const micBtn = document.getElementById('mic-chat-btn');
    const banner = document.getElementById('guest-limit-banner');
    const chipsWrapper = document.getElementById('aira-chips-wrapper');
    const chipsBar = document.getElementById('aira-quick-chips-bar');
    const qrContainer = document.getElementById('ai-quick-replies');
    
    if (!isLogged) {
        // count user messages
        const userMessagesCount = chatHistory.filter(msg => msg.role === 'user').length;
        if (userMessagesCount >= 3) {
            if (inputArea) { 
                inputArea.disabled = true; 
                inputArea.placeholder = 'Login untuk bertanya lebih banyak...'; 
                inputArea.value = ''; 
            }
            if (sendBtn) {
                sendBtn.disabled = true;
                sendBtn.style.opacity = '0.5';
                sendBtn.style.cursor = 'not-allowed';
            }
            if (micBtn) {
                micBtn.disabled = true;
                micBtn.style.opacity = '0.5';
                micBtn.style.cursor = 'not-allowed';
            }
            if (chipsWrapper) chipsWrapper.style.display = 'none';
            else if (chipsBar) chipsBar.style.display = 'none';
            if (qrContainer) qrContainer.style.display = 'none';
            if (banner) banner.style.display = 'block';
            return true;
        }
    }
    // Hide banner if logged in or under limit
    if (banner) banner.style.display = 'none';
    if (chipsWrapper) chipsWrapper.style.display = 'flex';
    else if (chipsBar) chipsBar.style.display = 'flex';
    if (qrContainer) qrContainer.style.display = 'flex';
    if (inputArea) { 
        inputArea.disabled = false; 
        inputArea.placeholder = 'Tanya rekomendasi paket...'; 
    }
    if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.style.opacity = '1';
        sendBtn.style.cursor = 'pointer';
    }
    if (micBtn) {
        micBtn.disabled = false;
        micBtn.style.opacity = '1';
        micBtn.style.cursor = 'pointer';
    }
    return false;
};

// --- AIRA QUICK CHIPS LAPTOP & DESKTOP SCROLL SUPPORT ---
window.scrollAiraChips = (offset) => {
    const bar = document.getElementById('aira-quick-chips-bar');
    if (bar) {
        bar.scrollBy({ left: offset, behavior: 'smooth' });
    }
};

window.initChipsScroll = () => {
    const bar = document.getElementById('aira-quick-chips-bar');
    if (!bar || bar.dataset.scrollInited) return;
    bar.dataset.scrollInited = 'true';

    // 1. Mouse wheel horizontal scrolling on laptop/desktop
    bar.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
            e.preventDefault();
            bar.scrollLeft += e.deltaY * 0.9;
        }
    }, { passive: false });

    // 2. Click and drag (grab & slide) on laptop/desktop
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let moved = false;

    bar.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Only primary mouse button
        isDown = true;
        moved = false;
        bar.classList.add('is-dragging');
        startX = e.pageX - bar.offsetLeft;
        scrollStart = bar.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
        if (!isDown) return;
        isDown = false;
        bar.classList.remove('is-dragging');
        if (moved) {
            bar.dataset.preventClick = 'true';
            setTimeout(() => { delete bar.dataset.preventClick; }, 100);
        }
    });

    bar.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const x = e.pageX - bar.offsetLeft;
        const walk = x - startX;
        if (Math.abs(walk) > 4) {
            moved = true;
            e.preventDefault();
            bar.scrollLeft = scrollStart - (walk * 1.2);
        }
    });

    // Intercept click when user was dragging
    bar.addEventListener('click', (e) => {
        if (bar.dataset.preventClick) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);
};

let aiSpeechRecognition = null;
let isAiRecording = false;

window.toggleVoiceInput = () => {
    if (window.checkGuestLimit()) {
        if (typeof window.openAuthModal === 'function') {
            window.openAuthModal('login');
        }
        return;
    }
    const micBtn = document.getElementById('mic-chat-btn');
    const input = document.getElementById('chat-input');
    
    if (isAiRecording) {
        if (aiSpeechRecognition) aiSpeechRecognition.stop();
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('Browser Anda belum mendukung fitur Voice Command. Silakan gunakan Google Chrome versi terbaru.');
        return;
    }

    aiSpeechRecognition = new SpeechRecognition();
    aiSpeechRecognition.lang = 'id-ID';
    aiSpeechRecognition.interimResults = false;
    aiSpeechRecognition.maxAlternatives = 1;

    aiSpeechRecognition.onstart = () => {
        isAiRecording = true;
        if(!document.getElementById('mic-pulse-css')) {
            const style = document.createElement('style');
            style.id = 'mic-pulse-css';
            style.innerHTML = `@keyframes pulse-mic { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }`;
            document.head.appendChild(style);
        }
        if (micBtn) {
            micBtn.style.color = '#ef4444';
            micBtn.style.animation = 'pulse-mic 1s infinite';
        }
        if (input) input.placeholder = 'Mendengarkan suara Anda...';
    };

    aiSpeechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (input) input.value = transcript;
        setTimeout(() => window.sendChatMessage(), 300);
    };

    aiSpeechRecognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        
        isAiRecording = false;
        if (micBtn) {
            micBtn.style.color = '#64748b';
            micBtn.style.animation = 'none';
        }
        if (input) input.placeholder = 'Tanya rekomendasi paket...';

        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.insertAdjacentHTML('beforeend', `
                <div class="message ai-message" style="background-color: #fee2e2; color: #991b1b; border: 1px solid #f87171;">
                    <i class="fa-solid fa-triangle-exclamation"></i> Gagal mendeteksi mikrofon. Browser Anda menolak akses. Pastikan Anda mengklik "Allow/Izinkan" pada setelan mikrofon di browser.
                </div>
            `);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    };

    aiSpeechRecognition.onend = () => {
        isAiRecording = false;
        if (micBtn) {
            micBtn.style.color = '#64748b';
            micBtn.style.animation = 'none';
        }
        if (input) input.placeholder = 'Tanya rekomendasi paket...';
    };

    aiSpeechRecognition.start();
};

window.askAiraQuick = (query) => {
    if (window.checkGuestLimit()) {
        if (typeof window.openAuthModal === 'function') {
            window.openAuthModal('login');
        }
        return;
    }
    if (!query) return;
    const qrContainer = document.getElementById('ai-quick-replies');
    if (qrContainer) qrContainer.remove();

    const input = document.getElementById('chat-input');
    if (input) {
        input.value = query;
        window.sendChatMessage();
    } else {
        window.sendChatMessage(query);
    }
};

window.findNearestLombokFood = () => {
    if (window.checkGuestLimit()) {
        if (typeof window.openAuthModal === 'function') {
            window.openAuthModal('login');
        }
        return;
    }
    const qrContainer = document.getElementById('ai-quick-replies');
    if (qrContainer) qrContainer.remove();

    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    messagesContainer.insertAdjacentHTML('beforeend', `
        <div class="message user-message" style="background:linear-gradient(135deg, #f97316, #ea580c); color:white; box-shadow:0 4px 15px rgba(234, 88, 12, 0.3);">
            <i class="fa-solid fa-pepper-hot"></i> Cari Kuliner Khas Lombok Terdekat dari Lokasi Saya (GPS)
        </div>
    `);

    const typingId = 'typing-' + Date.now();
    messagesContainer.insertAdjacentHTML('beforeend', `
        <div id="${typingId}" class="typing-indicator">
            <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
    `);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const mapsUrl = `https://www.google.com/maps/search/Kuliner+Khas+Lombok+Ayam+Taliwang+Sate+Rembiga+Nasi+Balap/@${lat},${lng},14z`;

            setTimeout(() => {
                const t = document.getElementById(typingId);
                if (t) t.remove();

                let html = `
                    <div class="message ai-message" style="border: 1.5px solid #fed7aa; background: #fffaf5;">
                        <h4 style="color:#ea580c; margin:0 0 10px 0; display:flex; align-items:center; gap:8px;">
                            <i class="fa-solid fa-utensils"></i> 📍 Kuliner Khas Lombok Terdekat
                        </h4>
                        <p style="font-size:0.88rem; margin:0 0 10px 0; color:#334155;">
                            Lokasi Anda berhasil dideteksi! Klik tombol di bawah ini untuk melihat daftar rumah makan khas Lombok (Ayam Taliwang, Sate Rembiga, Nasi Balap, Bebalung) terdekat dari koordinat Anda langsung di Google Maps:
                        </p>
                        <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="aira-maps-btn aira-maps-btn-food" title="Buka Navigasi Rute Kuliner di Google Maps">
                            <i class="fa-solid fa-map-location-dot"></i>
                            <span>Buka Rute Kuliner Terdekat di Google Maps</span>
                            <i class="fa-solid fa-arrow-up-right-from-square aira-maps-ext-icon"></i>
                        </a>
                        <div style="margin-top: 10px; font-size: 0.8rem; color: #64748b; line-height: 1.4;">
                            💡 <em>Ingin berburu kuliner tanpa repot menyetir? Armada rental mobil & driver profesional Travel Lombok Airport siap mengantar Anda!</em>
                        </div>
                    </div>
                `;
                messagesContainer.insertAdjacentHTML('beforeend', html);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 700);
        }, (error) => {
            setTimeout(() => {
                const t = document.getElementById(typingId);
                if (t) t.remove();
                messagesContainer.insertAdjacentHTML('beforeend', `
                    <div class="message ai-message" style="border:1px solid #fed7aa; background:#fffaf5; color:#9a3412;">
                        <p style="margin:0 0 8px 0;"><strong>Akses GPS belum diizinkan atau dinonaktifkan.</strong> Jangan khawatir, berikut pencarian kuliner legendaris Lombok di Google Maps:</p>
                        <a href="https://www.google.com/maps/search/Kuliner+Khas+Lombok+Ayam+Taliwang+Sate+Rembiga+Nasi+Balap" target="_blank" rel="noopener noreferrer" class="aira-maps-btn aira-maps-btn-food">
                            <i class="fa-solid fa-map-location-dot"></i>
                            <span>Buka Rekomendasi Kuliner Lombok di Google Maps</span>
                            <i class="fa-solid fa-arrow-up-right-from-square aira-maps-ext-icon"></i>
                        </a>
                    </div>
                `);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 700);
        });
    } else {
        setTimeout(() => {
            const t = document.getElementById(typingId);
            if (t) t.remove();
            messagesContainer.insertAdjacentHTML('beforeend', `
                <div class="message ai-message" style="border:1px solid #fed7aa; background:#fffaf5; color:#9a3412;">
                    <a href="https://www.google.com/maps/search/Kuliner+Khas+Lombok+Ayam+Taliwang+Sate+Rembiga+Nasi+Balap" target="_blank" rel="noopener noreferrer" class="aira-maps-btn aira-maps-btn-food">
                        <i class="fa-solid fa-map-location-dot"></i>
                        <span>Buka Rekomendasi Kuliner Lombok di Google Maps</span>
                        <i class="fa-solid fa-arrow-up-right-from-square aira-maps-ext-icon"></i>
                    </a>
                </div>
            `);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 700);
    }
};

window.sendDeterministicReply = (userText, aiText) => {
    if (window.checkGuestLimit()) {
        if (typeof window.openAuthModal === 'function') {
            window.openAuthModal('login');
        }
        return;
    }
    const qrContainer = document.getElementById('ai-quick-replies');
    if (qrContainer) qrContainer.remove();

    const messagesContainer = document.getElementById('chat-messages');
    
    // Add user message
    messagesContainer.insertAdjacentHTML('beforeend', `
        <div class="message user-message">
            ${userText}
        </div>
    `);
    
    chatHistory.push({ role: 'user', parts: [{ text: userText }] });
    
    // Typing indicator
    const typingId = 'typing-' + Date.now();
    messagesContainer.insertAdjacentHTML('beforeend', `
        <div id="${typingId}" class="typing-indicator">
            <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
    `);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    setTimeout(() => {
        const t = document.getElementById(typingId);
        if (t) t.remove();
        
        const msgId = 'det-msg-' + Date.now();
        messagesContainer.insertAdjacentHTML('beforeend', `
            <div id="${msgId}" class="message ai-message"></div>
        `);
        
        chatHistory.push({ role: 'model', parts: [{ text: aiText }] });
        localStorage.setItem('aiChatHistory', JSON.stringify(chatHistory));
        
        window._simulateTyping(msgId, aiText);
    }, 800);
};

window.showAiraRoadsideEmergencySOS = () => {
    if (window.checkGuestLimit()) {
        if (typeof window.openAuthModal === 'function') {
            window.openAuthModal('login');
        }
        return;
    }
    const qrContainer = document.getElementById('ai-quick-replies');
    if (qrContainer) qrContainer.remove();

    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    messagesContainer.insertAdjacentHTML('beforeend', `
        <div class="message user-message" style="background:linear-gradient(135deg, #ef4444, #dc2626); color:white; box-shadow:0 4px 15px rgba(239, 68, 68, 0.3);">
            <i class="fa-solid fa-triangle-exclamation"></i> 🚨 Bantuan Darurat di Jalan & SOS 24/7 (SPBU, Bengkel, RS, CS Siaga)
        </div>
    `);
    
    const typingId = 'typing-' + Date.now();
    messagesContainer.insertAdjacentHTML('beforeend', `
        <div id="${typingId}" class="typing-indicator">
            <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
    `);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    const renderEmergencyCard = (coords) => {
        const t = document.getElementById(typingId);
        if (t) t.remove();

        const latParam = coords ? `@${coords.lat},${coords.lng},14z` : '';
        const spbuUrl = coords 
            ? `https://www.google.com/maps/search/SPBU+Pertamina/${latParam}`
            : 'https://www.google.com/maps/search/SPBU+Pertamina+Lombok';
        const bengkelUrl = coords 
            ? `https://www.google.com/maps/search/Bengkel+Mobil+Motor+Tambal+Ban/${latParam}`
            : 'https://www.google.com/maps/search/Bengkel+Mobil+Motor+Tambal+Ban+Lombok';
        const rsUrl = coords 
            ? `https://www.google.com/maps/search/Rumah+Sakit+Klinik+24+Jam/${latParam}`
            : 'https://www.google.com/maps/search/Rumah+Sakit+Klinik+24+Jam+Lombok';
        const apotekUrl = coords 
            ? `https://www.google.com/maps/search/Apotek+24+Jam/${latParam}`
            : 'https://www.google.com/maps/search/Apotek+24+Jam+Lombok';

        const waText = coords 
            ? `🚨 *SOS DARURAT TRAVEL LOMBOK AIRPORT!* 🚨\nSaya mengalami kendala di jalan saat sewa kendaraan / berwisata di Lombok.\n\n📍 *Koordinat GPS Lokasi Saya:*\nhttps://www.google.com/maps?q=${coords.lat},${coords.lng}\n\nMohon bantuan darurat dari tim Travel Lombok Airport sesegera mungkin! 🙏`
            : `🚨 *SOS DARURAT TRAVEL LOMBOK AIRPORT!* 🚨\nSaya mengalami kendala di jalan saat sewa kendaraan / berwisata di Lombok.\nMohon bantuan darurat dan arahan tim siaga sesegera mungkin! 🙏`;

        const waSosUrl = `https://wa.me/6289676963255?text=${encodeURIComponent(waText)}`;

        let html = `
            <div class="message ai-message" style="border: 1.5px solid #fca5a5; background: #fffaf9; padding: 12px 14px;">
                <div class="aira-emergency-card">
                    <div class="aira-emergency-header">
                        <div class="aira-emergency-beacon">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                        </div>
                        <div class="aira-emergency-title-box">
                            <h5>Pusat Bantuan Darurat & Siaga 24 Jam</h5>
                            <p>Layanan Darurat Wisatawan & Sewa Kendaraan Travel Lombok Airport</p>
                        </div>
                    </div>
                    
                    <p style="margin: 0; font-size: 0.8rem; color: #334155; line-height: 1.45;">
                        Tetap tenang ya Kak. Jika kendaraan mengalami kendala (ban bocor, mogok, kehabisan bensin), <strong>segera tepikan ke bahu jalan yang aman dan nyalakan lampu hazard</strong>. Pilih bantuan yang Anda butuhkan di bawah ini:
                    </p>

                    <a href="${waSosUrl}" target="_blank" rel="noopener noreferrer" class="aira-emergency-sos-action" title="Kirim Sinyal Darurat ke CS Siaga Travel Lombok">
                        <i class="fa-brands fa-whatsapp" style="font-size: 1.15rem;"></i>
                        <span>🚨 Kirim Sinyal SOS + Lokasi ke WhatsApp CS Siaga</span>
                    </a>

                    <div class="aira-emergency-grid">
                        <a href="${spbuUrl}" target="_blank" rel="noopener noreferrer" class="aira-emergency-grid-btn">
                            <i class="fa-solid fa-gas-pump" style="color: #dc2626;"></i>
                            <span>⛽ SPBU Terdekat</span>
                        </a>
                        <a href="${bengkelUrl}" target="_blank" rel="noopener noreferrer" class="aira-emergency-grid-btn">
                            <i class="fa-solid fa-wrench" style="color: #ea580c;"></i>
                            <span>🔧 Bengkel & Tambal Ban</span>
                        </a>
                        <a href="${rsUrl}" target="_blank" rel="noopener noreferrer" class="aira-emergency-grid-btn">
                            <i class="fa-solid fa-hospital" style="color: #0284c7;"></i>
                            <span>🏥 RS & Klinik 24 Jam</span>
                        </a>
                        <a href="${apotekUrl}" target="_blank" rel="noopener noreferrer" class="aira-emergency-grid-btn">
                            <i class="fa-solid fa-prescription-bottle-medical" style="color: #059669;"></i>
                            <span>💊 Apotek 24 Jam</span>
                        </a>
                    </div>

                    <div class="aira-emergency-contacts">
                        <div style="font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                            <i class="fa-solid fa-phone-volume"></i> Kontak Penting & Medis Darurat Lombok:
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                            <div>• CS Siaga: <a href="tel:089676963255" style="color:#b91c1c; font-weight:700;">0896-7696-3255</a></div>
                            <div>• Ambulans: <a href="tel:118" style="color:#b91c1c; font-weight:700;">118</a> / <a href="tel:119" style="color:#b91c1c; font-weight:700;">119</a></div>
                            <div>• Polisi: <a href="tel:110" style="color:#b91c1c; font-weight:700;">110</a></div>
                            <div>• RSUD Praya: <a href="tel:0370654007" style="color:#b91c1c; font-weight:700;">(0370) 654007</a></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', html);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setTimeout(() => renderEmergencyCard({ lat: pos.coords.latitude, lng: pos.coords.longitude }), 500);
            },
            () => {
                setTimeout(() => renderEmergencyCard(null), 500);
            },
            { timeout: 4000 }
        );
    } else {
        setTimeout(() => renderEmergencyCard(null), 500);
    }
};

window.showEmergencyCenter = window.showAiraRoadsideEmergencySOS;

window.askAiraAntiZonkSouvenirs = () => {
    if (window.checkGuestLimit()) {
        if (typeof window.openAuthModal === 'function') {
            window.openAuthModal('login');
        }
        return;
    }
    const qrContainer = document.getElementById('ai-quick-replies');
    if (qrContainer) qrContainer.remove();

    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    messagesContainer.insertAdjacentHTML('beforeend', `
        <div class="message user-message" style="background:linear-gradient(135deg, #f59e0b, #d97706); color:white; box-shadow:0 4px 15px rgba(245, 158, 11, 0.3);">
            <i class="fa-solid fa-bag-shopping"></i> 🛍️ Panduan Anti-Zonk Belanja Oleh-Oleh (Cek Mutiara, Madu & Tenun Asli)
        </div>
    `);

    const typingId = 'typing-' + Date.now();
    messagesContainer.insertAdjacentHTML('beforeend', `
        <div id="${typingId}" class="typing-indicator">
            <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
    `);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    setTimeout(() => {
        const t = document.getElementById(typingId);
        if (t) t.remove();

        const cardHtml = `
            <div class="message ai-message" style="border: 1.5px solid #fde68a; background: #fffdf5; padding: 12px 14px;">
                <div class="aira-oleholeh-card">
                    <div class="aira-oleholeh-header">
                        <i class="fa-solid fa-shield-halved" style="color: #f59e0b; font-size: 1.1rem;"></i>
                        <span>Panduan Anti-Zonk Belanja Oleh-Oleh Lombok</span>
                    </div>

                    <div style="font-size: 0.8rem; color: #475569; line-height: 1.45;">
                        Jangan sampai salah beli atau kemahalan ya Kak! Berikut tips rahasia mengecek keaslian oleh-oleh legendaris khas Lombok langsung dari warga lokal:
                    </div>

                    <div class="aira-oleholeh-tip-item">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <strong>🦪 1. Cek Keaslian Mutiara Sekarbela</strong>
                            <span class="aira-oleholeh-badge-pill"><i class="fa-solid fa-gem"></i> South Sea Pearls</span>
                        </div>
                        • <strong>Uji Gesek:</strong> Gesekkan 2 butir mutiara perlahan. Mutiara ASLI terasa kesat berpasir mikroskopis, dilap jari langsung mulus berkilau tanpa lecet. Mutiara palsu terasa licin & lapisannya mudah terkelupas.<br>
                        • <strong>Uji Suhu & Api:</strong> Mutiara asli terasa sejuk saat menyentuh kulit, tidak meleleh jika kena api sesaat. Selalu minta sertifikat grade (AAA/AA) & berat timbangan gram resmi.
                    </div>

                    <div class="aira-oleholeh-tip-item">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <strong>🧶 2. Tips Beli Kain Tenun Songket Sukarara</strong>
                            <span class="aira-oleholeh-badge-pill"><i class="fa-solid fa-scroll"></i> Tenun Tangan Asli</span>
                        </div>
                        • <strong>Ciri Songket Asli:</strong> Ditenun manual di alat tenun kayu berbulan-bulan, motif timbul di permukaan depan.<br>
                        • <strong>Sapaan Menawar Sopan (Basa Sasak):</strong> <em>"Solah gati tenun niki, kelaq sekedik nggih?"</em> (Indah sekali tenun ini, boleh dikurangi sedikit ya?).<br>
                        • <strong>Harga Wajar:</strong> Syal tenun ikat ~Rp 50rb - 150rb; Sarung tenun ikat halus ~Rp 150rb - 350rb; Songket sulam benang emas ~Rp 600rb - jutaan.
                    </div>

                    <div class="aira-oleholeh-tip-item">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <strong>🍯 3. Uji Madu Hutan Asli Sumbawa</strong>
                            <span class="aira-oleholeh-badge-pill"><i class="fa-solid fa-jar"></i> Honeycomb Effect</span>
                        </div>
                        • <strong>Uji Piring Heksagonal:</strong> Tuang 1 sendok madu di piring putih datar + sedikit air dingin, goyang memutar 10 detik. Madu murni asli akan membentuk pola heksagonal sarang lebah!<br>
                        • <strong>Uji Air:</strong> Teteskan ke segelas air bening, madu asli langsung mengendap utuh di dasar tanpa membuat air keruh.
                    </div>

                    <div class="aira-oleholeh-tip-item">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <strong>🌶️ 4. Kuliner Awet & Aman Bagasi Pesawat</strong>
                            <span class="aira-oleholeh-badge-pill"><i class="fa-solid fa-plane-circle-check"></i> Lolos Bandara</span>
                        </div>
                        • <strong>Nasi Balap Puyung:</strong> Minta sambal kedelai & abon kering dipisah agar awet 24-48 jam.<br>
                        • <strong>Dodol Rumput Laut:</strong> Tahan 6-12 bulan, aman untuk bagasi kabin.<br>
                        • <strong>Terasi Jerowaru:</strong> Wajib pilih kemasan vacuum seal rapat agar tidak mengeluarkan aroma di pesawat.<br>
                        • <strong>Kopi Asli Sembalun:</strong> Kopi Arabika lereng Rinjani beraroma fruity segar.
                    </div>

                    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px;">
                        <a href="https://www.google.com/maps/search/?api=1&query=Sentra+Mutiara+Sekarbela+Mataram+Lombok" target="_blank" rel="noopener noreferrer" class="aira-maps-btn" style="flex:1; min-width:140px; font-size:0.75rem; padding:7px 10px;">
                            <i class="fa-solid fa-map-location-dot"></i> Rute Mutiara Sekarbela
                        </a>
                        <a href="https://www.google.com/maps/search/?api=1&query=Desa+Wisata+Tenun+Sukarara+Lombok" target="_blank" rel="noopener noreferrer" class="aira-maps-btn" style="flex:1; min-width:140px; font-size:0.75rem; padding:7px 10px;">
                            <i class="fa-solid fa-map-location-dot"></i> Rute Tenun Sukarara
                        </a>
                    </div>

                    <div style="margin-top: 6px; font-size: 0.78rem; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 8px;">
                        💡 <em>Ingin belanja oleh-oleh bebas repot tanpa takut tersesat? Tim driver lokal Travel Lombok Airport siap mengantar & menemani Anda berbelanja dengan armada sewa harian all-in kami!</em>
                    </div>
                </div>
            </div>
        `;

        messagesContainer.insertAdjacentHTML('beforeend', cardHtml);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 700);
};

window.findNearestEmergency = () => {
    const messagesContainer = document.getElementById('chat-messages');
    
    messagesContainer.insertAdjacentHTML('beforeend', `
        <div class="message user-message" style="background:linear-gradient(135deg, #ef4444, #dc2626); color:white; box-shadow:0 4px 15px rgba(239, 68, 68, 0.3);">
            <i class="fa-solid fa-location-dot"></i> Cari RS / Klinik Terdekat
        </div>
    `);
    
    const typingId = 'typing-' + Date.now();
    messagesContainer.insertAdjacentHTML('beforeend', `
        <div id="${typingId}" class="typing-indicator">
            <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
    `);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const mapsUrl = `https://www.google.com/maps/search/Rumah+Sakit+Atau+Klinik+Terdekat/@${lat},${lng},14z`;
            
            setTimeout(() => {
                const t = document.getElementById(typingId);
                if (t) t.remove();
                
                let html = `
                    <div class="message ai-message">
                        📍 <strong>Lokasi Anda berhasil didapatkan!</strong><br><br>
                        Silakan klik tombol di bawah ini untuk melihat daftar Rumah Sakit & Klinik terdekat dari posisi Anda beserta panduan navigasinya di Google Maps.<br><br>
                        <a href="${mapsUrl}" target="_blank" style="display:flex; justify-content:center; align-items:center; gap:8px; margin-top:10px; background:linear-gradient(135deg, #10b981, #059669); color:white; padding:10px; border-radius:10px; text-decoration:none; font-weight:bold; box-shadow:0 4px 10px rgba(16, 185, 129, 0.3); transition:all 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'"><i class="fa-solid fa-map-location-dot"></i> Buka Google Maps</a>
                    </div>
                `;
                messagesContainer.insertAdjacentHTML('beforeend', html);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 800);
        }, (error) => {
            setTimeout(() => {
                const t = document.getElementById(typingId);
                if (t) t.remove();
                messagesContainer.insertAdjacentHTML('beforeend', `<div class="message ai-message" style="border:1px solid #fca5a5; background:#fef2f2; color:#b91c1c;">Mohon maaf, AIRA tidak dapat mengakses lokasi Anda. Pastikan Anda telah mengizinkan akses lokasi (GPS) pada browser Anda, atau Anda dapat mencari "Rumah Sakit Terdekat di Lombok" secara manual di Google Maps.</div>`);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 800);
        });
    } else {
        setTimeout(() => {
            const t = document.getElementById(typingId);
            if (t) t.remove();
            messagesContainer.insertAdjacentHTML('beforeend', `<div class="message ai-message" style="border:1px solid #fca5a5; background:#fef2f2; color:#b91c1c;">Browser Anda tidak mendukung fitur pelacakan lokasi. Silakan buka Google Maps dan cari secara manual.</div>`);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 800);
    }
};

window.shareLiveLocation = () => {
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.insertAdjacentHTML('beforeend', `
        <div class="message user-message" style="background:linear-gradient(135deg, #3b82f6, #2563eb); color:white; box-shadow:0 4px 15px rgba(59, 130, 246, 0.3);">
            <i class="fa-regular fa-share-from-square"></i> Bagikan Live Location
        </div>
    `);
    
    const typingId = 'typing-' + Date.now();
    messagesContainer.insertAdjacentHTML('beforeend', `
        <div id="${typingId}" class="typing-indicator">
            <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
    `);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const waUrl = `https://wa.me/6289676963255?text=DARURAT!%20Ini%20lokasi%20saya%20sekarang:%20https://www.google.com/maps?q=${lat},${lng}`;
            
            setTimeout(() => {
                const t = document.getElementById(typingId);
                if (t) t.remove();
                
                let html = `
                    <div class="message ai-message">
                        📍 <strong>Lokasi Anda Siap Dibagikan!</strong><br><br>
                        Klik tombol di bawah ini untuk mengirimkan lokasi presisi Anda saat ini ke tim Emergency Travel Lombok Airport via WhatsApp.<br><br>
                        <a href="${waUrl}" target="_blank" style="display:flex; justify-content:center; align-items:center; gap:8px; margin-top:10px; background:linear-gradient(135deg, #25D366, #128C7E); color:white; padding:10px; border-radius:10px; text-decoration:none; font-weight:bold; box-shadow:0 4px 10px rgba(37, 211, 102, 0.3); transition:all 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'"><i class="fa-brands fa-whatsapp"></i> Kirim via WhatsApp</a>
                    </div>
                `;
                messagesContainer.insertAdjacentHTML('beforeend', html);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 800);
        }, (error) => {
            setTimeout(() => {
                const t = document.getElementById(typingId);
                if (t) t.remove();
                messagesContainer.insertAdjacentHTML('beforeend', `<div class="message ai-message" style="border:1px solid #fca5a5; background:#fef2f2; color:#b91c1c;">Akses lokasi ditolak atau gagal didapatkan. Tidak dapat membuat link lokasi langsung. Silakan hubungi CS secara manual.</div>`);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 800);
        });
    }
};

window.sendChatMessage = async (retryMessage = null, errorBubbleElem = null) => {
    if (window.checkGuestLimit()) {
        const inputArea = document.getElementById('chat-input');
        if (inputArea) inputArea.value = '';
        if (typeof window.openAuthModal === 'function') {
            window.openAuthModal('login');
        }
        return;
    }

    const input = document.getElementById('chat-input');
    const message = retryMessage || input.value.trim();
    if (!message) return;

    if (!retryMessage) {
        // Clear input
        input.value = '';
    }
    
    const messagesContainer = document.getElementById('chat-messages');
    
    if (errorBubbleElem) {
        errorBubbleElem.remove();
    }
    
    if (!retryMessage) {
        // Add User Message
        messagesContainer.insertAdjacentHTML('beforeend', `
            <div class="message user-message">
                ${message}
            </div>
        `);
    }
    
    // Add Typing Indicator
    const typingId = 'typing-' + Date.now();
    const waitBubbleId = 'wait-bubble-' + Date.now();
    messagesContainer.insertAdjacentHTML('beforeend', `
        <div id="${typingId}" class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `);
    
    // Show a separate "please wait" bubble after 4.5 seconds if still loading
    const waitTimer = setTimeout(() => {
        const typingEl = document.getElementById(typingId);
        if (typingEl) { // Only show if still loading
            messagesContainer.insertAdjacentHTML('beforeend', `
                <div id="${waitBubbleId}" class="message ai-message" style="font-size: 0.78rem; color: #64748b; font-style: italic; background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 14px; max-width: 85%;">
                    ⏳ Mohon tunggu sebentar, sistem sedang melayani banyak antrean chat...
                </div>
            `);
            if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }, 4500);
    
    // Store timer so we can cancel it if response comes back fast
    window[`_waitTimer_${typingId}`] = waitTimer;
    window[`_waitBubbleId_${typingId}`] = waitBubbleId;
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        // Send email/user info if logged in
        let sessionId = localStorage.getItem('visitor_session_id') || 'guest';
        const user = JSON.parse(localStorage.getItem('auth_user') || 'null');
        const token = localStorage.getItem('auth_token');
        if (user && user.email) {
            sessionId = user.email;
        }

        // Get prayer data if available
        let prayerData = null;
        try {
            const storedPrayer = localStorage.getItem('prayerData');
            if (storedPrayer) {
                prayerData = JSON.parse(storedPrayer);
            }
        } catch(e) {}

        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/ai/chat`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ 
                message,
                history: chatHistory,
                sessionId: sessionId,
                userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                prayerData: prayerData
            })
        });

        const typingIndicator = document.getElementById(typingId);
        if (typingIndicator) typingIndicator.remove();
        // Clean up wait bubble and cancel its pending timer
        clearTimeout(window[`_waitTimer_${typingId}`]);
        const waitBubble = document.getElementById(window[`_waitBubbleId_${typingId}`]);
        if (waitBubble) waitBubble.remove();

        if (response.ok) {
            if (response.headers.get('content-type')?.includes('text/event-stream')) {
                const msgId = 'ai-msg-' + Date.now();
                messagesContainer.insertAdjacentHTML('beforeend', `
                    <div id="${msgId}" class="message ai-message"></div>
                `);
                const msgContainer = document.getElementById(msgId);
                
                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let fullReply = '';
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop();
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.replace('data: ', '').trim();
                            if (dataStr === '[DONE]') {
                                msgContainer.innerHTML = parseMarkdownToHTML(fullReply, false);
                                chatHistory.push({ role: "user", parts: [{ text: message }] });
                                chatHistory.push({ role: "model", parts: [{ text: fullReply }] });
                                localStorage.setItem('aiChatHistory', JSON.stringify(chatHistory));
                                window.checkGuestLimit();
                                break;
                            }
                            
                            try {
                                const data = JSON.parse(dataStr);
                                if (data.error) throw new Error(data.error);
                                
                                if (data.text) {
                                    fullReply += data.text;
                                    msgContainer.innerHTML = parseMarkdownToHTML(fullReply, true) + '<span class="cs-typewriter-cursor">|</span>';
                                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                                }
                            } catch (e) {
                                console.error('Error parsing SSE data', e);
                            }
                        }
                    }
                }
            } else {
                const data = await response.json();
                if (data.success) {
                    if (data.reply.trim() === 'REQUEST_REALTIME_LOCATION') {
                        const msgId = 'sys-msg-' + Date.now();
                        messagesContainer.insertAdjacentHTML('beforeend', `
                            <div id="${msgId}" class="message ai-message" style="background:#e0f2fe; border:1px solid #bae6fd; color:#0369a1;">
                                <i class="fa-solid fa-location-dot fa-bounce"></i> Meminta izin akses lokasi Anda untuk memberikan hasil yang akurat...
                            </div>
                        `);
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                        
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                                (pos) => {
                                    document.getElementById(msgId).innerHTML = '<i class="fa-solid fa-check-circle"></i> Lokasi berhasil didapatkan. Sedang mencari...';
                                    window.sendChatMessage(`[SYSTEM GPS DATA] Lokasi Realtime User: Latitude ${pos.coords.latitude}, Longitude ${pos.coords.longitude}, Akurasi ${pos.coords.accuracy} meter.`);
                                },
                                (err) => {
                                    document.getElementById(msgId).innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Izin lokasi ditolak atau gagal didapatkan.';
                                    window.sendChatMessage(`[SYSTEM GPS DATA] Gagal: User menolak akses lokasi atau perangkat tidak mendeteksi (Error Code: ${err.code}).`);
                                },
                                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
                            );
                        } else {
                            document.getElementById(msgId).innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Browser tidak mendukung GPS.';
                            window.sendChatMessage(`[SYSTEM GPS DATA] Gagal: Browser tidak mendukung Geolocation.`);
                        }
                        return;
                    }

                    chatHistory.push({ role: "user", parts: [{ text: message }] });
                    chatHistory.push({ role: "model", parts: [{ text: data.reply }] });
                    localStorage.setItem('aiChatHistory', JSON.stringify(chatHistory));
                    const msgId = 'ai-msg-' + Date.now();
                    messagesContainer.insertAdjacentHTML('beforeend', `
                        <div id="${msgId}" class="message ai-message"></div>
                    `);
                    window._simulateTyping(msgId, data.reply);
                    window.checkGuestLimit();
                } else {
                    throw new Error(data.message);
                }
            }
        } else {
            throw new Error('Gagal menghubungi AI');
        }
    } catch (error) {
        console.error("Chat Error:", error);
        const typingIndicator = document.getElementById(typingId);
        if (typingIndicator) typingIndicator.remove();
        clearTimeout(window[`_waitTimer_${typingId}`]);
        const waitBubbleErr = document.getElementById(window[`_waitBubbleId_${typingId}`]);
        if (waitBubbleErr) waitBubbleErr.remove();
        
        const encodedMsg = encodeURIComponent(message).replace(/'/g, "\\'");
        
        messagesContainer.insertAdjacentHTML('beforeend', `
            <div class="message ai-message" style="color: #ef4444; background: #fee2e2; border: 1px solid #fca5a5;">
                <div style="margin-bottom: 8px;"><i class="fa-solid fa-triangle-exclamation"></i> Maaf, layanan AI sedang sibuk atau ada gangguan jaringan.</div>
                <button onclick="window.sendChatMessage(decodeURIComponent('${encodedMsg}'), this.parentElement)" style="background: white; color: #ef4444; border: 1px solid #ef4444; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: bold; transition: all 0.2s;"><i class="fa-solid fa-rotate-right"></i> Kirim Ulang</button>
            </div>
        `);
    }
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
};



// --- PRAYER TIME LOGIC ---
window.requestPrayerLocation = (force = false) => {
    if (!force && localStorage.getItem('prayerData')) {
        renderPrayerTimes(JSON.parse(localStorage.getItem('prayerData')));
        return;
    }
    
    if (navigator.geolocation) {
        if(document.getElementById('location-prompt')) document.getElementById('location-prompt').style.display = 'none';
        if(document.getElementById('prayer-loading')) document.getElementById('prayer-loading').style.display = 'block';
        if(document.getElementById('prayer-content')) document.getElementById('prayer-content').style.display = 'none';

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // method 11 (MUIS), tune +3 mins to all prayers as requested
                    const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=11&tune=3,3,3,3,3,3,3,3,3`);
                    const data = await response.json();
                    
                    if (data && data.code === 200) {
                        const timings = data.data.timings;
                        
                        // Get city name using reverse geocoding (OpenStreetMap)
                        let cityName = 'Lokasi Anda';
                        try {
                            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                            const geoData = await geoRes.json();
                            cityName = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.state || cityName;
                        } catch(e) { console.error(e); }

                        const prayerData = {
                            city: cityName,
                            date: data.data.date.readable,
                            timings: {
                                Subuh: timings.Fajr,
                                Dzuhur: timings.Dhuhr,
                                Ashar: timings.Asr,
                                Maghrib: timings.Maghrib,
                                Isya: timings.Isha
                            },
                            timestamp: Date.now()
                        };

                        localStorage.setItem('prayerData', JSON.stringify(prayerData));
                        renderPrayerTimes(prayerData);
                    } else {
                        throw new Error('Gagal memuat jadwal sholat');
                    }
                } catch (error) {
                    console.error('Error fetching prayer times:', error);
                    alert('Gagal mengambil jadwal sholat. Silakan coba lagi.');
                    if(document.getElementById('location-prompt')) document.getElementById('location-prompt').style.display = 'block';
                    if(document.getElementById('prayer-loading')) document.getElementById('prayer-loading').style.display = 'none';
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                if(document.getElementById('location-prompt')) document.getElementById('location-prompt').style.display = 'block';
                if(document.getElementById('prayer-loading')) document.getElementById('prayer-loading').style.display = 'none';
            }
        );
    } else {
        alert('Browser Anda tidak mendukung deteksi lokasi.');
    }
};

window.renderPrayerTimes = (data) => {
    if(!document.getElementById('prayer-content')) return;

    document.getElementById('location-prompt').style.display = 'none';
    document.getElementById('prayer-loading').style.display = 'none';
    document.getElementById('prayer-content').style.display = 'block';

    document.getElementById('prayer-city').innerHTML = '<i class="fa-solid fa-location-dot"></i> ' + data.city;
    document.getElementById('prayer-date').textContent = data.date;

    const cardsContainer = document.getElementById('prayer-cards');
    cardsContainer.innerHTML = '';

    let nextPrayerName = '-';
    let nextPrayerTime = null;
    let prevPrayerTime = null;
    
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    let lastMins = 0;
    for (const [name, timeStr] of Object.entries(data.timings)) {
        const [h, m] = timeStr.split(':').map(Number);
        const prayerMins = h * 60 + m;
        
        let isNext = false;
        if (!nextPrayerTime && currentMins < prayerMins) {
            isNext = true;
            nextPrayerName = name;
            nextPrayerTime = new Date();
            nextPrayerTime.setHours(h, m, 0, 0);
            
            prevPrayerTime = new Date();
            if (lastMins === 0) {
                // assume subuh is first, so previous is isya yesterday
                prevPrayerTime.setDate(prevPrayerTime.getDate() - 1);
                prevPrayerTime.setHours(19, 30, 0, 0); // fallback
            } else {
                prevPrayerTime.setHours(Math.floor(lastMins/60), lastMins%60, 0, 0);
            }
        }
        lastMins = prayerMins;

        let iconHtml = '';
        if (name.toLowerCase() === 'subuh') iconHtml = '<i class="fa-solid fa-cloud-sun" style="font-size: 1.5rem;"></i>';
        else if (name.toLowerCase() === 'dzuhur') iconHtml = '<i class="fa-solid fa-sun" style="font-size: 1.5rem;"></i>';
        else if (name.toLowerCase() === 'ashar') iconHtml = '<i class="fa-solid fa-cloud" style="font-size: 1.5rem;"></i>';
        else if (name.toLowerCase() === 'maghrib') iconHtml = '<i class="fa-solid fa-moon" style="font-size: 1.5rem;"></i>';
        else if (name.toLowerCase() === 'isya') iconHtml = '<i class="fa-solid fa-star-and-crescent" style="font-size: 1.5rem;"></i>';
        else iconHtml = '<i class="fa-solid fa-clock" style="font-size: 1.5rem;"></i>';

        cardsContainer.innerHTML += `
            <div class="prayer-card" style="background: rgba(255,255,255,0.05); padding: 25px 15px; border-radius: 20px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 4px; border: 1px solid ${isNext ? 'rgba(52,211,153,0.6)' : 'rgba(255,255,255,0.08)'}; transition: transform 0.3s, background 0.3s; transform: scale(${isNext ? '1.05' : '1'}); background: ${isNext ? 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.15) 100%)' : 'rgba(255,255,255,0.03)'}; box-shadow: ${isNext ? '0 15px 30px -10px rgba(16,185,129,0.3)' : 'none'}; min-width: 120px; flex-shrink: 0; scroll-snap-align: center; position: relative; overflow: hidden;">
                ${isNext ? '<div style="position: absolute; top: -10px; right: -10px; width: 50px; height: 50px; background: rgba(52,211,153,0.15); border-radius: 50%; filter: blur(10px);"></div>' : ''}
                <div style="color: ${isNext ? '#34d399' : '#64748b'}; margin-bottom: 5px;">${iconHtml}</div>
                <div style="font-size: 0.85rem; color: ${isNext ? '#34d399' : '#94a3b8'}; font-weight: ${isNext ? '800' : '600'}; text-transform: uppercase; letter-spacing: 1.5px;">${name}</div>
                <div style="font-size: 1.8rem; font-weight: 800; color: ${isNext ? 'white' : '#e2e8f0'}; font-family: 'Inter', monospace; margin-top: 2px;">${timeStr}</div>
            </div>
        `;
    }

    if (nextPrayerTime) {
        document.getElementById('next-prayer-name').textContent = nextPrayerName;
        
        if(window.prayerInterval) clearInterval(window.prayerInterval);
        
        const updateCountdown = () => {
            const nowTime = new Date();
            const t = nextPrayerTime - nowTime;
            
            // Progress Bar Logic
            if (prevPrayerTime) {
                const totalDuration = nextPrayerTime - prevPrayerTime;
                const elapsed = nowTime - prevPrayerTime;
                let percent = (elapsed / totalDuration) * 100;
                if (percent < 0) percent = 0;
                if (percent > 100) percent = 100;
                const pb = document.getElementById('prayer-progress');
                if (pb) pb.style.width = percent + '%';
            }

            if (t <= 0) {
                clearInterval(window.prayerInterval);
                document.getElementById('next-prayer-countdown').textContent = "00:00:00";
                setTimeout(() => window.requestPrayerLocation(true), 60000); // Reload after 1 min
            } else {
                const hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((t % (1000 * 60)) / 1000);
                document.getElementById('next-prayer-countdown').textContent = 
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        };
        updateCountdown();
        window.prayerInterval = setInterval(updateCountdown, 1000);
    } else {
        document.getElementById('next-prayer-name').textContent = "Besok";
        document.getElementById('next-prayer-countdown').textContent = "--:--:--";
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path.includes('jadwal-sholat') || path === '/' || path === '/index.html') {
        if (!localStorage.getItem('prayerData')) {
            window.requestPrayerLocation(false);
        } else if (path.includes('jadwal-sholat')) {
            window.requestPrayerLocation(false);
        }
    }
});

// --- AI BUG REPORT FEATURE ---

window.showBugReportOptions = () => {
    const msgs = document.getElementById('chat-messages');
    if (!msgs) return;

    const categories = [
        "Laporan Bug / Error Aplikasi",
        "Katalog / Harga Tidak Sesuai",
        "Kendala Pembayaran / Transaksi",
        "Informasi Paket Tidak Jelas",
        "Kendala Saat Pemesanan / Booking",
        "E-Tiket Tidak Muncul / Gagal Download",
        "Akun / Login Bermasalah",
        "Kritik & Saran Pelayanan",
        "Saran Fitur Baru",
        "Masalah Lainnya"
    ];

    let btnsHtml = categories.map((cat, index) => `
        <button onclick="window.showBugReportForm('${cat}')" style="display: block; width: 100%; text-align: left; background: white; color: #1e293b; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 8px; font-size: 0.8rem; cursor: pointer; margin-bottom: 6px; transition: background 0.2s;">
            ${index + 1}. ${cat}
        </button>
    `).join('');

    msgs.innerHTML += `
        <div class="message ai-message">
            Silakan pilih kategori laporan/kendala yang Anda alami di bawah ini:
            <div style="margin-top: 10px;">
                ${btnsHtml}
            </div>
        </div>
    `;
    msgs.scrollTop = msgs.scrollHeight;
};

window.onBugReportItemChange = (formId) => {
    const sel = document.getElementById(`bug-item-${formId}`);
    const badge = document.getElementById(`bug-item-price-badge-${formId}`);
    if (!sel || !badge) return;

    const opt = sel.options[sel.selectedIndex];
    if (!opt || !opt.value || opt.value === 'other') {
        badge.style.display = 'none';
        return;
    }

    const rawPrice = opt.getAttribute('data-price');
    const formatted = typeof formatPrice === 'function' ? formatPrice(rawPrice) : `Rp ${parseInt(rawPrice || 0, 10).toLocaleString('id-ID')}`;
    badge.innerHTML = `<i class="fa-solid fa-tag" style="margin-right: 4px; color: #dc2626;"></i> Harga resmi sistem: <strong>${formatted}</strong>`;
    badge.style.display = 'block';
};

window.showBugReportForm = async (category) => {
    const msgs = document.getElementById('chat-messages');
    if (!msgs) return;

    // Tambahkan pesan konfirmasi pilihan dari user
    msgs.innerHTML += `
        <div class="message user-message">
            Kategori: ${category}
        </div>
    `;

    const formId = 'bug-form-' + Date.now();
    const isPriceReport = category.toLowerCase().includes('harga') || category.toLowerCase().includes('katalog');

    let itemSelectHtml = '';
    if (isPriceReport) {
        let items = window.globalItems || [];
        if (!items || items.length === 0) {
            try {
                items = await fetchItems();
                window.globalItems = items;
            } catch(e) {
                items = [];
            }
        }

        const groups = {
            'Paket Tour & Wisata': [],
            'Rental Mobil': [],
            'Sewa Motor': [],
            'Antar Jemput Bandara (Transfer)': [],
            'Layanan Lainnya': []
        };

        (items || []).filter(i => !i.parentId).forEach(item => {
            const cat = (item.category || '').toLowerCase();
            let grp = 'Layanan Lainnya';
            if (cat.includes('paket') || cat === 'tour' || cat === 'package' || cat === 'honeymoon') grp = 'Paket Tour & Wisata';
            else if ((cat.includes('rental') || cat.includes('armada') || cat.includes('sewa') || cat === 'car') && cat !== 'motorcycle') grp = 'Rental Mobil';
            else if (cat.includes('motor')) grp = 'Sewa Motor';
            else if (cat.includes('transfer') || cat.includes('antar') || cat.includes('jemput')) grp = 'Antar Jemput Bandara (Transfer)';

            groups[grp].push(item);
        });

        let optgroupsHtml = '';
        for (const [groupName, groupItems] of Object.entries(groups)) {
            if (groupItems.length > 0) {
                const opts = groupItems.map(item => {
                    const priceFormatted = typeof formatPrice === 'function' ? formatPrice(item.price) : `Rp ${(item.price || 0).toLocaleString('id-ID')}`;
                    const itemName = (item.title || item.name || 'Item').replace(/"/g, '&quot;');
                    return `<option value="${item.id}" data-name="${itemName}" data-price="${item.price || 0}">${itemName} — ${priceFormatted}</option>`;
                }).join('');
                optgroupsHtml += `<optgroup label="📂 ${groupName}">${opts}</optgroup>`;
            }
        }

        itemSelectHtml = `
            <div style="margin-bottom: 10px; text-align: left;">
                <label style="display: block; font-size: 0.78rem; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
                    <i class="fa-solid fa-list-check" style="color: #ef4444; margin-right: 4px;"></i> Pilih Item / Layanan yang Tidak Sesuai:
                </label>
                <select id="bug-item-${formId}" onchange="window.onBugReportItemChange('${formId}')" style="width: 100%; padding: 8px 10px; border-radius: 8px; border: 1.5px solid #f87171; font-family: inherit; font-size: 0.82rem; background: white; outline: none; cursor: pointer; box-sizing: border-box;">
                    <option value="">-- Pilih dari Katalog Layanan --</option>
                    ${optgroupsHtml}
                    <option value="other">Item Lainnya (Tidak ada di daftar)</option>
                </select>
                <div id="bug-item-price-badge-${formId}" style="display: none; margin-top: 6px; padding: 6px 10px; background: #fef2f2; border: 1px dashed #fca5a5; border-radius: 6px; font-size: 0.78rem; color: #991b1b;"></div>
            </div>
            <div style="margin-bottom: 10px; text-align: left;">
                <label style="display: block; font-size: 0.78rem; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
                    <i class="fa-solid fa-money-bill-wave" style="color: #ef4444; margin-right: 4px;"></i> Harga yang Anda Lihat / Seharusnya:
                </label>
                <input type="text" id="bug-expected-price-${formId}" placeholder="Contoh: Rp 300.000 atau di banner beda" style="width: 100%; padding: 8px 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-family: inherit; font-size: 0.82rem; outline: none; box-sizing: border-box;">
            </div>
        `;
    }

    const descText = isPriceReport
        ? 'Pilih item katalog di bawah yang harganya tidak sesuai dan sebutkan harga yang Anda temukan:'
        : 'Silakan ceritakan detail masalah atau kendala yang Anda alami secara lengkap. Jika ini terkait pesanan, sebutkan juga ID Transaksi Anda jika ada.';

    const taPlaceholder = isPriceReport
        ? 'Jelaskan detail ketidaksesuaian (misal: saat checkout harga berubah, atau di WhatsApp beda)...'
        : 'Ketik detail laporan di sini...';

    msgs.innerHTML += `
        <div class="message ai-message" style="background-color: #fff1f2; border: 1px solid #fecaca; color: #991b1b;">
            <strong>Anda memilih: ${category}</strong><br><br>
            ${descText}
            <div style="margin-top: 12px;" id="${formId}">
                ${itemSelectHtml}
                <div style="margin-bottom: 4px; text-align: left;">
                    <label style="display: block; font-size: 0.78rem; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
                        <i class="fa-solid fa-comment-dots" style="color: #ef4444; margin-right: 4px;"></i> ${isPriceReport ? 'Catatan / Keterangan Tambahan:' : 'Detail Laporan:'}
                    </label>
                </div>
                <textarea id="bug-detail-${formId}" placeholder="${taPlaceholder}" rows="3" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #fca5a5; font-family: inherit; font-size: 0.85rem; resize: none; margin-bottom: 8px; outline: none; box-sizing: border-box;"></textarea>
                <button onclick="window.submitBugReport('${category}', '${formId}')" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; transition: background 0.2s;">
                    <i class="fa-solid fa-paper-plane"></i> Kirim Laporan
                </button>
            </div>
        </div>
    `;
    msgs.scrollTop = msgs.scrollHeight;

    // Auto focus textarea or item select
    setTimeout(() => {
        const sel = document.getElementById(`bug-item-${formId}`);
        if (sel) {
            sel.focus();
        } else {
            const ta = document.getElementById(`bug-detail-${formId}`);
            if (ta) ta.focus();
        }
    }, 100);
};

window.submitBugReport = async (category, formId) => {
    const isPriceReport = category.toLowerCase().includes('harga') || category.toLowerCase().includes('katalog');
    const ta = document.getElementById(`bug-detail-${formId}`);
    const detail = ta ? ta.value.trim() : '';

    const itemSelect = document.getElementById(`bug-item-${formId}`);
    const expectedInput = document.getElementById(`bug-expected-price-${formId}`);

    let selectedItemId = '';
    let selectedItemName = '';
    let selectedItemPrice = '';
    let expectedPrice = '';

    if (isPriceReport && itemSelect) {
        if (!itemSelect.value) {
            alert("Harap pilih item/layanan katalog yang harganya tidak sesuai!");
            itemSelect.focus();
            return;
        }
        selectedItemId = itemSelect.value;
        const opt = itemSelect.options[itemSelect.selectedIndex];
        selectedItemName = opt.getAttribute('data-name') || opt.text;
        selectedItemPrice = typeof formatPrice === 'function' ? formatPrice(opt.getAttribute('data-price') || 0) : opt.getAttribute('data-price');

        if (expectedInput) {
            expectedPrice = expectedInput.value.trim();
        }
    }

    if (!detail && !expectedPrice) {
        alert("Harap isi keterangan atau harga yang seharusnya!");
        if (ta) ta.focus();
        return;
    }

    let fullDetail = detail;
    if (isPriceReport && selectedItemName) {
        fullDetail = `[ITEM KATALOG]: ${selectedItemName} (Harga Sistem: ${selectedItemPrice || '-'})` +
                     (expectedPrice ? `\n[HARGA SEHARUSNYA/DITEMUKAN]: ${expectedPrice}` : '') +
                     (detail ? `\n[KETERANGAN]: ${detail}` : '');
    }

    const btn = document.querySelector(`#${formId} button`);
    if(btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';
    }

    let userInfo = {};
    try {
        const u = localStorage.getItem('user');
        if (u && u !== 'undefined') userInfo = JSON.parse(u);
    } catch(e) {}

    try {
        const response = await fetch(`${API_URL}/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                category: category,
                detail: fullDetail,
                itemId: selectedItemId,
                itemName: selectedItemName,
                itemPrice: selectedItemPrice,
                reportedPrice: expectedPrice,
                sessionId: localStorage.getItem('sessionId') || 'anonymous',
                userInfo: userInfo
            })
        });

        if (response.ok) {
            // Hilangkan form
            const formContainer = document.getElementById(formId);
            if(formContainer) formContainer.innerHTML = `<div style="color: #166534; font-weight: bold; padding: 8px 0;"><i class="fa-solid fa-check-circle"></i> Laporan Berhasil Dikirim!</div>`;

            const msgs = document.getElementById('chat-messages');
            msgs.innerHTML += `
                <div class="message ai-message">
                    Terima kasih banyak atas informasinya Kak! 🙏 Laporan ketidaksesuaian harga untuk item <strong>${selectedItemName || category}</strong> telah berhasil diteruskan ke tim kami untuk segera dicek dan diperbarui.
                </div>
            `;
            msgs.scrollTop = msgs.scrollHeight;
        } else {
            const errText = await response.text();
            throw new Error("Gagal mengirim: " + errText);
        }
    } catch (e) {
        alert("Terjadi kesalahan: " + e.message);
        if(btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Coba Kirim Ulang';
        }
    }
};

// --- AIRA FLASH DEALS & PROMO CHECKER (FITUR 6) ---
window.checkAiraPromoDeals = async () => {
    if (window.checkGuestLimit()) {
        if (typeof window.openAuthModal === 'function') window.openAuthModal('login');
        return;
    }
    const qrContainer = document.getElementById('ai-quick-replies');
    if (qrContainer) qrContainer.remove();

    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    messagesContainer.insertAdjacentHTML('beforeend', `
        <div class="message user-message" style="background: linear-gradient(135deg, #e11d48, #be123c); color: white;">
            <i class="fa-solid fa-ticket"></i> Cek Promo & Kupon Diskon Hari Ini
        </div>
    `);

    const typingId = 'typing-' + Date.now();
    messagesContainer.insertAdjacentHTML('beforeend', `
        <div id="${typingId}" class="typing-indicator">
            <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
    `);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        let promos = [];
        try {
            const res = await fetch(`${API_URL}/promos?public=true&_t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    promos = data.filter(p => p.isActive !== false);
                }
            }
        } catch (err) {
            console.error("Fetch promos error:", err);
        }

        setTimeout(() => {
            const t = document.getElementById(typingId);
            if (t) t.remove();

            if (!promos || promos.length === 0) {
                // JIKA TIDAK ADA PROMO AKTIF DI DATABASE: JANGAN MENGARANG!
                messagesContainer.insertAdjacentHTML('beforeend', `
                    <div class="message ai-message" style="border:1.5px solid #e2e8f0; background:#f8fafc;">
                        <h4 style="margin:0 0 6px 0; color:#0284c7; display:flex; align-items:center; gap:8px;">
                            <i class="fa-solid fa-tags"></i> Informasi Promo & Diskon
                        </h4>
                        <p style="font-size:0.85rem; color:#475569; margin:0 0 8px 0; line-height:1.5;">
                            Saat ini belum ada kode kupon diskon baru yang aktif di sistem kami.
                        </p>
                        <p style="font-size:0.83rem; color:#64748b; margin:0; line-height:1.5;">
                            Namun tidak perlu khawatir, seluruh tarif rental armada dan paket wisata yang tertera di website kami sudah merupakan <strong>harga resmi terbaik dan termurah langsung</strong> tanpa biaya tersembunyi!
                        </p>
                        <div style="margin-top:12px; border-top:1px dashed #cbd5e1; padding-top:10px;">
                            <button type="button" class="btn btn-blue" onclick="
                                const cw = document.getElementById('ai-chat-window');
                                if (cw) cw.classList.add('hidden');
                                const sec = document.getElementById('armada') || document.getElementById('paket');
                                if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            " style="width:100%; justify-content:center; padding:8px 14px; font-size:0.82rem; border-radius:8px;">
                                <i class="fa-solid fa-car"></i> Lihat Pilihan Armada & Paket Tour
                            </button>
                        </div>
                    </div>
                `);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                return;
            }

            // Cek apakah semua promo kuotanya sudah habis
            const availablePromos = promos.filter(p => !(p.usageLimit && (p.usedCount || 0) >= p.usageLimit));
            const hasExhaustedPromos = promos.some(p => p.usageLimit && (p.usedCount || 0) >= p.usageLimit);

            if (availablePromos.length === 0 && hasExhaustedPromos) {
                // SEMUA PROMO SUDAH HABIS KUOTANYA
                messagesContainer.insertAdjacentHTML('beforeend', `
                    <div class="message ai-message" style="border:1.5px solid #fed7aa; background:#fffbf7;">
                        <h4 style="margin:0 0 6px 0; color:#ea580c; display:flex; align-items:center; gap:8px;">
                            <i class="fa-solid fa-ticket-simple"></i> Kuota Promo Spesial Telah Habis
                        </h4>
                        <p style="font-size:0.85rem; color:#475569; margin:0 0 8px 0; line-height:1.5;">
                            Mohon maaf Kak, seluruh kuota kupon promo spesial dari kami hari ini sudah habis terpakai oleh pelanggan lain.
                        </p>
                        <p style="font-size:0.83rem; color:#64748b; margin:0; line-height:1.5;">
                            Namun jangan berkecil hati! Seluruh tarif yang tertera di website Travel Lombok Airport sudah merupakan <strong>harga termurah & terbaik langsung</strong> tanpa biaya tersembunyi.
                        </p>
                        <div style="margin-top:12px; border-top:1px dashed #cbd5e1; padding-top:10px;">
                            <button type="button" class="btn btn-blue" onclick="
                                const cw = document.getElementById('ai-chat-window');
                                if (cw) cw.classList.add('hidden');
                                const sec = document.getElementById('armada') || document.getElementById('paket');
                                if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            " style="width:100%; justify-content:center; padding:8px 14px; font-size:0.82rem; border-radius:8px;">
                                <i class="fa-solid fa-car"></i> Pesan Langsung dengan Harga Terbaik
                            </button>
                        </div>
                    </div>
                `);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                return;
            }

            let voucherHtml = promos.map(p => {
                const isHabis = p.usageLimit && (p.usedCount || 0) >= p.usageLimit;
                const used = p.usedCount || 0;
                const sisaKuota = p.usageLimit ? Math.max(0, p.usageLimit - used) : null;

                const discountText = p.discountType === 'percent' 
                    ? `Diskon ${p.discountValue}% ${p.maxDiscount ? `(Maks ${formatPrice(p.maxDiscount)})` : ''}` 
                    : `Potongan Langsung ${formatPrice(p.discountValue)}`;

                // Deteksi apakah promo berlaku untuk item spesifik atau semua item
                let targetItem = null;
                if (p.itemId && window.globalItems && Array.isArray(window.globalItems)) {
                    targetItem = window.globalItems.find(item => item.id === p.itemId);
                }

                const scopeBadge = p.itemId
                    ? `<div style="display:inline-flex; align-items:center; gap:5px; font-size:0.75rem; color:#b45309; background:#fef3c7; border:1px solid #fde68a; padding:3px 8px; border-radius:6px; font-weight:700;"><i class="fa-solid fa-car-side"></i> Khusus: ${targetItem ? targetItem.title : 'Paket/Armada Tertentu'}</div>`
                    : `<div style="display:inline-flex; align-items:center; gap:5px; font-size:0.75rem; color:#15803d; background:#dcfce7; border:1px solid #bbf7d0; padding:3px 8px; border-radius:6px; font-weight:700;"><i class="fa-solid fa-check-double"></i> Berlaku Untuk Semua Paket & Armada</div>`;

                let statusBadge = '';
                let actionBtn = '';

                if (isHabis) {
                    statusBadge = `<span style="font-size:0.75rem; color:#dc2626; font-weight:700; background:#fee2e2; border:1px solid #fecaca; padding:2px 8px; border-radius:6px;"><i class="fa-solid fa-ban"></i> Kuota Habis</span>`;
                    actionBtn = `<button type="button" class="btn" disabled style="background:#e2e8f0; color:#94a3b8; border:none; border-radius:8px; padding:6px 12px; font-size:0.8rem; font-weight:700; cursor:not-allowed;"><i class="fa-solid fa-lock"></i> Habis</button>`;
                } else {
                    if (p.usageLimit) {
                        statusBadge = `<span style="font-size:0.75rem; color:#ea580c; font-weight:700; background:#ffedd5; border:1px solid #fed7aa; padding:2px 8px; border-radius:6px;"><i class="fa-solid fa-fire"></i> Sisa ${sisaKuota} Kupon</span>`;
                    } else {
                        statusBadge = `<span style="font-size:0.75rem; color:#16a34a; font-weight:700;"><i class="fa-solid fa-circle-check"></i> Aktif</span>`;
                    }
                    const btnText = p.itemId && targetItem
                        ? `<i class="fa-solid fa-bolt"></i> Gunakan & Pesan`
                        : `<i class="fa-solid fa-check-double"></i> Gunakan Kupon`;
                    actionBtn = `<button type="button" class="aira-use-voucher-btn" onclick="window.applyPromoCodeFromAira('${p.code}', '${p.itemId || ''}')">${btnText}</button>`;
                }

                return `
                    <div class="aira-voucher-card" style="${isHabis ? 'opacity:0.7; border-color:#cbd5e1; background:#f8fafc;' : ''}">
                        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                            <span class="aira-voucher-badge"><i class="fa-solid fa-ticket"></i> ${p.title || 'Voucher Resmi'}</span>
                            ${statusBadge}
                        </div>
                        <div style="margin: 3px 0;">
                            ${scopeBadge}
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin: 4px 0;">
                            <div>
                                <div class="aira-voucher-code" style="${isHabis ? 'color:#64748b; text-decoration:line-through;' : ''}">${p.code}</div>
                                <div style="font-size:0.78rem; color:#475569; margin-top:2px;">${discountText}</div>
                            </div>
                            ${actionBtn}
                        </div>
                        <div style="font-size:0.73rem; color:#64748b; line-height:1.3;">
                            ${isHabis 
                                ? `<span style="color:#dc2626; font-weight:600;"><i class="fa-solid fa-circle-exclamation"></i> Kuota promo ini (${p.usageLimit} penggunaan) sudah habis terpakai.</span>` 
                                : (p.description || (p.itemId ? `Khusus untuk pemesanan ${targetItem ? targetItem.title : 'item ini'}.` : 'Gunakan saat pemesanan armada atau paket tour mana pun.'))}
                        </div>
                    </div>
                `;
            }).join('');

            messagesContainer.insertAdjacentHTML('beforeend', `
                <div class="message ai-message" style="border:1.5px solid #fed7aa; background:#fffbf7;">
                    <h4 style="margin:0 0 6px 0; color:#ea580c; display:flex; align-items:center; gap:8px;">
                        <i class="fa-solid fa-gift"></i> Promo Resmi Hari Ini dari Kami Travel Lombok Airport
                    </h4>
                    <p style="font-size:0.85rem; color:#475569; margin:0 0 10px 0;">
                        Berikut daftar kode voucher resmi dari Travel Lombok Airport saat ini:
                    </p>
                    ${voucherHtml}
                    <div style="margin-top:10px; font-size:0.78rem; color:#94a3b8; text-align:center;">
                        💡 Klik <strong>"Gunakan Kupon"</strong> pada voucher aktif di atas untuk memasang otomatis diskon ke pesanan.
                    </div>
                </div>
            `);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 700);

    } catch (e) {
        console.error("Error checking promos:", e);
    }
};

window.applyPromoCodeFromAira = (code, itemId = '') => {
    if (!code) return;
    
    // 1. Simpan data kupon ke memori
    window.savedAiraPromo = {
        code: code,
        itemId: itemId || null
    };

    // Cari info target item jika kupon khusus
    let targetItem = null;
    if (itemId && window.globalItems && Array.isArray(window.globalItems)) {
        targetItem = window.globalItems.find(item => item.id === itemId);
    }

    const messagesContainer = document.getElementById('chat-messages');

    // SKENARIO A: Promo KHUSUS item / armada / paket tertentu
    if (itemId && targetItem) {
        if (messagesContainer) {
            messagesContainer.insertAdjacentHTML('beforeend', `
                <div class="message ai-message" style="background:#f0fdf4; border:1px solid #86efac; color:#166534;">
                    <i class="fa-solid fa-circle-check" style="color:#16a34a;"></i> Kupon <strong>${code}</strong> khusus untuk <strong>${targetItem.title}</strong> dipilih! Membuka formulir pemesanan...
                </div>
            `);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        setTimeout(() => {
            // Tutup chat window
            const chatWindow = document.getElementById('ai-chat-window');
            if (chatWindow && !chatWindow.classList.contains('hidden')) {
                chatWindow.classList.add('hidden');
            }

            // Buka langsung checkout modal untuk item terkait!
            if (typeof window.openCheckoutModal === 'function') {
                window.openCheckoutModal(targetItem.title, targetItem.price || 0, 'web');
            }

            // Info popup ramah
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: `Kupon ${code} Terpasang!`,
                    text: `Kupon khusus "${targetItem.title}" telah otomatis terpasang pada formulir booking.`,
                    confirmButtonColor: '#0284c7',
                    timer: 3500
                });
            }
        }, 600);
        return;
    }

    // SKENARIO B: Promo BERLAKU UNTUK SEMUA PAKET / ARMADA (Universal)
    if (messagesContainer) {
        messagesContainer.insertAdjacentHTML('beforeend', `
            <div class="message ai-message" style="background:#f0fdf4; border:1px solid #86efac; color:#166534;">
                <i class="fa-solid fa-circle-check" style="color:#16a34a;"></i> Kupon <strong>${code}</strong> berlaku untuk <strong>SEMUA armada & paket tour</strong>! Kode promo otomatis terisi saat memilih armada/paket mana saja.
            </div>
        `);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Jika modal checkout sedang terbuka saat klik:
    const promoInput = document.getElementById('co-promo-input');
    if (promoInput && document.getElementById('checkout-modal')?.classList.contains('active')) {
        promoInput.value = code;
        if (typeof window.applyPromo === 'function') {
            window.applyPromo();
        }
    }

    setTimeout(() => {
        // Tutup chat window
        const chatWindow = document.getElementById('ai-chat-window');
        if (chatWindow && !chatWindow.classList.contains('hidden')) {
            chatWindow.classList.add('hidden');
        }

        // Scroll halus ke daftar paket / booking section
        const targetSection = document.getElementById('armada') || document.getElementById('paket') || document.querySelector('.hero');
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Tampilkan info Toast / alert ramah
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: `Kupon ${code} Tersalin!`,
                text: 'Kupon ini berlaku untuk SEMUA paket tour dan rental armada. Silakan pilih paket apa saja yang Kakak inginkan, kupon akan otomatis terpasang saat checkout.',
                confirmButtonColor: '#0284c7',
                timer: 3500
            });
        }
    }, 600);
};

document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi listener scroll chat WhatsApp-style
    if (window.initChatScrollListener) window.initChatScrollListener();

    // Munculkan tombol Laporkan Masalah di chat setiap 5 menit
    setInterval(() => {
        const msgs = document.getElementById('chat-messages');
        if (msgs) {
            msgs.innerHTML += `
                <div class="message ai-message" style="background-color: #f8fafc; border: 1px dashed #cbd5e1;">
                    Ada kendala dengan layanan kami? Anda dapat melaporkannya kapan saja.
                    <div style="margin-top: 8px;">
                        <button onclick="window.showBugReportOptions()" style="text-align: left; background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; padding: 8px 12px; border-radius: 8px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s;">
                            <i class="fa-solid fa-triangle-exclamation"></i> Laporkan Masalah / Bug
                        </button>
                    </div>
                </div>
            `;
            msgs.scrollTop = msgs.scrollHeight;
        }
    }, 5 * 60 * 1000);
});
