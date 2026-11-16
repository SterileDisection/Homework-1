<script setup>
import { nextTick, ref } from 'vue';

import { useStudentsStore } from '@/stores/students';
import { useUiStore } from '@/stores/ui';
import { useForm } from '@/composables/useForm';
import { validateStudent } from '@/utils/validators';
import TextField from '@/components/ui/TextField.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import AlertMessage from '@/components/ui/AlertMessage.vue';

const studentsStore = useStudentsStore();
const ui = useUiStore();

// Field rules, plus an instant duplicate check against the students already loaded.
// (The server's unique index is still the final authority.)
function validate(values) {
    const errors = validateStudent(values);
    const id = values.studentId.trim();
    if (!errors.studentId && studentsStore.students.some((s) => s.studentId === id)) {
        errors.studentId = `A student with ID ${id} already exists`;
    }
    return errors;
}

const formRef = ref(null);
const { values, errors, formError, submitting, submit, reset } = useForm(
    { name: '', studentId: '', phone: '', zip: '' },
    validate,
    formRef
);

async function onSubmit() {
    const ok = await submit(async (data) => {
        const { student } = await studentsStore.addStudent(data);
        ui.notify(`${student.name} (ID ${student.studentId}) was added.`);
    });

    if (ok) {
        reset();
        // Ready for the next student: put the cursor back in the first field.
        await nextTick();
        formRef.value?.querySelector('input')?.focus();
    }
}
</script>

<template>
    <form ref="formRef" class="stack" novalidate @submit.prevent="onSubmit">
        <AlertMessage v-if="formError" type="error">{{ formError }}</AlertMessage>

        <TextField v-model="values.name" label="Name" :error="errors.name" required maxlength="100" />
        <TextField
            v-model="values.studentId"
            label="Student ID"
            :error="errors.studentId"
            hint="Must be unique, e.g. 1001"
            required
            maxlength="20"
        />
        <div class="form-row">
            <TextField
                v-model="values.phone"
                label="Phone"
                type="tel"
                inputmode="tel"
                placeholder="555-1234"
                :error="errors.phone"
                required
                maxlength="20"
            />
            <TextField
                v-model="values.zip"
                label="ZIP code"
                inputmode="numeric"
                placeholder="77001"
                :error="errors.zip"
                required
                maxlength="10"
            />
        </div>

        <div class="form-actions">
            <BaseButton type="submit" :loading="submitting" loading-text="Adding...">Add student</BaseButton>
            <BaseButton variant="secondary" :disabled="submitting" @click="reset">Clear</BaseButton>
        </div>
    </form>
</template>

<style scoped>
.form-row {
    display: grid;
    gap: var(--space-4);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr));
    align-items: start;
}
</style>
