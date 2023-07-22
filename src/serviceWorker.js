// TODO: remove the console.logs
// TODO: offline default page
// TODO: cache invalidation/expiration
// TODO: figure out why sw waits to activate until [hard refresh]

// TODO: is there a best practice for enums in vanilla JS?
const CachingStrategy = {
  CACHE_FIRST: "cache-first",
  NETWORK_FIRST: "network-first",
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
  CACHE_ONLY: "cache-only",
  NETWORK_ONLY: "network-only",
};

let activeCachingStrategy = CachingStrategy.CACHE_FIRST;

/*
  SERVICE WORKER LIFECYCLE
*/

self.addEventListener("install", (event) => {
  console.log("Service worker installed");

  event.waitUntil(populateCache());
});

self.addEventListener("activate", () => {
  console.log("Service worker activated");
});

self.addEventListener("fetch", (event) => {
  console.log(`Network request to URL: ${event.request.url}`);

  // TODO: this handler is not firing — why is the sw being bypassed?
  if (
    event.request.url === "/caching-strategy" &&
    event.request.method === "POST"
  ) {
    console.log("intercepted fetch in sw");
    console.log("event.request.body");
    console.log(event.request.body);
    // activeCachingStrategy = event.request.body["caching-strategy"]
    return;
  }

  switch (activeCachingStrategy) {
    case CachingStrategy.CACHE_FIRST:
      event.respondWith(cacheFirst(event));
      return;
    case CachingStrategy.NETWORK_FIRST:
      event.respondWith(networkFirst(event));
      return;
    case CachingStrategy.STALE_WHILE_REVALIDATE:
      event.respondWith(staleWhileRevalidate(event));
      return;
    case CachingStrategy.CACHE_ONLY:
      event.respondWith(cacheOnly(event));
      return;
    case CachingStrategy.NETWORK_ONLY:
      event.respondWith(networkOnly(event));
      return;
  }
});

/*
  WRITE TO CACHE STORAGE
*/

const ASSETS_TO_CACHE = [
  "/",
  "/index.css",
  "/service-workers",
  "/js/serviceWorkers.js",
];

async function populateCache() {
  try {
    const johnnyCache = await getJohnnyCache();
    return johnnyCache.addAll(ASSETS_TO_CACHE);
  } catch (error) {
    console.error("Unable to populate cache: ", error);
  }
}

async function getJohnnyCache() {
  return caches.open("johnny-cache");
}

/*
  SERVICE WORKER AS NETWORK PROXY -
  CACHING STRATEGIES
*/

// TODO: offline fallback for all of these

async function cacheFirst(event) {
  console.log(`Strategy: cache-first for ${event.request.url}`);

  const cachedResponse = await caches.match(event.request);
  console.log(
    `Cache ${cachedResponse ? "hit" : "miss"} on ${event.request.url}`
  );

  return cachedResponse || fetch(event.request);
}

async function networkFirst(event) {
  console.log(`Strategy: network-first for ${event.request.url}`);

  let response;
  try {
    response = await fetch(event.request);
  } catch (error) {
    response = await caches.match(event.request);
  }
  return response;
}

async function staleWhileRevalidate(event) {
  console.log(`Strategy: stale-while-revalidate for ${event.request.url}`);

  const cachedResponse = await caches.match(event.request);

  // Cache hit: return "stale" response immediately and revalidate in the background
  if (cachedResponse) {
    event.waitUntil(revalidate());
    return cachedResponse;
  }

  // Cache miss: revalidate will return the network response
  return revalidate();

  async function revalidate() {
    try {
      const responseStream = await fetch(event.request);
      const responseClone = responseStream.clone();
      const johnnyCache = await getJohnnyCache();
      await johnnyCache.put(event.request, responseClone);
      return responseClone;
    } catch (error) {
      return null;
    }
  }
}

async function cacheOnly(event) {
  console.log(`Strategy: cache-only for ${event.request.url}`);

  return caches.match(event.request);
}

async function networkOnly(event) {
  console.log(`Strategy: network-only for ${event.request.url}`);

  return fetch(event.request);
}
