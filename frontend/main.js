if (!window.location.pathname.includes("admin") && !window.location.pathname.includes("driver")) { document.addEventListener("contextmenu", e => e.preventDefault()); document.addEventListener("keydown", e => { if (e.ctrlKey && (e.key === "c" || e.key === "u" || e.key === "s" || e.key === "p")) { e.preventDefault(); } if (e.key === "F12") { e.preventDefault(); } }); }
// ====== API ENDPOINT ======
// Changed so that localhost hits Vite proxy on /api exactly like production
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '/api' : '/api';

// ====== MAINTENANCE MODE CHECK ======
// Run ASAP before page renders, skip for admin/maintenance/login pages
(async () => {
    const path = window.location.pathname;
    const skipPaths = ['/admin', '/maintenance', '/login', '/register', '/verify', '/driver'];
    const isSkipped = skipPaths.some(p => path.includes(p));
    if (isSkipped) return;

    // Check if admin is logged in (admins bypass maintenance)
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) return;

    try {
        const res = await fetch('/api/settings', { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            if (data.maintenanceMode === true) {
                localStorage.setItem('maintenanceMode', 'true');
                window.location.replace('/maintenance.html');
                return;
            } else {
                localStorage.setItem('maintenanceMode', 'false');
                const antiFlash = document.getElementById('anti-flash');
                if (antiFlash) antiFlash.remove();
                document.body.style.opacity = '1';
                document.body.style.visibility = 'visible';
                document.body.style.pointerEvents = 'auto';
            }
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
let globalItems = [];

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

// Format terms into HTML list
const formatTerms = (termsText) => {
    if (!termsText) return '';
    const lines = termsText.split('\n');
    let html = '';
    let inList = false;

    lines.forEach(line => {
        let trimmed = line.trim();

        // Auto-format numbers (4 digits or more) with dots (e.g. 500000 -> 500.000)
        trimmed = trimmed.replace(/b(d{4,})b/g, (match) => parseInt(match, 10).toLocaleString('id-ID'));

        if (trimmed.match(/^d+.s/)) {
            if (inList) { html += '</ul>'; inList = false; }
            html += `<div style="margin-top: 15px; font-weight: 700; color: var(--primary-blue);">${trimmed}</div>`;
        } else if (trimmed.startsWith('•')) {
            if (!inList) { html += '<ul style="margin: 5px 0 10px 20px; padding: 0; list-style-type: disc;">'; inList = true; }
            html += `<li style="margin-bottom: 5px;">${trimmed.substring(1).trim()}</li>`;
        } else if (trimmed === '') {
            if (inList) { html += '</ul>'; inList = false; }
            html += '<div style="height: 10px;"></div>';
        } else {
            if (inList) { html += '</ul>'; inList = false; }
            if (trimmed.includes('DEPOSIT') || trimmed.startsWith('🛵') || trimmed.startsWith('🚙')) {
                html += `<div style="font-weight: 700;">${trimmed}</div>`;
            } else {
                html += `<div>${trimmed}</div>`;
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
                    ${(() => {
            let typeLabel = 'PAKET TOUR';
            if (item.category === 'car') typeLabel = 'SEWA MOBIL';
            else if (item.category === 'motorcycle') typeLabel = 'SEWA MOTOR';
            else if (item.category === 'drone') typeLabel = 'SEWA DRONE';
            else if (item.category === 'transfer') typeLabel = 'ANTAR JEMPUT';
            if (item.packageType) typeLabel = item.packageType;

            let durationLabel = item.duration ? item.duration.toUpperCase() : 'N/A';
            if (!item.duration && (item.category === 'car' || item.category === 'motorcycle')) {
                durationLabel = 'PER HARI';
            }

            return `
                        <h4 style="letter-spacing: 2px; color: var(--primary-green); margin-bottom: 10px; font-weight: 800; font-size: 0.9rem;"><i class="fa-solid fa-map-location-dot"></i> ${typeLabel}</h4>
                        <h2 style="color: var(--text-dark); font-size: 2.5rem; margin-bottom: 20px; line-height: 1.2; font-weight: 800;">${item.title.toUpperCase()}</h2>
                        <div class="tm-badges" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
                            <span class="tm-badge-blue" style="background: #f0f9ff; color: var(--primary-blue); font-size: 0.95rem; padding: 8px 18px; border-radius: 30px; font-weight: 800; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;"><i class="fa-regular fa-clock"></i> ${durationLabel}</span>
                            ${item.driverOptions ? `<span class="tm-badge-blue" style="background: #f0fdf4; color: var(--primary-green); font-size: 0.95rem; padding: 8px 18px; border-radius: 30px; font-weight: 800; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;"><i class="fa-solid fa-id-card"></i> ${item.driverOptions === 'Sertakan Pengemudi' ? 'DENGAN SUPIR' : item.driverOptions === 'Tidak Include Driver' ? 'LEPAS KUNCI' : item.driverOptions.toUpperCase()}</span>` : ''}
                        </div>
                        <p style="color: #475569; font-size: 1.1rem; line-height: 1.7;">${item.description || 'Deskripsi detail tidak tersedia.'}</p>
                        `;
        })()}
                </div>
                <div class="tm-price-box premium-price-box">
                    ${(() => {
            let priceLabel = 'HARGA PAKET';
            if (item.category === 'car' || item.category === 'motorcycle' || item.category === 'drone') {
                priceLabel = 'HARGA SEWA';
            }
            return `<span class="price-label" style="background: var(--primary-green); color: white; font-size: 0.85rem; padding: 6px 15px; border-radius: 20px; font-weight: bold; align-self: flex-end;">${priceLabel}</span>`;
        })()}
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
                
                ${(item.category === 'package' || itineraryHTML) ? `
                <div class="tm-box tm-box-blue mt-4" style="background: #f8fafc; border: 1px solid #cbd5e1;">
                    <div class="tm-box-title" style="background: var(--text-dark);"><i class="fa-solid fa-shield-halved"></i> KEBIJAKAN PEMBATALAN</div>
                    <ul class="tm-list" style="color:var(--text-dark);">
                        <li><i class="fa-solid fa-hourglass-half" style="color:var(--text-gray);"></i> Pembatalan H-7: 50% deposit dikembalikan.</li>
                        <li><i class="fa-solid fa-check" style="color:var(--text-gray);"></i> Pembatalan pihak travel: 100% deposit dikembalikan.</li>
                        <li><i class="fa-regular fa-calendar-days" style="color:var(--text-gray);"></i> Perubahan jadwal sesuai ketersediaan.</li>
                    </ul>
                </div>` : ''}
                
                ${item.terms ? `
                <div class="tm-box tm-box-blue mt-4" style="background: #f8fafc; border: 1px solid #cbd5e1;">
                    <div class="tm-box-title" style="background: var(--primary-blue);"><i class="fa-solid fa-file-contract"></i> SYARAT & KETENTUAN</div>
                    <div style="padding: 15px; color: var(--text-dark); font-size: 0.95rem; line-height: 1.6;">
                        ${formatTerms(item.terms)}
                    </div>
                </div>` : ''}
            </div>
            
            <div class="tm-right">
                ${includes.length > 0 ? `
                <div class="tm-box tm-box-green">
                    <div class="tm-box-title"><i class="fa-solid fa-check"></i> FASILITAS INCLUDE</div>
                    <ul class="tm-list">
                        ${includes.map(i => `<li><i class="fa-solid fa-check-circle"></i> ${i}</li>`).join('')}
                    </ul>
                </div>` : ''}
                
                ${excludes.length > 0 ? `
                <div class="tm-box tm-box-red">
                    <div class="tm-box-title"><i class="fa-solid fa-xmark"></i> TIDAK TERMASUK</div>
                    <ul class="tm-list">
                        ${excludes.map(i => `<li><i class="fa-solid fa-times-circle"></i> ${i}</li>`).join('')}
                    </ul>
                </div>` : ''}
                
                <div class="tm-box tm-box-blue" style="background: white; border: 2px solid var(--primary-blue);">
                    <div class="tm-box-title" style="background: var(--primary-blue); box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.3);"><i class="fa-regular fa-calendar-check"></i> CARA RESERVASI</div>
                    <p style="color: var(--text-gray); font-size: 0.9rem; margin-bottom: 15px;">Untuk mengamankan jadwal perjalanan, silakan transfer deposit (booking fee) sebesar <strong>${formatPrice(500200)}</strong> ke rekening berikut:</p>
                    <div class="bank-item" style="background: #f8fafc; border: none;">
                        <img src="/mandiri.svg" alt="Mandiri" style="height: 25px; object-fit: contain;">
                        <div>LALU RENGGANE<br><span style="color: var(--primary-blue); font-size: 1.1rem; letter-spacing: 1px;">1610017191425</span></div>
                    </div>
                    <div class="bank-item" style="background: #f8fafc; border: none;">
                        <img src="/bri.svg" alt="BRI" style="height: 25px; object-fit: contain;">
                        <div>LALU RENGGANE<br><span style="color: var(--primary-blue); font-size: 1.1rem; letter-spacing: 1px;">759801017387536</span></div>
                    </div>

                    ${!localStorage.getItem('auth_token') ? `
                    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; margin-top: 20px; text-align: center;">
                        <div style="font-size: 0.85rem; color: #d97706; margin-bottom: 12px; font-weight: 600;">
                            <i class="fa-solid fa-circle-exclamation"></i> Anda harus login atau daftar akun terlebih dahulu untuk melakukan pesanan via Web.
                        </div>
                        <div style="display: flex; gap: 8px; justify-content: center;">
                            <a href="#" onclick="event.preventDefault(); window.closeTourModal(); window._authMode='login'; window.openAuthModal();" class="btn" style="background: white; color: #d97706; border: 1px solid #d97706; padding: 8px 15px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; flex:1; text-align: center;">LOGIN</a>
                            <a href="#" onclick="event.preventDefault(); window.closeTourModal(); window._authMode='register'; window.openAuthModal();" class="btn" style="background: #d97706; color: white; border: none; padding: 8px 15px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; flex:1; text-align: center;">DAFTAR</a>
                        </div>
                    </div>
                    ` : ''}

                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <a href="#" onclick="event.preventDefault(); openCheckoutModal('${item.title.replace(/'/g, "\\'")}', ${item.price}, 'wa');" class="btn" style="flex:1; background: #e0f2fe; color: var(--primary-blue); padding: 12px; border-radius: 8px;"><i class="fa-brands fa-whatsapp"></i> via WA</a>
                        <button onclick="openCheckoutModal('${item.title}', ${item.price})" class="btn btn-blue" style="flex:1; padding: 12px; border-radius: 8px;"><i class="fa-solid fa-desktop"></i> via Web</button>
                    </div>
                </div>
            </div>
        </div>

        <div style="padding: 20px; background: white; border-top: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="font-size: 1.1rem; color: var(--text-dark); margin: 0;"><i class="fa-solid fa-star" style="color: #f59e0b;"></i> Ulasan Pelanggan</h3>
                <button onclick="window.toggleInlineReviewForm('${item.id}', '${item.title.replace(/'/g, "\\'")}')" class="btn btn-outline" style="border: 2px solid var(--primary-blue); color: var(--primary-blue); padding: 5px 12px; font-size: 0.8rem; border-radius: 6px;"><i class="fa-solid fa-pen"></i> Tulis Ulasan</button>
            </div>
            <div id="inline-review-form-container-${item.id}" style="display: none; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e2e8f0;">
                <!-- Form content will be injected here -->
            </div>
            <div id="item-reviews-container-${item.id}" style="display: flex; gap: 12px; overflow-x: auto; padding: 10px 5px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; margin-bottom: 10px;">
                <p style="font-size: 0.85rem; color: #64748b; text-align: center; padding: 20px 0; width: 100%;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat ulasan...</p>
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
        if (!subModal || subModal.style.display === 'none') {
            document.body.style.overflow = ''; // Restore scroll only if sub-package is closed
        }
    }
};

window.loadItemReviews = async (itemId) => {
    const container = document.getElementById(`item-reviews-container-${itemId}`);
    if (!container) return;
    
    try {
        const res = await fetch(`${API_URL}/reviews?itemId=${itemId}`);
        if (!res.ok) throw new Error('Failed to fetch item reviews');
        const reviews = await res.json();
        
        if (reviews.length === 0) {
            container.innerHTML = '<p style="font-size: 0.85rem; color: #64748b; text-align: center; padding: 10px 0;">Belum ada ulasan untuk paket ini. Jadilah yang pertama!</p>';
            return;
        }
        
        container.innerHTML = reviews.map(r => {
            let stars = '';
            for (let i = 0; i < 5; i++) {
                if (i < r.rating) stars += '<i class="fa-solid fa-star" style="color: #f59e0b; font-size:0.7rem;"></i>';
                else stars += '<i class="fa-regular fa-star" style="color: #cbd5e1; font-size:0.7rem;"></i>';
            }
            const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : '';
            return `
            <div style="flex: 0 0 85%; max-width: 320px; scroll-snap-align: start; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div>
                        <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-dark);">${r.name}</div>
                        <div style="display: flex; gap: 2px; margin-top: 2px;">${stars}</div>
                    </div>
                    <div style="font-size: 0.75rem; color: #94a3b8;">${dateStr}</div>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-gray); margin: 0; line-height: 1.4;">${r.comment}</p>
            </div>`;
        }).join('');
    } catch (e) {
        console.error("Failed to load item reviews:", e);
        container.innerHTML = '<p style="font-size: 0.85rem; color: #ef4444; text-align: center; padding: 10px 0;">Gagal memuat ulasan.</p>';
    }
};

window.toggleInlineReviewForm = (itemId, itemName) => {
    const container = document.getElementById(`inline-review-form-container-${itemId}`);
    if (!container) return;

    if (container.style.display === 'block') {
        container.style.display = 'none';
        return;
    }

    let nameValue = '';
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.displayName) nameValue = user.displayName;
            else if (user && user.name) nameValue = user.name;
        } catch(e) {}
    }

    container.innerHTML = `
        <div style="text-align: left;">
            <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 15px;">Merekam ulasan untuk: <strong>${itemName}</strong></p>
            <div class="form-group mb-2">
                <label style="font-size:0.8rem; font-weight:600;">Nama Anda</label>
                <input type="text" id="inline-review-name-${itemId}" class="form-control" style="font-size:0.85rem; padding: 6px 10px;" placeholder="Nama lengkap" value="${nameValue}">
            </div>
            <div class="form-group mb-2">
                <label style="font-size:0.8rem; font-weight:600;">Rating (1-5)</label>
                <select id="inline-review-rating-${itemId}" class="form-control" style="font-size:0.85rem; padding: 6px 10px;">
                    <option value="5">⭐⭐⭐⭐⭐ (Sangat Bagus)</option>
                    <option value="4">⭐⭐⭐⭐ (Bagus)</option>
                    <option value="3">⭐⭐⭐ (Cukup)</option>
                    <option value="2">⭐⭐ (Kurang)</option>
                    <option value="1">⭐ (Sangat Kurang)</option>
                </select>
            </div>
            <div class="form-group mb-3">
                <label style="font-size:0.8rem; font-weight:600;">Ulasan Anda</label>
                <textarea id="inline-review-comment-${itemId}" class="form-control" rows="3" style="font-size:0.85rem; padding: 6px 10px;" placeholder="Bagaimana pengalaman Anda?"></textarea>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button onclick="document.getElementById('inline-review-form-container-${itemId}').style.display = 'none'" class="btn btn-outline" style="border: 1px solid #cbd5e1; color: #64748b; padding: 6px 12px; font-size: 0.8rem; font-weight: 600; border-radius: 6px;">Batal</button>
                <button onclick="window.submitInlineReview('${itemId}')" id="btn-submit-inline-review-${itemId}" class="btn" style="background: var(--primary-green); color: white; padding: 6px 12px; font-size: 0.8rem; font-weight: 600; border-radius: 6px; border: none;">Kirim Ulasan</button>
            </div>
        </div>
    `;
    container.style.display = 'block';
};

window.submitInlineReview = async (itemId) => {
    const btn = document.getElementById(`btn-submit-inline-review-${itemId}`);
    const name = document.getElementById(`inline-review-name-${itemId}`).value.trim();
    const rating = document.getElementById(`inline-review-rating-${itemId}`).value;
    const comment = document.getElementById(`inline-review-comment-${itemId}`).value.trim();

    if (!name || !comment) {
        Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Nama dan ulasan harus diisi!' });
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';

    try {
        const res = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, rating, comment, itemId })
        });

        if (!res.ok) throw new Error('Failed to submit');

        document.getElementById(`inline-review-form-container-${itemId}`).style.display = 'none';
        Swal.fire({ icon: 'success', title: 'Terima Kasih!', text: 'Ulasan Anda berhasil dikirim.', timer: 2000, showConfirmButton: false });
        window.loadItemReviews(itemId);
    } catch (error) {
        console.error("Submit review error:", error);
        Swal.fire({ icon: 'error', title: 'Gagal', text: 'Terjadi kesalahan. Silakan coba lagi.' });
        btn.disabled = false;
        btn.innerHTML = 'Kirim Ulasan';
    }
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
    const btnHtml = isParent
        ? `<button onclick="window.openSubPackageModal('${item.id}')" class="btn" style="background:linear-gradient(135deg,var(--primary-blue,#0ea5e9),#1e40af); color:white; border:none; font-size:0.85rem; padding:8px 16px; border-radius:20px; font-weight:700;"><i class="fa-solid fa-layer-group" style="margin-right:5px;"></i>LIHAT PAKET</button>`
        : `<button onclick="openTourModal('${item.id}')" class="btn" style="background: var(--bg-light); color: var(--primary-blue); border: none; font-size: 0.85rem; padding: 8px 16px; border-radius: 20px; font-weight: 700;">DETAIL</button>`;
    const parentBadge = isParent
        ? `<span style="position:absolute;top:10px;left:10px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#78350f;font-size:0.65rem;font-weight:800;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;z-index:2;"><i class="fa-solid fa-layer-group" style="margin-right:4px;"></i>Paket Pilihan</span>` : '';
    const ratingBadge = item.rating 
        ? `<span style="position:absolute; ${isParent ? 'top:45px;' : 'top:10px;'} left:10px; background:rgba(255,255,255,0.95); color:#f59e0b; font-weight:800; font-size:0.8rem; padding:4px 10px; border-radius:20px; z-index:2; box-shadow:0 2px 4px rgba(0,0,0,0.1);"><i class="fa-solid fa-star" style="margin-right:4px;"></i>${item.rating}</span>` : '';
    return `
    <div class="card package-card" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}" style="${isParent ? 'border:2px solid #fbbf24;' : ''}">
        <div class="img-wrapper" style="position:relative;">
            <button onclick="window.shareItem('${item.id}', '${item.title.replace(/'/g, "\\'")}', '${formatPrice(item.price)}')" style="position:absolute; top:10px; right:10px; background:rgba(255,255,255,0.9); color:var(--primary-blue); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Bagikan"><i class="fa-solid fa-share-nodes"></i></button>
            <button id="btn-wishlist-${item.id}" onclick="event.stopPropagation(); window.toggleWishlist('${item.id}')" style="position:absolute; top:10px; right:50px; background:rgba(255,255,255,0.9); color:var(--text-gray); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Simpan ke Wishlist"><i class="${window.isInWishlist && window.isInWishlist(item.id) ? 'fa-solid' : 'fa-regular'} fa-heart" ${window.isInWishlist && window.isInWishlist(item.id) ? 'style="color:#ef4444;"' : ''}></i></button>
            <span class="tag"><i class="fa-regular fa-clock" style="margin-right: 4px;"></i> ${item.duration || '1 HARI'}</span>
            ${parentBadge}
            ${ratingBadge}
            <img src="${item.imageUrl}" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'">
        </div>
        <div class="content">
            <h3>${item.title}</h3>
            <ul>
                <li><i class="fa-solid fa-check"></i> ${item.description || ''}</li>
            </ul>
            <div class="price-row">
                <div class="price"><span>Mulai dari</span>${formatPrice(item.price)}</div>
                ${btnHtml}
            </div>
        </div>
    </div>
`};

