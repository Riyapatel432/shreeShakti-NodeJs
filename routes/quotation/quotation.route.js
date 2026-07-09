const express = require('express');
const router = express.Router();
const quotationController = require("../../controllers/Quotation/quotationController");
const { protect } = require('../../middleware/authMiddleware');

console.log("quotation routes loaded");
// All routes require JWT
router.get('/get-quotation-details',protect, quotationController.getQuotationDetails);
router.post('/manage-quotation-details', protect, quotationController.manageQuotationDetails);
router.put('/update-quotation-details/:id',protect, quotationController.updateQuotationDetails);
router.delete('/delete-quotation-details/:id', protect, quotationController.deleteQuotationDetails);


module.exports = router;
