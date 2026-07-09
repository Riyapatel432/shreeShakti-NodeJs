const mongoose = require("mongoose");

const PriceProductSchema = new mongoose.Schema(
  {
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
    current_price: {
      type: Number,
      required: [true, "Current price is required"],
      min: [0, "Price cannot be negative"],
    },

    effective_date: {
      type: Date,
      required: [true, "Effective date is required"],
      trim: true,
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

module.exports = mongoose.model("price-Product", PriceProductSchema);