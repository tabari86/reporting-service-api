const express = require("express");
const router = express.Router();

const reportController = require("../controllers/reportController");

// Gesamtübersicht: Anzahl Rechnungen, Umsatz, Status-Verteilung
router.get("/summary", reportController.getSummary);

// Umsatz pro Tag
router.get("/revenue-per-day", reportController.getRevenuePerDay);

// Daily-Report als PDF
router.get("/daily-report.pdf", reportController.getDailyReportPdf);

module.exports = router;
