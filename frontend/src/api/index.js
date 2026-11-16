import { http } from './client';

// One function per backend endpoint. "id" always means the MongoDB _id.
// encodeURIComponent keeps user-typed text from breaking the URL.

export const studentsApi = {
    list: () => http.get('/students'),
    search: (term) => http.get(`/students?search=${encodeURIComponent(term)}`),
    get: (id) => http.get(`/students/${encodeURIComponent(id)}`),
    create: (student) => http.post('/students', student), // { name, studentId, phone, zip }
    remove: (id) => http.delete(`/students/${encodeURIComponent(id)}`),
};

export const coursesApi = {
    list: () => http.get('/courses'),
    get: (id) => http.get(`/courses/${encodeURIComponent(id)}`),
    roster: (id) => http.get(`/courses/${encodeURIComponent(id)}/students`),
    create: (course) => http.post('/courses', course), // { courseId, name }
    remove: (id) => http.delete(`/courses/${encodeURIComponent(id)}`),
};

export const enrollmentsApi = {
    create: (studentId, courseId) => http.post('/enrollments', { student: studentId, course: courseId }),
    remove: (id) => http.delete(`/enrollments/${encodeURIComponent(id)}`),
};
