/**
 * One place for all HTTP calls to the Express API.
 *
 * Every request goes to a relative "/api/..." URL. In development Vite proxies
 * it to Express on port 3000; in production Express serves both the app and
 * the API, so the same URL works everywhere.
 */

const BASE_URL = '/api';

// Thrown for any failed request, so components can show `error.message`
// and highlight form fields using `error.details` (e.g. { zip: 'ZIP code is required' }).
export class ApiError extends Error {
    constructor(message, status, details = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status; // HTTP status code, or 0 if the server couldn't be reached
        this.details = details;
    }
}

async function request(path, { method = 'GET', body } = {}) {
    const options = { method, headers: { Accept: 'application/json' } };
    if (body !== undefined) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }

    let response;
    try {
        response = await fetch(BASE_URL + path, options);
    } catch {
        // fetch() only rejects when there's no response at all (server down, offline).
        throw new ApiError('Cannot reach the server. Make sure the backend is running and try again.', 0);
    }

    // Some error responses (e.g. from a proxy) may not be JSON.
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message = data?.error || `Request failed (${response.status} ${response.statusText})`;
        throw new ApiError(message, response.status, data?.details ?? null);
    }

    return data;
}

export const http = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body }),
    delete: (path) => request(path, { method: 'DELETE' }),
};
