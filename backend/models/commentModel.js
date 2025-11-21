// models/commentModel.js

const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    // Link to the user who posted the comment
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    // Link to the recipe the comment belongs to
    recipe: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Recipe',
    },
    text: {
        type: String,
        required: [true, 'Comment cannot be empty.'],
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Comment', commentSchema);