const express = require('express');
const router = express.Router();
const standardsController = require("../../controllers/master/standardsController");
const { protect } = require('../../middleware/authMiddleware');

// NB Sizes
router.get('/nb-sizes', protect, standardsController.getNBSizes);
router.post('/nb-sizes', protect, standardsController.addNBSize);
router.put('/nb-sizes/:id', protect, standardsController.updateNBSize);
router.delete('/nb-sizes/:id', protect, standardsController.deleteNBSize);

// Pipe Schedules
router.get('/pipe-schedules', protect, standardsController.getPipeSchedules);
router.post('/pipe-schedules', protect, standardsController.addPipeSchedule);
router.put('/pipe-schedules/:id', protect, standardsController.updatePipeSchedule);
router.delete('/pipe-schedules/:id', protect, standardsController.deletePipeSchedule);

// Tube ODs
router.get('/tube-ods', protect, standardsController.getTubeODs);
router.post('/tube-ods', protect, standardsController.addTubeOD);
router.put('/tube-ods/:id', protect, standardsController.updateTubeOD);
router.delete('/tube-ods/:id', protect, standardsController.deleteTubeOD);

// Flange Ratings
router.get('/flange-ratings', protect, standardsController.getFlangeRatings);
router.post('/flange-ratings', protect, standardsController.addFlangeRating);
router.put('/flange-ratings/:id', protect, standardsController.updateFlangeRating);
router.delete('/flange-ratings/:id', protect, standardsController.deleteFlangeRating);

// Dependencies endpoint
router.get('/dependencies', protect, standardsController.getDependencies);

module.exports = router;
