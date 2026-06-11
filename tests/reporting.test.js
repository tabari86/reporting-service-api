const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");

async function waitForMongoConnection(timeoutMs = 5000) {
  const startTime = Date.now();

  while (mongoose.connection.readyState !== 1) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error("MongoDB connection timeout");
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

describe("Reporting Service – Basic Monitoring Endpoints", () => {
  beforeAll(async () => {
    await waitForMongoConnection();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("GET / returns a basic service response", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.text).toContain("Reporting Service API");
  });

  it("GET /health returns service health information", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "ok",
      service: "reporting-service-api",
    });

    expect(res.body).toHaveProperty("time");
    expect(res.body).toHaveProperty("uptimeSeconds");
  });

  it("GET /ready returns dependency readiness information", async () => {
    const res = await request(app).get("/ready");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "ready",
      service: "reporting-service-api",
      dependencies: {
        mongodb: "connected",
        redis: "not_configured",
      },
    });

    expect(res.body).toHaveProperty("time");
  });

  it("GET /metrics returns runtime metrics", async () => {
    const res = await request(app).get("/metrics");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      service: "reporting-service-api",
      nodeEnv: "test",
    });

    expect(res.body).toHaveProperty("uptimeSeconds");
    expect(res.body).toHaveProperty("rss");
    expect(res.body).toHaveProperty("heapTotal");
    expect(res.body).toHaveProperty("heapUsed");
    expect(res.body).toHaveProperty("external");
  });
});