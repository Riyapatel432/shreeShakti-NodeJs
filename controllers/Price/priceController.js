const PriceProductModel = require("../../models/Price/Price.model");
const ProductModel = require("../../models/product/Product.model");
// ======================================================
// @desc    Get All PriceProducts
// @route   GET /api/PriceProduct/get-PriceProduct-details
// @access  Private
// ======================================================
exports.getPriceProductDetails = async (req, res) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const search = req.query.search?.trim() || "";

    const skip = (page - 1) * limit;

    let filter = {};

 if (search) {
  const products = await ProductModel.find({
    name: { $regex: search, $options: "i" },
  }).select("_id");

  const productIds = products.map((p) => p._id);

  filter = {
    product: { $in: productIds },
  };
}

    const totalRecords = await PriceProductModel.countDocuments(filter);

    const PriceProducts = await PriceProductModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
       .populate({
    path: "product",
    select: "name moc",
    populate: {
      path: "moc",
      select: "name", // add other fields if needed
    },
  })
      .populate("product_category", "name")
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      data: PriceProducts,
      pagination:{
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get PriceProducts Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch PriceProducts",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Create PriceProduct
// @route   POST /api/PriceProduct/manage-PriceProduct-details
// @access  Private
// ======================================================
exports.managePriceProductDetails = async (req, res) => {
  try {
    const {
      product,
      product_category,
      effective_date,
      current_price,
      status,
    } = req.body;

    // ---------------- Validation ----------------
    if (
      !product ||
      !effective_date ||
      !current_price ||
      !product_category
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ---------------- Duplicate Checks ----------------
    const existingproduct = await PriceProductModel.findOne({
      effective_date: effective_date.toLowerCase()
    });

    if (existingproduct) {
      return res.status(400).json({
        success: false,
        message: "Product already exists",
      });
    }

    // ---------------- Create ----------------
    const PriceProduct = await PriceProductModel.create({
      product,
      product_category,
      effective_date,
      current_price,
      status,
      createdBy: req.admin?._id || req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "PriceProduct created successfully",
      data: PriceProduct,
    });
  } catch (error) {
    console.error("Create PriceProduct Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create PriceProduct",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Update PriceProduct
// @route   PUT /api/PriceProduct/update-PriceProduct-details/:id
// @access  Private
// ======================================================
exports.updatePriceProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Update PriceProduct ID:", id);

    const PriceProduct = await PriceProductModel.findById(id);

    if (!PriceProduct) {
      return res.status(404).json({
        success: false,
        message: "PriceProduct not found",
      });
    }

    // Duplicate email
    if (req.body.effective_date) {
      const productExists = await PriceProductModel.findOne({
        effective_date: req.body.effective_date.trim().toLowerCase(),
        _id: { $ne: id },
      });

      if (productExists) {
        return res.status(400).json({
          success: false,
          message: "product already exists",
        });
      }
    }

    

    const updatedPriceProduct = await PriceProductModel.findByIdAndUpdate(
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
      message: "PriceProduct updated successfully",
      data: updatedPriceProduct,
    });

  } catch (error) {
    console.error("Update PriceProduct Error:", error);

    // Handle Mongoose validation errors
    if (error.product === "ValidationError") {
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
      message: "Failed to update PriceProduct",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Delete PriceProduct
// @route   DELETE /api/PriceProduct/delete-PriceProduct-details/:id
// @access  Private
// ======================================================
exports.deletePriceProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const PriceProduct = await PriceProductModel.findById(id);

    if (!PriceProduct) {
      return res.status(404).json({
        success: false,
        message: "PriceProduct not found",
      });
    }

    await PriceProductModel.deleteOne();

    return res.status(200).json({
      success: true,
      message: "PriceProduct deleted successfully",
    });
  } catch (error) {
    console.error("Delete PriceProduct Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete PriceProduct",
      error: error.message,
    });
  }
};