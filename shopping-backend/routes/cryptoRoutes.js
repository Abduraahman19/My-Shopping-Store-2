const express = require('express');
const router = express.Router();
const cryptoController = require('../controllers/cryptoController');

// All routes
router.post('/', cryptoController.createPayment);
router.post('/verify', cryptoController.verifyPayment);
router.post('/confirm', cryptoController.confirmPayment);
router.get('/status/:transactionId', cryptoController.checkPaymentStatus);
router.get('/history', cryptoController.getPaymentHistory);
// Get all payments
router.get('/', cryptoController.getAllPayments);
router.get('/:id', cryptoController.getPayment);
router.put('/:id', cryptoController.updatePayment);
router.delete('/:id', cryptoController.deletePayment);

module.exports = router;
