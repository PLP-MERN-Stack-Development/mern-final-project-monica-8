// backend/server/controllers/recipeController.js

const asyncHandler = require('express-async-handler');
const Recipe = require('../../models/recipeModel');

const User = require('../../models/userModel'); 

// @desc    Get all recipes (for the logged-in user)
// @route   GET /api/recipes
// @access  Private
const getRecipes = asyncHandler(async (req, res) => {
    // req.user is available because of the 'protect' middleware
    const recipes = await Recipe.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json(recipes);
});

// @desc    Create a new recipe
// @route   POST /api/recipes
// @access  Private
const setRecipe = asyncHandler(async (req, res) => {
    const { title, description, ingredients, steps } = req.body;

    if (!title || !description) {
        res.status(400);
        throw new Error('Please include a title and description for the recipe.');
    }

    const recipe = await Recipe.create({
        user: req.user.id, // Link the recipe to the authenticated user
        title,
        description,
        ingredients,
        steps,
    });

    res.status(201).json(recipe); // 201 Created
});

// @desc    Update a specific recipe
// @route   PUT /api/recipes/:id
// @access  Private
const updateRecipe = asyncHandler(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found');
    }

    // Check for user ownership
    if (recipe.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to update this recipe');
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.status(200).json(updatedRecipe);
});

// @desc    Delete a specific recipe
// @route   DELETE /api/recipes/:id
// @access  Private
const deleteRecipe = asyncHandler(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found');
    }
    
    // Check for user ownership
    if (recipe.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to delete this recipe');
    }

    await Recipe.deleteOne({ _id: req.params.id });

    res.status(200).json({ id: req.params.id, message: 'Recipe removed' });
});

module.exports = {
    getRecipes,
    setRecipe,
    updateRecipe,
    deleteRecipe,
};