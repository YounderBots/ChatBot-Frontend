const baseURL = import.meta.env.VITE_API_BASE_URL;
const TIMEOUT_MS = 15000;

const getSAToken = () => sessionStorage.getItem("sa_token");

const fetchSA = (url, options = {}) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
    return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
};

const handleResponse = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || "API Error");
    return data;
};

const saHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getSAToken()}`,
});

const ManagementAPI = {
    login: (email, password) =>
        fetchSA(`${baseURL}/management/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        }).then(handleResponse),

    listOrgs: (page = 1, status = "", search = "") => {
        let url = `${baseURL}/management/organizations?page=${page}&limit=20`;
        if (status) url += `&status=${status}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        return fetchSA(url, { headers: saHeaders() }).then(handleResponse);
    },

    getOrg: (orgId) =>
        fetchSA(`${baseURL}/management/organizations/${orgId}`, { headers: saHeaders() }).then(handleResponse),

    suspendOrg: (orgId) =>
        fetchSA(`${baseURL}/management/organizations/${orgId}/suspend`, {
            method: "POST", headers: saHeaders(),
        }).then(handleResponse),

    activateOrg: (orgId) =>
        fetchSA(`${baseURL}/management/organizations/${orgId}/activate`, {
            method: "POST", headers: saHeaders(),
        }).then(handleResponse),

    listUsers: (params = {}) => {
        const q = new URLSearchParams({ page: 1, limit: 20, ...params }).toString();
        return fetchSA(`${baseURL}/management/users?${q}`, { headers: saHeaders() }).then(handleResponse);
    },

    listAuditLogs: (params = {}) => {
        const q = new URLSearchParams({ page: 1, limit: 50, ...params }).toString();
        return fetchSA(`${baseURL}/management/audit-logs?${q}`, { headers: saHeaders() }).then(handleResponse);
    },

    platformUsage: (params = {}) => {
        const q = new URLSearchParams(params).toString();
        const url = q ? `${baseURL}/management/usage?${q}` : `${baseURL}/management/usage`;
        return fetchSA(url, { headers: saHeaders() }).then(handleResponse);
    },

    platformBilling: () =>
        fetchSA(`${baseURL}/management/billing`, { headers: saHeaders() }).then(handleResponse),

    inviteSuperAdmin: (email, password, fullName, adminRoleId) =>
        fetchSA(`${baseURL}/management/superadmin/invite`, {
            method: "POST",
            headers: saHeaders(),
            body: JSON.stringify({ email, password, full_name: fullName, admin_role_id: adminRoleId || null }),
        }).then(handleResponse),

    // ── Admin Users ──────────────────────────────────────────────────────────

    listAdmins: () =>
        fetchSA(`${baseURL}/management/admins`, { headers: saHeaders() }).then(handleResponse),

    assignAdminRole: (adminId, adminRoleId) =>
        fetchSA(`${baseURL}/management/admins/${adminId}/role`, {
            method: "PUT",
            headers: saHeaders(),
            body: JSON.stringify({ admin_role_id: adminRoleId }),
        }).then(handleResponse),

    toggleAdminStatus: (adminId, isActive) =>
        fetchSA(`${baseURL}/management/admins/${adminId}/status`, {
            method: "PATCH",
            headers: saHeaders(),
            body: JSON.stringify({ is_active: isActive }),
        }).then(handleResponse),

    // ── Admin Roles ──────────────────────────────────────────────────────────

    listAdminRoles: () =>
        fetchSA(`${baseURL}/management/admin-roles`, { headers: saHeaders() }).then(handleResponse),

    getAdminRole: (roleId) =>
        fetchSA(`${baseURL}/management/admin-roles/${roleId}`, { headers: saHeaders() }).then(handleResponse),

    createAdminRole: (name, description, permissions) =>
        fetchSA(`${baseURL}/management/admin-roles`, {
            method: "POST",
            headers: saHeaders(),
            body: JSON.stringify({ name, description, permissions }),
        }).then(handleResponse),

    updateAdminRole: (roleId, name, description, permissions) =>
        fetchSA(`${baseURL}/management/admin-roles/${roleId}`, {
            method: "PUT",
            headers: saHeaders(),
            body: JSON.stringify({ name, description, permissions }),
        }).then(handleResponse),

    deleteAdminRole: (roleId) =>
        fetchSA(`${baseURL}/management/admin-roles/${roleId}`, {
            method: "DELETE",
            headers: saHeaders(),
        }).then(handleResponse),

    // ── Org Drill-down ───────────────────────────────────────────────────────

    getOrgUsers: (orgId, page = 1) =>
        fetchSA(`${baseURL}/management/organizations/${orgId}/users?page=${page}&limit=20`, {
            headers: saHeaders(),
        }).then(handleResponse),

    getOrgRoles: (orgId) =>
        fetchSA(`${baseURL}/management/organizations/${orgId}/roles`, {
            headers: saHeaders(),
        }).then(handleResponse),

    getOrgStats: (orgId) =>
        fetchSA(`${baseURL}/management/organizations/${orgId}/stats`, {
            headers: saHeaders(),
        }).then(handleResponse),

    // ── Platform content ─────────────────────────────────────────────────────

    listIntents: (params = {}) => {
        const q = new URLSearchParams({ page: 1, limit: 20, ...params }).toString();
        return fetchSA(`${baseURL}/management/intents?${q}`, { headers: saHeaders() }).then(handleResponse);
    },

    listKnowledgeBase: (params = {}) => {
        const q = new URLSearchParams({ page: 1, limit: 20, ...params }).toString();
        return fetchSA(`${baseURL}/management/knowledge-base?${q}`, { headers: saHeaders() }).then(handleResponse);
    },

    listChannels: (params = {}) => {
        const q = new URLSearchParams({ page: 1, limit: 20, ...params }).toString();
        return fetchSA(`${baseURL}/management/channels?${q}`, { headers: saHeaders() }).then(handleResponse);
    },
};

export default ManagementAPI;
