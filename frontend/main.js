const API_URL = '/api';
let globalItems = [];

// Format currency
const formatPrice = (price) => {
    if (!price) return 'Rp 0';
    // If the price is already formatted manually by user (e.g., "Rp 500.000"), return it
    if (price.toString().toLowerCase().includes('rp')) return price;
    
    // Otherwise, parse and format
    const num = parseInt(price.toString().replace(/\D/g, ''), 10);
    if (isNaN(num)) return price;
    
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(num);
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

// Format terms into HTML list
const formatTerms = (termsText) => {
    if (!termsText) return '';
    const lines = termsText.split('\n');
    let html = '';
    let inList = false;
    
    lines.forEach(line => {
        let trimmed = line.trim();
        
        // Auto-format numbers (4 digits or more) with dots (e.g. 500000 -> 500.000)
        trimmed = trimmed.replace(/\b(\d{4,})\b/g, (match) => parseInt(match, 10).toLocaleString('id-ID'));
        
        if (trimmed.match(/^\d+\.\s/)) {
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
    } catch(e) {}

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
    document.body.style.overflow = 'hidden'; // Prevent double scrollbar
};

window.closeTourModal = () => {
    const modal = document.getElementById('tour-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
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
    
    const hiddenItems = container.querySelectorAll('.hidden-item');
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
        window.scrollTo({top: y, behavior: 'smooth'});
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

// Render Package Card (Paket Tour)
const createPackageCard = (item, index = 0) => `
    <div class="card package-card" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
        <div class="img-wrapper">
            <span class="tag"><i class="fa-regular fa-clock" style="margin-right: 4px;"></i> ${item.duration || '1 HARI'}</span>
            <img src="${item.imageUrl}" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'">
        </div>
        <div class="content">
            <h3>${item.title}</h3>
            <ul>
                <li><i class="fa-solid fa-check"></i> ${item.description || ''}</li>
            </ul>
            <div class="price-row">
                <div class="price"><span>Mulai dari</span>${formatPrice(item.price)}</div>
                <button onclick="openTourModal('${item.id}')" class="btn" style="background: var(--bg-light); color: var(--primary-blue); border: none; font-size: 0.85rem; padding: 8px 16px; border-radius: 20px; font-weight: 700;">DETAIL</button>
            </div>
        </div>
    </div>
`;

// Render Fleet Card (Armada/Rental)
const createFleetCard = (item, index = 0) => `
    <div class="card fleet-card" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
        <div style="width: 100%; height: 200px; border-radius: 12px; margin-bottom: 15px; overflow: hidden; background: #f8fafc; position: relative;">
            <img src="${item.imageUrl}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.src='https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800'">
        </div>
        <h3 class="notranslate" style="color: #0f172a; font-weight: 800; font-size: 1.3rem; text-align: center; margin-bottom: 10px;">${item.title}</h3>
        <div class="fleet-features" style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 15px; font-size: 0.8rem;">
            ${item.seats ? `<span style="background: #f1f5f9; color: #475569; padding: 5px 12px; border-radius: 20px; font-weight: 600; white-space: nowrap;"><i class="fa-solid fa-user-group" style="color: var(--primary-blue); margin-right: 4px;"></i> ${item.seats} ${item.category === 'motorcycle' ? 'Helm' : 'Seat'}</span>` : ''}
            ${item.transmission ? `<span style="background: #f1f5f9; color: #475569; padding: 5px 12px; border-radius: 20px; font-weight: 600; white-space: nowrap;"><i class="fa-solid fa-gear" style="color: var(--primary-blue); margin-right: 4px;"></i> ${item.transmission}</span>` : ''}
            ${item.driverOptions ? `<span style="background: #f1f5f9; color: #475569; padding: 5px 12px; border-radius: 20px; font-weight: 600; white-space: nowrap;"><i class="fa-solid fa-id-card" style="color: var(--primary-blue); margin-right: 4px;"></i> ${item.driverOptions}</span>` : ''}
            ${item.include ? `<span style="background: #e0f2fe; color: #0284c7; padding: 5px 12px; border-radius: 20px; font-weight: 600; white-space: nowrap;"><i class="fa-solid fa-check-circle" style="margin-right: 4px;"></i> Termasuk ${item.include}</span>` : ''}
        </div>
        <div class="fleet-price" style="font-size: 1.25rem; color: var(--primary-green); font-weight: 800; text-align: center; margin-bottom: 15px;">${formatPrice(item.price)} <span style="font-size: 0.85rem; color: #64748b; font-weight: 500;">/ ${item.duration || 'hari'}</span></div>
        <div style="display: flex; gap: 10px; margin-top: auto; padding-top: 15px; border-top: 1px solid #f1f5f9;">
            <button onclick="openTourModal('${item.id}')" class="btn" style="flex:1; background: white; color: var(--primary-blue); border: 2px solid var(--primary-blue); padding: 10px; border-radius: 25px; font-weight: 700; transition: all 0.3s; font-size: 0.9rem;">DETAIL</button>
            <button onclick="openCheckoutModal('${item.title}', ${item.price})" class="btn btn-green" style="flex:1; padding: 10px; border-radius: 25px; font-weight: 700; box-shadow: 0 4px 6px rgba(5,150,105,0.2); font-size: 0.9rem;"><i class="fa-brands fa-whatsapp"></i> PESAN</button>
        </div>
    </div>
`;

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
        } catch(e) {
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
        } catch (e) {}
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
    
    // Check Global Settings (e.g. Drone Availability)
    try {
        const res = await fetch('/api/settings');
        if (res.ok) {
            const settings = await res.json();
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
    const drones = globalItems.filter(item => item.category.toLowerCase() === 'drone');
    const services = globalItems.filter(item => !packages.includes(item) && !fleets.includes(item) && !drones.includes(item));

    // Helper to render sections with "See All" button
    const renderSectionWithSeeAll = (containerId, items, renderFn) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (items.length === 0) {
            container.innerHTML = '<p class="text-center w-100" style="grid-column: 1/-1;">Belum ada data yang ditambahkan.</p>';
            return;
        }

        const maxVisible = 3;
        let html = '';
        
        items.forEach((item, index) => {
            const isHidden = index >= maxVisible;
            let cardHtml = renderFn(item, index);
            if (isHidden) {
                cardHtml = cardHtml.replace('<div class="card ', '<div class="card hidden-item" style="display: none;" ');
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

    // Render Services
    renderSectionWithSeeAll('services-container', services, createServiceCard);

    // Render Packages
    renderSectionWithSeeAll('packages-container', packages, createPackageCard);
    
    // Render Fleets
    renderSectionWithSeeAll('fleet-container', fleets, createFleetCard);
    
    // Render Drones
    renderSectionWithSeeAll('drone-container', drones, createDroneCard);
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
            
            
        </div>
    `;
};

window.downloadPdfInvoice = (id) => {
    // Buat wrapper off-screen agar html2pdf bisa merender HTML dengan sempurna (tidak display: none)
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '-9999px';
    
    const data = window.currentCheckoutData || {};
    const itemName = data.itemName || 'Layanan Travel Lombok';
    const customerName = data.customerName || '-';
    const tgl = data.startDate ? new Date(data.startDate).toLocaleDateString('id-ID', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}) : '-';
    const total = data.itemPrice ? 'Rp ' + parseInt(data.itemPrice).toLocaleString('id-ID') : '-';

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
                    <div style="background: #10b981; color: white; padding: 8px 20px; border-radius: 30px; font-weight: bold; font-size: 16px; display: inline-block; margin-bottom: 10px;">
                        LUNAS (PAID)
                    </div>
                    <h2 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 700;">E-TIKET / INVOICE</h2>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b; font-family: monospace;">Ref: ${id}</p>
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
                        <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 600;">${tgl}</p>
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
            </div>
            
        </div>
    `;
    
    document.body.appendChild(wrapper);
    
    const element = wrapper.querySelector('#pdf-content');
    
    const opt = {
      margin:       [0, 0, 0, 0], // nol margin agar background penuh
      filename:     `e-Tiket_${id}.pdf`,
      image:        { type: 'jpeg', quality: 1.0 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
        document.body.removeChild(wrapper);
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



// trigger new build
