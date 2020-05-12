const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js", 
    "/styles.css",
    "/database.js",
    "/icons/icon-192x192.png", 
    "/icons/icon-512x512.png"
  ];


const CACHE_NAME =  "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener("install", function(event){
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Your files were pre-cached successfully");
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});


self.addEventListener("activate", function(event) {
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Removing old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
})

// FETCH 

self.addEventListener("fetch", function(event){
    if (event.request.url.includes("/api/")) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(event.request)
                .then(response => {
                    // if response was good, then clone because you cant return the response twice
                    if (response.status === 200) {
                        cache.put(event.request.url, response.clone());
                    }

                    return response;
                })
                .catch(() => {
                    return cache.match(event.request);
                });
            }).catch(err => console.log(err))
        );
        
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(response => {
                return response || fetch(event.request);
            });
        })
    );
});