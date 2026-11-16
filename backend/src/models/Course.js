const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
    {
        courseId: {
            type: String,
            required: [true, 'Course ID is required'],
            unique: true,
            // Normalize so "cis 3339", "CIS  3339 " and "CIS 3339" all count as the same course.
            set: (value) => (typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').toUpperCase() : value),
            match: [/^[A-Z0-9 -]{2,20}$/, 'Course ID may contain only letters, numbers, spaces, and dashes'],
        },
        name: {
            type: String,
            required: [true, 'Course name is required'],
            trim: true,
            maxlength: [150, 'Course name must be 150 characters or fewer'],
        },
    },
    { timestamps: true, toJSON: { versionKey: false } }
);

module.exports = mongoose.model('Course', courseSchema);
