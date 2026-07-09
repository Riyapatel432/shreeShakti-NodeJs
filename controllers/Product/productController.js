const ProductModel = require("../../models/product/Product.model");

// ======================================================
// @desc    Get All Products
// @route   GET /api/Product/get-Product-details
// @access  Private
// ======================================================
exports.getProductDetails = async (req, res) => {
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

    const totalRecords = await ProductModel.countDocuments(filter);

    const Products = await ProductModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
    .populate("unit", "name")
     .populate("moc", "name")
    .populate("product_category", "name")
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      data: Products,
      pagination:{
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Products",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Create Product
// @route   POST /api/Product/manage-Product-details
// @access  Private
// ======================================================
exports.manageProductDetails = async (req, res) => {
  try {
    const {
      name,
      product_category,
      description,
      moc,
      unit,
      hsn_code,
      status,
    } = req.body;

    // ---------------- Validation ----------------
    if (
      !name ||
      !product_category ||
      !description ||
       !moc ||
      !unit ||
      !hsn_code
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ---------------- Duplicate Checks ----------------
    const existingName = await ProductModel.findOne({
      name: new RegExp(`^${name.trim()}$`, "i"),
      product_category:product_category,
    });

    if (existingName) {
      return res.status(400).json({
        success: false,
        message: "Name already exists",
      });
    }

    // ---------------- Create ----------------
    const Product = await ProductModel.create({
      name,
      description,
        product_category,
        unit,
        moc,
        hsn_code,
      status,
      createdBy: req.admin?._id || req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: Product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create Product",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Update Product
// @route   PUT /api/Product/update-Product-details/:id
// @access  Private
// ======================================================
exports.updateProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Update Product ID:", id);

    const Product = await ProductModel.findById(id);

    if (!Product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Duplicate email
    if (req.body.name) {
      const nameExists = await ProductModel.findOne({
        name: req.body.name.trim().toLowerCase(),
        product_category: req.body.product_category,

        // _id: { $ne: id },
      });

      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: "Name already exists",
        });
      }
    }

    

    const updatedProduct = await ProductModel.findByIdAndUpdate(
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
      message: "Product updated successfully",
      data: updatedProduct,
    });

  } catch (error) {
    console.error("Update Product Error:", error);

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
      message: "Failed to update Product",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Delete Product
// @route   DELETE /api/Product/delete-Product-details/:id
// @access  Private
// ======================================================
exports.deleteProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const Product = await ProductModel.findById(id);

    if (!Product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await ProductModel.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete Product",
      error: error.message,
    });
  }
};