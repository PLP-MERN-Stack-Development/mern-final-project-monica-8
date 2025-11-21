import React from 'react';

/**
 * RecipeCard component renders a recipe with image, title, category, instructions,
 * and Edit/Delete buttons.
 * Props:
 * - recipe: the recipe object (imageUrl, recipeName, category, instructions, _id)
 * - onDelete: function to delete the recipe
 * - onEdit: function to trigger editing
 */
const RecipeCard = ({ recipe, onDelete, onEdit }) => {
  if (!recipe) return null;

  const {
    _id,
    recipeName,
    category,
    instructions,
    imageUrl,
  } = recipe;

  // Placeholder image if no imageUrl provided
  const placeholderImage = "https://via.placeholder.com/400x250?text=Recipe+Image";

  const handleDeleteClick = () => {
    // In production, replace with modal confirmation
    onDelete(_id);
  };

  const handleEditClick = () => {
    onEdit(_id);
  };

  return (
    <div className="recipe-card">
      <img
        src={imageUrl || placeholderImage}
        alt={recipeName}
        className="recipe-image"
      />
      <div className="card-header">
        <button
          className="delete-button"
          onClick={handleDeleteClick}
          aria-label={`Delete ${recipeName}`}
        >
          &times;
        </button>

        <button
          className="edit-button"
          onClick={handleEditClick}
          aria-label={`Edit ${recipeName}`}
        >
          Edit
        </button>

        <h2>{recipeName}</h2>
      </div>

      <p><strong>Category:</strong> {category || 'General'}</p>
      <p><strong>Instructions/Sensory Notes:</strong> {instructions}</p>
      
      <p className="id-text">ID: {_id}</p>
    </div>
  );
};

export default RecipeCard;
