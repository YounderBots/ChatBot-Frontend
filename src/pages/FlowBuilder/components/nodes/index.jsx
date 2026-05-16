/**
 * nodes/index.jsx — Custom ReactFlow node renderers.
 *
 * Each node renders as a compact card with:
 *   - Colored header showing node type
 *   - Body preview of key config field
 *   - Source and target handles for connecting edges
 */
import { Handle, Position } from "@xyflow/react";
import { Check, Globe, MessageSquare, Pencil, Users } from "lucide-react";

// ─── Shared styles ────────────────────────────────────────────────────────────

const nodeBox = (borderColor) => ({
  border: `2px solid ${borderColor}`,
  borderRadius: 10,
  background: "#fff",
  minWidth: 160,
  maxWidth: 220,
  boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
  fontSize: "0.78rem",
  overflow: "hidden",
});

const header = (bg, color = "#fff") => ({
  background: bg,
  color,
  padding: "4px 10px",
  fontWeight: 600,
  fontSize: "0.72rem",
  letterSpacing: "0.03em",
  textTransform: "uppercase",
});

const body = {
  padding: "6px 10px 8px",
  color: "#374151",
  wordBreak: "break-word",
};

const preview = (text) =>
  text ? <p style={{ margin: 0, lineHeight: 1.4 }}>{text.slice(0, 80)}{text.length > 80 ? "…" : ""}</p>
       : <p style={{ margin: 0, color: "#9ca3af", fontStyle: "italic" }}>Not configured</p>;

// ─── Node components ─────────────────────────────────────────────────────────

export function StartNode() {
  return (
    <div style={nodeBox("#16a34a")}>
      <div style={header("#16a34a")}>▶ Start</div>
      <div style={body}>
        <p style={{ margin: 0, color: "#6b7280", fontStyle: "italic", fontSize: "0.72rem" }}>
          Flow entry point
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export function MessageNode({ data }) {
  return (
    <div style={nodeBox("#2563eb")}>
      <div style={header("#2563eb")}><MessageSquare size={10} style={{marginRight:4,verticalAlign:'middle'}}/>Message</div>
      <div style={body}>{preview(data.text)}</div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export function ConditionNode({ data }) {
  const desc = data.variable && data.value
    ? `${data.variable} ${data.operator || "="} "${data.value}"`
    : undefined;
  return (
    <div style={nodeBox("#d97706")}>
      <div style={header("#d97706")}>⊕ Condition</div>
      <div style={body}>{preview(desc)}</div>
      <Handle type="target" position={Position.Top} />
      {/* Two source handles: yes (right) / no (left) */}
      <Handle type="source" position={Position.Right} id="yes" style={{ top: "50%", background: "#16a34a" }} />
      <Handle type="source" position={Position.Left}  id="no"  style={{ top: "50%", background: "#dc2626" }} />
    </div>
  );
}

export function SlotFillNode({ data }) {
  return (
    <div style={nodeBox("#7c3aed")}>
      <div style={header("#7c3aed")}><Pencil size={10} style={{marginRight:4,verticalAlign:'middle'}}/>Ask &amp; Save</div>
      <div style={body}>
        {preview(data.prompt)}
        {data.slot_name && (
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "0.7rem" }}>
            → saves to <code>{data.slot_name}</code>
          </p>
        )}
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export function ApiCallNode({ data }) {
  return (
    <div style={nodeBox("#0891b2")}>
      <div style={header("#0891b2")}><Globe size={10} style={{marginRight:4,verticalAlign:'middle'}}/>API Call</div>
      <div style={body}>{preview(data.url)}</div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export function EndNode({ data }) {
  const label = data.action === "handoff"
    ? <><Users size={11} style={{marginRight:4,verticalAlign:'middle'}}/>Handoff to agent</>
    : <><Check size={11} style={{marginRight:4,verticalAlign:'middle'}}/>Close conversation</>;
  return (
    <div style={nodeBox("#dc2626")}>
      <div style={header("#dc2626")}>■ End</div>
      <div style={body}>
        <p style={{ margin: 0 }}>{label}</p>
        {data.message && <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "0.7rem" }}>{data.message.slice(0, 60)}</p>}
      </div>
      <Handle type="target" position={Position.Top} />
    </div>
  );
}
