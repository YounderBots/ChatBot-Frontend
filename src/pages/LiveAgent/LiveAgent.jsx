/**
 * LiveAgent.jsx — Real-time agent workspace.
 *
 * Tabs:
 *   1. Escalation Queue   — live list of open/pending tickets with SLA timer
 *   2. Canned Responses   — search + manage quick-reply macros
 */
import { CheckCircle, Clock, MessageSquare, Plus, Search, Trash2, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Alert, Badge, Button, Card, Col, Form,
  Modal, Row, Spinner, Table
} from "react-bootstrap";
import APICall from "../../APICalls/APICall";
import TabComponent from "../../components/TabComponent";
import { useConfirm } from "../../components/useConfirm";
import { useToast } from "../../components/useToast";

// ─── Helpers ────────────────────────────────────────────────────────────────

const PRIORITY_VARIANT = { urgent: "danger", high: "warning", medium: "primary", low: "secondary" };

function minutesSince(isoStr) {
  if (!isoStr) return null;
  return Math.floor((Date.now() - new Date(isoStr).getTime()) / 60000);
}

function SLABadge({ createdAt, priority }) {
  const thresholds = { urgent: 15, high: 60, medium: 120, low: 480 };
  const elapsed = minutesSince(createdAt);
  if (elapsed === null) return null;
  const limit = thresholds[priority] || 120;
  const pct = Math.min((elapsed / limit) * 100, 100);
  const variant = pct >= 100 ? "danger" : pct >= 75 ? "warning" : "success";
  return (
    <Badge bg={variant} className="ms-1">
      <Clock size={10} className="me-1" />
      {elapsed}m
    </Badge>
  );
}

// ─── Tab 1: Escalation Queue ─────────────────────────────────────────────────

