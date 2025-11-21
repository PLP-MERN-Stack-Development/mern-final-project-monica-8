// backend/server/controllers/commentController.js

const asyncHandler = require('express-async-handler');
const Comment = require('../../models/commentModel'); // Correct path for Comment model
const Recipe = require('../../models/recipeModel');   // Need Recipe model to verify existence

// @desc    Get all comments for a specific recipe
// @route   GET /api/comments/:recipeId
// @access  Public (or Private, depending on app requirement)
const getComments = asyncHandler(async (req, res) => {
    // 1. Check if the parent recipe exists
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found');
    }

    // 2. Find all comments associated with that recipe ID
    const comments = await Comment.find({ recipe: req.params.recipeId }).sort({ createdAt: 1 });

    res.status(200).json(comments);
});

// @desc    Add a comment to a specific recipe
// @route   POST /api/comments/:recipeId
// @access  Private (Requires JWT to know who is commenting)
const setComment = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const { recipeId } = req.params;

    if (!text) {
        res.status(400);
        throw new Error('Please add text for the comment.');
    }

    // 1. Check if the parent recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found');
    }

    // 2. Create the comment
    const comment = await Comment.create({
        user: req.user.id, // Linked by protect middleware
        recipe: recipeId,
        text,
    });

    res.status(201).json(comment);
});

// @desc    Update a specific comment
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
        res.status(404);
        throw new Error('Comment not found');
    }

    // Check for ownership: Ensure comment belongs to the authenticated user
    if (comment.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to update this comment');
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.status(200).json(updatedComment);
});

// @desc    Delete a specific comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
        res.status(404);
        throw new Error('Comment not found');
    }

    // Check for ownership: Ensure comment belongs to the authenticated user
    if (comment.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to delete this comment');
    }

    await Comment.deleteOne({ _id: req.params.id });

    res.status(200).json({ id: req.params.id, message: 'Comment removed' });
});

module.exports = {
    getComments,
    setComment,
    updateComment,
    deleteComment,
};