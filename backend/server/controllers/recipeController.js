const asyncHandler = require('express-async-handler');
const Recipe = require('../../models/recipeModel');

// @desc    Get all recipes
// @route   GET /api/recipes
// @access  Public
const getRecipes = asyncHandler(async (req, res) => {
    const recipes = await Recipe.find().populate('user', 'name');
    res.status(200).json(recipes);
});

// @desc    Get single recipe by id
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
// @access  Private
const createRecipe = asyncHandler(async (req, res) => {
    const { title, description, ingredients, instructions, prepTime, category, imageUrl } = req.body;

    if (!title || !description || !ingredients || !instructions || !prepTime || !category) {
        res.status(400);
        throw new Error('Please include all required recipe fields.');
    }

    const recipe = await Recipe.create({
        user: req.user.id,  // assuming req.user is set from auth middleware
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

// @desc    Update a recipe by id
// @route   PUT /api/recipes/:id
// @access  Private
const updateRecipe = asyncHandler(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found');
    }

    if (recipe.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized to update this recipe');
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json(updatedRecipe);
});

// @desc    Delete a recipe by id
// @route   DELETE /api/recipes/:id
// @access  Private
const deleteRecipe = asyncHandler(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found');
    }

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
