const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    id: String,
    name: String,
    email: String,
    phone: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      postal_code: String,
      country: String
    }
  },
  cartItems: [{
    product: {
      id: String,
      title: String,
      price: Number,
      image: String,
      description: String
    },
    quantity: Number
  }],
  paymentDetails: {
    paymentIntentId: String,
    amount: Number,
    currency: {
      type: String,
      default: 'pkr'
    },
    status: {
      type: String,
      enum: ['pending', 'requires_payment_method', 'requires_confirmation', 'succeeded', 'canceled', 'failed'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['card', 'bank_transfer', 'cash_on_delivery', null],
      default: null
    },
    cardDetails: {
      brand: String,
      last4: String,
      country: String
    },
    receiptUrl: String
  },
  images: [String],
  status: {
    type: String,
    default: 'processing'
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);