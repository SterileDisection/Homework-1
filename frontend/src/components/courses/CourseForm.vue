<script setup>
import { nextTick, ref } from 'vue';

import { useCoursesStore } from '@/stores/courses';
import { useUiStore } from '@/stores/ui';
import { useForm } from '@/composables/useForm';
import { validateCourse } from '@/utils/validators';
import TextField from '@/components/ui/TextField.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import AlertMessage from '@/components/ui/AlertMessage.vue';

const coursesStore = useCoursesStore();
const ui = useUiStore();

// Field rules, plus an instant duplicate check against the courses already loaded.
// Course IDs are compared the way the server stores them ("cis  3339" -> "CIS 3339").
function validate(values) {
    const errors = validateCourse(values);
    const id = values.courseId.trim().replace(/\s+/g, ' ').toUpperCase();
    if (!errors.courseId && coursesStore.courses.some((c) => c.courseId === id)) {
        errors.courseId = `A course with ID ${id} already exists`;
    }
    return errors;
}

const formRef = ref(null);
const { values, errors, formError, submitting, submit, reset } = useForm(
    { courseId: '', name: '' },
    validate,
    formRef
);

async function onSubmit() {
    const ok = await submit(async (data) => {
        const { course } = await coursesStore.addCourse(data);
        ui.notify(`${course.courseId} – ${course.name} was added.`);
    });

    if (ok) {
        reset();
        await nextTick();
        formRef.value?.querySelector('input')?.focus();
    }
}
</script>

<template>
    <form ref="formRef" class="stack" novalidate @submit.prevent="onSubmit">
        <AlertMessage v-if="formError" type="error">{{ formError }}</AlertMessage>

        <TextField
            v-model="values.courseId"
            label="Course ID"
            placeholder="CIS 3339"
            hint="Must be unique. Saved in capital letters, e.g. “cis 3339” becomes “CIS 3339”."
            :error="errors.courseId"
            required
            maxlength="20"
        />
        <TextField
            v-model="values.name"
            label="Course name"
            placeholder="Enterprise Applications Development"
            :error="errors.name"
            required
            maxlength="150"
        />

        <div class="form-actions">
            <BaseButton type="submit" :loading="submitting" loading-text="Adding...">Add course</BaseButton>
            <BaseButton variant="secondary" :disabled="submitting" @click="reset">Clear</BaseButton>
        </div>
    </form>
</template>
