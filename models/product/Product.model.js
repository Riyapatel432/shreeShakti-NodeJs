const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    product_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product-Category",
      required: [true, "Product category is required"], 
    },
   
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
   moc: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MOC",
      required: [true, "MOC is required"], 
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: [true, "Unit is required"], 
    },

    hsn_code: {
      type: String,
      required: [true, "HSN Code is required"],
      trim: true,
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

module.exports = mongoose.model("Product", ProductSchema);