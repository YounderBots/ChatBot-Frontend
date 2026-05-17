import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagementAPI from "./managementAPI";

const STATUS_COLORS = {
    ACTIVE:    { color: "#22c55e", bg: "rgba(34,197,94,0.1)"  },
    SUSPENDED: { color: "#ef4444", bg: "rgba(239,68,68,0.1)"  },
    DELETED:   { color: "#64748b", bg: "rgba(100,116,139,0.1)" },
};

export default function ManagementDashboard() {
    const navigate = useNavigate();
    const [orgs,           setOrgs]          = useState([]);
    const [total,          setTotal]         = useState(0);
    const [activeCount,    setActiveCount]   = useState(0);
    const [suspendedCount, setSuspendedCount] = useState(0);
    const [usage,          setUsage]         = useState(null);
    const [page,           setPage]          = useState(1);
    const [statusFilter,   setStatusFilter]  = useState("");
    const [searchQuery,    setSearchQuery]   = useState("");
    const [loading,        setLoading]       = useState(true);
    const [error,          setError]         = useState("");

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const [orgData, usageData] = await Promise.all([
                ManagementAPI.listOrgs(page, statusFilter, searchQuery),
                ManagementAPI.platformUsage(),
            ]);
            setOrgs(orgData.organizations);
            setTotal(orgData.total);
            setActiveCount(orgData.active_count ?? 0);
            setSuspendedCount(orgData.suspended_count ?? 0);
            setUsage(usageData);
        } catch (err) {
            if (err.message?.includes("401") || err.message?.includes("superadmin")) {
                navigate("/management/login");
            }
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [page, statusFilter, searchQuery]);

    const handleSuspend = async (orgId) => {
        if (!confirm("Suspend this organization? All logins will be blocked.")) return;
        await ManagementAPI.suspendOrg(orgId);
        load();
    };

    const handleActivate = async (orgId) => {
        await ManagementAPI.activateOrg(orgId);
        load();
    };

    return (
        <div>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
                <StatCard label="Total Organizations" value={total} accent="#60a5fa" />
                <StatCard label="Active"              value={activeCount} accent="#22c55e" />
                <StatCard label="Suspended"           value={suspendedCount} accent="#ef4444" />
                <StatCard
                    label="Total Conversations"
                    value={usage ? usage.total_conversations.toLocaleString() : "—"}
                    accent="#a78bfa"
                />
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, marginRight: 4 }}>Organizations</h2>
                <input
                    type="text"
                    placeholder="Search by name or email…"
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                    style={{ ...selectStyle, width: 220 }}
                />
                <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    style={selectStyle}
                >
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                </select>
                {(searchQuery || statusFilter) && (
                    <button
                        onClick={() => { setSearchQuery(""); setStatusFilter(""); setPage(1); }}
                        style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "none", color: "#64748b", cursor: "pointer", fontSize: 12 }}
                    >
                        Clear
                    </button>
                )}
            </div>

            {error && <div style={{ color: "#ef4444", marginBottom: 14, fontSize: 13 }}>{error}</div>}

            {loading ? (
                <div style={{ color: "#64748b", padding: "2rem 0", textAlign: "center" }}>Loading…</div>
            ) : (
                <div style={{ background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f8fafc" }}>
                                {["ID", "Name", "Owner", "Plan", "Members", "Status", "Created", "Actions"].map(h => (
                                    <th key={h} style={thStyle}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {orgs.length === 0 && (
                                <tr>
                                    <td colSpan={8} style={{ ...tdStyle, color: "#64748b", textAlign: "center", padding: "2rem" }}>
                                        No organizations found
                                    </td>
                                </tr>
                            )}
                            {orgs.map(org => {
                                const sc = STATUS_COLORS[org.status] || STATUS_COLORS.DELETED;
                                return (
                                    <tr key={org.id} style={{ borderTop: "1px solid #e2e8f0" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <td style={tdStyle}>{org.id}</td>
                                        <td style={tdStyle}>
                                            <button
                                                onClick={() => navigate(`/management/org/${org.id}`)}
                                                style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontWeight: 500, padding: 0, fontSize: 13 }}>
                                                {org.name}
                                            </button>
                                        </td>
                                        <td style={{ ...tdStyle, color: "#64748b" }}>{org.owner_email}</td>
                                        <td style={{ ...tdStyle, color: "#64748b" }}>{org.plan_id || "—"}</td>
                                        <td style={{ ...tdStyle, color: "#64748b" }}>{org.member_count ?? "—"}</td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                color: sc.color,
                                                background: sc.bg,
                                                padding: "2px 8px",
                                                borderRadius: 20,
                                                fontSize: 11,
                                                fontWeight: 600,
                                            }}>
                                                {org.status}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, color: "#64748b" }}>
                                            {org.created_at ? new Date(org.created_at).toLocaleDateString() : "—"}
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: "flex", gap: 6 }}>
                                                <button
                                                    onClick={() => navigate(`/management/org/${org.id}`)}
                                                    style={viewBtnStyle}
                                                >
                                                    View
                                                </button>
                                                {org.status === "ACTIVE"
                                                    ? <button onClick={() => handleSuspend(org.id)} style={dangerBtnStyle}>Suspend</button>
                                                    : <button onClick={() => handleActivate(org.id)} style={successBtnStyle}>Activate</button>
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center", justifyContent: "flex-end" }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={pageBtnStyle}>← Prev</button>
                <span style={{ color: "#64748b", fontSize: 13 }}>Page {page} of {Math.max(1, Math.ceil(total / 20))}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={orgs.length < 20} style={pageBtnStyle}>Next →</button>
            </div>
        </div>
    );
}

const StatCard = ({ label, value, accent = "#60a5fa" }) => (
    <div style={{
        background: "#ffffff",
        borderRadius: 10,
        border: "1px solid #e2e8f0",
        padding: "1.1rem 1.25rem",
        borderTop: `3px solid ${accent}`,
    }}>
        <div style={{ color: "#64748b", fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a" }}>{value}</div>
    </div>
);

const selectStyle = { padding: "6px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#ffffff", color: "#0f172a", fontSize: 13 };
const thStyle     = { padding: "10px 14px", textAlign: "left", color: "#64748b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" };
const tdStyle     = { padding: "11px 14px", fontSize: 13 };
const btnBase     = { padding: "3px 10px", borderRadius: 5, cursor: "pointer", fontSize: 12, fontWeight: 500 };
const dangerBtnStyle  = { ...btnBase, border: "1px solid #ef4444", background: "transparent", color: "#ef4444" };
const successBtnStyle = { ...btnBase, border: "1px solid #22c55e", background: "transparent", color: "#22c55e" };
const viewBtnStyle    = { ...btnBase, border: "1px solid #e2e8f0", background: "transparent", color: "#64748b" };
const pageBtnStyle    = { padding: "5px 14px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#ffffff", color: "#0f172a", cursor: "pointer", fontSize: 13 };
