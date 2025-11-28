// src/components/RecipeForm.jsx

import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext'; 

// Assuming you have a custom input component or just use the Tailwind classes defined in index.css

function RecipeForm({ onSubmit, onCancel, initialData = {} }) {
    
    // 🎯 Use the hook to access the notification function
    const { showNotification } = useNotification(); 
    
    // --- State Management ---
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        prepTime: initialData.prepTime || '',
        ingredients: initialData.ingredients || '',
        category: initialData.category || 'Dinner', // Set a default category
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false); // For loading state (UX enhancement)

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
        
        // Optional: Clear the error immediately when the user starts typing in a field
        if (errors[name]) {
             // Use null to clear the specific error, allowing the field to look clean again
             setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    // --- Validation Logic ---
    const validate = () => {
        const newErrors = {};

        // 1. Validate Recipe Name (Required)
        if (!formData.name.trim()) {
            newErrors.name = "Recipe name is required.";
        }

        // 2. Validate Prep Time (Required, Number, Positive Integer)
        const prepTimeValue = formData.prepTime.trim();
        const numericPrepTime = Number(prepTimeValue);

        if (!prepTimeValue) {
            newErrors.prepTime = "Prep time is required.";
        } else if (isNaN(numericPrepTime)) {
            newErrors.prepTime = "Prep time must be a number.";
        } else if (numericPrepTime <= 0) {
            newErrors.prepTime = "Prep time must be a positive number of minutes.";
        } else if (!Number.isInteger(numericPrepTime)) {
            newErrors.prepTime = "Prep time should be a whole number.";
        }
        
        // 3. Validate Ingredients (Required)
        if (!formData.ingredients.trim()) {
            newErrors.ingredients = "Ingredients are required.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- Submission Handler (Unified and Corrected) ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validate()) {
            // Start loading state only if validation passes
            setIsSubmitting(true);
            try {
                // Call the API via the onSubmit prop (This handles POST or PUT)
                await onSubmit(formData); 
                
                // 🎯 SUCCESS MESSAGE
                const message = initialData._id ? 'Recipe updated successfully!' : 'Recipe created successfully!';
                showNotification(message, 'success'); 
                
                // If it's a new recipe, you might want to clear the form here.
                // If it's an update, the parent component handles redirection/closing the modal.
                
            } catch (error) {
                // 🎯 ERROR MESSAGE (Handle API submission failures)
                showNotification('Error saving recipe. Please try again.', 'error');
                console.error("API submission failed:", error);
            } finally {
                // Always stop loading, regardless of success or failure
                setIsSubmitting(false);
            }
        } else {
            // Validation failed: errors are already set by validate(), UI updates automatically
            // No need for a network call or showing loading state.
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* --- Recipe Name Input --- */}
            <div>
                <label htmlFor="name" className="form-label">Recipe Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-input ${errors.name ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}
                    placeholder="Grandma's Chili"
                    disabled={isSubmitting}
                />
                {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
            </div>

            {/* --- Prep Time Input (Targeted Validation) --- */}
            <div>
                <label htmlFor="prepTime" className="form-label">Prep Time (minutes)</label>
                <input
                    type="text"
                    id="prepTime"
                    name="prepTime"
                    value={formData.prepTime}
                    onChange={handleChange}
                    className={`form-input ${errors.prepTime ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., 30"
                    disabled={isSubmitting}
                />
                {errors.prepTime && (
                    <p className="text-red-500 text-sm mt-1">{errors.prepTime}</p>
                )}
            </div>

            {/* --- Ingredients Textarea --- */}
            <div>
                <label htmlFor="ingredients" className="form-label">Ingredients</label>
                <textarea
                    id="ingredients"
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={handleChange}
                    rows="4"
                    className={`form-input ${errors.ingredients ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}
                    placeholder="List each ingredient on a new line..."
                    disabled={isSubmitting}
                />
                {errors.ingredients && (
                    <p className="text-red-500 text-sm mt-1">{errors.ingredients}</p>
                )}
            </div>
            
            {/* --- Category Input (Simple Select) --- */}
            <div>
                <label htmlFor="category" className="form-label">Category</label>
                <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-input"
                    disabled={isSubmitting}
                >
                    <option value="Dinner">Dinner</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Soup">Soup</option>
                </select>
            </div>

            {/* --- Action Buttons --- */}
            <div className="flex justify-end space-x-3 pt-4">
                {/* Cancel button is optional, but good for UX */}
                {onCancel && (
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        className="btn-secondary"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                )}
                
                <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : initialData._id ? 'Update Recipe' : 'Create Recipe'}
                </button>
            </div>
        </form>
    );
}

export default RecipeForm;