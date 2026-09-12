import"./modulepreload-polyfill-P2Xu9kJm.js";import"./pwa-DYmKx9RI.js";/* empty css              */!window.location.pathname.includes(`admin`)&&!window.location.pathname.includes(`driver`)&&(document.addEventListener(`contextmenu`,e=>e.preventDefault()),document.addEventListener(`keydown`,e=>{e.ctrlKey&&(e.key===`c`||e.key===`u`||e.key===`s`||e.key===`p`)&&e.preventDefault(),e.key===`F12`&&e.preventDefault()}));var e=(window.location.hostname===`localhost`||window.location.hostname,`/api`);(async()=>{let e=window.location.pathname;if(![`/admin`,`/maintenance`,`/login`,`/register`,`/verify`,`/driver`].some(t=>e.includes(t)))try{let e=await fetch(`/api/settings`,{cache:`no-store`});if(e.ok){let t=await e.json(),n=localStorage.getItem(`adminToken`);if(t.maintenanceMode===!0&&!n){localStorage.setItem(`maintenanceMode`,`true`),window.location.replace(`/maintenance.html`);return}if(!n){localStorage.setItem(`maintenanceMode`,`false`);let e=document.getElementById(`anti-flash`);e&&e.remove(),document.body.style.opacity=`1`,document.body.style.visibility=`visible`,document.body.style.pointerEvents=`auto`}else if(n){let e=document.getElementById(`anti-flash`);e&&e.remove(),document.body.style.opacity=`1`,document.body.style.visibility=`visible`,document.body.style.pointerEvents=`auto`}if(window.globalEventSettings={eventMode:t.eventMode===!0,eventName:t.eventName||``,eventPriceIncrease:parseInt(t.eventPriceIncrease)||0},t.eventMode===!0&&t.eventPriceIncrease>0){let e=document.createElement(`div`);e.id=`event-mode-banner`,e.innerHTML=`
                    <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; text-align: center; padding: 12px 40px 12px 16px; font-size: 0.85rem; font-weight: 600; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999; box-shadow: 0 -4px 15px rgba(0,0,0,0.2);">
                        <i class="fa-solid fa-fire" style="margin-right: 6px;"></i>
                        🎉 ${t.eventName?`EVENT: <strong>${t.eventName}</strong> —`:`HIGH SEASON!`} 
                        Harga Motor & Mobil naik <strong>Rp ${parseInt(t.eventPriceIncrease).toLocaleString(`id-ID`)}</strong>/unit &nbsp;|&nbsp; 
                        <i class="fa-solid fa-calendar-days"></i> Min. sewa <strong>4 Hari</strong>
                        <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; opacity: 0.8; cursor: pointer; position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 1.2rem; padding: 5px;" title="Tutup">✕</button>
                    </div>
                `,document.body.firstChild?document.body.insertBefore(e,document.body.firstChild):document.body.appendChild(e),sessionStorage.getItem(`eventPopupShown`)||(sessionStorage.setItem(`eventPopupShown`,`true`),setTimeout(()=>{let e=t.eventName||`High Season`;Swal.fire({title:`🔥 Info Event: ${e}`,html:`
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
                            `,showConfirmButton:!0,confirmButtonText:`<i class="fa-solid fa-check"></i> Saya Mengerti`,confirmButtonColor:`#0ea5e9`,width:`480px`,customClass:{popup:`modern-popup-radius`},backdrop:`rgba(15,23,42,0.8)`})},1e3))}}}catch{}})(),!window.location.pathname.includes(`admin`)&&!window.location.pathname.includes(`driver`)&&setTimeout(async()=>{try{let t=localStorage.getItem(`visitor_session_id`);t||(t=Math.random().toString(36).substring(2,15)+Date.now().toString(36),localStorage.setItem(`visitor_session_id`,t)),await fetch(`${e}/analytics/track`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({path:window.location.pathname+window.location.hash,userAgent:navigator.userAgent,ipHash:t,screenWidth:window.innerWidth||screen.width})})}catch(e){console.error(`Failed to track visitor:`,e)}},2e3);var t=[];window.getWishlist=()=>{try{return JSON.parse(localStorage.getItem(`app_wishlist`))||[]}catch{return[]}},window.isInWishlist=e=>window.getWishlist().includes(e),window.toggleWishlist=e=>{let t=window.getWishlist();t.includes(e)?t=t.filter(t=>t!==e):t.push(e),localStorage.setItem(`app_wishlist`,JSON.stringify(t));let n=document.getElementById(`btn-wishlist-${e}`);if(n){let r=n.querySelector(`i`);t.includes(e)?(r.classList.remove(`fa-regular`),r.classList.add(`fa-solid`),r.style.color=`#ef4444`):(r.classList.remove(`fa-solid`),r.classList.add(`fa-regular`),r.style.color=``)}};var n={IDR:1,USD:15500,AUD:1e4,EUR:16500,SGD:11600,MYR:3500,GBP:19700,CNY:2200,JPY:105};(async()=>{try{let t=await fetch(`${e}/rates`);if(!t.ok)return;let r=await t.json();r&&r.USD&&(n={USD:1/r.USD,AUD:1/r.AUD,EUR:1/r.EUR,SGD:1/r.SGD,MYR:1/r.MYR,GBP:1/r.GBP,CNY:1/r.CNY,JPY:1/r.JPY,SAR:1/r.SAR},document.getElementById(`packages-grid`)&&document.getElementById(`packages-grid`).innerHTML!==``&&loadItems(`paket`),document.getElementById(`cars-grid`)&&document.getElementById(`cars-grid`).innerHTML!==``&&loadItems(`mobil`))}catch(e){console.error(`Failed to fetch realtime rates:`,e)}})();var r=e=>{let t=localStorage.getItem(`app_currency`)||`IDR`,r=n[t]||1;if(!e)return t===`USD`?`$0`:t===`AUD`?`A$0`:t===`EUR`?`€0`:t===`SGD`?`S$0`:t===`MYR`?`RM0`:t===`GBP`?`£0`:t===`CNY`||t===`JPY`?`¥0`:t===`SAR`?`ر.س0`:`Rp 0`;let i=0;if(i=typeof e==`string`&&e.toLowerCase().includes(`rp`)?parseInt(e.replace(/\D/g,``),10):parseInt(e.toString().replace(/\D/g,``),10),isNaN(i))return e;let a=i/r;return t===`USD`?new Intl.NumberFormat(`en-US`,{style:`currency`,currency:`USD`,minimumFractionDigits:0}).format(a):t===`AUD`?new Intl.NumberFormat(`en-AU`,{style:`currency`,currency:`AUD`,minimumFractionDigits:0}).format(a):t===`EUR`?new Intl.NumberFormat(`de-DE`,{style:`currency`,currency:`EUR`,minimumFractionDigits:0}).format(a):t===`SGD`?new Intl.NumberFormat(`en-SG`,{style:`currency`,currency:`SGD`,minimumFractionDigits:0}).format(a):t===`MYR`?new Intl.NumberFormat(`ms-MY`,{style:`currency`,currency:`MYR`,minimumFractionDigits:0}).format(a):t===`GBP`?new Intl.NumberFormat(`en-GB`,{style:`currency`,currency:`GBP`,minimumFractionDigits:0}).format(a):t===`CNY`?new Intl.NumberFormat(`zh-CN`,{style:`currency`,currency:`CNY`,minimumFractionDigits:0}).format(a):t===`JPY`?new Intl.NumberFormat(`ja-JP`,{style:`currency`,currency:`JPY`,minimumFractionDigits:0}).format(a):t===`SAR`?new Intl.NumberFormat(`ar-SA`,{style:`currency`,currency:`SAR`,minimumFractionDigits:0}).format(a):new Intl.NumberFormat(`id-ID`,{style:`currency`,currency:`IDR`,minimumFractionDigits:0}).format(i)};window.formatPrice=r;var i=async(t=null)=>{try{let n=`${e}/items?_t=${new Date().getTime()}`;t&&(n+=`&category=${t}`);let r=await fetch(n,{cache:`no-store`});if(!r.ok)throw Error(`Network response was not ok`);return await r.json()}catch(e){return console.error(`Error fetching items:`,e),[]}},a=e=>e?e.split(`
`).map(e=>e.trim()).filter(e=>e.length>0):[],o=e=>{if(!e)return``;let t=e.split(`
`),n=``,r=!1;return t.forEach(e=>{let t=e.trim();t=t.replace(/b(d{4,})b/g,e=>parseInt(e,10).toLocaleString(`id-ID`)),t.match(/^d+.s/)?(r&&=(n+=`</ul>`,!1),n+=`<div style="margin-top: 15px; font-weight: 700; color: var(--primary-blue);">${t}</div>`):t.startsWith(`•`)?(r||=(n+=`<ul style="margin: 5px 0 10px 20px; padding: 0; list-style-type: disc;">`,!0),n+=`<li style="margin-bottom: 5px;">${t.substring(1).trim()}</li>`):t===``?(r&&=(n+=`</ul>`,!1),n+=`<div style="height: 10px;"></div>`):(r&&=(n+=`</ul>`,!1),t.includes(`DEPOSIT`)||t.startsWith(`🛵`)||t.startsWith(`🚙`)?n+=`<div style="font-weight: 700;">${t}</div>`:n+=`<div>${t}</div>`)}),r&&(n+=`</ul>`),n};window.closeGalleryModal=()=>{document.getElementById(`gallery-modal`).classList.remove(`active`)};var s=()=>{document.getElementById(`video-modal`)||document.body.insertAdjacentHTML(`beforeend`,`
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
    `)};window.openVideoModal=e=>{s();let t=document.getElementById(`video-modal`),n=document.getElementById(`video-modal-content`),r=e;try{let t=new URL(e);if(t.hostname.includes(`instagram.com`)){let e=t.pathname.split(`/`).filter(e=>e);e.length>=2&&(e[0]===`p`||e[0]===`reel`)&&(r=`https://www.instagram.com/p/${e[1]}/embed`)}else if(t.hostname.includes(`tiktok.com`)){let e=t.pathname.split(`/`).filter(e=>e);e.includes(`video`)&&(r=`https://www.tiktok.com/embed/v2/${e[e.indexOf(`video`)+1]}`)}else if(t.hostname.includes(`facebook.com`)&&t.pathname.includes(`/watch`))r=`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(e)}&show_text=0`;else if(t.hostname.includes(`streamable.com`)){let e=t.pathname.replace(`/e/`,``).replace(`/`,``);e&&(r=`https://streamable.com/e/${e}?autoplay=1`)}else if(t.hostname.includes(`drive.google.com`))r=e.replace(`/view`,`/preview`);else if(t.hostname.includes(`youtube.com`)&&e.includes(`watch?v=`)){let e=t.searchParams.get(`v`);e&&(r=`https://www.youtube.com/embed/${e}?autoplay=1`)}}catch{}n.innerHTML=`<iframe width="100%" height="100%" src="${r}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="background: #000;"></iframe>`;let i=document.getElementById(`video-modal-fallback-link`);i&&(i.href=e),t.style.display=`flex`},window.closeVideoModal=()=>{let e=document.getElementById(`video-modal`);e&&(e.style.display=`none`,document.getElementById(`video-modal-content`).innerHTML=``)},window.openTourModal=e=>{let n=t.find(t=>t.id===e);if(!n)return;let i=document.getElementById(`tour-modal-body`),s=``,c=a(n.itinerary),l=``,u=``,d=[],f=()=>{if(l){let e=``;d.length>0&&(e=d.length===1?`<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d[0]+` Lombok`)}" target="_blank" style="background:#e0f2fe; color:#0284c7; padding: 6px 14px; font-size:0.8rem; border-radius: 20px; margin-top:12px; display:inline-flex; align-items:center; gap:6px; font-weight:700; text-decoration:none; transition:all 0.2s;" onmouseover="this.style.background='#bae6fd'" onmouseout="this.style.background='#e0f2fe'"><i class="fa-solid fa-map-location-dot"></i> Lihat Peta di Google Maps</a>`:`<a href="${`https://www.google.com/maps/dir/${d.map(e=>encodeURIComponent(e+` Lombok`)).join(`/`)}`}" target="_blank" style="background:#e0f2fe; color:#0284c7; padding: 6px 14px; font-size:0.8rem; border-radius: 20px; margin-top:12px; display:inline-flex; align-items:center; gap:6px; font-weight:700; text-decoration:none; transition:all 0.2s;" onmouseover="this.style.background='#bae6fd'" onmouseout="this.style.background='#e0f2fe'"><i class="fa-solid fa-route"></i> Buka Rute di Google Maps</a>`),s+=`
            <div class="tm-day">
                <div class="tm-day-header">
                    <div class="tm-day-badge">DAY<br><span>${l.replace(`DAY`,``).trim()}</span></div>
                    <div class="tm-day-title">${u}</div>
                </div>
                <ul class="tm-day-list" style="margin-bottom: 8px;">
                    ${d.map(e=>`<li>${e}</li>`).join(``)}
                </ul>
                ${e}
            </div>`}};c.forEach(e=>{if(e.toUpperCase().startsWith(`DAY`)){f();let t=e.split(`:`);l=t[0],u=t.slice(1).join(`:`).trim(),d=[]}else e.startsWith(`-`)?d.push(e.substring(1).trim()):d.push(e)}),f();let p=a(n.include),m=a(n.exclude);i.innerHTML=`
        <div style="width: 100%; height: 400px; position: relative;">
            <img src="${n.imageUrl}" alt="${n.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200'">
            <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 150px; background: linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0));"></div>
        </div>
        <div class="tm-header" style="margin-top: -100px; position: relative; background: transparent; padding-top: 0; border: none;">
            <div class="tm-top premium-card">
                <div class="tm-title" style="flex: 1;">
                    ${(()=>{let e=`PAKET TOUR`;n.category===`car`?e=`SEWA MOBIL`:n.category===`motorcycle`?e=`SEWA MOTOR`:n.category===`drone`?e=`SEWA DRONE`:n.category===`transfer`&&(e=`ANTAR JEMPUT`),n.packageType&&(e=n.packageType);let t=n.duration?n.duration.toUpperCase():`N/A`;return!n.duration&&(n.category===`car`||n.category===`motorcycle`)&&(t=`PER HARI`),`
                        <h4 style="letter-spacing: 2px; color: var(--primary-green); margin-bottom: 10px; font-weight: 800; font-size: 0.9rem;"><i class="fa-solid fa-map-location-dot"></i> ${e}</h4>
                        <h2 style="color: var(--text-dark); font-size: 2.5rem; margin-bottom: 20px; line-height: 1.2; font-weight: 800;">${n.title.toUpperCase()}</h2>
                        <div class="tm-badges" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
                            <span class="tm-badge-blue" style="background: #f0f9ff; color: var(--primary-blue); font-size: 0.95rem; padding: 8px 18px; border-radius: 30px; font-weight: 800; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;"><i class="fa-regular fa-clock"></i> ${t}</span>
                            ${n.driverOptions?`<span class="tm-badge-blue" style="background: #f0fdf4; color: var(--primary-green); font-size: 0.95rem; padding: 8px 18px; border-radius: 30px; font-weight: 800; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;"><i class="fa-solid fa-id-card"></i> ${n.driverOptions===`Sertakan Pengemudi`?`DENGAN SUPIR`:n.driverOptions===`Tidak Include Driver`?`LEPAS KUNCI`:n.driverOptions.toUpperCase()}</span>`:``}
                        </div>
                        <p style="color: #475569; font-size: 1.1rem; line-height: 1.7;">${n.description||`Deskripsi detail tidak tersedia.`}</p>
                        `})()}
                </div>
                <div class="tm-price-box premium-price-box">
                    ${(()=>{let e=`HARGA PAKET`;return(n.category===`car`||n.category===`motorcycle`||n.category===`drone`)&&(e=`HARGA SEWA`),`<span class="price-label" style="background: var(--primary-green); color: white; font-size: 0.85rem; padding: 6px 15px; border-radius: 20px; font-weight: bold; align-self: flex-end;">${e}</span>`})()}
                    ${(()=>{let e=window.globalEventSettings||{eventMode:!1,eventPriceIncrease:0},t=n.category===`car`||n.category===`motorcycle`;if(e.eventMode&&e.eventPriceIncrease>0&&t){let t=parseInt(n.price)+parseInt(e.eventPriceIncrease);return`
                    <div style="margin-top: 10px;">
                        <span style="text-decoration: line-through; color: #94a3b8; font-size: 1rem;">${r(n.price)}</span>
                        <span style="background: linear-gradient(135deg,#f59e0b,#ef4444); color: white; font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 10px; margin-left: 6px; vertical-align: middle;">🔥 EVENT</span>
                    </div>
                    <h3 style="color: #ef4444; margin-top: 5px; font-size: 2.2rem; font-weight: 900;">${r(t)}</h3>
                    <p style="color: var(--text-gray); margin-top: 5px; font-size: 0.85rem;">+Rp ${parseInt(e.eventPriceIncrease).toLocaleString(`id-ID`)} (event) · Min. 4 hari</p>
                `}return`<h3 style="color: var(--primary-blue); margin-top: 15px; font-size: 2.2rem; font-weight: 900;">${r(n.price)}</h3>
                    <p style="color: var(--text-gray); margin-top: 5px; font-size: 0.95rem;">Mulai harga terendah</p>`})()}
                </div>

            </div>
        </div>
        <div class="tm-body">
            <div class="tm-left">
                ${s?`
                <h4 style="margin-bottom: 20px; color: var(--text-dark); font-weight: 800;"><i class="fa-solid fa-route" style="color: var(--primary-green);"></i> JADWAL PERJALANAN</h4>
                <div class="tm-timeline">
                    ${s}
                </div>`:``}
                
                ${n.category===`package`||s?`
                <div class="tm-box tm-box-blue mt-4" style="background: #f8fafc; border: 1px solid #cbd5e1;">
                    <div class="tm-box-title" style="background: var(--text-dark);"><i class="fa-solid fa-shield-halved"></i> KEBIJAKAN PEMBATALAN</div>
                    <ul class="tm-list" style="color:var(--text-dark);">
                        <li><i class="fa-solid fa-hourglass-half" style="color:var(--text-gray);"></i> Pembatalan H-7: 50% deposit dikembalikan.</li>
                        <li><i class="fa-solid fa-check" style="color:var(--text-gray);"></i> Pembatalan pihak travel: 100% deposit dikembalikan.</li>
                        <li><i class="fa-regular fa-calendar-days" style="color:var(--text-gray);"></i> Perubahan jadwal sesuai ketersediaan.</li>
                    </ul>
                </div>`:``}
                
                ${n.terms?`
                <div class="tm-box tm-box-blue mt-4" style="background: #f8fafc; border: 1px solid #cbd5e1;">
                    <div class="tm-box-title" style="background: var(--primary-blue);"><i class="fa-solid fa-file-contract"></i> SYARAT & KETENTUAN</div>
                    <div style="padding: 15px; color: var(--text-dark); font-size: 0.95rem; line-height: 1.6;">
                        ${o(n.terms)}
                    </div>
                </div>`:``}
            </div>
            
            <div class="tm-right">
                ${p.length>0?`
                <div class="tm-box tm-box-green">
                    <div class="tm-box-title"><i class="fa-solid fa-check"></i> FASILITAS INCLUDE</div>
                    <ul class="tm-list">
                        ${p.map(e=>`<li><i class="fa-solid fa-check-circle"></i> ${e}</li>`).join(``)}
                    </ul>
                </div>`:``}
                
                ${m.length>0?`
                <div class="tm-box tm-box-red">
                    <div class="tm-box-title"><i class="fa-solid fa-xmark"></i> TIDAK TERMASUK</div>
                    <ul class="tm-list">
                        ${m.map(e=>`<li><i class="fa-solid fa-times-circle"></i> ${e}</li>`).join(``)}
                    </ul>
                </div>`:``}
                
                <div class="tm-box tm-box-blue" style="background: white; border: 2px solid var(--primary-blue);">
                    <div class="tm-box-title" style="background: var(--primary-blue); box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.3);"><i class="fa-regular fa-calendar-check"></i> CARA RESERVASI</div>
                    ${n.category===`motorcycle`?`<p style="color: var(--text-gray); font-size: 0.9rem; margin-bottom: 15px;">Untuk mengamankan jadwal perjalanan, silakan transfer <strong>DP sebesar Rp 53.000 dan deposit Rp 503.000</strong> ke rekening berikut:</p>`:n.category===`car`?`<p style="color: var(--text-gray); font-size: 0.9rem; margin-bottom: 15px;">Untuk mengamankan jadwal perjalanan, silakan transfer <strong>DP sebesar Rp 203.000 dan deposit Rp 1.003.000</strong> ke rekening berikut:</p>`:`<p style="color: var(--text-gray); font-size: 0.9rem; margin-bottom: 15px;">Untuk mengamankan jadwal perjalanan, silakan transfer <strong>DP sebesar Rp 503.000</strong> ke rekening berikut:</p>`}
                    <div class="bank-item" style="background: #f8fafc; border: none;">
                        <img src="/mandiri.svg" alt="Mandiri" style="height: 25px; object-fit: contain;">
                        <div>LALU RENGGANE<br><span style="color: var(--primary-blue); font-size: 1.1rem; letter-spacing: 1px;">1610017191425</span></div>
                    </div>
                    <div class="bank-item" style="background: #f8fafc; border: none;">
                        <img src="/bri.svg" alt="BRI" style="height: 25px; object-fit: contain;">
                        <div>LALU RENGGANE<br><span style="color: var(--primary-blue); font-size: 1.1rem; letter-spacing: 1px;">759801017387536</span></div>
                    </div>

                    ${localStorage.getItem(`auth_token`)?``:`
                    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; margin-top: 20px; text-align: center;">
                        <div style="font-size: 0.85rem; color: #d97706; margin-bottom: 12px; font-weight: 600;">
                            <i class="fa-solid fa-circle-exclamation"></i> Anda harus login atau daftar akun terlebih dahulu untuk melakukan pesanan via Web.
                        </div>
                        <div style="display: flex; gap: 8px; justify-content: center;">
                            <a href="#" onclick="event.preventDefault(); window.closeTourModal(); window._authMode='login'; window.openAuthModal();" class="btn" style="background: white; color: #d97706; border: 1px solid #d97706; padding: 8px 15px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; flex:1; text-align: center;">LOGIN</a>
                            <a href="#" onclick="event.preventDefault(); window.closeTourModal(); window._authMode='register'; window.openAuthModal();" class="btn" style="background: #d97706; color: white; border: none; padding: 8px 15px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; flex:1; text-align: center;">DAFTAR</a>
                        </div>
                    </div>
                    `}

                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <a href="#" onclick="event.preventDefault(); openCheckoutModal('${n.title.replace(/'/g,`\\'`)}', ${n.price}, 'wa');" class="btn" style="flex:1; background: #e0f2fe; color: var(--primary-blue); padding: 12px; border-radius: 8px;"><i class="fa-brands fa-whatsapp"></i> via WA</a>
                        <button onclick="openCheckoutModal('${n.title}', ${n.price})" class="btn btn-blue" style="flex:1; padding: 12px; border-radius: 8px;"><i class="fa-solid fa-desktop"></i> via Web</button>
                    </div>
                </div>
            </div>
        </div>

        <div style="padding: 20px; background: white; border-top: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="font-size: 1.1rem; color: var(--text-dark); margin: 0;"><i class="fa-solid fa-star" style="color: #f59e0b;"></i> Ulasan Pelanggan</h3>
                <button onclick="window.toggleInlineReviewForm('${n.id}', '${n.title.replace(/'/g,`\\'`)}')" class="btn btn-outline" style="border: 2px solid var(--primary-blue); color: var(--primary-blue); padding: 5px 12px; font-size: 0.8rem; border-radius: 6px;"><i class="fa-solid fa-pen"></i> Tulis Ulasan</button>
            </div>
            <div id="inline-review-form-container-${n.id}" style="display: none; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e2e8f0;">
                <!-- Form content will be injected here -->
            </div>
            <div id="item-reviews-container-${n.id}" style="display: flex; gap: 12px; overflow-x: auto; padding: 10px 5px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; margin-bottom: 10px;">
                <p style="font-size: 0.85rem; color: #64748b; text-align: center; padding: 20px 0; width: 100%;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat ulasan...</p>
            </div>
            <style>
                #item-reviews-container-${n.id}::-webkit-scrollbar { display: none; }
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
    `,document.getElementById(`tour-modal`).classList.add(`active`),document.body.style.overflow=`hidden`,window.loadItemReviews(n.id)},window.closeTourModal=()=>{let e=document.getElementById(`tour-modal`);if(e){e.classList.remove(`active`);let t=document.getElementById(`sub-package-modal`);(!t||t.style.display===`none`)&&(document.body.style.overflow=``)}},window.loadItemReviews=async t=>{let n=document.getElementById(`item-reviews-container-${t}`);if(n)try{let r=await fetch(`${e}/reviews?itemId=${t}`);if(!r.ok)throw Error(`Failed to fetch item reviews`);let i=await r.json();if(i.length===0){n.innerHTML=`<p style="font-size: 0.85rem; color: #64748b; text-align: center; padding: 10px 0;">Belum ada ulasan untuk paket ini. Jadilah yang pertama!</p>`;return}n.innerHTML=i.map(e=>{let t=``;for(let n=0;n<5;n++)n<e.rating?t+=`<i class="fa-solid fa-star" style="color: #f59e0b; font-size:0.7rem;"></i>`:t+=`<i class="fa-regular fa-star" style="color: #cbd5e1; font-size:0.7rem;"></i>`;let n=e.createdAt?new Date(e.createdAt).toLocaleDateString(`id-ID`,{day:`numeric`,month:`short`,year:`numeric`}):``;return`
            <div style="flex: 0 0 85%; max-width: 320px; scroll-snap-align: start; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div>
                        <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-dark);">${e.name}</div>
                        <div style="display: flex; gap: 2px; margin-top: 2px;">${t}</div>
                    </div>
                    <div style="font-size: 0.75rem; color: #94a3b8;">${n}</div>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-gray); margin: 0; line-height: 1.4;">${e.comment}</p>
            </div>`}).join(``)}catch(e){console.error(`Failed to load item reviews:`,e),n.innerHTML=`<p style="font-size: 0.85rem; color: #ef4444; text-align: center; padding: 10px 0;">Gagal memuat ulasan.</p>`}},window.toggleInlineReviewForm=(e,t)=>{let n=document.getElementById(`inline-review-form-container-${e}`);if(!n)return;if(n.style.display===`block`){n.style.display=`none`;return}let r=``,i=localStorage.getItem(`auth_user`);if(i)try{let e=JSON.parse(i);e&&e.displayName?r=e.displayName:e&&e.name&&(r=e.name)}catch{}n.innerHTML=`
        <div style="text-align: left;">
            <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 15px;">Merekam ulasan untuk: <strong>${t}</strong></p>
            <div class="form-group mb-2">
                <label style="font-size:0.8rem; font-weight:600;">Nama Anda</label>
                <input type="text" id="inline-review-name-${e}" class="form-control" style="font-size:0.85rem; padding: 6px 10px;" placeholder="Nama lengkap" value="${r}">
            </div>
            <div class="form-group mb-2">
                <label style="font-size:0.8rem; font-weight:600;">Rating (1-5)</label>
                <select id="inline-review-rating-${e}" class="form-control" style="font-size:0.85rem; padding: 6px 10px;">
                    <option value="5">⭐⭐⭐⭐⭐ (Sangat Bagus)</option>
                    <option value="4">⭐⭐⭐⭐ (Bagus)</option>
                    <option value="3">⭐⭐⭐ (Cukup)</option>
                    <option value="2">⭐⭐ (Kurang)</option>
                    <option value="1">⭐ (Sangat Kurang)</option>
                </select>
            </div>
            <div class="form-group mb-3">
                <label style="font-size:0.8rem; font-weight:600;">Ulasan Anda</label>
                <textarea id="inline-review-comment-${e}" class="form-control" rows="3" style="font-size:0.85rem; padding: 6px 10px;" placeholder="Bagaimana pengalaman Anda?"></textarea>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button onclick="document.getElementById('inline-review-form-container-${e}').style.display = 'none'" class="btn btn-outline" style="border: 1px solid #cbd5e1; color: #64748b; padding: 6px 12px; font-size: 0.8rem; font-weight: 600; border-radius: 6px;">Batal</button>
                <button onclick="window.submitInlineReview('${e}')" id="btn-submit-inline-review-${e}" class="btn" style="background: var(--primary-green); color: white; padding: 6px 12px; font-size: 0.8rem; font-weight: 600; border-radius: 6px; border: none;">Kirim Ulasan</button>
            </div>
        </div>
    `,n.style.display=`block`},window.submitInlineReview=async t=>{let n=document.getElementById(`btn-submit-inline-review-${t}`),r=document.getElementById(`inline-review-name-${t}`).value.trim(),i=document.getElementById(`inline-review-rating-${t}`).value,a=document.getElementById(`inline-review-comment-${t}`).value.trim();if(!r||!a){Swal.fire({icon:`warning`,title:`Oops...`,text:`Nama dan ulasan harus diisi!`});return}n.disabled=!0,n.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...`;try{if(!(await fetch(`${e}/reviews`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({name:r,rating:i,comment:a,itemId:t})})).ok)throw Error(`Failed to submit`);document.getElementById(`inline-review-form-container-${t}`).style.display=`none`,Swal.fire({icon:`success`,title:`Terima Kasih!`,text:`Ulasan Anda berhasil dikirim.`,timer:2e3,showConfirmButton:!1}),window.loadItemReviews(t)}catch(e){console.error(`Submit review error:`,e),Swal.fire({icon:`error`,title:`Gagal`,text:`Terjadi kesalahan. Silakan coba lagi.`}),n.disabled=!1,n.innerHTML=`Kirim Ulasan`}},window.applyPromo=async()=>{let t=document.getElementById(`co-promo-input`).value.trim(),n=document.getElementById(`promo-message`),i=document.getElementById(`co-display-price`),a=document.getElementById(`co-promo-applied`),o=document.getElementById(`co-promo-discount`);if(!t){n.style.display=`block`,n.style.color=`#ef4444`,n.innerHTML=`<i class="fa-solid fa-circle-exclamation"></i> Masukkan kode promo terlebih dahulu.`;return}n.style.display=`block`,n.style.color=`#0284c7`,n.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> Memeriksa kode promo...`;try{let s=await(await fetch(`${e}/promos/verify/${t}?itemId=${window.currentCheckoutItemId||``}`)).json();if(!s.valid){n.style.color=`#ef4444`,n.innerHTML=`<i class="fa-solid fa-circle-xmark"></i> ${s.message||`Kode promo tidak valid.`}`,a.value=``,o.value=`0`,i&&i.dataset.basePrice&&(i.innerHTML=r(Number(i.dataset.basePrice)));return}let c=Number(i.dataset.basePrice),l=0;s.discountType===`percent`?(l=c*(s.discountValue/100),s.maxDiscount&&l>s.maxDiscount&&(l=s.maxDiscount)):l=s.discountValue,l>c&&(l=c);let u=c-l;n.style.color=`#10b981`,n.innerHTML=`<i class="fa-solid fa-circle-check"></i> Kode berhasil digunakan! Diskon: ${r(l)}`,a.value=t,o.value=l,i&&(i.innerHTML=`<span style="text-decoration:line-through; font-size:0.9rem; color:#94a3b8; margin-right:10px;">${r(c)}</span> ${r(u)}`)}catch(e){n.style.color=`#ef4444`,n.innerHTML=`<i class="fa-solid fa-circle-xmark"></i> Terjadi kesalahan saat memeriksa kode.`,console.error(e)}},window.closeCheckoutModal=()=>{let e=document.getElementById(`checkout-modal`);e&&(e.classList.remove(`active`),document.body.style.overflow=``)},window.toggleShowAll=(e,t,n)=>{let r=document.getElementById(e);if(!r)return;let i=r.querySelectorAll(`[data-hidden="true"]`),a=!1;if(i.forEach(e=>{e.style.display===`none`?(e.style.display=``,a=!0):(e.style.display=`none`,a=!1)}),a)t.innerHTML=`Tutup <i class="fa-solid fa-chevron-up" style="margin-left: 5px;"></i>`;else{t.innerHTML=`Lihat Semuanya (${n}) <i class="fa-solid fa-chevron-down" style="margin-left: 5px;"></i>`;let e=r.getBoundingClientRect().top+window.pageYOffset+-80;window.scrollTo({top:e,behavior:`smooth`})}};var c=(e,t=0)=>`
    <div class="card service-card" data-aos="zoom-in" data-aos-delay="${t%3*100}">
        <div class="service-icon"><i class="fa-solid fa-plane"></i></div>
        <h3>${e.title}</h3>
        <p>${e.description}</p>
    </div>
`,l=(e,t=0)=>{if(!e.transferMatrix||e.transferMatrix.length===0)return c(e,t);let n=e.transferVehicles||Object.keys(e.transferMatrix[0]?.prices||{}),i=``;return e.transferMatrix.forEach(e=>{i+=`<tr>
            <td style="padding: 10px 14px; font-weight: 700; color: var(--text-dark); white-space: nowrap; border: 1px solid #e2e8f0;"><i class="fa-solid fa-location-dot" style="color: var(--primary-green); margin-right: 6px;"></i>${e.area}</td>
            ${n.map(t=>{let n=e.prices[t];return`<td style="padding: 10px 8px; text-align: center; border: 1px solid #e2e8f0; white-space: nowrap; font-weight: 600; color: var(--text-dark);">${n?r(n):`-`}</td>`}).join(``)}
        </tr>`}),`
    <div class="card" data-aos="fade-up" data-aos-delay="${t%2*100}" style="grid-column: 1/-1; padding: 0; overflow: hidden; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, var(--primary-blue), #0369a1); padding: 25px 30px; color: white;">
            <h3 style="margin: 0 0 5px 0; font-size: 1.4rem; font-weight: 800;"><i class="fa-solid fa-plane-departure" style="margin-right: 10px;"></i>${e.title}</h3>
            <p style="margin: 0; opacity: 0.85; font-size: 0.95rem;">${e.description||`Dari Airport / Sebaliknya`}</p>
        </div>
        <div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 600px; border: 1px solid #e2e8f0;">
                <thead>
                    <tr style="background: #f0f9ff;">
                        <th style="padding: 12px 14px; text-align: left; font-weight: 800; color: var(--primary-blue); border: 1px solid #bae6fd; border-bottom: 2px solid var(--primary-blue); white-space: nowrap;">AREA TUJUAN</th>
                        ${n.map(e=>`<th style="padding: 12px 8px; text-align: center; font-weight: 700; color: var(--primary-blue); border: 1px solid #bae6fd; border-bottom: 2px solid var(--primary-blue); white-space: nowrap;">${e}</th>`).join(``)}
                    </tr>
                </thead>
                <tbody>
                    ${i}
                </tbody>
            </table>
        </div>
        <div style="padding: 15px 25px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; flex-wrap: wrap; gap: 20px; align-items: center; justify-content: space-between;">
            <div style="display: flex; gap: 15px; flex-wrap: wrap; font-size: 0.8rem; color: #475569;">
                <span><i class="fa-solid fa-check-circle" style="color: var(--primary-green); margin-right: 4px;"></i> Parkir Tolget</span>
                <span><i class="fa-solid fa-check-circle" style="color: var(--primary-green); margin-right: 4px;"></i> Driver Berpengalaman</span>
                <span><i class="fa-solid fa-check-circle" style="color: var(--primary-green); margin-right: 4px;"></i> BBM / Petrol</span>
            </div>
            <a href="https://wa.me/6289676963255?text=Halo%20Admin,%20saya%20ingin%20booking%20${encodeURIComponent(e.title)}" target="_blank" class="btn" style="background: #25D366; color: white; font-weight: 700; padding: 10px 20px; border-radius: 25px; font-size: 0.9rem; white-space: nowrap;"><i class="fa-brands fa-whatsapp" style="margin-right: 6px;"></i> Booking Sekarang</a>
        </div>
    </div>
    `},u=(e,t=0)=>{let n=e.isParent===!0,i=n?`<button onclick="window.openSubPackageModal('${e.id}')" class="btn" style="background:linear-gradient(135deg,var(--primary-blue,#0ea5e9),#1e40af); color:white; border:none; font-size:0.85rem; padding:8px 16px; border-radius:20px; font-weight:700;"><i class="fa-solid fa-layer-group" style="margin-right:5px;"></i>LIHAT PAKET</button>`:`<button onclick="openTourModal('${e.id}')" class="btn" style="background: var(--bg-light); color: var(--primary-blue); border: none; font-size: 0.85rem; padding: 8px 16px; border-radius: 20px; font-weight: 700;">DETAIL</button>`,a=n?`<span style="position:absolute;top:10px;left:10px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#78350f;font-size:0.65rem;font-weight:800;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;z-index:2;"><i class="fa-solid fa-layer-group" style="margin-right:4px;"></i>Paket Pilihan</span>`:``,o=e.rating?`<span style="position:absolute; ${n?`top:45px;`:`top:10px;`} left:10px; background:rgba(255,255,255,0.95); color:#f59e0b; font-weight:800; font-size:0.8rem; padding:4px 10px; border-radius:20px; z-index:2; box-shadow:0 2px 4px rgba(0,0,0,0.1);"><i class="fa-solid fa-star" style="margin-right:4px;"></i>${e.rating}</span>`:``;return`
    <div class="card package-card" data-aos="fade-up" data-aos-delay="${t%3*100}" style="${n?`border:2px solid #fbbf24;`:``}">
        <div class="img-wrapper" style="position:relative;">
            <button onclick="window.shareItem('${e.id}', '${e.title.replace(/'/g,`\\'`)}', '${r(e.price)}')" style="position:absolute; top:10px; right:10px; background:rgba(255,255,255,0.9); color:var(--primary-blue); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Bagikan"><i class="fa-solid fa-share-nodes"></i></button>
            <button id="btn-wishlist-${e.id}" onclick="event.stopPropagation(); window.toggleWishlist('${e.id}')" style="position:absolute; top:10px; right:50px; background:rgba(255,255,255,0.9); color:var(--text-gray); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Simpan ke Wishlist"><i class="${window.isInWishlist&&window.isInWishlist(e.id)?`fa-solid`:`fa-regular`} fa-heart" ${window.isInWishlist&&window.isInWishlist(e.id)?`style="color:#ef4444;"`:``}></i></button>
            <span class="tag"><i class="fa-regular fa-clock" style="margin-right: 4px;"></i> ${e.duration||`1 HARI`}</span>
            ${a}
            ${o}
            <img src="${e.imageUrl}" alt="${e.title}" onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'">
        </div>
        <div class="content">
            <h3>${e.title}</h3>
            <ul>
                <li><i class="fa-solid fa-check"></i> ${e.description||``}</li>
            </ul>
            <div class="price-row">
                  <div class="price" style="flex: 1; min-width: 0;">
                      ${(()=>{let t=window.globalEventSettings||{eventMode:!1,eventPriceIncrease:0},n=e.category===`car`||e.category===`motorcycle`;if(t.eventMode&&t.eventPriceIncrease>0&&n){let n=parseInt(e.price)+parseInt(t.eventPriceIncrease);return`
                                  <div style="display: flex; flex-direction: column; gap: 2px;">
                                      <div style="font-size: 0.7rem; color: #64748b; white-space: nowrap;">
                                          Mulai dari <span style="text-decoration:line-through; margin-left: 2px;">${r(e.price)}</span>
                                      </div>
                                      <div style="display: flex; align-items: center; gap: 4px; line-height: 1;">
                                          <span style="color: var(--primary-blue); font-weight: 800; font-size: 1.05rem; white-space: nowrap;">${r(n)}</span>
                                          <span style="background:linear-gradient(135deg,#f59e0b,#ef4444);color:white;font-size:0.5rem;padding:2px 4px;border-radius:4px; display:inline-block;">🔥</span>
                                      </div>
                                  </div>
                              `}return`
                                  <div style="display: flex; flex-direction: column;">
                                      <span style="font-size: 0.7rem; color: #64748b;">Mulai dari</span>
                                      <span style="color: var(--primary-blue); font-weight: 800; font-size: 1.05rem;">${r(e.price)}</span>
                                  </div>
                          `})()}
                  </div>
                ${i}
            </div>
        </div>
    </div>
`};window.openSubPackageModal=e=>{let n=t.find(t=>t.id===e);if(!n)return;let i=t.filter(t=>t.parentId===e),a=document.getElementById(`sub-modal-title`),o=document.getElementById(`sub-modal-desc`),s=document.getElementById(`sub-modal-body`),c=document.getElementById(`sub-package-modal`);!a||!s||!c||(a.innerText=n.title,o&&(o.innerText=n.description||`Pilih paket yang sesuai dengan keinginan Anda.`),c.scrollTop=0,s.innerHTML=i.length===0?`<div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:#64748b;">
            <i class="fa-solid fa-box-open" style="font-size:3.5rem; margin-bottom:15px; display:block; color:#cbd5e1;"></i>
            <p style="font-size:1rem; font-weight:600;">Belum ada sub-paket.</p>
            <p style="font-size:0.85rem;">Silakan tambahkan sub-paket dari panel admin.</p>
        </div>`:i.sort((e,t)=>{let n=e=>{let t=(e||``).match(/paket\s+([a-z])/i);return t?t[1].toUpperCase():null},r=n(e.title),i=n(t.title);if(r&&i){if(r!==i)return r.localeCompare(i)}else if(r)return-1;else if(i)return 1;let a=e.order||0,o=t.order||0;return a===o?(e.title||``).localeCompare(t.title||``,`id`,{sensitivity:`base`}):a-o}).map(e=>{let t=e.price?r(e.price):``;return`
            <div style="background:white; border:none; border-radius:16px; overflow:hidden; box-shadow:0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04); cursor:pointer; display:flex; flex-direction:column; transition: transform 0.3s ease, box-shadow 0.3s ease;"
                 onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)';"
                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)';"
                 onclick="openTourModal('${e.id}');">
                <!-- Image -->
                <div style="position:relative; height:180px; overflow:hidden;">
                    <button onclick="event.stopPropagation(); window.shareItem('${e.id}', '${e.title.replace(/'/g,`\\'`)}', '${r(e.price)}')" style="position:absolute; top:10px; right:10px; background:rgba(255,255,255,0.9); color:var(--primary-blue); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Bagikan"><i class="fa-solid fa-share-nodes"></i></button>
                    <button id="btn-wishlist-${e.id}" onclick="event.stopPropagation(); window.toggleWishlist('${e.id}')" style="position:absolute; top:10px; right:50px; background:rgba(255,255,255,0.9); color:var(--text-gray); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Simpan ke Wishlist"><i class="${window.isInWishlist&&window.isInWishlist(e.id)?`fa-solid`:`fa-regular`} fa-heart" ${window.isInWishlist&&window.isInWishlist(e.id)?`style="color:#ef4444;"`:``}></i></button>
                    <img src="${e.imageUrl||n.imageUrl}" alt="${e.title}"
                        style="width:100%; height:100%; object-fit:cover; transition: transform 0.5s ease;"
                        onmouseover="this.style.transform='scale(1.08)'"
                        onmouseout="this.style.transform='scale(1)'"
                        onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600'">
                    ${t?`<div style="position:absolute; bottom:12px; right:12px; background:rgba(255, 255, 255, 0.95); backdrop-filter:blur(4px); color:#0f172a; font-size:0.65rem; font-weight:800; padding:4px 8px; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.4);">${t} <span style="font-size:0.5rem; font-weight:600; color:#64748b;">/orang</span></div>`:``}
                </div>
                <!-- Content -->
                <div style="padding:16px 20px; display:flex; flex-direction:column; flex:1;">
                    <h4 style="margin:0 0 8px; font-size:0.95rem; font-weight:800; color:#0f172a; line-height:1.4;">${e.title}</h4>
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
            </div>`}).join(``),c.style.display=`block`,document.body.style.overflow=`hidden`)},window.closeSubPackageModal=()=>{let e=document.getElementById(`sub-package-modal`);e&&(e.style.display=`none`),document.body.style.overflow=``};var d=(e,t=0)=>{let n=e.category===`motorcycle`?`fa-motorcycle`:`fa-car`,i=e.category===`motorcycle`?`Motor`:`Mobil`,a=``;e.seats&&(a+=`<span class="fleet-tag"><i class="fa-solid fa-user-group"></i> ${e.seats} ${e.category===`motorcycle`?`Helm`:`Seat`}</span>`),e.transmission&&(a+=`<span class="fleet-tag"><i class="fa-solid fa-gear"></i> ${e.transmission}</span>`),e.driverOptions&&(a+=`<span class="fleet-tag"><i class="fa-solid fa-id-card"></i> ${e.driverOptions}</span>`);let o=``;e.include&&(o=e.include.split(`
