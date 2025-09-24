// Service Worker for DongTube
const CACHE_NAME = 'dongtube-v1.0.0';
const STATIC_CACHE = 'dongtube-static-v1';
const DYNAMIC_CACHE = 'dongtube-dynamic-v1';

// Files to cache
const STATIC_FILES = [
  '/',
  '/index.html',
  '/watch.html',
  '/admin.html',
  '/style.css',
  '/script.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
  'https://b.top4top.io/p_35449hn0x0.jpg'
];

// Install event
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .catch(err => console.log('Cache error:', err))
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip external requests (like JSONBin API)
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(response => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Fetch from network and cache
        return fetch(request)
          .then(fetchResponse => {
            // Don't cache if not a valid response
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }

            // Clone the response
            const responseToCache = fetchResponse.clone();

            // Add to dynamic cache
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(request, responseToCache);
              });

            return fetchResponse;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Background sync for favorites
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('Service Worker: Background sync');
  // Implement background sync logic here
}

// Push notifications (optional)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: [
        {
          action: 'watch',
          title: 'Watch Now',
          icon: '/icons/play-icon.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icons/close-icon.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'watch') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

console.log('Service Worker: Loaded');