const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const jwt = require("jsonwebtoken");
const Invoice = require("../models/invoice");
const DailyReport = require("../models/dailyReport");

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
    await DailyReport.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
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

  describe("Status breakdown", () => {
    it("GET /reports/status-breakdown returns count, amount and percentage by status", async () => {
      await Invoice.create([
        {
          customerName: "Open Invoice",
          amount: 100,
          status: "OPEN",
        },
        {
          customerName: "Paid Invoice One",
          amount: 200,
          status: "PAID",
        },
        {
          customerName: "Paid Invoice Two",
          amount: 300,
          status: "PAID",
        },
        {
          customerName: "Cancelled Invoice",
          amount: 50,
          status: "CANCELLED",
        },
      ]);

      const res = await request(app)
        .get("/reports/status-breakdown")
        .set("Authorization", `Bearer ${createTestToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalInvoices: 4,
        statuses: [
          {
            status: "OPEN",
            count: 1,
            totalAmount: 100,
            percentage: 25,
          },
          {
            status: "PAID",
            count: 2,
            totalAmount: 500,
            percentage: 50,
          },
          {
            status: "CANCELLED",
            count: 1,
            totalAmount: 50,
            percentage: 25,
          },
        ],
      });
    });

    it("GET /reports/status-breakdown returns zero values for missing statuses", async () => {
      await Invoice.create([
        {
          customerName: "Paid Invoice",
          amount: 250,
          status: "PAID",
        },
      ]);

      const res = await request(app)
        .get("/reports/status-breakdown")
        .set("Authorization", `Bearer ${createTestToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalInvoices: 1,
        statuses: [
          {
            status: "OPEN",
            count: 0,
            totalAmount: 0,
            percentage: 0,
          },
          {
            status: "PAID",
            count: 1,
            totalAmount: 250,
            percentage: 100,
          },
          {
            status: "CANCELLED",
            count: 0,
            totalAmount: 0,
            percentage: 0,
          },
        ],
      });
    });

    it("GET /reports/status-breakdown returns zero breakdown when no invoices exist", async () => {
      const res = await request(app)
        .get("/reports/status-breakdown")
        .set("Authorization", `Bearer ${createTestToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalInvoices: 0,
        statuses: [
          {
            status: "OPEN",
            count: 0,
            totalAmount: 0,
            percentage: 0,
          },
          {
            status: "PAID",
            count: 0,
            totalAmount: 0,
            percentage: 0,
          },
          {
            status: "CANCELLED",
            count: 0,
            totalAmount: 0,
            percentage: 0,
          },
        ],
      });
    });
  });

  describe("Summary by range", () => {
    it("GET /reports/summary-by-range returns summary for invoices inside the date range", async () => {
      await Invoice.create([
        {
          customerName: "Inside Range Open",
          amount: 100,
          status: "OPEN",
          createdAt: new Date("2026-06-10T10:00:00.000Z"),
        },
        {
          customerName: "Inside Range Paid",
          amount: 200,
          status: "PAID",
          createdAt: new Date("2026-06-11T10:00:00.000Z"),
        },
        {
          customerName: "Outside Range",
          amount: 500,
          status: "CANCELLED",
          createdAt: new Date("2026-06-20T10:00:00.000Z"),
        },
      ]);

      const res = await request(app)
        .get("/reports/summary-by-range?from=2026-06-10&to=2026-06-11")
        .set("Authorization", `Bearer ${createTestToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        from: "2026-06-10",
        to: "2026-06-11",
        totalInvoices: 2,
        totalRevenue: 300,
        openInvoices: 1,
        paidInvoices: 1,
        cancelledInvoices: 0,
      });
    });

    it("GET /reports/summary-by-range returns zero values when no invoices match", async () => {
      await Invoice.create([
        {
          customerName: "Outside Range",
          amount: 150,
          status: "PAID",
          createdAt: new Date("2026-05-01T10:00:00.000Z"),
        },
      ]);

      const res = await request(app)
        .get("/reports/summary-by-range?from=2026-06-01&to=2026-06-30")
        .set("Authorization", `Bearer ${createTestToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        from: "2026-06-01",
        to: "2026-06-30",
        totalInvoices: 0,
        totalRevenue: 0,
        openInvoices: 0,
        paidInvoices: 0,
        cancelledInvoices: 0,
      });
    });

    it("GET /reports/summary-by-range rejects missing date parameters", async () => {
      const res = await request(app)
        .get("/reports/summary-by-range?from=2026-06-01")
        .set("Authorization", `Bearer ${createTestToken()}`);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: "from and to must be provided in YYYY-MM-DD format",
      });
    });

    it("GET /reports/summary-by-range rejects invalid date ranges", async () => {
      const res = await request(app)
        .get("/reports/summary-by-range?from=2026-06-30&to=2026-06-01")
        .set("Authorization", `Bearer ${createTestToken()}`);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: "from must be before or equal to to",
      });
    });
  });

    describe("Shipping status breakdown", () => {
    it("GET /reports/shipping-status-breakdown returns count, amount and percentage by shipping status", async () => {
      await Invoice.create([
        {
          customerName: "Not Shipped Invoice",
          amount: 100,
          status: "PAID",
          shippingStatus: "NOT_SHIPPED",
        },
        {
          customerName: "Shipped Invoice",
          amount: 200,
          status: "PAID",
          shippingStatus: "SHIPPED",
        },
        {
          customerName: "In Transit Invoice",
          amount: 300,
          status: "OPEN",
          shippingStatus: "IN_TRANSIT",
        },
        {
          customerName: "Delivered Invoice",
          amount: 400,
          status: "PAID",
          shippingStatus: "DELIVERED",
        },
      ]);

      const res = await request(app)
        .get("/reports/shipping-status-breakdown")
        .set("Authorization", `Bearer ${createTestToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalInvoices: 4,
        shippingStatuses: [
          {
            shippingStatus: "NOT_SHIPPED",
            count: 1,
            totalAmount: 100,
            percentage: 25,
          },
          {
            shippingStatus: "SHIPPED",
            count: 1,
            totalAmount: 200,
            percentage: 25,
          },
          {
            shippingStatus: "IN_TRANSIT",
            count: 1,
            totalAmount: 300,
            percentage: 25,
          },
          {
            shippingStatus: "DELIVERED",
            count: 1,
            totalAmount: 400,
            percentage: 25,
          },
        ],
      });
    });

    it("GET /reports/shipping-status-breakdown treats invoices without shippingStatus as NOT_SHIPPED", async () => {
      await Invoice.collection.insertOne({
        customerName: "Legacy Invoice",
        amount: 150,
        status: "OPEN",
        createdAt: new Date(),
      });

      const res = await request(app)
        .get("/reports/shipping-status-breakdown")
        .set("Authorization", `Bearer ${createTestToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalInvoices: 1,
        shippingStatuses: [
          {
            shippingStatus: "NOT_SHIPPED",
            count: 1,
            totalAmount: 150,
            percentage: 100,
          },
          {
            shippingStatus: "SHIPPED",
            count: 0,
            totalAmount: 0,
            percentage: 0,
          },
          {
            shippingStatus: "IN_TRANSIT",
            count: 0,
            totalAmount: 0,
            percentage: 0,
          },
          {
            shippingStatus: "DELIVERED",
            count: 0,
            totalAmount: 0,
            percentage: 0,
          },
        ],
      });
    });

    it("GET /reports/shipping-status-breakdown returns zero breakdown when no invoices exist", async () => {
      const res = await request(app)
        .get("/reports/shipping-status-breakdown")
        .set("Authorization", `Bearer ${createTestToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalInvoices: 0,
        shippingStatuses: [
          {
            shippingStatus: "NOT_SHIPPED",
            count: 0,
            totalAmount: 0,
            percentage: 0,
          },
          {
            shippingStatus: "SHIPPED",
            count: 0,
            totalAmount: 0,
            percentage: 0,
          },
          {
            shippingStatus: "IN_TRANSIT",
            count: 0,
            totalAmount: 0,
            percentage: 0,
          },
          {
            shippingStatus: "DELIVERED",
            count: 0,
            totalAmount: 0,
            percentage: 0,
          },
        ],
      });
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
  describe("Daily summary snapshots", () => {
  it("POST /reports/daily-summaries creates or updates the daily summary snapshot", async () => {
    await Invoice.create([
      {
        customerName: "Open Invoice",
        amount: 100,
        status: "OPEN",
      },
      {
        customerName: "Paid Invoice",
        amount: 250,
        status: "PAID",
      },
      {
        customerName: "Cancelled Invoice",
        amount: 50,
        status: "CANCELLED",
      },
    ]);

    const res = await request(app)
      .post("/reports/daily-summaries")
      .set("Authorization", `Bearer ${createTestToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      date: expect.any(String),
      totalInvoices: 3,
      totalRevenue: 400,
      openInvoices: 1,
      paidInvoices: 1,
      cancelledInvoices: 1,
    });

    const savedReport = await DailyReport.findOne({ date: res.body.date });

    expect(savedReport).not.toBeNull();
    expect(savedReport.totalInvoices).toBe(3);
    expect(savedReport.totalRevenue).toBe(400);
    expect(savedReport.openInvoices).toBe(1);
    expect(savedReport.paidInvoices).toBe(1);
    expect(savedReport.cancelledInvoices).toBe(1);
  });
});
});
