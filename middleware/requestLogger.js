const crypto = require("crypto");
const logger = require("../utils/logger");

function getRequestId(req) {
  const incomingRequestId = req.headers["x-request-id"];

  if (typeof incomingRequestId === "string" && incomingRequestId.trim() !== "") {
    return incomingRequestId;
  }

  return crypto.randomUUID();
}

module.exports = (req, res, next) => {
  const start = Date.now();
  const requestId = getRequestId(req);

  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.info(
      `[requestId=${requestId}] ${req.ip} - ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};
