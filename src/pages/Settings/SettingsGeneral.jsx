import React, { useState, useRef, useEffect } from "react";
import { Card, Row, Col, Form, Button } from "react-bootstrap";
import { FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import Select from "react-select";
import { Container } from "react-bootstrap";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SettingsGeneral = () => {
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [botNameError, setBotNameError] = useState("");
  const [isEditingWelcome, setIsEditingWelcome] = useState(false);


  const [formData, setFormData] = useState({
    botName: "Chatbot",
    welcomeMessage: "Hi How can I help you today?",
    fallbackMessage: "Sorry, I didn’t understand that.",
    offlineMessage: "We are currently offline.",
    timezone: "Asia/Kolkata",
    outsideBehavior: "offline",
    businessHours: daysOfWeek.map((day) => ({
      day,
      enabled: day !== "Sunday",
      start: "09:00",
      end: "18:00",
    })),
  });
  const [savedFormData, setSavedFormData] = useState(formData);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const timezoneOptions = [
    { value: "Asia/Kolkata", label: "Asia / Kolkata (IST)" },
    { value: "UTC", label: "UTC (Coordinated Universal Time)" },
    { value: "America/New_York", label: "America / New York (EST)" },
    { value: "Europe/London", label: "Europe / London (GMT)" },
    { value: "Asia/Dubai", label: "Asia / Dubai (GST)" },
    { value: "Asia/Singapore", label: "Asia / Singapore (SGT)" },
  ];
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


  const copyToAllDays = (sourceIndex) => {
    const sourceDay = formData.businessHours[sourceIndex];

    const updatedBusinessHours = formData.businessHours.map(
      (day) => ({
        ...day,
        enabled: sourceDay.enabled,
        start: sourceDay.start,
        end: sourceDay.end,
      })
    );

    setFormData({
      ...formData,
      businessHours: updatedBusinessHours,
    });
  };


  const [tempWelcomeMessage, setTempWelcomeMessage] = useState(
    formData.welcomeMessage
  );

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateBusinessHour = (index, key, value) => {
    const updated = [...formData.businessHours];
    updated[index][key] = value;
    setFormData({ ...formData, businessHours: updated });
  };

  const [file, setFile] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const [dataRetentionError, setDataRetentionError] = useState("");





  const handleSave = () => {
  setSavedFormData(formData);
  setLastSavedAt(new Date());
  setHasChanges(false);
};
const handleDiscard = () => {
  setFormData(savedFormData);
  setHasChanges(false);
  setIsEditingWelcome(false); // important UX fix
};

  useEffect(() => {
  setHasChanges(
    JSON.stringify(formData) !== JSON.stringify(savedFormData)
  );
}, [formData, savedFormData]);


 


  return (
    <Card className="border-0">
      <Card.Body>

        {/* Bot Configuration */}
        <h6 className="text-primary mb-3">Bot Configuration</h6>

        <Row className="mb-2">
          <Col md={6} className="mb-3">
            <Form.Label>
              Bot Name
            </Form.Label>

            <Form.Control
              type="text"
              value={formData.botName}
              placeholder="Enter bot name (max 50 characters)"
              isInvalid={!!botNameError}
              onChange={(e) => {
                const value = e.target.value;

                if (value.length > 50) {
                  setBotNameError("Bot name cannot exceed 50 characters");
                  return;
                }

                setBotNameError("");
                setFormData({ ...formData, botName: value });
              }}
            />

            {botNameError && (
              <Form.Control.Feedback type="invalid">
                {botNameError}
              </Form.Control.Feedback>
            )}
          </Col>

          <Col md={6} className="mb-3">
            <Form.Label>Bot Avatar</Form.Label>

            <Form.Control
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAvatarChange}
            />

            {avatarPreview && (
              <div className="mt-2 d-flex align-items-center gap-3">
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  width={80}
                  height={80}
                  className="rounded"
                />

                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleRemoveAvatar}
                >
                  Remove
                </Button>
              </div>
            )}
          </Col>

          <Col lg={4} md={12} className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <Form.Label>Welcome Message</Form.Label>

              {!isEditingWelcome ? (
                <FaEdit
                  style={{ cursor: "pointer" }}
                  className="text-primary"
                  onClick={() => {
                    setTempWelcomeMessage(formData.welcomeMessage);
                    setIsEditingWelcome(true);
                  }}
                />
              ) : (
                <div className="d-flex gap-2">
                  <FaCheck
                    className="text-success"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setFormData({
                        ...formData,
                        welcomeMessage: tempWelcomeMessage,
                      });
                      setIsEditingWelcome(false);
                    }}
                  />
                  <FaTimes
                    className="text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setTempWelcomeMessage(formData.welcomeMessage);
                      setIsEditingWelcome(false);
                    }}
                  />
                </div>
              )}
            </div>
            <Form.Control
              as="textarea"
              rows={3}
              maxLength={500}
              value={isEditingWelcome ? tempWelcomeMessage : formData.welcomeMessage}
              readOnly={!isEditingWelcome}
              onChange={(e) => setTempWelcomeMessage(e.target.value)}
              className={!isEditingWelcome ? "bg-light" : ""}
            />
          </Col>

          <Col lg={4} md={12} className="mb-3">
            <Form.Label>Fallback Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              maxLength={300}
              value={formData.fallbackMessage}
              onChange={(e) =>
                setFormData({ ...formData, fallbackMessage: e.target.value })
              }
            />
          </Col>

          <Col lg={4} md={12} className="mb-3">
            <Form.Label>Offline Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              maxLength={300}
              value={formData.offlineMessage}
              onChange={(e) =>
                setFormData({ ...formData, offlineMessage: e.target.value })
              }
            />
          </Col>
        </Row>

        <hr />

        {/* Business Hours */}
        <h6 className="text-primary mb-3">Business Hours</h6>

        <Row className="mb-2">
          <Col lg={6} md={6}>
            <Form.Label>Timezone</Form.Label>
            <Select
              options={timezoneOptions}
              isSearchable
              placeholder="Select timezone..."
              value={timezoneOptions.find(
                (opt) => opt.value === formData.timezone
              )}
              onChange={(selected) =>
                setFormData({
                  ...formData,
                  timezone: selected.value,
                })
              }
            />
          </Col>
        </Row>

        {formData.businessHours.map((item, index) => (
          <Row key={item.day} className="align-items-center mb-2">
            <Col md={4}>
              <Form.Check
                label={item.day}
                checked={item.enabled}
                onChange={(e) =>
                  updateBusinessHour(index, "enabled", e.target.checked)
                }
              />
            </Col>


            <Col md={4} className="p-1">
              <Form.Control
                type="time"
                disabled={!item.enabled}
                value={item.start}
                onChange={(e) =>
                  updateBusinessHour(index, "start", e.target.value)
                }
              />
            </Col>

            <Col md={4} className="p-1">
              <Form.Control
                type="time"
                disabled={!item.enabled}
                value={item.end}
                onChange={(e) =>
                  updateBusinessHour(index, "end", e.target.value)
                }
              />
            </Col>
          </Row>

        ))}
        <Button
          size="sm"
          variant="primary"
          className="mt-3"
          onClick={() => copyToAllDays(0)}
        >
          Copy to all days
        </Button>


        <hr />

        {/* Outside Business Hours */}
        <h6 className="text-primary mb-2">Outside Business Hours</h6>

        <Form.Check
          className="mb-2"
          type="radio"
          label="Show Offline Message"
          name="outside"
          checked={formData.outsideBehavior === "offline"}
          onChange={() =>
            setFormData({ ...formData, outsideBehavior: "offline" })
          }
        />
        <Form.Check
          className="mb-2"
          type="radio"
          label="Continue with Bot"
          name="outside"
          checked={formData.outsideBehavior === "bot"}
          onChange={() =>
            setFormData({ ...formData, outsideBehavior: "bot" })
          }
        />
        <Form.Check
          className="mb-2"
          type="radio"
          label="Show Contact Form"
          name="outside"
          checked={formData.outsideBehavior === "contact"}
          onChange={() =>
            setFormData({ ...formData, outsideBehavior: "contact" })
          }
        />
        <Container fluid className="py-3">
          <Row className="align-items-center gy-2">
            <Col md={6} xs={12} className="text-muted">
              {lastSavedAt
                ? <>Last saved: <strong>{lastSavedAt.toLocaleString()}</strong></>
                : "Not saved yet"}
            </Col>

            <Col md={6} className="d-flex justify-content-end gap-2 mb-2">
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
        </Container>

      </Card.Body>

    </Card>


  );
};

export default SettingsGeneral;
