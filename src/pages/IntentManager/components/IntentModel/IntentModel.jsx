  import React, { useState, useRef } from "react";
  import BasicInfoTab from "./tabs/BasicInfoTab";
  import TrainingPhrasesTab from "./tabs/TrainingPhrasesTab";
  import ResponsesTab from "./tabs/ResponsesTab";
  import QuickRepliesTab from "./tabs/QuickRepliesTab";
  import AdvancedTab from "./tabs/AdvancedTab";

  const IntentModal = ({ isOpen, onClose, intent, onSaveAndTest }) => {

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
      name: intent?.name || "",
      displayName: intent?.displayName || "",
      description: intent?.description || "",
      category: intent?.category || "",
      priority: intent?.priority || "Medium",
      status: intent?.status || "Active",
    });
    
    // ✅ SAFE early return AFTER hooks
    if (!isOpen) return null;

    const handleSave = async () => {
        const payload = {
          ...intentDraft,
          responses,
          trainingPhrases,
          advanced: advancedConfig,
          updatedAt: new Date().toISOString(),
        };

        console.log("FINAL BACKEND PAYLOAD 👉", payload);

        // 🔜 Future API call
        // await api.saveIntent(payload);

        onClose();
      };


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
                  {intent ? "Edit Intent" : "Add Intent"}
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
