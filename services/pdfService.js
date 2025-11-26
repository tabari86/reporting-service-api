const PDFDocument = require("pdfkit");

/**
 * Erzeugt einen sehr einfachen Daily-Report als PDF und gibt ein Buffer zurück.
 * (Fürs Projekt & die Tests reicht es, dass überhaupt ein gültiges PDF erzeugt wird.)
 */
function generateDailyReportPdf() {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks = [];

      // Daten sammeln
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on("error", (err) => {
        reject(err);
      });

      // --- Inhalt des PDFs (minimal, aber gültig) ---
      doc.fontSize(20).text("Daily Reporting Summary", {
        align: "center",
      });

      doc.moveDown();
      doc.fontSize(12).text(`Generiert am: ${new Date().toLocaleString()}`);

      doc.moveDown();
      doc.text("Dies ist ein automatisch erzeugter täglicher Report.", {
        align: "left",
      });

      // PDF beenden
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateDailyReportPdf,
};
