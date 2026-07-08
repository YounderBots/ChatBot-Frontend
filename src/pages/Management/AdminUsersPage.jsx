import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagementAPI from "./managementAPI";
import { Alert, Modal, TextField, SelectField } from "./crudkit";

const emptyForm = { email: "", password: "", full_name: "", role_id: "" };

export default function AdminUsersPage() {
    const navigate  = useNavigate();
    const saUser    = JSON.parse(sessionStorage.getItem("sa_user") || "{}");

    const [admins, setAdmins]   = useState([]);
    const [roles, setRoles]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState("");
    const [msg, setMsg]         = useState("");

    const [modal, setModal]     = useState(null);   // null | "create" | "invite"
    const [form, setForm]       = useState(emptyForm);
    const [saving, setSaving]   = useState(false);
    const [formError, setFormError] = useState("");

    const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const load = async () => {
        setLoading(true);
        try {
            const [admData, rolesData] = await Promise.all([
                ManagementAPI.listAdmins(),
                ManagementAPI.listAdminRoles(),
            ]);
            setAdmins(admData.admins);
            setRoles(rolesData.roles);
        } catch (e) {
            if (e.message?.includes("401")) navigate("/management/login");
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleRoleChange = async (adminId, newRoleId) => {
        try {
            await ManagementAPI.assignAdminRole(adminId, newRoleId ? Number(newRoleId) : null);
            setMsg("Role updated.");
            setAdmins(prev => prev.map(a =>
                a.id === adminId
                    ? { ...a, admin_role_id: newRoleId ? Number(newRoleId) : null, admin_role_name: roles.find(r => r.id === Number(newRoleId))?.name || null }
                    : a
            ));
        } catch (e) { setError(e.message); }
    };

    const handleToggleStatus = async (admin) => {
        if (admin.id === saUser.id) return;
        const action = admin.is_active ? "Deactivate" : "Activate";
        if (!confirm(`${action} admin "${admin.email}"?`)) return;
        try {
            await ManagementAPI.toggleAdminStatus(admin.id, !admin.is_active);
            setMsg(`Admin ${action.toLowerCase()}d.`);
            setAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, is_active: !a.is_active } : a));
        } catch (e) { setError(e.message); }
    };

    const openModal = (kind) => { setForm(emptyForm); setFormError(""); setModal(kind); };

    const handleSubmit = async () => {
        if (!form.email.trim()) { setFormError("Email is required."); return; }
        if (modal === "create" && !form.password.trim()) { setFormError("Password is required."); return; }
        setSaving(true); setFormError("");
        try {
            const roleId = form.role_id ? Number(form.role_id) : null;
            if (modal === "create") {
                await ManagementAPI.createAdmin({
                    email: form.email.trim(), password: form.password,
                    full_name: form.full_name.trim(), admin_role_id: roleId,
                });
                setMsg(`Admin ${form.email} created.`);
            } else {
                await ManagementAPI.inviteSuperAdmin(form.email.trim(), "", form.full_name.trim(), roleId || undefined);
                setMsg(`Invite sent to ${form.email}.`);
            }
            setModal(null);
            load();
        } catch (e) { setFormError(e.message); } finally { setSaving(false); }
    };

    return (
        <div>
            <div className="mg-page-head">
                <div>
                    <h1 className="mg-h1">Admin Users</h1>
                    <p className="mg-sub">Manage superadmin accounts and assign platform roles.</p>
                </div>
                <div className="mg-head-actions">
                    <button className="mg-btn mg-btn-ghost" onClick={() => openModal("invite")}>Invite</button>
                    <button className="mg-btn mg-btn-primary" onClick={() => openModal("create")}>+ Create Admin</button>
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
                                <tr>{["Email", "Full Name", "Role", "Status", "Last Login", "Actions"].map(h => <th key={h}>{h}</th>)}</tr>
                            </thead>
                            <tbody>
                                {admins.length === 0 && <tr><td colSpan={6} className="mg-empty">No admins found</td></tr>}
                                {admins.map(admin => {
                                    const isSelf = admin.id === saUser.id;
                                    return (
                                        <tr key={admin.id}>
                                            <td className="mg-td-strong">
                                                {admin.email}
                                                {isSelf && <span className="mg-tag" style={{ marginLeft: 6 }}>You</span>}
                                            </td>
                                            <td className="mg-td-muted">{admin.full_name || "—"}</td>
                                            <td>
                                                <select className="mg-select mg-inline" style={{ minWidth: 150, fontSize: 12.5, padding: "6px 28px 6px 9px" }}
                                                    value={admin.admin_role_id ?? ""}
                                                    onChange={e => handleRoleChange(admin.id, e.target.value || null)}>
                                                    <option value="">— No role (full access) —</option>
                                                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                                </select>
                                            </td>
                                            <td><span className={`mg-badge ${admin.is_active ? "ok" : "danger"}`}>{admin.is_active ? "Active" : "Inactive"}</span></td>
                                            <td className="mg-td-muted mg-num">{admin.last_login_at ? new Date(admin.last_login_at).toLocaleDateString() : "Never"}</td>
                                            <td>
                                                <button className={`mg-rowbtn ${admin.is_active ? "danger" : "ok"}`} disabled={isSelf} onClick={() => handleToggleStatus(admin)}>
                                                    {admin.is_active ? "Deactivate" : "Activate"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {modal && (
                <Modal
                    title={modal === "create" ? "Create Admin" : "Invite Admin"}
                    onClose={() => setModal(null)} onSave={handleSubmit} saving={saving}
                    error={formError} saveLabel={modal === "create" ? "Create Admin" : "Send Invite"}
                >
                    <TextField label="Email *" type="email" value={form.email} onChange={v => setF("email", v)} placeholder="admin@example.com" />
                    {modal === "create" && (
                        <TextField label="Password *" type="password" value={form.password} onChange={v => setF("password", v)} placeholder="Min 8 chars, letter + digit" />
                    )}
                    <TextField label="Full Name" value={form.full_name} onChange={v => setF("full_name", v)} placeholder="Optional" />
                    <SelectField
                        label="Admin Role"
                        value={form.role_id}
                        onChange={v => setF("role_id", v)}
                        options={[{ value: "", label: "— No role (full access) —" }, ...roles.map(r => ({ value: String(r.id), label: r.name }))]}
                    />
                    {modal === "create"
                        ? <p className="mg-note">Created active — the admin can sign in immediately.</p>
                        : <p className="mg-note">An email link will be sent for them to set a password and activate. No role = full platform access.</p>}
                </Modal>
            )}
        </div>
    );
}
