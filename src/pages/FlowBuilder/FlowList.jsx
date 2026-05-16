/**
 * FlowList.jsx — Table of all conversation flows with CRUD + publish actions.
 */
import { GitBranch, Plus, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Spinner, Table } from "react-bootstrap";
import APICall from "../../APICalls/APICall";
import { useConfirm } from "../../components/useConfirm";
import { useToast } from "../../components/useToast";

const STATUS_VARIANT = { PUBLISHED: "success", DRAFT: "secondary", DELETED: "danger" };

const FlowList = ({ onEdit, onCreateNew }) => {
  const [flows, setFlows]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
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

  const handlePublish = async (id) => {
    try {
      await APICall.postT(`/flows/${id}/publish`, {});
      load();
      showToast("Flow published.", "success");
    } catch (e) {
      showToast(e?.message || "Failed to publish flow.", "danger");
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
                    <Button size="sm" variant="outline-primary" onClick={() => onEdit(f)}>Edit</Button>
                    {f.status !== "PUBLISHED" && (
                      <Button size="sm" variant="outline-success" onClick={() => handlePublish(f.id)}>
                        Publish
                      </Button>
                    )}
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
    </div>
  );
};

export default FlowList;
