const CACHE_VERSION = "v1";
const CACHE = `pos-shell-${CACHE_VERSION}`;
const INDEX_URL = "/index.html";
const NAVIGATION_TIMEOUT_MS = 4000;

async function precacheShell() {
  const cache = await caches.open(CACHE);
  const response = await fetch(INDEX_URL, { cache: "no-store" });
  if (!response.ok) return;
  const html = await response.clone().text();
  await cache.put(INDEX_URL, response);

  const assetUrls = new Set(["/favicon.svg"]);
  for (const match of html.matchAll(/(?:src|href)="(\/[^"]+)"/g)) {
    assetUrls.add(match[1]);
  }
  await Promise.all(
    [...assetUrls].map((url) =>
      cache.add(url).catch(() => undefined),
    ),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(precacheShell().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("pos-shell-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function fetchWithTimeout(request, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    fetch(request).then(
      (response) => {
        clearTimeout(timer);
        resolve(response);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function handleNavigation(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetchWithTimeout(request, NAVIGATION_TIMEOUT_MS);
    if (response.ok) {
      // SPA: cualquier ruta devuelve el mismo index.html.
      cache.put(INDEX_URL, response.clone()).catch(() => undefined);
    }
    return response;
  } catch {
    const cached = await cache.match(INDEX_URL);
    return cached || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone()).catch(() => undefined);
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone()).catch(() => undefined);
      return response;
    })
    .catch(() => undefined);
  return cached || (await network) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // API en otro origen
  if (url.pathname.startsWith("/api")) return; // API en el mismo origen

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
  } else if (url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});
