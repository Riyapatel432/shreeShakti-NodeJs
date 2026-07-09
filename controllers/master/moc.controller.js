const MOCModel = require("../../models/master/MOC.model");

// ======================================================
// @desc    Get All MOCs
// @route   GET /api/MOC/get-MOC-details
// @access  Private
// ======================================================
exports.getMOCDetails = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
 const { status } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
  if (status !== undefined) {
      filter.status = status === "true";
    }
    if (search) {
      filter = {
        name: { $regex: search, $options: "i" },
      };
    }

    const totalRecords = await MOCModel.countDocuments(filter);

    const MOCs = await MOCModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      data: MOCs,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get MOCs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch MOCs",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Create MOC
// @route   POST /api/MOC/manage-MOC-details
// @access  Private
// ======================================================
exports.manageMOCDetails = async (req, res) => {
  try {
    const { name, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "MOC name is required",
      });
    }

    const existingMOC = await MOCModel.findOne({
       name: new RegExp(`^${name.trim()}$`, "i"),
    });

    if (existingMOC) {
      return res.status(400).json({
        success: false,
        message: "MOC already exists",
      });
    }

    const MOC = await MOCModel.create({
      name: name.trim(),
      status,
      createdBy: req.admin?._id || req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "MOC created successfully",
      data: MOC,
    });
  } catch (error) {
    console.error("Create MOC Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create MOC",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Update MOC
// @route   PUT /api/MOC/update-MOC-details/:id
// @access  Private
// ======================================================
exports.updateMOCDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const MOC = await MOCModel.findById(id);

    if (!MOC) {
      return res.status(404).json({
        success: false,
        message: "MOC not found",
      });
    }

    if (req.body.name) {
      const MOCExists = await MOCModel.findOne({
        name: req.body.name.trim().toLowerCase(),
        _id: { $ne: id },
      });

      if (MOCExists) {
        return res.status(400).json({
          success: false,
          message: "MOC already exists",
        });
      }
    }

    const updatedMOC = await MOCModel.findByIdAndUpdate(
      id,
      {
        ...req.body,
        updatedBy: req.admin?._id || req.user?._id,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "MOC updated successfully",
      data: updatedMOC,
    });
  } catch (error) {
    console.error("Update MOC Error:", error);

    if (error.name === "ValidationError") {
      const firstField = Object.keys(error.errors)[0];

      return res.status(400).json({
        success: false,
        field: firstField,
        message:
          error.errors[firstField]?.message || "Validation failed",
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];

      return res.status(400).json({
        success: false,
        field,
        message: `${field} already exists`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update MOC",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Delete MOC
// @route   DELETE /api/MOC/delete-MOC-details/:id
// @access  Private
// ======================================================
exports.deleteMOCDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const MOC = await MOCModel.findById(id);

    if (!MOC) {
      return res.status(404).json({
        success: false,
        message: "MOC not found",
      });
    }

    await MOCModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "MOC deleted successfully",
    });
  } catch (error) {
    console.error("Delete MOC Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete MOC",
      error: error.message,
    });
  }
};