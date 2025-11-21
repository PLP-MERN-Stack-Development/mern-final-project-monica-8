// middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
    // Determine the status code based on the response status (default to 500)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    res.json({
        message: err.message,
        // Only provide stack trace if the application is not in production environment
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = {
    errorHandler,
};