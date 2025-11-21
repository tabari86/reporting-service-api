// 1) Umgebungsvariablen laden
require("dotenv").config();

// 2) Imports
const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");
const reportRoutes = require("./routes/reportRoutes");

// 3) Express-App erstellen
const app = express();

// 4) Basis-Konfiguration
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

// 5) Middleware für JSON
app.use(express.json());

// Reporting-Routen
app.use("/reports", reportRoutes);

// 6) Health-Check-Route
app.get("/", (req, res) => {
  res.send("Reporting Service API läuft 🚀");
});

// 7) Geplanter Cron-Job (z. B. täglich um 01:00 Uhr)
// Cron-Syntax: "Minute Stunde * * *"
// "0 1 * * *" = jeden Tag um 01:00
cron.schedule("0 1 * * *", async () => {
  try {
    console.log(
      "📊 Täglicher Reporting-Job gestartet:",
      new Date().toISOString()
    );

    // TODO: Später hier MongoDB-Aggregationen einbauen,
    // z. B. Umsatz pro Tag/Kunde berechnen und in einer eigenen Collection speichern.

    console.log("✅ Täglicher Reporting-Job erfolgreich beendet");
  } catch (err) {
    console.error("❌ Fehler im Reporting-Job:", err.message);
  }
});

// 8) Mit MongoDB verbinden und Server starten
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Mit MongoDB verbunden (Reporting Service)");
    app.listen(PORT, () => {
      console.log(`Reporting Service läuft auf http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Konnte nicht mit MongoDB verbinden:", err.message);
    process.exit(1);
  });
