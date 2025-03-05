// Nome e versão do cache para identificar e gerenciar
const CACHE_NAME = 'tetris-dos-cria-v2';

// Arquivos para armazenar em cache (permitem funcionamento offline)
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './tetris.js',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// Instalação do service worker e cacheamento de recursos
self.addEventListener('install', event => {
  // Força o novo service worker a se tornar ativo
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache)
          .catch(error => {
            console.error('Erro ao cachear recursos específicos:', error);
            // Mesmo com erros em alguns recursos, continua
          });
      })
      .catch(error => {
        console.error('Erro grave ao abrir cache:', error);
      })
  );
});

// Ativação do service worker e limpeza de caches antigos
self.addEventListener('activate', event => {
  // Ativa o novo service worker imediatamente em todas as abas
  event.waitUntil(clients.claim());
  
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Se o cache não estiver na whitelist, deletá-lo
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});

// Estratégia de cache: Cache first, falling back to network
// Primeiro busca no cache, se não encontrar, busca na rede
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Se encontrou no cache, retorna o cache
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Caso contrário, busca na rede
        return fetch(event.request)
          .then(response => {
            // Se a resposta não é válida, apenas retorna
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Armazena uma cópia da resposta no cache para uso futuro
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(err => {
                console.error('Erro ao armazenar em cache:', err);
              });
            
            return response;
          })
          .catch(error => {
            console.error('Erro na busca de rede:', error);
            
            // Aqui podemos retornar uma página offline personalizada
            // para solicitações de documentos HTML
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            
            // Para outros recursos, apenas falha
            throw error;
          });
      })
  );
});

// Responde a mensagens enviadas do cliente
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});