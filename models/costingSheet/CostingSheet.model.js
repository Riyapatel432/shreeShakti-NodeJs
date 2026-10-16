const mongoose = require("mongoose");

const CostingSheetSchema = new mongoose.Schema(
  {
    product_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product-Category",
      required: [true, "Product Category is required"], 
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"], 
    },
    moc: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MOC",
      required: true,
    },

    dimensions: {
    od: { type: Number, default: 0 },
    id: { type: Number, default: 0 },
    l: { type: Number, default: 0 },
    w: { type: Number, default: 0 },
    thk: { type: Number, default: 0 },
    nos: { type: Number, default: 0 },
    std: { type: Number, default: 0 },
    },
    qty: {
      type: Number,
      required: [true, "Qty is required"],
      min: [0, "Qty cannot be negative"],
    },
    rate: {
      type: Number,
      required: [true, "Rate is required"],
      min: [0, "Rate cannot be negative"],
    },
    amount: {
      type: Number,
      required: [true, "Rate is required"],
      min: [0, "Rate cannot be negative"],
    },
    status: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("costing-sheet", CostingSheetSchema);