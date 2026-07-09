const ProductCategoryModel = require("../../models/master/ProductCategory.model");

// ======================================================
// @desc    Get All ProductCategorys
// @route   GET /api/ProductCategory/get-ProductCategory-details
// @access  Private
// ======================================================
exports.getProductCategoryDetails = async (req, res) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const search = req.query.search?.trim() || "";
    const { status } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status !== undefined) {
      filter.status = status === "true";
    }
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },

        ],
      };
    }

    const totalRecords = await ProductCategoryModel.countDocuments(filter);

    const ProductCategorys = await ProductCategoryModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      data: ProductCategorys,
      pagination:{
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get ProductCategorys Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch ProductCategorys",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Create ProductCategory
// @route   POST /api/ProductCategory/manage-ProductCategory-details
// @access  Private
// ======================================================
exports.manageProductCategoryDetails = async (req, res) => {
  try {
    const {
      name,
      description,   
      status,
    } = req.body;

    // ---------------- Validation ----------------
    if (
      !name ||
      !description
     
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ---------------- Duplicate Checks ----------------
    // const existingName = await ProductCategoryModel.findOne({
    //   name: name.toLowerCase(),
    // });
const existingName = await ProductCategoryModel.findOne({
  name: new RegExp(`^${name.trim()}$`, "i"),
});
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: "Name already exists",
      });
    }

    // ---------------- Create ----------------
    const ProductCategory = await ProductCategoryModel.create({
      name,
      description,
      status,
      createdBy: req.admin?._id || req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "ProductCategory created successfully",
      data: ProductCategory,
    });
  } catch (error) {
    console.error("Create ProductCategory Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create ProductCategory",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Update ProductCategory
// @route   PUT /api/ProductCategory/update-ProductCategory-details/:id
// @access  Private
// ======================================================
exports.updateProductCategoryDetails = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Update ProductCategory ID:", id);

    const ProductCategory = await ProductCategoryModel.findById(id);

    if (!ProductCategory) {
      return res.status(404).json({
        success: false,
        message: "ProductCategory not found",
      });
    }

    // Duplicate email
    if (req.body.name) {
      const nameExists = await ProductCategoryModel.findOne({
        name: req.body.name.toLowerCase(),
        _id: { $ne: id },
      });

      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: "Name already exists",
        });
      }
    }

    

    const updatedProductCategory = await ProductCategoryModel.findByIdAndUpdate(
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
      message: "ProductCategory updated successfully",
      data: updatedProductCategory,
    });

  } catch (error) {
    console.error("Update ProductCategory Error:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const firstField = Object.keys(error.errors)[0];
      return res.status(400).json({
        success: false,
        field: firstField,
        message: error.errors[firstField]?.message || "Validation failed",
      });
    }

    // Handle duplicate key errors (unique index violation)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        field: field,
        message: `${field} already exists`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update ProductCategory",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Delete ProductCategory
// @route   DELETE /api/ProductCategory/delete-ProductCategory-details/:id
// @access  Private
// ======================================================
exports.deleteProductCategoryDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const ProductCategory = await ProductCategoryModel.findById(id);

    if (!ProductCategory) {
      return res.status(404).json({
        success: false,
        message: "ProductCategory not found",
      });
    }

    await ProductCategoryModel.deleteOne();

    return res.status(200).json({
      success: true,
      message: "ProductCategory deleted successfully",
    });
  } catch (error) {
    console.error("Delete ProductCategory Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete ProductCategory",
      error: error.message,
    });
  }
};