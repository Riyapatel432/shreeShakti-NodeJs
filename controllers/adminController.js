const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

// ─────────────────────────────────────────────────────────────
// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private
// ─────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    return res.json({ admin: req.admin });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update admin name and/or email
// @route   PUT /api/admin/profile
// @access  Private
// ─────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  const { name, email } = req.body;

  try {
    if (!name && !email) {
      return res.status(400).json({ message: 'Provide at least name or email to update' });
    }

    const updates = {};

    if (name) {
      if (name.trim().length < 2) {
        return res.status(400).json({ message: 'Name must be at least 2 characters' });
      }
      updates.name = name.trim();
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      // Check if email is already taken by another admin
      const emailTaken = await Admin.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.admin._id },
        isDeleted: false
      });

      if (emailTaken) {
        return res.status(409).json({ message: 'Email is already in use by another admin' });
      }

      updates.email = email.toLowerCase();
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.admin._id,
      { $set: updates },
      { new: true }
    ).select('-password');

    console.log(`✅ Profile updated for admin: ${updatedAdmin.email}`);

    return res.json({
      message: 'Profile updated successfully',
      admin: updatedAdmin
    });

  } catch (err) {
    console.error('Update profile error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Change password (authenticated)
// @route   PUT /api/admin/change-password
// @access  Private
// ─────────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Fetch full admin record (with password)
    const admin = await Admin.findById(req.admin._id);

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    console.log(`✅ Password changed for admin: ${admin.email}`);

    return res.json({ message: 'Password changed successfully' });

  } catch (err) {
    console.error('Change password error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile, changePassword };
