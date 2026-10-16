const express = require('express');
const router = express.Router();
const materialCategoryController = require("../../controllers/master/materialCategoryController");
const { protect } = require('../../middleware/authMiddleware');

router.get('/get-material-category-details', protect, materialCategoryController.getMaterialCategoryDetails);
router.post('/manage-material-category-details', protect, materialCategoryController.manageMaterialCategoryDetails);
router.put('/update-material-category-details/:id', protect, materialCategoryController.updateMaterialCategoryDetails);
router.delete('/delete-material-category-details/:id', protect, materialCategoryController.deleteMaterialCategoryDetails);

module.exports = router;
