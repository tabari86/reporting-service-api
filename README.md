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


## Docker Support

Der reporting-service-api kann vollständig in einer Container-Umgebung betrieben werden.
Das Repository enthält einen produktionsreifen Dockerfile, der:

Node.js (Alpine) verwendet
nur Produktions-Dependencies installiert
alle relevanten Dateien in das Image übernimmt
einen schlanken, schnellen Container erzeugt

## Docker Image bauen:
docker build -t reporting-service-api:latest .

Container starten:
docker run -p 4000:4000 reporting-service-api:latest

## PDF-Reporting (Daily Report)

Der Service erzeugt tägliche PDF-Reports über:

Anzahl der Rechnungen
Gesamtumsatz
Umsatzentwicklung je Tag
Die Erstellung erfolgt über PDFKit.

PDF-Endpunkt
GET /reports/daily-report.pdf

Dieser Endpunkt erzeugt on-the-fly ein PDF und liefert es direkt zurück.

Test-Abdeckung
Der PDF-Generator ist vollständig mit Jest + Supertest getestet:

npm test

## API-Key-Sicherheit

Der Reporting-Service ist jetzt durch eine API-Key-Authentifizierung geschützt.
Alle Endpunkte unter /reports/* müssen einen gültigen API-Schlüssel im Header senden.

# Wie der API-Key funktioniert

Der Server erwartet den Key im Header:
x-api-key: dein_api_key

# Der API-Key wird in der .env gesetzt:
REPORTING_API_KEY=meinGeheimerKey123
Beispiel-Request (cURL)
curl -H "x-api-key: meinGeheimerKey123" http://localhost:4000/reports/summary

Beispiel im JavaScript/Frontend
fetch("http://localhost:4000/reports/summary", {
  headers: {
    "x-api-key": "meinGeheimerKey123"
  }
})
  .then(r => r.json())
  .then(console.log);

Verhalten bei ungültigem API-Key

Statuscodes:
Status	Bedeutung
401 Unauthorized	Kein API-Key angegeben
403 Forbidden	API-Key ist falsch


## Redis Caching (High-Performance Analytics)

Der Reporting-Service nutzt Redis, um häufig abgefragte Reporting-Ergebnisse schnell und skalierbar bereitzustellen.
Dies reduziert MongoDB-Last und beschleunigt Analytics-Abfragen unter Last erheblich.

# Was wird gecached?
Endpoint	Beschreibung	TTL
/reports/summary	Gesamtstatistik (Invoices, Revenue, Statusverteilung)	60 Sekunden
/reports/revenue-per-day	Umsatz nach Tagen	60 Sekunden

# Wie funktioniert es?

Anfrage kommt rein → Service prüft zuerst Redis

Wenn Cache-Hit → sofort Antwort, ohne Datenbank

Wenn Cache-Miss → MongoDB-Query ausführen

Ergebnis → in Redis gespeichert

Client bekommt frische Daten

# Vorteile

Extrem schnelle Response-Zeiten

Produktionsreif (Microservice-Architektur)

Entlastet die Datenbank → ideal für hohe Last

Einfach skalierbar (Cluster-ready)

# Beispiel-Konfiguration für .env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=60

# Docker-Compose Support

Redis läuft voll integriert über docker-compose.yml:

# redis:
  image: redis:7-alpine
  container_name: reporting-redis
  ports:
    - "6379:6379"

## API Security – API-Key

Die Reporting-Endpoints (`/reports/*`) und Monitoring-Funktionen (`/monitoring/*`) sind mit einem einfachen API-Key-Schutz versehen.  
Der Key wird aus der Umgebungsvariable `API_KEY` geladen und muss über den HTTP-Header `x-api-key` übertragen werden.

Beispiel (Postman / HTTP-Client):

- Header: `x-api-key: supersecret-reporting-ke`

Die Endpoints `/health` und `/metrics` bleiben bewusst ohne Authentifizierung erreichbar, um Monitoring- und Orchestrierungs-Tools den Zugriff zu ermöglichen.

## 1. API-Key-Authentication:
   - Globale Absicherung aller Endpunkte (in Nicht-Testumgebungen)
   - Middleware + vollständige Testabdeckung

## 2. JWT Role-Based Access:
   - Einführung von Rollen (report_reader, report_admin)
   - Schutz sensibler Endpunkte mit Bearer Token
   - Test-Token-Generator für Supertest

## 3. Redis Caching (Leistungsoptimierung):
   - Caching für Summary-Reports
   - Caching für Revenue-Per-Day Analyse
   - Automatische Invalidation & Fallback-Strategien

## 4. PDF-Reporting:
   - Täglicher PDF-Report als Endpoint `/reports/daily-report.pdf`
   - Vollständig getestetes PDF-Buffer Streaming
   - Fehlerhandling & Logging

## 5. Verbesserte Teststruktur:
   - Neue Unit- und API-Tests für Tokio JWT, API-Key und PDF-Ausgabe
   - Stabilisierung der Testumgebung (ENV-Isolation, Mongoose-Cleanup)

Diese Erweiterungen bringen den Reporting-Service auf echtes Senior- und Production-Level.















