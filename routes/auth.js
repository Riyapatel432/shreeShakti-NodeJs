const express = require('express');
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login',     authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password',  authController.resetPassword);

// Private routes (JWT required)
router.get('/get-profile', protect, authController.getProfile);

module.exports = router;
