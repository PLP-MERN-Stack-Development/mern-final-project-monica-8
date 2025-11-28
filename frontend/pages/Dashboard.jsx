// src/pages/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext'; 
import authFetch from '../utils/authFetch'; 
import RecipeList from '../components/RecipeList'; // Assuming you have this component
import RecipeForm from '../components/RecipeForm'; // Assuming you use this for adding/editing

function Dashboard() {
    const { user } = useAuth();
    const { showNotification } = useNotification();

    // --- State Management ---
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filtering & Sorting States
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All'); 
    const [sortOrder, setSortOrder] = useState('newest'); // Default sort: newest

    // UI/Modal State (optional, but common for recipe creation)
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    // --- Configuration Data ---
    const categories = ['All', 'Dinner', 'Breakfast', 'Dessert', 'Soup']; 
    
    const sortOptions = [
        { value: 'newest', label: 'Date Added (Newest)' },
        { value: 'oldest', label: 'Date Added (Oldest)' },
        { value: 'prepTimeAsc', label: 'Prep Time (Shortest)' },
        { value: 'prepTimeDesc', label: 'Prep Time (Longest)' },
    ]; 

    // --- Fetching Logic ---
    const fetchRecipes = async () => {
        setLoading(true);
        try {
            // Build the query string from the current state (search, category, sort)
            const queryParams = new URLSearchParams({
                search: searchTerm,
                category: categoryFilter,
                sort: sortOrder, 
            }).toString();
            
            const response = await authFetch.get(`/api/recipes?${queryParams}`);
            setRecipes(response.data);
        } catch (error) {
            console.error('Error fetching recipes:', error);
            showNotification('Failed to load recipes.', 'error');
        } finally {
            setLoading(false);
        }
    };
    
    // --- Effect: Fetch recipes whenever filters or sort order change ---
    useEffect(() => {
        // This function runs on mount and whenever search, category, or sortOrder changes.
        fetchRecipes();
    }, [searchTerm, categoryFilter, sortOrder]); 
    
    // --- Handler for creating new recipe (example) ---
    const handleAddRecipe = async (newRecipeData) => {
        try {
            // Assume the RecipeForm component passes data to this handler
            await authFetch.post('/api/recipes', newRecipeData);
            setIsFormOpen(false); // Close modal
            await fetchRecipes(); // Refresh the list
            // Notification handled within RecipeForm
        } catch (error) {
            console.error('Error creating recipe:', error);
            // Notification handled within RecipeForm
        }
    };


    return (
        <div className="dashboard-container">
            <h1 className="text-heading mb-6">Welcome, {user.name}!</h1>

            {/* --- Search, Filter, and Sort Bar UI --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-3 md:space-y-0 md:space-x-4 w-full">
                
                {/* 1. Search Input */}
                <input
                    type="text"
                    placeholder="Search recipes by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input w-full md:max-w-sm" 
                />

                {/* 2. Category Filter Select */}
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="form-input w-full md:w-40" 
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                
                {/* 3. Sort Order Select */}
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="form-input w-full md:w-52" 
                >
                    {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
            {/* --- End Filter/Sort Bar --- */}
            
            <div className="flex justify-between items-center w-full mb-4">
                <h2 className="text-xl font-bold">Your Recipes ({recipes.length})</h2>
                <button 
                    onClick={() => setIsFormOpen(true)} 
                    className="btn-primary"
                >
                    + Add New Recipe
                </button>
            </div>


            {/* --- Conditional Content Rendering --- */}
            {loading ? (
                <p className="text-lg text-gray-500 mt-10">Loading recipes...</p>
            ) : recipes.length > 0 ? (
                // RecipeList component displays the fetched data
                <RecipeList recipes={recipes} fetchRecipes={fetchRecipes} />
            ) : (
                <p className="text-lg text-gray-500 mt-10">
                    No recipes found matching your criteria. Try adjusting your search or filter settings.
                </p>
            )}

            {/* --- Modal/Form for Adding Recipe (Example) --- */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
                    <div className="bg-white p-6 rounded-lg shadow-2xl max-w-lg w-full">
                        <h3 className="text-xl font-semibold mb-4">Create New Recipe</h3>
                        <RecipeForm 
                            onSubmit={handleAddRecipe} 
                            onCancel={() => setIsFormOpen(false)} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;