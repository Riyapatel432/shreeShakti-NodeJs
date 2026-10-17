const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const costingSheetController = require("../../controllers/CostingSheet/costingSheetController");
console.log("costing sheet routes loaded");
// All routes require JWT
router.get('/get-costing-sheet-details',protect, costingSheetController.getCostingSheetDetails);
router.post('/manage-costing-sheet-details', protect, costingSheetController.manageCostingSheetDetails);
router.put('/update-costing-sheet-details/:id',protect, costingSheetController.updateCostingSheetDetails);
router.delete('/delete-costing-sheet-details/:id', protect, costingSheetController.deleteCostingSheetDetails);


module.exports = router;
