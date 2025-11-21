// routes/recipeRoutes.js

const express = require('express');
const router = express.Router();

// import controller functions
const {
  getRecipes,
  setRecipe,
  updateRecipe,
  deleteRecipe,
} = require('../controllers/recipeController');

// 2. Import protect  Middleware
const { protect } = require('../../middleware/authMiddleware');

// Combine GET and POST routes, applying 'protect' to both
router.route('/').get(protect, getRecipes).post(protect, setRecipe);

// Combine PUT and DELETE routes, applying 'protect' to both
router.route('/:id').put(protect, updateRecipe).delete(protect, deleteRecipe);

module.exports = router;

