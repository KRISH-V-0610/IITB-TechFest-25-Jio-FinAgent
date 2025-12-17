const express = require('express');
const router = express.Router();
const { searchUsers, addContact, getContacts } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/search', protect, searchUsers);
router.post('/add-contact', protect, addContact);
router.get('/contacts', protect, getContacts);

module.exports = router;
