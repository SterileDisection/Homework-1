<script setup>
import { computed, useId } from 'vue';

// A labeled text input with optional hint and error message.
// Use it with v-model:  <TextField v-model="form.name" label="Name" :error="errors.name" />
//
// Accessibility: the <label> is tied to the input with for/id, and the hint and
// error are linked with aria-describedby, so screen readers announce them.
const model = defineModel({ type: String, default: '' });

const props = defineProps({
    label: { type: String, required: true },
    type: { type: String, default: 'text' },
    error: { type: String, default: '' },
    hint: { type: String, default: '' },
    required: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
    autocomplete: { type: String, default: 'off' },
    inputmode: { type: String, default: undefined },
    maxlength: { type: [Number, String], default: undefined },
});

const id = useId(); // unique id per field, e.g. "v-0"
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
        <input
            :id="id"
            v-model="model"
            class="field__input"
            :class="{ 'field__input--invalid': error }"
            :type="type"
            :required="required"
            :placeholder="placeholder"
            :autocomplete="autocomplete"
            :inputmode="inputmode"
            :maxlength="maxlength"
            :aria-invalid="error ? 'true' : undefined"
            :aria-describedby="describedBy"
        />
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

.field__input {
    width: 100%;
    min-height: 2.5rem;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    color: var(--color-text);
    font: inherit;
}

.field__input:focus-visible {
    outline-offset: 0;
    border-color: var(--color-focus);
}

.field__input--invalid {
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
