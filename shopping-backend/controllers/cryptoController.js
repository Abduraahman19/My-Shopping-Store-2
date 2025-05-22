const CryptoPayment = require('../models/CryptoPayment');
const crypto = require('crypto');
const axios = require('axios');

// Mock payment processor
const mockProcessor = {
  createPayment: async (amount, currency, cryptoCurrency) => {
    // In a real implementation, this would call CoinPayments API
    return {
      error: 'ok',
      result: {
        amount: amount,
        txn_id: 'CP' + crypto.randomBytes(8).toString('hex').toUpperCase(),
        address: `${cryptoCurrency}_MockWalletAddress_${crypto.randomBytes(4).toString('hex')}`,
        confirms_needed: '3',
        timeout: 3600,
        status_url: 'https://www.example.com/status',
        qrcode_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${cryptoCurrency}:MockWalletAddress_${crypto.randomBytes(4).toString('hex')}?amount=${amount}`
      }
    };
  }
};

// Create new crypto payment
// In controllers/cryptoController.js
exports.createPayment = async (req, res) => {
  try {
    const {
      amount,
      currency = 'USD',
      cryptoCurrency = 'LTCT', // Default to LTCT
      cryptoAmount,
      cryptoPrice,
      customer,
      items
    } = req.body;

    // Your fixed wallet address
    const FIXED_LTCT_ADDRESS = 'mnzPb9PjpoScsMr6rykN9bv8qtrPJq9nk4';

    const transactionId = 'crypto_' + crypto.randomBytes(8).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // For LTCT, use the fixed address
    const walletAddress = cryptoCurrency.toLowerCase() === 'ltct'
      ? FIXED_LTCT_ADDRESS
      : `${cryptoCurrency}_MockWalletAddress_${crypto.randomBytes(4).toString('hex')}`;

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${cryptoCurrency}:${walletAddress}?amount=${cryptoAmount}`;

    const payment = new CryptoPayment({
      amount,
      currency,
      cryptoAmount,
      cryptoCurrency,
      transactionId,
      coinpaymentsTxnId: 'CP' + crypto.randomBytes(8).toString('hex').toUpperCase(),
      walletAddress,
      status: 'pending',
      customer,
      items,
      expiresAt
    });

    await payment.save();

    res.status(201).json({
      success: true,
      payment: {
        address: walletAddress,
        cryptoAmount,
        cryptoCurrency,
        transactionId,
        expiresAt: payment.expiresAt,
        qrcode_url: qrCodeUrl,
        customer,
        items
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Check payment status
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const payment = await CryptoPayment.findOne({ transactionId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // In a real implementation, this would check with the payment processor
    // For our mock, we'll simulate different statuses based on time
    let status = payment.status;
    const now = new Date();

    if (status === 'pending') {
      // Simulate payment confirmation after 1 minute
      const createdTime = new Date(payment.createdAt).getTime();
      if (now.getTime() - createdTime > 60000) { // 1 minute
        status = 'completed';
        payment.status = status;
        await payment.save();
      } else if (now > payment.expiresAt) {
        status = 'expired';
        payment.status = status;
        await payment.save();
      }
    }

    res.json({
      success: true,
      status,
      transactionId: payment.transactionId,
      amount: payment.amount,
      cryptoAmount: payment.cryptoAmount,
      cryptoCurrency: payment.cryptoCurrency,
      walletAddress: payment.walletAddress,
      expiresAt: payment.expiresAt
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Status check failed'
    });
  }
};

// Mock IPN Handler (for testing)
exports.mockIPN = async (req, res) => {
  try {
    const { transactionId, status } = req.body;

    if (!transactionId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing transactionId or status'
      });
    }

    const payment = await CryptoPayment.findOne({ transactionId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    payment.status = status;
    await payment.save();

    res.json({
      success: true,
      message: 'Payment status updated',
      status: payment.status
    });

  } catch (error) {
    console.error('Mock IPN error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Mock IPN failed'
    });
  }
};

// Confirm payment and save to database
exports.confirmPayment = async (req, res) => {
  try {
    const {
      amount,
      currency,
      cryptoCurrency,
      cryptoAmount,
      walletAddress,
      customer,
      items,
      transactionId
    } = req.body;

    // Create the payment record in database
    const payment = new CryptoPayment({
      transactionId: transactionId.replace('temp_', ''),
      amount,
      currency,
      cryptoAmount,
      cryptoCurrency,
      walletAddress,
      status: 'completed',
      customer,
      items
    });

    await payment.save();

    res.status(201).json({ 
      success: true,
      payment
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const payments = await CryptoPayment.find({
      'customer.email': email
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      payments
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payment history'
    });
  }
};
// Get single payment
exports.getPayment = async (req, res) => {
  try {
    const payment = await CryptoPayment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await CryptoPayment.find();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update payment status
exports.updatePayment = async (req, res) => {
  try {
    const payment = await CryptoPayment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const payment = await CryptoPayment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};