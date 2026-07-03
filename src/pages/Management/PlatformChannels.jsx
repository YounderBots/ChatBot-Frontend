import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagementAPI from "./managementAPI";
import { Alert, PageHeader, Modal, TextField, SelectField, CheckboxField, RowActions } from "./crudkit";

const CHANNEL_TYPES = ["", "whatsapp", "facebook", "slack", "sms", "email", "web"];
const CREATE_CHANNEL_TYPES = ["whatsapp", "facebook", "slack", "sms", "instagram", "teams", "email"];
const CHANNEL_ICONS = {
    whatsapp: "💬", facebook: "📘", slack: "⚡", sms: "📱",
    email: "✉️", web: "🌐", instagram: "📷", teams: "👥",
};
const emptyForm = { organization_id: "", channel_type: "whatsapp", display_name: "", webhook_url: "", is_enabled: false };

export default function PlatformChannels() {
    const navigate = useNavigate();
    const [channels, setChannels] = useState([]);
    const [total,    setTotal]    = useState(0);
    const [page,     setPage]     = useState(1);
    const [orgId,    setOrgId]    = useState("");
    const [type,     setType]     = useState("");
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState("");
    const [msg,      setMsg]      = useState("");

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
            if (orgId) params.org_id       = orgId;
            if (type)  params.channel_type = type;
            const data = await ManagementAPI.listChannels(params);
            setChannels(data.channels); setTotal(data.total);
        } catch (err) {
            if (err.message?.includes("401")) navigate("/management/login");
            setError(err.message);
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [page, orgId, type]);

    const resetFilters = () => { setOrgId(""); setType(""); setPage(1); };

    const openCreate = () => { setEditId(null); setForm({ ...emptyForm, organization_id: orgId || "" }); setFormError(""); setModal("create"); };
    const openEdit = (c) => {
        setEditId(c.id);
        setForm({
            organization_id: c.organization_id ?? "", channel_type: c.channel_type || "",
            display_name: c.display_name || "", webhook_url: c.webhook_url || "", is_enabled: !!c.is_enabled,
        });
        setFormError(""); setModal("edit");
    };

    const handleSave = async () => {
        setSaving(true); setFormError("");
        try {
            if (modal === "create") {
                await ManagementAPI.createChannel({
                    organization_id: Number(form.organization_id), channel_type: form.channel_type,
                    display_name: form.display_name.trim(), webhook_url: form.webhook_url.trim(), is_enabled: form.is_enabled,
                });
                setMsg("Channel created.");
            } else {
                await ManagementAPI.updateChannel(editId, {
                    display_name: form.display_name.trim(), webhook_url: form.webhook_url.trim(), is_enabled: form.is_enabled,
                });
                setMsg("Channel updated.");
            }
            setModal(null); load();
        } catch (e) { setFormError(e.message); } finally { setSaving(false); }
    };

    const handleDelete = async (c) => {
        try { await ManagementAPI.deleteChannel(c.id); setMsg(`${c.channel_type} channel deleted.`); load(); }
        catch (e) { setError(e.message); }
    };

    return (
        <div>
            <PageHeader title="Channels" subtitle="Messaging channels configured across every organization." addLabel="+ Add Channel" onAdd={openCreate} />

            {msg   && <Alert type="success" msg={msg} onClose={() => setMsg("")} />}
            {error && <Alert type="error"   msg={error} onClose={() => setError("")} />}

            <div className="mg-toolbar">
                <div className="mg-field">
                    <span className="mg-field-label">Org ID</span>
                    <input className="mg-input mg-inline" style={{ width: 130 }} placeholder="All orgs" value={orgId}
                        onChange={e => { setOrgId(e.target.value); setPage(1); }} />
                </div>
                <div className="mg-field">
                    <span className="mg-field-label">Channel Type</span>
                    <select className="mg-select mg-inline" style={{ width: 160 }} value={type} onChange={e => { setType(e.target.value); setPage(1); }}>
                        {CHANNEL_TYPES.map(t => <option key={t} value={t}>{t || "All types"}</option>)}
                    </select>
                </div>
                {(orgId || type) && <button className="mg-clear" onClick={resetFilters}>Clear</button>}
                <span className="mg-count">{total} result{total !== 1 ? "s" : ""}</span>
            </div>

            {loading ? (
                <div className="mg-loading">Loading…</div>
            ) : (
                <div className="mg-card">
                    <div className="mg-table-wrap">
                        <table className="mg-table">
                            <thead>
                                <tr>{["ID", "Org", "Type", "Display Name", "Enabled", "Webhook", "Status", "Actions"].map(h => <th key={h}>{h}</th>)}</tr>
                            </thead>
                            <tbody>
                                {channels.length === 0 && <tr><td colSpan={8} className="mg-empty">No channels found</td></tr>}
                                {channels.map(c => (
                                    <tr key={c.id}>
                                        <td className="mg-mono mg-td-muted">{c.id}</td>
                                        <td><button className="mg-link" onClick={() => navigate(`/management/org/${c.organization_id}`)}>{c.organization_id}</button></td>
                                        <td><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span>{CHANNEL_ICONS[c.channel_type] || "📡"}</span><span className="mg-td-strong" style={{ textTransform: "capitalize" }}>{c.channel_type}</span></span></td>
                                        <td className="mg-ellipsis" style={{ maxWidth: 160 }}>{c.display_name}</td>
                                        <td><span className={`mg-badge ${c.is_enabled ? "ok" : "neutral"}`}>{c.is_enabled ? "Enabled" : "Disabled"}</span></td>
                                        <td className="mg-td-muted mg-ellipsis mg-mono" style={{ maxWidth: 160 }}>{c.webhook_url || "—"}</td>
                                        <td><span className={`mg-badge plain ${c.status === "ACTIVE" ? "ok" : "neutral"}`}>{c.status}</span></td>
                                        <td><RowActions onEdit={() => openEdit(c)} onDelete={() => handleDelete(c)} deleteLabel={`the ${c.channel_type} channel`} /></td>
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
                <button className="mg-pagebtn" onClick={() => setPage(p => p + 1)} disabled={channels.length < 20}>Next →</button>
            </div>

            {modal && (
                <Modal
                    title={modal === "create" ? "Add Channel" : `Edit Channel: ${form.channel_type}`}
                    onClose={() => setModal(null)} onSave={handleSave} saving={saving}
                    error={formError} saveLabel={modal === "create" ? "Create Channel" : "Save Changes"}
                >
                    {modal === "create" ? (
                        <>
                            <TextField label="Organization ID *" type="number" value={form.organization_id} onChange={v => setF("organization_id", v)} placeholder="e.g. 2" />
                            <SelectField label="Channel Type *" value={form.channel_type} onChange={v => setF("channel_type", v)} options={CREATE_CHANNEL_TYPES} />
                        </>
                    ) : (
                        <p className="mg-note">Type <strong>{form.channel_type}</strong> — channel type can't be changed after creation.</p>
                    )}
                    <TextField label="Display Name" value={form.display_name} onChange={v => setF("display_name", v)} placeholder="e.g. Support WhatsApp" />
                    <TextField label="Webhook URL" value={form.webhook_url} onChange={v => setF("webhook_url", v)} placeholder="https://…" />
                    <CheckboxField label="Enabled" checked={form.is_enabled} onChange={v => setF("is_enabled", v)} />
                </Modal>
            )}
        </div>
    );
}
