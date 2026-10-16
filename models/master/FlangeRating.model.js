const mongoose = require("mongoose");

const FlangeRatingSchema = new mongoose.Schema(
  {
    nbSize: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NBSize",
      required: [true, "NB Size is required"],
    },
    ratingClass: {
      type: String,
      required: [true, "Rating Class is required"],
      trim: true,
    },
    flangeOD: {
      type: Number,
    },
    pcd: {
      type: Number,
    },
    numBolts: {
      type: Number,
    },
    boltSize: {
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

module.exports = mongoose.model("FlangeRating", FlangeRatingSchema);
