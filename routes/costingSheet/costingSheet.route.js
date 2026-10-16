const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const costingSheetController = require("../../controllers/costingSheet/costingSheetController");

// All routes require JWT
router.get('/get-costing-sheet-details', protect, costingSheetController.getCostingSheetDetails);
router.get('/:id', protect, costingSheetController.getCostingSheetById);
router.post('/', protect, costingSheetController.createCostingSheet);
router.put('/:id', protect, costingSheetController.updateCostingSheetHeader);
router.put('/:id/line-items', protect, costingSheetController.updateLineItems);
router.put('/:id/rollup', protect, costingSheetController.updateRollup);
router.delete('/delete-costing-sheet-details/:id', protect, costingSheetController.deleteCostingSheetDetails);

module.exports = router;
