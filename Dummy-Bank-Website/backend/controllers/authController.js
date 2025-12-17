const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/auth/signup
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Generate Dummy UPI ID
  const upiId = `${name.toLowerCase().replace(/\s/g, '')}@dummy`;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
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

module.exports = {
  registerUser,
  loginUser,
  getMe
};
