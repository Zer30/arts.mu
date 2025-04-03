const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');


exports.protect = async (req, res, next) => {
    try {
        let token;
        
        // Get token from Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        // Check if token exists
        if (!token) {
            return res.status(401).json({ message: 'Not authorized - No token' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from token
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        
        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Not authorized - Invalid token' });
    }
};

// Middleware to check user type
exports.authorize = (...types) => {
    return (req, res, next) => {
        if (!types.includes(req.user.type)) {
            return res.status(403).json({ 
                message: `User type ${req.user.type} is not authorized to access this route`
            });
        }
        next();
    };
};