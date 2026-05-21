import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';

// @desc    Auth admin/user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const loginIdentifier = username || email;

  console.log(`[Login Attempt] Identifier: "${loginIdentifier}", Body Keys:`, Object.keys(req.body));

  // Search by username or email
  const user = await User.findOne({
    $or: [
      { username: loginIdentifier },
      { email: loginIdentifier }
    ]
  });

  if (!user) {
    console.log(`[Login Failed] User not found for: "${loginIdentifier}"`);
    res.status(401);
    throw new Error('Invalid username, email or password');
  }

  if (user.status === 'suspended') {
    console.log(`[Login Failed] Account suspended: "${loginIdentifier}"`);
    res.status(403);
    throw new Error('Your account has been suspended. Please contact a Super Admin.');
  }

  const isMatch = await user.matchPassword(password);
  console.log(`[Login Check] User found: "${user.username}". Password match: ${isMatch}`);

  if (isMatch) {
    // Update login audit info
    user.lastLogin = new Date();
    user.loginIp = req.ip;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage || '',
      status: user.status,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid username, email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, username, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  if (username) {
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      res.status(400);
      throw new Error('Username is already taken');
    }
  }

  const user = await User.create({
    name,
    email,
    username: username || email.split('@')[0],
    password,
    role: role || 'client',
    status: 'active'
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage || '',
      status: user.status,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get all admins (Super Admin only)
// @route   GET /api/auth/admins
// @access  Private/SuperAdmin
const getAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({
    role: { $in: ['superadmin', 'admin', 'editor', 'manager'] }
  }).select('-password');
  res.json(admins);
});

// @desc    Create a new admin (Super Admin only)
// @route   POST /api/auth/admins
// @access  Private/SuperAdmin
const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, username, password, role } = req.body;

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error('Email is already registered');
  }

  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    res.status(400);
    throw new Error('Username is already taken');
  }

  const newAdmin = await User.create({
    name,
    email,
    username,
    password,
    role: role || 'editor',
    status: 'active'
  });

  res.status(201).json({
    _id: newAdmin._id,
    name: newAdmin.name,
    email: newAdmin.email,
    username: newAdmin.username,
    role: newAdmin.role,
    status: newAdmin.status
  });
});

// @desc    Update admin details/role/status (Super Admin only)
// @route   PUT /api/auth/admins/:id
// @access  Private/SuperAdmin
const updateAdmin = asyncHandler(async (req, res) => {
  const adminId = req.params.id;
  const { name, email, username, role, status } = req.body;

  const adminToUpdate = await User.findById(adminId);
  if (!adminToUpdate) {
    res.status(404);
    throw new Error('Admin user not found');
  }

  // Prevent Super Admin from changing their own role or suspending themselves
  if (req.user._id.toString() === adminToUpdate._id.toString()) {
    if (role && role !== adminToUpdate.role) {
      res.status(400);
      throw new Error('Super Admins cannot change their own roles');
    }
    if (status && status !== adminToUpdate.status) {
      res.status(400);
      throw new Error('Super Admins cannot suspend themselves');
    }
  }

  adminToUpdate.name = name || adminToUpdate.name;
  adminToUpdate.email = email || adminToUpdate.email;
  adminToUpdate.username = username || adminToUpdate.username;
  adminToUpdate.role = role || adminToUpdate.role;
  adminToUpdate.status = status || adminToUpdate.status;

  const updated = await adminToUpdate.save();

  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    username: updated.username,
    role: updated.role,
    status: updated.status
  });
});

// @desc    Delete admin (Super Admin only)
// @route   DELETE /api/auth/admins/:id
// @access  Private/SuperAdmin
const deleteAdmin = asyncHandler(async (req, res) => {
  const adminId = req.params.id;

  if (req.user._id.toString() === adminId) {
    res.status(400);
    throw new Error('Super Admins cannot delete their own accounts');
  }

  const adminToDelete = await User.findById(adminId);
  if (!adminToDelete) {
    res.status(404);
    throw new Error('Admin user not found');
  }

  await User.findByIdAndDelete(adminId);
  res.json({ message: 'Admin account deleted successfully' });
});

// @desc    Reset admin password (Super Admin only)
// @route   PUT /api/auth/admins/:id/reset-password
// @access  Private/SuperAdmin
const resetAdminPassword = asyncHandler(async (req, res) => {
  const adminId = req.params.id;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }

  const adminUser = await User.findById(adminId);
  if (!adminUser) {
    res.status(404);
    throw new Error('Admin user not found');
  }

  adminUser.password = newPassword;
  await adminUser.save();

  res.json({ message: 'Password reset successfully' });
});

// @desc    Update logged-in admin profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.username = req.body.username || user.username;
  user.profileImage = req.body.profileImage !== undefined ? req.body.profileImage : user.profileImage;

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    username: updatedUser.username,
    email: updatedUser.email,
    role: updatedUser.role,
    profileImage: updatedUser.profileImage || '',
    status: updatedUser.status,
    token: generateToken(updatedUser._id),
  });
});

export {
  authUser,
  registerUser,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  resetAdminPassword,
  updateProfile
};
