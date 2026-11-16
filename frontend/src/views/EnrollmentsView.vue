<script setup>
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useStudentsStore } from '@/stores/students';
import { useCoursesStore } from '@/stores/courses';
import { useUiStore } from '@/stores/ui';
import PageHeader from '@/components/ui/PageHeader.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import AlertMessage from '@/components/ui/AlertMessage.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import EnrollmentForm from '@/components/enrollments/EnrollmentForm.vue';
import CourseRoster from '@/components/enrollments/CourseRoster.vue';

const route = useRoute();
const router = useRouter();
const studentsStore = useStudentsStore();
const coursesStore = useCoursesStore();
const ui = useUiStore();

// The roster's selected course lives in the URL (/enrollments?course=<id>), so
// refreshing the page or using "Roster" links from the Courses page keeps it.
const selectedCourseId = computed({
    get: () => (typeof route.query.course === 'string' ? route.query.course : ''),
    set: (id) => router.replace({ query: id ? { course: id } : {} }),
});

const loading = computed(() => studentsStore.loading || coursesStore.loading);
const error = computed(() => studentsStore.error || coursesStore.error);
const ready = computed(() => studentsStore.loaded && coursesStore.loaded);

function load(force = false) {
    return Promise.all([studentsStore.fetchStudents({ force }), coursesStore.fetchCourses({ force })]);
}

onMounted(() => load());

// If the URL points to a course that no longer exists, clear the selection.
watch(
    () => [coursesStore.loaded, coursesStore.courses, selectedCourseId.value],
    ([loaded, courses, id]) => {
        if (loaded && id && !courses.some((c) => c._id === id)) {
            selectedCourseId.value = '';
            ui.notify('That course no longer exists. Please select another course.', 'info');
        }
    }
);

// After enrolling, show the roster for that course.
function onEnrolled(courseId) {
    selectedCourseId.value = courseId;
}
</script>

<template>
    <PageHeader
        title="Enrollments"
        description="Enroll students in courses, then select a course to see everyone enrolled in it."
    />

    <AlertMessage v-if="error" type="error" title="Couldn't load students and courses" class="page-alert">
        <p>{{ error }}</p>
        <BaseButton variant="secondary" size="sm" class="retry" :loading="loading" @click="load(true)">
            Try again
        </BaseButton>
    </AlertMessage>

    <div class="grid-2">
        <BaseCard title="Enroll a student" description="Each student can be enrolled in a course only once.">
            <LoadingSpinner v-if="loading && !ready" label="Loading students and courses..." show-label />
            <EnrollmentForm v-else-if="ready" @enrolled="onEnrolled" />
        </BaseCard>

        <BaseCard title="Course roster" description="Students enrolled in the selected course.">
            <LoadingSpinner v-if="loading && !ready" label="Loading courses..." show-label />
            <CourseRoster v-else-if="coursesStore.loaded" v-model:course-id="selectedCourseId" />
        </BaseCard>
    </div>
</template>

<style scoped>
.page-alert {
    margin-bottom: var(--space-5);
}

.retry {
    margin-top: var(--space-2);
}
</style>
