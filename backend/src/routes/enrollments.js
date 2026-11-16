const express = require('express');

const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Course = require('../models/Course');
const { HttpError } = require('../middleware/errorHandler');
const { requireObjectId } = require('../utils/validation');

const router = express.Router();

// GET /api/enrollments                    -> every enrollment
// GET /api/enrollments?course=<_id>       -> enrollments in one course
// GET /api/enrollments?student=<_id>      -> one student's enrollments
router.get('/', async (req, res) => {
    const filter = {};
    if (req.query.course !== undefined) {
        filter.course = requireObjectId(req.query.course, 'course id');
    }
    if (req.query.student !== undefined) {
        filter.student = requireObjectId(req.query.student, 'student id');
    }

    const enrollments = await Enrollment.find(filter)
        .populate('student')
        .populate('course')
        .sort({ createdAt: -1 });

    res.json(enrollments);
});

// POST /api/enrollments  body: { student: <student _id>, course: <course _id> }
router.post('/', async (req, res) => {
    const { student: studentRef, course: courseRef } = req.body ?? {};

    // Check both fields together so the user sees every problem at once.
    const details = {};
    if (!studentRef) details.student = 'Select a student';
    if (!courseRef) details.course = 'Select a course';
    if (Object.keys(details).length) {
        throw new HttpError(400, 'Validation failed', details);
    }

    const studentId = requireObjectId(studentRef, 'student id');
    const courseId = requireObjectId(courseRef, 'course id');

    // Referential integrity: both the student and the course must exist.
    const [student, course] = await Promise.all([Student.findById(studentId), Course.findById(courseId)]);
    if (!student) throw new HttpError(404, 'The selected student does not exist');
    if (!course) throw new HttpError(404, 'The selected course does not exist');

    // A duplicate enrollment is rejected by the unique { student, course } index -> 409.
    const enrollment = await Enrollment.create({ student: student._id, course: course._id });

    // Send back names, not just ObjectIds, so the UI can show "John enrolled in CIS 3339".
    await enrollment.populate(['student', 'course']);

    res.status(201).json({
        message: `${student.name} enrolled in ${course.courseId}`,
        enrollment,
    });
});

// DELETE /api/enrollments/:id -> unenroll a student from a course
router.delete('/:id', async (req, res) => {
    const id = requireObjectId(req.params.id, 'enrollment id');
    const enrollment = await Enrollment.findByIdAndDelete(id);
    if (!enrollment) {
        throw new HttpError(404, 'Enrollment not found');
    }
    res.json({ message: 'Enrollment removed successfully', enrollment });
});

module.exports = router;
