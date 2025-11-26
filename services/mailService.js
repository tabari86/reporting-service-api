const nodemailer = require("nodemailer");

// Mailtrap-Konfiguration aus .env
const {
  MAILTRAP_HOST,
  MAILTRAP_PORT,
  MAILTRAP_USER,
  MAILTRAP_PASS,
  MAILTRAP_FROM,
  MAILTRAP_TO,
} = process.env;

// Transporter nur bauen, wenn Konfiguration vorhanden ist
let transporter = null;

if (
  MAILTRAP_HOST &&
  MAILTRAP_PORT &&
  MAILTRAP_USER &&
  MAILTRAP_PASS &&
  process.env.NODE_ENV !== "test" // im Testmodus keine echten Mails
) {
  transporter = nodemailer.createTransport({
    host: MAILTRAP_HOST,
    port: Number(MAILTRAP_PORT),
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASS,
    },
  });
}

/**
 * Schickt eine Test-Mail über Mailtrap.
 * - Im Test-Modus (NODE_ENV=test) wird NICHT gesendet, nur „fake“ zurückgegeben.
 * - Wenn Mailtrap nicht konfiguriert ist, wird nur geloggt und nichts geworfen.
 */
async function sendTestEmail() {
  // 1) Bei Tests nie wirklich Mails verschicken
  if (process.env.NODE_ENV === "test") {
    return { skipped: true, reason: "test-environment" };
  }

  // 2) Wenn keine Konfiguration vorhanden ist → nur Warnung, kein Fehler
  if (!transporter || !MAILTRAP_FROM || !MAILTRAP_TO) {
    console.warn(
      "Mailtrap nicht konfiguriert – Test-E-Mail wird übersprungen."
    );
    return { skipped: true, reason: "no-mailtrap-config" };
  }

  // 3) Echte Test-Mail versenden
  const info = await transporter.sendMail({
    from: MAILTRAP_FROM,
    to: MAILTRAP_TO,
    subject: "Reporting Service – Test-E-Mail",
    text: "Dies ist eine Test-E-Mail vom reporting-service-api.",
  });

  return {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  };
}

module.exports = {
  sendTestEmail,
};
