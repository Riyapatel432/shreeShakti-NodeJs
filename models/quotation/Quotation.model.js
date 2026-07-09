const mongoose = require("mongoose");

const QuotationSchema = new mongoose.Schema(
  {
   
    quotation_no: {
      type: Number,
      required:true,
      unique:true
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
      required: [true, "Product Category is required"], 
    },
    price: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "price-Product",
      required: [true, "Price is required"], 
    },
    qty: {
      type: Number,
      required:true
    },
    discount: {
      type: Number,
      required:true
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