const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: false,
    },
    amount: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      enum: ["OPEN", "PAID", "CANCELLED"],
      default: "OPEN",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Wir greifen auf die bestehende Collection "invoices" zu
    collection: "invoices",
    versionKey: false,
  }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
