import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagementAPI from "./managementAPI";
import { Alert, PageHeader } from "./crudkit";

const STATUS_OPTIONS = ["", "PUBLISHED", "DRAFT"];
const statusBadge = (s) => (s === "PUBLISHED" ? "ok" : s === "DRAFT" ? "warn" : "neutral");

// Conversation flows are authored in each tenant's Flow Builder, so the platform
// view is oversight: list every org's flows and remove one if needed. No create
// here — that would mean re-implementing the visual editor.
export default function PlatformFlows() {
    const navigate = useNavigate();
    const [flows,   setFlows]   = useState([]);
    const [total,   setTotal]   = useState(0);
    const [page,    setPage]    = useState(1);
    const [search,  setSearch]  = useState("");
    const [orgId,   setOrgId]   = useState("");
    const [status,  setStatus]  = useState("");
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState("");
    const [msg,     setMsg]     = useState("");

    const load = async () => {
        setLoading(true); setError("");
        try {
            const params = { page };
            if (search) params.search = search;
            if (orgId)  params.org_id = orgId;
            if (status) params.status = status;
            const data = await ManagementAPI.listFlows(params);
            setFlows(data.flows); setTotal(data.total);
        } catch (err) {
            if (err.message?.includes("401")) navigate("/management/login");
            setError(err.message);
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [page, search, orgId, status]);

    const resetFilters = () => { setSearch(""); setOrgId(""); setStatus(""); setPage(1); };
    const hasFilters = search || orgId || status;

    const handleDelete = async (f) => {
        if (!window.confirm(`Delete flow "${f.name}"? This removes it from the tenant.`)) return;
        try { await ManagementAPI.deleteFlow(f.id); setMsg(`Flow "${f.name}" deleted.`); load(); }
        catch (e) { setError(e.message); }
    };

    return (
        <div>
            <PageHeader title="Flow Builder" subtitle="Conversation flows across every organization." />

            {msg   && <Alert type="success" msg={msg} onClose={() => setMsg("")} />}
            {error && <Alert type="error"   msg={error} onClose={() => setError("")} />}

            <div className="mg-toolbar">
                <div className="mg-field">
                    <span className="mg-field-label">Search</span>
                    <input className="mg-input mg-inline" style={{ width: 240 }} placeholder="Name or description…" value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <div className="mg-field">
                    <span className="mg-field-label">Org ID</span>
                    <input className="mg-input mg-inline" style={{ width: 120 }} placeholder="All orgs" value={orgId}
                        onChange={e => { setOrgId(e.target.value); setPage(1); }} />
                </div>
                <div className="mg-field">
                    <span className="mg-field-label">Status</span>
                    <select className="mg-select mg-inline" style={{ width: 150 }} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || "All statuses"}</option>)}
                    </select>
                </div>
                {hasFilters && <button className="mg-clear" onClick={resetFilters}>Clear</button>}
                <span className="mg-count">{total} result{total !== 1 ? "s" : ""}</span>
            </div>

            {loading ? (
                <div className="mg-loading">Loading…</div>
            ) : (
                <div className="mg-card">
                    <div className="mg-table-wrap">
                        <table className="mg-table">
                            <thead>
                                <tr>{["ID", "Org", "Name", "Trigger", "Nodes", "Active", "Status", "Actions"].map(h => <th key={h}>{h}</th>)}</tr>
                            </thead>
                            <tbody>
                                {flows.length === 0 && <tr><td colSpan={8} className="mg-empty">No flows found</td></tr>}
                                {flows.map(f => (
                                    <tr key={f.id}>
                                        <td className="mg-mono mg-td-muted">{f.id}</td>
                                        <td><button className="mg-link" onClick={() => navigate(`/management/org/${f.organization_id}`)}>{f.organization_id || "—"}</button></td>
                                        <td className="mg-td-strong mg-ellipsis">{f.name}</td>
                                        <td className="mg-td-muted mg-ellipsis" style={{ maxWidth: 160 }}>
                                            {f.trigger_type}{f.trigger_value ? `: ${f.trigger_value}` : ""}
                                        </td>
                                        <td className="mg-num">{f.node_count}</td>
                                        <td>{f.is_active ? <span className="mg-badge ok">Active</span> : <span className="mg-td-muted">—</span>}</td>
                                        <td><span className={`mg-badge ${statusBadge(f.status)}`}>{f.status}</span></td>
                                        <td>
                                            <button className="mg-link" style={{ color: "#c0453b" }} onClick={() => handleDelete(f)}>Delete</button>
                                        </td>
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
                <button className="mg-pagebtn" onClick={() => setPage(p => p + 1)} disabled={flows.length < 20}>Next →</button>
            </div>
        </div>
    );
}
