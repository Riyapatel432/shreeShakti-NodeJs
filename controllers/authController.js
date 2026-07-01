const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Admin = require('../models/Admin');
const LoginLog = require('../models/LoginLog');
const PasswordResetToken = require('../models/PasswordResetToken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_shreeshakti';

// ─────────────────────────────────────────────────────────────
// @desc    Admin Login
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────
const login = async (req, res) => {
  console.log("heloo===>");
  const { email, password } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || '';

  try {
  console.log("in tryy helloo===>");

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
  console.log("admin===>", admin);

    if (!admin) {
      await LoginLog.create({ email, status: 'failed', ipAddress: ip, userAgent: ua });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: 'Account is deactivated. Contact super admin.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      await LoginLog.create({ adminId: admin._id, email, status: 'failed', ipAddress: ip, userAgent: ua });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    admin.lastLogin = new Date();
    await admin.save();

    await LoginLog.create({
      adminId: admin._id,
      email: admin.email,
      role: admin.role,
      status: 'success',
      ipAddress: ip,
      userAgent: ua
    });

    const token = jwt.sign(
      { id: admin._id, role: admin.role, email: admin.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log("tolen===============>",token);
res.cookie("token", token, {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000, // 1 day
});
    console.log(`✅ Admin login: ${admin.email} at ${new Date().toISOString()}`);

    return res.json({
     success: true,
      user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get current logged-in admin profile
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  res.json({
    success: true,
    user: req.admin,
  });
};

// ─────────────────────────────────────────────────────────────
// @desc    Forgot Password — generate reset token
// @route   POST /api/auth/forgot-password
// @access  Public
// ─────────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      // Security: always send success response even if email not found
      return res.json({ message: 'If that email exists, a reset token has been generated.' });
    }

    // Invalidate old tokens for this admin
    await PasswordResetToken.updateMany({ adminId: admin._id, used: false }, { used: true });

    // Generate a secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await PasswordResetToken.create({
      adminId: admin._id,
      token: rawToken,
      expiresAt
    });

    // In production: send this token via email
    // For now, return it in response (development mode)
    console.log(`🔑 Reset token for ${admin.email}: ${rawToken}`);

    return res.json({
      message: 'Password reset token generated successfully.',
      // ⚠️ Remove resetToken from response in production — send via email instead
      resetToken: rawToken,
      expiresAt,
      note: 'Use this token with POST /api/auth/reset-password'
    });

  } catch (err) {
    console.error('Forgot password error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Reset Password using token
// @route   POST /api/auth/reset-password
// @access  Public
// ─────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Find valid token
    const resetRecord = await PasswordResetToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password and update admin
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await Admin.findByIdAndUpdate(resetRecord.adminId, { password: hashedPassword });

    // Mark token as used
    resetRecord.used = true;
    await resetRecord.save();

    console.log(`✅ Password reset for adminId: ${resetRecord.adminId}`);

    return res.json({ message: 'Password has been reset successfully. Please login with your new password.' });

  } catch (err) {
    console.error('Reset password error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login, getProfile, forgotPassword, resetPassword };
