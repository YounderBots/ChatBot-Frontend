import React, { useState, useEffect } from "react";
import { Card, Row, Col, Form, Button, Table, Modal } from "react-bootstrap";
import Select from "react-select";
import { FaEdit, FaTrash } from "react-icons/fa";
const defaultSettings = {
  apiKey: "abcd-1234-xyz-9876",
  apiEndpoint: "https://api.yourbot.com/v1",

  webhooks: [
    {
      name: "Conversation Events",
      url: "https://example.com/webhook",
      events: "New Conversation, Escalation",
      active: true,
      lastTriggered: "Never",
    },
  ],

  slack: {
    connected: false,
    channel: "",
    notifyOnEscalation: true,
    notifyOnFailure: false,
  },

  smtp: {
    configured: false,
    server: "",
    port: "",
    username: "",
    password: "",
    fromEmail: "",
  },

  crm: {
    provider: "",
    apiKey: "",
    syncEnabled: false,
  },
};


const SettingsIntegrations = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const getCurrentTimestamp = () => {
    const now = new Date();

    return now.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };



  const [showEditModal, setShowEditModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editWebhook, setEditWebhook] = useState({
    name: "",
    url: "",
    events: "",
    active: true,
  });
  const [settings, setSettings] = useState(defaultSettings);
  const [savedSettings, setSavedSettings] = useState(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);


  const regenerateApiKey = () => {
    const newKey = Math.random().toString(36).substring(2, 15);
    setSettings({ ...settings, apiKey: newKey });
    alert("API Key regenerated");
  };

  const [showModal, setShowModal] = useState(false);

  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    events: [],
    secretKey: "",
    retryAttempts: 3,
    timeout: 30,
    active: true,
    lastTriggered: "Never",
  });

  const webhookEventOptions = [
    { value: "Event1", label: "Event1" },
    { value: "Event2", label: "Event2" },
    { value: "Event3", label: "Event3" },
    { value: "Event4", label: "Event4" },
  ];

  const handleAddWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) return;

    setSettings({
      ...settings,
      webhooks: [
        ...settings.webhooks,
        {
          ...newWebhook,
          lastTriggered: getCurrentTimestamp(),
        },
      ],
    });

    setNewWebhook({
      name: "",
      url: "",
      events: [],
      secretKey: "",
      retryAttempts: 3,
      timeout: 30,
      active: true,
      lastTriggered: "",
    });

    setShowModal(false);
  };


  const openEditModal = (index) => {
    setEditIndex(index);
    setEditWebhook({ ...settings.webhooks[index] });
    setShowEditModal(true);
  };

  // const [slack, setSlack] = useState({
  //   connected: false,
  //   channel: "",
  //   notifyOnEscalation: true,
  //   notifyOnFailure: false,
  // });

  // const [smtp, setSmtp] = useState({
  //   configured: false,
  //   server: "",
  //   port: "",
  //   username: "",
  //   password: "",
  //   fromEmail: "",
  // });

  // const [crm, setCrm] = useState({
  //   provider: "",
  //   apiKey: "",
  //   syncEnabled: false,
  // });


  const handleUpdateWebhook = () => {
    const updated = [...settings.webhooks];

    updated[editIndex] = {
      ...editWebhook,
      lastTriggered: getCurrentTimestamp(),
    };

    setSettings({
      ...settings,
      webhooks: updated,
    });

    setShowEditModal(false);
  };


  useEffect(() => {
    const { webhooks, ...rest } = settings;
    const { webhooks: _, ...savedRest } = savedSettings;

    setHasChanges(
      JSON.stringify(rest) !== JSON.stringify(savedRest)
    );
  }, [settings, savedSettings]);


  const handleSave = () => {
    setSavedSettings(settings);
    setLastSavedAt(new Date());
    setHasChanges(false);
  };

  const handleDiscard = () => {
    setSettings({
      ...savedSettings,
      webhooks: settings.webhooks,
    });
    setHasChanges(false);
  };

  const isModalOpen = showModal || showEditModal;

  return (
    <Card className="border-0 overflow-hidden">
      <Card.Body className="p-0 d-flex flex-column">
        <div
          className="flex-grow-1 overflow-auto p-4"
          style={{ maxHeight: "calc(100vh - 440px)" }}>

          {/* API CONFIGURATION */}
          <h6 className="text-primary mb-3">API Configuration</h6>

          <Row className="align-items-center mb-3">
            <Col className="pe-2">
              <Form.Label className="mb-0">
                API Key
              </Form.Label>
            </Col>

            <Col lg={6} md={12} className="mb-2">
              <Form.Control
                size="sm"
                type="text"
                readOnly
                value={showApiKey ? settings.apiKey : "••••••••••••"}
              />
            </Col>

            <Col className="d-flex gap-1 mb-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? "Hide" : "Show"}
              </Button>

              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  navigator.clipboard.writeText(settings.apiKey);
                  alert("API Key copied");
                }}
              >
                Copy
              </Button>

              <Button
                size="sm"
                variant="primary"
                onClick={regenerateApiKey}
              >
                Regenerate
              </Button>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col lg={6} md={12}>
              <Form.Label>API Endpoint</Form.Label>

              <div className="d-flex gap-2">
                <Form.Control
                  readOnly
                  value={settings.apiEndpoint}
                />

                <Button
                  variant="primary"
                  onClick={() => {
                    navigator.clipboard.writeText(settings.apiEndpoint);
                    alert("API Endpoint copied!");
                  }}
                >
                  Copy
                </Button>
              </div>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col lg={6} md={12}>
              <Form.Label>Documentation Link</Form.Label>

              <div>
                <a
                  href="https://docs.yourapi.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary fw-semibold"
                >
                  View Documentation Link
                </a>
              </div>
            </Col>
          </Row>


          <hr />

          {/* WEBHOOKS */}
          <Row className="align-items-center mb-2">
            <Col>
              <h6 className="text-primary mb-0">Webhooks</h6>
            </Col>

            <Col className="text-end mb-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => setShowModal(true)}
              >
                Add Webhook
              </Button>
            </Col>
          </Row>
          <Table responsive bordered hover size="sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>URL</th>
                <th>Events</th>
                <th>Status</th>
                <th>Last Triggered</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {settings.webhooks.map((wh, index) => (
                <tr key={index}>
                  <td>{wh.name}</td>
                  <td>{wh.url}</td>
                  <td>{wh.events}</td>
                  <td>{wh.active ? "Active" : "Inactive"}</td>
                  <td>{wh.lastTriggered}</td>
                  <td>
                    <div className="d-flex align-items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline-warning"
                        className="me-2"
                        onClick={() => openEditModal(index)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        title="Delete"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete webhook "${wh.name}"?`
                            )
                          ) {
                            const updated = [...settings.webhooks];
                            updated.splice(index, 1);
                            setSettings({
                              ...settings,
                              webhooks: updated,
                            });
                          }
                        }}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <hr />

          {/* THIRD PARTY */}
          <h6 className="text-primary mb-3">Third Party Integration</h6>
          <span>Slack</span>

          <Row className="align-items-center mb-3">
            <Col lg={3} md={6}>
              <strong>Status:</strong>{" "}
              <span className={settings.slack.connected ? "text-success" : "text-danger"}>
                {settings.slack.connected ? "Connected" : "Not Connected"}
              </span>
            </Col>

            <Col lg={2} md={6}>
              <Button
                size="sm"
                variant={settings.slack.connected ? "danger" : "primary"}
                onClick={() =>
                  setSettings({
                    ...settings,
                    slack: {
                      ...settings.slack,
                      connected: !settings.slack.connected,
                    },
                  })
                }
              >
                {settings.slack.connected ? "Disconnect" : "Connect Slack"}
              </Button>
            </Col>
          </Row>

          {settings.slack.connected && (
            <>
              <Row className="mb-3">
                <Col lg={6} md={12}>
                  <Form.Label>Settings(if connected)</Form.Label>
                  <Form.Control
                    value={settings.slack.channel}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        slack: {
                          ...settings.slack,
                          channel: e.target.value,
                        },
                      })
                    }
                  />

                </Col>
              </Row>
            </>
          )}


          {/* SETTINGS */}
          <span className="mb-3">Email (SMTP)</span>

          <Row className="align-items-center mb-4">
            <Col lg={3} md={7}>
              <strong>Status:</strong>{" "}
              <span className={settings.smtp.configured ? "text-success" : "text-danger"}>
                {settings.smtp.configured ? "Configured" : "Not Configured"}
              </span>
            </Col>

            <Col md={5}>
              <Button
                size="sm"
                variant={settings.smtp.configured ? "outline-secondary" : "primary"}
                onClick={() =>
                  setSettings({
                    ...settings,
                    smtp: {
                      ...settings.smtp,
                      configured: true,
                    },
                  })
                }

              >
                Configure
              </Button>
            </Col>
          </Row>

          {/* SETTINGS */}
          <Row className="mb-3">
            <Col lg={4} md={12} className="mb-3">
              <Form.Label>SMTP Server</Form.Label>
              <Form.Control
                value={settings.smtp.server}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    smtp: {
                      ...settings.smtp,
                      server: e.target.value,
                    },
                  })
                }
              />

            </Col>

            <Col lg={4} md={12} className="mb-3">
              <Form.Label>Port</Form.Label>
              <Form.Control
                type="number"
                value={settings.smtp.port}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    smtp: {
                      ...settings.smtp,
                      port: e.target.value,
                    },
                  })
                }

                placeholder="587"
              />
            </Col>

            <Col lg={4} md={12} className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                value={settings.smtp.username}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    smtp: {
                      ...settings.smtp,
                      username: e.target.value,
                    },
                  })
                }
              />

            </Col>

            <Col lg={4} md={12} className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={settings.smtp.password}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    smtp: {
                      ...settings.smtp,
                      password: e.target.value,
                    },
                  })
                }
              />

            </Col>

            <Col lg={4} md={12} className="mb-3">
              <Form.Label>From Email</Form.Label>
              <Form.Control
                type="email"
                value={settings.smtp.fromEmail}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    smtp: {
                      ...settings.smtp,
                      fromEmail: e.target.value,
                    },
                  })
                }
              />

            </Col>
          </Row>

          <Button
            className="mb-3"
            size="sm"
            variant="primary"
            onClick={() => alert("SMTP connection successful")}
          >
            Test Connection
          </Button>

          <Row>
            <p className="mb-3">CRM</p>

            <Row className="mb-3">
              <Col lg={6} md={12} className="mb-3">
                <Form.Label>CRM Provider</Form.Label>
                <Form.Select
                  value={settings.crm.provider}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      crm: {
                        ...settings.crm,
                        provider: e.target.value,
                      },
                    })
                  }
                >

                  <option value="">Select CRM</option>
                  <option value="Salesforce">Salesforce</option>
                  <option value="HubSpot">HubSpot</option>
                  <option value="Zoho">Zoho</option>
                </Form.Select>
              </Col>

              <Col lg={6} md={12} className="mb-3">
                <Form.Label>API Credentials</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="API Key / Token"
                  value={settings.crm.apiKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      crm: {
                        ...settings.crm,
                        apiKey: e.target.value,
                      },
                    })
                  }

                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col md={6} className="d-flex align-items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                >
                  Sync settings
                </Button>
              </Col>
            </Row>

          </Row>

          <Modal show={showModal} onHide={() => setShowModal(false)} centered scrollable>
            <Modal.Header closeButton>
              <Modal.Title>Add Webhook</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Form>

                <Form.Group className="mb-3">
                  <Form.Label>Webhook Name</Form.Label>
                  <Form.Control
                    value={newWebhook.name}
                    onChange={(e) =>
                      setNewWebhook({ ...newWebhook, name: e.target.value })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Webhook URL</Form.Label>
                  <Form.Control
                    type="url"
                    value={newWebhook.url}
                    onChange={(e) =>
                      setNewWebhook({ ...newWebhook, url: e.target.value })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Events</Form.Label>

                  <Select
                    isMulti
                    options={webhookEventOptions}
                    placeholder="Select events"
                    value={webhookEventOptions.filter(opt =>
                      newWebhook.events.includes(opt.value)
                    )}
                    onChange={(selected) =>
                      setNewWebhook({
                        ...newWebhook,
                        events: selected ? selected.map(s => s.value) : [],
                      })
                    }
                    closeMenuOnSelect={false}
                    isClearable

                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                  />

                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Secret Key</Form.Label>
                  <Form.Control
                    type="password"
                    value={newWebhook.secretKey}
                    onChange={(e) =>
                      setNewWebhook({ ...newWebhook, secretKey: e.target.value })
                    }
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Label>Retry Attempts</Form.Label>
                    <Form.Control
                      type="number"
                      min={0}
                      max={10}
                      value={newWebhook.retryAttempts}
                      onChange={(e) =>
                        setNewWebhook({
                          ...newWebhook,
                          retryAttempts: Number(e.target.value),
                        })
                      }
                    />
                  </Col>

                  <Col md={6}>
                    <Form.Label>Timeout (seconds)</Form.Label>
                    <Form.Control
                      type="number"
                      min={5}
                      max={120}
                      value={newWebhook.timeout}
                      onChange={(e) =>
                        setNewWebhook({
                          ...newWebhook,
                          timeout: Number(e.target.value),
                        })
                      }
                    />
                  </Col>
                </Row>

                <Form.Check
                  type="switch"
                  label="Active"
                  checked={newWebhook.active}
                  onChange={(e) =>
                    setNewWebhook({
                      ...newWebhook,
                      active: e.target.checked,
                    })
                  }
                />

              </Form>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAddWebhook}>
                Save
              </Button>
            </Modal.Footer>
          </Modal>


          <Modal
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            centered
            scrollable
          >
            <Modal.Header closeButton>
              <Modal.Title>Edit Webhook</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    value={editWebhook.name}
                    onChange={(e) =>
                      setEditWebhook({ ...editWebhook, name: e.target.value })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>URL</Form.Label>
                  <Form.Control
                    value={editWebhook.url}
                    onChange={(e) =>
                      setEditWebhook({ ...editWebhook, url: e.target.value })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Events</Form.Label>
                  <Form.Control
                    value={editWebhook.events}
                    onChange={(e) =>
                      setEditWebhook({ ...editWebhook, events: e.target.value })
                    }
                  />
                </Form.Group>

                <Form.Check
                  type="switch"
                  label="Active"
                  checked={editWebhook.active}
                  onChange={(e) =>
                    setEditWebhook({
                      ...editWebhook,
                      active: e.target.checked,
                    })
                  }
                />
              </Form>
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleUpdateWebhook}>
                Update
              </Button>
            </Modal.Footer>
          </Modal>

        </div>
        <hr />

        <Row className="align-items-center mt-3">
          <Col md={6} className="text-muted">
            {lastSavedAt
              ? <>Last saved: <strong>{lastSavedAt.toLocaleString()}</strong></>
              : "Not saved yet"}
          </Col>

          <Col md={6} className="d-flex justify-content-end gap-2">
            <Button
              size="sm"
              variant="danger"
              disabled={!hasChanges}
              onClick={handleDiscard}
            >
              Discard
            </Button>

            <Button
              size="sm"
              variant="primary"
              disabled={!hasChanges || isModalOpen}
              onClick={handleSave}
            >
              Save Changes
            </Button>

          </Col>
        </Row>



      </Card.Body>
    </Card>
  );
};

export default SettingsIntegrations;