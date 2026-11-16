import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * App-wide UI state that any component can use:
 *  - toast notifications ("Student added successfully")
 *  - a single confirmation dialog ("Delete John?")
 */
export const useUiStore = defineStore('ui', () => {
    // ----- Toast notifications -----
    const toasts = ref([]);
    let nextId = 1;

    function notify(message, type = 'success', timeout = 5000) {
        const id = nextId++;
        toasts.value.push({ id, message, type });
        if (timeout) {
            setTimeout(() => dismiss(id), timeout);
        }
        return id;
    }

    function dismiss(id) {
        toasts.value = toasts.value.filter((toast) => toast.id !== id);
    }

    // ----- Confirmation dialog -----
    // `confirmRequest` holds the dialog's text while it is open (null when closed).
    // confirm() returns a Promise, so callers can simply write:
    //     if (await ui.confirm({ title: 'Delete student?', ... })) { ... }
    const confirmRequest = ref(null);
    let resolveConfirm = null;

    function confirm({ title, message, confirmLabel = 'Confirm', danger = false }) {
        // If a dialog is somehow already open, treat it as cancelled.
        resolveConfirm?.(false);
        confirmRequest.value = { title, message, confirmLabel, danger };
        return new Promise((resolve) => {
            resolveConfirm = resolve;
        });
    }

    function answerConfirm(result) {
        resolveConfirm?.(result);
        resolveConfirm = null;
        confirmRequest.value = null;
    }

    return { toasts, notify, dismiss, confirmRequest, confirm, answerConfirm };
});
