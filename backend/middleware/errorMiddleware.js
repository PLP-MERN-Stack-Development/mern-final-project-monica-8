// backend/middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
    // Determine the status code: use the status set by the error, or default to 500
    const statusCode = res.statusCode ? res.statusCode : 500;

    res.status(statusCode);

    res.json({
        message: err.message,
        // Only show the stack trace if we are NOT in production
        stack: process.env.NODE_ENV !== 'production' ? err.stack : null,
    });
};

// CRITICAL FIX: Ensure the errorHandler is exported inside an object {}
module.exports = {
    errorHandler,
};