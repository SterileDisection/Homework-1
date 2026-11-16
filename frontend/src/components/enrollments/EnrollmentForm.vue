<script setup>
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useStudentsStore } from '@/stores/students';
import { useCoursesStore } from '@/stores/courses';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useUiStore } from '@/stores/ui';
import { useForm } from '@/composables/useForm';
import { validateEnrollment } from '@/utils/validators';
import SelectField from '@/components/ui/SelectField.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import AlertMessage from '@/components/ui/AlertMessage.vue';
import EmptyState from '@/components/ui/EmptyState.vue';

// Emits the course _id after a successful enrollment, so the page can show that course's roster.
const emit = defineEmits(['enrolled']);

const studentsStore = useStudentsStore();
const coursesStore = useCoursesStore();
const enrollmentsStore = useEnrollmentsStore();
const ui = useUiStore();

const { sortedStudents } = storeToRefs(studentsStore);
const { sortedCourses } = storeToRefs(coursesStore);

// Dropdown options come from the data the backend returned (never hard-coded).
const studentOptions = computed(() =>
    sortedStudents.value.map((s) => ({ value: s._id, label: `${s.name} (ID ${s.studentId})` }))
);
const courseOptions = computed(() =>
    sortedCourses.value.map((c) => ({ value: c._id, label: `${c.courseId} – ${c.name}` }))
);

const ready = computed(() => studentsStore.loaded && coursesStore.loaded);
const missingData = computed(() => ready.value && (!studentOptions.value.length || !courseOptions.value.length));

// Required selections, plus an instant duplicate check when that course's roster
// is already loaded. (The server's unique index is still the final authority.)
function validate(values) {
    const errors = validateEnrollment(values);
    const roster = enrollmentsStore.rosters[values.course];
    if (!errors.student && roster?.students.some((s) => s._id === values.student)) {
        errors.student = 'This student is already enrolled in this course';
    }
    return errors;
}

const formRef = ref(null);
const { values, errors, formError, submitting, submit } = useForm(
    { student: '', course: '' },
    validate,
    formRef
);

async function onSubmit() {
    const courseId = values.course;
    const ok = await submit(async ({ student, course }) => {
        const result = await enrollmentsStore.enroll(student, course);
        ui.notify(result.message); // e.g. "John enrolled in CIS 3339"
    });

    if (ok) {
        // Keep the course selected so it's quick to enroll another student in it.
        values.student = '';
        emit('enrolled', courseId);
    }
}
</script>

<template>
    <EmptyState
        v-if="missingData"
        title="Students and courses are needed first"
        message="Enrollment requires at least one student and one course."
    >
        <div class="empty-links">
            <RouterLink v-if="!studentOptions.length" :to="{ name: 'students' }">Add a student</RouterLink>
            <RouterLink v-if="!courseOptions.length" :to="{ name: 'courses' }">Add a course</RouterLink>
        </div>
    </EmptyState>

    <form v-else ref="formRef" class="stack" novalidate @submit.prevent="onSubmit">
        <AlertMessage v-if="formError" type="error">{{ formError }}</AlertMessage>

        <SelectField
            v-model="values.student"
            label="Student"
            placeholder="Select a student"
            :options="studentOptions"
            :error="errors.student"
            :disabled="!ready"
            required
        />
        <SelectField
            v-model="values.course"
            label="Course"
            placeholder="Select a course"
            :options="courseOptions"
            :error="errors.course"
            :disabled="!ready"
            required
        />

        <div class="form-actions">
            <BaseButton type="submit" :loading="submitting" loading-text="Enrolling..." :disabled="!ready">
                Enroll student
            </BaseButton>
        </div>
    </form>
</template>

<style scoped>
.empty-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-4);
    font-weight: 600;
}
</style>
