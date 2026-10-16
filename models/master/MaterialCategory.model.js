const mongoose = require("mongoose");

const MaterialCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "MaterialCategory name is required"],
      trim: true,
      unique: true
    },
    description: {
      type: String,
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

module.exports = mongoose.model("Material-Category", MaterialCategorySchema);
