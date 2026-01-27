import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Modal, Row } from "react-bootstrap";

const SettingsAdvanced = () => {

  const defaultSettings = {
    enableLearning: true,
    autoAddTraining: false,
    autoAddConfidence: 60,
    reviewQueueThreshold: 40,

    dataRetentionDays: 90,
    enableDataExport: true,
    enableDataDeletion: true,
    showPrivacyLink: true,
    privacyPolicyUrl: "https://yourcompany.com/privacy",

    logLevel: "INFO",
    enableConsoleLogs: true,
    enableDatabaseLogs: false,

    language: "English",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24H",
  };
  const [settings, setSettings] = useState(defaultSettings);


  const [file, setFile] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const exportSettings = () => {
    const blob = new Blob(
      [JSON.stringify(settings, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "settings-backup.json";
    link.click();
    URL.revokeObjectURL(url);
  };
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [savedSettings, setSavedSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(true);
  const [dataRetentionError, setDataRetentionError] = useState("");


  const importSettings = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        setSettings(imported);
        alert("Settings imported successfully");
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const resetSettings = () => {
    setSettings({ ...defaultSettings });
    setShowResetModal(false);
  };

  useEffect(() => {
    setHasChanges(
      JSON.stringify(settings) !== JSON.stringify(savedSettings)
    );
  }, [settings, savedSettings]);

  const handleSave = () => {
    setSavedSettings(settings);
    setLastSavedAt(new Date());
    setHasChanges(false);
  };

  const handleDiscard = () => {
    setSettings(savedSettings);
    setHasChanges(false);
  };

  return (
    <Card className="border-0 overflow-hidden">
      <Card.Body className="p-0 d-flex flex-column">
        <div
          className="flex-grow-1 overflow-auto p-4"
          style={{ maxHeight: "calc(100vh - 440px)" }}>

          {/* TRAINING & LEARNING */}
          <h6 className="text-primary mb-3">Training & Learning</h6>

          <Form.Check
            type="switch"
            label="Enable Continuous Learning"
            checked={settings.enableLearning}
            onChange={(e) =>
              setSettings({ ...settings, enableLearning: e.target.checked })
            }
          />

          <Form.Check className="mt-3"
            type="checkbox"
            label="Auto-add to training"
            checked={settings.autoAddToTraining}
            onChange={(e) =>
              setSettings({
                ...settings,
                autoAddToTraining: e.target.checked,
              })
            }
          />

          {settings.autoAddToTraining && (
            <Row className="mt-3">
              <Col lg={6} md={12}>
                <Form.Label>
                  Confidence threshold for auto-add
                  <span className="text-primary ms-2">
                    ({settings.autoAddConfidence}%)
                  </span>
                </Form.Label>

                <Form.Range
                  min={0}
                  max={100}
                  value={settings.autoAddConfidence}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      autoAddConfidence: Number(e.target.value),
                    })
                  }
                />
              </Col>
            </Row>
          )}

          <Row className="mt-3">
            <Col lg={6} md={12}>
              <Form.Label>
                Review queue threshold
                <span className="text-primary ms-2">
                  ({settings.reviewQueueThreshold}%)
                </span>
              </Form.Label>

              <Form.Range
                min={0}
                max={100}
                value={settings.reviewQueueThreshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    reviewQueueThreshold: Number(e.target.value),
                  })
                }
              />
            </Col>
          </Row>
          <hr />

          {/* DATA & PRIVACY */}
          <h6 className="text-primary mb-3">Data & Privacy</h6>

          <Row className="mb-3">
            <Col lg={6} md={12}>
              <Form.Label>Data Retention (days)</Form.Label>

              <Form.Control
                type="number"
                value={settings.dataRetentionDays}
                isInvalid={!!dataRetentionError}
                onChange={(e) => {
                  const value = e.target.value;

                  setSettings({
                    ...settings,
                    dataRetentionDays: value,
                  });

                  // Validation
                  if (value === "") {
                    setDataRetentionError("");
                    return;
                  }

                  const num = Number(value);

                  if (num < 30) {
                    setDataRetentionError(
                      "Data retention must be at least 30 days"
                    );
                  } else if (num > 365) {
                    setDataRetentionError(
                      "Data retention cannot exceed 365 days"
                    );
                  } else {
                    setDataRetentionError("");
                  }
                }}
              />

              {dataRetentionError && (
                <Form.Control.Feedback type="invalid">
                  {dataRetentionError}
                </Form.Control.Feedback>
              )}
            </Col>
          </Row>


          <Form.Check className="mb-3"
            type="checkbox"
            label="Enable data export (GDPR)"
            checked={settings.enableDataExport}
            onChange={(e) =>
              setSettings({
                ...settings,
                enableDataExport: e.target.checked,
              })
            }
          />

          <Form.Check className="mb-3"
            type="checkbox"
            label="Enable data deletion (GDPR)"
            checked={settings.enableDataDeletion}
            onChange={(e) =>
              setSettings({
                ...settings,
                enableDataDeletion: e.target.checked,
              })
            }
          />

          <Form.Check
            type="checkbox"
            label="Show privacy policy link"
            className="mb-3"
            checked={settings.showPrivacyLink}
            onChange={(e) =>
              setSettings({
                ...settings,
                showPrivacyLink: e.target.checked,
              })
            }
          />

          {settings.showPrivacyLink && (
            <Row className="mt-2">
              <Col md={6}>
                <Form.Label>Privacy Policy URL</Form.Label>
                <Form.Control
                  type="url"
                  value={settings.privacyPolicyUrl}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      privacyPolicyUrl: e.target.value,
                    })
                  }
                />
              </Col>
            </Row>
          )}

          <hr />

          {/* LOGGING */}
          <h6 className="text-primary mb-3">Logging</h6>

          <Row className="mb-3">
            <Col lg={6} md={12}>
              <Form.Label>Log Level</Form.Label>
              <Form.Select
                value={settings.logLevel}
                onChange={(e) =>
                  setSettings({ ...settings, logLevel: e.target.value })
                }
              >
                <option value="DEBUG">Debug</option>
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="ERROR">Error</option>
              </Form.Select>
            </Col>
          </Row>

          <Form.Check
            type="checkbox"
            label="Enable Console Logs"
            checked={settings.enableConsoleLogs}
            onChange={(e) =>
              setSettings({
                ...settings,
                enableConsoleLogs: e.target.checked,
              })
            }
          />

          <Form.Check
            type="checkbox"
            label="Enable Database Logs"
            className="mt-3"
            checked={settings.enableDatabaseLogs}
            onChange={(e) =>
              setSettings({
                ...settings,
                enableDatabaseLogs: e.target.checked,
              })
            }
          />

          <hr />

          {/* SYSTEM */}
          <h6 className="text-primary mb-2">System Settings</h6>

          <Row className="mb-3">
            <Col lg={6} md={12} className="mb-3">
              <Form.Label>Language</Form.Label>
              <Form.Select
                value={settings.language}
                onChange={(e) =>
                  setSettings({ ...settings, language: e.target.value })
                }
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </Form.Select>
            </Col>

            <Col lg={4} md={12} className="mb-3">
              <Form.Label>Date Format</Form.Label>
              <Form.Select
                value={settings.dateFormat}
                onChange={(e) =>
                  setSettings({ ...settings, dateFormat: e.target.value })
                }
              >
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
              </Form.Select>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Label>Time Format</Form.Label>
              <Form.Check
                className="mb-2"
                type="radio"
                name="timeFormat"
                label="24 Hour"
                checked={settings.timeFormat === "24H"}
                onChange={() =>
                  setSettings({ ...settings, timeFormat: "24H" })
                }
              />
              <Form.Check
                type="radio"
                name="timeFormat"
                label="12 Hour"
                checked={settings.timeFormat === "12H"}
                onChange={() =>
                  setSettings({ ...settings, timeFormat: "12H" })
                }
              />
            </Col>
          </Row>

          <hr />

          {/* BACKUP & RESET */}
          <Row className="align-items-center mb-3">
            <Col>
              <h6 className="text-primary mb-0">
                Backup & Restore
              </h6>
            </Col>

            <Col xs="auto" className="ms-auto">
              <Button
                size="sm"
                variant="primary"
                onClick={exportSettings}
              >
                Export
              </Button>
            </Col>
          </Row>

          <Row className="align-items-center mb-3">
            <Col lg={6} md={12} className="mb-2">
              <Form.Control
                size="sm"
                type="file"
                accept="application/json"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </Col>

            <Col className="d-flex gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={importSettings}
                disabled={!file}
              >
                Import
              </Button>

              <Button
                size="sm"
                variant="danger"
                onClick={() => setShowResetModal(true)}
              >
                Reset
              </Button>
            </Col>
          </Row>

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
              onClick={handleDiscard}
              disabled={!hasChanges}
            >
              Discard
            </Button>

            <Button
              size="sm"
              variant="primary"
              onClick={handleSave}
              disabled={!hasChanges}
            >
              Save Changes
            </Button>
          </Col>
        </Row>


        <Modal
          show={showResetModal}
          onHide={() => setShowResetModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Reset</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            Are you sure you want to reset all settings to default?
            <br />
            <strong>This action cannot be undone.</strong>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowResetModal(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={resetSettings}>
              Reset
            </Button>
          </Modal.Footer>
        </Modal>


      </Card.Body>
    </Card>




  );
};

export default SettingsAdvanced;
