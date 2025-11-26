// controllers/reportController.js

const Invoice = require("../models/invoice");
const DailyReport = require("../models/dailyReport");
const { generateDailyReportPdf } = require("../services/pdfService");

// Aggregation für Summary
async function calculateSummary() {
  const result = await Invoice.aggregate([
    {
      $group: {
        _id: null,
        totalInvoices: { $sum: 1 },
        totalRevenue: { $sum: "$amount" },
        openInvoices: {
          $sum: {
            $cond: [{ $eq: ["$status", "OPEN"] }, 1, 0],
          },
        },
        paidInvoices: {
          $sum: {
            $cond: [{ $eq: ["$status", "PAID"] }, 1, 0],
          },
        },
        cancelledInvoices: {
          $sum: {
            $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0],
          },
        },
      },
    },
  ]);

  if (result.length === 0) {
    return {
      totalInvoices: 0,
      totalRevenue: 0,
      openInvoices: 0,
      paidInvoices: 0,
      cancelledInvoices: 0,
    };
  }

  const summary = result[0];

  return {
    totalInvoices: summary.totalInvoices || 0,
    totalRevenue: summary.totalRevenue || 0,
    openInvoices: summary.openInvoices || 0,
    paidInvoices: summary.paidInvoices || 0,
    cancelledInvoices: summary.cancelledInvoices || 0,
  };
}

// GET /reports/summary
exports.getSummary = async (req, res) => {
  try {
    const summary = await calculateSummary();
    res.json(summary);
  } catch (err) {
    console.error("Fehler bei getSummary:", err);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};

// GET /reports/revenue-per-day
exports.getRevenuePerDay = async (req, res) => {
  try {
    const result = await Invoice.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          totalRevenue: { $sum: "$amount" },
          invoiceCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const data = result.map((entry) => ({
      date: entry._id,
      totalRevenue: entry.totalRevenue,
      invoiceCount: entry.invoiceCount,
    }));

    res.json(data);
  } catch (err) {
    console.error("Fehler bei getRevenuePerDay:", err);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};

// Optionaler Export, falls Summary an anderen Stellen genutzt wird
exports.calculateSummary = calculateSummary;

// Diese Funktion wird vom Cron-Job genutzt
exports.saveDailySummary = async () => {
  const summary = await calculateSummary();

  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  await DailyReport.findOneAndUpdate(
    { date: today },
    {
      date: today,
      totalInvoices: summary.totalInvoices,
      totalRevenue: summary.totalRevenue,
      openInvoices: summary.openInvoices,
      paidInvoices: summary.paidInvoices,
      cancelledInvoices: summary.cancelledInvoices,
    },
    { upsert: true }
  );

  return summary;
};

// PDF-Report für den aktuellen Tag
exports.getDailyReportPdf = async (req, res) => {
  try {
    const pdfBuffer = await generateDailyReportPdf();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": 'inline; filename="daily-report.pdf"',
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error("Fehler beim Erzeugen des PDF-Reports:", err);
    res
      .status(500)
      .json({ message: "PDF-Report konnte nicht erzeugt werden." });
  }
};
