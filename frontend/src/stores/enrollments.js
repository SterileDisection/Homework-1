import { defineStore } from 'pinia';
import { ref } from 'vue';

import { coursesApi, enrollmentsApi } from '@/api';

/**
 * Course rosters (the students enrolled in each course).
 *
 * `rosters` is keyed by course _id:
 *   { [courseId]: { course, students: [{ ...student, enrollmentId, enrolledAt }] } }
 *
 * The students and courses stores call handleStudentDeleted / handleCourseDeleted
 * after a delete, so cached rosters stay consistent with the server's
 * cascading deletes.
 */
export const useEnrollmentsStore = defineStore('enrollments', () => {
    const rosters = ref({});
    const loadingRoster = ref(false);
    const rosterError = ref(null);

    const sortByName = (list) => list.sort((a, b) => a.name.localeCompare(b.name));

    // If the user switches courses quickly, only the most recent request may
    // update the loading/error state (an older, slower response is ignored).
    let latestRequest = 0;

    async function fetchRoster(courseId) {
        const requestId = ++latestRequest;
        loadingRoster.value = true;
        rosterError.value = null;
        try {
            const roster = await coursesApi.roster(courseId);
            rosters.value[courseId] = roster;
        } catch (err) {
            if (requestId === latestRequest) rosterError.value = err.message;
        } finally {
            if (requestId === latestRequest) loadingRoster.value = false;
        }
    }

    async function enroll(studentId, courseId) {
        const result = await enrollmentsApi.create(studentId, courseId); // throws ApiError on failure

        // If we already have this course's roster, add the new student to it.
        const roster = rosters.value[courseId];
        if (roster) {
            const { student, _id, createdAt } = result.enrollment;
            roster.students.push({ ...student, enrollmentId: _id, enrolledAt: createdAt });
            sortByName(roster.students);
        }
        return result; // { message, enrollment }
    }

    async function unenroll(enrollmentId, courseId) {
        const result = await enrollmentsApi.remove(enrollmentId);
        const roster = rosters.value[courseId];
        if (roster) {
            roster.students = roster.students.filter((s) => s.enrollmentId !== enrollmentId);
        }
        return result;
    }

    function handleStudentDeleted(studentId) {
        for (const roster of Object.values(rosters.value)) {
            roster.students = roster.students.filter((s) => s._id !== studentId);
        }
    }

    function handleCourseDeleted(courseId) {
        delete rosters.value[courseId];
    }

    return {
        rosters,
        loadingRoster,
        rosterError,
        fetchRoster,
        enroll,
        unenroll,
        handleStudentDeleted,
        handleCourseDeleted,
    };
});
