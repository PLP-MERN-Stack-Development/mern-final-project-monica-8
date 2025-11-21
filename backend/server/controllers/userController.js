// backend/server/controllers/userController.js

const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs'); // For comparing passwords
const jwt = require('jsonwebtoken'); // For issuing tokens
const User = require('../../models/userModel'); 
const { errorHandler} = require ('../../middleware/errorMiddleware');

// Helper function to generate a JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};

// @desc    Authenticate a user (Login)
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 1. Basic validation
    if (!email || !password) {
        res.status(400);
        throw new Error('Please fill in all fields');
    }

    // 2. Check for user existence
    const user = await User.findOne({ email });

    // 3. Check user password (if user exists)
    // The user must exist AND the password must match the hashed password in the database
    if (user && (await bcrypt.compare(password, user.password))) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(401); // Unauthorized
        throw new Error('Invalid credentials');
    }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // 1. Basic Validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please include all fields.');
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10); // 
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword, // Store the hashed password
    });

    // 5. Respond with token (if creation was successful)
    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    // This will be implemented after the 'protect' middleware is complete
    res.status(200).json(req.user); // Assuming 'req.user' is set by the middleware
});

module.exports = {
    registerUser,
    loginUser,
    getMe, 
};