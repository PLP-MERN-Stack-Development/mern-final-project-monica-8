import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
// Replace this with how you access the logged-in user in your app (e.g., Redux, Context)
import { useSelector } from 'react-redux'; 

// IMPORTANT: Define your backend URL
const SOCKET_SERVER_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'; 
// Ensure this matches the server address you defined in server.js

function RecipeDetail() {
    const { id: recipeId } = useParams();
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const socketRef = useRef(); 
    
    // Assuming user state is managed globally (e.g., Redux)
    const { user } = useSelector((state) => state.auth); 
    
    // State to hold the recipe details fetched via a standard GET request (not shown here)
    const [recipe, setRecipe] = useState(null); 

    // Fetch the initial recipe details and comments on load (using a standard REST API call)
    useEffect(() => {
        // TODO: Implement REST API call to GET /api/recipes/:id
        // and another call to GET /api/recipes/:id/comments 
        // to load all existing comments into the 'comments' state.
    }, [recipeId]);
    useEffect(() => {
        // 1. Initialize connection
        socketRef.current = io(SOCKET_SERVER_URL);

        // 2. Join the specific recipe's room for targeted messages
        if (recipeId) {
            socketRef.current.emit('joinRecipe', recipeId);
        }
        
        // 3. Listen for incoming comments broadcasted by the server
        socketRef.current.on('commentReceived', (newComment) => {
            // Instantly update the comments list when a new comment arrives
            setComments(prevComments => {
                // Prevent duplicate comments if state updates fire multiple times
                if (!prevComments.some(c => c._id === newComment._id)) {
                    return [...prevComments, newComment];
                }
                return prevComments;
            });
        });

        // 4. Listen for errors
        socketRef.current.on('commentError', (data) => {
            alert(`Comment Error: ${data.message}`);
        });

        // 5. Cleanup: Disconnect socket when component unmounts
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [recipeId]);
    const handleCommentSubmit = (e) => {
        e.preventDefault();

        // Check if user is logged in, socket is connected, and text is present
        if (socketRef.current && user && commentText.trim()) {
            // 1. Emit the 'newComment' event to the server
            socketRef.current.emit('newComment', {
                recipeId: recipeId,
                userId: user._id, 
                text: commentText,
            });

            // 2. Clear the input immediately for a smooth user experience
            setCommentText(''); 
        } else if (!user) {
            alert("You must be logged in to comment.");
        }
    };
    return (
        <div className="recipe-detail-container">
            <h1>{recipe ? recipe.title : 'Loading...'}</h1>
            {/* ... Other recipe details ... */}
            
            <section className="comments-section">
                <h2>💬 Real-Time Comments</h2>
                <div className="comment-list">
                    {comments.map((comment) => (
                        <div key={comment._id} className="comment-item">
                            {/* The comment object is populated with the user's name from the server */}
                            <strong>{comment.user.name || 'Anonymous'}</strong> 
                            <p>{comment.text}</p>
                            <small>{new Date(comment.createdAt).toLocaleTimeString()}</small>
                        </div>
                    ))}
                </div>

                {user ? (
                    <form onSubmit={handleCommentSubmit} className="comment-form">
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add your comment..."
                            required
                        />
                        <button type="submit">Post Comment</button>
                    </form>
                ) : (
                    <p>Please log in to join the discussion.</p>
                )}
            </section>
        </div>
    );
}

export default RecipeDetail;