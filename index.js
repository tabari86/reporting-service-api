const path = require("path");

// je nach Umgebung die richtige .env-Datei laden
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

require("dotenv").config({
  path: path.resolve(__dirname, envFile),
});

const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");
const logger = require("./utils/logger");
const requestLogger = require("./middleware/requestLogger");
const reportRoutes = require("./routes/reportRoutes");
const reportController = require("./controllers/reportController");
const { sendTestEmail } = require("./services/mailService");
const setupSwagger = require("./swagger/reportingSwagger");
const apiKeyAuth = require("./middleware/apiKeyAuth");
const jwtAuth = require("./middleware/jwtAuth");
const requireRole = require("./middleware/requireRole");

const app = express();

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

// JSON-Body parsen
app.use(express.json());

// API-Key-Schutz aktivieren (außer Test)
if (process.env.NODE_ENV !== "test") {
  app.use(apiKeyAuth);
}

// HTTP-Request-Logging
app.use(requestLogger);

// Health-Check – einfacher Status
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "reporting-service-api",
    time: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
  });
});

// Swagger/OpenAPI (nur außerhalb von Tests)
if (process.env.NODE_ENV !== "test") {
  setupSwagger(app);
}

// Einfache Metriken
app.get("/metrics", (req, res) => {
  const memory = process.memoryUsage();

  res.json({
    service: "reporting-service-api",
    uptimeSeconds: process.uptime(),
    rss: memory.rss,
    heapTotal: memory.heapTotal,
    heapUsed: memory.heapUsed,
    external: memory.external,
    nodeEnv: process.env.NODE_ENV || "development",
  });
});

// Monitoring: Test-E-Mail über Mailtrap
app.get("/monitoring/email-test", async (req, res) => {
  try {
    await sendTestEmail();
    res.json({
      message:
        "Test-E-Mail wurde (sofern Mailtrap konfiguriert ist) versendet.",
    });
  } catch (err) {
    console.error("Fehler beim Senden der Test-E-Mail:", err.message);
    res
      .status(500)
      .json({ message: "Test-E-Mail konnte nicht gesendet werden." });
  }
});

// Health-Route
app.get("/", (req, res) => {
  res.send("Reporting Service API läuft ");
});

// Reporting-Routen – geschützt mit JWT + Rollen
// Erlaubte Rollen: "report_reader" und "admin"
app.use(
  "/reports",
  jwtAuth,
  requireRole("report_reader", "admin"),
  reportRoutes
);

// Cron-Job NUR im normalen Modus (nicht bei Tests)
if (process.env.NODE_ENV !== "test") {
  cron.schedule("0 1 * * *", async () => {
    try {
      console.log(
        "Täglicher Reporting-Job gestartet:",
        new Date().toISOString()
      );

      // tägliche Summary speichern
      const summary = await reportController.saveDailySummary();
      console.log(" Daily Summary gespeichert:", summary);
    } catch (err) {
      console.error(" Fehler im Reporting-Job:", err.message);
    }
  });
}

// Mit MongoDB verbinden und Server starten
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info("✅ Mit MongoDB verbunden (Reporting Service)");

    if (process.env.NODE_ENV !== "test") {
      app.listen(PORT, () => {
        logger.info(`Reporting Service läuft auf http://localhost:${PORT}`);
      });
    }
  })
  .catch((err) => {
    logger.error(
      `Fehler bei Mongo-Verbindung (Reporting Service): ${err.message}`
    );
    process.exit(1);
  });

// wichtig für Supertest
module.exports = app;
