const express = require('express');

const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');
const { HttpError } = require('../middleware/errorHandler');
const { requireObjectId, pick, escapeRegex } = require('../utils/validation');

const router = express.Router();

// GET /api/students            -> all students (used to fill the enrollment dropdown)
// GET /api/students?search=jo  -> students whose name contains "jo" (any case),
//                                 or whose student ID is exactly "jo"
router.get('/', async (req, res) => {
    const { search } = req.query;
    let filter = {};

    if (search !== undefined) {
        if (typeof search !== 'string') {
            throw new HttpError(400, 'Search must be a single text value');
        }
        const term = search.trim();
        if (term) {
            filter = {
                $or: [{ name: { $regex: escapeRegex(term), $options: 'i' } }, { studentId: term }],
            };
        }
    }

    const students = await Student.find(filter).sort({ name: 1, studentId: 1 });
    res.json(students);
});

// GET /api/students/:id -> one student (":id" is the MongoDB _id)
router.get('/:id', async (req, res) => {
    const id = requireObjectId(req.params.id, 'student id');
    const student = await Student.findById(id);
    if (!student) {
        throw new HttpError(404, 'Student not found');
    }
    res.json(student);
});

// POST /api/students  body: { name, studentId, phone, zip }
// Validation happens in the Student schema; duplicates are caught by its unique index.
router.post('/', async (req, res) => {
    const student = await Student.create(pick(req.body, ['name', 'studentId', 'phone', 'zip']));
    res.status(201).json({ message: 'Student added successfully', student });
});

// DELETE /api/students/:id -> removes the student AND all of their enrollments
router.delete('/:id', async (req, res) => {
    const id = requireObjectId(req.params.id, 'student id');

    const student = await Student.findByIdAndDelete(id);
    if (!student) {
        throw new HttpError(404, 'Student not found');
    }

    // Cascade: an enrollment must never point to a student that no longer exists.
    const { deletedCount } = await Enrollment.deleteMany({ student: student._id });

    res.json({
        message: 'Student deleted successfully',
        student,
        removedEnrollments: deletedCount,
    });
});

module.exports = router;
