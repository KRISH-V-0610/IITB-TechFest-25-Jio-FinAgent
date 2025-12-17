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

  const user = await User.findById(req.user.id);

  if (user.contacts.includes(contactId)) {
    return res.status(400).json({ message: 'Contact already added' });
  }

  user.contacts.push(contactId);
  await user.save();

  res.json(user.contacts);
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
