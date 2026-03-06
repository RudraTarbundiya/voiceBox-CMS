import axios from "axios";

// Creates a centralized axios instance that handles HTTP-only cookies
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    withCredentials: true, // Crucial for session cookies tracking
    headers: {
        "Content-Type": "application/json"
    }
});

export default api;
