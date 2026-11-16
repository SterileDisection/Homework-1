<script setup>
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';

import { useStudentsStore } from '@/stores/students';
import { useCoursesStore } from '@/stores/courses';
import PageHeader from '@/components/ui/PageHeader.vue';
import AlertMessage from '@/components/ui/AlertMessage.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';

const studentsStore = useStudentsStore();
const coursesStore = useCoursesStore();

const loading = computed(() => studentsStore.loading || coursesStore.loading);
const error = computed(() => studentsStore.error || coursesStore.error);

const cards = computed(() => [
    {
        title: 'Students',
        count: studentsStore.count,
        description: 'Add, search, and remove students.',
        to: { name: 'students' },
    },
    {
        title: 'Courses',
        count: coursesStore.count,
        description: 'Create and manage the course catalog.',
        to: { name: 'courses' },
    },
    {
        title: 'Enrollments',
        count: null,
        description: 'Enroll students in courses and view class rosters.',
        to: { name: 'enrollments' },
    },
]);

function load(force = false) {
    // Both requests run at the same time.
    return Promise.all([studentsStore.fetchStudents({ force }), coursesStore.fetchCourses({ force })]);
}

onMounted(() => load());
</script>

<template>
    <PageHeader title="Dashboard" description="Manage students, courses, and enrollments from one place." />

    <AlertMessage v-if="error" type="error" title="Couldn't load data" class="home__alert">
        <p>{{ error }}</p>
        <BaseButton variant="secondary" size="sm" class="home__retry" :loading="loading" @click="load(true)">
            Try again
        </BaseButton>
    </AlertMessage>

    <ul class="home__grid">
        <li v-for="card in cards" :key="card.title">
            <RouterLink :to="card.to" class="tile">
                <span class="tile__title">{{ card.title }}</span>
                <span v-if="card.count !== null" class="tile__count">
                    <LoadingSpinner v-if="loading" size="sm" :label="`Loading ${card.title.toLowerCase()}`" />
                    <template v-else-if="!error">{{ card.count }}</template>
                    <template v-else>—</template>
                </span>
                <span class="tile__description">{{ card.description }}</span>
                <span class="tile__cta" aria-hidden="true">Open →</span>
            </RouterLink>
        </li>
    </ul>
</template>

<style scoped>
.home__alert {
    margin-bottom: var(--space-5);
}

.home__retry {
    margin-top: var(--space-2);
}

.home__grid {
    display: grid;
    gap: var(--space-4);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
    margin: 0;
    padding: 0;
    list-style: none;
}

.tile {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    height: 100%;
    padding: var(--space-5);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    box-shadow: var(--shadow-sm);
    color: var(--color-text);
    text-decoration: none;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.tile:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow);
}

.tile__title {
    font-size: 1.1rem;
    font-weight: 600;
}

.tile__count {
    min-height: 2.75rem;
    font-size: 2.25rem;
    font-weight: 700;
    line-height: 1.2;
    color: var(--color-primary);
    font-variant-numeric: tabular-nums;
}

.tile__description {
    flex: 1;
    color: var(--color-text-muted);
    font-size: 0.925rem;
}

.tile__cta {
    color: var(--color-primary);
    font-weight: 600;
    font-size: 0.925rem;
}
</style>
