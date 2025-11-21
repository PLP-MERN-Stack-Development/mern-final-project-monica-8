const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  recipeName: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    default: 'General',
  },
  instructions: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Recipe', RecipeSchema);