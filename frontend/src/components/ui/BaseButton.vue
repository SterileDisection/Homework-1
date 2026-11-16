<script setup>
import LoadingSpinner from './LoadingSpinner.vue';

// A button with consistent styles and a built-in loading state.
// While `loading` is true the button is disabled (prevents double submits)
// and shows a spinner plus `loadingText`.
defineProps({
    type: { type: String, default: 'button' }, // 'button' | 'submit' | 'reset'
    variant: { type: String, default: 'primary' }, // 'primary' | 'secondary' | 'danger' | 'ghost'
    size: { type: String, default: 'md' }, // 'md' | 'sm'
    loading: { type: Boolean, default: false },
    loadingText: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
});
</script>

<template>
    <button
        :type="type"
        class="btn"
        :class="[`btn--${variant}`, `btn--${size}`]"
        :disabled="disabled || loading"
        :aria-busy="loading || undefined"
    >
        <LoadingSpinner v-if="loading" size="sm" decorative />
        <span>
            <template v-if="loading && loadingText">{{ loadingText }}</template>
            <slot v-else />
        </span>
    </button>
</template>

<style scoped>
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-height: 2.5rem;
    padding: 0 var(--space-4);
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    font: inherit;
    font-weight: 600;
    line-height: 1;
    cursor: pointer;
    transition: background-color 0.15s, border-color 0.15s, color 0.15s;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn--sm {
    min-height: 2rem;
    padding: 0 var(--space-3);
    font-size: 0.875rem;
}

.btn--primary {
    background: var(--color-primary);
    color: var(--color-on-primary);
}
.btn--primary:not(:disabled):hover {
    background: var(--color-primary-hover);
}

.btn--secondary {
    background: var(--color-surface);
    border-color: var(--color-border);
    color: var(--color-text);
}
.btn--secondary:not(:disabled):hover {
    background: var(--color-surface-muted);
}

.btn--danger {
    background: var(--color-danger);
    color: #fff;
}
.btn--danger:not(:disabled):hover {
    background: var(--color-danger-hover);
}

/* Low-emphasis button, e.g. "Delete" inside a table row. */
.btn--ghost {
    background: transparent;
    color: var(--color-danger);
}
.btn--ghost:not(:disabled):hover {
    background: var(--color-danger-soft);
}

@media (prefers-color-scheme: dark) {
    .btn--danger {
        color: #1a0b0b;
    }
}
</style>
