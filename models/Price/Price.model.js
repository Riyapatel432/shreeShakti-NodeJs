const mongoose = require("mongoose");

const PriceSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
    moc: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MOC",
      required: [true, "MOC is required"], 
    },
    current_price: {
      type: Number,
      required: [true, "Current price is required"],
      min: [0, "Price cannot be negative"],
    },
    effective_date: {
      type: Date,
      required: [true, "Effective date is required"],
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

// Static method to get the rate in effect for a given MOC as of a given date (defaults to latest)
PriceSchema.statics.getRateForMOC = async function (mocId, date = new Date()) {
  const rate = await this.findOne({
    moc: mocId,
    effective_date: { $lte: date },
    status: true,
    isDeleted: false
  }).sort({ effective_date: -1 });
  
  return rate ? rate.current_price : 0;
};

module.exports = mongoose.model("price-Product", PriceSchema);