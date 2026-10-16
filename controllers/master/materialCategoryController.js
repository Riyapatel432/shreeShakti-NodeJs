const MaterialCategoryModel = require("../../models/master/MaterialCategory.model");

exports.getMaterialCategoryDetails = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";

    const skip = (page - 1) * limit;

    let filter = { isDeleted: false };
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const totalRecords = await MaterialCategoryModel.countDocuments(filter);

    const categories = await MaterialCategoryModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      data: categories,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch material categories", error: error.message });
  }
};

exports.manageMaterialCategoryDetails = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const existing = await MaterialCategoryModel.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      isDeleted: false,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const category = await MaterialCategoryModel.create({
      name: name.trim(),
      description,
      status,
      createdBy: req.admin?._id || req.user?._id,
    });

    return res.status(201).json({ success: true, message: "Category created successfully", data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to create category", error: error.message });
  }
};

exports.updateMaterialCategoryDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const category = await MaterialCategoryModel.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    if (name) {
      const exists = await MaterialCategoryModel.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        _id: { $ne: id },
        isDeleted: false,
      });

      if (exists) {
        return res.status(400).json({ success: false, message: "Category already exists" });
      }
    }

    const updated = await MaterialCategoryModel.findByIdAndUpdate(
      id,
      { name: name ? name.trim() : undefined, description, status, updatedBy: req.admin?._id || req.user?._id },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ success: true, message: "Category updated successfully", data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update category", error: error.message });
  }
};

exports.deleteMaterialCategoryDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await MaterialCategoryModel.findById(id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    await MaterialCategoryModel.findByIdAndUpdate(id, { isDeleted: true });
    return res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
