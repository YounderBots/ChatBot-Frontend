import React, { useState, useEffect } from "react";
import './Analytics.css'
import { Card, Row, Col, Form, Button, } from "react-bootstrap";
import KeymetricsGird from "./components/KeymetricsGrid";
import NormalLayout from "../../components/NormalLayout";
import AnalyticsCharts from "./components/Analyticscharts";
import AnalyticsTables from "./components/AnalyticsTables";
import AnalyticsFilter from "./components/AnalyticsFilter";

const AnalyticsContent = () => {
  const [reportType, setReportType] = useState("summary");
  const [exportFormat, setExportFormat] = useState("pdf");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [frequency, setFrequency] = useState("weekly");
  const [emailTo, setEmailTo] = useState("");
  const [generating, setGenerating] = useState(false);
  const [liveUsers, setLiveUsers] = useState(0);
  const [activeConversations, setActiveConversations] = useState(0);
  const [messagesPerMinute, setMessagesPerMinute] = useState(0);
  const [systemHealth, setSystemHealth] = useState("Healthy");

  useEffect(() => {
    const updateMetrics = () => {
      setLiveUsers(Math.floor(Math.random() * 200) + 50);
      setActiveConversations(Math.floor(Math.random() * 120) + 20);
      setMessagesPerMinute(Math.floor(Math.random() * 500) + 100);

      const healthStates = ["Healthy", "Degraded", "Down"];
      setSystemHealth(healthStates[Math.floor(Math.random() * healthStates.length)]);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  const generateReport = () => {
    setGenerating(true);

    const generated = {
      reportType,
      exportFormat,
      scheduleEnabled,
      frequency,
      emailTo,
    };

    console.log("Generate report:", generated);

    setTimeout(() => {
      setGenerating(false);
    }, 1200);
  };

  return (
    <div className="p-2 P-100">
      <Row>

        <Col md={12} className="mb-2">
          <AnalyticsFilter />
        </Col>
        <Col md={12} className="mb-2">
          <KeymetricsGird />
        </Col>
        <Col md={12} className="mb-2">
          <AnalyticsCharts />
        </Col>
        <Col md={12} className="mb-2">
          <AnalyticsTables />
        </Col>

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
                    variant="outline-secondary"
                    className="px-3 border border-secondary"
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

        <Col md={12}>
          <Card className="rounded-4 shadow-sm analytics-card mt-2">
            <Card.Body className="analytics-card-body">
              <h5 className="mb-3">Real-time Metrics</h5>

              <Row className="g-3">

                {/* Live Users */}
                <Col md={3}>
                  <Card className="H-100 border-0 bg-light">
                    <Card.Body>
                      <div className="text-muted small">Live Users</div>
                      <h3 className="fw-bold mt-1">{liveUsers}</h3>
                      <div className="small text-muted">Updated every 5s</div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Active Conversations */}
                <Col md={3}>
                  <Card className="h-100 border-0 bg-light">
                    <Card.Body>
                      <div className="text-muted small">Active Conversations</div>
                      <h3 className="fw-bold mt-1">{activeConversations}</h3>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Messages per Minute */}
                <Col md={3}>
                  <Card className="h-100 border-0 bg-light">
                    <Card.Body>
                      <div className="text-muted small">Messages / Minute</div>
                      <h3 className="fw-bold mt-1">{messagesPerMinute}</h3>
                    </Card.Body>
                  </Card>
                </Col>

                {/* System Health */}
                <Col md={3}>
                  <Card className="h-100 border-0 bg-light">
                    <Card.Body>
                      <div className="text-muted small">System Health</div>
                      <h5
                        className={`fw-semibold mt-2 ${systemHealth === "Healthy"
                          ? "text-success"
                          : systemHealth === "Degraded"
                            ? "text-warning"
                            : "text-danger"
                          }`}
                      >
                        {systemHealth}
                      </h5>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row >
    </div >
  );
};


const Analytics = () => {
  return (
    <NormalLayout>
      <AnalyticsContent />
    </NormalLayout>
  )
}

export default Analytics;