const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema({
  adminId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: false },
  email:     { type: String, required: true },
  role:      { type: String, default: 'Admin' },
  ipAddress: { type: String },
  userAgent: { type: String },
  status:    { type: String, enum: ['success', 'failed'], default: 'success' },
  loginAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('LoginLog', loginLogSchema);
