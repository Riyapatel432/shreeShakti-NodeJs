const mongoose = require("mongoose");

const NozzleSchema = new mongoose.Schema({
  mark: { type: String, trim: true },
  service: { type: String, trim: true },
  size: { type: String, trim: true }, // NB Size
  rating: { type: String, trim: true }, // Flange Rating
  type: { type: String, trim: true }, // e.g. Flanged, Screwed
  qty: { type: Number, default: 1 }
});

const TechSpecSchema = new mongoose.Schema(
  {
    costingSheet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "costing-sheet",
      required: [true, "Costing Sheet reference is required"],
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    product_category: {
      type: String,
      required: true,
    },
    
    // Shared Header Fields
    designCode: { type: String, trim: true },
    designPressure: { type: String, trim: true },
    designTemperature: { type: String, trim: true },
    corrosionAllowance: { type: String, trim: true },
    capacity: { type: String, trim: true },
    insulation: { type: Boolean, default: false },
    paintingSpec: { type: String, trim: true },
    
    // MOC Breakdown
    moc: {
      shell: { type: String, trim: true },
      head: { type: String, trim: true },
      nozzles: { type: String, trim: true },
    },

    // Category Specific Data (Mixed schema for flexibility)
    categoryDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Nozzle Schedule
    nozzleSchedule: [NozzleSchema],

    // Versioning and Status
    status: {
      type: String,
      enum: ["Draft", "Issued", "Superseded"],
      default: "Draft",
    },
    revisionNumber: {
      type: Number,
      default: 0,
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

module.exports = mongoose.model("TechSpec", TechSpecSchema);
