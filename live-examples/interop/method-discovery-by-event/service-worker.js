console.log('Service Worker initialized!');
self.addEventListener('install', () => {
  //console.log('??', 'install', event);
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  //console.log('??', 'activate', event);
  return self.clients.claim();
});

self.addEventListener('fetch', function () {
  //console.log('??', 'fetch', event);
  // event.respondWith(fetch(event.request));
});

self.addEventListener('message', function (event) {
  //console.log(event.data);
  event.ports[0].postMessage({ test: 'This is my response.' });
});
