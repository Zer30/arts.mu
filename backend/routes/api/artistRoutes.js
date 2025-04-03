const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const artistController = require('../../controllers/artistController');

// Get all artists
router.get('/', artistController.getAllArtists);

// Get artist by ID
router.get('/:id', artistController.getArtistById);

// Follow artist
router.post('/:id/follow', protect, artistController.followArtist);

// Unfollow artist
router.post('/:id/unfollow', protect, artistController.unfollowArtist);

// Get artist's artworks
router.get('/:id/artworks', artistController.getArtistArtworks);

module.exports = router;