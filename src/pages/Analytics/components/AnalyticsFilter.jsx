import { Card, Row, Col, Form, Button, } from "react-bootstrap";
import React, { useState, useRef, useEffect } from "react";

const AnalyticsFilter = () => {
    const [compare, setCompare] = useState(false);

    return (
        <div className="p-2 p-100">
                        <Row className="g-3">
            {/* ================= FILTER BAR ================= */}
            <Card className="rounded-4 shadow-sm analytics-card">
                <Card.Body>
                    <Row className="g-3 align-items-end">
                        <Col md={2}>
                            <Form.Label className="small text-muted">Preset</Form.Label>
                            <Form.Select>
                                <option>Today</option>
                                <option>Yesterday</option>
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                                <option>This month</option>
                                <option>Custom</option>
                            </Form.Select>
                        </Col>

                        <Col md={2}>
                            <Form.Label className="small text-muted">Start Date</Form.Label>
                            <Form.Control type="date" />
                        </Col>

                        <Col md={2}>
                            <Form.Label className="small text-muted">End Date</Form.Label>
                            <Form.Control type="date" />
                        </Col>

                        <Col md={3} className="d-flex justify-content-end align-items-center">
                            <Form.Check
                                type="switch"
                                id="compare-switch"
                                checked={compare}
                                onChange={(e) => setCompare(e.target.checked)}
                                label={
                                    <span className="small fw-medium text-muted ms-2">
                                        Compare with previous period
                                    </span>
                                }
                            />
                        </Col>

                        <Col md={3} className="text-end">
                            <Button
                                size="sm"
                                variant="outline-secondary"
                                className="border border-secondary"
                            >
                                Apply Filter
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            </Row>
        </div>
    )
}

export default AnalyticsFilter