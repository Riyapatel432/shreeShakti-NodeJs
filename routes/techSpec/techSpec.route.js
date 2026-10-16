const express = require('express');
const router = express.Router();
const techSpecController = require("../../controllers/techSpec/techSpecController");
const { protect } = require('../../middleware/authMiddleware');

router.get('/', protect, techSpecController.getTechSpecs);
router.post('/generate', protect, techSpecController.generateFromCostingSheet);
router.get('/:id', protect, techSpecController.getTechSpecById);
router.put('/:id', protect, techSpecController.updateTechSpec);
router.delete('/:id', protect, techSpecController.deleteTechSpec);

module.exports = router;
