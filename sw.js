// Service Worker for Cupcakes on the Avenue PWA
const CACHE_NAME = 'cupcakes-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/shop.html',
  '/shared.css',
  '/shared.js',
  '/manifest.json',
  '/pictures/logo.png'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Push notification event
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New update from Cupcakes on the Avenue! 🧁',
    icon: '/pictures/logo.png',
    badge: '/pictures/logo.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'view',
        title: 'View Shop',
        icon: '/pictures/logo.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/pictures/logo.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Cupcakes on the Avenue 🧁', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/shop.html')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open main page
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for offline notifications
self.addEventListener('sync', event => {
  if (event.tag === 'weekly-bakes-update') {
    event.waitUntil(doWeeklyBakesSync());
  }
});

function doWeeklyBakesSync() {
  // This would typically fetch updates from your server
  // For now, we'll just show a notification
  return self.registration.showNotification('Weekly Bakes Updated! 🍰', {
    body: 'Check out this week\'s fresh bakes at Highworth Market!',
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🧁</text></svg>',
    tag: 'weekly-bakes',
    vibrate: [200, 100, 200]
  });
}