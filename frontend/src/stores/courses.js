import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { coursesApi } from '@/api';
import { useEnrollmentsStore } from './enrollments';

/**
 * Courses are shared by the Courses page (add/list/delete), the Enrollments
 * page (course dropdowns), and the dashboard (count).
 * Same conventions as the students store.
 */
export const useCoursesStore = defineStore('courses', () => {
    const courses = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const loaded = ref(false);

    const sortedCourses = computed(() => [...courses.value].sort((a, b) => a.courseId.localeCompare(b.courseId)));
    const count = computed(() => courses.value.length);

    async function fetchCourses({ force = false } = {}) {
        if (loaded.value && !force) return;
        loading.value = true;
        error.value = null;
        try {
            courses.value = await coursesApi.list();
            loaded.value = true;
        } catch (err) {
            error.value = err.message;
        } finally {
            loading.value = false;
        }
    }

    async function addCourse(data) {
        const result = await coursesApi.create(data); // throws ApiError on failure
        if (loaded.value) {
            courses.value.push(result.course);
        }
        return result; // { message, course }
    }

    async function deleteCourse(id) {
        const result = await coursesApi.remove(id); // throws ApiError on failure
        courses.value = courses.value.filter((c) => c._id !== id);
        useEnrollmentsStore().handleCourseDeleted(id);
        return result; // { message, course, removedEnrollments }
    }

    return { courses, loading, error, loaded, sortedCourses, count, fetchCourses, addCourse, deleteCourse };
});
