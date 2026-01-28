  import React, { useState, useRef } from "react";
  import BasicInfoTab from "./tabs/BasicInfoTab";
  import TrainingPhrasesTab from "./tabs/TrainingPhrasesTab";
  import ResponsesTab from "./tabs/ResponsesTab";
  import QuickRepliesTab from "./tabs/QuickRepliesTab";
  import AdvancedTab from "./tabs/AdvancedTab";
import APICall from "../../../../APICalls/APICall";

  const IntentModal = ({ isOpen, onClose, intent, onSaveAndTest, mode }) => {


console.log("Rendering IntentModal with intent:", intent);
    // ✅ ALL HOOKS AT TOP (NO CONDITIONS)
    const [activeTab, setActiveTab] = useState("basic");
    const [responses, setResponses] = useState([]);
    const [activeQuickResponseId, setActiveQuickResponseId] = useState(null);
    const advancedRef = useRef(null);
    const [trainingPhrases, setTrainingPhrases] = useState(
      intent?.trainingPhrases || []
    );
    const [advancedConfig, setAdvancedConfig] = useState({
      contextsRequired: intent?.advanced?.contextsRequired || [],
      contextsSet: intent?.advanced?.contextsSet || [],
      fallback: intent?.advanced?.fallback || "clarify",
      threshold: intent?.advanced?.threshold || 60,
      enabled: intent?.advanced?.enabled ?? true,
    });
    const [intentDraft, setIntentDraft] = useState({
      
      intent_name: intent?.name || "",
      name: intent?.displayName || "",
      description: intent?.description || "",
      category: intent?.category.id || "",
      priority: intent?.priority || "Medium", 
      status: intent?.status || "Active",
    });
   

    console.log("Intent Modal Opened with intentDraft:", intentDraft);
    
    // ✅ SAFE early return AFTER hooks
    if (!isOpen) return null;

  


const buildBackendPayload = () => {
  return {
    // BASIC
    name: intentDraft.name,
    intent_name: intentDraft.intent_name,
    description: intentDraft.description,

    // CATEGORY → integer
    category: intentDraft.category
      ? Number(intentDraft.category)
      : null,

    // ENUMS
    priority: intentDraft.priority.toUpperCase(), // HIGH
    status: intentDraft.status.toUpperCase(),     // ACTIVE
    response_status: "ACTIVE",

    // ADVANCED
    fallback: advancedConfig.fallback || "clarify",
    confidence: Number(advancedConfig.threshold),

    context_requirement: advancedConfig.contextsRequired || [],
    context_output: advancedConfig.contextsSet || [],

    // TRAINING PHRASES
    phrases: trainingPhrases.map(p => ({
      phrase: p.phrase || p.text || p,
      language: p.language || "en"
    })),

    // RESPONSES + QUICK REPLIES
    responses: responses.map((res, index) => ({
      response_text: res.response_text || res.content,
      response_type: res.response_type || "text",
      priority: index + 1,

      quick_reply: (res.quick_reply || res.quickReplies || []).map(qr => ({
        button_text: qr.button_text || qr.label,
        action_type: qr.action_type || qr.actionType || "POSTBACK",
        message_value: qr.message_value || qr.value
      }))
    }))
  };
};



const handleSave = async () => {
  const payload = buildBackendPayload();

  console.log("FINAL BACKEND PAYLOAD 👉", payload);

  try {
    const response = await APICall.postT(
      "/intents/intents",
      payload
    );

    console.log("API intent RESPONSE ✅", response);
    onClose();
  } catch (error) {
    console.error("Save Intent Failed ", error);
    alert(
      error?.response?.data?.message ||
      "Failed to save intent. Please try again."
    );
  }
};

// show Existing Code




    const handleSaveAndTest = async () => {
      const payload = {
        ...intentDraft,
        responses,
        trainingPhrases,
        advanced: advancedConfig,
        testMode: true,
      };

      console.log("SAVE & TEST PAYLOAD 👉", payload);

      // 🔜 await api.saveAndTestIntent(payload);

      if (onSaveAndTest) onSaveAndTest(payload);
    };


    const handleDelete = () => {
      console.log("Delete intent");
    };



    

    return (
      <>
        <div className="modal-backdrop show" style={{ opacity: 0.5 }} />
        <div className="modal d-block">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 800 }}>
            <div className="modal-content rounded-4 shadow-lg" style={{ height: "85vh" }}>

              {/* Header */}
              <div className="modal-header px-4">
                <h5 className="fw-bold">
                 {mode === "add" && "Add Intent"}
  {mode === "edit" && "Edit Intent"}
  {mode === "duplicate" && "Duplicate Intent"}
                </h5>
                <button className="btn-close" onClick={onClose} />
              </div>

              {/* Tabs */}
              <div className="px-4 border-bottom bg-light">
                <ul className="nav nav-tabs border-0 gap-3">
                  {["basic", "phrases", "responses", "quick", "advanced"].map(
                    (tab) => (
                      <li key={tab} className="nav-item">
                        <button
                          className={`nav-link border-0 ${
                            activeTab === tab
                              ? "active fw-semibold"
                              : "text-muted"
                          }`}
                          onClick={() => setActiveTab(tab)}
                        >
                          {tab.toUpperCase()}
                        </button>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Body */}
              <div className="modal-body overflow-auto p-4">
                {/* {activeTab === "basic" && <BasicInfoTab intent={intent} />} */}
                {activeTab === "basic" && (
                  <BasicInfoTab
                    intent={intentDraft}
                    onChange={setIntentDraft}
                  />
                )}

                {activeTab === "phrases" && (
                  <TrainingPhrasesTab
                    phrases={trainingPhrases}
                    setPhrases={setTrainingPhrases}
                  />
                )}

                {activeTab === "responses" && (
                  <ResponsesTab
                    responses={responses}
                    setResponses={setResponses}
                    onSelectQuickResponse={setActiveQuickResponseId}
                  />
                )}
                {activeTab === "quick" && (
                  <QuickRepliesTab
                    responses={responses}
                    setResponses={setResponses}
                    activeResponseId={activeQuickResponseId}
                    onSelectQuickResponse={setActiveQuickResponseId} // ✅ needed
                  />
                )}
                {activeTab === "advanced" && (
                  <AdvancedTab
                    ref={advancedRef}
                    value={advancedConfig}
                    onChange={setAdvancedConfig}
                  />
                )}

              </div>

              {/* Footer */}
              <div className="modal-footer bg-light px-4">
                <button
                  className="btn btn-danger me-auto"
                  onClick={handleDelete}
                >
                  Delete Intent
                </button>

                <button className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={handleSaveAndTest}
                >
                  Save & Test
                </button>

                <button className="btn btn-primary" onClick={handleSave}>
                  Save Intent
                </button>
              </div>

            </div>
          </div>
        </div>
      </>
    );
  };

  export default IntentModal;
