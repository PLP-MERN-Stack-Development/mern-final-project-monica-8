// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
// const User = require('../models/userModel'); // Assuming User model is needed to find the user

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for token in headers
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            if (!process.env.JWT_SECRET) {
                res.status(500);
                throw new Error('JWT_SECRET is not configured.');
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token payload (assuming the user ID is in the 'id' field)
            // Placeholder: In a real app, you would look up the user in the database
            // req.user = await User.findById(decoded.id).select('-password');
            
            // Placeholder User Object for testing:
            req.user = {
                id: decoded.id || 'placeholder_id',
                name: 'Test User',
                email: 'test@example.com'
            };

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

// CRITICAL FIX: Ensure the protect function is exported correctly.
module.exports = { protect };