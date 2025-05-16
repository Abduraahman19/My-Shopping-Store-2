const express = require('express');
const router = express.Router();
const cryptoController = require('../controllers/cryptoController');

router.post('/', cryptoController.createPayment);
router.post('/ipn', cryptoController.handleIPN);
router.get('/', cryptoController.getAllPayments);
router.get('/:id', cryptoController.getPayment);
router.put('/:id', cryptoController.updatePayment);
router.delete('/:id', cryptoController.deletePayment);

module.exports = router;