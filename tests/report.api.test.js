const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const Invoice = require("../models/invoice");

describe("Reporting Service API", () => {
  // vor jedem Test: Test-Datenbank leeren
  beforeEach(async () => {
    await Invoice.deleteMany({});
  });

  // nach allen Tests: Verbindung schließen
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("GET /reports/summary liefert korrekte Aggregation", async () => {
    // Test-Daten anlegen
    await Invoice.create([
      { customerName: "Kunde A", amount: 100, status: "OPEN" },
      { customerName: "Kunde B", amount: 200, status: "PAID" },
      { customerName: "Kunde C", amount: 50, status: "CANCELLED" },
    ]);

    const res = await request(app).get("/reports/summary");

    expect(res.status).toBe(200);
    expect(res.body.totalInvoices).toBe(3);
    expect(res.body.totalRevenue).toBe(350); // 100 + 200 + 50
    expect(res.body.openInvoices).toBe(1);
    expect(res.body.paidInvoices).toBe(1);
    expect(res.body.cancelledInvoices).toBe(1);
  });

  it("GET /reports/revenue-per-day liefert Umsatz je Tag", async () => {
    const today = new Date();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

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

    const res = await request(app).get("/reports/revenue-per-day");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);

    // einfache Struktur-Checks
    expect(res.body[0]).toHaveProperty("date");
    expect(res.body[0]).toHaveProperty("totalRevenue");
    expect(res.body[0]).toHaveProperty("invoiceCount");
  });
});
