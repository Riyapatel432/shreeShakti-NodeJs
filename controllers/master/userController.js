const User = require('../../models/master/User');

// Create a new User
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, role, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ 
        success: false,
        message: 'Name and email are required', 
        field: 'name' 
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already exists', 
        field: 'email' 
      });
    }

    const user = new User({ 
      name, 
      email: email.toLowerCase(), 
      phone, 
      role: role || 'User', 
      status: status || 'Active' 
    });
    await user.save();

    res.status(201).json({ 
      success: true, 
      message: 'User created successfully', 
      data: user 
    });
  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error creating user' 
    });
  }
};

// Get all Users (with pagination and search)
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        totalRecords: total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a User
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, status } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: 'Email already exists', 
          field: 'email' 
        });
      }
    }

    user.name = name || user.name;
    user.email = email ? email.toLowerCase() : user.email;
    user.phone = phone !== undefined ? phone : user.phone;
    user.role = role || user.role;
    user.status = status || user.status;

    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'User updated successfully', 
      data: user 
    });
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error updating user' 
    });
  }
};

// Delete a User
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
