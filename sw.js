// Cachea la app para que funcione sin conexión. Cambia VERSION al actualizar data.js.
const VERSION = "v8";
const SHELL = ["./", "index.html", "style.css", "app.js", "rules.js", "methods.js", "data.js", "manifest.webmanifest", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== "img").map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    // Red primero (para recibir actualizaciones), caché si no hay conexión.
    e.respondWith(
      fetch(e.request)
        .then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); return r; })
        .catch(() => caches.match(e.request, { ignoreSearch: true }))
    );
  } else if ((url.hostname.endsWith("teashop.com") || url.hostname.endsWith("imgix.net") || url.hostname.endsWith("hornimans.com")) && e.request.destination === "image") {
    // Fotos de Tea Shop: caché primero.
    e.respondWith(
      caches.open("img").then((c) => c.match(e.request).then((hit) => hit || fetch(e.request).then((r) => { c.put(e.request, r.clone()); return r; })))
    );
  }
});
