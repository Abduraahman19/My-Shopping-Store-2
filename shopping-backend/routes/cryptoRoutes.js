const express = require('express');
const router = express.Router();
const cryptoController = require('../controllers/cryptoController');

// All routes
router.post('/', cryptoController.createPayment);
router.post('/confirm', cryptoController.confirmPayment);
router.get('/status/:transactionId', cryptoController.checkPaymentStatus);
router.post('/mock-ipn', cryptoController.mockIPN);
router.get('/history', cryptoController.getPaymentHistory);
router.get('/', cryptoController.getAllPayments);
router.get('/:id', cryptoController.getPayment);
router.put('/:id', cryptoController.updatePayment);
router.delete('/:id', cryptoController.deletePayment);

module.exports = router;
