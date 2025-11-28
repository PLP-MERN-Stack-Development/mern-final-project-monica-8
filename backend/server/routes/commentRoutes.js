// backend/server/routes/commentRoutes.js

const express = require('express');
// CRITICAL FIX 1: Use mergeParams to access the parent router's parameters (like :recipeId)
const router = express.Router({ mergeParams: true }); 

// 🔑 PATH FIX: Use '../../' to go up two directories (to 'backend/') 
// then down into 'controllers/'.
const {
    getComments,
    setComment,
    updateComment,
    deleteComment,
} = require('../controllers/commentController');

// 🔑 IMPORT/PATH FIX: 
// 1. Assuming 'protect' uses 'module.exports = protect', import it without destructuring.
// 2. Use '../../' to navigate from 'server/routes/' to 'middleware/'.
const protect = require('../../middleware/authMiddleware');

// --- Routes for /api/recipes/:recipeId/comments ---

// FIX 2: The path should be '/' because the parent router (recipeRoutes.js) 
// handles the '/:recipeId/comments' part of the URL.
router.route('/')
    .get(getComments)     // GET: Get all comments for a recipe
    .post(protect, setComment); // POST: Add a new comment (requires login)

// --- Routes for /api/recipes/:recipeId/comments/:id ---

// FIX 3: This path now refers to a specific comment ID (:id), relative to the root mount.
router.route('/:id')
    .put(protect, updateComment)
    .delete(protect, deleteComment);

module.exports = router;