// ===== SUB-PACKAGE MODAL LOGIC =====
window.openSubPackageModal = (parentId) => {
    const parentItem = globalItems.find(i => i.id === parentId);
    if (!parentItem) return;

    const children = globalItems.filter(i => i.parentId === parentId);

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
            const formattedPrice = child.price ? formatPrice(child.price) : '';
            return `
            <div style="background:white; border:none; border-radius:16px; overflow:hidden; box-shadow:0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04); cursor:pointer; display:flex; flex-direction:column; transition: transform 0.3s ease, box-shadow 0.3s ease;"
                 onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)';"
                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)';"
                 onclick="openTourModal('${child.id}');">
                <!-- Image -->
                <div style="position:relative; height:180px; overflow:hidden;">
                    <button onclick="event.stopPropagation(); window.shareItem('${child.id}', '${child.title.replace(/'/g, "\\'")}', '${formatPrice(child.price)}')" style="position:absolute; top:10px; right:10px; background:rgba(255,255,255,0.9); color:var(--primary-blue); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Bagikan"><i class="fa-solid fa-share-nodes"></i></button>
                    <button id="btn-wishlist-${child.id}" onclick="event.stopPropagation(); window.toggleWishlist('${child.id}')" style="position:absolute; top:10px; right:50px; background:rgba(255,255,255,0.9); color:var(--text-gray); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Simpan ke Wishlist"><i class="${window.isInWishlist && window.isInWishlist(child.id) ? 'fa-solid' : 'fa-regular'} fa-heart" ${window.isInWishlist && window.isInWishlist(child.id) ? 'style="color:#ef4444;"' : ''}></i></button>
                    <img src="${child.imageUrl || parentItem.imageUrl}" alt="${child.title}"
                        style="width:100%; height:100%; object-fit:cover; transition: transform 0.5s ease;"
                        onmouseover="this.style.transform='scale(1.08)'"
                        onmouseout="this.style.transform='scale(1)'"
                        onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600'">
                    ${formattedPrice ? `<div style="position:absolute; bottom:12px; right:12px; background:rgba(255, 255, 255, 0.95); backdrop-filter:blur(4px); color:#0f172a; font-size:0.65rem; font-weight:800; padding:4px 8px; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.4);">${formattedPrice} <span style="font-size:0.5rem; font-weight:600; color:#64748b;">/orang</span></div>` : ''}
                </div>
                <!-- Content -->
                <div style="padding:16px 20px; display:flex; flex-direction:column; flex:1;">
                    <h4 style="margin:0 0 8px; font-size:0.95rem; font-weight:800; color:#0f172a; line-height:1.4;">${child.title}</h4>
                    <div style="display:flex; gap:3px; margin-bottom:16px; align-items:center; flex-wrap:wrap;">
                        <i class="fa-solid fa-star" style="color:#fbbf24; font-size:0.75rem;"></i>
                        <i class="fa-solid fa-star" style="color:#fbbf24; font-size:0.75rem;"></i>
                        <i class="fa-solid fa-star" style="color:#fbbf24; font-size:0.75rem;"></i>
                        <i class="fa-solid fa-star" style="color:#fbbf24; font-size:0.75rem;"></i>
                        <i class="fa-solid fa-star" style="color:#fbbf24; font-size:0.75rem;"></i>
                        <span style="font-size:0.7rem; color:#64748b; margin-left:6px; font-weight:500; white-space:nowrap;">(Top Rated)</span>
                    </div>
                    <div style="margin-top:auto; padding-top:12px; border-top:1px dashed #e2e8f0; text-align:center;">
                        <span style="color:#0ea5e9; font-size:0.85rem; font-weight:700; display:flex; align-items:center; justify-content:center; gap:8px; transition: color 0.2s ease;">
                            Lihat Detail Paket <i class="fa-solid fa-arrow-right" style="font-size:0.8rem;"></i>
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
    document.body.style.overflow = '';
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
            <button onclick="window.shareItem('${item.title.replace(/'/g, "\\'")}', '${formatPrice(item.price)}')" style="position:absolute; top:10px; right:10px; background:rgba(255,255,255,0.9); color:var(--primary-blue); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Bagikan"><i class="fa-solid fa-share-nodes"></i></button>
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
                <div class="price">
                    <span>Mulai dari</span>
                    <div style="display: flex; align-items: baseline; gap: 4px;">
                        ${formatPrice(item.price)} 
                        <small style="font-size: 0.7rem; color: #64748b; font-weight: 500;">/ ${item.duration || 'hari'}</small>
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
            mediaHtml = `<video width="100%" height="100%" controls style="border-radius: 20px 20px 0 0; object-fit: cover; background: #000;"><source src="${iframeSrc}" type="video/mp4">Your browser does not support HTML video.</video>`;
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
        <div class="img-wrapper" style="height: 250px; position: relative;">
            <button onclick="window.shareItem('${item.id}', '${item.title.replace(/'/g, "\\'")}', '${formatPrice(item.price)}')" style="position:absolute; top:10px; right:10px; background:rgba(255,255,255,0.9); color:var(--primary-blue); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Bagikan"><i class="fa-solid fa-share-nodes"></i></button>
            <button id="btn-wishlist-${item.id}" onclick="event.stopPropagation(); window.toggleWishlist('${item.id}')" style="position:absolute; top:10px; right:50px; background:rgba(255,255,255,0.9); color:var(--text-gray); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Simpan ke Wishlist"><i class="${window.isInWishlist && window.isInWishlist(item.id) ? 'fa-solid' : 'fa-regular'} fa-heart" ${window.isInWishlist && window.isInWishlist(item.id) ? 'style="color:#ef4444;"' : ''}></i></button>
            ${mediaHtml}
        </div>
        <div class="content" style="padding: 20px;">
            <h3 style="color: var(--primary-blue); font-size: 1.2rem; margin-bottom: 5px;">${item.title}</h3>
            ${dateHtml}
            <p style="color: var(--text-gray); font-size: 0.9rem; margin-bottom: 25px;">${item.description}</p>
            ${buttonHtml}
        </div>
    </div>
    `;
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
        }
    } catch (e) {
        console.error("Failed to fetch settings", e);
    }

    const servicesContainer = document.getElementById('services-container');
    const fleetContainer = document.getElementById('fleet-container');

    // Fetch all data
    globalItems = await fetchItems();
    window.globalItems = globalItems;

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
                const itemReviews = window.allReviewsData.filter(r => r.itemId === item.id && r.status === 'approved');
                if (itemReviews.length > 0) {
                    const avg = itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length;
                    item.rating = avg.toFixed(1).replace('.0', '');
                    item.reviewCount = itemReviews.length;
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

    const isDpPayment = data.isDp === true || data.isDp === 'true';

    const isPaid = data.status === 'PAID';
    let sc = isPaid ? '#16a34a' : (data.status === 'PENDING' ? '#d97706' : '#dc2626');
    let scBg = isPaid ? '#dcfce7' : (data.status === 'PENDING' ? '#fef3c7' : '#fee2e2');
    let stText = data.status || 'UNKNOWN';
    let stIcon = isPaid ? '&#10003;' : (data.status === 'PENDING' ? '&#9203;' : '&#10007;');

    // Override untuk DP: tampilkan status khusus DP
    if (isDpPayment) {
        sc = '#ea580c';
        scBg = '#fff7ed';
        stText = 'DP - BELUM LUNAS';
        stIcon = '&#9651;'; // segitiga atas = sebagian
    }

    const fmtDate = (d) => {
        if (!d) return '-';
        try { return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }); }
        catch (e) { return d; }
    };
    const isORD = data.transactionId && data.transactionId.startsWith('ORD-');
    const isBKG = data.transactionId && data.transactionId.startsWith('BKG-');
    const typeLbl = isORD ? 'Paket Tour / QRIS' : (isBKG ? 'Rental & Transfer' : 'Reservasi');
    const issuedAt = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const logoUrl = window.location.origin + '/logo.png';

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
                <div style="font-size:11px;opacity:0.7;text-transform:uppercase;letter-spacing:1px;">${isDpPayment ? 'Bukti DP' : 'Bukti Pembayaran'}</div>
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
                    <div style="font-size:10px;font-weight:700;color:${sc};
                                text-transform:uppercase;letter-spacing:1px;">${stText}</div>
                </div>
            </div>

            ${isDpPayment ? `
            <div style="background:linear-gradient(135deg,#fff7ed,#ffedd5);border:2px solid #ea580c;border-radius:10px;padding:10px 16px;margin-bottom:12px;display:flex;align-items:center;gap:12px;">
                <div style="width:36px;height:36px;background:#ea580c;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;color:white;font-weight:900;">!</div>
                <div style="flex:1;">
                    <div style="font-size:10px;font-weight:800;color:#c2410c;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:3px;">&#9888; Pembayaran DP &mdash; Belum Lunas</div>
                    <div style="font-size:11px;color:#9a3412;">DP terbayar: <strong>Rp 500.200</strong> &nbsp;&bull;&nbsp; Sisa: <strong>${data.fullPrice ? 'Rp ' + Number(Number(data.fullPrice) - 500200).toLocaleString('id-ID') : 'Lihat admin'}</strong></div>
                    <div style="font-size:10px;color:#9a3412;margin-top:2px;">Lunasi sisa pembayaran sebelum tanggal keberangkatan.</div>
                </div>
            </div>` : ''}

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
                ${(data.endDate || data.details?.time) ? `
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">${data.endDate ? 'Tanggal Selesai' : 'Waktu Keberangkatan'}</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${data.endDate ? fmtDate(data.endDate) : data.details?.time}</div>
                </div>
                ` : ''}
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
                                letter-spacing:0.8px;margin-bottom:5px;">Lokasi Jemput</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${data.details.pickup}</div>
                </div>
                ` : ''}
                ${data.details?.dropoff ? `
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;grid-column:1/-1;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Tujuan / Drop-off</div>
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
                ${data.endDate ? (() => {
            const itemName = (data.itemName || "").toLowerCase();
            const isPackage = itemName.includes('paket') || itemName.includes('tour') || itemName.includes('trip') || itemName.includes('honeymoon') || (data.transactionId && data.transactionId.startsWith('ORD-'));
            const text = isPackage ? `Paket/layanan berakhir pada <strong>${fmtDate(data.endDate)}</strong>.` : `Masa sewa berakhir pada <strong>${fmtDate(data.endDate)}</strong>.`;
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
            const statusColor = data.status === 'PAID' ? '#22c55e' : (data.status === 'PENDING' ? '#f59e0b' : '#ef4444');
            const statusIcon = data.status === 'PAID' ? 'fa-circle-check' : (data.status === 'PENDING' ? 'fa-clock' : 'fa-circle-xmark');
            const typeLabel = (data.type === 'order' || (data.transactionId && data.transactionId.startsWith('ORD-')))
                ? '🛒 Pesanan Tour / QRIS (ORD-)'
                : '🚗 Rental & Transfer (BKG-)';

            const htmlContent = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 3rem; color: ${statusColor}; margin-bottom: 10px;">
                        <i class="fa-solid ${statusIcon}"></i>
                    </div>
                    <span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 0.85rem;">${data.status}</span>
                    <div style="margin-top: 8px; font-size: 0.78rem; color: #64748b; background: #f8fafc; display: inline-block; padding: 3px 10px; border-radius: 20px;">${typeLabel}</div>
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
                        <div style="font-weight: 700; color: #1e293b;">${data.startDate ? new Date(data.startDate).toLocaleDateString('id-ID') : '-'} ${data.endDate ? '– ' + new Date(data.endDate).toLocaleDateString('id-ID') : ''}</div>
                    </div>
                </div>
                
                <div style="margin-top: 16px;">
                    <button onclick="Swal.close(); setTimeout(()=> { window.generateEtiketPDF(window._lastBookingData); }, 300)" style="width:100%; background: linear-gradient(135deg,#1d4ed8,#0891b2); color:#fff; border:none; border-radius:10px; padding:13px 20px; font-size:0.95rem; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                        <i class="fa-solid fa-file-pdf"></i> Unduh e-Tiket PDF
                    </button>
                </div>
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
                
                if (isFleet) {
                    openCheckoutModal(item.title, item.price);
                } else {
                    openTourModal(item.id);
                }
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
// Checkout & QRIS Flow
window.closeCheckoutModal = () => {
    // Stop any active QRIS polling when modal is closed
    if (window.activePollInterval) {
        clearInterval(window.activePollInterval);
        window.activePollInterval = null;
    }
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

    const nameLower = itemName.toLowerCase();
    let category = "other";
    if (nameLower.includes("airport") || nameLower.includes("jemput") || nameLower.includes("antar") || nameLower.includes("transfer")) category = "airport";
    else if (nameLower.includes("motor")) category = "motor";
    else if (nameLower.includes("mobil") || nameLower.includes("avanza") || nameLower.includes("innova") || nameLower.includes("hiace") || nameLower.includes("brio") || nameLower.includes("xpander")) category = "mobil";
    else if (nameLower.includes("paket") || nameLower.includes("tour")) category = "tour";

    let html = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: ${method === 'wa' ? '#22c55e' : 'var(--primary-blue)'};">${method === 'wa' ? '<i class="fa-brands fa-whatsapp"></i> Form Booking via WA' : (isOrder ? "Checkout Pesanan" : "Form Booking")}</h2>
            <p style="color: #64748b; font-size: 0.9rem;">${method === 'wa' ? "Silakan lengkapi rincian booking Anda (Tanpa wajib login)." : (isOrder ? "Selesaikan pesanan item Anda." : "Lengkapi data untuk proses booking.")}</p>
        </div>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; border: 1px solid #e2e8f0;">
            <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 5px;">${method === 'wa' ? "Item Booking:" : (isOrder ? "Item yang diorder:" : "Rincian Booking:")}</p>
            <h3 style="color: var(--text-dark); margin-bottom: 5px;">${itemName}</h3>
            ${isOrder ? `<p id="co-display-price" data-base-price="${price}" style="font-weight: bold; color: var(--primary-green); font-size: 1.1rem;">${displayPrice}</p>` : ""}
        </div>


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
                    <label>${category === 'airport' ? 'Tanggal' : 'Tanggal Mulai'}</label>
                    <input type="date" id="co-start-date" class="form-control" required>
                </div>
                ${category === 'airport' ? `
                <input type="hidden" id="co-end-date" required>
                ` : (durationDays === 0 ? `
                <div class="form-group mb-3" style="flex: 1; display:flex; flex-direction:column;">
                    <label>Durasi Sewa</label>
                    <div style="display:flex; gap:10px;">
                        <select id="co-duration-select" class="form-control" style="flex:1;" required onchange="const c = document.getElementById('co-duration-custom'); if(this.value==='custom') { c.style.display='block'; c.required=true; c.focus(); } else { c.style.display='none'; c.required=false; }">
                            <option value="1">1 Hari</option>
                            <option value="2">2 Hari</option>
                            <option value="3">3 Hari</option>
                            <option value="4">4 Hari</option>
                            <option value="5">5 Hari</option>
                            <option value="6">6 Hari</option>
                            <option value="7">1 Minggu (7 Hari)</option>
                            <option value="14">2 Minggu (14 Hari)</option>
                            <option value="custom">Custom (Ketik Sendiri)</option>
                        </select>
                        <input type="number" id="co-duration-custom" class="form-control" min="1" max="60" placeholder="Berapa hari?" style="display:none; width:110px;" oninput="if(this.value>60){this.value=60;} else if(this.value<1 && this.value!==''){this.value=1;}">
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
                        ${durationDays > 0 ? (itemName.match(/(\d+H\s*\d+M)/i)?.[1] || durationDays + 'H ' + (durationDays - 1) + 'M') + ' &mdash; Durasi Paket' : 'Info Pengembalian'}
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
                <h4 style="font-size: 0.95rem; margin-bottom: 10px; color: #334155;"><i class="fa-solid fa-location-dot"></i> Detail Lokasi & Waktu</h4>
                <div class="form-group mb-3">
                    <div style="display: flex; gap: 8px;">
                        <div style="flex: 1;">
                            <label>Tempat Pengambilan (GPS/Alamat)</label>
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
                            <label>Tempat Pengembalian (GPS/Alamat)</label>
                            <input type="text" id="co-dropoff-loc" class="form-control" required placeholder="Contoh: Bandara LOP / Hotel X" style="width: 100%;">
                        </div>
                        <div>
                            <label style="font-size: 0.75rem; color: #64748b; display: block; text-align: center;">Lokasi Anda</label>
                            <button type="button" onclick="window.getCurrentLocation('co-dropoff-loc', event)" class="btn" style="background: #e2e8f0; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0 15px; height: 38px; display: flex; align-items: center; justify-content: center;" title="Gunakan Lokasi Terkini"><i class="fa-solid fa-location-crosshairs"></i></button>
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 15px;">
                    <div class="form-group mb-0" style="flex: 1;">
                        <label>Jam Pengambilan</label>
                        <input type="time" id="co-pickup-time" class="form-control" required>
                    </div>
                    <div class="form-group mb-0" style="flex: 1;">
                        <label>Jam Pengembalian</label>
                        <input type="time" id="co-dropoff-time" class="form-control" required>
                    </div>
                </div>
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
            const cars = window.globalItems.filter(i => i.category === 'car');
            cars.forEach(car => {
                vehicleOptions += `<option value="${car.title}" data-price="${car.price}">${car.title} (+ ${formatPrice(car.price)})</option>`;
            });
        }
        if (!vehicleOptions) {
            vehicleOptions = `<option value="Avanza" data-price="0">Avanza (Database kosong)</option>`;
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
    if (category === 'motor') dpAmount = 100200;
    else if (category === 'mobil') dpAmount = 200200;
    else if (category === 'tour') dpAmount = 500200;

    if (isOrder && method !== 'wa') {
        html += `
            ${price > dpAmount ? `
            <div class="form-group mb-4">
                <label style="font-weight:700;color:var(--text-dark);">Tipe Pembayaran</label>
                <div style="display:flex;gap:10px;margin-top:8px;" id="payment-type-container">
                    <label id="pt-dp-label" onclick="window.setPaymentType('dp')" style="flex:1;display:flex;align-items:flex-start;gap:10px;background:#fffbeb;border:2px solid #f59e0b;border-radius:10px;padding:12px;cursor:pointer;transition:all .2s;">
                        <input type="radio" name="payment-type-radio" id="pt-dp" value="dp" checked style="accent-color:#f59e0b;width:16px;height:16px;margin-top:2px;">
                        <div>
                            <div style="font-weight:700;color:#d97706;font-size:0.88rem;">DP (Uang Muka)</div>
                            <div style="font-size:0.75rem;color:#92400e;">Bayar ${formatPrice(dpAmount)} sekarang, sisa lunas sebelum keberangkatan.</div>
                        </div>
                    </label>
                    <label id="pt-full-label" onclick="window.setPaymentType('full')" style="flex:1;display:flex;align-items:flex-start;gap:10px;background:#f0fdf4;border:2px solid #e2e8f0;border-radius:10px;padding:12px;cursor:pointer;transition:all .2s;">
                        <input type="radio" name="payment-type-radio" id="pt-full" value="full" style="accent-color:#22c55e;width:16px;height:16px;margin-top:2px;">
                        <div>
                            <div style="font-weight:700;color:#15803d;font-size:0.88rem;">Bayar Penuh</div>
                            <div style="font-size:0.75rem;color:#166534;">Bayar total harga sekarang, langsung dikonfirmasi.</div>
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
                <select id="co-payment" class="form-control" required onchange="const d = document.getElementById('bank-details'); if(this.value==='manual') d.style.display='block'; else d.style.display='none';">
                    ${window.globalSettings && window.globalSettings.qrisMaintenanceMode 
                        ? '<option value="qris" disabled>QRIS Otomatis (Sedang Pemeliharaan)</option><option value="manual" selected>Transfer Manual (Verifikasi WA)</option>'
                        : '<option value="qris">QRIS Otomatis (Verifikasi Instan)</option><option value="manual">Transfer Manual (Verifikasi WA)</option>'}
                </select>
            </div>
            
            <div id="bank-details" style="display: ${window.globalSettings && window.globalSettings.qrisMaintenanceMode ? 'block' : 'none'}; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #cbd5e1;">
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
            <button type="submit" class="btn btn-green w-100" style="padding: 12px; font-size: 1.1rem; background: ${method === 'wa' ? '#22c55e' : 'var(--primary-green)'}; border-color: ${method === 'wa' ? '#22c55e' : 'var(--primary-green)'};">${method === 'wa' ? '<i class="fa-brands fa-whatsapp"></i> LANJUTKAN VIA WA' : 'KIRIM BOOKING'}</button>
        `;
    }

    html += `</form>
        <div id="qris-result" style="margin-top: 25px;"></div>
    `;

    modalBody.innerHTML = html;
    document.getElementById("checkout-modal").classList.add("active");

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
        // Untuk rental (0), 1 hari = pengembalian besok (daysToAdd = currentDuration)
        // Untuk paket (>0), 5 hari 4 malam = pengembalian di hari ke-5 (daysToAdd = currentDuration - 1)
        const daysToAdd = window._currentDurationDays === 0 ? currentDuration : Math.max(0, currentDuration - 1);
        sDate.setDate(sDate.getDate() + daysToAdd);
        endDateEl.value = sDate.toISOString().split('T')[0];

        // Tampilkan info box tanggal selesai untuk semua pesanan (rental maupun paket)
        const infoBox = document.getElementById('date-duration-info');
        const infoText = document.getElementById('date-duration-text');
        if (infoBox && infoText) {
            infoBox.style.display = 'flex';
            const opt = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = sDate.toLocaleDateString('id-ID', opt);
            if (window._currentDurationDays === 0) {
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

        // Dynamic pricing for rentals (items without fixed duration "H" in name)
        const basePriceEl = document.getElementById("co-display-price");
        if (basePriceEl && window._currentDurationDays === 0) {
            const basePrice = parseInt(basePriceEl.getAttribute("data-base-price") || 0);
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
                const total = basePrice * diffDays;
                basePriceEl.innerHTML = formatPrice(total) + ` <span style="font-size:0.85rem;color:#64748b;font-weight:normal;">(${diffDays} Hari)</span>`;
            }
        }
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

    const name = document.getElementById("co-name").value;
    const phone = document.getElementById("co-phone").value;
    const emailInput = document.getElementById("co-email")?.value || '';
    const startDate = document.getElementById("co-start-date").value;
    const endDate = document.getElementById("co-end-date").value;
    const payment = document.getElementById("co-payment").value;
    const modalBody = document.getElementById("checkout-modal-body");

    const nameLower = itemName.toLowerCase();
    let category = "other";
    if (nameLower.includes("airport") || nameLower.includes("jemput") || nameLower.includes("antar") || nameLower.includes("transfer")) category = "airport";
    else if (nameLower.includes("motor")) category = "motor";
    else if (nameLower.includes("mobil") || nameLower.includes("avanza") || nameLower.includes("innova") || nameLower.includes("hiace") || nameLower.includes("brio") || nameLower.includes("xpander")) category = "mobil";
    else if (nameLower.includes("paket") || nameLower.includes("tour")) category = "tour";

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
    
    const getWaText = (isManual, transactionId = null, promoInfoText = "") => {
        let waText = "";
        let paymentInfo = "Catatan: Booking dinyatakan terkonfirmasi setelah pembayaran booking fee diterima.\n💳 Pembayaran lock bookingan (DP)/Pelunasan transfer:\nBANK: Bank Rakyat Indonesia\nNama: Lalu Renggane\nNomor Rekening: 759801017387536\n\nBANK: Mandiri\nNama: Lalu Renggane\nNomor Rekening: 1610017191425";
        let introText = isManual ? "Saya telah melakukan Booking via Website dengan rincian:" : "Saya ingin melakukan pesanan (Booking) dengan rincian sebagai berikut:";

        if (category === 'motor') {
            waText = `Halo Admin Travel Lombok Airport,\n\n${introText}\n\nFORM BOOKING SEWA MOTOR\nTempat Pengambilan (lokasi gps/alamat): ${pickupLoc}\nTempat Pengembalian (lokasi gps/alamat): ${dropoffLoc}\nJam Pengambilan: ${pickupTime}\nJam Pengembalian: ${dropoffTime}\nNama: ${name}\nLayanan: ${itemName}\nTgl Mulai: ${startDate}\nTgl Selesai: ${endDate}\nNo HP/WA: ${phone}\nEmail: ${customerEmail || '-'}\n\nCatatan: Booking dinyatakan terkonfirmasi setelah pembayaran booking fee (DP Rp 100.200) diterima.\n💳 Pembayaran lock bookingan (DP)/Pelunasan transfer:\nBANK: Bank Rakyat Indonesia\nNama: Lalu Renggane\nNomor Rekening: 759801017387536\n\nBANK: Mandiri\nNama: Lalu Renggane\nNomor Rekening: 1610017191425`;
        } else if (category === 'mobil') {
            waText = `Halo Admin Travel Lombok Airport,\n\n${introText}\n\nFORM BOOKING SEWA MOBIL\nTanggal Pengambilan: ${startDate}\nTanggal Pengembalian: ${endDate}\nTempat Pengambilan (lokasi gps/alamat): ${pickupLoc}\nTempat Pengembalian (lokasi gps/alamat): ${dropoffLoc}\nJam Pengambilan: ${pickupTime}\nJam Pengembalian: ${dropoffTime}\nNama: ${name}\nLayanan: ${itemName}\nNo HP/WA: ${phone}\nEmail: ${customerEmail || '-'}\n\nCatatan: Booking dinyatakan terkonfirmasi setelah pembayaran booking fee (DP Rp 200.200) diterima.\n💳 Pembayaran lock bookingan (DP)/Pelunasan transfer:\nBANK: Bank Rakyat Indonesia\nNama: Lalu Renggane\nNomor Rekening: 759801017387536\n\nBANK: Mandiri\nNama: Lalu Renggane\nNomor Rekening: 1610017191425`;
        } else if (category === 'airport') {
            waText = `Halo Admin Travel Lombok Airport,\n\n${introText}\n\nFORM BOOKING AIRPORT TRANSFER\nNama: ${name}\nNomor WA: ${phone}\nEmail: ${customerEmail || '-'}\nLokasi penjemputan (gps lokasi/alamat): ${pickupLoc}\nAlamat Tujuan (gps lokasi/alamat): ${dropoffLoc}\nNomor penerbangan: ${flightNum}\nTanggal: ${startDate}\nJam penjemputan: ${pickupTime}\nJumlah penumpang: ${pax}\nCatatan: ${notes}\n\n${paymentInfo}`;
        } else if (category === 'tour') {
            waText = `Halo Admin Travel Lombok Airport,\n\n${introText}\n\nFORM BOOKING PRIVATE TOUR LOMBOK\nMohon isi data berikut untuk proses booking:\nLokasi Jemput (berdasarkan GPS/Alamat): ${pickupLoc}\nLokasi Drop Off: ${dropoffLoc}\n\nPaket yang Dipilih: ${itemName}\nKendaraan: ${tourVehicle}\n\nTotal Harga: ${finalPrice > 0 ? formatPrice(finalPrice) : 'Rp __________'}\nDP/Booking Fee: Rp 500.200\nSisa Pembayaran: ${finalPrice > 500200 ? formatPrice(finalPrice - 500200) : 'Rp __________'}\nCatatan/Request: ${notes || '-'}\nNama: ${name}\nTanggal: ${startDate}\nNo HP/WA: ${phone}\n\n${paymentInfo}`;
        } else {
            waText = `Halo Admin Travel Lombok Airport,\n\n${introText}\n\n*Detail Pesanan*\n- Nama: ${name}\n- Layanan: ${itemName}\n- Tgl Mulai: ${startDate}\n- Tgl Selesai: ${endDate}\n${isPackage ? '' : `- Durasi: ${Math.ceil((selEnd - selStart) / (1000 * 60 * 60 * 24)) || 1} Hari\n`}${finalPrice > 0 ? `- Total Estimasi: ${formatPrice(finalPrice)}\n` : ''}- No HP/WA: ${phone}\n- Email: ${customerEmail || '-'}\n\nMohon instruksi selanjutnya. Terima kasih.`;
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

    let dpAmount = 500200;
    if (category === 'motor') dpAmount = 100200;
    else if (category === 'mobil') dpAmount = 200200;
    else if (category === 'tour') dpAmount = 500200;

    // Cek apakah user memilih DP
    const isDp = baseTotal > dpAmount && document.getElementById('pt-dp')?.checked === true;
    let paymentAmount = discountedTotal;
    
    if (isDp) {
        paymentAmount = dpAmount;
        if (paymentAmount > discountedTotal) paymentAmount = discountedTotal;
    }

    const bookingData = {
        itemName,
        customerName: name,
        phone,
        startDate,
        endDate,
        price: paymentAmount,
        isDp: isDp,
        fullPrice: discountedTotal,
        customerEmail,
        promoCode: promoCode,
        promoDiscount: promoDiscount,
        details: {
            pickup: pickupLoc,
            dropoff: dropoffLoc,
            time: pickupTime || dropoffTime,
            pax: pax,
            flightNumber: flightNum,
            vehicle: tourVehicle,
            notes: notes
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
    const pendingTxId = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 9000 + 1000);
    window._pendingQrisTxId = pendingTxId;
    try {
        await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...bookingData, status: 'PENDING', transactionId: pendingTxId })
        });
    } catch (e) { console.error('Failed to save pending booking:', e); }

    try {
        fetch(`${API_URL}/payment/qris`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: finalPrice, customer_name: name })
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
                        
                        <div style="margin-top: 15px; padding: 12px; background: #fff8f1; border-radius: 8px; border: 1px solid #ffedd5; text-align: left;">
                            <p style="font-size: 0.82rem; color: #d97706; margin-bottom: 10px; line-height: 1.4;">
                                <i class="fa-solid fa-circle-info" style="margin-right: 3px;"></i> Jika konfirmasi pembayaran otomatis mengalami keterlambatan setelah Anda membayar, status pesanan dapat dipantau melalui halaman <b>Riwayat Transaksi</b>.
                            </p>
                            <a href="https://travellombokairport.com/riwayat" style="display: block; width: 100%; padding: 8px; font-size: 0.85rem; font-weight: bold; text-decoration: none; border-radius: 8px; text-align: center; color: var(--primary-blue); border: 1px solid var(--primary-blue); transition: all 0.2s;" onmouseover="this.style.background='var(--primary-blue)'; this.style.color='white'" onmouseout="this.style.background='transparent'; this.style.color='var(--primary-blue)'">Buka Riwayat Transaksi</a>
                        </div>
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

                const pollInterval = setInterval(async () => {
                    // Use AbortController so stale requests don't pile up
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
                }, 2000); // Poll every 2 seconds for faster detection
                window.activePollInterval = pollInterval;

            } else {
                qrisResult.innerHTML = `<div class="text-center text-danger p-4" style="background: #fff1f2; border-radius: 12px; margin-top: 20px;">Gagal memuat kode QRIS. Silakan coba lagi.</div>`;
                if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'COBA LAGI'; }
            }
        }).catch(e => {
            qrisResult.innerHTML = `<div class="text-center text-danger p-4" style="background: #fff1f2; border-radius: 12px; margin-top: 20px;">Koneksi error. Silakan coba lagi.</div>`;
            if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'COBA LAGI'; }
        });
    } catch (e) {
        qrisResult.innerHTML = `<div class="text-center text-danger p-4" style="background: #fff1f2; border-radius: 12px; margin-top: 20px;">Terjadi kesalahan internal.</div>`;
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'COBA LAGI'; }
    }
};

