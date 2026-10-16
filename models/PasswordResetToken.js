const mongoose = require('mongoose');

const passwordResetTokenSchema = new mongoose.Schema({
  adminId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  token:     { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used:      { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
