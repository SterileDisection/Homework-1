<script setup>
import { computed } from 'vue';

// An inline message box for errors, successes, and info.
// Errors use role="alert" (announced immediately by screen readers);
// others use role="status" (announced politely).
const props = defineProps({
    type: { type: String, default: 'info' }, // 'error' | 'success' | 'info'
    title: { type: String, default: '' },
    dismissible: { type: Boolean, default: false },
});

const emit = defineEmits(['dismiss']);

const role = computed(() => (props.type === 'error' ? 'alert' : 'status'));
const icon = computed(() => ({ error: '!', success: '✓', info: 'i' })[props.type] ?? 'i');
</script>

<template>
    <div class="alert" :class="`alert--${type}`" :role="role">
        <span class="alert__icon" aria-hidden="true">{{ icon }}</span>
        <div class="alert__content">
            <p v-if="title" class="alert__title">{{ title }}</p>
            <div><slot /></div>
        </div>
        <button v-if="dismissible" type="button" class="alert__close" aria-label="Dismiss message" @click="emit('dismiss')">
            ×
        </button>
    </div>
</template>

<style scoped>
.alert {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border: 1px solid currentColor;
    border-radius: var(--radius);
    font-size: 0.95rem;
}

.alert--error {
    color: var(--color-danger);
    background: var(--color-danger-soft);
}

.alert--success {
    color: var(--color-success);
    background: var(--color-success-soft);
}

.alert--info {
    color: var(--color-info);
    background: var(--color-info-soft);
}

.alert__icon {
    flex: none;
    display: grid;
    place-items: center;
    width: 1.4rem;
    height: 1.4rem;
    border-radius: 50%;
    color: var(--color-surface); /* glyph uses the page surface color as a "cut-out" */
    font-size: 0.8rem;
    font-weight: 700;
}

.alert--error .alert__icon {
    background: var(--color-danger);
}
.alert--success .alert__icon {
    background: var(--color-success);
}
.alert--info .alert__icon {
    background: var(--color-info);
}

.alert__content {
    flex: 1;
    min-width: 0;
    color: var(--color-text);
}

.alert__title {
    font-weight: 600;
}

.alert__close {
    flex: none;
    width: 1.75rem;
    height: 1.75rem;
    border: 0;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-text-muted);
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
}

.alert__close:hover {
    background: rgb(0 0 0 / 6%);
}
</style>
