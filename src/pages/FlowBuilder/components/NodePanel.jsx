/**
 * NodePanel.jsx — Left sidebar with draggable node type cards.
 * Users drag cards from here onto the ReactFlow canvas to add nodes.
 */
import {
  BrainCircuit, CheckCircle2, Flag, Globe, MessageSquare, Play,
} from "lucide-react";

const NODE_TYPES = [
  {
    type:  "start",
    label: "Start",
    icon:  <Play size={16} className="text-success" />,
    desc:  "Entry point of the flow",
    color: "#d1fae5",
  },
  {
    type:  "message",
    label: "Message",
    icon:  <MessageSquare size={16} className="text-primary" />,
    desc:  "Bot sends a text message",
    color: "#dbeafe",
  },
  {
    type:  "condition",
    label: "Condition",
    icon:  <BrainCircuit size={16} className="text-warning" />,
    desc:  "Branch based on intent or slot value",
    color: "#fef9c3",
  },
  {
    type:  "slot_fill",
    label: "Ask & Save",
    icon:  <Flag size={16} className="text-purple" style={{ color: "#7c3aed" }} />,
    desc:  "Ask user a question and store reply",
    color: "#ede9fe",
  },
  {
    type:  "api_call",
    label: "API Call",
    icon:  <Globe size={16} className="text-info" />,
    desc:  "POST to an external webhook URL",
    color: "#e0f2fe",
  },
  {
    type:  "end",
    label: "End",
    icon:  <CheckCircle2 size={16} className="text-danger" />,
    desc:  "Close flow or hand off to agent",
    color: "#fee2e2",
  },
];

const NodePanel = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      style={{
        width: 170,
        borderRight: "1px solid #e5e7eb",
        background: "#fafafa",
        overflowY: "auto",
        padding: "12px 8px",
        flexShrink: 0,
      }}
    >
      <p className="text-muted small fw-semibold mb-2 px-1" style={{ fontSize: "0.7rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
        Drag to add
      </p>
      {NODE_TYPES.map((n) => (
        <div
          key={n.type}
          draggable
          onDragStart={(e) => onDragStart(e, n.type)}
          style={{
            background: n.color,
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 8,
            padding: "8px 10px",
            marginBottom: 8,
            cursor: "grab",
            userSelect: "none",
          }}
        >
          <div className="d-flex align-items-center gap-2 mb-1">
            {n.icon}
            <span className="fw-semibold" style={{ fontSize: "0.8rem" }}>{n.label}</span>
          </div>
          <p className="mb-0 text-muted" style={{ fontSize: "0.7rem" }}>{n.desc}</p>
        </div>
      ))}
    </div>
  );
};

export default NodePanel;
