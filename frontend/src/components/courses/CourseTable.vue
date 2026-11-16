<script setup>
import { RouterLink } from 'vue-router';
import BaseButton from '@/components/ui/BaseButton.vue';

defineProps({
    courses: { type: Array, required: true },
    deletingId: { type: String, default: null },
});

const emit = defineEmits(['delete']);
</script>

<template>
    <div class="table-wrap">
        <table class="table">
            <caption class="visually-hidden">All courses</caption>
            <thead>
                <tr>
                    <th scope="col">Course ID</th>
                    <th scope="col">Course name</th>
                    <th scope="col" class="cell-actions"><span class="visually-hidden">Actions</span></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="course in courses" :key="course._id">
                    <th scope="row" class="cell-id">{{ course.courseId }}</th>
                    <td>{{ course.name }}</td>
                    <td class="cell-actions">
                        <div class="row-actions">
                            <!-- Opens the Enrollments page with this course's roster selected. -->
                            <RouterLink
                                :to="{ name: 'enrollments', query: { course: course._id } }"
                                class="roster-link"
                                :aria-label="`View roster for ${course.courseId}`"
                            >
                                Roster
                            </RouterLink>
                            <BaseButton
                                variant="ghost"
                                size="sm"
                                :loading="deletingId === course._id"
                                loading-text="Deleting..."
                                :disabled="!!deletingId && deletingId !== course._id"
                                :aria-label="`Delete ${course.courseId}`"
                                @click="emit('delete', course)"
                            >
                                Delete
                            </BaseButton>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.cell-id {
    font-weight: 600;
    white-space: nowrap;
}

.row-actions {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
}

.roster-link {
    display: inline-flex;
    align-items: center;
    min-height: 2rem;
    padding: 0 var(--space-3);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
}

.roster-link:hover {
    background: var(--color-primary-soft);
}
</style>
