const Invoice = require("../models/invoice");
const DailyReport = require("../models/dailyReport");
const { generateDailyReportPdf } = require("../services/pdfService");
const cacheService = require("../services/cacheService");

// --------------------------------------
// Aggregation für Summary (Hilfsfunktion)
// --------------------------------------
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

// --------------------------------------
// GET /reports/summary (mit Redis-Cache)
// --------------------------------------
exports.getSummary = async (req, res) => {
  const cacheKey = "reports:summary";

  // 1) Cache versuchen
  try {
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      const summary = JSON.parse(cached);
      return res.json(summary);
    }
  } catch (err) {
    console.warn("Konnte Summary nicht aus Cache lesen:", err.message);
    // weiter ohne Cache
  }

  // 2) Neu berechnen
  try {
    const summary = await calculateSummary();

    // 3) Ergebnis in Redis speichern (z.B. 60 Sekunden)
    try {
      await cacheService.set(cacheKey, JSON.stringify(summary), 60);
    } catch (err) {
      console.warn("Konnte Summary nicht in Cache speichern:", err.message);
    }

    // 4) Response im alten Format, wie Tests es erwarten
    res.json(summary);
  } catch (err) {
    console.error("Fehler bei getSummary:", err);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};

// -------------------------------------------------
// GET /reports/revenue-per-day (mit Redis-Cache)
// -------------------------------------------------
exports.getRevenuePerDay = async (req, res) => {
  const cacheKey = "reports:revenue-per-day";

  // 1) Cache versuchen
  try {
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      return res.json(data);
    }
  } catch (err) {
    console.warn("Konnte Revenue-per-Day nicht aus Cache lesen:", err.message);
  }

  // 2) Aggregation aus MongoDB
  try {
    const result = await Invoice.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalRevenue: { $sum: "$amount" },
          invoiceCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const revenuePerDay = result.map((row) => ({
      date: row._id,
      totalRevenue: row.totalRevenue,
      invoiceCount: row.invoiceCount,
    }));

    // 3) Im Cache speichern (60 Sekunden)
    try {
      await cacheService.set(cacheKey, JSON.stringify(revenuePerDay), 60);
    } catch (err) {
      console.warn(
        "Konnte Revenue-per-Day nicht in Cache speichern:",
        err.message
      );
    }

    // 4) Response im alten Format, wie Tests es erwarten
    res.json(revenuePerDay);
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
