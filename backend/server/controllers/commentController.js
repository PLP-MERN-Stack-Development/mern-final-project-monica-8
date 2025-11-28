// backend/server/controllers/commentController.js

const asyncHandler = require('express-async-handler');
// const Comment = require('../models/commentModel'); // Assuming import exists

// @desc    Create a comment on a recipe
// @route   POST /api/recipes/:recipeId/comments
// @access  Private
const createComment = asyncHandler(async (req, res) => {
    // Controller logic here
    if (!req.body.text) {
        res.status(400);
        throw new Error('Comment text is required');
    }
    res.status(201).json({}); // Placeholder
});

// @desc    Get comments for a recipe
// @route   GET /api/recipes/:recipeId/comments
// @access  Private
const getComments = asyncHandler(async (req, res) => {
    // Controller logic here
    res.status(200).json([]); // Placeholder
});

// CRITICAL FIX: Ensure all controller functions are exported
module.exports = {
    createComment,
    getComments,
};