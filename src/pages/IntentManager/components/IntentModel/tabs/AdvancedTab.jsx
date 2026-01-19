import React, {
  forwardRef,
  useImperativeHandle
} from "react";
import { Row, Col, Form, Badge, ProgressBar } from "react-bootstrap";

const MOCK_CONTEXTS = ["auth", "order", "payment", "profile", "support"];

const AdvancedTab = forwardRef(({ value, onChange }, ref) => {

  const update = (key, val) => {
    onChange(prev => ({ ...prev, [key]: val }));
  };

  const toggleMulti = (key, item) => {
    update(
      key,
      value[key].includes(item)
        ? value[key].filter(v => v !== item)
        : [...value[key], item]
    );
  };

  useImperativeHandle(ref, () => ({
    getAdvancedConfig: () => value
  }));

  return (
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
                  bg={value.contextsRequired.includes(ctx) ? "primary" : "light"}
                  text={value.contextsRequired.includes(ctx) ? "light" : "dark"}
                  className="cursor-pointer"
                  onClick={() => toggleMulti("contextsRequired", ctx)}
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
                  bg={value.contextsSet.includes(ctx) ? "success" : "light"}
                  text={value.contextsSet.includes(ctx) ? "light" : "dark"}
                  className="cursor-pointer"
                  onClick={() => toggleMulti("contextsSet", ctx)}
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
              value={value.fallback}
              onChange={e => update("fallback", e.target.value)}
            >
              <option value="clarify">Ask clarification</option>
              <option value="escalate">Escalate</option>
              <option value="generic">Generic response</option>
            </Form.Select>
          </Form.Group>

          {/* Confidence */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold small text-secondary">
              Confidence Threshold ({value.threshold}%)
            </Form.Label>
            <Form.Range
              min={0}
              max={100}
              value={value.threshold}
              onChange={e => update("threshold", Number(e.target.value))}
            />
            <ProgressBar
              now={value.threshold}
              variant={value.threshold < 60 ? "danger" : "success"}
            />
          </Form.Group>

          {/* Enable */}
          <Form.Check
            type="switch"
            label="Enable Intent"
            checked={value.enabled}
            onChange={e => update("enabled", e.target.checked)}
          />
        </Col>
      </Row>
    </div>
  );
});

export default AdvancedTab;
