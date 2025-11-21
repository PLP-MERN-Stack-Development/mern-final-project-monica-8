import { useState, useEffect } from 'react';
import api from './api/config';
import RecipeForm from './components/RecipeForm';
import EditForm from './components/EditForm';
import RecipeCard from './components/Recipecard';
import './App.css';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Adds a newly created recipe to state
  const handleAddRecipe = (newRecipe) => {
    setRecipes((prev) => [newRecipe, ...prev]);
  };

  // Updates a recipe in backend & state, closes edit mode
  const handleUpdateRecipe = async (id, updatedData) => {
    try {
      const response = await api.put(`/recipes/${id}`, updatedData);
      setRecipes((prev) => prev.map(r => r._id === id ? response.data : r));
      setEditingId(null);
    } catch (err) {
      console.error('Recipe UPDATE error:', err);
      setError('Failed to update recipe. Check console for details.');
    }
  };

  // Deletes recipe from backend and removes it from state
  const handleDeleteRecipe = async (id) => {
    try {
      await api.delete(`/recipes/${id}`);
      setRecipes((prev) => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error('Recipe DELETE error:', err);
      setError('Failed to delete recipe. Check console for details.');
    }
  };

  // Fetches all recipes from backend on component mount
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await api.get('/recipes');
        setRecipes(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch recipes. Ensure backend server is running.');
        setLoading(false);
        console.error('API Fetch Error:', err);
      }
    };
    fetchRecipes();
  }, []);

  if (loading) return <div className="loading">Loading Recipes...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <h1>🍽️ Special Needs Recipe Book ({recipes.length} Recipes)</h1>

      <RecipeForm handleAddRecipe={handleAddRecipe} />

      {recipes.length === 0 ? (
        <p>No recipes found. Use the form above to add your first recipe!</p>
      ) : (
        <div className="recipe-list">
          {recipes.map((recipe) =>
            editingId === recipe._id ? (
              <EditForm
                key={recipe._id}
                recipe={recipe}
                handleUpdateRecipe={handleUpdateRecipe}
                setEditingId={setEditingId}
              />
            ) : (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                onDelete={handleDeleteRecipe}
                onEdit={setEditingId}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

export default App;
