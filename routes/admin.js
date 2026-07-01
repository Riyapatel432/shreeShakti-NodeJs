const express = require('express');
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect } = require('../middleware/authMiddleware');

console.log("✅ admin routes loaded");
// All routes require JWT
router.get('/profile',protect, adminController.getProfile);
router.put('/update-profile',protect, adminController.updateProfile);
router.put('/change-password', protect, adminController.changePassword);

module.exports = router;
