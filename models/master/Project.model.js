const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client is required"],
    },
    status: {
      type: String,
      enum: ["Enquiry", "Costing", "Quoted", "Won", "Lost", "In Production", "Completed"],
      default: "Enquiry",
    },
    startDate: {
      type: Date,
    },
    expectedCompletionDate: {
      type: Date,
    },
    actualCompletionDate: {
      type: Date,
    },
    description: {
      type: String,
      trim: true,
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

module.exports = mongoose.model("Project", projectSchema);
