import { User } from "lucide-react";
import React, { useState } from "react";
import { Card, Row, Col, Form, Button } from "react-bootstrap";

const SettingsAppearance = () => {
 
  const defaultSettings = {
  primaryColor: "#f1f3f5",
  ConversationBotColor:"#0000FF",
  ConversationWordColor:"#FFFFFF",
  UserChatColor:"#f1f3f5",
  UserWordColor:"#111111",
  ButtonColor:"#007bff",
  fontFamily: "Sans-serif",

  widgetPosition: "bottom-right",
  widgetSize: "medium",
  chatBubbleText: "Chat with us",

  autoOpen: false,
  autoOpenDelay: 5,
  showOnMobile: true,

  greetingDelay: 0,

  showOnScroll: false,
  scrollPercent: 50,
};
const [settings, setSettings] = useState(defaultSettings);

const handleReset = () => {
  setSettings(defaultSettings);
};

  return (
    <Card className="border-0">
      <Card.Body>

        {/* CHAT WIDGET CUSTOMIZATION */}
        <h6 className="text-primary mb-3">Chat Widget Customization</h6>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Label>Widget Background Color</Form.Label>
            <Form.Control
              type="color"
              value={settings.primaryColor}
              onChange={(e) =>
                setSettings({ ...settings, primaryColor: e.target.value })
              }
            />
          </Col>

          <Col md={4}>
            <Form.Label>BotChat Message Background</Form.Label>
            <Form.Control
              type="color"
              value={settings.ConversationBotColor}
              onChange={(e) =>
                setSettings({ ...settings, ConversationBotColor: e.target.value })
              }
            />
          </Col>

          <Col md={4}>
            <Form.Label>Userchat Message Background</Form.Label>
            <Form.Control
              type="color"
              value={settings.UserChatColor}
              onChange={(e) =>
                setSettings({ ...settings, UserChatColor: e.target.value })
              }
            />
          </Col>

          <Col md={4}>
            <Form.Label>Bot Text Color</Form.Label>
            <Form.Control
              type="color"
              value={settings.ConversationWordColor}
              onChange={(e) =>
                setSettings({ ...settings, ConversationWordColor: e.target.value })
              }
            />
          </Col>

          <Col md={4}>
            <Form.Label>User Text Color</Form.Label>
            <Form.Control
              type="color"
              value={settings.UserWordColor}
              onChange={(e) =>
                setSettings({ ...settings, UserWordColor: e.target.value })
              }
            />
          </Col>
          
          <Col md={4}>
            <Form.Label>Button Color</Form.Label>
            <Form.Control
              type="color"
              value={settings.ButtonColor}
              onChange={(e) =>
                setSettings({ ...settings, ButtonColor: e.target.value })
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


        {/* <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Widget Position</Form.Label>
            <Form.Check
              className="mb-3"
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
        </Row> */}

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
            width:"400px",
            borderRadius: "16px",
            fontFamily: settings.fontFamily,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            overflow: "hidden",
            background: settings.primaryColor,
            position: "relative",
          }}
        >
          <div style={{ padding: "12px" }}>
            <div style={{ textAlign: "right", marginBottom: "10px" }}>
              <span
                style={{
                  background: settings.ConversationBotColor,
                  color: settings.ConversationWordColor,
                  padding: "6px 12px",
                  borderRadius: "16px",
                  fontSize: "12px",
                  display: "inline-block",
                }}
              >
                Hello
              </span>
            </div>

            <div
              style={{
                background: settings.UserChatColor,
                borderRadius: "12px",
                padding: "10px",
                fontSize: "12px",
                color: settings.UserWordColor,
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
            >
              <p style={{ marginBottom: "10px" }}>
                Our team will get back to you soon.
              </p>

              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                {["Track Order", "Pricing", "Talk to Agent"].map((text) => (
                  <button
                    key={text}
                    style={{
                      color: settings.ButtonColor,
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight: 500,
                      border: "none",
                      borderRadius: "20px",
                      padding: "6px 14px",
                    }}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              padding: "8px",
              background: "settings.primaryColor",
              borderTop: "1px solid #dee2e6",
            }}
          >
            <input
              disabled
              placeholder="Type a message..."
              style={{
                flex: 1,
                border: "1px solid #ced4da",
                borderRadius: "20px",
                padding: "6px 12px",
                fontSize: "12px",
                outline: "none",
              }}
            />
            <button
              style={{
                marginLeft: "6px",
                background: "blue",
                color: "#fff",
                border: "none",
                borderRadius: "20px",
                padding: "6px 14px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>


        <div className="mt-4">
          <Button size="sm" variant="danger"  onClick={handleReset}>
            Reset to Default
          </Button>
        </div>

      </Card.Body>
    </Card>
  );
};

export default SettingsAppearance;
