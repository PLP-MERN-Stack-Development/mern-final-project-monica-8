// socketHandler.js (UPDATED SECTION)

const jwt = require('jsonwebtoken'); // Import JWT for verification
const Comment = require('./models/commentModel'); 
const User = require('./models/userModel'); 

module.exports = function(io) {
    io.on('connection', (socket) => {
        // ... (existing connection, joinRecipe, and disconnect logic) ...

        // 2. Client sends a new comment (UPDATED LOGIC)
        socket.on('newComment', async (data) => {
            // Data should now include the authentication token from the client
            const { recipeId, token, text } = data; 
            
            // 1. Basic input validation
            if (!recipeId || !token || !text) { 
                return socket.emit('commentError', { message: 'Missing token or comment data.' });
            }

            let userId;
            try {
                // 2. Verify the JWT token and extract the user ID
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id; 

                // 3. Optional: Check if the user ID from the token exists in the database
                const userExists = await User.findById(userId);
                if (!userExists) {
                    throw new Error('User not found.');
                }
            } catch (error) {
                console.error('Socket Auth Error:', error.message);
                return socket.emit('commentError', { message: 'Authentication failed. Please log in again.' });
            }

            try {
                // A. Save the comment to the database (Now securely linked to the verified userId)
                const newComment = await Comment.create({
                    recipe: recipeId,
                    user: userId, // Use the VERIFIED userId
                    text,
                });

                // B. Fetch the full user object for the broadcast (to show name/email)
                const populatedComment = await Comment.findById(newComment._id)
                    .populate('user', 'name email')
                    .exec(); 

                // C. Emit the new comment to all users in that specific recipe's room
                io.to(recipeId).emit('commentReceived', populatedComment);
                console.log(`New comment broadcasted to room ${recipeId}`);

            } catch (error) {
                console.error('Error saving or broadcasting comment:', error);
                socket.emit('commentError', { message: 'Failed to post comment.' });
            }
        });
    });
};