let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  console.log("PWA Install Ready");
});

window.installPWA = async (event) => {
  if (event) event.preventDefault();
  
  if (deferredPrompt) {
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    deferredPrompt = null;
  } else {
    // Fallback if PWA is already installed or not supported
    const isLocalIP = window.location.hostname.match(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/);
    
    if (isLocalIP && window.location.protocol === 'http:') {
        Swal.fire({
            icon: 'info',
            title: 'Mode Testing Lokal',
            html: 'Fitur Unduh Aplikasi (PWA) diblokir sementara oleh Google Chrome karena Anda mengakses via IP Lokal <b>' + window.location.hostname + ' (HTTP)</b>.<br><br>Fitur ini akan otomatis berfungsi 100% saat website sudah di-online-kan (menggunakan <b>HTTPS</b>) atau jika dibuka lewat <b>localhost</b>.',
            confirmButtonColor: '#22c55e',
            confirmButtonText: 'Mengerti'
        });
    } else {
        // Check if it's a mobile device
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        
        if (isIOS) {
            Swal.fire({
                icon: 'info',
                title: '📲 Cara Install di iPhone/iPad',
                html: `
                    <div style="text-align:left; font-size: 0.9rem; line-height: 1.8;">
                        <b>Langkah-langkah install:</b><br>
                        1. Ketuk tombol <b>Share</b> (kotak dengan panah ↑) di bawah layar<br>
                        2. Gulir ke bawah, pilih <b>"Add to Home Screen"</b><br>
                        3. Ketuk <b>"Add"</b> di pojok kanan atas<br><br>
                        ✅ Aplikasi Travel Lombok Airport akan muncul di layar utama Anda!
                    </div>
                `,
                confirmButtonColor: '#22c55e',
                confirmButtonText: 'Mengerti'
            });
        } else if (isMobile) {
            Swal.fire({
                icon: 'info',
                title: '📲 Cara Install Aplikasi',
                html: `
                    <div style="text-align:left; font-size: 0.9rem; line-height: 1.8;">
                        <b>Langkah-langkah install di Android:</b><br>
                        1. Ketuk menu <b>⋮</b> (tiga titik) di pojok kanan atas Chrome<br>
                        2. Pilih <b>"Add to Home screen"</b> atau <b>"Install app"</b><br>
                        3. Ketuk <b>"Install"</b><br><br>
                        ✅ Aplikasi Travel Lombok Airport siap digunakan!
                    </div>
                `,
                confirmButtonColor: '#22c55e',
                confirmButtonText: 'Mengerti'
            });
        } else {
            Swal.fire({
                icon: 'info',
                title: '💻 Cara Install Aplikasi',
                html: `
                    <div style="text-align:left; font-size: 0.9rem; line-height: 1.8;">
                        <b>Install di Chrome (Desktop):</b><br>
                        1. Klik ikon <b>⊕</b> di pojok kanan address bar<br>
                        2. Pilih <b>"Install Travel Lombok Airport"</b><br><br>
                        <b>Atau:</b> Menu ⋮ → <b>"Cast, save, and share"</b> → <b>"Install page as app"</b><br><br>
                        ✅ Aplikasi akan muncul di desktop Anda!
                    </div>
                `,
                confirmButtonColor: '#22c55e',
                confirmButtonText: 'Mengerti'
            });
        }
    }
  }
};

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registered with scope: ', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}
