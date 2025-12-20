const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/auth/signup
const registerUser = async (req, res) => {
  console.log("DEBUG: registerUser called with:", req.body);
  const { name, email, password, pin } = req.body;

  if (!name || !email || !password || !pin) {
    return res.status(400).json({ message: 'Please add all fields including PIN' });
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Generate Dummy UPI ID with random suffix to avoid collisions
  const randomSuffix = Math.floor(100 + Math.random() * 900); // 3 digit random number
  const upiId = `${name.toLowerCase().replace(/\s/g, '')}${randomSuffix}@dummy`;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const hashedPin = await bcrypt.hash(pin, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    pin: hashedPin,
    upiId,
    balance: 10000 // Initial dummy balance
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      upiId: user.upiId,
      balance: user.balance,
      token: generateToken(user.id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      upiId: user.upiId,
      balance: user.balance,
      token: generateToken(user.id),
    });
  } else {
    res.status(400).json({ message: 'Invalid credentials' });
  }
};

// @desc    Get current user data
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).populate('contacts', 'name upiId email');

  if (user) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      upiId: user.upiId,
      balance: user.balance,
      contacts: user.contacts
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.name = req.body.name || user.name;

    // Check email uniqueness if changing
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = req.body.email;
    }

    if (req.body.pin) {
      const salt = await bcrypt.genSalt(10);
      user.pin = await bcrypt.hash(req.body.pin, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      upiId: updatedUser.upiId,
      balance: updatedUser.balance,
      token: generateToken(updatedUser.id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile
};
