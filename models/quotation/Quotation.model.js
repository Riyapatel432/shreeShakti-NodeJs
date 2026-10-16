const mongoose = require("mongoose");

const QuotationSchema = new mongoose.Schema(
  {
   
    quotation_no: {
      type: Number,
      required:true
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client is required"], 
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"], 
    },
    product_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product-Category",
    },
    sourceRateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "price-Product",
    },
    costingSheet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "costing-sheet",
    },
    techSpec: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TechSpec",
    },
    snapshot: {
      items: [{
        description: String,
        qty: Number,
        rate: Number,
        amount: Number
      }],
      subtotal: Number,
      wastage: Number,
      freight: Number,
      grand_total: Number
    },
    snapshottedRate: { type: Number },
    snapshottedQty: { type: Number },
    snapshottedMocName: { type: String },
    qty: {
      type: Number,
      required: false
    },
    discount: {
      type: Number,
      required: false
    },
    tax_type: {
      type: String,
      required:true
    },
    tax: {
      type: Number,
      required:true
    },
    grand_total: {
      type: Number,
      required:true
    },
    status: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model("Quotation", QuotationSchema);