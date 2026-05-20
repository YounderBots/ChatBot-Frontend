import { Circle, Edit2, LucideBotMessageSquare, MessageSquare, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import APICall from "../../APICalls/APICall";
import NormalLayout from "../../components/NormalLayout";
import { usePermission } from "../../Context/AuthContext";
import { useToast } from "../../components/useToast";
import { useConfirm } from "../../components/useConfirm";
import ChatWidget from "../ChatWidget/ChatWidget";
import "./TicketManagement.css";

// ─── SLA badge ────────────────────────────────────────────────────────────────
const SLA_THRESHOLD = { urgent: 15, high: 60, medium: 120, low: 480 };

function SLABadge({ createdAt, priority }) {
    const elapsed = createdAt
        ? Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
        : null;
    if (elapsed === null) return null;
    const limit = SLA_THRESHOLD[(priority || "medium").toLowerCase()] || 120;
    const pct = Math.min((elapsed / limit) * 100, 100);
    const cls = pct >= 100 ? "tm-sla-breach" : pct >= 75 ? "tm-sla-warn" : "tm-sla-ok";
    const label = elapsed < 60 ? `${elapsed}m` : `${Math.floor(elapsed / 60)}h ${elapsed % 60}m`;
    return (
        <span className={`tm-sla ${cls}`} title={`${elapsed}m elapsed / ${limit}m SLA`}>
            {label}
        </span>
    );
}

// ─── Status / priority helpers ─────────────────────────────────────────────────
const statusClass = (s) => {
    const m = { open: "tm-badge-open", assigned: "tm-badge-assigned", closed: "tm-badge-closed", "in progress": "tm-badge-inprogress", reopened: "tm-badge-reopened" };
    return m[(s || "").toLowerCase()] || "tm-badge-closed";
};

const priorityClass = (p) => {
    const m = { urgent: "tm-priority-urgent", high: "tm-priority-high", medium: "tm-priority-medium", low: "tm-priority-low" };
    return m[(p || "").toLowerCase()] || "tm-priority-low";
};

// ─── Agent Notes panel ────────────────────────────────────────────────────────
function AgentNotesPanel({ escalationId }) {
    const { showToast, ToastContainer } = useToast();
    const { confirm, ConfirmDialog } = useConfirm();
    const [notes, setNotes]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [text, setText]         = useState("");
    const [saving, setSaving]     = useState(false);
    const [editId, setEditId]     = useState(null);
    const [editText, setEditText] = useState("");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const load = useCallback(async () => {
        if (!escalationId) return;
        setLoading(true);
        try {
            const res = await APICall.getT(`/conversation/notes/${escalationId}`);
            setNotes(res?.notes || []);
        } catch { setNotes([]); }
        finally { setLoading(false); }
    }, [escalationId]);

    useEffect(() => { load(); setText(""); setEditId(null); }, [escalationId, load]);

    const addNote = async () => {
        if (!text.trim()) return;
        setSaving(true);
        try {
            await APICall.postT(`/conversation/notes/${escalationId}`, {
                note_text: text.trim(), agent_id: user.id,
                agent_name: user.fullname || user.email || "Agent",
            });
            setText(""); load();
        } catch { showToast("Failed to add note.", "danger"); }
        finally { setSaving(false); }
    };

    const saveEdit = async (noteId) => {
        if (!editText.trim()) return;
        setSaving(true);
        try {
            await APICall.postT(`/conversation/notes/${escalationId}/${noteId}`, { note_text: editText });
            setEditId(null); load();
        } catch { showToast("Failed to update note.", "danger"); }
        finally { setSaving(false); }
    };

    const deleteNote = async (noteId) => {
        if (!await confirm("Delete this note?")) return;
        try { await APICall.postT(`/conversation/notes/${escalationId}/${noteId}/delete`, {}); load(); showToast("Note deleted.", "success"); }
        catch { showToast("Failed to delete note.", "danger"); }
    };

    if (!escalationId) return (
        <div className="tm-empty" style={{ padding: 32 }}>Select a ticket to view notes.</div>
    );

    return (
        <>
            <ToastContainer /><ConfirmDialog />
            <div className="tm-notes-body">
                {loading ? (
                    <div style={{ textAlign: "center", padding: 24 }}><Spinner size="sm" /></div>
                ) : notes.length === 0 ? (
                    <div className="tm-empty" style={{ padding: "24px 0" }}>No notes yet.</div>
                ) : (
                    notes.map(n => (
                        <div key={n.id} className="tm-note-card">
                            {editId === n.id ? (
                                <>
                                    <textarea className="tm-note-input" rows={2} value={editText}
                                        onChange={e => setEditText(e.target.value)} />
                                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                                        <button className="tm-btn tm-btn-primary tm-btn-sm"
                                            onClick={() => saveEdit(n.id)} disabled={saving}>Save</button>
                                        <button className="tm-btn tm-btn-ghost tm-btn-sm"
                                            onClick={() => setEditId(null)}>Cancel</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="tm-note-text">{n.note_text}</p>
                                    <div className="tm-note-meta">
                                        <span>{n.agent_name} · {n.created_at?.slice(0, 10)}</span>
                                        <div className="tm-note-actions">
                                            <button className="tm-note-action"
                                                onClick={() => { setEditId(n.id); setEditText(n.note_text); }}>
                                                <Edit2 size={12} />
                                            </button>
                                            <button className="tm-note-action del" onClick={() => deleteNote(n.id)}>
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div style={{ padding: "12px 14px", borderTop: "1px solid var(--tm-border)" }}>
                <textarea className="tm-note-input" rows={2} placeholder="Add internal note…"
                    value={text} onChange={e => setText(e.target.value)} />
                <button className="tm-btn tm-btn-primary" style={{ width: "100%", marginTop: 8, justifyContent: "center" }}
                    onClick={addNote} disabled={saving || !text.trim()}>
                    {saving ? <Spinner size="sm" /> : "Add Note"}
                </button>
            </div>
        </>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const TicketManagementContent = () => {
    const { canEdit, canDelete } = usePermission('/Ticket-Management');
    const { showToast: showMainToast, ToastContainer: MainToast } = useToast();
    const { confirm: confirmMain, ConfirmDialog: MainConfirm } = useConfirm();
    const [tickets, setTickets]               = useState([]);
    const [agents, setAgents]                 = useState([]);
    const [editingTicket, setEditingTicket]   = useState(null);
    const [showModal, setShowModal]           = useState(false);
    const [activeSessionId, setActiveSessionId] = useState("");
    const [activeEscId, setActiveEscId]       = useState(null);
    const [showNotesPanel, setShowNotesPanel] = useState(false);
    const [currentPage, setCurrentPage]       = useState(1);
    const [filters, setFilters]               = useState({ ticketId: "", status: "", fromDate: "", toDate: "" });

    const PAGE_WINDOW  = 3;
    const itemsPerPage = 10;
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const mapEscalationsToTickets = (data) =>
        data.map((e) => ({
            escalationId:   e.id,
            ticketId:       String(e.ticket_id && e.ticket_id !== 0 ? `TKT-${e.ticket_id}` : `ESC-${e.id}`),
            convoId:        String(e.conversation_id),
            sessionId:      String(e.session_id),
            reason:         e.reason || "",
            assignedToName: e.assigned_to_name || "Unassigned",
            assignedTo:     e.assigned_to || "Unassigned",
            priority:       (e.priority || "medium").toLowerCase(),
            status:         e.status === "PENDING" ? "Open" : e.status,
            date:           new Date(e.created_at).toISOString().split("T")[0],
            created_at:     e.created_at,
        }));

    const fetchEscalations = async () => {
        try {
            const res = await APICall.getT("/conversation/escalation");
            const list = Array.isArray(res) ? res : (res?.escalations || []);
            setTickets(mapEscalationsToTickets(list));
        } catch (err) { showMainToast(err.message || "Failed to load tickets.", "danger"); }
    };

    const [onlineAgentIds, setOnlineAgentIds] = useState([]);

    const fetchAgents = async () => {
        try { const res = await APICall.getT("/hrms/users"); setAgents(res || []); }
        catch { showMainToast("Failed to fetch agents.", "danger"); }
    };

    const fetchOnlineAgents = async () => {
        try {
            const res = await APICall.getT("/conversation/agents/online");
            setOnlineAgentIds(res?.online_agent_ids || []);
        } catch { /* ignore */ }
    };

    useEffect(() => { fetchAgents(); fetchEscalations(); fetchOnlineAgents(); }, []);
    useEffect(() => {
        const id = setInterval(() => { fetchEscalations(); fetchOnlineAgents(); }, 15_000);
        return () => clearInterval(id);
    }, []);
    useEffect(() => { setCurrentPage(1); }, [filters, tickets.length]);

    const filteredTickets = tickets.filter((t) => {
        const matchTicket = String(t.ticketId || "").toLowerCase().includes(filters.ticketId.toLowerCase());
        const matchStatus = !filters.status || t.status === filters.status;
        const ticketDate  = new Date(t.date);
        const fromDate    = filters.fromDate ? new Date(filters.fromDate) : null;
        const toDate      = filters.toDate   ? new Date(filters.toDate)   : null;
        const matchDate   = (!fromDate || ticketDate >= fromDate) && (!toDate || ticketDate <= toDate);
        return matchTicket && matchStatus && matchDate;
    });

    const totalPages = Math.max(1, Math.ceil(filteredTickets.length / itemsPerPage));

    const paginatedTickets = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredTickets.slice(start, start + itemsPerPage);
    }, [filteredTickets, currentPage]);

    const getPageNumbers = () => {
        const half = Math.floor(PAGE_WINDOW / 2);
        let start = Math.max(1, currentPage - half);
        let end   = start + PAGE_WINDOW - 1;
        if (end > totalPages) { end = totalPages; start = Math.max(1, end - PAGE_WINDOW + 1); }
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const openEdit = (ticket) => { setEditingTicket({ ...ticket }); setShowModal(true); };

    const saveTicket = async () => {
        try {
            await APICall.postT(`/conversation/update_escalation/${editingTicket.escalationId}`, {
                assigned_to: editingTicket.assignedTo,
                priority:    editingTicket.priority || "MEDIUM",
                conversation_id: editingTicket.convoId,
                reason:      editingTicket.reason,
            });
            setShowModal(false); setEditingTicket(null); fetchEscalations();
        } catch { showMainToast("Failed to update escalation.", "danger"); }
    };

    const deleteTicket = async (escalationId) => {
        if (!await confirmMain("Delete this ticket? This cannot be undone.")) return;
        try { await APICall.postT(`/conversation/delete_escalation/${escalationId}`); fetchEscalations(); showMainToast("Ticket deleted.", "success"); }
        catch { showMainToast("Failed to delete escalation.", "danger"); }
    };

    const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

    return (
        <>
            <MainToast /><MainConfirm />
            {/* ── Filter bar ────────────────────────────────── */}
            <div className="tm-filters">
                <input className="tm-input" style={{ flex: 1, minWidth: 140 }}
                    placeholder="Search ticket ID…"
                    value={filters.ticketId}
                    onChange={e => setFilter("ticketId", e.target.value)} />

                <select className="tm-select" value={filters.status}
                    onChange={e => setFilter("status", e.target.value)}>
                    <option value="">All statuses</option>
                    <option>OPEN</option>
                    <option>ASSIGNED</option>
                    <option>REOPENED</option>
                    <option>CLOSED</option>
                </select>

                <input type="date" className="tm-input" value={filters.fromDate}
                    onChange={e => setFilter("fromDate", e.target.value)} />

                <input type="date" className="tm-input" value={filters.toDate}
                    onChange={e => setFilter("toDate", e.target.value)} />

                {(filters.ticketId || filters.status || filters.fromDate || filters.toDate) && (
                    <button className="tm-btn tm-btn-ghost tm-btn-sm"
                        onClick={() => setFilters({ ticketId: "", status: "", fromDate: "", toDate: "" })}>
                        Clear
                    </button>
                )}
            </div>

            {/* ── Live Agents Bar ──────────────────────────── */}
            <div className="tm-live-bar">
                <span className="tm-live-label">
                    <Circle size={8} fill="#22c55e" stroke="none" />
                    Live Agents
                </span>
                <div className="tm-live-agents">
                    {agents.filter(a => onlineAgentIds.includes(a.id)).length === 0 ? (
                        <span className="tm-live-none">No agents online</span>
                    ) : (
                        agents.filter(a => onlineAgentIds.includes(a.id)).map(a => (
                            <span key={a.id} className="tm-live-chip">
                                <Circle size={6} fill="#22c55e" stroke="none" />
                                {a.fullname || a.email}
                            </span>
                        ))
                    )}
                </div>
                <span className="tm-live-count">
                    {agents.filter(a => onlineAgentIds.includes(a.id)).length} / {agents.length} online
                </span>
            </div>

            {/* ── Main card ─────────────────────────────────── */}
            <div className="tm-card">
                {/* Table */}
                <div className="tm-table-panel">
                    <table className="tm-table">
                        <thead>
                            <tr>
                                <th>Ticket</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Assigned To</th>
                                <th>Reason</th>
                                <th>SLA</th>
                                <th>Date</th>
                                <th style={{ textAlign: "center" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedTickets.length === 0 && (
                                <tr><td colSpan={8}><div className="tm-empty">No tickets found.</div></td></tr>
                            )}
                            {paginatedTickets.map((t) => (
                                <tr key={t.escalationId}
                                    className={activeEscId === t.escalationId ? "is-active" : ""}>
                                    <td><span className="tm-ticket-id">{t.ticketId}</span></td>
                                    <td>
                                        <span className={`tm-badge ${priorityClass(t.priority)}`}>
                                            {t.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`tm-badge ${statusClass(t.status)}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td>
                                        {t.assignedToName && t.assignedToName !== "Unassigned" ? (
                                            <span className="tm-assigned-agent">
                                                <Circle size={6} fill={onlineAgentIds.includes(Number(t.assignedTo)) ? "#22c55e" : "#9ca3af"} stroke="none" />
                                                {t.assignedToName}
                                            </span>
                                        ) : (
                                            <span style={{ color: "var(--tm-text3)", fontSize: 12.5 }}>Unassigned</span>
                                        )}
                                    </td>
                                    <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {t.reason || <span style={{ color: "var(--tm-text3)" }}>—</span>}
                                    </td>
                                    <td><SLABadge createdAt={t.created_at} priority={t.priority} /></td>
                                    <td style={{ color: "var(--tm-text2)", fontSize: 12.5 }}>{t.date}</td>
                                    <td>
                                        <div className="tm-actions" style={{ justifyContent: "center" }}>
                                            <button className="tm-action-btn" title="View chat"
                                                onClick={() => setActiveSessionId(t.sessionId)}>
                                                <LucideBotMessageSquare size={15} />
                                            </button>
                                            <button
                                                className={`tm-action-btn ${activeEscId === t.escalationId && showNotesPanel ? "active-notes" : ""}`}
                                                title="Internal notes"
                                                onClick={() => {
                                                    if (activeEscId === t.escalationId && showNotesPanel) {
                                                        setShowNotesPanel(false); setActiveEscId(null);
                                                    } else {
                                                        setActiveEscId(t.escalationId); setShowNotesPanel(true);
                                                    }
                                                }}>
                                                <MessageSquare size={15} />
                                            </button>
                                            {canEdit && (
                                                <button className="tm-action-btn" title="Edit" onClick={() => openEdit(t)}>
                                                    <Edit2 size={15} />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button className="tm-action-btn danger" title="Delete"
                                                    onClick={() => deleteTicket(t.escalationId)}>
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="tm-pagination">
                            <span>Page {currentPage} of {totalPages} · {filteredTickets.length} tickets</span>
                            <div className="tm-pages">
                                <button className="tm-page-btn" disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
                                {getPageNumbers().map(p => (
                                    <button key={p} className={`tm-page-btn ${currentPage === p ? "is-active" : ""}`}
                                        onClick={() => setCurrentPage(p)}>{p}</button>
                                ))}
                                <button className="tm-page-btn" disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => p + 1)}>Next</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Notes panel */}
                {showNotesPanel && (
                    <div className="tm-notes-panel">
                        <div className="tm-notes-header">
                            <span className="tm-notes-title">
                                <MessageSquare size={14} />
                                Notes #{activeEscId}
                            </span>
                            <button className="tm-btn-icon"
                                onClick={() => { setShowNotesPanel(false); setActiveEscId(null); }}>
                                <X size={14} />
                            </button>
                        </div>
                        <AgentNotesPanel escalationId={activeEscId} />
                    </div>
                )}

                {/* Chat widget */}
                {activeSessionId && (
                    <div className="tm-chat-col">
                        <ChatWidget key={activeSessionId} agentId={user.id} sessionId={activeSessionId}
                            title={`Session ${activeSessionId}`}
                            setActiveSessionId={setActiveSessionId} />
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered dialogClassName="tm-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Ticket</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {[
                            { label: "Assigned To", field: "assignedTo", type: "select",
                              options: [{ value: "", label: "Select agent" }, ...agents.map(a => ({ value: a.id, label: a.fullname }))] },
                            { label: "Priority", field: "priority", type: "select",
                              options: ["low","medium","high","urgent"].map(v => ({ value: v, label: v.charAt(0).toUpperCase()+v.slice(1) })) },
                            { label: "Status", field: "status", type: "select",
                              options: ["Open","In Progress","Closed"].map(v => ({ value: v, label: v })) },
                        ].map(({ label, field, type, options }) => (
                            <div key={field}>
                                <label className="tm-form-label">{label}</label>
                                <select className="tm-form-control"
                                    value={editingTicket?.[field] || ""}
                                    onChange={e => setEditingTicket({ ...editingTicket, [field]: e.target.value })}>
                                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                        ))}
                        <div>
                            <label className="tm-form-label">Reason</label>
                            <textarea className="tm-form-control" rows={3}
                                value={editingTicket?.reason || ""}
                                onChange={e => setEditingTicket({ ...editingTicket, reason: e.target.value })} />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button className="tm-btn tm-btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                    <button className="tm-btn tm-btn-primary" onClick={saveTicket}>Save changes</button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

const TicketManagement = () => (
    <NormalLayout>
        <TicketManagementContent />
    </NormalLayout>
);

export default TicketManagement;
