const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || "https://final-hackathon-practice.vercel.app/api"
).replace(/\/+$/, "");

const TOKEN_KEY = "clinic-access-token";

export function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
    sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    const token = getToken();
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }
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
