// backend/routes/recipeRoutes.js (FINAL VERSION)

const express = require('express');
const router = express.Router();

// --- EXISTING IMPORTS ---
const { 
    getRecipes, 
    getRecipe, 
    createRecipe, 
    updateRecipe, 
    deleteRecipe 
} = require('../controllers/recipeController');

const { protect } = require('../middleware/authMiddleware');

// --- NEW IMPORT ---
const { getRecipeComments } = require('../controllers/commentController'); 

// === RECIPE CRUD ROUTES ===
router.route('/')
    .get(getRecipes) 
    .post(protect, createRecipe); 

router.route('/:id')
    .get(getRecipe)
    .put(protect, updateRecipe)
    .delete(protect, deleteRecipe);

// === NEW COMMENT RETRIEVAL ROUTE ===
// Maps to: GET /api/recipes/:recipeId/comments
router.route('/:recipeId/comments').get(getRecipeComments); 
// 

module.exports = router;