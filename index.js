const path = require("path");

// je nach Umgebung die richtige .env-Datei laden
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

require("dotenv").config({
  path: path.resolve(__dirname, envFile),
});

const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");

const reportRoutes = require("./routes/reportRoutes");
const reportController = require("./controllers/reportController");

const app = express();

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

// JSON-Body parsen
app.use(express.json());

// Health-Route
app.get("/", (req, res) => {
  res.send("Reporting Service API läuft 🚀");
});

// Reporting-Routen
app.use("/reports", reportRoutes);

// Cron-Job NUR im normalen Modus (nicht bei Tests)
if (process.env.NODE_ENV !== "test") {
  cron.schedule("0 1 * * *", async () => {
    try {
      console.log(
        "📊 Täglicher Reporting-Job gestartet:",
        new Date().toISOString()
      );

      // tägliche Summary speichern
      const summary = await reportController.saveDailySummary();
      console.log("✅ Daily Summary gespeichert:", summary);
    } catch (err) {
      console.error("❌ Fehler im Reporting-Job:", err.message);
    }
  });
}

// Mit MongoDB verbinden und Server starten
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Mit MongoDB verbunden (Reporting Service)");

    // Server nur starten, wenn wir NICHT im Test-Modus sind
    if (process.env.NODE_ENV !== "test") {
      app.listen(PORT, () => {
        console.log(`Reporting Service läuft auf http://localhost:${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error("Konnte nicht mit MongoDB verbinden:", err.message);
    process.exit(1);
  });

// wichtig für Supertest
module.exports = app;
