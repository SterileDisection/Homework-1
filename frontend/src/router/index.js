import { createRouter, createWebHistory } from 'vue-router';

// Views are imported lazily (() => import(...)) so each page's code is only
// downloaded when the user first visits it.
const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: 'Dashboard' },
    },
    {
        path: '/students',
        name: 'students',
        component: () => import('@/views/StudentsView.vue'),
        meta: { title: 'Students' },
    },
    {
        path: '/courses',
        name: 'courses',
        component: () => import('@/views/CoursesView.vue'),
        meta: { title: 'Courses' },
    },
    {
        path: '/enrollments',
        name: 'enrollments',
        component: () => import('@/views/EnrollmentsView.vue'),
        meta: { title: 'Enrollments' },
    },
    {
        // Any other URL shows a friendly "page not found" view.
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/views/NotFoundView.vue'),
        meta: { title: 'Page Not Found' },
    },
];

const router = createRouter({
    // HTML5 history mode gives clean URLs like /courses (no "#").
    // The Express server must return index.html for these paths so that a page
    // refresh doesn't 404 -- that fallback is added in Part 5.
    history: createWebHistory(),
    routes,
    scrollBehavior: () => ({ top: 0 }),
});

// Keep the browser tab title in sync with the current page.
router.afterEach((to) => {
    document.title = `${to.meta.title ?? 'Page'} | Student Management System`;
});

export default router;
