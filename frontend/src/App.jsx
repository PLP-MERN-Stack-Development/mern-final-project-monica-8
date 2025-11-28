import React, { useState, useEffect } from 'react';

// --- Utility Functions: API Service Layer (Based on apiService.js) ---
// Note: In a real app, these would be in a separate src/services/apiService.js file.

const API_URL = '/api';

/**
 * Gets the current user object (including token) from local storage.
 */
const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

/**
 * Base function for authenticated API calls.
 */
const authFetch = async (endpoint, method = 'GET', data = null) => {
    const user = getCurrentUser();
    const token = user?.token;

    const headers = {
        'Content-Type': 'application/json',
    };
    
    // Attach token for protected routes
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
    };

    // Implement simple exponential backoff for robustness
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, config);
            
            // ** FIX APPLIED HERE: Check if the response body is empty (e.g., 204 No Content) **
            const isNoContent = response.status === 204;
            const responseData = isNoContent ? null : await response.json(); 

            if (!response.ok) {
                // If unauthorized (401), force logout
                if (response.status === 401) {
                    localStorage.removeItem('user');
                }
                const errorMessage = responseData?.message || `API call failed with status ${response.status}`;
                throw new Error(errorMessage);
            }

            return responseData;
        } catch (error) {
            if (attempt === 2) throw error;
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }
};

// --- API Service Functions (Calling the Backend) ---

