/**
 * FlowBuilder.jsx — Conversational Flow Builder page.
 *
 * Tabs:
 *   1. My Flows  — list, create, publish, delete flows
 *   2. Editor    — visual ReactFlow canvas for the selected flow
 */
import { useState } from "react";
import TabComponent from "../../components/TabComponent";
import FlowList from "./FlowList";
import FlowEditor from "./FlowEditor";

const FlowBuilder = () => {
  const [editingFlow, setEditingFlow] = useState(null); // { id, name, flow_data }
  const [activeTab, setActiveTab]     = useState("flows");

  const openEditor = (flow) => {
    setEditingFlow(flow);
    setActiveTab("editor");
  };

  const onSaved = () => {
    setActiveTab("flows");
    setEditingFlow(null);
  };

  const pageContent = {
    title:    "Flow Builder",
    subTitle: "Design visual conversation flows with drag-and-drop",
    tabs: [
      {
        tabTitle:   "My Flows",
        tabKey:     "flows",
        tabContent: (
          <FlowList
            onEdit={openEditor}
            onCreateNew={() => openEditor({ id: null, name: "New Flow", flow_data: null })}
          />
        ),
      },
      {
        tabTitle:   "Editor",
        tabKey:     "editor",
        tabContent: (
          <FlowEditor flow={editingFlow} onSaved={onSaved} />
        ),
      },
    ],
    activeTab,
    onTabChange: setActiveTab,
  };

  return (
    <div className="h-100">
      <TabComponent pageContent={pageContent} />
    </div>
  );
};

export default FlowBuilder;
