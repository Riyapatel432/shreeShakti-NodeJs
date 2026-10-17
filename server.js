const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
  process.exit(1);
}
const apiRoutes = require("./routes");
const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Disable caching for all API responses to prevent stale data issues
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

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
app.use("/api", apiRoutes);
// Health check
app.get("/", (req, res) =>
  res.json({ status: "Shree Shakti ERP API running ✅" })
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);