const mongoose = require('mongoose');
const { HttpError } = require('../middleware/errorHandler');

/**
 * Throws a 400 error unless `value` is a valid MongoDB ObjectId string.
 * Checking the type also blocks query-injection tricks such as
 * ?course[$ne]=x or ?course=a&course=b, which would arrive as an object/array.
 */
function requireObjectId(value, label) {
    if (typeof value !== 'string' || !mongoose.isValidObjectId(value)) {
        throw new HttpError(400, `Invalid ${label}`);
    }
    return value;
}

/**
 * Copies only the allowed fields from a request body, so clients can't set
 * fields like _id or createdAt themselves.
 */
function pick(source, fields) {
    const result = {};
    for (const field of fields) {
        if (source && source[field] !== undefined) {
            result[field] = source[field];
        }
    }
    return result;
}

// Escapes characters that have special meaning in a regular expression, so a
// search for "a.b" matches the literal text "a.b" (and can't break the query).
function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { requireObjectId, pick, escapeRegex };
