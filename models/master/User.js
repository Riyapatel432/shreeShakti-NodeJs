const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, unique: true },
  phone: { type: String },
  role: { type: String, default: 'User' }, // e.g., Admin, User, Employee
  status: { type: String, default: 'Active', enum: ['Active', 'Inactive'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('User', userSchema);
