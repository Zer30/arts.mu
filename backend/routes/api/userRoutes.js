const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const userController = require('../../controllers/userController');
const multer = require('multer');
const path = require('path');

// Get all users (with type filter)
router.get('/', userController.getUsers);

// Get current user
router.get('/me', protect, userController.getMe);

// Get user dashboard data
router.get('/dashboard', protect, userController.getDashboardData);

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

// Update user profile route
router.put('/profile', 
    protect, 
    upload.single('avatar'), 
    userController.updateProfile
);

module.exports = router;