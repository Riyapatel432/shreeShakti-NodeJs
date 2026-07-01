const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const JWT_SECRET =
  process.env.JWT_SECRET || "supersecretkey_shreeshakti";

const protect = async (req, res, next) => {
  try {
    // ✅ Read token from cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "No token provided. Access denied.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select(
      "-password"
    );

    if (!admin) {
      return res.status(401).json({
        message: "Admin not found. Token invalid.",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        message: "Account is deactivated.",
      });
    }

    req.admin = admin;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

module.exports = { protect };