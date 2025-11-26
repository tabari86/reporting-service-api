const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const Invoice = require("../models/invoice");

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
    const res = await request(app).get("/reports/daily-report.pdf");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("application/pdf");
    // Body sollte nicht leer sein
    expect(res.body.length).toBeGreaterThan(0);
  });
});
