console.log("Your service worker is running!");
//start by defining files to cache for app offline capabs.
const FILES_TO_CACHE = [
    '/',
    './index.html',
    './favicon.ico',
    './index.js',
    './style.css',
    './manifest.webmanifest',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png',
    './Budgetdb.js',
    'https://cdn.jsdelivr.net/npm/chart.js@2.8.0',
    'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
    'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/fonts/fontawesome-webfont.woff?v=4.7.0',
    'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/fonts/fontawesome-webfont.woff2?v=4.7.0'
];

const STATIC_CACHE = "static-cache-v1";
const RUNTIME_CACHE = "runtime-cache";

// using addEventListener it installs with event.waitUntil()
// to keep service-worker in install phase until promise is solved
self.addEventListener('install', event => {
    // then waits until cache is open and adds all listed files on files_to_cache to Cache memory
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('All listed files added to cache for offline use')
                return cache.addAll(FILES_TO_CACHE)
            })
    )
    self.skipWaiting()
});


// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", event => {
    const currentCaches = [STATIC_CACHE, RUNTIME_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        // return array of cache names that are old to delete
        return cacheNames.filter(
          cacheName => !currentCaches.includes(cacheName)
        );
      })
      //after keys retrieved from cache and filtering, returns promise deleting caches
      .then(cachesToDelete => {
        return Promise.all(
          cachesToDelete.map(cacheToDelete => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});




self.addEventListener("fetch", event => {
    // non GET requests are not cached and requests to other origins are not cached
    if (
      event.request.method !== "GET" ||
      !event.request.url.startsWith(self.location.origin)
    ) {
      event.respondWith(fetch(event.request));
      return;
    }
  
// handle runtime GET requests for data from /api routes
if (event.request.url.includes("/api")) {
    console.log(`[Service Worker] Fetch (data) ${event.request.url}`)
    // make network request and fallback to cache if network request fails (offline)
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(cache => {
        return fetch(event.request)
          .then(response => {
            if (response.status === 200) {
              // cloning allows replica of fetch event when offline
            cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => caches.match(event.request));
      })
    );
    return;
  }
  // In case fetch does not contain /api
   // use cache first for all other requests for performance
  event.respondWith(
    // Uses open to get cache via STATIC_CACHE
    caches.open(STATIC_CACHE)
        .then(cache => {
            return cache.match(event.request)
                .then(response => {
                    // return exiting response or make network request and cache the response
                    return response || fetch(event.response)
                })
        })
)
      })