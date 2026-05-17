import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagementAPI from "./managementAPI";

export default function PlatformAnalytics() {
    const navigate = useNavigate();
    const [usage,    setUsage]    = useState(null);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo,   setDateTo]   = useState("");

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const params = {};
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo)   params.date_to   = dateTo;
            const data = await ManagementAPI.platformUsage(params);
            setUsage(data);
        } catch (err) {
            if (err.message?.includes("401")) navigate("/management/login");
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [dateFrom, dateTo]);

    // Group records by org for per-org breakdown
    const orgBreakdown = usage ? Object.values(
        (usage.records || []).reduce((acc, r) => {
            const key = r.organization_id;
            if (!acc[key]) acc[key] = { org_id: key, conversations: 0, messages: 0, api_calls: 0 };
            acc[key].conversations += r.conversations;
            acc[key].messages      += r.messages;
            acc[key].api_calls     += r.api_calls;
            return acc;
        }, {})
    ).sort((a, b) => b.conversations - a.conversations).slice(0, 20) : [];

    return (
        <div>
            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div>
                    <div style={labelStyle}>Date From</div>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ ...inputStyle, width: 150 }} />
                </div>
                <div>
                    <div style={labelStyle}>Date To</div>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ ...inputStyle, width: 150 }} />
                </div>
                {(dateFrom || dateTo) && (
                    <button onClick={() => { setDateFrom(""); setDateTo(""); }} style={clearBtnStyle}>Clear</button>
                )}
            </div>

            {error && <div style={{ color: "#ef4444", marginBottom: 16, fontSize: 13 }}>{error}</div>}

            {loading ? (
                <div style={{ color: "#64748b", padding: "2rem", textAlign: "center" }}>Loading…</div>
            ) : usage && (
                <>
                    {/* Summary cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
                        <StatCard label="Total Conversations" value={usage.total_conversations.toLocaleString()} accent="#60a5fa" />
                        <StatCard label="Total Messages"      value={usage.total_messages.toLocaleString()}      accent="#a78bfa" />
                        <StatCard label="Data Points"         value={(usage.records?.length || 0).toLocaleString()} accent="#34d399" />
                    </div>

                    {/* Per-org breakdown */}
                    <div style={cardStyle}>
                        <h3 style={cardTitleStyle}>Top Organizations by Usage</h3>
                        <div style={{ background: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: "#f8fafc" }}>
                                        {["Org ID", "Conversations", "Messages", "API Calls"].map(h => (
                                            <th key={h} style={thStyle}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {orgBreakdown.length === 0 && (
                                        <tr><td colSpan={4} style={{ ...tdStyle, color: "#64748b", textAlign: "center", padding: "2rem" }}>No usage data</td></tr>
                                    )}
                                    {orgBreakdown.map(row => (
                                        <tr key={row.org_id} style={{ borderTop: "1px solid #e2e8f0" }}>
                                            <td style={tdStyle}>
                                                <button
                                                    onClick={() => navigate(`/management/org/${row.org_id}`)}
                                                    style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", padding: 0, fontSize: 13 }}
                                                >
                                                    {row.org_id}
                                                </button>
                                            </td>
                                            <td style={tdStyle}>{row.conversations.toLocaleString()}</td>
                                            <td style={tdStyle}>{row.messages.toLocaleString()}</td>
                                            <td style={{ ...tdStyle, color: "#64748b" }}>{row.api_calls.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Daily records */}
                    <div style={cardStyle}>
                        <h3 style={cardTitleStyle}>Daily Records</h3>
                        <div style={{ background: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "auto", maxHeight: 400 }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: "#f8fafc" }}>
                                        {["Org ID", "Date", "Conversations", "Messages", "API Calls"].map(h => (
                                            <th key={h} style={{ ...thStyle, position: "sticky", top: 0, background: "#f8fafc" }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(usage.records || []).map((r, i) => (
                                        <tr key={i} style={{ borderTop: "1px solid #e2e8f0" }}>
                                            <td style={tdStyle}>{r.organization_id}</td>
                                            <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{r.date}</td>
                                            <td style={tdStyle}>{r.conversations.toLocaleString()}</td>
                                            <td style={tdStyle}>{r.messages.toLocaleString()}</td>
                                            <td style={{ ...tdStyle, color: "#64748b" }}>{r.api_calls.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

const StatCard = ({ label, value, accent }) => (
    <div style={{ background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", padding: "1.1rem 1.25rem", borderTop: `3px solid ${accent}` }}>
        <div style={{ color: "#64748b", fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a" }}>{value}</div>
    </div>
);

const labelStyle    = { color: "#64748b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 };
const inputStyle    = { padding: "7px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#ffffff", color: "#0f172a", fontSize: 13 };
const clearBtnStyle = { padding: "7px 14px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#ffffff", color: "#64748b", cursor: "pointer", fontSize: 13, alignSelf: "flex-end" };
const cardStyle     = { background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", padding: "1.25rem", marginBottom: 16 };
const cardTitleStyle = { margin: "0 0 1rem", fontSize: 15, fontWeight: 600, color: "#0f172a" };
const thStyle       = { padding: "9px 14px", textAlign: "left", color: "#64748b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" };
const tdStyle       = { padding: "10px 14px", fontSize: 13, color: "#0f172a" };
