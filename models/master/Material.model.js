const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema(
  {
    materialCode: {
      type: String,
      required: [true, "Material Code is required"],
      unique: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material-Category",
      required: [true, "Category is required"],
    },
    moc: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MOC",
    },
    uom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Current stock cannot be negative"],
    },
    minStockLevel: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Min stock level cannot be negative"],
    },
    reorderQty: {
      type: Number,
      default: 0,
      min: 0,
    },
    binLocation: {
      type: String,
      trim: true,
    },
    unitRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
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

// Virtual/Instance method to check low stock
MaterialSchema.methods.isLowStock = function () {
  return this.currentStock <= this.minStockLevel;
};

// Also expose as virtual property for easy JSON serialization if needed
MaterialSchema.virtual("lowStockAlert").get(function () {
  return this.currentStock <= this.minStockLevel;
});

// Ensure virtuals are included in JSON output
MaterialSchema.set('toJSON', { virtuals: true });
MaterialSchema.set('toObject', { virtuals: true });

// Pre-save validation backup
MaterialSchema.pre('save', function() {
  if (this.currentStock < 0) {
    throw new Error('Current stock cannot be negative');
  }
  if (this.minStockLevel < 0) {
    throw new Error('Min stock level cannot be negative');
  }
});

module.exports = mongoose.model("Material", MaterialSchema);
