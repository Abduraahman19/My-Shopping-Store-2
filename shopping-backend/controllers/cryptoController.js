const CryptoPayment = require('../models/CryptoPayment');
const crypto = require('crypto');

// Create new crypto payment
exports.createPayment = async (req, res) => {
  try {
    const { amount, currency = 'USD', customer, items } = req.body;
    const transactionId = 'crypto_' + crypto.randomBytes(8).toString('hex');

    // Mock response - replace with actual API call in production
    const mockResponse = {
      error: 'ok',
      result: {
        amount: amount,
        txn_id: 'CP'+crypto.randomBytes(8).toString('hex').toUpperCase(),
        address: '3ExampleBTCAddressForTestingOnly',
        confirms_needed: '3',
        timeout: 3600,
        status_url: 'https://www.coinpayments.net/status-page',
        qrcode_url: 'https://www.coinpayments.net/qrgen.php?id=CPTEST123&key=TEST'
      }
    };

    const payment = new CryptoPayment({
      amount,
      currency,
      cryptoAmount: mockResponse.result.amount,
      cryptoCurrency: 'BTC',
      transactionId,
      coinpaymentsTxnId: mockResponse.result.txn_id,
      walletAddress: mockResponse.result.address,
      status: 'pending',
      customer,
      items
    });

    await payment.save();

    res.status(201).json({
      success: true,
      payment: {
        ...mockResponse.result,
        transactionId,
        customer,
        items
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// IPN Handler
exports.handleIPN = async (req, res) => {
  try {
    const { ipn_mode, txn_id, status, invoice } = req.body;

    if (ipn_mode !== 'hmac') {
      return res.status(400).send('Invalid IPN mode');
    }

    const payment = await CryptoPayment.findOne({ 
      $or: [
        { coinpaymentsTxnId: txn_id },
        { transactionId: invoice }
      ]
    });

    if (!payment) return res.status(404).send('Payment not found');

    let paymentStatus = 'pending';
    if (status >= 100) paymentStatus = 'completed';
    else if (status < 0) paymentStatus = 'failed';

    payment.status = paymentStatus;
    await payment.save();

    res.status(200).send('IPN received');
  } catch (error) {
    console.error('IPN Error:', error);
    res.status(500).send('IPN processing failed');
  }
};

// Get payment by ID
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

// IPN handler
// exports.handleIPN = async (req, res) => {
//   try {
//     const { ipn_mode, txn_id, status } = req.body;

//     if (ipn_mode !== 'hmac') {
//       return res.status(400).json({ error: 'Invalid IPN mode' });
//     }

//     const payment = await CryptoPayment.findOne({ coinpaymentsTxnId: txn_id });
//     if (!payment) {
//       return res.status(404).json({ error: 'Transaction not found' });
//     }

//     let paymentStatus = 'pending';
//     if (status >= 100 || status === 2) {
//       paymentStatus = 'completed';
//     } else if (status < 0) {
//       paymentStatus = 'failed';
//     }

//     payment.status = paymentStatus;
//     await payment.save();

//     res.status(200).send('IPN received');
//   } catch (error) {
//     console.error('IPN Error:', error);
//     res.status(500).send('IPN processing failed');
//   }
// };