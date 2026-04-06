window._ = require('lodash');

try {
    require('bootstrap');
} catch (e) {}

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

window.axios = require('axios');

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Setup CSRF token for axios requests
 */
let token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

/**
 * Set base URL for axios
 * Detect the correct base path including the /public subfolder when running in XAMPP
 */
const currentPath = window.location.pathname;
const pathParts = currentPath.split('/');

// Find the 'public' segment index to correctly detect XAMPP subdirectory
const publicIndex = pathParts.indexOf('public');

let axiosBase;
if (publicIndex > 0) {
    // Running in a subdirectory with /public (e.g., /UniSys/public/...)
    axiosBase = window.location.origin + pathParts.slice(0, publicIndex + 1).join('/');
} else {
    // Running at root or directly via server (no /public in path)
    axiosBase = window.location.origin;
}

window.axios.defaults.baseURL = axiosBase;
console.log('Axios baseURL set to:', window.axios.defaults.baseURL);

/**
 * Attach auth headers on every request from the stored user session.
 * The backend VerifyApiUser middleware checks these for protected routes.
 */
window.axios.interceptors.request.use(function (config) {
    try {
        const stored = localStorage.getItem('user');
        if (stored) {
            const user = JSON.parse(stored);
            if (user && user.id) {
                config.headers['X-User-Id']   = user.id;
                config.headers['X-User-Role'] = user.role || '';
            }
        }
    } catch (e) {
        // Ignore parse errors
    }
    return config;
});

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

// import Echo from 'laravel-echo';

// window.Pusher = require('pusher-js');

// window.Echo = new Echo({
//     broadcaster: 'pusher',
//     key: process.env.MIX_PUSHER_APP_KEY,
//     cluster: process.env.MIX_PUSHER_APP_CLUSTER,
//     forceTLS: true
// });
