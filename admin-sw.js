// Charlotte's Cakes Admin - Service Worker
// Version 1.0.0

const CACHE_NAME = 'cakes-admin-v1';
const RUNTIME_CACHE = 'cakes-admin-runtime';

// Files to cache for offline use
const CACHE_URLS = [
  '/admin.html',
  '/admin-manifest.json',
  // Add critical CSS and JS inline in HTML, so no external dependencies
];

// Install event - cache core files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching core files');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Core files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache', request.url);
          return cachedResponse;
        }
        
        // Not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response for caching
            const responseToCache = response.clone();
            
            // Cache runtime resources
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
            
            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed', error);
            
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/admin.html');
            }
            
            // For other requests, return a basic offline response
            return new Response('Offline - Please check your connection', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain',
              }),
            });
          });
      })
  );
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync-emails') {
    event.waitUntil(
      // Sync pending emails when connection is restored
      syncPendingEmails()
    );
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Charlotte\'s Cakes Admin',
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23667eea" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">🧁</text><text x="50" y="20" font-size="12" text-anchor="middle" fill="white" font-family="Arial">ADMIN</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23667eea" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">🧁</text></svg>',
    vibrate: [200, 100, 200],
    data: {
      url: '/admin.html'
    },
    actions: [
      {
        action: 'open',
        title: 'Open Admin',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="60" font-size="40" text-anchor="middle">📱</text></svg>'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="60" font-size="40" text-anchor="middle">❌</text></svg>'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Charlotte\'s Cakes Admin', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    // Open the admin panel
    event.waitUntil(
      self.clients.matchAll({ type: 'window' })
        .then((clients) => {
          // Check if admin panel is already open
          for (const client of clients) {
            if (client.url.includes('/admin.html') && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Open new admin panel window
          if (self.clients.openWindow) {
            return self.clients.openWindow('/admin.html');
          }
        })
    );
  }
  // Dismiss action doesn't need special handling
});

// Helper function to sync pending emails
async function syncPendingEmails() {
  try {
    console.log('Service Worker: Syncing pending emails...');
    
    // This would integrate with your email system
    // For now, we'll just log that sync is happening
    
    // In a real implementation:
    // 1. Get pending emails from IndexedDB or localStorage
    // 2. Send them via your email API
    // 3. Mark as sent or handle failures
    
    console.log('Service Worker: Email sync completed');
    
    // Show notification about sync completion
    self.registration.showNotification('Charlotte\'s Cakes Admin', {
      body: 'Pending emails synced successfully',
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23667eea" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">✅</text></svg>',
      tag: 'email-sync'
    });
    
  } catch (error) {
    console.error('Service Worker: Email sync failed', error);
    
    self.registration.showNotification('Charlotte\'s Cakes Admin', {
      body: 'Email sync failed - check connection',
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23dc3545" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">❌</text></svg>',
      tag: 'email-sync-error'
    });
  }
}

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_EMAILS') {
    // Cache email data for offline access
    caches.open(RUNTIME_CACHE).then((cache) => {
      cache.put('/offline-emails', new Response(JSON.stringify(event.data.emails)));
    });
  }
});

console.log('Service Worker: Loaded successfully');