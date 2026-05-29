const express = require("express");
const router = express.Router();

const reportController = require("../controllers/reportController");

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Reporting and analytics endpoints for invoice data
 */

/**
 * @swagger
 * /reports/summary:
 *   get:
 *     summary: Get invoice summary
 *     description: Returns total invoices, total revenue and invoice status distribution.
 *     tags: [Reports]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Invoice summary returned successfully
 *       401:
 *         description: Missing or invalid authentication
 *       500:
 *         description: Internal server error
 */
router.get("/summary", reportController.getSummary);

/**
 * @swagger
 * /reports/revenue-per-day:
 *   get:
 *     summary: Get revenue per day
 *     description: Returns daily revenue grouped by invoice creation date.
 *     tags: [Reports]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue per day returned successfully
 *       401:
 *         description: Missing or invalid authentication
 *       500:
 *         description: Internal server error
 */
router.get("/revenue-per-day", reportController.getRevenuePerDay);

/**
 * @swagger
 * /reports/daily-report.pdf:
 *   get:
 *     summary: Download daily report as PDF
 *     description: Generates and returns a daily invoice report as a PDF file.
 *     tags: [Reports]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: PDF report generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Missing or invalid authentication
 *       500:
 *         description: Internal server error
 */
router.get("/daily-report.pdf", reportController.getDailyReportPdf);

module.exports = router;