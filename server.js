const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const clientRoutes = require("./routes/master/client.route");
const productCategoryRoutes = require("./routes/master/productCategory.route");
const productRoutes = require("./routes/product/product.route");
const unitRoutes = require("./routes/master/unit.route");
const mocRoutes = require("./routes/master/moc.route");
const priceProductRoutes = require("./routes/price/priceProduct.route");
const quotationRoutes = require("./routes/quotation/quotation.route");
const costingSheetRoutes = require("./routes/costingSheet/costingSheet.route");
const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // React app URL
    credentials: true,              // Allow cookies
  })
);

app.use(express.json());
app.use(cookieParser());

// MongoDB connection
mongoose
  .connect(
    process.env.MONGO_URI ||
      "mongodb://127.0.0.1:27017/shreeshakti_erp"
  )
  .then(() =>
    console.log("✅ MongoDB Connected to shreeshakti_erp")
  )
  .catch((err) =>
    console.error("❌ MongoDB connection error:", err.message)
  );

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/product-category", productCategoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/unit", unitRoutes);
app.use("/api/moc", mocRoutes);
app.use("/api/price", priceProductRoutes);
app.use("/api/costingSheet",costingSheetRoutes);
app.use("/api/quotation", quotationRoutes);
// Health check
app.get("/", (req, res) =>
  res.json({ status: "Shree Shakti ERP API running ✅" })
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);