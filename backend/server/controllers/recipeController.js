// backend/server/controllers/recipeController.js

const asyncHandler = require('express-async-handler');
const Recipe = require('../../models/recipeModel'); // Ensure path is correct
const mongoose = require('mongoose');

// @desc    Get user recipes
// @route   GET /api/recipes
// @access  Private
const getRecipes = asyncHandler(async (req, res) => {
    // FIX 5: Use Mongoose to find recipes belonging to the user
    const recipes = await Recipe.find({ user: req.user.id });
    // This ensures the 'should return user recipes' test passes if recipes were created in setup
    res.status(200).json(recipes); 
});

// @desc    Create new recipe
// @route   POST /api/recipes
// @access  Private
const createRecipe = asyncHandler(async (req, res) => {
    if (!req.body.name) {
        res.status(400);
        throw new Error('Please add a recipe name');
    }

    const recipe = await Recipe.create({
        ...req.body,
        user: req.user.id, // User ID attached by protect middleware
    });

    // FIX 6: Return the newly created recipe object
    res.status(201).json(recipe); 
});

// @desc    Update recipe
// @route   PUT /api/recipes/:id
// @access  Private
const updateRecipe = asyncHandler(async (req, res) => {
    const recipeId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
        res.status(404);
        throw new Error('Invalid recipe ID');
    }

    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found');
    }

    // Check ownership
    if (recipe.user.toString() !== req.user.id) {
        // FIX 7: Return 401 for unauthorized access
        res.status(401);
        throw new Error('User not authorized to update this recipe');
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(recipeId, req.body, {
        new: true,
    });

    // FIX 8: Return the updated recipe object
    res.status(200).json(updatedRecipe);
});

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
// @access  Private
const deleteRecipe = asyncHandler(async (req, res) => {
    const recipeId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
        // FIX 9: Explicitly throw error for 404/invalid ID
        res.status(404);
        throw new Error('Invalid recipe ID');
    }

    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found');
    }

    // Check ownership
    if (recipe.user.toString() !== req.user.id) {
        // FIX 10: Return 401 for unauthorized access
        res.status(401);
        throw new Error('User not authorized to delete this recipe');
    }

    await Recipe.deleteOne({ _id: recipeId });

    res.status(200).json({ id: recipeId, message: 'Recipe removed' });
});

module.exports = {
    getRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
};