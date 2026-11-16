const mongoose = require('mongoose');

// An enrollment links one student to one course. It stores references
// (ObjectIds) to the Student and Course documents rather than copies of their
// data, so the roster always shows current student info via populate().
const enrollmentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: [true, 'Student is required'],
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Course is required'],
        },
    },
    { timestamps: true, toJSON: { versionKey: false } }
);

// A student can be enrolled in a given course only once. MongoDB enforces this
// with a compound unique index. It also speeds up lookups by student (e.g. the
// cascading delete when a student is removed), since "student" is listed first.
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// The index above can't help queries that filter by course alone, so add one
// for course rosters and the cascading delete when a course is removed.
enrollmentSchema.index({ course: 1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
