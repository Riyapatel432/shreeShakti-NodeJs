const express = require('express');
const router = express.Router();
const clientController = require("../../controllers/master/clientController");
const { protect } = require('../../middleware/authMiddleware');

console.log("client routes loaded");
// All routes require JWT
router.get('/get-client-details',protect, clientController.getClientDetails);
router.post('/manage-client-details', protect, clientController.manageClientDetails);
router.put('/update-client-details/:id',protect, clientController.updateClientDetails);
router.delete('/delete-client-details/:id', protect, clientController.deleteClientDetails);


module.exports = router;
