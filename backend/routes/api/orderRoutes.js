const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const orderController = require('../../controllers/orderController');

// Create new order
router.post('/', protect, orderController.createOrder);

// Get all orders for a user
router.get('/', protect, orderController.getOrders);

// Get order by ID
router.get('/:id', protect, orderController.getOrderById);

// Pay for order
router.put('/:id/pay', protect, orderController.updateOrderToPaid);

// Deliver order (artists only)
router.put('/:id/deliver', protect, orderController.updateOrderToDelivered);

module.exports = router;