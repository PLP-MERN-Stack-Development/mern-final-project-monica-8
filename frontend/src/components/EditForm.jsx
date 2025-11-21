import { useState } from 'react';

// Options for the category dropdown
const categoryOptions = [
  'General', // Default option if the recipe has no category set
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Dessert',
  'Beverage',
  // Added common 'Special Needs' categories for completeness
  'Sensory-Friendly',
  'Gluten-Free',
  'Low-Sugar'
];

function EditForm({ recipe, handleUpdateRecipe, setEditingId }) {
  // Local state to manage form inputs including imageUrl
  const [formData, setFormData] = useState({
    recipeName: recipe.recipeName || '',
    category: recipe.category || categoryOptions[0],
    instructions: recipe.instructions || '',
    imageUrl: recipe.imageUrl || '' // new image field
  });

  // Generic handler for all inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // When "Save" is clicked
  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation example: imageUrl can be empty or must be a valid URL if entered
    if (formData.imageUrl && !isValidHttpUrl(formData.imageUrl)) {
      alert('Please enter a valid image URL or leave blank.');
      return;
    }
    // Calls the parent function to execute the API update and close the form
    handleUpdateRecipe(recipe._id, formData);
  };

  // Cancel editing (calls the parent setter function)
  const handleCancel = () => {
    setEditingId(null);
  };

  // Simple URL validation helper
  function isValidHttpUrl(string) {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }

  return (
    <form className="edit-form" onSubmit={handleSubmit}>
      <h4>Edit Recipe</h4>

      <label htmlFor="edit-name">Name:</label>
      <input
        id="edit-name"
        type="text"
        name="recipeName"
        value={formData.recipeName}
        onChange={handleChange}
        placeholder="Recipe Name"
        required
      />

      <label htmlFor="edit-category">Category:</label>
      <select
        id="edit-category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        required
      >
        {categoryOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <label htmlFor="edit-instructions">Instructions:</label>
      <textarea
        id="edit-instructions"
        name="instructions"
        value={formData.instructions}
        onChange={handleChange}
        placeholder="Detailed instructions"
        rows="4"
        required
      />

      <label htmlFor="edit-imageUrl">Image URL (optional):</label>
      <input
        id="edit-imageUrl"
        type="url"
        name="imageUrl"
        value={formData.imageUrl}
        onChange={handleChange}
        placeholder="https://example.com/image.png"
        pattern="https?://.+"
        title="Please enter a valid URL starting with http:// or https://"
      />

      <div className="edit-buttons">
        <button type="submit" className="save-button">
          Save
        </button>
        <button type="button" className="cancel-button" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default EditForm;
