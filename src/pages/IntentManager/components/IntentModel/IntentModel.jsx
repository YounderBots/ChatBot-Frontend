import { useEffect, useRef, useState } from "react";
import APICall from "../../../../APICalls/APICall";
import AdvancedTab from "./tabs/AdvancedTab";
import BasicInfoTab from "./tabs/BasicInfoTab";
import QuickRepliesTab from "./tabs/QuickRepliesTab";
import ResponsesTab from "./tabs/ResponsesTab";
import TrainingPhrasesTab from "./tabs/TrainingPhrasesTab";

const IntentModal = ({ isOpen, onClose, fetchIntents, intent, onSaveAndTest, mode }) => {


  // console.log("Rendering IntentModal with intent:", intent);
  // ✅ ALL HOOKS AT TOP (NO CONDITIONS)
  const [activeTab, setActiveTab] = useState("basic");
  const [responses, setResponses] = useState([]);
  const [activeQuickResponseId, setActiveQuickResponseId] = useState(null);
  const advancedRef = useRef(null);
  const [trainingPhrases, setTrainingPhrases] = useState(
    intent?.trainingPhrases || []
  );


const DEFAULT_INTENT = {
  intent_name: "",
  displayName: "",
  description: "",
  category: "",
  priority: "Medium",
  status: "ACTIVE",
};

const DEFAULT_ADVANCED = {
  contextsRequired: [],
  contextsSet: [],
  fallback: "clarify",
  threshold: 60,
  enabled: true,
};

  const [advancedConfig, setAdvancedConfig] = useState(DEFAULT_ADVANCED);

  const [intentDraft, setIntentDraft] = useState(DEFAULT_INTENT);




const normalizeAdvanced = (intent) => {
  return {
    contextsRequired: intent.context_requirement || [],
    contextsSet: intent.context_output || [],

    fallback:
      intent.fallback === "YES"
        ? "clarify"
        : intent.fallback === "ESCALATE"
        ? "escalate"
        : "generic",

    threshold: Number(intent.confidence ?? 60),

    enabled: intent.response_status === "ACTIVE",
  };
};

const normalizeResponses = (responses = []) => {
  if (!Array.isArray(responses)) return [];
  return responses.map((r, index) => ({
    id: r.id || `${Date.now()}-${index}`,
    content: r.response_text || "",          // ✅ editor
    type: r.response_type || "text",          // ✅ dropdown
    preview: false,
    priority: r.priority || index + 1,
    quickReplies: (r.quick_reply || []).map(qr => ({
      id: qr.id || `${Math.random()}`,
      text: qr.button_text || "",
      value: qr.message_value || "",
      actionType: qr.action_type || "POSTBACK",
    })),
  }));
};



useEffect(() => {
  if (intent) {
    console.log("RAW ADVANCED FROM BACKEND 👉", {
      context_requirement: intent.context_requirement,
      context_output: intent.context_output,
      confidence: intent.confidence,
      response_status: intent.response_status,
      responses: intent.responses

    });
  }
}, [intent]);


useEffect(() => {
  if (!intent) {
    // ADD MODE → reset everything
    setIntentDraft(DEFAULT_INTENT);
    setTrainingPhrases([]);
    setResponses([]);
    setAdvancedConfig(DEFAULT_ADVANCED);
    return;
  }

  // EDIT MODE → populate fields
  setIntentDraft({
    intent_name: intent.intent_name || "",
    displayName: intent.name || intent.displayName || "",
    description: intent.description || "",
    category: intent.category?.id || intent.category || "",
    priority: intent.priority || "Medium",
    status: intent.status || intent.response_status || "ACTIVE",
  });

const normalizeArray = (val) => {
  if (Array.isArray(val)) return val;
  if (val && typeof val === "object") return Object.values(val);
  return [];
};

const rawPhrases = normalizeArray(
  intent.phrases ?? intent.trainingPhrases
);

setTrainingPhrases(
  rawPhrases.map(p => ({
    text: typeof p === "string" ? p : p.phrase || p.text || "",
    language: p.language || "en",
  }))
);


setResponses(normalizeResponses(intent.responses));



  setAdvancedConfig(normalizeAdvanced(intent));
}, [intent, mode]);



  // ✅ SAFE early return AFTER hooks
  if (!isOpen) return null;

  const buildBackendPayload = () => {
    return {
      // BASIC
      name: intentDraft.displayName,
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
          button_text: qr.text || qr.label,
          action_type: qr.action_type || qr.actionType || "POSTBACK",
          message_value: qr.message_value || qr.value
        }))
      }))
    };
  };



const handleSave = async () => {
  const payload = buildBackendPayload();
  console.log("SAVE PAYLOAD 👉", payload);

  try {
    let response;
    

    if (intent?.id) {
      // 🔄 UPDATE
      response = await APICall.postT(
        `/intents/intents/${intent.id}`,
        payload
      );
      console.log("API intent UPDATED ✅", response);
    } else {
      // ➕ CREATE
      response = await APICall.postT(
        "/intents/intents",
        payload
      );
      console.log("API intent CREATED ✅", response);
    }

    onClose();
    fetchIntents();

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

    // console.log("SAVE & TEST PAYLOAD 👉", payload);

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
                        className={`nav-link border-0 ${activeTab === tab
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
