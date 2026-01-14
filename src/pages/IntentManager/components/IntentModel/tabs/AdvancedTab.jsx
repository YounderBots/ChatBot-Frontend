import React, {
  useState,
  forwardRef,
  useImperativeHandle
} from "react";
import { Row, Col, Form, Badge, ProgressBar } from "react-bootstrap";

const MOCK_CONTEXTS = ["auth", "order", "payment", "profile", "support"];

const AdvancedTab = forwardRef((props, ref) => {
  const [contextsRequired, setContextsRequired] = useState([]);
  const [contextsSet, setContextsSet] = useState([]);
  const [fallback, setFallback] = useState("clarify");
  const [threshold, setThreshold] = useState(60);
  const [enabled, setEnabled] = useState(true);

  // 🔥 TestPanel control
  const [showTestPanel, setShowTestPanel] = useState(false);

  const toggleMulti = (value, setter, state) => {
    setter(
      state.includes(value)
        ? state.filter(v => v !== value)
        : [...state, value]
    );
  };

  // 👇 exposed to IntentModal
  useImperativeHandle(ref, () => ({
    // Future methods can be added here
  }));

  return (
    <>
      {/* ADVANCED SETTINGS */}
      <div className="p-4 bg-white rounded shadow-sm h-100">
        <Row className="g-4">
          <Col lg={12}>
            <h6 className="fw-bold mb-3">Advanced Configuration</h6>

            {/* Context Requirements */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-secondary">
                Context Requirements
              </Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {MOCK_CONTEXTS.map(ctx => (
                  <Badge
                    key={ctx}
                    bg={contextsRequired.includes(ctx) ? "primary" : "light"}
                    text={contextsRequired.includes(ctx) ? "light" : "dark"}
                    className="cursor-pointer"
                    onClick={() =>
                      toggleMulti(ctx, setContextsRequired, contextsRequired)
                    }
                  >
                    {ctx}
                  </Badge>
                ))}
              </div>
            </Form.Group>

            {/* Context Output */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-secondary">
                Context Output
              </Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {MOCK_CONTEXTS.map(ctx => (
                  <Badge
                    key={ctx}
                    bg={contextsSet.includes(ctx) ? "success" : "light"}
                    text={contextsSet.includes(ctx) ? "light" : "dark"}
                    className="cursor-pointer"
                    onClick={() =>
                      toggleMulti(ctx, setContextsSet, contextsSet)
                    }
                  >
                    {ctx}
                  </Badge>
                ))}
              </div>
            </Form.Group>

            {/* Fallback */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-secondary">
                Fallback Action
              </Form.Label>
              <Form.Select
                value={fallback}
                onChange={e => setFallback(e.target.value)}
              >
                <option value="clarify">Ask clarification</option>
                <option value="escalate">Escalate</option>
                <option value="generic">Generic response</option>
              </Form.Select>
            </Form.Group>

            {/* Confidence */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold small text-secondary">
                Confidence Threshold ({threshold}%)
              </Form.Label>
              <Form.Range
                min={0}
                max={100}
                value={threshold}
                onChange={e => setThreshold(Number(e.target.value))}
              />
              <ProgressBar
                now={threshold}
                variant={threshold < 60 ? "danger" : "success"}
              />
            </Form.Group>

            {/* Enable */}
            <Form.Check
              type="switch"
              label="Enable Intent"
              checked={enabled}
              onChange={e => setEnabled(e.target.checked)}
            />
          </Col>
        </Row>
      </div>

    </>
  );
});

export default AdvancedTab;
