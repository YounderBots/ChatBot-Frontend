import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagementAPI from "./managementAPI";

export default function AdminUsersPage() {
    const navigate  = useNavigate();
    const saUser    = JSON.parse(sessionStorage.getItem("sa_user") || "{}");

    const [admins, setAdmins]   = useState([]);
    const [roles, setRoles]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState("");
    const [msg, setMsg]         = useState("");

    // Invite modal
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
        } catch (e) {
            setError(e.message);
        }
    };

    const handleToggleStatus = async (admin) => {
        if (admin.id === saUser.id) return;
        const action = admin.is_active ? "Deactivate" : "Activate";
        if (!confirm(`${action} admin "${admin.email}"?`)) return;
        try {
            await ManagementAPI.toggleAdminStatus(admin.id, !admin.is_active);
            setMsg(`Admin ${action.toLowerCase()}d.`);
            setAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, is_active: !a.is_active } : a));
        } catch (e) {
            setError(e.message);
        }
    };

    const handleInvite = async () => {
        if (!invEmail.trim() || !invPassword.trim()) { setInvError("Email and password are required."); return; }
        setInvSaving(true);
        setInvError("");
        try {
            const created = await ManagementAPI.inviteSuperAdmin(invEmail.trim(), invPassword.trim(), invName.trim(), invRoleId ? Number(invRoleId) : undefined);
            if (invRoleId && created.id) {
                await ManagementAPI.assignAdminRole(created.id, Number(invRoleId));
            }
            setMsg(`Admin ${invEmail} invited.`);
            setInviteModal(false);
            setInvEmail(""); setInvPassword(""); setInvName(""); setInvRoleId("");
            load();
        } catch (e) {
            setInvError(e.message);
        } finally {
            setInvSaving(false);
        }
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Admin Users</h2>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
                        Manage superadmin accounts and assign roles.
                    </p>
                </div>
                <button onClick={() => { setInviteModal(true); setInvError(""); }} style={primaryBtnStyle}>
                    + Invite Admin
                </button>
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
                                {["Email", "Full Name", "Role", "Status", "Last Login", "Actions"].map(h => (
                                    <th key={h} style={thStyle}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {admins.length === 0 && (
                                <tr><td colSpan={6} style={{ ...tdStyle, color: "#64748b", textAlign: "center", padding: "2rem" }}>No admins found</td></tr>
                            )}
                            {admins.map(admin => {
                                const isSelf = admin.id === saUser.id;
                                return (
                                    <tr key={admin.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                                        <td style={{ ...tdStyle, fontWeight: 500 }}>
                                            {admin.email}
                                            {isSelf && <span style={{ marginLeft: 6, fontSize: 10, color: "#60a5fa" }}>(you)</span>}
                                        </td>
                                        <td style={{ ...tdStyle, color: "#64748b" }}>{admin.full_name || "—"}</td>
                                        <td style={tdStyle}>
                                            <select
                                                value={admin.admin_role_id ?? ""}
                                                onChange={e => handleRoleChange(admin.id, e.target.value || null)}
                                                style={selectStyle}
                                            >
                                                <option value="">— No role —</option>
                                                {roles.map(r => (
                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td style={tdStyle}>
                                            <StatusBadge active={admin.is_active} />
                                        </td>
                                        <td style={{ ...tdStyle, color: "#64748b" }}>
                                            {admin.last_login_at ? new Date(admin.last_login_at).toLocaleDateString() : "Never"}
                                        </td>
                                        <td style={tdStyle}>
                                            <button
                                                onClick={() => handleToggleStatus(admin)}
                                                disabled={isSelf}
                                                style={{
                                                    ...toggleBtnStyle(admin.is_active),
                                                    opacity: isSelf ? 0.4 : 1,
                                                    cursor: isSelf ? "not-allowed" : "pointer",
                                                }}
                                            >
                                                {admin.is_active ? "Deactivate" : "Activate"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Invite Modal */}
            {inviteModal && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h3 style={{ margin: 0, fontSize: 16 }}>Invite Superadmin</h3>
                            <button onClick={() => setInviteModal(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18 }}>×</button>
                        </div>

                        {invError && <div style={{ color: "#ef4444", marginBottom: 12, fontSize: 13 }}>{invError}</div>}

                        <label style={labelStyle}>Email *</label>
                        <input type="email" value={invEmail} onChange={e => setInvEmail(e.target.value)} placeholder="admin@example.com" style={inputStyle} />

                        <label style={labelStyle}>Password *</label>
                        <input type="password" value={invPassword} onChange={e => setInvPassword(e.target.value)} placeholder="Min. 8 characters" style={inputStyle} />

                        <label style={labelStyle}>Full Name</label>
                        <input value={invName} onChange={e => setInvName(e.target.value)} placeholder="Optional" style={inputStyle} />

                        <label style={labelStyle}>Admin Role</label>
                        <select value={invRoleId} onChange={e => setInvRoleId(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }}>
                            <option value="">— No role assigned —</option>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        <p style={{ color: "#64748b", fontSize: 11, margin: "4px 0 16px" }}>
                            Superadmins without a role have full platform access.
                        </p>

                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button onClick={() => setInviteModal(false)} style={cancelBtnStyle} disabled={invSaving}>Cancel</button>
                            <button onClick={handleInvite} style={primaryBtnStyle} disabled={invSaving}>
                                {invSaving ? "Inviting…" : "Send Invite"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const StatusBadge = ({ active }) => (
    <span style={{
        color: active ? "#22c55e" : "#ef4444",
        background: active ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
        padding: "2px 8px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
    }}>
        {active ? "Active" : "Inactive"}
    </span>
);

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

const toggleBtnStyle = (active) => ({
    padding: "3px 10px",
    borderRadius: 5,
    border: `1px solid ${active ? "#ef4444" : "#22c55e"}`,
    background: "transparent",
    color: active ? "#ef4444" : "#22c55e",
    fontSize: 12,
});

const cardStyle      = { background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" };
const thStyle        = { padding: "9px 14px", textAlign: "left", color: "#64748b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" };
const tdStyle        = { padding: "11px 14px", fontSize: 13 };
const labelStyle     = { display: "block", color: "#64748b", fontSize: 12, marginBottom: 4, fontWeight: 500 };
const inputStyle     = { width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#0f172a", fontSize: 13, marginBottom: 12, boxSizing: "border-box" };
const selectStyle    = { padding: "5px 8px", borderRadius: 5, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#0f172a", fontSize: 12 };
const overlayStyle   = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 };
const modalStyle     = { background: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "1.5rem", width: "min(480px,95vw)", maxHeight: "90vh", overflowY: "auto" };
const primaryBtnStyle  = { padding: "8px 18px", borderRadius: 7, border: "none", background: "#3b82f6", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 };
const cancelBtnStyle   = { padding: "8px 18px", borderRadius: 7, border: "1px solid #e2e8f0", background: "transparent", color: "#64748b", cursor: "pointer", fontSize: 13 };
