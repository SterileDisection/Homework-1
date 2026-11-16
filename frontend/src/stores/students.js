import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { studentsApi } from '@/api';
import { useEnrollmentsStore } from './enrollments';

const byName = (a, b) => a.name.localeCompare(b.name) || a.studentId.localeCompare(b.studentId);

/**
 * Students are shared by several views: the Students page (add/search/delete),
 * the Enrollments page (student dropdown), and the dashboard (count).
 * Keeping them in one store means a student added on one page shows up
 * everywhere without reloading.
 *
 * Convention used by all stores:
 *  - fetch actions record problems in `error` (the view shows it) and don't throw;
 *  - add/delete actions throw an ApiError, so the form that called them can show it.
 */
export const useStudentsStore = defineStore('students', () => {
    const students = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const loaded = ref(false);

    // The most recent search, kept here so results survive navigating away and back.
    const searchTerm = ref('');
    const searchResults = ref(null); // null = no search yet, [] = searched, nothing found
    const searching = ref(false);
    const searchError = ref(null);

    const sortedStudents = computed(() => [...students.value].sort(byName));
    const count = computed(() => students.value.length);

    async function fetchStudents({ force = false } = {}) {
        if (loaded.value && !force) return; // already have them
        loading.value = true;
        error.value = null;
        try {
            students.value = await studentsApi.list();
            loaded.value = true;
        } catch (err) {
            error.value = err.message;
        } finally {
            loading.value = false;
        }
    }

    async function searchStudents(term) {
        searchTerm.value = term;
        searching.value = true;
        searchError.value = null;
        try {
            searchResults.value = await studentsApi.search(term.trim());
        } catch (err) {
            searchError.value = err.message;
            searchResults.value = null;
        } finally {
            searching.value = false;
        }
    }

    function clearSearch() {
        searchTerm.value = '';
        searchResults.value = null;
        searchError.value = null;
    }

    async function addStudent(data) {
        const result = await studentsApi.create(data); // throws ApiError on failure
        if (loaded.value) {
            students.value.push(result.student);
        }
        return result; // { message, student }
    }

    async function deleteStudent(id) {
        const result = await studentsApi.remove(id); // throws ApiError on failure
        students.value = students.value.filter((s) => s._id !== id);
        if (searchResults.value) {
            searchResults.value = searchResults.value.filter((s) => s._id !== id);
        }
        // The server removed this student's enrollments; mirror that locally.
        useEnrollmentsStore().handleStudentDeleted(id);
        return result; // { message, student, removedEnrollments }
    }

    return {
        students,
        loading,
        error,
        loaded,
        searchTerm,
        searchResults,
        searching,
        searchError,
        sortedStudents,
        count,
        fetchStudents,
        searchStudents,
        clearSearch,
        addStudent,
        deleteStudent,
    };
});
