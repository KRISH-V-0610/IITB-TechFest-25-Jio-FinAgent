const bcrypt = require('bcryptjs');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Transfer money
// @route   POST /api/transactions/transfer
const transferMoney = async (req, res) => {
  const { recipientUpi, amount, note, pin, category = 'TRANSFER' } = req.body;
  const senderId = req.user.id;
  const transferAmount = Number(amount);

  if (transferAmount <= 0) {
    return res.status(400).json({ message: 'Invalid Amount' });
  }

  // Recipient is mandatory only for P2P Transfers
  if (category === 'TRANSFER' && !recipientUpi) {
    return res.status(400).json({ message: 'Recipient UPI is required for transfers' });
  }

  if (!pin) {
    return res.status(400).json({ message: 'PIN is required' });
  }

  try {
    // 1. Fetch Sender to verify PIN
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    const isPinCorrect = await bcrypt.compare(pin, sender.pin);
    if (!isPinCorrect) {
      return res.status(401).json({ message: 'Incorrect PIN' });
    }

    // 2. Check if Recipient Exists (If it's a transfer)
    // For specialized transactions (Bill, Recharge, Gold), we might use a system account or just skip recipient check if we had one.
    // BUT for this Dummy Bank, we are using specific UPI IDs for services:
    // 'recharge@bills', 'electricity@bills', 'gold@dummybank'
    // So we will create these users OR just bypass check if it matches.
    // Let's rely on finding them in DB request. I will assume the user has created these dummy users OR I will create them on fly? 
    // Better strategy: Just allow "System" transactions if recipient is not found but category is special?
    // Let's stick to the current flow: User MUST exist. I will assume the user sends to a valid UPI.
    // Wait, the frontend sends 'recharge@bills'. If that user doesn't exist in DB, this fails.
    // Fix: Upsert a "Service User" if not found, or just process it without a recipient user (burn address).
    // Let's go with: If category is NOT 'TRANSFER', we act as if recipient is a System Service.

    let recipientId = null;
    let recipientName = 'Service Provider';



    if (category === 'TRANSFER') {
      const recipient = await User.findOne({ upiId: recipientUpi });
      if (!recipient) {
        return res.status(404).json({ message: 'Recipient not found' });
      }
      if (sender.upiId === recipient.upiId) {
        return res.status(400).json({ message: 'Cannot self-transfer' });
      }
      recipientId = recipient._id;
      recipientName = recipient.name;
    } else {
      // For Bills/Recharge, we don't need a recipient user.
      // We set recipientName based on context or just keep 'Service Provider'
      // Ideally, we could look up a metadata table, but this is sufficient.
      if (category === 'RECHARGE') recipientName = 'Mobile Operator';
      if (category === 'BILL') recipientName = 'Electricity Board';
      if (category === 'GOLD') recipientName = 'Gold Vault';
    }

    // 2. Perform Atomic Deduction from Sender
    const updatedSender = await User.findOneAndUpdate(
      { _id: senderId, balance: { $gte: transferAmount } },
      { $inc: { balance: -transferAmount } },
      { new: true }
    );

    if (!updatedSender) {
      return res.status(400).json({ message: 'Insufficient Funds' });
    }

    // 3. Handle Special Logic (Gold, etc.)
    // 3. Handle Special Logic (Gold, Bill Persistence, etc.)
    if (category === 'GOLD') {
      const goldRate = 13600.00;
      const grams = Number((transferAmount / goldRate).toFixed(4));
      await User.findByIdAndUpdate(senderId, { $inc: { goldBalance: grams } });
      updatedSender.goldBalance = (updatedSender.goldBalance || 0) + grams;
    }

    // PERSISTENCE: Save Electricity Bill details if provided
    if (category === 'BILL' && req.body.billDetails) {
      const { consumerNumber, board, state } = req.body.billDetails;
      if (consumerNumber) {
        await User.findByIdAndUpdate(senderId, {
          $set: {
            'electricityDetails.consumerNumber': consumerNumber,
            'electricityDetails.board': board,
            'electricityDetails.state': state
          }
        });
        // Reflect in memory to return updated user details if needed, 
        // though the frontend mainly needs to know success.
      }
    }

    // 4. Atomically Credit Recipient (if exists)
    if (recipientId) {
      await User.findByIdAndUpdate(
        recipientId,
        { $inc: { balance: transferAmount } }
      );
    }

    // 5. Create Transaction Record
    const debitTxn = await Transaction.create({
      fromUser: senderId,
      toUser: recipientId, // Can be null for services
      amount: transferAmount,
      status: 'SUCCESS',
      type: 'DEBIT',
      category: category,
      note
    });

    res.status(200).json({
      message: 'Transaction Successful',
      balance: updatedSender.balance,
      goldBalance: updatedSender.goldBalance, // Return this too
      transaction: {
        id: debitTxn._id,
        amount: debitTxn.amount,
        recipient: recipientName,
        balance: updatedSender.balance,
        category: category
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
      category: t.category,
      note: t.note
    };
  });

  res.json(formatted);
};

module.exports = {
  transferMoney,
  getHistory
};
