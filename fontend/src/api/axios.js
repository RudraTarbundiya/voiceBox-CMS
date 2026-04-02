import axios from "axios";

// Creates a centralized axios instance that handles HTTP-only cookies
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

let csrfTokenPromise = null;
let csrfToken = null;

const tokenClient = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

async function getCsrfToken() {
    if (csrfToken) {
        return csrfToken;
    }

    if (!csrfTokenPromise) {
        csrfTokenPromise = tokenClient.get('/auth/csrf-token')
            .then((res) => {
                csrfToken = res.data?.csrfToken || null;
                return csrfToken;
            })
            .finally(() => {
                csrfTokenPromise = null;
            });
    }

    return csrfTokenPromise;
}

const api = axios.create({
    baseURL,
    withCredentials: true, // Crucial for session cookies tracking
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use(async (config) => {
    const method = (config.method || 'get').toLowerCase();
    const isUnsafeMethod = ['post', 'put', 'patch', 'delete'].includes(method);

    if (isUnsafeMethod && !config.headers?.['X-CSRF-Token'] && !config.headers?.['x-csrf-token']) {
        const token = await getCsrfToken();
        if (token) {
            config.headers = config.headers || {};
            config.headers['X-CSRF-Token'] = token;
        }
    }

    return config;
});

export default api;
