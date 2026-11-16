<script setup>
import { nextTick, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';

import AppHeader from '@/components/layout/AppHeader.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import ToastContainer from '@/components/ui/ToastContainer.vue';

const route = useRoute();

// Accessibility: after navigating to a new page, move keyboard/screen-reader
// focus to that page's <h1>, the way a full page load would.
// (Skipped on the very first load so the browser's default behavior applies.)
watch(
    () => route.name,
    async (newName, oldName) => {
        if (!oldName) return;
        await nextTick();
        document.querySelector('[data-page-title]')?.focus();
    }
);
</script>

<template>
    <!-- Lets keyboard users jump past the navigation. -->
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <AppHeader />

    <main id="main-content" class="container main" tabindex="-1">
        <RouterView />
    </main>

    <footer class="container footer">CIS 3339 Student Management System</footer>

    <ToastContainer />
    <ConfirmDialog />
</template>

<style scoped>
.skip-link {
    position: absolute;
    left: var(--space-4);
    top: -100px;
    z-index: 200;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-sm);
    background: var(--color-primary);
    color: var(--color-on-primary);
    font-weight: 600;
}

.skip-link:focus {
    top: var(--space-2);
}

.main {
    padding-top: var(--space-6);
    padding-bottom: var(--space-6);
    min-height: calc(100vh - 9rem);
}

.main:focus {
    outline: none;
}

.footer {
    padding-top: var(--space-4);
    padding-bottom: var(--space-5);
    border-top: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: 0.85rem;
    text-align: center;
}
</style>
