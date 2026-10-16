const Project = require("../../models/master/Project.model");

// GET /api/project
exports.getProjects = async (req, res) => {
  try {
    const { client, status } = req.query;
    let query = { isDeleted: false };
    
    if (client) query.client = client;
    if (status) query.status = status;

    const projects = await Project.find(query)
      .populate("client", "company_name name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/project/:id
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, isDeleted: false })
      .populate("client", "company_name name email phone");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/project
exports.createProject = async (req, res) => {
  try {
    const projectData = { ...req.body };
    if (req.admin) projectData.createdBy = req.admin._id;
    else if (req.user) projectData.createdBy = req.user._id;

    const newProject = await Project.create(projectData);
    
    const populatedProject = await Project.findById(newProject._id)
      .populate("client", "company_name name");

    res.status(201).json({ success: true, data: populatedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/project/:id
exports.updateProject = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.admin) updateData.updatedBy = req.admin._id;
    else if (req.user) updateData.updatedBy = req.user._id;

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("client", "company_name name");

    if (!updated) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/project/:id
exports.deleteProject = async (req, res) => {
  try {
    const deleted = await Project.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
