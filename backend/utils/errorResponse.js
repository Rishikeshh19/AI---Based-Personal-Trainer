class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // This is to distinguish operational errors from programming errors

        // Capture the stack trace, excluding the constructor call from it
        Error.captureStackTrace(this, this.constructor);
    }

    // Static method to create a bad request error (400)
    static badRequest(message = 'Bad Request') {
        return new ErrorResponse(message, 400);
    }

    // Static method to create an unauthorized error (401)
    static unauthorized(message = 'Not Authorized') {
        return new ErrorResponse(message, 401);
    }

    // Static method to create a forbidden error (403)
    static forbidden(message = 'Forbidden') {
        return new ErrorResponse(message, 403);
    }

    // Static method to create a not found error (404)
    static notFound(message = 'Resource Not Found') {
        return new ErrorResponse(message, 404);
    }

    // Static method to create a conflict error (409)
    static conflict(message = 'Conflict') {
        return new ErrorResponse(message, 409);
    }

    // Static method to create a validation error (422)
    static validationError(errors = [], message = 'Validation Error') {
        const error = new ErrorResponse(message, 422);
        error.errors = errors;
        return error;
    }

    // Static method to create a server error (500)
    static serverError(message = 'Internal Server Error') {
        return new ErrorResponse(message, 500);
    }

    // Method to send the error response
    send(res) {
        const errorResponse = {
            success: false,
            error: this.message,
            ...(this.errors && { errors: this.errors }),
            ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
        };

        // Log the error in development
        if (process.env.NODE_ENV === 'development') {
            console.error(this);
        }

        return res.status(this.statusCode).json(errorResponse);
    }
}

module.exports = ErrorResponse;
