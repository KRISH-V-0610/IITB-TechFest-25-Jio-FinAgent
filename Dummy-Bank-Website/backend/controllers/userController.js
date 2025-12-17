const User = require('../models/User');

// @desc    Search for users
// @route   GET /api/users/search?q=
const searchUsers = async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);

  // Search by name or UPI (case-insensitive)
  // Exclude current user
  const users = await User.find({
    $and: [
      { _id: { $ne: req.user.id } },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { upiId: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  }).select('name upiId');

  res.json(users);
};

// @desc    Add a contact
// @route   POST /api/users/add-contact
const addContact = async (req, res) => {
  const { contactId } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { contacts: contactId } }, // $addToSet prevents duplicates automatically
      { new: true }
    );
    res.json(user.contacts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all contacts
// @route   GET /api/users/contacts
const getContacts = async (req, res) => {
  const user = await User.findById(req.user.id).populate('contacts', 'name upiId');
  res.json(user.contacts);
};

module.exports = {
  searchUsers,
  addContact,
  getContacts
};
