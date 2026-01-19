import { Card, Row, Col, Form, Button } from "react-bootstrap";
import React, { useState } from "react";

const AnalyticsFilter = ({ onApply }) => {
    const formatDate = (date) => date.toISOString().split("T")[0];
    const todayStr = formatDate(new Date());
    const [preset, setPreset] = useState("Today");
    const [startDate, setStartDate] = useState(todayStr);
    const [endDate, setEndDate] = useState(todayStr);
    const [compare, setCompare] = useState(false);

    React.useEffect(() => {
        handleApply();
    }, []);

    // ---------- Helpers ----------

    const applyPreset = (value) => {
        const today = new Date();
        let start, end;

        switch (value) {
            case "Today":
                start = new Date();
                end = new Date();
                break;

            case "Yesterday":
                start = new Date();
                start.setDate(start.getDate() - 1);
                end = new Date(start);
                break;

            case "Last 7 days":
                end = new Date();
                start = new Date();
                start.setDate(end.getDate() - 6);
                break;

            case "Last 30 days":
                end = new Date();
                start = new Date();
                start.setDate(end.getDate() - 29);
                break;

            case "This month":
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date();
                break;

            default:
                return;
        }

        setStartDate(formatDate(start));
        setEndDate(formatDate(end));
    };

    // ---------- Apply Filter ----------
    const handleApply = () => {
        const payload = {
            preset,
            startDate,
            endDate,
            compare,
        };

        if (compare) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffDays =
                (end - start) / (1000 * 60 * 60 * 24) + 1;

            const prevEnd = new Date(start);
            prevEnd.setDate(start.getDate() - 1);

            const prevStart = new Date(prevEnd);
            prevStart.setDate(prevEnd.getDate() - diffDays + 1);

            payload.compareRange = {
                startDate: formatDate(prevStart),
                endDate: formatDate(prevEnd),
            };
        }

        onApply?.(payload);
    };

    return (
        <div className="g-2 h-100">
            <Row className="g-2">
                <Col md={12}>
                    <Card className="rounded-4 shadow-sm analytics-card">
                        <Card.Body>
                            <Row className="g-3 align-items-end">

                                {/* Preset */}
                                <Col xs={12} sm={6} md={2}>
                                    <Form.Label className="small text-muted">
                                        Preset
                                    </Form.Label>
                                    <Form.Select
                                        value={preset}
                                        onChange={(e) => {
                                            setPreset(e.target.value);
                                            applyPreset(e.target.value);
                                        }}
                                    >
                                        <option>Today</option>
                                        <option>Yesterday</option>
                                        <option>Last 7 days</option>
                                        <option>Last 30 days</option>
                                        <option>This month</option>
                                        <option>Custom</option>
                                    </Form.Select>
                                </Col>

                                {/* Start Date */}
                                <Col xs={12} sm={6} md={2}>
                                    <Form.Label className="small text-muted">
                                        Start Date
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => {
                                            setPreset("Custom");
                                            setStartDate(e.target.value);
                                        }}
                                    />
                                </Col>

                                {/* End Date */}
                                <Col xs={12} sm={6} md={2}>
                                    <Form.Label className="small text-muted">
                                        End Date
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => {
                                            setPreset("Custom");
                                            setEndDate(e.target.value);
                                        }}
                                    />
                                </Col>

                                {/* APPLY BUTTON – RIGHT CORNER */}
                                <Col
                                    xs={12}
                                    sm={6}
                                    md={6}
                                    className="d-flex justify-content-end"
                                >
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        className="px-4"
                                        onClick={handleApply}
                                    >
                                        Apply Filter
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>

    );
};

export default AnalyticsFilter;
