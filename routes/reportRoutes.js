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
 * /reports/summary-by-range:
 *   get:
 *     summary: Get invoice summary by date range
 *     description: Returns invoice summary statistics for a specific date range.
 *     tags: [Reports]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           example: 2026-06-01
 *         description: Start date in YYYY-MM-DD format.
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           example: 2026-06-30
 *         description: End date in YYYY-MM-DD format.
 *     responses:
 *       200:
 *         description: Date range summary returned successfully
 *       400:
 *         description: Missing or invalid date range
 *       401:
 *         description: Missing or invalid authentication
 *       500:
 *         description: Internal server error
 */
router.get("/summary-by-range", reportController.getSummaryByRange);

/**
 * @swagger
 * /reports/status-breakdown:
 *   get:
 *     summary: Get invoice status breakdown
 *     description: Returns invoice counts, amounts and percentages grouped by invoice status.
 *     tags: [Reports]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Status breakdown returned successfully
 *       401:
 *         description: Missing or invalid authentication
 *       500:
 *         description: Internal server error
 */
router.get("/status-breakdown", reportController.getStatusBreakdown);

/**
 * @swagger
 * /reports/shipping-status-breakdown:
 *   get:
 *     summary: Get shipping status breakdown
 *     description: Returns invoice counts, amounts and percentages grouped by shipping status.
 *     tags: [Reports]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Shipping status breakdown returned successfully
 *       401:
 *         description: Missing or invalid authentication
 *       500:
 *         description: Internal server error
 */
router.get(
  "/shipping-status-breakdown",
  reportController.getShippingStatusBreakdown
);

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
 * /reports/daily-summaries:
 *   post:
 *     summary: Create or update daily summary snapshot
 *     description: Manually calculates the current invoice summary and stores it as the daily summary snapshot for today.
 *     tags: [Reports]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Daily summary snapshot created or updated successfully
 *       401:
 *         description: Missing or invalid authentication
 *       500:
 *         description: Internal server error
 */
router.post("/daily-summaries", reportController.createDailySummary);

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