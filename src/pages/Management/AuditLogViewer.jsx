import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ManagementAPI from "./managementAPI";

const ACTION_OPTIONS = ["", "login", "create", "update", "delete", "suspend", "activate", "export"];

export default function AuditLogViewer() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [logs,         setLogs]         = useState([]);
    const [total,        setTotal]        = useState(0);
    const [page,         setPage]         = useState(1);
    const [orgIdFilter,  setOrgIdFilter]  = useState(searchParams.get("org_id") || "");
    const [actionFilter, setActionFilter] = useState("");
    const [dateFrom,     setDateFrom]     = useState("");
    const [dateTo,       setDateTo]       = useState("");
    const [loading,      setLoading]      = useState(true);
    const [error,        setError]        = useState("");

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const params = { page };
            if (orgIdFilter) params.org_id  = orgIdFilter;
            if (actionFilter) params.action  = actionFilter;
            if (dateFrom)     params.date_from = dateFrom;
            if (dateTo)       params.date_to   = dateTo;
            const data = await ManagementAPI.listAuditLogs(params);
            setLogs(data.logs);
            setTotal(data.total);
        } catch (err) {
            if (err.message?.includes("401")) navigate("/management/login");
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [page, orgIdFilter, actionFilter, dateFrom, dateTo]);

    const resetFilters = () => {
        setOrgIdFilter(""); setActionFilter(""); setDateFrom(""); setDateTo(""); setPage(1);
    };

    const hasFilters = orgIdFilter || actionFilter || dateFrom || dateTo;

    return (
        <div>
            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
                <div>
                    <div style={labelStyle}>Org ID</div>
                    <input
                        placeholder="All orgs"
                        value={orgIdFilter}
                        onChange={e => { setOrgIdFilter(e.target.value); setPage(1); }}
                        style={{ ...inputStyle, width: 120 }}
                    />
                </div>
                <div>
                    <div style={labelStyle}>Action</div>
                    <select
                        value={actionFilter}
                        onChange={e => { setActionFilter(e.target.value); setPage(1); }}
                        style={{ ...inputStyle, width: 130 }}
                    >
                        {ACTION_OPTIONS.map(a => (
                            <option key={a} value={a}>{a || "All actions"}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <div style={labelStyle}>Date From</div>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                        style={{ ...inputStyle, width: 150 }}
                    />
                </div>
                <div>
                    <div style={labelStyle}>Date To</div>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={e => { setDateTo(e.target.value); setPage(1); }}
                        style={{ ...inputStyle, width: 150 }}
                    />
                </div>
                {hasFilters && (
                    <button onClick={resetFilters} style={{ ...pageBtnStyle, alignSelf: "flex-end", color: "#64748b" }}>
                        Clear
                    </button>
                )}
                <span style={{ color: "#64748b", fontSize: 12, marginLeft: "auto", alignSelf: "flex-end", paddingBottom: 2 }}>
                    {total} result{total !== 1 ? "s" : ""}
                </span>
            </div>

            {error && <div style={{ color: "#ef4444", marginBottom: 16, fontSize: 13 }}>{error}</div>}

            {loading ? (
                <div style={{ color: "#64748b", padding: "2rem 0", textAlign: "center" }}>Loading…</div>
            ) : (
                <div style={{ background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1050 }}>
                        <thead>
                            <tr style={{ background: "#f8fafc" }}>
                                {["Time", "Org ID", "User", "Action", "Resource", "Description", "IP", "Status"].map(h => (
                                    <th key={h} style={thStyle}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={8} style={{ ...tdStyle, color: "#64748b", textAlign: "center", padding: "2rem" }}>
                                        No logs found
                                    </td>
                                </tr>
                            )}
                            {logs.map(log => (
                                <tr key={log.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                                        {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                                    </td>
                                    <td style={tdStyle}>{log.organization_id || "—"}</td>
                                    <td style={{ ...tdStyle, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {log.user_email || log.user_id || "—"}
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ background: "rgba(59,130,246,0.08)", color: "#2563eb", borderRadius: 4, padding: "2px 8px", fontSize: 12, whiteSpace: "nowrap", fontWeight: 500 }}>
                                            {log.action || "—"}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>{log.resource_type || "—"}</td>
                                    <td style={{ ...tdStyle, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#64748b" }}>
                                        {log.description || "—"}
                                    </td>
                                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{log.ip_address || "—"}</td>
                                    <td style={tdStyle}>
                                        <span style={{ color: log.status === "SUCCESS" ? "#22c55e" : "#ef4444", fontSize: 12 }}>
                                            {log.status || "—"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end", alignItems: "center" }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={pageBtnStyle}>← Prev</button>
                <span style={{ color: "#64748b", fontSize: 13 }}>Page {page}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={logs.length < 50} style={pageBtnStyle}>Next →</button>
            </div>
        </div>
    );
}

const labelStyle  = { color: "#64748b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 };
const inputStyle  = { padding: "7px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#ffffff", color: "#0f172a", fontSize: 13 };
const thStyle     = { padding: "10px 14px", textAlign: "left", color: "#64748b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", whiteSpace: "nowrap" };
const tdStyle     = { padding: "11px 14px", fontSize: 13 };
const pageBtnStyle = { padding: "5px 14px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#ffffff", color: "#0f172a", cursor: "pointer", fontSize: 13 };
