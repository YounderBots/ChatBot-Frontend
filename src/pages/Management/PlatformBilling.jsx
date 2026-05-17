import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagementAPI from "./managementAPI";

const STATUS_COLORS = {
    ACTIVE:    { color: "#22c55e", bg: "rgba(34,197,94,0.1)"  },
    CANCELLED: { color: "#ef4444", bg: "rgba(239,68,68,0.1)"  },
    EXPIRED:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    TRIAL:     { color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
};

export default function PlatformBilling() {
    const navigate = useNavigate();
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState("");
    const [search,  setSearch]  = useState("");

    useEffect(() => {
        setLoading(true);
        ManagementAPI.platformBilling()
            .then(d => { setData(d); setLoading(false); })
            .catch(err => {
                if (err.message?.includes("401")) navigate("/management/login");
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const filtered = data?.subscriptions?.filter(s =>
        !search || String(s.organization_id).includes(search) || (s.plan || "").toLowerCase().includes(search.toLowerCase())
    ) || [];

    const statusCounts = (data?.subscriptions || []).reduce((acc, s) => {
        acc[s.status] = (acc[s.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div>
            {error && <div style={{ color: "#ef4444", marginBottom: 16, fontSize: 13 }}>{error}</div>}

            {!loading && data && (
                <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
                        <StatCard label="Total Subscriptions" value={data.total}                    accent="#60a5fa" />
                        <StatCard label="Active"              value={statusCounts.ACTIVE    || 0}   accent="#22c55e" />
                        <StatCard label="Trial"               value={statusCounts.TRIAL     || 0}   accent="#a78bfa" />
                        <StatCard label="Cancelled"           value={statusCounts.CANCELLED || 0}   accent="#ef4444" />
                    </div>

                    <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
                        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Subscriptions</h2>
                        <input
                            placeholder="Filter by org ID or plan…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ ...inputStyle, width: 220 }}
                        />
                        {search && (
                            <button onClick={() => setSearch("")} style={clearBtnStyle}>Clear</button>
                        )}
                        <span style={{ color: "#64748b", fontSize: 12, marginLeft: "auto" }}>
                            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                        </span>
                    </div>

                    <div style={{ background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#f8fafc" }}>
                                    {["ID", "Org ID", "Plan", "Billing Cycle", "Status", "Period End"].map(h => (
                                        <th key={h} style={thStyle}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr><td colSpan={6} style={{ ...tdStyle, color: "#64748b", textAlign: "center", padding: "2rem" }}>No subscriptions found</td></tr>
                                )}
                                {filtered.map(s => {
                                    const sc = STATUS_COLORS[s.status] || { color: "#64748b", bg: "rgba(100,116,139,0.1)" };
                                    return (
                                        <tr key={s.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                                            <td style={tdStyle}>{s.id}</td>
                                            <td style={tdStyle}>
                                                <button
                                                    onClick={() => navigate(`/management/org/${s.organization_id}`)}
                                                    style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", padding: 0, fontSize: 13 }}
                                                >
                                                    {s.organization_id}
                                                </button>
                                            </td>
                                            <td style={{ ...tdStyle, fontWeight: 500 }}>{s.plan || "—"}</td>
                                            <td style={{ ...tdStyle, color: "#64748b" }}>{s.billing_cycle || "—"}</td>
                                            <td style={tdStyle}>
                                                <span style={{ color: sc.color, background: sc.bg, padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                                                    {s.status}
                                                </span>
                                            </td>
                                            <td style={{ ...tdStyle, color: "#64748b", whiteSpace: "nowrap" }}>
                                                {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {loading && <div style={{ color: "#64748b", padding: "2rem", textAlign: "center" }}>Loading…</div>}
        </div>
    );
}

const StatCard = ({ label, value, accent }) => (
    <div style={{ background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", padding: "1.1rem 1.25rem", borderTop: `3px solid ${accent}` }}>
        <div style={{ color: "#64748b", fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a" }}>{value}</div>
    </div>
);

const inputStyle    = { padding: "7px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#ffffff", color: "#0f172a", fontSize: 13 };
const clearBtnStyle = { padding: "6px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "none", color: "#64748b", cursor: "pointer", fontSize: 12 };
const thStyle       = { padding: "10px 14px", textAlign: "left", color: "#64748b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" };
const tdStyle       = { padding: "11px 14px", fontSize: 13, color: "#0f172a" };