`).filter(e=>e.trim()).map(e=>`<li><i class="fa-solid fa-check"></i> ${e.trim()}</li>`).join(``)),e.description&&!e.include&&(o=`<li><i class="fa-solid fa-check"></i> ${e.description}</li>`);let s=e.rating?`<span style="position:absolute; top:10px; left:10px; background:rgba(255,255,255,0.95); color:#f59e0b; font-weight:800; font-size:0.8rem; padding:4px 10px; border-radius:20px; z-index:2; box-shadow:0 2px 4px rgba(0,0,0,0.1);"><i class="fa-solid fa-star" style="margin-right:4px;"></i>${e.rating}</span>`:``;return`
    <div class="card package-card fleet-card-v2" data-aos="fade-up" data-aos-delay="${t%3*100}">
        <div class="img-wrapper" style="position:relative;">
            <button onclick="window.shareItem('${e.title.replace(/'/g,`\\'`)}', '${r(e.price)}')" style="position:absolute; top:10px; right:10px; background:rgba(255,255,255,0.9); color:var(--primary-blue); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Bagikan"><i class="fa-solid fa-share-nodes"></i></button>
            <button id="btn-wishlist-${e.id}" onclick="event.stopPropagation(); window.toggleWishlist('${e.id}')" style="position:absolute; top:10px; right:50px; background:rgba(255,255,255,0.9); color:var(--text-gray); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Simpan ke Wishlist"><i class="${window.isInWishlist&&window.isInWishlist(e.id)?`fa-solid`:`fa-regular`} fa-heart" ${window.isInWishlist&&window.isInWishlist(e.id)?`style="color:#ef4444;"`:``}></i></button>
            <span class="tag"><i class="fa-solid ${n}" style="margin-right: 4px;"></i> ${i}</span>
            ${s}
            <img src="${e.imageUrl}" alt="${e.title}" onerror="this.src='https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800'">
        </div>
        <div class="content">
            <h3 class="notranslate">${e.title}</h3>
            ${a?`<div class="fleet-tags-row">${a}</div>`:``}
            ${o?`<ul>${o}</ul>`:``}
            <div class="price-row">
                  <div class="price" style="flex: 1; min-width: 0;">
                      <div style="display: flex; flex-direction: column; gap: 2px;">
                          ${(()=>{let t=window.globalEventSettings||{eventMode:!1,eventPriceIncrease:0},n=e.category===`car`||e.category===`motorcycle`;if(t.eventMode&&t.eventPriceIncrease>0&&n){let n=parseInt(e.price)+parseInt(t.eventPriceIncrease);return`
                                      <div style="font-size: 0.7rem; color: #64748b; white-space: nowrap;">
                                          Mulai dari <span style="text-decoration:line-through; margin-left: 2px;">${r(e.price)}</span>
                                      </div>
                                      <div style="display: flex; align-items: center; gap: 4px; line-height: 1;">
                                          <span style="color: var(--primary-blue); font-weight: 800; font-size: 1.05rem; white-space: nowrap;">${r(n)}</span>
                                          <span style="background:linear-gradient(135deg,#f59e0b,#ef4444);color:white;font-size:0.5rem;padding:2px 4px;border-radius:4px; display:inline-block;">🔥</span>
                                      </div>
                                      <div style="font-size: 0.65rem; color: #64748b; font-weight: 500;">/ ${e.duration||`hari`}</div>
                                  `}return`
                                  <div style="font-size: 0.7rem; color: #64748b;">Mulai dari</div>
                                  <div style="color: var(--primary-blue); font-weight: 800; font-size: 1.05rem; white-space: nowrap;">${r(e.price)}</div>
                                  <div style="font-size: 0.65rem; color: #64748b; font-weight: 500;">/ ${e.duration||`hari`}</div>
                              `})()}
                      </div>
                  </div>
                <div class="action-buttons">
                    <button onclick="openTourModal('${e.id}')" class="btn" style="background: var(--bg-light); color: var(--primary-blue); border: none; font-size: 0.85rem; padding: 8px 16px; border-radius: 20px; font-weight: 700;">DETAIL</button>
                    <button onclick="openCheckoutModal('${e.title.replace(/'/g,`\\'`)}', ${e.price}, 'wa')" class="btn btn-green" style="padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 0.85rem; box-shadow: 0 4px 6px rgba(5,150,105,0.2);"><i class="fa-brands fa-whatsapp"></i></button>
                </div>
            </div>

        </div>
    </div>
    `},f=(e,t=0)=>{let n=``,i=!1,a=``,o=e.droneVideoUrl||``;if(o)try{let e=new URL(o);if(e.hostname.includes(`youtube.com`)){let t=``;t=e.pathname.startsWith(`/shorts/`)||e.pathname.startsWith(`/embed/`)?e.pathname.split(`/`)[2]:e.searchParams.get(`v`),t&&(n=`https://www.youtube.com/embed/${t}?rel=0`)}else e.hostname.includes(`youtu.be`)?n=`https://www.youtube.com/embed/${e.pathname.slice(1)}?rel=0`:o.endsWith(`.mp4`)?n=o:(i=!0,a=o)}catch{o.length===11?n=`https://www.youtube.com/embed/${o}?rel=0`:(i=!0,a=o)}let s=window.isDroneAvailable===!1?``:`<a href="https://wa.me/6289676963255?text=Halo%20Admin,%20saya%20ingin%20pesan%20${encodeURIComponent(e.title)}" target="_blank" class="btn btn-green w-100"><i class="fa-brands fa-whatsapp"></i> PESAN SEKARANG</a>`,c=``;if(e.date)try{c=`<div style="font-size: 0.85rem; color: #64748b; margin-bottom: 8px;"><i class="fa-regular fa-calendar" style="margin-right: 5px;"></i> ${new Date(e.date).toLocaleDateString(`id-ID`,{year:`numeric`,month:`long`,day:`numeric`})}</div>`}catch{}let l=`<img src="${e.imageUrl||`https://images.unsplash.com/photo-1579822606820-25e2e8e34272?auto=format&fit=crop&q=80&w=800`}" alt="${e.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 20px 20px 0 0;" onerror="this.src='https://images.unsplash.com/photo-1579822606820-25e2e8e34272?auto=format&fit=crop&q=80&w=800'">`;return n?l=n.endsWith(`.mp4`)?`<video width="100%" height="100%" controls style="border-radius: 20px 20px 0 0; object-fit: cover; background: #000;"><source src="${n}" type="video/mp4">Your browser does not support HTML video.</video>`:`<iframe width="100%" height="100%" src="${n}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 20px 20px 0 0; background: #000;"></iframe>`:i&&(l+=`
            <div onclick="window.openVideoModal('${a}')" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); text-decoration: none; color: white; border-radius: 20px 20px 0 0; transition: all 0.3s ease; cursor: pointer;" onmouseover="this.style.background='rgba(0,0,0,0.3)'" onmouseout="this.style.background='rgba(0,0,0,0.5)'">
                <div style="text-align: center;">
                    <i class="fa-solid fa-play" style="font-size: 3.5rem; margin-bottom: 10px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));"></i>
                    <div style="font-weight: 800; letter-spacing: 1px; font-size: 1.1rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">TONTON VIDEO</div>
                </div>
            </div>
        `),`
    <div class="card drone-card" data-aos="fade-up" data-aos-delay="${t%3*100}">
        <div class="img-wrapper" style="height: 250px; position: relative;">
            <button onclick="window.shareItem('${e.id}', '${e.title.replace(/'/g,`\\'`)}', '${r(e.price)}')" style="position:absolute; top:10px; right:10px; background:rgba(255,255,255,0.9); color:var(--primary-blue); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Bagikan"><i class="fa-solid fa-share-nodes"></i></button>
            <button id="btn-wishlist-${e.id}" onclick="event.stopPropagation(); window.toggleWishlist('${e.id}')" style="position:absolute; top:10px; right:50px; background:rgba(255,255,255,0.9); color:var(--text-gray); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Simpan ke Wishlist"><i class="${window.isInWishlist&&window.isInWishlist(e.id)?`fa-solid`:`fa-regular`} fa-heart" ${window.isInWishlist&&window.isInWishlist(e.id)?`style="color:#ef4444;"`:``}></i></button>
            ${l}
        </div>
        <div class="content" style="padding: 20px;">
            <h3 style="color: var(--primary-blue); font-size: 1.2rem; margin-bottom: 5px;">${e.title}</h3>
            ${c}
            <p style="color: var(--text-gray); font-size: 0.9rem; margin-bottom: 25px;">${e.description}</p>
            ${s}
        </div>
    </div>
    `};window.closeComingSoonModal=()=>{let e=document.getElementById(`coming-soon-modal`);e&&(e.style.animation=`reviewFadeOut 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards`,setTimeout(()=>{e.style.display=`none`,e.style.animation=``},200))};var p=async()=>{window.isDroneAvailable=!0;try{let e=await fetch(`/api/settings?_t=${new Date().getTime()}`,{cache:`no-store`});if(e.ok){let t=await e.json();if(window.globalSettings=t,t.maintenanceMode===!0&&!window.location.pathname.includes(`/admin`)){document.body.innerHTML=`
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
                `;return}if(t.droneAvailable===`unavailable`){window.isDroneAvailable=!1;let e=document.getElementById(`drone-main-book-btn`);e&&(e.removeAttribute(`href`),e.style.background=`#cbd5e1`,e.style.cursor=`not-allowed`,e.style.borderColor=`#cbd5e1`,e.innerHTML=`<i class="fa-solid fa-lock"></i> LAYANAN BELUM TERSEDIA`)}if(t.dronePrice){let e=document.getElementById(`drone-base-price`);e&&(e.innerText=r(t.dronePrice).replace(`Rp `,``))}t.comingSoonEnabled===!0&&!window.location.pathname.includes(`/admin`)&&setTimeout(()=>{let e=document.getElementById(`coming-soon-modal`);if(e||(document.body.insertAdjacentHTML(`beforeend`,`
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
                            `),e=document.getElementById(`coming-soon-modal`),window._csExpandDetail=()=>{let e=document.getElementById(`cs-detail-panel`),t=document.getElementById(`cs-btn-group-compact`),n=document.getElementById(`cs-btn-group-expanded`),r=document.getElementById(`cs-scrollable`),i=document.getElementById(`coming-soon-modal-desc-full`);if(e&&(e.style.display=`block`),t&&(t.style.display=`none`),n&&(n.style.display=`block`),i&&window._csFullText&&!window._csTyped){window._csTyped=!0,i.innerHTML=`<span class="cs-typewriter-cursor">|</span>`;let e=0,t=window._csFullText;function n(){e<t.length?(i.innerHTML=t.substring(0,e+1)+`<span class="cs-typewriter-cursor">|</span>`,e++,setTimeout(n,15),r&&r.scrollTo({top:r.scrollHeight,behavior:`auto`})):(i.innerHTML=t,r&&r.scrollTo({top:r.scrollHeight,behavior:`smooth`}))}setTimeout(n,100)}else setTimeout(()=>{r&&r.scrollTo({top:r.scrollHeight,behavior:`smooth`})},100)}),e){t.comingSoonImage&&(document.getElementById(`coming-soon-modal-img`).src=t.comingSoonImage,document.getElementById(`coming-soon-modal-img`).style.display=`block`),t.comingSoonTitle&&(document.getElementById(`coming-soon-modal-title`).innerText=t.comingSoonTitle),t.comingSoonDesc&&(document.getElementById(`coming-soon-modal-desc-preview`).innerText=t.comingSoonDesc,window._csFullText=t.comingSoonDesc,window._csTyped=!1,document.getElementById(`coming-soon-modal-desc-full`).innerText=``);let n=localStorage.getItem(`cs_hide_until`);if(n&&Date.now()<parseInt(n)||(e.style.display=`flex`),t.comingSoonDate){let e=()=>{let e=new Date(t.comingSoonDate).getTime()-new Date().getTime();if(e<0){window.comingSoonInterval&&clearInterval(window.comingSoonInterval),[`cs-days`,`cs-hours`,`cs-minutes`,`cs-seconds`].forEach(e=>{let t=document.getElementById(e);t&&(t.innerText=`00`)});return}let n=Math.floor(e/864e5),r=Math.floor(e%864e5/36e5),i=Math.floor(e%36e5/6e4),a=Math.floor(e%6e4/1e3),o=document.getElementById(`cs-seconds`);o&&(o.style.animation=`none`,o.offsetHeight,o.style.animation=`csCountPop 0.3s ease-out`);let s=e=>e<10?`0`+e:e;document.getElementById(`cs-days`).innerText=s(n),document.getElementById(`cs-hours`).innerText=s(r),document.getElementById(`cs-minutes`).innerText=s(i),document.getElementById(`cs-seconds`).innerText=s(a)};e(),window.comingSoonInterval=setInterval(e,1e3)}}},800)}}catch(e){console.error(`Failed to fetch settings`,e)}document.getElementById(`services-container`),document.getElementById(`fleet-container`),t=await i(),window.globalItems=t;try{let t=await fetch(`${e}/bookings?public=true`);t.ok?window.globalBookings=await t.json():window.globalBookings=[]}catch(e){console.error(`Failed to fetch bookings`,e),window.globalBookings=[]}try{if(!window.allReviewsData){let t=await fetch(`${e}/reviews`);t.ok&&(window.allReviewsData=await t.json())}window.allReviewsData&&t.forEach(e=>{let t=window.allReviewsData.filter(t=>t.itemId===e.id&&t.status===`approved`);t.length>0&&(e.rating=(t.reduce((e,t)=>e+t.rating,0)/t.length).toFixed(1).replace(`.0`,``),e.reviewCount=t.length)})}catch(e){console.error(`Failed to fetch reviews for items`,e)}new Set(t.filter(e=>e.parentId).map(e=>e.id));let n=t.filter(e=>!e.parentId),a=n.filter(e=>{let t=e.category.toLowerCase();return t.includes(`paket`)||t===`package`||t===`tour`||t===`honeymoon`}),o=n.filter(e=>{let t=e.category.toLowerCase();return(t.includes(`rental`)||t.includes(`armada`)||t.includes(`sewa`)||t===`car`)&&t!==`motorcycle`}),s=n.filter(e=>e.category.toLowerCase()===`motorcycle`),p=n.filter(e=>e.category.toLowerCase()===`drone`),m=n.filter(e=>e.category.toLowerCase()===`transfer`),h=n.filter(e=>!a.includes(e)&&!o.includes(e)&&!s.includes(e)&&!p.includes(e)&&!m.includes(e)),g=(e,t,n,r=null)=>{let i=document.getElementById(e);if(!i)return;if(t.length===0){i.innerHTML=`<p class="text-center w-100" style="grid-column: 1/-1;">Belum ada data yang ditambahkan.</p>`;return}let a=r;a===null&&(a=(window.innerWidth>=1200?e.includes(`cars`)||e.includes(`motor`)?4:3:2)*2);let o=``;if(t.forEach((e,t)=>{let r=t>=a,i=n(e,t);r&&(i=i.replace(/(<div\s+)/,`$1data-hidden="true" style="display: none;" `)),o+=i}),i.innerHTML=o,t.length>a){let n=`
            <div class="text-center w-100 mt-4 show-all-wrapper" style="grid-column: 1/-1;">
                <button onclick="toggleShowAll('${e}', this, ${t.length})" class="btn" style="background: var(--bg-light); color: var(--primary-blue); border: 2px solid var(--primary-blue); font-weight: 700; padding: 10px 25px; border-radius: 30px; transition: all 0.3s;">
                    Lihat Semuanya (${t.length}) <i class="fa-solid fa-chevron-down" style="margin-left: 5px;"></i>
                </button>
            </div>
            `;i.insertAdjacentHTML(`beforeend`,n)}};g(`services-container`,[...h,...m],(e,t)=>e.category.toLowerCase()===`transfer`&&e.transferMatrix&&e.transferMatrix.length>0?l(e,t):c(e,t));let _=e=>{let t=e.match(/(pakets+([a-z])(s+(d+))?s*)/i);return t||=e.match(/pakets+([a-z])(s+(d+))?(?:s|$)/i),t?`${t[1].toUpperCase()}-${t[3]?parseInt(t[3]).toString().padStart(5,`0`):`00001`}`:e.toLowerCase()},v=[...a].sort((e,t)=>_(e.title).localeCompare(_(t.title))),y=v.filter(e=>e.isParent===!0),b=v.filter(e=>!e.isParent),x=document.getElementById(`paket-pilihan`),S=document.getElementById(`parent-packages-container`);S&&y.length>0&&(x&&(x.style.display=`block`),S.innerHTML=y.map((e,t)=>`
        <div onclick="window.openSubPackageModal('${e.id}')" data-aos="zoom-in" data-aos-delay="${t*50}"
            style="cursor:pointer; position:relative; border-radius:14px; overflow:hidden; aspect-ratio:1/1; box-shadow:0 8px 25px rgba(0,0,0,0.12); transition:transform 0.3s,box-shadow 0.3s; display:flex; flex-direction:column; justify-content:center; align-items:center;"
            onmouseover="this.style.transform='scale(1.03)';this.style.boxShadow='0 12px 35px rgba(0,0,0,0.2)'"
            onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 8px 25px rgba(0,0,0,0.12)'">
            <button onclick="event.stopPropagation(); window.shareItem('${e.id}', '${e.title.replace(/'/g,`\\'`)}', 'Berbagai Pilihan Tour Menarik!')" style="position:absolute; top:10px; right:10px; background:rgba(255,255,255,0.9); color:var(--primary-blue); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:4; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Bagikan"><i class="fa-solid fa-share-nodes"></i></button>
            <img src="${e.imageUrl}" alt="${e.title}"
                style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;z-index:1;"
                onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600'">
            <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(to bottom, rgba(10,20,50,0.3) 0%, rgba(10,20,50,0.85) 100%);z-index:2;"></div>
            
            <div style="position:relative; z-index:3; text-align:center; padding:10px 6px; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; width:100%; height:100%;">
                <h3 style="color:#fbb320; font-size:clamp(0.85rem,3vw,1.6rem); font-weight:900; margin:0 0 4px; text-shadow:0 2px 8px rgba(0,0,0,0.8); line-height:1.1; font-family:'Outfit',sans-serif; text-transform:uppercase;">${e.title.split(` `)[0]}</h3>
                <span style="color:white; font-size:clamp(0.6rem,2.2vw,0.75rem); font-weight:600; margin-bottom:10px; text-shadow:0 1px 4px rgba(0,0,0,0.8);">${e.title}</span>
                
                <span style="display:inline-flex; align-items:center; gap:4px; background:#fbb320; color:white; font-size:clamp(0.5rem,1.8vw,0.6rem); font-weight:800; padding:5px 10px; border-radius:20px; text-transform:uppercase; letter-spacing:0.5px; box-shadow:0 4px 10px rgba(251,179,32,0.4);">
                    LIHAT LAINNYA <i class="fa-solid fa-chevron-right" style="font-size:0.5rem;"></i>
                </span>
            </div>
        </div>`).join(``)),g(`packages-container`,b,u,6),g(`cars-container`,o,d,4),g(`motorcycles-container`,s,d,4),g(`drone-container`,p,f)};window.generateEtiketPDF=e=>{if(!e){alert(`Data tiket tidak ditemukan, cek status dulu.`);return}let t=e.isDp===!0||e.isDp===`true`,n=e.status===`PAID`,r=n?`#16a34a`:e.status===`PENDING`?`#d97706`:`#dc2626`,i=n?`#dcfce7`:e.status===`PENDING`?`#fef3c7`:`#fee2e2`,a=e.status||`UNKNOWN`,o=n?`&#10003;`:e.status===`PENDING`?`&#9203;`:`&#10007;`;t&&(r=`#ea580c`,i=`#fff7ed`,a=`DP - BELUM LUNAS`,o=`&#9651;`);let s=e=>{if(!e)return`-`;try{return new Date(e).toLocaleDateString(`id-ID`,{day:`2-digit`,month:`long`,year:`numeric`})}catch{return e}},c=e.transactionId&&e.transactionId.startsWith(`ORD-`),l=e.transactionId&&e.transactionId.startsWith(`BKG-`),u=(e.itemName||``).toLowerCase(),d=`Reservasi`;l||u.includes(`transfer`)||u.includes(`rental`)||u.includes(`sewa`)||u.includes(`mobil`)||u.includes(`motor`)?d=`Rental & Transfer`:c&&(d=`Paket Tour / QRIS`);let f=new Date().toLocaleDateString(`id-ID`,{day:`2-digit`,month:`long`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}),p=window.location.origin+`/logo.png`,m=0,h=window.globalItems?window.globalItems.find(t=>t.title===(e.itemName||``)):null,g=u.includes(`mobil`)||u.includes(`avanza`)||u.includes(`innova`)||u.includes(`hiace`)||u.includes(`brio`)||u.includes(`xpander`)||u.includes(`alphard`)||u.includes(`fortuner`),_=u.includes(`motor`);(u.includes(`airport`)||u.includes(`transfer`)||u.includes(`tour`)||u.includes(`paket`))&&(g=!1,_=!1),h&&h.category&&(h.category===`car`?g=!0:h.category===`motorcycle`?_=!0:(g=!1,_=!1)),_?m=503e3:g&&(m=1003e3);let v=u.includes(`driver`)||u.includes(`supir`)||u.includes(`dengan supir`),y=window.globalItems?window.globalItems.find(t=>t.title===(e.itemName||``)):null;y&&y.driverOptions&&y.driverOptions!==`Tidak Include Driver`&&(v=!0),v&&(m=0);let b=``;m>0&&(b=`
            <div style="background:#e0f2fe;border-left:4px solid #38bdf8;padding:8px 16px;margin-bottom:12px;border-radius:4px;">
                <div style="font-size:10px;font-weight:700;color:#0369a1;margin-bottom:2px;">&#8505; Catatan Deposit</div>
                <div style="font-size:10px;color:#0c4a6e;line-height:1.4;">Total pembayaran <b>sudah termasuk uang deposit</b> sebesar <strong>Rp ${m.toLocaleString(`id-ID`)}</strong>. Deposit akan dikembalikan 100% setelah masa sewa berakhir jika kondisi unit baik.</div>
            </div>`);let x=document.createElement(`div`);x.style.cssText=`
        width:794px; background:#fff; margin:0; padding:0;
        font-family:'Segoe UI',Arial,sans-serif; font-size:14px; color:#1e293b;
        box-sizing:border-box; display:flex; flex-direction:column; overflow:hidden;
    `,x.innerHTML=`
