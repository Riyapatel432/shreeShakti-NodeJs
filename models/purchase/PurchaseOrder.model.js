const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expectedDeliveryDate: {
      type: Date,
    },
    lineItems: [
      {
        material: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        description: {
          type: String,
        },
        qtyOrdered: {
          type: Number,
          required: true,
          min: 1,
        },
        uom: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Unit",
        },
        rate: {
          type: Number,
          required: true,
          min: 0,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    taxPercent: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    freight: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Draft", "Sent", "Partially Received", "Received", "Cancelled"],
      default: "Draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    approvedBy: {
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

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);
