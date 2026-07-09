const QuotationModel = require("../../models/quotation/Quotation.model");

// ======================================================
// @desc    Get All Quotations
// @route   GET /api/Quotation/get-Quotation-details
// @access  Private
// ======================================================
exports.getQuotationDetails = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";

    const skip = (page - 1) * limit;

    let filter = {};

    if (search) {
      filter = {
        quotation_no: {
          $regex: search,
          $options: "i",
        },
      };
    }

    const totalRecords = await QuotationModel.countDocuments(filter);

    const quotations = await QuotationModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("client", "name")
      .populate("product", "name")
      .populate("product_category", "name")
      .populate("price", "current_price")
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      data: quotations,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get Quotations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch quotations",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Create Quotation
// @route   POST /api/Quotation/manage-Quotation-details
// @access  Private
// ======================================================
exports.manageQuotationDetails = async (req, res) => {
  try {
    const {
      quotation_no,
      client,
      product,
      product_category,
      price,
      snapshot,
      tax,
      grand_total,
      status,
    } = req.body;

    if (
      !quotation_no ||
      !client ||
      !product ||
      !product_category ||
      !price ||
      snapshot == null ||
      tax == null ||
      grand_total == null
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingQuotation = await QuotationModel.findOne({
      quotation_no,
    });

    if (existingQuotation) {
      return res.status(400).json({
        success: false,
        message: "Quotation number already exists",
      });
    }

    const quotation = await QuotationModel.create({
      quotation_no,
      client,
      product,
      product_category,
      price,
      snapshot,
      tax,
      grand_total,
      status,
      createdBy: req.admin?._id || req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Quotation created successfully",
      data: quotation,
    });
  } catch (error) {
    console.error("Create Quotation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create quotation",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Update Quotation
// @route   PUT /api/Quotation/update-Quotation-details/:id
// @access  Private
// ======================================================
exports.updateQuotationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const quotation = await QuotationModel.findById(id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    if (req.body.quotation_no) {
      const exists = await QuotationModel.findOne({
        quotation_no: req.body.quotation_no,
        _id: { $ne: id },
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Quotation number already exists",
        });
      }
    }

    const updatedQuotation = await QuotationModel.findByIdAndUpdate(
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
      message: "Quotation updated successfully",
      data: updatedQuotation,
    });
  } catch (error) {
    console.error("Update Quotation Error:", error);

    if (error.name === "ValidationError") {
      const firstField = Object.keys(error.errors)[0];

      return res.status(400).json({
        success: false,
        field: firstField,
        message: error.errors[firstField]?.message,
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
      message: "Failed to update quotation",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Delete Quotation
// @route   DELETE /api/Quotation/delete-Quotation-details/:id
// @access  Private
// ======================================================
exports.deleteQuotationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const quotation = await QuotationModel.findById(id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    await QuotationModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Quotation deleted successfully",
    });
  } catch (error) {
    console.error("Delete Quotation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete quotation",
      error: error.message,
    });
  }
};