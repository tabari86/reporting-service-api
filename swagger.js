const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Reporting Service API",
    version: "1.0.0",
    description:
      "Reporting & Analytics Service für Rechnungsdaten (Umsatz, Status, tägliche Auswertungen).",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Lokale Entwicklungsumgebung",
    },
  ],
};

const options = {
  swaggerDefinition,
  // hier holen wir später die Doku-Kommentare aus den Routen
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
