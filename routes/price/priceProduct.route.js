const express = require('express');
const router = express.Router();
const priceController = require("../../controllers/Price/priceController");
const { protect } = require('../../middleware/authMiddleware');

console.log("price product routes loaded");
// All routes require JWT
router.get('/get-price-details',protect, priceController.getPriceProductDetails);
router.post('/manage-price-details', protect, priceController.managePriceProductDetails);
router.put('/update-price-details/:id',protect, priceController.updatePriceProductDetails);
router.delete('/delete-price-details/:id', protect, priceController.deletePriceProductDetails);


module.exports = router;
