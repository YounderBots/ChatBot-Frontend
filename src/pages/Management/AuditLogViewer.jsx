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
        setLoading(true); setError("");
        try {
            const params = { page };
            if (orgIdFilter)  params.org_id    = orgIdFilter;
            if (actionFilter) params.action    = actionFilter;
            if (dateFrom)     params.date_from = dateFrom;
            if (dateTo)       params.date_to   = dateTo;
            const data = await ManagementAPI.listAuditLogs(params);
            setLogs(data.logs); setTotal(data.total);
        } catch (err) {
            if (err.message?.includes("401")) navigate("/management/login");
            setError(err.message);
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [page, orgIdFilter, actionFilter, dateFrom, dateTo]);

    const resetFilters = () => { setOrgIdFilter(""); setActionFilter(""); setDateFrom(""); setDateTo(""); setPage(1); };
    const hasFilters = orgIdFilter || actionFilter || dateFrom || dateTo;

    return (
        <div>
            <div className="mg-page-head">
                <div>
                    <h1 className="mg-h1">Audit Logs</h1>
                    <p className="mg-sub">Immutable record of platform activity across all tenants.</p>
                </div>
            </div>

            <div className="mg-toolbar">
                <div className="mg-field">
                    <span className="mg-field-label">Org ID</span>
                    <input className="mg-input mg-inline" style={{ width: 120 }} placeholder="All orgs" value={orgIdFilter}
                        onChange={e => { setOrgIdFilter(e.target.value); setPage(1); }} />
                </div>
                <div className="mg-field">
                    <span className="mg-field-label">Action</span>
                    <select className="mg-select mg-inline" style={{ width: 140 }} value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}>
                        {ACTION_OPTIONS.map(a => <option key={a} value={a}>{a || "All actions"}</option>)}
                    </select>
                </div>
                <div className="mg-field">
                    <span className="mg-field-label">Date From</span>
                    <input className="mg-input mg-inline" style={{ width: 160 }} type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
                </div>
                <div className="mg-field">
                    <span className="mg-field-label">Date To</span>
                    <input className="mg-input mg-inline" style={{ width: 160 }} type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} />
                </div>
                {hasFilters && <button className="mg-clear" onClick={resetFilters}>Clear</button>}
                <span className="mg-count">{total} result{total !== 1 ? "s" : ""}</span>
            </div>

            {error && <div className="mg-alert error" style={{ justifyContent: "flex-start" }}>{error}</div>}

            {loading ? (
                <div className="mg-loading">Loading…</div>
            ) : (
                <div className="mg-card">
                    <div className="mg-table-wrap">
                        <table className="mg-table" style={{ minWidth: 1050 }}>
                            <thead>
                                <tr>{["Time", "Org", "User", "Action", "Resource", "Description", "IP", "Status"].map(h => <th key={h}>{h}</th>)}</tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 && <tr><td colSpan={8} className="mg-empty">No logs found</td></tr>}
                                {logs.map(log => (
                                    <tr key={log.id}>
                                        <td className="mg-num" style={{ whiteSpace: "nowrap" }}>{log.created_at ? new Date(log.created_at).toLocaleString() : "—"}</td>
                                        <td className="mg-num mg-td-muted">{log.organization_id || "—"}</td>
                                        <td className="mg-td-muted mg-ellipsis" style={{ maxWidth: 160 }}>{log.user_email || log.user_id || "—"}</td>
                                        <td><span className="mg-badge plain info mg-mono">{log.action || "—"}</span></td>
                                        <td className="mg-td-muted">{log.resource_type || "—"}</td>
                                        <td className="mg-td-muted mg-ellipsis" style={{ maxWidth: 220 }}>{log.description || "—"}</td>
                                        <td className="mg-td-muted mg-mono" style={{ whiteSpace: "nowrap" }}>{log.ip_address || "—"}</td>
                                        <td><span className={`mg-badge ${log.status === "SUCCESS" ? "ok" : "danger"}`}>{log.status || "—"}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="mg-pagination">
                <button className="mg-pagebtn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
                <span className="mg-pageinfo">Page {page}</span>
                <button className="mg-pagebtn" onClick={() => setPage(p => p + 1)} disabled={logs.length < 50}>Next →</button>
            </div>
        </div>
    );
}
