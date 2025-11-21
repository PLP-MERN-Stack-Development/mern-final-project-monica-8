// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel'); // This path might need to be adjusted!

// NOTE: Adjust the path for the User model based on your structure.
// If models is at the top level (backend/models), use:
// const User = require('../models/userModel'); 
// OR if models is inside server (backend/server/models), use:
// const User = require('./models/userModel'); 
// Assuming it's at the top level relative to the middleware folder:
// const User = require('../models/userModel'); 

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for the token in the headers
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header (it looks like: "Bearer [token]")
            token = req.headers.authorization.split(' ')[1];

            // Verify token and decode the payload (which contains the user ID)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from the token payload ID.
            // Select('-password') ensures we don't return the hashed password.
            req.user = await User.findById(decoded.id).select('-password');

            // If a user is found, proceed to the next middleware/controller
            if (req.user) {
                next();
            } else {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }
        } catch (error) {
            console.error(error);
            res.status(401); // Unauthorized
            throw new Error('Not authorized, token failed');
        }
    }

    // If no token is found in the header
    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

module.exports = { protect };