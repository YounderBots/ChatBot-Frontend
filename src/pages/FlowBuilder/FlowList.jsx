/**
 * FlowList.jsx — Table of all conversation flows with CRUD + publish actions.
 */
import { GitBranch, History, Plus, RotateCcw, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Card, ListGroup, Modal, Offcanvas, Spinner, Table } from "react-bootstrap";
import APICall from "../../APICalls/APICall";
import { useConfirm } from "../../components/useConfirm";
import { useToast } from "../../components/useToast";

const STATUS_VARIANT = { PUBLISHED: "success", DRAFT: "secondary", DELETED: "danger" };

const FlowList = ({ onEdit, onCreateNew }) => {
  const [flows, setFlows]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [versions, setVersions]   = useState([]);
  const [historyFlow, setHistoryFlow] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { showToast, ToastContainer } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await APICall.getT("/flows");
      setFlows(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load flows.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // The list endpoint (/flows) returns summaries WITHOUT flow_data, so opening
  // the editor with a row object would drop the graph and show the default
  // start/end scaffold. Fetch the full flow (GET /flows/{id} includes flow_data)
  // before handing it to the editor.
  const handleEdit = async (f) => {
    try {
      const full = await APICall.getT(`/flows/${f.id}`);
      onEdit(full && full.id ? full : f);
    } catch {
      showToast("Couldn't load the flow's canvas — opening summary only.", "warning");
      onEdit(f);
    }
  };

  const handlePublish = async (id) => {
    try {
      await APICall.postT(`/flows/${id}/publish`, {});
      load();
      showToast("Flow published.", "success");
    } catch (e) {
      showToast(e?.message || "Failed to publish flow.", "danger");
    }
  };

  const handleUnpublish = async (id) => {
    try {
      await APICall.postT(`/flows/${id}/unpublish`, {});
      load();
      showToast("Flow unpublished.", "warning");
    } catch (e) {
      showToast(e?.message || "Failed to unpublish flow.", "danger");
    }
  };

  const handleToggle = async (id) => {
    try {
      await APICall.postT(`/flows/${id}/toggle`, {});
      load();
    } catch (e) {
      showToast(e?.message || "Failed to toggle flow.", "danger");
    }
  };

  const handleHistory = async (flow) => {
    setHistoryFlow(flow);
    setVersions([]);
    setHistoryOpen(true);
    try {
      const data = await APICall.getT(`/flows/${flow.id}/versions`);
      setVersions(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load version history.", "danger");
    }
  };

  const handleRevert = async (flowId, versionId, versionNum) => {
    if (!await confirm(`Revert to version ${versionNum}? The flow will be set to DRAFT.`)) return;
    try {
      await APICall.postT(`/flows/${flowId}/revert/${versionId}`, {});
      setHistoryOpen(false);
      load();
      showToast(`Reverted to version ${versionNum}.`, "success");
    } catch (e) {
      showToast(e?.message || "Failed to revert flow.", "danger");
    }
  };

  const handleDelete = async (id) => {
    if (!await confirm("Delete this flow? This cannot be undone.")) return;
    try {
      await APICall.postT(`/flows/${id}/delete`, {});
      load();
      showToast("Flow deleted.", "success");
    } catch (e) {
      showToast(e?.message || "Failed to delete flow.", "danger");
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner /></div>;

  return (
    <div className="p-3">
      <ToastContainer />
      <ConfirmDialog />
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="mb-0 fw-semibold">Conversation Flows</h6>
          <small className="text-muted">
            Drag-and-drop flows that guide users through multi-step conversations.
          </small>
        </div>
        <Button size="sm" className="primaryBtn" onClick={onCreateNew}>
          <Plus size={14} className="me-1" /> New Flow
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Table hover responsive className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Trigger</th>
              <th>Nodes</th>
              <th>Status</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flows.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted py-5">
                  <GitBranch size={28} className="mb-2 d-block mx-auto text-muted" />
                  No flows yet. Click <strong>New Flow</strong> to create your first one.
                </td>
              </tr>
            )}
            {flows.map(f => (
              <tr key={f.id}>
                <td><strong>{f.name}</strong>{f.description && <div className="text-muted small">{f.description}</div>}</td>
                <td>
                  <Badge bg="light" text="dark" className="me-1">{f.trigger_type}</Badge>
                  {f.trigger_value && <code className="small">{f.trigger_value}</code>}
                </td>
                <td>{f.node_count ?? "—"}</td>
                <td><Badge bg={STATUS_VARIANT[f.status] || "secondary"}>{f.status}</Badge></td>
                <td>
                  <Button size="sm" variant="link" className="p-0" onClick={() => handleToggle(f.id)}>
                    {f.is_active
                      ? <ToggleRight size={18} className="text-success" />
                      : <ToggleLeft size={18} className="text-secondary" />}
                  </Button>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-primary" onClick={() => handleEdit(f)}>Edit</Button>
                    {f.status === "PUBLISHED" ? (
                      <Button size="sm" variant="outline-warning" onClick={() => handleUnpublish(f.id)}>
                        Unpublish
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline-success" onClick={() => handlePublish(f.id)}>
                        Publish
                      </Button>
                    )}
                    <Button size="sm" variant="outline-secondary" title="Version history" onClick={() => handleHistory(f)}>
                      <History size={13} />
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(f.id)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Offcanvas show={historyOpen} onHide={() => setHistoryOpen(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <History size={16} className="me-2" />
            Version History — {historyFlow?.name}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {versions.length === 0 ? (
            <p className="text-muted">No published versions yet.</p>
          ) : (
            <ListGroup variant="flush">
              {versions.map(v => (
                <ListGroup.Item key={v.id} className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>v{v.version}</strong>
                    <div className="text-muted small">
                      {v.created_at ? new Date(v.created_at).toLocaleString() : "—"}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    title="Revert to this version"
                    onClick={() => handleRevert(historyFlow.id, v.id, v.version)}
                  >
                    <RotateCcw size={13} className="me-1" />Revert
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default FlowList;
