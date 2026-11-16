const mongoose = require('mongoose');

// Note: the field is called "studentId", not "id". Mongoose already uses "id"
// as a built-in alias for the document's _id, so reusing it would conflict.
const studentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name must be 100 characters or fewer'],
        },
        studentId: {
            type: String,
            required: [true, 'Student ID is required'],
            trim: true,
            unique: true, // creates a unique index -> duplicates are rejected by MongoDB
            match: [/^[A-Za-z0-9-]{1,20}$/, 'Student ID may contain only letters, numbers, and dashes'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
            // Accepts formats like 555-1234, (713) 555-1234, +1 713.555.1234
            match: [/^\+?[0-9()\-.\s]{7,20}$/, 'Enter a valid phone number'],
        },
        zip: {
            type: String,
            required: [true, 'ZIP code is required'],
            trim: true,
            match: [/^\d{5}(-\d{4})?$/, 'ZIP code must be 5 digits (or ZIP+4, e.g. 77001-1234)'],
        },
    },
    { timestamps: true } // adds createdAt / updatedAt
);

// Lets us search students by name efficiently.
studentSchema.index({ name: 1 });

module.exports = mongoose.model('Student', studentSchema);
