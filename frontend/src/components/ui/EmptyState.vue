<script setup>
// Shown in place of a list when there is nothing to display yet.
defineProps({
    title: { type: String, required: true },
    message: { type: String, default: '' },
});
</script>

<template>
    <div class="empty">
        <svg class="empty__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linejoin="round"
            />
        </svg>
        <p class="empty__title">{{ title }}</p>
        <p v-if="message" class="empty__message">{{ message }}</p>
        <div v-if="$slots.default" class="empty__actions"><slot /></div>
    </div>
</template>

<style scoped>
.empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-6) var(--space-4);
    text-align: center;
    border: 1px dashed var(--color-border);
    border-radius: var(--radius);
    background: var(--color-surface-muted);
}

.empty__icon {
    width: 2.25rem;
    height: 2.25rem;
    color: var(--color-text-muted);
}

.empty__title {
    font-weight: 600;
}

.empty__message {
    color: var(--color-text-muted);
    font-size: 0.925rem;
    max-width: 40ch;
}

.empty__actions {
    margin-top: var(--space-2);
}
</style>
