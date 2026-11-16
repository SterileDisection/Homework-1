<script setup>
import { computed, useId } from 'vue';

// A labeled <select> (dropdown) with optional hint and error message.
// `options` is an array of { value, label }; the first, empty option shows
// `placeholder` so nothing is pre-selected by accident.
const model = defineModel({ type: String, default: '' });

const props = defineProps({
    label: { type: String, required: true },
    options: { type: Array, default: () => [] },
    placeholder: { type: String, default: 'Select...' },
    error: { type: String, default: '' },
    hint: { type: String, default: '' },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
});

const id = useId();
const hintId = `${id}-hint`;
const errorId = `${id}-error`;

const describedBy = computed(
    () => [props.hint && hintId, props.error && errorId].filter(Boolean).join(' ') || undefined
);
</script>

<template>
    <div class="field">
        <label :for="id" class="field__label">
            {{ label }}
            <span v-if="required" class="field__required" aria-hidden="true">*</span>
        </label>
        <select
            :id="id"
            v-model="model"
            class="field__select"
            :class="{ 'field__select--invalid': error }"
            :required="required"
            :disabled="disabled"
            :aria-invalid="error ? 'true' : undefined"
            :aria-describedby="describedBy"
        >
            <option value="" disabled>{{ placeholder }}</option>
            <option v-for="option in options" :key="option.value" :value="option.value">
                {{ option.label }}
            </option>
        </select>
        <p v-if="hint" :id="hintId" class="field__hint">{{ hint }}</p>
        <p v-if="error" :id="errorId" class="field__error">{{ error }}</p>
    </div>
</template>

<style scoped>
.field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
}

.field__label {
    font-weight: 600;
    font-size: 0.925rem;
}

.field__required {
    color: var(--color-danger);
    margin-left: 2px;
}

.field__select {
    width: 100%;
    min-height: 2.5rem;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    color: var(--color-text);
    font: inherit;
}

.field__select:focus-visible {
    outline-offset: 0;
    border-color: var(--color-focus);
}

.field__select:disabled {
    opacity: 0.6;
}

.field__select--invalid {
    border-color: var(--color-danger);
}

.field__hint {
    font-size: 0.85rem;
    color: var(--color-text-muted);
}

.field__error {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--color-danger);
}
</style>
