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

  client.on("end", () => {
    isReady = false;
  });

  client.connect().catch((err) => {
    console.warn("Konnte nicht mit Redis verbinden:", err.message);
  });
}

function cacheEnabled() {
  return client && isReady;
}

async function get(key) {
  if (!cacheEnabled()) {
    return null;
  }

  return client.get(key);
}

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

function getStatus() {
  if (isTest || !REDIS_URL) {
    return "not_configured";
  }

  if (client && isReady) {
    return "connected";
  }

  return "disconnected";
}

async function close() {
  if (!client || !client.isOpen) {
    return;
  }

  await client.quit();
  isReady = false;
}

module.exports = {
  get,
  set,
  getStatus,
  close,
};