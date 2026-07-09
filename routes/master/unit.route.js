const express = require('express');
const router = express.Router();
const unitController = require("../../controllers/master/unitController");
const { protect } = require('../../middleware/authMiddleware');

console.log("unit routes loaded");
// All routes require JWT
router.get('/get-unit-details',protect, unitController.getUnitDetails);
router.post('/manage-unit-details', protect, unitController.manageUnitDetails);
router.put('/update-unit-details/:id',protect, unitController.updateUnitDetails);
router.delete('/delete-unit-details/:id', protect, unitController.deleteUnitDetails);

module.exports = router;
