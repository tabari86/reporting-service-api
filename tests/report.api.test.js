const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const jwt = require("jsonwebtoken");
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

describe("Reporting Service API", () => {
  beforeEach(async () => {
    await Invoice.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("Authentication and authorization", () => {
    it("GET /reports/summary rejects requests without JWT", async () => {
      const res = await request(app).get("/reports/summary");

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message");
    });

    it("GET /reports/summary rejects requests with invalid JWT", async () => {
      const res = await request(app)
        .get("/reports/summary")
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message");
    });

    it("GET /reports/summary rejects users with insufficient role", async () => {
      const res = await request(app)
        .get("/reports/summary")
        .set("Authorization", `Bearer ${createTestToken("viewer")}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("message");
    });

    it("GET /reports/summary allows users with report_reader role", async () => {
      const res = await request(app)
        .get("/reports/summary")
        .set("Authorization", `Bearer ${createTestToken("report_reader")}`);

      expect(res.status).toBe(200);
    });

    it("GET /reports/summary allows users with admin role", async () => {
      const res = await request(app)
        .get("/reports/summary")
        .set("Authorization", `Bearer ${createTestToken("admin")}`);

      expect(res.status).toBe(200);
    });
  });

  describe("Report summary", () => {
    it("GET /reports/summary returns zero values when no invoices exist", async () => {
      const res = await request(app)
        .get("/reports/summary")
        .set("Authorization", `Bearer ${createTestToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalInvoices: 0,
        totalRevenue: 0,
        openInvoices: 0,
        paidInvoices: 0,
        cancelledInvoices: 0,
      });
    });

    it("GET /reports/summary returns correct invoice aggregation", async () => {
      await Invoice.create([
        { customerName: "Kunde A", amount: 100, status: "OPEN" },
        { customerName: "Kunde B", amount: 200, status: "PAID" },
        { customerName: "Kunde C", amount: 50, status: "CANCELLED" },
      ]);

      const res = await request(app)
        .get("/reports/summary")
        .set("Authorization", `Bearer ${createTestToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.totalInvoices).toBe(3);
      expect(res.body.totalRevenue).toBe(350);
      expect(res.body.openInvoices).toBe(1);
      expect(res.body.paidInvoices).toBe(1);
      expect(res.body.cancelledInvoices).toBe(1);
    });
  });

  describe("Revenue per day", () => {
    it("GET /reports/revenue-per-day returns an empty array when no invoices exist", async () => {
      const res = await request(app)
        .get("/reports/revenue-per-day")
        .set("Authorization", `Bearer ${createTestToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("GET /reports/revenue-per-day returns revenue grouped by day", async () => {
      const today = new Date("2026-06-10T10:00:00.000Z");
      const yesterday = new Date("2026-06-09T10:00:00.000Z");

      await Invoice.create([
        {
          customerName: "Heute 1",
          amount: 100,
          status: "OPEN",
          createdAt: today,
        },
        {
          customerName: "Heute 2",
          amount: 200,
          status: "PAID",
          createdAt: today,
        },
        {
          customerName: "Gestern",
          amount: 50,
          status: "OPEN",
          createdAt: yesterday,
        },
      ]);

      const res = await request(app)
        .get("/reports/revenue-per-day")
        .set("Authorization", `Bearer ${createTestToken()}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toEqual([
        {
          date: "2026-06-09",
          totalRevenue: 50,
          invoiceCount: 1,
        },
        {
          date: "2026-06-10",
          totalRevenue: 300,
          invoiceCount: 2,
        },
      ]);
    });
  });
});