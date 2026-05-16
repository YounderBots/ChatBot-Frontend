/**
 * NodeInspector.jsx — Right panel: config form for the selected node.
 * Shown when a node is clicked on the canvas.
 */
import { X } from "lucide-react";
import { Form } from "react-bootstrap";

const NodeInspector = ({ node, onChange, onClose }) => {
  const { type, data } = node;

  const set = (key, value) => onChange({ [key]: value });

  return (
    <div
      style={{
        width: 260,
        borderLeft: "1px solid #e5e7eb",
        background: "#fff",
        overflowY: "auto",
        padding: "16px 14px",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0 fw-semibold text-capitalize">{type.replace("_", " ")} Node</h6>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-sm btn-light p-1"
          aria-label="Close inspector"
        >
          <X size={14} />
        </button>
      </div>

      {/* message */}
      {type === "message" && (
        <Form.Group>
          <Form.Label className="small fw-semibold">Message text</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            size="sm"
            value={data.text || ""}
            onChange={(e) => set("text", e.target.value)}
            placeholder="What should the bot say?"
          />
          <Form.Text className="text-muted">Use {"{{slot_name}}"} to insert slot values.</Form.Text>
        </Form.Group>
      )}

      {/* condition */}
      {type === "condition" && (
        <>
          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold">Variable</Form.Label>
            <Form.Select size="sm" value={data.variable || "intent"} onChange={(e) => set("variable", e.target.value)}>
              <option value="intent">Intent</option>
              <option value="text">User text</option>
              <option value="custom">Slot name (type below)</option>
            </Form.Select>
            {data.variable === "custom" && (
              <Form.Control size="sm" className="mt-1" value={data.slot_name || ""} onChange={(e) => set("slot_name", e.target.value)} placeholder="slot_name" />
            )}
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold">Operator</Form.Label>
            <Form.Select size="sm" value={data.operator || "equals"} onChange={(e) => set("operator", e.target.value)}>
              <option value="equals">equals</option>
              <option value="contains">contains</option>
              <option value="not_equals">not equals</option>
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label className="small fw-semibold">Value</Form.Label>
            <Form.Control size="sm" value={data.value || ""} onChange={(e) => set("value", e.target.value)} placeholder="e.g. billing_inquiry" />
          </Form.Group>
          <Form.Text className="text-muted mt-1 d-block">Connect <strong>yes</strong> / <strong>no</strong> edges from this node to branches.</Form.Text>
        </>
      )}

      {/* slot_fill */}
      {type === "slot_fill" && (
        <>
          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold">Prompt</Form.Label>
            <Form.Control as="textarea" rows={2} size="sm" value={data.prompt || ""} onChange={(e) => set("prompt", e.target.value)} placeholder="What is your order number?" />
          </Form.Group>
          <Form.Group>
            <Form.Label className="small fw-semibold">Save as slot</Form.Label>
            <Form.Control size="sm" value={data.slot_name || ""} onChange={(e) => set("slot_name", e.target.value)} placeholder="order_number" />
            <Form.Text className="text-muted">Use {"{{order_number}}"} in later message nodes.</Form.Text>
          </Form.Group>
        </>
      )}

      {/* api_call */}
      {type === "api_call" && (
        <>
          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold">Webhook URL</Form.Label>
            <Form.Control size="sm" value={data.url || ""} onChange={(e) => set("url", e.target.value)} placeholder="https://your-api.com/webhook" />
          </Form.Group>
          <Form.Group>
            <Form.Label className="small fw-semibold">JSON Payload (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              size="sm"
              value={typeof data.payload_template === "string" ? data.payload_template : JSON.stringify(data.payload_template || {}, null, 2)}
              onChange={(e) => {
                try { set("payload_template", JSON.parse(e.target.value)); }
                catch { set("payload_template", e.target.value); }
              }}
              placeholder='{"key": "value"}'
            />
          </Form.Group>
        </>
      )}

      {/* end */}
      {type === "end" && (
        <>
          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold">Action</Form.Label>
            <Form.Select size="sm" value={data.action || "close"} onChange={(e) => set("action", e.target.value)}>
              <option value="close">Close conversation</option>
              <option value="handoff">Hand off to agent</option>
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label className="small fw-semibold">Closing message (optional)</Form.Label>
            <Form.Control as="textarea" rows={2} size="sm" value={data.message || ""} onChange={(e) => set("message", e.target.value)} placeholder="Thanks! Is there anything else?" />
          </Form.Group>
        </>
      )}

      {/* start */}
      {type === "start" && (
        <p className="text-muted small mb-0">
          The Start node is the entry point of this flow. Connect it to the first message or condition node.
        </p>
      )}
    </div>
  );
};

export default NodeInspector;
