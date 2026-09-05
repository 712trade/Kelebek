// Kelebek — bildirim dinleyicisi.
// Uygulama kapaliyken calisan tek parca burasi.
// Bildirim metnini ALICI belirler; sunucudan gelen metin sadece yedektir.

async function tercih() {
  try {
    const c = await caches.open("kb-pref");
    const r = await c.match("/pref");
    return r ? await r.json() : null;
  } catch (_) {
    return null;
  }
}

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  e.waitUntil((async () => {
    let d = {};
    try { if (e.data) d = e.data.json(); } catch (_) { /* duz metin */ }
    const p = await tercih();
    await self.registration.showNotification(
      (p && p.title) || "Kelebek",
      {
        body: (p && p.body) || d.body || "Yeni bir şey var",
        tag: "kelebek",
        silent: true,
      }
    );
  })());
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
      for (const c of cs) if ("focus" in c) return c.focus();
      if (self.clients.openWindow) return self.clients.openWindow("./");
    })
  );
});
