import { useEffect, useRef, useState } from "react";
import APICall from "../../../../APICalls/APICall";
import AdvancedTab from "./tabs/AdvancedTab";
import BasicInfoTab from "./tabs/BasicInfoTab";
import QuickRepliesTab from "./tabs/QuickRepliesTab";
import ResponsesTab from "./tabs/ResponsesTab";
import TrainingPhrasesTab from "./tabs/TrainingPhrasesTab";

const DEMO_INTENTS = [
  {
    intent_name: "product_inquiry",
    displayName: "Product Inquiry",
    description: "User asks about a specific product or feature",
    priority: "Medium",
    status: "ACTIVE",
    phrases: [
      { text: "Tell me about your product", language: "en" },
      { text: "What features do you offer?", language: "en" },
      { text: "How does this work?", language: "en" },
      { text: "What plans are available?", language: "en" },
      { text: "Can you explain the pricing?", language: "en" },
    ],
    responses: [
      { id: "demo-r1", content: "Great question! We offer a range of plans starting from Free to Enterprise. Would you like me to walk you through the features?", type: "text", priority: 1, quickReplies: [
        { id: "demo-qr1", text: "View pricing", value: "view_pricing", actionType: "POSTBACK" },
        { id: "demo-qr2", text: "Book a demo",  value: "book_demo",   actionType: "POSTBACK" },
      ]},
      { id: "demo-r2", content: "I'd be happy to help! Our platform includes intent management, a knowledge base, live chat, and advanced analytics.", type: "text", priority: 2, quickReplies: [] },
    ],
  },
  {
    intent_name: "refund_request",
    displayName: "Refund Request",
    description: "User requests a refund or cancellation",
    priority: "High",
    status: "ACTIVE",
    phrases: [
      { text: "I want a refund",             language: "en" },
      { text: "How do I get my money back?", language: "en" },
      { text: "Cancel my subscription",      language: "en" },
      { text: "I was charged incorrectly",   language: "en" },
      { text: "I need to cancel my plan",    language: "en" },
    ],
    responses: [
      { id: "demo-r3", content: "I'm sorry to hear that. Could you please share your account email so I can look into your billing?", type: "text", priority: 1, quickReplies: [
        { id: "demo-qr3", text: "Provide email",   value: "provide_email",   actionType: "POSTBACK" },
        { id: "demo-qr4", text: "Talk to billing", value: "talk_to_billing", actionType: "POSTBACK" },
      ]},
    ],
  },
  {
    intent_name: "feature_request",
    displayName: "Feature Request",
    description: "User requests a new feature or improvement",
    priority: "Low",
    status: "ACTIVE",
    phrases: [
      { text: "Can you add this feature?",   language: "en" },
      { text: "I'd like to suggest an idea", language: "en" },
      { text: "Feature request",             language: "en" },
      { text: "Would it be possible to...",  language: "en" },
      { text: "I wish you had…",             language: "en" },
    ],
    responses: [
      { id: "demo-r5", content: "Thanks for the suggestion! We love hearing from our users. I'll pass this on to the product team.", type: "text", priority: 1, quickReplies: [] },
    ],
  },
];

const IntentModal = ({ isOpen, onClose, fetchIntents, intent, onSaveAndTest, mode }) => {


  // console.log("Rendering IntentModal with intent:", intent);
  // ✅ ALL HOOKS AT TOP (NO CONDITIONS)
  const [activeTab, setActiveTab] = useState("basic");
  const [responses, setResponses] = useState([]);
  const [activeQuickResponseId, setActiveQuickResponseId] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const advancedRef = useRef(null);
  const [trainingPhrases, setTrainingPhrases] = useState(
    intent?.trainingPhrases || []
  );


  const DEFAULT_INTENT = {
    intent_name: "",
    displayName: "",
    description: "",
    intent_type: "",
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
    // ── Validation ──────────────────────────────────────────
    const errs = [];
    if (!intentDraft.intent_name?.trim())
      errs.push("Intent name (snake_case) is required.");
    if (!intentDraft.displayName?.trim())
      errs.push("Display name is required.");
    if (trainingPhrases.length === 0)
      errs.push("Add at least one training phrase.");

    if (errs.length > 0) {
      setValidationErrors(errs);
      setActiveTab("basic");
      return;
    }
    setValidationErrors([]);
    // ────────────────────────────────────────────────────────

    const payload = buildBackendPayload();
    setSaving(true);
    try {
      if (intent?.id) {
        await APICall.postT(`/intents/intents/${intent.id}`, payload);
      } else {
        await APICall.postT("/intents/intents", payload);
      }
      onClose();
      fetchIntents();
    } catch (error) {
      setValidationErrors([error?.message || "Failed to save intent. Please try again."]);
    } finally {
      setSaving(false);
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


  const handleDelete = () => {};

  const fillDemo = () => {
    const demo = DEMO_INTENTS[Math.floor(Math.random() * DEMO_INTENTS.length)];
    setIntentDraft({
      intent_name: demo.intent_name,
      displayName: demo.displayName,
      description: demo.description,
      intent_type: "",
      category:    "",
      priority:    demo.priority,
      status:      demo.status,
    });
    setTrainingPhrases(demo.phrases.map((p, i) => ({
      id: `demo-${Date.now()}-${i}`,
      text: p.text,
      language: p.language,
    })));
    setResponses(demo.responses);
    setActiveTab("basic");
    setValidationErrors([]);
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
              <div className="d-flex align-items-center gap-2 ms-auto me-2">
                {mode === "add" && (
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={fillDemo}
                    title="Prefill with demo data for quick testing"
                    style={{ fontSize: 12 }}
                  >
                    Fill Demo Data
                  </button>
                )}
              </div>
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
            <div className="modal-footer bg-light px-4 flex-column align-items-stretch">
              {validationErrors.length > 0 && (
                <div className="alert alert-danger py-2 mb-2 w-100" style={{ fontSize: 13 }}>
                  {validationErrors.map((e, i) => <div key={i}>• {e}</div>)}
                </div>
              )}
              <div className="d-flex w-100">
                <button
                  className="btn btn-danger me-auto"
                  onClick={handleDelete}
                >
                  Delete Intent
                </button>
                <button className="btn btn-secondary me-2" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className="btn btn-secondary me-2"
                  onClick={handleSaveAndTest}
                  disabled={saving}
                >
                  Save & Test
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving
                    ? <><span className="spinner-border spinner-border-sm me-1" />Saving…</>
                    : "Save Intent"}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default IntentModal;
