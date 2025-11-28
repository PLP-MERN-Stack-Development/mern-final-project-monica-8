// backend/server/routes/recipeRoutes.js

const express = require('express');
const router = express.Router();

// FIX: Ensure correct object destructuring for imported controllers
const {
    getRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
} = require('../controllers/recipeController');

const {
    createComment,
    getComments,
} = require('../controllers/commentController');

// Ensure correct path for middleware: '../../middleware/authMiddleware'
const { protect } = require('../../middleware/authMiddleware'); 

// Standard Recipe Routes (using /api/recipes)
router.route('/').get(protect, getRecipes).post(protect, createRecipe);
router.route('/:id').put(protect, updateRecipe).delete(protect, deleteRecipe);

// Nested Comment Routes (using /api/recipes/:recipeId/comments)
router.route('/:recipeId/comments')
    .post(protect, createComment)
    .get(protect, getComments); 

module.exports = router;