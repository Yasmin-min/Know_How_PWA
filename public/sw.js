// Service worker do KnowHow: deixa o app instalável e abre a casca mesmo sem internet.
// Dados (API, SignalR) nunca são guardados: só arquivos do próprio site.
const VERSAO = "v1";
const CACHE_CASCA = `knowhow-casca-${VERSAO}`;
const CACHE_ASSETS = `knowhow-assets-${VERSAO}`;
const PAGINA_OFFLINE = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_CASCA)
      .then((cache) => cache.addAll([PAGINA_OFFLINE, "/icon-192.png"]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(
          chaves.filter((chave) => ![CACHE_CASCA, CACHE_ASSETS].includes(chave)).map((chave) => caches.delete(chave)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // API e outros domínios passam direto

  // Navegação: sempre a versão mais nova; sem internet, mostra a página offline.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(PAGINA_OFFLINE)));
    return;
  }

  // Arquivos gerados pelo build têm hash no nome: podem ficar em cache para sempre.
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches.open(CACHE_ASSETS).then(async (cache) => {
        const guardado = await cache.match(request);
        if (guardado) return guardado;
        const resposta = await fetch(request);
        if (resposta.ok) cache.put(request, resposta.clone());
        return resposta;
      }),
    );
  }
});