<div style="background:linear-gradient(135deg,#1d4ed8 0%,#0369a1 60%,#0891b2 100%);padding:18px 30px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;margin:0;width:100%;box-sizing:border-box;">
            <div style="display:flex;align-items:center;gap:16px;">
                <img src="${p}" crossorigin="anonymous"
                     style="width:60px;height:60px;border-radius:12px;background:#fff;
                            padding:6px;object-fit:contain;flex-shrink:0;">
                <div>
                    <div style="color:#fff;font-size:21px;font-weight:800;line-height:1.2;">Travel Lombok Airport</div>
                    <div style="color:rgba(255,255,255,0.75);font-size:11px;margin-top:2px;">Tour &amp; Travel Lombok &middot; www.travellombokairport.com</div>
                </div>
            </div>
            <div style="text-align:right;color:#fff;">
                <div style="font-size:11px;opacity:0.7;text-transform:uppercase;letter-spacing:1px;">${t?`Bukti DP`:`Bukti Pembayaran`}</div>
                <div style="font-size:28px;font-weight:900;letter-spacing:-1px;line-height:1.1;">${t?`e-Tiket DP`:`e-Tiket`}</div>
            <div style="font-size:11px;opacity:0.65;font-family:monospace;margin-top:3px;">${e.transactionId}</div>
            </div>
        </div>
        <div style="background:${i};border-left:5px solid ${r};padding:8px 30px;display:flex;align-items:center;gap:12px;flex-shrink:0;width:100%;box-sizing:border-box;">
            <div style="width:10px;height:10px;border-radius:50%;background:${r};flex-shrink:0;"></div>
            <div style="font-size:12px;font-weight:700;color:${r};">STATUS: ${a}</div>
            <div style="font-size:10px;color:#475569;margin-left:auto;">Diterbitkan: ${f}</div>
        </div>

        <div style="padding:14px 30px;flex:1;width:100%;box-sizing:border-box;">

            <!-- ID Strip -->
            <div style="background:linear-gradient(135deg,#1d4ed8,#0891b2);border-radius:8px;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                <div>
                    <div style="font-size:10px;color:rgba(255,255,255,0.7);font-weight:600;
                                text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Nomor Transaksi</div>
                    <div style="font-size:18px;font-weight:800;color:#fff;
                                font-family:monospace;letter-spacing:1.5px;">${e.transactionId}</div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
                    <div style="width:52px;height:52px;border-radius:50%;background:${i};
                                border:2px solid ${r};display:flex;align-items:center;
                                justify-content:center;font-size:22px;color:${r};font-weight:700;">
                        ${o}
                    </div>
                    <div style="font-size:10px;font-weight:700;color:${r};
                                text-transform:uppercase;letter-spacing:1px;">${a}</div>
                </div>
            </div>

            ${t?`
            <div style="background:linear-gradient(135deg,#fff7ed,#ffedd5);border:2px solid #ea580c;border-radius:10px;padding:10px 16px;margin-bottom:12px;display:flex;align-items:center;gap:12px;">
                <div style="width:36px;height:36px;background:#ea580c;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;color:white;font-weight:900;">!</div>
                <div style="flex:1;">
                    <div style="font-size:10px;font-weight:800;color:#c2410c;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:3px;">&#9888; Pembayaran DP &mdash; Belum Lunas</div>
                    <div style="font-size:11px;color:#9a3412;">Terbayar: <strong>Rp ${Number(e.itemPrice||0).toLocaleString(`id-ID`)}</strong> &nbsp;&bull;&nbsp; Sisa Sewa: <strong>${e.fullPrice?`Rp `+Number(Number(e.fullPrice)-(Number(e.itemPrice||0)-m)).toLocaleString(`id-ID`):`Lihat admin`}</strong></div>
                    <div style="font-size:10px;color:#9a3412;margin-top:2px;">Lunasi sisa pembayaran sewa sebelum tanggal keberangkatan.</div>
                </div>
            </div>`:``}
            ${b}

            <!-- Informasi Pemesan -->
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;margin-bottom:6px;">Informasi Pemesan</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Nama Lengkap</div>
                    <div style="font-size:15px;font-weight:700;color:#1e293b;">${e.customerName||e.userEmail||`-`}</div>
                </div>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Email</div>
                    <div style="font-size:14px;font-weight:700;color:#1e293b;">${e.customerEmail||e.userEmail||`-`}</div>
                </div>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;grid-column:1/-1;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">No. WhatsApp / Telepon</div>
                    <div style="font-size:14px;font-weight:700;color:#1e293b;">${e.phone||e.details?.phone||`-`}</div>
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
                    <div style="font-size:16px;font-weight:800;color:#1e293b;">${e.itemName||`-`}</div>
                </div>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Jenis Layanan</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${d}</div>
                </div>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Tanggal Pelaksanaan</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${s(e.startDate||e.details?.date)}</div>
                </div>
                ${e.endDate?`
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Tanggal Selesai</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${s(e.endDate)}</div>
                </div>
                `:``}
                ${e.details?.time?`
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Jam Penjemputan</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${e.details.time}</div>
                </div>
                `:``}
                ${e.details?.pax?`
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Jumlah Peserta</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${e.details.pax} Orang</div>
                </div>
                `:``}
                ${e.details?.pickup?`
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;grid-column:1/-1;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Lokasi Jemput</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${e.details.pickup}</div>
                </div>
                `:``}
                ${e.details?.dropoff?`
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;grid-column:1/-1;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Tujuan / Drop-off</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${e.details.dropoff}</div>
                </div>
                `:``}
                ${e.details?.flightNumber?`
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">No. Penerbangan</div>
                <div style="font-size:13px;font-weight:700;color:#1e293b;">${e.details.flightNumber}</div>
                </div>
                `:``}
                ${e.details?.vehicle?`
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Pilihan Kendaraan</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${e.details.vehicle}</div>
                </div>
                `:``}
                ${e.details?.notes?`
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;grid-column:1/-1;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Catatan Khusus</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${e.details.notes}</div>
                </div>
                `:``}
                ${e.endDate?(()=>{let t=(e.itemName||``).toLowerCase();return`
                    <div style="background:#eff6ff;border:1px solid #bae6fd;border-radius:8px;padding:8px 12px;grid-column:1/-1;display:flex;align-items:center;gap:10px;">
                        <div style="width:28px;height:28px;background:#0ea5e9;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px;">
                            ℹ️
                        </div>
                        <div>
                            <div style="font-size:10px;color:#0369a1;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">Info Waktu Berakhir</div>
                            <div style="font-size:12px;color:#0369a1;">${t.includes(`paket`)||t.includes(`tour`)||t.includes(`trip`)||t.includes(`honeymoon`)||e.transactionId&&e.transactionId.startsWith(`ORD-`)?`Paket/layanan berakhir pada <strong>${s(e.endDate)}</strong>.`:`Masa sewa berakhir pada <strong>${s(e.endDate)}</strong>.`}</div>
                        </div>
                    </div>
                    `})():``}
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
                    <div style="font-size:10px;color:#64748b;margin-top:4px;">Dicetak: ${f}</div>
                    <div style="margin-top:6px;display:inline-flex;align-items:center;gap:5px;background:linear-gradient(135deg,#1d4ed8,#0891b2);border-radius:20px;padding:3px 10px;">
                        <span style="font-size:9px;color:#fff;font-weight:700;letter-spacing:0.5px;">&#127760; Dipesan melalui website www.travellombokairport.com</span>
                    </div>
                </div>
            </div>
        </div>
    `;let S=document.createElement(`div`);S.style.cssText=`position:absolute; left:0; top:0; width:794px; z-index:-9999; visibility:hidden; overflow:hidden; background:#fff; padding:0; margin:0;`,x.style.minHeight=`auto`,S.appendChild(x),document.body.appendChild(S);let C=x.offsetHeight+100,w={margin:0,filename:`e-Tiket_${e.transactionId}.pdf`,image:{type:`jpeg`,quality:.98},html2canvas:{scale:2,useCORS:!0,allowTaint:!0,logging:!1,backgroundColor:`#ffffff`,scrollY:0,windowY:0},jsPDF:{unit:`px`,format:[794,C],orientation:`portrait`,hotfixes:[`px_scaling`]},pagebreak:{mode:`avoid-all`}};html2pdf().set(w).from(x).save().then(()=>{document.body.removeChild(S)}).catch(e=>{document.body.removeChild(S),console.error(`PDF generation error:`,e)})},window.cekStatusBooking=async(t,n=`booking`)=>{t.preventDefault();let r=n===`booking`?`input-cek-booking`:`input-cek-orderan`,i=n===`booking`?`btn-cek-booking`:`btn-cek-orderan`,a=document.getElementById(r),o=document.getElementById(i),s=a.value.trim();if(!s)return;let c=o.innerHTML;o.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> Mengecek...`,o.disabled=!0;try{let t=await fetch(`${e}/bookings/check/${s}?_t=${new Date().getTime()}`,{cache:`no-store`});if(t.ok){let e=await t.json(),n=e.status===`PAID`?`#22c55e`:e.status===`PENDING`?`#f59e0b`:`#ef4444`,r=e.status===`PAID`?`fa-circle-check`:e.status===`PENDING`?`fa-clock`:`fa-circle-xmark`,i=e.type===`order`||e.transactionId&&e.transactionId.startsWith(`ORD-`)?`🛒 Pesanan Tour / QRIS (ORD-)`:`🚗 Rental & Transfer (BKG-)`,a=`
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 3rem; color: ${n}; margin-bottom: 10px;">
                        <i class="fa-solid ${r}"></i>
                    </div>
                    <span style="background: ${n}; color: white; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 0.85rem;">${e.status}</span>
                    <div style="margin-top: 8px; font-size: 0.78rem; color: #64748b; background: #f8fafc; display: inline-block; padding: 3px 10px; border-radius: 20px;">${i}</div>
                </div>
                
                <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: left;">
                    <div style="margin-bottom: 10px;">
                        <span style="font-size: 0.78rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">ID Transaksi</span>
                        <div style="font-weight: 700; color: #1e293b; font-family: monospace; font-size: 0.95rem;">${e.transactionId}</div>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <span style="font-size: 0.78rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Atas Nama</span>
                        <div style="font-weight: 700; color: #1e293b;">${e.customerName||`-`}</div>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <span style="font-size: 0.78rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Email</span>
                        <div style="font-weight: 700; color: #1e293b;">${e.customerEmail||`-`}</div>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <span style="font-size: 0.78rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">No. HP / WA</span>
                        <div style="font-weight: 700; color: #1e293b;">${e.phone||`-`}</div>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <span style="font-size: 0.78rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Item / Layanan</span>
                        <div style="font-weight: 700; color: #1e293b;">${e.itemName||`-`}</div>
                    </div>
                    <div>
                        <span style="font-size: 0.78rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Jadwal</span>
                        <div style="font-weight: 700; color: #1e293b;">${e.startDate?new Date(e.startDate).toLocaleDateString(`id-ID`):`-`} ${e.endDate?`– `+new Date(e.endDate).toLocaleDateString(`id-ID`):``}</div>
                    </div>
                </div>
                
                <div style="margin-top: 16px;">
                    <button onclick="Swal.close(); setTimeout(()=> { window.generateEtiketPDF(window._lastBookingData); }, 300)" style="width:100%; background: linear-gradient(135deg,#1d4ed8,#0891b2); color:#fff; border:none; border-radius:10px; padding:13px 20px; font-size:0.95rem; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                        <i class="fa-solid fa-file-pdf"></i> Unduh e-Tiket PDF
                    </button>
                </div>
            `;window._lastBookingData=e,Swal.fire({title:`Status Pesanan`,html:a,confirmButtonColor:`#22c55e`,confirmButtonText:`Tutup`,customClass:{container:`my-swal-container`}})}else{let e=`Pastikan ID Transaksi yang Anda masukkan benar (BKG-... atau ORD-...).`;try{let n=await t.json();n&&n.message&&(e=n.message)}catch{}Swal.fire({icon:`error`,title:`Tidak Ditemukan`,text:e,confirmButtonColor:`#22c55e`})}}catch(e){console.error(e),Swal.fire({icon:`error`,title:`Gagal`,text:`Terjadi kesalahan jaringan saat mengecek status.`,confirmButtonColor:`#22c55e`})}finally{o.innerHTML=c,o.disabled=!1,a.value=``}},window.addEventListener(`scroll`,()=>{let e=document.querySelector(`.navbar`);window.scrollY>50?e.classList.add(`scrolled`):e.classList.remove(`scrolled`)}),window.updateSubLayanan=()=>{let e=document.getElementById(`qb-layanan`).value,n=document.getElementById(`qb-sub-container`),r=document.getElementById(`qb-sub-layanan`);r.innerHTML=``;let i=[];if(e===`Sewa Mobil`)i=t.filter(e=>{let t=e.category.toLowerCase();return t.includes(`rental`)||t.includes(`armada`)||t.includes(`sewa`)||t===`car`}),i.length===0&&(i=[{title:`Toyota Avanza`},{title:`Toyota Innova Reborn`},{title:`Toyota Hiace Commuter`}]);else if(e===`Paket Tour`)i=t.filter(e=>{let t=e.category.toLowerCase();return t.includes(`paket`)||t===`package`}),i.length===0&&(i=[{title:`Paket Sasak Tour (1 Hari)`},{title:`Paket Explore Gili (1 Hari)`},{title:`Paket Honeymoon Romantis (3H2M)`},{title:`Paket Family Vacation (4H3M)`}]);else if(e===`Airport Transfer`){let e=t.filter(e=>{let t=e.category?.toLowerCase()||``;return t.includes(`antar jemput`)||t.includes(`transfer`)||t===`transfer`}),n=new Set;e.forEach(e=>{e.transferMatrix&&Array.isArray(e.transferMatrix)&&e.transferMatrix.forEach(e=>{let t=e.area;t&&!t.toLowerCase().includes(`airport`)&&(t=`Airport ⇔ ${t}`),e.area&&e.prices&&Object.keys(e.prices).length>0?Object.keys(e.prices).forEach(e=>{n.add(`${t} (${e})`)}):e.area&&n.add(t)})}),n.forEach(e=>{i.push({title:e})}),i.length===0&&(i=[{title:`Airport ⇔ Mataram Kota (Avanza)`},{title:`Airport ⇔ Mataram Kota (Innova)`},{title:`Airport ⇔ Senggigi (Avanza)`},{title:`Airport ⇔ Senggigi (Innova)`}])}i.length>0?(i.forEach(e=>{let t=document.createElement(`option`);t.value=e.title,t.textContent=e.title,r.appendChild(t)}),n.style.display=`block`):(n.style.display=`none`,r.innerHTML=`<option value='-'>-</option>`)},document.addEventListener(`DOMContentLoaded`,()=>{p().then(()=>{window.updateSubLayanan();let e=document.getElementById(`qb-tanggal`);if(e){e.addEventListener(`change`,e=>{let t=e.target.value,n=document.getElementById(`qb-sub-layanan`).value;!t||n===`-`||window.globalBookings&&window.globalBookings.length>0&&window.globalBookings.some(e=>e.startDate===t&&e.itemName===n&&(e.status===`PAID`||e.status===`CONFIRMED`||e.status===`PENDING`))&&(Swal.fire({icon:`warning`,title:`Tanggal Penuh`,text:`Maaf, layanan ini sudah terisi pada tanggal tersebut. Silakan pilih tanggal lain.`,confirmButtonColor:`#22c55e`}),e.target.value=``)});let t=document.getElementById(`qb-sub-layanan`);t&&t.addEventListener(`change`,()=>{e.value&&e.dispatchEvent(new Event(`change`))})}let n=new URLSearchParams(window.location.search).get(`item`);if(n&&t){let e=t.find(e=>e.id===n);if(e){let t=[`car`,`motorcycle`,`drone`].includes(e.category),n=t?e.category===`motorcycle`?`motorcycles`:e.category===`drone`?`drones`:`cars`:`packages`,r=document.getElementById(n);r&&r.scrollIntoView({behavior:`smooth`,block:`center`}),window.history.replaceState({},document.title,window.location.pathname),t?openCheckoutModal(e.title,e.price):openTourModal(e.id)}}})}),window.submitBooking=e=>{let t=document.getElementById(`qb-layanan`).value,n=document.getElementById(`qb-sub-layanan`).value,r=document.getElementById(`qb-tanggal`).value,i=document.getElementById(`qb-jumlah`).value;if(!r){Swal.fire({icon:`info`,title:`Pemberitahuan`,text:`Mohon pilih tanggal terlebih dahulu.`,confirmButtonColor:`#22c55e`});return}let a=0;if(n&&n!==`-`){if(t===`Sewa Mobil`||t===`Paket Tour`){let e=window.globalItems?window.globalItems.find(e=>e.title===n):null;e&&e.price&&(a=e.price)}else if(t===`Airport Transfer`){let e=window.globalItems?window.globalItems.filter(e=>{let t=e.category?.toLowerCase()||``;return t.includes(`antar jemput`)||t.includes(`transfer`)||t===`transfer`}):[],t=n.replace(`Airport ⇔ `,``),r=``,i=t.match(/(.*?)\s*\((.*?)\)$/);i&&(t=i[1].trim(),r=i[2].trim());for(let i of e){if(i.transferMatrix&&Array.isArray(i.transferMatrix))for(let e of i.transferMatrix){let i=e.area||``;if((i.trim()===t||i.trim()===n.replace(`Airport ⇔ `,``).trim())&&r&&e.prices&&e.prices[r]){a=Number(e.prices[r]);break}}if(a>0)break}}}let o=t;n&&n!==`-`&&(o=`${t} - ${n}`);let s=`${o} (${i} - ${r})`;if(e===`wa`)openCheckoutModal(s,a,`wa`);else{if(!window.checkAuthAndPrompt())return;openCheckoutModal(s,a,`web`)}},window.closeCheckoutModal=()=>{window.activePollInterval&&(clearInterval(window.activePollInterval),window.activePollInterval=null),sessionStorage.removeItem(`checkoutState`),window._checkoutActive=!1,window.removeEventListener(`beforeunload`,window._checkoutBeforeUnload),document.getElementById(`checkout-modal`).classList.remove(`active`)},window.openCheckoutModal=async(t,n,i=`web`)=>{let a=window.globalItems?window.globalItems.find(e=>e.title===t):null;if(window.currentCheckoutItemId=a?a.id:null,i!==`wa`&&!window.checkAuthAndPrompt())return;let o=document.getElementById(`checkout-modal-body`),s=n>0;s&&r(n);try{let n=(await(await fetch(`${e}/bookings?public=true&_t=${new Date().getTime()}`,{cache:`no-store`})).json()).filter(e=>{let n=e.itemName||``;return n?(n===t||t.includes(n)||n.includes(t))&&(e.status===`PAID`||e.status===`PENDING`):!1});window.currentBookings=n}catch(e){console.error(`Failed to fetch bookings:`,e)}let c=t.match(/(\d+)\s*H/i),l=c?parseInt(c[1]):0,u=`other`;a&&a.category&&(a.category===`car`?u=`mobil`:a.category===`motorcycle`?u=`motor`:a.category===`package`?u=`tour`:a.category===`airport`&&(u=`airport`));let d=t.toLowerCase();u===`other`&&(d.includes(`airport`)||d.includes(`jemput`)||d.includes(`antar`)||d.includes(`transfer`)?u=`airport`:d.includes(`motor`)?u=`motor`:d.includes(`mobil`)||d.includes(`avanza`)||d.includes(`innova`)||d.includes(`hiace`)||d.includes(`brio`)||d.includes(`xpander`)||d.includes(`alphard`)||d.includes(`fortuner`)?u=`mobil`:(d.includes(`paket`)||d.includes(`tour`))&&(u=`tour`));let f=window.globalEventSettings||{eventMode:!1,eventPriceIncrease:0},p=f.eventMode&&f.eventPriceIncrease>0,m=u===`motor`||u===`mobil`,h=n;p&&m&&n>0&&(h=n+f.eventPriceIncrease);let g=`
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: ${i===`wa`?`#22c55e`:`var(--primary-blue)`};">${i===`wa`?`<i class="fa-brands fa-whatsapp"></i> Form Booking via WA`:s?`Checkout Pesanan`:`Form Booking`}</h2>
            <p style="color: #64748b; font-size: 0.9rem;">${i===`wa`?`Silakan lengkapi rincian booking Anda (Tanpa wajib login).`:s?`Selesaikan pesanan item Anda.`:`Lengkapi data untuk proses booking.`}</p>
        </div>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; border: 1px solid #e2e8f0;">
            <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 5px;">${i===`wa`?`Item Booking:`:s?`Item yang diorder:`:`Rincian Booking:`}</p>
            <h3 style="color: var(--text-dark); margin-bottom: 5px;">${t}</h3>
            ${s?`
                ${p&&m?`
                <div style="margin-bottom: 6px;">
                    <span style="text-decoration: line-through; color: #94a3b8; font-size: 0.9rem;">${r(n)}</span>
                    <span style="background: linear-gradient(135deg,#f59e0b,#ef4444); color: white; font-size: 0.7rem; font-weight: 700; padding: 2px 7px; border-radius: 10px; margin-left: 6px;">EVENT +${r(f.eventPriceIncrease)}</span>
                </div>
                <p id="co-display-price" data-base-price="${h}" style="font-weight: bold; color: #ef4444; font-size: 1.25rem;">${r(h)}</p>
                `:`<p id="co-display-price" data-base-price="${n}" style="font-weight: bold; color: var(--primary-green); font-size: 1.1rem;">${r(n)}</p>`}
            `:``}
        </div>

        ${p&&m?`
        <div style="background: linear-gradient(135deg, #fff7ed, #fef3c7); border: 1.5px solid #f59e0b; border-radius: 10px; padding: 10px 14px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px;">
            <i class="fa-solid fa-fire" style="color: #f59e0b; font-size: 1.2rem;"></i>
            <div>
                <div style="font-weight: 700; color: #92400e; font-size: 0.85rem;">🎉 ${f.eventName?`Event: ${f.eventName}`:`High Season!`}</div>
                <div style="font-size: 0.78rem; color: #78350f;">Harga naik Rp ${parseInt(f.eventPriceIncrease).toLocaleString(`id-ID`)} · Minimum sewa 4 hari</div>
            </div>
        </div>
        `:``}


        <form id="checkout-form" onsubmit="event.preventDefault(); processCheckout('${t}', ${h||0}, '${i}');">

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
                    <label>${u===`airport`?`Tanggal`:`Tanggal Mulai`}</label>
                    <input type="date" id="co-start-date" class="form-control" required>
                </div>
                ${u===`airport`?`
                <input type="hidden" id="co-end-date" required>
                `:l===0?`
                <div class="form-group mb-3" style="flex: 1; display:flex; flex-direction:column;">
                    <label>Durasi Sewa${p&&m?` <span style="font-size:0.75rem;color:#ef4444;font-weight:700;">⚠ Min. 4 Hari (Event)</span>`:``}</label>
                    <div style="display:flex; gap:10px;">
                        <select id="co-duration-select" class="form-control" style="flex:1;" required onchange="const c = document.getElementById('co-duration-custom'); if(this.value==='custom') { c.style.display='block'; c.required=true; c.focus(); } else { c.style.display='none'; c.required=false; }">
                            ${p&&m?``:`<option value="1">1 Hari</option>`}
                            ${p&&m?``:`<option value="2">2 Hari</option>`}
                            ${p&&m?``:`<option value="3">3 Hari</option>`}
                            <option value="4"${p&&m?` selected`:``}>4 Hari${p&&m?` (Minimum Event)`:``}</option>
                            <option value="5">5 Hari</option>
                            <option value="6">6 Hari</option>
                            <option value="7">1 Minggu (7 Hari)</option>
                            <option value="14">2 Minggu (14 Hari)</option>
                            <option value="custom">Custom (Ketik Sendiri)</option>
                        </select>
                        <input type="number" id="co-duration-custom" class="form-control" min="${p&&m?4:1}" max="60" placeholder="Berapa hari?" style="display:none; width:110px;" oninput="if(this.value>60){this.value=60;} else if(this.value<${p&&m?4:1} && this.value!==''){this.value=${p&&m?4:1};">
                    </div>
                </div>
                <input type="hidden" id="co-end-date" required>
                `:`
                <div class="form-group mb-3" style="flex: 1;">
                    <label>Tanggal Selesai <span style="font-size:0.75rem;color:#0ea5e9;font-weight:600;">● Otomatis</span></label>
                    <input type="date" id="co-end-date" class="form-control" required readonly style="background:#f1f5f9;cursor:not-allowed;">
                </div>
                `}
            </div>
            <div id="date-duration-info" style="display:${l>0?`flex`:`none`}; align-items:center; gap:10px; margin-bottom:16px; background:linear-gradient(135deg,#eff6ff,#e0f2fe); border:1px solid #bae6fd; border-radius:12px; padding:12px 16px;">
                <div style="width:36px;height:36px;background:#0ea5e9;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <i class="fa-solid fa-calendar-check" style="color:white;font-size:1rem;"></i>
                </div>
                <div>
                    <div id="date-duration-title" style="font-size:0.8rem;font-weight:700;color:#0369a1;">
                        ${l>0?(t.match(/(\d+H\s*\d+M)/i)?.[1]||l+`H `+(l-1)+`M`)+` &mdash; Durasi Paket`:`Info Pengembalian`}
                    </div>
                    <div id="date-duration-text" style="font-size:0.82rem;color:#0369a1;margin-top:2px;">
                        ${l>0?`Pilih tanggal mulai, tanggal selesai akan otomatis terisi.`:``}
                    </div>
                </div>
            </div>
            <div id="dynamic-date-warning" style="display: none; margin-bottom: 15px; font-size: 0.85rem; color: #ef4444; background: #fff1f2; padding: 10px; border-radius: 8px; border: 1px solid #fecdd3;">
                <strong><i class="fa-solid fa-triangle-exclamation"></i> Maaf, rentang tanggal yang Anda pilih bentrok dengan jadwal yang sudah dipesan! Silakan pilih tanggal lain.</strong>
            </div>`;if(u===`motor`||u===`mobil`)g+=`
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
        `;else if(u===`airport`)g+=`
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
        `;else if(u===`tour`){let e=``;if(window.globalItems){let t=window.globalItems.filter(e=>{let t=(e.category||``).toLowerCase();return(t.includes(`rental`)||t.includes(`armada`)||t.includes(`sewa`)||t===`car`||t===`mobil`)&&!t.includes(`motor`)}),n=l>0?l:1;t.forEach(t=>{let i=t.price*n,a=l>0?` x ${n} Hari`:``;e+=`<option value="${t.title}" data-price="${i}">${t.title} (+ ${r(t.price)}/hari${a})</option>`})}e||=`<option value="Avanza" data-price="0">Pilihan Kendaraan Tidak Ditemukan</option>`,g+=`
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
                        ${e}
                    </select>
                </div>
                <div class="form-group mb-0">
                    <label>Catatan / Request Khusus</label>
                    <textarea id="co-notes" class="form-control" placeholder="Tuliskan permintaan khusus Anda..."></textarea>
                </div>
            </div>
        `}let _=500200,v=0;u===`motor`?(_=53e3,v=503e3):u===`mobil`?(_=203e3,v=1003e3):u===`tour`&&(_=500200);let y=(t||``).toLowerCase(),b=y.includes(`driver`)||y.includes(`supir`)||y.includes(`dengan supir`);a&&a.driverOptions&&a.driverOptions!==`Tidak Include Driver`&&(b=!0),b&&(v=0),g+=s&&i!==`wa`?`
            ${v>0?`
            <div style="background: #e0f2fe; border: 1.5px solid #38bdf8; border-radius: 10px; padding: 12px; margin-bottom: 16px; text-align: left;">
                <div style="font-weight: 700; color: #0369a1; font-size: 0.9rem; margin-bottom: 4px;">ℹ️ Catatan Penting: Tentang Uang Deposit</div>
                <div style="font-size: 0.8rem; color: #0c4a6e;">
                    Total pembayaran Anda saat ini sudah otomatis ditambahkan uang deposit sebesar <strong>${r(v)}</strong>. Uang deposit ini adalah jaminan yang akan <strong>dikembalikan 100%</strong> setelah masa sewa berakhir jika kendaraan dalam kondisi baik.
                </div>
            </div>
            `:``}
            ${n>_?`
            <div class="form-group mb-4" style="text-align: left;">
                <label style="font-weight:700;color:var(--text-dark);">Tipe Pembayaran</label>
                <div style="display:flex;gap:10px;margin-top:8px;" id="payment-type-container">
                    <label id="pt-dp-label" onclick="window.setPaymentType('dp')" style="flex:1;display:flex;align-items:flex-start;gap:10px;background:#fffbeb;border:2px solid #f59e0b;border-radius:10px;padding:12px;cursor:pointer;transition:all .2s;">
                        <input type="radio" name="payment-type-radio" id="pt-dp" value="dp" checked style="accent-color:#f59e0b;width:16px;height:16px;margin-top:2px;">
                        <div>
                            <div style="font-weight:700;color:#d97706;font-size:0.88rem;">Bayar DP</div>
                            <div style="font-size:0.75rem;color:#92400e;margin-top:2px;">Bayar DP ${r(_)} ${v>0?`+ Deposit ${r(v)}`:``} sekarang.</div>
                            <div style="font-size:0.75rem;font-weight:700;color:#d97706;margin-top:4px;">Total ditransfer: ${r(_+v)}</div>
                        </div>
                    </label>
                    <label id="pt-full-label" onclick="window.setPaymentType('full')" style="flex:1;display:flex;align-items:flex-start;gap:10px;background:#f0fdf4;border:2px solid #e2e8f0;border-radius:10px;padding:12px;cursor:pointer;transition:all .2s;">
                        <input type="radio" name="payment-type-radio" id="pt-full" value="full" style="accent-color:#22c55e;width:16px;height:16px;margin-top:2px;">
                        <div>
                            <div style="font-weight:700;color:#15803d;font-size:0.88rem;">Bayar Lunas</div>
                            <div style="font-size:0.75rem;color:#166534;margin-top:2px;">Lunas Biaya Sewa ${v>0?`+ Deposit ${r(v)}`:``}</div>
                            <div style="font-size:0.75rem;font-weight:700;color:#15803d;margin-top:4px;">Transfer sewa penuh + deposit</div>
                        </div>
                    </label>
                </div>
            </div>
            `:``}

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
                    ${window.globalSettings&&window.globalSettings.qrisMaintenanceMode?`<option value="qris" disabled>QRIS Otomatis (Sedang Pemeliharaan)</option><option value="va">Virtual Account (Verifikasi Otomatis)</option><option value="manual" selected>Transfer Manual (Verifikasi WA)</option>`:`<option value="qris">QRIS Otomatis (Verifikasi Instan) — 1 Jam</option><option value="va">Virtual Account (Verifikasi Otomatis) — 24 Jam</option><option value="manual">Transfer Manual (Verifikasi WA)</option>`}
                </select>
            </div>

            <!-- VA Bank Selector (hanya muncul saat pilih Virtual Account) -->
            <div id="va-bank-selector" style="display:none; background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #bae6fd;">
                <p style="font-size: 0.85rem; color: #0369a1; margin-bottom: 10px; font-weight: 600;"><i class="fa-solid fa-building-columns"></i> Pilih Bank Virtual Account:</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    ${[`BNI`,`BRI`,`MANDIRI`,`PERMATA`,`BCA`].map(e=>`
                    <label style="display:flex;align-items:center;gap:8px;background:white;border:2px solid #e0f2fe;border-radius:8px;padding:10px;cursor:pointer;transition:all .2s;" onclick="document.querySelectorAll('#va-bank-selector label').forEach(l=>l.style.borderColor='#e0f2fe'); this.style.borderColor='#0ea5e9';">
                        <input type="radio" name="va-bank" value="${e}" style="accent-color:#0ea5e9;">
                        <span style="font-weight:bold;font-size:0.9rem;color:#0c4a6e;">${e}</span>
                    </label>`).join(``)}
                </div>
                <p style="font-size: 0.78rem; color: #64748b; margin-top: 8px;"><i class="fa-solid fa-clock"></i> Batas waktu pembayaran: <strong>24 jam</strong></p>
            </div>

            <div id="bank-details" style="display: ${window.globalSettings&&window.globalSettings.qrisMaintenanceMode?`block`:`none`}; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #cbd5e1;">
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
        `:`
            <input type="hidden" id="co-payment" value="booking_only">
            <button type="submit" class="btn btn-green w-100" style="padding: 12px; font-size: 1.1rem; background: ${i===`wa`?`#22c55e`:`var(--primary-green)`}; border-color: ${i===`wa`?`#22c55e`:`var(--primary-green)`};">${i===`wa`?`<i class="fa-brands fa-whatsapp"></i> LANJUTKAN VIA WA`:`KIRIM BOOKING`}</button>
        `,g+=`</form>
        <div id="qris-result" style="margin-top: 25px;"></div>
    `,o.innerHTML=g,document.getElementById(`checkout-modal`).classList.add(`active`),u===`tour`&&setTimeout(()=>{let e=document.getElementById(`co-tour-vehicle`);e&&window.updateTourPrice(e)},50);try{let e=JSON.parse(localStorage.getItem(`auth_user`)||`{}`);if(e&&e.email){let t=document.getElementById(`co-email`);t&&!t.value&&(t.value=e.email)}}catch{}sessionStorage.setItem(`checkoutState`,JSON.stringify({itemName:t,price:n})),window._checkoutActive=!0,window._checkoutBeforeUnload=e=>{window._checkoutActive&&(e.preventDefault(),e.returnValue=`Anda sedang dalam proses checkout. Yakin ingin meninggalkan halaman ini?`)},window.removeEventListener(`beforeunload`,window._checkoutBeforeUnload),window.addEventListener(`beforeunload`,window._checkoutBeforeUnload);let x=()=>{let e=JSON.parse(sessionStorage.getItem(`checkoutState`)||`{}`),t=document.getElementById(`co-name`),n=document.getElementById(`co-phone`),r=document.getElementById(`co-email`),i=document.getElementById(`co-start-date`),a=document.getElementById(`co-end-date`),o=document.getElementById(`co-payment`);t&&(e.name=t.value),n&&(e.phone=n.value),r&&(e.email=r.value),i&&(e.startDate=i.value),a&&(e.endDate=a.value),o&&(e.payment=o.value),sessionStorage.setItem(`checkoutState`,JSON.stringify(e))};[`co-name`,`co-phone`,`co-email`,`co-start-date`,`co-end-date`,`co-payment`].forEach(e=>{let t=document.getElementById(e);t&&t.addEventListener(`input`,x),t&&t.addEventListener(`change`,x)}),window._currentDurationDays=l;let S=document.getElementById(`co-start-date`),C=document.getElementById(`co-end-date`),w=document.getElementById(`co-duration-select`),T=document.getElementById(`co-duration-custom`),E=()=>{if(!S||!S.value||!C)return;let e=new Date(S.value),t=l;w&&(w.value===`custom`?(t=T&&T.value?parseInt(T.value):1,t>60&&(t=60),t<1&&(t=1)):t=parseInt(w.value));let n=window._currentDurationDays===0?t:Math.max(0,t-1);e.setDate(e.getDate()+n),C.value=e.toISOString().split(`T`)[0];let r=document.getElementById(`date-duration-info`),i=document.getElementById(`date-duration-text`);if(r&&i){r.style.display=`flex`;let t=e.toLocaleDateString(`id-ID`,{weekday:`long`,year:`numeric`,month:`long`,day:`numeric`});i.innerHTML=window._currentDurationDays===0?`Masa sewa berakhir pada <strong>${t}</strong>.`:`Paket/layanan berakhir pada <strong>${t}</strong>.`}x(),window.checkDateOverlap&&window.checkDateOverlap()};S&&S.addEventListener(`change`,E),w&&w.addEventListener(`change`,E),T&&T.addEventListener(`input`,E)},window.checkDateOverlap=()=>{let e=document.getElementById(`co-start-date`).value,t=document.getElementById(`co-end-date`).value,n=document.getElementById(`dynamic-date-warning`),i=document.querySelector(`#checkout-form button[type='submit']`);if(!e||!t){n.style.display=`none`,i&&(i.disabled=!1);return}let a=new Date(e),o=new Date(t),s=!1;if(window.currentBookings&&window.currentBookings.length>0)for(let e of window.currentBookings){let t=new Date(e.startDate);if(a<=new Date(e.endDate)&&o>=t){s=!0;break}}if(s)n.style.display=`block`,i&&(i.disabled=!0);else{n.style.display=`none`,i&&(i.disabled=!1);let e=document.getElementById(`co-display-price`);if(e&&window._currentDurationDays===0){let t=parseInt(e.getAttribute(`data-base-price`)||0);if(t>0){let n=1,i=document.getElementById(`co-duration-select`);if(i){if(i.value===`custom`){let e=document.getElementById(`co-duration-custom`);n=e&&e.value?parseInt(e.value):1,n>60&&(n=60),n<1&&(n=1)}else n=parseInt(i.value)}e.innerHTML=r(t*n)+` <span style="font-size:0.85rem;color:#64748b;font-weight:normal;">(${n} Hari)</span>`}}}},window.updateTourPrice=e=>{let t=document.getElementById(`co-display-price`);if(!t)return;let n=parseInt(t.getAttribute(`data-original-price`)||t.getAttribute(`data-base-price`)||0);t.hasAttribute(`data-original-price`)||t.setAttribute(`data-original-price`,n);let i=n+parseInt(e.selectedOptions[0].getAttribute(`data-price`)||0);t.setAttribute(`data-base-price`,i),t.innerHTML=r(i)},window.getCurrentLocation=(e,t)=>{if(navigator.geolocation){let n=t.currentTarget,r=n.innerHTML;n.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i>`,navigator.geolocation.getCurrentPosition(t=>{let i=t.coords.latitude,a=t.coords.longitude;document.getElementById(e).value=`https://maps.google.com/?q=${i},${a}`,n.innerHTML=r},e=>{Swal.fire({icon:`error`,title:`Gagal`,text:`Tidak dapat mengambil lokasi. Pastikan izin lokasi (GPS) diaktifkan di browser/HP Anda.`}),n.innerHTML=r})}else Swal.fire({icon:`error`,title:`Oops`,text:`Browser Anda tidak mendukung fitur lokasi.`})},window.setPaymentType=e=>{let t=document.getElementById(`pt-dp-label`),n=document.getElementById(`pt-full-label`),r=document.getElementById(`pt-dp`),i=document.getElementById(`pt-full`);!t||!n||(e===`dp`?(r.checked=!0,t.style.border=`2px solid #f59e0b`,t.style.background=`#fffbeb`,n.style.border=`2px solid #e2e8f0`,n.style.background=`#f0fdf4`):(i.checked=!0,n.style.border=`2px solid #22c55e`,n.style.background=`#dcfce7`,t.style.border=`2px solid #e2e8f0`,t.style.background=`#fffbeb`))},window.processCheckout=async(t,n,i=`web`)=>{if(i!==`wa`&&!window.checkAuthAndPrompt())return;let a=document.getElementById(`co-name`).value,o=document.getElementById(`co-phone`).value,s=document.getElementById(`co-email`)?.value||``,c=document.getElementById(`co-start-date`).value,l=document.getElementById(`co-end-date`).value,u=document.getElementById(`co-payment`).value;document.getElementById(`checkout-modal-body`);let d=`other`,f=window.globalItems?window.globalItems.find(e=>e.title===t):null;f&&f.category&&(f.category===`car`?d=`mobil`:f.category===`motorcycle`?d=`motor`:f.category===`package`?d=`tour`:f.category===`airport`&&(d=`airport`));let p=t.toLowerCase();d===`other`&&(p.includes(`airport`)||p.includes(`jemput`)||p.includes(`antar`)||p.includes(`transfer`)?d=`airport`:p.includes(`motor`)?d=`motor`:p.includes(`mobil`)||p.includes(`avanza`)||p.includes(`innova`)||p.includes(`hiace`)||p.includes(`brio`)||p.includes(`xpander`)||p.includes(`alphard`)||p.includes(`fortuner`)?d=`mobil`:(p.includes(`paket`)||p.includes(`tour`))&&(d=`tour`));let m=document.getElementById(`co-pickup-loc`)?.value||``,h=document.getElementById(`co-dropoff-loc`)?.value||``,g=document.getElementById(`co-pickup-time`)?.value||``,_=document.getElementById(`co-dropoff-time`)?.value||``,v=document.getElementById(`co-flight-num`)?.value||``,y=document.getElementById(`co-pax`)?.value||``,b=document.getElementById(`co-tour-vehicle`)?.value||``,x=document.getElementById(`co-notes`)?.value||``;if(!c||!l){Swal.fire({icon:`info`,title:`Pemberitahuan`,text:`Mohon isi tanggal mulai dan selesai.`,confirmButtonColor:`#22c55e`});return}let S=new Date(c),C=new Date(l);if(S>C){Swal.fire({icon:`info`,title:`Pemberitahuan`,text:`Tanggal selesai tidak boleh lebih awal dari tanggal mulai.`,confirmButtonColor:`#22c55e`});return}if(window.currentBookings&&window.currentBookings.length>0)for(let e of window.currentBookings){let t=new Date(e.startDate);if(S<=new Date(e.endDate)&&C>=t){Swal.fire({icon:`info`,title:`Pemberitahuan`,text:`Maaf, rentang tanggal tersebut sudah dipesan. Silakan pilih tanggal lain.`,confirmButtonColor:`#22c55e`});return}}let w=localStorage.getItem(`auth_user`),T=s;if(!T&&w)try{let e=JSON.parse(w);e&&e.email&&(T=e.email)}catch{}let E=n;if(d===`tour`){let e=document.getElementById(`co-tour-vehicle`);if(e&&e.selectedOptions.length>0){let t=parseInt(e.selectedOptions[0].getAttribute(`data-price`)||0);E+=t}}let D=t.match(/(\d+)\s*H/i),O=D&&parseInt(D[1])>0;if(!O&&n>0){let e=1,t=document.getElementById(`co-duration-select`);if(t){if(t.value===`custom`){let t=document.getElementById(`co-duration-custom`);e=t&&t.value?parseInt(t.value):1}else e=parseInt(t.value)}else e=Math.ceil((C-S)/864e5);e<1&&(e=1),E=n*e}let k=(e,n=null,i=``)=>{let s=``,u=`Catatan: Booking dinyatakan terkonfirmasi setelah pembayaran booking fee diterima.
