const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Order Routes
router.post('/', orderController.createOrder);      // Create an order
router.get('/', orderController.getOrders);         // Get all orders
router.get('/:id', orderController.getOrderById);   // Get order by ID
router.put('/:id', orderController.updateOrder);    // Update an order
router.delete('/:id', orderController.deleteOrder); // Delete an order

module.exports = router;
