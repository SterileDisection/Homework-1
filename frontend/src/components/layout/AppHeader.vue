<script setup>
import { RouterLink } from 'vue-router';

// The main navigation. RouterLink switches views without reloading the page,
// and automatically adds aria-current="page" to the link for the current view.
const links = [
    { to: { name: 'home' }, label: 'Dashboard' },
    { to: { name: 'students' }, label: 'Students' },
    { to: { name: 'courses' }, label: 'Courses' },
    { to: { name: 'enrollments' }, label: 'Enrollments' },
];
</script>

<template>
    <header class="app-header">
        <div class="container app-header__inner">
            <RouterLink :to="{ name: 'home' }" class="brand">
                <img src="/favicon.svg" alt="" class="brand__logo" width="32" height="32" />
                <span class="brand__name">Student Management</span>
            </RouterLink>

            <nav aria-label="Main">
                <ul class="nav">
                    <li v-for="link in links" :key="link.label">
                        <RouterLink :to="link.to" class="nav__link" exact-active-class="nav__link--active">
                            {{ link.label }}
                        </RouterLink>
                    </li>
                </ul>
            </nav>
        </div>
    </header>
</template>

<style scoped>
.app-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    box-shadow: var(--shadow-sm);
}

.app-header__inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2) var(--space-4);
    min-height: 4rem;
    padding-top: var(--space-2);
    padding-bottom: var(--space-2);
}

.brand {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-text);
    font-weight: 700;
    font-size: 1.05rem;
    text-decoration: none;
}

.nav {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    margin: 0;
    padding: 0;
    list-style: none;
}

.nav__link {
    display: inline-flex;
    align-items: center;
    min-height: 2.5rem;
    padding: 0 var(--space-3);
    border-radius: var(--radius-sm);
    color: var(--color-text-muted);
    font-weight: 500;
    text-decoration: none;
}

.nav__link:hover {
    background: var(--color-surface-muted);
    color: var(--color-text);
}

.nav__link--active {
    background: var(--color-primary-soft);
    color: var(--color-primary);
    font-weight: 600;
}

/* Phones: brand on top, nav links spread across the full width below. */
@media (max-width: 640px) {
    .app-header {
        position: static;
    }

    nav {
        width: 100%;
    }

    .nav {
        justify-content: space-between;
    }

    .nav li {
        flex: 1;
    }

    .nav__link {
        justify-content: center;
        width: 100%;
        padding: 0 var(--space-2);
        font-size: 0.9rem;
    }
}
</style>