function EscalationQueueTab() {
  const [tickets, setTickets]     = useState([]);
  const [agents, setAgents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [assignModal, setAssignModal] = useState(null);
  const [assignTo, setAssignTo]   = useState("");
  const [saving, setSaving]       = useState(false);
  const [statusFilter, setStatusFilter] = useState("open");
  const { showToast, ToastContainer } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [escRes, agentsRes] = await Promise.all([
        APICall.getT("/conversation/escalation"),
        APICall.getT("/hrms/users"),
      ]);
      const list = Array.isArray(escRes) ? escRes : (escRes?.escalations || []);
      setTickets(list);
      setAgents(agentsRes || []);
    } catch (e) {
      setError("Failed to load escalations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tickets.filter(t => {
    if (!statusFilter) return true;
    return (t.status || "").toLowerCase().includes(statusFilter.toLowerCase());
  });

  const handleAssign = async () => {
    if (!assignModal || !assignTo) return;
    setSaving(true);
    try {
      await APICall.postT(`/conversation/update_escalation/${assignModal.id}`, {
        assigned_to: assignTo,
        priority: assignModal.priority,
        reason: assignModal.reason,
      });
      setAssignModal(null);
      setAssignTo("");
      load();
    } catch (e) {
      showToast(e?.message || "Failed to assign ticket.", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleResolve = async (id) => {
    if (!await confirm("Mark this ticket as resolved?", { confirmLabel: "Resolve", variant: "success" })) return;
    try {
      await APICall.postT(`/conversation/update_escalation/${id}`, { status: "RESOLVED" });
      load();
      showToast("Ticket resolved.", "success");
    } catch (e) {
      showToast(e?.message || "Failed to resolve ticket.", "danger");
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner /></div>;

  return (
    <div className="p-3">
      <ToastContainer /><ConfirmDialog />
      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-2 mb-3 align-items-center">
        <Col md={4}>
          <Form.Select size="sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="resolved">Resolved</option>
          </Form.Select>
        </Col>
        <Col className="text-end">
          <Button size="sm" variant="outline-primary" onClick={load}>Refresh</Button>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Table hover responsive className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th>Ticket</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Assigned</th>
              <th>SLA</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center text-muted py-4">No tickets found.</td></tr>
            )}
            {filtered.map(t => (
              <tr key={t.id}>
                <td><strong>#{t.ticket_id || t.id}</strong></td>
                <td>
                  <Badge bg={PRIORITY_VARIANT[t.priority?.toLowerCase()] || "secondary"}>
                    {t.priority || "medium"}
                  </Badge>
                </td>
                <td>{t.status}</td>
                <td className="text-truncate" style={{ maxWidth: 160 }}>{t.reason}</td>
                <td>{t.assigned_to_name || <span className="text-muted">Unassigned</span>}</td>
                <td><SLABadge createdAt={t.created_at} priority={t.priority?.toLowerCase()} /></td>
                <td>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-primary"
                      onClick={() => { setAssignModal(t); setAssignTo(t.assigned_to || ""); }}>
                      Assign
                    </Button>
                    {t.status !== "RESOLVED" && (
                      <Button size="sm" variant="outline-success" onClick={() => handleResolve(t.id)}>
                        <CheckCircle size={13} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* Assign Modal */}
      <Modal show={!!assignModal} onHide={() => setAssignModal(null)} centered fullscreen="sm-down">
        <Modal.Header closeButton>
          <Modal.Title>Assign Ticket #{assignModal?.ticket_id || assignModal?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Assign to Agent</Form.Label>
            <Form.Select value={assignTo} onChange={e => setAssignTo(e.target.value)}>
              <option value="">Select agent…</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.fullname || a.email}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setAssignModal(null)}>Cancel</Button>
          <Button className="primaryBtn" onClick={handleAssign} disabled={saving || !assignTo}>
            {saving ? <Spinner size="sm" /> : "Assign"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// ─── Tab 2: Canned Responses ─────────────────────────────────────────────────

function CannedResponsesTab() {
  const [responses, setResponses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch]         = useState("");
  const [catFilter, setCatFilter]   = useState("");
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState({ name: "", shortcut: "", category: "", body: "" });
  const [saving, setSaving]         = useState(false);
  const [copied, setCopied]         = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search)    params.append("search",   search);
      if (catFilter) params.append("category", catFilter);
      const res = await APICall.getT(`/canned?${params}`);
      setResponses(res?.responses || []);
      setCategories(res?.categories || []);
    } catch {
      setError("Failed to load canned responses.");
    } finally {
      setLoading(false);
    }
  }, [search, catFilter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", shortcut: "", category: "", body: "" });
    setShowModal(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    setForm({ name: r.name, shortcut: r.shortcut || "", category: r.category || "", body: r.body });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.body) { alert("Name and body are required."); return; }
    setSaving(true);
    try {
      if (editing) {
        await APICall.postT(`/canned/${editing.id}`, form);
      } else {
        await APICall.postT("/canned", form);
      }
      setShowModal(false);
      load();
    } catch {
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this canned response?")) return;
    try {
      await APICall.postT(`/canned/${id}/delete`, {});
      load();
    } catch {
      alert("Failed to delete.");
    }
  };

  const copyBody = (r) => {
    navigator.clipboard.writeText(r.body).catch(() => {});
    setCopied(r.id);
    setTimeout(() => setCopied(null), 1500);
    APICall.postT(`/canned/${r.id}/use`, {}).catch(() => {});
  };

  if (loading) return <div className="text-center py-5"><Spinner /></div>;

  return (
    <div className="p-3">
      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-2 mb-3 align-items-center">
        <Col md={4}>
          <div className="input-group input-group-sm">
            <span className="input-group-text"><Search size={14} /></span>
            <Form.Control placeholder="Search responses…" value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
        </Col>
        <Col md={3}>
          <Form.Select size="sm" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </Form.Select>
        </Col>
        <Col className="text-end">
          <Button size="sm" className="primaryBtn" onClick={openCreate}>
            <Plus size={14} className="me-1" /> New Response
          </Button>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Table hover responsive className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Shortcut</th>
              <th>Category</th>
              <th>Body</th>
              <th>Uses</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {responses.length === 0 && (
              <tr><td colSpan={6} className="text-center text-muted py-4">No canned responses yet.</td></tr>
            )}
            {responses.map(r => (
              <tr key={r.id}>
                <td><strong>{r.name}</strong></td>
                <td>{r.shortcut ? <Badge bg="light" text="dark">/{r.shortcut}</Badge> : "—"}</td>
                <td>{r.category || "—"}</td>
                <td className="text-truncate" style={{ maxWidth: 220 }}>{r.body}</td>
                <td>{r.use_count || 0}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-secondary" onClick={() => copyBody(r)}>
                      {copied === r.id ? <CheckCircle size={13} /> : <MessageSquare size={13} />}
                    </Button>
                    <Button size="sm" variant="outline-primary" onClick={() => openEdit(r)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(r.id)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* Create / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered fullscreen="sm-down">
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Edit Response" : "New Canned Response"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-2">
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control size="sm" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Shortcut</Form.Label>
                  <Form.Control size="sm" placeholder="/greeting" value={form.shortcut}
                    onChange={e => setForm({ ...form, shortcut: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Control size="sm" placeholder="e.g. Billing, Support" value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Body <span className="text-danger">*</span></Form.Label>
                  <Form.Control as="textarea" rows={4} size="sm" value={form.body}
                    onChange={e => setForm({ ...form, body: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button className="primaryBtn" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" /> : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const LiveAgent = () => {
  const pageContent = {
    title: "Live Agent",
    subTitle: "Real-time escalation queue and agent tools",
    tabs: [
      { tabTitle: "Escalation Queue", tabKey: "queue",  tabContent: <EscalationQueueTab /> },
      { tabTitle: "Canned Responses", tabKey: "canned", tabContent: <CannedResponsesTab /> },
    ],
  };

  return (
    <div className="h-100">
      <TabComponent pageContent={pageContent} />
    </div>
  );
};

export default LiveAgent;
