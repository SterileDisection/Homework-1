<script setup>
import { nextTick, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { useUiStore } from '@/stores/ui';
import BaseButton from './BaseButton.vue';

// One confirmation dialog for the whole app, driven by the ui store:
//     const ok = await ui.confirm({ title: 'Delete student?', message: '...', danger: true });
//
// It uses the native <dialog> element with showModal(), which gives us for free:
// a backdrop, focus kept inside the dialog, Esc to cancel, and focus returned
// to the button that opened it when it closes.
const ui = useUiStore();
const { confirmRequest } = storeToRefs(ui);

const dialogRef = ref(null);
const cancelButtonRef = ref(null);

watch(confirmRequest, async (request) => {
    const dialog = dialogRef.value;
    if (!dialog) return;

    if (request && !dialog.open) {
        dialog.showModal();
        await nextTick();
        // Focus "Cancel" first so pressing Enter by accident doesn't delete anything.
        cancelButtonRef.value?.$el.focus();
    } else if (!request && dialog.open) {
        dialog.close();
    }
});

// Esc key or dialog.close() from anywhere counts as "Cancel".
function onClose() {
    if (confirmRequest.value) {
        ui.answerConfirm(false);
    }
}

// Clicking the dark backdrop (outside the panel) cancels too.
function onBackdropClick(event) {
    if (event.target === dialogRef.value) {
        ui.answerConfirm(false);
    }
}
</script>

<template>
    <dialog
        ref="dialogRef"
        class="dialog"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        @close="onClose"
        @click="onBackdropClick"
    >
        <div v-if="confirmRequest" class="dialog__panel">
            <h2 id="confirm-title" class="dialog__title">{{ confirmRequest.title }}</h2>
            <p id="confirm-message" class="dialog__message">{{ confirmRequest.message }}</p>
            <div class="dialog__actions">
                <BaseButton ref="cancelButtonRef" variant="secondary" @click="ui.answerConfirm(false)">
                    Cancel
                </BaseButton>
                <BaseButton :variant="confirmRequest.danger ? 'danger' : 'primary'" @click="ui.answerConfirm(true)">
                    {{ confirmRequest.confirmLabel }}
                </BaseButton>
            </div>
        </div>
    </dialog>
</template>

<style scoped>
.dialog {
    width: min(100% - 2rem, 440px);
    padding: 0;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    color: var(--color-text);
    box-shadow: var(--shadow-lg);
}

.dialog::backdrop {
    background: rgb(10 15 30 / 55%);
}

.dialog__panel {
    padding: var(--space-5);
}

.dialog__title {
    font-size: 1.2rem;
}

.dialog__message {
    margin-top: var(--space-2);
    color: var(--color-text-muted);
}

.dialog__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--space-2);
    margin-top: var(--space-5);
}
</style>
