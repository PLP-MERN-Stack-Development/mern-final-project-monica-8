// routes/recipeRoutes.js

const express = require('express');
const router = express.Router();

// import controller functions
const {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} = require('../controllers/recipeController');

router.get('/', getRecipes);
router.get('/:id', getRecipe);
router.post('/', createRecipe);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);

module.exports = router;

// 2. Import Security Middleware
const { protect } = require('../../middleware/authMiddleware');

// 3. Define Routes

// GET /api/recipes: Fetch all recipes (Public)
// POST /api/recipes: Create a new recipe (Private - requires token)
// We chain these methods since they use the same base path
router.route('/')
    .get(getRecipes)
    .post(protect, createRecipe); // Apply 'protect' middleware here

// GET /api/recipes/:id: Fetch single recipe by ID (Public)
// PUT /api/recipes/:id: Update a specific recipe (Private - requires token AND ownership check in controller)
// DELETE /api/recipes/:id: Delete a specific recipe (Private - requires token AND ownership check in controller)
// We chain these methods since they use the same base path with an ID parameter
router.route('/:id')
    .get(getRecipe)
    .put(protect, updateRecipe)    // Apply 'protect' middleware
    .delete(protect, deleteRecipe); // Apply 'protect' middleware

module.exports = router;