import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ManagementAPI from "./managementAPI";
import { Alert, Modal, TextField, SelectField } from "./crudkit";

const statusClass = (s) => (s === "ACTIVE" ? "ok" : s === "SUSPENDED" ? "danger" : "neutral");
const TABS = ["Overview", "Users", "Roles", "Usage"];

export default function OrgDetail() {
    const { orgId } = useParams();
    const navigate  = useNavigate();
    const [org, setOrg]         = useState(null);
    const [tab, setTab]         = useState("Overview");
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState("");
    const [actionMsg, setActionMsg] = useState("");

    const [users, setUsers]   = useState(null);
    const [roles, setRoles]   = useState(null);
    const [stats, setStats]   = useState(null);
    const [tabLoading, setTabLoading] = useState(false);
    const [usersPage, setUsersPage]   = useState(1);
    const [editOpen, setEditOpen]     = useState(false);
    const [oform, setOform]           = useState({});
    const [osaving, setOsaving]       = useState(false);
    const [oerr, setOerr]             = useState("");
    const setOf = (k, v) => setOform(f => ({ ...f, [k]: v }));

    const loadUsers = async () => { setTabLoading(true); try { setUsers(await ManagementAPI.getOrgUsers(orgId, usersPage)); } catch (e) { setError(e.message); } finally { setTabLoading(false); } };
    const loadRoles = async () => { setTabLoading(true); try { setRoles(await ManagementAPI.getOrgRoles(orgId)); } catch (e) { setError(e.message); } finally { setTabLoading(false); } };
    const loadStats = async () => { setTabLoading(true); try { setStats(await ManagementAPI.getOrgStats(orgId)); } catch (e) { setError(e.message); } finally { setTabLoading(false); } };

    useEffect(() => {
        ManagementAPI.getOrg(orgId)
            .then(data => { setOrg(data); setLoading(false); })
            .catch(err => {
                if (err.message?.includes("401")) navigate("/management/login");
                setError(err.message); setLoading(false);
            });
    }, [orgId]);

    useEffect(() => {
        if (!org) return;
        if (tab === "Users") loadUsers();
        if (tab === "Roles") loadRoles();
        if (tab === "Usage") loadStats();
    }, [tab, org]);

    useEffect(() => { if (tab === "Users") loadUsers(); }, [usersPage]);

    const handleSuspend = async () => {
        if (!confirm("Suspend this organization? All logins will be blocked.")) return;
        await ManagementAPI.suspendOrg(orgId); setActionMsg("Organization suspended."); setOrg(o => ({ ...o, status: "SUSPENDED" }));
    };
    const handleActivate = async () => {
        await ManagementAPI.activateOrg(orgId); setActionMsg("Organization activated."); setOrg(o => ({ ...o, status: "ACTIVE" }));
    };

    const openOrgEdit = () => {
        setOform({
            name: org.name || "", slug: org.slug || "", owner_email: org.owner_email || "",
            website: org.website || "", industry: org.industry || "", status: org.status || "ACTIVE",
        });
        setOerr(""); setEditOpen(true);
    };
    const saveOrgEdit = async () => {
        setOsaving(true); setOerr("");
        try {
            await ManagementAPI.updateOrg(orgId, {
                name: oform.name.trim(), slug: oform.slug.trim(), owner_email: oform.owner_email.trim(),
                website: oform.website.trim(), industry: oform.industry.trim(), status: oform.status,
            });
            setOrg(await ManagementAPI.getOrg(orgId));
            setEditOpen(false); setActionMsg("Organization updated.");
        } catch (e) { setOerr(e.message); } finally { setOsaving(false); }
    };

    if (loading) return <div className="mg-loading">Loading…</div>;
    if (error && !org) return <div className="mg-alert error" style={{ justifyContent: "flex-start" }}>{error}</div>;

    return (
        <div>
            <div className="mg-title-row">
                <button className="mg-btn mg-btn-ghost mg-btn-sm" onClick={() => navigate("/management/dashboard")}>← Organizations</button>
                <h1 className="mg-h1" style={{ marginLeft: 4 }}>{org?.name}</h1>
                <span className={`mg-badge ${statusClass(org?.status)}`}>{org?.status}</span>
            </div>

            {actionMsg && <Alert type="success" msg={actionMsg} onClose={() => setActionMsg("")} />}

            <div className="mg-tabs">
                {TABS.map(t => (
                    <button key={t} className={`mg-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
                ))}
            </div>

            {tab === "Overview" && (
                <div>
                    <div className="mg-card mg-card-pad" style={{ marginBottom: 16 }}>
                        <h3 className="mg-card-title">Organization Details</h3>
                        <div className="mg-fieldgrid">
                            <Def label="ID" value={org.id} />
                            <Def label="Name" value={org.name} />
                            <Def label="Slug" value={<span className="mg-mono">{org.slug}</span>} />
                            <Def label="Owner Email" value={org.owner_email} />
                            <Def label="Status" value={<span className={`mg-badge ${statusClass(org.status)}`}>{org.status}</span>} />
                            <Def label="Plan" value={org.plan_id || "—"} />
                            <Def label="Members" value={org.member_count} />
                            <Def label="Trial Ends" value={org.trial_ends_at ? new Date(org.trial_ends_at).toLocaleDateString() : "—"} />
                            <Def label="Created" value={org.created_at ? new Date(org.created_at).toLocaleDateString() : "—"} />
                            <Def label="Industry" value={org.industry || "—"} />
                            <Def label="Timezone" value={org.timezone || "—"} />
                            <Def label="Website" value={org.website || "—"} />
                        </div>
                    </div>

                    {org.subscription && (
                        <div className="mg-card mg-card-pad" style={{ marginBottom: 16 }}>
                            <h3 className="mg-card-title">Subscription</h3>
                            <div className="mg-fieldgrid">
                                <Def label="Plan Status" value={org.subscription.status} />
                                <Def label="Billing Cycle" value={org.subscription.billing_cycle} />
                            </div>
                        </div>
                    )}

                    <div className="mg-head-actions">
                        <button className="mg-btn mg-btn-primary" onClick={openOrgEdit}>Edit Details</button>
                        {org.status === "ACTIVE"
                            ? <button className="mg-btn mg-btn-danger" onClick={handleSuspend}>Suspend Organization</button>
                            : <button className="mg-btn mg-btn-ghost" style={{ borderColor: "rgba(23,178,106,.4)", color: "var(--mg-ok)" }} onClick={handleActivate}>Activate Organization</button>}
                        <button className="mg-btn mg-btn-ghost" onClick={() => navigate(`/management/audit-logs?org_id=${orgId}`)}>View Audit Logs</button>
                    </div>
                </div>
            )}

            {tab === "Users" && (
                <div className="mg-card">
                    {tabLoading ? <div className="mg-loading">Loading…</div> : users && (
                        <>
                            <div className="mg-table-wrap">
                                <table className="mg-table">
                                    <thead><tr>{["ID", "Name", "Email", "Role", "Status", "Joined"].map(h => <th key={h}>{h}</th>)}</tr></thead>
                                    <tbody>
                                        {users.users.length === 0 && <tr><td colSpan={6} className="mg-empty">No users</td></tr>}
                                        {users.users.map(u => (
                                            <tr key={u.id}>
                                                <td className="mg-mono mg-td-muted">{u.id}</td>
                                                <td className="mg-td-strong">{u.fullname}</td>
                                                <td className="mg-td-muted">{u.email}</td>
                                                <td className="mg-td-muted">{u.role_name || u.role_id || "—"}</td>
                                                <td><span className={`mg-badge ${statusClass(u.status)}`}>{u.status}</span></td>
                                                <td className="mg-td-muted mg-num">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mg-pagination" style={{ padding: "12px 16px" }}>
                                <button className="mg-pagebtn" onClick={() => setUsersPage(p => Math.max(1, p - 1))} disabled={usersPage === 1}>← Prev</button>
                                <span className="mg-pageinfo">Page {usersPage} · {users.total} total</span>
                                <button className="mg-pagebtn" onClick={() => setUsersPage(p => p + 1)} disabled={users.users.length < 20}>Next →</button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {tab === "Roles" && (
                <div className="mg-card">
                    {tabLoading ? <div className="mg-loading">Loading…</div> : roles && (
                        <div className="mg-table-wrap">
                            <table className="mg-table">
                                <thead><tr>{["ID", "Name", "Scope", "Permissions", "Status"].map(h => <th key={h}>{h}</th>)}</tr></thead>
                                <tbody>
                                    {roles.roles.length === 0 && <tr><td colSpan={5} className="mg-empty">No roles</td></tr>}
                                    {roles.roles.map(r => (
                                        <tr key={r.id}>
                                            <td className="mg-mono mg-td-muted">{r.id}</td>
                                            <td className="mg-td-strong">{r.name}</td>
                                            <td className="mg-td-muted">{r.organization_id ? "Org-specific" : "System-wide"}</td>
                                            <td className="mg-td-muted mg-num">{r.permission_count} menus</td>
                                            <td><span className={`mg-badge ${statusClass((r.status || "").toUpperCase())}`}>{r.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {tab === "Usage" && (
                <div>
                    {tabLoading ? <div className="mg-loading">Loading…</div> : stats && (
                        <>
                            <div className="mg-stat-grid">
                                <Stat label="Members" value={stats.member_count} />
                                <Stat label="Conversations (30d)" value={stats.total_conversations.toLocaleString()} tone="violet" />
                                <Stat label="Messages (30d)" value={stats.total_messages.toLocaleString()} tone="ok" />
                            </div>
                            <div className="mg-card mg-card-pad">
                                <h3 className="mg-card-title">Daily Usage — Last 30 Days</h3>
                                <div className="mg-table-wrap">
                                    <table className="mg-table">
                                        <thead><tr>{["Date", "Conversations", "Messages", "API Calls"].map(h => <th key={h}>{h}</th>)}</tr></thead>
                                        <tbody>
                                            {stats.daily_records.length === 0 && <tr><td colSpan={4} className="mg-empty">No usage data</td></tr>}
                                            {stats.daily_records.map((r, i) => (
                                                <tr key={i}>
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
            )}

            {editOpen && (
                <Modal
                    title={`Edit Organization: ${org?.name}`}
                    onClose={() => setEditOpen(false)} onSave={saveOrgEdit} saving={osaving}
                    error={oerr} saveLabel="Save Changes"
                >
                    <TextField label="Name *" value={oform.name} onChange={v => setOf("name", v)} placeholder="Acme Inc." />
                    <TextField label="Slug *" value={oform.slug} onChange={v => setOf("slug", v)} placeholder="acme-inc" />
                    <TextField label="Owner Email *" type="email" value={oform.owner_email} onChange={v => setOf("owner_email", v)} placeholder="owner@acme.com" />
                    <TextField label="Website" value={oform.website} onChange={v => setOf("website", v)} placeholder="https://acme.com" />
                    <TextField label="Industry" value={oform.industry} onChange={v => setOf("industry", v)} placeholder="SaaS" />
                    <SelectField label="Status" value={oform.status} onChange={v => setOf("status", v)} options={["ACTIVE", "SUSPENDED"]} />
                </Modal>
            )}
        </div>
    );
}

const Def = ({ label, value }) => (
    <div>
        <div className="mg-def-label">{label}</div>
        <div className="mg-def-value">{value}</div>
    </div>
);

const Stat = ({ label, value, tone }) => (
    <div className={`mg-stat ${tone || ""}`}>
        <div className="mg-stat-label">{label}</div>
        <div className="mg-stat-value">{value}</div>
    </div>
);
