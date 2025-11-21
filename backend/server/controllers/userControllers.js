const User = require('../models/userModel'); // Assuming your Mongoose Model is here
const jwt = require('jsonwebtoken'); // For creating auth tokens
const bcrypt = require('bcryptjs'); // For secure password hashing

// Helper function to generate JWT token
const generateToken = (id) => {
    // Note: process.env.JWT_SECRET must be set in your .env file
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};