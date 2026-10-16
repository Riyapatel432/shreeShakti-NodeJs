const PurchaseOrder = require("../../models/purchase/PurchaseOrder.model");

// ======================================================
// @desc    Get All Purchase Orders
// @route   GET /api/purchase-order
// @access  Private
// ======================================================
exports.getPurchaseOrders = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
    const status = req.query.status;

    const skip = (page - 1) * limit;

    let filter = { isDeleted: false };

    if (search) {
      filter.poNumber = { $regex: search, $options: "i" };
    }

    if (status) {
      filter.status = status;
    }

    const totalRecords = await PurchaseOrder.countDocuments(filter);

    const purchaseOrders = await PurchaseOrder.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("vendor", "name company_name email phone")
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      data: purchaseOrders,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchase orders",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Get Purchase Order By ID
// @route   GET /api/purchase-order/:id
// @access  Private
// ======================================================
exports.getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const purchaseOrder = await PurchaseOrder.findOne({ _id: id, isDeleted: false })
      .populate("vendor", "name company_name email phone gst_no address city state")
      .populate("lineItems.material", "materialCode description unitRate")
      .populate("lineItems.uom", "name")
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email");

    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: "Purchase Order not found" });
    }

    return res.status(200).json({ success: true, data: purchaseOrder });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch purchase order", error: error.message });
  }
};

// ======================================================
// @desc    Create Purchase Order
// @route   POST /api/purchase-order
// @access  Private
// ======================================================
exports.createPurchaseOrder = async (req, res) => {
  try {
    const {
      vendor,
      orderDate,
      expectedDeliveryDate,
      lineItems,
      subtotal,
      taxPercent,
      taxAmount,
      freight,
      grandTotal,
      status,
    } = req.body;

    if (!vendor || !lineItems || lineItems.length === 0) {
      return res.status(400).json({ success: false, message: "Vendor and Line Items are required" });
    }

    // Generate PO Number (Simple sequential logic for now)
    const count = await PurchaseOrder.countDocuments();
    const poNumber = `PO-${Date.now().toString().slice(-6)}-${(count + 1).toString().padStart(3, '0')}`;

    const purchaseOrder = await PurchaseOrder.create({
      poNumber,
      vendor,
      orderDate: orderDate || Date.now(),
      expectedDeliveryDate,
      lineItems,
      subtotal: subtotal || 0,
      taxPercent: taxPercent || 0,
      taxAmount: taxAmount || 0,
      freight: freight || 0,
      grandTotal: grandTotal || 0,
      status: status || "Draft",
      createdBy: req.admin?._id || req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Purchase Order created successfully",
      data: purchaseOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create purchase order",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Update Purchase Order
// @route   PUT /api/purchase-order/:id
// @access  Private
// ======================================================
exports.updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const purchaseOrder = await PurchaseOrder.findById(id);

    if (!purchaseOrder || purchaseOrder.isDeleted) {
      return res.status(404).json({ success: false, message: "Purchase Order not found" });
    }

    // Only allow updating Draft or Sent POs. Partially Received / Received cannot be fundamentally changed.
    if (["Partially Received", "Received"].includes(purchaseOrder.status)) {
      if (req.body.lineItems || req.body.grandTotal) {
         return res.status(400).json({ success: false, message: "Cannot modify line items or totals of a received Purchase Order." });
      }
    }

    const updatedPurchaseOrder = await PurchaseOrder.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Purchase Order updated successfully",
      data: updatedPurchaseOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update purchase order",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Delete Purchase Order
// @route   DELETE /api/purchase-order/:id
// @access  Private
// ======================================================
exports.deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const purchaseOrder = await PurchaseOrder.findById(id);

    if (!purchaseOrder || purchaseOrder.isDeleted) {
      return res.status(404).json({ success: false, message: "Purchase Order not found" });
    }

    if (["Partially Received", "Received"].includes(purchaseOrder.status)) {
      return res.status(400).json({ success: false, message: "Cannot delete a received Purchase Order." });
    }

    await PurchaseOrder.findByIdAndUpdate(id, { isDeleted: true });

    return res.status(200).json({ success: true, message: "Purchase Order deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete purchase order",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Update Purchase Order Status (e.g. Sent, Cancelled, Approved)
// @route   PUT /api/purchase-order/:id/status
// @access  Private
// ======================================================
exports.updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Draft", "Sent", "Partially Received", "Received", "Cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const purchaseOrder = await PurchaseOrder.findById(id);

    if (!purchaseOrder || purchaseOrder.isDeleted) {
      return res.status(404).json({ success: false, message: "Purchase Order not found" });
    }

    let updateData = { status };
    if (status === "Sent" && purchaseOrder.status === "Draft") {
      // Logic for approving when sending
      updateData.approvedBy = req.admin?._id || req.user?._id;
    }

    const updatedPurchaseOrder = await PurchaseOrder.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Purchase Order status updated successfully",
      data: updatedPurchaseOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update purchase order status",
      error: error.message,
    });
  }
};
