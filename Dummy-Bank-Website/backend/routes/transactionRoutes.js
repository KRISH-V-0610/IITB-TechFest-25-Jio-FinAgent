const express = require('express');
const router = express.Router();
const { transferMoney, getHistory } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/transfer', protect, transferMoney);
router.get('/history', protect, getHistory);

module.exports = router;
