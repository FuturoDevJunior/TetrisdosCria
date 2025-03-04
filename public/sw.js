// Nome e versão do cache para identificar e gerenciar
const CACHE_NAME = 'tetris-brasileiro-v1';

// Arquivos para armazenar em cache (permitem funcionamento offline)
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/tetris.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-16x16.png',
  '/icons/favicon-32x32.png',
  '/favicon.ico'
];

// Instalação do service worker e cacheamento de recursos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Erro ao cachear recursos:', error);
      })
  );
});

// Ativação do service worker e limpeza de caches antigos
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Se o cache não estiver na whitelist, deletá-lo
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estratégia de cache: Network falling back to cache
// Primeiro tenta buscar da rede, se falhar, usa o cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Se a resposta for válida, clona-a e armazena no cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // Se a busca na rede falhar, tenta recuperar do cache
        return caches.match(event.request);
      })
  );
});