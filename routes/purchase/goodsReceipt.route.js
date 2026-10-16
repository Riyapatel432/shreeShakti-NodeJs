const express = require("express");
const router = express.Router();
const {
  getGoodsReceipts,
  createGoodsReceipt,
} = require("../../controllers/purchase/goodsReceiptController");

const { protect } = require("../../middleware/authMiddleware");

router.get("/", protect, getGoodsReceipts);
router.post("/", protect, createGoodsReceipt);

module.exports = router;
