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
 * Detect if running in a subfolder or using Laravel dev server
 */
const pathname = window.location.pathname;
const basePath = pathname.split('/')[1];

// List of known Laravel routes (not subfolders)
const laravelRoutes = ['adminlogin', 'dashboard', 'faculty', 'students', 'reports', 'settings', 'profile', 'admin', 'student', 'login', 'register'];

// Only add base path if it's a real subfolder, not a Laravel route
if (basePath && basePath !== 'api' && basePath !== 'index.php' && !laravelRoutes.includes(basePath)) {
    window.axios.defaults.baseURL = `${window.location.origin}/${basePath}`;
} else {
    window.axios.defaults.baseURL = window.location.origin;
}

console.log('Axios baseURL set to:', window.axios.defaults.baseURL);

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
