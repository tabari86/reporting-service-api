function readRequiredEnv(name) {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getConfig() {
  const nodeEnv = process.env.NODE_ENV || "development";
  const isTest = nodeEnv === "test";

  const mongodbUri = readRequiredEnv("MONGODB_URI");

  if (!isTest) {
    readRequiredEnv("API_KEY");
    readRequiredEnv("JWT_SECRET");
  }

  return {
    nodeEnv,
    port: process.env.PORT || 4000,
    mongodbUri,
    apiKey: process.env.API_KEY || null,
    jwtSecret: process.env.JWT_SECRET || null,
    redisUrl: process.env.REDIS_URL || null,
  };
}

module.exports = {
  getConfig,
};