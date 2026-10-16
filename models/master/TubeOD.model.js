const mongoose = require("mongoose");

const TubeODSchema = new mongoose.Schema(
  {
    od_mm: {
      type: Number,
      required: [true, "Outer diameter in mm is required"],
      unique: true,
    },
    od_inch: {
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

module.exports = mongoose.model("TubeOD", TubeODSchema);
