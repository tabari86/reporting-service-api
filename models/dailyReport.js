const mongoose = require("mongoose");

const dailyReportSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // z.B. "2025-11-19"
    totalInvoices: Number,
    totalRevenue: Number,
    openInvoices: Number,
    paidInvoices: Number,
    cancelledInvoices: Number,
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: "daily_reports",
    versionKey: false,
  }
);

module.exports = mongoose.model("DailyReport", dailyReportSchema);
