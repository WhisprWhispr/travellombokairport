var e;window.addEventListener(`beforeinstallprompt`,t=>{t.preventDefault(),e=t,console.log(`PWA Install Ready`)}),window.installPWA=async t=>{if(t&&t.preventDefault(),e){e.prompt();let{outcome:t}=await e.userChoice;console.log(`User response to the install prompt: ${t}`),e=null}else if(window.location.hostname.match(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/)&&window.location.protocol===`http:`)Swal.fire({icon:`info`,title:`Mode Testing Lokal`,html:`Fitur Unduh Aplikasi (PWA) diblokir sementara oleh Google Chrome karena Anda mengakses via IP Lokal <b>`+window.location.hostname+` (HTTP)</b>.<br><br>Fitur ini akan otomatis berfungsi 100% saat website sudah di-online-kan (menggunakan <b>HTTPS</b>) atau jika dibuka lewat <b>localhost</b>.`,confirmButtonColor:`#22c55e`,confirmButtonText:`Mengerti`});else{let e=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);/iPhone|iPad|iPod/i.test(navigator.userAgent)?Swal.fire({icon:`info`,title:`📲 Cara Install di iPhone/iPad`,html:`
                    <div style="text-align:left; font-size: 0.9rem; line-height: 1.8;">
                        <b>Langkah-langkah install:</b><br>
                        1. Ketuk tombol <b>Share</b> (kotak dengan panah ↑) di bawah layar<br>
                        2. Gulir ke bawah, pilih <b>"Add to Home Screen"</b><br>
                        3. Ketuk <b>"Add"</b> di pojok kanan atas<br><br>
                        ✅ Aplikasi Travel Lombok Airport akan muncul di layar utama Anda!
                    </div>
                `,confirmButtonColor:`#22c55e`,confirmButtonText:`Mengerti`}):e?Swal.fire({icon:`info`,title:`📲 Cara Install Aplikasi`,html:`
                    <div style="text-align:left; font-size: 0.9rem; line-height: 1.8;">
                        <b>Langkah-langkah install di Android:</b><br>
                        1. Ketuk menu <b>⋮</b> (tiga titik) di pojok kanan atas Chrome<br>
                        2. Pilih <b>"Add to Home screen"</b> atau <b>"Install app"</b><br>
                        3. Ketuk <b>"Install"</b><br><br>
                        ✅ Aplikasi Travel Lombok Airport siap digunakan!
                    </div>
                `,confirmButtonColor:`#22c55e`,confirmButtonText:`Mengerti`}):Swal.fire({icon:`info`,title:`💻 Cara Install Aplikasi`,html:`
                    <div style="text-align:left; font-size: 0.9rem; line-height: 1.8;">
                        <b>Install di Chrome (Desktop):</b><br>
                        1. Klik ikon <b>⊕</b> di pojok kanan address bar<br>
                        2. Pilih <b>"Install Travel Lombok Airport"</b><br><br>
                        <b>Atau:</b> Menu ⋮ → <b>"Cast, save, and share"</b> → <b>"Install page as app"</b><br><br>
                        ✅ Aplikasi akan muncul di desktop Anda!
                    </div>
                `,confirmButtonColor:`#22c55e`,confirmButtonText:`Mengerti`})}},`serviceWorker`in navigator&&window.addEventListener(`load`,()=>{navigator.serviceWorker.register(`/sw.js`).then(e=>{console.log(`ServiceWorker registered with scope: `,e.scope)}).catch(e=>{console.log(`ServiceWorker registration failed: `,e)})});