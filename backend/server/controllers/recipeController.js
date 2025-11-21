// controllers/recipeController.js

const asyncHandler = require('express-async-handler');
const Recipe = require('../models/recipeModel');

// @desc    Get all recipes//
// controllers/recipeController.js

const asyncHandler = require('express-async-handler');
const Recipe = require('../models/recipeModel');

// @desc    Get single recipe
// @route   GET /api/recipes/:id
// @access  Public
const getRecipe = asyncHandler(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id).populate('user', 'name');

    if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found');
    }

    res.status(200).json(recipe);
});

// @desc    Create new recipe
// @route   POST /api/recipes
// @access  Private (Requires JWT Token)
const createRecipe = asyncHandler(async (req, res) => {
    const { title, description, ingredients, instructions, prepTime, category, imageUrl } = req.body;

    // Basic Input Validation Check
    if (!title || !description || !ingredients || !instructions || !prepTime || !category) {
        res.status(400);
        throw new Error('Please include all required recipe fields.');
    }

    const recipe = await Recipe.create({
        // Link the recipe to the authenticated user
        user: req.user.id,
        title,
        description,
        ingredients,
        instructions,
        prepTime,
        category,
        imageUrl,
    });

    res.status(201).json(recipe);
});

// @desc    Update a recipe
// @route   PUT /api/recipes/:id
// @access  Private
const updateRecipe = asyncHandler(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found');
    }

    // Authorization Check: Check if the logged-in user is the recipe owner
    if (recipe.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized to update this recipe');
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true, 
            runValidators: true, // Run Mongoose validators on update
        }
    );

    res.status(200).json(updatedRecipe);
});

// @desc    Delete a recipe
// @route   DELETE /api/recipes/:id
// @access  Private
const deleteRecipe = asyncHandler(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found');
    }

    // Authorization Check: Check if the logged-in user is the recipe owner
    if (recipe.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized to delete this recipe');
    }

    await Recipe.findByIdAndDelete(req.params.id);

    res.status(200).json({ id: req.params.id, message: 'Recipe removed successfully' });
});

module.exports = {
    getRecipes,
    getRecipe,
    createRecipe,
    updateRecipe,
    deleteRecipe,
};