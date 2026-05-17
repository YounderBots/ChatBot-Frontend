import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagementAPI from "./managementAPI";

const CHANNEL_TYPES = ["", "whatsapp", "facebook", "slack", "sms", "email", "web"];

const CHANNEL_ICONS = {
    whatsapp: "💬",
    facebook: "📘",
    slack:    "⚡",
    sms:      "📱",
    email:    "✉️",
    web:      "🌐",
};

export default function PlatformChannels() {
    const navigate = useNavigate();
    const [channels, setChannels] = useState([]);
    const [total,    setTotal]    = useState(0);
    const [page,     setPage]     = useState(1);
    const [orgId,    setOrgId]    = useState("");
    const [type,     setType]     = useState("");
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState("");

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const params = { page };
            if (orgId) params.org_id       = orgId;
            if (type)  params.channel_type = type;
            const data = await ManagementAPI.listChannels(params);
            setChannels(data.channels);
            setTotal(data.total);
        } catch (err) {
            if (err.message?.includes("401")) navigate("/management/login");
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [page, orgId, type]);

    // Count by channel type for summary
    const typeCounts = channels.reduce((acc, c) => {
        acc[c.channel_type] = (acc[c.channel_type] || 0) + 1;
        return acc;
    }, {});

    const resetFilters = () => { setOrgId(""); setType(""); setPage(1); };

    return (
        <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div>
                    <div style={labelStyle}>Org ID</div>
                    <input
                        placeholder="All orgs"
                        value={orgId}
                        onChange={e => { setOrgId(e.target.value); setPage(1); }}
                        style={{ ...inputStyle, width: 120 }}
                    />
                </div>
                <div>
                    <div style={labelStyle}>Channel Type</div>
                    <select
                        value={type}
                        onChange={e => { setType(e.target.value); setPage(1); }}
                        style={{ ...inputStyle, width: 150 }}
                    >
                        {CHANNEL_TYPES.map(t => (
                            <option key={t} value={t}>{t || "All types"}</option>
                        ))}
                    </select>
                </div>
                {(orgId || type) && (
                    <button onClick={resetFilters} style={clearBtnStyle}>Clear</button>
                )}
                <span style={{ color: "#64748b", fontSize: 12, marginLeft: "auto", alignSelf: "flex-end", paddingBottom: 2 }}>
                    {total} result{total !== 1 ? "s" : ""}
                </span>
            </div>

            {error && <div style={{ color: "#ef4444", marginBottom: 16, fontSize: 13 }}>{error}</div>}

            {loading ? (
                <div style={{ color: "#64748b", padding: "2rem", textAlign: "center" }}>Loading…</div>
            ) : (
                <div style={{ background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}>
                        <thead>
                            <tr style={{ background: "#f8fafc" }}>
                                {["ID", "Org ID", "Type", "Display Name", "Enabled", "Webhook", "Status", "Created"].map(h => (
                                    <th key={h} style={thStyle}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {channels.length === 0 && (
                                <tr><td colSpan={8} style={{ ...tdStyle, color: "#64748b", textAlign: "center", padding: "2rem" }}>No channels found</td></tr>
                            )}
                            {channels.map(c => (
                                <tr key={c.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                                    <td style={tdStyle}>{c.id}</td>
                                    <td style={tdStyle}>
                                        <button
                                            onClick={() => navigate(`/management/org/${c.organization_id}`)}
                                            style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", padding: 0, fontSize: 13 }}
                                        >
                                            {c.organization_id}
                                        </button>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                                            <span>{CHANNEL_ICONS[c.channel_type] || "📡"}</span>
                                            <span style={{ fontWeight: 500, textTransform: "capitalize" }}>{c.channel_type}</span>
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {c.display_name}
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            color: c.is_enabled ? "#22c55e" : "#64748b",
                                            background: c.is_enabled ? "rgba(34,197,94,0.1)" : "rgba(100,116,139,0.1)",
                                            padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                                        }}>
                                            {c.is_enabled ? "Enabled" : "Disabled"}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, color: "#64748b", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {c.webhook_url || "—"}
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            color: c.status === "ACTIVE" ? "#22c55e" : "#64748b",
                                            fontSize: 11,
                                        }}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, color: "#64748b", whiteSpace: "nowrap" }}>
                                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end", alignItems: "center" }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={pageBtnStyle}>← Prev</button>
                <span style={{ color: "#64748b", fontSize: 13 }}>Page {page}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={channels.length < 20} style={pageBtnStyle}>Next →</button>
            </div>
        </div>
    );
}

const labelStyle    = { color: "#64748b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 };
const inputStyle    = { padding: "7px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#ffffff", color: "#0f172a", fontSize: 13 };
const clearBtnStyle = { padding: "7px 14px", borderRadius: 6, border: "1px solid #e2e8f0", background: "none", color: "#64748b", cursor: "pointer", fontSize: 13, alignSelf: "flex-end" };
const thStyle       = { padding: "10px 14px", textAlign: "left", color: "#64748b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" };
const tdStyle       = { padding: "11px 14px", fontSize: 13, color: "#0f172a" };
const pageBtnStyle  = { padding: "5px 14px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#ffffff", color: "#0f172a", cursor: "pointer", fontSize: 13 };