window.simulateQrisSuccess = async (isBookingOnly, transactionId) => {
    const modalBody = document.getElementById("checkout-modal-body");
    const idPrefix = isBookingOnly ? "BKG-" : "ORD-";
    const id = transactionId || (idPrefix + Math.floor(Math.random() * 10000));

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
        window.currentCheckoutData = null;
        window._pendingQrisTxId = null;
    }

    modalBody.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            <i class="fa-solid fa-circle-check" style="font-size: 5rem; color: var(--primary-green); margin-bottom: 20px;"></i>
            <h2 style="color: var(--text-dark); margin-bottom: 10px;">${isBookingOnly ? "Booking Berhasil!" : "Pembayaran Berhasil!"}</h2>
            <p style="color: #64748b; margin-bottom: 20px;">Terima kasih, pesanan Anda telah kami terima.</p>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px dashed #cbd5e1; margin-bottom: 25px; position: relative;">
                <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 5px;">Nomor Refrensi Anda:</p>
                <h3 style="color: var(--primary-blue); font-family: monospace; font-size: 1.5rem; letter-spacing: 2px;">${id}</h3>
                <button onclick="navigator.clipboard.writeText('${id}'); const icon = this.querySelector('i'); icon.className='fa-solid fa-check'; Swal.fire({icon: 'success', title: 'ID Disalin', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000}); setTimeout(()=>icon.className='fa-solid fa-copy', 2000)" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: white; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; cursor: pointer; color: var(--primary-blue);" title="Salin / Copy"><i class="fa-solid fa-copy"></i></button>
            </div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <button onclick="downloadPdfInvoice('${id}')" class="btn btn-primary" style="flex: 1; background: #10b981;"><i class="fa-solid fa-file-pdf"></i> Unduh e-Tiket</button>
            </div>
            <button onclick="closeCheckoutModal()" class="btn btn-outline" style="width: 100%;">TUTUP</button>
            
        </div>
    `;
};

window.downloadPdfInvoice = (id) => {
    // Buat wrapper off-screen agar html2pdf bisa merender HTML dengan sempurna (tidak display: none)
    const wrapper = document.createElement('div');
    // Tambahkan style position absolute agar tetap berada di DOM dan punya height, tapi tidak terlihat
    wrapper.style.cssText = 'position:absolute; left:0; top:0; z-index:-9999; visibility:hidden; overflow:hidden; width:800px; padding:0; margin:0;';

    // Cari data di raw history data yang baru diambil
    const historyData = window._lastHistoryData || [];
    const item = historyData.find(x => x.id === id || x.transactionId === id) || window.currentCheckoutData;
    if (!item) {
        alert('Data transaksi tidak ditemukan.');
        return;
    }

    const {
        transactionId,
        itemName,
        customerName,
        customerEmail,
        phone,
        startDate,
        endDate,
        status,
        itemPrice,
        createdAt,
        type
    } = item;

    // Formatting tanggal
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
    const dateStr = fmtDate(startDate) + (endDate ? ' - ' + fmtDate(endDate) : '');
    const issueDate = fmtDate(createdAt || new Date());
    const total = 'Rp ' + parseInt(itemPrice || 0).toLocaleString('id-ID');

    wrapper.innerHTML = `
        <div id="pdf-content" style="width: 800px; padding: 50px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; background: white; box-sizing: border-box;">
            
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0284c7; padding-bottom: 25px; margin-bottom: 35px;">
                <div>
                    <h1 style="color: #0284c7; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">TRAVEL LOMBOK AIRPORT</h1>
                    <p style="margin: 8px 0 0 0; font-size: 15px; color: #64748b;">Layanan Transportasi & Wisata Profesional</p>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8;">📞 +62 878-7555-5203 | 🌐 travellombokairport.com</p>
                </div>
                <div style="text-align: right;">
                    <div style="background: #dcfce7; color: #10b981; padding: 8px 20px; border-radius: 30px; font-weight: bold; font-size: 16px; display: inline-block; margin-bottom: 10px;">
                        ${status || 'PAID'}
                    </div>
                    <h2 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 700;">E-TIKET / INVOICE</h2>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b; font-family: monospace;">Ref: ${transactionId || id}</p>
                </div>
            </div>
            
            <!-- Guest Info -->
            <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 35px; border: 1px solid #e2e8f0;">
                <h3 style="margin: 0 0 15px 0; color: #0284c7; font-size: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 10px;">DETAIL PEMESAN (GUEST INFO)</h3>
                <div style="display: flex; flex-wrap: wrap;">
                    <div style="width: 50%; margin-bottom: 15px;">
                        <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Nama Tamu</p>
                        <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 600;">${customerName}</p>
                    </div>
                    <div style="width: 50%; margin-bottom: 15px;">
                        <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Tanggal Pelaksanaan</p>
                        <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 600;">${dateStr}</p>
                    </div>
                </div>
            </div>
            
            <!-- Order Details -->
            <h3 style="margin: 0 0 15px 0; color: #0284c7; font-size: 16px;">DETAIL LAYANAN (ORDER DETAILS)</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
                <thead>
                    <tr style="background: #0f172a; color: white;">
                        <th style="padding: 15px; text-align: left; font-size: 14px; border-top-left-radius: 8px;">Deskripsi Layanan</th>
                        <th style="padding: 15px; text-align: right; font-size: 14px; border-top-right-radius: 8px; width: 30%;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 20px 15px; border-bottom: 1px solid #e2e8f0; font-size: 16px; font-weight: 500;">
                            ${itemName}
                            ${item.details?.pickup ? `<br><small style="color: #64748b; font-size: 13px; margin-top: 5px; display: inline-block;"><b>Pickup:</b> ${item.details.pickup}</small>` : ''}
                            ${item.details?.dropoff ? `<br><small style="color: #64748b; font-size: 13px;"><b>Drop-off:</b> ${item.details.dropoff}</small>` : ''}
                            ${item.details?.flightNumber ? `<br><small style="color: #64748b; font-size: 13px;"><b>Flight:</b> ${item.details.flightNumber}</small>` : ''}
                            ${item.details?.pax ? `<br><small style="color: #64748b; font-size: 13px;"><b>Pax:</b> ${item.details.pax}</small>` : ''}
                            ${item.details?.vehicle ? `<br><small style="color: #64748b; font-size: 13px;"><b>Vehicle:</b> ${item.details.vehicle}</small>` : ''}
                            ${item.details?.notes ? `<br><small style="color: #64748b; font-size: 13px;"><b>Notes:</b> ${item.details.notes}</small>` : ''}
                        </td>
                        <td style="padding: 20px 15px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 16px; font-weight: 700; color: #0284c7;">
                            ${total}
                        </td>
                    </tr>
                </tbody>
            </table>
            
            <!-- Footer -->
            <div style="margin-top: 50px; text-align: center; color: #64748b;">
                <div style="width: 60px; height: 60px; background: #f1f5f9; border-radius: 50%; display: inline-flex; justify-content: center; align-items: center; margin-bottom: 15px;">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <p style="margin: 0 0 5px 0; font-size: 16px; color: #1e293b; font-weight: 600;">Terima kasih atas pesanan Anda!</p>
                <p style="margin: 0; font-size: 13px;">Harap simpan e-Tiket ini dan tunjukkan kepada pengemudi atau petugas kami saat hari keberangkatan.</p>
                <p style="margin: 15px 0 0 0; font-size: 11px; opacity: 0.7;">Dokumen ini diterbitkan secara otomatis oleh sistem Travel Lombok Airport dan sah tanpa tanda tangan.</p>
                <div style="margin-top: 12px; display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #1d4ed8, #0891b2); border-radius: 20px; padding: 5px 14px;">
                    <span style="font-size: 11px; color: #fff; font-weight: 700; letter-spacing: 0.5px;">&#127760; Dipesan melalui website travellombokairport.com</span>
                </div>
            </div>
            
        </div>
    `;

    document.body.appendChild(wrapper);

    const element = wrapper.querySelector('#pdf-content');

    const opt = {
        margin: [0, 0, 0, 0], // nol margin agar background penuh
        filename: `e-Tiket_${id}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'px', format: [800, element.offsetHeight + 100], orientation: 'portrait', hotfixes: ['px_scaling'] },
        pagebreak: { mode: 'avoid-all' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        document.body.removeChild(wrapper);
    }).catch(err => {
        document.body.removeChild(wrapper);
        console.error('PDF generation error:', err);
        alert('Gagal mendownload PDF: ' + err.message);
    });
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
        html += `
        <div class="review-card" data-aos="fade-up">
            <div class="review-content">
                <div style="display: flex; gap: 4px; margin-bottom: 12px; font-size: 0.9rem;">${stars}</div>
                <p class="review-text">"${r.comment}"</p>
            </div>
            <div class="review-author">
                <div class="review-author-avatar">${initial}</div>
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

    try {
        const res = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, rating, comment })
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
    if (savedCheckout) {
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

    if (authContainer && userContainer) {
        if (token && user) {
            authContainer.style.display = 'none';
            userContainer.style.display = 'flex';
            if (userNameDisplay) userNameDisplay.innerText = user.name || 'Pengguna';
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
            if (event) event.stopPropagation();
            if (navigator.clipboard) {
                navigator.clipboard.writeText(id).then(() => {
                    const originalHtml = btn.innerHTML;
                    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
                    btn.style.background = '#10b981';
                    setTimeout(() => {
                        btn.innerHTML = originalHtml;
                        btn.style.background = 'var(--primary-blue)';
                    }, 2000);
                }).catch(err => console.error('Gagal menyalin:', err));
            } else {
                // Fallback for older browsers
                const textArea = document.createElement("textarea");
                textArea.value = id;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    const originalHtml = btn.innerHTML;
                    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
                    btn.style.background = '#10b981';
                    setTimeout(() => {
                        btn.innerHTML = originalHtml;
                        btn.style.background = 'var(--primary-blue)';
                    }, 2000);
                } catch (err) {
                    console.error('Gagal menyalin:', err);
                }
                document.body.removeChild(textArea);
            }
        };

        window.showTransactionDetail = (encodedData) => {
            const item = JSON.parse(decodeURIComponent(encodedData));
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
        <button onclick="Swal.close(); setTimeout(()=>{ window.generateEtiketPDF(window._lastBookingData); }, 300)" 
            style="background:linear-gradient(135deg, #0ea5e9, #2563eb); border:none; color:white; font-size:0.95rem; padding:14px 20px; border-radius:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; font-weight:700; width:100%; margin-top:25px; box-shadow:0 8px 20px rgba(14,165,233,0.3); transition:all 0.3s;"
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 25px rgba(14,165,233,0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 20px rgba(14,165,233,0.3)';">
            <i class="fa-solid fa-file-pdf" style="font-size:1.2rem;"></i> Download E-Tiket (PDF)
        </button>
    `;

            let detailsHtml = '';
            const showRow = (label, val) => {
                if (!val || val === '-') return '';
                // Ubah layout jadi kolom agar rapi dan responsif, tidak tabrakan di layar HP
                return `
            <div style="padding: 12px 0; border-bottom: 1px dashed #e2e8f0; display: flex; flex-direction: column; gap: 4px;">
                <span style="color:#64748b; font-size:0.8rem; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">${label}</span>
                <span style="color:#1e293b; font-weight:700; font-size:0.95rem; word-break: break-word; line-height: 1.4;">${val}</span>
            </div>
        `;
            };

            detailsHtml += showRow('Nama Pemesan', item.customerName || item.userEmail);
            detailsHtml += showRow('Email', item.customerEmail || item.userEmail);
            detailsHtml += showRow('No. HP / WA', item.phone || item.details?.phone);
            detailsHtml += showRow('Tgl Keberangkatan', item.startDate || item.details?.date);
            if (item.endDate) detailsHtml += showRow('Tgl Selesai', item.endDate);
            if (item.details?.time) detailsHtml += showRow('Waktu', item.details.time);
            if (item.details?.pax) detailsHtml += showRow('Jumlah Peserta', item.details.pax + ' Orang');
            if (item.details?.pickup) detailsHtml += showRow('Lokasi Jemput', item.details.pickup);
            if (item.details?.dropoff) detailsHtml += showRow('Tujuan', item.details.dropoff);
            if (item.details?.flightNumber) detailsHtml += showRow('No. Penerbangan', item.details.flightNumber);

            Swal.fire({
                showCloseButton: true,
                showConfirmButton: false,
                width: '520px',
                html: `
            <div style="text-align: left;">
                <div style="text-align:center; margin-bottom:25px; margin-top:10px;">
                        <div style="width:65px; height:65px; background:rgba(59, 130, 246, 0.1); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 15px; color:#3b82f6; font-size:2rem; box-shadow: 0 0 0 10px rgba(59, 130, 246, 0.05);">
                            <i class="fa-solid fa-receipt"></i>
                        </div>
                        <h3 style="color:#1e293b; font-size:1.4rem; font-weight:800; margin-bottom:6px;">Detail Transaksi</h3>
                        <p style="color:#94a3b8; font-size:0.85rem; margin-bottom:16px;">${tgl}</p>
                        <span style="display:inline-block; font-size:0.8rem; font-weight:700; color:${statusColor}; background:${statusBg}; padding:6px 16px; border-radius:20px; letter-spacing:0.5px;">
                            ${item.status}
                        </span>
                    </div>
                    
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:18px; padding:20px; margin-bottom:25px;">
                        <div style="text-align:center; margin-bottom:18px;">
                            <p style="color:#64748b; font-size:0.85rem; margin-bottom:5px;">Total Pembayaran</p>
                            <h2 style="color:var(--primary-blue); font-size:2rem; font-weight:800; margin:0; letter-spacing:-0.5px;">${price}</h2>
                        </div>
                        <div style="background:white; border-radius:14px; padding:16px; box-shadow:0 2px 10px rgba(0,0,0,0.03);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                                <span style="color:#64748b; font-size:0.85rem;"><i class="fa-solid fa-hashtag" style="opacity:0.5; margin-right:5px;"></i> ID Transaksi</span>
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <span style="font-family:monospace; font-weight:700; color:#1e293b; font-size:0.95rem; background:#f1f5f9; padding:4px 8px; border-radius:6px; letter-spacing:0.5px;">${item.transactionId}</span>
                                    <button onclick="window.copyTxId(this, '${item.transactionId}', event)" style="background:var(--primary-blue); color:white; border:none; border-radius:6px; width:26px; height:26px; display:flex; align-items:center; justify-content:center; cursor:pointer;" title="Salin ID"><i class="fa-regular fa-copy" style="font-size:0.8rem;"></i></button>
                                </div>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:6px;">
                                <span style="color:#64748b; font-size:0.85rem;"><i class="fa-solid fa-layer-group" style="opacity:0.5; margin-right:5px;"></i> Layanan</span>
                                <span style="font-weight:700; color:#1e293b; font-size:0.9rem; line-height: 1.4; padding-left: 20px;">${item.itemName}</span>
                            </div>
                        </div>
                    </div>

                    <div style="background:white; border:1px solid #e2e8f0; border-radius:18px; padding:20px;">
                        <h4 style="color:#1e293b; font-size:1rem; margin-bottom:5px; display:flex; align-items:center; gap:10px;">
                            <i class="fa-solid fa-list-check" style="color:var(--primary-blue);"></i> Informasi Pemesanan
                        </h4>
                        <div style="margin-top:15px;">
                            ${detailsHtml}
                        </div>
                    </div>

                    ${pdfBtn}
            </div>
        `
            });
        };

        data.forEach(item => {
            const isPaid = item.status === 'PAID';
            const statusColor = isPaid ? '#10b981' : (item.status === 'PENDING' ? '#f59e0b' : '#ef4444');
            const statusBg = isPaid ? 'rgba(16, 185, 129, 0.1)' : (item.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)');
            const icon = item.type === 'order' ? 'fa-box' : 'fa-car';
            const parsedPrice = parseInt((item.itemPrice || '').toString().replace(/\D/g, ''));
            const price = !isNaN(parsedPrice) && parsedPrice > 0 ? 'Rp ' + parsedPrice.toLocaleString('id-ID') : '-';
            const tgl = item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

            const encodedData = encodeURIComponent(JSON.stringify(item));

            html += `
                <div onclick="window.showTransactionDetail('${encodedData}')" style="background:white; border-radius:16px; padding:16px; border:1px solid #e2e8f0; position:relative; box-shadow:0 4px 10px rgba(0,0,0,0.02); cursor:pointer; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 12px 25px rgba(0,0,0,0.06)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 10px rgba(0,0,0,0.02)';">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; padding-bottom:12px; border-bottom:1px dashed #e2e8f0;">
                        <span style="font-size:0.75rem; color:#64748b; font-weight:600; font-family:monospace; display:flex; align-items:center; gap:6px;">
                            <i class="fa-solid fa-hashtag" style="opacity:0.6;"></i>${item.transactionId}
                            <button onclick="window.copyTxId(this, '${item.transactionId}', event)" style="background:var(--primary-blue); color:white; border:none; border-radius:4px; width:20px; height:20px; display:flex; align-items:center; justify-content:center; cursor:pointer;" title="Salin ID"><i class="fa-regular fa-copy" style="font-size:0.65rem;"></i></button>
                        </span>
                        <span style="font-size:0.75rem; font-weight:700; color:${statusColor}; background:${statusBg}; padding:4px 10px; border-radius:12px; letter-spacing:0.5px;">
                            ${item.status}
                        </span>
                    </div>
                    <div style="display:flex; gap:12px; margin-bottom:12px;">
                        <div style="width:45px; height:45px; border-radius:12px; background:#f8fafc; border:1px solid #f1f5f9; color:var(--primary-blue); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:1.2rem;">
                            <i class="fa-solid ${icon}"></i>
                        </div>
                        <div style="flex:1;">
                            <h4 style="margin:0 0 5px; font-size:1rem; color:#1e293b; font-weight:700; line-height:1.3;">${item.itemName}</h4>
                            <div style="font-size:0.8rem; color:#64748b; display:flex; align-items:center; gap:6px;">
                                <i class="fa-regular fa-calendar" style="font-size:0.9em; color:#94a3b8;"></i> Dipesan: ${tgl}
                            </div>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; margin-top:12px; padding-top:12px; border-top:1px dashed #f1f5f9;">
                        <div style="font-weight:800; color:var(--primary-blue); font-size:1.05rem;">${price}</div>
                        <div style="margin-left:auto; font-size:0.85rem; color:#0ea5e9; font-weight:600; background:#f0f9ff; padding:6px 12px; border-radius:20px;">
                            Lihat Detail <i class="fa-solid fa-arrow-right" style="margin-left:4px; font-size:0.85em;"></i>
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

window.shareItem = (id, title, priceStr) => {
    const url = window.location.origin + window.location.pathname + '?item=' + id;
    const textWa = `Halo! 👋\n\nSaya menemukan penawaran menarik dari *Travel Lombok Airport* nih:\n\n📌 *${title}*\n💰 *${priceStr}*\n\nYuk, cek detail lengkapnya dan booking sekarang melalui link di bawah ini:\n📍 ${url}`;
    const textOther = `Ada rencana liburan ke Lombok? 🌴\n\nCek penawaran seru dari Travel Lombok Airport!\n📌 ${title}\n💰 ${priceStr}\n\nLangsung booking dan lihat detailnya di sini 👇\n📍 ${url}`;
    
    const waLink = `https://wa.me/?text=${encodeURIComponent(textWa)}`;
    const twLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textOther)}`;
    const threadsLink = `https://threads.net/intent/post?text=${encodeURIComponent(textOther)}`;

    Swal.fire({
        customClass: { container: 'swal-high-z' },
        title: '<span style="font-size:1.1rem;font-weight:800;">Bagikan Penawaran</span>',
        html: `
            <div style="display:flex; flex-direction:column; gap:12px; margin-top:10px;">
                <a href="${waLink}" target="_blank" class="btn" style="background:#25D366; color:white; border-radius:12px; padding:12px; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:10px; font-weight:700;">
                    <i class="fa-brands fa-whatsapp" style="font-size:1.2rem;"></i> Bagikan ke WhatsApp
                </a>
                <a href="${twLink}" target="_blank" class="btn" style="background:#1DA1F2; color:white; border-radius:12px; padding:12px; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:10px; font-weight:700;">
                    <i class="fa-brands fa-twitter" style="font-size:1.2rem;"></i> Bagikan ke Twitter
                </a>
                <a href="${threadsLink}" target="_blank" class="btn" style="background:#000000; color:white; border-radius:12px; padding:12px; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:10px; font-weight:700;">
                    <i class="fa-brands fa-threads" style="font-size:1.2rem;"></i> Bagikan ke Threads
                </a>
                <button onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(textOther)}')); Swal.fire({customClass:{container:'swal-high-z'},icon:'success',title:'Disalin!',toast:true,position:'top-end',showConfirmButton:false,timer:2000});" class="btn" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; border-radius:12px; padding:12px; display:flex; align-items:center; justify-content:center; gap:10px; font-weight:700;">
                    <i class="fa-solid fa-copy" style="font-size:1.2rem;"></i> Salin Link & Teks
                </button>
            </div>
        `,
        showConfirmButton: false,
        showCloseButton: true
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
            Halo Kak! 👋 Saya Lombok AI, asisten virtual Travel Lombok Airport. Ada yang bisa saya bantu untuk rencana perjalanan Anda?
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
});

