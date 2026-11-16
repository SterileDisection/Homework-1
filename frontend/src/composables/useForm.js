import { nextTick, reactive, ref } from 'vue';
import { ApiError } from '@/api/client';

/**
 * Reusable form logic (a "composable") shared by the student, course, and
 * enrollment forms:
 *   - reactive field values and per-field error messages
 *   - client-side validation before anything is sent
 *   - a `submitting` flag for the button's loading state
 *   - server errors mapped back onto the matching fields
 *   - keyboard focus moved to the first invalid field
 *
 * Usage:
 *   const formRef = ref(null);
 *   const { values, errors, formError, submitting, submit, reset } =
 *       useForm({ name: '' }, validateSomething, formRef);
 *   const ok = await submit((data) => store.addSomething(data));
 */
export function useForm(initialValues, validate, formRef) {
    const values = reactive({ ...initialValues });
    const errors = reactive({});
    const formError = ref('');
    const submitting = ref(false);

    function clearErrors() {
        for (const key of Object.keys(errors)) delete errors[key];
        formError.value = '';
    }

    function reset() {
        Object.assign(values, initialValues);
        clearErrors();
    }

    async function focusFirstInvalid() {
        await nextTick();
        formRef?.value?.querySelector('[aria-invalid="true"]')?.focus();
    }

    // Copies field errors from an API error into `errors`, when they match a field.
    function applyServerErrors(err) {
        if (!(err instanceof ApiError) || !err.details || typeof err.details !== 'object') return;

        const fields = Object.keys(err.details).filter((key) => key in values);
        if (err.status === 400) {
            // Validation failed: details are { field: message }
            for (const field of fields) errors[field] = String(err.details[field]);
        } else if (err.status === 409 && fields.length === 1) {
            // Duplicate of a single field (e.g. student ID): show the message on that field.
            errors[fields[0]] = err.message;
        }
    }

    /**
     * Validates, then runs `action` with a plain copy of the values.
     * Resolves to true on success and false on failure (errors are shown in the form).
     */
    async function submit(action) {
        clearErrors();

        const found = validate ? validate(values) : {};
        if (Object.keys(found).length) {
            Object.assign(errors, found);
            formError.value = 'Please correct the highlighted fields.';
            await focusFirstInvalid();
            return false;
        }

        submitting.value = true;
        try {
            await action({ ...values });
            return true;
        } catch (err) {
            applyServerErrors(err);
            formError.value = err.message || 'Something went wrong. Please try again.';
            await focusFirstInvalid();
            return false;
        } finally {
            submitting.value = false;
        }
    }

    return { values, errors, formError, submitting, submit, reset, clearErrors };
}
