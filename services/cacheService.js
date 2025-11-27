const redis = require("redis");

const isTest = process.env.NODE_ENV === "test";
const REDIS_URL = process.env.REDIS_URL || null;

let client = null;
let isReady = false;

if (!isTest && REDIS_URL) {
  client = redis.createClient({ url: REDIS_URL });

  client.on("error", (err) => {
    console.warn("Redis-Fehler:", err.message);
  });

  client.on("ready", () => {
    console.log("✅ Redis-Client verbunden");
    isReady = true;
  });

  // Verbindung starten
  client.connect().catch((err) => {
    console.warn("Konnte nicht mit Redis verbinden:", err.message);
  });
}

// Hilfsfunktion: Cache aktiviert?
function cacheEnabled() {
  return client && isReady;
}

// Wert aus dem Cache holen
async function get(key) {
  if (!cacheEnabled()) {
    return null;
  }
  return client.get(key);
}

// Wert in den Cache schreiben (optional mit TTL in Sekunden)
async function set(key, value, ttlSeconds = 60) {
  if (!cacheEnabled()) {
    return;
  }

  if (ttlSeconds) {
    await client.set(key, value, { EX: ttlSeconds });
  } else {
    await client.set(key, value);
  }
}

module.exports = {
  get,
  set,
};
