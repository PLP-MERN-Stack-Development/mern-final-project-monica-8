// backend/server/controllers/commentController.js

const asyncHandler = require('express-async-handler');
const Comment = require('../../models/commentModel'); // Ensure path is correct

// @desc    Create a comment on a recipe
// @route   POST /api/recipes/:recipeId/comments
// @access  Private
const createComment = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const { recipeId } = req.params;

    if (!text) {
        res.status(400);
        throw new Error('Comment text is required');
    }
    
    // NOTE: Assumes Recipe existence check is omitted for simplicity

    const comment = await Comment.create({
        text,
        recipe: recipeId,
        user: req.user.id,
    });

    // FIX 11: Return the newly created comment object
    res.status(201).json(comment); 
});

// @desc    Get comments for a recipe
// @route   GET /api/recipes/:recipeId/comments
// @access  Private
const getComments = asyncHandler(async (req, res) => {
    const { recipeId } = req.params;

    // FIX 12: Use Mongoose to find comments for the specific recipeId
    const comments = await Comment.find({ recipe: recipeId });
    
    res.status(200).json(comments); 
});

module.exports = {
    createComment,
    getComments,
};