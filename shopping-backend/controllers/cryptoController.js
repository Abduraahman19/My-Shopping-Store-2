const CryptoPayment = require('../models/CryptoPayment');
const crypto = require('crypto');
const axios = require('axios');

// Constants
const FIXED_LTCT_ADDRESS = 'mnzPb9PjpoScsMr6rykN9bv8qtrPJq9nk4';
const PAYMENT_TIMEOUT_MINUTES = 10;

/**
 * @desc    Create a new crypto payment request (temporary)
 * @route   POST /api/crypto
 * @access  Public
 */
exports.createPayment = async (req, res) => {
  try {
    const {
      amount,
      currency = 'USD',
      cryptoCurrency = 'LTCT',
      cryptoAmount,
      cryptoPrice,
      customer,
      items
    } = req.body;

    // Validate required fields
    if (!amount || !cryptoAmount || !customer || !items) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Generate temporary transaction ID
    const tempTransactionId = 'temp_' + crypto.randomBytes(8).toString('hex');
    const expiresAt = new Date(Date.now() + PAYMENT_TIMEOUT_MINUTES * 60 * 1000);

    // Generate QR code URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${cryptoCurrency}:${FIXED_LTCT_ADDRESS}?amount=${cryptoAmount}`;

    // Return payment details without saving to DB yet
    res.status(200).json({
      success: true,
      payment: {
        walletAddress: FIXED_LTCT_ADDRESS,
        cryptoAmount,
        cryptoCurrency,
        transactionId: tempTransactionId,
        expiresAt,
        qrCodeUrl,
        paymentData: {
          amount,
          currency,
          cryptoAmount,
          cryptoCurrency,
          cryptoPrice,
          customer,
          items,
          walletAddress: FIXED_LTCT_ADDRESS,
          status: 'pending'
        }
      }
    });

  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create payment request' 
    });
  }
};

/**
 * @desc    Verify a crypto payment
 * @route   POST /api/crypto/verify
 * @access  Public
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { transactionId, paymentData } = req.body;

    if (!transactionId || !paymentData) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID and payment data are required'
      });
    }

    // Check if this is a temporary transaction
    const isTempTransaction = transactionId.startsWith('temp_');
    
    if (isTempTransaction) {
      // In production, you would:
      // 1. Check blockchain explorer API for the transaction
      // 2. Verify the amount matches
      // 3. Confirm sufficient confirmations
      
      // For demo, we'll simulate verification with 80% success rate
      const isVerified = Math.random() > 0.2;
      
      if (!isVerified) {
        return res.status(400).json({
          success: false,
          message: 'Payment not found or insufficient amount',
          verified: false
        });
      }

      // If verified, create actual payment record
      const actualTransactionId = transactionId.replace('temp_', '');
      
      const payment = new CryptoPayment({
        ...paymentData,
        transactionId: actualTransactionId,
        status: 'completed',
        expiresAt: new Date(Date.now() + PAYMENT_TIMEOUT_MINUTES * 60 * 1000)
      });

      await payment.save();

      return res.json({
        success: true,
        verified: true,
        transactionId: actualTransactionId,
        payment
      });
    }

    // For non-temp transactions, check database
    const payment = await CryptoPayment.findOne({ transactionId });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
        verified: false
      });
    }

    res.json({
      success: true,
      verified: payment.status === 'completed',
      payment
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed'
    });
  }
};

/**
 * @desc    Confirm and save a payment (alternative to verify)
 * @route   POST /api/crypto/confirm
 * @access  Public
 */
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

    // Validate required fields
    if (!amount || !cryptoAmount || !customer || !items || !transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create the payment record in database
    const payment = new CryptoPayment({
      transactionId: transactionId.startsWith('temp_') 
        ? transactionId.replace('temp_', '')
        : transactionId,
      amount,
      currency,
      cryptoAmount,
      cryptoCurrency,
      walletAddress,
      status: 'completed',
      customer,
      items,
      expiresAt: new Date(Date.now() + PAYMENT_TIMEOUT_MINUTES * 60 * 1000)
    });

    await payment.save();

    res.status(201).json({ 
      success: true,
      payment
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to confirm payment' 
    });
  }
};

/**
 * @desc    Check payment status
 * @route   GET /api/crypto/status/:transactionId
 * @access  Public
 */
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const payment = await CryptoPayment.findOne({ 
      $or: [
        { transactionId },
        { coinpaymentsTxnId: transactionId }
      ]
    });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if payment expired
    if (payment.status === 'pending' && new Date() > payment.expiresAt) {
      payment.status = 'expired';
      await payment.save();
    }

    res.json({
      success: true,
      status: payment.status,
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

/**
 * @desc    Get payment history for a customer
 * @route   GET /api/crypto/history
 * @access  Public
 */
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
      count: payments.length,
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

/**
 * @desc    Mock IPN handler (for testing)
 * @route   POST /api/crypto/mock-ipn
 * @access  Public
 */
exports.mockIPN = async (req, res) => {
  try {
    const { transactionId, status } = req.body;

    if (!transactionId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing transactionId or status'
      });
    }

    const validStatuses = ['pending', 'completed', 'failed', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
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

/**
 * @desc    Get all payments (admin)
 * @route   GET /api/crypto
 * @access  Private/Admin
 */
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await CryptoPayment.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: payments.length,
      payments
    });

  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payments'
    });
  }
};

/**
 * @desc    Get single payment by ID
 * @route   GET /api/crypto/:id
 * @access  Private/Admin
 */
exports.getPayment = async (req, res) => {
  try {
    const payment = await CryptoPayment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      payment
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payment'
    });
  }
};

/**
 * @desc    Update payment status (admin)
 * @route   PUT /api/crypto/:id
 * @access  Private/Admin
 */
exports.updatePayment = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'completed', 'failed', 'expired'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }

    const payment = await CryptoPayment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      payment
    });

  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update payment'
    });
  }
};

/**
 * @desc    Delete payment (admin)
 * @route   DELETE /api/crypto/:id
 * @access  Private/Admin
 */
exports.deletePayment = async (req, res) => {
  try {
    const payment = await CryptoPayment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment deleted successfully'
    });

  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete payment'
    });
  }
};