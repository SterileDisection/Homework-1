<script setup>
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useCoursesStore } from '@/stores/courses';
import { useUiStore } from '@/stores/ui';
import { pluralize } from '@/utils/format';
import PageHeader from '@/components/ui/PageHeader.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import AlertMessage from '@/components/ui/AlertMessage.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import CourseForm from '@/components/courses/CourseForm.vue';
import CourseTable from '@/components/courses/CourseTable.vue';

const coursesStore = useCoursesStore();
const ui = useUiStore();
const { sortedCourses, loading, error, loaded, count } = storeToRefs(coursesStore);

const deletingId = ref(null);

onMounted(() => coursesStore.fetchCourses());

async function handleDelete(course) {
    const confirmed = await ui.confirm({
        title: `Delete ${course.courseId}?`,
        message: `This permanently removes “${course.name}” and unenrolls every student in it.`,
        confirmLabel: 'Delete course',
        danger: true,
    });
    if (!confirmed) return;

    deletingId.value = course._id;
    try {
        const { removedEnrollments } = await coursesStore.deleteCourse(course._id);
        const extra = removedEnrollments ? ` and ${pluralize(removedEnrollments, 'enrollment')} removed` : '';
        ui.notify(`${course.courseId} was deleted${extra}.`);
    } catch (err) {
        ui.notify(err.message, 'error', 8000);
        if (err.status === 404) coursesStore.fetchCourses({ force: true });
    } finally {
        deletingId.value = null;
    }
}
</script>

<template>
    <PageHeader title="Courses" description="Create courses, review the catalog, and remove courses." />

    <div class="grid-2">
        <BaseCard title="Add a course" description="All fields are required.">
            <CourseForm />
        </BaseCard>

        <BaseCard title="All courses" :description="loaded ? pluralize(count, 'course') : ''">
            <template #actions>
                <BaseButton
                    variant="secondary"
                    size="sm"
                    :loading="loading && loaded"
                    loading-text="Refreshing..."
                    @click="coursesStore.fetchCourses({ force: true })"
                >
                    Refresh
                </BaseButton>
            </template>

            <LoadingSpinner v-if="loading && !loaded" label="Loading courses..." show-label />
            <div v-else class="stack">
                <AlertMessage v-if="error" type="error" title="Couldn't load courses">
                    <p>{{ error }}</p>
                    <p>Check that the server is running, then select Refresh.</p>
                </AlertMessage>
                <template v-if="loaded">
                    <EmptyState
                        v-if="sortedCourses.length === 0"
                        title="No courses yet"
                        message="Use the “Add a course” form to create the first one."
                    />
                    <CourseTable v-else :courses="sortedCourses" :deleting-id="deletingId" @delete="handleDelete" />
                </template>
            </div>
        </BaseCard>
    </div>
</template>
