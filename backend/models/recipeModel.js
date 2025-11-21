// models/recipeModel.js

const mongoose = require('mongoose');

const recipeSchema = mongoose.Schema({
    // Link the recipe back to the user who created it
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Reference the User model
    },
    title: {
        type: String,
        required: [true, 'Please add a recipe title'],
        trim: true,
        index: true, // Crucial for quick searching by title
    },
    description: {
        type: String,
        required: [true, 'Please add a brief description'],
    },
    ingredients: [
        {
            name: { type: String, required: true },
            quantity: { type: String, required: true },
        },
    ],
    instructions: {
        type: [String], // Store as an array of steps
        required: [true, 'Please add the preparation steps'],
    },
    prepTime: {
        type: Number, // Time in minutes
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Appetizer', 'Beverage'], // Restrict to a set list
    },
    imageUrl: {
        type: String, // URL of the image stored on Cloudinary
        default: 'https://via.placeholder.com/600x400',
    },
    // Advanced Feature: Rating System
    ratings: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            rating: { type: Number, min: 1, max: 5 },
        },
    ],
    // Virtual Field for Average Rating (Calculated, not stored)
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Calculate Average Rating as a Virtual Field
// This demonstrates an advanced schema technique for your Capstone.
recipeSchema.virtual('averageRating').get(function() {
    if (this.ratings.length > 0) {
        const total = this.ratings.reduce((acc, item) => acc + item.rating, 0);
        // Returns the average rounded to 1 decimal place
        return parseFloat((total / this.ratings.length).toFixed(1));
    }
    return 0;
});

// IMPORTANT: Create a Text Index for Advanced Search
// This allows you to search across multiple fields quickly using $text operator.
recipeSchema.index({
    title: 'text',
    description: 'text',
    'ingredients.name': 'text',
});

module.exports = mongoose.model('Recipe', recipeSchema);