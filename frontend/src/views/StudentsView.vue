<script setup>
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useStudentsStore } from '@/stores/students';
import { useUiStore } from '@/stores/ui';
import { pluralize } from '@/utils/format';
import PageHeader from '@/components/ui/PageHeader.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import AlertMessage from '@/components/ui/AlertMessage.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import StudentForm from '@/components/students/StudentForm.vue';
import StudentSearch from '@/components/students/StudentSearch.vue';
import StudentTable from '@/components/students/StudentTable.vue';

const studentsStore = useStudentsStore();
const ui = useUiStore();
const { sortedStudents, loading, error, loaded, count } = storeToRefs(studentsStore);

const deletingId = ref(null);

onMounted(() => studentsStore.fetchStudents());

// Shared by the search results and the full list.
async function handleDelete(student) {
    const confirmed = await ui.confirm({
        title: `Delete ${student.name}?`,
        message: `This permanently removes student ${student.studentId} and all of their course enrollments.`,
        confirmLabel: 'Delete student',
        danger: true,
    });
    if (!confirmed) return;

    deletingId.value = student._id;
    try {
        const { removedEnrollments } = await studentsStore.deleteStudent(student._id);
        const extra = removedEnrollments ? ` and removed from ${pluralize(removedEnrollments, 'course')}` : '';
        ui.notify(`${student.name} was deleted${extra}.`);
    } catch (err) {
        ui.notify(err.message, 'error', 8000);
        // 404 = someone already deleted it; reload so the list matches the database.
        if (err.status === 404) studentsStore.fetchStudents({ force: true });
    } finally {
        deletingId.value = null;
    }
}
</script>

<template>
    <PageHeader title="Students" description="Add new students, look up existing ones, and remove students." />

    <div class="stack page-stack">
        <div class="grid-2">
            <BaseCard title="Add a student" description="All fields are required.">
                <StudentForm />
            </BaseCard>

            <BaseCard title="Find a student">
                <StudentSearch :deleting-id="deletingId" @delete="handleDelete" />
            </BaseCard>
        </div>

        <BaseCard title="All students" :description="loaded ? pluralize(count, 'student') : ''">
            <template #actions>
                <BaseButton
                    variant="secondary"
                    size="sm"
                    :loading="loading && loaded"
                    loading-text="Refreshing..."
                    @click="studentsStore.fetchStudents({ force: true })"
                >
                    Refresh
                </BaseButton>
            </template>

            <LoadingSpinner v-if="loading && !loaded" label="Loading students..." show-label />
            <div v-else class="stack">
                <!-- If a refresh fails, keep showing the list we already have below the error. -->
                <AlertMessage v-if="error" type="error" title="Couldn't load students">
                    <p>{{ error }}</p>
                    <p>Check that the server is running, then select Refresh.</p>
                </AlertMessage>
                <template v-if="loaded">
                    <EmptyState
                        v-if="sortedStudents.length === 0"
                        title="No students yet"
                        message="Use the “Add a student” form to create the first one."
                    />
                    <StudentTable
                        v-else
                        :students="sortedStudents"
                        caption="All students"
                        :deleting-id="deletingId"
                        @delete="handleDelete"
                    />
                </template>
            </div>
        </BaseCard>
    </div>
</template>

<style scoped>
.page-stack {
    gap: var(--space-5);
}
</style>
