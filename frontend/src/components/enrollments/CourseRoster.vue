<script setup>
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { useCoursesStore } from '@/stores/courses';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useUiStore } from '@/stores/ui';
import { formatDate, pluralize } from '@/utils/format';
import SelectField from '@/components/ui/SelectField.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import AlertMessage from '@/components/ui/AlertMessage.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';

// The selected course _id. The parent binds it with v-model:course-id and keeps it in the URL.
const courseId = defineModel('courseId', { type: String, default: '' });

const coursesStore = useCoursesStore();
const enrollmentsStore = useEnrollmentsStore();
const ui = useUiStore();

const { sortedCourses } = storeToRefs(coursesStore);
const { rosters, loadingRoster, rosterError } = storeToRefs(enrollmentsStore);

const courseOptions = computed(() =>
    sortedCourses.value.map((c) => ({ value: c._id, label: `${c.courseId} – ${c.name}` }))
);

const roster = computed(() => (courseId.value ? rosters.value[courseId.value] : null));
const selectedCourse = computed(() => sortedCourses.value.find((c) => c._id === courseId.value) ?? roster.value?.course);

// Whenever the selected course changes (dropdown, URL, or after enrolling), load its roster.
// Courses are already loaded when this component renders, so an id from an old
// URL that matches no course is skipped (the page clears it) instead of requested.
watch(
    courseId,
    (id) => {
        if (id && sortedCourses.value.some((c) => c._id === id)) {
            enrollmentsStore.fetchRoster(id);
        }
    },
    { immediate: true }
);

const removingId = ref(null);

async function handleUnenroll(student) {
    const course = selectedCourse.value;
    const confirmed = await ui.confirm({
        title: `Remove ${student.name}?`,
        message: `${student.name} will be unenrolled from ${course?.courseId ?? 'this course'}. The student record is not deleted.`,
        confirmLabel: 'Unenroll',
        danger: true,
    });
    if (!confirmed) return;

    removingId.value = student.enrollmentId;
    try {
        await enrollmentsStore.unenroll(student.enrollmentId, courseId.value);
        ui.notify(`${student.name} was unenrolled from ${course?.courseId ?? 'the course'}.`);
    } catch (err) {
        ui.notify(err.message, 'error', 8000);
        enrollmentsStore.fetchRoster(courseId.value);
    } finally {
        removingId.value = null;
    }
}
</script>

<template>
    <div class="stack">
        <SelectField
            v-model="courseId"
            label="Course"
            placeholder="Select a course to see its students"
            :options="courseOptions"
            :disabled="!courseOptions.length"
        />

        <p v-if="!courseOptions.length && coursesStore.loaded" class="muted">No courses exist yet.</p>

        <template v-else-if="courseId">
            <LoadingSpinner v-if="loadingRoster && !roster" label="Loading roster..." show-label />

            <AlertMessage v-else-if="rosterError && !roster" type="error" title="Couldn't load the roster">
                {{ rosterError }}
            </AlertMessage>

            <template v-else-if="roster">
                <p class="roster__summary" role="status">
                    <strong>{{ selectedCourse?.courseId }}</strong>
                    has {{ pluralize(roster.students.length, 'student') }} enrolled
                    <LoadingSpinner v-if="loadingRoster" size="sm" label="Refreshing roster" />
                </p>

                <EmptyState
                    v-if="roster.students.length === 0"
                    title="No students enrolled yet"
                    message="Use the “Enroll a student” form to add students to this course."
                />

                <div v-else class="table-wrap">
                    <table class="table">
                        <caption class="visually-hidden">
                            Students enrolled in {{ selectedCourse?.courseId }}
                        </caption>
                        <thead>
                            <tr>
                                <th scope="col">Name</th>
                                <th scope="col">Student ID</th>
                                <th scope="col">Phone</th>
                                <th scope="col">Enrolled</th>
                                <th scope="col" class="cell-actions"><span class="visually-hidden">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="student in roster.students" :key="student.enrollmentId">
                                <th scope="row" class="cell-name">{{ student.name }}</th>
                                <td>{{ student.studentId }}</td>
                                <td class="cell-nowrap">{{ student.phone }}</td>
                                <td class="cell-nowrap">{{ formatDate(student.enrolledAt) }}</td>
                                <td class="cell-actions">
                                    <BaseButton
                                        variant="ghost"
                                        size="sm"
                                        :loading="removingId === student.enrollmentId"
                                        loading-text="Removing..."
                                        :disabled="!!removingId && removingId !== student.enrollmentId"
                                        :aria-label="`Unenroll ${student.name} from ${selectedCourse?.courseId}`"
                                        @click="handleUnenroll(student)"
                                    >
                                        Unenroll
                                    </BaseButton>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>
        </template>
    </div>
</template>

<style scoped>
.muted {
    color: var(--color-text-muted);
}

.roster__summary {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-text-muted);
}

.roster__summary strong {
    color: var(--color-text);
}

.cell-name {
    font-weight: 600;
}

.cell-nowrap {
    white-space: nowrap;
}
</style>
