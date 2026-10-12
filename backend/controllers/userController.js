const User = require('../models/User');
const TestAttempt = require('../models/TestAttempt');

// @desc    Get all users with test performance stats
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const search = req.query.search || '';
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    // Calculate tests completed and avg score per user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const attempts = await TestAttempt.find({ userId: u._id });
        const testsCompleted = attempts.length;
        let avgScore = 0;
        if (testsCompleted > 0) {
          const sumPct = attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
          avgScore = Math.round(sumPct / testsCompleted);
        }
        return {
          ...u.toObject(),
          testsCompleted,
          avgScore
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user details & history by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const attempts = await TestAttempt.find({ userId: user._id })
      .populate('testId', 'title category')
      .sort({ createdAt: -1 });

    res.json({
      user,
      attempts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new user by Admin
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, status } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: password || 'User@123',
      phone: phone || '',
      role: role || 'user',
      status: status || 'active'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email ? req.body.email.toLowerCase() : user.email;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.role = req.body.role || user.role;
    user.status = req.body.status || user.status;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      status: updatedUser.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optionally delete attempts
    await TestAttempt.deleteMany({ userId: user._id });
    await user.deleteOne();

    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
