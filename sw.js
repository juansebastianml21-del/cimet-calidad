// Permite abrir la app sin señal y la hace instalable.
// Al publicar cambios, sube el número de VERSION para que los celulares actualicen.
const VERSION = "cimet-calidad-v1";
const FB = "https://www.gstatic.com/firebasejs/10.12.2/";
const PRECARGA = [
  "./", "index.html", "app.js", "firebase-config.js", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png",
  FB + "firebase-app.js", FB + "firebase-auth.js", FB + "firebase-firestore.js"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.allSettled(PRECARGA.map(u => c.add(u)))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Librerías de Firebase: primero lo guardado
  if (url.href.startsWith(FB)) {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const c = res.clone(); caches.open(VERSION).then(k => k.put(req, c)); return res; })));
    return;
  }
  // Archivos de la app: primero la red (para recibir actualizaciones), si no hay señal lo guardado
  if (url.origin === self.location.origin) {
    e.respondWith(fetch(req).then(res => { const c = res.clone(); caches.open(VERSION).then(k => k.put(req, c)); return res; })
      .catch(() => caches.match(req).then(r => r || caches.match("index.html"))));
  }
  // Todo lo demás (la base de datos de Firebase) pasa directo
});
