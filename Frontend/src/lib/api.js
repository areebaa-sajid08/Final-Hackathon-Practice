const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || "https://final-hackathon-practice.vercel.app/api"
).replace(/\/+$/, "");

const AUTH_SESSION_KEY = "clinic-authenticated";
const LEGACY_TOKEN_KEY = "clinic-access-token";

export function hasAuthSession() {
    if (localStorage.getItem(AUTH_SESSION_KEY) === "true") return true;

    if (sessionStorage.getItem(LEGACY_TOKEN_KEY)) {
        sessionStorage.removeItem(LEGACY_TOKEN_KEY);
        localStorage.setItem(AUTH_SESSION_KEY, "true");
        return true;
    }

    return false;
}

export function setAuthSession() {
    localStorage.setItem(AUTH_SESSION_KEY, "true");
}

export function clearAuthSession() {
    localStorage.removeItem(AUTH_SESSION_KEY);
    sessionStorage.removeItem(LEGACY_TOKEN_KEY);
}

async function request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
    if (options.body !== undefined && !isFormData) {
        headers.set("Content-Type", "application/json");
    }

    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers,
            credentials: "include"
        });
    } catch {
        throw new Error("Can't reach the clinic API. Check your connection and try again.");
    }

    let result;
    try {
        result = await response.json();
    } catch {
        throw new Error(`Clinic API returned an unreadable response (HTTP ${response.status}).`);
    }
    if (!response.ok) {
        const detail = typeof result.message === "string" ? result.message : "Request failed";
        const error = new Error(`${detail} (HTTP ${response.status})`);
        error.status = response.status;
        throw error;
    }
    return result;
}

export const api = {
    get: path => request(path),
    post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
    postForm: (path, body) => request(path, { method: "POST", body }),
    patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
    delete: path => request(path, { method: "DELETE" })
};
