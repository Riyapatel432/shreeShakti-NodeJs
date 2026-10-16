const mongoose = require("mongoose");

const TechSpecSchema = new mongoose.Schema(
  {
    costingSheet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "costing-sheet",
      required: true,
    },
    design_code: { type: String, default: "ASME Sec VIII Div 1" },
    tema_type: { type: String },
    design_basis: { type: String },
    nozzle_schedule: [
      {
        mark: String,
        size: String,
        rating: String,
        service: String,
        qty: Number
      }
    ],
    moc_table: [
      {
        component: String,
        material: String
      }
    ],
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

module.exports = mongoose.model("TechSpec", TechSpecSchema);
