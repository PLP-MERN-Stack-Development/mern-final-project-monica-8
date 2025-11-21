const express = require('express');
const router = express.Router();
const Recipe = require('../../models/Recipe');

// Middleware to get a single recipe by ID
const getRecipe = async (req, res, next) => {
    let recipe;
    try {
        recipe = await Recipe.findById(req.params.id);
        if (recipe == null) {
            return res.status(404).json({ message: 'Cannot find recipe' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.recipe = recipe;
    next();
};


// GET /api/recipes - Get all recipes (FETCH)
router.get('/recipes', async (req, res) => {
    try {
        const recipes = await Recipe.find().sort({ createdAt: -1 });
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/recipes - Create one recipe (ADD)
router.post('/recipes', async (req, res) => {
    const recipe = new Recipe({
        recipeName: req.body.recipeName,
        category: req.body.category,
        instructions: req.body.instructions,
    });
    try {
        const newRecipe = await recipe.save();
        res.status(201).json(newRecipe);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT /api/recipes/:id - Update one recipe (UPDATE)
router.put('/recipes/:id', getRecipe, async (req, res) => {
    // Only update fields that were passed in the request body
    if (req.body.recipeName != null) {
        res.recipe.recipeName = req.body.recipeName;
    }
    if (req.body.category != null) {
        res.recipe.category = req.body.category;
    }
    if (req.body.instructions != null) {
        res.recipe.instructions = req.body.instructions;
    }
    
    try {
        const updatedRecipe = await res.recipe.save();
        res.json(updatedRecipe);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/recipes/:id - Delete one recipe (DELETE)
router.delete('/recipes/:id', getRecipe, async (req, res) => {
    try {
        // Use deleteOne() or remove() depending on Mongoose version
        await res.recipe.deleteOne(); 
        res.json({ message: 'Deleted Recipe' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;