const loginUser = async (userData) => {
    const data = await authFetch('/users/login', 'POST', userData);
    if (data.token) {
        localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
};

const logoutUser = () => {
    localStorage.removeItem('user');
};

const getRecipes = () => {
    return authFetch('/recipes', 'GET');
};

const createRecipe = (recipeData) => {
    return authFetch('/recipes', 'POST', recipeData);
};

const deleteRecipe = (recipeId) => {
    // A successful delete usually returns 204 No Content, which the fixed authFetch now handles.
    return authFetch(`/recipes/${recipeId}`, 'DELETE');
};

const updateRecipe = (recipeId, recipeData) => {
    return authFetch(`/recipes/${recipeId}`, 'PUT', recipeData);
};


// --- Main Application Component ---

const App = () => {
    const [user, setUser] = useState(getCurrentUser());
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Updated view state to handle list, create, and edit with recipe ID
    const [view, setView] = useState('list'); // 'list', 'create', or { type: 'edit', id: 'recipeId' }

    // --- Data Fetching Effect ---
    useEffect(() => {
        if (user) {
            fetchRecipes();
        } else {
            setRecipes([]);
        }
    }, [user]);

    const fetchRecipes = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getRecipes();
            setRecipes(data);
        } catch (err) {
            setError(err.message);
            // If fetching fails due to 401, clean up user state
            if (err.message.includes('401') || err.message.includes('authorized')) {
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    };

    // --- Authentication Handlers ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            const loggedInUser = await loginUser({ email, password });
            setUser(loggedInUser);
        } catch (err) {
            setError(err.message || 'Login failed. Check credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logoutUser();
        setUser(null);
        setRecipes([]);
        setError(null);
        setView('list');
    };
    
    // --- Recipe Handlers ---
    const handleCreateRecipe = async (recipeData) => {
        setLoading(true);
        setError(null);
        try {
            await createRecipe(recipeData);
            await fetchRecipes(); // Refresh the list
            setView('list');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDeleteRecipe = async (recipeId, recipeName) => {
        if (!window.confirm(`Are you sure you want to delete the recipe: "${recipeName}"?`)) {
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            await deleteRecipe(recipeId);
            setRecipes(prev => prev.filter(r => r._id !== recipeId)); // Optimistic UI update
        } catch (err) {
            setError(err.message);
            fetchRecipes(); 
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRecipe = async (recipeId, recipeData) => {
        setLoading(true);
        setError(null);
        try {
            await updateRecipe(recipeId, recipeData);
            await fetchRecipes(); // Refresh the list to show updated data
            setView('list');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    // --- Render Components ---

    const LoginView = () => (
        <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-2xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                <input
                    type="email"
                    name="email"
                    placeholder="E.g., recipe.test@example.com"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-150 disabled:bg-indigo-400"
                >
                    {loading ? 'Logging in...' : 'Log In'}
                </button>
            </form>
            {error && <p className="mt-4 text-red-600 text-center text-sm">{error}</p>}
            <p className="mt-4 text-xs text-gray-500 text-center">
                Use the test user credentials from your backend tests.
            </p>
        </div>
    );
    
    // Abstracted form logic for Create/Edit
    const RecipeForm = ({ initialData = {}, onSubmit, isEditing = false }) => {
        const [formName, setFormName] = useState(initialData.name || '');
        const [formIngredients, setFormIngredients] = useState(initialData.ingredients ? initialData.ingredients.join('\n') : '');
        const [formCategory, setFormCategory] = useState(initialData.category || '');
        const [formPrepTime, setFormPrepTime] = useState(initialData.prepTime || 0);

        const handleSubmit = (e) => {
            e.preventDefault();
            setError(null);

            const data = {
                name: formName,
                ingredients: formIngredients.split('\n').map(i => i.trim()).filter(i => i),
                category: formCategory,
                prepTime: parseInt(formPrepTime) || 0,
            };

            if (data.ingredients.length === 0) {
                setError("Ingredients field cannot be empty.");
                return;
            }
            if (!data.category) {
                setError("Please select a category.");
                return;
            }
            if (data.prepTime <= 0) {
                 setError("Prep time must be greater than 0.");
                return;
            }

            onSubmit(data);
        };

        return (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 w-full">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">{isEditing ? 'Edit Recipe' : 'New Recipe'}</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input 
                        name="name" 
                        placeholder="Recipe Name" 
                        required 
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full p-2 border rounded-lg" 
                    />
                    <textarea 
                        name="ingredients" 
                        placeholder="Ingredients (one per line)" 
                        rows="4" 
                        required 
                        value={formIngredients}
                        onChange={(e) => setFormIngredients(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                    />
                    <div className="flex gap-4">
                        <select 
                            name="category" 
                            required 
                            value={formCategory}
                            onChange={(e) => setFormCategory(e.target.value)}
                            className="w-1/2 p-2 border rounded-lg"
                        >
                            <option value="">Select Category</option>
                            <option>Soup</option>
                            <option>Baking</option>
                            <option>Dinner</option>
                        </select>
                        <input 
                            name="prepTime" 
                            type="number" 
                            placeholder="Prep Time (mins)" 
                            required 
                            value={formPrepTime}
                            onChange={(e) => setFormPrepTime(e.target.value)}
                            className="w-1/2 p-2 border rounded-lg" 
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full p-2 rounded-lg font-semibold transition duration-150 ${
                            isEditing 
                            ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400' 
                            : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400'
                        }`}
                    >
                        {loading ? (isEditing ? 'Saving Changes...' : 'Saving...') : (isEditing ? 'Save Changes' : 'Create Recipe')}
                    </button>
                </form>
                {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
            </div>
        );
    };

    const CreateRecipeView = () => (
        <RecipeForm onSubmit={handleCreateRecipe} />
    );

    const EditRecipeView = ({ recipeId }) => {
        const recipeToEdit = recipes.find(r => r._id === recipeId);

        if (!recipeToEdit) {
            return <p className="text-red-500">Error: Recipe not found for editing.</p>;
        }

        const onEditSubmit = (data) => handleUpdateRecipe(recipeId, data);

        return (
            <RecipeForm 
                initialData={recipeToEdit} 
                onSubmit={onEditSubmit} 
                isEditing={true} 
            />
        );
    };

    const RecipeList = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
                <h2 className="text-2xl font-bold text-gray-800">Your Recipes ({recipes.length})</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={fetchRecipes}
                        disabled={loading}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={() => setView('create')}
                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        + Add New
                    </button>
                </div>
            </div>

            {loading && <p className="text-center text-indigo-500">Loading recipes...</p>}
            {error && <p className="text-red-600 text-center p-4 bg-red-50 rounded-lg">Error: {error}</p>}
            
            {!loading && recipes.length === 0 && !error && (
                <p className="text-center text-gray-500 pt-8">No recipes found. Start by creating one!</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipes.map((recipe) => (
                    <div key={recipe._id} className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                        <h3 className="text-xl font-semibold text-gray-900">{recipe.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">{recipe.category} | {recipe.prepTime} mins</p>
                        <div className="mt-2 space-y-1">
                               <h4 className="font-medium text-gray-700">Ingredients:</h4>
                            <ul className="list-disc list-inside text-sm text-gray-600 pl-4">
                                {recipe.ingredients.map((ing, index) => (
                                    <li key={index}>{ing}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button 
                                onClick={() => handleDeleteRecipe(recipe._id, recipe.name)}
                                disabled={loading}
                                className="text-sm text-red-500 hover:text-red-700 transition disabled:opacity-50"
                            >
                                Delete
                            </button>
                            <button 
                                onClick={() => setView({ type: 'edit', id: recipe._id })}
                                disabled={loading}
                                className="text-sm text-blue-500 hover:text-blue-700 transition disabled:opacity-50"
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );


    // --- Main Layout Render ---
    
    // Determine the current view to render
    let currentViewComponent;
    let showBackButton = false;

    if (!user) {
        currentViewComponent = <LoginView />;
    } else if (view === 'create') {
        currentViewComponent = <CreateRecipeView />;
        showBackButton = true;
    } else if (typeof view === 'object' && view.type === 'edit') {
        currentViewComponent = <EditRecipeView recipeId={view.id} />;
        showBackButton = true;
    } else {
        currentViewComponent = <RecipeList />;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-[Inter] p-4 sm:p-8">
            <header className="flex justify-between items-center max-w-4xl mx-auto mb-8 p-4 bg-white shadow-lg rounded-xl">
                <h1 className="text-3xl font-extrabold text-indigo-600">Recipe Planner</h1>
                {user ? (
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-700 text-sm hidden sm:inline">Welcome, {user.name || 'User'}!</span>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">Please Log In</p>
                )}
            </header>

            <main className="max-w-4xl mx-auto">
                {user && showBackButton && (
                     <div className="max-w-xl mx-auto">
                        <button 
                            onClick={() => setView('list')} 
                            className="mb-4 text-indigo-600 hover:text-indigo-800 flex items-center"
                        >
                            &larr; Back to List
                        </button>
                    </div>
                )}
                <div className={showBackButton ? "max-w-xl mx-auto" : ""}>
                    {currentViewComponent}
                </div>
            </main>
        </div>
    );
};

export default App;