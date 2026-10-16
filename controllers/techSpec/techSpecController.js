const TechSpec = require("../../models/techSpec/TechSpec.model");
const CostingSheet = require("../../models/costingSheet/CostingSheet.model");

// GET /api/tech-specs
exports.getTechSpecs = async (req, res) => {
  try {
    const { client, project, status } = req.query;
    let query = { isDeleted: false };
    
    if (client) query.client = client;
    if (project) query.project = project;
    if (status) query.status = status;

    const specs = await TechSpec.find(query)
      .populate("client", "company_name")
      .populate("project", "projectName")
      .populate("costingSheet", "product_category createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: specs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/tech-specs/:id
exports.getTechSpecById = async (req, res) => {
  try {
    const spec = await TechSpec.findOne({ _id: req.params.id, isDeleted: false })
      .populate("client", "company_name name email phone address")
      .populate("project", "projectName")
      .populate("costingSheet");

    if (!spec) {
      return res.status(404).json({ success: false, message: "Tech Spec not found" });
    }

    res.status(200).json({ success: true, data: spec });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/tech-specs/generate
exports.generateFromCostingSheet = async (req, res) => {
  try {
    const { costingSheetId } = req.body;
    
    if (!costingSheetId) {
      return res.status(400).json({ success: false, message: "Costing Sheet ID is required" });
    }

    const sheet = await CostingSheet.findById(costingSheetId).populate("line_items.moc");
    if (!sheet) {
      return res.status(404).json({ success: false, message: "Costing Sheet not found" });
    }

    // Try to derive a primary MOC from the line items (e.g., the first or most prominent one)
    let primaryMoc = "";
    if (sheet.line_items && sheet.line_items.length > 0) {
      const mocNames = sheet.line_items.map(item => item.moc?.name).filter(Boolean);
      // Assuming the first item is often the primary shell/body material
      if (mocNames.length > 0) primaryMoc = mocNames[0];
    }

    // Map design inputs to category details directly (assuming similar structure)
    let categoryDetails = sheet.design_inputs || {};

    const newSpec = await TechSpec.create({
      costingSheet: sheet._id,
      client: sheet.client,
      project: sheet.project,
      product_category: sheet.product_category,
      
      moc: {
        shell: primaryMoc,
        head: primaryMoc,
        nozzles: primaryMoc
      },
      categoryDetails: categoryDetails,
      createdBy: req.admin?._id || req.user?._id
    });

    res.status(201).json({ success: true, data: newSpec });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/tech-specs/:id
exports.updateTechSpec = async (req, res) => {
  try {
    const currentSpec = await TechSpec.findById(req.params.id);
    if (!currentSpec) {
      return res.status(404).json({ success: false, message: "Tech Spec not found" });
    }

    // Always bump revision if it's already 'Issued' or based on some logic. 
    // Here we'll just increment it on every major save for simplicity, 
    // or rely on frontend to pass a flag if they want a revision bump.
    // For now, let's increment if it's changing from Issued to something else, or just allow manual updating.
    let updateData = { ...req.body, updatedBy: req.admin?._id || req.user?._id };
    
    // If the frontend explicitly requested a revision bump (e.g. by passing incrementRevision=true)
    if (req.body.incrementRevision) {
        updateData.revisionNumber = currentSpec.revisionNumber + 1;
        // Optionally reset status to Draft when revising
        updateData.status = "Draft";
    }

    const updated = await TechSpec.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate("client", "company_name")
    .populate("costingSheet", "product_category");

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/tech-specs/:id
exports.deleteTechSpec = async (req, res) => {
  try {
    await TechSpec.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
