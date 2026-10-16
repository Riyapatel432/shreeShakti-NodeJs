const mongoose = require("mongoose");

const LineItemSchema = new mongoose.Schema({
  srNo: { type: Number },
  description: { type: String },
  moc: { type: mongoose.Schema.Types.ObjectId, ref: "MOC" },
  dimensions: {
    od: { type: Number, default: 0 },
    id: { type: Number, default: 0 },
    l: { type: Number, default: 0 },
    w: { type: Number, default: 0 },
    thk: { type: Number, default: 0 },
    nos: { type: Number, default: 1 },
    std: { type: Number, default: 0 }
  },
  qty: { type: Number, required: true },
  unitWeight: { type: Number, default: 0 },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true }
});

const CostingSheetSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    product_category: { 
      type: String, 
      enum: ['StorageTank', 'PressureVessel', 'HeatExchanger', 'Condenser', 'Reactor'],
      required: true
    },
    revision_number: { type: Number, default: 0 },
    status: { type: String, enum: ['Draft', 'Final', 'Superseded'], default: 'Draft' },

    design_inputs: { type: mongoose.Schema.Types.Mixed, default: {} },

    line_items: [LineItemSchema],

    subtotal: { type: Number, default: 0 },
    wastagePercent: { type: Number, default: 0 },
    wastageAmount: { type: Number, default: 0 },
    labourConsumablesPercent: { type: Number, default: 0 },
    labourConsumablesAmount: { type: Number, default: 0 },
    freightAmount: { type: Number, default: 0 },
    ndtInspectionAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("costing-sheet", CostingSheetSchema);