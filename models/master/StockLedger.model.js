const mongoose = require("mongoose");

const StockLedgerSchema = new mongoose.Schema(
  {
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      required: [true, "Material is required"],
    },
    transactionType: {
      type: String,
      enum: ["IN", "OUT", "ADJUSTMENT"],
      required: [true, "Transaction type is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity must be positive"], // Always positive, direction comes from transactionType
    },
    referenceType: {
      type: String,
      enum: ["Purchase", "Production", "ManualAdjustment", "Opening", "Issue", "Return"],
      required: [true, "Reference type is required"],
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      // Generic ObjectId since refPath might be overkill or targets non-existent models yet
    },
    balanceAfter: {
      type: Number,
      required: [true, "Balance after transaction is required"],
      min: [0, "Balance cannot be negative"],
    },
    remarks: {
      type: String,
      trim: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Performed By is required"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("StockLedger", StockLedgerSchema);
