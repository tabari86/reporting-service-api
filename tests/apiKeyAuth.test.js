const apiKeyAuth = require("../middleware/apiKeyAuth");

describe("apiKeyAuth Middleware", () => {
  it("soll 401 liefern, wenn kein API-Key gesetzt ist", () => {
    const req = { headers: {} };
    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
      },
    };
    const next = jest.fn();

    apiKeyAuth(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: "Ungültiger oder fehlender API-Key" });
    expect(next).not.toHaveBeenCalled();
  });

  it("soll next() aufrufen, wenn API-Key korrekt ist", () => {
    process.env.API_KEY = "test-key";

    const req = {
      headers: {
        "x-api-key": "test-key",
      },
    };
    const res = {};
    const next = jest.fn();

    apiKeyAuth(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
