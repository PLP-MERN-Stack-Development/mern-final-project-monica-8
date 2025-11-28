// backend/models/recipeModel.js

const mongoose = require('mongoose');

const recipeSchema = mongoose.Schema(
    {
        // Must link the recipe to the authenticated user
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: {
            type: String,
            required: [true, 'Please add a recipe name'],
        },
        // FIX 1: Defines ingredients as a simple array of strings. 
        // This stops the "Cast to embedded failed" error if the test sends ["water"].
        ingredients: [
            {
                type: String, 
                required: [true, 'Each ingredient must have a name'],
            }
        ],
        // FIX 2: Explicitly defines and requires category
        category: {
            type: String, 
            required: [true, 'Path `category` is required.'],
        },
        // FIX 3: Explicitly defines and requires prepTime
        prepTime: {
            type: Number, 
            required: [true, 'Path `prepTime` is required.'],
        },
        // Add other fields relevant to your recipe here (e.g., instructions)
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Recipe', recipeSchema);