💳 Pembayaran lock bookingan (DP)/Pelunasan transfer:
BANK: Bank Rakyat Indonesia
Nama: Lalu Renggane
Nomor Rekening: 759801017387536

BANK: Mandiri
Nama: Lalu Renggane
Nomor Rekening: 1610017191425`,f=e?`Saya telah melakukan Booking via Website dengan rincian:`:`Saya ingin melakukan pesanan (Booking) dengan rincian sebagai berikut:`;return s=d===`motor`?`Halo Admin Travel Lombok Airport,\n\n${f}\n\nFORM BOOKING SEWA MOTOR\nTempat Pengambilan (lokasi gps/alamat): ${m}\nTempat Pengembalian (lokasi gps/alamat): ${h}\nJam Pengambilan: ${g}\nJam Pengembalian: ${_}\nNama: ${a}\nLayanan: ${t}\nTgl Mulai: ${c}\nTgl Selesai: ${l}\nNo HP/WA: ${o}\nEmail: ${T||`-`}\n\nCatatan: Booking dinyatakan terkonfirmasi setelah pembayaran booking fee (DP Rp 53.000) dan Deposit (Rp 503.000) diterima.\n💳 Pembayaran lock bookingan (DP)/Pelunasan transfer:\nBANK: Bank Rakyat Indonesia\nNama: Lalu Renggane\nNomor Rekening: 759801017387536\n\nBANK: Mandiri\nNama: Lalu Renggane\nNomor Rekening: 1610017191425`:d===`mobil`?`Halo Admin Travel Lombok Airport,\n\n${f}\n\nFORM BOOKING SEWA MOBIL\nTanggal Pengambilan: ${c}\nTanggal Pengembalian: ${l}\nTempat Pengambilan (lokasi gps/alamat): ${m}\nTempat Pengembalian (lokasi gps/alamat): ${h}\nJam Pengambilan: ${g}\nJam Pengembalian: ${_}\nNama: ${a}\nLayanan: ${t}\nNo HP/WA: ${o}\nEmail: ${T||`-`}\n\nCatatan: Booking dinyatakan terkonfirmasi setelah pembayaran booking fee (DP Rp 203.000) dan Deposit (Rp 1.003.000) diterima.\n👇 Pembayaran lock bookingan (DP)/Pelunasan transfer:\nBANK: Bank Rakyat Indonesia\nNama: Lalu Renggane\nNomor Rekening: 759801017387536\n\nBANK: Mandiri\nNama: Lalu Renggane\nNomor Rekening: 1610017191425`:d===`airport`?`Halo Admin Travel Lombok Airport,\n\n${f}\n\nFORM BOOKING AIRPORT TRANSFER\nNama: ${a}\nNomor WA: ${o}\nEmail: ${T||`-`}\nLokasi penjemputan (gps lokasi/alamat): ${m}\nAlamat Tujuan (gps lokasi/alamat): ${h}\nNomor penerbangan: ${v}\nTanggal: ${c}\nJam penjemputan: ${g}\nJumlah penumpang: ${y}\nCatatan: ${x}\n\n${u}`:d===`tour`?`Halo Admin Travel Lombok Airport,\n\n${f}\n\nFORM BOOKING PRIVATE TOUR LOMBOK\nMohon isi data berikut untuk proses booking:\nLokasi Jemput (berdasarkan GPS/Alamat): ${m}\nLokasi Drop Off: ${h}\nJam Penjemputan: ${g}\nNomor Penerbangan: ${v}\nJumlah Penumpang: ${y}\n\nPaket yang Dipilih: ${t}\nKendaraan: ${b}\n\nTotal Harga: ${E>0?r(E):`Rp __________`}\nDP/Booking Fee: Rp 503.000\nSisa Pembayaran: ${E>503e3?r(E-503e3):`Rp __________`}\nCatatan/Request: ${x||`-`}\nNama: ${a}\nTanggal: ${c}\nNo HP/WA: ${o}\n\n${u}`:`Halo Admin Travel Lombok Airport,\n\n${f}\n\n*Detail Pesanan*\n- Nama: ${a}\n- Layanan: ${t}\n- Tgl Mulai: ${c}\n- Tgl Selesai: ${l}\n${O?``:`- Durasi: ${Math.ceil((C-S)/864e5)||1} Hari\n`}${E>0?`- Total Estimasi: ${r(E)}\n`:``}- No HP/WA: ${o}\n- Email: ${T||`-`}\n\nMohon instruksi selanjutnya. Terima kasih.`,e&&n&&(s=s.replace(`FORM BOOKING`,`ID Booking: ${n}\n\nFORM BOOKING`).replace(`*Detail Pesanan*`,`*Detail Pesanan*\n- ID Booking: ${n}`),i&&(s+=i)),s};if(i===`wa`){let e=k(!1);window.open(`https://wa.me/6289676963255?text=${encodeURIComponent(e)}`,`_blank`),closeCheckoutModal();return}let A=E,j=document.getElementById(`co-promo-applied`)?.value||``,M=Number(document.getElementById(`co-promo-discount`)?.value||0),N=``;j&&M>0&&(E-=M,E<0&&(E=0),N=`\n- Promo Digunakan: ${j} (Diskon ${r(M)})`);let P=E,F=503e3,I=0;d===`motor`?(F=53e3,I=503e3):d===`mobil`?(F=203e3,I=1003e3):d===`tour`&&(F=503e3);let L=(t||``).toLowerCase(),R=L.includes(`driver`)||L.includes(`supir`)||L.includes(`dengan supir`),z=window.globalItems?window.globalItems.find(e=>e.title===t):null;z&&z.driverOptions&&z.driverOptions!==`Tidak Include Driver`&&(R=!0),R&&(I=0);let B=A>F&&document.getElementById(`pt-dp`)?.checked===!0,V=P;B?(V=F,d!==`motor`&&d!==`mobil`&&V>P&&(V=P)):V+=3e3,V+=I;let H={itemName:t,customerName:a,phone:o,startDate:c,endDate:l,price:V,isDp:B,fullPrice:P,customerEmail:T,promoCode:j,promoDiscount:M,details:{pickup:m,dropoff:h,time:g||_,pax:y,flightNumber:v,vehicle:b,notes:x}};if(window.currentCheckoutData=H,u===`booking_only`){let t=`BKG-`+Math.floor(Math.random()*1e4);try{await fetch(`${e}/bookings`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({...H,status:`PENDING`,transactionId:t})})}catch(e){console.error(e)}simulateQrisSuccess(!0,t);return}if(u===`manual`){let t=`BKG-`+Math.floor(Math.random()*1e4);try{await fetch(`${e}/bookings`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({...H,status:`PENDING`,transactionId:t})})}catch(e){console.error(e)}let n=k(!0,t,N);window.open(`https://wa.me/6289676963255?text=${encodeURIComponent(n)}`,`_blank`),closeCheckoutModal();return}if(u===`va`){let n=document.querySelector(`input[name="va-bank"]:checked`);if(!n){Swal.fire({icon:`warning`,title:`Pilih Bank`,text:`Silakan pilih bank Virtual Account terlebih dahulu.`,confirmButtonColor:`#0ea5e9`});return}let r=n.value,i=document.getElementById(`qris-result`),a=document.querySelector(`#checkout-form button[type='submit']`);a&&(a.disabled=!0,a.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> MEMPROSES...`),i.innerHTML=`<div style="text-align:center;padding:20px;background:#f0f9ff;border-radius:12px;border:1px solid #bae6fd;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size:2rem;color:#0ea5e9;margin-bottom:10px;"></i>
            <p style="color:#0369a1;font-size:0.9rem;">Sedang membuat Virtual Account ${r}...</p>
        </div>`;let o=`ORD-`+Date.now()+`-`+Math.floor(Math.random()*9e3+1e3);try{await fetch(`${e}/bookings`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({...H,status:`PENDING`,transactionId:o})})}catch(e){console.error(`Failed to save pending booking:`,e)}try{let n=await(await fetch(`${e}/payment/va`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({amount:V,bank_code:r,reference_id:o})})).json();if(n.success){let r=n.data;try{await fetch(`${e}/bookings/by-txid/${o}/payment-info`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify({paymentMethod:`va`,vaBank:r.vaBank,vaNumber:r.vaNumber,expiredAt:r.expiredAt})})}catch(e){console.error(`Gagal simpan payment-info VA`,e)}i.innerHTML=`
                    <div style="background:white;padding:20px;border-radius:15px;box-shadow:0 10px 25px rgba(0,0,0,0.05);text-align:center;border:2px dashed #0ea5e9;">
                        <h3 style="color:#0c4a6e;margin-bottom:5px;">Virtual Account ${r.vaBank}</h3>
                        <p style="color:#64748b;font-size:0.85rem;margin-bottom:15px;">Transfer tepat sesuai jumlah ke nomor VA berikut:</p>
                        <div style="background:#f0f9ff;border:2px solid #0ea5e9;border-radius:12px;padding:20px;margin-bottom:15px;">
                            <div style="font-size:0.8rem;color:#64748b;margin-bottom:5px;">Nomor Virtual Account</div>
                            <div style="font-size:1.8rem;font-weight:900;color:#0c4a6e;letter-spacing:3px;">${r.vaNumber||`-`}</div>
                            <button onclick="navigator.clipboard.writeText('${r.vaNumber}');this.innerHTML='<i class=\'fa-solid fa-check\'></i> Tersalin!';setTimeout(()=>this.innerHTML='<i class=\'fa-regular fa-copy\'></i> Salin Nomor',2000);" 
                                style="margin-top:10px;padding:6px 16px;background:#0ea5e9;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;">
                                <i class="fa-regular fa-copy"></i> Salin Nomor
                            </button>
                        </div>
                        <h4 style="color:#0c4a6e;margin-bottom:5px;">${t}</h4>
                        <p style="font-size:1.4rem;font-weight:bold;color:#16a34a;margin-bottom:10px;">${r.totalFormatted}</p>
                        <div style="background:#fef9c3;color:#854d0e;padding:8px;border-radius:8px;font-size:0.85rem;display:inline-block;margin-bottom:15px;">
                            <i class="fa-regular fa-clock"></i> Batas Waktu: ${r.expiredAt}
                        </div>
                        <div style="color:#0369a1;font-size:0.9rem;margin-bottom:15px;">
                            <i class="fa-solid fa-spinner fa-spin"></i> Sistem sedang menunggu pembayaran...
                        </div>
                        <button type="button" class="btn btn-blue" style="width:100%;padding:10px;font-weight:bold;border-radius:8px;" onclick="forcePaymentSuccess('${r.transactionId}', this)">SAYA SUDAH BAYAR</button>
                        <div style="margin-top:12px;padding:10px;background:#fff8f1;border-radius:8px;border:1px solid #ffedd5;font-size:0.8rem;color:#d97706;">
                            <i class="fa-solid fa-circle-info"></i> Pastikan transfer dilakukan ke nomor VA yang benar dengan jumlah yang tepat.
                        </div>
                    </div>`;let a=setInterval(async()=>{try{let t=await(await fetch(`${e}/payment/status/${r.transactionId}`)).json();t.success&&[`PAID`,`SUCCESS`,`SETTLEMENT`,`COMPLETED`].includes(t.data.status?.toUpperCase())?(clearInterval(a),window.simulateQrisSuccess(!1,r.transactionId)):t.success&&t.data.status===`EXPIRED`&&(clearInterval(a),i.innerHTML=`<div style="text-align:center;padding:20px;background:#fff1f2;border:1px solid #fda4af;border-radius:12px;">
                                <i class="fa-solid fa-circle-xmark" style="font-size:3rem;color:#ef4444;"></i>
                                <h3 style="color:#ef4444;">Virtual Account Kedaluwarsa</h3>
                                <p>Waktu pembayaran telah habis. Silakan buat pesanan ulang.</p>
                            </div>`)}catch(e){console.error(e)}},5e3);window.activePollInterval=a}else i.innerHTML=`<div class="text-center text-danger p-4" style="background:#fff1f2;border-radius:12px;margin-top:20px;">Gagal membuat Virtual Account. ${n.error||``} Silakan coba lagi.</div>`,a&&(a.disabled=!1,a.innerHTML=`COBA LAGI`)}catch{i.innerHTML=`<div class="text-center text-danger p-4" style="background:#fff1f2;border-radius:12px;margin-top:20px;">Koneksi error. Silakan coba lagi.</div>`,a&&(a.disabled=!1,a.innerHTML=`COBA LAGI`)}return}let U=document.getElementById(`qris-result`),W=document.querySelector(`#checkout-form button[type='submit']`);W&&(W.disabled=!0,W.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> MEMPROSES...`),U.innerHTML=`
        <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #cbd5e1;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-blue); margin-bottom: 10px;"></i>
            <p style="color: var(--text-gray); font-size: 0.9rem;">Sedang membuat kode pembayaran QRIS...</p>
        </div>
    `;let G=`ORD-`+Date.now()+`-`+Math.floor(Math.random()*9e3+1e3);window._pendingQrisTxId=G;try{await fetch(`${e}/bookings`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({...H,status:`PENDING`,transactionId:G})})}catch(e){console.error(`Failed to save pending booking:`,e)}try{let n=await(await fetch(`${e}/payment/qris`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({amount:V,reference_id:G})})).json();if(n.success){let r=n.data;try{await fetch(`${e}/bookings/by-txid/${G}/payment-info`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify({paymentMethod:`qris`,qrCodeSvg:r.qrCodeSvg,paymentUrl:r.payUrl,expiredAt:r.expiredAt,rawQrisString:r.raw?.qr_string})})}catch(e){console.error(`Gagal simpan payment-info QRIS`,e)}U.innerHTML=`
                <div style="background: #f8fafc; border-radius: 20px; overflow: hidden; font-family: 'Inter', sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.02);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, var(--primary-blue), #1e3a8a); padding: 30px 20px; text-align: center;">
                        <h3 style="color: white; font-size: 1.6rem; font-weight: 800; margin: 0 0 5px;">Scan QRIS</h3>
                        <p style="color: rgba(255,255,255,0.85); font-size: 0.95rem; margin: 0;">Buka aplikasi M-Banking / E-Wallet Anda</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 30px 25px 25px; text-align: center;">
                        <div style="background: white; padding: 15px; border-radius: 16px; display: inline-block; box-shadow: 0 10px 25px rgba(0,0,0,0.08); margin-bottom: 20px;">
                            ${r.qrCodeSvg}
                        </div>
                        
                        <h4 style="color: #64748b; font-size: 1rem; font-weight: 600; margin: 0 0 5px;">${t}</h4>
                        <p style="font-size: 2.2rem; font-weight: 900; color: var(--primary-green); margin: 0 0 15px; letter-spacing: -0.5px;">${r.totalFormatted}</p>
                        
                        <div style="background: #fff1f2; color: #e11d48; padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; display: inline-block; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(225, 29, 72, 0.15);">
                            <i class="fa-regular fa-clock" style="margin-right: 5px;"></i> Batas Waktu: ${r.expiredAt}
                        </div>
                        
                        <div style="background: rgba(59, 130, 246, 0.05); color: var(--primary-blue); padding: 12px; border-radius: 12px; font-size: 0.95rem; font-weight: 600; margin-bottom: 20px;">
                            <i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Sistem sedang menunggu pembayaran...
                        </div>
                        
                        <div id="manual-check-msg" style="color: #ef4444; font-size: 0.85rem; margin-bottom: 10px; font-weight: bold;"></div>
                        
                        <button type="button" style="background:linear-gradient(135deg, var(--primary-blue), #1e3a8a); color:white; border:none; padding:14px; font-weight:bold; border-radius:12px; width:100%; cursor:pointer; font-size:1rem; box-shadow:0 6px 15px rgba(12,74,110,0.25); transition:all 0.3s;" onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='translateY(0)';" onclick="forcePaymentSuccess('${r.transactionId}', this)">
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
            `,window.forcePaymentSuccess=async(t,n)=>{let r=n.innerHTML;n.disabled=!0,n.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> MENGECEK...`;let i=document.getElementById(`manual-check-msg`);i&&(i.innerHTML=``);try{let n=await(await fetch(`${e}/payment/status/${t}`)).json();n.success&&[`PAID`,`SUCCESS`,`SETTLEMENT`,`COMPLETED`].includes(n.data.status?.toUpperCase())?(window.activePollInterval&&clearInterval(window.activePollInterval),window.simulateQrisSuccess(!1,t)):i&&(i.innerHTML=`<i class="fa-solid fa-clock"></i> Sistem masih memproses/menunggu pembayaran Anda. Jika Anda sudah membayar, harap tunggu beberapa saat atau periksa di <a href="/riwayat.html" style="color: inherit; text-decoration: underline;">Riwayat Transaksi</a>.`)}catch{i&&(i.innerHTML=`<i class="fa-solid fa-triangle-exclamation"></i> Terjadi kesalahan jaringan. Gagal mengecek.`)}finally{n.disabled=!1,n.innerHTML=r}};let i=setInterval(async()=>{let t=new AbortController,n=setTimeout(()=>t.abort(),6e3);try{let a=await fetch(`${e}/payment/status/${r.transactionId}`,{signal:t.signal});clearTimeout(n);let o=await a.json();o.success&&[`PAID`,`SUCCESS`,`SETTLEMENT`,`COMPLETED`].includes(o.data.status?.toUpperCase())?(clearInterval(i),window.activePollInterval=null,window.simulateQrisSuccess(!1,r.transactionId)):o.success&&o.data.status===`EXPIRED`&&(clearInterval(i),window.activePollInterval=null,U.innerHTML=`
                            <div style="text-align: center; padding: 20px; background: #fff1f2; border: 1px solid #fda4af; border-radius: 12px; margin-top: 20px;">
                                <i class="fa-solid fa-circle-xmark" style="font-size: 3rem; color: #ef4444; margin-bottom: 15px;"></i>
                                <h3 style="color: #ef4444;">Pembayaran Kedaluwarsa</h3>
                                <p style="color: var(--text-dark); font-size: 0.9rem;">Waktu pembayaran telah habis. Silakan tutup dan buat pesanan ulang.</p>
                            </div>
                        `)}catch(e){clearTimeout(n),e.name!==`AbortError`&&console.error(e)}},2e3);window.activePollInterval=i}else{let e=n.details||n.error||n.message||`Tidak ada detail error`;console.error(`QRIS API Error:`,n),U.innerHTML=`<div class="text-center text-danger p-4" style="background: #fff1f2; border-radius: 12px; margin-top: 20px;">
                <b>Gagal memuat kode QRIS.</b><br>
                <small style="color:#64748b;">${n.error||``} ${e===n.error?``:`— `+e}</small><br><br>
                Silakan coba lagi.
            </div>`,W&&(W.disabled=!1,W.innerHTML=`COBA LAGI`)}}catch(e){console.error(`QRIS fetch error:`,e),U.innerHTML=`<div class="text-center text-danger p-4" style="background: #fff1f2; border-radius: 12px; margin-top: 20px;">Koneksi error: ${e.message}. Silakan coba lagi.</div>`,W&&(W.disabled=!1,W.innerHTML=`COBA LAGI`)}},window.simulateQrisSuccess=async(t,n)=>{let r=document.getElementById(`checkout-modal-body`),i=n||(t?`BKG-`:`ORD-`)+Math.floor(Math.random()*1e4);if(window.activePollInterval&&clearInterval(window.activePollInterval),sessionStorage.removeItem(`checkoutState`),window._checkoutActive=!1,window.removeEventListener(`beforeunload`,window._checkoutBeforeUnload),!t&&window.currentCheckoutData){let t=window._pendingQrisTxId||i;fetch(`${e}/bookings/by-txid/${t}/status`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify({status:`PAID`})}).catch(e=>console.error(`Failed to update QRIS booking to PAID:`,e))}r.innerHTML=`
        <div style="text-align: center; padding: 40px 20px;">
            <i class="fa-solid fa-circle-check" style="font-size: 5rem; color: var(--primary-green); margin-bottom: 20px;"></i>
            <h2 style="color: var(--text-dark); margin-bottom: 10px;">${t?`Booking Berhasil!`:`Pembayaran Berhasil!`}</h2>
            <p style="color: #64748b; margin-bottom: 20px;">Terima kasih, pesanan Anda telah kami terima.</p>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px dashed #cbd5e1; margin-bottom: 25px; position: relative;">
                <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 5px;">Nomor Refrensi Anda:</p>
                <h3 style="color: var(--primary-blue); font-family: monospace; font-size: 1.5rem; letter-spacing: 2px;">${i}</h3>
                <button onclick="navigator.clipboard.writeText('${i}'); const icon = this.querySelector('i'); icon.className='fa-solid fa-check'; Swal.fire({icon: 'success', title: 'ID Disalin', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000}); setTimeout(()=>icon.className='fa-solid fa-copy', 2000)" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: white; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; cursor: pointer; color: var(--primary-blue);" title="Salin / Copy"><i class="fa-solid fa-copy"></i></button>
            </div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <button onclick="downloadPdfInvoice('${i}')" class="btn btn-primary" style="flex: 1; background: #10b981;"><i class="fa-solid fa-file-pdf"></i> Unduh e-Tiket</button>
            </div>
            <button onclick="closeCheckoutModal()" class="btn btn-outline" style="width: 100%;">TUTUP</button>
            
        </div>
    `},window.downloadPdfInvoice=e=>{let t=document.createElement(`div`);t.style.cssText=`position:absolute; left:0; top:0; z-index:-9999; visibility:hidden; overflow:hidden; width:800px; padding:0; margin:0;`;let n=(window._lastHistoryData||[]).find(t=>t.id===e||t.transactionId===e)||window.currentCheckoutData;if(!n){alert(`Data transaksi tidak ditemukan.`);return}let{transactionId:r,itemName:i,customerName:a,customerEmail:o,phone:s,startDate:c,endDate:l,status:u,itemPrice:d,createdAt:f,type:p}=n,m=e=>e?new Date(e).toLocaleDateString(`id-ID`,{day:`2-digit`,month:`short`,year:`numeric`}):`-`,h=m(c)+(l?` - `+m(l):``);m(f||new Date);let g=`Rp `+parseInt(d||0).toLocaleString(`id-ID`),_=(i||``).toLowerCase(),v=0,y=window.globalItems?window.globalItems.find(e=>e.title===(i||``)):null,b=_.includes(`mobil`)||_.includes(`avanza`)||_.includes(`innova`)||_.includes(`hiace`)||_.includes(`brio`)||_.includes(`xpander`)||_.includes(`alphard`)||_.includes(`fortuner`),x=_.includes(`motor`);y&&y.category&&(y.category===`car`&&(b=!0),y.category===`motorcycle`&&(x=!0)),x?v=503e3:b&&(v=1003e3);let S=_.includes(`driver`)||_.includes(`supir`)||_.includes(`dengan supir`),C=window.globalItems?window.globalItems.find(e=>e.title===(i||``)):null;C&&C.driverOptions&&C.driverOptions!==`Tidak Include Driver`&&(S=!0),S&&(v=0);let w=``;v>0&&(w=`
            <div style="background:#e0f2fe;border-left:4px solid #38bdf8;padding:12px 16px;margin-top:20px;border-radius:4px;">
                <div style="font-size:12px;font-weight:700;color:#0369a1;margin-bottom:2px;">&#8505; Catatan Deposit</div>
                <div style="font-size:12px;color:#0c4a6e;line-height:1.4;">Total pembayaran di atas <b>sudah termasuk uang deposit</b> sebesar <strong>Rp ${v.toLocaleString(`id-ID`)}</strong>. Deposit akan dikembalikan 100% setelah masa sewa berakhir jika kendaraan dalam kondisi baik.</div>
            </div>`),t.innerHTML=`
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
                        ${u||`PAID`}
                    </div>
                    <h2 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 700;">E-TIKET / INVOICE</h2>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b; font-family: monospace;">Ref: ${r||e}</p>
                </div>
            </div>
            
            <!-- Guest Info -->
            <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 35px; border: 1px solid #e2e8f0;">
                <h3 style="margin: 0 0 15px 0; color: #0284c7; font-size: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 10px;">DETAIL PEMESAN (GUEST INFO)</h3>
                <div style="display: flex; flex-wrap: wrap;">
                    <div style="width: 50%; margin-bottom: 15px;">
                        <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Nama Tamu</p>
                        <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 600;">${a}</p>
                    </div>
                    <div style="width: 50%; margin-bottom: 15px;">
                        <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Tanggal Pelaksanaan</p>
                        <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 600;">${h}</p>
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
                            ${i}
                            ${n.details?.pickup?`<br><small style="color: #64748b; font-size: 13px; margin-top: 5px; display: inline-block;"><b>Pickup:</b> ${n.details.pickup}</small>`:``}
                            ${n.details?.dropoff?`<br><small style="color: #64748b; font-size: 13px;"><b>Drop-off:</b> ${n.details.dropoff}</small>`:``}
                            ${n.details?.flightNumber?`<br><small style="color: #64748b; font-size: 13px;"><b>Flight:</b> ${n.details.flightNumber}</small>`:``}
                            ${n.details?.pax?`<br><small style="color: #64748b; font-size: 13px;"><b>Pax:</b> ${n.details.pax}</small>`:``}
                            ${n.details?.vehicle?`<br><small style="color: #64748b; font-size: 13px;"><b>Vehicle:</b> ${n.details.vehicle}</small>`:``}
                            ${n.details?.notes?`<br><small style="color: #64748b; font-size: 13px;"><b>Notes:</b> ${n.details.notes}</small>`:``}
                        </td>
                        <td style="padding: 20px 15px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 16px; font-weight: 700; color: #0284c7;">
                            ${g}
                        </td>
                    </tr>
                </tbody>
            </table>
            
            ${w}
            
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
    `,document.body.appendChild(t);let T=t.querySelector(`#pdf-content`),E={margin:[0,0,0,0],filename:`e-Tiket_${e}.pdf`,image:{type:`jpeg`,quality:1},html2canvas:{scale:2,useCORS:!0,logging:!1},jsPDF:{unit:`px`,format:[800,T.offsetHeight+100],orientation:`portrait`,hotfixes:[`px_scaling`]},pagebreak:{mode:`avoid-all`}};html2pdf().set(E).from(T).save().then(()=>{document.body.removeChild(t)}).catch(e=>{document.body.removeChild(t),console.error(`PDF generation error:`,e),alert(`Gagal mendownload PDF: `+e.message)})};var m=async()=>{try{let t=await fetch(`${e}/stats?_t=${new Date().getTime()}`,{cache:`no-store`});if(t.ok){let e=await t.json();e.customers&&(document.getElementById(`stat-val-customers`).innerText=e.customers),e.fleet&&(document.getElementById(`stat-val-fleet`).innerText=e.fleet),e.trips&&(document.getElementById(`stat-val-trips`).innerText=e.trips),e.support&&(document.getElementById(`stat-val-support`).innerText=e.support)}}catch(e){console.error(`Failed to load stats:`,e)}};window.allReviewsData=[],window.showingAllReviews=!1,window.renderReviewsList=()=>{let e=document.getElementById(`reviews-container`);if(!e)return;let t=(window.allReviewsData||[]).filter(e=>!e.itemId);if(t.length===0){e.innerHTML=`<p class="text-center w-100" style="grid-column: 1/-1;">Belum ada ulasan. Jadilah yang pertama memberikan ulasan!</p>`;return}let n=window.showingAllReviews?t:t.slice(0,3),r=``;n.forEach(e=>{let t=``;for(let n=0;n<5;n++)n<e.rating?t+=`<i class="fa-solid fa-star" style="color: #f59e0b;"></i>`:t+=`<i class="fa-regular fa-star" style="color: #cbd5e1;"></i>`;let n=``;e.createdAt&&(n=new Date(e.createdAt).toLocaleDateString(`id-ID`,{day:`numeric`,month:`long`,year:`numeric`}));let i=e.name?e.name.charAt(0).toUpperCase():`U`;r+=`
        <div class="review-card" data-aos="fade-up">
            <div class="review-content">
                <div style="display: flex; gap: 4px; margin-bottom: 12px; font-size: 0.9rem;">${t}</div>
                <p class="review-text">"${e.comment}"</p>
            </div>
            <div class="review-author">
                <div class="review-author-avatar">${i}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 800; color: var(--primary-blue); font-size: 1.05rem; letter-spacing: -0.3px;">${e.name}</div>
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 2px;">${n}</div>
                </div>
            </div>
        </div>`}),t.length>3&&(r+=`
        <div class="text-center w-100 mt-3" style="grid-column: 1/-1;">
            <button onclick="window.toggleAllReviews()" class="btn btn-outline" style="border: 2px solid var(--primary-blue); color: var(--primary-blue); padding: 8px 24px; border-radius: 20px; font-weight: 600;">
                ${window.showingAllReviews?`Sembunyikan`:`Lihat Semua Ulasan (${t.length})`}
            </button>
        </div>
        `),e.innerHTML=r},window.toggleAllReviews=()=>{window.showingAllReviews=!window.showingAllReviews,window.renderReviewsList()},window.loadReviews=async()=>{let t=document.getElementById(`reviews-container`);if(t)try{let t=await fetch(`${e}/reviews`);if(!t.ok)throw Error(`Failed to fetch`);window.allReviewsData=await t.json(),window.renderReviewsList()}catch(e){console.error(`Failed to load reviews:`,e),t.innerHTML=`<p class="text-center w-100 text-danger" style="grid-column: 1/-1;">Gagal memuat ulasan.</p>`}},window.submitReview=async t=>{t.preventDefault();let n=document.getElementById(`btn-submit-review`);n.disabled=!0,n.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...`;let r=document.getElementById(`review-name`).value,i=document.getElementById(`review-comment`).value,a=document.querySelector(`input[name="rating"]:checked`),o=a?a.value:5;try{if(!(await fetch(`${e}/reviews`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({name:r,rating:o,comment:i})})).ok)throw Error(`Failed to submit review`);Swal.fire({icon:`success`,title:`Terima Kasih!`,text:`Ulasan Anda berhasil dikirim.`,confirmButtonColor:`#22c55e`}),document.getElementById(`review-form`).reset(),document.getElementById(`review-modal`).classList.remove(`active`),loadReviews()}catch(e){console.error(`Submit review error:`,e),Swal.fire({icon:`error`,title:`Gagal`,text:`Gagal mengirim ulasan. Silakan coba lagi.`,confirmButtonColor:`#22c55e`})}finally{n.disabled=!1,n.innerHTML=`Kirim Ulasan`}},document.addEventListener(`DOMContentLoaded`,()=>{window.checkAuthUI(),m(),loadReviews(),window.changeCurrency=e=>{localStorage.setItem(`app_currency`,e),window.location.reload()};let e=document.querySelector(`.nav-actions`),t=document.querySelector(`.lang-switcher`);if(e&&t){let e=`
        <div class="lang-switcher" id="curr-switcher" style="margin-right: 5px;">
           <button class="lang-btn" id="curr-btn" onclick="document.getElementById('curr-menu').classList.toggle('active')"><i class="fa-solid fa-coins"></i> ${localStorage.getItem(`app_currency`)||`IDR`} <i class="fa-solid fa-chevron-down" style="font-size: 0.7em; margin-left: 2px;"></i></button>
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
        `;t.insertAdjacentHTML(`beforebegin`,e);let n=t.querySelector(`.lang-btn`);n&&(n.removeAttribute(`onclick`),n.addEventListener(`click`,e=>{let n=t.querySelector(`.lang-menu`);n&&n.classList.toggle(`active`)})),document.addEventListener(`click`,e=>{if(!e.target.closest(`#curr-switcher`)){let e=document.getElementById(`curr-menu`);e&&e.classList.contains(`active`)&&e.classList.remove(`active`)}if(!e.target.closest(`.lang-switcher:not(#curr-switcher)`)){let e=t.querySelector(`.lang-menu`);e&&e.classList.contains(`active`)&&e.classList.remove(`active`)}})}let n=sessionStorage.getItem(`checkoutState`);if(n&&(window.location.pathname===`/`||window.location.pathname===`/index.html`))try{let e=JSON.parse(n);e.itemName!==void 0&&e.price!==void 0&&openCheckoutModal(e.itemName,e.price).then(()=>{if(e.name){let t=document.getElementById(`co-name`);t&&(t.value=e.name)}if(e.phone){let t=document.getElementById(`co-phone`);t&&(t.value=e.phone)}if(e.startDate){let t=document.getElementById(`co-start-date`);t&&(t.value=e.startDate)}if(e.endDate){let t=document.getElementById(`co-end-date`);t&&(t.value=e.endDate)}if(e.payment){let t=document.getElementById(`co-payment`);t&&(t.value=e.payment,t.dispatchEvent(new Event(`change`)))}window.checkDateOverlap&&window.checkDateOverlap()}).catch(()=>sessionStorage.removeItem(`checkoutState`))}catch{sessionStorage.removeItem(`checkoutState`)}}),window._authMode=`login`,window.openAuthModal=e=>{let t=e||window._authMode||`login`;sessionStorage.setItem(`redirect_after_auth`,window.location.href),t===`register`?window.location.href=`/register.html`:window.location.href=`/login.html`},window.closeAuthModal=()=>{},window.toggleAuthMode=()=>{window.openAuthModal(window._authMode===`login`?`register`:`login`)},window.checkAuthUI=()=>{let e=localStorage.getItem(`auth_token`),t=JSON.parse(localStorage.getItem(`auth_user`)||`null`),n=document.getElementById(`footer-auth-container`),r=document.getElementById(`footer-user-container`),i=document.getElementById(`footer-user-name`);n&&r&&(e&&t?(n.style.display=`none`,r.style.display=`flex`,i&&(i.innerText=t.name||`Pengguna`)):(n.style.display=`flex`,r.style.display=`none`))},window.logoutUser=()=>{Swal.fire({title:`Konfirmasi`,text:`Apakah Anda yakin ingin keluar?`,icon:`warning`,showCancelButton:!0,confirmButtonText:`Ya, Logout`,cancelButtonText:`Batal`,confirmButtonColor:`#ef4444`}).then(e=>{e.isConfirmed&&(localStorage.removeItem(`auth_token`),localStorage.removeItem(`auth_user`),window.checkAuthUI(),Swal.fire({icon:`success`,title:`Berhasil Logout`,timer:1500,showConfirmButton:!1}))})},window.showRiwayatTransaksi=async(t=!1)=>{if(!t&&window.location.pathname!==`/riwayat.html`){window.location.href=`/riwayat.html`;return}let n=document.getElementById(`riwayat-page-container`),r=localStorage.getItem(`auth_token`);if(n){if(!r){n.innerHTML=`
            <div style="text-align:center; padding:60px 20px; color:#64748b; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                <i class="fa-solid fa-lock" style="font-size:3.5rem; margin-bottom:15px; display:block; color:#94a3b8;"></i>
                <h3 style="color: #1e293b; margin-bottom: 10px;">Akses Ditolak</h3>
                <p style="font-size: 1rem; margin-bottom: 20px;">Silakan login terlebih dahulu untuk melihat riwayat transaksi Anda.</p>
                <button onclick="window.openAuthModal();" style="background:linear-gradient(135deg, var(--primary-blue), #1e40af); color:white; border:none; padding:12px 25px; border-radius:10px; font-weight:bold; cursor:pointer; font-size: 1rem; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Login Sekarang</button>
            </div>
        `;return}n.innerHTML=`
        <div style="text-align:center; padding:60px 20px; color:#64748b; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <i class="fa-solid fa-spinner fa-spin" style="font-size:2.5rem; margin-bottom:15px; display:block; color:#3b82f6;"></i>
            <p style="font-size: 1rem;">Sedang mengambil data riwayat transaksi Anda...</p>
        </div>
    `;try{let i=await fetch(`${e}/bookings/my-history`,{headers:{Authorization:`Bearer ${r}`}}),a=await i.json();if(!i.ok){if(i.status===401||i.status===403)return localStorage.removeItem(`auth_token`),localStorage.removeItem(`auth_user`),window.checkAuthUI(),window.showRiwayatTransaksi(t);throw Error(a.error||a.message||`Gagal memuat riwayat`)}if(a.length===0){n.innerHTML=`
                <div style="text-align:center; padding:60px 20px; color:#64748b; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                    <i class="fa-solid fa-box-open" style="font-size:4rem; margin-bottom:20px; display:block; color:#cbd5e1;"></i>
                    <h3 style="color:#1e293b; margin-bottom:10px; font-weight:700;">Belum Ada Transaksi</h3>
                    <p style="font-size:1rem; margin-bottom: 25px;">Anda belum pernah melakukan pemesanan apapun.</p>
                    <a href="/#packages" class="btn btn-green" style="padding: 12px 25px; border-radius: 10px; font-weight: bold; text-decoration: none;">Ayo Pesan Sekarang!</a>
                </div>
            `;return}let o=`
        <div style="background: white; padding: 25px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
                <h3 style="color: #1e293b; margin: 0; font-size: 1.2rem;"><i class="fa-solid fa-list-check" style="color: var(--primary-blue); margin-right: 8px;"></i> Daftar Transaksi Anda</h3>
                <p style="color: #64748b; margin: 5px 0 0 0; font-size: 0.9rem;">Menampilkan ${a.length} transaksi terakhir.</p>
            </div>
            <div style="display:flex; flex-direction:column; gap:20px;">
        `;window.copyTxId=(e,t,n)=>{if(n&&n.stopPropagation(),navigator.clipboard)navigator.clipboard.writeText(t).then(()=>{let t=e.innerHTML;e.innerHTML=`<i class="fa-solid fa-check"></i>`,e.style.background=`#10b981`,setTimeout(()=>{e.innerHTML=t,e.style.background=`var(--primary-blue)`},2e3)}).catch(e=>console.error(`Gagal menyalin:`,e));else{let n=document.createElement(`textarea`);n.value=t,document.body.appendChild(n),n.select();try{document.execCommand(`copy`);let t=e.innerHTML;e.innerHTML=`<i class="fa-solid fa-check"></i>`,e.style.background=`#10b981`,setTimeout(()=>{e.innerHTML=t,e.style.background=`var(--primary-blue)`},2e3)}catch(e){console.error(`Gagal menyalin:`,e)}document.body.removeChild(n)}},window.resumePayment=async(t,n)=>{Swal.fire({title:`Memuat Pembayaran...`,html:`Silakan tunggu sebentar.`,allowOutsideClick:!1,didOpen:()=>{Swal.showLoading()}});try{let r={},i=``,a=`-`,o=`-`;try{let n=await(await fetch(`${e}/payment/status/${t}`)).json();if(n.success&&n.data&&n.data.raw){r=n.data.raw,i=(n.data.method||r.method||``).toLowerCase();let e=parseInt(r.amount||`0`);e>0&&(a=new Intl.NumberFormat(`id-ID`,{style:`currency`,currency:`IDR`,minimumFractionDigits:0}).format(e)),r.expires_at&&(o=new Date(r.expires_at).toLocaleString(`id-ID`,{day:`numeric`,month:`long`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}))}}catch(e){console.error(`Gagal fetch dari borderpay API:`,e)}if(!i&&window._lastBookingData){i=(window._lastBookingData.paymentMethod||``).toLowerCase();let e=parseInt((window._lastBookingData.itemPrice||``).toString().replace(/\\D/g,``));!isNaN(e)&&e>0&&(a=new Intl.NumberFormat(`id-ID`,{style:`currency`,currency:`IDR`,minimumFractionDigits:0}).format(e)),window._lastBookingData.expiredAt&&(o=window._lastBookingData.expiredAt)}if(i===`qris`&&(r.qr_string||window._lastBookingData?.rawQrisString)){let i=!1;if(r.expires_at)i=Date.now()>new Date(r.expires_at).getTime();else if(window._lastBookingData?.createdAt){let e=new Date(window._lastBookingData.createdAt).getTime();i=!isNaN(e)&&Date.now()-e>36e5}if(i){try{await fetch(`${e}/bookings/by-txid/${t}/status`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify({status:`KADALUARSA`})})}catch{}Swal.fire({icon:`warning`,title:`Pembayaran Kedaluwarsa`,html:`<p style="color:#475569;">Batas waktu pembayaran QRIS sudah <b>terlewat</b>. Kode ini tidak dapat digunakan lagi.</p><p style="color:#64748b;font-size:0.9rem;margin-top:10px;">Silakan buat pesanan baru untuk melanjutkan.</p>`,confirmButtonText:`Buat Pesanan Baru`,confirmButtonColor:`var(--primary-blue)`,showCancelButton:!0,cancelButtonText:`Tutup`}).then(e=>{e.isConfirmed?window.location.href=`/#layanan`:setTimeout(()=>window.loadTransactionHistory?.(),500)});return}let s=r.qr_string||window._lastBookingData.rawQrisString,c=`<img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(s)}" alt="QRIS" style="width:220px;height:220px;border-radius:8px;" />`;Swal.fire({showCloseButton:!1,showConfirmButton:!1,width:`500px`,padding:`0`,html:`
                            <div style="background: #f8fafc; border-radius: 20px; overflow: hidden; font-family: 'Inter', sans-serif; text-align: center;">
                                <div style="background: linear-gradient(135deg, var(--primary-blue), #1e3a8a); padding: 30px 20px; text-align: center; position: relative;">
                                    <button onclick="Swal.close()" style="position: absolute; top: 15px; left: 15px; background: rgba(255,255,255,0.2); border: none; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; z-index: 10;" onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='scale(1.1)';" onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='scale(1)';"><i class="fa-solid fa-chevron-left" style="margin-right:2px;"></i></button>
                                    <h3 style="color: white; font-size: 1.6rem; font-weight: 800; margin: 0 0 5px;">Scan QRIS</h3>
                                    <p style="color: rgba(255,255,255,0.85); font-size: 0.95rem; margin: 0;">Lanjutkan pembayaran Anda.</p>
                                </div>
                                <div style="padding: 30px 25px 25px;">
                                    <div style="background: white; padding: 15px; border-radius: 16px; display: inline-block; box-shadow: 0 10px 25px rgba(0,0,0,0.08); margin-bottom: 20px;">
                                        ${c}
                                    </div>
                                    <h4 style="color: #64748b; font-size: 1rem; font-weight: 600; margin: 0 0 5px;">${n}</h4>
                                    <p style="font-size: 2.2rem; font-weight: 900; color: var(--primary-green); margin: 0 0 15px; letter-spacing: -0.5px;">${a}</p>
                                    <div style="background: #fff1f2; color: #e11d48; padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; display: inline-block; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(225, 29, 72, 0.15);">
                                        <i class="fa-regular fa-clock" style="margin-right: 5px;"></i> Batas Waktu: ${o}
                                    </div>
                                    <div style="background: rgba(59, 130, 246, 0.05); color: var(--primary-blue); padding: 12px; border-radius: 12px; font-size: 0.95rem; font-weight: 600;">
                                        <i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Sistem menunggu pembayaran...
                                    </div>
                                </div>
                            </div>
                        `}),window.activePollInterval&&clearInterval(window.activePollInterval),window.activePollInterval=setInterval(async()=>{try{let n=await(await fetch(`${e}/payment/status/${t}`)).json();n.success&&[`PAID`,`SUCCESS`,`SETTLEMENT`,`COMPLETED`].includes(n.data.status?.toUpperCase())&&(clearInterval(window.activePollInterval),window.simulateQrisSuccess(!1,t))}catch{}},5e3)}else if(i===`va`&&(r.va_number||window._lastBookingData?.vaNumber)){let i=r.bank_code||window._lastBookingData.vaBank||``,s=r.va_number||window._lastBookingData.vaNumber;Swal.fire({showCloseButton:!1,showConfirmButton:!1,width:`500px`,padding:`0`,html:`
                            <div style="background: #f8fafc; border-radius: 20px; overflow: hidden; font-family: 'Inter', sans-serif; text-align: center;">
                                <div style="background: linear-gradient(135deg, var(--primary-blue), #1e3a8a); padding: 30px 20px; text-align: center; position: relative;">
                                    <button onclick="Swal.close()" style="position: absolute; top: 15px; left: 15px; background: rgba(255,255,255,0.2); border: none; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; z-index: 10;" onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='scale(1.1)';" onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='scale(1)';"><i class="fa-solid fa-chevron-left" style="margin-right:2px;"></i></button>
                                    <h3 style="color: white; font-size: 1.6rem; font-weight: 800; margin: 0 0 5px;">Virtual Account ${i}</h3>
                                    <p style="color: rgba(255,255,255,0.85); font-size: 0.95rem; margin: 0;">Transfer tepat sesuai jumlah ke nomor di bawah.</p>
                                </div>
                                <div style="padding: 30px 25px 25px;">
                                    <div style="background: white; border: 2px dashed var(--primary-blue); border-radius: 16px; padding: 25px 20px; margin-bottom: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.03);">
                                        <div style="font-size: 0.9rem; color: #64748b; margin-bottom: 5px; font-weight: 600;">Nomor Virtual Account</div>
                                        <div style="font-size: 2rem; font-weight: 900; color: var(--primary-blue); letter-spacing: 2px; margin-bottom: 15px;">${s}</div>
                                        <button onclick="navigator.clipboard.writeText('${s}');this.innerHTML='<i class=\\'fa-solid fa-check\\'></i> Tersalin!';setTimeout(()=>this.innerHTML='<i class=\\'fa-regular fa-copy\\'></i> Salin Nomor',2000);" 
                                            style="padding:10px 24px; background:linear-gradient(135deg, var(--primary-blue), #1e3a8a); color:white; border:none; border-radius:12px; cursor:pointer; font-size:0.95rem; font-weight:bold; box-shadow:0 4px 10px rgba(12,74,110,0.25); transition:all 0.2s;" onmouseover="this.style.transform='scale(1.05)';" onmouseout="this.style.transform='scale(1)';">
                                            <i class="fa-regular fa-copy"></i> Salin Nomor
                                        </button>
                                    </div>
                                    <h4 style="color: #64748b; font-size: 1rem; font-weight: 600; margin: 0 0 5px;">${n}</h4>
                                    <p style="font-size: 2.2rem; font-weight: 900; color: var(--primary-green); margin: 0 0 15px; letter-spacing: -0.5px;">${a}</p>
                                    <div style="background: #fff1f2; color: #e11d48; padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; display: inline-block; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(225, 29, 72, 0.15);">
                                        <i class="fa-regular fa-clock" style="margin-right: 5px;"></i> Batas Waktu: ${o}
                                    </div>
                                </div>
                            </div>
                        `}),window.activePollInterval&&clearInterval(window.activePollInterval),window.activePollInterval=setInterval(async()=>{try{let n=await(await fetch(`${e}/payment/status/${t}`)).json();n.success&&[`PAID`,`SUCCESS`,`SETTLEMENT`,`COMPLETED`].includes(n.data.status?.toUpperCase())&&(clearInterval(window.activePollInterval),window.simulateQrisSuccess(!1,t))}catch{}},5e3)}else{try{await fetch(`${e}/bookings/by-txid/${t}/status`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify({status:`KADALUARSA`})})}catch{}Swal.fire({icon:`warning`,title:`Pembayaran Kedaluwarsa`,html:`<p style="color:#475569;">Kode pembayaran untuk pesanan ini sudah <b>tidak berlaku lagi</b> karena terlalu lama tidak diselesaikan.</p><p style="color:#64748b;font-size:0.9rem;margin-top:10px;">Silakan buat pesanan baru untuk melanjutkan.</p>`,confirmButtonText:`Buat Pesanan Baru`,confirmButtonColor:`var(--primary-blue)`,showCancelButton:!0,cancelButtonText:`Tutup`}).then(e=>{e.isConfirmed?window.location.href=`/#layanan`:setTimeout(()=>window.loadTransactionHistory?.(),500)})}}catch(e){console.error(e),Swal.fire({icon:`error`,title:`Error`,text:`Terjadi kesalahan jaringan atau memuat data.`})}},window.showTransactionDetail=e=>{let t=JSON.parse(decodeURIComponent(e)),n=t.status===`PAID`;n||t.status,n||t.status;let r=parseInt((t.itemPrice||``).toString().replace(/\D/g,``)),i=!isNaN(r)&&r>0?`Rp `+r.toLocaleString(`id-ID`):`-`,a=t.createdAt?new Date(t.createdAt).toLocaleDateString(`id-ID`,{day:`numeric`,month:`long`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}):`-`;window._lastBookingData=t;let o=``;t.status===`PENDING`&&(o=`
        <button onclick="window.resumePayment('${t.transactionId}', '${t.itemName}')" 
            style="background:linear-gradient(135deg, var(--primary-green), #15803d); border:none; color:white; font-size:1rem; padding:16px 20px; border-radius:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; font-weight:800; width:100%; margin-bottom:5px; box-shadow:0 8px 20px rgba(22,163,74,0.3); transition:all 0.3s;"
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 25px rgba(22,163,74,0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 20px rgba(22,163,74,0.3)';">
            <i class="fa-solid fa-qrcode" style="font-size:1.2rem;"></i> Lanjutkan Pembayaran
        </button>
                `);let s=``,c=(e,t)=>!t||t===`-`?``:`
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 15px; padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px dashed #e2e8f0;">
                <span style="color:#64748b; font-size:0.85rem; font-weight:600; min-width: 120px;">${e}</span>
                <span style="color:#1e293b; font-weight:700; font-size:0.95rem; text-align: right; word-break: break-word;">${t}</span>
            </div>
        `;s+=c(`Nama Pemesan`,t.customerName||t.userEmail),s+=c(`Email`,t.customerEmail||t.userEmail),s+=c(`No. HP / WA`,t.phone||t.details?.phone),s+=c(`Tgl Keberangkatan`,t.startDate||t.details?.date),t.endDate&&(s+=c(`Tgl Selesai`,t.endDate)),t.details?.time&&(s+=c(`Waktu`,t.details.time)),t.details?.pax&&(s+=c(`Jumlah Peserta`,t.details.pax+` Orang`)),t.details?.pickup&&(s+=c(`Lokasi Jemput`,t.details.pickup)),t.details?.dropoff&&(s+=c(`Tujuan`,t.details.dropoff)),t.details?.flightNumber&&(s+=c(`No. Penerbangan`,t.details.flightNumber)),Swal.fire({showCloseButton:!1,showConfirmButton:!1,width:`520px`,padding:`0`,html:`
            <div style="text-align: left; font-family: 'Inter', sans-serif; background: #f8fafc; border-radius: 20px; overflow: hidden;">
                <!-- Header Card (Premium Gradient) -->
                <div style="background: linear-gradient(135deg, var(--primary-blue), #1e3a8a); padding: 40px 20px 50px; text-align: center; position: relative;">
                    <button onclick="Swal.close()" style="position: absolute; top: 15px; left: 15px; background: rgba(255,255,255,0.2); border: none; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; z-index: 10;" onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='scale(1.1)';" onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='scale(1)';"><i class="fa-solid fa-chevron-left" style="margin-right:2px;"></i></button>
                    <div style="width: 75px; height: 75px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; color: var(--primary-blue); font-size: 2.2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                        <i class="fa-solid fa-receipt"></i>
                    </div>
                    <h3 style="color: white; font-size: 1.6rem; font-weight: 800; margin: 0 0 5px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">Detail Transaksi</h3>
                    <p style="color: rgba(255,255,255,0.85); font-size: 0.95rem; margin: 0;">${a}</p>
                    
                    <div style="position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%);">
                        <span style="display:inline-block; font-size:0.9rem; font-weight:800; color: white; background: ${n?`var(--primary-green)`:t.status===`PENDING`?`#f59e0b`:`#ef4444`}; padding:8px 24px; border-radius:30px; letter-spacing:1px; box-shadow: 0 6px 15px rgba(0,0,0,0.15); border: 3px solid white;">
                            ${t.status}
                        </span>
                    </div>
                </div>
                
                <!-- Main Content Body -->
                <div style="padding: 45px 25px 25px;">
                    <!-- Total Pembayaran -->
                    <div style="background: white; border-radius: 18px; padding: 25px; margin-bottom: 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.02);">
                        <p style="color: #64748b; font-size: 0.95rem; font-weight: 600; margin: 0 0 5px; text-transform: uppercase; letter-spacing: 0.5px;">Total Pembayaran</p>
                        <h2 style="color: var(--primary-green); font-size: 2.4rem; font-weight: 900; margin: 0; letter-spacing: -0.5px;">${i}</h2>
                    </div>

                    <!-- ID & Layanan Card -->
                    <div style="background: white; border-radius: 18px; padding: 22px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.02);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 15px;">
                            <span style="color:#64748b; font-size:0.95rem; font-weight: 600;"><i class="fa-solid fa-hashtag" style="opacity:0.6; margin-right:8px;"></i> ID Transaksi</span>
                            <div style="display:flex; align-items:center; gap:10px;">
                                <span style="font-family:monospace; font-weight:800; color:var(--primary-blue); font-size:1.05rem; letter-spacing:0.5px;">${t.transactionId}</span>
                                <button onclick="window.copyTxId(this, '${t.transactionId}', event)" style="background:var(--primary-green); color:white; border:none; border-radius:8px; width:30px; height:30px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow: 0 4px 10px rgba(22, 163, 74, 0.3); transition: all 0.2s;" title="Salin ID" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><i class="fa-regular fa-copy" style="font-size:0.9rem;"></i></button>
                            </div>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <span style="color:#64748b; font-size:0.95rem; font-weight: 600;"><i class="fa-solid fa-layer-group" style="opacity:0.6; margin-right:8px;"></i> Layanan</span>
                            <span style="font-weight:800; color:#1e293b; font-size:1.15rem; line-height: 1.4; padding-left: 26px;">${t.itemName}</span>
                        </div>
                    </div>

                    <!-- Informasi Pemesanan -->
                    <div style="background: white; border-radius: 18px; padding: 22px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.02); margin-bottom: 25px;">
                        <h4 style="color:#1e293b; font-size:1.1rem; margin-top:0; margin-bottom:20px; display:flex; align-items:center; gap:10px; font-weight: 800; border-bottom: 2px solid #f8fafc; padding-bottom: 15px;">
                            <i class="fa-solid fa-list-check" style="color:var(--primary-blue);"></i> Rincian Pesanan
                        </h4>
                        <div style="display: flex; flex-direction: column;">
                            ${s}
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div style="margin-top: 20px;">
                        ${o}
                        
        <button onclick="Swal.close(); setTimeout(()=>{ window.generateEtiketPDF(window._lastBookingData); }, 300)" 
            style="background:linear-gradient(135deg, var(--primary-blue), #1e3a8a); border:none; color:white; font-size:1rem; padding:16px 20px; border-radius:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; font-weight:800; width:100%; margin-top:12px; box-shadow:0 8px 20px rgba(12,74,110,0.3); transition:all 0.3s;"
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 25px rgba(12,74,110,0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 20px rgba(12,74,110,0.3)';">
            <i class="fa-solid fa-file-pdf" style="font-size:1.2rem;"></i> Download E-Tiket (PDF)
        </button>
    
                    </div>
                </div>
            </div>
        `})},a.forEach(e=>{if(e.status===`PENDING`){let t=e.createdAt?new Date(e.createdAt).getTime():0,n=Date.now()-t;(e.paymentMethod||``).toLowerCase()===`va`?t>0&&n>864e5&&(e.status=`KADALUARSA`):t>0&&n>36e5&&(e.status=`KADALUARSA`)}let t=e.status===`PAID`,n=t?`#10b981`:e.status===`PENDING`?`#f59e0b`:`#ef4444`,r=t?`rgba(16, 185, 129, 0.1)`:e.status===`PENDING`?`rgba(245, 158, 11, 0.1)`:`rgba(239, 68, 68, 0.1)`,i=e.type===`order`?`fa-box`:`fa-car`,a=parseInt((e.itemPrice||``).toString().replace(/\D/g,``)),s=!isNaN(a)&&a>0?`Rp `+a.toLocaleString(`id-ID`):`-`,c=e.createdAt?new Date(e.createdAt).toLocaleDateString(`id-ID`,{day:`numeric`,month:`short`,year:`numeric`}):`-`,l=encodeURIComponent(JSON.stringify(e));o+=`
                <div onclick="window.showTransactionDetail('${l}')" style="background:white; border-radius:16px; padding:16px; border:1px solid #e2e8f0; position:relative; box-shadow:0 4px 10px rgba(0,0,0,0.02); cursor:pointer; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 12px 25px rgba(0,0,0,0.06)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 10px rgba(0,0,0,0.02)';">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; padding-bottom:12px; border-bottom:1px dashed #e2e8f0;">
                        <span style="font-size:0.75rem; color:#64748b; font-weight:600; font-family:monospace; display:flex; align-items:center; gap:6px;">
                            <i class="fa-solid fa-hashtag" style="opacity:0.6;"></i>${e.transactionId}
                            <button onclick="window.copyTxId(this, '${e.transactionId}', event)" style="background:var(--primary-blue); color:white; border:none; border-radius:4px; width:20px; height:20px; display:flex; align-items:center; justify-content:center; cursor:pointer;" title="Salin ID"><i class="fa-regular fa-copy" style="font-size:0.65rem;"></i></button>
                        </span>
                        <span style="font-size:0.75rem; font-weight:700; color:${n}; background:${r}; padding:4px 10px; border-radius:12px; letter-spacing:0.5px;">
                            ${e.status}
                        </span>
                    </div>
                    <div style="display:flex; gap:12px; margin-bottom:12px;">
                        <div style="width:45px; height:45px; border-radius:12px; background:#f8fafc; border:1px solid #f1f5f9; color:var(--primary-blue); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:1.2rem;">
                            <i class="fa-solid ${i}"></i>
                        </div>
                        <div style="flex:1;">
                            <h4 style="margin:0 0 5px; font-size:1rem; color:#1e293b; font-weight:700; line-height:1.3;">${e.itemName}</h4>
                            <div style="font-size:0.8rem; color:#64748b; display:flex; align-items:center; gap:6px;">
                                <i class="fa-regular fa-calendar" style="font-size:0.9em; color:#94a3b8;"></i> Dipesan: ${c}
                            </div>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; margin-top:12px; padding-top:12px; border-top:1px dashed #f1f5f9;">
                        <div style="font-weight:800; color:var(--primary-blue); font-size:1.05rem;">${s}</div>
                        <div style="margin-left:auto; font-size:0.85rem; color:#0ea5e9; font-weight:600; background:#f0f9ff; padding:6px 12px; border-radius:20px;">
                            Lihat Detail <i class="fa-solid fa-arrow-right" style="margin-left:4px; font-size:0.85em;"></i>
                        </div>
                    </div>
                </div>
            `}),o+=`</div></div>`,n.innerHTML=o}catch(e){console.error(`Riwayat Error:`,e),n.innerHTML=`
            <div style="text-align:center; padding:50px 20px; color:#ef4444; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border:1px solid #fee2e2;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size:3.5rem; margin-bottom:15px; display:block;"></i>
                <h3 style="margin-bottom:10px; font-weight:700;">Terjadi Kesalahan</h3>
                <p style="font-size:1rem; color:#b91c1c; margin-bottom: 20px;">${e.message}</p>
                <button onclick="window.showRiwayatTransaksi(true)" style="background: white; color:#ef4444; border:2px solid #ef4444; padding:10px 25px; border-radius:10px; font-weight:bold; cursor:pointer; font-size: 1rem; transition: background 0.2s;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='white'">Coba Lagi</button>
            </div>
        `}}},window.checkAuthAndPrompt=()=>localStorage.getItem(`auth_token`)?!0:(typeof window.closeTourModal==`function`&&window.closeTourModal(),typeof window.closeSubPackageModal==`function`&&window.closeSubPackageModal(),window.openAuthModal(),!1),window.submitAuth=async t=>{t.preventDefault();let n=window._authMode===`login`,r=document.getElementById(`auth-email`).value,i=document.getElementById(`auth-password`).value,a=document.getElementById(`auth-name`).value,o=document.getElementById(`btn-auth-submit`);o.disabled=!0,o.innerHTML=`Memproses...`;try{let t=n?`/api/auth/login`:`/api/auth/register`,o={email:r,password:i};n||(o.name=a);let s=await fetch(`${e}${t}`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(o)}),c=await s.json();if(!s.ok)throw Error(c.error||`Terjadi kesalahan`);localStorage.setItem(`auth_token`,c.token),localStorage.setItem(`auth_user`,JSON.stringify(c.user||c.admin)),window.closeAuthModal(),window.checkAuthUI(),Swal.fire({icon:`success`,title:n?`Berhasil Login`:`Berhasil Mendaftar`,toast:!0,position:`top-end`,showConfirmButton:!1,timer:2e3})}catch(e){Swal.fire({icon:`error`,title:`Gagal`,text:e.message,confirmButtonColor:`#1d4ed8`})}finally{o.disabled=!1,o.innerHTML=n?`Login`:`Daftar`}},window.shareItem=(e,t,n)=>{let r=window.location.origin+window.location.pathname+`?item=`+e,i=`Halo! 👋\n\nSaya menemukan penawaran menarik dari *Travel Lombok Airport* nih:\n\n📌 *${t}*\n💰 *${n}*\n\nYuk, cek detail lengkapnya dan booking sekarang melalui link di bawah ini:\n📍 ${r}`,a=`Ada rencana liburan ke Lombok? 🌴\n\nCek penawaran seru dari Travel Lombok Airport!\n📌 ${t}\n💰 ${n}\n\nLangsung booking dan lihat detailnya di sini 👇\n📍 ${r}`,o=`https://wa.me/?text=${encodeURIComponent(i)}`,s=`https://twitter.com/intent/tweet?text=${encodeURIComponent(a)}`,c=`https://threads.net/intent/post?text=${encodeURIComponent(a)}`;Swal.fire({customClass:{container:`swal-high-z`},title:`<span style="font-size:1.1rem;font-weight:800;">Bagikan Penawaran</span>`,html:`
            <div style="display:flex; flex-direction:column; gap:12px; margin-top:10px;">
                <a href="${o}" target="_blank" class="btn" style="background:#25D366; color:white; border-radius:12px; padding:12px; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:10px; font-weight:700;">
                    <i class="fa-brands fa-whatsapp" style="font-size:1.2rem;"></i> Bagikan ke WhatsApp
                </a>
                <a href="${s}" target="_blank" class="btn" style="background:#1DA1F2; color:white; border-radius:12px; padding:12px; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:10px; font-weight:700;">
                    <i class="fa-brands fa-twitter" style="font-size:1.2rem;"></i> Bagikan ke Twitter
                </a>
                <a href="${c}" target="_blank" class="btn" style="background:#000000; color:white; border-radius:12px; padding:12px; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:10px; font-weight:700;">
                    <i class="fa-brands fa-threads" style="font-size:1.2rem;"></i> Bagikan ke Threads
                </a>
                <button onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(a)}')); Swal.fire({customClass:{container:'swal-high-z'},icon:'success',title:'Disalin!',toast:true,position:'top-end',showConfirmButton:false,timer:2000});" class="btn" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; border-radius:12px; padding:12px; display:flex; align-items:center; justify-content:center; gap:10px; font-weight:700;">
                    <i class="fa-solid fa-copy" style="font-size:1.2rem;"></i> Salin Link & Teks
                </button>
            </div>
        `,showConfirmButton:!1,showCloseButton:!0})};var h=[];try{let e=localStorage.getItem(`aiChatHistory`);e&&(h=JSON.parse(e))}catch(e){console.error(`Failed to load chat history`,e)}window.renderChatHistory=()=>{if(h.length===0)return;let e=document.getElementById(`chat-messages`);e&&(e.innerHTML=``,h.forEach(t=>{if(t.role===`user`)e.insertAdjacentHTML(`beforeend`,`
                <div class="message user-message">
                    ${t.parts[0].text}
                </div>
            `);else{let n=g(t.parts[0].text);e.insertAdjacentHTML(`beforeend`,`
                <div class="message ai-message">
                    ${n}
                </div>
            `)}}),e.insertAdjacentHTML(`afterbegin`,`
        <div class="message ai-message">
            Halo Kak! 👋 Saya Lombok AI, asisten virtual Travel Lombok Airport. Ada yang bisa saya bantu untuk rencana perjalanan Anda?
        </div>
    `),e.scrollTop=e.scrollHeight,window.checkGuestLimit())},document.addEventListener(`DOMContentLoaded`,()=>{document.getElementById(`chat-messages`)&&window.renderChatHistory()}),window.clearChatHistory=()=>{if(!confirm(`Hapus semua riwayat percakapan dengan Lombok AI?`))return;h=[],localStorage.removeItem(`aiChatHistory`);let e=document.getElementById(`chat-messages`);e&&(e.innerHTML=`
            <div class="message ai-message">
                Halo Kak! 👋 Saya Lombok AI, asisten virtual Travel Lombok Airport. Ada yang bisa saya bantu untuk rencana perjalanan Anda?
            </div>
            <div id="ai-quick-replies" style="display: flex; flex-direction: column; gap: 8px; margin: 10px 15px;">
                <button onclick="window.sendDeterministicReply('Saya mengalami kendala tidak bisa login, padahal sudah mereset kata sandi.', 'Mohon maaf atas ketidaknyamanan yang Anda alami. 🙏<br><br>Sehubungan dengan peningkatan infrastruktur keamanan data Travel Lombok Airport, sistem otentikasi kami saat ini sedang dalam masa transisi. Hal tersebut menyebabkan fitur **Masuk (Login)** maupun **Pengaturan Ulang Kata Sandi (Reset Password)** belum dapat beroperasi secara optimal untuk beberapa akun.<br><br>Sebagai solusi alternatif yang cepat dan aman, **kami merekomendasikan Anda untuk melakukan Registrasi ulang menggunakan alamat email yang sama**.<br><br>Anda tidak perlu khawatir, seluruh riwayat dan data akun Anda akan secara otomatis tersinkronisasi kembali dengan sistem keamanan kami yang terbaru sesaat setelah pendaftaran berhasil dilakukan.<br><br>Terima kasih atas pengertian serta kepercayaan Anda dalam menggunakan layanan kami.')" style="text-align: left; background: white; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 10px 14px; border-radius: 12px; font-size: 0.85rem; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.05); transition: all 0.2s;">
                    <i class="fa-solid fa-circle-question" style="margin-right: 6px;"></i> Bantuan Akses Akun (Gagal Login / Reset Sandi)
                </button>
            </div>
        `);let t=document.getElementById(`guest-limit-banner`);t&&(t.style.display=`none`);let n=document.getElementById(`chat-input`),r=document.getElementById(`send-chat-btn`);n&&(n.disabled=!1,n.placeholder=`Tanya rekomendasi paket...`),r&&(r.disabled=!1)},window.toggleChat=async()=>{let t=document.getElementById(`ai-chat-window`);if(t.classList.toggle(`hidden`),!t.classList.contains(`hidden`)){let t=document.getElementById(`chat-input`),n=document.getElementById(`send-chat-btn`),r=document.getElementById(`mic-chat-btn`),i=document.getElementById(`chat-messages`);try{let a=await fetch(`${e}/settings`);if(a.ok){if((await a.json()).aiMaintenanceMode){t&&(t.disabled=!0,t.placeholder=`AI sedang dalam perbaikan...`),n&&(n.disabled=!0),r&&(r.disabled=!0),i&&!i.innerHTML.includes(`pemeliharaan`)&&(i.innerHTML+=`
                            <div class="message ai-message" style="background-color: #fef3c7; color: #92400e; border: 1px solid #f59e0b;">
                                <i class="fa-solid fa-person-digging"></i> Mohon maaf, fitur Lombok AI sedang dalam pemeliharaan dan peningkatan sistem. Silakan hubungi kami via WhatsApp sementara waktu.
                            </div>
                        `,i.scrollTop=i.scrollHeight);return}t&&t.placeholder===`AI sedang dalam perbaikan...`&&(t.disabled=!1,t.placeholder=`Tanya rekomendasi paket...`,n&&(n.disabled=!1),r&&(r.disabled=!1))}}catch(e){console.error(`Failed to check AI settings`,e)}document.getElementById(`chat-input`).focus(),window.checkGuestLimit(),i&&(i.scrollTop=i.scrollHeight)}},window.handleChatKeyPress=e=>{e.key===`Enter`&&window.sendChatMessage()};function g(e,t=!1){let n=e;if(n=n.replace(/\*\*(.*?)\*\*/g,`<strong>$1</strong>`),n=n.replace(/\[(.*?)\]\((.*?)\)/g,`<a href="$2" target="_blank">$1</a>`),n=n.replace(/\n/g,`<br>`),!t){let t=encodeURIComponent(e).replace(/'/g,`\\'`);n+=`
        <div style="text-align: right; margin-top: 8px;">
            <button onclick="window.copyAiMessage(this, decodeURIComponent('${t}'))" class="copy-ai-msg-btn" title="Salin Pesan" style="background: rgba(255,255,255,0.5); border: 1px solid #cbd5e1; border-radius: 6px; color: #475569; cursor: pointer; font-size: 0.75rem; font-weight: 600; padding: 4px 8px; transition: all 0.2s; display: inline-flex; align-items: center; gap: 5px;">
                <i class="fa-regular fa-copy"></i> Salin
            </button>
        </div>`}return n}window._simulateTyping=(e,t,n)=>{let r=document.getElementById(e);if(!r)return;let i=0,a=``;function o(){if(i<t.length){let e=t.substr(i,2);a+=e,i+=2,r.innerHTML=g(a,!0)+`<span class="cs-typewriter-cursor">|</span>`;let n=document.getElementById(`chat-messages`);n&&(n.scrollTop=n.scrollHeight),setTimeout(o,10)}else{r.innerHTML=g(t,!1);let e=document.getElementById(`chat-messages`);e&&(e.scrollTop=e.scrollHeight),n&&n()}}setTimeout(o,50)},window.copyAiMessage=(e,t)=>{navigator.clipboard.writeText(t).then(()=>{let t=e.innerHTML,n=e.style.cssText;e.innerHTML=`<i class="fa-solid fa-check"></i> Tersalin`,e.style.color=`#16a34a`,e.style.borderColor=`#16a34a`,e.style.background=`#dcfce7`,setTimeout(()=>{e.innerHTML=t,e.style.cssText=n},2e3)}).catch(e=>console.error(`Gagal menyalin:`,e))},window.checkGuestLimit=()=>{let e=!!localStorage.getItem(`auth_token`)||!!localStorage.getItem(`auth_user`),t=document.getElementById(`chat-input`),n=document.getElementById(`send-chat-btn`),r=document.getElementById(`guest-limit-banner`);return!e&&h.filter(e=>e.role===`user`).length>=3?(t&&(t.disabled=!0,t.placeholder=`Login untuk bertanya lebih banyak...`),n&&(n.disabled=!0),r&&(r.style.display=`block`),!0):(r&&(r.style.display=`none`),t&&(t.disabled=!1,t.placeholder=`Tanya rekomendasi paket...`),n&&(n.disabled=!1),!1)};var _=null,v=!1;window.toggleVoiceInput=()=>{let e=document.getElementById(`mic-chat-btn`),t=document.getElementById(`chat-input`);if(v){_&&_.stop();return}let n=window.SpeechRecognition||window.webkitSpeechRecognition;if(!n){alert(`Browser Anda belum mendukung fitur Voice Command. Silakan gunakan Google Chrome versi terbaru.`);return}_=new n,_.lang=`id-ID`,_.interimResults=!1,_.maxAlternatives=1,_.onstart=()=>{if(v=!0,!document.getElementById(`mic-pulse-css`)){let e=document.createElement(`style`);e.id=`mic-pulse-css`,e.innerHTML=`@keyframes pulse-mic { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }`,document.head.appendChild(e)}e&&(e.style.color=`#ef4444`,e.style.animation=`pulse-mic 1s infinite`),t&&(t.placeholder=`Mendengarkan suara Anda...`)},_.onresult=e=>{let n=e.results[0][0].transcript;t&&(t.value=n),setTimeout(()=>window.sendChatMessage(),300)},_.onerror=n=>{console.error(`Speech recognition error`,n.error),v=!1,e&&(e.style.color=`#64748b`,e.style.animation=`none`),t&&(t.placeholder=`Tanya rekomendasi paket...`);let r=document.getElementById(`chat-messages`);r&&(r.insertAdjacentHTML(`beforeend`,`
                <div class="message ai-message" style="background-color: #fee2e2; color: #991b1b; border: 1px solid #f87171;">
                    <i class="fa-solid fa-triangle-exclamation"></i> Gagal mendeteksi mikrofon. Browser Anda menolak akses. Pastikan Anda mengklik "Allow/Izinkan" pada setelan mikrofon di browser.
                </div>
            `),r.scrollTop=r.scrollHeight)},_.onend=()=>{v=!1,e&&(e.style.color=`#64748b`,e.style.animation=`none`),t&&(t.placeholder=`Tanya rekomendasi paket...`)},_.start()},window.sendDeterministicReply=(e,t)=>{let n=document.getElementById(`ai-quick-replies`);n&&n.remove();let r=document.getElementById(`chat-messages`);r.insertAdjacentHTML(`beforeend`,`
        <div class="message user-message">
            ${e}
        </div>
    `),h.push({role:`user`,parts:[{text:e}]});let i=`typing-`+Date.now();r.insertAdjacentHTML(`beforeend`,`
        <div id="${i}" class="typing-indicator">
            <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
    `),r.scrollTop=r.scrollHeight,setTimeout(()=>{let e=document.getElementById(i);e&&e.remove();let n=`det-msg-`+Date.now();r.insertAdjacentHTML(`beforeend`,`
            <div id="${n}" class="message ai-message"></div>
        `),h.push({role:`model`,parts:[{text:t}]}),localStorage.setItem(`aiChatHistory`,JSON.stringify(h)),window._simulateTyping(n,t)},800)},window.sendChatMessage=async(t=null,n=null)=>{if(window.checkGuestLimit())return;let r=document.getElementById(`chat-input`),i=t||r.value.trim();if(!i)return;t||(r.value=``);let a=document.getElementById(`chat-messages`);n&&n.remove(),t||a.insertAdjacentHTML(`beforeend`,`
            <div class="message user-message">
                ${i}
            </div>
        `);let o=`typing-`+Date.now();a.insertAdjacentHTML(`beforeend`,`
        <div id="${o}" class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `),a.scrollTop=a.scrollHeight;try{let t=localStorage.getItem(`visitor_session_id`)||`guest`,n=JSON.parse(localStorage.getItem(`auth_user`)||`null`),r=localStorage.getItem(`auth_token`);n&&n.email&&(t=n.email);let s=null;try{let e=localStorage.getItem(`prayerData`);e&&(s=JSON.parse(e))}catch{}let c={"Content-Type":`application/json`};r&&(c.Authorization=`Bearer ${r}`);let l=await fetch(`${e}/ai/chat`,{method:`POST`,headers:c,body:JSON.stringify({message:i,history:h,sessionId:t,userTimeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,prayerData:s})}),u=document.getElementById(o);if(u&&u.remove(),l.ok){if(l.headers.get(`content-type`)?.includes(`text/event-stream`)){let e=`ai-msg-`+Date.now();a.insertAdjacentHTML(`beforeend`,`
                    <div id="${e}" class="message ai-message"></div>
                `);let t=document.getElementById(e),n=l.body.getReader(),r=new TextDecoder(`utf-8`),o=``,s=``;for(;;){let{done:e,value:c}=await n.read();if(e)break;s+=r.decode(c,{stream:!0});let l=s.split(`
`);s=l.pop();for(let e of l)if(e.startsWith(`data: `)){let n=e.replace(`data: `,``).trim();if(n===`[DONE]`){t.innerHTML=g(o,!1),h.push({role:`user`,parts:[{text:i}]}),h.push({role:`model`,parts:[{text:o}]}),localStorage.setItem(`aiChatHistory`,JSON.stringify(h)),window.checkGuestLimit();break}try{let e=JSON.parse(n);if(e.error)throw Error(e.error);e.text&&(o+=e.text,t.innerHTML=g(o,!0)+`<span class="cs-typewriter-cursor">|</span>`,a.scrollTop=a.scrollHeight)}catch(e){console.error(`Error parsing SSE data`,e)}}}}else{let e=await l.json();if(e.success){h.push({role:`user`,parts:[{text:i}]}),h.push({role:`model`,parts:[{text:e.reply}]}),localStorage.setItem(`aiChatHistory`,JSON.stringify(h));let t=`ai-msg-`+Date.now();a.insertAdjacentHTML(`beforeend`,`
                        <div id="${t}" class="message ai-message"></div>
                    `),window._simulateTyping(t,e.reply),window.checkGuestLimit()}else throw Error(e.message)}}else throw Error(`Gagal menghubungi AI`)}catch(e){console.error(`Chat Error:`,e);let t=document.getElementById(o);t&&t.remove();let n=encodeURIComponent(i).replace(/'/g,`\\'`);a.insertAdjacentHTML(`beforeend`,`
            <div class="message ai-message" style="color: #ef4444; background: #fee2e2; border: 1px solid #fca5a5;">
                <div style="margin-bottom: 8px;"><i class="fa-solid fa-triangle-exclamation"></i> Maaf, layanan AI sedang sibuk atau ada gangguan jaringan.</div>
                <button onclick="window.sendChatMessage(decodeURIComponent('${n}'), this.parentElement)" style="background: white; color: #ef4444; border: 1px solid #ef4444; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: bold; transition: all 0.2s;"><i class="fa-solid fa-rotate-right"></i> Kirim Ulang</button>
            </div>
        `)}a.scrollTop=a.scrollHeight},window.requestPrayerLocation=(e=!1)=>{if(!e&&localStorage.getItem(`prayerData`)){renderPrayerTimes(JSON.parse(localStorage.getItem(`prayerData`)));return}navigator.geolocation?(document.getElementById(`location-prompt`)&&(document.getElementById(`location-prompt`).style.display=`none`),document.getElementById(`prayer-loading`)&&(document.getElementById(`prayer-loading`).style.display=`block`),document.getElementById(`prayer-content`)&&(document.getElementById(`prayer-content`).style.display=`none`),navigator.geolocation.getCurrentPosition(async e=>{try{let t=e.coords.latitude,n=e.coords.longitude,r=await(await fetch(`https://api.aladhan.com/v1/timings?latitude=${t}&longitude=${n}&method=11&tune=3,3,3,3,3,3,3,3,3`)).json();if(r&&r.code===200){let e=r.data.timings,i=`Lokasi Anda`;try{let e=await(await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${t}&lon=${n}`)).json();i=e.address.city||e.address.town||e.address.village||e.address.state||i}catch(e){console.error(e)}let a={city:i,date:r.data.date.readable,timings:{Subuh:e.Fajr,Dzuhur:e.Dhuhr,Ashar:e.Asr,Maghrib:e.Maghrib,Isya:e.Isha},timestamp:Date.now()};localStorage.setItem(`prayerData`,JSON.stringify(a)),renderPrayerTimes(a)}else throw Error(`Gagal memuat jadwal sholat`)}catch(e){console.error(`Error fetching prayer times:`,e),alert(`Gagal mengambil jadwal sholat. Silakan coba lagi.`),document.getElementById(`location-prompt`)&&(document.getElementById(`location-prompt`).style.display=`block`),document.getElementById(`prayer-loading`)&&(document.getElementById(`prayer-loading`).style.display=`none`)}},e=>{console.error(`Geolocation error:`,e),document.getElementById(`location-prompt`)&&(document.getElementById(`location-prompt`).style.display=`block`),document.getElementById(`prayer-loading`)&&(document.getElementById(`prayer-loading`).style.display=`none`)})):alert(`Browser Anda tidak mendukung deteksi lokasi.`)},window.renderPrayerTimes=e=>{if(!document.getElementById(`prayer-content`))return;document.getElementById(`location-prompt`).style.display=`none`,document.getElementById(`prayer-loading`).style.display=`none`,document.getElementById(`prayer-content`).style.display=`block`,document.getElementById(`prayer-city`).innerHTML=`<i class="fa-solid fa-location-dot"></i> `+e.city,document.getElementById(`prayer-date`).textContent=e.date;let t=document.getElementById(`prayer-cards`);t.innerHTML=``;let n=`-`,r=null,i=null,a=new Date,o=a.getHours()*60+a.getMinutes(),s=0;for(let[a,c]of Object.entries(e.timings)){let[e,l]=c.split(`:`).map(Number),u=e*60+l,d=!1;!r&&o<u&&(d=!0,n=a,r=new Date,r.setHours(e,l,0,0),i=new Date,s===0?(i.setDate(i.getDate()-1),i.setHours(19,30,0,0)):i.setHours(Math.floor(s/60),s%60,0,0)),s=u;let f=``;f=a.toLowerCase()===`subuh`?`<i class="fa-solid fa-cloud-sun" style="font-size: 1.5rem;"></i>`:a.toLowerCase()===`dzuhur`?`<i class="fa-solid fa-sun" style="font-size: 1.5rem;"></i>`:a.toLowerCase()===`ashar`?`<i class="fa-solid fa-cloud" style="font-size: 1.5rem;"></i>`:a.toLowerCase()===`maghrib`?`<i class="fa-solid fa-moon" style="font-size: 1.5rem;"></i>`:a.toLowerCase()===`isya`?`<i class="fa-solid fa-star-and-crescent" style="font-size: 1.5rem;"></i>`:`<i class="fa-solid fa-clock" style="font-size: 1.5rem;"></i>`,t.innerHTML+=`
            <div class="prayer-card" style="background: rgba(255,255,255,0.05); padding: 25px 15px; border-radius: 20px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 4px; border: 1px solid ${d?`rgba(52,211,153,0.6)`:`rgba(255,255,255,0.08)`}; transition: transform 0.3s, background 0.3s; transform: scale(${d?`1.05`:`1`}); background: ${d?`linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.15) 100%)`:`rgba(255,255,255,0.03)`}; box-shadow: ${d?`0 15px 30px -10px rgba(16,185,129,0.3)`:`none`}; min-width: 120px; flex-shrink: 0; scroll-snap-align: center; position: relative; overflow: hidden;">
                ${d?`<div style="position: absolute; top: -10px; right: -10px; width: 50px; height: 50px; background: rgba(52,211,153,0.15); border-radius: 50%; filter: blur(10px);"></div>`:``}
                <div style="color: ${d?`#34d399`:`#64748b`}; margin-bottom: 5px;">${f}</div>
                <div style="font-size: 0.85rem; color: ${d?`#34d399`:`#94a3b8`}; font-weight: ${d?`800`:`600`}; text-transform: uppercase; letter-spacing: 1.5px;">${a}</div>
                <div style="font-size: 1.8rem; font-weight: 800; color: ${d?`white`:`#e2e8f0`}; font-family: 'Inter', monospace; margin-top: 2px;">${c}</div>
            </div>
        `}if(r){document.getElementById(`next-prayer-name`).textContent=n,window.prayerInterval&&clearInterval(window.prayerInterval);let e=()=>{let e=new Date,t=r-e;if(i){let t=r-i,n=(e-i)/t*100;n<0&&(n=0),n>100&&(n=100);let a=document.getElementById(`prayer-progress`);a&&(a.style.width=n+`%`)}if(t<=0)clearInterval(window.prayerInterval),document.getElementById(`next-prayer-countdown`).textContent=`00:00:00`,setTimeout(()=>window.requestPrayerLocation(!0),6e4);else{let e=Math.floor(t%864e5/36e5),n=Math.floor(t%36e5/6e4),r=Math.floor(t%6e4/1e3);document.getElementById(`next-prayer-countdown`).textContent=`${e.toString().padStart(2,`0`)}:${n.toString().padStart(2,`0`)}:${r.toString().padStart(2,`0`)}`}};e(),window.prayerInterval=setInterval(e,1e3)}else document.getElementById(`next-prayer-name`).textContent=`Besok`,document.getElementById(`next-prayer-countdown`).textContent=`--:--:--`},document.addEventListener(`DOMContentLoaded`,()=>{let e=window.location.pathname;(e.includes(`jadwal-sholat`)||e===`/`||e===`/index.html`)&&(localStorage.getItem(`prayerData`)?e.includes(`jadwal-sholat`)&&window.requestPrayerLocation(!1):window.requestPrayerLocation(!1))});