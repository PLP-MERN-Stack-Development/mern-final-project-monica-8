// backend/server/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
} = require('../controllers/userController'); // Ensure these are exported correctly

// Ensure correct path for middleware: '../../middleware/authMiddleware'
const { protect } = require('../../middleware/authMiddleware'); 

// Standard User Routes
router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

module.exports = router;