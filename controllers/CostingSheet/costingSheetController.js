const CostingSheetModel = require("../../models/costingSheet/CostingSheet.model");
const weightCalculator = require("../../utils/weightCalculator");

exports.getCostingSheetDetails = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";

    const skip = (page - 1) * limit;

    let filter = { isDeleted: { $ne: true } };

    if (search) {
      filter.product_category = { $regex: search, $options: "i" };
    }

    const totalRecords = await CostingSheetModel.countDocuments(filter);

    const costingSheets = await CostingSheetModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("client", "name company_name")
      .populate("project", "projectName")
      .populate("createdBy", "name email")
      .populate("line_items.moc", "name");

    return res.status(200).json({
      success: true,
      data: costingSheets,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get CostingSheet Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch CostingSheet",
      error: error.message,
    });
  }
};

exports.getCostingSheetById = async (req, res) => {
  try {
    const costingSheet = await CostingSheetModel.findById(req.params.id)
      .populate("client", "name company_name")
      .populate("project", "projectName")
      .populate("line_items.moc", "name");

    if (!costingSheet) {
      return res.status(404).json({ success: false, message: "Costing Sheet not found" });
    }

    return res.status(200).json({ success: true, data: costingSheet });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.createCostingSheet = async (req, res) => {
  try {
    const { client, project, product_category, design_inputs, status, line_items = [], wastagePercent = 0, labourConsumablesPercent = 0, freightAmount = 0, ndtInspectionAmount = 0 } = req.body;

    if (!product_category) {
      return res.status(400).json({ success: false, message: "Product category is required" });
    }

    let subtotal = 0;
    const processedItems = line_items.map(item => {
      let unitWeight = item.unitWeight || 0;
      if (item.categoryName) {
         unitWeight = weightCalculator.calculateQty(item.categoryName, item.dimensions);
      }
      const qty = item.qty || 1;
      const rate = item.rate || 0;
      const amount = qty * rate;
      subtotal += amount;
      return { ...item, unitWeight, amount };
    });

    const wastageAmount = (subtotal * wastagePercent) / 100;
    const labourConsumablesAmount = (subtotal * labourConsumablesPercent) / 100;
    const grandTotal = subtotal + wastageAmount + labourConsumablesAmount + Number(freightAmount) + Number(ndtInspectionAmount);

    const costingSheet = await CostingSheetModel.create({
      client,
      project,
      product_category,
      design_inputs: design_inputs || {},
      status,
      line_items: processedItems,
      subtotal,
      wastagePercent,
      wastageAmount,
      labourConsumablesPercent,
      labourConsumablesAmount,
      freightAmount,
      ndtInspectionAmount,
      grandTotal,
      createdBy: req.admin?._id || req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Costing Sheet created successfully",
      data: costingSheet,
    });
  } catch (error) {
    console.error("Create Costing Sheet Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create Costing Sheet",
      error: error.message,
    });
  }
};

exports.updateCostingSheetHeader = async (req, res) => {
  try {
    const { id } = req.params;
    const { client, project, product_category, design_inputs, status, revision_number } = req.body;

    const updated = await CostingSheetModel.findByIdAndUpdate(
      id,
      { client, project, product_category, design_inputs, status, revision_number, updatedBy: req.admin?._id || req.user?._id },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Costing Sheet not found" });
    }

    return res.status(200).json({ success: true, message: "Header updated", data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.updateLineItems = async (req, res) => {
  try {
    const { id } = req.params;
    const { line_items } = req.body; // array of line items

    if (!Array.isArray(line_items)) {
      return res.status(400).json({ success: false, message: "line_items must be an array" });
    }

    const sheet = await CostingSheetModel.findById(id);
    if (!sheet) {
      return res.status(404).json({ success: false, message: "Costing Sheet not found" });
    }

    let subtotal = 0;
    const processedItems = line_items.map(item => {
      let unitWeight = item.unitWeight || 0;
      
      // Calculate weight if a category is provided to the calculator (fallback to frontend weight if not)
      // Usually product category determines the weight calc, but for individual items like plates, tubes, we need the material form.
      // Assuming item has a "form" or "category" string in description or we pass it
      if (item.categoryName) {
         unitWeight = weightCalculator.calculateQty(item.categoryName, item.dimensions);
      }
      
      const qty = item.qty || 1;
      const rate = item.rate || 0;
      const amount = qty * rate;
      
      subtotal += amount;

      return {
        ...item,
        unitWeight,
        amount
      };
    });

    sheet.line_items = processedItems;
    sheet.subtotal = subtotal;

    // Recalculate rollup amounts based on new subtotal and existing percentages
    sheet.wastageAmount = (sheet.subtotal * (sheet.wastagePercent || 0)) / 100;
    sheet.labourConsumablesAmount = (sheet.subtotal * (sheet.labourConsumablesPercent || 0)) / 100;
    
    sheet.grandTotal = sheet.subtotal + sheet.wastageAmount + sheet.labourConsumablesAmount + (sheet.freightAmount || 0) + (sheet.ndtInspectionAmount || 0);
    sheet.updatedBy = req.admin?._id || req.user?._id;

    await sheet.save();

    return res.status(200).json({ success: true, message: "Line items updated", data: sheet });
  } catch (error) {
    console.error("Update Line Items Error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.updateRollup = async (req, res) => {
  try {
    const { id } = req.params;
    const { wastagePercent, labourConsumablesPercent, freightAmount, ndtInspectionAmount } = req.body;

    const sheet = await CostingSheetModel.findById(id);
    if (!sheet) {
      return res.status(404).json({ success: false, message: "Costing Sheet not found" });
    }

    if (wastagePercent !== undefined) sheet.wastagePercent = Number(wastagePercent);
    if (labourConsumablesPercent !== undefined) sheet.labourConsumablesPercent = Number(labourConsumablesPercent);
    if (freightAmount !== undefined) sheet.freightAmount = Number(freightAmount);
    if (ndtInspectionAmount !== undefined) sheet.ndtInspectionAmount = Number(ndtInspectionAmount);

    sheet.wastageAmount = (sheet.subtotal * (sheet.wastagePercent || 0)) / 100;
    sheet.labourConsumablesAmount = (sheet.subtotal * (sheet.labourConsumablesPercent || 0)) / 100;
    
    sheet.grandTotal = sheet.subtotal + sheet.wastageAmount + sheet.labourConsumablesAmount + (sheet.freightAmount || 0) + (sheet.ndtInspectionAmount || 0);
    sheet.updatedBy = req.admin?._id || req.user?._id;

    await sheet.save();

    return res.status(200).json({ success: true, message: "Rollup updated", data: sheet });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.deleteCostingSheetDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const costingSheet = await CostingSheetModel.findById(id);

    if (!costingSheet) {
      return res.status(404).json({ success: false, message: "Costing Sheet not found" });
    }

    await CostingSheetModel.findByIdAndUpdate(id, { isDeleted: true });

    return res.status(200).json({ success: true, message: "Costing Sheet deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete Costing Sheet", error: error.message });
  }
};