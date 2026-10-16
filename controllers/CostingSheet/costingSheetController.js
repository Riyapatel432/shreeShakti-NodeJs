
const ProductModel = require("../../models/product/Product.model");
const CostingSheetModel = require("../../models/costingSheet/CostingSheet.model");
const ProductCategoryModel = require("../../models/master/ProductCategory.model");
// ======================================================
// @desc    Get All CostingSheets
// @route   GET /api/CostingSheet/get-CostingSheet-details
// @access  Private
// ======================================================
exports.getCostingSheetDetails = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";

    const skip = (page - 1) * limit;

    let filter = {};

    if (search) {
      const products = await ProductModel.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      const categories = await ProductCategoryModel.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");


      filter = {
        $or: [
          {
            product: {
              $in: products.map((p) => p._id),
            },
          },
          {
            product_category: {
              $in: categories.map((c) => c._id),
            },
          },
        ],
      };
    }


    const totalRecords =
      await CostingSheetModel.countDocuments(filter);


    const costingSheets = await CostingSheetModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

      // Product + MOC
      .populate({
        path: "product",
        select: "name moc",
        populate: {
          path: "moc",
          select: "name",
        },
      })

      // Category
      .populate(
        "product_category",
        "name"
      )

      // Created By
      .populate(
        "createdBy",
        "name email"
      )

      // MOC field from costing sheet
      .populate(
        "moc",
        "name"
      );


    return res.status(200).json({
      success: true,
      data: costingSheets,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        limit,
      },
    });


  } catch (error) {

    console.error(
      "Get CostingSheet Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch CostingSheet",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Create CostingSheet
// @route   POST /api/CostingSheet/manage-CostingSheet-details
// @access  Private
// ======================================================
exports.manageCostingSheetDetails = async (req, res) => {
  try {
    const {
      product_category,
      product,
      moc,
      dimensions,
      qty,
      rate,
      amount,
      status,
    } = req.body;

    // ---------------- Validation ----------------
    if (
      !product_category ||
      !product ||
      !moc ||
      qty === undefined ||
      rate === undefined ||
      amount === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory",
      });
    }

    // ---------------- Duplicate Check ----------------
    // const existing = await CostingSheetModel.findOne({
    //   product_category,
    //   product,
    //   status: true,
    // });

    // if (existing) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "This product already exists in the costing sheet.",
    //   });
    // }

    // ---------------- Create ----------------
    const costingSheet = await CostingSheetModel.create({
      product_category,
      product,
      moc,

      dimensions: {
        od: dimensions?.od || 0,
        id: dimensions?.id || 0,
        l: dimensions?.l || 0,
        w: dimensions?.w || 0,
        thk: dimensions?.thk || 0,
        nos: dimensions?.nos || 0,
        std: dimensions?.std || 0,
      },

      qty,
      rate,
      amount,
      status,

      createdBy: req.admin?._id || req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Costing Sheet created successfully",
      data: costingSheet,
    });
  } catch (error) {
    console.error("Create Costing Sheet Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create Costing Sheet",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Update CostingSheet
// @route   PUT /api/CostingSheet/update-CostingSheet-details/:id
// @access  Private
// ======================================================
exports.updateCostingSheetDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const costingSheet = await CostingSheetModel.findById(id);

    if (!costingSheet) {
      return res.status(404).json({
        success: false,
        message: "Costing Sheet not found",
      });
    }

    const {
      product_category,
      product,
      moc,
      dimensions,
      qty,
      rate,
      amount,
      status,
    } = req.body;

    // Duplicate check
    // const existing = await CostingSheetModel.findOne({
    //   product_category,
    //   product,
    //   _id: { $ne: id },
    // });

    // if (existing) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "This product already exists in the costing sheet.",
    //   });
    // }

    const updatedCostingSheet = await CostingSheetModel.findByIdAndUpdate(
      id,
      {
        product_category,
        product,
        moc,

        dimensions: {
          od: dimensions?.od || 0,
          id: dimensions?.id || 0,
          l: dimensions?.l || 0,
          w: dimensions?.w || 0,
          thk: dimensions?.thk || 0,
          nos: dimensions?.nos || 0,
          std: dimensions?.std || 0,
        },

        qty,
        rate,
        amount,
        status,
        updatedBy: req.admin?._id || req.user?._id,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Costing Sheet updated successfully",
      data: updatedCostingSheet,
    });
  } catch (error) {
    console.error("Update Costing Sheet Error:", error);

    if (error.name === "ValidationError") {
      const firstField = Object.keys(error.errors)[0];

      return res.status(400).json({
        success: false,
        field: firstField,
        message: error.errors[firstField].message,
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
      message: "Failed to update Costing Sheet",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Delete CostingSheet
// @route   DELETE /api/CostingSheet/delete-CostingSheet-details/:id
// @access  Private
// ======================================================
exports.deleteCostingSheetDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const costingSheet = await CostingSheetModel.findById(id);

    if (!costingSheet) {
      return res.status(404).json({
        success: false,
        message: "Costing Sheet not found",
      });
    }

    await CostingSheetModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Costing Sheet deleted successfully",
    });
  } catch (error) {
    console.error("Delete Costing Sheet Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete Costing Sheet",
      error: error.message,
    });
  }
};