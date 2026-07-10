import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagementAPI from "./managementAPI";
import OrgSelect from "./OrgSelect";
import { Alert, PageHeader, Modal, TextField, TextArea, SelectField, RowActions } from "./crudkit";

const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"];
const STATUS_OPTIONS = ["ACTIVE", "INACTIVE"];
const APPROVAL_OPTIONS = ["PENDING", "APPROVED", "REJECTED"];
const priorityBadge = (p) => (p === "HIGH" ? "danger" : p === "MEDIUM" ? "warn" : "ok");
const approvalBadge = (a) => (a === "APPROVED" ? "ok" : a === "REJECTED" ? "danger" : "warn");

const emptyForm = {
    organization_id: "", intent_name: "", name: "", description: "",
    priority: "MEDIUM", confidence: "60", approval_status: "PENDING", status: "ACTIVE",
};

export default function PlatformIntents() {
    const navigate = useNavigate();
    const [intents, setIntents] = useState([]);
    const [total,   setTotal]   = useState(0);
    const [page,    setPage]    = useState(1);
    const [search,  setSearch]  = useState("");
    const [orgId,   setOrgId]   = useState("");
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState("");
    const [msg,     setMsg]     = useState("");

    const [modal, setModal]     = useState(null);
    const [editId, setEditId]   = useState(null);
    const [form, setForm]       = useState(emptyForm);
    const [saving, setSaving]   = useState(false);
    const [formError, setFormError] = useState("");

    const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const load = async () => {
        setLoading(true); setError("");
        try {
            const params = { page };
            if (search) params.search = search;
            if (orgId)  params.org_id = orgId;
            const data = await ManagementAPI.listIntents(params);
            setIntents(data.intents); setTotal(data.total);
        } catch (err) {
            if (err.message?.includes("401")) navigate("/management/login");
            setError(err.message);
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [page, search, orgId]);

    const resetFilters = () => { setSearch(""); setOrgId(""); setPage(1); };

    const openCreate = () => { setEditId(null); setForm({ ...emptyForm, organization_id: orgId || "" }); setFormError(""); setModal("create"); };
    const openEdit = (i) => {
        setEditId(i.id);
        setForm({
            organization_id: i.organization_id ?? "",
            intent_name: i.intent_name || "", name: i.name || "", description: i.description || "",
            priority: i.priority || "MEDIUM", confidence: String(i.confidence ?? 60),
            approval_status: i.approval_status || "PENDING", status: i.status || "ACTIVE",
        });
        setFormError(""); setModal("edit");
    };

    const handleSave = async () => {
        setSaving(true); setFormError("");
        try {
            if (modal === "create") {
                await ManagementAPI.createIntent({
                    organization_id: Number(form.organization_id),
                    intent_name: form.intent_name.trim(),
                    name: form.name.trim() || form.intent_name.trim(),
                    description: form.description.trim(),
                    priority: form.priority, confidence: Number(form.confidence), status: form.status,
                });
                setMsg("Intent created.");
            } else {
                await ManagementAPI.updateIntent(editId, {
                    intent_name: form.intent_name.trim(), name: form.name.trim(), description: form.description.trim(),
                    priority: form.priority, confidence: Number(form.confidence),
                    approval_status: form.approval_status, status: form.status,
                });
                setMsg("Intent updated.");
            }
            setModal(null); load();
        } catch (e) { setFormError(e.message); } finally { setSaving(false); }
    };

    const handleDelete = async (i) => {
        try { await ManagementAPI.deleteIntent(i.id); setMsg(`Intent "${i.intent_name}" deleted.`); load(); }
        catch (e) { setError(e.message); }
    };

    return (
        <div>
            <PageHeader title="Intents" subtitle="NLU intents across every organization." addLabel="+ Add Intent" onAdd={openCreate} />

            {msg   && <Alert type="success" msg={msg} onClose={() => setMsg("")} />}
            {error && <Alert type="error"   msg={error} onClose={() => setError("")} />}

            <div className="mg-toolbar">
                <div className="mg-field">
                    <span className="mg-field-label">Search</span>
                    <input className="mg-input mg-inline" style={{ width: 240 }} placeholder="Intent name…" value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <div className="mg-field">
                    <span className="mg-field-label">Org ID</span>
                    <input className="mg-input mg-inline" style={{ width: 130 }} placeholder="All orgs" value={orgId}
                        onChange={e => { setOrgId(e.target.value); setPage(1); }} />
                </div>
                {(search || orgId) && <button className="mg-clear" onClick={resetFilters}>Clear</button>}
                <span className="mg-count">{total} result{total !== 1 ? "s" : ""}</span>
            </div>

            {loading ? (
                <div className="mg-loading">Loading…</div>
            ) : (
                <div className="mg-card">
                    <div className="mg-table-wrap">
                        <table className="mg-table">
                            <thead>
                                <tr>{["ID", "Org", "Name", "Intent Key", "Priority", "Conf.", "Approval", "Status", "Actions"].map(h => <th key={h}>{h}</th>)}</tr>
                            </thead>
                            <tbody>
                                {intents.length === 0 && <tr><td colSpan={9} className="mg-empty">No intents found</td></tr>}
                                {intents.map(i => (
                                    <tr key={i.id}>
                                        <td className="mg-mono mg-td-muted">{i.id}</td>
                                        <td><button className="mg-link" onClick={() => navigate(`/management/org/${i.organization_id}`)}>{i.organization_id || "—"}</button></td>
                                        <td className="mg-td-strong mg-ellipsis">{i.name}</td>
                                        <td className="mg-td-muted mg-mono mg-ellipsis" style={{ maxWidth: 150 }}>{i.intent_name}</td>
                                        <td><span className={`mg-badge plain ${priorityBadge(i.priority)}`}>{i.priority || "—"}</span></td>
                                        <td className="mg-td-muted mg-num">{i.confidence != null ? `${i.confidence}%` : "—"}</td>
                                        <td><span className={`mg-badge ${approvalBadge(i.approval_status)}`}>{i.approval_status || "—"}</span></td>
                                        <td><span className={`mg-badge ${i.status === "ACTIVE" ? "ok" : "neutral"}`}>{i.status}</span></td>
                                        <td><RowActions onEdit={() => openEdit(i)} onDelete={() => handleDelete(i)} deleteLabel={`intent "${i.intent_name}"`} /></td>
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
                <button className="mg-pagebtn" onClick={() => setPage(p => p + 1)} disabled={intents.length < 20}>Next →</button>
            </div>

            {modal && (
                <Modal
                    title={modal === "create" ? "Add Intent" : `Edit Intent: ${form.intent_name}`}
                    onClose={() => setModal(null)} onSave={handleSave} saving={saving}
                    error={formError} saveLabel={modal === "create" ? "Create Intent" : "Save Changes"}
                >
                    {modal === "create" && (
                        <OrgSelect value={form.organization_id} onChange={v => setF("organization_id", v)} />
                    )}
                    <TextField label="Intent Key *" value={form.intent_name} onChange={v => setF("intent_name", v)} placeholder="e.g. greeting_hello" />
                    <TextField label="Display Name" value={form.name} onChange={v => setF("name", v)} placeholder="Human-readable name" />
                    <TextArea label="Description" value={form.description} onChange={v => setF("description", v)} />
                    <SelectField label="Priority" value={form.priority} onChange={v => setF("priority", v)} options={PRIORITY_OPTIONS} />
                    <TextField label="Confidence (%)" type="number" value={form.confidence} onChange={v => setF("confidence", v)} />
                    {modal === "edit" && (
                        <SelectField label="Approval" value={form.approval_status} onChange={v => setF("approval_status", v)} options={APPROVAL_OPTIONS} />
                    )}
                    <SelectField label="Status" value={form.status} onChange={v => setF("status", v)} options={STATUS_OPTIONS} />
                </Modal>
            )}
        </div>
    );
}
