const CACHE_NAME = 'adhdo-v1';
const STATIC_CACHE = 'adhdo-static-v1';
const DYNAMIC_CACHE = 'adhdo-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Fonts will be cached dynamically
  'https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https?:\/\/localhost:5000\/api\//,
  /^https?:\/\/.*\/api\//
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (request.destination === 'document') {
    // HTML pages - Network first, cache fallback
    event.respondWith(networkFirstStrategy(request));
  } else if (request.destination === 'script' || request.destination === 'style') {
    // JS/CSS - Cache first, network fallback
    event.respondWith(cacheFirstStrategy(request));
  } else if (request.destination === 'image') {
    // Images - Cache first, network fallback
    event.respondWith(cacheFirstStrategy(request));
  } else if (url.pathname.startsWith('/api/') || API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    // API calls - Network first with short cache
    event.respondWith(networkFirstApiStrategy(request));
  } else {
    // Everything else - Network first, cache fallback
    event.respondWith(networkFirstStrategy(request));
  }
});

// Network first strategy (for HTML and API)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', error);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/') || new Response('Offline - Please check your connection', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    throw error;
  }
}

// Cache first strategy (for static assets)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Failed to fetch and cache', request.url, error);
    throw error;
  }
}

// Network first strategy for API with shorter cache duration
async function networkFirstApiStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Only cache successful GET requests for API
      if (request.method === 'GET') {
        const cache = await caches.open(DYNAMIC_CACHE);
        const responseToCache = networkResponse.clone();

        // Add timestamp for cache invalidation
        const headers = new Headers(responseToCache.headers);
        headers.set('sw-cached-at', Date.now().toString());

        const modifiedResponse = new Response(responseToCache.body, {
          status: responseToCache.status,
          statusText: responseToCache.statusText,
          headers: headers
        });

        cache.put(request, modifiedResponse);
      }
    }

    return networkResponse;
  } catch (error) {
    console.log('Service Worker: API network failed, trying cache', error);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Check if cached API response is not too old (5 minutes)
      const cachedAt = cachedResponse.headers.get('sw-cached-at');
      if (cachedAt && (Date.now() - parseInt(cachedAt)) < 5 * 60 * 1000) {
        return cachedResponse;
      }
    }

    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);

  if (event.tag === 'background-sync-todos') {
    event.waitUntil(syncTodos());
  }
});

// Sync todos when back online
async function syncTodos() {
  try {
    // This would integrate with your app's sync logic
    console.log('Service Worker: Syncing todos...');

    // Send message to clients about sync
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'SYNC_TODOS' });
    });
  } catch (error) {
    console.error('Service Worker: Sync failed', error);
  }
}

// Push notifications (for future enhancement)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received', event);

  const options = {
    body: event.data ? event.data.text() : 'New todo reminder',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    tag: 'todo-reminder',
    actions: [
      {
        action: 'view',
        title: 'View Todos',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-icon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('ADHDO', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);

  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('Service Worker: Loaded');
