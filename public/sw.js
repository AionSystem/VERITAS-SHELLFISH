/*
 * VERITAS‑SHELLFISH — Point‑of‑Use HAB Toxin Detection Platform
 * Service Worker for offline-first PWA
 * Author: Sheldon K. Salmon (Aion System)
 * CERTUS‑TOXIN Engine v1.1
 *
 * Caches the app shell and allows offline test submission via IndexedDB.
 * Background sync pushes queued tests to Supabase when connectivity returns.
 */

const CACHE_NAME = 'veritas-shellfish-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/certus-toxin-v1.1.js',
  '/ai-analysis.js',
  '/manifest.json',
  // Leaflet — loaded from CDN; cached for offline map rendering
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Supabase configuration — VERITAS‑SHELLFISH
const SUPABASE_URL = 'https://spqqhvaqjwxcrdbujwna.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwcXFodmFxand4Y3JkYnVqd25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTY2NDIsImV4cCI6MjA5MDI5MjY0Mn0.1ibM3TwGS82NOAhpzZFbvdCzdveReqaM9sMIVDTO3Tg';

// Install event – cache essential assets
self.addEventListener('install', event => {
  console.log('[SW:Shellfish] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('[SW:Shellfish] Caching app shell');
      for (const asset of ASSETS_TO_CACHE) {
        try {
          await cache.add(asset);
          console.log(`[SW:Shellfish] Cached: ${asset}`);
        } catch (err) {
          console.warn(`[SW:Shellfish] Failed to cache ${asset}:`, err);
        }
      }
    })
  );
  self.skipWaiting();
});

// Activate event – clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW:Shellfish] Activating...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => {
          console.log('[SW:Shellfish] Deleting old cache:', key);
          return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event – cache-first, network fallback
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  if (event.request.method !== 'GET') return;
  if (url.hostname.includes('supabase.co')) return;
  if (url.hostname.includes('openrouter.ai')) return;
  if (url.hostname.includes('google-analytics')) return;
  
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        console.log(`[SW:Shellfish] Serving from cache: ${url.pathname}`);
        return cached;
      }
      
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(err => {
        console.warn(`[SW:Shellfish] Network failed for ${url.pathname}:`, err);
        if (url.pathname.endsWith('.html') || url.pathname === '/') {
          return caches.match('/index.html');
        }
        return new Response('Offline — please check your connection', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      });
    })
  );
});

// Background Sync — push queued offline tests to Supabase
self.addEventListener('sync', event => {
  if (event.tag === 'shellfish-sync-tests') { // UPDATED sync tag
    console.log('[SW:Shellfish] Background sync: shellfish-sync-tests');
    event.waitUntil(syncQueuedTests());
  }
});

// In syncQueuedTests() — update the payload and table name
async function syncQueuedTests() {
  // ... database open code unchanged ...
  
  for (const test of unsynced) {
    try {
      const payload = {
        uuid: test.uuid,
        timestamp: test.timestamp,
        lat: test.lat,
        lng: test.lng,
        species: test.species,
        toxin_type: test.toxinType,
        test_result: test.testResult,
        lot_number: test.lotNumber,
        harvest_time: test.harvestTime,
        tci: test.confidenceScore,
        tci_tier: test.confidenceTier,
        loc_mode: test.locMode,
        text_loc: test.textLocation || '',
        strip_ai_score: test.photoAiScore,
        strip_ai_conf: test.photoAiConf,
        freshness: test.freshness
      };
      
      // UPDATED: Use shellfish_tests table
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/shellfish_tests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON,
            'Authorization': `Bearer ${SUPABASE_ANON}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(payload)
        }
      );
        
        if (response.ok) {
          await markTestSynced(db, test.uuid);
          console.log(`[SW:Shellfish] Test ${test.uuid} synced.`);
        } else {
          const errorText = await response.text();
          console.warn(`[SW:Shellfish] Test ${test.uuid} sync failed — ${response.status}: ${errorText}`);
        }
      } catch (err) {
        console.warn(`[SW:Shellfish] Network error syncing test ${test.uuid}:`, err);
      }
    }
  } catch (err) {
    console.error('[SW:Shellfish] Sync error:', err);
  }
}

// IndexedDB helpers — VERITAS‑SHELLFISH database
function openShellfishDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('shellfish-db', 1);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('tests')) {
        db.createObjectStore('tests', { keyPath: 'uuid' });
      }
    };
  });
}

function getAllTests(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tests', 'readonly');
    const store = tx.objectStore('tests');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function markTestSynced(db, uuid) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tests', 'readwrite');
    const store = tx.objectStore('tests');
    const req = store.get(uuid);
    req.onsuccess = () => {
      const test = req.result;
      if (test) {
        test.synced = true;
        store.put(test);
        resolve();
      } else {
        resolve();
      }
    };
    req.onerror = () => reject(req.error);
  });
}
