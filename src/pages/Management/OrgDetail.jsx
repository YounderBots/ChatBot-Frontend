import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ManagementAPI from "./managementAPI";

const STATUS_COLORS = {
    ACTIVE:    "#22c55e",
    SUSPENDED: "#ef4444",
    DELETED:   "#64748b",
};

const TABS = ["Overview", "Users", "Roles", "Usage"];

export default function OrgDetail() {
    const { orgId } = useParams();
    const navigate  = useNavigate();
    const [org, setOrg]         = useState(null);
    const [tab, setTab]         = useState("Overview");
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState("");
    const [actionMsg, setActionMsg] = useState("");

    // Tab-specific data
    const [users, setUsers]   = useState(null);
    const [roles, setRoles]   = useState(null);
    const [stats, setStats]   = useState(null);
    const [tabLoading, setTabLoading] = useState(false);
    const [usersPage, setUsersPage]   = useState(1);

    useEffect(() => {
        ManagementAPI.getOrg(orgId)
            .then(data => { setOrg(data); setLoading(false); })
            .catch(err => {
                if (err.message?.includes("401")) navigate("/management/login");
                setError(err.message);
                setLoading(false);
            });
    }, [orgId]);

    useEffect(() => {
        if (!org) return;
        if (tab === "Users")  loadUsers();
        if (tab === "Roles")  loadRoles();
        if (tab === "Usage")  loadStats();
    }, [tab, org]);

    useEffect(() => {
        if (tab === "Users") loadUsers();
    }, [usersPage]);

    const loadUsers = async () => {
        setTabLoading(true);
        try { setUsers(await ManagementAPI.getOrgUsers(orgId, usersPage)); }
        catch (e) { setError(e.message); }
        finally { setTabLoading(false); }
    };

    const loadRoles = async () => {
        setTabLoading(true);
        try { setRoles(await ManagementAPI.getOrgRoles(orgId)); }
        catch (e) { setError(e.message); }
        finally { setTabLoading(false); }
    };

    const loadStats = async () => {
        setTabLoading(true);
        try { setStats(await ManagementAPI.getOrgStats(orgId)); }
        catch (e) { setError(e.message); }
        finally { setTabLoading(false); }
    };

    const handleSuspend = async () => {
        if (!confirm("Suspend this organization? All logins will be blocked.")) return;
        await ManagementAPI.suspendOrg(orgId);
        setActionMsg("Organization suspended.");
        setOrg(o => ({ ...o, status: "SUSPENDED" }));
    };

    const handleActivate = async () => {
        await ManagementAPI.activateOrg(orgId);
        setActionMsg("Organization activated.");
        setOrg(o => ({ ...o, status: "ACTIVE" }));
    };

    if (loading) return <div style={{ color: "#64748b", padding: "2rem" }}>Loading…</div>;
    if (error && !org) return <div style={{ color: "#ef4444", padding: "2rem" }}>{error}</div>;

    return (
        <div>
            {/* Org name heading */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{org?.name}</h2>
                <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20,
                    color: STATUS_COLORS[org?.status] || "#64748b",
                    background: `${STATUS_COLORS[org?.status] || "#64748b"}18`,
                }}>
                    {org?.status}
                </span>
            </div>

            {actionMsg && (
                <div style={{ background: "#ffffff", border: "1px solid #22c55e", borderRadius: 8, padding: "10px 14px", marginBottom: 14, color: "#22c55e", fontSize: 13 }}>
                    {actionMsg}
                </div>
            )}

            {/* Tab bar */}
            <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid #e2e8f0" }}>
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        background: "none",
                        border: "none",
                        borderBottom: tab === t ? "2px solid #60a5fa" : "2px solid transparent",
                        color: tab === t ? "#60a5fa" : "#64748b",
                        cursor: "pointer",
                        padding: "8px 16px",
                        fontSize: 13,
                        fontWeight: tab === t ? 600 : 400,
                        marginBottom: -1,
                    }}>
                        {t}
                    </button>
                ))}
            </div>

            {/* ── Overview Tab ── */}
            {tab === "Overview" && (
                <div>
                    <div style={cardStyle}>
                        <h3 style={cardTitleStyle}>Organization Details</h3>
                        <FieldGrid>
                            <Field label="ID"          value={org.id} />
                            <Field label="Name"        value={org.name} />
                            <Field label="Slug"        value={org.slug} />
                            <Field label="Owner Email" value={org.owner_email} />
                            <Field label="Status"      value={
                                <span style={{ color: STATUS_COLORS[org.status] || "#64748b", fontWeight: 600 }}>
                                    {org.status}
                                </span>
                            } />
                            <Field label="Plan"        value={org.plan_id || "—"} />
                            <Field label="Members"     value={org.member_count} />
                            <Field label="Trial Ends"  value={org.trial_ends_at ? new Date(org.trial_ends_at).toLocaleDateString() : "—"} />
                            <Field label="Created"     value={org.created_at ? new Date(org.created_at).toLocaleDateString() : "—"} />
                            <Field label="Industry"    value={org.industry || "—"} />
                            <Field label="Timezone"    value={org.timezone || "—"} />
                            <Field label="Website"     value={org.website || "—"} />
                        </FieldGrid>
                    </div>

                    {org.subscription && (
                        <div style={cardStyle}>
                            <h3 style={cardTitleStyle}>Subscription</h3>
                            <FieldGrid>
                                <Field label="Plan Status"    value={org.subscription.status} />
                                <Field label="Billing Cycle"  value={org.subscription.billing_cycle} />
                            </FieldGrid>
                        </div>
                    )}

                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                        {org.status === "ACTIVE"
                            ? <ActionBtn onClick={handleSuspend} variant="danger">Suspend Organization</ActionBtn>
                            : <ActionBtn onClick={handleActivate} variant="success">Activate Organization</ActionBtn>
                        }
                        <ActionBtn onClick={() => navigate(`/management/audit-logs?org_id=${orgId}`)} variant="neutral">
                            View Audit Logs
                        </ActionBtn>
                    </div>
                </div>
            )}

            {/* ── Users Tab ── */}
            {tab === "Users" && (
                <div style={cardStyle}>
                    <h3 style={cardTitleStyle}>Org Users</h3>
                    {tabLoading ? <Spinner /> : users && (
                        <>
                            <table style={tableStyle}>
                                <thead>
                                    <tr style={{ background: "#f8fafc" }}>
                                        {["ID", "Name", "Email", "Role", "Status", "Joined"].map(h => (
                                            <th key={h} style={thStyle}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.users.length === 0 && (
                                        <tr><td colSpan={6} style={{ ...tdStyle, color: "#64748b", textAlign: "center" }}>No users</td></tr>
                                    )}
                                    {users.users.map(u => (
                                        <tr key={u.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                                            <td style={tdStyle}>{u.id}</td>
                                            <td style={tdStyle}>{u.fullname}</td>
                                            <td style={{ ...tdStyle, color: "#64748b" }}>{u.email}</td>
                                            <td style={{ ...tdStyle, color: "#64748b" }}>{u.role_name || u.role_id || "—"}</td>
                                            <td style={tdStyle}>
                                                <StatusBadge status={u.status} />
                                            </td>
                                            <td style={{ ...tdStyle, color: "#64748b" }}>
                                                {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                                <button onClick={() => setUsersPage(p => Math.max(1, p - 1))} disabled={usersPage === 1} style={pageBtnStyle}>← Prev</button>
                                <span style={{ color: "#64748b", fontSize: 13, lineHeight: "30px" }}>
                                    Page {usersPage} · {users.total} total
                                </span>
                                <button onClick={() => setUsersPage(p => p + 1)} disabled={users.users.length < 20} style={pageBtnStyle}>Next →</button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ── Roles Tab ── */}
            {tab === "Roles" && (
                <div style={cardStyle}>
                    <h3 style={cardTitleStyle}>Org Roles</h3>
                    {tabLoading ? <Spinner /> : roles && (
                        <table style={tableStyle}>
                            <thead>
                                <tr style={{ background: "#f8fafc" }}>
                                    {["ID", "Name", "Scope", "Permissions", "Status"].map(h => (
                                        <th key={h} style={thStyle}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {roles.roles.length === 0 && (
                                    <tr><td colSpan={5} style={{ ...tdStyle, color: "#64748b", textAlign: "center" }}>No roles</td></tr>
                                )}
                                {roles.roles.map(r => (
                                    <tr key={r.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                                        <td style={tdStyle}>{r.id}</td>
                                        <td style={{ ...tdStyle, fontWeight: 500 }}>{r.name}</td>
                                        <td style={{ ...tdStyle, color: "#64748b" }}>
                                            {r.organization_id ? "Org-specific" : "System-wide"}
                                        </td>
                                        <td style={{ ...tdStyle, color: "#64748b" }}>{r.permission_count} menus</td>
                                        <td style={tdStyle}><StatusBadge status={r.status?.toUpperCase() === "ACTIVE" ? "ACTIVE" : r.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ── Usage Tab ── */}
            {tab === "Usage" && (
                <div>
                    {tabLoading ? <Spinner /> : stats && (
                        <>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
                                <MiniStat label="Members"            value={stats.member_count} accent="#60a5fa" />
                                <MiniStat label="Conversations (30d)" value={stats.total_conversations.toLocaleString()} accent="#a78bfa" />
                                <MiniStat label="Messages (30d)"      value={stats.total_messages.toLocaleString()} accent="#34d399" />
                            </div>
                            <div style={cardStyle}>
                                <h3 style={cardTitleStyle}>Daily Usage — Last 30 Days</h3>
                                <table style={tableStyle}>
                                    <thead>
                                        <tr style={{ background: "#f8fafc" }}>
                                            {["Date", "Conversations", "Messages", "API Calls"].map(h => (
                                                <th key={h} style={thStyle}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.daily_records.length === 0 && (
                                            <tr><td colSpan={4} style={{ ...tdStyle, color: "#64748b", textAlign: "center" }}>No usage data</td></tr>
                                        )}
                                        {stats.daily_records.map((r, i) => (
                                            <tr key={i} style={{ borderTop: "1px solid #e2e8f0" }}>
                                                <td style={tdStyle}>{r.date}</td>
                                                <td style={tdStyle}>{r.conversations.toLocaleString()}</td>
                                                <td style={tdStyle}>{r.messages.toLocaleString()}</td>
                                                <td style={{ ...tdStyle, color: "#64748b" }}>{r.api_calls.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────

const FieldGrid = ({ children }) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>{children}</div>
);

const Field = ({ label, value }) => (
    <div>
        <div style={{ color: "#64748b", fontSize: 11, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
        <div style={{ fontSize: 13 }}>{value}</div>
    </div>
);

const StatusBadge = ({ status }) => {
    const color = STATUS_COLORS[status] || "#64748b";
    return (
        <span style={{ color, background: `${color}18`, padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
            {status}
        </span>
    );
};

const ActionBtn = ({ onClick, variant, children }) => {
    const variants = {
        danger:  { border: "#ef4444", color: "#ef4444" },
        success: { border: "#22c55e", color: "#22c55e" },
        neutral: { border: "#e2e8f0", color: "#64748b" },
    };
    const v = variants[variant] || variants.neutral;
    return (
        <button onClick={onClick} style={{
            padding: "8px 18px",
            borderRadius: 8,
            border: `1px solid ${v.border}`,
            background: "transparent",
            color: v.color,
            cursor: "pointer",
            fontWeight: 500,
            fontSize: 13,
        }}>
            {children}
        </button>
    );
};

const MiniStat = ({ label, value, accent }) => (
    <div style={{ background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", padding: "1rem 1.25rem", borderTop: `3px solid ${accent}` }}>
        <div style={{ color: "#64748b", fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
);

const Spinner = () => (
    <div style={{ color: "#64748b", padding: "2rem", textAlign: "center" }}>Loading…</div>
);

const cardStyle      = { background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", padding: "1.25rem", marginBottom: 16 };
const cardTitleStyle = { margin: "0 0 1rem", fontSize: 15, fontWeight: 600 };
const tableStyle     = { width: "100%", borderCollapse: "collapse" };
const thStyle        = { padding: "9px 14px", textAlign: "left", color: "#64748b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" };
const tdStyle        = { padding: "10px 14px", fontSize: 13 };
const pageBtnStyle   = { padding: "4px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#0f172a", cursor: "pointer", fontSize: 12 };
