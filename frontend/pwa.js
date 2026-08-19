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
        Swal.fire({
            icon: 'info',
            title: 'Unduh Aplikasi',
            text: 'Aplikasi sudah terinstal di perangkat Anda atau browser yang Anda gunakan saat ini tidak mendukung instalasi langsung.',
            confirmButtonColor: '#22c55e'
        });
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
