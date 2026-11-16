const mongoose = require('mongoose');

/**
 * Shared error handling so every route returns consistent JSON:
 *   { "error": "Human-readable message", "details": { field: message } }
 *
 * Express 5 automatically forwards errors thrown inside async route handlers
 * here, so routes don't need their own try/catch blocks.
 */

// Throw this from a route for expected errors, e.g. new HttpError(404, 'Student not found').
class HttpError extends Error {
    constructor(status, message, details) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

// Turns a MongoDB duplicate-key error into a message a user can act on.
function duplicateMessage(err) {
    const key = err.keyValue || {};
    const fields = Object.keys(err.keyPattern || key);

    if (fields.includes('studentId')) {
        return `A student with ID ${key.studentId ?? '(this ID)'} already exists`;
    }
    if (fields.includes('courseId')) {
        return `A course with ID ${key.courseId ?? '(this ID)'} already exists`;
    }
    if (fields.includes('student') && fields.includes('course')) {
        return 'This student is already enrolled in this course';
    }
    return 'Duplicate record';
}

// Requests to /api/... routes that don't exist.
function notFound(req, res) {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Express recognizes error handlers by their 4 arguments, so `next` must stay.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    // Our own expected errors (404, 409, etc.)
    if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.message, details: err.details });
    }

    // Schema validation failed (missing field, bad ZIP format, ...) -> 400
    if (err instanceof mongoose.Error.ValidationError) {
        const details = {};
        for (const [field, fieldError] of Object.entries(err.errors)) {
            details[field] = fieldError.message;
        }
        return res.status(400).json({ error: 'Validation failed', details });
    }

    // Malformed ObjectId in a URL, e.g. /api/students/not-an-id -> 400
    if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({ error: `Invalid value for ${err.path}` });
    }

    // Unique index violation (duplicate student ID, course ID, or enrollment) -> 409 Conflict.
    // Relying on the database index (instead of only checking "does it exist?" first)
    // means duplicates are rejected even if two requests arrive at the same moment.
    if (err && err.code === 11000) {
        return res.status(409).json({ error: duplicateMessage(err), details: err.keyValue });
    }

    // Request body wasn't valid JSON -> 400
    if (err && err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Request body must be valid JSON' });
    }

    // Lost connection to MongoDB -> 503 Service Unavailable
    if (err instanceof mongoose.Error.MongooseServerSelectionError || err?.name === 'MongoNetworkError') {
        console.error('Database unavailable:', err.message);
        return res.status(503).json({ error: 'Database is unavailable. Please try again shortly.' });
    }

    // Anything else is a bug -> log it, but don't leak internals to the client.
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
}

module.exports = { HttpError, notFound, errorHandler };
