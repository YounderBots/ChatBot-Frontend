import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagementAPI from "./managementAPI";
import { Alert } from "./crudkit";

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
        setEditRole(null); setFormName(""); setFormDesc("");
        setFormPerms(buildDefaultPerms()); setFormError(""); setModal("create");
    };

    const openEdit = async (role) => {
        try {
            const full = await ManagementAPI.getAdminRole(role.id);
            setEditRole(full); setFormName(full.name); setFormDesc(full.description || "");
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
            setFormError(""); setModal("edit");
        } catch (e) { setError(e.message); }
    };

    const togglePerm = (resource, action) => {
        setFormPerms(prev => prev.map(p => p.resource === resource ? { ...p, [action]: !p[action] } : p));
    };

    const handleSave = async () => {
        if (!formName.trim()) { setFormError("Role name is required"); return; }
        setSaving(true); setFormError("");
        try {
            if (modal === "create") {
                await ManagementAPI.createAdminRole(formName.trim(), formDesc.trim(), formPerms);
                setMsg("Role created successfully.");
            } else {
                await ManagementAPI.updateAdminRole(editRole.id, formName.trim(), formDesc.trim(), formPerms);
                setMsg("Role updated successfully.");
            }
            setModal(null); load();
        } catch (e) { setFormError(e.message); } finally { setSaving(false); }
    };

    const handleDelete = async (role) => {
        if (role.is_system) return;
        if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
        try {
            await ManagementAPI.deleteAdminRole(role.id);
            setMsg(`Role "${role.name}" deleted.`);
            load();
        } catch (e) { setError(e.message); }
    };

    return (
        <div>
            <div className="mg-page-head">
                <div>
                    <h1 className="mg-h1">Admin Roles</h1>
                    <p className="mg-sub">Define superadmin roles with resource-level permissions.</p>
                </div>
                <div className="mg-head-actions">
                    <button className="mg-btn mg-btn-primary" onClick={openCreate}>+ Create Role</button>
                </div>
            </div>

            {msg   && <Alert type="success" msg={msg} onClose={() => setMsg("")} />}
            {error && <Alert type="error"   msg={error} onClose={() => setError("")} />}

            {loading ? (
                <div className="mg-loading">Loading…</div>
            ) : (
                <div className="mg-card">
                    <div className="mg-table-wrap">
                        <table className="mg-table">
                            <thead>
                                <tr>{["Role", "Description", "Type", "Permissions", "Actions"].map(h => <th key={h}>{h}</th>)}</tr>
                            </thead>
                            <tbody>
                                {roles.length === 0 && <tr><td colSpan={5} className="mg-empty">No admin roles found</td></tr>}
                                {roles.map(role => (
                                    <tr key={role.id}>
                                        <td className="mg-td-strong">
                                            {role.name}
                                            {role.is_system && <span className="mg-tag" style={{ marginLeft: 8 }}>System</span>}
                                        </td>
                                        <td className="mg-td-muted">{role.description || "—"}</td>
                                        <td>{role.is_system ? <span className="mg-badge info">System</span> : <span className="mg-badge neutral">Custom</span>}</td>
                                        <td className="mg-td-muted mg-num">{role.permission_count} resources</td>
                                        <td>
                                            <div className="mg-actions">
                                                <button className="mg-rowbtn" onClick={() => openEdit(role)}>Edit</button>
                                                <button className="mg-rowbtn danger" disabled={role.is_system} onClick={() => handleDelete(role)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {modal && (
                <div className="mg-modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setModal(null); }}>
                    <div className="mg-modal" style={{ width: "min(760px, 96vw)" }}>
                        <div className="mg-modal-head">
                            <h3 className="mg-modal-title">{modal === "create" ? "Create Admin Role" : `Edit: ${editRole?.name}`}</h3>
                            <button className="mg-modal-close" onClick={() => setModal(null)} aria-label="Close">×</button>
                        </div>
                        <div className="mg-modal-body">
                            {formError && <div className="mg-form-error">{formError}</div>}

                            <label className="mg-form-label">Role Name *</label>
                            <input className="mg-input" value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Support Admin" />

                            <label className="mg-form-label">Description</label>
                            <textarea className="mg-textarea" rows={2} value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="What can this admin role do?" />

                            <label className="mg-form-label">Permissions</label>
                            <div className="mg-table-wrap" style={{ border: "1px solid var(--mg-line)", borderRadius: 10 }}>
                                <table className="mg-table mg-perm-table">
                                    <thead>
                                        <tr>
                                            <th>Resource</th>
                                            {ACTIONS.map(a => <th key={a.key} style={{ textAlign: "center" }}>{a.label}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formPerms.map(perm => (
                                            <tr key={perm.resource}>
                                                <td className="mg-td-strong">{RESOURCES.find(r => r.key === perm.resource)?.label}</td>
                                                {ACTIONS.map(a => {
                                                    const disabled = ORGS_ONLY_ACTIONS.has(a.key) && perm.resource !== "organizations";
                                                    return (
                                                        <td key={a.key} style={{ textAlign: "center" }}>
                                                            <input type="checkbox" checked={perm[a.key]} disabled={disabled}
                                                                onChange={() => !disabled && togglePerm(perm.resource, a.key)}
                                                                style={{ width: 15, height: 15, accentColor: "var(--mg-accent)", cursor: disabled ? "not-allowed" : "pointer" }} />
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="mg-modal-foot">
                            <button className="mg-btn mg-btn-ghost" onClick={() => setModal(null)} disabled={saving}>Cancel</button>
                            <button className="mg-btn mg-btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? "Saving…" : modal === "create" ? "Create Role" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
