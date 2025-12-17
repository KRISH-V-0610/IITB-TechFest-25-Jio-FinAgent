const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Transfer money
// @route   POST /api/transactions/transfer
const transferMoney = async (req, res) => {
  const { recipientUpi, amount, note } = req.body;
  const senderId = req.user.id;
  const transferAmount = Number(amount);

  if (!recipientUpi || transferAmount <= 0) {
    return res.status(400).json({ message: 'Invalid Amount or Recipient' });
  }

  try {
    // 1. Check if Recipient Exists FIRST to avoid deducting money if recipient is invalid
    const recipient = await User.findOne({ upiId: recipientUpi });
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    if (senderId === recipient._id.toString()) {
      return res.status(400).json({ message: 'Cannot self-transfer' });
    }

    // 2. Perform Atomic Deduction from Sender
    // Only deduct if balance is sufficient (gte transferAmount)
    const updatedSender = await User.findOneAndUpdate(
      { _id: senderId, balance: { $gte: transferAmount } },
      { $inc: { balance: -transferAmount } },
      { new: true }
    );

    if (!updatedSender) {
      return res.status(400).json({ message: 'Insufficient Funds' });
    }

    // 3. Atomically Credit Recipient
    await User.findByIdAndUpdate(
      recipient._id,
      { $inc: { balance: transferAmount } }
    );

    // 4. Create Transaction Record
    // We create one record; the history API handles the view logic.
    const debitTxn = await Transaction.create({
      fromUser: senderId,
      toUser: recipient._id,
      amount: transferAmount,
      status: 'SUCCESS',
      type: 'DEBIT',
      note
    });

    res.status(200).json({
      message: 'Transfer Successful',
      balance: updatedSender.balance,
      transaction: {
        id: debitTxn._id,
        amount: debitTxn.amount,
        recipient: recipient.name,
        balance: updatedSender.balance
      }
    });

  } catch (error) {
    console.error("Transfer Error:", error);
    res.status(500).json({ message: 'Transfer failed due to server error' });
  }
};

// @desc    Get Transaction History
// @route   GET /api/transactions/history
const getHistory = async (req, res) => {
  const userId = req.user.id;

  const txns = await Transaction.find({
    $or: [{ fromUser: userId }, { toUser: userId }]
  })
    .populate('fromUser', 'name upiId')
    .populate('toUser', 'name upiId')
    .sort({ createdAt: -1 });

  // Format relevantly for frontend
  const formatted = txns.map(t => {
    const isDebit = t.fromUser._id.toString() === userId;
    return {
      id: t._id,
      amount: t.amount,
      type: isDebit ? 'debit' : 'credit',
      fromUpi: t.fromUser ? t.fromUser.upiId : 'System',
      fromName: t.fromUser ? t.fromUser.name : 'System',
      toUpi: t.toUser ? t.toUser.upiId : 'Unknown',
      toName: t.toUser ? t.toUser.name : 'Unknown',
      timestamp: t.createdAt,
      status: t.status,
      note: t.note
    };
  });

  res.json(formatted);
};

module.exports = {
  transferMoney,
  getHistory
};
