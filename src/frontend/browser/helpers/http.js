/**
 * Headers every request to the package API must carry:
 * - Accept: the API always answers JSON (validation errors included)
 * - X-XSRF-TOKEN: Laravel's CSRF protection reads the encrypted cookie
 */
export function apiHeaders(extra = {}) {

    const headers = {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    };

    const cookie = document.cookie.split('; ').find(item => item.startsWith('XSRF-TOKEN='));

    if (cookie) {
        headers['X-XSRF-TOKEN'] = decodeURIComponent(cookie.slice('XSRF-TOKEN='.length));
    } else {
        const meta = document.querySelector('meta[name="csrf-token"]')?.content;

        if (meta) headers['X-CSRF-TOKEN'] = meta;
    }

    return {...headers, ...extra};
}

/** Turns a failed API response body into the most helpful human message. */
export function extractMessage(body, fallback) {

    const firstError = body?.errors ? Object.values(body.errors).flat()[0] : null;

    return firstError ?? body?.message ?? fallback;
}
