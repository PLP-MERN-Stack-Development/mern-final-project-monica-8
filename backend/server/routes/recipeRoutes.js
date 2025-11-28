// backend/server/routes/recipeRoutes.js

const express = require('express');
const router = express.Router();

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

// The correct path is '../../middleware/authMiddleware'
const { protect } = require('../../middleware/authMiddleware'); 

// Standard Recipe Routes (using /api/recipes)
router.route('/').get(protect, getRecipes).post(protect, createRecipe);
router.route('/:id').put(protect, updateRecipe).delete(protect, deleteRecipe);

// Nested Comment Routes (using /api/recipes/:recipeId/comments)
router.route('/:recipeId/comments')
    .post(protect, createComment)
    .get(protect, getComments); 

module.exports = router;