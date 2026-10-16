const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    company_name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9]{10}$/, "Phone number must be exactly 10 digits"],
    },

    gst_no: {
      type: String,
      required: [true, "GST number is required"],
      trim: true,
      uppercase: true,
      match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST number format"],
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },

    status: {
      type: Boolean,
      default: true,
    },

    isClient: {
      type: Boolean,
      default: true,
    },

    isVendor: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Client", clientSchema);