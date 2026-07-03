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
        setLoading(true); setError("");
        try {
            const params = {};
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo)   params.date_to   = dateTo;
            const data = await ManagementAPI.platformUsage(params);
            setUsage(data);
        } catch (err) {
            if (err.message?.includes("401")) navigate("/management/login");
            setError(err.message);
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [dateFrom, dateTo]);

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
            <div className="mg-page-head">
                <div>
                    <h1 className="mg-h1">Analytics</h1>
                    <p className="mg-sub">Platform-wide usage across all tenants.</p>
                </div>
            </div>

            <div className="mg-toolbar">
                <div className="mg-field">
                    <span className="mg-field-label">Date From</span>
                    <input className="mg-input mg-inline" style={{ width: 160 }} type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                </div>
                <div className="mg-field">
                    <span className="mg-field-label">Date To</span>
                    <input className="mg-input mg-inline" style={{ width: 160 }} type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </div>
                {(dateFrom || dateTo) && <button className="mg-clear" onClick={() => { setDateFrom(""); setDateTo(""); }}>Clear</button>}
            </div>

            {error && <div className="mg-alert error" style={{ justifyContent: "flex-start" }}>{error}</div>}

            {loading ? (
                <div className="mg-loading">Loading…</div>
            ) : usage && (
                <>
                    <div className="mg-stat-grid">
                        <Stat label="Total Conversations" value={usage.total_conversations.toLocaleString()} />
                        <Stat label="Total Messages" value={usage.total_messages.toLocaleString()} tone="violet" />
                        <Stat label="Data Points" value={(usage.records?.length || 0).toLocaleString()} tone="ok" />
                    </div>

                    <div className="mg-card mg-card-pad" style={{ marginBottom: 20 }}>
                        <h3 className="mg-card-title">Top Organizations by Usage</h3>
                        <div className="mg-table-wrap">
                            <table className="mg-table">
                                <thead>
                                    <tr>{["Org", "Conversations", "Messages", "API Calls"].map(h => <th key={h}>{h}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {orgBreakdown.length === 0 && <tr><td colSpan={4} className="mg-empty">No usage data</td></tr>}
                                    {orgBreakdown.map(row => (
                                        <tr key={row.org_id}>
                                            <td><button className="mg-link" onClick={() => navigate(`/management/org/${row.org_id}`)}>{row.org_id}</button></td>
                                            <td className="mg-num">{row.conversations.toLocaleString()}</td>
                                            <td className="mg-num">{row.messages.toLocaleString()}</td>
                                            <td className="mg-num mg-td-muted">{row.api_calls.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mg-card mg-card-pad">
                        <h3 className="mg-card-title">Daily Records</h3>
                        <div className="mg-table-wrap" style={{ maxHeight: 420, overflowY: "auto" }}>
                            <table className="mg-table">
                                <thead>
                                    <tr>{["Org", "Date", "Conversations", "Messages", "API Calls"].map(h => <th key={h}>{h}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {(usage.records || []).map((r, i) => (
                                        <tr key={i}>
                                            <td className="mg-num mg-td-muted">{r.organization_id}</td>
                                            <td className="mg-num" style={{ whiteSpace: "nowrap" }}>{r.date}</td>
                                            <td className="mg-num">{r.conversations.toLocaleString()}</td>
                                            <td className="mg-num">{r.messages.toLocaleString()}</td>
                                            <td className="mg-num mg-td-muted">{r.api_calls.toLocaleString()}</td>
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
