const express = require('express');
const router = express.Router();
const userController = require('../../controllers/master/userController');
const { protect, isAdmin } = require('../../middleware/authMiddleware');

router.post('/manage-user-details', protect, isAdmin, userController.createUser);
router.get('/get-user-details', protect, isAdmin, userController.getUsers);
router.put('/update-user-details/:id', protect, isAdmin, userController.updateUser);
router.delete('/delete-user-details/:id', protect, isAdmin, userController.deleteUser);

module.exports = router;
