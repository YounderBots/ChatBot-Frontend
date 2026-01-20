import React, { useState } from "react";
import { Card, Row, Col, Form, Button, Modal } from "react-bootstrap";

const SettingsConversation = () => {
  const [settings, setSettings] = useState({
    confidenceThreshold: 60,
    contextTimeout: 30,
    maxConversationLength: 50,
    enableSentiment: true,

    enableAutoEscalation: true,
    escalationAttempts: 3,

    escalationKeywords: [
      { label: "speak to human", priority: "HIGH" },
      { label: "agent", priority: "HIGH" },
      { label: "manager", priority: "MEDIUM" },
    ],
  });

  const [newKeyword, setNewKeyword] = useState("");
  const [contextTimeoutError, setContextTimeoutError] = useState("");
  const [maxConversationError, setMaxConversationError] = useState("");
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [newPriority, setNewPriority] = useState("HIGH");


  const addKeyword = () => {
    if (!newKeyword.trim()) return;

    setSettings({
      ...settings,
      escalationKeywords: [
        ...settings.escalationKeywords,
        { label: newKeyword.trim(), priority: newPriority },
      ],
    });

    setNewKeyword("");
    setNewPriority("HIGH");
    setShowKeywordModal(false);
  };

const updatePriority = (index, priority) => {
  const updated = [...settings.escalationKeywords];
  updated[index].priority = priority;
  setSettings({ ...settings, escalationKeywords: updated });
};

const removeKeyword = (index) => {
  const updated = [...settings.escalationKeywords];
  updated.splice(index, 1);
  setSettings({ ...settings, escalationKeywords: updated });
};


  return (
    <Card className="border-0">
      <Card.Body>

        {/* AI CONFIGURATION */}
        <h6 className="text-primary mb-3">AI Configuration</h6>

        <Row className="mb-3">
            <Col md={6}>
                <Form.Label className="fw-semibold">
                Confidence Threshold
                <span className="text-primary ms-2">
                    ({settings.confidenceThreshold}%)
                </span>
                </Form.Label>

                <Form.Range
                min={0}
                max={100}
                value={settings.confidenceThreshold}
                onChange={(e) =>
                    setSettings({
                    ...settings,
                    confidenceThreshold: Number(e.target.value),
                    })
                }
                />

                <Form.Label>
                    Description
                </Form.Label>
                <Form.Control
                as="textarea"
                rows={3}
                ></Form.Control>
            </Col>

           <Col md={6}>
                <Form.Label>Context Timeout (minutes)</Form.Label>
                <Form.Control
                    type="number"
                    value={settings.contextTimeout === 0 ? "" : settings.contextTimeout}
                    isInvalid={!!contextTimeoutError}
                    onChange={(e) => {
                    let value = e.target.value;
                    if (value.length > 1 && value.startsWith("0")) {
                        value = value.replace(/^0+/, "");
                    }
                    const numericValue = value === "" ? "" : Number(value);
                    setSettings({
                        ...settings,
                        contextTimeout: numericValue,
                    });
                    if (numericValue !== "" && numericValue < 5) {
                        setContextTimeoutError(
                        "Context timeout must be at least 5 minutes"
                        );
                    } else if (numericValue > 120) {
                        setContextTimeoutError(
                        "Context timeout cannot exceed 120 minutes"
                        );
                    } else {
                        setContextTimeoutError("");
                    }
                    }}
                />

                {contextTimeoutError && (
                    <Form.Control.Feedback type="invalid">
                    {contextTimeoutError}
                    </Form.Control.Feedback>
                )}
            </Col>

        </Row>

        <Row className="mb-4">
          <Col md={6}>
            <Form.Label>Max Conversation Length</Form.Label>

            <Form.Control
              type="number"
              value={settings.maxConversationLength}
              isInvalid={!!maxConversationError}
              onChange={(e) => {
                const value = e.target.value; // keep as string

                // Always update state (allows free typing)
                setSettings({
                  ...settings,
                  maxConversationLength: value,
                });

                // Validation
                if (value === "") {
                  setMaxConversationError("");
                  return;
                }

                const num = Number(value);

                if (num < 10) {
                  setMaxConversationError(
                    "Conversation length must be at least 10 messages"
                  );
                } else if (num > 500) {
                  setMaxConversationError(
                    "Conversation length cannot exceed 500 messages"
                  );
                } else {
                  setMaxConversationError("");
                }
              }}
            />

            {maxConversationError && (
              <Form.Control.Feedback type="invalid">
                {maxConversationError}
              </Form.Control.Feedback>
            )}
          </Col>
        </Row>


        <Row className="mb-4">
          <Col md={6} className="d-flex align-items-center">
            <Form.Check
              type="switch"
              label="Enable Sentiment Analysis"
              checked={settings.enableSentiment}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  enableSentiment: e.target.checked,
                })
              }
            />
          </Col>
        </Row>

        <hr/>

        {/* AUTO ESCALATION */}
        <h6 className="text-primary mb-3">Auto-Escalation Rules</h6>

        <Form.Check
          type="switch"
          label="Enable Auto-Escalation"
          checked={settings.enableAutoEscalation}
          onChange={(e) =>
            setSettings({
              ...settings,
              enableAutoEscalation: e.target.checked,
            })
          }
        />

        {settings.enableAutoEscalation && (
          <>
            {/* MEDIUM PRIORITY */}
            <Row className="mb-3 mt-3">
              <Col md={6}>
                <Form.Label>
                  Escalate after X failed attempts
                </Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  value={settings.escalationAttempts}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      escalationAttempts: Number(e.target.value),
                    })
                  }
                />
              </Col>
            </Row>
            <Row className="mb-4">
                <Col md={6}>
                    <Form.Check
                    type="checkbox"
                    label="Escalate on negative sentiment"
                    />
                </Col>
            </Row>
            <hr/>
            <Row>
              <h6 className="text-primary">Escalation Keywords</h6>
              <Col xs={12} md={4} className="mb-2">
              <Button
                  size="sm"
                  variant="primary"
                  className="mt-2"
                  onClick={() => setShowKeywordModal(true)}
                >
                  Add Keyword
                </Button>
              </Col>
            </Row>

                {settings.escalationKeywords.map((item, index) => (
                  <Row key={index} className="align-items-center mb-2">
                    <Col xs={12} md={4}>{item.label}</Col>

                    <Col md={4}>
                      <Form.Select
                        size="sm"
                        value={item.priority}
                        onChange={(e) =>
                          updatePriority(index, e.target.value)
                        }
                      >
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </Form.Select>
                    </Col>

                    <Col xs={12} md={2}>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => removeKeyword(index)}
                      >
                        Remove
                      </Button>
                    </Col>
                  </Row>
                ))}

          </>
        )}
        <Modal
          show={showKeywordModal}
          onHide={() => setShowKeywordModal(false)}
          centered
        >
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
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowKeywordModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={addKeyword}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>


      </Card.Body>
    </Card>
  );
};

export default SettingsConversation;
