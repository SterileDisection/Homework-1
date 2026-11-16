<script setup>
import { storeToRefs } from 'pinia';
import { useUiStore } from '@/stores/ui';

// Shows the toast notifications from the ui store in the corner of the screen.
// The container is an aria-live region, so screen readers announce new toasts.
const ui = useUiStore();
const { toasts } = storeToRefs(ui);
</script>

<template>
    <div class="toasts" aria-live="polite" aria-relevant="additions">
        <TransitionGroup name="toast">
            <div v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast--${toast.type}`">
                <span class="toast__message">{{ toast.message }}</span>
                <button type="button" class="toast__close" aria-label="Dismiss notification" @click="ui.dismiss(toast.id)">
                    ×
                </button>
            </div>
        </TransitionGroup>
    </div>
</template>

<style scoped>
.toasts {
    position: fixed;
    right: var(--space-4);
    bottom: var(--space-4);
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    width: min(100% - 2rem, 380px);
    pointer-events: none; /* clicks pass through the empty area */
}

.toast {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-left: 4px solid var(--color-info);
    border-radius: var(--radius);
    background: var(--color-surface);
    color: var(--color-text);
    box-shadow: var(--shadow-lg);
    pointer-events: auto;
}

.toast--success {
    border-left-color: var(--color-success);
}

.toast--error {
    border-left-color: var(--color-danger);
}

.toast__message {
    flex: 1;
    font-size: 0.95rem;
}

.toast__close {
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

.toast__close:hover {
    background: var(--color-surface-muted);
}

.toast-enter-active,
.toast-leave-active {
    transition: opacity 0.2s, transform 0.2s;
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateY(8px);
}
</style>
