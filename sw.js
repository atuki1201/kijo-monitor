const CACHE="kijo-v9";
const ASSETS=["./","./index.html","./manifest.json"];

self.addEventListener("install",event=>{
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache=>cache.addAll(ASSETS))
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then(keys=>Promise.all(
        keys.filter(key=>key!==CACHE && key.indexOf("kijo-")===0)
          .map(key=>caches.delete(key))
      ))
    ])
  );
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;
  event.respondWith(
    fetch(event.request).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      return response;
    }).catch(()=>{
      return caches.match(event.request).then(cached=>cached || caches.match("./index.html"));
    })
  );
});