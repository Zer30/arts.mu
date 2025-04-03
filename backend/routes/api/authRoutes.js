const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');

// Signup
router.post('/signup', authController.signup);

// Signin
router.post('/signin', authController.signin);

module.exports = router;