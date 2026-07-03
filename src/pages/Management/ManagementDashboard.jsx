import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagementAPI from "./managementAPI";
import { Alert, Modal, TextField, SelectField } from "./crudkit";

const ORG_STATUS_OPTIONS = ["ACTIVE", "SUSPENDED"];
const emptyForm = { name: "", slug: "", owner_email: "", website: "", industry: "", status: "ACTIVE" };
const statusClass = (s) => (s === "ACTIVE" ? "ok" : s === "SUSPENDED" ? "danger" : "neutral");

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
    const [msg,            setMsg]           = useState("");

    const [modal, setModal]     = useState(null);   // null | "create" | "edit"
    const [editId, setEditId]   = useState(null);
    const [form, setForm]       = useState(emptyForm);
    const [saving, setSaving]   = useState(false);
    const [formError, setFormError] = useState("");

    const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

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
    const handleActivate = async (orgId) => { await ManagementAPI.activateOrg(orgId); load(); };

    const openCreate = () => { setEditId(null); setForm(emptyForm); setFormError(""); setModal("create"); };
    const openEdit = (org) => {
        setEditId(org.id);
        setForm({
            name: org.name || "", slug: org.slug || "", owner_email: org.owner_email || "",
            website: org.website || "", industry: org.industry || "", status: org.status || "ACTIVE",
        });
        setFormError(""); setModal("edit");
    };

    const handleSave = async () => {
        setSaving(true); setFormError("");
        try {
            const body = {
                name: form.name.trim(), slug: form.slug.trim(), owner_email: form.owner_email.trim(),
                website: form.website.trim(), industry: form.industry.trim(), status: form.status,
            };
            if (modal === "create") { await ManagementAPI.createOrg(body); setMsg("Organization created."); }
            else { await ManagementAPI.updateOrg(editId, body); setMsg("Organization updated."); }
            setModal(null); load();
        } catch (e) { setFormError(e.message); } finally { setSaving(false); }
    };

    const handleDelete = async (org) => {
        if (!confirm(`Delete organization "${org.name}"? This cannot be undone.`)) return;
        try { await ManagementAPI.deleteOrg(org.id); setMsg(`Organization "${org.name}" deleted.`); load(); }
        catch (e) { setError(e.message); }
    };

    return (
        <div>
            <div className="mg-page-head">
                <div>
                    <h1 className="mg-h1">Organizations</h1>
                    <p className="mg-sub">Every tenant workspace on the platform, at a glance.</p>
                </div>
                <div className="mg-head-actions">
                    <button className="mg-btn mg-btn-primary" onClick={openCreate}>+ Add Organization</button>
                </div>
            </div>

            <div className="mg-stat-grid">
                <Stat label="Total Organizations" value={total} />
                <Stat label="Active" value={activeCount} tone="ok" />
                <Stat label="Suspended" value={suspendedCount} tone="warn" />
                <Stat label="Total Conversations" value={usage ? usage.total_conversations.toLocaleString() : "—"} tone="violet" />
            </div>

            {msg && <Alert type="success" msg={msg} onClose={() => setMsg("")} />}
            {error && <Alert type="error" msg={error} onClose={() => setError("")} />}

            <div className="mg-toolbar">
                <div className="mg-field">
                    <span className="mg-field-label">Search</span>
                    <input className="mg-input mg-inline" style={{ width: 240 }} placeholder="Name or owner email…" value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setPage(1); }} />
                </div>
                <div className="mg-field">
                    <span className="mg-field-label">Status</span>
                    <select className="mg-select mg-inline" style={{ width: 160 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                        <option value="">All statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="SUSPENDED">Suspended</option>
                    </select>
                </div>
                {(searchQuery || statusFilter) && <button className="mg-clear" onClick={() => { setSearchQuery(""); setStatusFilter(""); setPage(1); }}>Clear</button>}
                <span className="mg-count">{total} result{total !== 1 ? "s" : ""}</span>
            </div>

            {loading ? (
                <div className="mg-loading">Loading…</div>
            ) : (
                <div className="mg-card">
                    <div className="mg-table-wrap">
                        <table className="mg-table">
                            <thead>
                                <tr>{["ID", "Name", "Owner", "Plan", "Members", "Status", "Created", "Actions"].map(h => <th key={h}>{h}</th>)}</tr>
                            </thead>
                            <tbody>
                                {orgs.length === 0 && <tr><td colSpan={8} className="mg-empty">No organizations found</td></tr>}
                                {orgs.map(org => (
                                    <tr key={org.id}>
                                        <td className="mg-mono mg-td-muted">{org.id}</td>
                                        <td><button className="mg-link" onClick={() => navigate(`/management/org/${org.id}`)}>{org.name}</button></td>
                                        <td className="mg-td-muted">{org.owner_email}</td>
                                        <td className="mg-td-muted">{org.plan_id || "—"}</td>
                                        <td className="mg-td-muted mg-num">{org.member_count ?? "—"}</td>
                                        <td><span className={`mg-badge ${statusClass(org.status)}`}>{org.status}</span></td>
                                        <td className="mg-td-muted mg-num" style={{ whiteSpace: "nowrap" }}>{org.created_at ? new Date(org.created_at).toLocaleDateString() : "—"}</td>
                                        <td>
                                            <div className="mg-actions">
                                                <button className="mg-rowbtn" onClick={() => navigate(`/management/org/${org.id}`)}>View</button>
                                                <button className="mg-rowbtn" onClick={() => openEdit(org)}>Edit</button>
                                                {org.status === "ACTIVE"
                                                    ? <button className="mg-rowbtn danger" onClick={() => handleSuspend(org.id)}>Suspend</button>
                                                    : <button className="mg-rowbtn ok" onClick={() => handleActivate(org.id)}>Activate</button>}
                                                <button className="mg-rowbtn danger" onClick={() => handleDelete(org)}>Delete</button>
                                            </div>
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
                <span className="mg-pageinfo">Page {page} of {Math.max(1, Math.ceil(total / 20))}</span>
                <button className="mg-pagebtn" onClick={() => setPage(p => p + 1)} disabled={orgs.length < 20}>Next →</button>
            </div>

            {modal && (
                <Modal
                    title={modal === "create" ? "Add Organization" : `Edit Organization: ${form.name}`}
                    onClose={() => setModal(null)} onSave={handleSave} saving={saving}
                    error={formError} saveLabel={modal === "create" ? "Create Organization" : "Save Changes"}
                >
                    <TextField label="Name *" value={form.name} onChange={v => setF("name", v)} placeholder="Acme Inc." />
                    <TextField label="Slug *" value={form.slug} onChange={v => setF("slug", v)} placeholder="acme-inc" />
                    <TextField label="Owner Email *" type="email" value={form.owner_email} onChange={v => setF("owner_email", v)} placeholder="owner@acme.com" />
                    <TextField label="Website" value={form.website} onChange={v => setF("website", v)} placeholder="https://acme.com" />
                    <TextField label="Industry" value={form.industry} onChange={v => setF("industry", v)} placeholder="SaaS" />
                    <SelectField label="Status" value={form.status} onChange={v => setF("status", v)} options={ORG_STATUS_OPTIONS} />
                </Modal>
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
