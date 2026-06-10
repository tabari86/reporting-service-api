const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../index");
const Invoice = require("../models/invoice");

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
});

afterAll(async () => {
await mongoose.connection.close();
});

describe("Authentication and authorization", () => {
it("GET /reports/daily-report.pdf rejects requests without JWT", async () => {
const res = await request(app).get("/reports/daily-report.pdf");

  expect(res.status).toBe(401);
  expect(res.body).toHaveProperty("message");
});

it("GET /reports/daily-report.pdf rejects requests with invalid JWT", async () => {
  const res = await request(app)
    .get("/reports/daily-report.pdf")
    .set("Authorization", "Bearer invalid-token");

  expect(res.status).toBe(401);
  expect(res.body).toHaveProperty("message");
});

it("GET /reports/daily-report.pdf rejects users with insufficient role", async () => {
  const res = await request(app)
    .get("/reports/daily-report.pdf")
    .set("Authorization", `Bearer ${createTestToken("viewer")}`);

  expect(res.status).toBe(403);
  expect(res.body).toHaveProperty("message");
});

});

describe("PDF generation", () => {
it("GET /reports/daily-report.pdf returns a PDF for report_reader role", async () => {
await Invoice.create([
{ customerName: "PDF Kunde 1", amount: 100, status: "PAID" },
{ customerName: "PDF Kunde 2", amount: 200, status: "OPEN" },
]);

  const res = await request(app)
    .get("/reports/daily-report.pdf")
    .set("Authorization", `Bearer ${createTestToken("report_reader")}`);

  expect(res.status).toBe(200);
  expect(res.headers["content-type"]).toMatch(/application\/pdf/);
  expect(res.body.length).toBeGreaterThan(0);
});

it("GET /reports/daily-report.pdf returns a PDF for admin role", async () => {
  await Invoice.create([
    { customerName: "Admin PDF Kunde", amount: 150, status: "PAID" },
  ]);

  const res = await request(app)
    .get("/reports/daily-report.pdf")
    .set("Authorization", `Bearer ${createTestToken("admin")}`);

  expect(res.status).toBe(200);
  expect(res.headers["content-type"]).toMatch(/application\/pdf/);
  expect(res.body.length).toBeGreaterThan(0);
});

it("GET /reports/daily-report.pdf returns a PDF even when no invoices exist", async () => {
  const res = await request(app)
    .get("/reports/daily-report.pdf")
    .set("Authorization", `Bearer ${createTestToken("report_reader")}`);

  expect(res.status).toBe(200);
  expect(res.headers["content-type"]).toMatch(/application\/pdf/);
  expect(res.body.length).toBeGreaterThan(0);
});

});
});