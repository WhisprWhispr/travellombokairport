import"./modulepreload-polyfill-P2Xu9kJm.js";import"./pwa-so6uG9fO.js";!window.location.pathname.includes(`admin`)&&!window.location.pathname.includes(`driver`)&&(document.addEventListener(`contextmenu`,e=>e.preventDefault()),document.addEventListener(`keydown`,e=>{e.ctrlKey&&(e.key===`c`||e.key===`u`||e.key===`s`||e.key===`p`)&&e.preventDefault(),e.key===`F12`&&e.preventDefault()}));var e=(window.location.hostname===`localhost`||window.location.hostname,`/api`);window.forcePaymentSuccess=async(t,n)=>{let r=n.innerHTML;n.disabled=!0,n.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> MENGECEK...`;let i=document.getElementById(`manual-check-msg`);i&&(i.innerHTML=``);try{let n=await(await fetch(`${e}/payment/status/${t}`)).json();n.success&&[`PAID`,`SUCCESS`,`SETTLEMENT`,`COMPLETED`].includes(n.data.status?.toUpperCase())?(window.activePollInterval&&clearInterval(window.activePollInterval),window.simulateQrisSuccess(!1,t)):i&&(i.innerHTML=`<i class="fa-solid fa-clock"></i> Sistem masih memproses/menunggu pembayaran Anda. Jika Anda sudah membayar, harap tunggu beberapa saat atau periksa di <a href="/riwayat.html" style="color: inherit; text-decoration: underline;">Riwayat Transaksi</a>.`)}catch{i&&(i.innerHTML=`<i class="fa-solid fa-triangle-exclamation"></i> Terjadi kesalahan jaringan. Gagal mengecek.`)}finally{n.disabled=!1,n.innerHTML=r}},window.generateTicketId=e=>{let t=e;for(let e=0;e<5;e++)t+=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`.charAt(Math.floor(Math.random()*52));return t+=`0123456789`.charAt(Math.floor(Math.random()*10)),t},window.copyText=(e,t,n,r,i)=>{i&&i.stopPropagation();let a=()=>{t?(t.innerHTML=n,t.tagName===`BUTTON`&&!n.includes(`fa-check`)&&(t.style.background=`#10b981`),setTimeout(()=>{t.innerHTML=r,t.tagName===`BUTTON`&&!n.includes(`fa-check`)&&(t.style.background=``)},2e3)):Swal.fire({icon:`success`,title:`Tersalin!`,toast:!0,position:`top`,showConfirmButton:!1,timer:1500})};if(navigator.clipboard)navigator.clipboard.writeText(e).then(a).catch(e=>{console.error(`Gagal menyalin:`,e)});else{let t=document.createElement(`textarea`);t.value=e,document.body.appendChild(t),t.select();try{document.execCommand(`copy`),a()}catch(e){console.error(`Gagal menyalin:`,e)}document.body.removeChild(t)}},(async()=>{let e=window.location.pathname;if(![`/admin`,`/maintenance`,`/login`,`/register`,`/verify`,`/driver`].some(t=>e.includes(t)))try{let e=await fetch(`/api/settings`,{cache:`no-store`});if(e.ok){let t=await e.json(),n=localStorage.getItem(`adminToken`);if(t.maintenanceMode===!0&&!n){localStorage.setItem(`maintenanceMode`,`true`),window.location.replace(`/maintenance.html`);return}if(!n){localStorage.setItem(`maintenanceMode`,`false`);let e=document.getElementById(`anti-flash`);e&&e.remove(),document.body.style.opacity=`1`,document.body.style.visibility=`visible`,document.body.style.pointerEvents=`auto`}else if(n){let e=document.getElementById(`anti-flash`);e&&e.remove(),document.body.style.opacity=`1`,document.body.style.visibility=`visible`,document.body.style.pointerEvents=`auto`}if(window.globalEventSettings={eventMode:t.eventMode===!0,eventName:t.eventName||``,eventPriceIncrease:parseInt(t.eventPriceIncrease)||0},t.eventMode===!0&&t.eventPriceIncrease>0){let e=document.createElement(`div`);e.id=`event-mode-banner`,e.innerHTML=`
                    <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; text-align: center; padding: 12px 52px 12px 16px; font-size: 0.85rem; font-weight: 600; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999; box-shadow: 0 -4px 15px rgba(0,0,0,0.2); transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);">
                        <i class="fa-solid fa-fire" style="margin-right: 6px;"></i>
                        🎉 ${t.eventName?`EVENT: <strong>${t.eventName}</strong> —`:`HIGH SEASON!`} 
                        Harga Motor & Mobil naik <strong>Rp ${parseInt(t.eventPriceIncrease).toLocaleString(`id-ID`)}</strong>/unit &nbsp;|&nbsp; 
                        <i class="fa-solid fa-calendar-days"></i> Min. sewa <strong>4 Hari</strong>
                        <button onclick="window.dismissEventBanner()" class="event-banner-close-btn" title="Sembunyikan Pengumuman" aria-label="Sembunyikan Pengumuman">
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                `,document.body.firstChild?document.body.insertBefore(e,document.body.firstChild):document.body.appendChild(e);let n=document.createElement(`style`);n.id=`event-chat-fix`,n.innerHTML=`
                    #ai-chat-widget { bottom: 65px !important; }
                    @media (max-width: 480px) {
                        #ai-chat-btn { bottom: 60px !important; }
                    }
                `,document.head.appendChild(n),window.dismissEventBanner=()=>{let e=document.getElementById(`event-mode-banner`);e&&(e.style.transition=`all 0.35s cubic-bezier(0.4, 0, 0.2, 1)`,e.style.transform=`translateX(100%)`,e.style.opacity=`0`,setTimeout(()=>{e.remove(),document.getElementById(`event-chat-fix`)?.remove()},350))},sessionStorage.getItem(`eventPopupShown`)||(sessionStorage.setItem(`eventPopupShown`,`true`),setTimeout(()=>{let e=t.eventName||`High Season`;Swal.fire({title:`🔥 Info Event: ${e}`,html:`
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
                            `,showConfirmButton:!0,confirmButtonText:`<i class="fa-solid fa-check"></i> Saya Mengerti`,confirmButtonColor:`#0ea5e9`,width:`480px`,customClass:{popup:`modern-popup-radius`},backdrop:`rgba(15,23,42,0.8)`})},1e3))}}}catch{}})(),!window.location.pathname.includes(`admin`)&&!window.location.pathname.includes(`driver`)&&setTimeout(async()=>{try{let t=localStorage.getItem(`visitor_session_id`);t||(t=Math.random().toString(36).substring(2,15)+Date.now().toString(36),localStorage.setItem(`visitor_session_id`,t)),await fetch(`${e}/analytics/track`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({path:window.location.pathname+window.location.hash,userAgent:navigator.userAgent,ipHash:t,screenWidth:window.innerWidth||screen.width})})}catch(e){console.error(`Failed to track visitor:`,e)}},2e3);var t=[{id:`LvfuiPmrQtrnNHfNwm41`,title:`Beat Streat`,category:`motorcycle`,price:1e5,imageUrl:`https://pdftourl.net/images/1787666229953-31797ace-36c3-4ac6-b353-02a4256b218c.jpg`},{id:`971yg94u5mOOkP69GuIc`,title:`Vario 125cc`,category:`motorcycle`,price:125e3,imageUrl:`https://pdftourl.net/images/1787666283472-9c2b6ec1-f1df-49f1-9ecf-82b70101908b.png`},{id:`r1KZVYC4Mzflorog0wCw`,title:`Nmax`,category:`motorcycle`,price:15e4,imageUrl:`https://pdftourl.net/images/1787666283472-9c2b6ec1-f1df-49f1-9ecf-82b70101908b.png`},{id:`CFEX6jKm1VEQEnNKYb4z`,title:`Pcx`,category:`motorcycle`,price:15e4,imageUrl:`https://pdftourl.net/images/1787666336366-952b61ef-3795-4d17-814b-6485282e5954.jpg`},{id:`UklBI5U9PjfqV3W1AJTA`,title:`Adv`,category:`motorcycle`,price:2e5,imageUrl:`https://pdftourl.net/images/1787666384358-67e0ac79-97b0-42ea-9849-f1e230d8468c.jpg`},{id:`alF6YcOxeGy7X3eM2m9l`,title:`Pricelist Airport Transfer | Travel Lombok Airport`,category:`transfer`,price:18e4,imageUrl:`https://res.cloudinary.com/mvhjuh83/image/upload/v1791628291/du5jt1ufpwakypfhbplg.png`},{id:`9AePXs8BuY9TMuxhonNF`,title:`Agya`,category:`car`,price:35e4,imageUrl:`https://res.cloudinary.com/mvhjuh83/image/upload/v1790903895/ageeuoal2iijfchxg1n3.jpg`},{id:`0gbR6thtAobaUckQROR7`,title:`Honda Brio`,category:`car`,price:35e4,imageUrl:`https://res.cloudinary.com/mvhjuh83/image/upload/v1790903796/oyrisbvzwrgeeihzmjfq.webp`},{id:`1zLiCgu9QdlmrLBM9XRo`,title:`Avanza fl`,category:`car`,price:4e5,imageUrl:`https://pdftourl.net/images/1787667131060-f9567cf8-e0c6-4538-9f35-a96b4b5a3969.jpg`},{id:`l4VmQB0wOvORB7q59hhV`,title:`Xpander`,category:`car`,price:45e4,imageUrl:`https://res.cloudinary.com/mvhjuh83/image/upload/v1790898576/t3lw5gcgxyglbmga6763.jpg`},{id:`ok86nCsbfCfg2oKHxylW`,title:`New Avanza`,category:`car`,price:45e4,imageUrl:`https://res.cloudinary.com/mvhjuh83/image/upload/v1790898806/k76ir1sgjezdp6lzh204.jpg`},{id:`L3f5b2E7afIh2OXB0hJ1`,title:`Rize`,category:`car`,price:5e5,imageUrl:`https://res.cloudinary.com/mvhjuh83/image/upload/v1790898703/wgylkctz4pran9vi8xgd.jpg`},{id:`gkRMusGXBBrdiFk8x5JN`,title:`WRV`,category:`car`,price:5e5,imageUrl:`https://cdn.phototourl.com/member/2026-08-22-7a447edb-0644-48f0-8f40-e73dd097a8c0.jpg`},{id:`kNMm9aaYG5zrznB3mLvE`,title:`Innova Reborn`,category:`car`,price:6e5,imageUrl:`https://cdn.phototourl.com/member/2026-08-22-4bda7fe9-8dc4-40b9-8454-2ea59a5acb3e.jpg`},{id:`WRRBiBx73GZsxS7w8BDS`,title:`Innova Zenix`,category:`car`,price:85e4,imageUrl:`https://cdn.phototourl.com/member/2026-08-22-b241e068-085c-4fa9-8db4-632a54dba214.jpg`},{id:`qK4z4XVgCpyUckkZwtDQ`,title:`Fortuner`,category:`car`,price:13e5,imageUrl:`https://cdn.phototourl.com/member/2026-08-22-bcb238f0-9388-4982-937e-a69c11a4cf43.jpg`},{id:`wHBwON7FyLVavUciRARk`,title:`Hiace Commuter`,category:`car`,price:135e4,imageUrl:`https://res.cloudinary.com/mvhjuh83/image/upload/v1790898388/sms6mx4ccouyzbsdugb6.jpg`},{id:`Egwn14A72dGJ2gPY7OUb`,title:`Hiace Premio`,category:`car`,price:15e5,imageUrl:`https://pdftourl.net/images/1787666454044-9eb1ffae-e7da-449e-ab9f-ac00d9739dc0.jpg`},{id:`i8vdprFaGGLPY33wm5A5`,title:`Alphard`,category:`car`,price:36e5,imageUrl:`https://cdn.phototourl.com/member/2026-08-22-790c32ad-1aa6-433f-8742-32a8994e63f3.jpg`},{id:`u24hdfCU7XWQ7kZpgAI2`,title:`Paket Private Trip Lombok 3H 2M (Paket C)`,category:`package`,price:26e5,imageUrl:`https://res.cloudinary.com/mvhjuh83/image/upload/v1791629985/scuwan3qaepi5zick1e7.jpg`},{id:`yPiSiYL5WawMkbZ7zUtw`,title:`Paket C Private Honeymoon Lombok 3H 2M`,category:`honeymoon`,price:26e5,imageUrl:`https://res.cloudinary.com/mvhjuh83/image/upload/v1787939859/ilvig5w6gimlkpqirqeg.jpg`},{id:`CPme14FRrFmi1hmjkTSr`,title:`Paket B Private Honeymoon Lombok 3H 2M`,category:`honeymoon`,price:31e5,imageUrl:`https://res.cloudinary.com/mvhjuh83/image/upload/v1791630120/qjawxa9umiqrs9bijhjt.jpg`}],n=[...t];window.globalItems=n,window.getWishlist=()=>{try{return JSON.parse(localStorage.getItem(`app_wishlist`))||[]}catch{return[]}},window.isInWishlist=e=>window.getWishlist().includes(e),window.toggleWishlist=e=>{let t=window.getWishlist();t.includes(e)?t=t.filter(t=>t!==e):t.push(e),localStorage.setItem(`app_wishlist`,JSON.stringify(t));let n=document.getElementById(`btn-wishlist-${e}`);if(n){let r=n.querySelector(`i`);t.includes(e)?(r.classList.remove(`fa-regular`),r.classList.add(`fa-solid`),r.style.color=`#ef4444`):(r.classList.remove(`fa-solid`),r.classList.add(`fa-regular`),r.style.color=``)}};var r={IDR:1,USD:15500,AUD:1e4,EUR:16500,SGD:11600,MYR:3500,GBP:19700,CNY:2200,JPY:105};(async()=>{try{let t=await fetch(`${e}/rates`);if(!t.ok)return;let n=await t.json();n&&n.USD&&(r={USD:1/n.USD,AUD:1/n.AUD,EUR:1/n.EUR,SGD:1/n.SGD,MYR:1/n.MYR,GBP:1/n.GBP,CNY:1/n.CNY,JPY:1/n.JPY,SAR:1/n.SAR},document.getElementById(`packages-grid`)&&document.getElementById(`packages-grid`).innerHTML!==``&&loadItems(`paket`),document.getElementById(`cars-grid`)&&document.getElementById(`cars-grid`).innerHTML!==``&&loadItems(`mobil`))}catch(e){console.error(`Failed to fetch realtime rates:`,e)}})();var i=e=>{let t=localStorage.getItem(`app_currency`)||`IDR`,n=r[t]||1;if(!e)return t===`USD`?`$0`:t===`AUD`?`A$0`:t===`EUR`?`€0`:t===`SGD`?`S$0`:t===`MYR`?`RM0`:t===`GBP`?`£0`:t===`CNY`||t===`JPY`?`¥0`:t===`SAR`?`ر.س0`:`Rp 0`;let i=0;if(i=typeof e==`string`&&e.toLowerCase().includes(`rp`)?parseInt(e.replace(/\D/g,``),10):parseInt(e.toString().replace(/\D/g,``),10),isNaN(i))return e;let a=i/n;return t===`USD`?new Intl.NumberFormat(`en-US`,{style:`currency`,currency:`USD`,minimumFractionDigits:0}).format(a):t===`AUD`?new Intl.NumberFormat(`en-AU`,{style:`currency`,currency:`AUD`,minimumFractionDigits:0}).format(a):t===`EUR`?new Intl.NumberFormat(`de-DE`,{style:`currency`,currency:`EUR`,minimumFractionDigits:0}).format(a):t===`SGD`?new Intl.NumberFormat(`en-SG`,{style:`currency`,currency:`SGD`,minimumFractionDigits:0}).format(a):t===`MYR`?new Intl.NumberFormat(`ms-MY`,{style:`currency`,currency:`MYR`,minimumFractionDigits:0}).format(a):t===`GBP`?new Intl.NumberFormat(`en-GB`,{style:`currency`,currency:`GBP`,minimumFractionDigits:0}).format(a):t===`CNY`?new Intl.NumberFormat(`zh-CN`,{style:`currency`,currency:`CNY`,minimumFractionDigits:0}).format(a):t===`JPY`?new Intl.NumberFormat(`ja-JP`,{style:`currency`,currency:`JPY`,minimumFractionDigits:0}).format(a):t===`SAR`?new Intl.NumberFormat(`ar-SA`,{style:`currency`,currency:`SAR`,minimumFractionDigits:0}).format(a):new Intl.NumberFormat(`id-ID`,{style:`currency`,currency:`IDR`,minimumFractionDigits:0}).format(i)};window.formatPrice=i,window.getItemCategoryMeta=(e,t=``)=>{let n=typeof e==`string`?e:e?.itemName||e?.title||e?.serviceName||``,r=(n||``).toLowerCase(),i=(t||(typeof e==`object`?e?.category:``)||``).toLowerCase();if(!i&&window.globalItems&&Array.isArray(window.globalItems)){let t=window.globalItems.find(t=>t.title===n||n&&n.toLowerCase().includes((t.title||``).toLowerCase())||t.id&&typeof e==`object`&&(t.id===e?.itemId||t.id===e?.id));t&&t.category&&(i=t.category.toLowerCase())}return i===`honeymoon`||r.includes(`honeymoon`)||r.includes(`bulan madu`)?{key:`honeymoon`,label:`Paket Honeymoon`,icon:`fa-heart`,color:`#e11d48`,bgColor:`#fff1f2`,gradient:`linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)`,borderColor:`#fecdd3`,shadow:`rgba(225, 29, 72, 0.18)`}:i===`motorcycle`||i===`motor`||/(motor|motorcycle|nmax|vario|pcx|beat|scoopy|aerox|fazzio|adv|vespa|lexi|genio|mio)/i.test(r)?{key:`motor`,label:`Rental Motor`,icon:`fa-motorcycle`,color:`#d97706`,bgColor:`#fffbeb`,gradient:`linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)`,borderColor:`#fde68a`,shadow:`rgba(217, 119, 6, 0.18)`}:i===`transfer`||i===`airport`||/(transfer|airport|bandara|antar jemput|drop off|dropoff|pick up|pickup)/i.test(r)?{key:`transfer`,label:`Airport Transfer`,icon:`fa-plane-departure`,color:`#0284c7`,bgColor:`#f0f9ff`,gradient:`linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)`,borderColor:`#bae6fd`,shadow:`rgba(2, 132, 199, 0.18)`}:i!==`car`&&i!==`mobil`&&i!==`motorcycle`&&i!==`motor`&&(i===`package`||i===`tour`||/(tour|trip|paket|wisata|liburan|gili|mandalika|sembalun|sasak|snorkeling|rinjani|pantai)/i.test(r))?{key:`tour`,label:`Paket Tour Wisata`,icon:`fa-umbrella-beach`,color:`#16a34a`,bgColor:`#f0fdf4`,gradient:`linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)`,borderColor:`#bbf7d0`,shadow:`rgba(22, 163, 74, 0.18)`}:i===`car`||i===`mobil`||/(mobil|car|rental|sewa|lepas kunci|include driver|driver|supir|sopir|avanza|innova|hiace|brio|xpander|alphard|fortuner|agya|ayla|calya|sigra|raize|rocky|rize|wrv|wr-v|ertiga|xl7|terios|rush|zenix|reborn|commuter|premio|pajero|sedan|camry|veloz|stargazer|creta|brv|br-v|hrv|hr-v|crv|cr-v)/i.test(r)?{key:`mobil`,label:`Sewa Mobil`,icon:`fa-car`,color:`#2563eb`,bgColor:`#eff6ff`,gradient:`linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)`,borderColor:`#bfdbfe`,shadow:`rgba(37, 99, 235, 0.18)`}:i===`drone`||/(drone|kamera|camera|gopro|fotografi|video|dokumentasi)/i.test(r)?{key:`drone`,label:`Sewa Drone`,icon:`fa-camera`,color:`#9333ea`,bgColor:`#faf5ff`,gradient:`linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)`,borderColor:`#e9d5ff`,shadow:`rgba(147, 51, 234, 0.18)`}:/(website|web|jasa|aplikasi|software|it)/i.test(r)?{key:`it`,label:`Layanan Digital`,icon:`fa-laptop-code`,color:`#0d9488`,bgColor:`#f0fdfa`,gradient:`linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)`,borderColor:`#99f6e4`,shadow:`rgba(13, 148, 136, 0.18)`}:{key:`other`,label:`Layanan Travel`,icon:`fa-receipt`,color:`#475569`,bgColor:`#f8fafc`,gradient:`linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)`,borderColor:`#e2e8f0`,shadow:`rgba(71, 85, 105, 0.12)`}};var a=async(t=null)=>{try{let n=`${e}/items?_t=${new Date().getTime()}`;t&&(n+=`&category=${t}`);let r=await fetch(n,{cache:`no-store`});if(!r.ok)throw Error(`Network response was not ok`);return await r.json()}catch(e){return console.error(`Error fetching items:`,e),[]}},o=e=>e?e.split(`
`).map(e=>e.trim()).filter(e=>e.length>0):[],s=`🚙 SYARAT & KETENTUAN SEWA MOBIL LEPAS KUNCI 

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

TRAVEL LOMBOK AIRPORT 🚙`,c=`🚙 SYARAT & KETENTUAN SEWA MOBIL + DRIVER (12 JAM)

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

TRAVEL LOMBOK AIRPORT 🚙`,l=`🛵 SYARAT & KETENTUAN SEWA MOTOR 

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

TRAVEL LOMBOK AIRPORT 🛵`,u=e=>{if(!e)return``;let t=e.split(`
`),n=``,r=!1;return t.forEach(e=>{let t=e.trim();if(t.startsWith(`🚙 SYARAT`)||t.startsWith(`🛵 SYARAT`)||t.toUpperCase().includes(`TRAVEL LOMBOK AIRPORT`))return;t=t.replace(/\b(\d{4,})\b/g,e=>parseInt(e,10).toLocaleString(`id-ID`));let i=t.match(/^(\d+)\.\s*(.*)/);if(i){r&&=(n+=`</ul>`,!1);let e=i[1],t=i[2];n+=`
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 12px; margin-bottom: 6px; width: 100%; box-sizing: border-box;">
                <span style="display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; background: #e0f2fe; color: #0284c7; border-radius: 50%; font-size: 0.72rem; font-weight: 800; flex-shrink: 0;">${e}</span>
                <span style="font-weight: 800; font-size: 0.88rem; color: #0f172a; line-height: 1.35; word-break: break-word; overflow-wrap: break-word; flex: 1; min-width: 0;">${t}</span>
            </div>`}else if(t.startsWith(`•`)||t.startsWith(`-`)||t.startsWith(`*`)){r||=(n+=`<ul style="margin: 2px 0 6px 0; padding: 0; list-style-type: none; width: 100%; max-width: 100%; box-sizing: border-box;">`,!0);let e=t.replace(/^[•\-\*]\s*/,``);n+=`<li style="position: relative; margin-bottom: 5px; color: #475569; font-size: 0.83rem; line-height: 1.5; padding-left: 14px; word-break: break-word; overflow-wrap: break-word; box-sizing: border-box;"><span style="position: absolute; left: 0; top: 0; color: #0284c7; font-weight: 900; line-height: 1.5;">•</span>${e}</li>`}else t===``?(r&&=(n+=`</ul>`,!1),n+=`<div style="height: 4px;"></div>`):(r&&=(n+=`</ul>`,!1),t.includes(`DEPOSIT`)?n+=`<div style="display: inline-flex; align-items: center; gap: 6px; background: #fef3c7; color: #92400e; padding: 5px 12px; border-radius: 20px; font-weight: 800; font-size: 0.78rem; margin: 6px 0; border: 1px solid #fde68a; max-width: 100%; box-sizing: border-box; word-break: break-word;"><i class="fa-solid fa-shield-halved" style="flex-shrink: 0;"></i> <span>${t}</span></div>`:n+=`<div style="color: #475569; font-size: 0.83rem; margin-bottom: 4px; padding-left: 14px; line-height: 1.5; word-break: break-word; overflow-wrap: break-word; box-sizing: border-box;">${t}</div>`)}),r&&(n+=`</ul>`),n};window.closeGalleryModal=()=>{document.getElementById(`gallery-modal`).classList.remove(`active`)};var d=()=>{document.getElementById(`video-modal`)||document.body.insertAdjacentHTML(`beforeend`,`
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
    `)};window.openVideoModal=e=>{d();let t=document.getElementById(`video-modal`),n=document.getElementById(`video-modal-content`),r=e;try{let t=new URL(e);if(t.hostname.includes(`instagram.com`)){let e=t.pathname.split(`/`).filter(e=>e);e.length>=2&&(e[0]===`p`||e[0]===`reel`)&&(r=`https://www.instagram.com/p/${e[1]}/embed`)}else if(t.hostname.includes(`tiktok.com`)){let e=t.pathname.split(`/`).filter(e=>e);e.includes(`video`)&&(r=`https://www.tiktok.com/embed/v2/${e[e.indexOf(`video`)+1]}`)}else if(t.hostname.includes(`facebook.com`)&&t.pathname.includes(`/watch`))r=`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(e)}&show_text=0`;else if(t.hostname.includes(`streamable.com`)){let e=t.pathname.replace(`/e/`,``).replace(`/`,``);e&&(r=`https://streamable.com/e/${e}?autoplay=1`)}else if(t.hostname.includes(`drive.google.com`))r=e.replace(`/view`,`/preview`);else if(t.hostname.includes(`youtube.com`)&&e.includes(`watch?v=`)){let e=t.searchParams.get(`v`);e&&(r=`https://www.youtube.com/embed/${e}?autoplay=1`)}}catch{}n.innerHTML=`<iframe width="100%" height="100%" src="${r}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="background: #000;"></iframe>`;let i=document.getElementById(`video-modal-fallback-link`);i&&(i.href=e),t.style.display=`flex`},window.closeVideoModal=()=>{let e=document.getElementById(`video-modal`);e&&(e.style.display=`none`,document.getElementById(`video-modal-content`).innerHTML=``)},window.openCarChoiceModal=e=>{let t=n.find(t=>t.id===e);if(!t)return;let r=document.getElementById(`car-choice-modal`),a=document.getElementById(`car-choice-title`),o=document.getElementById(`car-choice-subtitle`),s=document.getElementById(`car-choice-body`);if(!r||!s)return;a&&(a.textContent=`Pilih Layanan: ${t.title}`),o&&(o.textContent=`Tersedia opsi Lepas Kunci (Setir Sendiri) atau Include Driver (Dengan Supir & BBM)`);let c=Number(t.price)||0,l=t.priceWithDriver&&Number(t.priceWithDriver)>0?Number(t.priceWithDriver):c>0?c+2e5:65e4,u=i(c),d=i(l);s.innerHTML=`
        <div class="car-choice-grid">
            <!-- Card 1: Include Driver (Rekomendasi / Paling Populer) -->
            <div class="car-choice-card car-choice-card-driver" onclick="window.selectCarMode('${t.id}', 'include_driver')">
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
                    <div class="car-choice-price-val">${d}</div>
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
            <div class="car-choice-card car-choice-card-self" onclick="window.selectCarMode('${t.id}', 'lepas_kunci')">
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
                    <div class="car-choice-price-val" style="color: #0f172a;">${u}</div>
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
    `,r.classList.add(`active`),document.body.style.overflow=`hidden`},window.closeCarChoiceModal=()=>{let e=document.getElementById(`car-choice-modal`);e&&e.classList.remove(`active`);let t=document.getElementById(`tour-modal`);(!t||!t.classList.contains(`active`))&&(document.body.style.overflow=``)},window.selectCarMode=(e,t)=>{window.closeCarChoiceModal(),window.openTourModal(e,t)},window.copyRekening=(e,t,n)=>{let r=()=>{if(n){let e=n.innerHTML;n.innerHTML=`<i class="fa-solid fa-check"></i> Tersalin!`,n.style.background=`#dcfce7`,n.style.color=`#15803d`,setTimeout(()=>{n.innerHTML=e,n.style.background=`#e0f2fe`,n.style.color=`#0284c7`},2e3)}Swal.fire({toast:!0,position:`top`,icon:`success`,title:`Nomor Rekening ${t} Berhasil Disalin!`,text:e,showConfirmButton:!1,timer:2200,timerProgressBar:!0,background:`#ffffff`,color:`#0f172a`,customClass:{popup:`my-swal-container`}})};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(e).then(r).catch(()=>{let t=document.createElement(`input`);t.value=e,document.body.appendChild(t),t.select(),document.execCommand(`copy`),document.body.removeChild(t),r()});else{let t=document.createElement(`input`);t.value=e,document.body.appendChild(t),t.select(),document.execCommand(`copy`),document.body.removeChild(t),r()}},document.addEventListener(`DOMContentLoaded`,()=>{let e=document.getElementById(`car-choice-modal`);e&&e.addEventListener(`click`,t=>{t.target===e&&window.closeCarChoiceModal()})}),window.openTourModal=(e,t=null)=>{let r=n.find(t=>t.id===e);if(!r)return;if(r.category===`car`&&!t){window.openCarChoiceModal(e);return}let a=document.getElementById(`ai-chat-widget`);a&&(a.style.display=`none`);let d=document.getElementById(`tour-modal-body`),f=r.category===`car`,p=f&&t===`include_driver`,m=Number(r.price)||0,h=r.priceWithDriver&&Number(r.priceWithDriver)>0?Number(r.priceWithDriver):m>0?m+2e5:65e4,g=f?p?h:m:Number(r.price)||0,_=f?`${r.title} (${p?`Include Driver 12 Jam`:`Lepas Kunci 24 Jam`})`:r.title,v=``,y=o(r.itinerary),b=``,x=``,S=[],C=()=>{if(b){let e=``;S.length>0&&(e=S.length===1?`<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(S[0]+` Lombok`)}" target="_blank" style="background:#e0f2fe; color:#0284c7; padding: 6px 14px; font-size:0.8rem; border-radius: 20px; margin-top:12px; display:inline-flex; align-items:center; gap:6px; font-weight:700; text-decoration:none; transition:all 0.2s;" onmouseover="this.style.background='#bae6fd'" onmouseout="this.style.background='#e0f2fe'"><i class="fa-solid fa-map-location-dot"></i> Lihat Peta di Google Maps</a>`:`<a href="${`https://www.google.com/maps/dir/${S.map(e=>encodeURIComponent(e+` Lombok`)).join(`/`)}`}" target="_blank" style="background:#e0f2fe; color:#0284c7; padding: 6px 14px; font-size:0.8rem; border-radius: 20px; margin-top:12px; display:inline-flex; align-items:center; gap:6px; font-weight:700; text-decoration:none; transition:all 0.2s;" onmouseover="this.style.background='#bae6fd'" onmouseout="this.style.background='#e0f2fe'"><i class="fa-solid fa-route"></i> Buka Rute di Google Maps</a>`),v+=`
            <div class="tm-day">
                <div class="tm-day-header">
                    <div class="tm-day-badge">DAY<br><span>${b.replace(`DAY`,``).trim()}</span></div>
                    <div class="tm-day-title">${x}</div>
                </div>
                <ul class="tm-day-list" style="margin-bottom: 8px;">
                    ${S.map(e=>`<li>${e}</li>`).join(``)}
                </ul>
                ${e}
            </div>`}};y.forEach(e=>{if(e.toUpperCase().startsWith(`DAY`)){C();let t=e.split(`:`);b=t[0],x=t.slice(1).join(`:`).trim(),S=[]}else e.startsWith(`-`)?S.push(e.substring(1).trim()):S.push(e)}),C();let w=o(r.include),T=o(r.exclude),E=w,D=T;f&&(p?(E=[`Durasi Pemakaian 12 Jam Penuh (Rute Wisata)`,`Unit Mobil Bersih, Nyaman & AC Dingin`,`Driver Profesional, Ramah & Berpengalaman`,`Bahan Bakar Minyak (BBM) selama rute pemakaian`,`Antar & Jemput di Bandara / Hotel (Area Kota)`,`Bebas Uang Jaminan Deposit (Rp 0)`],D=[`Tiket Masuk Objek Wisata`,`Biaya Parkir & Tol (jika ada)`,`Pengeluaran Pribadi & Makan Driver`,`Tips Driver (Sukarela)`]):(E=w.length>0?w:[`Unit Mobil Bersih, Prima & AC Dingin`,`Peralatan Standar Kendaraan (Ban Cadangan & Toolkit)`,`Durasi Pemakaian Penuh 24 Jam`],D=T.length>0?T:[`Bahan Bakar Minyak (BBM)`,`Biaya Parkir & Tol`,`Driver / Supir (Setir Sendiri)`,`Jaminan Deposit Rp 1.000.000 (Refundable 100%)`]));let O=r.terms;f?O=p?c:r.terms&&r.terms.trim()&&!r.terms.includes(`DRIVER (12 JAM)`)?r.terms:s:r.category===`motorcycle`&&(O=r.terms&&r.terms.trim()?r.terms:l),d.innerHTML=`
        <div style="width: 100%; height: clamp(260px, 42vw, 400px); position: relative; overflow: hidden;">
            <img src="${r.imageUrl}" alt="${r.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200'">
            <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 120px; background: linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0)); pointer-events: none;"></div>
        </div>
        <div class="tm-header tm-header-floating">
            ${f?`
            <div class="car-mode-switcher-bar">
                <button type="button" class="car-mode-tab-btn ${p?``:`active`}" onclick="window.openTourModal('${r.id}', 'lepas_kunci')">
                    <div class="car-tab-header">
                        <i class="fa-solid fa-key"></i> Lepas Kunci
                    </div>
                    <div class="car-tab-sub">
                        <span class="car-tab-price">${i(m)}</span>
                        <span class="car-tab-dur">/ 24 Jam</span>
                    </div>
                </button>
                <button type="button" class="car-mode-tab-btn ${p?`active`:``}" onclick="window.openTourModal('${r.id}', 'include_driver')">
                    <span class="car-tab-highlight-chip">Bebas Deposit</span>
                    <div class="car-tab-header">
                        <i class="fa-solid fa-user-tie"></i> Include Driver
                    </div>
                    <div class="car-tab-sub">
                        <span class="car-tab-price">${i(h)}</span>
                        <span class="car-tab-dur">/ 12 Jam</span>
                    </div>
                </button>
            </div>
            `:``}

            <div class="tm-top premium-card" style="position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.08); width: 100%; box-sizing: border-box;">
                <div class="tm-title" style="flex: 1; min-width: 0; width: 100%; max-width: 100%; box-sizing: border-box;">
                    ${(()=>{let e=typeof window.getItemCategoryMeta==`function`?window.getItemCategoryMeta(r):{key:`tour`,icon:`fa-umbrella-beach`,color:`#16a34a`,bgColor:`#f0fdf4`,borderColor:`#bbf7d0`,shadow:`rgba(22, 163, 74, 0.15)`,label:`Paket Tour`},t=e.label.toUpperCase();f?t=p?`Sewa Mobil + Driver`:`Sewa Mobil Lepas Kunci`:r.category===`motorcycle`?t=`Sewa Motor`:r.category===`drone`?t=`Sewa Drone`:r.category===`transfer`&&(t=`Antar Jemput Bandara`),r.packageType&&(t=r.packageType);let n=r.duration?r.duration.toUpperCase():`N/A`;!r.duration&&(r.category===`car`||r.category===`motorcycle`)&&(n=p?`12 Jam`:`24 Jam Penuh`);let i=``;return f?i=p?`
                                    <span style="background: #e0f2fe; color: #0284c7; font-size: 0.78rem; padding: 5px 12px; border-radius: 20px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;"><i class="fa-regular fa-clock"></i> 12 Jam</span>
                                    <span style="background: #ecfdf5; color: #059669; font-size: 0.78rem; padding: 5px 12px; border-radius: 20px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;"><i class="fa-solid fa-user-tie"></i> Supir & BBM</span>
                                    <span style="background: #fef3c7; color: #92400e; font-size: 0.78rem; padding: 5px 12px; border-radius: 20px; font-weight: 800; display: inline-flex; align-items: center; gap: 5px;"><i class="fa-solid fa-shield-halved"></i> Bebas Deposit</span>
                                `:`
                                    <span style="background: #e0f2fe; color: #0284c7; font-size: 0.78rem; padding: 5px 12px; border-radius: 20px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;"><i class="fa-regular fa-clock"></i> 24 Jam Penuh</span>
                                    <span style="background: #f1f5f9; color: #475569; font-size: 0.78rem; padding: 5px 12px; border-radius: 20px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;"><i class="fa-solid fa-key"></i> Setir Sendiri</span>
                                    <span style="background: #f0fdf4; color: #166534; font-size: 0.78rem; padding: 5px 12px; border-radius: 20px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;"><i class="fa-solid fa-car-side"></i> Unit Bersih & AC</span>
                                `:r.driverOptions&&(i=`
                                <span style="background: #f0fdf4; color: var(--primary-green); font-size: 0.78rem; padding: 5px 12px; border-radius: 20px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;"><i class="fa-solid fa-id-card"></i> ${r.driverOptions===`Sertakan Pengemudi`?`Dengan Supir`:r.driverOptions===`Tidak Include Driver`?`Lepas Kunci`:r.driverOptions}</span>
                            `),`
                            <div style="font-size: 0.8rem; font-weight: 800; color: ${e.color}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 6px; background: ${e.bgColor}; border: 1px solid ${e.borderColor}; padding: 4px 14px; border-radius: 20px; box-shadow: 0 2px 6px ${e.shadow||`rgba(0,0,0,0.06)`};">
                                <i class="fa-solid ${e.icon}"></i> ${t}
                            </div>
                            <h2 style="color: #0f172a; font-size: clamp(1.35rem, 5vw, 2.2rem); margin: 8px 0 12px 0; line-height: 1.25; font-weight: 900; letter-spacing: -0.02em; word-break: break-word; overflow-wrap: break-word;">${r.title.toUpperCase()}</h2>
                            <div class="tm-badges" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
                                ${f?``:`<span style="background: ${e.bgColor}; color: ${e.color}; border: 1px solid ${e.borderColor}; font-size: 0.78rem; padding: 5px 12px; border-radius: 20px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;"><i class="fa-regular fa-clock"></i> ${n}</span>`}
                                ${i}
                            </div>
                            <p style="color: #64748b; font-size: 0.95rem; line-height: 1.6; margin: 0; max-width: 600px;">${r.description||`Deskripsi detail tidak tersedia.`}</p>
                        `})()}
                </div>
                <div class="tm-price-box premium-price-box">
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;">
                        <span style="font-size: 0.76rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px; white-space: nowrap;">
                            ${(()=>{let e=typeof window.getItemCategoryMeta==`function`?window.getItemCategoryMeta(r):{key:`tour`};return e.key===`honeymoon`||e.key===`tour`?`Harga Paket`:f?p?`Tarif + Supir`:`Tarif Lepas Kunci`:r.category===`motorcycle`||e.key===`motor`?`Tarif Sewa Motor`:r.category===`drone`||e.key===`drone`?`Tarif Sewa Drone`:r.category===`transfer`||e.key===`transfer`?`Tarif Antar Jemput`:`Harga Paket`})()}
                        </span>
                        ${(()=>{let e=typeof window.getItemCategoryMeta==`function`?window.getItemCategoryMeta(r):{icon:`fa-tag`,color:`#0284c7`,bgColor:`#e0f2fe`,borderColor:`#bae6fd`,label:`Paket`};return f?`<span style="font-size: 0.74rem; font-weight: 800; color: ${p?`#15803d`:`#0284c7`}; background: ${p?`#dcfce7`:`#e0f2fe`}; border: 1px solid ${p?`#bbf7d0`:`#bae6fd`}; padding: 4px 12px; border-radius: 14px; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; flex-shrink: 0;">
                                    <i class="fa-solid ${p?`fa-user-check`:`fa-key`}"></i> ${p?`Include Driver`:`Lepas Kunci`}
                                </span>`:`<span style="font-size: 0.74rem; font-weight: 800; color: ${e.color}; background: ${e.bgColor}; border: 1px solid ${e.borderColor}; padding: 4px 12px; border-radius: 14px; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; flex-shrink: 0;">
                                <i class="fa-solid ${e.icon}"></i> ${e.label}
                            </span>`})()}
                    </div>
                    <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
                        <h3 style="color: ${(()=>{let e=typeof window.getItemCategoryMeta==`function`?window.getItemCategoryMeta(r):{color:`#0284c7`};return f?`#0284c7`:e.color})()}; margin: 0; font-size: clamp(1.8rem, 6vw, 2.2rem); font-weight: 900; line-height: 1; letter-spacing: -0.02em;">${i(g)}</h3>
                        <span style="color: #64748b; font-size: 0.88rem; font-weight: 700;">/ ${f?p?`12 Jam`:`24 Jam`:r.category===`motorcycle`?`24 Jam`:`paket`}</span>
                    </div>
                    <div style="border-top: 1px dashed #cbd5e1; padding-top: 12px; font-size: 0.82rem; color: #475569; display: flex; flex-direction: column; gap: 8px; line-height: 1.45;">
                        ${(()=>{let e=typeof window.getItemCategoryMeta==`function`?window.getItemCategoryMeta(r):{key:`tour`};return f?p?`<span style="display: flex; align-items: flex-start; gap: 10px;"><i class="fa-solid fa-check" style="color: #10b981; width: 16px; text-align: center; flex-shrink: 0; margin-top: 2px;"></i> <span style="line-height: 1.45;">Termasuk Unit Mobil, Driver & BBM</span></span><span style="display: flex; align-items: flex-start; gap: 10px;"><i class="fa-solid fa-check" style="color: #10b981; width: 16px; text-align: center; flex-shrink: 0; margin-top: 2px;"></i> <span style="line-height: 1.45;">Bebas Deposit Jaminan (Rp 0)</span></span>`:`<span style="display: flex; align-items: flex-start; gap: 10px;"><i class="fa-solid fa-check" style="color: #0284c7; width: 16px; text-align: center; flex-shrink: 0; margin-top: 2px;"></i> <span style="line-height: 1.45;">Durasi 24 Jam Penuh Setir Sendiri</span></span><span style="display: flex; align-items: flex-start; gap: 10px;"><i class="fa-solid fa-check" style="color: #0284c7; width: 16px; text-align: center; flex-shrink: 0; margin-top: 2px;"></i> <span style="line-height: 1.45;">Unit Bersih, AC Dingin & Toolkit</span></span>`:e.key===`honeymoon`?`<span style="display: flex; align-items: flex-start; gap: 10px;"><i class="fa-solid fa-heart" style="color: #e11d48; width: 16px; text-align: center; flex-shrink: 0; margin-top: 2px;"></i> <span style="line-height: 1.45;">Private Tour Romantis Sepasang (2 Pax)</span></span><span style="display: flex; align-items: flex-start; gap: 10px;"><i class="fa-solid fa-car-side" style="color: #10b981; width: 16px; text-align: center; flex-shrink: 0; margin-top: 2px;"></i> <span style="line-height: 1.45;">Transport Private Full AC + Driver & BBM</span></span><span style="display: flex; align-items: flex-start; gap: 10px;"><i class="fa-solid fa-camera" style="color: #e11d48; width: 16px; text-align: center; flex-shrink: 0; margin-top: 2px;"></i> <span style="line-height: 1.45;">Dokumentasi Foto Liburan</span></span>`:e.key===`tour`?`<span style="display: flex; align-items: flex-start; gap: 10px;"><i class="fa-solid fa-umbrella-beach" style="color: #16a34a; width: 16px; text-align: center; flex-shrink: 0; margin-top: 2px;"></i> <span style="line-height: 1.45;">Rute Wisata Terbaik & Jadwal Fleksibel</span></span><span style="display: flex; align-items: flex-start; gap: 10px;"><i class="fa-solid fa-car-side" style="color: #10b981; width: 16px; text-align: center; flex-shrink: 0; margin-top: 2px;"></i> <span style="line-height: 1.45;">Transportasi Private Full AC + Driver</span></span><span style="display: flex; align-items: flex-start; gap: 10px;"><i class="fa-solid fa-circle-check" style="color: #10b981; width: 16px; text-align: center; flex-shrink: 0; margin-top: 2px;"></i> <span style="line-height: 1.45;">Fasilitas Lengkap Sesuai Rincian Paket</span></span>`:e.key===`motor`||r.category===`motorcycle`?`<span style="display: flex; align-items: flex-start; gap: 10px;"><i class="fa-solid fa-helmet-safety" style="color: #d97706; width: 16px; text-align: center; flex-shrink: 0; margin-top: 2px;"></i> <span style="line-height: 1.45;">Termasuk 2 Helm SNI & Jas Hujan</span></span><span style="display: flex; align-items: flex-start; gap: 10px;"><i class="fa-solid fa-shield-halved" style="color: #10b981; width: 16px; text-align: center; flex-shrink: 0; margin-top: 2px;"></i> <span style="line-height: 1.45;">Unit Terawat, Bersih & Bebas Ribet</span></span>`:e.key===`transfer`||r.category===`transfer`?`<span style="display: flex; align-items: flex-start; gap: 10px;"><i class="fa-solid fa-plane-arrival" style="color: #0284c7; width: 16px; text-align: center; flex-shrink: 0; margin-top: 2px;"></i> <span style="line-height: 1.45;">Antar Jemput Bandara Tepat Waktu</span></span><span style="display: flex; align-items: flex-start; gap: 10px;"><i class="fa-solid fa-circle-check" style="color: #10b981; width: 16px; text-align: center; flex-shrink: 0; margin-top: 2px;"></i> <span style="line-height: 1.45;">Driver Ramah & Bebas Parkir Bandara</span></span>`:e.key===`drone`||r.category===`drone`?`<span style="display: flex; align-items: flex-start; gap: 10px;"><i class="fa-solid fa-video" style="color: #9333ea; width: 16px; text-align: center; flex-shrink: 0; margin-top: 2px;"></i> <span style="line-height: 1.45;">Pilot Drone Berpengalaman</span></span><span style="display: flex; align-items: flex-start; gap: 10px;"><i class="fa-solid fa-film" style="color: #10b981; width: 16px; text-align: center; flex-shrink: 0; margin-top: 2px;"></i> <span style="line-height: 1.45;">File Mentah & Hasil Video High-Res</span></span>`:`<span style="display: flex; align-items: flex-start; gap: 10px;"><i class="fa-solid fa-circle-check" style="color: #10b981; width: 16px; text-align: center; flex-shrink: 0; margin-top: 2px;"></i> <span style="line-height: 1.45;">Layanan Resmi Terpercaya</span></span><span style="display: flex; align-items: flex-start; gap: 10px;"><i class="fa-solid fa-star" style="color: #f59e0b; width: 16px; text-align: center; flex-shrink: 0; margin-top: 2px;"></i> <span style="line-height: 1.45;">Jaminan Kepuasan Pelanggan</span></span>`})()}
                    </div>
                </div>

            </div>
        </div>
        <div class="tm-body">
            <div class="tm-left">
                ${v?`
                <h4 style="margin-bottom: 20px; color: var(--text-dark); font-weight: 800;"><i class="fa-solid fa-route" style="color: var(--primary-green);"></i> JADWAL PERJALANAN</h4>
                <div class="tm-timeline">
                    ${v}
                </div>`:``}
                
                ${r.category===`package`||v?`
                <div class="tm-box tm-box-blue" style="background: #f8fafc; border: 1px solid #cbd5e1; margin-top: 14px;">
                    <div class="tm-box-title" style="background: var(--text-dark);"><i class="fa-solid fa-shield-halved"></i> KEBIJAKAN PEMBATALAN</div>
                    <ul class="tm-list" style="color:var(--text-dark);">
                        <li><i class="fa-solid fa-hourglass-half" style="color:var(--text-gray);"></i> Pembatalan H-7: 50% deposit dikembalikan.</li>
                        <li><i class="fa-solid fa-check" style="color:var(--text-gray);"></i> Pembatalan pihak travel: 100% deposit dikembalikan.</li>
                        <li><i class="fa-regular fa-calendar-days" style="color:var(--text-gray);"></i> Perubahan jadwal sesuai ketersediaan.</li>
                    </ul>
                </div>`:``}
                
                ${O?`
                <div class="tm-box tm-box-blue">
                    <div class="tm-box-title" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);">
                        <span style="display: inline-flex; align-items: center; gap: 8px; flex: 1; min-width: 0; word-break: break-word;">
                            <i class="fa-solid fa-file-contract" style="flex-shrink: 0;"></i> SYARAT & KETENTUAN
                        </span>
                        <span style="background: rgba(255,255,255,0.22); color: white; font-size: 0.72rem; padding: 3px 10px; border-radius: 12px; font-weight: 700; text-transform: uppercase; white-space: nowrap; margin-left: auto;">
                            ${f?p?`Dengan Driver`:`Lepas Kunci`:r.category===`motorcycle`?`Rental Motor`:r.category===`drone`?`Sewa Drone`:`Ketentuan Paket`}
                        </span>
                    </div>
                    <div class="tm-box-content">
                        ${f?p?`
                        <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #a7f3d0; border-radius: 12px; padding: 12px 14px; margin-bottom: 14px; display: flex; align-items: center; gap: 12px;">
                            <div style="width: 36px; height: 36px; border-radius: 50%; background: #059669; color: white; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;">
                                <i class="fa-solid fa-shield-heart"></i>
                            </div>
                            <div style="min-width: 0; flex: 1;">
                                <div style="font-weight: 800; font-size: 0.88rem; color: #065f46; word-break: break-word;">Bebas Uang Jaminan Deposit (Rp 0)</div>
                                <div style="font-size: 0.78rem; color: #047857; margin-top: 2px; word-break: break-word;">Layanan include driver tidak membutuhkan uang jaminan deposit atau jaminan SIM/KTP.</div>
                            </div>
                        </div>
                        `:`
                        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #bfdbfe; border-radius: 12px; padding: 12px 14px; margin-bottom: 14px; display: flex; align-items: center; gap: 12px;">
                            <div style="width: 36px; height: 36px; border-radius: 50%; background: #0284c7; color: white; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;">
                                <i class="fa-solid fa-key"></i>
                            </div>
                            <div style="min-width: 0; flex: 1;">
                                <div style="font-weight: 800; font-size: 0.88rem; color: #1e40af; word-break: break-word;">Jaminan Deposit Rp 1.000.000 (100% Refundable)</div>
                                <div style="font-size: 0.78rem; color: #1d4ed8; margin-top: 2px; word-break: break-word;">Wajib KTP & SIM A aktif. Uang jaminan dikembalikan penuh setelah sewa selesai dalam kondisi baik.</div>
                            </div>
                        </div>
                        `:``}

                        <div style="color: #334155; font-size: 0.88rem; line-height: 1.6; word-break: break-word;">
                            ${u(O)}
                        </div>
                    </div>
                </div>`:``}
            </div>
            
            <div class="tm-right">
                ${E.length>0?`
                <div class="tm-box tm-box-green">
                    <div class="tm-box-title" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%);">
                        <span style="display: inline-flex; align-items: center; gap: 8px; flex: 1; min-width: 0; word-break: break-word;">
                            <i class="fa-solid fa-circle-check" style="flex-shrink: 0;"></i> FASILITAS INCLUDE
                        </span>
                        <span style="background: rgba(255,255,255,0.22); color: white; font-size: 0.72rem; padding: 3px 10px; border-radius: 12px; font-weight: 700; white-space: nowrap; margin-left: auto;">
                            ${E.length} Fasilitas
                        </span>
                    </div>
                    <ul class="tm-list">
                        ${E.map(e=>`
                            <li>
                                <i class="fa-solid fa-circle-check" style="color: #10b981; margin-top: 3px; font-size: 0.95rem; flex-shrink: 0;"></i>
                                <span>${e}</span>
                            </li>
                        `).join(``)}
                    </ul>
                </div>`:``}
                
                ${D.length>0?`
                <div class="tm-box tm-box-red">
                    <div class="tm-box-title" style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);">
                        <span style="display: inline-flex; align-items: center; gap: 8px; flex: 1; min-width: 0; word-break: break-word;">
                            <i class="fa-solid fa-circle-xmark" style="flex-shrink: 0;"></i> TIDAK TERMASUK (EXCLUDE)
                        </span>
                    </div>
                    <ul class="tm-list">
                        ${D.map(e=>`
                            <li>
                                <i class="fa-solid fa-circle-xmark" style="color: #ef4444; margin-top: 3px; font-size: 0.95rem; flex-shrink: 0;"></i>
                                <span>${e}</span>
                            </li>
                        `).join(``)}
                    </ul>
                </div>`:``}
                
                <div class="tm-box tm-box-blue">
                    <div class="tm-box-title" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);">
                        <span style="display: inline-flex; align-items: center; gap: 8px; flex: 1; min-width: 0; word-break: break-word;">
                            <i class="fa-regular fa-credit-card" style="flex-shrink: 0;"></i> CARA RESERVASI & PEMBAYARAN
                        </span>
                    </div>
                    <div class="tm-box-content">
                        ${r.category===`motorcycle`?`<p style="color: #475569; font-size: 0.88rem; margin: 0 0 16px 0; line-height: 1.5; word-break: break-word;">Untuk mengamankan jadwal sewa motor, silakan transfer <strong>DP sebesar Rp 50.000 dan jaminan deposit Rp 500.000</strong> ke rekening resmi berikut:</p>`:f?p?`<p style="color: #475569; font-size: 0.88rem; margin: 0 0 16px 0; line-height: 1.5; word-break: break-word;">Untuk mengamankan jadwal <strong>Include Driver (12 Jam)</strong>, silakan transfer <strong>DP sebesar Rp 200.000</strong> ke rekening berikut. <span style="color: #059669; font-weight: 700;">Bebas Deposit (Rp 0)!</span> Pelunasan dapat dibayarkan saat bertemu driver:</p>`:`<p style="color: #475569; font-size: 0.88rem; margin: 0 0 16px 0; line-height: 1.5; word-break: break-word;">Untuk mengamankan jadwal sewa <strong>Lepas Kunci (24 Jam)</strong>, silakan transfer <strong>DP Rp 200.000 & jaminan deposit Rp 1.000.000</strong> ke rekening berikut (Deposit jaminan 100% dikembalikan setelah masa sewa):</p>`:`<p style="color: #475569; font-size: 0.88rem; margin: 0 0 16px 0; line-height: 1.5; word-break: break-word;">Untuk mengamankan jadwal perjalanan, silakan transfer <strong>DP sebesar Rp 500.000</strong> ke rekening resmi berikut:</p>`}
                        
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <div class="bank-item tm-bank-card">
                                <div class="tm-bank-info">
                                    <img src="/mandiri.svg" alt="Mandiri" class="tm-bank-logo">
                                    <div class="tm-bank-details">
                                        <div class="tm-bank-label">Bank Mandiri - LALU RENGGANE</div>
                                        <div class="tm-bank-number">1610017191425</div>
                                    </div>
                                </div>
                                <button type="button" class="btn-copy-rekening" onclick="window.copyRekening('1610017191425', 'Mandiri', this);">
                                    <i class="fa-regular fa-copy"></i> Salin
                                </button>
                            </div>
                            <div class="bank-item tm-bank-card">
                                <div class="tm-bank-info">
                                    <img src="/bri.svg" alt="BRI" class="tm-bank-logo">
                                    <div class="tm-bank-details">
                                        <div class="tm-bank-label">Bank BRI - LALU RENGGANE</div>
                                        <div class="tm-bank-number">759801017387536</div>
                                    </div>
                                </div>
                                <button type="button" class="btn-copy-rekening" onclick="window.copyRekening('759801017387536', 'BRI', this);">
                                    <i class="fa-regular fa-copy"></i> Salin
                                </button>
                            </div>
                        </div>

                        ${localStorage.getItem(`auth_token`)?``:`
                        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px; margin-top: 16px; text-align: center;">
                            <div style="font-size: 0.82rem; color: #d97706; margin-bottom: 10px; font-weight: 600;">
                                <i class="fa-solid fa-circle-exclamation"></i> Login akun Anda untuk memesan lebih cepat dan cek riwayat booking.
                            </div>
                            <div style="display: flex; gap: 8px; justify-content: center;">
                                <a href="#" onclick="event.preventDefault(); window.closeTourModal(); window._authMode='login'; window.openAuthModal();" class="btn" style="background: white; color: #d97706; border: 1px solid #d97706; padding: 6px 14px; border-radius: 6px; font-size: 0.78rem; font-weight: 700; flex:1; text-align: center;">LOGIN</a>
                                <a href="#" onclick="event.preventDefault(); window.closeTourModal(); window._authMode='register'; window.openAuthModal();" class="btn" style="background: #d97706; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-size: 0.78rem; font-weight: 700; flex:1; text-align: center;">DAFTAR</a>
                            </div>
                        </div>
                        `}

                        <div class="modal-booking-actions" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 18px; width: 100%; box-sizing: border-box;">
                            <a href="#" onclick="event.preventDefault(); openCheckoutModal('${_.replace(/'/g,`\\'`)}', ${g}, 'wa');" 
                               class="btn-detail-booking-wa"
                               style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 13px 8px; border-radius: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.28); text-decoration: none; text-align: center; font-size: clamp(0.78rem, 3.4vw, 0.9rem); white-space: nowrap; transition: all 0.2s ease;"
                               onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 18px rgba(22, 163, 74, 0.38)';"
                               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 14px rgba(22, 163, 74, 0.28)';">
                                <i class="fa-brands fa-whatsapp" style="font-size: 1.25rem; flex-shrink: 0;"></i>
                                <span>Booking via WA</span>
                            </a>
                            <button type="button" onclick="openCheckoutModal('${_.replace(/'/g,`\\'`)}', ${g})" 
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
            <div class="tm-rating-box">
                <div class="tm-rating-left">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
                        <h3 style="font-size: 1.05rem; color: #78350f; margin: 0; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                            <i class="fa-solid fa-star" style="color: #f59e0b;"></i> Rating Pelanggan
                        </h3>
                        <span id="item-rating-score-${r.id}" style="background: #f59e0b; color: white; font-weight: 800; font-size: 0.8rem; padding: 2px 10px; border-radius: 12px; box-shadow: 0 2px 5px rgba(245, 158, 11, 0.3);">
                            ${r.rating?r.rating:`5.0`} ★
                        </span>
                    </div>
                    <div id="item-rating-subtitle-${r.id}" style="font-size: 0.8rem; color: #92400e;">
                        Berdasarkan ${r.reviewCount||0} rating penilaian
                    </div>
                </div>

                <!-- 5 Clickable Stars (Hanya bintang aja!) -->
                <div class="tm-rating-right">
                    <div id="star-action-title-${r.id}" style="font-size: 0.78rem; font-weight: 700; color: #92400e; margin-bottom: 5px;">Ketuk Bintang untuk Menilai:</div>
                    <div id="star-bar-${r.id}" class="quick-item-stars" style="display: inline-flex; gap: 5px; font-size: clamp(1.2rem, 4.5vw, 1.5rem); cursor: pointer; user-select: none;">
                        <i class="fa-solid fa-star item-star" data-idx="1" style="color: #cbd5e1; transition: transform 0.15s ease, color 0.15s ease;" onclick="window.quickRateItem('${r.id}', 1)" onmouseover="window.previewItemStars('${r.id}', 1)" onmouseout="window.resetItemStars('${r.id}')"></i>
                        <i class="fa-solid fa-star item-star" data-idx="2" style="color: #cbd5e1; transition: transform 0.15s ease, color 0.15s ease;" onclick="window.quickRateItem('${r.id}', 2)" onmouseover="window.previewItemStars('${r.id}', 2)" onmouseout="window.resetItemStars('${r.id}')"></i>
                        <i class="fa-solid fa-star item-star" data-idx="3" style="color: #cbd5e1; transition: transform 0.15s ease, color 0.15s ease;" onclick="window.quickRateItem('${r.id}', 3)" onmouseover="window.previewItemStars('${r.id}', 3)" onmouseout="window.resetItemStars('${r.id}')"></i>
                        <i class="fa-solid fa-star item-star" data-idx="4" style="color: #cbd5e1; transition: transform 0.15s ease, color 0.15s ease;" onclick="window.quickRateItem('${r.id}', 4)" onmouseover="window.previewItemStars('${r.id}', 4)" onmouseout="window.resetItemStars('${r.id}')"></i>
                        <i class="fa-solid fa-star item-star" data-idx="5" style="color: #cbd5e1; transition: transform 0.15s ease, color 0.15s ease;" onclick="window.quickRateItem('${r.id}', 5)" onmouseover="window.previewItemStars('${r.id}', 5)" onmouseout="window.resetItemStars('${r.id}')"></i>
                    </div>
                    <div id="star-hint-${r.id}" style="font-size: 0.75rem; font-weight: 600; color: #b45309; min-height: 18px; margin-top: 3px;"></div>
                </div>
            </div>

            <!-- List of Ratings given -->
            <div id="item-reviews-container-${r.id}" style="display: flex; gap: 10px; overflow-x: auto; overscroll-behavior-x: contain; width: 100%; max-width: 100%; box-sizing: border-box; padding: 8px 4px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; margin-bottom: 5px;">
                <p style="font-size: 0.85rem; color: #64748b; text-align: center; padding: 12px 0; width: 100%;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat rating...</p>
            </div>
            <style>
                #item-reviews-container-${r.id}::-webkit-scrollbar { display: none; }
            </style>
        </div>

        <div class="tm-footer" style="background: linear-gradient(to right, #f8fafc, #f1f5f9); padding: 20px; border-radius: 0 0 20px 20px; border-top: 1px solid #e2e8f0;">
            <div class="tm-benefit-grid">
                <div class="tm-benefit-card">
                    <div class="tm-benefit-icon" style="background: #dcfce7; color: #16a34a;">
                        <i class="fa-regular fa-face-smile"></i>
                    </div>
                    <span>Liburan Nyaman</span>
                </div>
                <div class="tm-benefit-card">
                    <div class="tm-benefit-icon" style="background: #e0f2fe; color: #0284c7;">
                        <i class="fa-solid fa-shield-halved"></i>
                    </div>
                    <span>Aman & Terpercaya</span>
                </div>
                <div class="tm-benefit-card">
                    <div class="tm-benefit-icon" style="background: #fef9c3; color: #ca8a04;">
                        <i class="fa-solid fa-user-tie"></i>
                    </div>
                    <span>Layanan Anti Ribet</span>
                </div>
            </div>
        </div>
    `,document.getElementById(`tour-modal`).classList.add(`active`),document.body.style.overflow=`hidden`,window.loadItemReviews(r.id)},window.closeTourModal=()=>{let e=document.getElementById(`tour-modal`);if(e){e.classList.remove(`active`);let t=document.getElementById(`sub-package-modal`);if(!(t&&t.style.display!==`none`)){document.body.style.overflow=``;let e=document.getElementById(`ai-chat-widget`);e&&(e.style.display=``)}}},window.previewItemStars=(e,t)=>{if(localStorage.getItem(`rated_item_`+e))return;let n=document.getElementById(`star-bar-${e}`);if(!n)return;n.querySelectorAll(`.item-star`).forEach(e=>{parseInt(e.getAttribute(`data-idx`))<=t?(e.style.color=`#f59e0b`,e.style.transform=`scale(1.15)`):(e.style.color=`#cbd5e1`,e.style.transform=`scale(1)`)});let r=[`★ Kurang`,`★★ Cukup`,`★★★ Bagus`,`★★★★ Sangat Bagus`,`★★★★★ Luar Biasa!`],i=document.getElementById(`star-hint-${e}`);i&&(i.innerHTML=`<span style="color:#d97706; font-weight:700;">${r[t-1]}</span>`)},window.resetItemStars=e=>{let t=document.getElementById(`star-bar-${e}`);if(!t)return;let n=localStorage.getItem(`rated_item_`+e),r=t.querySelectorAll(`.item-star`),i=document.getElementById(`star-hint-${e}`),a=document.getElementById(`star-action-title-${e}`);if(n){let e=parseInt(n);r.forEach(t=>{parseInt(t.getAttribute(`data-idx`))<=e?(t.style.color=`#f59e0b`,t.style.transform=`scale(1)`):(t.style.color=`#cbd5e1`,t.style.transform=`scale(1)`),t.style.cursor=`default`}),i&&(i.innerHTML=`<span style="color:#16a34a; font-weight:700;"><i class="fa-solid fa-circle-check"></i> Rating Anda: ${e}★ (Hanya 1x per item)</span>`),a&&(a.innerText=`Rating Anda (Sudah Dinilai):`)}else r.forEach(e=>{e.style.color=`#cbd5e1`,e.style.transform=`scale(1)`,e.style.cursor=`pointer`}),i&&(i.innerHTML=``),a&&(a.innerText=`Ketuk Bintang untuk Menilai:`)},window.quickRateItem=async(t,n)=>{let r=localStorage.getItem(`rated_item_`+t);if(r){Swal.fire({toast:!0,position:`top-end`,icon:`info`,title:`Anda sudah memberi rating ${r}★!`,text:`Setiap pelanggan hanya dapat memberi rating 1 kali per item.`,showConfirmButton:!1,timer:3e3});return}if(window._isSubmittingRating)return;window._isSubmittingRating=!0,window.previewItemStars(t,n);let i=document.getElementById(`star-hint-${t}`);i&&(i.innerHTML=`<span style="color:#0284c7;"><i class="fa-solid fa-spinner fa-spin"></i> Menyimpan rating...</span>`);let a=`Pelanggan Terverifikasi`,o=null,s=null,c=localStorage.getItem(`auth_user`);if(c)try{let e=JSON.parse(c);e&&(e.displayName?a=e.displayName:e.name&&(a=e.name),o=e.uid||e.id||null,s=e.photoUrl||null)}catch{}try{if(!(await fetch(`${e}/reviews`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({itemId:t,rating:Number(n),name:a,comment:``,photoUrl:s,userId:o})})).ok)throw Error(`Failed to submit rating`);localStorage.setItem(`rated_item_`+t,n),i&&(i.innerHTML=`<span style="color:#16a34a; font-weight:700;"><i class="fa-solid fa-circle-check"></i> Rating ${n}★ berhasil disimpan!</span>`);let r=document.getElementById(`star-action-title-${t}`);r&&(r.innerText=`Rating Anda (Sudah Dinilai):`),Swal.fire({toast:!0,position:`top-end`,icon:`success`,title:`Rating ${n} Bintang Berhasil! ⭐`,text:`Terima kasih atas penilaian Anda!`,showConfirmButton:!1,timer:2500,timerProgressBar:!0}),await window.loadItemReviews(t)}catch(e){console.error(`Quick rate error:`,e),i&&(i.innerHTML=`<span style="color:#ef4444;"><i class="fa-solid fa-circle-exclamation"></i> Gagal menyimpan rating.</span>`),Swal.fire({toast:!0,position:`top-end`,icon:`error`,title:`Gagal mengirim rating`,text:`Silakan coba lagi.`,showConfirmButton:!1,timer:3e3})}finally{window._isSubmittingRating=!1,window.resetItemStars(t)}},window.loadItemReviews=async t=>{let n=document.getElementById(`item-reviews-container-${t}`);if(n)try{let r=await fetch(`${e}/reviews?itemId=${t}`);if(!r.ok)throw Error(`Failed to fetch item reviews`);let i=await r.json(),a=localStorage.getItem(`auth_user`);if(a&&Array.isArray(i))try{let e=JSON.parse(a),n=(e.displayName||e.name||``).trim().toLowerCase(),r=e.uid||e.id,o=i.find(e=>r&&e.userId===r||n&&e.name&&e.name.trim().toLowerCase()===n);o&&localStorage.setItem(`rated_item_`+t,o.rating)}catch{}let o=new Set,s=[];if(Array.isArray(i))for(let e of i){let t=``;t=e.userId?`u_`+e.userId:e.name&&e.name.trim().toLowerCase()!==`pelanggan terverifikasi`?`n_`+e.name.trim().toLowerCase():`id_`+e.id,o.has(t)||(o.add(t),s.push(e))}let c=document.getElementById(`item-rating-score-${t}`),l=document.getElementById(`item-rating-subtitle-${t}`);if(s.length>0){let e=(s.reduce((e,t)=>e+(Number(t.rating)||5),0)/s.length).toFixed(1).replace(`.0`,``);if(c&&(c.innerText=`${e} ★`),l&&(l.innerText=`Berdasarkan ${s.length} rating penilaian`),window.globalItems){let n=window.globalItems.find(e=>e.id===t);if(n&&(n.rating=e,n.reviewCount=s.length,n.parentId)){let e=window.globalItems.find(e=>e.id===n.parentId);if(e){let t=window.globalItems.filter(t=>t.parentId===e.id).map(e=>e.id);if(window.allReviewsData){let n=window.allReviewsData.filter(n=>(n.itemId===e.id||t.includes(n.itemId))&&n.status===`approved`);n.length>0&&(e.rating=(n.reduce((e,t)=>e+t.rating,0)/n.length).toFixed(1).replace(`.0`,``),e.reviewCount=n.length)}}}}}if(window.resetItemStars(t),s.length===0){n.innerHTML=`<p style="font-size: 0.82rem; color: #64748b; text-align: center; padding: 8px 0; width: 100%;">Belum ada rating. Ketuk bintang di atas untuk memberi rating pertama! ⭐</p>`;return}n.innerHTML=s.map(e=>{let t=``,n=Number(e.rating)||5;for(let e=0;e<5;e++)t+=e<n?`<i class="fa-solid fa-star" style="color: #f59e0b; font-size:0.75rem;"></i>`:`<i class="fa-regular fa-star" style="color: #cbd5e1; font-size:0.75rem;"></i>`;let r=e.createdAt?new Date(e.createdAt).toLocaleDateString(`id-ID`,{day:`numeric`,month:`short`,year:`numeric`}):``;return`
            <div style="flex: 0 0 auto; min-width: 140px; background: white; padding: 10px 14px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 5px rgba(0,0,0,0.03);">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px; margin-bottom: 4px;">
                    <span style="font-weight: 700; font-size: 0.8rem; color: #1e293b; max-width: 95px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${e.name||`Pelanggan`}</span>
                    <span style="font-size: 0.68rem; color: #94a3b8;">${r}</span>
                </div>
                <div style="display: flex; gap: 2px; align-items: center;">
                    ${t}
                    <span style="font-size: 0.75rem; font-weight: 700; color: #d97706; margin-left: 4px;">${n}.0</span>
                </div>
                ${e.comment?`<p style="font-size: 0.78rem; color: #64748b; margin: 4px 0 0; line-height: 1.3;">${e.comment}</p>`:``}
            </div>`}).join(``)}catch(e){console.error(`Failed to load item reviews:`,e),n.innerHTML=`<p style="font-size: 0.82rem; color: #ef4444; text-align: center; padding: 8px 0; width: 100%;">Gagal memuat rating.</p>`}},window.toggleInlineReviewForm=(e,t)=>{window.quickRateItem(e,5)},window.submitInlineReview=async e=>{window.quickRateItem(e,5)},window.applyPromo=async()=>{let t=document.getElementById(`co-promo-input`).value.trim(),n=document.getElementById(`promo-message`),r=document.getElementById(`co-display-price`),a=document.getElementById(`co-promo-applied`),o=document.getElementById(`co-promo-discount`);if(!t){n.style.display=`block`,n.style.color=`#ef4444`,n.innerHTML=`<i class="fa-solid fa-circle-exclamation"></i> Masukkan kode promo terlebih dahulu.`;return}n.style.display=`block`,n.style.color=`#0284c7`,n.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> Memeriksa kode promo...`;try{let s=await(await fetch(`${e}/promos/verify/${t}?itemId=${window.currentCheckoutItemId||``}`)).json();if(!s.valid){n.style.color=`#ef4444`,n.innerHTML=`<i class="fa-solid fa-circle-xmark"></i> ${s.message||`Kode promo tidak valid.`}`,a.value=``,o.value=`0`,r&&r.dataset.basePrice&&(r.innerHTML=i(Number(r.dataset.basePrice)));return}let c=Number(r.dataset.basePrice),l=0;s.discountType===`percent`?(l=c*(s.discountValue/100),s.maxDiscount&&l>s.maxDiscount&&(l=s.maxDiscount)):l=s.discountValue,l>c&&(l=c);let u=c-l;n.style.color=`#10b981`,n.innerHTML=`<i class="fa-solid fa-circle-check"></i> Kode berhasil digunakan! Diskon: ${i(l)}`,a.value=t,o.value=l,r&&(r.innerHTML=`<span style="text-decoration:line-through; font-size:0.9rem; color:#94a3b8; margin-right:10px;">${i(c)}</span> ${i(u)}`)}catch(e){n.style.color=`#ef4444`,n.innerHTML=`<i class="fa-solid fa-circle-xmark"></i> Terjadi kesalahan saat memeriksa kode.`,console.error(e)}},window.closeCheckoutModal=()=>{let e=document.getElementById(`checkout-modal`);e&&(e.classList.remove(`active`),document.body.style.overflow=``)},window.toggleShowAll=(e,t,n)=>{let r=document.getElementById(e);if(!r)return;let i=r.querySelectorAll(`[data-hidden="true"]`),a=!1;if(i.forEach(e=>{e.style.display===`none`?(e.style.display=``,a=!0):(e.style.display=`none`,a=!1)}),a)t.innerHTML=`Tutup <i class="fa-solid fa-chevron-up" style="margin-left: 5px;"></i>`;else{t.innerHTML=`Lihat Semuanya (${n}) <i class="fa-solid fa-chevron-down" style="margin-left: 5px;"></i>`;let e=r.getBoundingClientRect().top+window.pageYOffset+-80;window.scrollTo({top:e,behavior:`smooth`})}};var f=(e,t=0)=>`
    <div class="card service-card" data-aos="zoom-in" data-aos-delay="${t%3*100}">
        <div class="service-icon"><i class="fa-solid fa-plane"></i></div>
        <h3>${e.title}</h3>
        <p>${e.description}</p>
    </div>
`,p=(e,t=0)=>{if(!e.transferMatrix||e.transferMatrix.length===0)return f(e,t);let n=e.transferVehicles||Object.keys(e.transferMatrix[0]?.prices||{}),r=``;return e.transferMatrix.forEach(e=>{r+=`<tr>
            <td style="padding: 10px 14px; font-weight: 700; color: var(--text-dark); white-space: nowrap; border: 1px solid #e2e8f0;"><i class="fa-solid fa-location-dot" style="color: var(--primary-green); margin-right: 6px;"></i>${e.area}</td>
            ${n.map(t=>{let n=e.prices[t];return`<td style="padding: 10px 8px; text-align: center; border: 1px solid #e2e8f0; white-space: nowrap; font-weight: 600; color: var(--text-dark);">${n?i(n):`-`}</td>`}).join(``)}
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
                    ${r}
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
    `},m=(e,t=0)=>{let n=e.isParent===!0,r=e.category===`honeymoon`||e.title&&(e.title.toLowerCase().includes(`honeymoon`)||e.title.toLowerCase().includes(`bulan madu`)),a=r?`border:2px solid #ec4899; box-shadow:0 10px 20px rgba(236,72,153,0.15);`:n?`border:2px solid #fbbf24;`:``,o=r?`linear-gradient(135deg, #ec4899, #be185d)`:`linear-gradient(135deg,var(--primary-blue,#0ea5e9),#1e40af)`,s=n?`<button onclick="window.openSubPackageModal('${e.id}')" class="btn" style="background:${o}; color:white; border:none; font-size:0.85rem; padding:8px 16px; border-radius:20px; font-weight:700;"><i class="fa-solid fa-layer-group" style="margin-right:5px;"></i>LIHAT PAKET</button>`:`<button onclick="openTourModal('${e.id}')" class="btn" style="background: var(--bg-light); color: ${r?`#ec4899`:`var(--primary-blue)`}; border: none; font-size: 0.85rem; padding: 8px 16px; border-radius: 20px; font-weight: 700;">DETAIL</button>`,c=``;r?c=`<span style="position:absolute;top:10px;left:10px;background:linear-gradient(135deg,#ec4899,#be185d);color:white;font-size:0.65rem;font-weight:800;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;z-index:2;box-shadow:0 4px 10px rgba(236,72,153,0.3);"><i class="fa-solid fa-heart" style="margin-right:4px;"></i>Honeymoon Special</span>`:n&&(c=`<span style="position:absolute;top:10px;left:10px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#78350f;font-size:0.65rem;font-weight:800;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;z-index:2;"><i class="fa-solid fa-layer-group" style="margin-right:4px;"></i>Paket Pilihan</span>`);let l=e.rating?`<span style="position:absolute; ${n||r?`top:45px;`:`top:10px;`} left:10px; background:rgba(255,255,255,0.95); color:#f59e0b; font-weight:800; font-size:0.8rem; padding:4px 10px; border-radius:20px; z-index:2; box-shadow:0 2px 4px rgba(0,0,0,0.1);"><i class="fa-solid fa-star" style="margin-right:4px;"></i>${e.rating}</span>`:``;return`
    <div class="card package-card" data-aos="fade-up" data-aos-delay="${t%3*100}" style="${a} ${r?`background: linear-gradient(to bottom, #fff, #fdf2f8);`:``}">
        <div class="img-wrapper" style="position:relative;">
            <button onclick="window.shareItem('${e.id}', '${e.title.replace(/'/g,`\\'`)}', '${i(e.price)}')" style="position:absolute; top:10px; right:10px; background:rgba(255,255,255,0.9); color:var(--primary-blue); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Bagikan"><i class="fa-solid fa-share-nodes"></i></button>
            <button id="btn-wishlist-${e.id}" onclick="event.stopPropagation(); window.toggleWishlist('${e.id}')" style="position:absolute; top:10px; right:50px; background:rgba(255,255,255,0.9); color:var(--text-gray); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Simpan ke Wishlist"><i class="${window.isInWishlist&&window.isInWishlist(e.id)?`fa-solid`:`fa-regular`} fa-heart" ${window.isInWishlist&&window.isInWishlist(e.id)?`style="color:#ef4444;"`:``}></i></button>
            <span class="tag" style="${r?`background:#fce7f3; color:#db2777;`:``}"><i class="fa-regular fa-clock" style="margin-right: 4px;"></i> ${e.duration||`1 HARI`}</span>
            ${c}
            ${l}
            <img src="${e.imageUrl}" alt="${e.title}" onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'">
        </div>
        <div class="content">
            <h3>${e.title}</h3>
            <ul>
                <li><i class="fa-solid fa-check"></i> ${e.description||``}</li>
            </ul>
            <div class="price-row">
                  <div class="price" style="flex: 1; min-width: 0;">
                      ${`
                                  <div style="display: flex; flex-direction: column;">
                                      <span style="font-size: 0.7rem; color: #64748b;">Mulai dari</span>
                                      <span style="color: ${r?`#db2777`:`var(--primary-blue)`}; font-weight: 800; font-size: 1.05rem;">${i(e.price)}</span>
                                  </div>
                          `}
                  </div>
                ${s}
            </div>
        </div>
    </div>
`};window.openSubPackageModal=e=>{let t=n.find(t=>t.id===e);if(!t)return;let r=document.getElementById(`ai-chat-widget`);r&&(r.style.display=`none`);let a=n.filter(t=>t.parentId===e);window.allReviewsData&&a.forEach(e=>{let t=window.allReviewsData.filter(t=>t.itemId===e.id&&t.status===`approved`),n=new Set,r=[];t.forEach(e=>{let t=e.userId?`u_`+e.userId:e.name&&e.name.trim().toLowerCase()!==`pelanggan terverifikasi`?`n_`+e.name.trim().toLowerCase():`id_`+e.id;n.has(t)||(n.add(t),r.push(e))}),r.length>0&&(e.rating=(r.reduce((e,t)=>e+t.rating,0)/r.length).toFixed(1).replace(`.0`,``),e.reviewCount=r.length)});let o=document.getElementById(`sub-modal-title`),s=document.getElementById(`sub-modal-desc`),c=document.getElementById(`sub-modal-body`),l=document.getElementById(`sub-package-modal`);!o||!c||!l||(o.innerText=t.title,s&&(s.innerText=t.description||`Pilih paket yang sesuai dengan keinginan Anda.`),l.scrollTop=0,c.innerHTML=a.length===0?`<div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:#64748b;">
            <i class="fa-solid fa-box-open" style="font-size:3.5rem; margin-bottom:15px; display:block; color:#cbd5e1;"></i>
            <p style="font-size:1rem; font-weight:600;">Belum ada sub-paket.</p>
            <p style="font-size:0.85rem;">Silakan tambahkan sub-paket dari panel admin.</p>
        </div>`:a.sort((e,t)=>{let n=e=>{let t=(e||``).match(/paket\s+([a-z])/i);return t?t[1].toUpperCase():null},r=n(e.title),i=n(t.title);if(r&&i){if(r!==i)return r.localeCompare(i)}else if(r)return-1;else if(i)return 1;let a=e.order||0,o=t.order||0;return a===o?(e.title||``).localeCompare(t.title||``,`id`,{sensitivity:`base`}):a-o}).map(e=>{let n=e.category===`honeymoon`||e.title&&(e.title.toLowerCase().includes(`honeymoon`)||e.title.toLowerCase().includes(`bulan madu`))||isParentHoneymoon,r=e.price?i(e.price):``,a=n?`border: 1px solid #fbcfe8;`:`border:none;`,o=n?`background: linear-gradient(to bottom, #ffffff, #fdf2f8);`:`background:white;`,s=n?`box-shadow: 0 10px 25px -5px rgba(236,72,153,0.15), 0 8px 10px -6px rgba(236,72,153,0.05);`:`box-shadow:0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04);`,c=n?`this.style.boxShadow='0 20px 25px -5px rgba(236,72,153,0.25), 0 10px 10px -5px rgba(236,72,153,0.1)'`:`this.style.boxShadow='0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'`,l=n?`this.style.boxShadow='0 10px 25px -5px rgba(236,72,153,0.15), 0 8px 10px -6px rgba(236,72,153,0.05)'`:`this.style.boxShadow='0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)'`,u=n?`<span style="position:absolute; top:8px; left:8px; background:linear-gradient(135deg, #ec4899, #be185d); color:white; font-size:clamp(0.55rem, 2vw, 0.65rem); font-weight:800; padding:3px 8px; border-radius:14px; text-transform:uppercase; letter-spacing:0.5px; z-index:2; box-shadow:0 4px 10px rgba(236,72,153,0.3);"><i class="fa-solid fa-heart" style="margin-right:3px;"></i>Honeymoon</span>`:``,d=e.rating?`<span style="position:absolute; ${n?`top:34px;`:`top:8px;`} left:8px; background:rgba(255,255,255,0.95); color:#f59e0b; font-weight:800; font-size:clamp(0.68rem, 2vw, 0.78rem); padding:2px 7px; border-radius:14px; z-index:2; box-shadow:0 2px 4px rgba(0,0,0,0.1);"><i class="fa-solid fa-star" style="margin-right:3px;"></i>${e.rating}</span>`:``;return`
            <div class="sub-package-card" style="${o} ${a} border-radius:16px; overflow:hidden; ${s} cursor:pointer; display:flex; flex-direction:column; min-width:0; width:100%; box-sizing:border-box; transition: transform 0.3s ease, box-shadow 0.3s ease;"
                 onmouseover="this.style.transform='translateY(-5px)'; ${c};"
                 onmouseout="this.style.transform='translateY(0)'; ${l};"
                 onclick="openTourModal('${e.id}');">
                <!-- Image -->
                <div style="position:relative; height:clamp(120px, 34vw, 175px); overflow:hidden;">
                    ${u}
                    ${d}
                    <button onclick="event.stopPropagation(); window.shareItem('${e.id}', '${e.title.replace(/'/g,`\\'`)}', '${i(e.price)}')" style="position:absolute; top:8px; right:8px; background:rgba(255,255,255,0.92); color:var(--primary-blue); border:none; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Bagikan"><i class="fa-solid fa-share-nodes" style="font-size:0.75rem;"></i></button>
                    <button id="btn-wishlist-${e.id}" onclick="event.stopPropagation(); window.toggleWishlist('${e.id}')" style="position:absolute; top:8px; right:40px; background:rgba(255,255,255,0.92); color:var(--text-gray); border:none; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Simpan ke Wishlist"><i class="${window.isInWishlist&&window.isInWishlist(e.id)?`fa-solid`:`fa-regular`} fa-heart" ${window.isInWishlist&&window.isInWishlist(e.id)?`style="color:#ef4444;"`:``} style="font-size:0.75rem;"></i></button>
                    <img src="${e.imageUrl||t.imageUrl}" alt="${e.title}"
                        style="width:100%; height:100%; object-fit:cover; transition: transform 0.5s ease;"
                        onmouseover="this.style.transform='scale(1.08)'"
                        onmouseout="this.style.transform='scale(1)'"
                        onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600'">
                    ${r?`<div style="position:absolute; bottom:8px; right:8px; background:rgba(255, 255, 255, 0.95); backdrop-filter:blur(4px); color:#0f172a; font-size:clamp(0.62rem, 2.3vw, 0.72rem); font-weight:800; padding:3px 7px; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.4);">${r} <span style="font-size:0.48rem; font-weight:600; color:#64748b;">/orang</span></div>`:``}
                </div>
                <!-- Content -->
                <div style="padding:10px 12px; display:flex; flex-direction:column; flex:1;">
                    <h4 style="margin:0 0 6px; font-size:clamp(0.82rem, 2.7vw, 0.95rem); font-weight:800; color:#0f172a; line-height:1.35;">${e.title}</h4>
                    <div style="display:flex; gap:2px; margin-bottom:8px; align-items:center; flex-wrap:wrap;">
                        ${(()=>{let t=parseFloat(e.rating)||5,n=``;for(let e=0;e<5;e++)n+=e<Math.round(t)?`<i class="fa-solid fa-star" style="color:#fbbf24; font-size:0.65rem;"></i>`:`<i class="fa-regular fa-star" style="color:#cbd5e1; font-size:0.65rem;"></i>`;let r=e.reviewCount?`(${e.reviewCount})`:`(Top)`;return`${n} <span style="font-size:0.75rem; font-weight:700; color:#d97706; margin-left:3px;">${e.rating||`5.0`}</span> <span style="font-size:0.65rem; color:#64748b; margin-left:3px; font-weight:500; white-space:nowrap;">${r}</span>`})()}
                    </div>
                    <div style="margin-top:auto; padding-top:8px; border-top:1px dashed ${n?`#fbcfe8`:`#e2e8f0`}; text-align:center;">
                        <span style="color:${n?`#db2777`:`#0ea5e9`}; font-size:clamp(0.72rem, 2.4vw, 0.82rem); font-weight:700; display:flex; align-items:center; justify-content:center; gap:5px; transition: color 0.2s ease;">
                            Lihat Detail <i class="fa-solid fa-arrow-right" style="font-size:0.75rem;"></i>
                        </span>
                    </div>
                </div>
            </div>`}).join(``),l.style.display=`block`,document.body.style.overflow=`hidden`)},window.closeSubPackageModal=()=>{let e=document.getElementById(`sub-package-modal`);e&&(e.style.display=`none`);let t=document.getElementById(`tour-modal`);if(!(t&&t.classList.contains(`active`))){document.body.style.overflow=``;let e=document.getElementById(`ai-chat-widget`);e&&(e.style.display=``)}};var h=(e,t=0)=>{let n=e.category===`motorcycle`?`fa-motorcycle`:`fa-car`,r=e.category===`motorcycle`?`Motor`:`Mobil`,a=``;e.seats&&(a+=`<span class="fleet-tag"><i class="fa-solid fa-user-group"></i> ${e.seats} ${e.category===`motorcycle`?`Helm`:`Seat`}</span>`),e.transmission&&(a+=`<span class="fleet-tag"><i class="fa-solid fa-gear"></i> ${e.transmission}</span>`),e.driverOptions&&(a+=`<span class="fleet-tag"><i class="fa-solid fa-id-card"></i> ${e.driverOptions}</span>`);let o=``;e.include&&(o=e.include.split(`
`).filter(e=>e.trim()).map(e=>`<li><i class="fa-solid fa-check"></i> ${e.trim()}</li>`).join(``)),e.description&&!e.include&&(o=`<li><i class="fa-solid fa-check"></i> ${e.description}</li>`);let s=e.rating?`<span style="position:absolute; top:10px; left:10px; background:rgba(255,255,255,0.95); color:#f59e0b; font-weight:800; font-size:0.8rem; padding:4px 10px; border-radius:20px; z-index:2; box-shadow:0 2px 4px rgba(0,0,0,0.1);"><i class="fa-solid fa-star" style="margin-right:4px;"></i>${e.rating}</span>`:``;return`
    <div class="card package-card fleet-card-v2" data-aos="fade-up" data-aos-delay="${t%3*100}">
        <div class="img-wrapper" style="position:relative;">
            <button onclick="window.shareItem('${e.id}', '${e.title.replace(/'/g,`\\'`)}', '${i(e.price)}')" style="position:absolute; top:10px; right:10px; background:rgba(255,255,255,0.9); color:var(--primary-blue); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Bagikan"><i class="fa-solid fa-share-nodes"></i></button>
            <button id="btn-wishlist-${e.id}" onclick="event.stopPropagation(); window.toggleWishlist('${e.id}')" style="position:absolute; top:10px; right:50px; background:rgba(255,255,255,0.9); color:var(--text-gray); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Simpan ke Wishlist"><i class="${window.isInWishlist&&window.isInWishlist(e.id)?`fa-solid`:`fa-regular`} fa-heart" ${window.isInWishlist&&window.isInWishlist(e.id)?`style="color:#ef4444;"`:``}></i></button>
            <span class="tag"><i class="fa-solid ${n}" style="margin-right: 4px;"></i> ${r}</span>
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
                                  <div style="font-size: 0.7rem; color: #64748b;">Mulai dari</div>
                                  <div style="color: var(--primary-blue); font-weight: 800; font-size: 1.05rem; white-space: nowrap;">${i(e.price)}</div>
                                  <div style="font-size: 0.65rem; color: #64748b; font-weight: 500;">/ ${e.duration||`hari`}</div>
                      </div>
                  </div>
                <div class="action-buttons">
                    <button onclick="openTourModal('${e.id}')" class="btn" style="background: var(--bg-light); color: var(--primary-blue); border: none; font-size: 0.85rem; padding: 8px 16px; border-radius: 20px; font-weight: 700;">DETAIL</button>
                    <button onclick="openCheckoutModal('${e.title.replace(/'/g,`\\'`)}', ${e.price}, 'wa')" class="btn btn-green" style="padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 0.85rem; box-shadow: 0 4px 6px rgba(5,150,105,0.2);"><i class="fa-brands fa-whatsapp"></i></button>
                </div>
            </div>

        </div>
    </div>
    `},g=(e,t=0)=>{let n=``,r=!1,a=``,o=e.droneVideoUrl||``;if(o)try{let e=new URL(o);if(e.hostname.includes(`youtube.com`)){let t=``;t=e.pathname.startsWith(`/shorts/`)||e.pathname.startsWith(`/embed/`)?e.pathname.split(`/`)[2]:e.searchParams.get(`v`),t&&(n=`https://www.youtube.com/embed/${t}?rel=0`)}else e.hostname.includes(`youtu.be`)?n=`https://www.youtube.com/embed/${e.pathname.slice(1)}?rel=0`:o.endsWith(`.mp4`)?n=o:(r=!0,a=o)}catch{o.length===11?n=`https://www.youtube.com/embed/${o}?rel=0`:(r=!0,a=o)}let s=window.isDroneAvailable===!1?``:`<a href="https://wa.me/6289676963255?text=Halo%20Admin,%20saya%20ingin%20pesan%20${encodeURIComponent(e.title)}" target="_blank" class="btn btn-green w-100"><i class="fa-brands fa-whatsapp"></i> PESAN SEKARANG</a>`,c=``;if(e.date)try{c=`<div style="font-size: 0.85rem; color: #64748b; margin-bottom: 8px;"><i class="fa-regular fa-calendar" style="margin-right: 5px;"></i> ${new Date(e.date).toLocaleDateString(`id-ID`,{year:`numeric`,month:`long`,day:`numeric`})}</div>`}catch{}let l=`<img src="${e.imageUrl||`https://images.unsplash.com/photo-1579822606820-25e2e8e34272?auto=format&fit=crop&q=80&w=800`}" alt="${e.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 20px 20px 0 0;" onerror="this.src='https://images.unsplash.com/photo-1579822606820-25e2e8e34272?auto=format&fit=crop&q=80&w=800'">`;return n?l=n.endsWith(`.mp4`)?`<video width="100%" height="100%" controls style="border-radius: 20px 20px 0 0; object-fit: contain; background: #000;"><source src="${n}" type="video/mp4">Your browser does not support HTML video.</video>`:`<iframe width="100%" height="100%" src="${n}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 20px 20px 0 0; background: #000;"></iframe>`:r&&(l+=`
            <div onclick="window.openVideoModal('${a}')" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); text-decoration: none; color: white; border-radius: 20px 20px 0 0; transition: all 0.3s ease; cursor: pointer;" onmouseover="this.style.background='rgba(0,0,0,0.3)'" onmouseout="this.style.background='rgba(0,0,0,0.5)'">
                <div style="text-align: center;">
                    <i class="fa-solid fa-play" style="font-size: 3.5rem; margin-bottom: 10px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));"></i>
                    <div style="font-weight: 800; letter-spacing: 1px; font-size: 1.1rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">TONTON VIDEO</div>
                </div>
            </div>
        `),`
    <div class="card drone-card" data-aos="fade-up" data-aos-delay="${t%3*100}">
        <div class="img-wrapper" style="height: ${n&&n.endsWith(`.mp4`)?`auto; min-height: 200px`:`250px`}; position: relative;">
            <button onclick="window.shareItem('${e.id}', '${e.title.replace(/'/g,`\\'`)}', '${i(e.price)}')" style="position:absolute; top:10px; right:10px; background:rgba(255,255,255,0.9); color:var(--primary-blue); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Bagikan"><i class="fa-solid fa-share-nodes"></i></button>
            <button id="btn-wishlist-${e.id}" onclick="event.stopPropagation(); window.toggleWishlist('${e.id}')" style="position:absolute; top:10px; right:50px; background:rgba(255,255,255,0.9); color:var(--text-gray); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:2; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Simpan ke Wishlist"><i class="${window.isInWishlist&&window.isInWishlist(e.id)?`fa-solid`:`fa-regular`} fa-heart" ${window.isInWishlist&&window.isInWishlist(e.id)?`style="color:#ef4444;"`:``}></i></button>
            ${l}
        </div>
        <div class="content" style="padding: 20px;">
            <h3 style="color: var(--primary-blue); font-size: 1.2rem; margin-bottom: 5px;">${e.title}</h3>
            ${c}
            <p style="color: var(--text-gray); font-size: 0.9rem; margin-bottom: 25px;">${(e.description||``).replace(/\n/g,`<br>`)}</p>
            ${s}
        </div>
    </div>
    `};window.closeComingSoonModal=()=>{let e=document.getElementById(`coming-soon-modal`);e&&(e.style.animation=`reviewFadeOut 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards`,setTimeout(()=>{e.style.display=`none`,e.style.animation=``},200))};var _=async()=>{window.isDroneAvailable=!0;try{let e=await fetch(`/api/settings?_t=${new Date().getTime()}`,{cache:`no-store`});if(e.ok){let t=await e.json();if(window.globalSettings=t,t.maintenanceMode===!0&&!window.location.pathname.includes(`/admin`)){document.body.innerHTML=`
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
                `;return}if(t.droneAvailable===`unavailable`){window.isDroneAvailable=!1;let e=document.getElementById(`drone-main-book-btn`);e&&(e.removeAttribute(`href`),e.style.background=`#cbd5e1`,e.style.cursor=`not-allowed`,e.style.borderColor=`#cbd5e1`,e.innerHTML=`<i class="fa-solid fa-lock"></i> LAYANAN BELUM TERSEDIA`)}if(t.dronePrice){let e=document.getElementById(`drone-base-price`);e&&(e.innerText=i(t.dronePrice).replace(`Rp `,``))}t.comingSoonEnabled===!0&&!window.location.pathname.includes(`/admin`)&&setTimeout(()=>{let e=document.getElementById(`coming-soon-modal`);if(e||(document.body.insertAdjacentHTML(`beforeend`,`
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
                            `),e=document.getElementById(`coming-soon-modal`),window._csExpandDetail=()=>{let e=document.getElementById(`cs-detail-panel`),t=document.getElementById(`cs-btn-group-compact`),n=document.getElementById(`cs-btn-group-expanded`),r=document.getElementById(`cs-scrollable`),i=document.getElementById(`coming-soon-modal-desc-full`);if(e&&(e.style.display=`block`),t&&(t.style.display=`none`),n&&(n.style.display=`block`),i&&window._csFullText&&!window._csTyped){window._csTyped=!0,i.innerHTML=`<span class="cs-typewriter-cursor">|</span>`;let e=0,t=window._csFullText;function n(){e<t.length?(i.innerHTML=t.substring(0,e+1)+`<span class="cs-typewriter-cursor">|</span>`,e++,setTimeout(n,15),r&&r.scrollTo({top:r.scrollHeight,behavior:`auto`})):(i.innerHTML=t,r&&r.scrollTo({top:r.scrollHeight,behavior:`smooth`}))}setTimeout(n,100)}else setTimeout(()=>{r&&r.scrollTo({top:r.scrollHeight,behavior:`smooth`})},100)}),e){t.comingSoonImage&&(document.getElementById(`coming-soon-modal-img`).src=t.comingSoonImage,document.getElementById(`coming-soon-modal-img`).style.display=`block`),t.comingSoonTitle&&(document.getElementById(`coming-soon-modal-title`).innerText=t.comingSoonTitle),t.comingSoonDesc&&(document.getElementById(`coming-soon-modal-desc-preview`).innerText=t.comingSoonDesc,window._csFullText=t.comingSoonDesc,window._csTyped=!1,document.getElementById(`coming-soon-modal-desc-full`).innerText=``);let n=localStorage.getItem(`cs_hide_until`);if(n&&Date.now()<parseInt(n)||(e.style.display=`flex`),t.comingSoonDate){let e=()=>{let e=new Date(t.comingSoonDate).getTime()-new Date().getTime();if(e<0){window.comingSoonInterval&&clearInterval(window.comingSoonInterval),[`cs-days`,`cs-hours`,`cs-minutes`,`cs-seconds`].forEach(e=>{let t=document.getElementById(e);t&&(t.innerText=`00`)});return}let n=Math.floor(e/864e5),r=Math.floor(e%864e5/36e5),i=Math.floor(e%36e5/6e4),a=Math.floor(e%6e4/1e3),o=document.getElementById(`cs-seconds`);o&&(o.style.animation=`none`,o.offsetHeight,o.style.animation=`csCountPop 0.3s ease-out`);let s=e=>e<10?`0`+e:e;document.getElementById(`cs-days`).innerText=s(n),document.getElementById(`cs-hours`).innerText=s(r),document.getElementById(`cs-minutes`).innerText=s(i),document.getElementById(`cs-seconds`).innerText=s(a)};e(),window.comingSoonInterval=setInterval(e,1e3)}}},800)}}catch(e){console.error(`Failed to fetch settings`,e)}document.getElementById(`services-container`),document.getElementById(`fleet-container`),n=await a();let r=n&&Array.isArray(n)?n.filter(e=>Number(e.price||0)>0&&!e.isParent):[];window.globalItems=r.length>0?r:t,document.getElementById(`chat-messages`)&&y!==void 0&&y.length>0&&window.renderChatHistory();try{let t=await fetch(`${e}/bookings?public=true`);t.ok?window.globalBookings=await t.json():window.globalBookings=[]}catch(e){console.error(`Failed to fetch bookings`,e),window.globalBookings=[]}try{if(!window.allReviewsData){let t=await fetch(`${e}/reviews`);t.ok&&(window.allReviewsData=await t.json())}window.allReviewsData&&n.forEach(e=>{let t=n.filter(t=>t.parentId===e.id).map(e=>e.id),r=window.allReviewsData.filter(n=>n.status===`approved`&&!!(n.itemId===e.id||t.length>0&&t.includes(n.itemId))),i=new Set,a=[];r.forEach(e=>{let t=e.userId?`u_`+e.userId:e.name&&e.name.trim().toLowerCase()!==`pelanggan terverifikasi`?`n_`+e.name.trim().toLowerCase():`id_`+e.id;i.has(t)||(i.add(t),a.push(e))}),a.length>0&&(e.rating=(a.reduce((e,t)=>e+t.rating,0)/a.length).toFixed(1).replace(`.0`,``),e.reviewCount=a.length)})}catch(e){console.error(`Failed to fetch reviews for items`,e)}new Set(n.filter(e=>e.parentId).map(e=>e.id));let o=n.filter(e=>!e.parentId),s=o.filter(e=>{let t=e.category.toLowerCase();return t.includes(`paket`)||t===`package`||t===`tour`||t===`honeymoon`}),c=o.filter(e=>{let t=e.category.toLowerCase();return(t.includes(`rental`)||t.includes(`armada`)||t.includes(`sewa`)||t===`car`)&&t!==`motorcycle`}),l=o.filter(e=>e.category.toLowerCase()===`motorcycle`),u=o.filter(e=>e.category.toLowerCase()===`drone`),d=o.filter(e=>e.category.toLowerCase()===`transfer`),_=o.filter(e=>!s.includes(e)&&!c.includes(e)&&!l.includes(e)&&!u.includes(e)&&!d.includes(e)),v=(e,t,n,r=null)=>{let i=document.getElementById(e);if(!i)return;if(t.length===0){i.innerHTML=`<p class="text-center w-100" style="grid-column: 1/-1;">Belum ada data yang ditambahkan.</p>`;return}let a=r;a===null&&(a=(window.innerWidth>=1200?e.includes(`cars`)||e.includes(`motor`)?4:3:2)*2);let o=``;if(t.forEach((e,t)=>{let r=t>=a,i=n(e,t);r&&(i=i.replace(/(<div\s+)/,`$1data-hidden="true" style="display: none;" `)),o+=i}),i.innerHTML=o,t.length>a){let n=`
            <div class="text-center w-100 mt-4 show-all-wrapper" style="grid-column: 1/-1;">
                <button onclick="toggleShowAll('${e}', this, ${t.length})" class="btn" style="background: var(--bg-light); color: var(--primary-blue); border: 2px solid var(--primary-blue); font-weight: 700; padding: 10px 25px; border-radius: 30px; transition: all 0.3s;">
                    Lihat Semuanya (${t.length}) <i class="fa-solid fa-chevron-down" style="margin-left: 5px;"></i>
                </button>
            </div>
            `;i.insertAdjacentHTML(`beforeend`,n)}};v(`services-container`,[..._,...d],(e,t)=>e.category.toLowerCase()===`transfer`&&e.transferMatrix&&e.transferMatrix.length>0?p(e,t):f(e,t));let b=e=>{let t=e.match(/(pakets+([a-z])(s+(d+))?s*)/i);return t||=e.match(/pakets+([a-z])(s+(d+))?(?:s|$)/i),t?`${t[1].toUpperCase()}-${t[3]?parseInt(t[3]).toString().padStart(5,`0`):`00001`}`:e.toLowerCase()},x=[...s].sort((e,t)=>b(e.title).localeCompare(b(t.title))),S=x.filter(e=>e.isParent===!0),C=x.filter(e=>!e.isParent),w=document.getElementById(`paket-pilihan`),T=document.getElementById(`parent-packages-container`);T&&S.length>0&&(w&&(w.style.display=`block`),T.innerHTML=S.map((e,t)=>`
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
        </div>`).join(``)),v(`packages-container`,C,m,6),v(`cars-container`,c,h,4),v(`motorcycles-container`,l,h,4),v(`drone-container`,u,g)};window.generateEtiketPDF=e=>{if(!e){alert(`Data tiket tidak ditemukan, cek status dulu.`);return}let t=Number(e.itemPrice||e.price||0),n=Number(e.fullPrice||0),r=e.isDp===!0||e.isDp===`true`||n>0&&t>0&&n-t>5e4,i=`#dc2626`,a=`#fee2e2`,o=e.status||`UNKNOWN`,s=`&#10007;`;e.status===`PAID`||e.status===`COMPLETED`?(i=`#16a34a`,a=`#dcfce7`,s=`&#10003;`):e.status===`PENDING`?(i=`#d97706`,a=`#fef3c7`,s=`&#9203;`):e.status===`PROCESSING`&&(i=`#2563eb`,a=`#dbeafe`,s=`&#9881;`);let c=e=>{if(!e)return`-`;try{return new Date(e).toLocaleDateString(`id-ID`,{day:`2-digit`,month:`long`,year:`numeric`})}catch{return e}},l=e.transactionId&&e.transactionId.startsWith(`ORD-`),u=e.transactionId&&e.transactionId.startsWith(`BKG-`),d=(e.itemName||``).toLowerCase(),f=`Reservasi`;u||d.includes(`transfer`)||d.includes(`rental`)||d.includes(`sewa`)||d.includes(`mobil`)||d.includes(`motor`)?f=`Rental & Transfer`:l&&(f=(e.paymentMethod||``).toLowerCase()===`va`?`Paket Tour / Virtual Account`:`Paket Tour / QRIS`);let p=new Date().toLocaleDateString(`id-ID`,{day:`2-digit`,month:`long`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}),m=window.location.origin+`/logo.png`,h=d.includes(`12 jam`)||d.includes(`include driver`);h&&(f=`Sewa Mobil + Driver (12 Jam)`);let g=0,_=window.globalItems?window.globalItems.find(t=>t.title===(e.itemName||``)):null,v=d.includes(`mobil`)||d.includes(`avanza`)||d.includes(`innova`)||d.includes(`hiace`)||d.includes(`brio`)||d.includes(`xpander`)||d.includes(`alphard`)||d.includes(`fortuner`),y=d.includes(`motor`);(d.includes(`airport`)||d.includes(`transfer`)||d.includes(`tour`)||d.includes(`paket`))&&(v=!1,y=!1),_&&_.category&&(_.category===`car`?v=!0:_.category===`motorcycle`?y=!0:(v=!1,y=!1)),y?g=5e5:v&&(g=1e6);let b=h||d.includes(`driver`)||d.includes(`supir`)||d.includes(`dengan supir`),x=window.globalItems?window.globalItems.find(t=>t.title===(e.itemName||``)):null;x&&x.driverOptions&&x.driverOptions!==`Tidak Include Driver`&&(b=!0),b&&(g=0);let S=2e5;y?S=5e4:(d.includes(`tour`)||d.includes(`paket`))&&(S=5e5);let C=S;if(t>0){let e=t-g;e>6500&&(e.toString().endsWith(`500`)||e%1e3!=0)&&(e-=6500),e>0&&e<(n||1/0)&&(C=e)}let w=n>0?Math.max(0,n-C):0,T=e.status===`COMPLETED`,E=r&&!T;E&&(e.status===`PAID`?(i=`#16a34a`,a=`#dcfce7`,o=`DP TERBAYAR (BELUM LUNAS)`,s=`&#10003;`):e.status===`PENDING`?(i=`#ea580c`,a=`#fff7ed`,o=`MENUNGGU PEMBAYARAN DP`,s=`&#9203;`):e.status===`PROCESSING`&&(i=`#2563eb`,a=`#dbeafe`,o=`DP SEDANG DIPROSES`,s=`&#9881;`));let D=``;g>0&&(D=`
            <div style="background:#e0f2fe;border-left:4px solid #38bdf8;padding:8px 16px;margin-bottom:12px;border-radius:4px;">
                <div style="font-size:10px;font-weight:700;color:#0369a1;margin-bottom:2px;">&#8505; Catatan Deposit</div>
                <div style="font-size:10px;color:#0c4a6e;line-height:1.4;">Total pembayaran <b>sudah termasuk uang deposit</b> sebesar <strong>Rp ${g.toLocaleString(`id-ID`)}</strong>. Deposit akan dikembalikan 100% setelah masa sewa berakhir jika kondisi unit baik.</div>
            </div>`);let O=document.createElement(`div`);O.style.cssText=`
        width:794px; background:#fff; margin:0; padding:0;
        font-family:'Segoe UI',Arial,sans-serif; font-size:14px; color:#1e293b;
        box-sizing:border-box; display:flex; flex-direction:column; overflow:hidden;
    `,O.innerHTML=`
<div style="background:linear-gradient(135deg,#1d4ed8 0%,#0369a1 60%,#0891b2 100%);padding:18px 30px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;margin:0;width:100%;box-sizing:border-box;">
            <div style="display:flex;align-items:center;gap:16px;">
                <img src="${m}" crossorigin="anonymous"
                     style="width:60px;height:60px;border-radius:12px;background:#fff;
                            padding:6px;object-fit:contain;flex-shrink:0;">
                <div>
                    <div style="color:#fff;font-size:21px;font-weight:800;line-height:1.2;">Travel Lombok Airport</div>
                    <div style="color:rgba(255,255,255,0.75);font-size:11px;margin-top:2px;">Tour &amp; Travel Lombok &middot; www.travellombokairport.com</div>
                </div>
            </div>
            <div style="text-align:right;color:#fff;">
                <div style="font-size:11px;opacity:0.7;text-transform:uppercase;letter-spacing:1px;">${r?`Bukti Pembayaran DP`:`Bukti Pembayaran`}</div>
                <div style="font-size:28px;font-weight:900;letter-spacing:-1px;line-height:1.1;">${r?`e-Tiket DP`:`e-Tiket`}</div>
            <div style="font-size:11px;opacity:0.65;font-family:monospace;margin-top:3px;">${e.transactionId}</div>
            </div>
        </div>
        <div style="background:${a};border-left:5px solid ${i};padding:8px 30px;display:flex;align-items:center;gap:12px;flex-shrink:0;width:100%;box-sizing:border-box;">
            <div style="width:10px;height:10px;border-radius:50%;background:${i};flex-shrink:0;"></div>
            <div style="font-size:12px;font-weight:700;color:${i};">STATUS: ${o}</div>
            <div style="font-size:10px;color:#475569;margin-left:auto;">Diterbitkan: ${p}</div>
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
                    <div style="width:52px;height:52px;border-radius:50%;background:${a};
                                border:2px solid ${i};display:flex;align-items:center;
                                justify-content:center;font-size:22px;color:${i};font-weight:700;">
                        ${s}
                    </div>
                    <div style="font-size:10px;font-weight:800;color:#ffffff;
                                text-transform:uppercase;letter-spacing:1px;margin-top:2px;text-shadow: 0 1px 2px rgba(0,0,0,0.2);">${o}</div>
                </div>
            </div>

            ${E?`
            <div style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2px solid #f59e0b;border-radius:10px;padding:12px 16px;margin-bottom:12px;display:flex;align-items:flex-start;gap:12px;">
                <div style="width:36px;height:36px;background:#f59e0b;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;color:white;font-weight:900;">
                    💳
                </div>
                <div style="flex:1;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <div style="font-size:11px;font-weight:800;color:#b45309;text-transform:uppercase;letter-spacing:0.8px;">
                            ${e.status===`PAID`?`✓ Pembayaran DP Diterima (Belum Lunas)`:`&#9888; Tagihan Pembayaran DP`}
                        </div>
                        <span style="background:${e.status===`PAID`?`#16a34a`:`#d97706`};color:white;padding:2px 8px;border-radius:12px;font-size:9px;font-weight:800;">
                            ${e.status===`PAID`?`DP TERBAYAR`:`MENUNGGU PEMBAYARAN`}
                        </span>
                    </div>
                    
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0;background:white;padding:8px 12px;border-radius:6px;border:1px solid #fde68a;">
                        <div>
                            <div style="font-size:9px;color:#78350f;font-weight:600;text-transform:uppercase;">Total Biaya Sewa</div>
                            <div style="font-size:13px;font-weight:800;color:#1e293b;">${n>0?`Rp `+Number(n).toLocaleString(`id-ID`):`-`}</div>
                        </div>
                        <div>
                            <div style="font-size:9px;color:#78350f;font-weight:600;text-transform:uppercase;">DP ${e.status===`PAID`?`Sudah Diterima`:`Yang Harus Dibayar`}</div>
                            <div style="font-size:13px;font-weight:800;color:${e.status===`PAID`?`#16a34a`:`#d97706`};">Rp ${Number(C).toLocaleString(`id-ID`)}</div>
                        </div>
                        <div style="grid-column:1/-1;border-top:1px dashed #cbd5e1;padding-top:6px;display:flex;justify-content:space-between;align-items:center;">
                            <div style="font-size:10px;color:#b45309;font-weight:700;">SISA TAGIHAN WAJIB DILUNASI:</div>
                            <div style="font-size:14px;font-weight:900;color:#dc2626;">Rp ${Number(w).toLocaleString(`id-ID`)}</div>
                        </div>
                    </div>
                    
                    <div style="font-size:10px;color:#78350f;line-height:1.5;">
                        📌 <strong>Instruksi Pelunasan:</strong> Sisa tagihan sebesar <strong>Rp ${Number(w).toLocaleString(`id-ID`)}</strong> dapat dilunasi secara tunai atau transfer kepada driver / tim kami saat penjemputan / serah terima unit di lokasi.
                    </div>
                </div>
            </div>`:``}
            ${D}

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
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${f}</div>
                </div>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Tanggal Pelaksanaan</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${c(e.startDate||e.details?.date)}</div>
                </div>
                ${e.endDate&&!h?`
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Tanggal Selesai</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${c(e.endDate)}</div>
                </div>
                `:``}
                ${h?`
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Durasi Layanan</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${e.startDate===e.endDate||!e.endDate?`12 Jam Pemakaian`:`Paket 12 Jam Per Hari`}</div>
                </div>
                `:`
                ${e.details?.time?`
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Jam Pengambilan</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${e.details.pickupTime||e.details.time}</div>
                </div>
                `:``}
                ${e.details?.dropoffTime?`
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">Jam Pengembalian</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${e.details.dropoffTime}</div>
                </div>
                `:``}
                `}
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
                                letter-spacing:0.8px;margin-bottom:5px;">${h?`Lokasi Penjemputan`:`Lokasi Jemput`}</div>
                    <div style="font-size:13px;font-weight:700;color:#1e293b;">${e.details.pickup}</div>
                </div>
                `:``}
                ${e.details?.dropoff?`
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:13px 15px;grid-column:1/-1;">
                    <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                                letter-spacing:0.8px;margin-bottom:5px;">${h?`Lokasi Pengantaran / Selesai`:`Tujuan / Drop-off`}</div>
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
                ${E?`
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:12px 15px;">
                    <div style="font-size:10px;color:#166534;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:5px;">DP ${e.status===`PAID`?`Terbayar`:`Harus Dibayar`}</div>
                    <div style="font-size:14px;font-weight:800;color:${e.status===`PAID`?`#16a34a`:`#d97706`};">Rp ${Number(C).toLocaleString(`id-ID`)}</div>
                </div>
                <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:12px 15px;">
                    <div style="font-size:10px;color:#991b1b;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:5px;">Sisa Pelunasan di Lokasi</div>
                    <div style="font-size:14px;font-weight:800;color:#dc2626;">Rp ${Number(w).toLocaleString(`id-ID`)}</div>
                </div>
                `:``}
                ${e.endDate?(()=>{let t=(e.itemName||``).toLowerCase(),n=t.includes(`12 jam`)||t.includes(`include driver`),r=t.includes(`paket`)||t.includes(`tour`)||t.includes(`trip`)||t.includes(`honeymoon`)||e.transactionId&&e.transactionId.startsWith(`ORD-`),i=``;return i=n?e.startDate===e.endDate||!e.endDate?`Layanan sewa Include Driver berlaku selama <strong>12 Jam</strong> pada tanggal <strong>${c(e.startDate)}</strong>.`:`Layanan sewa Include Driver (12 Jam per hari) berakhir pada <strong>${c(e.endDate)}</strong>.`:r?`Paket/layanan berakhir pada <strong>${c(e.endDate)}</strong>.`:`Masa sewa berakhir pada <strong>${c(e.endDate)}</strong>.`,`
                    <div style="background:#eff6ff;border:1px solid #bae6fd;border-radius:8px;padding:8px 12px;grid-column:1/-1;display:flex;align-items:center;gap:10px;">
                        <div style="width:28px;height:28px;background:#0ea5e9;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px;">
                            ℹ️
                        </div>
                        <div>
                            <div style="font-size:10px;color:#0369a1;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">Info Waktu Berakhir</div>
                            <div style="font-size:12px;color:#0369a1;">${i}</div>
                        </div>
                    </div>
                    `})():``}
                ${(()=>{let t=window.globalEventSettings?window.globalEventSettings.eventMode===!0:!1;return e.details?.isEvent&&t&&!h?`
                    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:8px 12px;grid-column:1/-1;display:flex;align-items:center;gap:10px;">
                        <div style="width:28px;height:28px;background:#f97316;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px;">
                            🔥
                        </div>
                        <div>
                            <div style="font-size:10px;color:#c2410c;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">Periode Event (High Season)</div>
                            <div style="font-size:12px;color:#c2410c;">Dipesan saat periode Event dengan penyesuaian harga dan minimal sewa 4 hari.</div>
                        </div>
                    </div>
                    `:``})()}
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
                    <div style="font-size:10px;color:#64748b;margin-top:4px;">Dicetak: ${p}</div>
                    <div style="margin-top:6px;display:inline-flex;align-items:center;gap:5px;background:linear-gradient(135deg,#1d4ed8,#0891b2);border-radius:20px;padding:3px 10px;">
                        <span style="font-size:9px;color:#fff;font-weight:700;letter-spacing:0.5px;">&#127760; Dipesan melalui website www.travellombokairport.com</span>
                    </div>
                </div>
            </div>
        </div>
    `;let k=document.createElement(`div`);k.style.cssText=`position:absolute; left:0; top:0; width:794px; z-index:-9999; visibility:hidden; overflow:hidden; background:#fff; padding:0; margin:0;`,O.style.minHeight=`auto`,k.appendChild(O),document.body.appendChild(k);let A=O.offsetHeight+100,j={margin:0,filename:`e-Tiket_${e.transactionId}.pdf`,image:{type:`jpeg`,quality:.98},html2canvas:{scale:2,useCORS:!0,allowTaint:!0,logging:!1,backgroundColor:`#ffffff`,scrollY:0,windowY:0},jsPDF:{unit:`px`,format:[794,A],orientation:`portrait`,hotfixes:[`px_scaling`]},pagebreak:{mode:`avoid-all`}};html2pdf().set(j).from(O).save().then(()=>{document.body.removeChild(k)}).catch(e=>{document.body.removeChild(k),console.error(`PDF generation error:`,e)})},window.pasteOrderId=async()=>{let e=document.getElementById(`input-cek-orderan`);if(!e)return;let t=async()=>{try{let t=await navigator.clipboard.readText();return t&&t.trim()?(e.value=t.trim().toUpperCase(),e.focus(),Swal.fire({toast:!0,position:`top`,icon:`success`,title:`ID Pesanan Ditempel!`,text:t.trim().toUpperCase(),showConfirmButton:!1,timer:2e3,background:`#ffffff`,color:`#0f172a`}),!0):(Swal.fire({toast:!0,position:`top`,icon:`info`,title:`Papan Klip Kosong`,text:`Silakan salin ID pesanan Anda terlebih dahulu.`,showConfirmButton:!1,timer:2500}),!0)}catch{return Swal.fire({icon:`warning`,title:`Akses Dibatasi Browser`,html:`
                    <p style="font-size: 0.92rem; color: #475569; line-height: 1.5; margin-bottom: 12px;">
                        Browser Anda membatasi akses salinan otomatis.
                    </p>
                    <div style="background: #f8fafc; border: 1.5px dashed #cbd5e1; padding: 12px; border-radius: 12px; font-size: 0.88rem; color: #1e293b; text-align: left;">
                        👉 <strong>Cara alternatif:</strong><br>
                        Tahan (tekan lama) kolom input ID Pesanan, lalu pilih opsi <strong>"Tempel" / "Paste"</strong>.
                    </div>
                `,confirmButtonText:`Mengerti`,confirmButtonColor:`#059669`}),e.focus(),!1}},n=!1;try{navigator.permissions&&navigator.permissions.query&&(await navigator.permissions.query({name:`clipboard-read`})).state===`granted`&&(n=!0)}catch{}if(n){await t();return}Swal.fire({html:`
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
        `,showCancelButton:!0,confirmButtonText:`<i class="fa-solid fa-check"></i> Izinkan`,cancelButtonText:`Blokir`,confirmButtonColor:`#059669`,cancelButtonColor:`#94a3b8`,reverseButtons:!0,focusConfirm:!0,customClass:{popup:`modern-popup-radius`}}).then(async n=>{n.isConfirmed?await t():n.dismiss===Swal.DismissReason.cancel&&(Swal.fire({toast:!0,position:`top`,icon:`info`,title:`Akses Ditolak`,text:`Anda tetap dapat mengetik atau menempel manual ID pesanan.`,showConfirmButton:!1,timer:2200}),e.focus())})},window.cekStatusBooking=async(t,n=`booking`)=>{t.preventDefault();let r=n===`booking`?`input-cek-booking`:`input-cek-orderan`,i=n===`booking`?`btn-cek-booking`:`btn-cek-orderan`,a=document.getElementById(r),o=document.getElementById(i),s=a.value.trim();if(!s)return;let c=o.innerHTML;o.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> Mengecek...`,o.disabled=!0;try{let t=await fetch(`${e}/bookings/check/${s}?_t=${new Date().getTime()}`,{cache:`no-store`});if(t.ok){let e=await t.json(),n=`#ef4444`,r=`fa-circle-xmark`;e.status===`PAID`||e.status===`COMPLETED`?(n=`#10b981`,r=`fa-circle-check`):e.status===`PENDING`?(n=`#f59e0b`,r=`fa-clock`):e.status===`PROCESSING`&&(n=`#3b82f6`,r=`fa-gears`);let i=`🚗 Rental & Transfer (BKG-)`;(e.type===`order`||e.transactionId&&e.transactionId.startsWith(`ORD-`))&&(i=(e.paymentMethod||``).toLowerCase()===`va`||e.vaNumber?`🛒 Pesanan Tour / Virtual Account (ORD-)`:`🛒 Pesanan Tour / QRIS (ORD-)`);let a=``;e.status===`PROCESSING`?a=`
                <div style="margin-top: 15px; padding: 15px; background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #3b82f6; border-radius: 10px; text-align: left; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.05);">
                    <h5 style="color: #1e40af; margin: 0 0 6px; font-size: 0.9rem; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-circle-info"></i> Sedang Diproses
                    </h5>
                    <p style="color: #334155; font-size: 0.8rem; margin: 0; line-height: 1.5;">Pesanan Anda telah kami terima dan <b>sedang dalam tahap verifikasi serta penjadwalan</b> oleh tim profesional kami. Proses ini membutuhkan waktu yang singkat. Kami akan menghubungi Anda melalui WhatsApp jika diperlukan koordinasi lebih lanjut.</p>
                </div>`:e.status===`PENDING`?a=`
                <div style="margin-top: 15px; padding: 15px; background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 10px; text-align: left; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.05);">
                    <h5 style="color: #b45309; margin: 0 0 6px; font-size: 0.9rem; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-clock"></i> Menunggu Pembayaran
                    </h5>
                    <p style="color: #78350f; font-size: 0.8rem; margin: 0; line-height: 1.5;">Pesanan Anda telah tercatat, namun <b>pembayaran belum kami terima</b>. Silakan segera selesaikan pembayaran agar pesanan dapat kami proses lebih lanjut.</p>
                </div>`:e.status===`PAID`?a=`
                <div style="margin-top: 15px; padding: 15px; background: #ecfdf5; border: 1px solid #d1fae5; border-left: 4px solid #10b981; border-radius: 10px; text-align: left; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.05);">
                    <h5 style="color: #047857; margin: 0 0 6px; font-size: 0.9rem; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-check-double"></i> Pembayaran Berhasil
                    </h5>
                    <p style="color: #064e3b; font-size: 0.8rem; margin: 0; line-height: 1.5;">Terima kasih! Pembayaran Anda <b>telah berhasil kami verifikasi</b>. Tim kami akan segera menjadwalkan layanan Anda. Anda sudah dapat mengunduh e-Tiket sebagai bukti pemesanan yang sah.</p>
                </div>`:e.status===`COMPLETED`?a=`
                <div style="margin-top: 15px; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #64748b; border-radius: 10px; text-align: left; box-shadow: 0 4px 6px rgba(100, 116, 139, 0.05);">
                    <h5 style="color: #334155; margin: 0 0 6px; font-size: 0.9rem; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-flag-checkered"></i> Pesanan Selesai
                    </h5>
                    <p style="color: #1e293b; font-size: 0.8rem; margin: 0; line-height: 1.5;">Layanan untuk pesanan ini <b>telah selesai dilaksanakan</b>. Terima kasih telah mempercayakan perjalanan Anda bersama Travel Lombok Airport. Kami tunggu kedatangan Anda di perjalanan berikutnya!</p>
                </div>`:e.status===`KADALUARSA`&&(a=`
                <div style="margin-top: 15px; padding: 15px; background: #fef2f2; border: 1px solid #fee2e2; border-left: 4px solid #ef4444; border-radius: 10px; text-align: left; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.05);">
                    <h5 style="color: #b91c1c; margin: 0 0 6px; font-size: 0.9rem; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-triangle-exclamation"></i> Pesanan Kadaluarsa
                    </h5>
                    <p style="color: #7f1d1d; font-size: 0.8rem; margin: 0; line-height: 1.5;">Mohon maaf, pesanan ini <b>telah dibatalkan atau melewati batas waktu pembayaran</b>. Jika Anda masih membutuhkan layanan ini, silakan membuat pesanan baru melalui website kami.</p>
                </div>`);let o=`
                <div style="text-align: center; margin-bottom: 20px; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <div style="font-size: 3.5rem; color: ${n}; margin-bottom: 5px;">
                        <i class="fa-solid ${r}"></i>
                    </div>
                    <div>
                        <span style="background: ${n}; color: white; padding: 6px 16px; border-radius: 20px; font-weight: 800; font-size: 0.9rem; letter-spacing: 0.5px;">${e.status}</span>
                    </div>
                    <div style="font-size: 0.78rem; color: #64748b; background: #f8fafc; padding: 4px 12px; border-radius: 20px; border: 1px solid #e2e8f0; margin-top: 2px;">${i}</div>
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
                        <div style="font-weight: 700; color: #1e293b;">${e.startDate?new Date(e.startDate).toLocaleDateString(`id-ID`):`-`} ${e.endDate&&e.endDate!==e.startDate?`– `+new Date(e.endDate).toLocaleDateString(`id-ID`):``}</div>
                    </div>
                    ${e.price?`
                    <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #cbd5e1;">
                        <span style="font-size: 0.78rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Rincian Biaya</span>
                        <div style="font-size: 0.85rem; color: #334155; margin-top: 6px;">
                            ${(e.fullPrice||0)>0?`
                            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                                <span>Harga Layanan / Sewa:</span>
                                <strong>Rp ${Number(e.fullPrice+(e.promoDiscount||0)).toLocaleString(`id-ID`)}</strong>
                            </div>`:``}
                            ${(e.promoDiscount||0)>0?`
                            <div style="display: flex; justify-content: space-between; color: #16a34a; margin-bottom: 3px;">
                                <span>Diskon Promo (${e.promoCode||``}):</span>
                                <strong>-Rp ${Number(e.promoDiscount).toLocaleString(`id-ID`)}</strong>
                            </div>`:``}
                            ${(e.deposit||0)>0?`
                            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                                <span>Deposit (100% Refundable):</span>
                                <strong>Rp ${Number(e.deposit).toLocaleString(`id-ID`)}</strong>
                            </div>`:``}
                            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                                <span>Biaya Layanan:</span>
                                <strong>Rp 6.500</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-top: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0; font-weight: 700; color: #1d4ed8; font-size: 0.95rem;">
                                <span>${e.isDp?`Total Tagihan DP`:`Total Tagihan`}:</span>
                                <span>Rp ${Number(e.price).toLocaleString(`id-ID`)}</span>
                            </div>
                            ${e.isDp&&(e.fullPrice||0)>(e.dpAmount||e.price-6500-(e.deposit||0))?`
                            <div style="display: flex; justify-content: space-between; margin-top: 6px; color: #92400e; font-weight: 600; font-size: 0.85rem; background: #fffbeb; padding: 6px 8px; border-radius: 6px; border: 1px solid #fde68a;">
                                <span>Sisa Pelunasan di Lokasi:</span>
                                <span>Rp ${Number(e.fullPrice-(e.dpAmount||e.price-6500-(e.deposit||0))).toLocaleString(`id-ID`)}</span>
                            </div>`:``}
                        </div>
                    </div>`:``}
                </div>
                
                <div style="margin-top: 16px;">
                    <button onclick="Swal.close(); setTimeout(()=> { window.generateEtiketPDF(window._lastBookingData); }, 300)" style="width:100%; background: linear-gradient(135deg,#1d4ed8,#0891b2); color:#fff; border:none; border-radius:10px; padding:13px 20px; font-size:0.95rem; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                        <i class="fa-solid fa-file-pdf"></i> Unduh e-Tiket PDF
                    </button>
                </div>
                ${a}
            `;window._lastBookingData=e,Swal.fire({title:`Status Pesanan`,html:o,confirmButtonColor:`#22c55e`,confirmButtonText:`Tutup`,customClass:{container:`my-swal-container`}})}else{let e=`Pastikan ID Transaksi yang Anda masukkan benar (BKG-... atau ORD-...).`;try{let n=await t.json();n&&n.message&&(e=n.message)}catch{}Swal.fire({icon:`error`,title:`Tidak Ditemukan`,text:e,confirmButtonColor:`#22c55e`})}}catch(e){console.error(e),Swal.fire({icon:`error`,title:`Gagal`,text:`Terjadi kesalahan jaringan saat mengecek status.`,confirmButtonColor:`#22c55e`})}finally{o.innerHTML=c,o.disabled=!1,a.value=``}},window.addEventListener(`scroll`,()=>{let e=document.querySelector(`.navbar`);window.scrollY>50?e.classList.add(`scrolled`):e.classList.remove(`scrolled`)}),window.updateSubLayanan=()=>{let e=document.getElementById(`qb-layanan`).value,t=document.getElementById(`qb-sub-container`),r=document.getElementById(`qb-sub-layanan`);r.innerHTML=``;let i=[];if(e===`Sewa Mobil`)i=n.filter(e=>{let t=e.category.toLowerCase();return t.includes(`rental`)||t.includes(`armada`)||t.includes(`sewa`)||t===`car`}),i.length===0&&(i=[{title:`Toyota Avanza`},{title:`Toyota Innova Reborn`},{title:`Toyota Hiace Commuter`}]);else if(e===`Paket Tour`)i=n.filter(e=>{let t=e.category.toLowerCase();return t.includes(`paket`)||t===`package`}),i.length===0&&(i=[{title:`Paket Sasak Tour (1 Hari)`},{title:`Paket Explore Gili (1 Hari)`},{title:`Paket Honeymoon Romantis (3H2M)`},{title:`Paket Family Vacation (4H3M)`}]);else if(e===`Airport Transfer`){let e=n.filter(e=>{let t=e.category?.toLowerCase()||``;return t.includes(`antar jemput`)||t.includes(`transfer`)||t===`transfer`}),t=new Set;e.forEach(e=>{e.transferMatrix&&Array.isArray(e.transferMatrix)&&e.transferMatrix.forEach(e=>{let n=e.area;n&&!n.toLowerCase().includes(`airport`)&&(n=`Airport ⇔ ${n}`),e.area&&e.prices&&Object.keys(e.prices).length>0?Object.keys(e.prices).forEach(e=>{t.add(`${n} (${e})`)}):e.area&&t.add(n)})}),t.forEach(e=>{i.push({title:e})}),i.length===0&&(i=[{title:`Airport ⇔ Mataram Kota (Avanza)`},{title:`Airport ⇔ Mataram Kota (Innova)`},{title:`Airport ⇔ Senggigi (Avanza)`},{title:`Airport ⇔ Senggigi (Innova)`}])}i.length>0?(i.forEach(e=>{let t=document.createElement(`option`);t.value=e.title,t.textContent=e.title,r.appendChild(t)}),t.style.display=`block`):(t.style.display=`none`,r.innerHTML=`<option value='-'>-</option>`)},document.addEventListener(`DOMContentLoaded`,()=>{_().then(()=>{window.updateSubLayanan();let e=document.getElementById(`qb-tanggal`);if(e){e.addEventListener(`change`,e=>{let t=e.target.value,n=document.getElementById(`qb-sub-layanan`).value;!t||n===`-`||window.globalBookings&&window.globalBookings.length>0&&window.globalBookings.some(e=>e.startDate===t&&e.itemName===n&&(e.status===`PAID`||e.status===`CONFIRMED`||e.status===`PENDING`))&&(Swal.fire({icon:`warning`,title:`Tanggal Penuh`,text:`Maaf, layanan ini sudah terisi pada tanggal tersebut. Silakan pilih tanggal lain.`,confirmButtonColor:`#22c55e`}),e.target.value=``)});let t=document.getElementById(`qb-sub-layanan`);t&&t.addEventListener(`change`,()=>{e.value&&e.dispatchEvent(new Event(`change`))})}let t=new URLSearchParams(window.location.search).get(`item`);if(t&&n){let e=n.find(e=>e.id===t);if(e){let t=[`car`,`motorcycle`,`drone`].includes(e.category)?e.category===`motorcycle`?`motorcycles`:e.category===`drone`?`drones`:`cars`:`packages`,n=document.getElementById(t);n&&n.scrollIntoView({behavior:`smooth`,block:`center`}),window.history.replaceState({},document.title,window.location.pathname),openTourModal(e.id)}}})}),window.submitBooking=e=>{let t=document.getElementById(`qb-layanan`).value,n=document.getElementById(`qb-sub-layanan`).value,r=document.getElementById(`qb-tanggal`).value,i=document.getElementById(`qb-jumlah`).value;if(!r){Swal.fire({icon:`info`,title:`Pemberitahuan`,text:`Mohon pilih tanggal terlebih dahulu.`,confirmButtonColor:`#22c55e`});return}let a=0;if(n&&n!==`-`){if(t===`Sewa Mobil`||t===`Paket Tour`){let e=window.globalItems?window.globalItems.find(e=>e.title===n):null;e&&e.price&&(a=e.price)}else if(t===`Airport Transfer`){let e=window.globalItems?window.globalItems.filter(e=>{let t=e.category?.toLowerCase()||``;return t.includes(`antar jemput`)||t.includes(`transfer`)||t===`transfer`}):[],t=n.replace(`Airport ⇔ `,``),r=``,i=t.match(/(.*?)\s*\((.*?)\)$/);i&&(t=i[1].trim(),r=i[2].trim());for(let i of e){if(i.transferMatrix&&Array.isArray(i.transferMatrix))for(let e of i.transferMatrix){let i=e.area||``;if((i.trim()===t||i.trim()===n.replace(`Airport ⇔ `,``).trim())&&r&&e.prices&&e.prices[r]){a=Number(e.prices[r]);break}}if(a>0)break}}}let o=t;n&&n!==`-`&&(o=`${t} - ${n}`);let s=`${o} (${i} - ${r})`;if(e===`wa`)openCheckoutModal(s,a,`wa`);else{if(!window.checkAuthAndPrompt())return;openCheckoutModal(s,a,`web`)}},window.ensureTurnstileScript=()=>{if(window.turnstile||document.querySelector(`script[src*="challenges.cloudflare.com/turnstile"]`))return;let e=document.createElement(`script`);e.src=`https://challenges.cloudflare.com/turnstile/v0/api.js`,e.async=!0,e.defer=!0,document.head.appendChild(e)},window.initCheckoutTurnstile=()=>{window.ensureTurnstileScript(),window._checkoutTurnstileToken=``;let e=document.getElementById(`checkout-turnstile`);if(!e)return;e.innerHTML=``;let t=(e=0)=>{let n=document.getElementById(`checkout-turnstile`);if(n){if(window.turnstile&&typeof window.turnstile.render==`function`)try{if(window._checkoutTurnstileWidgetId!==void 0){try{window.turnstile.remove(window._checkoutTurnstileWidgetId)}catch{}window._checkoutTurnstileWidgetId=void 0}window._checkoutTurnstileWidgetId=window.turnstile.render(n,{sitekey:`0x4AAAAAAEY5_o0-MiC2wPpS`,theme:`light`,callback:e=>{window._checkoutTurnstileToken=e;let t=document.getElementById(`turnstile-error-msg`);t&&(t.style.display=`none`)},"expired-callback":()=>{window._checkoutTurnstileToken=``},"error-callback":()=>{window._checkoutTurnstileToken=``}})}catch(e){console.warn(`Turnstile render warning:`,e)}else e<30&&setTimeout(()=>t(e+1),200)}};setTimeout(()=>t(0),100)},window.closeCheckoutModal=()=>{if(window.activePollInterval&&(clearInterval(window.activePollInterval),window.activePollInterval=null),window.turnstile&&window._checkoutTurnstileWidgetId!==void 0){try{window.turnstile.remove(window._checkoutTurnstileWidgetId)}catch{}window._checkoutTurnstileWidgetId=void 0}window._checkoutTurnstileToken=``,sessionStorage.removeItem(`checkoutState`),window._checkoutActive=!1,window.removeEventListener(`beforeunload`,window._checkoutBeforeUnload),document.getElementById(`checkout-modal`).classList.remove(`active`)},window.openCheckoutModal=async(t,n,r=`web`)=>{let a=window.globalItems?window.globalItems.find(e=>e.title===t):null;if(window.currentCheckoutItemId=a?a.id:null,r!==`wa`&&!window.checkAuthAndPrompt())return;let o=document.getElementById(`checkout-modal-body`),s=n>0;s&&i(n);try{let n=(await(await fetch(`${e}/bookings?public=true&_t=${new Date().getTime()}`,{cache:`no-store`})).json()).filter(e=>{let n=e.itemName||``;return n?(n===t||t.includes(n)||n.includes(t))&&(e.status===`PAID`||e.status===`PENDING`):!1});window.currentBookings=n}catch(e){console.error(`Failed to fetch bookings:`,e)}let c=t.match(/(\d+)\s*H/i),l=c?parseInt(c[1]):0,u=`other`;a&&a.category&&(a.category===`car`?u=`mobil`:a.category===`motorcycle`?u=`motor`:a.category===`package`?u=`tour`:a.category===`airport`&&(u=`airport`));let d=t.toLowerCase();u===`other`&&(d.includes(`airport`)||d.includes(`jemput`)||d.includes(`antar`)||d.includes(`transfer`)?u=`airport`:d.includes(`motor`)?u=`motor`:d.includes(`mobil`)||d.includes(`avanza`)||d.includes(`innova`)||d.includes(`hiace`)||d.includes(`brio`)||d.includes(`xpander`)||d.includes(`alphard`)||d.includes(`fortuner`)?u=`mobil`:(d.includes(`paket`)||d.includes(`tour`))&&(u=`tour`));let f=u===`mobil`&&(d.includes(`12 jam`)||d.includes(`include driver`));window._is12HourDriver=f;let p=window.globalEventSettings||{eventMode:!1,eventPriceIncrease:0},m=p.eventMode&&p.eventPriceIncrease>0,h=u===`motor`||u===`mobil`,g=m&&h&&!f?p.eventPriceIncrease:0,_=`
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: ${r===`wa`?`#22c55e`:`var(--primary-blue)`};">${r===`wa`?`<i class="fa-brands fa-whatsapp"></i> Form Booking via WA`:s?`Checkout Pesanan`:`Form Booking`}</h2>
            <p style="color: #64748b; font-size: 0.9rem;">${r===`wa`?`Silakan lengkapi rincian booking Anda (Tanpa wajib login).`:s?`Selesaikan pesanan item Anda.`:`Lengkapi data untuk proses booking.`}</p>
        </div>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; border: 1px solid #e2e8f0;">
            <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 5px;">${r===`wa`?`Item Booking:`:s?`Item yang diorder:`:`Rincian Booking:`}</p>
            <h3 style="color: var(--text-dark); margin-bottom: 5px;">${t}</h3>
            ${s?`
                ${m&&h&&!f?`
                <div style="margin-bottom: 6px;">
                    <span id="co-crossed-price" style="text-decoration: line-through; color: #94a3b8; font-size: 0.9rem;">${i(n*4)}</span>
                    <span style="background: linear-gradient(135deg,#f59e0b,#ef4444); color: white; font-size: 0.7rem; font-weight: 700; padding: 2px 7px; border-radius: 10px; margin-left: 6px;">EVENT +${i(p.eventPriceIncrease)}</span>
                </div>
                <p id="co-display-price" data-base-price="${n}" data-event-increase="${g}" style="font-weight: bold; color: #ef4444; font-size: 1.25rem;">${i(n*4+g)} <span style="font-size:0.85rem;color:#64748b;font-weight:normal;">(4 Hari)</span></p>
                `:`<p id="co-display-price" data-base-price="${n}" data-event-increase="0" style="font-weight: bold; color: var(--primary-green); font-size: 1.1rem;">${i(n)} ${f?`<span style="font-size:0.85rem;color:#15803d;font-weight:normal;">/ 12 Jam</span>`:``}</p>`}
            `:``}
        </div>

        ${m&&h&&!f?`
        <div style="background: linear-gradient(135deg, #fff7ed, #fef3c7); border: 1.5px solid #f59e0b; border-radius: 10px; padding: 10px 14px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px;">
            <i class="fa-solid fa-fire" style="color: #f59e0b; font-size: 1.2rem;"></i>
            <div>
                <div style="font-weight: 700; color: #92400e; font-size: 0.85rem;">🎉 ${p.eventName?`Event: ${p.eventName}`:`High Season!`}</div>
                <div style="font-size: 0.78rem; color: #78350f;">Harga naik Rp ${parseInt(p.eventPriceIncrease).toLocaleString(`id-ID`)} · Minimum sewa 4 hari</div>
            </div>
        </div>
        `:``}


        <form id="checkout-form" onsubmit="event.preventDefault(); processCheckout('${t}', ${n||0}, '${r}');">

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
                    <label>${u===`airport`?`Tanggal`:f?`Tanggal Pemakaian`:`Tanggal Mulai`}</label>
                    <input type="date" id="co-start-date" class="form-control" required>
                </div>
                ${u===`airport`?`
                <input type="hidden" id="co-end-date" required>
                `:l===0?`
                <div class="form-group mb-3" style="flex: 1; display:flex; flex-direction:column;">
                    <label>${f?`Durasi Pemakaian (Paket 12 Jam)`:`Durasi Sewa`}${m&&h&&!f?` <span style="font-size:0.75rem;color:#ef4444;font-weight:700;">⚠ Min. 4 Hari (Event)</span>`:``}</label>
                    <div style="display:flex; gap:10px;">
                        <select id="co-duration-select" class="form-control" style="flex:1;" required onchange="const c = document.getElementById('co-duration-custom'); if(this.value==='custom') { c.style.display='block'; c.required=true; c.focus(); } else { c.style.display='none'; c.required=false; }">
                            ${f?`
                                <option value="1" selected>12 Jam</option>
                                <option value="2">2 Hari (2x 12 Jam)</option>
                                <option value="3">3 Hari (3x 12 Jam)</option>
                                <option value="4">4 Hari (4x 12 Jam)</option>
                                <option value="5">5 Hari (5x 12 Jam)</option>
                                <option value="6">6 Hari (6x 12 Jam)</option>
                                <option value="7">1 Minggu (7x 12 Jam)</option>
                                <option value="custom">Custom (Berapa Hari?)</option>
                            `:`
                                ${m&&h?``:`<option value="1">1 Hari</option>`}
                                ${m&&h?``:`<option value="2">2 Hari</option>`}
                                ${m&&h?``:`<option value="3">3 Hari</option>`}
                                <option value="4"${m&&h?` selected`:``}>4 Hari${m&&h?` (Minimum Event)`:``}</option>
                                <option value="5">5 Hari</option>
                                <option value="6">6 Hari</option>
                                <option value="7">1 Minggu (7 Hari)</option>
                                <option value="14">2 Minggu (14 Hari)</option>
                                <option value="custom">Custom (Ketik Sendiri)</option>
                            `}
                        </select>
                        <input type="number" id="co-duration-custom" class="form-control" min="${m&&h&&!f?4:1}" max="60" placeholder="Berapa hari?" style="display:none; width:110px;" oninput="if(this.value>60){this.value=60;} else if(this.value<1 && this.value!==''){this.value=1;}">
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
                        ${l>0?(t.match(/(\d+H\s*\d+M)/i)?.[1]||l+`H `+(l-1)+`M`)+` &mdash; Durasi Paket`:f?`Info Durasi 12 Jam`:`Info Pengembalian`}
                    </div>
                    <div id="date-duration-text" style="font-size:0.82rem;color:#0369a1;margin-top:2px;">
                        ${l>0?`Pilih tanggal mulai, tanggal selesai akan otomatis terisi.`:``}
                    </div>
                </div>
            </div>
            <div id="dynamic-date-warning" style="display: none; margin-bottom: 15px; font-size: 0.85rem; color: #ef4444; background: #fff1f2; padding: 10px; border-radius: 8px; border: 1px solid #fecdd3;">
                <strong><i class="fa-solid fa-triangle-exclamation"></i> Maaf, rentang tanggal yang Anda pilih bentrok dengan jadwal yang sudah dipesan! Silakan pilih tanggal lain.</strong>
            </div>`;if(u===`motor`||u===`mobil`)_+=`
            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="font-size: 0.95rem; margin-bottom: 10px; color: #334155;"><i class="fa-solid fa-location-dot"></i> ${f?`Detail Lokasi Penjemputan`:`Detail Lokasi & Waktu`}</h4>
                <div class="form-group mb-3">
                    <div style="display: flex; gap: 8px;">
                        <div style="flex: 1;">
                            <label>${f?`Lokasi Penjemputan (Hotel / Bandara / Alamat)`:`Tempat Pengambilan (GPS/Alamat)`}</label>
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
                            <label>${f?`Lokasi Pengantaran / Selesai Tour (Hotel / Bandara / Alamat)`:`Tempat Pengembalian (GPS/Alamat)`}</label>
                            <input type="text" id="co-dropoff-loc" class="form-control" required placeholder="Contoh: Bandara LOP / Hotel X" style="width: 100%;">
                        </div>
                        <div>
                            <label style="font-size: 0.75rem; color: #64748b; display: block; text-align: center;">Lokasi Anda</label>
                            <button type="button" onclick="window.getCurrentLocation('co-dropoff-loc', event)" class="btn" style="background: #e2e8f0; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0 15px; height: 38px; display: flex; align-items: center; justify-content: center;" title="Gunakan Lokasi Terkini"><i class="fa-solid fa-location-crosshairs"></i></button>
                        </div>
                    </div>
                </div>
                <div style="display: ${f?`none`:`flex`}; gap: 15px;">
                    <div class="form-group mb-0" style="flex: 1;">
                        <label>Jam Pengambilan</label>
                        <input type="time" id="co-pickup-time" class="form-control" ${f?``:`required`} value="${f?`08:00`:``}">
                    </div>
                    <div class="form-group mb-0" style="flex: 1;">
                        <label>Jam Pengembalian</label>
                        <input type="time" id="co-dropoff-time" class="form-control" ${f?``:`required`} value="${f?`20:00`:``}">
                    </div>
                </div>
                ${f?`
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 9px 12px; font-size: 0.8rem; color: #166534; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-circle-check" style="color: #16a34a; font-size: 0.95rem;"></i>
                    <span>Paket Include Driver berlaku <strong>12 Jam pemakaian</strong> per hari (Sudah termasuk Unit Mobil, Supir & BBM). Jam penjemputan fleksibel disesuaikan dengan driver saat di lokasi.</span>
                </div>
                `:``}
            </div>
        `;else if(u===`airport`)_+=`
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
        `;else if(u===`tour`){let e=``;if(window.globalItems){let t=window.globalItems.filter(e=>{let t=(e.category||``).toLowerCase();return(t.includes(`rental`)||t.includes(`armada`)||t.includes(`sewa`)||t===`car`||t===`mobil`)&&!t.includes(`motor`)}),n=l>0?l:1;t.forEach(t=>{let r=t.price*n,a=l>0?` x ${n} Hari`:``;e+=`<option value="${t.title}" data-price="${r}">${t.title} (+ ${i(t.price)}/hari${a})</option>`})}e||=`<option value="Avanza" data-price="0">Pilihan Kendaraan Tidak Ditemukan</option>`,_+=`
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
        `}let v=500200,y=0;u===`motor`?(v=5e4,y=5e5):u===`mobil`?(v=2e5,y=1e6):u===`tour`&&(v=500200);let b=(t||``).toLowerCase(),x=b.includes(`driver`)||b.includes(`supir`)||b.includes(`dengan supir`);a&&a.driverOptions&&a.driverOptions!==`Tidak Include Driver`&&(x=!0),x&&(y=0),_+=s&&r!==`wa`?`
            ${y>0?`
            <div style="background: #e0f2fe; border: 1.5px solid #38bdf8; border-radius: 10px; padding: 12px; margin-bottom: 16px; text-align: left;">
                <div style="font-weight: 700; color: #0369a1; font-size: 0.9rem; margin-bottom: 4px;">ℹ️ Catatan Penting: Tentang Uang Deposit</div>
                <div style="font-size: 0.8rem; color: #0c4a6e;">
                    Total pembayaran Anda saat ini sudah otomatis ditambahkan uang deposit sebesar <strong>${i(y)}</strong>. Uang deposit ini adalah jaminan yang akan <strong>dikembalikan 100%</strong> setelah masa sewa berakhir jika kendaraan dalam kondisi baik.
                </div>
            </div>
            `:``}
            ${n>v?`
            <div class="form-group mb-4" style="text-align: left;">
                <label style="font-weight:700;color:var(--text-dark);">Tipe Pembayaran</label>
                <div style="display:flex;gap:10px;margin-top:8px;" id="payment-type-container">
                    <label id="pt-dp-label" onclick="window.setPaymentType('dp')" style="flex:1;display:flex;align-items:flex-start;gap:10px;background:#fffbeb;border:2px solid #f59e0b;border-radius:10px;padding:12px;cursor:pointer;transition:all .2s;">
                        <input type="radio" name="payment-type-radio" id="pt-dp" value="dp" checked style="accent-color:#f59e0b;width:16px;height:16px;margin-top:2px;">
                        <div>
                            <div style="font-weight:700;color:#d97706;font-size:0.88rem;">Bayar DP</div>
                            <div style="font-size:0.75rem;color:#92400e;margin-top:2px;">Bayar DP ${i(v)} ${y>0?`+ Deposit ${i(y)}`:``} + Layanan Rp 6.500 sekarang.</div>
                            <div style="font-size:0.75rem;font-weight:700;color:#d97706;margin-top:4px;">Total ditransfer: ${i(v+y+6500)}</div>
                        </div>
                    </label>
                    <label id="pt-full-label" onclick="window.setPaymentType('full')" style="flex:1;display:flex;align-items:flex-start;gap:10px;background:#f0fdf4;border:2px solid #e2e8f0;border-radius:10px;padding:12px;cursor:pointer;transition:all .2s;">
                        <input type="radio" name="payment-type-radio" id="pt-full" value="full" style="accent-color:#22c55e;width:16px;height:16px;margin-top:2px;">
                        <div>
                            <div style="font-weight:700;color:#15803d;font-size:0.88rem;">Bayar Lunas</div>
                            <div style="font-size:0.75rem;color:#166534;margin-top:2px;">Lunas Sewa ${y>0?`+ Deposit ${i(y)}`:``} + Layanan Rp 6.500</div>
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
                    ${(()=>{let e=window.globalSettings&&window.globalSettings.qrisMaintenanceMode,t=window.globalSettings&&window.globalSettings.vaMaintenanceMode,n=window.globalSettings&&window.globalSettings.manualMaintenanceMode,r=e?t?n?`none`:`manual`:`va`:`qris`,i=e?`<option value="qris" disabled>QRIS Otomatis (Sedang Pemeliharaan)</option>`:`<option value="qris" ${r===`qris`?`selected`:``}>QRIS Otomatis (Verifikasi Instan) — 1 Jam</option>`,a=t?`<option value="va" disabled>Virtual Account (Sedang Pemeliharaan)</option>`:`<option value="va" ${r===`va`?`selected`:``}>Virtual Account (Verifikasi Otomatis) — 24 Jam</option>`,o=n?``:`<option value="manual" ${r===`manual`?`selected`:``}>Transfer Manual (Verifikasi WA)</option>`;return i+a+o})()}
                </select>
            </div>

            <!-- VA Bank Selector (hanya muncul saat pilih Virtual Account) -->
            <div id="va-bank-selector" style="display: ${(()=>{let e=window.globalSettings&&window.globalSettings.qrisMaintenanceMode,t=window.globalSettings&&window.globalSettings.vaMaintenanceMode,n=window.globalSettings&&window.globalSettings.manualMaintenanceMode;return(e?t?n?`none`:`manual`:`va`:`qris`)==`va`?`block`:`none`})()}; background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #bae6fd;">
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

            <div id="bank-details" style="display: ${(()=>{let e=window.globalSettings&&window.globalSettings.qrisMaintenanceMode,t=window.globalSettings&&window.globalSettings.vaMaintenanceMode,n=window.globalSettings&&window.globalSettings.manualMaintenanceMode;return(e?t?n?`none`:`manual`:`va`:`qris`)==`manual`?`block`:`none`})()}; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #cbd5e1;">
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
        `:`
            <input type="hidden" id="co-payment" value="booking_only">
            ${r===`wa`?``:`
            <!-- Cloudflare Turnstile Verification -->
            <div id="checkout-turnstile-container" style="margin: 15px 0 20px 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 68px;">
                <div id="checkout-turnstile"></div>
                <div id="turnstile-error-msg" style="color: #ef4444; font-size: 0.82rem; margin-top: 6px; font-weight: 600; display: none;">
                    <i class="fa-solid fa-triangle-exclamation"></i> Harap selesaikan verifikasi Cloudflare di atas.
                </div>
            </div>`}
            <button type="submit" class="btn btn-green w-100" style="padding: 12px; font-size: 1.1rem; background: ${r===`wa`?`#22c55e`:`var(--primary-green)`}; border-color: ${r===`wa`?`#22c55e`:`var(--primary-green)`};">${r===`wa`?`<i class="fa-brands fa-whatsapp"></i> LANJUTKAN VIA WA`:`KIRIM BOOKING`}</button>
        `,_+=`</form>
        <div id="qris-result" style="margin-top: 25px;"></div>
    `,o.innerHTML=_,document.getElementById(`checkout-modal`).classList.add(`active`),window.savedAiraPromo&&setTimeout(()=>{let e=typeof window.savedAiraPromo==`object`?window.savedAiraPromo:{code:window.savedAiraPromo,itemId:null};if(!e.itemId||window.currentCheckoutItemId&&e.itemId===window.currentCheckoutItemId){let t=document.getElementById(`co-promo-input`);t&&(t.value=e.code,typeof window.applyPromo==`function`&&window.applyPromo())}else console.log(`[AIRA] Kupon ${e.code} disimpan untuk item lain (target: ${e.itemId}), tidak otomatis dipasang pada item saat ini.`)},300),r!==`wa`&&window.initCheckoutTurnstile(),u===`tour`&&setTimeout(()=>{let e=document.getElementById(`co-tour-vehicle`);e&&window.updateTourPrice(e)},50);try{let e=JSON.parse(localStorage.getItem(`auth_user`)||`{}`);if(e&&e.email){let t=document.getElementById(`co-email`);t&&!t.value&&(t.value=e.email)}}catch{}sessionStorage.setItem(`checkoutState`,JSON.stringify({itemName:t,price:n})),window._checkoutActive=!0,window._checkoutBeforeUnload=e=>{window._checkoutActive&&(e.preventDefault(),e.returnValue=`Anda sedang dalam proses checkout. Yakin ingin meninggalkan halaman ini?`)},window.removeEventListener(`beforeunload`,window._checkoutBeforeUnload),window.addEventListener(`beforeunload`,window._checkoutBeforeUnload);let S=()=>{let e=JSON.parse(sessionStorage.getItem(`checkoutState`)||`{}`),t=document.getElementById(`co-name`),n=document.getElementById(`co-phone`),r=document.getElementById(`co-email`),i=document.getElementById(`co-start-date`),a=document.getElementById(`co-end-date`),o=document.getElementById(`co-payment`);t&&(e.name=t.value),n&&(e.phone=n.value),r&&(e.email=r.value),i&&(e.startDate=i.value),a&&(e.endDate=a.value),o&&(e.payment=o.value),sessionStorage.setItem(`checkoutState`,JSON.stringify(e))};[`co-name`,`co-phone`,`co-email`,`co-start-date`,`co-end-date`,`co-payment`].forEach(e=>{let t=document.getElementById(e);t&&t.addEventListener(`input`,S),t&&t.addEventListener(`change`,S)}),window._currentDurationDays=l;let C=document.getElementById(`co-start-date`),w=document.getElementById(`co-end-date`),T=document.getElementById(`co-duration-select`),E=document.getElementById(`co-duration-custom`),D=()=>{if(window.updateRentalDisplayPrice&&window.updateRentalDisplayPrice(),!C||!C.value||!w)return;let e=new Date(C.value),t=l;T&&(T.value===`custom`?(t=E&&E.value?parseInt(E.value):1,t>60&&(t=60),t<1&&(t=1)):t=parseInt(T.value));let n=0;n=window._is12HourDriver?Math.max(0,t-1):window._currentDurationDays===0?t:Math.max(0,t-1),e.setDate(e.getDate()+n),w.value=e.toISOString().split(`T`)[0];let r=document.getElementById(`date-duration-info`),i=document.getElementById(`date-duration-text`);if(r&&i){r.style.display=`flex`;let n=e.toLocaleDateString(`id-ID`,{weekday:`long`,year:`numeric`,month:`long`,day:`numeric`});i.innerHTML=window._is12HourDriver?t===1?`Layanan sewa Include Driver berlaku selama <strong>12 Jam</strong> pada tanggal <strong>${n}</strong>.`:`Layanan sewa Include Driver (<strong>${t}x 12 Jam</strong>) berakhir pada <strong>${n}</strong>.`:window._currentDurationDays===0?`Masa sewa berakhir pada <strong>${n}</strong>.`:`Paket/layanan berakhir pada <strong>${n}</strong>.`}S(),window.checkDateOverlap&&window.checkDateOverlap()};C&&C.addEventListener(`change`,D),T&&T.addEventListener(`change`,D),E&&E.addEventListener(`input`,D)},window.updateRentalDisplayPrice=()=>{let e=document.getElementById(`co-display-price`);if(e&&window._currentDurationDays===0){let t=parseInt(e.getAttribute(`data-base-price`)||0),n=parseInt(e.getAttribute(`data-event-increase`)||0);if(t>0){let r=1,a=document.getElementById(`co-duration-select`);if(a){if(a.value===`custom`){let e=document.getElementById(`co-duration-custom`);r=e&&e.value?parseInt(e.value):1,r>60&&(r=60),r<1&&(r=1)}else r=parseInt(a.value)}let o=t*r,s=o+n,c=document.getElementById(`co-crossed-price`);c&&(c.innerHTML=i(o));let l=window._is12HourDriver?r===1?`(12 Jam)`:`(${r}x 12 Jam)`:`(${r} Hari)`;e.innerHTML=i(s)+` <span style="font-size:0.85rem;color:#64748b;font-weight:normal;">${l}</span>`}}},window.checkDateOverlap=()=>{let e=document.getElementById(`co-start-date`).value,t=document.getElementById(`co-end-date`).value,n=document.getElementById(`dynamic-date-warning`),r=document.querySelector(`#checkout-form button[type='submit']`);if(!e||!t){n.style.display=`none`,r&&(r.disabled=!1);return}let i=new Date(e),a=new Date(t),o=!1;if(window.currentBookings&&window.currentBookings.length>0)for(let e of window.currentBookings){let t=new Date(e.startDate);if(i<=new Date(e.endDate)&&a>=t){o=!0;break}}o?(n.style.display=`block`,r&&(r.disabled=!0)):(n.style.display=`none`,r&&(r.disabled=!1),window.updateRentalDisplayPrice&&window.updateRentalDisplayPrice())},window.updateTourPrice=e=>{let t=document.getElementById(`co-display-price`);if(!t)return;let n=parseInt(t.getAttribute(`data-original-price`)||t.getAttribute(`data-base-price`)||0);t.hasAttribute(`data-original-price`)||t.setAttribute(`data-original-price`,n);let r=n+parseInt(e.selectedOptions[0].getAttribute(`data-price`)||0);t.setAttribute(`data-base-price`,r),t.innerHTML=i(r)},window.getCurrentLocation=(e,t)=>{if(navigator.geolocation){let n=t.currentTarget,r=n.innerHTML;n.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i>`,navigator.geolocation.getCurrentPosition(t=>{let i=t.coords.latitude,a=t.coords.longitude;document.getElementById(e).value=`https://maps.google.com/?q=${i},${a}`,n.innerHTML=r},e=>{Swal.fire({icon:`error`,title:`Gagal`,text:`Tidak dapat mengambil lokasi. Pastikan izin lokasi (GPS) diaktifkan di browser/HP Anda.`}),n.innerHTML=r})}else Swal.fire({icon:`error`,title:`Oops`,text:`Browser Anda tidak mendukung fitur lokasi.`})},window.setPaymentType=e=>{let t=document.getElementById(`pt-dp-label`),n=document.getElementById(`pt-full-label`),r=document.getElementById(`pt-dp`),i=document.getElementById(`pt-full`);!t||!n||(e===`dp`?(r.checked=!0,t.style.border=`2px solid #f59e0b`,t.style.background=`#fffbeb`,n.style.border=`2px solid #e2e8f0`,n.style.background=`#f0fdf4`):(i.checked=!0,n.style.border=`2px solid #22c55e`,n.style.background=`#dcfce7`,t.style.border=`2px solid #e2e8f0`,t.style.background=`#fffbeb`))},window.processCheckout=async(t,n,r=`web`)=>{if(r!==`wa`&&!window.checkAuthAndPrompt())return;if(r!==`wa`&&!(window._checkoutTurnstileToken||document.querySelector(`#checkout-modal [name="cf-turnstile-response"]`)?.value)){let e=document.getElementById(`turnstile-error-msg`);e&&(e.style.display=`block`),Swal.fire({icon:`warning`,title:`Verifikasi Keamanan Diperlukan`,text:`Harap selesaikan verifikasi Cloudflare Turnstile sebelum melanjutkan pembayaran.`,confirmButtonColor:`#22c55e`,confirmButtonText:`Selesaikan Verifikasi`});return}let a=document.getElementById(`co-name`).value,o=document.getElementById(`co-phone`).value,s=document.getElementById(`co-email`)?.value||``,c=document.getElementById(`co-start-date`).value,l=document.getElementById(`co-end-date`).value,u=document.getElementById(`co-payment`).value;document.getElementById(`checkout-modal-body`);let d=`other`,f=window.globalItems?window.globalItems.find(e=>e.title===t):null;f&&f.category&&(f.category===`car`?d=`mobil`:f.category===`motorcycle`?d=`motor`:f.category===`package`?d=`tour`:f.category===`airport`&&(d=`airport`));let p=t.toLowerCase();d===`other`&&(p.includes(`airport`)||p.includes(`jemput`)||p.includes(`antar`)||p.includes(`transfer`)?d=`airport`:p.includes(`motor`)?d=`motor`:p.includes(`mobil`)||p.includes(`avanza`)||p.includes(`innova`)||p.includes(`hiace`)||p.includes(`brio`)||p.includes(`xpander`)||p.includes(`alphard`)||p.includes(`fortuner`)?d=`mobil`:(p.includes(`paket`)||p.includes(`tour`))&&(d=`tour`));let m=document.getElementById(`co-pickup-loc`)?.value||``,h=document.getElementById(`co-dropoff-loc`)?.value||``,g=document.getElementById(`co-pickup-time`)?.value||``,_=document.getElementById(`co-dropoff-time`)?.value||``,v=document.getElementById(`co-flight-num`)?.value||``,y=document.getElementById(`co-pax`)?.value||``,b=document.getElementById(`co-tour-vehicle`)?.value||``,x=document.getElementById(`co-notes`)?.value||``;if(!c||!l){Swal.fire({icon:`info`,title:`Pemberitahuan`,text:`Mohon isi tanggal mulai dan selesai.`,confirmButtonColor:`#22c55e`});return}let S=new Date(c),C=new Date(l);if(S>C){Swal.fire({icon:`info`,title:`Pemberitahuan`,text:`Tanggal selesai tidak boleh lebih awal dari tanggal mulai.`,confirmButtonColor:`#22c55e`});return}if(window.currentBookings&&window.currentBookings.length>0)for(let e of window.currentBookings){let t=new Date(e.startDate);if(S<=new Date(e.endDate)&&C>=t){Swal.fire({icon:`info`,title:`Pemberitahuan`,text:`Maaf, rentang tanggal tersebut sudah dipesan. Silakan pilih tanggal lain.`,confirmButtonColor:`#22c55e`});return}}let w=localStorage.getItem(`auth_user`),T=s;if(!T&&w)try{let e=JSON.parse(w);e&&e.email&&(T=e.email)}catch{}let E=n;if(d===`tour`){let e=document.getElementById(`co-tour-vehicle`);if(e&&e.selectedOptions.length>0){let t=parseInt(e.selectedOptions[0].getAttribute(`data-price`)||0);E+=t}}let D=t.match(/(\d+)\s*H/i),O=D&&parseInt(D[1])>0;if(!O&&n>0){let e=1,t=document.getElementById(`co-duration-select`);if(t){if(t.value===`custom`){let t=document.getElementById(`co-duration-custom`);e=t&&t.value?parseInt(t.value):1}else e=parseInt(t.value)}else e=Math.ceil((C-S)/864e5);e<1&&(e=1),E=n*e}let k=window.globalEventSettings||{eventMode:!1,eventPriceIncrease:0},A=k.eventMode&&k.eventPriceIncrease>0,j=d===`motor`||d===`mobil`,M=d===`mobil`&&(p.includes(`12 jam`)||p.includes(`include driver`)),N=A&&j&&!M;N&&E>0&&(E+=k.eventPriceIncrease);let P=(e,n=null,r=``)=>{let s=``,u=`Catatan: Booking dinyatakan terkonfirmasi setelah pembayaran booking fee diterima.
💳 Pembayaran dilakukan melalui tautan Midtrans (QRIS/Virtual Account) yang tersedia di halaman riwayat pesanan Anda, atau sesuai instruksi Admin.`,f=e?`Saya telah melakukan Booking via Website dengan rincian:`:`Saya ingin melakukan pesanan (Booking) dengan rincian sebagai berikut:`;if(d===`motor`)s=`Halo Admin Travel Lombok Airport,\n\n${f}\n\nFORM BOOKING SEWA MOTOR\nTempat Pengambilan (lokasi gps/alamat): ${m}\nTempat Pengembalian (lokasi gps/alamat): ${h}\nJam Pengambilan: ${g}\nJam Pengembalian: ${_}\nNama: ${a}\nLayanan: ${t}\nTgl Mulai: ${c}\nTgl Selesai: ${l}\nNo HP/WA: ${o}\nEmail: ${T||`-`}\n\nCatatan: Booking dinyatakan terkonfirmasi setelah pembayaran booking fee (DP Rp 50.000) dan Deposit (Rp 500.000) diterima.\n💳 Pembayaran dilakukan melalui tautan Midtrans (QRIS/Virtual Account) yang tersedia di halaman riwayat pesanan Anda.`;else if(d===`mobil`){if(p.includes(`12 jam`)||p.includes(`include driver`)){let e=diffDays===1?`12 Jam`:`${diffDays}x 12 Jam (${diffDays} Hari)`;s=`Halo Admin Travel Lombok Airport,\n\n${f}\n\nFORM BOOKING SEWA MOBIL (INCLUDE DRIVER 12 JAM)\nTanggal Pemakaian: ${c}${c===l?``:` s/d ${l}`}\nDurasi: ${e}\nLokasi Penjemputan: ${m}\nLokasi Pengantaran: ${h}\nNama: ${a}\nLayanan: ${t}\nNo HP/WA: ${o}\nEmail: ${T||`-`}\n\nCatatan: Booking dinyatakan terkonfirmasi setelah pembayaran booking fee (DP Rp 200.000) diterima (Bebas Deposit Jaminan Rp 0).\n👇 Pembayaran dilakukan melalui tautan Midtrans (QRIS/Virtual Account) yang tersedia di halaman riwayat pesanan Anda.`}else s=`Halo Admin Travel Lombok Airport,\n\n${f}\n\nFORM BOOKING SEWA MOBIL\nTanggal Pengambilan: ${c}\nTanggal Pengembalian: ${l}\nTempat Pengambilan (lokasi gps/alamat): ${m}\nTempat Pengembalian (lokasi gps/alamat): ${h}\nJam Pengambilan: ${g}\nJam Pengembalian: ${_}\nNama: ${a}\nLayanan: ${t}\nNo HP/WA: ${o}\nEmail: ${T||`-`}\n\nCatatan: Booking dinyatakan terkonfirmasi setelah pembayaran booking fee (DP Rp 200.000) dan Deposit (Rp 1.000.000) diterima.\n👇 Pembayaran dilakukan melalui tautan Midtrans (QRIS/Virtual Account) yang tersedia di halaman riwayat pesanan Anda.`}else s=d===`airport`?`Halo Admin Travel Lombok Airport,\n\n${f}\n\nFORM BOOKING AIRPORT TRANSFER\nNama: ${a}\nNomor WA: ${o}\nEmail: ${T||`-`}\nLokasi penjemputan (gps lokasi/alamat): ${m}\nAlamat Tujuan (gps lokasi/alamat): ${h}\nNomor penerbangan: ${v}\nTanggal: ${c}\nJam penjemputan: ${g}\nJumlah penumpang: ${y}\nCatatan: ${x}\n\n${u}`:d===`tour`?`Halo Admin Travel Lombok Airport,\n\n${f}\n\nFORM BOOKING PRIVATE TOUR LOMBOK\nMohon isi data berikut untuk proses booking:\nLokasi Jemput (berdasarkan GPS/Alamat): ${m}\nLokasi Drop Off: ${h}\nJam Penjemputan: ${g}\nNomor Penerbangan: ${v}\nJumlah Penumpang: ${y}\n\nPaket yang Dipilih: ${t}\nKendaraan: ${b}\n\nSubtotal: ${E>0?i(E):`Rp __________`}\nBiaya Layanan: Rp 6.500\nTotal Harga: ${E>0?i(E+6500):`Rp __________`}\nDP/Booking Fee: Rp 500.000\nSisa Pembayaran: ${E>5e5?i(E-5e5):`Rp __________`}\nCatatan/Request: ${x||`-`}\nNama: ${a}\nTanggal: ${c}\nNo HP/WA: ${o}\n\n${u}`:`Halo Admin Travel Lombok Airport,\n\n${f}\n\n*Detail Pesanan*\n- Nama: ${a}\n- Layanan: ${t}\n- Tgl Mulai: ${c}\n- Tgl Selesai: ${l}\n${O?``:`- Durasi: ${Math.ceil((C-S)/864e5)||1} Hari\n`}${E>0?`- Subtotal: ${i(E)}\n- Biaya Layanan: Rp 6.500\n- Total Estimasi: ${i(E+6500)}\n`:``}- No HP/WA: ${o}\n- Email: ${T||`-`}\n\nMohon instruksi selanjutnya. Terima kasih.`;return e&&n&&(s=s.replace(`FORM BOOKING`,`ID Booking: ${n}\n\nFORM BOOKING`).replace(`*Detail Pesanan*`,`*Detail Pesanan*\n- ID Booking: ${n}`),r&&(s+=r)),s};if(r===`wa`){let e=P(!1);window.open(`https://wa.me/6289676963255?text=${encodeURIComponent(e)}`,`_blank`),closeCheckoutModal();return}let F=E,I=document.getElementById(`co-promo-applied`)?.value||``,L=Number(document.getElementById(`co-promo-discount`)?.value||0),R=``;I&&L>0&&(E-=L,E<0&&(E=0),R=`\n- Promo Digunakan: ${I} (Diskon ${i(L)})`);let z=E,B=5e5,V=0;d===`motor`?(B=5e4,V=5e5):d===`mobil`?(B=2e5,V=1e6):d===`tour`&&(B=5e5);let H=(t||``).toLowerCase(),U=H.includes(`driver`)||H.includes(`supir`)||H.includes(`dengan supir`),W=window.globalItems?window.globalItems.find(e=>e.title===t):null;W&&W.driverOptions&&W.driverOptions!==`Tidak Include Driver`&&(U=!0),U&&(V=0);let G=F>B&&document.getElementById(`pt-dp`)?.checked===!0,K=z;G&&(K=B,d!==`motor`&&d!==`mobil`&&K>z&&(K=z)),K+=6500,K+=V;let q={itemName:t,customerName:a,phone:o,startDate:c,endDate:l,price:K,isDp:G,fullPrice:z,deposit:V||0,dpAmount:G?B:0,customerEmail:T,promoCode:I,promoDiscount:L,turnstileToken:r===`wa`?``:window._checkoutTurnstileToken||document.querySelector(`#checkout-modal [name="cf-turnstile-response"]`)?.value||``,details:{pickup:m,dropoff:h,time:g||_,pickupTime:g,dropoffTime:_,pax:y,flightNumber:v,vehicle:b,notes:x,isEvent:N}};if(window.currentCheckoutData=q,u===`booking_only`){let t=`BKG-`+Math.floor(Math.random()*1e4);try{await fetch(`${e}/bookings`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({...q,status:`PENDING`,transactionId:t})})}catch(e){console.error(e)}simulateQrisSuccess(!0,t);return}if(u===`manual`){let t=`BKG-`+Math.floor(Math.random()*1e4);try{await fetch(`${e}/bookings`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({...q,status:`PENDING`,transactionId:t})})}catch(e){console.error(e)}let n=P(!0,t,R);window.open(`https://wa.me/6289676963255?text=${encodeURIComponent(n)}`,`_blank`),closeCheckoutModal();return}if(u===`va`){let n=document.querySelector(`input[name="va-bank"]:checked`);if(!n){Swal.fire({icon:`warning`,title:`Pilih Bank`,text:`Silakan pilih bank Virtual Account terlebih dahulu.`,confirmButtonColor:`#0ea5e9`});return}let r=n.value,i=document.getElementById(`qris-result`),a=document.querySelector(`#checkout-form button[type='submit']`);a&&(a.disabled=!0,a.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> MEMPROSES...`),i.innerHTML=`<div style="text-align:center;padding:20px;background:#f0f9ff;border-radius:12px;border:1px solid #bae6fd;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size:2rem;color:#0ea5e9;margin-bottom:10px;"></i>
            <p style="color:#0369a1;font-size:0.9rem;">Sedang membuat Virtual Account ${r}...</p>
        </div>`;let o=window.generateTicketId(`ORD-`);try{await fetch(`${e}/bookings`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({...q,status:`PENDING`,transactionId:o})})}catch(e){console.error(`Failed to save pending booking:`,e)}try{let n=await(await fetch(`${e}/payment/va`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({amount:K,bank_code:r,reference_id:o})})).json();if(n.success){let r=n.data;try{await fetch(`${e}/bookings/by-txid/${o}/payment-info`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify({paymentMethod:`va`,vaBank:r.vaBank,vaNumber:r.vaNumber,expiredAt:r.expiredAt,expiredAtISO:r.expiredAtISO})})}catch(e){console.error(`Gagal simpan payment-info VA`,e)}i.innerHTML=`
                    <div style="background:white;padding:20px;border-radius:15px;box-shadow:0 10px 25px rgba(0,0,0,0.05);text-align:center;border:2px dashed #0ea5e9;">
                        <h3 style="color:#0c4a6e;margin-bottom:5px;">Virtual Account ${r.vaBank}</h3>
                        <p style="color:#64748b;font-size:0.85rem;margin-bottom:15px;">Transfer tepat sesuai jumlah ke nomor VA berikut:</p>
                        <div style="background:#f0f9ff;border:2px solid #0ea5e9;border-radius:12px;padding:20px;margin-bottom:15px;">
                            <div style="font-size:0.8rem;color:#64748b;margin-bottom:5px;">Nomor Virtual Account</div>
                            <div style="font-size:clamp(1.1rem, 5vw, 1.5rem);font-weight:900;color:#0c4a6e;letter-spacing:1px;word-break:break-all;">${r.vaNumber||`-`}</div>
                            <button onclick="window.copyText('${r.vaNumber}', this, '<i class=\\'fa-solid fa-check\\'></i> Tersalin!', '<i class=\\'fa-regular fa-copy\\'></i> Salin Nomor', event)" 
                                style="margin-top:10px;padding:8px 20px;background:#0ea5e9;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.9rem;font-weight:bold;">
                                <i class="fa-regular fa-copy"></i> Salin Nomor
                            </button>
                        </div>
                        <h4 style="color:#0c4a6e;margin-bottom:5px;">${t}</h4>
                        <p style="font-size:1.4rem;font-weight:bold;color:#16a34a;margin-bottom:10px;">${r.totalFormatted}</p>
                        <div style="background:#fef9c3;color:#854d0e;padding:8px;border-radius:8px;font-size:0.85rem;display:inline-block;margin-bottom:15px;">
                            <i class="fa-regular fa-clock"></i> Batas Waktu: ${r.expiredAtISO?new Date(r.expiredAtISO).toLocaleString(`id-ID`,{day:`numeric`,month:`long`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}):r.expiredAt}
                        </div>
                        <div style="color:#0369a1;font-size:0.9rem;margin-bottom:15px;">
                            <i class="fa-solid fa-spinner fa-spin"></i> Sistem sedang menunggu pembayaran...
                        </div>
                        <div id="manual-check-msg" style="color: #ef4444; font-size: 0.85rem; margin-bottom: 10px; font-weight: bold;"></div>
                        <button type="button" class="btn btn-blue" style="width:100%;padding:10px;font-weight:bold;border-radius:8px;" onclick="forcePaymentSuccess('${r.transactionId}', this)">SAYA SUDAH BAYAR</button>
                        <div style="margin-top:12px;padding:10px;background:#fff8f1;border-radius:8px;border:1px solid #ffedd5;font-size:0.8rem;color:#d97706;">
                            <i class="fa-solid fa-circle-info"></i> Pastikan transfer dilakukan ke nomor VA yang benar dengan jumlah yang tepat.
                        </div>
                    </div>`;let a=setInterval(async()=>{try{let t=await(await fetch(`${e}/payment/status/${r.transactionId}`)).json();t.success&&[`PAID`,`SUCCESS`,`SETTLEMENT`,`COMPLETED`].includes(t.data.status?.toUpperCase())?(clearInterval(a),window.simulateQrisSuccess(!1,r.transactionId)):t.success&&t.data.status===`EXPIRED`&&(clearInterval(a),i.innerHTML=`<div style="text-align:center;padding:20px;background:#fff1f2;border:1px solid #fda4af;border-radius:12px;">
                                <i class="fa-solid fa-circle-xmark" style="font-size:3rem;color:#ef4444;"></i>
                                <h3 style="color:#ef4444;">Virtual Account Kedaluwarsa</h3>
                                <p>Waktu pembayaran telah habis. Silakan buat pesanan ulang.</p>
                            </div>`)}catch(e){console.error(e)}},5e3);window.activePollInterval=a}else i.innerHTML=`<div class="text-center text-danger p-4" style="background:#fff1f2;border-radius:12px;margin-top:20px;">Gagal membuat Virtual Account. ${n.error||``} Silakan coba lagi.</div>`,a&&(a.disabled=!1,a.innerHTML=`COBA LAGI`)}catch{i.innerHTML=`<div class="text-center text-danger p-4" style="background:#fff1f2;border-radius:12px;margin-top:20px;">Koneksi error. Silakan coba lagi.</div>`,a&&(a.disabled=!1,a.innerHTML=`COBA LAGI`)}return}let J=document.getElementById(`qris-result`),Y=document.querySelector(`#checkout-form button[type='submit']`);Y&&(Y.disabled=!0,Y.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> MEMPROSES...`),J.innerHTML=`
        <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #cbd5e1;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-blue); margin-bottom: 10px;"></i>
            <p style="color: var(--text-gray); font-size: 0.9rem;">Sedang membuat kode pembayaran QRIS...</p>
        </div>
    `;let X=window.generateTicketId(`ORD-`);window._pendingQrisTxId=X;try{await fetch(`${e}/bookings`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({...q,status:`PENDING`,transactionId:X})})}catch(e){console.error(`Failed to save pending booking:`,e)}try{let n=await(await fetch(`${e}/payment/qris`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({amount:K,reference_id:X})})).json();if(n.success){let r=n.data;try{await fetch(`${e}/bookings/by-txid/${X}/payment-info`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify({paymentMethod:`qris`,qrCodeSvg:r.qrCodeSvg,paymentUrl:r.payUrl,expiredAt:r.expiredAt,expiredAtISO:r.expiredAtISO,rawQrisString:r.raw?.qr_string})})}catch(e){console.error(`Gagal simpan payment-info QRIS`,e)}J.innerHTML=`
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
                            <i class="fa-regular fa-clock" style="margin-right: 5px;"></i> Batas Waktu: ${r.expiredAtISO?new Date(r.expiredAtISO).toLocaleString(`id-ID`,{day:`numeric`,month:`long`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}):r.expiredAt}
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
            `;let i=setInterval(async()=>{let t=new AbortController,n=setTimeout(()=>t.abort(),6e3);try{let a=await fetch(`${e}/payment/status/${r.transactionId}`,{signal:t.signal});clearTimeout(n);let o=await a.json();o.success&&[`PAID`,`SUCCESS`,`SETTLEMENT`,`COMPLETED`].includes(o.data.status?.toUpperCase())?(clearInterval(i),window.activePollInterval=null,window.simulateQrisSuccess(!1,r.transactionId)):o.success&&o.data.status===`EXPIRED`&&(clearInterval(i),window.activePollInterval=null,J.innerHTML=`
                            <div style="text-align: center; padding: 20px; background: #fff1f2; border: 1px solid #fda4af; border-radius: 12px; margin-top: 20px;">
                                <i class="fa-solid fa-circle-xmark" style="font-size: 3rem; color: #ef4444; margin-bottom: 15px;"></i>
                                <h3 style="color: #ef4444;">Pembayaran Kedaluwarsa</h3>
                                <p style="color: var(--text-dark); font-size: 0.9rem;">Waktu pembayaran telah habis. Silakan tutup dan buat pesanan ulang.</p>
                            </div>
                        `)}catch(e){clearTimeout(n),e.name!==`AbortError`&&console.error(e)}},2e3);window.activePollInterval=i}else{let e=n.details||n.error||n.message||`Tidak ada detail error`;console.error(`QRIS API Error:`,n),J.innerHTML=`<div class="text-center text-danger p-4" style="background: #fff1f2; border-radius: 12px; margin-top: 20px;">
                <b>Gagal memuat kode QRIS.</b><br>
                <small style="color:#64748b;">${n.error||``} ${e===n.error?``:`— `+e}</small><br><br>
                Silakan coba lagi.
            </div>`,Y&&(Y.disabled=!1,Y.innerHTML=`COBA LAGI`)}}catch(e){console.error(`QRIS fetch error:`,e),J.innerHTML=`<div class="text-center text-danger p-4" style="background: #fff1f2; border-radius: 12px; margin-top: 20px;">Koneksi error: ${e.message}. Silakan coba lagi.</div>`,Y&&(Y.disabled=!1,Y.innerHTML=`COBA LAGI`)}},window.simulateQrisSuccess=async(t,n)=>{let r=document.getElementById(`checkout-modal-body`),i=t?`BKG-`:`ORD-`,a=n||window.generateTicketId(i);if(window.activePollInterval&&clearInterval(window.activePollInterval),sessionStorage.removeItem(`checkoutState`),window._checkoutActive=!1,window.removeEventListener(`beforeunload`,window._checkoutBeforeUnload),!t&&window.currentCheckoutData){let t=window._pendingQrisTxId||a;fetch(`${e}/bookings/by-txid/${t}/status`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify({status:`PAID`})}).catch(e=>console.error(`Failed to update QRIS booking to PAID:`,e))}r.innerHTML=`
        <div style="text-align: center; padding: 40px 20px;">
            <i class="fa-solid fa-circle-check" style="font-size: 5rem; color: var(--primary-green); margin-bottom: 20px;"></i>
            <h2 style="color: var(--text-dark); margin-bottom: 10px;">${t?`Booking Berhasil!`:`Pembayaran Berhasil!`}</h2>
            <p style="color: #64748b; margin-bottom: 20px;">Terima kasih, pesanan Anda telah kami terima.</p>
            
            <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 20px; border-radius: 12px; border: 1px dashed #cbd5e1; margin-bottom: 25px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                <p style="font-size: 0.85rem; font-weight: 600; color: #64748b; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Nomor Referensi Anda</p>
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; background: white; padding: 12px 16px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                    <span style="color: var(--primary-blue); font-family: 'Courier New', monospace; font-size: 1.1rem; font-weight: 800; word-break: break-all; text-align: left; flex: 1; letter-spacing: 0.5px;">${a}</span>
                    <button onclick="navigator.clipboard.writeText('${a}'); const icon = this.querySelector('i'); icon.className='fa-solid fa-check text-green'; Swal.fire({icon: 'success', title: 'Tersalin', toast: true, position: 'top', showConfirmButton: false, timer: 2000}); setTimeout(()=>icon.className='fa-solid fa-copy', 2000)" style="flex-shrink: 0; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; cursor: pointer; color: var(--primary-blue); transition: all 0.2s; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px;" title="Salin / Copy" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'">
                        <i class="fa-solid fa-copy" style="font-size: 1.15rem;"></i>
                    </button>
                </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 10px;">
                <button onclick="downloadPdfInvoice('${a}')" class="btn btn-green" style="width: 100%; padding: 14px; border-radius: 10px; font-size: 1rem; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);"><i class="fa-solid fa-file-pdf"></i> Unduh e-Tiket / Invoice</button>
                <button onclick="closeCheckoutModal()" class="btn btn-outline" style="width: 100%; padding: 14px; border-radius: 10px; font-size: 1rem; border-color: #cbd5e1; color: #475569;">TUTUP</button>
            </div>
            
        </div>
    `},window.downloadPdfInvoice=async t=>{try{let n=await fetch(`${e}/bookings/check/${t}?_t=${new Date().getTime()}`,{cache:`no-store`});if(n.ok){let e=await n.json();typeof window.generateEtiketPDF==`function`&&window.generateEtiketPDF(e)}else alert(`Gagal mengambil detail lengkap transaksi untuk PDF.`)}catch(e){console.error(`PDF generation error:`,e),alert(`Terjadi kesalahan saat mengunduh PDF.`)}};var v=async()=>{try{let t=await fetch(`${e}/stats?_t=${new Date().getTime()}`,{cache:`no-store`});if(t.ok){let e=await t.json();e.customers&&(document.getElementById(`stat-val-customers`).innerText=e.customers),e.fleet&&(document.getElementById(`stat-val-fleet`).innerText=e.fleet),e.trips&&(document.getElementById(`stat-val-trips`).innerText=e.trips),e.support&&(document.getElementById(`stat-val-support`).innerText=e.support)}}catch(e){console.error(`Failed to load stats:`,e)}};window.allReviewsData=[],window.showingAllReviews=!1,window.renderReviewsList=()=>{let e=document.getElementById(`reviews-container`);if(!e)return;let t=(window.allReviewsData||[]).filter(e=>!e.itemId);if(t.length===0){e.innerHTML=`<p class="text-center w-100" style="grid-column: 1/-1;">Belum ada ulasan. Jadilah yang pertama memberikan ulasan!</p>`;return}let n=window.showingAllReviews?t:t.slice(0,3),r=``;n.forEach(e=>{let t=``;for(let n=0;n<5;n++)n<e.rating?t+=`<i class="fa-solid fa-star" style="color: #f59e0b;"></i>`:t+=`<i class="fa-regular fa-star" style="color: #cbd5e1;"></i>`;let n=``;e.createdAt&&(n=new Date(e.createdAt).toLocaleDateString(`id-ID`,{day:`numeric`,month:`long`,year:`numeric`}));let i=e.name?e.name.charAt(0).toUpperCase():`U`,a=``;a=e.photoUrl?`<img src="${e.photoUrl}" alt="${e.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;">`:i,r+=`
        <div class="review-card" data-aos="fade-up">
            <div class="review-content">
                <div style="display: flex; gap: 4px; margin-bottom: 12px; font-size: 0.9rem;">${t}</div>
                <p class="review-text">"${e.comment}"</p>
            </div>
            <div class="review-author">
                <div class="review-author-avatar" style="${e.photoUrl?`padding: 0; overflow: hidden;`:``}">${a}</div>
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
        `),e.innerHTML=r},window.toggleAllReviews=()=>{window.showingAllReviews=!window.showingAllReviews,window.renderReviewsList()},window.loadReviews=async()=>{let t=document.getElementById(`reviews-container`);if(t)try{let t=await fetch(`${e}/reviews`);if(!t.ok)throw Error(`Failed to fetch`);window.allReviewsData=await t.json(),window.renderReviewsList()}catch(e){console.error(`Failed to load reviews:`,e),t.innerHTML=`<p class="text-center w-100 text-danger" style="grid-column: 1/-1;">Gagal memuat ulasan.</p>`}},window.submitReview=async t=>{t.preventDefault();let n=document.getElementById(`btn-submit-review`);n.disabled=!0,n.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...`;let r=document.getElementById(`review-name`).value,i=document.getElementById(`review-comment`).value,a=document.querySelector(`input[name="rating"]:checked`),o=a?a.value:5,s=JSON.parse(localStorage.getItem(`auth_user`)||`null`),c=s&&s.photoUrl?s.photoUrl:null;try{if(!(await fetch(`${e}/reviews`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({name:r,rating:o,comment:i,photoUrl:c})})).ok)throw Error(`Failed to submit review`);Swal.fire({icon:`success`,title:`Terima Kasih!`,text:`Ulasan Anda berhasil dikirim.`,confirmButtonColor:`#22c55e`}),document.getElementById(`review-form`).reset(),document.getElementById(`review-modal`).classList.remove(`active`),loadReviews()}catch(e){console.error(`Submit review error:`,e),Swal.fire({icon:`error`,title:`Gagal`,text:`Gagal mengirim ulasan. Silakan coba lagi.`,confirmButtonColor:`#22c55e`})}finally{n.disabled=!1,n.innerHTML=`Kirim Ulasan`}},document.addEventListener(`DOMContentLoaded`,()=>{window.checkAuthUI(),v(),loadReviews(),window.changeCurrency=e=>{localStorage.setItem(`app_currency`,e),window.location.reload()};let e=document.querySelector(`.nav-actions`),t=document.querySelector(`.lang-switcher`);if(e&&t){let e=`
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
        `;t.insertAdjacentHTML(`beforebegin`,e);let n=t.querySelector(`.lang-btn`);n&&(n.removeAttribute(`onclick`),n.addEventListener(`click`,e=>{let n=t.querySelector(`.lang-menu`);n&&n.classList.toggle(`active`)})),document.addEventListener(`click`,e=>{if(!e.target.closest(`#curr-switcher`)){let e=document.getElementById(`curr-menu`);e&&e.classList.contains(`active`)&&e.classList.remove(`active`)}if(!e.target.closest(`.lang-switcher:not(#curr-switcher)`)){let e=t.querySelector(`.lang-menu`);e&&e.classList.contains(`active`)&&e.classList.remove(`active`)}})}let n=sessionStorage.getItem(`checkoutState`);if(n&&(window.location.pathname===`/`||window.location.pathname===`/index.html`))try{let e=JSON.parse(n);e.itemName!==void 0&&e.price!==void 0&&openCheckoutModal(e.itemName,e.price).then(()=>{if(e.name){let t=document.getElementById(`co-name`);t&&(t.value=e.name)}if(e.phone){let t=document.getElementById(`co-phone`);t&&(t.value=e.phone)}if(e.startDate){let t=document.getElementById(`co-start-date`);t&&(t.value=e.startDate)}if(e.endDate){let t=document.getElementById(`co-end-date`);t&&(t.value=e.endDate)}if(e.payment){let t=document.getElementById(`co-payment`);t&&(t.value=e.payment,t.dispatchEvent(new Event(`change`)))}window.checkDateOverlap&&window.checkDateOverlap()}).catch(()=>sessionStorage.removeItem(`checkoutState`))}catch{sessionStorage.removeItem(`checkoutState`)}}),window._authMode=`login`,window.openAuthModal=e=>{let t=e||window._authMode||`login`;sessionStorage.setItem(`redirect_after_auth`,window.location.href),t===`register`?window.location.href=`/register.html`:window.location.href=`/login.html`},window.closeAuthModal=()=>{},window.toggleAuthMode=()=>{window.openAuthModal(window._authMode===`login`?`register`:`login`)},window.checkAuthUI=()=>{let t=localStorage.getItem(`auth_token`),n=JSON.parse(localStorage.getItem(`auth_user`)||`null`),r=document.getElementById(`footer-auth-container`),i=document.getElementById(`footer-user-container`),a=document.getElementById(`footer-user-name`);if(document.getElementById(`footer-user-avatar`),r&&i){if(t&&n){r.style.display=`none`,i.style.display=`flex`,a&&(a.innerText=n.name||n.email.split(`@`)[0]||`Pengguna`);let o=i.querySelector(`div[style*="width: 40px"]`);o&&(o.innerHTML=n.photoUrl?`<img src="${n.photoUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" alt="Avatar">`:`<i class="fa-solid fa-user"></i>`);let s=document.getElementById(`footer-notif-badge`),c=document.getElementById(`footer-profile-badge`);(s||c)&&fetch(`${e}/bookings/my-history`,{headers:{Authorization:`Bearer ${t}`}}).then(e=>e.ok?e.json():null).then(e=>{if(e&&Array.isArray(e)){let t=e.filter(e=>{if(e.status!==`PENDING`)return!1;let t=e.createdAt?new Date(e.createdAt).getTime():0;return!(!isNaN(t)&&Date.now()-t>36e5)}).length;t>0?(s&&(s.innerText=t,s.style.display=`flex`),c&&(c.innerText=t,c.style.display=`flex`)):(s&&(s.style.display=`none`),c&&(c.style.display=`none`))}}).catch(e=>console.error(`Error fetching notif:`,e))}else r.style.display=`flex`,i.style.display=`none`}},window.logoutUser=()=>{Swal.fire({title:`Konfirmasi`,text:`Apakah Anda yakin ingin keluar?`,icon:`warning`,showCancelButton:!0,confirmButtonText:`Ya, Logout`,cancelButtonText:`Batal`,confirmButtonColor:`#ef4444`}).then(e=>{e.isConfirmed&&(localStorage.removeItem(`auth_token`),localStorage.removeItem(`auth_user`),window.checkAuthUI(),Swal.fire({icon:`success`,title:`Berhasil Logout`,timer:1500,showConfirmButton:!1}))})},window.showRiwayatTransaksi=async(t=!1)=>{if(!t&&window.location.pathname!==`/riwayat.html`){window.location.href=`/riwayat.html`;return}let n=document.getElementById(`riwayat-page-container`),r=localStorage.getItem(`auth_token`);if(n){if(!r){n.innerHTML=`
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
        `;window.copyTxId=(e,t,n)=>{window.copyText(t,e,`<i class="fa-solid fa-check"></i>`,`<i class="fa-regular fa-copy"></i>`,n)},window.resumePayment=async(t,n)=>{Swal.fire({title:`Memuat Pembayaran...`,html:`Silakan tunggu sebentar.`,allowOutsideClick:!1,didOpen:()=>{Swal.showLoading()}});try{let r={},i=``,a=`-`,o=`-`;try{let n=await(await fetch(`${e}/payment/status/${t}`)).json();if(n.success&&n.data&&n.data.raw){r=n.data.raw,i=(n.data.method||r.method||``).toLowerCase();let e=parseInt(r.amount||`0`);e>0&&(a=new Intl.NumberFormat(`id-ID`,{style:`currency`,currency:`IDR`,minimumFractionDigits:0}).format(e)),r.expires_at&&(o=new Date(r.expires_at).toLocaleString(`id-ID`,{day:`numeric`,month:`long`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}))}}catch(e){console.error(`Gagal fetch dari borderpay API:`,e)}if(!i&&window._lastBookingData){i=(window._lastBookingData.paymentMethod||``).toLowerCase();let e=parseInt((window._lastBookingData.itemPrice||``).toString().replace(/\\D/g,``));!isNaN(e)&&e>0&&(a=new Intl.NumberFormat(`id-ID`,{style:`currency`,currency:`IDR`,minimumFractionDigits:0}).format(e)),window._lastBookingData.expiredAtISO?o=new Date(window._lastBookingData.expiredAtISO).toLocaleString(`id-ID`,{day:`numeric`,month:`long`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}):window._lastBookingData.expiredAt&&(o=window._lastBookingData.expiredAt)}if(i===`qris`&&(r.qr_string||window._lastBookingData?.rawQrisString)){let i=!1;if(r.expires_at)i=Date.now()>new Date(r.expires_at).getTime();else if(window._lastBookingData?.createdAt){let e=new Date(window._lastBookingData.createdAt).getTime();i=!isNaN(e)&&Date.now()-e>36e5}if(i){try{await fetch(`${e}/bookings/by-txid/${t}/status`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify({status:`KADALUARSA`})})}catch{}Swal.fire({icon:`warning`,title:`Pembayaran Kedaluwarsa`,html:`<p style="color:#475569;">Batas waktu pembayaran QRIS sudah <b>terlewat</b>. Kode ini tidak dapat digunakan lagi.</p><p style="color:#64748b;font-size:0.9rem;margin-top:10px;">Silakan buat pesanan baru untuk melanjutkan.</p>`,confirmButtonText:`Buat Pesanan Baru`,confirmButtonColor:`var(--primary-blue)`,showCancelButton:!0,cancelButtonText:`Tutup`}).then(e=>{e.isConfirmed?window.location.href=`/#layanan`:setTimeout(()=>window.loadTransactionHistory?.(),500)});return}let s=r.qr_string||window._lastBookingData.rawQrisString,c=`<img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(s)}" alt="QRIS" style="width:220px;height:220px;border-radius:8px;" />`;Swal.fire({showCloseButton:!1,showConfirmButton:!1,width:`500px`,padding:`0`,html:`
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
                                        <div style="font-size: clamp(1.2rem, 5vw, 2rem); font-weight: 900; color: var(--primary-blue); letter-spacing: 2px; margin-bottom: 15px; word-break: break-all;">${s}</div>
                                        <button onclick="window.copyText('${s}', this, '<i class=\\'fa-solid fa-check\\'></i> Tersalin!', '<i class=\\'fa-regular fa-copy\\'></i> Salin Nomor', event)" 
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
                        `}),window.activePollInterval&&clearInterval(window.activePollInterval),window.activePollInterval=setInterval(async()=>{try{let n=await(await fetch(`${e}/payment/status/${t}`)).json();n.success&&[`PAID`,`SUCCESS`,`SETTLEMENT`,`COMPLETED`].includes(n.data.status?.toUpperCase())&&(clearInterval(window.activePollInterval),window.simulateQrisSuccess(!1,t))}catch{}},5e3)}else{try{await fetch(`${e}/bookings/by-txid/${t}/status`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify({status:`KADALUARSA`})})}catch{}Swal.fire({icon:`warning`,title:`Pembayaran Kedaluwarsa`,html:`<p style="color:#475569;">Kode pembayaran untuk pesanan ini sudah <b>tidak berlaku lagi</b> karena terlalu lama tidak diselesaikan.</p><p style="color:#64748b;font-size:0.9rem;margin-top:10px;">Silakan buat pesanan baru untuk melanjutkan.</p>`,confirmButtonText:`Buat Pesanan Baru`,confirmButtonColor:`var(--primary-blue)`,showCancelButton:!0,cancelButtonText:`Tutup`}).then(e=>{e.isConfirmed?window.location.href=`/#layanan`:setTimeout(()=>window.loadTransactionHistory?.(),500)})}}catch(e){console.error(e),Swal.fire({icon:`error`,title:`Error`,text:`Terjadi kesalahan jaringan atau memuat data.`})}},window.showTransactionDetail=e=>{let t=JSON.parse(decodeURIComponent(e)),n=window.getItemCategoryMeta(t),r=t.status===`PAID`;r||t.status,r||t.status;let i=parseInt((t.itemPrice||``).toString().replace(/\D/g,``)),a=!isNaN(i)&&i>0?`Rp `+i.toLocaleString(`id-ID`):`-`,o=t.createdAt?new Date(t.createdAt).toLocaleDateString(`id-ID`,{day:`numeric`,month:`long`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}):`-`;window._lastBookingData=t;let s=``;t.status===`PENDING`&&(s=`
        <button onclick="window.resumePayment('${t.transactionId}', '${t.itemName}')" 
            style="background:linear-gradient(135deg, var(--primary-green), #15803d); border:none; color:white; font-size:1rem; padding:16px 20px; border-radius:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; font-weight:800; width:100%; margin-bottom:5px; box-shadow:0 8px 20px rgba(22,163,74,0.3); transition:all 0.3s;"
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 25px rgba(22,163,74,0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 20px rgba(22,163,74,0.3)';">
            <i class="fa-solid fa-qrcode" style="font-size:1.2rem;"></i> Lanjutkan Pembayaran
        </button>
                `);let c=`<div style="border-radius: 8px; overflow: hidden; border: 1px solid #94a3b8;"><table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; margin: 0;"><tbody>`,l=(e,t)=>!t||t===`-`?``:`
            <tr>
                <td style="padding: 12px 15px; border: 1px solid #cbd5e1; color:#64748b; font-weight:600; width: 40%; background: #f8fafc; vertical-align: top;">${e}</td>
                <td style="padding: 12px 15px; border: 1px solid #cbd5e1; color:#1e293b; font-weight:700; word-break: break-word; background: white;">${t}</td>
            </tr>
        `,u=(t.itemName||``).toLowerCase(),d=u.includes(`12 jam`)||u.includes(`include driver`);c+=l(`Nama Pemesan`,t.customerName||t.userEmail),c+=l(`Email`,t.customerEmail||t.userEmail),c+=l(`No. HP / WA`,t.phone||t.details?.phone),c+=l(d?`Tgl Pemakaian`:`Tgl Keberangkatan`,t.startDate||t.details?.date),t.endDate&&(!d||t.endDate!==t.startDate)&&(c+=l(`Tgl Selesai`,t.endDate)),d?c+=l(`Durasi Layanan`,t.startDate===t.endDate||!t.endDate?`12 Jam`:`Paket 12 Jam Per Hari`):(t.details?.pickupTime?c+=l(`Waktu Penjemputan`,t.details.pickupTime):t.details?.time&&(c+=l(`Waktu`,t.details.time)),t.details?.dropoffTime&&(c+=l(`Waktu Pengembalian`,t.details.dropoffTime))),t.details?.pax&&(c+=l(`Jumlah Peserta`,t.details.pax+` Orang`)),t.details?.pickup&&(c+=l(d?`Lokasi Penjemputan`:`Lokasi Jemput`,t.details.pickup)),t.details?.dropoff&&(c+=l(d?`Lokasi Pengantaran / Selesai`:`Tujuan`,t.details.dropoff)),t.details?.flightNumber&&(c+=l(`No. Penerbangan`,t.details.flightNumber)),c+=`</tbody></table></div>`;let f=document.getElementById(`riwayat-page-container`);f&&(window.scrollTo({top:0,behavior:`smooth`}),f.innerHTML=`
            <div style="max-width: 520px; margin: 0 auto; padding-bottom: 40px; animation: slideInUp 0.3s ease-out forwards;">
                <div style="text-align: left; font-family: 'Inter', sans-serif; background: #f8fafc; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
                    <!-- Header Card (Premium Gradient) -->
                    <div style="background: linear-gradient(135deg, var(--primary-blue), #1e3a8a); padding: 40px 20px 50px; text-align: center; position: relative;">
                        <button onclick="window.showRiwayatTransaksi(true)" style="position: absolute; top: 15px; left: 15px; background: rgba(255,255,255,0.2); border: none; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; z-index: 10;" onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='scale(1.1)';" onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='scale(1)';"><i class="fa-solid fa-chevron-left" style="margin-right:2px;"></i></button>
                        <div style="width: 75px; height: 75px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; color: ${n.color}; font-size: 2.2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                            <i class="fa-solid ${n.icon}"></i>
                        </div>
                        <h3 style="color: white; font-size: 1.6rem; font-weight: 800; margin: 0 0 5px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">${n.label}</h3>
                        <p style="color: rgba(255,255,255,0.85); font-size: 0.95rem; margin: 0;">${o}</p>
                        
                        <div style="position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%);">
                            <span style="display:inline-block; font-size:0.9rem; font-weight:800; color: white; background: ${r?`var(--primary-green)`:t.status===`PENDING`?`#f59e0b`:`#ef4444`}; padding:8px 24px; border-radius:30px; letter-spacing:1px; box-shadow: 0 6px 15px rgba(0,0,0,0.15); border: 3px solid white;">
                                ${t.status}
                            </span>
                        </div>
                    </div>
                    
                    <!-- Main Content Body -->
                    <div style="padding: 45px 25px 25px;">
                        <!-- Total Pembayaran -->
                        <div style="background: white; border-radius: 18px; padding: 25px; margin-bottom: 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.02);">
                            <p style="color: #64748b; font-size: 0.95rem; font-weight: 600; margin: 0 0 5px; text-transform: uppercase; letter-spacing: 0.5px;">Total Pembayaran</p>
                            <h2 style="color: var(--primary-green); font-size: 2.4rem; font-weight: 900; margin: 0; letter-spacing: -0.5px;">${a}</h2>
                        </div>

                        <!-- ID & Layanan Card -->
                        <div style="background: white; border-radius: 18px; padding: 22px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.02);">
                            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:15px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 15px;">
                                <span style="color:#64748b; font-size:0.95rem; font-weight: 600;"><i class="fa-solid fa-hashtag" style="opacity:0.6; margin-right:8px;"></i> ID Transaksi</span>
                                <div style="display:flex; align-items:center; gap:10px; width:100%;">
                                    <span style="font-family:monospace; font-weight:800; color:var(--primary-blue); font-size:1.1rem; letter-spacing:0.5px; word-break:break-all;">${t.transactionId}</span>
                                    <button onclick="window.copyText('${t.transactionId}', this, '<i class=\\'fa-solid fa-check\\'></i>', '<i class=\\'fa-regular fa-copy\\'></i>', event)" style="background:var(--primary-green); color:white; border:none; border-radius:8px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; box-shadow: 0 4px 10px rgba(22, 163, 74, 0.3); transition: all 0.2s;" title="Salin ID" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><i class="fa-regular fa-copy" style="font-size:0.95rem;"></i></button>
                                </div>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px;">
                                    <span style="color:#64748b; font-size:0.95rem; font-weight: 600;"><i class="fa-solid fa-layer-group" style="opacity:0.6; margin-right:8px;"></i> Layanan</span>
                                    <span style="display:inline-flex; align-items:center; gap:5px; font-size:0.75rem; font-weight:700; color:${n.color}; background:${n.bgColor}; padding:3px 10px; border-radius:8px; border:1px solid ${n.borderColor};">
                                        <i class="fa-solid ${n.icon}"></i> ${n.label}
                                    </span>
                                </div>
                                <span style="font-weight:800; color:#1e293b; font-size:1.15rem; line-height: 1.4; padding-left: 26px; word-break:break-word;">${t.itemName}</span>
                            </div>
                        </div>

                        <!-- Informasi Pemesanan -->
                        <div style="background: white; border-radius: 18px; padding: 22px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.02); margin-bottom: 25px;">
                            <h4 style="color:#1e293b; font-size:1.1rem; margin-top:0; margin-bottom:20px; display:flex; align-items:center; gap:10px; font-weight: 800; border-bottom: 2px solid #f8fafc; padding-bottom: 15px;">
                                <i class="fa-solid fa-list-check" style="color:var(--primary-blue);"></i> Rincian Pesanan
                            </h4>
                            <div style="display: flex; flex-direction: column;">
                                ${c}
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div style="margin-top: 20px;">
                            ${s}
                            
        <button onclick="window.generateEtiketPDF(window._lastBookingData);" 
            style="background:linear-gradient(135deg, var(--primary-blue), #1e3a8a); border:none; color:white; font-size:1rem; padding:16px 20px; border-radius:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; font-weight:800; width:100%; margin-top:12px; box-shadow:0 8px 20px rgba(12,74,110,0.3); transition:all 0.3s;"
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 25px rgba(12,74,110,0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 20px rgba(12,74,110,0.3)';">
            <i class="fa-solid fa-file-pdf" style="font-size:1.2rem;"></i> Download E-Tiket (PDF)
        </button>
    
                        </div>
                    </div>
                </div>
            </div>
            `)},a.forEach(e=>{if(e.status===`PENDING`){let t=e.createdAt?new Date(e.createdAt).getTime():0,n=Date.now()-t;(e.paymentMethod||``).toLowerCase()===`va`?t>0&&n>864e5&&(e.status=`KADALUARSA`):t>0&&n>36e5&&(e.status=`KADALUARSA`)}let t=e.status===`PAID`,n=t?`#10b981`:e.status===`PENDING`?`#f59e0b`:`#ef4444`,r=t?`rgba(16, 185, 129, 0.1)`:e.status===`PENDING`?`rgba(245, 158, 11, 0.1)`:`rgba(239, 68, 68, 0.1)`,i=window.getItemCategoryMeta(e),a=parseInt((e.itemPrice||``).toString().replace(/\D/g,``)),s=!isNaN(a)&&a>0?`Rp `+a.toLocaleString(`id-ID`):`-`,c=e.createdAt?new Date(e.createdAt).toLocaleDateString(`id-ID`,{day:`numeric`,month:`short`,year:`numeric`}):`-`,l=encodeURIComponent(JSON.stringify(e));o+=`
                <div onclick="window.showTransactionDetail('${l}')" style="background: white; border-radius: 20px; padding: 20px; border: 1px solid #f1f5f9; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.03); cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 20px 40px rgba(0,0,0,0.08)'; this.style.borderColor='#e2e8f0';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 25px rgba(0,0,0,0.03)'; this.style.borderColor='#f1f5f9';">
                    
                    <!-- Header: ID & Status -->
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                        <div style="display: flex; align-items: center; gap: 8px; background: #f8fafc; padding: 6px 12px; border-radius: 10px; border: 1px solid #f1f5f9; max-width: 65%;">
                            <i class="fa-solid fa-receipt" style="color: #94a3b8; font-size: 0.8rem; flex-shrink: 0;"></i>
                            <span style="font-size: 0.75rem; color: #475569; font-weight: 700; font-family: monospace; letter-spacing: 0; word-break: break-all;">${e.transactionId}</span>
                            <button onclick="window.copyText('${e.transactionId}', this, '<i class=\\'fa-solid fa-check\\'></i>', '<i class=\\'fa-regular fa-copy\\'></i>', event)" style="background: white; color: var(--primary-blue); border: 1px solid #e2e8f0; border-radius: 6px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; flex-shrink: 0;" title="Salin ID" onmouseover="this.style.background='var(--primary-blue)'; this.style.color='white';" onmouseout="this.style.background='white'; this.style.color='var(--primary-blue)';"><i class="fa-regular fa-copy" style="font-size: 0.65rem;"></i></button>
                        </div>
                        <span style="font-size: 0.7rem; font-weight: 800; color: ${n}; background: ${r}; padding: 6px 12px; border-radius: 20px; letter-spacing: 0.5px; text-transform: uppercase;">
                            ${e.status}
                        </span>
                    </div>

                    <!-- Body: Icon & Title -->
                    <div style="display: flex; gap: 16px; margin-bottom: 16px; flex: 1; align-items: center;">
                        <div style="width: 55px; height: 55px; border-radius: 14px; background: ${i.gradient}; color: ${i.color}; border: 1px solid ${i.borderColor}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.45rem; box-shadow: inset 0 2px 4px rgba(255,255,255,0.6), 0 6px 14px ${i.shadow};">
                            <i class="fa-solid ${i.icon}"></i>
                        </div>
                        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; min-width: 0;">
                            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                                <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.7rem; font-weight: 700; color: ${i.color}; background: ${i.bgColor}; padding: 2px 8px; border-radius: 6px; border: 1px solid ${i.borderColor};">
                                    <i class="fa-solid ${i.icon}" style="font-size: 0.65rem;"></i> ${i.label}
                                </span>
                            </div>
                            <h4 style="margin: 0 0 6px; font-size: 1.05rem; color: #0f172a; font-weight: 800; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word;">${e.itemName}</h4>
                            <div style="font-size: 0.8rem; color: #64748b; display: flex; align-items: center; gap: 6px; font-weight: 500;">
                                <i class="fa-regular fa-calendar-days" style="color: #94a3b8;"></i> Dipesan: ${c}
                            </div>
                        </div>
                    </div>

                    <!-- Footer: Price & Action -->
                    <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px dashed #e2e8f0;">
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-size: 0.7rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; margin-bottom: 2px;">Total Harga</span>
                            <span style="font-weight: 900; color: var(--primary-green); font-size: 1.2rem; letter-spacing: -0.5px;">${s}</span>
                        </div>
                        <div style="background: var(--primary-blue); color: white; padding: 8px 16px; border-radius: 12px; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(14, 165, 233, 0.2); transition: all 0.2s;" onmouseover="this.style.background='#0284c7'; this.style.boxShadow='0 6px 15px rgba(14, 165, 233, 0.3)';" onmouseout="this.style.background='var(--primary-blue)'; this.style.boxShadow='0 4px 10px rgba(14, 165, 233, 0.2)';">
                            Lihat Detail <i class="fa-solid fa-arrow-right" style="font-size: 0.9em;"></i>
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
        `}}},window.checkAuthAndPrompt=()=>localStorage.getItem(`auth_token`)?!0:(typeof window.closeTourModal==`function`&&window.closeTourModal(),typeof window.closeSubPackageModal==`function`&&window.closeSubPackageModal(),window.openAuthModal(),!1),window.submitAuth=async t=>{t.preventDefault();let n=window._authMode===`login`,r=document.getElementById(`auth-email`).value,i=document.getElementById(`auth-password`).value,a=document.getElementById(`auth-name`).value,o=document.getElementById(`btn-auth-submit`);o.disabled=!0,o.innerHTML=`Memproses...`;try{let t=n?`/api/auth/login`:`/api/auth/register`,o={email:r,password:i};n||(o.name=a);let s=await fetch(`${e}${t}`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(o)}),c=await s.json();if(!s.ok)throw Error(c.error||`Terjadi kesalahan`);localStorage.setItem(`auth_token`,c.token),localStorage.setItem(`auth_user`,JSON.stringify(c.user||c.admin)),window.closeAuthModal(),window.checkAuthUI(),Swal.fire({icon:`success`,title:n?`Berhasil Login`:`Berhasil Mendaftar`,toast:!0,position:`top-end`,showConfirmButton:!1,timer:2e3})}catch(e){Swal.fire({icon:`error`,title:`Gagal`,text:e.message,confirmButtonColor:`#1d4ed8`})}finally{o.disabled=!1,o.innerHTML=n?`Login`:`Daftar`}},window.copyShareText=(e,t)=>{let n=decodeURIComponent(e),r=()=>{let e=document.getElementById(t);e&&(e.classList.add(`copied`),e.innerHTML=`<i class="fa-solid fa-check"></i> Tersalin!`,setTimeout(()=>{e.classList.remove(`copied`),e.innerHTML=`<i class="fa-solid fa-copy"></i> Salin`},2500)),Swal.fire({customClass:{container:`swal-high-z`},icon:`success`,title:`Tersalin ke Clipboard!`,text:`Link & detail penawaran siap dibagikan.`,toast:!0,position:`top-end`,showConfirmButton:!1,timer:2500})};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(n).then(r).catch(()=>{try{let e=document.createElement(`textarea`);e.value=n,e.style.position=`fixed`,e.style.opacity=`0`,document.body.appendChild(e),e.select(),document.execCommand(`copy`),document.body.removeChild(e),r()}catch(e){console.error(e)}});else try{let e=document.createElement(`textarea`);e.value=n,e.style.position=`fixed`,e.style.opacity=`0`,document.body.appendChild(e),e.select(),document.execCommand(`copy`),document.body.removeChild(e),r()}catch(e){console.error(e)}},window.closeShareModal=()=>{try{typeof Swal<`u`&&typeof Swal.close==`function`&&Swal.close()}catch(e){console.error(`Error closing share modal:`,e)}setTimeout(()=>{document.querySelectorAll(`.swal2-container.swal-share-container`).forEach(e=>e.remove()),document.body.classList.remove(`swal2-shown`,`swal2-height-auto`)},120)},window.triggerNativeShare=(e,t,n)=>{navigator.share&&navigator.share({title:e,text:decodeURIComponent(t),url:decodeURIComponent(n)}).catch(e=>{e&&e.name!==`AbortError`&&console.warn(e)})},window.shareItem=(e,t,n)=>{e||=``,t||=`Penawaran Spesial Lombok`,n||=``;let r=window.location.origin+window.location.pathname+`?item=`+encodeURIComponent(e),i=`Halo! 👋\n\nSaya menemukan penawaran menarik dari *Travel Lombok Airport* nih:\n\n📌 *${t}*`+(n?`\n💰 *${n}*`:``)+`\n\nYuk, cek detail lengkapnya dan booking sekarang melalui link di bawah ini:\n📍 ${r}`,a=`Ada rencana liburan ke Lombok? 🌴\n\nCek penawaran seru dari Travel Lombok Airport!\n📌 ${t}`+(n?`\n💰 ${n}`:``)+`\n\nLangsung booking dan lihat detailnya di sini 👇\n📍 ${r}`,o=`https://wa.me/?text=${encodeURIComponent(i)}`,s=`https://twitter.com/intent/tweet?text=${encodeURIComponent(a)}`,c=`https://threads.net/intent/post?text=${encodeURIComponent(a)}`,l=String(t).replace(/[<>&"']/g,e=>({"<":`&lt;`,">":`&gt;`,"&":`&amp;`,'"':`&quot;`,"'":`&#39;`})[e]),u=n?String(n).replace(/[<>&"']/g,e=>({"<":`&lt;`,">":`&gt;`,"&":`&amp;`,'"':`&quot;`,"'":`&#39;`})[e]):`Penawaran Terbaik`,d=typeof navigator<`u`&&typeof navigator.share==`function`;Swal.fire({customClass:{container:`swal-high-z swal-share-container`,popup:`swal-share-popup`},html:`
            <div class="share-modal-wrapper">
                <div class="share-modal-header">
                    <div class="share-modal-header-left">
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
                    <button type="button" class="share-modal-close-arrow" onclick="window.closeShareModal()" aria-label="Kembali" title="Kembali">
                        <i class="fa-solid fa-arrow-left"></i>
                    </button>
                </div>

                <div class="share-preview-card">
                    <div class="share-preview-icon">
                        <i class="fa-solid fa-location-dot"></i>
                    </div>
                    <div class="share-preview-info">
                        <div class="share-preview-badge">
                            <span></span> Penawaran Pilihan
                        </div>
                        <div class="share-preview-title" title="${l}">${l}</div>
                        <div class="share-preview-price">${u}</div>
                    </div>
                </div>

                <div class="share-actions-list">
                    <a href="${o}" target="_blank" rel="noopener noreferrer" class="share-btn-item share-btn-wa">
                        <div class="share-btn-icon-wrap">
                            <i class="fa-brands fa-whatsapp"></i>
                        </div>
                        <div class="share-btn-content">
                            <div class="share-btn-title">Bagikan ke WhatsApp</div>
                            <div class="share-btn-desc">Kirim pesan langsung ke chat atau grup</div>
                        </div>
                        <i class="fa-solid fa-chevron-right share-btn-arrow"></i>
                    </a>

                    <a href="${s}" target="_blank" rel="noopener noreferrer" class="share-btn-item share-btn-tw">
                        <div class="share-btn-icon-wrap">
                            <i class="fa-brands fa-twitter"></i>
                        </div>
                        <div class="share-btn-content">
                            <div class="share-btn-title">Bagikan ke Twitter / X</div>
                            <div class="share-btn-desc">Tweet rekomendasi liburan ke followers</div>
                        </div>
                        <i class="fa-solid fa-chevron-right share-btn-arrow"></i>
                    </a>

                    <a href="${c}" target="_blank" rel="noopener noreferrer" class="share-btn-item share-btn-threads">
                        <div class="share-btn-icon-wrap">
                            <svg viewBox="0 0 192 192" width="20" height="20" fill="currentColor" style="display:block;">
                                <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.4619 44.745C97.1852 44.7431 96.9082 44.7422 96.6309 44.7422C81.8286 44.7422 69.8398 51.5284 62.9092 63.8569L78.6946 72.7483C83.2798 64.5959 90.7226 62.5938 96.6309 62.5938C96.7905 62.5938 96.9507 62.5944 97.1113 62.5956C108.625 62.6688 117.29 70.071 118.825 81.385C113.676 80.8931 108.271 80.817 102.779 81.1614C80.252 82.5735 66.8623 95.8454 67.3193 112.59C67.7663 128.966 81.6572 140.548 99.8516 139.697C114.774 139.001 125.758 132.327 131.656 120.938C136.213 129.803 143.702 134.792 154.512 134.792C167.378 134.792 176.441 125.968 176.441 109.847C176.441 73.1979 146.402 36.2152 96.6309 36.2152C53.7715 36.2152 23.3672 65.5593 23.3672 108.571C23.3672 153.284 54.8984 180 96.6309 180C118.232 180 137.607 170.835 147.531 155.656L134.195 144.172C126.969 155.222 112.531 162.148 96.6309 162.148C65.584 162.148 41.2188 141.42 41.2188 108.571C41.2188 74.9216 63.8574 54.0672 96.6309 54.0672C136.93 54.0672 158.59 83.1944 158.59 109.847C158.59 118.423 154.197 122.94 147.609 122.94C140.404 122.94 135.344 118.006 132.84 110.373C137.914 102.392 140.975 93.3082 141.537 88.9883ZM101.656 122.259C90.3125 122.789 83.9902 116.48 83.7422 107.387C83.4727 97.498 91.8027 90.7688 103.885 90.0117C107.568 89.7809 111.199 89.8781 114.725 90.2971C113.141 112.825 106.678 122.025 101.656 122.259Z"/>
                            </svg>
                        </div>
                        <div class="share-btn-content">
                            <div class="share-btn-title">Bagikan ke Threads</div>
                            <div class="share-btn-desc">Posting rekomendasi liburan di Threads</div>
                        </div>
                        <i class="fa-solid fa-chevron-right share-btn-arrow"></i>
                    </a>

                    ${d?`
                    <button type="button" onclick="window.triggerNativeShare('${l.replace(/'/g,`\\'`)}', '${encodeURIComponent(a)}', '${encodeURIComponent(r)}')" class="share-btn-item share-btn-native">
                        <div class="share-btn-icon-wrap">
                            <i class="fa-solid fa-share-nodes"></i>
                        </div>
                        <div class="share-btn-content">
                            <div class="share-btn-title">Bagikan ke Aplikasi Lain</div>
                            <div class="share-btn-desc">Instagram, Facebook, Telegram, dll</div>
                        </div>
                        <i class="fa-solid fa-chevron-right share-btn-arrow"></i>
                    </button>
                    `:``}

                    <button type="button" onclick="window.copyShareText('${encodeURIComponent(a)}', 'copy-share-badge')" class="share-btn-item share-btn-copy">
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
            </div>
        `,showConfirmButton:!1,showCloseButton:!1})};var y=[];try{let e=localStorage.getItem(`aiChatHistory`);e&&(y=JSON.parse(e))}catch(e){console.error(`Failed to load chat history`,e)}window.renderChatHistory=()=>{if(y.length===0)return;let e=document.getElementById(`chat-messages`);e&&(e.innerHTML=``,y.forEach(t=>{if(t.role===`user`)e.insertAdjacentHTML(`beforeend`,`
                <div class="message user-message">
                    ${t.parts[0].text}
                </div>
            `);else{let n=j(t.parts[0].text);e.insertAdjacentHTML(`beforeend`,`
                <div class="message ai-message">
                    ${n}
                </div>
            `)}}),e.insertAdjacentHTML(`afterbegin`,`
        <div class="message ai-message">
            Halo Kak! 👋 Saya AIRA, asisten virtual Travel Lombok Airport. Ada yang bisa saya bantu untuk rencana perjalanan Anda?
        </div>
    `),e.scrollTop=e.scrollHeight,window.checkGuestLimit())},document.addEventListener(`DOMContentLoaded`,()=>{document.getElementById(`chat-messages`)&&window.renderChatHistory(),typeof window.initChipsScroll==`function`&&window.initChipsScroll()}),window.clearChatHistory=()=>{if(!confirm(`Hapus semua riwayat percakapan dengan AIRA?`))return;y=[],localStorage.removeItem(`aiChatHistory`);let e=document.getElementById(`chat-messages`);e&&(e.innerHTML=`
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
        `);let t=document.getElementById(`guest-limit-banner`);t&&(t.style.display=`none`);let n=document.getElementById(`chat-input`),r=document.getElementById(`send-chat-btn`);n&&(n.disabled=!1,n.placeholder=`Tanya rekomendasi paket...`,n.value=``),r&&(r.disabled=!1),window.checkGuestLimit()};var b=null,x=null;function S(){b&&clearInterval(b),x&&clearTimeout(x);let e=()=>{if(localStorage.getItem(`aira_user_rating`)){b&&clearInterval(b),x&&clearTimeout(x);return}let e=localStorage.getItem(`aira_rating_block`);if(e&&new Date().getTime()<parseInt(e))return;let t=document.getElementById(`chat-messages`),n=document.getElementById(`ai-chat-window`);if(!t||!n||n.classList.contains(`hidden`)||document.querySelector(`.aira-rating-bubble`))return;let r=document.createElement(`div`);r.className=`chat-message bot aira-rating-bubble`,r.style.marginBottom=`15px`,r.innerHTML=`
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
        `,t.appendChild(r),t.scrollTop=t.scrollHeight;let i=r.querySelectorAll(`.star-btn`);i.forEach(e=>{e.addEventListener(`click`,async e=>{let t=e.target.getAttribute(`data-val`);r.innerHTML=`<div class="chat-bubble" style="background:#dcfce3; color:#166534; padding:10px; border-radius:10px; text-align:center; font-size:0.85rem;"><i class="fa-solid fa-check-circle" style="margin-right:5px;"></i>Terima kasih atas rating ${t} bintang Anda! ⭐</div>`,localStorage.setItem(`aira_user_rating`,t),b&&clearInterval(b),x&&clearTimeout(x);try{await fetch(`/api/ai/rating`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({rating:parseInt(t),sessionId:window.currentChatSessionId||`unknown`})})}catch(e){console.error(e)}}),e.addEventListener(`mouseover`,e=>{let t=parseInt(e.target.getAttribute(`data-val`));i.forEach(e=>{e.style.color=parseInt(e.getAttribute(`data-val`))<=t?`#fbbf24`:`#cbd5e1`})}),e.addEventListener(`mouseout`,()=>{i.forEach(e=>e.style.color=`#cbd5e1`)})})};x=setTimeout(()=>{e(),b=setInterval(e,3e5)},1e4)}window.blockAiraRating=e=>{let t=new Date().getTime()+864e5;localStorage.setItem(`aira_rating_block`,t.toString());let n=e.closest(`.chat-message`);n.innerHTML=`<div class="chat-bubble" style="background:#fee2e2; color:#991b1b; padding:10px; border-radius:10px; text-align:center; font-size:0.85rem;"><i class="fa-solid fa-bell-slash" style="margin-right:5px;"></i>Rating dinonaktifkan selama 1 hari.</div>`,setTimeout(()=>{n.remove()},3e3)};var C=0;window.scrollChatToBottom=(e=!0)=>{let t=document.getElementById(`chat-messages`);t&&t.scrollTo({top:t.scrollHeight,behavior:e?`smooth`:`auto`}),window.resetChatScrollBadge()},window.resetChatScrollBadge=()=>{C=0;let e=document.getElementById(`chat-unread-badge`);e&&(e.style.display=`none`,e.textContent=`0`);let t=document.getElementById(`chat-scroll-bottom-btn`);t&&t.classList.remove(`visible`)},window.updateChatScrollBtnVisibility=()=>{let e=document.getElementById(`chat-messages`),t=document.getElementById(`chat-scroll-bottom-btn`);!e||!t||(e.scrollHeight-e.scrollTop-e.clientHeight>75?t.classList.add(`visible`):(t.classList.remove(`visible`),window.resetChatScrollBadge()))},window.handleNewIncomingAiraMessage=()=>{let e=document.getElementById(`chat-messages`),t=document.getElementById(`chat-scroll-bottom-btn`),n=document.getElementById(`chat-unread-badge`);e&&(e.scrollHeight-e.scrollTop-e.clientHeight>90?(C++,n&&(n.textContent=C>9?`9+`:C,n.style.display=`flex`),t&&t.classList.add(`visible`)):(e.scrollTop=e.scrollHeight,t&&t.classList.remove(`visible`)))},window.initChatScrollListener=()=>{let e=document.getElementById(`chat-messages`);e&&!e.dataset.scrollBound&&(e.dataset.scrollBound=`true`,e.addEventListener(`scroll`,window.updateChatScrollBtnVisibility,{passive:!0}))},window.toggleChat=async()=>{let t=document.getElementById(`ai-chat-window`);if(t.classList.toggle(`hidden`),t.classList.contains(`hidden`))b&&clearInterval(b),x&&clearTimeout(x);else{S(),window.initChatScrollListener(),typeof window.initChipsScroll==`function`&&window.initChipsScroll();let t=document.getElementById(`chat-input`),n=document.getElementById(`send-chat-btn`),r=document.getElementById(`mic-chat-btn`),i=document.getElementById(`chat-messages`);try{let a=await fetch(`${e}/settings`);if(a.ok){if((await a.json()).aiMaintenanceMode){t&&(t.disabled=!0,t.placeholder=`AI sedang dalam perbaikan...`),n&&(n.disabled=!0),r&&(r.disabled=!0),i&&!i.innerHTML.includes(`pemeliharaan`)&&(i.innerHTML+=`
                            <div class="message ai-message" style="background-color: #fef3c7; color: #92400e; border: 1px solid #f59e0b;">
                                <i class="fa-solid fa-person-digging"></i> Mohon maaf, fitur AIRA sedang dalam pemeliharaan dan peningkatan sistem. Silakan hubungi kami via WhatsApp sementara waktu.
                            </div>
                        `,i.scrollTop=i.scrollHeight);return}t&&t.placeholder===`AI sedang dalam perbaikan...`&&(t.disabled=!1,t.placeholder=`Tanya rekomendasi paket...`,n&&(n.disabled=!1),r&&(r.disabled=!1))}}catch(e){console.error(`Failed to check AI settings`,e)}document.getElementById(`chat-input`).focus(),window.checkGuestLimit(),i&&(i.scrollTop=i.scrollHeight,window.resetChatScrollBadge())}},window.handleChatKeyPress=e=>{e.key===`Enter`&&window.sendChatMessage()};function w(e){if(!e)return[];let n=window.globalItems&&window.globalItems.length>0?window.globalItems:t===void 0?[]:t;if(!n||n.length===0)return[];let r=n.filter(e=>{let t=Number(e.price||0),n=(e.title||``).toLowerCase(),r=(e.category||``).toLowerCase();return!(t<=0||e.isParent||n.includes(`pricelist`)||r===`transfer`||r===`airport`||e.transferMatrix&&e.transferMatrix.length>0)});if(r.length===0)return[];let i=[],a=new Set,o=e.toLowerCase().replace(/beat\s+street/g,`beat streat beat street`).replace(/beat\s+streat/g,`beat streat beat street`).replace(/inova/g,`innova`).replace(/zenik/g,`zenix`).replace(/all\s+new\s+/g,``).replace(/grand\s+new\s+/g,``),s=/(?:\?|&)item=([a-zA-Z0-9_\-]+)/gi,c;for(;(c=s.exec(e))!==null;){let e=c[1];if(!a.has(e)){let t=r.find(t=>t.id===e);t&&(a.add(e),i.push(t))}}let l=[...r].sort((e,t)=>(t.title?.length||0)-(e.title?.length||0));for(let e of l){if(!e.title||a.has(e.id))continue;let t=e.title.toLowerCase();if((o.includes(t)||t.includes(`streat`)&&o.includes(t.replace(`streat`,`street`))||t.includes(`street`)&&o.includes(t.replace(`street`,`streat`)))&&(a.add(e.id),i.push(e),i.length>=3))break}if(i.length<3)for(let e of[{keywords:[`beat street`,`beat streat`,`beat`],matchTitle:`beat streat`},{keywords:[`vario 125`,`vario 160`,`vario`],matchTitle:`vario`},{keywords:[`nmax`,`n-max`],matchTitle:`nmax`},{keywords:[`pcx`],matchTitle:`pcx`},{keywords:[`adv`],matchTitle:`adv`},{keywords:[`scoopy`],matchTitle:`scoopy`},{keywords:[`innova zenix`,`zenix`],matchTitle:`innova zenix`},{keywords:[`innova reborn`,`reborn`],matchTitle:`innova reborn`},{keywords:[`innova`],matchTitle:`innova`},{keywords:[`avanza fl`,`avanza facelift`],matchTitle:`avanza fl`},{keywords:[`new avanza`,`all new avanza`],matchTitle:`new avanza`},{keywords:[`avanza`],matchTitle:`avanza`},{keywords:[`brio`,`honda brio`],matchTitle:`brio`},{keywords:[`agya`],matchTitle:`agya`},{keywords:[`xpander`,`mitsubishi xpander`],matchTitle:`xpander`},{keywords:[`hiace premio`,`premio`],matchTitle:`hiace premio`},{keywords:[`hiace commuter`,`commuter`],matchTitle:`hiace commuter`},{keywords:[`hiace`],matchTitle:`hiace`},{keywords:[`fortuner`],matchTitle:`fortuner`},{keywords:[`alphard`],matchTitle:`alphard`},{keywords:[`raize`,`rize`],matchTitle:`rize`},{keywords:[`wrv`,`wr-v`],matchTitle:`wrv`},{keywords:[`honeymoon`],matchCat:`honeymoon`},{keywords:[`gili`,`mandalika`,`sembalun`,`sasak`,`snorkeling`,`trip`,`paket wisata`,`paket tour`],matchCat:`package`}]){if(i.length>=3)break;if(!e.keywords.some(e=>o.includes(e)))continue;let t=null;e.matchTitle?t=r.find(t=>!a.has(t.id)&&(t.title||``).toLowerCase().includes(e.matchTitle)):e.matchCat&&(t=r.find(t=>!a.has(t.id)&&((t.category||``).toLowerCase()===e.matchCat||(t.category||``).toLowerCase().includes(e.matchCat)))),t&&!a.has(t.id)&&(a.add(t.id),i.push(t))}if(i.length===0){if(/\b(motor|motorcycle|sewa motor|rental motor)\b/i.test(o)){let e=r.filter(e=>(e.category||``).toLowerCase()===`motorcycle`);e.length>0&&i.push(e[0])}else if(/\b(mobil|car|rental mobil|sewa mobil|lepas kunci)\b/i.test(o)){let e=r.filter(e=>(e.category||``).toLowerCase()===`car`);e.length>0&&i.push(e[0])}else if(/\b(tour|paket|wisata|trip|liburan|pantai|gili)\b/i.test(o)){let e=r.filter(e=>[`package`,`tour`,`honeymoon`].includes((e.category||``).toLowerCase()));e.length>0&&i.push(e[0])}}return i}function T(e){if(!e||e.length===0)return``;let t=e.filter(e=>{let t=Number(e.price||0),n=(e.title||``).toLowerCase(),r=(e.category||``).toLowerCase();return!(t<=0||e.isParent||n.includes(`pricelist`)||r===`transfer`||r===`airport`||e.transferMatrix&&e.transferMatrix.length>0)});return t.length===0?``:`
    <div class="aira-mini-cards-wrapper">
        <div class="aira-mini-cards-scroll">
            ${t.map(e=>{let t=`fa-car`,n=`Rental Mobil`,r=(e.category||``).toLowerCase();r===`motorcycle`?(t=`fa-motorcycle`,n=`Rental Motor`):r===`package`||r===`tour`?(t=`fa-umbrella-beach`,n=`Paket Wisata`):r===`honeymoon`?(t=`fa-heart`,n=`Paket Honeymoon`):r===`drone`?(t=`fa-plane-up`,n=`Sewa Drone`):(r===`transfer`||r===`airport`)&&(t=`fa-plane-departure`,n=`Antar Jemput`);let a=typeof i==`function`?i(e.price):`Rp ${Number(e.price||0).toLocaleString(`id-ID`)}`,o=e.duration?`/ ${e.duration}`:r===`package`?`/ paket`:`/ hari`,s=(e.title||``).replace(/'/g,`\\'`).replace(/"/g,`&quot;`);return`
        <div class="aira-mini-card">
            <div class="aira-card-img-box">
                <img src="${e.imageUrl||`https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600`}" alt="${s}" onerror="this.src='/logo.png'">
                <span class="aira-card-badge"><i class="fa-solid ${t}"></i> ${n}</span>
            </div>
            <div class="aira-card-info">
                <h5 class="aira-card-name" title="${s}">${e.title}</h5>
                <div class="aira-card-pricing">
                    <span class="aira-card-price-start">Mulai dari</span>
                    <div class="aira-card-price-val">${a} <small>${o}</small></div>
                </div>
                <div class="aira-card-actions">
                    <button type="button" onclick="window.openTourModal('${e.id}')" class="aira-card-btn-detail" title="Lihat Detail & Fasilitas">
                        <i class="fa-solid fa-circle-info"></i> Detail Lengkap
                    </button>
                    <div class="aira-card-actions-row">
                        <button type="button" onclick="window.openCheckoutModal('${s}', ${e.price}, 'wa')" class="aira-card-btn-wa" title="Pesan via WhatsApp">
                            <i class="fa-brands fa-whatsapp"></i> via WA
                        </button>
                        <button type="button" onclick="window.openCheckoutModal('${s}', ${e.price}, 'web')" class="aira-card-btn-web" title="Pesan Form via Website Langsung">
                            <i class="fa-solid fa-desktop"></i> via Web
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `}).join(``)}
        </div>
    </div>
    `}function E(e,t){return t&&t.length>0?!0:e?/(booking|pesan|sewa|rental|paket|tour|avanza|innova|hiace|brio|xpander|alphard|fortuner|motor|mobil|lepas kunci|driver|supir|sopir|jemput|antar jemput|transfer|bandara|dp|deposit|harga|tarif|biaya|tersedia|rekening|kunci jadwal)/i.test(e):!1}function D(e,t,n){let r=(n||``).toLowerCase(),i=(t||``).toLowerCase();if(e&&e.length>0){let t=e.map(e=>(e.category||``).toLowerCase()),n=e.map(e=>(e.title||``).toLowerCase()).join(` `);if(t.includes(`car`)||t.includes(`mobil`)||/(avanza|innova|hiace|brio|xpander|alphard|fortuner|calya|sigra|raize|rocky|agya|ayla|ertiga|xl7|mobil)/i.test(n))return`mobil`;if(t.includes(`motorcycle`)||t.includes(`motor`)||/(nmax|scoopy|pcx|vario|beat|aerox|vespa|fazzio|motor)/i.test(n))return`motor`;if(t.includes(`package`)||t.includes(`tour`)||/(tour|paket wisata|honeymoon|private trip|snorkeling)/i.test(n))return`tour`;if(t.includes(`transfer`)||t.includes(`airport`))return`transfer`}return/(avanza|innova|hiace|brio|xpander|alphard|fortuner|calya|sigra|raize|rocky|agya|ayla|ertiga|xl7|mobil|sewa mobil|rental mobil)/i.test(r)?`mobil`:/(nmax|scoopy|pcx|vario|beat|aerox|vespa|fazzio|motor|sewa motor|rental motor)/i.test(r)?`motor`:/(antar jemput|drop off|pick up|jemput bandara|antar bandara|transfer bandara)/i.test(r)?`transfer`:/(paket tour|paket wisata|private trip|honeymoon|tour lombok)/i.test(r)?`tour`:/(avanza|innova|hiace|brio|xpander|alphard|fortuner|calya|sigra|sewa mobil|rental mobil)/i.test(i)?`mobil`:/(sewa motor|rental motor|nmax|scoopy|pcx|vario|beat)/i.test(i)?`motor`:/(antar jemput bandara|transfer bandara)/i.test(i)?`transfer`:/(paket tour|paket wisata|private trip|honeymoon trip)/i.test(i)?`tour`:`mobil`}function O(e,t,n){let r=((n||``)+` `+(t||``)).toLowerCase();return!/(lepas kunci|tanpa supir|tanpa driver|tanpa sopir|self drive|self-drive)/i.test(r)&&!!(/(dengan supir|dengan driver|dengan sopir|include supir|include driver|all in|all-in|plus supir|plus driver)/i.test(r)||e&&e.length>0&&e.some(e=>e.driverOptions&&e.driverOptions!==`Tidak Include Driver`))}function k(e,t){return e===`mobil`?t?{dp:`Rp 200.000 (Kunci mobil & supir resmi)`,deposit:`Rp 0 (BEBAS DEPOSIT karena didampingi supir resmi)`,badgeDp:`Rp 200rb (Kunci Mobil & Supir)`,badgeDeposit:`Bebas Deposit (Rp 0 include driver)`}:{dp:`Rp 200.000 (Kunci jadwal & unit mobil)`,deposit:`Rp 1.000.000 (100% Refund dikembalikan penuh saat mobil kembali aman)`,badgeDp:`Rp 200rb (Kunci Jadwal & Unit)`,badgeDeposit:`Rp 1jt (100% Refundable)`}:e===`motor`?{dp:`Rp 50.000 (Kunci unit motor)`,deposit:`Rp 500.000 (100% Refund dikembalikan penuh saat motor kembali aman)`,badgeDp:`Rp 50rb (Kunci Unit)`,badgeDeposit:`Rp 500rb (100% Refundable)`}:e===`tour`?{dp:`Rp 500.000 (Kunci armada, jadwal & guide)`,deposit:`Rp 0 (BEBAS DEPOSIT untuk Paket Tour)`,badgeDp:`Rp 500rb (Kunci Armada & Guide)`,badgeDeposit:`Bebas Deposit (Rp 0)`}:e===`transfer`?{dp:`Rp 100.000 / Pelunasan saat tiba`,deposit:`Rp 0 (BEBAS DEPOSIT untuk Antar Jemput)`,badgeDp:`Rp 100rb / Pelunasan Tiba`,badgeDeposit:`Bebas Deposit (Rp 0)`}:{dp:`Rp 200.000 (Kunci jadwal & unit mobil)`,deposit:`Rp 1.000.000 (100% Refund dikembalikan penuh saat mobil kembali aman)`,badgeDp:`Rp 200rb (Kunci Jadwal & Unit)`,badgeDeposit:`Rp 1jt (100% Refundable)`}}function A(e,t){let n=encodeURIComponent(e||``).replace(/'/g,`\\'`),r=``;if(y!==void 0&&Array.isArray(y)){for(let e=y.length-1;e>=0;e--)if(y[e].role===`user`&&y[e].parts&&y[e].parts[0]?.text){r=y[e].parts[0].text.trim();break}}let i=k(D(t,e,r),O(t,e,r)),a=i.deposit.includes(`BEBAS DEPOSIT`)?`style="color:#059669;"`:``;return`
    <div class="aira-wa-lead-card">
        <div class="aira-wa-lead-header">
            <span class="aira-wa-lead-pill"><i class="fa-solid fa-bolt"></i> Auto-Summary Lead</span>
            <span class="aira-wa-lead-sub">Pesan instan via WhatsApp atau Web</span>
        </div>
        <div class="aira-wa-lead-buttons-group">
            <button type="button" onclick="window.orderViaWhatsAppFromAira(this, '${n}')" class="aira-wa-lead-action-btn" title="Lanjut Booking via WhatsApp CS">
                <span class="aira-wa-lead-btn-icon"><i class="fa-brands fa-whatsapp"></i></span>
                <div class="aira-wa-lead-btn-content">
                    <span class="aira-wa-lead-btn-title">📲 Booking via WhatsApp CS</span>
                    <span class="aira-wa-lead-btn-desc">Buka WA dengan rangkuman detail pesanan otomatis</span>
                </div>
                <i class="fa-solid fa-arrow-right aira-wa-lead-arrow"></i>
            </button>
            <button type="button" onclick="window.orderViaWebFromAira(this, '${n}')" class="aira-web-lead-action-btn" title="Buka Form Booking Online Resmi via Web">
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
            ${`
        <div class="aira-lead-terms-row">
            <span class="aira-lead-badge-item"><strong>DP:</strong> ${i.badgeDp}</span>
            <span class="aira-lead-badge-item" ${a}><strong>Deposit Jaminan:</strong> ${i.badgeDeposit}</span>
        </div>
    `}
            <div class="aira-wa-lead-terms-note">
                <i class="fa-solid fa-circle-check" style="color:#10b981;"></i> DP mengunci jadwal agar aman &bull; Deposit jaminan 100% kembali setelah sewa
            </div>
        </div>
    </div>
    `}window.orderViaWhatsAppFromAira=(e,t)=>{let n=``;try{n=decodeURIComponent(t||``)}catch{n=t||``}let r=``;if(y!==void 0&&Array.isArray(y)){for(let e=y.length-1;e>=0;e--)if(y[e].role===`user`&&y[e].parts&&y[e].parts[0]?.text){r=y[e].parts[0].text.trim();break}}let a=typeof w==`function`?w(n):[],o=``,s=``,c=0,l=((r||``)+` `+(n||``)).match(/(\d+)\s*(?:hari|day|h\b)/i);if(l&&(c=parseInt(l[1],10)),a&&a.length>0){o=a.map(e=>e.title).join(` / `);let e=a.map(e=>Number(e.price||0)).filter(e=>e>0);if(e.length===1){let t=e[0],n=typeof i==`function`?i(t):`Rp ${t.toLocaleString(`id-ID`)}`;if(c>1){let e=t*c,r=typeof i==`function`?i(e):`Rp ${e.toLocaleString(`id-ID`)}`;s=`${n} / hari (Total ${c} Hari: ${r})`}else s=`${n} / hari`}else if(e.length>1){let t=Math.min(...e),n=Math.max(...e),r=typeof i==`function`?i(t):`Rp ${t.toLocaleString(`id-ID`)}`,a=typeof i==`function`?i(n):`Rp ${n.toLocaleString(`id-ID`)}`;if(c>1){let e=t*c,o=n*c,l=typeof i==`function`?i(e):`Rp ${e.toLocaleString(`id-ID`)}`,u=typeof i==`function`?i(o):`Rp ${o.toLocaleString(`id-ID`)}`;s=`${r} - ${a} / hari (Total ${c} Hari: ${l} - ${u})`}else s=`${r} - ${a} / hari`}else s=a.map(e=>typeof i==`function`?i(e.price):`Rp ${Number(e.price||0).toLocaleString(`id-ID`)}`).join(`, `)}else{let e=(r+` `+n).toLowerCase();o=e.includes(`avanza`)?`Toyota Avanza`:e.includes(`innova zenix`)?`Toyota Innova Zenix`:e.includes(`innova reborn`)?`Toyota Innova Reborn`:e.includes(`innova`)?`Toyota Innova`:e.includes(`hiace`)?`Toyota Hiace Commuter / Premio`:e.includes(`brio`)?`Honda Brio`:e.includes(`xpander`)?`Mitsubishi Xpander`:e.includes(`fortuner`)?`Toyota Fortuner`:e.includes(`alphard`)?`Toyota Alphard`:e.includes(`nmax`)||e.includes(`scoopy`)||e.includes(`sewa motor`)||e.includes(`rental motor`)?`Sewa Motor Lombok`:e.includes(`tour`)||e.includes(`paket`)?`Paket Tour Wisata Lombok`:e.includes(`antar jemput`)||e.includes(`bandara`)||e.includes(`transfer`)?`Antar Jemput Bandara BIL (Airport Transfer)`:`Layanan Rekomendasi AIRA`}if(!s){let e=n.match(/Rp\s?[\d.,]+(?:\/\s?[a-zA-Z]+)?/i);e&&(s=e[0],c>1&&!s.includes(`Total`)&&(s+=` (Durasi ${c} Hari)`))}let u=k(D(a,n,r),O(a,n,r)),d=`Halo CS Travel Lombok Airport, 👋
Saya mau booking sesuai rekomendasi AIRA:

📌 *Layanan:* ${o}\n`;if(s&&(d+=`💰 *Estimasi Tarif:* ${s}\n`),r){let e=r.replace(/[\r\n]+/g,` `).trim(),t=e.length>140?e.substring(0,137)+`...`:e;d+=`📝 *Kebutuhan Saya:* "${t}"\n`}d+=`\nℹ️ *Ketentuan Pembayaran (DP & Deposit):*\n• *DP (Booking Fee):* ${u.dp}\n• *Deposit Jaminan:* ${u.deposit}\n\nApakah unit dan jadwal tersebut masih tersedia? Mohon info nomor rekening resmi admin untuk konfirmasi pembayaran DP. Terima kasih! 🙏`;let f=`https://wa.me/6289676963255?text=${encodeURIComponent(d)}`;e&&(e.style.transform=`scale(0.97)`,setTimeout(()=>{e&&(e.style.transform=``)},150)),window.open(f,`_blank`)},window.orderViaWebFromAira=(e,t)=>{let n=``;try{n=decodeURIComponent(t||``)}catch{n=t||``}e&&(e.style.transform=`scale(0.97)`,setTimeout(()=>{e&&(e.style.transform=``)},150));let r=``;if(y!==void 0&&Array.isArray(y)){for(let e=y.length-1;e>=0;e--)if(y[e].role===`user`&&y[e].parts&&y[e].parts[0]?.text){r=y[e].parts[0].text.trim();break}}let i=typeof w==`function`?w(n):[];if(i&&i.length>0){let e=i[0];window.openCheckoutModal(e.title,e.price,`web`);return}let a=typeof D==`function`?D([],n,r):`mobil`,o=`Sewa Mobil`;a===`motor`?o=`Sewa Motor`:a===`tour`?o=`Paket Tour`:a===`transfer`&&(o=`Airport Transfer`),window.openCheckoutModal(o,0,`web`)},window.handleAiraBookingLinkClick=(e,t)=>{let n=((e||``)+` `+(t||``)).toLowerCase(),r=null;if(window.globalItems&&Array.isArray(window.globalItems)){let e=window.globalItems.filter(e=>Number(e.price||0)>0&&!e.isParent);if(r=e.find(e=>{let t=(e.title||``).toLowerCase();return n.includes(t)||t.includes(n.replace(/(form|pemesanan|sewa|rental|booking|order)/g,``).trim())}),!r){for(let t of[`beat`,`scoopy`,`nmax`,`pcx`,`vario`,`aerox`,`fazzio`,`avanza`,`innova`,`hiace`,`brio`,`xpander`,`alphard`,`fortuner`,`honeymoon`])if(n.includes(t)&&(r=e.find(e=>(e.title||``).toLowerCase().includes(t)),r))break}}if(r)window.openCheckoutModal(r.title,r.price,`web`);else{let t=(e||``).replace(/^(form\s+pemesanan\s+|form\s+booking\s+|form\s+|sewa\s+|rental\s+)/i,``).trim();window.openCheckoutModal(t||`Pemesanan Layanan`,0,`web`)}};function j(e,t=!1){let n=e;if(n=n.replace(/\*\*(.*?)\*\*/g,`<strong>$1</strong>`),n=n.replace(/\[(.*?)\]\((.*?)(?:\?|&)item=([a-zA-Z0-9_\-]+)\)/gi,(e,t,n,r)=>`<a href="javascript:void(0)" onclick="window.openTourModal('${r}')" class="aira-chat-pill-link"><i class="fa-solid fa-tag"></i> ${t}</a>`),n=n.replace(/\[(.*?(?:form|booking|pesan|order|sewa|rental).*?)\]\((.*?)\)/gi,(e,t,n)=>`<a href="javascript:void(0)" onclick="window.handleAiraBookingLinkClick('${t.replace(/'/g,`\\'`).replace(/"/g,`&quot;`)}', '${n.replace(/'/g,`\\'`).replace(/"/g,`&quot;`)}')" class="aira-chat-pill-link aira-chat-booking-link" title="Buka Form Booking Resmi Website"><i class="fa-solid fa-file-signature"></i> ${t} (Form Web)</a>`),n=n.replace(/\[(.*?)\]\((.*?)\)/g,(e,t,n)=>{let r=(n||``).trim(),i=t.replace(/'/g,`\\'`).replace(/"/g,`&quot;`);return r.includes(`google.com/maps`)||r.includes(`maps.google.com`)||r.includes(`goo.gl/maps`)?`<a href="${r}" target="_blank" rel="noopener noreferrer" class="aira-maps-btn ${/kuliner|makan|taliwang|rembiga|puyung|bulayak|bebalung|warung|resto|pedas|inaq/i.test(t+` `+n)?`aira-maps-btn-food`:``}" title="Buka Rute di Google Maps"><i class="fa-solid fa-map-location-dot"></i> <span>${i}</span> <i class="fa-solid fa-arrow-up-right-from-square aira-maps-ext-icon"></i></a>`:!r.startsWith(`http://`)&&!r.startsWith(`https://`)&&!r.startsWith(`#`)&&!r.startsWith(`mailto:`)&&!r.startsWith(`tel:`)?`<a href="javascript:void(0)" onclick="window.handleAiraBookingLinkClick('${i}', '${r.replace(/'/g,`\\'`).replace(/"/g,`&quot;`)}')" class="aira-chat-pill-link aira-chat-booking-link"><i class="fa-solid fa-circle-arrow-right"></i> ${t}</a>`:`<a href="${r}" target="_blank" rel="noopener noreferrer">${t}</a>`}),n=n.replace(/\n/g,`<br>`),!t){let t=w(e);t.length>0&&(n+=T(t)),E(e,t)&&(n+=A(e,t));let r=encodeURIComponent(e).replace(/'/g,`\\'`);n+=`
        <div style="text-align: right; margin-top: 8px;">
            <button onclick="window.copyAiMessage(this, decodeURIComponent('${r}'))" class="copy-ai-msg-btn" title="Salin Pesan" style="background: rgba(255,255,255,0.5); border: 1px solid #cbd5e1; border-radius: 6px; color: #475569; cursor: pointer; font-size: 0.75rem; font-weight: 600; padding: 4px 8px; transition: all 0.2s; display: inline-flex; align-items: center; gap: 5px;">
                <i class="fa-regular fa-copy"></i> Salin
            </button>
        </div>`}return n}window._simulateTyping=(e,t,n)=>{let r=document.getElementById(e);if(!r)return;let i=0,a=``;function o(){if(i<t.length){let e=t.substr(i,2);a+=e,i+=2,r.innerHTML=j(a,!0)+`<span class="cs-typewriter-cursor">|</span>`;let n=document.getElementById(`chat-messages`);n&&(n.scrollTop=n.scrollHeight),setTimeout(o,10)}else{r.innerHTML=j(t,!1);let e=document.getElementById(`chat-messages`);e&&(e.scrollTop=e.scrollHeight),n&&n()}}setTimeout(o,50)},window.copyAiMessage=(e,t)=>{navigator.clipboard.writeText(t).then(()=>{let t=e.innerHTML,n=e.style.cssText;e.innerHTML=`<i class="fa-solid fa-check"></i> Tersalin`,e.style.color=`#16a34a`,e.style.borderColor=`#16a34a`,e.style.background=`#dcfce7`,setTimeout(()=>{e.innerHTML=t,e.style.cssText=n},2e3)}).catch(e=>console.error(`Gagal menyalin:`,e))},window.checkGuestLimit=()=>{let e=!!localStorage.getItem(`auth_token`)||!!localStorage.getItem(`auth_user`),t=document.getElementById(`chat-input`),n=document.getElementById(`send-chat-btn`),r=document.getElementById(`mic-chat-btn`),i=document.getElementById(`guest-limit-banner`),a=document.getElementById(`aira-chips-wrapper`),o=document.getElementById(`aira-quick-chips-bar`),s=document.getElementById(`ai-quick-replies`);return!e&&y.filter(e=>e.role===`user`).length>=3?(t&&(t.disabled=!0,t.placeholder=`Login untuk bertanya lebih banyak...`,t.value=``),n&&(n.disabled=!0,n.style.opacity=`0.5`,n.style.cursor=`not-allowed`),r&&(r.disabled=!0,r.style.opacity=`0.5`,r.style.cursor=`not-allowed`),a?a.style.display=`none`:o&&(o.style.display=`none`),s&&(s.style.display=`none`),i&&(i.style.display=`block`),!0):(i&&(i.style.display=`none`),a?a.style.display=`flex`:o&&(o.style.display=`flex`),s&&(s.style.display=`flex`),t&&(t.disabled=!1,t.placeholder=`Tanya rekomendasi paket...`),n&&(n.disabled=!1,n.style.opacity=`1`,n.style.cursor=`pointer`),r&&(r.disabled=!1,r.style.opacity=`1`,r.style.cursor=`pointer`),!1)},window.scrollAiraChips=e=>{let t=document.getElementById(`aira-quick-chips-bar`);t&&t.scrollBy({left:e,behavior:`smooth`})},window.initChipsScroll=()=>{let e=document.getElementById(`aira-quick-chips-bar`);if(!e||e.dataset.scrollInited)return;e.dataset.scrollInited=`true`,e.addEventListener(`wheel`,t=>{t.deltaY!==0&&(t.preventDefault(),e.scrollLeft+=t.deltaY*.9)},{passive:!1});let t=!1,n=0,r=0,i=!1;e.addEventListener(`mousedown`,a=>{a.button===0&&(t=!0,i=!1,e.classList.add(`is-dragging`),n=a.pageX-e.offsetLeft,r=e.scrollLeft)}),window.addEventListener(`mouseup`,()=>{t&&(t=!1,e.classList.remove(`is-dragging`),i&&(e.dataset.preventClick=`true`,setTimeout(()=>{delete e.dataset.preventClick},100)))}),e.addEventListener(`mousemove`,a=>{if(!t)return;let o=a.pageX-e.offsetLeft-n;Math.abs(o)>4&&(i=!0,a.preventDefault(),e.scrollLeft=r-o*1.2)}),e.addEventListener(`click`,t=>{e.dataset.preventClick&&(t.preventDefault(),t.stopPropagation())},!0)};var M=null,N=!1;window.toggleVoiceInput=()=>{if(window.checkGuestLimit()){typeof window.openAuthModal==`function`&&window.openAuthModal(`login`);return}let e=document.getElementById(`mic-chat-btn`),t=document.getElementById(`chat-input`);if(N){M&&M.stop();return}let n=window.SpeechRecognition||window.webkitSpeechRecognition;if(!n){alert(`Browser Anda belum mendukung fitur Voice Command. Silakan gunakan Google Chrome versi terbaru.`);return}M=new n,M.lang=`id-ID`,M.interimResults=!1,M.maxAlternatives=1,M.onstart=()=>{if(N=!0,!document.getElementById(`mic-pulse-css`)){let e=document.createElement(`style`);e.id=`mic-pulse-css`,e.innerHTML=`@keyframes pulse-mic { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }`,document.head.appendChild(e)}e&&(e.style.color=`#ef4444`,e.style.animation=`pulse-mic 1s infinite`),t&&(t.placeholder=`Mendengarkan suara Anda...`)},M.onresult=e=>{let n=e.results[0][0].transcript;t&&(t.value=n),setTimeout(()=>window.sendChatMessage(),300)},M.onerror=n=>{console.error(`Speech recognition error`,n.error),N=!1,e&&(e.style.color=`#64748b`,e.style.animation=`none`),t&&(t.placeholder=`Tanya rekomendasi paket...`);let r=document.getElementById(`chat-messages`);r&&(r.insertAdjacentHTML(`beforeend`,`
                <div class="message ai-message" style="background-color: #fee2e2; color: #991b1b; border: 1px solid #f87171;">
                    <i class="fa-solid fa-triangle-exclamation"></i> Gagal mendeteksi mikrofon. Browser Anda menolak akses. Pastikan Anda mengklik "Allow/Izinkan" pada setelan mikrofon di browser.
                </div>
            `),r.scrollTop=r.scrollHeight)},M.onend=()=>{N=!1,e&&(e.style.color=`#64748b`,e.style.animation=`none`),t&&(t.placeholder=`Tanya rekomendasi paket...`)},M.start()},window.askAiraQuick=e=>{if(window.checkGuestLimit()){typeof window.openAuthModal==`function`&&window.openAuthModal(`login`);return}if(!e)return;let t=document.getElementById(`ai-quick-replies`);t&&t.remove();let n=document.getElementById(`chat-input`);n?(n.value=e,window.sendChatMessage()):window.sendChatMessage(e)},window.findNearestLombokFood=()=>{if(window.checkGuestLimit()){typeof window.openAuthModal==`function`&&window.openAuthModal(`login`);return}let e=document.getElementById(`ai-quick-replies`);e&&e.remove();let t=document.getElementById(`chat-messages`);if(!t)return;t.insertAdjacentHTML(`beforeend`,`
        <div class="message user-message" style="background:linear-gradient(135deg, #f97316, #ea580c); color:white; box-shadow:0 4px 15px rgba(234, 88, 12, 0.3);">
            <i class="fa-solid fa-pepper-hot"></i> Cari Kuliner Khas Lombok Terdekat dari Lokasi Saya (GPS)
        </div>
    `);let n=`typing-`+Date.now();t.insertAdjacentHTML(`beforeend`,`
        <div id="${n}" class="typing-indicator">
            <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
    `),t.scrollTop=t.scrollHeight,navigator.geolocation?navigator.geolocation.getCurrentPosition(e=>{let r=`https://www.google.com/maps/search/Kuliner+Khas+Lombok+Ayam+Taliwang+Sate+Rembiga+Nasi+Balap/@${e.coords.latitude},${e.coords.longitude},14z`;setTimeout(()=>{let e=document.getElementById(n);e&&e.remove();let i=`
                    <div class="message ai-message" style="border: 1.5px solid #fed7aa; background: #fffaf5;">
                        <h4 style="color:#ea580c; margin:0 0 10px 0; display:flex; align-items:center; gap:8px;">
                            <i class="fa-solid fa-utensils"></i> 📍 Kuliner Khas Lombok Terdekat
                        </h4>
                        <p style="font-size:0.88rem; margin:0 0 10px 0; color:#334155;">
                            Lokasi Anda berhasil dideteksi! Klik tombol di bawah ini untuk melihat daftar rumah makan khas Lombok (Ayam Taliwang, Sate Rembiga, Nasi Balap, Bebalung) terdekat dari koordinat Anda langsung di Google Maps:
                        </p>
                        <a href="${r}" target="_blank" rel="noopener noreferrer" class="aira-maps-btn aira-maps-btn-food" title="Buka Navigasi Rute Kuliner di Google Maps">
                            <i class="fa-solid fa-map-location-dot"></i>
                            <span>Buka Rute Kuliner Terdekat di Google Maps</span>
                            <i class="fa-solid fa-arrow-up-right-from-square aira-maps-ext-icon"></i>
                        </a>
                        <div style="margin-top: 10px; font-size: 0.8rem; color: #64748b; line-height: 1.4;">
                            💡 <em>Ingin berburu kuliner tanpa repot menyetir? Armada rental mobil & driver profesional Travel Lombok Airport siap mengantar Anda!</em>
                        </div>
                    </div>
                `;t.insertAdjacentHTML(`beforeend`,i),t.scrollTop=t.scrollHeight},700)},e=>{setTimeout(()=>{let e=document.getElementById(n);e&&e.remove(),t.insertAdjacentHTML(`beforeend`,`
                    <div class="message ai-message" style="border:1px solid #fed7aa; background:#fffaf5; color:#9a3412;">
                        <p style="margin:0 0 8px 0;"><strong>Akses GPS belum diizinkan atau dinonaktifkan.</strong> Jangan khawatir, berikut pencarian kuliner legendaris Lombok di Google Maps:</p>
                        <a href="https://www.google.com/maps/search/Kuliner+Khas+Lombok+Ayam+Taliwang+Sate+Rembiga+Nasi+Balap" target="_blank" rel="noopener noreferrer" class="aira-maps-btn aira-maps-btn-food">
                            <i class="fa-solid fa-map-location-dot"></i>
                            <span>Buka Rekomendasi Kuliner Lombok di Google Maps</span>
                            <i class="fa-solid fa-arrow-up-right-from-square aira-maps-ext-icon"></i>
                        </a>
                    </div>
                `),t.scrollTop=t.scrollHeight},700)}):setTimeout(()=>{let e=document.getElementById(n);e&&e.remove(),t.insertAdjacentHTML(`beforeend`,`
                <div class="message ai-message" style="border:1px solid #fed7aa; background:#fffaf5; color:#9a3412;">
                    <a href="https://www.google.com/maps/search/Kuliner+Khas+Lombok+Ayam+Taliwang+Sate+Rembiga+Nasi+Balap" target="_blank" rel="noopener noreferrer" class="aira-maps-btn aira-maps-btn-food">
                        <i class="fa-solid fa-map-location-dot"></i>
                        <span>Buka Rekomendasi Kuliner Lombok di Google Maps</span>
                        <i class="fa-solid fa-arrow-up-right-from-square aira-maps-ext-icon"></i>
                    </a>
                </div>
            `),t.scrollTop=t.scrollHeight},700)},window.sendDeterministicReply=(e,t)=>{if(window.checkGuestLimit()){typeof window.openAuthModal==`function`&&window.openAuthModal(`login`);return}let n=document.getElementById(`ai-quick-replies`);n&&n.remove();let r=document.getElementById(`chat-messages`);r.insertAdjacentHTML(`beforeend`,`
        <div class="message user-message">
            ${e}
        </div>
    `),y.push({role:`user`,parts:[{text:e}]});let i=`typing-`+Date.now();r.insertAdjacentHTML(`beforeend`,`
        <div id="${i}" class="typing-indicator">
            <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
    `),r.scrollTop=r.scrollHeight,setTimeout(()=>{let e=document.getElementById(i);e&&e.remove();let n=`det-msg-`+Date.now();r.insertAdjacentHTML(`beforeend`,`
            <div id="${n}" class="message ai-message"></div>
        `),y.push({role:`model`,parts:[{text:t}]}),localStorage.setItem(`aiChatHistory`,JSON.stringify(y)),window._simulateTyping(n,t)},800)},window.showAiraRoadsideEmergencySOS=()=>{if(window.checkGuestLimit()){typeof window.openAuthModal==`function`&&window.openAuthModal(`login`);return}let e=document.getElementById(`ai-quick-replies`);e&&e.remove();let t=document.getElementById(`chat-messages`);if(!t)return;t.insertAdjacentHTML(`beforeend`,`
        <div class="message user-message" style="background:linear-gradient(135deg, #ef4444, #dc2626); color:white; box-shadow:0 4px 15px rgba(239, 68, 68, 0.3);">
            <i class="fa-solid fa-triangle-exclamation"></i> 🚨 Bantuan Darurat di Jalan & SOS 24/7 (SPBU, Bengkel, RS, CS Siaga)
        </div>
    `);let n=`typing-`+Date.now();t.insertAdjacentHTML(`beforeend`,`
        <div id="${n}" class="typing-indicator">
            <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
    `),t.scrollTop=t.scrollHeight;let r=e=>{let r=document.getElementById(n);r&&r.remove();let i=e?`@${e.lat},${e.lng},14z`:``,a=e?`https://www.google.com/maps/search/SPBU+Pertamina/${i}`:`https://www.google.com/maps/search/SPBU+Pertamina+Lombok`,o=e?`https://www.google.com/maps/search/Bengkel+Mobil+Motor+Tambal+Ban/${i}`:`https://www.google.com/maps/search/Bengkel+Mobil+Motor+Tambal+Ban+Lombok`,s=e?`https://www.google.com/maps/search/Rumah+Sakit+Klinik+24+Jam/${i}`:`https://www.google.com/maps/search/Rumah+Sakit+Klinik+24+Jam+Lombok`,c=e?`https://www.google.com/maps/search/Apotek+24+Jam/${i}`:`https://www.google.com/maps/search/Apotek+24+Jam+Lombok`,l=e?`🚨 *SOS DARURAT TRAVEL LOMBOK AIRPORT!* 🚨\nSaya mengalami kendala di jalan saat sewa kendaraan / berwisata di Lombok.\n\n📍 *Koordinat GPS Lokasi Saya:*\nhttps://www.google.com/maps?q=${e.lat},${e.lng}\n\nMohon bantuan darurat dari tim Travel Lombok Airport sesegera mungkin! 🙏`:`🚨 *SOS DARURAT TRAVEL LOMBOK AIRPORT!* 🚨
Saya mengalami kendala di jalan saat sewa kendaraan / berwisata di Lombok.
Mohon bantuan darurat dan arahan tim siaga sesegera mungkin! 🙏`,u=`
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

                    <a href="${`https://wa.me/6289676963255?text=${encodeURIComponent(l)}`}" target="_blank" rel="noopener noreferrer" class="aira-emergency-sos-action" title="Kirim Sinyal Darurat ke CS Siaga Travel Lombok">
                        <i class="fa-brands fa-whatsapp" style="font-size: 1.15rem;"></i>
                        <span>🚨 Kirim Sinyal SOS + Lokasi ke WhatsApp CS Siaga</span>
                    </a>

                    <div class="aira-emergency-grid">
                        <a href="${a}" target="_blank" rel="noopener noreferrer" class="aira-emergency-grid-btn">
                            <i class="fa-solid fa-gas-pump" style="color: #dc2626;"></i>
                            <span>⛽ SPBU Terdekat</span>
                        </a>
                        <a href="${o}" target="_blank" rel="noopener noreferrer" class="aira-emergency-grid-btn">
                            <i class="fa-solid fa-wrench" style="color: #ea580c;"></i>
                            <span>🔧 Bengkel & Tambal Ban</span>
                        </a>
                        <a href="${s}" target="_blank" rel="noopener noreferrer" class="aira-emergency-grid-btn">
                            <i class="fa-solid fa-hospital" style="color: #0284c7;"></i>
                            <span>🏥 RS & Klinik 24 Jam</span>
                        </a>
                        <a href="${c}" target="_blank" rel="noopener noreferrer" class="aira-emergency-grid-btn">
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
        `;t.insertAdjacentHTML(`beforeend`,u),t.scrollTop=t.scrollHeight};navigator.geolocation?navigator.geolocation.getCurrentPosition(e=>{setTimeout(()=>r({lat:e.coords.latitude,lng:e.coords.longitude}),500)},()=>{setTimeout(()=>r(null),500)},{timeout:4e3}):setTimeout(()=>r(null),500)},window.showEmergencyCenter=window.showAiraRoadsideEmergencySOS,window.askAiraAntiZonkSouvenirs=()=>{if(window.checkGuestLimit()){typeof window.openAuthModal==`function`&&window.openAuthModal(`login`);return}let e=document.getElementById(`ai-quick-replies`);e&&e.remove();let t=document.getElementById(`chat-messages`);if(!t)return;t.insertAdjacentHTML(`beforeend`,`
        <div class="message user-message" style="background:linear-gradient(135deg, #f59e0b, #d97706); color:white; box-shadow:0 4px 15px rgba(245, 158, 11, 0.3);">
            <i class="fa-solid fa-bag-shopping"></i> 🛍️ Panduan Anti-Zonk Belanja Oleh-Oleh (Cek Mutiara, Madu & Tenun Asli)
        </div>
    `);let n=`typing-`+Date.now();t.insertAdjacentHTML(`beforeend`,`
        <div id="${n}" class="typing-indicator">
            <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
    `),t.scrollTop=t.scrollHeight,setTimeout(()=>{let e=document.getElementById(n);e&&e.remove(),t.insertAdjacentHTML(`beforeend`,`
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
        `),t.scrollTop=t.scrollHeight},700)},window.findNearestEmergency=()=>{let e=document.getElementById(`chat-messages`);e.insertAdjacentHTML(`beforeend`,`
        <div class="message user-message" style="background:linear-gradient(135deg, #ef4444, #dc2626); color:white; box-shadow:0 4px 15px rgba(239, 68, 68, 0.3);">
            <i class="fa-solid fa-location-dot"></i> Cari RS / Klinik Terdekat
        </div>
    `);let t=`typing-`+Date.now();e.insertAdjacentHTML(`beforeend`,`
        <div id="${t}" class="typing-indicator">
            <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
    `),e.scrollTop=e.scrollHeight,navigator.geolocation?navigator.geolocation.getCurrentPosition(n=>{let r=`https://www.google.com/maps/search/Rumah+Sakit+Atau+Klinik+Terdekat/@${n.coords.latitude},${n.coords.longitude},14z`;setTimeout(()=>{let n=document.getElementById(t);n&&n.remove();let i=`
                    <div class="message ai-message">
                        📍 <strong>Lokasi Anda berhasil didapatkan!</strong><br><br>
                        Silakan klik tombol di bawah ini untuk melihat daftar Rumah Sakit & Klinik terdekat dari posisi Anda beserta panduan navigasinya di Google Maps.<br><br>
                        <a href="${r}" target="_blank" style="display:flex; justify-content:center; align-items:center; gap:8px; margin-top:10px; background:linear-gradient(135deg, #10b981, #059669); color:white; padding:10px; border-radius:10px; text-decoration:none; font-weight:bold; box-shadow:0 4px 10px rgba(16, 185, 129, 0.3); transition:all 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'"><i class="fa-solid fa-map-location-dot"></i> Buka Google Maps</a>
                    </div>
                `;e.insertAdjacentHTML(`beforeend`,i),e.scrollTop=e.scrollHeight},800)},n=>{setTimeout(()=>{let n=document.getElementById(t);n&&n.remove(),e.insertAdjacentHTML(`beforeend`,`<div class="message ai-message" style="border:1px solid #fca5a5; background:#fef2f2; color:#b91c1c;">Mohon maaf, AIRA tidak dapat mengakses lokasi Anda. Pastikan Anda telah mengizinkan akses lokasi (GPS) pada browser Anda, atau Anda dapat mencari "Rumah Sakit Terdekat di Lombok" secara manual di Google Maps.</div>`),e.scrollTop=e.scrollHeight},800)}):setTimeout(()=>{let n=document.getElementById(t);n&&n.remove(),e.insertAdjacentHTML(`beforeend`,`<div class="message ai-message" style="border:1px solid #fca5a5; background:#fef2f2; color:#b91c1c;">Browser Anda tidak mendukung fitur pelacakan lokasi. Silakan buka Google Maps dan cari secara manual.</div>`),e.scrollTop=e.scrollHeight},800)},window.shareLiveLocation=()=>{let e=document.getElementById(`chat-messages`);e.insertAdjacentHTML(`beforeend`,`
        <div class="message user-message" style="background:linear-gradient(135deg, #3b82f6, #2563eb); color:white; box-shadow:0 4px 15px rgba(59, 130, 246, 0.3);">
            <i class="fa-regular fa-share-from-square"></i> Bagikan Live Location
        </div>
    `);let t=`typing-`+Date.now();e.insertAdjacentHTML(`beforeend`,`
        <div id="${t}" class="typing-indicator">
            <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
    `),e.scrollTop=e.scrollHeight,navigator.geolocation&&navigator.geolocation.getCurrentPosition(n=>{let r=`https://wa.me/6289676963255?text=DARURAT!%20Ini%20lokasi%20saya%20sekarang:%20https://www.google.com/maps?q=${n.coords.latitude},${n.coords.longitude}`;setTimeout(()=>{let n=document.getElementById(t);n&&n.remove();let i=`
                    <div class="message ai-message">
                        📍 <strong>Lokasi Anda Siap Dibagikan!</strong><br><br>
                        Klik tombol di bawah ini untuk mengirimkan lokasi presisi Anda saat ini ke tim Emergency Travel Lombok Airport via WhatsApp.<br><br>
                        <a href="${r}" target="_blank" style="display:flex; justify-content:center; align-items:center; gap:8px; margin-top:10px; background:linear-gradient(135deg, #25D366, #128C7E); color:white; padding:10px; border-radius:10px; text-decoration:none; font-weight:bold; box-shadow:0 4px 10px rgba(37, 211, 102, 0.3); transition:all 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'"><i class="fa-brands fa-whatsapp"></i> Kirim via WhatsApp</a>
                    </div>
                `;e.insertAdjacentHTML(`beforeend`,i),e.scrollTop=e.scrollHeight},800)},n=>{setTimeout(()=>{let n=document.getElementById(t);n&&n.remove(),e.insertAdjacentHTML(`beforeend`,`<div class="message ai-message" style="border:1px solid #fca5a5; background:#fef2f2; color:#b91c1c;">Akses lokasi ditolak atau gagal didapatkan. Tidak dapat membuat link lokasi langsung. Silakan hubungi CS secara manual.</div>`),e.scrollTop=e.scrollHeight},800)})},window.sendChatMessage=async(t=null,n=null)=>{if(window.checkGuestLimit()){let e=document.getElementById(`chat-input`);e&&(e.value=``),typeof window.openAuthModal==`function`&&window.openAuthModal(`login`);return}let r=document.getElementById(`chat-input`),i=t||r.value.trim();if(!i)return;t||(r.value=``);let a=document.getElementById(`chat-messages`);n&&n.remove(),t||a.insertAdjacentHTML(`beforeend`,`
            <div class="message user-message">
                ${i}
            </div>
        `);let o=`typing-`+Date.now(),s=`wait-bubble-`+Date.now();a.insertAdjacentHTML(`beforeend`,`
        <div id="${o}" class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `);let c=setTimeout(()=>{document.getElementById(o)&&(a.insertAdjacentHTML(`beforeend`,`
                <div id="${s}" class="message ai-message" style="font-size: 0.78rem; color: #64748b; font-style: italic; background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 14px; max-width: 85%;">
                    ⏳ Mohon tunggu sebentar, sistem sedang melayani banyak antrean chat...
                </div>
            `),a&&(a.scrollTop=a.scrollHeight))},4500);window[`_waitTimer_${o}`]=c,window[`_waitBubbleId_${o}`]=s,a.scrollTop=a.scrollHeight;try{let t=localStorage.getItem(`visitor_session_id`)||`guest`,n=JSON.parse(localStorage.getItem(`auth_user`)||`null`),r=localStorage.getItem(`auth_token`);n&&n.email&&(t=n.email);let s=null;try{let e=localStorage.getItem(`prayerData`);e&&(s=JSON.parse(e))}catch{}let c={"Content-Type":`application/json`};r&&(c.Authorization=`Bearer ${r}`);let l=await fetch(`${e}/ai/chat`,{method:`POST`,headers:c,body:JSON.stringify({message:i,history:y,sessionId:t,userTimeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,prayerData:s})}),u=document.getElementById(o);u&&u.remove(),clearTimeout(window[`_waitTimer_${o}`]);let d=document.getElementById(window[`_waitBubbleId_${o}`]);if(d&&d.remove(),l.ok){if(l.headers.get(`content-type`)?.includes(`text/event-stream`)){let e=`ai-msg-`+Date.now();a.insertAdjacentHTML(`beforeend`,`
                    <div id="${e}" class="message ai-message"></div>
                `);let t=document.getElementById(e),n=l.body.getReader(),r=new TextDecoder(`utf-8`),o=``,s=``;for(;;){let{done:e,value:c}=await n.read();if(e)break;s+=r.decode(c,{stream:!0});let l=s.split(`
`);s=l.pop();for(let e of l)if(e.startsWith(`data: `)){let n=e.replace(`data: `,``).trim();if(n===`[DONE]`){t.innerHTML=j(o,!1),y.push({role:`user`,parts:[{text:i}]}),y.push({role:`model`,parts:[{text:o}]}),localStorage.setItem(`aiChatHistory`,JSON.stringify(y)),window.checkGuestLimit();break}try{let e=JSON.parse(n);if(e.error)throw Error(e.error);e.text&&(o+=e.text,t.innerHTML=j(o,!0)+`<span class="cs-typewriter-cursor">|</span>`,a.scrollTop=a.scrollHeight)}catch(e){console.error(`Error parsing SSE data`,e)}}}}else{let e=await l.json();if(e.success){if(e.reply.trim()===`REQUEST_REALTIME_LOCATION`){let e=`sys-msg-`+Date.now();a.insertAdjacentHTML(`beforeend`,`
                            <div id="${e}" class="message ai-message" style="background:#e0f2fe; border:1px solid #bae6fd; color:#0369a1;">
                                <i class="fa-solid fa-location-dot fa-bounce"></i> Meminta izin akses lokasi Anda untuk memberikan hasil yang akurat...
                            </div>
                        `),a.scrollTop=a.scrollHeight,navigator.geolocation?navigator.geolocation.getCurrentPosition(t=>{document.getElementById(e).innerHTML=`<i class="fa-solid fa-check-circle"></i> Lokasi berhasil didapatkan. Sedang mencari...`,window.sendChatMessage(`[SYSTEM GPS DATA] Lokasi Realtime User: Latitude ${t.coords.latitude}, Longitude ${t.coords.longitude}, Akurasi ${t.coords.accuracy} meter.`)},t=>{document.getElementById(e).innerHTML=`<i class="fa-solid fa-circle-xmark"></i> Izin lokasi ditolak atau gagal didapatkan.`,window.sendChatMessage(`[SYSTEM GPS DATA] Gagal: User menolak akses lokasi atau perangkat tidak mendeteksi (Error Code: ${t.code}).`)},{enableHighAccuracy:!0,timeout:15e3,maximumAge:0}):(document.getElementById(e).innerHTML=`<i class="fa-solid fa-triangle-exclamation"></i> Browser tidak mendukung GPS.`,window.sendChatMessage(`[SYSTEM GPS DATA] Gagal: Browser tidak mendukung Geolocation.`));return}y.push({role:`user`,parts:[{text:i}]}),y.push({role:`model`,parts:[{text:e.reply}]}),localStorage.setItem(`aiChatHistory`,JSON.stringify(y));let t=`ai-msg-`+Date.now();a.insertAdjacentHTML(`beforeend`,`
                        <div id="${t}" class="message ai-message"></div>
                    `),window._simulateTyping(t,e.reply),window.checkGuestLimit()}else throw Error(e.message)}}else throw Error(`Gagal menghubungi AI`)}catch(e){console.error(`Chat Error:`,e);let t=document.getElementById(o);t&&t.remove(),clearTimeout(window[`_waitTimer_${o}`]);let n=document.getElementById(window[`_waitBubbleId_${o}`]);n&&n.remove();let r=encodeURIComponent(i).replace(/'/g,`\\'`);a.insertAdjacentHTML(`beforeend`,`
            <div class="message ai-message" style="color: #ef4444; background: #fee2e2; border: 1px solid #fca5a5;">
                <div style="margin-bottom: 8px;"><i class="fa-solid fa-triangle-exclamation"></i> Maaf, layanan AI sedang sibuk atau ada gangguan jaringan.</div>
                <button onclick="window.sendChatMessage(decodeURIComponent('${r}'), this.parentElement)" style="background: white; color: #ef4444; border: 1px solid #ef4444; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: bold; transition: all 0.2s;"><i class="fa-solid fa-rotate-right"></i> Kirim Ulang</button>
            </div>
        `)}a.scrollTop=a.scrollHeight},window.requestPrayerLocation=(e=!1)=>{if(!e&&localStorage.getItem(`prayerData`)){renderPrayerTimes(JSON.parse(localStorage.getItem(`prayerData`)));return}navigator.geolocation?(document.getElementById(`location-prompt`)&&(document.getElementById(`location-prompt`).style.display=`none`),document.getElementById(`prayer-loading`)&&(document.getElementById(`prayer-loading`).style.display=`block`),document.getElementById(`prayer-content`)&&(document.getElementById(`prayer-content`).style.display=`none`),navigator.geolocation.getCurrentPosition(async e=>{try{let t=e.coords.latitude,n=e.coords.longitude,r=await(await fetch(`https://api.aladhan.com/v1/timings?latitude=${t}&longitude=${n}&method=11&tune=3,3,3,3,3,3,3,3,3`)).json();if(r&&r.code===200){let e=r.data.timings,i=`Lokasi Anda`;try{let e=await(await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${t}&lon=${n}`)).json();i=e.address.city||e.address.town||e.address.village||e.address.state||i}catch(e){console.error(e)}let a={city:i,date:r.data.date.readable,timings:{Subuh:e.Fajr,Dzuhur:e.Dhuhr,Ashar:e.Asr,Maghrib:e.Maghrib,Isya:e.Isha},timestamp:Date.now()};localStorage.setItem(`prayerData`,JSON.stringify(a)),renderPrayerTimes(a)}else throw Error(`Gagal memuat jadwal sholat`)}catch(e){console.error(`Error fetching prayer times:`,e),alert(`Gagal mengambil jadwal sholat. Silakan coba lagi.`),document.getElementById(`location-prompt`)&&(document.getElementById(`location-prompt`).style.display=`block`),document.getElementById(`prayer-loading`)&&(document.getElementById(`prayer-loading`).style.display=`none`)}},e=>{console.error(`Geolocation error:`,e),document.getElementById(`location-prompt`)&&(document.getElementById(`location-prompt`).style.display=`block`),document.getElementById(`prayer-loading`)&&(document.getElementById(`prayer-loading`).style.display=`none`)})):alert(`Browser Anda tidak mendukung deteksi lokasi.`)},window.renderPrayerTimes=e=>{if(!document.getElementById(`prayer-content`))return;document.getElementById(`location-prompt`).style.display=`none`,document.getElementById(`prayer-loading`).style.display=`none`,document.getElementById(`prayer-content`).style.display=`block`,document.getElementById(`prayer-city`).innerHTML=`<i class="fa-solid fa-location-dot"></i> `+e.city,document.getElementById(`prayer-date`).textContent=e.date;let t=document.getElementById(`prayer-cards`);t.innerHTML=``;let n=`-`,r=null,i=null,a=new Date,o=a.getHours()*60+a.getMinutes(),s=0;for(let[a,c]of Object.entries(e.timings)){let[e,l]=c.split(`:`).map(Number),u=e*60+l,d=!1;!r&&o<u&&(d=!0,n=a,r=new Date,r.setHours(e,l,0,0),i=new Date,s===0?(i.setDate(i.getDate()-1),i.setHours(19,30,0,0)):i.setHours(Math.floor(s/60),s%60,0,0)),s=u;let f=``;f=a.toLowerCase()===`subuh`?`<i class="fa-solid fa-cloud-sun" style="font-size: 1.5rem;"></i>`:a.toLowerCase()===`dzuhur`?`<i class="fa-solid fa-sun" style="font-size: 1.5rem;"></i>`:a.toLowerCase()===`ashar`?`<i class="fa-solid fa-cloud" style="font-size: 1.5rem;"></i>`:a.toLowerCase()===`maghrib`?`<i class="fa-solid fa-moon" style="font-size: 1.5rem;"></i>`:a.toLowerCase()===`isya`?`<i class="fa-solid fa-star-and-crescent" style="font-size: 1.5rem;"></i>`:`<i class="fa-solid fa-clock" style="font-size: 1.5rem;"></i>`,t.innerHTML+=`
            <div class="prayer-card" style="background: rgba(255,255,255,0.05); padding: 25px 15px; border-radius: 20px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 4px; border: 1px solid ${d?`rgba(52,211,153,0.6)`:`rgba(255,255,255,0.08)`}; transition: transform 0.3s, background 0.3s; transform: scale(${d?`1.05`:`1`}); background: ${d?`linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.15) 100%)`:`rgba(255,255,255,0.03)`}; box-shadow: ${d?`0 15px 30px -10px rgba(16,185,129,0.3)`:`none`}; min-width: 120px; flex-shrink: 0; scroll-snap-align: center; position: relative; overflow: hidden;">
                ${d?`<div style="position: absolute; top: -10px; right: -10px; width: 50px; height: 50px; background: rgba(52,211,153,0.15); border-radius: 50%; filter: blur(10px);"></div>`:``}
                <div style="color: ${d?`#34d399`:`#64748b`}; margin-bottom: 5px;">${f}</div>
                <div style="font-size: 0.85rem; color: ${d?`#34d399`:`#94a3b8`}; font-weight: ${d?`800`:`600`}; text-transform: uppercase; letter-spacing: 1.5px;">${a}</div>
                <div style="font-size: 1.8rem; font-weight: 800; color: ${d?`white`:`#e2e8f0`}; font-family: 'Inter', monospace; margin-top: 2px;">${c}</div>
            </div>
        `}if(r){document.getElementById(`next-prayer-name`).textContent=n,window.prayerInterval&&clearInterval(window.prayerInterval);let e=()=>{let e=new Date,t=r-e;if(i){let t=r-i,n=(e-i)/t*100;n<0&&(n=0),n>100&&(n=100);let a=document.getElementById(`prayer-progress`);a&&(a.style.width=n+`%`)}if(t<=0)clearInterval(window.prayerInterval),document.getElementById(`next-prayer-countdown`).textContent=`00:00:00`,setTimeout(()=>window.requestPrayerLocation(!0),6e4);else{let e=Math.floor(t%864e5/36e5),n=Math.floor(t%36e5/6e4),r=Math.floor(t%6e4/1e3);document.getElementById(`next-prayer-countdown`).textContent=`${e.toString().padStart(2,`0`)}:${n.toString().padStart(2,`0`)}:${r.toString().padStart(2,`0`)}`}};e(),window.prayerInterval=setInterval(e,1e3)}else document.getElementById(`next-prayer-name`).textContent=`Besok`,document.getElementById(`next-prayer-countdown`).textContent=`--:--:--`},document.addEventListener(`DOMContentLoaded`,()=>{let e=window.location.pathname;(e.includes(`jadwal-sholat`)||e===`/`||e===`/index.html`)&&(localStorage.getItem(`prayerData`)?e.includes(`jadwal-sholat`)&&window.requestPrayerLocation(!1):window.requestPrayerLocation(!1))}),window.showBugReportOptions=()=>{let e=document.getElementById(`chat-messages`);if(!e)return;let t=[`Laporan Bug / Error Aplikasi`,`Katalog / Harga Tidak Sesuai`,`Kendala Pembayaran / Transaksi`,`Informasi Paket Tidak Jelas`,`Kendala Saat Pemesanan / Booking`,`E-Tiket Tidak Muncul / Gagal Download`,`Akun / Login Bermasalah`,`Kritik & Saran Pelayanan`,`Saran Fitur Baru`,`Masalah Lainnya`].map((e,t)=>`
        <button onclick="window.showBugReportForm('${e}')" style="display: block; width: 100%; text-align: left; background: white; color: #1e293b; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 8px; font-size: 0.8rem; cursor: pointer; margin-bottom: 6px; transition: background 0.2s;">
            ${t+1}. ${e}
        </button>
    `).join(``);e.innerHTML+=`
        <div class="message ai-message">
            Silakan pilih kategori laporan/kendala yang Anda alami di bawah ini:
            <div style="margin-top: 10px;">
                ${t}
            </div>
        </div>
    `,e.scrollTop=e.scrollHeight},window.onBugReportItemChange=e=>{let t=document.getElementById(`bug-item-${e}`),n=document.getElementById(`bug-item-price-badge-${e}`);if(!t||!n)return;let r=t.options[t.selectedIndex];if(!r||!r.value||r.value===`other`){n.style.display=`none`;return}let a=r.getAttribute(`data-price`);n.innerHTML=`<i class="fa-solid fa-tag" style="margin-right: 4px; color: #dc2626;"></i> Harga resmi sistem: <strong>${typeof i==`function`?i(a):`Rp ${parseInt(a||0,10).toLocaleString(`id-ID`)}`}</strong>`,n.style.display=`block`},window.showBugReportForm=async e=>{let t=document.getElementById(`chat-messages`);if(!t)return;t.innerHTML+=`
        <div class="message user-message">
            Kategori: ${e}
        </div>
    `;let n=`bug-form-`+Date.now(),r=e.toLowerCase().includes(`harga`)||e.toLowerCase().includes(`katalog`),o=``;if(r){let e=window.globalItems||[];if(!e||e.length===0)try{e=await a(),window.globalItems=e}catch{e=[]}let t={"Paket Tour & Wisata":[],"Rental Mobil":[],"Sewa Motor":[],"Antar Jemput Bandara (Transfer)":[],"Layanan Lainnya":[]};(e||[]).filter(e=>!e.parentId).forEach(e=>{let n=(e.category||``).toLowerCase(),r=`Layanan Lainnya`;n.includes(`paket`)||n===`tour`||n===`package`||n===`honeymoon`?r=`Paket Tour & Wisata`:(n.includes(`rental`)||n.includes(`armada`)||n.includes(`sewa`)||n===`car`)&&n!==`motorcycle`?r=`Rental Mobil`:n.includes(`motor`)?r=`Sewa Motor`:(n.includes(`transfer`)||n.includes(`antar`)||n.includes(`jemput`))&&(r=`Antar Jemput Bandara (Transfer)`),t[r].push(e)});let r=``;for(let[e,n]of Object.entries(t))if(n.length>0){let t=n.map(e=>{let t=typeof i==`function`?i(e.price):`Rp ${(e.price||0).toLocaleString(`id-ID`)}`,n=(e.title||e.name||`Item`).replace(/"/g,`&quot;`);return`<option value="${e.id}" data-name="${n}" data-price="${e.price||0}">${n} — ${t}</option>`}).join(``);r+=`<optgroup label="📂 ${e}">${t}</optgroup>`}o=`
            <div style="margin-bottom: 10px; text-align: left;">
                <label style="display: block; font-size: 0.78rem; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
                    <i class="fa-solid fa-list-check" style="color: #ef4444; margin-right: 4px;"></i> Pilih Item / Layanan yang Tidak Sesuai:
                </label>
                <select id="bug-item-${n}" onchange="window.onBugReportItemChange('${n}')" style="width: 100%; padding: 8px 10px; border-radius: 8px; border: 1.5px solid #f87171; font-family: inherit; font-size: 0.82rem; background: white; outline: none; cursor: pointer; box-sizing: border-box;">
                    <option value="">-- Pilih dari Katalog Layanan --</option>
                    ${r}
                    <option value="other">Item Lainnya (Tidak ada di daftar)</option>
                </select>
                <div id="bug-item-price-badge-${n}" style="display: none; margin-top: 6px; padding: 6px 10px; background: #fef2f2; border: 1px dashed #fca5a5; border-radius: 6px; font-size: 0.78rem; color: #991b1b;"></div>
            </div>
            <div style="margin-bottom: 10px; text-align: left;">
                <label style="display: block; font-size: 0.78rem; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
                    <i class="fa-solid fa-money-bill-wave" style="color: #ef4444; margin-right: 4px;"></i> Harga yang Anda Lihat / Seharusnya:
                </label>
                <input type="text" id="bug-expected-price-${n}" placeholder="Contoh: Rp 300.000 atau di banner beda" style="width: 100%; padding: 8px 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-family: inherit; font-size: 0.82rem; outline: none; box-sizing: border-box;">
            </div>
        `}t.innerHTML+=`
        <div class="message ai-message" style="background-color: #fff1f2; border: 1px solid #fecaca; color: #991b1b;">
            <strong>Anda memilih: ${e}</strong><br><br>
            ${r?`Pilih item katalog di bawah yang harganya tidak sesuai dan sebutkan harga yang Anda temukan:`:`Silakan ceritakan detail masalah atau kendala yang Anda alami secara lengkap. Jika ini terkait pesanan, sebutkan juga ID Transaksi Anda jika ada.`}
            <div style="margin-top: 12px;" id="${n}">
                ${o}
                <div style="margin-bottom: 4px; text-align: left;">
                    <label style="display: block; font-size: 0.78rem; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
                        <i class="fa-solid fa-comment-dots" style="color: #ef4444; margin-right: 4px;"></i> ${r?`Catatan / Keterangan Tambahan:`:`Detail Laporan:`}
                    </label>
                </div>
                <textarea id="bug-detail-${n}" placeholder="${r?`Jelaskan detail ketidaksesuaian (misal: saat checkout harga berubah, atau di WhatsApp beda)...`:`Ketik detail laporan di sini...`}" rows="3" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #fca5a5; font-family: inherit; font-size: 0.85rem; resize: none; margin-bottom: 8px; outline: none; box-sizing: border-box;"></textarea>
                <button onclick="window.submitBugReport('${e}', '${n}')" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; transition: background 0.2s;">
                    <i class="fa-solid fa-paper-plane"></i> Kirim Laporan
                </button>
            </div>
        </div>
    `,t.scrollTop=t.scrollHeight,setTimeout(()=>{let e=document.getElementById(`bug-item-${n}`);if(e)e.focus();else{let e=document.getElementById(`bug-detail-${n}`);e&&e.focus()}},100)},window.submitBugReport=async(t,n)=>{let r=t.toLowerCase().includes(`harga`)||t.toLowerCase().includes(`katalog`),a=document.getElementById(`bug-detail-${n}`),o=a?a.value.trim():``,s=document.getElementById(`bug-item-${n}`),c=document.getElementById(`bug-expected-price-${n}`),l=``,u=``,d=``,f=``;if(r&&s){if(!s.value){alert(`Harap pilih item/layanan katalog yang harganya tidak sesuai!`),s.focus();return}l=s.value;let e=s.options[s.selectedIndex];u=e.getAttribute(`data-name`)||e.text,d=typeof i==`function`?i(e.getAttribute(`data-price`)||0):e.getAttribute(`data-price`),c&&(f=c.value.trim())}if(!o&&!f){alert(`Harap isi keterangan atau harga yang seharusnya!`),a&&a.focus();return}let p=o;r&&u&&(p=`[ITEM KATALOG]: ${u} (Harga Sistem: ${d||`-`})`+(f?`\n[HARGA SEHARUSNYA/DITEMUKAN]: ${f}`:``)+(o?`\n[KETERANGAN]: ${o}`:``));let m=document.querySelector(`#${n} button`);m&&(m.disabled=!0,m.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...`);let h={};try{let e=localStorage.getItem(`user`);e&&e!==`undefined`&&(h=JSON.parse(e))}catch{}try{let r=await fetch(`${e}/reports`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({category:t,detail:p,itemId:l,itemName:u,itemPrice:d,reportedPrice:f,sessionId:localStorage.getItem(`sessionId`)||`anonymous`,userInfo:h})});if(r.ok){let e=document.getElementById(n);e&&(e.innerHTML=`<div style="color: #166534; font-weight: bold; padding: 8px 0;"><i class="fa-solid fa-check-circle"></i> Laporan Berhasil Dikirim!</div>`);let r=document.getElementById(`chat-messages`);r.innerHTML+=`
                <div class="message ai-message">
                    Terima kasih banyak atas informasinya Kak! 🙏 Laporan ketidaksesuaian harga untuk item <strong>${u||t}</strong> telah berhasil diteruskan ke tim kami untuk segera dicek dan diperbarui.
                </div>
            `,r.scrollTop=r.scrollHeight}else{let e=await r.text();throw Error(`Gagal mengirim: `+e)}}catch(e){alert(`Terjadi kesalahan: `+e.message),m&&(m.disabled=!1,m.innerHTML=`<i class="fa-solid fa-paper-plane"></i> Coba Kirim Ulang`)}},window.checkAiraPromoDeals=async()=>{if(window.checkGuestLimit()){typeof window.openAuthModal==`function`&&window.openAuthModal(`login`);return}let t=document.getElementById(`ai-quick-replies`);t&&t.remove();let n=document.getElementById(`chat-messages`);if(!n)return;n.insertAdjacentHTML(`beforeend`,`
        <div class="message user-message" style="background: linear-gradient(135deg, #e11d48, #be123c); color: white;">
            <i class="fa-solid fa-ticket"></i> Cek Promo & Kupon Diskon Hari Ini
        </div>
    `);let r=`typing-`+Date.now();n.insertAdjacentHTML(`beforeend`,`
        <div id="${r}" class="typing-indicator">
            <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
    `),n.scrollTop=n.scrollHeight;try{let t=[];try{let n=await fetch(`${e}/promos?public=true&_t=${Date.now()}`);if(n.ok){let e=await n.json();Array.isArray(e)&&(t=e.filter(e=>e.isActive!==!1))}}catch(e){console.error(`Fetch promos error:`,e)}setTimeout(()=>{let e=document.getElementById(r);if(e&&e.remove(),!t||t.length===0){n.insertAdjacentHTML(`beforeend`,`
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
                `),n.scrollTop=n.scrollHeight;return}let a=t.filter(e=>!(e.usageLimit&&(e.usedCount||0)>=e.usageLimit)),o=t.some(e=>e.usageLimit&&(e.usedCount||0)>=e.usageLimit);if(a.length===0&&o){n.insertAdjacentHTML(`beforeend`,`
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
                `),n.scrollTop=n.scrollHeight;return}let s=t.map(e=>{let t=e.usageLimit&&(e.usedCount||0)>=e.usageLimit,n=e.usedCount||0,r=e.usageLimit?Math.max(0,e.usageLimit-n):null,a=e.discountType===`percent`?`Diskon ${e.discountValue}% ${e.maxDiscount?`(Maks ${i(e.maxDiscount)})`:``}`:`Potongan Langsung ${i(e.discountValue)}`,o=null;e.itemId&&window.globalItems&&Array.isArray(window.globalItems)&&(o=window.globalItems.find(t=>t.id===e.itemId));let s=e.itemId?`<div style="display:inline-flex; align-items:center; gap:5px; font-size:0.75rem; color:#b45309; background:#fef3c7; border:1px solid #fde68a; padding:3px 8px; border-radius:6px; font-weight:700;"><i class="fa-solid fa-car-side"></i> Khusus: ${o?o.title:`Paket/Armada Tertentu`}</div>`:`<div style="display:inline-flex; align-items:center; gap:5px; font-size:0.75rem; color:#15803d; background:#dcfce7; border:1px solid #bbf7d0; padding:3px 8px; border-radius:6px; font-weight:700;"><i class="fa-solid fa-check-double"></i> Berlaku Untuk Semua Paket & Armada</div>`,c=``,l=``;if(t)c=`<span style="font-size:0.75rem; color:#dc2626; font-weight:700; background:#fee2e2; border:1px solid #fecaca; padding:2px 8px; border-radius:6px;"><i class="fa-solid fa-ban"></i> Kuota Habis</span>`,l=`<button type="button" class="btn" disabled style="background:#e2e8f0; color:#94a3b8; border:none; border-radius:8px; padding:6px 12px; font-size:0.8rem; font-weight:700; cursor:not-allowed;"><i class="fa-solid fa-lock"></i> Habis</button>`;else{c=e.usageLimit?`<span style="font-size:0.75rem; color:#ea580c; font-weight:700; background:#ffedd5; border:1px solid #fed7aa; padding:2px 8px; border-radius:6px;"><i class="fa-solid fa-fire"></i> Sisa ${r} Kupon</span>`:`<span style="font-size:0.75rem; color:#16a34a; font-weight:700;"><i class="fa-solid fa-circle-check"></i> Aktif</span>`;let t=e.itemId&&o?`<i class="fa-solid fa-bolt"></i> Gunakan & Pesan`:`<i class="fa-solid fa-check-double"></i> Gunakan Kupon`;l=`<button type="button" class="aira-use-voucher-btn" onclick="window.applyPromoCodeFromAira('${e.code}', '${e.itemId||``}')">${t}</button>`}return`
                    <div class="aira-voucher-card" style="${t?`opacity:0.7; border-color:#cbd5e1; background:#f8fafc;`:``}">
                        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                            <span class="aira-voucher-badge"><i class="fa-solid fa-ticket"></i> ${e.title||`Voucher Resmi`}</span>
                            ${c}
                        </div>
                        <div style="margin: 3px 0;">
                            ${s}
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin: 4px 0;">
                            <div>
                                <div class="aira-voucher-code" style="${t?`color:#64748b; text-decoration:line-through;`:``}">${e.code}</div>
                                <div style="font-size:0.78rem; color:#475569; margin-top:2px;">${a}</div>
                            </div>
                            ${l}
                        </div>
                        <div style="font-size:0.73rem; color:#64748b; line-height:1.3;">
                            ${t?`<span style="color:#dc2626; font-weight:600;"><i class="fa-solid fa-circle-exclamation"></i> Kuota promo ini (${e.usageLimit} penggunaan) sudah habis terpakai.</span>`:e.description||(e.itemId?`Khusus untuk pemesanan ${o?o.title:`item ini`}.`:`Gunakan saat pemesanan armada atau paket tour mana pun.`)}
                        </div>
                    </div>
                `}).join(``);n.insertAdjacentHTML(`beforeend`,`
                <div class="message ai-message" style="border:1.5px solid #fed7aa; background:#fffbf7;">
                    <h4 style="margin:0 0 6px 0; color:#ea580c; display:flex; align-items:center; gap:8px;">
                        <i class="fa-solid fa-gift"></i> Promo Resmi Hari Ini dari Kami Travel Lombok Airport
                    </h4>
                    <p style="font-size:0.85rem; color:#475569; margin:0 0 10px 0;">
                        Berikut daftar kode voucher resmi dari Travel Lombok Airport saat ini:
                    </p>
                    ${s}
                    <div style="margin-top:10px; font-size:0.78rem; color:#94a3b8; text-align:center;">
                        💡 Klik <strong>"Gunakan Kupon"</strong> pada voucher aktif di atas untuk memasang otomatis diskon ke pesanan.
                    </div>
                </div>
            `),n.scrollTop=n.scrollHeight},700)}catch(e){console.error(`Error checking promos:`,e)}},window.applyPromoCodeFromAira=(e,t=``)=>{if(!e)return;window.savedAiraPromo={code:e,itemId:t||null};let n=null;t&&window.globalItems&&Array.isArray(window.globalItems)&&(n=window.globalItems.find(e=>e.id===t));let r=document.getElementById(`chat-messages`);if(t&&n){r&&(r.insertAdjacentHTML(`beforeend`,`
                <div class="message ai-message" style="background:#f0fdf4; border:1px solid #86efac; color:#166534;">
                    <i class="fa-solid fa-circle-check" style="color:#16a34a;"></i> Kupon <strong>${e}</strong> khusus untuk <strong>${n.title}</strong> dipilih! Membuka formulir pemesanan...
                </div>
            `),r.scrollTop=r.scrollHeight),setTimeout(()=>{let t=document.getElementById(`ai-chat-window`);t&&!t.classList.contains(`hidden`)&&t.classList.add(`hidden`),typeof window.openCheckoutModal==`function`&&window.openCheckoutModal(n.title,n.price||0,`web`),typeof Swal<`u`&&Swal.fire({icon:`success`,title:`Kupon ${e} Terpasang!`,text:`Kupon khusus "${n.title}" telah otomatis terpasang pada formulir booking.`,confirmButtonColor:`#0284c7`,timer:3500})},600);return}r&&(r.insertAdjacentHTML(`beforeend`,`
            <div class="message ai-message" style="background:#f0fdf4; border:1px solid #86efac; color:#166534;">
                <i class="fa-solid fa-circle-check" style="color:#16a34a;"></i> Kupon <strong>${e}</strong> berlaku untuk <strong>SEMUA armada & paket tour</strong>! Kode promo otomatis terisi saat memilih armada/paket mana saja.
            </div>
        `),r.scrollTop=r.scrollHeight);let i=document.getElementById(`co-promo-input`);i&&document.getElementById(`checkout-modal`)?.classList.contains(`active`)&&(i.value=e,typeof window.applyPromo==`function`&&window.applyPromo()),setTimeout(()=>{let t=document.getElementById(`ai-chat-window`);t&&!t.classList.contains(`hidden`)&&t.classList.add(`hidden`);let n=document.getElementById(`armada`)||document.getElementById(`paket`)||document.querySelector(`.hero`);n&&n.scrollIntoView({behavior:`smooth`,block:`start`}),typeof Swal<`u`&&Swal.fire({icon:`success`,title:`Kupon ${e} Tersalin!`,text:`Kupon ini berlaku untuk SEMUA paket tour dan rental armada. Silakan pilih paket apa saja yang Kakak inginkan, kupon akan otomatis terpasang saat checkout.`,confirmButtonColor:`#0284c7`,timer:3500})},600)},document.addEventListener(`DOMContentLoaded`,()=>{window.initChatScrollListener&&window.initChatScrollListener(),setInterval(()=>{let e=document.getElementById(`chat-messages`);e&&(e.innerHTML+=`
                <div class="message ai-message" style="background-color: #f8fafc; border: 1px dashed #cbd5e1;">
                    Ada kendala dengan layanan kami? Anda dapat melaporkannya kapan saja.
                    <div style="margin-top: 8px;">
                        <button onclick="window.showBugReportOptions()" style="text-align: left; background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; padding: 8px 12px; border-radius: 8px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s;">
                            <i class="fa-solid fa-triangle-exclamation"></i> Laporkan Masalah / Bug
                        </button>
                    </div>
                </div>
            `,e.scrollTop=e.scrollHeight)},3e5)});