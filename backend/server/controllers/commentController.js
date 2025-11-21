// controllers/commentController.js

const asyncHandler = require('express-async-handler');
const Comment = require('../models/commentModel');
const Recipe = require('../models/recipeModel');
// @desc    Get all comments for a specific recipe
// @route   GET /api/recipes/:recipeId/comments
// @access  Public
const getRecipeComments = asyncHandler(async (req, res) => {
    const { recipeId } = req.params;

    // Optional: Check if the recipe actually exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found.');
    }

    // Find all comments linked to this recipe, and populate the user's name
    const comments = await Comment.find({ recipe: recipeId })
        .populate('user', 'name') // Only return the user's name
        .sort({ createdAt: 1 }); // Sort by oldest first

    res.status(200).json(comments);
});
// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (Requires token & ownership)
const deleteComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
        res.status(404);
        throw new Error('Comment not found');
    }

    // Authorization Check: Ensure the logged-in user is the comment author
    if (comment.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized to delete this comment');
    }

    await Comment.deleteOne({ _id: req.params.id });

    // Note: If you implement real-time deletion, you should emit a socket event here
    // to instantly remove the comment from all connected clients' UIs.

    res.status(200).json({ id: req.params.id, message: 'Comment removed successfully' });
});
module.exports = {
    getRecipeComments,
    deleteComment,
};