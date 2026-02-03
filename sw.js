const CACHE_NAME = "totravell-0226";

const ASSETS = [
    "/",
    "/index.html",
    "/css/style.css",
    "/js/script.js",
    "/assets/images/bg-desktop.webp",
    "/assets/images/bg-mobile.webp",
    "/assets/images/mapa.webp"
];

self.addEventListener("install", event => {
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME).then(cache =>
            Promise.all(
                ASSETS.map(asset =>
                    fetch(asset)
                        .then(res => cache.put(asset, res))
                        .catch(() => null)
                )
            )
        )
    );
});

self.addEventListener("fetch", event => {
    if (
        event.request.method !== "GET" ||
        !event.request.url.startsWith(self.location.origin)
    ) {
        return;
    }

    if (event.request.destination === "document") {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache =>
                        cache.put(event.request, clone)
                    );
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});


self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );

    self.clients.claim();
});
