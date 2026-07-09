const mongoose = require("mongoose");

const MOCSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: [true, "MOC is required"],
        trim:true,
        unique:true
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

module.exports = mongoose.model("MOC", MOCSchema);