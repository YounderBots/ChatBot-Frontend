export const baseURL = import.meta.env.VITE_API_BASE_URL;

const TIMEOUT_MS = 15000; // 15-second request timeout

// ---------------------------------------------------------------------------
// Token storage (A2/A3): short-lived access token + rotating refresh token
// ---------------------------------------------------------------------------

const getToken = () => sessionStorage.getItem("token");
const getRefreshToken = () => sessionStorage.getItem("refresh_token");

export const setAuthTokens = (token, refreshToken) => {
    if (token) sessionStorage.setItem("token", token);
    if (refreshToken) sessionStorage.setItem("refresh_token", refreshToken);
};

const clearSession = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("menus");
};

const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

/** Wraps fetch with an AbortController timeout. */
const fetchWithTimeout = (url, options = {}) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
    return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(id));
};

// ---------------------------------------------------------------------------
// Silent refresh — single-flight so concurrent 401s trigger ONE rotation
// (two parallel refreshes would replay a rotated token and burn the family).
// ---------------------------------------------------------------------------

let refreshPromise = null;

export const refreshAccessToken = async () => {
    if (!getRefreshToken()) return false;
    if (!refreshPromise) {
        refreshPromise = (async () => {
            try {
                const resp = await fetchWithTimeout(`${baseURL}/login/refresh`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh_token: getRefreshToken() }),
                });
                if (!resp.ok) return false;
                const data = await resp.json();
                if (!data.token) return false;
                setAuthTokens(data.token, data.refresh_token);
                return true;
            } catch {
                return false;
            }
        })().finally(() => { refreshPromise = null; });
    }
    return refreshPromise;
};

const forceLogout = () => {
    clearSession();
    window.location.href = "/admin/login";
};

const withAuth = (options) => ({
    ...options,
    headers: { ...(options.headers || {}), ...authHeader() },
});

/** Authenticated fetch with one silent-refresh retry on 401. */
const authFetch = async (endpoint, options) => {
    let response = await fetchWithTimeout(`${baseURL}${endpoint}`, withAuth(options));
    if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            response = await fetchWithTimeout(`${baseURL}${endpoint}`, withAuth(options));
        }
        if (response.status === 401) {
            forceLogout();
            throw new Error("Session expired. Please log in again.");
        }
    }
    return response;
};

const handleResponse = async (response) => {
    const result = await response.json();

    if (!response.ok) {
        if (Array.isArray(result.detail)) {
            throw new Error(result.detail.map((e) => e.msg).join(", "));
        }
        if (response.status === 409) {
            throw new Error(result.detail || "This item already exists.");
        }
        if (response.status === 404) {
            throw new Error(result.detail || "The requested resource was not found.");
        }
        if (response.status === 502 || response.status === 503) {
            throw new Error(result.detail || "Service temporarily unavailable. Please try again.");
        }
        throw new Error(
            result.detail || result.message || "Something went wrong. Please try again."
        );
    }

    return result;
};


const APICall = {
    // -------------------------
    // POST (Without Token)
    // -------------------------
    postWT: async (endpoint, payload = {}) => {
        try {
            const response = await fetchWithTimeout(`${baseURL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            return await handleResponse(response);
        } catch (err) {
            if (err.name === "AbortError") throw new Error("Request timed out");
            throw new Error(err.message || "POST request failed");
        }
    },

    // -------------------------
    // GET (Without Token)
    // -------------------------
    getWT: async (endpoint) => {
        try {
            const response = await fetchWithTimeout(`${baseURL}${endpoint}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            return await handleResponse(response);
        } catch (err) {
            if (err.name === "AbortError") throw new Error("Request timed out");
            throw new Error(err.message || "GET request failed");
        }
    },

    // -------------------------
    // POST (With Token)
    // -------------------------
    postT: async (endpoint, payload = {}) => {
        try {
            const response = await authFetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            return await handleResponse(response);
        } catch (err) {
            if (err.name === "AbortError") throw new Error("Request timed out");
            throw new Error(err.message || "POST request failed");
        }
    },

    // -------------------------
    // GET (With Token)
    // -------------------------
    getT: async (endpoint) => {
        try {
            const response = await authFetch(endpoint, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            return await handleResponse(response);
        } catch (err) {
            if (err.name === "AbortError") throw new Error("Request timed out");
            throw new Error(err.message || "GET request failed");
        }
    },

    // -------------------------
    // POST File (With Token)
    // -------------------------
    postfileT: async (endpoint, formData) => {
        try {
            const response = await authFetch(endpoint, {
                method: "POST",
                body: formData,
            });
            return await handleResponse(response);
        } catch (err) {
            if (err.name === "AbortError") throw new Error("Request timed out");
            throw new Error(err.message || "POST request failed");
        }
    },

    // -------------------------
    // PUT (With Token)
    // -------------------------
    putT: async (endpoint, payload = {}) => {
        try {
            const response = await authFetch(endpoint, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            return await handleResponse(response);
        } catch (err) {
            if (err.name === "AbortError") throw new Error("Request timed out");
            throw new Error(err.message || "PUT request failed");
        }
    },

    // -------------------------
    // PATCH (With Token)
    // -------------------------
    patchT: async (endpoint, payload = {}) => {
        try {
            const response = await authFetch(endpoint, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            return await handleResponse(response);
        } catch (err) {
            if (err.name === "AbortError") throw new Error("Request timed out");
            throw new Error(err.message || "PATCH request failed");
        }
    },

    // -------------------------
    // DELETE (With Token)
    // -------------------------
    deleteT: async (endpoint) => {
        try {
            const response = await authFetch(endpoint, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
            return await handleResponse(response);
        } catch (err) {
            if (err.name === "AbortError") throw new Error("Request timed out");
            throw new Error(err.message || "DELETE request failed");
        }
    },

    // -------------------------
    // Server-side logout — revoke tokens, then clear local session.
    // Best-effort: never blocks the client from logging out locally.
    // -------------------------
    serverLogout: async () => {
        const token = getToken();
        try {
            if (token) {
                await fetchWithTimeout(`${baseURL}/login/logout`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
        } catch {
            /* ignore — local clear happens regardless */
        }
        clearSession();
    },
};

export default APICall;
