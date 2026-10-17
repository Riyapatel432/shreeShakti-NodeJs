const express = require("express");
const router = express.Router();

// Import all route modules
const authRoutes = require("./auth");
const adminRoutes = require("./admin");
const clientRoutes = require("./master/client.route");
const productCategoryRoutes = require("./master/productCategory.route");
const productRoutes = require("./product/product.route");
const unitRoutes = require("./master/unit.route");
const mocRoutes = require("./master/moc.route");
const priceProductRoutes = require("./price/priceProduct.route");
const costingSheetRoutes = require("./costingSheet/costingSheet.route");
const quotationRoutes = require("./quotation/quotation.route");
const userRoutes = require("./master/userRoutes");

// Map routes to their respective endpoints
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/client", clientRoutes);
router.use("/project", require("./master/project.route"));
router.use("/product-category", productCategoryRoutes);
router.use("/product", productRoutes);
router.use("/unit", unitRoutes);
router.use("/moc", mocRoutes);
router.use("/price", priceProductRoutes);
router.use("/costingSheet", costingSheetRoutes);
router.use("/quotation", quotationRoutes);
router.use("/user", userRoutes);
router.use("/standards", require("./master/standards.route"));
router.use("/tech-spec", require("./techSpec/techSpec.route"));
router.use("/purchase-order", require("./purchase/purchaseOrder.route"));
router.use("/goods-receipt", require("./purchase/goodsReceipt.route"));

module.exports = router;
