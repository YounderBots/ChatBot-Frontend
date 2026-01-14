import React, { useState } from "react";
import { Card, Row, Col, Form, Button } from "react-bootstrap";

const SettingsAppearance = () => {
  const [settings, setSettings] = useState({
    primaryColor: "#0d6efd",
    headerColor: "#0d6efd",
    secondaryColor: "#f1f3f5",
    fontFamily: "Sans-serif",

    widgetPosition: "bottom-right",
    widgetSize: "medium",
    chatBubbleText: "Chat with us",

    autoOpen: false,
    autoOpenDelay: 5,
    showOnMobile: true,
    showOnScroll: false,
    scrollPercent: 50,
  });

  return (
    <Card className="border-0">
      <Card.Body>

        {/* CHAT WIDGET CUSTOMIZATION */}
        <h6 className="text-primary mb-3">Chat Widget Customization</h6>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Label>Primary Color</Form.Label>
            <Form.Control
              type="color"
              value={settings.primaryColor}
              onChange={(e) =>
                setSettings({ ...settings, primaryColor: e.target.value })
              }
            />
          </Col>

          <Col md={4}>
            <Form.Label>Header Color</Form.Label>
            <Form.Control
              type="color"
              value={settings.headerColor}
              onChange={(e) =>
                setSettings({ ...settings, headerColor: e.target.value })
              }
            />
          </Col>

          <Col md={4}>
            <Form.Label>Secondary Color</Form.Label>
            <Form.Control
              type="color"
              value={settings.secondaryColor}
              onChange={(e) =>
                setSettings({ ...settings, secondaryColor: e.target.value })
              }
            />
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={6}>
            <Form.Label>Font Family</Form.Label>
            <Form.Select
              value={settings.fontFamily}
              onChange={(e) =>
                setSettings({ ...settings, fontFamily: e.target.value })
              }
            >
              <option>Sans-serif</option>
              <option>Serif</option>
              <option>Monospace</option>
            </Form.Select>
          </Col>

          <Col md={6}>
            <Form.Label>Chat Bubble Text</Form.Label>
            <Form.Control
              type="text"
              placeholder="Chat with us"
              value={settings.chatBubbleText}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  chatBubbleText: e.target.value,
                })
              }
            />
          </Col>
        </Row>


        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Widget Position</Form.Label>
            <Form.Check
              type="radio"
              name="position"
              label="Bottom Right"
              checked={settings.widgetPosition === "bottom-right"}
              onChange={() =>
                setSettings({ ...settings, widgetPosition: "bottom-right" })
              }
            />
            <Form.Check
              type="radio"
              name="position"
              label="Bottom Left"
              checked={settings.widgetPosition === "bottom-left"}
              onChange={() =>
                setSettings({ ...settings, widgetPosition: "bottom-left" })
              }
            />
          </Col>

          <Col md={6}>
            <Form.Label>Widget Size</Form.Label>
            <Form.Select
              value={settings.widgetSize}
              onChange={(e) =>
                setSettings({ ...settings, widgetSize: e.target.value })
              }
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </Form.Select>
          </Col>
        </Row>

        <hr />

        {/* WIDGET BEHAVIOR */}
        <h6 className="text-primary mb-3">Widget Behavior</h6>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Check 
              type="checkbox"
              label="Auto-open on page load"
              checked={settings.autoOpen}
              onChange={(e) =>
                setSettings({ ...settings, autoOpen: e.target.checked })
              }
            />
          </Col>

          {settings.autoOpen && (
            <Col md={6}>
              <Form.Label>Delay (seconds)</Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={settings.autoOpenDelay}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    autoOpenDelay: Number(e.target.value),
                  })
                }
              />
            </Col>
          )}
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Check
              type="checkbox"
              label="Show on mobile"
              checked={settings.showOnMobile}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  showOnMobile: e.target.checked,
                })
              }
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Greeting delay (seconds)</Form.Label>
            <Form.Control
              type="number"
              min={0}
              value={settings.greetingDelay}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  greetingDelay: Number(e.target.value),
                })
              }
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Check
              type="checkbox"
              label="Show when scrolled"
              checked={settings.showOnScroll}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  showOnScroll: e.target.checked,
                })
              }
            />
          </Col>

          {settings.showOnScroll && (
            <Col md={12}>
              <Form.Label>Scroll percentage</Form.Label>
              <Form.Control
                type="number"
                min={10}
                max={100}
                value={settings.scrollPercent}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    scrollPercent: Number(e.target.value),
                  })
                }
              />
            </Col>
          )}
        </Row>


        <hr />

        {/* PREVIEW */}
        <h6 className="text-primary mb-3">Preview</h6>

        <div
          style={{
            background: settings.primaryColor,
            color: "#fff",
            width:
              settings.widgetSize === "small"
                ? "220px"
                : settings.widgetSize === "large"
                ? "320px"
                : "260px",
            borderRadius: "12px",
            padding: "12px",
            fontFamily: settings.fontFamily,
          }}
        >
          <strong>{settings.chatBubbleText}</strong>
          <div style={{ fontSize: "12px", marginTop: "8px" }}>
            Hello! How can I help you?
          </div>
        </div>

        <div className="mt-3">
          <Button size="sm" variant="outline-secondary">
            Reset to Default
          </Button>
        </div>

      </Card.Body>
    </Card>
  );
};

export default SettingsAppearance;
