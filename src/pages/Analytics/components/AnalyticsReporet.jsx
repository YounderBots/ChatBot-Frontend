import React, { useState } from "react";
import '../Analytics.css'
import { Card, Row, Col, Form, Button, } from "react-bootstrap";

const AnalyticsReport = () => {

    const [reportType, setReportType] = useState("summary");
    const [exportFormat, setExportFormat] = useState("pdf");
    const [scheduleEnabled, setScheduleEnabled] = useState(false);
    const [frequency, setFrequency] = useState("weekly");
    const [emailTo, setEmailTo] = useState("");
    const [generating, setGenerating] = useState(false);

    const generateReport = async () => {
        setGenerating(true);

        try {
            const generated = {
                reportType,
                exportFormat,
                scheduleEnabled,
                frequency,
                emailTo,
            };

            await new Promise(resolve => setTimeout(resolve, 1200));

            // Proper MIME types for each format
            const mimeTypes = {
                'pdf': 'application/pdf',
                'json': 'application/json',
                'csv': 'text/csv',
                'txt': 'text/plain'
            };

            const mimeType = mimeTypes[exportFormat] || 'text/plain';
            const content = `Report Type: ${reportType}\nExport Format: ${exportFormat}\nGenerated: ${new Date().toLocaleString()}`;
            const fileName = `report-${reportType}.${exportFormat}`;

            const link = document.createElement('a');
            link.href = `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`;
            link.download = fileName;
            link.rel = 'noopener';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('Report generation failed:', error);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="g-2 P-100">
            <Row>

                <Col md={12}>
                    <Card className="rounded-4 shadow-sm analytics-card mt-0">
                        <Card.Body className="analytics-card-body">
                            <h5 className="mb-3">Export Reports</h5>

                            <Row className="g-3">

                                {/* Report Type */}
                                <Col md={4}>
                                    <Form.Label>Report Type</Form.Label>
                                    <Form.Select
                                        value={reportType}
                                        onChange={(e) => setReportType(e.target.value)}
                                    >
                                        <option value="summary">Conversation Summary</option>
                                        <option value="intent">Intent Performance</option>
                                        <option value="engagement">User Engagement</option>
                                        <option value="custom">Custom Report</option>
                                    </Form.Select>
                                </Col>

                                {/* Date Range */}
                                <Col md={4}>
                                    <Form.Label>Date Range</Form.Label>
                                    <Form.Control type="date" />
                                </Col>

                                <Col md={4}>
                                    <Form.Label>&nbsp;</Form.Label>
                                    <Form.Control type="date" />
                                </Col>

                                {/* Intents Filter */}
                                <Col md={4}>
                                    <Form.Label>Intents</Form.Label>
                                    <Form.Select>
                                        <option>All Intents</option>
                                        <option>Order Status</option>
                                        <option>Refund</option>
                                        <option>Cancel Order</option>
                                    </Form.Select>
                                </Col>

                                {/* Platform Filter */}
                                <Col md={4}>
                                    <Form.Label>Platform</Form.Label>
                                    <Form.Select>
                                        <option>All Platforms</option>
                                        <option>Web</option>
                                        <option>Mobile</option>
                                    </Form.Select>
                                </Col>

                                {/* Export Format */}
                                <Col xs={12} md={4}>
                                    <Form.Label className="form-label small mb-1">
                                        Format
                                    </Form.Label>
                                    <div className="d-flex align-items-center flex-wrap mt-2 gap-2">
                                        {["pdf", "csv", "excel", "json"].map((fmt) => (
                                            <Form.Check
                                                key={`format-${fmt}`}
                                                type="radio"
                                                inline
                                                name="export-format"
                                                checked={exportFormat === fmt}
                                                onChange={() => setExportFormat(fmt)}
                                                label={
                                                    <span className="small text-muted fw-medium ms-1">
                                                        {fmt.toUpperCase()}
                                                    </span>
                                                }
                                            />
                                        ))}
                                    </div>
                                </Col>

                                {/* Generate Button */}
                                <Col md={12} className="text-end">
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={generateReport}
                                        disabled={generating || (scheduleEnabled && !emailTo)}
                                    >
                                        {generating ? "Generating..." : "Generate Report"}
                                    </Button>
                                </Col>

                                {/* Schedule Toggle */}
                                <Col md={12} className="d-flex align-items-center">
                                    <Form.Check
                                        type="switch"
                                        id="schedule-switch"
                                        checked={scheduleEnabled}
                                        onChange={(e) => setScheduleEnabled(e.target.checked)}
                                        className="me-2"
                                    />
                                    <span className="fw-medium">
                                        Schedule Report
                                    </span>
                                </Col>


                                {scheduleEnabled && (
                                    <>
                                        {/* Frequency */}
                                        <hr className="my-3" />
                                        <Col md={4}>
                                            <Form.Label>Frequency</Form.Label>
                                            <Form.Select
                                                value={frequency}
                                                onChange={(e) => setFrequency(e.target.value)}
                                            >
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                            </Form.Select>
                                        </Col>

                                        {/* Email */}
                                        <Col md={8}>
                                            <Form.Label>Email To</Form.Label>
                                            <Form.Control
                                                type="email"
                                                placeholder="example@company.com"
                                                value={emailTo}
                                                onChange={(e) => setEmailTo(e.target.value)}
                                            />
                                        </Col>
                                    </>
                                )}
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}


export default AnalyticsReport