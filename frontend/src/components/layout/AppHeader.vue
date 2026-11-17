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
                <!-- White tile with a red graduation cap, so it stands out on the red header. -->
                <svg class="brand__logo" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
                    <rect width="32" height="32" rx="7" fill="#fff" />
                    <path d="M16 7 4 13l12 6 10-5v7h2v-8z" fill="currentColor" />
                    <path d="M9 17.5V22c0 1.7 3.1 3 7 3s7-1.3 7-3v-4.5l-7 3.5z" fill="currentColor" />
                </svg>
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
/* UH Red header bar with white text. */
.app-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--color-header-bg);
    color: var(--color-on-header);
    box-shadow: var(--shadow);
}

/* The default focus ring is red, which would vanish on the red bar. */
.app-header :focus-visible {
    outline-color: var(--color-on-header);
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
    color: var(--color-on-header);
    font-weight: 700;
    font-size: 1.05rem;
    text-decoration: none;
}

.brand__logo {
    flex: none;
    color: var(--color-header-bg); /* the cap matches the header red */
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
    color: var(--color-on-header);
    font-weight: 500;
    text-decoration: none;
}

.nav__link:hover {
    background: rgb(255 255 255 / 16%);
}

/* Current page: white tab with red text. */
.nav__link--active,
.nav__link--active:hover {
    background: #fff;
    color: var(--color-header-bg);
    font-weight: 700;
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