window.clearChatHistory = () => {
    if (!confirm('Hapus semua riwayat percakapan dengan Lombok AI?')) return;
    chatHistory = [];
    localStorage.removeItem('aiChatHistory');
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer) {
        messagesContainer.innerHTML = `
            <div class="message ai-message">
                Halo Kak! 👋 Saya Lombok AI, asisten virtual Travel Lombok Airport. Ada yang bisa saya bantu untuk rencana perjalanan Anda?
            </div>
            <div id="ai-quick-replies" style="display: flex; flex-direction: column; gap: 8px; margin: 10px 15px;">
                <button onclick="window.sendDeterministicReply('Saya mengalami kendala tidak bisa login, padahal sudah mereset kata sandi.', 'Mohon maaf atas ketidaknyamanan yang Anda alami. 🙏<br><br>Sehubungan dengan peningkatan infrastruktur keamanan data Travel Lombok Airport, sistem otentikasi kami saat ini sedang dalam masa transisi. Hal tersebut menyebabkan fitur **Masuk (Login)** maupun **Pengaturan Ulang Kata Sandi (Reset Password)** belum dapat beroperasi secara optimal untuk beberapa akun.<br><br>Sebagai solusi alternatif yang cepat dan aman, **kami merekomendasikan Anda untuk melakukan Registrasi ulang menggunakan alamat email yang sama**.<br><br>Anda tidak perlu khawatir, seluruh riwayat dan data akun Anda akan secara otomatis tersinkronisasi kembali dengan sistem keamanan kami yang terbaru sesaat setelah pendaftaran berhasil dilakukan.<br><br>Terima kasih atas pengertian serta kepercayaan Anda dalam menggunakan layanan kami.')" style="text-align: left; background: white; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 10px 14px; border-radius: 12px; font-size: 0.85rem; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.05); transition: all 0.2s;">
                    <i class="fa-solid fa-circle-question" style="margin-right: 6px;"></i> Bantuan Akses Akun (Gagal Login / Reset Sandi)
                </button>
            </div>
        `;
    }
    const banner = document.getElementById('guest-limit-banner');
    if (banner) banner.style.display = 'none';
    const inputArea = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat-btn');
    if (inputArea) { inputArea.disabled = false; inputArea.placeholder = 'Tanya rekomendasi paket...'; }
    if (sendBtn) sendBtn.disabled = false;
};

