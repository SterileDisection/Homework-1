<script setup>
import { RouterLink, useRoute } from 'vue-router';
import PageHeader from '@/components/ui/PageHeader.vue';
import EmptyState from '@/components/ui/EmptyState.vue';

const route = useRoute();
</script>

<template>
    <PageHeader title="Page not found" />
    <EmptyState title="We couldn't find that page" :message="`There is no page at ${route.fullPath}.`">
        <RouterLink :to="{ name: 'home' }">Go to the dashboard</RouterLink>
    </EmptyState>
</template>
