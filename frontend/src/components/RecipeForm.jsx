import { useState } from 'react';
import api from '../api/config';

// The handleAddRecipe prop will be used to update the main App component 
// after a successful POST request.
const RecipeForm = ({ handleAddRecipe }) => {
  const [recipeName, setRecipeName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [category, setCategory] = useState('General'); // Default value
  const [imageUrl, setImageUrl] = useState(''); // new imageUrl state
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Basic URL validation helper
  const isValidHttpUrl = (string) => {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser refresh
    setError(null);
    setSuccess(false);

    // Validate imageUrl if provided
    if (imageUrl && !isValidHttpUrl(imageUrl)) {
      setError('Please enter a valid image URL or leave blank.');
      return;
    }

    // Create the recipe object based on your backend model fields
    const newRecipe = { recipeName, instructions, category };
    if (imageUrl) newRecipe.imageUrl = imageUrl;

    try {
      // 1. Send POST request to the API
      const response = await api.post('/recipes', newRecipe);

      // 2. If successful (201 Created), clear the form and update the list
      setSuccess(true);
      setRecipeName('');
      setInstructions('');
      setCategory('General');
      setImageUrl('');
      
      // Call the function passed from the parent App component to update the list
      handleAddRecipe(response.data);

    } catch (err) {
      // Handle API errors (e.g., if a required field is missing)
      console.error("Recipe POST error:", err);
      setError('Failed to create recipe. Please ensure all fields are filled.');
    }
  };

  return (
    <div className="form-container">
      <h3>➕ Add New Recipe</h3>
      
      <form onSubmit={handleSubmit}>
        {/* Recipe Name Field */}
        <label>Recipe Name:</label>
        <input
          type="text"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
          required
        />

        {/* Instructions Field */}
        <label>Instructions (Sensory Notes):</label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          required
        />

        {/* Category Dropdown */}
        <label>Special Category:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="General">General</option>
          <option value="Sensory-Friendly">Sensory-Friendly</option>
          <option value="Gluten-Free">Gluten-Free</option>
          <option value="Low-Sugar">Low-Sugar</option>
        </select>

        {/* Image URL Input */}
        <label>Image URL (optional):</label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.png"
          pattern="https?://.+"
          title="Please enter a valid URL starting with http:// or https://"
        />

        <button type="submit">Add Recipe</button>
      </form>
      
      {/* Display Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Recipe added successfully!</div>}
    </div>
  );
};

export default RecipeForm;
