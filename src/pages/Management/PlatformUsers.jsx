import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagementAPI from "./managementAPI";
import OrgSelect from "./OrgSelect";
import { Alert, PageHeader, Modal, TextField, SelectField, RowActions } from "./crudkit";

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE"];
const emptyForm = { organization_id: "", fullname: "", email: "", password: "", role: "", status: "ACTIVE" };

export default function PlatformUsers() {
    const navigate = useNavigate();
    const [users,   setUsers]   = useState([]);
    const [total,   setTotal]   = useState(0);
    const [page,    setPage]    = useState(1);
    const [search,  setSearch]  = useState("");
    const [orgId,   setOrgId]   = useState("");
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState("");
    const [msg,     setMsg]     = useState("");

    const [modal, setModal]     = useState(null);   // null | "create" | "edit"
    const [editId, setEditId]   = useState(null);
    const [form, setForm]       = useState(emptyForm);
    const [saving, setSaving]   = useState(false);
    const [formError, setFormError] = useState("");
    const [orgRoles, setOrgRoles]   = useState([]);
    const [seedingRoles, setSeedingRoles] = useState(false);

    const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const params = { page };
            if (search) params.email  = search;
            if (orgId)  params.org_id = orgId;
            const data = await ManagementAPI.listUsers(params);
            setUsers(data.users);
            setTotal(data.total);
        } catch (err) {
            if (err.message?.includes("401")) navigate("/management/login");
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [page, search, orgId]);

    // Load target org's roles whenever the modal is open with a valid org id.
    useEffect(() => {
        if (!modal) { setOrgRoles([]); return; }
        const oid = Number(form.organization_id);
        if (!oid) { setOrgRoles([]); return; }
        let cancelled = false;
        ManagementAPI.getOrgRoles(oid)
            .then(d => { if (!cancelled) setOrgRoles(d.roles || []); })
            .catch(() => { if (!cancelled) setOrgRoles([]); });
        return () => { cancelled = true; };
    }, [modal, form.organization_id]);

    const resetFilters = () => { setSearch(""); setOrgId(""); setPage(1); };
    const hasFilters = search || orgId;

    const openCreate = () => {
        setEditId(null);
        setForm({ ...emptyForm, organization_id: orgId || "" });
        setFormError("");
        setModal("create");
    };

    const openEdit = (u) => {
        setEditId(u.id);
        setForm({
            organization_id: u.organization_id ?? "",
            fullname: u.fullname || "", email: u.email || "",
            password: "", role: "", status: u.status || "ACTIVE",
        });
        setFormError("");
        setModal("edit");
    };

    const handleSeedRoles = async () => {
        const oid = Number(form.organization_id);
        if (!oid) return;
        setSeedingRoles(true);
        setFormError("");
        try {
            await ManagementAPI.seedOrgRoles(oid);
            const d = await ManagementAPI.getOrgRoles(oid);
            setOrgRoles(d.roles || []);
        } catch (e) {
            setFormError(e.message);
        } finally {
            setSeedingRoles(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setFormError("");
        try {
            if (modal === "create") {
                await ManagementAPI.createUser({
                    organization_id: Number(form.organization_id),
                    fullname: form.fullname.trim(),
                    email: form.email.trim(),
                    password: form.password,
                    role: Number(form.role),
                    status: form.status,
                });
                setMsg("User created.");
            } else {
                const body = { fullname: form.fullname.trim(), email: form.email.trim(), status: form.status };
                if (form.role) body.role = Number(form.role);
                if (form.password) body.password = form.password;
                await ManagementAPI.updateUser(editId, body);
                setMsg("User updated.");
            }
            setModal(null);
            load();
        } catch (e) {
            setFormError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (u) => {
        try {
            await ManagementAPI.deleteUser(u.id);
            setMsg(`User "${u.email}" deleted.`);
            load();
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div>
            <PageHeader title="Users" subtitle="All tenant users across every organization." addLabel="+ Add User" onAdd={openCreate} />

            {msg   && <Alert type="success" msg={msg} onClose={() => setMsg("")} />}
            {error && <Alert type="error"   msg={error} onClose={() => setError("")} />}

            <div className="mg-toolbar">
                <div className="mg-field">
                    <span className="mg-field-label">Email</span>
                    <input className="mg-input mg-inline" style={{ width: 240 }} placeholder="Search by email…" value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <div className="mg-field">
                    <span className="mg-field-label">Org ID</span>
                    <input className="mg-input mg-inline" style={{ width: 130 }} placeholder="Filter by org…" value={orgId}
                        onChange={e => { setOrgId(e.target.value); setPage(1); }} />
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
                                <tr>{["ID", "Name", "Email", "Org", "Status", "Joined", "Actions"].map(h => <th key={h}>{h}</th>)}</tr>
                            </thead>
                            <tbody>
                                {users.length === 0 && (
                                    <tr><td colSpan={7} className="mg-empty">No users found</td></tr>
                                )}
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td className="mg-mono mg-td-muted">{u.id}</td>
                                        <td className="mg-td-strong">{u.fullname || "—"}</td>
                                        <td className="mg-td-muted">{u.email}</td>
                                        <td><button className="mg-link" onClick={() => navigate(`/management/org/${u.organization_id}`)}>{u.organization_id}</button></td>
                                        <td><span className={`mg-badge ${u.status === "ACTIVE" ? "ok" : "neutral"}`}>{u.status}</span></td>
                                        <td className="mg-td-muted mg-num" style={{ whiteSpace: "nowrap" }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
                                        <td><RowActions onEdit={() => openEdit(u)} onDelete={() => handleDelete(u)} deleteLabel={`user "${u.email}"`} /></td>
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
                <button className="mg-pagebtn" onClick={() => setPage(p => p + 1)} disabled={users.length < 20}>Next →</button>
            </div>

            {modal && (
                <Modal
                    title={modal === "create" ? "Add User" : `Edit User: ${form.email}`}
                    onClose={() => setModal(null)} onSave={handleSave} saving={saving}
                    error={formError} saveLabel={modal === "create" ? "Create User" : "Save Changes"}
                >
                    {modal === "create" && (
                        <OrgSelect value={form.organization_id} onChange={v => setF("organization_id", v)} />
                    )}
                    <TextField label="Full Name *" value={form.fullname} onChange={v => setF("fullname", v)} placeholder="Jane Doe" />
                    <TextField label="Email *" type="email" value={form.email} onChange={v => setF("email", v)} placeholder="jane@acme.com" />
                    <TextField
                        label={modal === "create" ? "Password *" : "Password (leave blank to keep)"}
                        type="password" value={form.password} onChange={v => setF("password", v)}
                        placeholder="Min 8 chars, letter + digit"
                    />
                    {orgRoles.length > 0 ? (
                        <SelectField
                            label={`Role ${modal === "create" ? "*" : "(leave to keep)"}`}
                            value={form.role}
                            onChange={v => setF("role", v)}
                            options={[{ value: "", label: "— select a role —" },
                                ...orgRoles.map(r => ({ value: String(r.id), label: `${r.name} (#${r.id})` }))]}
                        />
                    ) : Number(form.organization_id) ? (
                        <div style={{ marginTop: 12 }}>
                            <label className="mg-form-label">Role *</label>
                            <div className="mg-note warn">This organization has no roles yet — a user can't be created without one.</div>
                            <button type="button" className="mg-btn mg-btn-ghost mg-btn-sm" onClick={handleSeedRoles} disabled={seedingRoles}>
                                {seedingRoles ? "Creating…" : "+ Create default roles (Administrator, Member)"}
                            </button>
                        </div>
                    ) : (
                        <p className="mg-note">Enter an Organization ID above to load its roles.</p>
                    )}
                    <SelectField label="Status" value={form.status} onChange={v => setF("status", v)} options={STATUS_OPTIONS} />
                </Modal>
            )}
        </div>
    );
}
