const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const cartController = require('../../controllers/cartController');

// Get cart for current user
router.get('/', protect, cartController.getCart);

// Add item to cart
router.post('/add', protect, cartController.addItemToCart);

// Update cart item quantity
router.put('/update/:artworkId', protect, cartController.updateCartItemQuantity);

// Remove item from cart
router.delete('/remove/:artworkId', protect, cartController.removeItemFromCart);

// Clear cart
router.delete('/clear', protect, cartController.clearCart);

module.exports = router;