// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
} = require('../controllers/userController');
const { protect } = require('../../middleware/authMiddleware'); // Import middleware

// Public routes (no token required)
router.post('/', registerUser); // POST /api/users
router.post('/login', loginUser); // POST /api/users/login

// Private route (token required)
router.get('/me', protect, getMe); // GET /api/users/me

module.exports = router;