const Cart = require('../models/Cart');
const Artwork = require('../models/Artwork');
const asyncHandler = require('express-async-handler');

// @desc    Get cart for current user
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        cartItems: []
      });
    }

    // Populate artwork details
    const populatedCartItems = [];
    for (const item of cart.cartItems) {
      const artwork = await Artwork.findById(item.artwork).select('title price image');
      if (artwork) {
        populatedCartItems.push({
          ...item._doc,
          artwork: {
            _id: artwork._id,
            title: artwork.title,
            price: artwork.price,
            image: artwork.image
          }
        });
      }
    }
    const totalPrice = populatedCartItems.reduce((sum, item) => {
      return sum + item.quantity * item.artwork.price;
    }, 0);


    res.json({ 
      _id: cart._id,
      cartItems: populatedCartItems,
      countItems: populatedCartItems.length,
      totalPrice
    });
  } catch (error) {
    console.error('Error in getCart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addItemToCart = async (req, res) => {
  const { artworkId, quantity } = req.body;

  if (!artworkId) {
    return res.status(400).json({ message: 'Artwork ID is required' });
  }

  try {
    const artwork = await Artwork.findById(artworkId);
    if (!artwork || artwork.sold) {
      return res.status(404).json({ message: 'Artwork not available' });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        cartItems: [{ artwork: artworkId, quantity: 1 }]
      });
    } else {
      // Check if item already exists in cart
      let itemIndex = -1;
      for (let i = 0; i < cart.cartItems.length; i++) {
        if (cart.cartItems[i].artwork.toString() === artworkId) {
          itemIndex = i;
          break;
        }
      }

      if (itemIndex > -1) {
        // Update quantity if item exists
        cart.cartItems[itemIndex].quantity += quantity || 1;
      } else {
        // Add new item
        cart.cartItems.push({ artwork: artworkId, quantity: quantity || 1 });
      }

      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:artworkId
// @access  Private
exports.updateCartItemQuantity = async (req, res) => {
  const { artworkId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: 'Invalid quantity' });
  }

  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    let itemIndex = -1;
    for (let i = 0; i < cart.cartItems.length; i++) {
      if (cart.cartItems[i].artwork.toString() === artworkId) {
        itemIndex = i;
        break;
      }
    }

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Artwork not in cart' });
    }

    cart.cartItems[itemIndex].quantity = quantity;
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:artworkId
// @access  Private
exports.removeItemFromCart = async (req, res) => {
  const { artworkId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.cartItems = cart.cartItems.filter(item => 
      item.artwork.toString() !== artworkId
    );
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.cartItems = [];
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};