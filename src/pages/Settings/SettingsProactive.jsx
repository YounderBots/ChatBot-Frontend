/**
 * SettingsProactive.jsx — Proactive chat trigger rule CRUD.
 */
import { Plus, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Alert, Badge, Button, Card, Col, Form,
  Modal, Row, Spinner, Table
} from "react-bootstrap";
import APICall from "../../APICalls/APICall";
import { usePermission } from "../../Context/AuthContext";
import { useConfirm } from "../../components/useConfirm";
import { useToast } from "../../components/useToast";

const defaultForm = {
  name: "", message: "",
  delay_seconds: 30,
  page_url_pattern: "",
  scroll_pct: "",
  visit_count_min: "",
  is_active: true,
};

const SettingsProactive = () => {
  const { canAdd, canEdit, canDelete } = usePermission('/Settings');
  const { showToast, ToastContainer } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(defaultForm);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await APICall.getT("/proactive");
      setTriggers(res?.triggers || []);
    } catch {
      setError("Failed to load proactive triggers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      name: t.name,
      message: t.message,
      delay_seconds: t.delay_seconds,
      page_url_pattern: t.page_url_pattern || "",
      scroll_pct: t.scroll_pct ?? "",
      visit_count_min: t.visit_count_min ?? "",
      is_active: t.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.message) { showToast("Name and message are required.", "warning"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        scroll_pct: form.scroll_pct !== "" ? +form.scroll_pct : null,
        visit_count_min: form.visit_count_min !== "" ? +form.visit_count_min : null,
      };
      if (editing) {
        await APICall.postT(`/proactive/${editing.id}`, payload);
      } else {
        await APICall.postT("/proactive", payload);
      }
      setShowModal(false);
      load();
      showToast("Trigger saved.", "success");
    } catch (e) {
      showToast(e?.message || "Failed to save trigger.", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await APICall.postT(`/proactive/${id}/toggle`, {});
      load();
    } catch (e) {
      showToast(e?.message || "Failed to toggle trigger.", "danger");
    }
  };

  const handleDelete = async (id) => {
    if (!await confirm("Delete this trigger?")) return;
    try {
      await APICall.postT(`/proactive/${id}/delete`, {});
      load();
      showToast("Trigger deleted.", "success");
    } catch (e) {
      showToast(e?.message || "Failed to delete trigger.", "danger");
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner /></div>;

  return (
    <div className="p-3">
      <ToastContainer /><ConfirmDialog />
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="mb-0 fw-semibold">Proactive Triggers</h6>
          <small className="text-muted">Automatically invite visitors to chat based on behaviour.</small>
        </div>
        {canAdd && (
          <Button size="sm" className="primaryBtn" onClick={openCreate}>
            <Plus size={14} className="me-1" /> Add Trigger
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-sm">
        <Table hover responsive className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Message</th>
              <th>Delay</th>
              <th>Page Pattern</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {triggers.length === 0 && (
              <tr><td colSpan={6} className="text-center text-muted py-4">No proactive triggers yet.</td></tr>
            )}
            {triggers.map(t => (
              <tr key={t.id}>
                <td><strong>{t.name}</strong></td>
                <td className="text-truncate" style={{ maxWidth: 200 }}>{t.message}</td>
                <td>{t.delay_seconds}s</td>
                <td>{t.page_url_pattern || <span className="text-muted">Any page</span>}</td>
                <td>
                  <Badge bg={t.is_active ? "success" : "secondary"}>
                    {t.is_active ? "Active" : "Paused"}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    {canEdit && (
                      <Button size="sm" variant="outline-secondary" onClick={() => handleToggle(t.id)}>
                        {t.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      </Button>
                    )}
                    {canEdit   && <Button size="sm" variant="outline-primary" onClick={() => openEdit(t)}>Edit</Button>}
                    {canDelete && <Button size="sm" variant="outline-danger" onClick={() => handleDelete(t.id)}><Trash2 size={13} /></Button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered fullscreen="sm-down">
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Edit Trigger" : "New Proactive Trigger"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-2">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control size="sm" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Message <span className="text-danger">*</span></Form.Label>
                  <Form.Control as="textarea" rows={2} size="sm" value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Delay (seconds)</Form.Label>
                  <Form.Control size="sm" type="number" min={0} value={form.delay_seconds}
                    onChange={e => setForm({ ...form, delay_seconds: +e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Min Scroll (%)</Form.Label>
                  <Form.Control size="sm" type="number" min={0} max={100} placeholder="Any"
                    value={form.scroll_pct}
                    onChange={e => setForm({ ...form, scroll_pct: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Min Visit Count</Form.Label>
                  <Form.Control size="sm" type="number" min={1} placeholder="Any"
                    value={form.visit_count_min}
                    onChange={e => setForm({ ...form, visit_count_min: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Page URL Pattern (regex or substring)</Form.Label>
                  <Form.Control size="sm" placeholder="e.g. /pricing or ^https://.*checkout"
                    value={form.page_url_pattern}
                    onChange={e => setForm({ ...form, page_url_pattern: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Check type="switch" label="Active" checked={form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.checked })} />
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
};

export default SettingsProactive;
