const GoodsReceipt = require("../../models/purchase/GoodsReceipt.model");
const PurchaseOrder = require("../../models/purchase/PurchaseOrder.model");

// ======================================================
// @desc    Get All Goods Receipts (Optionally by PO)
// @route   GET /api/goods-receipt
// @access  Private
// ======================================================
exports.getGoodsReceipts = async (req, res) => {
  try {
    const { purchaseOrderId } = req.query;
    let filter = { isDeleted: false };

    if (purchaseOrderId) {
      filter.purchaseOrder = purchaseOrderId;
    }

    const receipts = await GoodsReceipt.find(filter)
      .sort({ createdAt: -1 })
      .populate("purchaseOrder", "poNumber")
      .populate("lineItems.material", "name description")
      .populate("receivedBy", "name email");

    return res.status(200).json({ success: true, data: receipts });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch goods receipts", error: error.message });
  }
};

// ======================================================
// @desc    Create Goods Receipt & Update Stock
// @route   POST /api/goods-receipt
// @access  Private
// ======================================================
exports.createGoodsReceipt = async (req, res) => {
  try {
    const { purchaseOrder: poId, receiptDate, lineItems } = req.body;

    if (!poId || !lineItems || lineItems.length === 0) {
      return res.status(400).json({ success: false, message: "Purchase Order and Line Items are required" });
    }

    // 1. Validate PO exists and is eligible
    const po = await PurchaseOrder.findById(poId);
    if (!po || po.isDeleted) {
      return res.status(404).json({ success: false, message: "Purchase Order not found" });
    }

    if (po.status === "Received" || po.status === "Cancelled") {
       return res.status(400).json({ success: false, message: `Cannot receive against a ${po.status} PO.` });
    }

    // Optional: Deep validation to ensure received quantities do not exceed ordered quantities.
    // For now, we will simply process what is received.

    // 2. Generate Receipt Number
    const count = await GoodsReceipt.countDocuments();
    const receiptNumber = `GRN-${Date.now().toString().slice(-6)}-${(count + 1).toString().padStart(3, '0')}`;

    // 3. Create GRN Document
    const grn = await GoodsReceipt.create({
      purchaseOrder: poId,
      receiptNumber,
      receiptDate: receiptDate || Date.now(),
      lineItems,
      receivedBy: req.admin?._id || req.user?._id,
    });

    // 4. Update PO Status
    po.status = "Partially Received";
    await po.save();

    return res.status(201).json({
      success: true,
      message: "Goods Receipt created successfully, stock updated.",
      data: grn,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create goods receipt",
      error: error.message,
    });
  }
};
