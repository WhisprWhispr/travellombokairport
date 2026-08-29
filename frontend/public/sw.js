const CACHE_NAME = 'travel-lombok-v2-offline';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/main.js',
  '/index.css',
  '/style.css',
  '/manifest.json'
];

// Install event: Precache core assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(err => console.log('Precache failed:', err));
    })
  );
});

// Activate event: clean up old caches if any
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: network-first strategy, falling back to cache if offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip API calls
  if (event.request.url.includes('/api/') || event.request.url.includes('firestore')) return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response and save it to cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(async () => {
        // Fallback to cache if network fails (offline)
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If it's a navigation request and not in cache, show offline.html
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      })
  );
});
