const mongoose = require("mongoose");

const PipeScheduleSchema = new mongoose.Schema(
  {
    nbSize: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NBSize",
      required: [true, "NB Size is required"],
    },
    schedule: {
      type: String,
      required: [true, "Schedule is required"],
      trim: true,
    },
    wallThickness: {
      type: Number,
      required: [true, "Wall thickness is required"],
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

module.exports = mongoose.model("PipeSchedule", PipeScheduleSchema);
