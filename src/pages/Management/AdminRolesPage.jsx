import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagementAPI from "./managementAPI";

const RESOURCES = [
    { key: "organizations", label: "Organizations" },
    { key: "users",         label: "Users" },
    { key: "billing",       label: "Billing" },
    { key: "audit_logs",    label: "Audit Logs" },
    { key: "admin_roles",   label: "Admin Roles" },
    { key: "admin_users",   label: "Admin Users" },
    { key: "plans",         label: "Plans" },
];

const ACTIONS = [
    { key: "can_view",     label: "View" },
    { key: "can_create",   label: "Create" },
    { key: "can_update",   label: "Update" },
    { key: "can_delete",   label: "Delete" },
    { key: "can_suspend",  label: "Suspend" },
    { key: "can_activate", label: "Activate" },
];

const ORGS_ONLY_ACTIONS = new Set(["can_suspend", "can_activate"]);

function buildDefaultPerms() {
    return RESOURCES.map(r => ({
        resource: r.key,
        can_view: false, can_create: false, can_update: false,
        can_delete: false, can_suspend: false, can_activate: false,
    }));
}

export default function AdminRolesPage() {
    const navigate  = useNavigate();
    const [roles, setRoles]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState("");
    const [msg, setMsg]         = useState("");

    // Modal state
    const [modal, setModal]     = useState(null); // null | "create" | "edit"
    const [editRole, setEditRole] = useState(null);
    const [formName, setFormName] = useState("");
    const [formDesc, setFormDesc] = useState("");
    const [formPerms, setFormPerms] = useState(buildDefaultPerms());
    const [saving, setSaving]   = useState(false);
    const [formError, setFormError] = useState("");

    const load = async () => {
        setLoading(true);
        try {
            const data = await ManagementAPI.listAdminRoles();
            setRoles(data.roles);
        } catch (e) {
            if (e.message?.includes("401")) navigate("/management/login");
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => {
        setEditRole(null);
        setFormName("");
        setFormDesc("");
        setFormPerms(buildDefaultPerms());
        setFormError("");
        setModal("create");
    };

    const openEdit = async (role) => {
        try {
            const full = await ManagementAPI.getAdminRole(role.id);
            setEditRole(full);
            setFormName(full.name);
            setFormDesc(full.description || "");
            const permsMap = {};
            (full.permissions || []).forEach(p => { permsMap[p.resource] = p; });
            setFormPerms(RESOURCES.map(r => ({
                resource: r.key,
                can_view:     permsMap[r.key]?.can_view     ?? false,
                can_create:   permsMap[r.key]?.can_create   ?? false,
                can_update:   permsMap[r.key]?.can_update   ?? false,
                can_delete:   permsMap[r.key]?.can_delete   ?? false,
                can_suspend:  permsMap[r.key]?.can_suspend  ?? false,
                can_activate: permsMap[r.key]?.can_activate ?? false,
            })));
            setFormError("");
            setModal("edit");
        } catch (e) {
            setError(e.message);
        }
    };

    const togglePerm = (resource, action) => {
        setFormPerms(prev => prev.map(p =>
            p.resource === resource ? { ...p, [action]: !p[action] } : p
        ));
    };

    const handleSave = async () => {
        if (!formName.trim()) { setFormError("Role name is required"); return; }
        setSaving(true);
        setFormError("");
        try {
            if (modal === "create") {
                await ManagementAPI.createAdminRole(formName.trim(), formDesc.trim(), formPerms);
                setMsg("Role created successfully.");
            } else {
                await ManagementAPI.updateAdminRole(editRole.id, formName.trim(), formDesc.trim(), formPerms);
                setMsg("Role updated successfully.");
            }
            setModal(null);
            load();
        } catch (e) {
            setFormError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (role) => {
        if (role.is_system) return;
        if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
        try {
            await ManagementAPI.deleteAdminRole(role.id);
            setMsg(`Role "${role.name}" deleted.`);
            load();
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Admin Roles</h2>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
                        Define roles for superadmin users with resource-level permissions.
                    </p>
                </div>
                <button onClick={openCreate} style={primaryBtnStyle}>+ Create Role</button>
            </div>

            {msg   && <Alert type="success" msg={msg} onClose={() => setMsg("")} />}
            {error && <Alert type="error"   msg={error} onClose={() => setError("")} />}

            {loading ? (
                <div style={{ color: "#64748b", textAlign: "center", padding: "3rem" }}>Loading…</div>
            ) : (
                <div style={cardStyle}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f8fafc" }}>
                                {["Role", "Description", "System", "Permissions", "Actions"].map(h => (
                                    <th key={h} style={thStyle}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {roles.length === 0 && (
                                <tr><td colSpan={5} style={{ ...tdStyle, color: "#64748b", textAlign: "center", padding: "2rem" }}>No admin roles found</td></tr>
                            )}
                            {roles.map(role => (
                                <tr key={role.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                                    <td style={{ ...tdStyle, fontWeight: 600 }}>
                                        {role.name}
                                        {role.is_system && (
                                            <span style={{ marginLeft: 8, fontSize: 10, color: "#60a5fa", background: "rgba(96,165,250,0.1)", padding: "1px 6px", borderRadius: 10 }}>
                                                SYSTEM
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ ...tdStyle, color: "#64748b" }}>{role.description || "—"}</td>
                                    <td style={{ ...tdStyle, color: role.is_system ? "#22c55e" : "#64748b" }}>
                                        {role.is_system ? "Yes" : "No"}
                                    </td>
                                    <td style={{ ...tdStyle, color: "#64748b" }}>{role.permission_count} resources</td>
                                    <td style={tdStyle}>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button onClick={() => openEdit(role)} style={editBtnStyle}>Edit</button>
                                            <button
                                                onClick={() => handleDelete(role)}
                                                disabled={role.is_system}
                                                style={{ ...deleteBtnStyle, opacity: role.is_system ? 0.4 : 1, cursor: role.is_system ? "not-allowed" : "pointer" }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {modal && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h3 style={{ margin: 0, fontSize: 16 }}>
                                {modal === "create" ? "Create Admin Role" : `Edit: ${editRole?.name}`}
                            </h3>
                            <button onClick={() => setModal(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18 }}>×</button>
                        </div>

                        {formError && <div style={{ color: "#ef4444", marginBottom: 12, fontSize: 13 }}>{formError}</div>}

                        <label style={labelStyle}>Role Name *</label>
                        <input
                            value={formName}
                            onChange={e => setFormName(e.target.value)}
                            placeholder="e.g. Support Admin"
                            style={inputStyle}
                        />

                        <label style={labelStyle}>Description</label>
                        <textarea
                            value={formDesc}
                            onChange={e => setFormDesc(e.target.value)}
                            placeholder="What can this admin role do?"
                            rows={2}
                            style={{ ...inputStyle, resize: "vertical" }}
                        />

                        <label style={{ ...labelStyle, marginTop: 16 }}>Permissions</label>
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                <thead>
                                    <tr style={{ background: "#f8fafc" }}>
                                        <th style={{ ...thStyle, minWidth: 120 }}>Resource</th>
                                        {ACTIONS.map(a => (
                                            <th key={a.key} style={{ ...thStyle, textAlign: "center", minWidth: 64 }}>{a.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {formPerms.map(perm => (
                                        <tr key={perm.resource} style={{ borderTop: "1px solid #e2e8f0" }}>
                                            <td style={{ ...tdStyle, fontWeight: 500 }}>
                                                {RESOURCES.find(r => r.key === perm.resource)?.label}
                                            </td>
                                            {ACTIONS.map(a => {
                                                const disabled = ORGS_ONLY_ACTIONS.has(a.key) && perm.resource !== "organizations";
                                                return (
                                                    <td key={a.key} style={{ ...tdStyle, textAlign: "center" }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={perm[a.key]}
                                                            disabled={disabled}
                                                            onChange={() => !disabled && togglePerm(perm.resource, a.key)}
                                                            style={{ cursor: disabled ? "not-allowed" : "pointer", accentColor: "#60a5fa" }}
                                                        />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
                            <button onClick={() => setModal(null)} style={cancelBtnStyle} disabled={saving}>Cancel</button>
                            <button onClick={handleSave} style={primaryBtnStyle} disabled={saving}>
                                {saving ? "Saving…" : modal === "create" ? "Create Role" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const Alert = ({ type, msg, onClose }) => (
    <div style={{
        background: "#ffffff",
        border: `1px solid ${type === "success" ? "#22c55e" : "#ef4444"}`,
        borderRadius: 8,
        padding: "10px 14px",
        marginBottom: 14,
        color: type === "success" ? "#22c55e" : "#ef4444",
        fontSize: 13,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    }}>
        {msg}
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 16 }}>×</button>
    </div>
);

const cardStyle      = { background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" };
const thStyle        = { padding: "9px 14px", textAlign: "left", color: "#64748b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" };
const tdStyle        = { padding: "11px 14px", fontSize: 13 };
const labelStyle     = { display: "block", color: "#64748b", fontSize: 12, marginBottom: 4, fontWeight: 500 };
const inputStyle     = { width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#0f172a", fontSize: 13, marginBottom: 12, boxSizing: "border-box" };
const overlayStyle   = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 };
const modalStyle     = { background: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "1.5rem", width: "min(720px,95vw)", maxHeight: "90vh", overflowY: "auto" };
const primaryBtnStyle  = { padding: "8px 18px", borderRadius: 7, border: "none", background: "#3b82f6", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 };
const cancelBtnStyle   = { padding: "8px 18px", borderRadius: 7, border: "1px solid #e2e8f0", background: "transparent", color: "#64748b", cursor: "pointer", fontSize: 13 };
const editBtnStyle     = { padding: "3px 10px", borderRadius: 5, border: "1px solid #e2e8f0", background: "transparent", color: "#64748b", cursor: "pointer", fontSize: 12 };
const deleteBtnStyle   = { padding: "3px 10px", borderRadius: 5, border: "1px solid #ef4444", background: "transparent", color: "#ef4444", fontSize: 12 };
