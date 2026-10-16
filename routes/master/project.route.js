const express = require("express");
const router = express.Router();
const projectController = require("../../controllers/master/projectController");
const { protect, isAdmin } = require("../../middleware/authMiddleware");

// All project routes require authentication
router.use(protect);

router.get("/", projectController.getProjects);
router.get("/:id", projectController.getProjectById);
router.post("/", projectController.createProject);
router.put("/:id", projectController.updateProject);

// Only admins can delete projects
router.delete("/:id", isAdmin, projectController.deleteProject);

module.exports = router;
