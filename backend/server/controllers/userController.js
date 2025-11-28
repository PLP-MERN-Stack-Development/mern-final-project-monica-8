// backend/server/controllers/userController.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
// const User = require('../../models/userModel'); 

// @desc    Generate JWT
const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables.');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please include all fields');
    }

    // FIX 1: Simulate the user existence check (required for the 'user already exists' test)
    // NOTE: This logic assumes you are running tests against a MongoDB connection (via jest.setup.js)
    const User = require('../../models/userModel'); // Use require inside the controller if needed
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash password and create user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword });

    if (user) {
        // FIX 2: Return the actual user data structure
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

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please enter email and password');
    }

    // FIX 3: Look up user and compare password
    const User = require('../../models/userModel');
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        // FIX 4: Return the actual user data structure
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get current user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    // This relies on the req.user set by the protect middleware.
    res.status(200).json({
        id: req.user.id, 
        name: req.user.name,
        email: req.user.email,
    });
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
};