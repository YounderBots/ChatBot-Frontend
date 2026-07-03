import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagementAPI from "./managementAPI";
import { Alert } from "./crudkit";

export default function AdminUsersPage() {
    const navigate  = useNavigate();
    const saUser    = JSON.parse(sessionStorage.getItem("sa_user") || "{}");

    const [admins, setAdmins]   = useState([]);
    const [roles, setRoles]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState("");
    const [msg, setMsg]         = useState("");

    const [inviteModal, setInviteModal] = useState(false);
    const [invEmail, setInvEmail]       = useState("");
    const [invPassword, setInvPassword] = useState("");
    const [invName, setInvName]         = useState("");
    const [invRoleId, setInvRoleId]     = useState("");
    const [invSaving, setInvSaving]     = useState(false);
    const [invError, setInvError]       = useState("");

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

    const handleInvite = async () => {
        if (!invEmail.trim() || !invPassword.trim()) { setInvError("Email and password are required."); return; }
        setInvSaving(true); setInvError("");
        try {
            const created = await ManagementAPI.inviteSuperAdmin(invEmail.trim(), invPassword.trim(), invName.trim(), invRoleId ? Number(invRoleId) : undefined);
            if (invRoleId && created.id) await ManagementAPI.assignAdminRole(created.id, Number(invRoleId));
            setMsg(`Admin ${invEmail} invited.`);
            setInviteModal(false);
            setInvEmail(""); setInvPassword(""); setInvName(""); setInvRoleId("");
            load();
        } catch (e) { setInvError(e.message); } finally { setInvSaving(false); }
    };

    return (
        <div>
            <div className="mg-page-head">
                <div>
                    <h1 className="mg-h1">Admin Users</h1>
                    <p className="mg-sub">Manage superadmin accounts and assign platform roles.</p>
                </div>
                <div className="mg-head-actions">
                    <button className="mg-btn mg-btn-primary" onClick={() => { setInviteModal(true); setInvError(""); }}>+ Invite Admin</button>
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

            {inviteModal && (
                <div className="mg-modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setInviteModal(false); }}>
                    <div className="mg-modal" style={{ width: "min(480px, 96vw)" }}>
                        <div className="mg-modal-head">
                            <h3 className="mg-modal-title">Invite Superadmin</h3>
                            <button className="mg-modal-close" onClick={() => setInviteModal(false)} aria-label="Close">×</button>
                        </div>
                        <div className="mg-modal-body">
                            {invError && <div className="mg-form-error">{invError}</div>}
                            <label className="mg-form-label">Email *</label>
                            <input className="mg-input" type="email" value={invEmail} onChange={e => setInvEmail(e.target.value)} placeholder="admin@example.com" />
                            <label className="mg-form-label">Password *</label>
                            <input className="mg-input" type="password" value={invPassword} onChange={e => setInvPassword(e.target.value)} placeholder="Min. 8 characters" />
                            <label className="mg-form-label">Full Name</label>
                            <input className="mg-input" value={invName} onChange={e => setInvName(e.target.value)} placeholder="Optional" />
                            <label className="mg-form-label">Admin Role</label>
                            <select className="mg-select" value={invRoleId} onChange={e => setInvRoleId(e.target.value)}>
                                <option value="">— No role assigned —</option>
                                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                            <p className="mg-note">Superadmins without a role have full platform access.</p>
                        </div>
                        <div className="mg-modal-foot">
                            <button className="mg-btn mg-btn-ghost" onClick={() => setInviteModal(false)} disabled={invSaving}>Cancel</button>
                            <button className="mg-btn mg-btn-primary" onClick={handleInvite} disabled={invSaving}>{invSaving ? "Inviting…" : "Send Invite"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
