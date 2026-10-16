const express = require('express');
const router = express.Router();
const materialController = require("../../controllers/master/materialController");
const { protect } = require('../../middleware/authMiddleware');

router.get('/get-material-details', protect, materialController.getMaterialDetails);
router.get('/low-stock', protect, materialController.getLowStockMaterials);
router.get('/:id/ledger', protect, materialController.getMaterialLedger);
router.post('/manage-material-details', protect, materialController.manageMaterialDetails);
router.put('/update-material-details/:id', protect, materialController.updateMaterialDetails);
router.delete('/delete-material-details/:id', protect, materialController.deleteMaterialDetails);
router.post('/:id/stock-movement', protect, materialController.recordStockMovement);

module.exports = router;
