// Client-side validation rules. They mirror the Mongoose schemas in
// backend/src/models so users get instant feedback; the server still
// validates everything, because client-side checks can be bypassed.

const patterns = {
    studentId: /^[A-Za-z0-9-]{1,20}$/,
    phone: /^\+?[0-9()\-.\s]{7,20}$/,
    zip: /^\d{5}(-\d{4})?$/,
    courseId: /^[A-Za-z0-9 -]{2,20}$/,
};

const isBlank = (value) => !value || !String(value).trim();

/** Returns { field: message } for every invalid field (empty object = valid). */
export function validateStudent({ name, studentId, phone, zip }) {
    const errors = {};

    if (isBlank(name)) errors.name = 'Name is required';
    else if (name.trim().length > 100) errors.name = 'Name must be 100 characters or fewer';

    if (isBlank(studentId)) errors.studentId = 'Student ID is required';
    else if (!patterns.studentId.test(studentId.trim()))
        errors.studentId = 'Student ID may contain only letters, numbers, and dashes';

    if (isBlank(phone)) errors.phone = 'Phone number is required';
    else if (!patterns.phone.test(phone.trim())) errors.phone = 'Enter a valid phone number, e.g. 555-1234';

    if (isBlank(zip)) errors.zip = 'ZIP code is required';
    else if (!patterns.zip.test(zip.trim())) errors.zip = 'ZIP code must be 5 digits (or ZIP+4, e.g. 77001-1234)';

    return errors;
}

export function validateCourse({ courseId, name }) {
    const errors = {};

    if (isBlank(courseId)) errors.courseId = 'Course ID is required';
    else if (!patterns.courseId.test(courseId.trim()))
        errors.courseId = 'Course ID may contain only letters, numbers, spaces, and dashes';

    if (isBlank(name)) errors.name = 'Course name is required';
    else if (name.trim().length > 150) errors.name = 'Course name must be 150 characters or fewer';

    return errors;
}

export function validateEnrollment({ student, course }) {
    const errors = {};
    if (!student) errors.student = 'Select a student';
    if (!course) errors.course = 'Select a course';
    return errors;
}
