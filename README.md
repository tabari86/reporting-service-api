# reporting-service-api
Ein unabhängiger Microservice zur Analyse und Auswertung von Rechnungsdaten.
Der Service liest Daten aus einer bestehenden invoices-Collection, erzeugt tägliche Reports per Cron-Job und stellt mehrere Reporting-Endpoints zur Verfügung.
Reporting &amp; Analytics Service for Invoice Data – Node.js, Express, MongoDB, Cron Jobs

# Über das Projekt

Der Reporting Service API ist ein leichtgewichtiger Analytics-Dienst, der speziell für systemübergreifende Rechnungsdaten entwickelt wurde.
Er aggregiert Daten aus MongoDB und bietet:

Umsatz- und Statusauswertungen
Tagesbasierte Revenue-Analysen
Automatische tägliche Reports (Cron-Job)
Saubere Trennung in Modelle, Controller und Routen
Der Service kann problemlos in größere Systeme eingebunden werden, z. B. in Kombination mit separaten Invoice- oder User-Services.

## API-Endpunkte

GET /reports/summary

Liefert eine komprimierte Gesamtübersicht:
Gesamtanzahl Rechnungen
Gesamter Umsatz
Anzahl offener, bezahlter und stornierter Rechnungen
GET /reports/revenue-per-day
Gruppiert alle Rechnungen nach Datum:
Umsatz pro Tag
Anzahl Rechnungen pro Tag

## Tägliche Reports (Cron-Job)

Ein Cron-Job speichert jeden Tag eine zusammengefasste Statistik in der Collection:
daily_reports
Damit lassen sich historische Report-Daten über mehrere Monate oder Jahre hinweg abfragen.

## Technologien

Node.js (Express)
MongoDB & Mongoose
node-cron (Hintergrundjobs)
dotenv
REST-Architektur
Microservice-Struktur

## Projektstruktur

reporting-service-api
│
├── controllers
│   └── reportController.js
│
├── models
│   ├── invoice.js
│   └── dailyReport.js
│
├── routes
│   └── reportRoutes.js
│
├── index.js
└── .env



























