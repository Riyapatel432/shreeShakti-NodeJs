const express = require('express');
const router = express.Router();
const productController = require("../../controllers/product/productController");
const { protect } = require('../../middleware/authMiddleware');

console.log("product  routes loaded");
// All routes require JWT
router.get('/get-product-details',protect, productController.getProductDetails);
router.post('/manage-product-details', protect, productController.manageProductDetails);
router.put('/update-product-details/:id',protect, productController.updateProductDetails);
router.delete('/delete-product-details/:id', protect, productController.deleteProductDetails);


module.exports = router;
