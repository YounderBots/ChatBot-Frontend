export const baseURL = import.meta.env.VITE_API_BASE_URL;

const TIMEOUT_MS = 15000; // 15-second request timeout

const getAuthHeader = () => ({
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
});

/** Wraps fetch with an AbortController timeout. */
const fetchWithTimeout = (url, options = {}) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
    return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(id));
};

const handleResponse = async (response) => {
    const result = await response.json();

    if (!response.ok) {
        if (Array.isArray(result.detail)) {
            throw new Error(result.detail.map((e) => e.msg).join(", "));
        }

        throw new Error(
            result.detail || result.message || "API Error"
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
    // POST (With Token)
    // -------------------------
    postT: async (endpoint, payload = {}) => {
        try {
            const response = await fetchWithTimeout(`${baseURL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeader(),
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
    // GET (With Token)
    // -------------------------
    getT: async (endpoint) => {
        try {
            const response = await fetchWithTimeout(`${baseURL}${endpoint}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeader(),
                },
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
            const response = await fetchWithTimeout(`${baseURL}${endpoint}`, {
                method: "POST",
                headers: {
                    ...getAuthHeader(),
                },
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
            const response = await fetchWithTimeout(`${baseURL}${endpoint}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeader(),
                },
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
            const response = await fetchWithTimeout(`${baseURL}${endpoint}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeader(),
                },
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
            const response = await fetchWithTimeout(`${baseURL}${endpoint}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeader(),
                },
            });

            return await handleResponse(response);
        } catch (err) {
            if (err.name === "AbortError") throw new Error("Request timed out");
            throw new Error(err.message || "DELETE request failed");
        }
    },
};

export default APICall;
