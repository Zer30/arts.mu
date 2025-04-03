const User = require('../models/User');
const Artwork = require('../models/Artwork');
const asyncHandler = require('express-async-handler');

// @desc    Get all artists
// @route   GET /api/artists
// @access  Public
exports.getAllArtists = async (req, res) => {
  try {
    const artists = await User.find({ type: 'artist' })
      .select('name bio location avatar followers artworks')
      .populate({
        path: 'artworks',
        model: 'Artwork',
        select: 'title image sold',
        match: { sold: false },
        limit: 3
      });

    res.json(artists);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get artist by ID
// @route   GET /api/artists/:id
// @access  Public
exports.getArtistById = async (req, res) => {
  try {
    const artist = await User.findById(req.params.id)
      .select('name bio location avatar followers artworks website')
      .populate({
        path: 'artworks',
        model: 'Artwork',
        select: 'title image price sold views createdAt category',
        limit: 6
      });

    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    res.json(artist);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Follow artist
// @route   POST /api/artists/:id/follow
// @access  Private
exports.followArtist = async (req, res) => {
  try {
    const artist = await User.findById(req.params.id);

    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    if (artist._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if already following
    if (artist.followers.includes(req.user._id.toString())) {
      return res.status(400).json({ message: 'You already follow this artist' });
    }

    artist.followers.push(req.user._id);
    await artist.save();

    res.json(artist);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Unfollow artist
// @route   POST /api/artists/:id/unfollow
// @access  Private
exports.unfollowArtist = async (req, res) => {
  try {
    const artist = await User.findById(req.params.id);

    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    // Check if not following
    if (!artist.followers.includes(req.user._id.toString())) {
      return res.status(400).json({ message: 'You are not following this artist' });
    }

    artist.followers = artist.followers.filter(follower => 
      follower.toString() !== req.user._id.toString()
    );
    await artist.save();

    res.json(artist);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get artist's artworks
// @route   GET /api/artists/:id/artworks
// @access  Public
exports.getArtistArtworks = async (req, res) => {
  try {
    const artist = await User.findById(req.params.id);
    
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    const artworks = await Artwork.find({ artist: artist._id })
      .select('title image price sold views createdAt category')
      .sort({ createdAt: -1 });

    res.json(artworks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};