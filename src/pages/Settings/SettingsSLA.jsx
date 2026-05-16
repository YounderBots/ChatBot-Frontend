/**
 * SettingsSLA.jsx — SLA policy CRUD.
 * Uses Bootstrap / react-bootstrap to match the rest of the settings pages.
 */
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Alert, Badge, Button, Card, Col, Form,
  Modal, Row, Spinner, Table
} from "react-bootstrap";
import APICall from "../../APICalls/APICall";
import { usePermission } from "../../Context/AuthContext";
import { useConfirm } from "../../components/useConfirm";
import { useToast } from "../../components/useToast";

const PRIORITIES = ["low", "medium", "high", "urgent"];
const PRIORITY_VARIANT = { urgent: "danger", high: "warning", medium: "primary", low: "secondary" };

const defaultForm = {
  name: "", priority: "medium",
  first_response_minutes: 60,
  resolution_minutes: 480,
  breach_action: "notify",
  is_active: true,
};

const SettingsSLA = () => {
  const { canAdd, canEdit, canDelete } = usePermission('/Settings');
  const { showToast, ToastContainer } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [policies, setPolicies] = useState([]);
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
      const res = await APICall.getT("/sla/policies");
      setPolicies(res?.policies || []);
    } catch {
      setError("Failed to load SLA policies.");
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

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      priority: p.priority,
      first_response_minutes: p.first_response_minutes,
      resolution_minutes: p.resolution_minutes,
      breach_action: p.breach_action,
      is_active: p.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await APICall.postT(`/sla/policies/${editing.id}`, form);
      } else {
        await APICall.postT("/sla/policies", form);
      }
      setShowModal(false);
      load();
    } catch (e) {
      showToast(e?.message || "Failed to save SLA policy.", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!await confirm("Delete this SLA policy?")) return;
    try {
      await APICall.postT(`/sla/policies/${id}/delete`, {});
      load();
      showToast("Policy deleted.", "success");
    } catch (e) {
      showToast(e?.message || "Failed to delete.", "danger");
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner /></div>;

  return (
    <div className="p-3">
      <ToastContainer /><ConfirmDialog />
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="mb-0 fw-semibold">SLA Policies</h6>
          <small className="text-muted">Define response and resolution time targets per priority.</small>
        </div>
        {canAdd && (
          <Button size="sm" className="primaryBtn" onClick={openCreate}>
            <Plus size={14} className="me-1" /> Add Policy
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-sm">
        <Table hover responsive className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Priority</th>
              <th>First Response</th>
              <th>Resolution</th>
              <th>Breach Action</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.length === 0 && (
              <tr><td colSpan={7} className="text-center text-muted py-4">No SLA policies defined yet.</td></tr>
            )}
            {policies.map(p => (
              <tr key={p.id}>
                <td><strong>{p.name}</strong></td>
                <td><Badge bg={PRIORITY_VARIANT[p.priority]}>{p.priority}</Badge></td>
                <td>{p.first_response_minutes} min</td>
                <td>{p.resolution_minutes} min</td>
                <td>{p.breach_action}</td>
                <td>
                  <Badge bg={p.is_active ? "success" : "secondary"}>
                    {p.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    {canEdit   && <Button size="sm" variant="outline-primary" onClick={() => openEdit(p)}>Edit</Button>}
                    {canDelete && <Button size="sm" variant="outline-danger" onClick={() => handleDelete(p.id)}><Trash2 size={13} /></Button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered fullscreen="sm-down">
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Edit SLA Policy" : "New SLA Policy"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-2">
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control size="sm" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Priority</Form.Label>
                  <Form.Select size="sm" value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>First Response (min)</Form.Label>
                  <Form.Control size="sm" type="number" min={1} value={form.first_response_minutes}
                    onChange={e => setForm({ ...form, first_response_minutes: +e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Resolution (min)</Form.Label>
                  <Form.Control size="sm" type="number" min={1} value={form.resolution_minutes}
                    onChange={e => setForm({ ...form, resolution_minutes: +e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Breach Action</Form.Label>
                  <Form.Select size="sm" value={form.breach_action}
                    onChange={e => setForm({ ...form, breach_action: e.target.value })}>
                    <option value="notify">Notify</option>
                    <option value="escalate">Escalate</option>
                    <option value="reassign">Reassign</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6} className="d-flex align-items-end pb-1">
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

export default SettingsSLA;
