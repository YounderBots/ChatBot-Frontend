import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagementAPI from "./managementAPI";

const statusClass = (s) => ({
    ACTIVE: "ok", CANCELLED: "danger", EXPIRED: "warn", TRIAL: "info",
}[s] || "neutral");

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
                setError(err.message); setLoading(false);
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
            <div className="mg-page-head">
                <div>
                    <h1 className="mg-h1">Billing</h1>
                    <p className="mg-sub">Subscriptions across every organization.</p>
                </div>
            </div>

            {error && <div className="mg-alert error" style={{ justifyContent: "flex-start" }}>{error}</div>}

            {loading ? (
                <div className="mg-loading">Loading…</div>
            ) : data && (
                <>
                    <div className="mg-stat-grid">
                        <Stat label="Total Subscriptions" value={data.total} />
                        <Stat label="Active" value={statusCounts.ACTIVE || 0} tone="ok" />
                        <Stat label="Trial" value={statusCounts.TRIAL || 0} tone="violet" />
                        <Stat label="Cancelled" value={statusCounts.CANCELLED || 0} tone="warn" />
                    </div>

                    <div className="mg-toolbar">
                        <div className="mg-field">
                            <span className="mg-field-label">Search</span>
                            <input className="mg-input mg-inline" style={{ width: 240 }} placeholder="Org ID or plan…" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        {search && <button className="mg-clear" onClick={() => setSearch("")}>Clear</button>}
                        <span className="mg-count">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
                    </div>

                    <div className="mg-card">
                        <div className="mg-table-wrap">
                            <table className="mg-table">
                                <thead>
                                    <tr>{["ID", "Org", "Plan", "Billing Cycle", "Status", "Period End"].map(h => <th key={h}>{h}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 && <tr><td colSpan={6} className="mg-empty">No subscriptions found</td></tr>}
                                    {filtered.map(s => (
                                        <tr key={s.id}>
                                            <td className="mg-mono mg-td-muted">{s.id}</td>
                                            <td><button className="mg-link" onClick={() => navigate(`/management/org/${s.organization_id}`)}>{s.organization_id}</button></td>
                                            <td className="mg-td-strong" style={{ textTransform: "capitalize" }}>{s.plan || "—"}</td>
                                            <td className="mg-td-muted" style={{ textTransform: "capitalize" }}>{s.billing_cycle || "—"}</td>
                                            <td><span className={`mg-badge ${statusClass(s.status)}`}>{s.status}</span></td>
                                            <td className="mg-td-muted mg-num" style={{ whiteSpace: "nowrap" }}>{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : "—"}</td>
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

const Stat = ({ label, value, tone }) => (
    <div className={`mg-stat ${tone || ""}`}>
        <div className="mg-stat-label">{label}</div>
        <div className="mg-stat-value">{value}</div>
    </div>
);
