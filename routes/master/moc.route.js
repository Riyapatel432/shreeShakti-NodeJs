const express = require('express');
const router = express.Router();
const MOCController = require("../../controllers/master/moc.controller");
const { protect } = require('../../middleware/authMiddleware');

console.log("MOC routes loaded");
// All routes require JWT
router.get('/get-moc-details',protect, MOCController.getMOCDetails);
router.post('/manage-moc-details', protect, MOCController.manageMOCDetails);
router.put('/update-moc-details/:id',protect, MOCController.updateMOCDetails);
router.delete('/delete-moc-details/:id', protect, MOCController.deleteMOCDetails);

module.exports = router;