window.toggleChat = async () => {
    const chatWindow = document.getElementById('ai-chat-window');
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden')) {
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
                                <i class="fa-solid fa-person-digging"></i> Mohon maaf, fitur Lombok AI sedang dalam pemeliharaan dan peningkatan sistem. Silakan hubungi kami via WhatsApp sementara waktu.
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
        if (msgs) msgs.scrollTop = msgs.scrollHeight;
    }
};

window.handleChatKeyPress = (event) => {
    if (event.key === 'Enter') {
        window.sendChatMessage();
    }
};

function parseMarkdownToHTML(markdown) {
    let html = markdown;
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Links [Text](URL)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    // Newlines
    html = html.replace(/\n/g, '<br>');
    return html;
}

window.checkGuestLimit = () => {
    const isLogged = !!localStorage.getItem('auth_token') || !!localStorage.getItem('auth_user');
    const inputArea = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat-btn');
    const banner = document.getElementById('guest-limit-banner');
    
    if (!isLogged) {
        // count user messages
        const userMessagesCount = chatHistory.filter(msg => msg.role === 'user').length;
        if (userMessagesCount >= 3) {
            if (inputArea) { inputArea.disabled = true; inputArea.placeholder = 'Login untuk bertanya lebih banyak...'; }
            if (sendBtn) sendBtn.disabled = true;
            if (banner) banner.style.display = 'block';
            return true;
        }
    }
    // Hide banner if logged in or under limit
    if (banner) banner.style.display = 'none';
    if (inputArea) { inputArea.disabled = false; inputArea.placeholder = 'Tanya rekomendasi paket...'; }
    if (sendBtn) sendBtn.disabled = false;
    return false;
};

