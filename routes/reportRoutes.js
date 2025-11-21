const express = require("express");
const router = express.Router();

const reportController = require("../controllers/reportController");

// Gesamtübersicht: Anzahl Rechnungen, Umsatz, Status-Verteilung
router.get("/summary", reportController.getSummary);

// Umsatz pro Tag
router.get("/revenue-per-day", reportController.getRevenuePerDay);

module.exports = router;
