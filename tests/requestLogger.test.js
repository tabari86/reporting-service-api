const requestLogger = require("../middleware/requestLogger");

jest.mock("../utils/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

const logger = require("../utils/logger");

function createMockResponse() {
  const listeners = {};

  return {
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    on(event, callback) {
      listeners[event] = callback;
    },
    finish() {
      listeners.finish();
    },
  };
}

describe("requestLogger Middleware", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("uses an incoming X-Request-Id header when provided", () => {
    const req = {
      headers: {
        "x-request-id": "client-request-id",
      },
      ip: "::1",
      method: "GET",
      originalUrl: "/health",
    };
    const res = createMockResponse();
    const next = jest.fn();

    requestLogger(req, res, next);
    res.finish();

    expect(req.requestId).toBe("client-request-id");
    expect(res.headers["X-Request-Id"]).toBe("client-request-id");
    expect(next).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("[requestId=client-request-id]")
    );
  });

  it("generates a request ID when no X-Request-Id header is provided", () => {
    const req = {
      headers: {},
      ip: "::1",
      method: "GET",
      originalUrl: "/ready",
    };
    const res = createMockResponse();
    const next = jest.fn();

    requestLogger(req, res, next);
    res.finish();

    expect(req.requestId).toBeDefined();
    expect(res.headers["X-Request-Id"]).toBe(req.requestId);
    expect(next).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining(`[requestId=${req.requestId}]`)
    );
  });
});
