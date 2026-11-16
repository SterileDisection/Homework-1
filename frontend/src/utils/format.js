// Formats an ISO date string like "2026-11-16T05:45:57.937Z" as "Nov 16, 2026".
export function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

// "1 enrollment" / "3 enrollments"
export function pluralize(count, singular, plural = `${singular}s`) {
    return `${count} ${count === 1 ? singular : plural}`;
}
