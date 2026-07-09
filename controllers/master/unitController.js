const UnitModel = require("../../models/master/Unit.model");

// ======================================================
// @desc    Get All Units
// @route   GET /api/unit/get-unit-details
// @access  Private
// ======================================================
exports.getUnitDetails = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
     const { status } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};

    if (search) {
      filter = {
        name: { $regex: search, $options: "i" },
      };
    }
    if (status !== undefined) {
      filter.status = status === "true";
    }
    const totalRecords = await UnitModel.countDocuments(filter);

    const units = await UnitModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      data: units,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get Units Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch units",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Create Unit
// @route   POST /api/unit/manage-unit-details
// @access  Private
// ======================================================
exports.manageUnitDetails = async (req, res) => {
  try {
    const { name, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Unit name is required",
      });
    }

    const existingUnit = await UnitModel.findOne({
        name: new RegExp(`^${name.trim()}$`, "i"),
    });

    if (existingUnit) {
      return res.status(400).json({
        success: false,
        message: "Unit already exists",
      });
    }

    const unit = await UnitModel.create({
      name: name.trim(),
      status,
      createdBy: req.admin?._id || req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Unit created successfully",
      data: unit,
    });
  } catch (error) {
    console.error("Create Unit Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create unit",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Update Unit
// @route   PUT /api/unit/update-unit-details/:id
// @access  Private
// ======================================================
exports.updateUnitDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const unit = await UnitModel.findById(id);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found",
      });
    }

    if (req.body.name) {
      const unitExists = await UnitModel.findOne({
        name: req.body.name.trim().toLowerCase(),
        _id: { $ne: id },
      });

      if (unitExists) {
        return res.status(400).json({
          success: false,
          message: "Unit already exists",
        });
      }
    }

    const updatedUnit = await UnitModel.findByIdAndUpdate(
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
      message: "Unit updated successfully",
      data: updatedUnit,
    });
  } catch (error) {
    console.error("Update Unit Error:", error);

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
      message: "Failed to update unit",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Delete Unit
// @route   DELETE /api/unit/delete-unit-details/:id
// @access  Private
// ======================================================
exports.deleteUnitDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const unit = await UnitModel.findById(id);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found",
      });
    }

    await UnitModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Unit deleted successfully",
    });
  } catch (error) {
    console.error("Delete Unit Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete unit",
      error: error.message,
    });
  }
};