// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler'); // Simple wrapper for async functions to catch errors
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for the 'Bearer <token>' format in the Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // 1. Get token from header (split "Bearer" from the token string)
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Get user from the token payload (it contains the user ID)
            // We select everything EXCEPT the password field
            req.user = await User.findById(decoded.id).select('-password');

            // 4. Continue to the next middleware or controller function
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

module.exports = { protect };

// Don't forget to install express-async-handler: npm install express-async-handler