<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useStudentsStore } from '@/stores/students';
import TextField from '@/components/ui/TextField.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import AlertMessage from '@/components/ui/AlertMessage.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import StudentTable from './StudentTable.vue';

defineProps({
    deletingId: { type: String, default: null },
});
const emit = defineEmits(['delete']);

const studentsStore = useStudentsStore();
// storeToRefs keeps these reactive when destructured from the store.
const { searchTerm, searchResults, searching, searchError } = storeToRefs(studentsStore);

// Start the input with the last search (kept in the store), so results and
// query are still there after visiting another page and coming back.
const query = ref(searchTerm.value);
const inputError = ref('');

async function onSearch() {
    inputError.value = '';
    if (!query.value.trim()) {
        inputError.value = 'Enter a name or student ID to search';
        return;
    }
    await studentsStore.searchStudents(query.value);
}

function onClear() {
    query.value = '';
    inputError.value = '';
    studentsStore.clearSearch();
}
</script>

<template>
    <div class="stack">
        <form role="search" class="search" novalidate @submit.prevent="onSearch">
            <div class="search__field">
                <TextField
                    v-model="query"
                    label="Name or student ID"
                    type="search"
                    placeholder="e.g. John or 1001"
                    :error="inputError"
                    hint="Matches part of a name (any case) or an exact student ID."
                />
            </div>
            <div class="search__actions">
                <BaseButton type="submit" :loading="searching" loading-text="Searching...">Search</BaseButton>
                <BaseButton v-if="searchResults !== null || query" variant="secondary" @click="onClear">
                    Clear
                </BaseButton>
            </div>
        </form>

        <AlertMessage v-if="searchError" type="error" title="Search failed">{{ searchError }}</AlertMessage>

        <template v-else-if="searchResults !== null">
            <p class="search__summary" role="status">
                {{ searchResults.length }} {{ searchResults.length === 1 ? 'student' : 'students' }} found for
                “{{ searchTerm }}”
            </p>
            <EmptyState
                v-if="searchResults.length === 0"
                title="No matching students"
                message="Check the spelling, or search by student ID instead."
            />
            <StudentTable
                v-else
                :students="searchResults"
                :caption="`Search results for ${searchTerm}`"
                :deleting-id="deletingId"
                @delete="emit('delete', $event)"
            />
        </template>
    </div>
</template>

<style scoped>
.search {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: var(--space-3);
}

.search__field {
    flex: 1 1 220px;
}

/* Line the buttons up with the input (below the label). */
.search__actions {
    display: flex;
    gap: var(--space-2);
    padding-top: 1.6rem;
}

.search__summary {
    color: var(--color-text-muted);
    font-size: 0.925rem;
}

@media (max-width: 480px) {
    .search__actions {
        padding-top: 0;
    }
}
</style>
