const express = require("express");
const router = express.Router();
const {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  updatePurchaseOrderStatus,
} = require("../../controllers/purchase/purchaseOrderController");

const { protect } = require("../../middleware/authMiddleware");

router.get("/", protect, getPurchaseOrders);
router.get("/:id", protect, getPurchaseOrderById);
router.post("/", protect, createPurchaseOrder);
router.put("/:id", protect, updatePurchaseOrder);
router.delete("/:id", protect, deletePurchaseOrder);
router.put("/:id/status", protect, updatePurchaseOrderStatus);

module.exports = router;
