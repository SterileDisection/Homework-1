<script setup>
import { useId } from 'vue';

// A titled section ("card"). The heading labels the section for screen
// readers via aria-labelledby. Optional slots: #actions (top right), #default.
defineProps({
    title: { type: String, required: true },
    description: { type: String, default: '' },
});

const headingId = useId();
</script>

<template>
    <section class="card" :aria-labelledby="headingId">
        <header class="card__header">
            <div>
                <h2 :id="headingId" class="card__title">{{ title }}</h2>
                <p v-if="description" class="card__description">{{ description }}</p>
            </div>
            <div v-if="$slots.actions" class="card__actions">
                <slot name="actions" />
            </div>
        </header>
        <div class="card__body">
            <slot />
        </div>
    </section>
</template>

<style scoped>
.card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    min-width: 0; /* lets tables scroll inside the card instead of stretching the grid */
}

.card__header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--color-border);
}

.card__title {
    font-size: 1.1rem;
}

.card__description {
    margin-top: var(--space-1);
    font-size: 0.9rem;
    color: var(--color-text-muted);
}

.card__actions {
    display: flex;
    gap: var(--space-2);
}

.card__body {
    padding: var(--space-5);
}

@media (max-width: 480px) {
    .card__header,
    .card__body {
        padding-left: var(--space-4);
        padding-right: var(--space-4);
    }
}
</style>
