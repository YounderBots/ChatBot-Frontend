/**
 * FlowEditor.jsx — Visual drag-and-drop flow canvas using @xyflow/react.
 *
 * Layout:
 *   Left   NodePanel  — draggable node type palette
 *   Center ReactFlow  — canvas with nodes and edges
 *   Right  NodeInspector — config panel for the selected node
 */
import {
  ReactFlow,
  addEdge,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Save, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, Col, Form, Row, Spinner } from "react-bootstrap";
import APICall from "../../APICalls/APICall";
import NodeInspector from "./components/NodeInspector";
import NodePanel from "./components/NodePanel";
import {
  StartNode, MessageNode, ConditionNode,
  SlotFillNode, ApiCallNode, EndNode,
} from "./components/nodes";

const NODE_TYPES = {
  start:     StartNode,
  message:   MessageNode,
  condition: ConditionNode,
  slot_fill: SlotFillNode,
  api_call:  ApiCallNode,
  end:       EndNode,
};

const DEFAULT_NODES = [
  { id: "start-1", type: "start",   position: { x: 200, y: 80  }, data: {} },
  { id: "end-1",   type: "end",     position: { x: 200, y: 320 }, data: { action: "close" } },
];

const DEMO_FLOWS = [
  {
    name: "FAQ Auto-Response",
    trigger: "intent",
    triggerVal: "operating_hours",
    nodes: [
      { id: "start-1",  type: "start",   position: { x: 200, y: 60  }, data: {} },
      { id: "msg-1",    type: "message", position: { x: 200, y: 180 }, data: { message: "Our support team is available Mon–Fri, 9 AM – 6 PM IST. The chatbot is here for you 24/7!" } },
      { id: "end-1",    type: "end",     position: { x: 200, y: 320 }, data: { action: "close" } },
    ],
    edges: [
      { id: "e1", source: "start-1", target: "msg-1",  markerEnd: { type: "arrowclosed" } },
      { id: "e2", source: "msg-1",   target: "end-1",  markerEnd: { type: "arrowclosed" } },
    ],
  },
  {
    name: "Lead Capture Flow",
    trigger: "always",
    triggerVal: "",
    nodes: [
      { id: "start-1",  type: "start",    position: { x: 200, y: 60  }, data: {} },
      { id: "msg-1",    type: "message",  position: { x: 200, y: 180 }, data: { message: "Hi! We'd love to stay in touch. Can I get your email address?" } },
      { id: "slot-1",   type: "slot_fill",position: { x: 200, y: 300 }, data: { slot: "email", prompt: "Please enter your email:" } },
      { id: "msg-2",    type: "message",  position: { x: 200, y: 430 }, data: { message: "Thanks! We'll reach out soon. Is there anything else I can help you with today?" } },
      { id: "end-1",    type: "end",      position: { x: 200, y: 560 }, data: { action: "close" } },
    ],
    edges: [
      { id: "e1", source: "start-1", target: "msg-1",  markerEnd: { type: "arrowclosed" } },
      { id: "e2", source: "msg-1",   target: "slot-1", markerEnd: { type: "arrowclosed" } },
      { id: "e3", source: "slot-1",  target: "msg-2",  markerEnd: { type: "arrowclosed" } },
      { id: "e4", source: "msg-2",   target: "end-1",  markerEnd: { type: "arrowclosed" } },
    ],
  },
];

let _idCounter = 100;
const newId = (type) => `${type}-${++_idCounter}`;

// ─── Inner canvas (must be inside ReactFlowProvider) ──────────────────────────

