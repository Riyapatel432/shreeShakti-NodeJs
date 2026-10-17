const mongoose = require("mongoose");

const goodsReceiptSchema = new mongoose.Schema(
  {
    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true,
    },
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    receiptDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    lineItems: [
      {
        material: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        qtyReceived: {
          type: Number,
          required: true,
          min: 0,
        },
        qtyRejected: {
          type: Number,
          default: 0,
          min: 0,
        },
        batchNumber: {
          type: String,
          trim: true,
        },
      },
    ],
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("GoodsReceipt", goodsReceiptSchema);