let aiSpeechRecognition = null;
let isAiRecording = false;

window.toggleVoiceInput = () => {
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

window.sendDeterministicReply = (userText, aiText) => {
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
        
        const htmlReply = parseMarkdownToHTML(aiText);
        messagesContainer.insertAdjacentHTML('beforeend', `
            <div class="message ai-message">
                ${htmlReply}
            </div>
        `);
        
        chatHistory.push({ role: 'model', parts: [{ text: aiText }] });
        localStorage.setItem('aiChatHistory', JSON.stringify(chatHistory));
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 800);
};

window.sendChatMessage = async (retryMessage = null, errorBubbleElem = null) => {
    if (window.checkGuestLimit()) return;

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
    messagesContainer.insertAdjacentHTML('beforeend', `
        <div id="${typingId}" class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `);
    
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
                                    msgContainer.innerHTML = parseMarkdownToHTML(fullReply);
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
                    chatHistory.push({ role: "user", parts: [{ text: message }] });
                    chatHistory.push({ role: "model", parts: [{ text: data.reply }] });
                    localStorage.setItem('aiChatHistory', JSON.stringify(chatHistory));
                    const htmlReply = parseMarkdownToHTML(data.reply);
                    messagesContainer.insertAdjacentHTML('beforeend', `
                        <div class="message ai-message">
                            ${htmlReply}
                        </div>
                    `);
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
