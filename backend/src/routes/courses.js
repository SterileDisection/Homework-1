const express = require('express');

const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { HttpError } = require('../middleware/errorHandler');
const { requireObjectId, pick } = require('../utils/validation');

const router = express.Router();

// GET /api/courses -> all courses, sorted by course ID
router.get('/', async (req, res) => {
    const courses = await Course.find().sort({ courseId: 1 });
    res.json(courses);
});

// GET /api/courses/:id -> one course (":id" is the MongoDB _id)
router.get('/:id', async (req, res) => {
    const id = requireObjectId(req.params.id, 'course id');
    const course = await Course.findById(id);
    if (!course) {
        throw new HttpError(404, 'Course not found');
    }
    res.json(course);
});

// GET /api/courses/:id/students -> the course roster
router.get('/:id/students', async (req, res) => {
    const id = requireObjectId(req.params.id, 'course id');
    const course = await Course.findById(id);
    if (!course) {
        throw new HttpError(404, 'Course not found');
    }

    // populate() replaces each enrollment's student ObjectId with the full student document.
    const enrollments = await Enrollment.find({ course: course._id }).populate('student');

    const students = enrollments
        .filter((enrollment) => enrollment.student) // skip any enrollment whose student is gone
        .map((enrollment) => ({
            ...enrollment.student.toJSON(),
            enrollmentId: enrollment._id,
            enrolledAt: enrollment.createdAt,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    res.json({ course, students });
});

// POST /api/courses  body: { courseId, name }
router.post('/', async (req, res) => {
    const course = await Course.create(pick(req.body, ['courseId', 'name']));
    res.status(201).json({ message: 'Course added successfully', course });
});

// DELETE /api/courses/:id -> removes the course AND all of its enrollments
router.delete('/:id', async (req, res) => {
    const id = requireObjectId(req.params.id, 'course id');

    const course = await Course.findByIdAndDelete(id);
    if (!course) {
        throw new HttpError(404, 'Course not found');
    }

    // Cascade: an enrollment must never point to a course that no longer exists.
    const { deletedCount } = await Enrollment.deleteMany({ course: course._id });

    res.json({
        message: 'Course deleted successfully',
        course,
        removedEnrollments: deletedCount,
    });
});

module.exports = router;
