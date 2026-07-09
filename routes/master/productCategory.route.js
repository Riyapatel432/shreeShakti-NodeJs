const express = require('express');
const router = express.Router();
const productCategoryController = require("../../controllers/master/productCategoryController");
const { protect } = require('../../middleware/authMiddleware');

console.log("product category routes loaded");
// All routes require JWT
router.get('/get-product-category-details',protect, productCategoryController.getProductCategoryDetails);
router.post('/manage-product-category-details', protect, productCategoryController.manageProductCategoryDetails);
router.put('/update-product-category-details/:id',protect, productCategoryController.updateProductCategoryDetails);
router.delete('/delete-product-category-details/:id', protect, productCategoryController.deleteProductCategoryDetails);


module.exports = router;
