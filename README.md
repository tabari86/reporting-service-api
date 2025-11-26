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

## Tests / Testing


Der Reporting Service wird mit automatisierten Tests abgesichert.  
Dafür kommen **Jest** (Test Runner) und **Supertest** (HTTP-Tests für Express-Endpoints) zum Einsatz.

- Unit-/Integrationstests für die Reporting-Endpunkte (`/reports/summary`, `/reports/revenue-per-day`)
- Tests laufen gegen eine eigene Test-Datenbank (per `NODE_ENV=test`)
- Alle wichtigen Aggregationen (Gesamtumsatz, Anzahl Rechnungen, Umsatz pro Tag) werden mit Beispieldaten geprüft

Tests ausführen:
npm test

## Monitoring & Logging

Der Reporting Service verfügt über einfache, aber praxisnahe Monitoring- und Logging-Features:

- Zentrales Logging über ein eigenes `logger`-Utility
- HTTP-Request-Logging über Middleware
- Health-Check unter `GET /health` (Status, Service-Name, Uptime)
- Einfache Metriken unter `GET /metrics` (Uptime, Speicherverbrauch, Node-Environment)
- Monitoring-E-Mail-Test über `GET /monitoring/email-test` (in Kombination mit Mailtrap)


























