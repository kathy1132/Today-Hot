const DEFAULT_TTL = parseInt(process.env.CACHE_TTL || '600', 10);

const cacheStore = new Map();

function isExpired(entry) {
  return Date.now() > entry.expiresAt;
}

function cleanExpired(key) {
  const entry = cacheStore.get(key);
  if (entry && isExpired(entry)) {
    cacheStore.delete(key);
    return true;
  }
  return false;
}

function getCache(key) {
  if (cleanExpired(key)) {
    return null;
  }
  const entry = cacheStore.get(key);
  return entry ? entry.data : null;
}

function setCache(key, data, ttlSec) {
  const ttl = ttlSec !== undefined ? ttlSec : DEFAULT_TTL;
  const expiresAt = Date.now() + ttl * 1000;
  cacheStore.set(key, { data, expiresAt });
}

function deleteCache(key) {
  return cacheStore.delete(key);
}

function clearCache() {
  cacheStore.clear();
}

function getCacheStats() {
  let expiredCount = 0;
  for (const [key] of cacheStore) {
    if (cleanExpired(key)) {
      expiredCount++;
    }
  }
  return {
    size: cacheStore.size,
    expiredCleaned: expiredCount
  };
}

module.exports = {
  getCache,
  setCache,
  deleteCache,
  clearCache,
  getCacheStats,
  DEFAULT_TTL
};