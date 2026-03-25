const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  console.log('[Cache] HIT for: ' + key);
  return item.data;
}

export function setCached(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
  console.log('[Cache] SAVED for: ' + key);
}

export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}