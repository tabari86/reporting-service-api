# Dockerfile für reporting-service-api

# 1) Basis-Image: schlankes Node.js
FROM node:22-alpine

# 2) Arbeitsverzeichnis im Container
WORKDIR /usr/src/app

# 3) Nur package-Dateien kopieren (für schnellere Builds)
COPY package*.json ./

# 4) Nur Produktions-Abhängigkeiten installieren
RUN npm install --only=production

# 5) Restlichen Quellcode kopieren
COPY . .

# 6) Environment-Variable für Production-Modus
ENV NODE_ENV=production

# 7) Port, auf dem dein Reporting-Service läuft
EXPOSE 4000

# 8) Startkommando
CMD ["node", "index.js"]
