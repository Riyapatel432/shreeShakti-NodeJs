const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, default: 'Admin' },
  isActive: { type: Boolean, default: true },
  isDeleted:{ type: Boolean, default: false },
  lastLogin:{ type: Date },
  createdAt:{ type: Date, default: Date.now }
});

module.exports = mongoose.model('Admin', adminSchema);
