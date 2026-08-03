// Foodies service worker — offline caching + notifications
const CACHE = 'foodies-v1';
const ASSETS = [
  './','./index.html','./manifest.webmanifest','./venues.js',
  './icon-192.png','./icon-512.png','./apple-touch-icon.png','./favicon.png','./icon-192-maskable.png','./icon-512-maskable.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
// show a notification when the app asks
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'notify') {
    self.registration.showNotification(e.data.title || 'Foodies', {
      body: e.data.body || '',
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [80,40,80]
    });
  }
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(cs => {
    for (const c of cs) if ('focus' in c) return c.focus();
    if (clients.openWindow) return clients.openWindow('./index.html');
  }));
});
