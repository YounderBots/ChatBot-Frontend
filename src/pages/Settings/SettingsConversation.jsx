import { useEffect, useState } from "react";
import { Alert, Button, Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import APICall from "../../APICalls/APICall";

const SettingsConversation = () => {
  const DEFAULTS = {
    confidenceThreshold: 60,
    contextTimeout: 30,
    maxConversationLength: 50,
    enableSentiment: false,
    description: "",
    enableAutoEscalation: false,
    escalationAttempts: 3,
    escalateOnNegative: false,
    escalationKeywords: [],
  };

  const [settings,            setSettings]            = useState(DEFAULTS);
  const [savedSettings,       setSavedSettings]       = useState(null);
  const [hasChanges,          setHasChanges]          = useState(false);
  const [lastSavedAt,         setLastSavedAt]         = useState(null);
  const [loading,             setLoading]             = useState(true);
  const [saving,              setSaving]              = useState(false);
  const [error,               setError]               = useState("");
  const [success,             setSuccess]             = useState("");
  const [contextTimeoutError, setContextTimeoutError] = useState("");
  const [maxConvError,        setMaxConvError]        = useState("");
  const [showKeywordModal,    setShowKeywordModal]    = useState(false);
  const [newKeyword,          setNewKeyword]          = useState("");
  const [newPriority,         setNewPriority]         = useState("HIGH");

  /* ── Load from API ── */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await APICall.getT("/settings/conversation");
        const ai  = res.ai_configuration  || {};
        const esc = res.auto_escalation   || {};
        const kws = res.escalation_keywords || [];

        const loaded = {
          confidenceThreshold:   ai.confidence_threshold    ?? 60,
          contextTimeout:        ai.context_timeout         ?? 30,
          maxConversationLength: ai.max_conversation_length ?? 50,
          enableSentiment:       ai.sentiment_analysis      ?? false,
          description:           ai.description             ?? "",
          enableAutoEscalation:  esc.auto_escalation_enabled ?? false,
          escalationAttempts:    esc.escalate_after_failures  ?? 3,
          escalateOnNegative:    esc.escalate_on_negative     ?? false,
          escalationKeywords:    kws.map(k => ({ label: k.keyword, priority: k.priority })),
        };
        setSettings(loaded);
        setSavedSettings(loaded);
      } catch (err) {
        setError("Failed to load settings. " + (err.message || ""));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ── Track unsaved changes ── */
  useEffect(() => {
    if (!savedSettings) return;
    const { escalationKeywords: _a, ...rest }  = settings;
    const { escalationKeywords: _b, ...saved } = savedSettings;
    setHasChanges(JSON.stringify(rest) !== JSON.stringify(saved));
  }, [settings, savedSettings]);

  /* ── Save to API ── */
  const handleSave = async () => {
    if (contextTimeoutError || maxConvError) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await APICall.postT("/settings/conversation", {
        ai_configuration: {
          description:             settings.description,
          confidence_threshold:    settings.confidenceThreshold,
          context_timeout:         settings.contextTimeout,
          max_conversation_length: settings.maxConversationLength,
          sentiment_analysis:      settings.enableSentiment,
        },
        auto_escalation: {
          auto_escalation_enabled: settings.enableAutoEscalation,
          escalate_after_failures: settings.escalationAttempts,
          escalate_on_negative:    settings.escalateOnNegative,
        },
      });
      setSavedSettings({ ...settings });
      setLastSavedAt(new Date());
      setHasChanges(false);
      setSuccess("Conversation settings saved.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (!savedSettings) return;
    setSettings({ ...savedSettings });
    setHasChanges(false);
    setContextTimeoutError("");
    setMaxConvError("");
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    setSettings(s => ({
      ...s,
      escalationKeywords: [...s.escalationKeywords, { label: newKeyword.trim(), priority: newPriority }],
    }));
    setNewKeyword("");
    setNewPriority("HIGH");
    setShowKeywordModal(false);
  };

  const updatePriority = (index, priority) => {
    setSettings(s => {
      const kws = [...s.escalationKeywords];
      kws[index] = { ...kws[index], priority };
      return { ...s, escalationKeywords: kws };
    });
  };

  const removeKeyword = (index) =>
    setSettings(s => ({ ...s, escalationKeywords: s.escalationKeywords.filter((_, i) => i !== index) }));

  const set = (patch) => setSettings(s => ({ ...s, ...patch }));

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <>
      {error   && <Alert variant="danger"  dismissible onClose={() => setError("")}  className="mb-3">{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess("")} className="mb-3">{success}</Alert>}

      {/* AI CONFIGURATION */}
      <h6 className="text-primary mb-3">AI Configuration</h6>

      <Row className="mb-3">
        <Col md={6} className="mb-3">
          <Form.Label className="fw-semibold">
            Confidence Threshold
            <span className="text-primary ms-2">({settings.confidenceThreshold}%)</span>
          </Form.Label>
          <Form.Range
            min={0} max={100}
            value={settings.confidenceThreshold}
            onChange={(e) => set({ confidenceThreshold: Number(e.target.value) })}
          />
          <Form.Label className="mt-2">Description</Form.Label>
          <Form.Control
            as="textarea" rows={3}
            value={settings.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="Optional description for this AI configuration"
          />
        </Col>

        <Col md={6} className="mb-3">
          <Form.Label>Context Timeout (minutes)</Form.Label>
          <Form.Control
            type="number"
            value={settings.contextTimeout === 0 ? "" : settings.contextTimeout}
            isInvalid={!!contextTimeoutError}
            onChange={(e) => {
              const v = e.target.value === "" ? "" : Number(e.target.value);
              set({ contextTimeout: v });
              if (v !== "" && v < 5)        setContextTimeoutError("Must be at least 5 minutes");
              else if (v !== "" && v > 120) setContextTimeoutError("Cannot exceed 120 minutes");
              else                          setContextTimeoutError("");
            }}
          />
          <Form.Control.Feedback type="invalid">{contextTimeoutError}</Form.Control.Feedback>
        </Col>

        <Col md={6} className="mb-3">
          <Form.Label>Max Conversation Length (messages)</Form.Label>
          <Form.Control
            type="number"
            value={settings.maxConversationLength}
            isInvalid={!!maxConvError}
            onChange={(e) => {
              const v = e.target.value;
              set({ maxConversationLength: v });
              const n = Number(v);
              if (v === "")     setMaxConvError("");
              else if (n < 10)  setMaxConvError("Must be at least 10 messages");
              else if (n > 500) setMaxConvError("Cannot exceed 500 messages");
              else              setMaxConvError("");
            }}
          />
          <Form.Control.Feedback type="invalid">{maxConvError}</Form.Control.Feedback>
        </Col>

        <Col md={6} className="d-flex align-items-center">
          <Form.Check
            type="switch"
            label="Enable Sentiment Analysis"
            checked={settings.enableSentiment}
            onChange={(e) => set({ enableSentiment: e.target.checked })}
          />
        </Col>
      </Row>

      <hr />

      {/* AUTO ESCALATION */}
      <h6 className="text-primary mb-3">Auto-Escalation Rules</h6>

      <Form.Check
        type="switch"
        label="Enable Auto-Escalation"
        checked={settings.enableAutoEscalation}
        onChange={(e) => set({ enableAutoEscalation: e.target.checked })}
        className="mb-3"
      />

      {settings.enableAutoEscalation && (
        <>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Escalate after X failed attempts</Form.Label>
              <Form.Control
                type="number" min={1}
                value={settings.escalationAttempts}
                onChange={(e) => set({ escalationAttempts: Number(e.target.value) })}
              />
            </Col>
          </Row>

          <Row className="mb-4">
            <Col>
              <Form.Check
                type="checkbox"
                label="Escalate on negative sentiment"
                checked={settings.escalateOnNegative}
                onChange={(e) => set({ escalateOnNegative: e.target.checked })}
              />
            </Col>
          </Row>

          <hr />

          <Row className="align-items-center mb-2">
            <Col xs={8} md={6}>
              <h6 className="text-primary mb-0">Escalation Keywords</h6>
            </Col>
            <Col xs={4} md={6} className="text-end">
              <Button size="sm" variant="primary" onClick={() => setShowKeywordModal(true)}>
                Add Keyword
              </Button>
            </Col>
          </Row>

          {settings.escalationKeywords.length === 0 && (
            <p className="text-muted small">No keywords added yet.</p>
          )}

          {settings.escalationKeywords.map((item, index) => (
            <Row key={`${item.label}-${index}`} className="align-items-center mb-1">
              <Col xs="auto" className="pe-2">{item.label}</Col>
              <Col>
                <div className="d-flex align-items-center gap-2">
                  <Form.Select
                    size="sm"
                    value={item.priority}
                    onChange={(e) => updatePriority(index, e.target.value)}
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </Form.Select>
                  <Button size="sm" variant="outline-danger" onClick={() => removeKeyword(index)}>
                    <FaTrash />
                  </Button>
                </div>
              </Col>
            </Row>
          ))}
        </>
      )}

      {/* Add Keyword Modal */}
      <Modal show={showKeywordModal} onHide={() => setShowKeywordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Escalation Keyword</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Keyword</Form.Label>
            <Form.Control
              placeholder='e.g. "agent"'
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addKeyword()}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Priority</Form.Label>
            <Form.Select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowKeywordModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={addKeyword}>Save</Button>
        </Modal.Footer>
      </Modal>

      {/* Save bar */}
      {hasChanges && (
        <div className="s-save-bar">
          <span className="s-save-bar-left">
            {lastSavedAt
              ? <>Last saved {lastSavedAt.toLocaleTimeString()}</>
              : "Unsaved changes"}
          </span>
          <div className="s-save-bar-right">
            <button className="s-btn s-btn-ghost" onClick={handleDiscard} disabled={saving}>
              Discard
            </button>
            <button
              className="s-btn s-btn-primary"
              onClick={handleSave}
              disabled={saving || !!contextTimeoutError || !!maxConvError}
            >
              {saving
                ? <><Spinner size="sm" animation="border" className="me-1" />Saving…</>
                : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsConversation;
