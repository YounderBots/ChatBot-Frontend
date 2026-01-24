import React, { useState } from "react";
import { Card, Row, Col, Form, Button } from "react-bootstrap";

const SettingsNotifications = () => {
  const [settings, setSettings] = useState({
    enableEmail: true,
    adminEmail: "",
    emailFrequency: "REALTIME",
    emailEvents: {
      newConversation: true,
      escalatedConversation: true,
      lowConfidence: false,
      failedConversation: true,
      negativeFeedback: true,
      dailySummary: false,
      weeklyReport: false,
    },

    enablePush: false,
    pushEvents: {
      newConversation: false,
      escalatedConversation: false,
      lowConfidence: false,
      failedConversation: false,
      negativeFeedback: false,
      dailySummary: false,
      weeklyReport: false,
    },

    enableInApp: true,
    sound: "default",
  });

  const toggleEmailEvent = (key) => {
    setSettings({
      ...settings,
      emailEvents: {
        ...settings.emailEvents,
        [key]: !settings.emailEvents[key],
      },
    });
  };
  const [emailError, setEmailError] = useState("");

  const togglePushEvent = (key) => {
    setSettings({
      ...settings,
      pushEvents: {
        ...settings.pushEvents,
        [key]: !settings.pushEvents[key],
      },
    });
  };


  return (
    <Card className="border-0">
      <Card.Body>

        <h6 className="text-primary mb-3">Email Notifications</h6>

        <Form.Check
          type="switch"
          label="Enable Email Notifications"
          checked={settings.enableEmail}
          onChange={(e) =>
            setSettings({ ...settings, enableEmail: e.target.checked })
          }
        />

        <Row className="mt-3">
          <Col md={6}>
            <Form.Label>Admin Email</Form.Label>
            <Form.Control
              type="email"
              value={settings.adminEmail}
              isInvalid={!!emailError}
              onChange={(e) => {
                const value = e.target.value;
                setSettings({ ...settings, adminEmail: value });

                if (!value) {
                  setEmailError("Email is required");
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                  setEmailError("Enter a valid email address");
                } else {
                  setEmailError("");
                }
              }}
            />

            {emailError && (
              <Form.Control.Feedback type="invalid">
                {emailError}
              </Form.Control.Feedback>
            )}

          </Col>
        </Row>

        <Row className="mt-3">
          <Col md={12}>
            <Form.Label>Notification Events</Form.Label>

            <Form.Check
              className="mb-3"
              label="New Conversation"
              checked={settings.emailEvents.newConversation}
              onChange={() => toggleEmailEvent("newConversation")}
            />
            <Form.Check
              className="mb-3"
              label="Escalated Conversation"
              checked={settings.emailEvents.escalatedConversation}
              onChange={() => toggleEmailEvent("escalatedConversation")}
            />
            <Form.Check
              className="mb-3"
              label="Low Confidence Warning"
              checked={settings.emailEvents.lowConfidence}
              onChange={() => toggleEmailEvent("lowConfidence")}
            />
            <Form.Check
              className="mb-3"
              label="Failed Conversation"
              checked={settings.emailEvents.failedConversation}
              onChange={() => toggleEmailEvent("failedConversation")}
            />
            <Form.Check
              className="mb-3"
              label="Negative Feedback"
              checked={settings.emailEvents.negativeFeedback}
              onChange={() => toggleEmailEvent("negativeFeedback")}
            />
            <Form.Check
              className="mb-3"
              label="Daily Summary"
              checked={settings.emailEvents.dailySummary}
              onChange={() => toggleEmailEvent("dailySummary")}
            />
            <Form.Check
              className="mb-3"
              label="Weekly Report"
              checked={settings.emailEvents.weeklyReport}
              onChange={() => toggleEmailEvent("weeklyReport")}
            />
          </Col>
        </Row>

        <Row className="mt-3">
          <Col md={6}>
            <Form.Label>Frequency</Form.Label>

            <Form.Check
              className="mb-2"
              type="radio"
              name="emailFrequency"
              label="Real-time"
              checked={settings.emailFrequency === "REALTIME"}
              onChange={() =>
                setSettings({ ...settings, emailFrequency: "REALTIME" })
              }
            />
            <Form.Check
              className="mb-2"
              type="radio"
              name="emailFrequency"
              label="Hourly Digest"
              checked={settings.emailFrequency === "HOURLY"}
              onChange={() =>
                setSettings({ ...settings, emailFrequency: "HOURLY" })
              }
            />
            <Form.Check
              type="radio"
              name="emailFrequency"
              label="Daily Digest"
              checked={settings.emailFrequency === "DAILY"}
              onChange={() =>
                setSettings({ ...settings, emailFrequency: "DAILY" })
              }
            />
          </Col>
        </Row>

        <hr />

        <h6 className="text-primary mb-3">Push Notifications</h6>

        <Form.Check
          type="switch"
          label="Enable for admins"
          checked={settings.enablePush}
          onChange={(e) =>
            setSettings({ ...settings, enablePush: e.target.checked })
          }
        />

        <Row className="mt-3">
          <Col md={12}>
            <Form.Label>Events</Form.Label>

            <Form.Check
              className="mb-3"
              label="New Conversation"
              checked={settings.pushEvents.newConversation}
              onChange={() => togglePushEvent("newConversation")}
            />

            <Form.Check
              className="mb-3"
              label="Escalated Conversation"
              checked={settings.pushEvents.escalatedConversation}
              onChange={() => togglePushEvent("escalatedConversation")}
            />

            <Form.Check
              className="mb-3"
              label="Low Confidence Warning"
              checked={settings.pushEvents.lowConfidence}
              onChange={() => togglePushEvent("lowConfidence")}
            />

            <Form.Check
              className="mb-3"
              label="Failed Conversation"
              checked={settings.pushEvents.failedConversation}
              onChange={() => togglePushEvent("failedConversation")}
            />

            <Form.Check
              className="mb-3"
              label="Negative Feedback"
              checked={settings.pushEvents.negativeFeedback}
              onChange={() => togglePushEvent("negativeFeedback")}
            />

            <Form.Check
              className="mb-3"
              label="Daily Summary"
              checked={settings.pushEvents.dailySummary}
              onChange={() => togglePushEvent("dailySummary")}
            />

            <Form.Check
              className="mb-3"
              label="Weekly Report"
              checked={settings.pushEvents.weeklyReport}
              onChange={() => togglePushEvent("weeklyReport")}
            />
          </Col>
        </Row>


        <hr />

        <h6 className="text-primary mb-3">In-App Notifications</h6>

        <Form.Check
          type="switch"
          label="Enable In-App Notifications"
          checked={settings.enableInApp}
          onChange={(e) =>
            setSettings({ ...settings, enableInApp: e.target.checked })
          }
        />

        <Row className="mt-3">
          <Col md={6}>
            <Form.Label>Notification Sound</Form.Label>
            <Form.Select
              value={settings.sound}
              onChange={(e) =>
                setSettings({ ...settings, sound: e.target.value })
              }
            >
              <option value="default">Default</option>
              <option value="chime">Chime</option>
              <option value="alert">Alert</option>
            </Form.Select>

            <Button
              size="sm"
              variant="primary"
              className="mt-2"
              onClick={() => alert("Sound test")}
            >
              Play Sound Test
            </Button>
          </Col>
        </Row>

      </Card.Body>
    </Card>
  );
};

export default SettingsNotifications;
