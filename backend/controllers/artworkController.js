const Artwork = require('../models/Artwork');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get all artworks
// @route   GET /api/artworks
// @access  Public
exports.getAllArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find()
      .populate('artist', 'name avatar')
      .lean();

    res.status(200).json({
      success: true,
      count: artworks.length,
      data: artworks // Changed from 'artworks' to 'data'
    });

  } catch (error) {
    console.error('Error fetching artworks:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get artwork by ID
// @route   GET /api/artworks/:id
// @access  Public
exports.getArtworkById = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id).populate('artist', 'name avatar');
    
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Increment views
    artwork.views += 1;
    await artwork.save();

    res.json(artwork);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new artwork
// @route   POST /api/artworks
// @access  Private (Artists only)
exports.createArtwork = async (req, res) => {

  const fullImageUrl = `${req.protocol}://${req.get('host')}/uploads/artworks/${req.file.filename}`;
  // 1. Fix validation (remove 'image' from req.body check)
  if (!req.file) {
    return res.status(400).json({ message: 'Artwork image is required' });
  }
  
  const { title, description, price, category, medium } = req.body; // Remove 'image' from destructuring

  // 2. Update validation check
  if (!title || !price || !category) {
    return res.status(400).json({ message: 'Title, price and category are required' });
  }

  try {
    // 3. Create artwork with proper data
    const artwork = await Artwork.create({
      title,
      description,
      price,
      category,
      medium,
      artist: req.user._id,
      image: fullImageUrl
    });

    // 4. Verify user update
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { artworks: artwork._id } },
      { new: true, useFindAndModify: false }
    );

    if (!updatedUser) {
      console.error('User not found:', req.user._id);
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(201).json(artwork);
  } catch (error) {
    // 5. Add error logging
    console.error('Error creating artwork:', error);
    res.status(400).json({ 
      message: 'Invalid artwork data',
      error: error.message 
    });
  }
};

// @desc    Update artwork
// @route   PUT /api/artworks/:id
// @access  Private (Artists only)
exports.updateArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);

    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Check if user is the artist who created the artwork
    if (artwork.artist.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedArtwork = await Artwork.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json(updatedArtwork);
  } catch (error) {
    res.status(400).json({ message: 'Invalid artwork data' });
  }
};

// @desc    Delete artwork
// @route   DELETE /api/artworks/:id
// @access  Private (Artists only)
exports.deleteArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);

    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Check if user is the artist who created the artwork
    if (artwork.artist.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Artwork.findByIdAndDelete(req.params.id);
    res.json({ message: 'Artwork removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search artworks
// @route   GET /api/artworks/search
// @access  Public
exports.searchArtworks = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const artworks = await Artwork.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).populate('artist', 'name');

    res.json(artworks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Filter artworks
// @route   GET /api/artworks/filter
// @access  Public
exports.filterArtworks = async (req, res) => {
  const { category, minPrice, maxPrice, sort } = req.query;

  const filterConditions = {};

  if (category) {
    filterConditions.category = category;
  }

  if (minPrice !== undefined) {
    filterConditions.price = { $gte: parseFloat(minPrice) };
  }

  if (maxPrice !== undefined) {
    if (filterConditions.price) {
      filterConditions.price.$lte = parseFloat(maxPrice);
    } else {
      filterConditions.price = { $lte: parseFloat(maxPrice) };
    }
  }

  let sortOptions = {};
  if (sort === 'price-low') {
    sortOptions = { price: 1 };
  } else if (sort === 'price-high') {
    sortOptions = { price: -1 };
  } else if (sort === 'newest') {
    sortOptions = { createdAt: -1 };
  } else {
    sortOptions = { createdAt: 1 };
  }

  try {
    const artworks = await Artwork.find(filterConditions)
      .populate('artist', 'name avatar')
      .sort(sortOptions);

    res.json(artworks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};