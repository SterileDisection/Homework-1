<script setup>
// The title area at the top of every page. The <h1> receives focus after
// navigation (see App.vue) so screen-reader users hear which page loaded.
defineProps({
    title: { type: String, required: true },
    description: { type: String, default: '' },
});
</script>

<template>
    <header class="page-header">
        <h1 class="page-header__title" tabindex="-1" data-page-title>{{ title }}</h1>
        <p v-if="description" class="page-header__description">{{ description }}</p>
    </header>
</template>

<style scoped>
.page-header {
    margin-bottom: var(--space-5);
}

.page-header__title {
    font-size: clamp(1.5rem, 1.2rem + 1.2vw, 2rem);
}

.page-header__title:focus {
    outline: none; /* focused by script, not by the user */
}

.page-header__description {
    margin-top: var(--space-2);
    color: var(--color-text-muted);
    max-width: 65ch;
}
</style>
