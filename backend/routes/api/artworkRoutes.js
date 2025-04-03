const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/authMiddleware');
const artworkController = require('../../controllers/artworkController');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/artworks/'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname); // Prevent filename conflicts
    }
  });

const upload = multer({ storage });

// Get all artworks
router.get('/', artworkController.getAllArtworks);

// Get artwork by ID
router.get('/:id', artworkController.getArtworkById);

// Create new artwork (artists only)


// router.post('/', protect, authorize('artist'), artworkController.createArtwork);

// Upload artwork (artists only)
router.post('/', 
    protect, 
    authorize('artist'),
    upload.single('artworkImage'), // Single middleware for file upload
    artworkController.createArtwork
);

// Update artwork (artists only)
router.put('/:id', protect, authorize('artist'), artworkController.updateArtwork);

// Delete artwork (artists only)
router.delete('/:id', protect, authorize('artist'), artworkController.deleteArtwork);

// Search artworks
router.get('/search', artworkController.searchArtworks);

// Filter artworks
router.get('/filter', artworkController.filterArtworks);

module.exports = router;