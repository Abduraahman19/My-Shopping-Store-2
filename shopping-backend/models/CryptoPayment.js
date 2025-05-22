const mongoose = require('mongoose');

const cryptoSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  cryptoAmount: {
    type: Number
  },
  cryptoCurrency: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'expired'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  coinpaymentsTxnId: {
    type: String
  },
  walletAddress: {
    type: String
  },
  customer: {
    name: {
      type: String
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String
    }
  },
  items: [
    {
      productId: {
        type: String
      },
      title: {
        type: String
      },
      price: {
        type: Number
      },
      quantity: {
        type: Number
      },
      image: {               // <-- Image field added here
        type: String
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date // You can set it during creation e.g., Date.now() + 3600 * 1000
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Helpful indexes
cryptoSchema.index({ transactionId: 1 }, { unique: true });
cryptoSchema.index({ coinpaymentsTxnId: 1 });
cryptoSchema.index({ status: 1 });

module.exports = mongoose.model('CryptoPayment', cryptoSchema);