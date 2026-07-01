const Client = require("../../models/master/Client.model");

// ======================================================
// @desc    Get All Clients
// @route   GET /api/client/get-client-details
// @access  Private
// ======================================================
exports.getClientDetails = async (req, res) => {
  try {
    const clients = await Client.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (error) {
    console.error("Get Clients Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch clients",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Create Client
// @route   POST /api/client/manage-client-details
// @access  Private
// ======================================================
exports.manageClientDetails = async (req, res) => {
  try {
    const {
      name,
      email,
      company_name,
      phone,
      gst_no,
      address,
      city,
      state,
      status,
    } = req.body;

    // ---------------- Validation ----------------
    if (
      !name ||
      !email ||
      !company_name ||
      !phone ||
      !gst_no ||
      !address ||
      !city ||
      !state
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ---------------- Duplicate Checks ----------------
    const existingEmail = await Client.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const existingGST = await Client.findOne({
      gst_no: gst_no.toUpperCase(),
    });

    if (existingGST) {
      return res.status(400).json({
        success: false,
        message: "GST number already exists",
      });
    }

    const existingCompany = await Client.findOne({
      company_name,
    });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: "Company already exists",
      });
    }

    // ---------------- Create ----------------
    const client = await Client.create({
      name,
      email,
      company_name,
      phone,
      gst_no,
      address,
      city,
      state,
      status,
      createdBy: req.admin?._id || req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Client created successfully",
      data: client,
    });
  } catch (error) {
    console.error("Create Client Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create client",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Update Client
// @route   PUT /api/client/update-client-details/:id
// @access  Private
// ======================================================
exports.updateClientDetails = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Update Client ID:", id);

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Duplicate email
    if (req.body.email) {
      const emailExists = await Client.findOne({
        email: req.body.email.toLowerCase(),
        _id: { $ne: id },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Duplicate GST
    if (req.body.gst_no) {
      const gstExists = await Client.findOne({
        gst_no: req.body.gst_no.toUpperCase(),
        _id: { $ne: id },
      });

      if (gstExists) {
        return res.status(400).json({
          success: false,
          message: "GST number already exists",
        });
      }
    }

    // Duplicate Company
    if (req.body.company_name) {
      const companyExists = await Client.findOne({
        company_name: req.body.company_name,
        _id: { $ne: id },
      });

      if (companyExists) {
        return res.status(400).json({
          success: false,
          message: "Company name already exists",
        });
      }
    }

    const updatedClient = await Client.findByIdAndUpdate(
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
      message: "Client updated successfully",
      data: updatedClient,
    });

  } catch (error) {
    console.error("Update Client Error:", error);

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
      message: "Failed to update client",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Delete Client
// @route   DELETE /api/client/delete-client-details/:id
// @access  Private
// ======================================================
exports.deleteClientDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    await client.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error("Delete Client Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete client",
      error: error.message,
    });
  }
};