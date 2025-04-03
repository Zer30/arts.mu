const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const asyncHandler = require('express-async-handler');

// Configure multer storage for profile images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/profile/');
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, website, location } = req.body;
  let avatarURL;

  if (req.file) {
    avatarURL = `/uploads/profile/${req.file.filename}`;
  }

  const updateData = {
    name,
    bio,
    website,
    location,
    avatarURL: avatarPath || req.user.avatarURL,
    avatar: avatarPath || req.user.avatar // Update both fields for compatibility
  };

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {  name,
      bio,
      website,
      location,
      avatarURL: avatarURL || req.user.avatarURL, // Use the declared variable
      avatar: avatarURL || req.user.avatar // Always maintain this field
    },
    { new: true }
  );

  console.log('Updated user:', updatedUser); // Debug
  res.json(updatedUser);
});


exports.getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

exports.getDashboardData = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'artworks',
    model: 'Artwork'
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.type === 'artist') {
    const dashboardData = {
      totalSales: 0,
      activeListings: user.artworks.filter(artwork => !artwork.sold).length,
      totalViews: user.artworks.reduce((sum, artwork) => sum + artwork.views, 0)
    };

    // Calculate total sales
    const soldArtworks = user.artworks.filter(artwork => artwork.sold);
    dashboardData.totalSales = soldArtworks.reduce((sum, artwork) => sum + artwork.price, 0);

    res.json(dashboardData);
  } else {
    // Collector dashboard data
    const dashboardData = {
      wishlist: [],
      following: [],
      recentOrders: []
      // ... other collector-specific data
    };

    res.json(dashboardData);
  }
});

exports.getUsers = async (req, res) => {
  try {
    const artists = await User.find({ type: 'artist' })
      .select('name avatarURL avatar bio followers artworks') // Include both avatar fields
      .lean();
    
    // Transform data to standardize avatar field
    const transformedArtists = artists.map(artist => ({
      ...artist,
      avatarURL: artist.avatarURL || artist.avatar // Use avatarURL first, fallback to avatar
    }));
    
    res.json({ users: transformedArtists });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching artists' });
  }
};

exports.getFollowingArtists = async (req, res) => {
  try {
      const user = await User.findById(req.user._id)
          .populate('following', 'name avatarUrl bio');
      res.json(user.following);
  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('-password')
    .populate({
      path: 'artistProfile.artworks',
      select: 'title price image',
      match: { type: 'artist' }
    })
    .populate({
      path: 'collectorProfile.wishlist',
      select: 'title artist price',
      match: { type: 'collector' }
    });

  res.json(user);
};