const Invoice = require("../models/invoice");
const DailyReport = require("../models/dailyReport");
const { generateDailyReportPdf } = require("../services/pdfService");
const cacheService = require("../services/cacheService");
const INVOICE_STATUSES = ["OPEN", "PAID", "CANCELLED"];
const SHIPPING_STATUSES = ["NOT_SHIPPED", "SHIPPED", "IN_TRANSIT", "DELIVERED"];
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

function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

async function calculateSummaryByRange(fromDate, toDateExclusive) {
  const result = await Invoice.aggregate([
    {
      $match: {
        createdAt: {
          $gte: fromDate,
          $lt: toDateExclusive,
        },
      },
    },
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

async function calculateStatusBreakdown() {
  const result = await Invoice.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const statusMap = new Map(
    result.map((row) => [
      row._id,
      {
        count: row.count || 0,
        totalAmount: row.totalAmount || 0,
      },
    ]),
  );

  const totalInvoices = result.reduce((sum, row) => sum + (row.count || 0), 0);

  const statuses = INVOICE_STATUSES.map((status) => {
    const current = statusMap.get(status) || {
      count: 0,
      totalAmount: 0,
    };

    return {
      status,
      count: current.count,
      totalAmount: current.totalAmount,
      percentage:
        totalInvoices === 0
          ? 0
          : Number(((current.count / totalInvoices) * 100).toFixed(2)),
    };
  });

  return {
    totalInvoices,
    statuses,
  };
}

async function calculateShippingStatusBreakdown() {
  const result = await Invoice.aggregate([
    {
      $group: {
        _id: { $ifNull: ["$shippingStatus", "NOT_SHIPPED"] },
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const statusMap = new Map(
    result.map((row) => [
      row._id,
      {
        count: row.count || 0,
        totalAmount: row.totalAmount || 0,
      },
    ]),
  );

  const totalInvoices = result.reduce((sum, row) => sum + (row.count || 0), 0);

  const shippingStatuses = SHIPPING_STATUSES.map((shippingStatus) => {
    const current = statusMap.get(shippingStatus) || {
      count: 0,
      totalAmount: 0,
    };

    return {
      shippingStatus,
      count: current.count,
      totalAmount: current.totalAmount,
      percentage:
        totalInvoices === 0
          ? 0
          : Number(((current.count / totalInvoices) * 100).toFixed(2)),
    };
  });

  return {
    totalInvoices,
    shippingStatuses,
  };
}

// GET /reports/summary (mit Redis-Cache)

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

// GET /reports/revenue-per-day
exports.getRevenuePerDay = async (req, res) => {
  const cacheKey = "reports:revenue-per-day";

  try {
    // 1) Cache versuchen
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      return res.json(data);
    }
  } catch (err) {
    console.warn("Konnte Revenue-per-Day nicht aus Cache lesen:", err.message);
  }

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

    // 2) Im Cache speichern
    try {
      await cacheService.set(cacheKey, JSON.stringify(revenuePerDay), 60);
    } catch (err) {
      console.warn(
        "Konnte Revenue-per-Day nicht in Cache speichern:",
        err.message,
      );
    }

    // 3) Response
    res.json(revenuePerDay);
  } catch (err) {
    console.error("Fehler bei getRevenuePerDay:", err);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};

// GET /reports/summary-by-range?from=YYYY-MM-DD&to=YYYY-MM-DD
exports.getSummaryByRange = async (req, res) => {
  const { from, to } = req.query;

  if (!isValidDateString(from) || !isValidDateString(to)) {
    return res.status(400).json({
      message: "from and to must be provided in YYYY-MM-DD format",
    });
  }

  const fromDate = new Date(`${from}T00:00:00.000Z`);
  const toDate = new Date(`${to}T00:00:00.000Z`);

  if (fromDate > toDate) {
    return res.status(400).json({
      message: "from must be before or equal to to",
    });
  }

  const toDateExclusive = new Date(toDate);
  toDateExclusive.setUTCDate(toDateExclusive.getUTCDate() + 1);

  try {
    const summary = await calculateSummaryByRange(fromDate, toDateExclusive);

    res.json({
      from,
      to,
      ...summary,
    });
  } catch (err) {
    console.error("Fehler bei getSummaryByRange:", err);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};

exports.getStatusBreakdown = async (req, res) => {
  try {
    const breakdown = await calculateStatusBreakdown();

    res.json(breakdown);
  } catch (err) {
    console.error("Fehler bei getStatusBreakdown:", err);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};

exports.getShippingStatusBreakdown = async (req, res) => {
  try {
    const breakdown = await calculateShippingStatusBreakdown();

    res.json(breakdown);
  } catch (err) {
    console.error("Fehler bei getShippingStatusBreakdown:", err);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};

// Optionaler Export, falls Summary an anderen Stellen genutzt wird
exports.calculateSummary = calculateSummary;

// Diese Funktion wird vom Cron-Job und vom manuellen Endpoint genutzt
async function saveDailySummary() {
  const summary = await calculateSummary();

  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  const dailySummary = {
    date: today,
    totalInvoices: summary.totalInvoices,
    totalRevenue: summary.totalRevenue,
    openInvoices: summary.openInvoices,
    paidInvoices: summary.paidInvoices,
    cancelledInvoices: summary.cancelledInvoices,
  };

  await DailyReport.findOneAndUpdate(
    { date: today },
    dailySummary,
    { upsert: true }
  );

  return dailySummary;
}

exports.saveDailySummary = saveDailySummary;

exports.createDailySummary = async (req, res) => {
  try {
    const dailySummary = await saveDailySummary();

    res.json(dailySummary);
  } catch (err) {
    console.error("Fehler bei createDailySummary:", err);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
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
