const Invoice = require("../models/invoice");

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

// Diese Funktion nutzen wir später eventuell im Cron-Job wieder
exports.calculateSummary = calculateSummary;
