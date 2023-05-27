// TODO: remove the console.logs
// TODO: offline default page
// TODO: cache invalidation/expiration
// TODO: code to nuke sw

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

  /* 
    TODO: let the end-user control which strategy to use

    1.  Dropdown to select on the FE
    2.  Endpoint/URL (e.g. `/set-caching-strategy`) intercepted by the sw
        that updates a constant in-memory, activeCachingStrategy
  */

  switch (activeCachingStrategy) {
    case CachingStrategy.CACHE_FIRST:
      event.respondWith(cacheFirst(event));
    case CachingStrategy.NETWORK_FIRST:
      event.respondWith(networkFirst(event));
    case CachingStrategy.STALE_WHILE_REVALIDATE:
      event.respondWith(staleWhileRevalidate(event));
    case CachingStrategy.CACHE_ONLY:
      event.respondWith(cacheOnly(event));
    case CachingStrategy.NETWORK_ONLY:
      event.respondWith(networkOnly(event));
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
  console.log("cacheFirst");

  return caches.match(event.request) || fetch(event.request);
}

async function networkFirst(event) {
  console.log("networkFirst");

  let response;
  try {
    response = await fetch(event.request);
  } catch (error) {
    response = await caches.match(event.request);
  }
  return response;
}

async function staleWhileRevalidate(event) {
  console.log("staleWhileRevalidate");

  const cachedResponse = await caches.match(event.request);

  // Cache hit: return immediately and revalidate in the background
  if (cachedResponse) {
    event.waitUntil(revalidate());
    return cachedResponse;
  }

  // Cache miss, revalidate will return the network response
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
  console.log("cacheOnly");

  return caches.match(event.request);
}

async function networkOnly(event) {
  console.log("networkOnly");

  return fetch(event.request);
}
