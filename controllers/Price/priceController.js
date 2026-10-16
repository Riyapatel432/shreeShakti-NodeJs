const PriceProductModel = require("../../models/Price/Price.model");
const MOCModel = require("../../models/master/MOC.model");

exports.getPriceProductDetails = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";

    const skip = (page - 1) * limit;

    let filter = { isDeleted: false };

    if (search) {
      const mocs = await MOCModel.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      const mocIds = mocs.map((m) => m._id);

      filter = {
        moc: { $in: mocIds },
      };
    }

    const totalRecords = await PriceProductModel.countDocuments(filter);

    const PriceProducts = await PriceProductModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "product", select: "name product_category moc", populate: [ { path: "product_category", select: "name" }, { path: "moc", select: "name" } ] })
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      data: PriceProducts,
      pagination: {
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

exports.managePriceProductDetails = async (req, res) => {
  try {
    const {
      product,
      moc,
      effective_date,
      current_price,
      status,
    } = req.body;

    if (!product || !moc || !effective_date || !current_price) {
      return res.status(400).json({
        success: false,
        message: "MOC, effective date, and price are required",
      });
    }

    const existingPrice = await PriceProductModel.findOne({
      product,
      effective_date,
      isDeleted: false,
    });

    if (existingPrice) {
      return res.status(400).json({
        success: false,
        message: "Price already exists for this Product on this Effective Date",
      });
    }

    const PriceProduct = await PriceProductModel.create({
      product,
      moc,
      effective_date,
      current_price,
      status,
      createdBy: req.admin?._id || req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Price created successfully",
      data: PriceProduct,
    });
  } catch (error) {
    console.error("Create Price Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create Price",
      error: error.message,
    });
  }
};

exports.updatePriceProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { product, moc, effective_date, current_price, status } = req.body;

    const PriceProduct = await PriceProductModel.findById(id);

    if (!PriceProduct) {
      return res.status(404).json({
        success: false,
        message: "Price not found",
      });
    }

    if (effective_date) {
      const exists = await PriceProductModel.findOne({
        effective_date,
        moc: moc || PriceProduct.moc,
        _id: { $ne: id },
        isDeleted: false,
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "A price for this MOC on this date already exists",
        });
      }
    }

    const updatedPriceProduct = await PriceProductModel.findByIdAndUpdate(
      id,
      {
        moc, effective_date, current_price, status,
        updatedBy: req.admin?._id || req.user?._id,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Price updated successfully",
      data: updatedPriceProduct,
    });
  } catch (error) {
    console.error("Update Price Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update Price",
      error: error.message,
    });
  }
};

exports.deletePriceProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const price = await PriceProductModel.findById(id);

    if (!price) {
      return res.status(404).json({ success: false, message: "Price not found" });
    }

    await PriceProductModel.findByIdAndUpdate(id, { isDeleted: true });

    return res.status(200).json({ success: true, message: "Price deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};