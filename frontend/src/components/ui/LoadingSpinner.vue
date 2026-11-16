<script setup>
// Spinner with an accessible label. Pass `decorative` when the surrounding
// text already says what is loading (e.g. inside a "Saving..." button).
defineProps({
    label: { type: String, default: 'Loading...' },
    size: { type: String, default: 'md' }, // 'sm' | 'md'
    decorative: { type: Boolean, default: false },
    showLabel: { type: Boolean, default: false },
});
</script>

<template>
    <span class="spinner-wrap" :role="decorative ? undefined : 'status'">
        <span class="spinner" :class="`spinner--${size}`" aria-hidden="true"></span>
        <span v-if="!decorative" :class="{ 'visually-hidden': !showLabel }">{{ label }}</span>
    </span>
</template>

<style scoped>
.spinner-wrap {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-text-muted);
}

.spinner {
    display: inline-block;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}

.spinner--sm {
    width: 1em;
    height: 1em;
}

.spinner--md {
    width: 1.5rem;
    height: 1.5rem;
    border-width: 3px;
    color: var(--color-primary);
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
