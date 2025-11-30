const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../index");
const Invoice = require("../models/invoice");

// Helper: Test-JWT erzeugen
const TEST_JWT_SECRET = process.env.JWT_SECRET || "test-reporting-jwt-secret";

function createTestToken(role = "report_reader") {
  return jwt.sign(
    {
      sub: "test-user",
      role,
    },
    TEST_JWT_SECRET,
    { expiresIn: "1h" }
  );
}

describe("Reporting Service – PDF Daily Report", () => {
  beforeEach(async () => {
    await Invoice.deleteMany({});

    await Invoice.create([
      { customerName: "PDF Kunde 1", amount: 100, status: "PAID" },
      { customerName: "PDF Kunde 2", amount: 200, status: "OPEN" },
    ]);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("GET /reports/daily-report.pdf liefert ein PDF", async () => {
    const res = await request(app)
      .get("/reports/daily-report.pdf")
      .set("Authorization", `Bearer ${createTestToken()}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("application/pdf");
    // Body sollte nicht leer sein
    expect(res.body.length).toBeGreaterThan(0);
  });
});
