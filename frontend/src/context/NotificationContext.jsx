// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null); // { message: '', type: 'success'|'error' }

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        // Auto-hide the notification after 4 seconds
        setTimeout(() => setNotification(null), 4000); 
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {/* The Toast UI Component will be rendered here */}
            {notification && (
                <Toast 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification(null)} 
                />
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);

// --- Simple Toast Component (Styling uses Tailwind) ---
const Toast = ({ message, type, onClose }) => {
    const baseClasses = "fixed bottom-5 right-5 p-4 rounded-lg shadow-xl text-white transition-opacity duration-300";
    const typeClasses = type === 'success' ? 'bg-green-600' : 'bg-red-600';

    return (
        <div className={`${baseClasses} ${typeClasses}`}>
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 text-lg font-bold">
                &times;
            </button>
        </div>
    );
};