// backend/middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
    // Determine the correct status code. If a status code was set, use it; otherwise, default to 500.
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode);

    res.json({
        message: err.message,
        // Only include the stack trace if not in a production environment
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

// Must export the middleware function directly.
module.exports = errorHandler;