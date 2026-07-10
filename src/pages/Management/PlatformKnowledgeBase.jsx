import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagementAPI from "./managementAPI";
import OrgSelect from "./OrgSelect";
import { Alert, PageHeader, Modal, TextField, TextArea, SelectField, CheckboxField, RowActions } from "./crudkit";

const ARTICLE_STATUS_OPTIONS = ["", "PUBLISHED", "DRAFT", "ARCHIVED"];
const FORM_STATUS_OPTIONS = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const statusBadge = (s) => (s === "PUBLISHED" ? "ok" : s === "DRAFT" ? "warn" : "neutral");

const emptyForm = {
    organization_id: "", title: "", url: "", category_id: "1", tags: "",
    contents: "", article_status: "DRAFT", featured_article: false, publish_date: "",
};

export default function PlatformKnowledgeBase() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [total,    setTotal]    = useState(0);
    const [page,     setPage]     = useState(1);
    const [search,   setSearch]   = useState("");
    const [orgId,    setOrgId]    = useState("");
    const [status,   setStatus]   = useState("");
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
            if (search) params.search         = search;
            if (orgId)  params.org_id         = orgId;
            if (status) params.article_status = status;
            const data = await ManagementAPI.listKnowledgeBase(params);
            setArticles(data.articles); setTotal(data.total);
        } catch (err) {
            if (err.message?.includes("401")) navigate("/management/login");
            setError(err.message);
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [page, search, orgId, status]);

    const resetFilters = () => { setSearch(""); setOrgId(""); setStatus(""); setPage(1); };
    const hasFilters = search || orgId || status;

    const openCreate = () => { setEditId(null); setForm({ ...emptyForm, organization_id: orgId || "" }); setFormError(""); setModal("create"); };
    const openEdit = (a) => {
        setEditId(a.id);
        setForm({
            organization_id: a.organization_id ?? "",
            title: a.title || "", url: "", category_id: "", tags: a.tags || "",
            contents: "", article_status: a.article_status || "DRAFT",
            featured_article: !!a.featured_article,
            publish_date: a.publish_date ? String(a.publish_date).slice(0, 10) : "",
        });
        setFormError(""); setModal("edit");
    };

    const handleSave = async () => {
        setSaving(true); setFormError("");
        try {
            const common = {
                title: form.title.trim(), tags: form.tags.trim(),
                article_status: form.article_status, featured_article: form.featured_article,
            };
            if (form.url.trim())      common.url = form.url.trim();
            if (form.category_id)     common.category_id = Number(form.category_id);
            if (form.contents.trim()) common.contents = form.contents.trim();
            if (form.publish_date)    common.publish_date = form.publish_date;
            if (modal === "create") { await ManagementAPI.createArticle({ organization_id: Number(form.organization_id), ...common }); setMsg("Article created."); }
            else { await ManagementAPI.updateArticle(editId, common); setMsg("Article updated."); }
            setModal(null); load();
        } catch (e) { setFormError(e.message); } finally { setSaving(false); }
    };

    const handleDelete = async (a) => {
        try { await ManagementAPI.deleteArticle(a.id); setMsg(`Article "${a.title}" deleted.`); load(); }
        catch (e) { setError(e.message); }
    };

    return (
        <div>
            <PageHeader title="Knowledge Base" subtitle="Help-center articles across every organization." addLabel="+ Add Article" onAdd={openCreate} />

            {msg   && <Alert type="success" msg={msg} onClose={() => setMsg("")} />}
            {error && <Alert type="error"   msg={error} onClose={() => setError("")} />}

            <div className="mg-toolbar">
                <div className="mg-field">
                    <span className="mg-field-label">Search</span>
                    <input className="mg-input mg-inline" style={{ width: 240 }} placeholder="Title or tags…" value={search}
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
                        {ARTICLE_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || "All statuses"}</option>)}
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
                                <tr>{["ID", "Org", "Title", "Tags", "Status", "Featured", "Published", "Actions"].map(h => <th key={h}>{h}</th>)}</tr>
                            </thead>
                            <tbody>
                                {articles.length === 0 && <tr><td colSpan={8} className="mg-empty">No articles found</td></tr>}
                                {articles.map(a => (
                                    <tr key={a.id}>
                                        <td className="mg-mono mg-td-muted">{a.id}</td>
                                        <td><button className="mg-link" onClick={() => navigate(`/management/org/${a.organization_id}`)}>{a.organization_id || "—"}</button></td>
                                        <td className="mg-td-strong mg-ellipsis">{a.title}</td>
                                        <td className="mg-td-muted mg-ellipsis" style={{ maxWidth: 140 }}>{a.tags || "—"}</td>
                                        <td><span className={`mg-badge ${statusBadge(a.article_status)}`}>{a.article_status}</span></td>
                                        <td>{a.featured_article ? <span className="mg-badge warn">★ Featured</span> : <span className="mg-td-muted">—</span>}</td>
                                        <td className="mg-td-muted mg-num" style={{ whiteSpace: "nowrap" }}>{a.publish_date || "—"}</td>
                                        <td><RowActions onEdit={() => openEdit(a)} onDelete={() => handleDelete(a)} deleteLabel={`article "${a.title}"`} /></td>
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
                <button className="mg-pagebtn" onClick={() => setPage(p => p + 1)} disabled={articles.length < 20}>Next →</button>
            </div>

            {modal && (
                <Modal
                    title={modal === "create" ? "Add Article" : `Edit Article: ${form.title}`}
                    onClose={() => setModal(null)} onSave={handleSave} saving={saving}
                    error={formError} saveLabel={modal === "create" ? "Create Article" : "Save Changes"}
                >
                    {modal === "create" && (
                        <OrgSelect value={form.organization_id} onChange={v => setF("organization_id", v)} />
                    )}
                    <TextField label="Title *" value={form.title} onChange={v => setF("title", v)} placeholder="Article title" />
                    <TextField label="URL slug" value={form.url} onChange={v => setF("url", v)} placeholder="how-to-reset-password" />
                    <TextField label="Category ID" type="number" value={form.category_id} onChange={v => setF("category_id", v)} placeholder="e.g. 1" />
                    <TextField label="Tags (comma-separated)" value={form.tags} onChange={v => setF("tags", v)} placeholder="billing, account" />
                    <TextArea label="Contents" value={form.contents} onChange={v => setF("contents", v)} rows={4} />
                    <SelectField label="Status" value={form.article_status} onChange={v => setF("article_status", v)} options={FORM_STATUS_OPTIONS} />
                    <TextField label="Publish date" type="date" value={form.publish_date} onChange={v => setF("publish_date", v)} />
                    <CheckboxField label="Featured article" checked={form.featured_article} onChange={v => setF("featured_article", v)} />
                </Modal>
            )}
        </div>
    );
}
