const mongoose = require('mongoose');

const cryptoSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  cryptoAmount: { type: Number },
  cryptoCurrency: { type: String },
  status: { 
    type: String,
    enum: ['pending', 'completed', 'failed', 'expired'],
    default: 'pending'
  },
  transactionId: { type: String, required: true, unique: true },
  coinpaymentsTxnId: { type: String },
  walletAddress: { type: String },
  customer: {
    name: String,
    email: { type: String, required: true },
    phone: String
  },
  items: [{
    productId: String,
    title: String,
    price: Number,
    quantity: Number
  }],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
}, {
  timestamps: true
});

// Add index for frequently queried fields
cryptoSchema.index({ transactionId: 1 });
cryptoSchema.index({ coinpaymentsTxnId: 1 });
cryptoSchema.index({ status: 1 });

module.exports = mongoose.model('CryptoPayment', cryptoSchema);