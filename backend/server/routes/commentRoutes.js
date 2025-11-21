// backend/server/routes/commentRoutes.js

const express = require('express');
const router = express.Router();

const {
    getComments,
    setComment,
    updateComment,
    deleteComment,
} = require('../controllers/commentController');

// Import the protect middleware (adjust path if needed)
const { protect } = require('../../middleware/authMiddleware');

// Route for listing all comments on a recipe (GET) and adding a new comment (POST)
// NOTE: GET /api/comments/:recipeId is often public, but POST must be private.
router.route('/:recipeId')
    .get(getComments)  // GET: Public access to read comments
    .post(protect, setComment); // POST: Private access (requires login)

// Routes for updating and deleting a specific comment by its ID
router.route('/:id')
    .put(protect, updateComment)
    .delete(protect, deleteComment);

module.exports = router;