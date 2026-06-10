const apiKeyAuth = require("../middleware/apiKeyAuth");

function createMockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

describe("apiKeyAuth Middleware", () => {
  const originalApiKey = process.env.API_KEY;

  afterEach(() => {
    if (originalApiKey === undefined) {
      delete process.env.API_KEY;
    } else {
      process.env.API_KEY = originalApiKey;
    }

    jest.clearAllMocks();
  });

  it("returns 401 when no API key is provided", () => {
    process.env.API_KEY = "test-key";

    const req = { headers: {} };
    const res = createMockResponse();
    const next = jest.fn();

    apiKeyAuth(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({
      message: "Ungültiger oder fehlender API-Key",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when an invalid API key is provided", () => {
    process.env.API_KEY = "test-key";

    const req = {
      headers: {
        "x-api-key": "wrong-key",
      },
    };
    const res = createMockResponse();
    const next = jest.fn();

    apiKeyAuth(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({
      message: "Ungültiger oder fehlender API-Key",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() when a valid API key is provided", () => {
    process.env.API_KEY = "test-key";

    const req = {
      headers: {
        "x-api-key": "test-key",
      },
    };
    const res = createMockResponse();
    const next = jest.fn();

    apiKeyAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeNull();
  });

  it("returns 401 when server API_KEY is not configured", () => {
    delete process.env.API_KEY;

    const req = {
      headers: {
        "x-api-key": "test-key",
      },
    };
    const res = createMockResponse();
    const next = jest.fn();

    apiKeyAuth(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({
      message: "Ungültiger oder fehlender API-Key",
    });
    expect(next).not.toHaveBeenCalled();
  });
});