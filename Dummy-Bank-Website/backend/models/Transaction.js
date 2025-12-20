const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for Service Payments
  amount: { type: Number, required: true },
  status: { type: String, enum: ['SUCCESS', 'FAILED'], default: 'SUCCESS' },
  type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true }, // Context for the user
  category: { type: String, enum: ['TRANSFER', 'RECHARGE', 'BILL', 'GOLD'], default: 'TRANSFER' },
  note: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