function Canvas({ flow, onSaved }) {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState(
    flow?.flow_data?.nodes || DEFAULT_NODES
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    flow?.flow_data?.edges || []
  );

  const [selected, setSelected] = useState(null);   // selected node
  const [name, setName]         = useState(flow?.name || "New Flow");
  const [trigger, setTrigger]   = useState(flow?.trigger_type || "intent");
  const [triggerVal, setTriggerVal] = useState(flow?.trigger_value || "");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  // Sync if a different flow is loaded
  useEffect(() => {
    if (flow) {
      setNodes(flow.flow_data?.nodes || DEFAULT_NODES);
      setEdges(flow.flow_data?.edges || []);
      setName(flow.name || "New Flow");
      setTrigger(flow.trigger_type || "intent");
      setTriggerVal(flow.trigger_value || "");
      setSelected(null);
    }
  }, [flow?.id]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, markerEnd: { type: "arrowclosed" } }, eds)),
    [setEdges]
  );

  // Drag-and-drop new node from NodePanel
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData("application/reactflow");
      if (!nodeType) return;

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const id = newId(nodeType);
      const newNode = {
        id,
        type: nodeType,
        position,
        data: _defaultData(nodeType),
      };
      setNodes((ns) => ns.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  // Node click → open inspector
  const onNodeClick = useCallback((_, node) => {
    setSelected(node);
  }, []);

  const onPaneClick = useCallback(() => setSelected(null), []);

  // Inspector update → patch node data
  const onNodeDataChange = useCallback((nodeId, newData) => {
    setNodes((ns) =>
      ns.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n))
    );
    setSelected((s) => (s?.id === nodeId ? { ...s, data: { ...s.data, ...newData } } : s));
  }, [setNodes]);

  const fillDemo = () => {
    const demo = DEMO_FLOWS[Math.floor(Math.random() * DEMO_FLOWS.length)];
    setName(demo.name);
    setTrigger(demo.trigger);
    setTriggerVal(demo.triggerVal);
    setNodes(demo.nodes);
    setEdges(demo.edges);
    setSelected(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        name,
        trigger_type:  trigger,
        trigger_value: triggerVal,
        flow_data:     { nodes, edges },
      };
      if (flow?.id) {
        await APICall.postT(`/flows/${flow.id}`, payload);
      } else {
        await APICall.postT("/flows", payload);
      }
      onSaved();
    } catch {
      setError("Failed to save flow.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 160px)" }}>
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="border-bottom bg-white px-3 py-2 d-flex align-items-center gap-3">
        <Form.Control
          size="sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Flow name"
          style={{ maxWidth: 220 }}
        />
        <Form.Select size="sm" value={trigger} onChange={(e) => setTrigger(e.target.value)} style={{ maxWidth: 130 }}>
          <option value="intent">Intent</option>
          <option value="keyword">Keyword</option>
          <option value="always">Always</option>
        </Form.Select>
        {trigger !== "always" && (
          <Form.Control
            size="sm"
            value={triggerVal}
            onChange={(e) => setTriggerVal(e.target.value)}
            placeholder={trigger === "intent" ? "intent_name" : "keyword"}
            style={{ maxWidth: 180 }}
          />
        )}
        <div className="ms-auto d-flex gap-2">
          {error && <span className="text-danger small align-self-center">{error}</span>}
          {!flow?.id && (
            <Button size="sm" variant="outline-secondary" onClick={fillDemo} title="Load a demo flow for quick testing">
              Fill Demo Data
            </Button>
          )}
          <Button size="sm" className="primaryBtn" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" /> : <><Save size={13} className="me-1" />Save</>}
          </Button>
        </div>
      </div>

      {/* ── Main layout ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left: node palette */}
        <NodePanel />

        {/* Center: canvas */}
        <div ref={reactFlowWrapper} style={{ flex: 1 }} onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={NODE_TYPES}
            fitView
            deleteKeyCode="Delete"
          >
            <Background gap={16} />
            <Controls />
            <MiniMap nodeStrokeWidth={3} zoomable pannable />
          </ReactFlow>
        </div>

        {/* Right: inspector */}
        {selected && (
          <NodeInspector
            node={selected}
            onChange={(data) => onNodeDataChange(selected.id, data)}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}

// ─── Page wrapper (provides ReactFlowProvider context) ────────────────────────

const FlowEditor = ({ flow, onSaved }) => {
  if (!flow) {
    return (
      <div className="text-center text-muted py-5">
        Select a flow to edit, or create a new one from the <strong>My Flows</strong> tab.
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <Canvas flow={flow} onSaved={onSaved} />
    </ReactFlowProvider>
  );
};

// ─── Default node data per type ───────────────────────────────────────────────

function _defaultData(type) {
  switch (type) {
    case "message":   return { text: "Hello! How can I help you?" };
    case "condition": return { variable: "intent", operator: "equals", value: "" };
    case "slot_fill": return { prompt: "Please enter your value:", slot_name: "user_input" };
    case "api_call":  return { url: "", payload_template: {} };
    case "end":       return { action: "close", message: "" };
    default:          return {};
  }
}

export default FlowEditor;
