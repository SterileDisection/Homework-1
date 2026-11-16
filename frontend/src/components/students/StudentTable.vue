<script setup>
import BaseButton from '@/components/ui/BaseButton.vue';

// Reusable table of students, used for both search results and the full list.
// The parent decides what "delete" does; this component just reports the click.
defineProps({
    students: { type: Array, required: true },
    caption: { type: String, required: true }, // read by screen readers to describe the table
    deletingId: { type: String, default: null }, // the row currently being deleted (shows a spinner)
});

const emit = defineEmits(['delete']);
</script>

<template>
    <div class="table-wrap">
        <table class="table">
            <caption class="visually-hidden">{{ caption }}</caption>
            <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Student ID</th>
                    <th scope="col">Phone</th>
                    <th scope="col">ZIP</th>
                    <th scope="col" class="cell-actions"><span class="visually-hidden">Actions</span></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="student in students" :key="student._id">
                    <th scope="row" class="cell-name">{{ student.name }}</th>
                    <td>{{ student.studentId }}</td>
                    <td class="cell-nowrap">{{ student.phone }}</td>
                    <td>{{ student.zip }}</td>
                    <td class="cell-actions">
                        <BaseButton
                            variant="ghost"
                            size="sm"
                            :loading="deletingId === student._id"
                            loading-text="Deleting..."
                            :disabled="!!deletingId && deletingId !== student._id"
                            :aria-label="`Delete ${student.name} (ID ${student.studentId})`"
                            @click="emit('delete', student)"
                        >
                            Delete
                        </BaseButton>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.cell-name {
    font-weight: 600;
}

.cell-nowrap {
    white-space: nowrap;
}
</style>
