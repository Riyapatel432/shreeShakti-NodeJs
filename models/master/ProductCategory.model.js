const mongoose = require("mongoose");

const ProductCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "ProductCategory name is required"],
      trim: true,
    },

   
    description: {
      type: String,
      required: [true, "Description is required"],
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

module.exports = mongoose.model("Product-Category", ProductCategorySchema);