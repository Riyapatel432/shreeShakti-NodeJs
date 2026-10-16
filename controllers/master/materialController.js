const MaterialModel = require("../../models/master/Material.model");
const StockLedgerModel = require("../../models/master/StockLedger.model");

exports.getMaterialDetails = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";

    const skip = (page - 1) * limit;

    let filter = { isDeleted: false };
    if (search) {
      filter.$or = [
        { materialCode: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const totalRecords = await MaterialModel.countDocuments(filter);

    const materials = await MaterialModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("category", "name")
      .populate("moc", "name")
      .populate("uom", "name")
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      data: materials,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch materials", error: error.message });
  }
};

exports.getLowStockMaterials = async (req, res) => {
  try {
    const materials = await MaterialModel.find({
      isDeleted: false,
      $expr: { $lte: ["$currentStock", "$minStockLevel"] }
    })
      .populate("category", "name")
      .populate("uom", "name");

    return res.status(200).json({ success: true, data: materials });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch low stock", error: error.message });
  }
};

exports.getMaterialLedger = async (req, res) => {
  try {
    const { id } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalRecords = await StockLedgerModel.countDocuments({ material: id });
    const ledger = await StockLedgerModel.find({ material: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("performedBy", "name email");

    return res.status(200).json({
      success: true,
      data: ledger,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch ledger", error: error.message });
  }
};

exports.manageMaterialDetails = async (req, res) => {
  try {
    const { materialCode, description, category, moc, uom, minStockLevel, reorderQty, binLocation, unitRate, status, currentStock } = req.body;

    if (!materialCode || !description || !category) {
      return res.status(400).json({ success: false, message: "Code, description and category are required" });
    }

    const existing = await MaterialModel.findOne({ materialCode: materialCode.trim().toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Material Code already exists" });
    }

    const material = await MaterialModel.create({
      materialCode: materialCode.trim().toUpperCase(),
      description: description.trim(),
      category,
      moc: moc || undefined,
      uom: uom || undefined,
      minStockLevel: minStockLevel || 0,
      reorderQty: reorderQty || 0,
      binLocation,
      unitRate: unitRate || 0,
      status,
      currentStock: currentStock || 0,
      createdBy: req.admin?._id || req.user?._id,
    });

    // If initial stock was provided, create an opening ledger entry
    if (material.currentStock > 0) {
      await StockLedgerModel.create({
        material: material._id,
        transactionType: "IN",
        quantity: material.currentStock,
        referenceType: "Opening",
        balanceAfter: material.currentStock,
        remarks: "Opening Stock",
        performedBy: req.admin?._id || req.user?._id
      });
    }

    return res.status(201).json({ success: true, message: "Material created successfully", data: material });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to create material", error: error.message });
  }
};

exports.updateMaterialDetails = async (req, res) => {
  try {
    const { id } = req.params;
    // Strip currentStock from updates, it MUST be updated via stock movement
    const { currentStock, ...updateData } = req.body;

    const material = await MaterialModel.findById(id);
    if (!material) {
      return res.status(404).json({ success: false, message: "Material not found" });
    }

    if (updateData.materialCode) {
      const exists = await MaterialModel.findOne({
        materialCode: updateData.materialCode.trim().toUpperCase(),
        _id: { $ne: id },
      });
      if (exists) {
        return res.status(400).json({ success: false, message: "Material Code already exists" });
      }
      updateData.materialCode = updateData.materialCode.trim().toUpperCase();
    }

    updateData.updatedBy = req.admin?._id || req.user?._id;

    const updated = await MaterialModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    return res.status(200).json({ success: true, message: "Material updated successfully", data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update material", error: error.message });
  }
};

exports.deleteMaterialDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await MaterialModel.findById(id);

    if (!material) {
      return res.status(404).json({ success: false, message: "Material not found" });
    }

    await MaterialModel.findByIdAndUpdate(id, { isDeleted: true });
    return res.status(200).json({ success: true, message: "Material deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// STOCK MOVEMENT ENGINE
// ======================================================
exports.recordStockMovement = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionType, quantity, referenceType, referenceId, remarks } = req.body;

    if (!["IN", "OUT", "ADJUSTMENT"].includes(transactionType)) {
      return res.status(400).json({ success: false, message: "Invalid transaction type" });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: "Quantity must be greater than zero" });
    }

    // Determine the numeric change
    const qtyChange = transactionType === "IN" ? quantity : -quantity;

    // We use findOneAndUpdate with $inc to atomically update without race conditions
    // If it's an OUT transaction, we must ensure currentStock >= quantity
    let query = { _id: id, isDeleted: false };
    if (transactionType === "OUT") {
      query.currentStock = { $gte: quantity };
    }

    const updatedMaterial = await MaterialModel.findOneAndUpdate(
      query,
      { 
        $inc: { currentStock: qtyChange },
        $set: { updatedBy: req.admin?._id || req.user?._id }
      },
      { new: true } // Return the updated document to get balanceAfter
    );

    if (!updatedMaterial) {
      // If we couldn't update, it's either not found or insufficient stock
      const checkExists = await MaterialModel.findById(id);
      if (!checkExists) return res.status(404).json({ success: false, message: "Material not found" });
      
      return res.status(400).json({ success: false, message: "Insufficient stock for this OUT transaction" });
    }

    // Insert Ledger Entry
    const ledger = await StockLedgerModel.create({
      material: id,
      transactionType,
      quantity,
      referenceType: referenceType || "ManualAdjustment",
      referenceId,
      balanceAfter: updatedMaterial.currentStock,
      remarks,
      performedBy: req.admin?._id || req.user?._id
    });

    const isLowStock = updatedMaterial.isLowStock();

    return res.status(201).json({
      success: true,
      message: "Stock movement recorded successfully",
      data: {
        material: updatedMaterial,
        ledger,
        isLowStock
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to record stock movement", error: error.message });
  }
};
