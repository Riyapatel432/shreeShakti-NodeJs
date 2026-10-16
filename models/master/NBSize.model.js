const mongoose = require("mongoose");

const NBSizeSchema = new mongoose.Schema(
  {
    nb_mm: {
      type: Number,
      required: [true, "NB size in mm is required"],
      unique: true,
    },
    nb_inch: {
      type: String,
      required: [true, "NB size in inches is required"],
      trim: true,
    },
    od_mm: {
      type: Number,
      required: [true, "Outer diameter in mm is required"],
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

module.exports = mongoose.model("NBSize", NBSizeSchema);
