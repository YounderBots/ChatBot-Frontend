import React, { useState, useRef, useEffect } from "react";
import './Analytics.css'
import { Card, Row, Col, Form, Button, Modal, Badge, Table, } from "react-bootstrap";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Legend,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,

} from "recharts";
import html2canvas from "html2canvas";
import { FaSortUp, FaSortDown, FaFileCsv, FaEye } from "react-icons/fa";


/* ================= MOCK DATA ================= */
const totalConversations = 18420;
const previousConversations = 15400;
const yesterdayConversations = 5060;
const todayConversations = 7834;

const sparkData = [
  { v: 120 },
  { v: 160 },
  { v: 200 },
  { v: 240 },
  { v: 300 },
];


const uniqueUsersData = [
  { name: "New Users", value: 62 },
  { name: "Returning Users", value: 38 },
];

const responseDist = [
  { name: "<1s", value: 45 },
  { name: "1-3s", value: 35 },
  { name: ">3s", value: 20 },
];

const resolutionData = [
  { name: "Auto-resolved", value: 68 },
  { name: "Escalated", value: 16 },
];

const conversationTrendData = [
  { time: "Mon", total: 420, resolved: 310, escalated: 70, failed: 40 },
  { time: "Tue", total: 520, resolved: 390, escalated: 80, failed: 50 },
  { time: "Wed", total: 610, resolved: 470, escalated: 90, failed: 50 },
  { time: "Thu", total: 680, resolved: 540, escalated: 80, failed: 60 },
  { time: "Fri", total: 720, resolved: 580, escalated: 90, failed: 50 },
  { time: "Sat", total: 420, resolved: 310, escalated: 70, failed: 40 },
];

const intentData = [
  {
    intent: "Order Status",
    uses: 820,
    confidence: 0.92,
    successRate: 88,
    avgTime: 1.2,
    feedback: 4.5,
    trend: 6.8,
  },
  {
    intent: "Refund",
    uses: 610,
    confidence: 0.81,
    successRate: 79,
    avgTime: 1.6,
    feedback: 4.1,
    trend: -1.9,
  },
  {
    intent: "Cancel Order",
    uses: 540,
    confidence: 0.75,
    successRate: 72,
    avgTime: 1.9,
    feedback: 3.9,
    trend: -3.4,
  },
  {
    intent: "Delivery Delay",
    uses: 430,
    confidence: 0.68,
    successRate: 64,
    avgTime: 2.3,
    feedback: 3.6,
    trend: 2.1,
  },
];

const confidenceHistogram = [
  { range: "0-20%", count: 120 },
  { range: "20-40%", count: 260 },
  { range: "40-60%", count: 380 },
  { range: "60-80%", count: 520 },
  { range: "80-100%", count: 710 },
];

const sentimentData = [
  { day: "Mon", positive: 60, neutral: 25, negative: 15 },
  { day: "Tue", positive: 62, neutral: 23, negative: 15 },
  { day: "Wed", positive: 58, neutral: 27, negative: 15 },
  { day: "Thu", positive: 64, neutral: 22, negative: 14 },
  { day: "Fri", positive: 44, neutral: 27, negative: 15 },
  { day: "Sat", positive: 70, neutral: 27, negative: 15 },
];

const FunnelData = [
  { stage: "Session Started", value: 12000 },
  { stage: "Message Sent", value: 9400 },
  { stage: "Intent Matched", value: 7100 },
  { stage: "Resolved", value: 5200 },
  { stage: "Feedback Given", value: 3100 },
];


const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 24 }, (_, i) => i);

/* Heatmap volume data */
const heatmapData = {
  Mon: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)),
  Tue: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)),
  Wed: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)),
  Thu: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)),
  Fri: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)),
  Sat: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)),
  Sun: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)),
};


const userEngagementData = [
  {
    session: "S-9832",
    platform: "Web",
    messages: 14,
    duration: "6m 12s",
    intents: 5,
    status: "Resolved",
    satisfaction: "Satisfied",
    lastActive: "2 mins ago",
  },
  {
    session: "S-9838",
    platform: "Mobile",
    messages: 6,
    duration: "2m 45s",
    intents: 2,
    status: "Escalated",
    satisfaction: "Neutral",
    lastActive: "5 mins ago",
  },
];


const tableColumns = [
  { key: "intent", label: "Intent Name" },
  { key: "uses", label: "Total Uses" },
  { key: "confidence", label: "Avg Confidence (%)" },
  { key: "successRate", label: "Success Rate (%)" },
  { key: "avgTime", label: "Avg Response Time (s)" },
  { key: "feedback", label: "Feedback Score" },
  { key: "trend", label: "Trend (7d %)" },
];

const defaultSort = {
  key: "uses",
  direction: "desc",
};

const Analytics = () => {
  const [compare, setCompare] = useState(false);
  const [sortBy, setSortBy] = useState("usage");
  const [selectedIntent, setSelectedIntent] = useState(null);
  const [showIntentModal, setShowIntentModal] = useState(false);
  const [confidenceFilter, setConfidenceFilter] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [reportType, setReportType] = useState("summary");
  const [exportFormat, setExportFormat] = useState("pdf");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [frequency, setFrequency] = useState("weekly");
  const [emailTo, setEmailTo] = useState("");
  const [generating, setGenerating] = useState(false);
  const [drillMetric, setDrillMetric] = useState(null);
  const [showDrillModal, setShowDrillModal] = useState(false);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortConfig, setSortConfig] = useState(defaultSort);
  const [pendingSort, setPendingSort] = useState(defaultSort);
  const [liveUsers, setLiveUsers] = useState(0);
  const [activeConversations, setActiveConversations] = useState(0);
  const [messagesPerMinute, setMessagesPerMinute] = useState(0);
  const [systemHealth, setSystemHealth] = useState("Healthy");
  const [tooltip, setTooltip] = React.useState(null);

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

  const sortedData = [...intentData].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key])
      return sortConfig.direction === "asc" ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key])
      return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const exportCSV = () => {
    const headers = [
      "Intent Name",
      "Total Uses",
      "Avg Confidence",
      "Success Rate",
      "Avg Response Time",
      "Feedback Score",
      "Trend (7d %)",
    ];

    const rows = sortedData.map((i) => [
      i.intent,
      i.uses,
      i.confidence,
      i.successRate,
      i.avgTime,
      i.feedback,
      i.trend,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `intent_performance_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
  };

  const applyTableFilter = () => {
    setSortConfig(pendingSort);
    setShowFilterModal(false);
  };

  const handleViewDetails = (row) => {
    const intentDetails = intentData.find(
      (item) => item.intent === row.intent
    );

    setSelectedIntent(intentDetails);
    setShowIntentModal(true);
  };

  const trendPercent = (
    ((totalConversations - previousConversations) / previousConversations) *
    100
  ).toFixed(1);

  const isPositive = trendPercent >= 0;

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

  const sortedIntentData = [...intentData]
    .sort((a, b) => {
      if (sortBy === "usage") return b.uses - a.uses;
      if (sortBy === "confidence") return b.confidence - a.confidence;
      if (sortBy === "name") return a.intent.localeCompare(b.intent);
      return 0;
    })
    .slice(0, 20);

  /* Color by confidence */
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.85) return "#198754";
    if (confidence >= 0.65) return "#fd7e14";
    return "#dc3545";
  };

  const handleDrillDown = (metric) => {
    setDrillMetric(metric);
    setShowDrillModal(true);
  };

  const showTooltip = (e, day, hour, count) => {
    const rect = e.target.getBoundingClientRect();
    setTooltip({
      day,
      hour,
      count,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  const hideTooltip = () => setTooltip(null);


  const changePercent = (
    ((todayConversations - yesterdayConversations) / yesterdayConversations) *
    100
  ).toFixed(1);

  const isIncrease = changePercent >= 0;

  const exportPNG = async () => {
    if (!chartRef.current) {
      console.error("Export failed: chartRef is null");
      return;
    }

    try {
      const canvas = await html2canvas(chartRef.current, {
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = "conversation-volume.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  const handleConfidenceFilter = (range) => {
    setConfidenceFilter(range);
  };

  const getHeatClass = (count) => {
    if (count >= 70) return "heatmap-peak";
    if (count <= 25) return "heatmap-offpeak";
    return "heatmap-normal";
  };
  const chartRef = useRef(null);

  return (
    <div className="p-3 h-100">
      {/* ================= FILTER BAR ================= */}
      <Card className="rounded-4 shadow-sm mb-3">
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

            <Col md={3}>
              <Form.Check
                label="Compare with previous period"
                checked={compare}
                onChange={(e) => setCompare(e.target.checked)}
              />
            </Col>

            <Col md={3} className="text-end">
              <Button
                size="px-4"
                variant="outline-secondary"
              >
                Apply Filter
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ================= KEY METRICS GRID ================= */}
      <Row className="g-3">
        {/* TOTAL CONVERSATIONS */}
        <Col md={4}>
          <Card
            className="rounded-4 shadow-sm h-100 cursor-pointer"
            onClick={() => handleDrillDown("total_conversations")}
          >
            <Card.Body>
              <div className="text-muted small">Total Conversations</div>
              <h3 className="fw-bold mt-2">
                {totalConversations.toLocaleString()}
              </h3>
              <div
                className={`small fw-semibold ${isPositive ? "text-success" : "text-danger"
                  }`}
              >
                {isPositive ? "▲" : "▼"} {Math.abs(trendPercent)}% vs previous
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={sparkData}>
                  <Line
                    dataKey="v"
                    stroke={isPositive ? "#198754" : "#dc3545"}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
          <Modal
            show={showDrillModal}
            onHide={() => setShowDrillModal(false)}
            size="lg"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {drillMetric === "total_conversations"
                  ? "Total Conversations - Drill Down"
                  : "Metric Details"}
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              {drillMetric === "total_conversations" && (
                <>
                  <Row className="mb-3 text-center text-md-start">
                    <Col xs={12} md={4} className="mb-2 mb-md-0">
                      <div className="text-muted small">Today</div>
                      <h5 className="fw-bold">
                        {todayConversations.toLocaleString()}
                      </h5>
                    </Col>

                    <Col xs={12} md={4} className="mb-2 mb-md-0">
                      <div className="text-muted small">Yesterday</div>
                      <h5 className="fw-bold">
                        {yesterdayConversations.toLocaleString()}
                      </h5>
                    </Col>

                    <Col xs={12} md={4}>
                      <div className="text-muted small">Change</div>
                      <h5
                        className={`fw-bold ${isIncrease ? "text-success" : "text-danger"
                          }`}
                      >
                        {isIncrease ? "▲" : "▼"} {Math.abs(changePercent)}%
                      </h5>
                    </Col>
                  </Row>

                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={conversationTrendData}>
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        dataKey="total"
                        stroke="#0d6efd"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </>
              )}
            </Modal.Body>

            <Modal.Footer>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowDrillModal(false)}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </Col>


        {/* UNIQUE USERS */}
        <Col md={4}>
          <Card className="rounded-4 shadow-sm h-100">
            <Card.Body>
              <div className="text-muted small">Unique Users</div>
              <h3 className="fw-bold mt-2">6,850</h3>
              <div className="small text-muted mb-2">
                New <strong>62%</strong> · Returning <strong>38%</strong>
              </div>

              <div className="pie-chart-wrapper">
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie
                      data={uniqueUsersData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={30}
                      outerRadius={45}
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* AVG MESSAGES */}
        <Col md={4}>
          <Card className="rounded-4 shadow-sm h-100">
            <Card.Body>
              <div className="text-muted small">
                Avg Messages / Conversation
              </div>
              <h3 className="fw-bold mt-2">6.4</h3>
              <div className="text-success small">
                ▲ Target: 5
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* RESOLUTION RATE */}
        <Col md={4}>
          <Card className="rounded-4 shadow-sm h-100">
            <Card.Body>
              <div className="text-muted small">Resolution Rate</div>
              <h3 className="fw-bold mt-2">84%</h3>

              <Row className="align-items-center">
                <Col xs={5} style={{ height: 90 }}>
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie
                        data={resolutionData}
                        dataKey="value"
                        innerRadius={28}
                        outerRadius={40}
                        startAngle={90}
                        endAngle={-270}
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Col>

                <Col xs={7}>
                  <div className="small text-muted mb-1">
                    Auto-resolved: <strong>68%</strong>
                  </div>
                  <div className="small text-muted">
                    Escalated: <strong>16%</strong>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* AVG RESPONSE TIME */}
        <Col md={4}>
          <Card className="rounded-4 shadow-sm h-100">
            <Card.Body>
              <div className="text-muted small">Avg Response Time</div>
              <h3 className="fw-bold mt-2 text-success">1.2s</h3>
              <div className="small text-muted">Fast</div>

              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={responseDist}
                    dataKey="value"
                    innerRadius={30}
                    outerRadius={45}
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* CUSTOMER SATISFACTION */}
        <Col md={4}>
          <Card className="rounded-4 shadow-sm h-100">
            <Card.Body>
              <div className="text-muted small">
                Customer Satisfaction
              </div>
              <h3 className="fw-bold mt-2">4.5 / 5</h3>

              <div className="text-warning fs-5">
                ★★★★☆
              </div>

              <div className="small text-muted">
                3,240 responses
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* ================== CHART 1 (12 COL) ================== */}
        <Col md={12}>
          <Card className="rounded-4 shadow-sm analytics-chart-card">
            <Card.Body className="analytics-chart-body">
              {/* Header */}
              <div className="analytics-chart-header">
                <h6 className="fw-semibold mb-0">
                  Conversation Volume Trend
                </h6>

                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={exportPNG}
                  disabled={!chartRef.current}
                >
                  Export PNG
                </Button>
              </div>

              {/* Chart */}
              <div ref={chartRef} className="analytics-chart-container">
                <ResponsiveContainer width="100%" height={420}>
                  <LineChart
                    data={conversationTrendData}
                    margin={{ top: 10, right: 20, left: 10, bottom: 55 }}
                  >
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend
                      verticalAlign="bottom"
                      height={40}
                      iconSize={8}
                    />

                    <Line dataKey="total" stroke="#0d6efd" strokeWidth={2} dot={false} />
                    <Line dataKey="resolved" stroke="#198754" strokeWidth={2} dot={false} />
                    <Line dataKey="escalated" stroke="#fd7e14" strokeWidth={2} dot={false} />
                    <Line dataKey="failed" stroke="#dc3545" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col >

        {/* ================== CHART 2 (6 COL) ================== */}
        <Col md={6}>
          <Card className="rounded-4 shadow-sm mt-2">
            <Card.Body>
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-semibold mb-0">Intent Performance</h6>

                <Form.Select
                  size="sm"
                  style={{ width: 150 }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="usage">Sort by Usage</option>
                  <option value="confidence">Sort by Confidence</option>
                  <option value="name">Sort by Name</option>
                </Form.Select>
              </div>

              {/* Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <BarChart layout="vertical" data={sortedIntentData}>
                  <XAxis type="number" />
                  <YAxis dataKey="intent" type="category" width={140} />
                  <Tooltip />
                  <Bar
                    dataKey="uses"
                    radius={[0, 6, 6, 0]}
                  >
                    {sortedIntentData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={getConfidenceColor(entry.confidence)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* ================== CHART 3 (6 COL) ================== */}
        <Col md={6}>
          <Card className="rounded-4 shadow-sm mt-2 analytics-card">
            <Card.Body className="analytics-card-body">

              <h6 className="fw-semibold mb-3 analytics-card-title">
                Confidence Distribution
              </h6>

              <div className="analytics-chart-container">
                <ResponsiveContainer width="100%" height={314}>
                  <BarChart data={confidenceHistogram}>
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />

                    <Bar
                      dataKey="count"
                      radius={[6, 6, 0, 0]}
                      onClick={(data) =>
                        handleConfidenceFilter(data.range)
                      }
                    >
                      {confidenceHistogram.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={
                            entry.range.startsWith("0") ||
                              entry.range.startsWith("20") ||
                              entry.range.startsWith("40")
                              ? "#dc3545"
                              : "#0d6efd"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </Card.Body>
          </Card>
        </Col>

        {/* ================== CHART 4 (12 COL) ================== */}
        <Col md={12}>
          <Card className="rounded-4 shadow-sm analytics-card mt-2">
            <Card.Body className="analytics-card-body">

              <h6 className="analytics-card-title">
                Sentiment Analysis
              </h6>

              <div className="analytics-chart-container">
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart
                    data={sentimentData}
                    stackOffset="expand"   // 100% stacked
                  >
                    <XAxis dataKey="day" />
                    <YAxis
                      tickFormatter={(v) => `${Math.round(v * 100)}%`}
                    />
                    <Tooltip
                      formatter={(value) =>
                        `${Math.round(value * 100)}%`
                      }
                    />
                    <Legend />

                    <Area
                      dataKey="positive"
                      stackId="1"
                      stroke="#198754"
                      fill="#198754"
                    />
                    <Area
                      dataKey="neutral"
                      stackId="1"
                      stroke="#adb5bd"
                      fill="#adb5bd"
                    />
                    <Area
                      dataKey="negative"
                      stackId="1"
                      stroke="#dc3545"
                      fill="#dc3545"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

            </Card.Body>
          </Card>
        </Col>

        {/* ================== CHART 5 (6 COL) ================== */}
        <Col md={12}>
          <Card className="rounded-4 shadow-sm">
            <Card.Body>

              <h6 className="fw-semibold mb-3">
                Peak Hours Heatmap
              </h6>

              <div className="analytics-heatmap">

                {/* Empty corner */}
                <div className="heatmap-corner"></div>

                {/* HOURS + GRID (SCROLL TOGETHER) */}
                <div className="heatmap-scroll">

                  {/* HOURS */}
                  <div className="heatmap-hours">
                    {hours.map((h) => (
                      <span key={h}>{h}</span>
                    ))}
                  </div>

                  {/* GRID */}
                  <div className="heatmap-grid">
                    {days.map((day) =>
                      hours.map((hour) => {
                        const count = heatmapData[day][hour];
                        return (
                          <div
                            key={`${day}-${hour}`}
                            className={`heatmap-cell ${getHeatClass(count)}`}
                            onMouseEnter={(e) =>
                              showTooltip(e, day, hour, count)
                            }
                            onMouseLeave={hideTooltip}
                          />
                        );
                      })
                    )}
                  </div>

                </div>

                {/* DAYS */}
                <div className="heatmap-days">
                  {days.map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
              </div>

              {/* TOOLTIP */}
              {tooltip && (
                <div
                  className="heatmap-tooltip"
                  style={{ left: tooltip.x, top: tooltip.y }}
                >
                  <strong>{tooltip.day}</strong><br />
                  <strong>Time: </strong>{tooltip.hour}:00<br />
                  <strong>Count: </strong>{tooltip.count}<br />
                </div>
              )}

            </Card.Body>
          </Card>
        </Col>


        {/* ================== CHART 6 (6 COL) ================== */}
        <Col md={12}>
          <Card className="rounded-4 shadow-sm mt-2">
            <Card.Body>
              <h6 className="fw-semibold mb-3"> User Journey Funnel </h6>
              <ResponsiveContainer width="100%" height={360}>
                <FunnelChart>
                  <Tooltip />
                  <
                    Funnel data={FunnelData} dataKey="value" isAnimationActive={false} >
                    <LabelList
                      dataKey="stage"
                      position="right"
                      fill="#495057"
                    />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
              <div className="mt-3">
                {FunnelData.slice(0, -1).map((step, index) => {
                  const next = FunnelData[index + 1];
                  const conversion = Math.round((next.value / step.value) * 100);
                  return (
                    <div key={step.stage} className="d-flex justify-content-between small text-muted mb-1" >
                      <span> {step.stage} → {next.stage} → {conversion}% conversion </span>
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={12}>
          <Card className="rounded-4 shadow-sm analytics-card mt-2">
            <Card.Body className="analytics-card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Intent Performance</h5>

                <div className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => setShowFilterModal(true)}
                  >
                    Apply Filter
                  </Button>

                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={exportCSV}
                  >
                    Export CSV
                  </Button>
                </div>
              </div>
              <Card.Body className="p-0 ">
                <Table responsive hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      {[
                        { key: "intent", label: "Intent Name" },
                        { key: "uses", label: "Total Uses" },
                        { key: "confidence", label: "Avg Confidence (%)" },
                        { key: "successRate", label: "Success Rate (%)" },
                        { key: "avgTime", label: "Avg Response Time (s)" },
                        { key: "feedback", label: "Feedback Score" },
                        { key: "trend", label: "Trend (7d %)" },
                      ].map((col) => (
                        <th
                          key={col.key}
                        >
                          {col.label}{" "}
                          {sortConfig.key === col.key &&
                            (sortConfig.direction === "asc" ? (
                              <FaSortUp />
                            ) : (
                              <FaSortDown />
                            ))}
                        </th>
                      ))}
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedData.map((row, index) => (
                      <tr key={index}>
                        <td>{row.intent}</td>
                        <td>{row.uses}</td>
                        <td>{row.confidence}%</td>
                        <td>{row.successRate}%</td>
                        <td>{row.avgTime}s</td>
                        <td>{row.feedback}</td>
                        <td>  {row.trend <= 0 ? "-" : " "}
                          {Math.abs(row.trend)}%</td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => handleViewDetails(row)}
                          >
                            <FaEye /> View
                          </Button>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Modal
                  show={showFilterModal}
                  onHide={() => setShowFilterModal(false)}
                  centered
                >
                  <Modal.Header closeButton>
                    <Modal.Title>Apply Table Filter</Modal.Title>
                  </Modal.Header>

                  <Modal.Body>
                    {tableColumns.map((col) => (
                      <Row key={col.key} className="align-items-center mb-3">
                        <Col md={5}>
                          <strong>{col.label}</strong>
                        </Col>

                        <Col md={7}>
                          <Form.Check
                            inline
                            type="radio"
                            label="ASC"
                            name={`sort-${col.key}`}
                            checked={
                              pendingSort.key === col.key &&
                              pendingSort.direction === "asc"
                            }
                            onChange={() =>
                              setPendingSort({ key: col.key, direction: "asc" })
                            }
                          />

                          <Form.Check
                            inline
                            type="radio"
                            label="DESC"
                            name={`sort-${col.key}`}
                            checked={
                              pendingSort.key === col.key &&
                              pendingSort.direction === "desc"
                            }
                            onChange={() =>
                              setPendingSort({ key: col.key, direction: "desc" })
                            }
                          />
                        </Col>
                      </Row>
                    ))}
                  </Modal.Body>

                  <Modal.Footer>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowFilterModal(false)}
                    >
                      Cancel
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={applyTableFilter}
                    >
                      Apply
                    </Button>
                  </Modal.Footer>
                </Modal>
                <Modal
                  show={!!selectedIntent}
                  onHide={() => setSelectedIntent(null)}
                  centered
                >
                  <Modal.Header closeButton>
                    <Modal.Title>Intent Details</Modal.Title>
                  </Modal.Header>

                  <Modal.Body>
                    {selectedIntent ? (
                      <>
                        <p><strong>Intent Name:</strong> {selectedIntent.intent}</p>
                        <p><strong>Total Uses:</strong> {selectedIntent.uses}</p>
                        <p>
                          <strong>Avg Confidence:</strong>{" "}
                          {Math.round(selectedIntent.confidence * 100)}%
                        </p>
                        <p>
                          <strong>Success Rate:</strong> {selectedIntent.successRate}%
                        </p>
                        <p>
                          <strong>Avg Response Time:</strong> {selectedIntent.avgTime}s
                        </p>
                        <p>
                          <strong>Feedback Score:</strong> {selectedIntent.feedback}
                        </p>
                        <p>
                          <strong>7-Day Trend:</strong>{" "}
                          {selectedIntent.trend >= 0 ? "▲" : "▼"}{" "}
                          {Math.abs(selectedIntent.trend)}%
                        </p>
                      </>
                    ) : (
                      <div className="text-muted">No data available</div>
                    )}
                  </Modal.Body>

                  <Modal.Footer>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedIntent(null)}
                    >
                      Close
                    </Button>
                  </Modal.Footer>
                </Modal>

              </Card.Body>
            </Card.Body>
          </Card>
        </Col>

        <Col md={12}>
          <Card className="rounded-4 shadow-sm analytics-card mt-2">
            <Card.Body className="analytics-card-body">
              <h5 className="mb-3">User Engagement</h5>

              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>User / Session ID</th>
                    <th>Platform</th>
                    <th>Total Messages</th>
                    <th>Duration</th>
                    <th>Intents Triggered</th>
                    <th>Resolution Status</th>
                    <th>Satisfaction</th>
                    <th>Last Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {userEngagementData.map((row, index) => (
                    <tr key={index}>
                      <td>{row.session}</td>
                      <td>{row.platform}</td>
                      <td>{row.messages}</td>
                      <td>{row.duration}</td>
                      <td>{row.intents}</td>
                      <td>
                        <Badge
                          bg={
                            row.status === "Resolved"
                              ? "success"
                              : row.status === "Escalated"
                                ? "warning"
                                : "secondary"
                          }
                        >
                          {row.status}
                        </Badge>
                      </td>
                      <td>{row.satisfaction}</td>
                      <td>{row.lastActive}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => {
                            setSelectedSession(row);
                            setShowSessionModal(true);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Modal
          show={showSessionModal}
          onHide={() => setShowSessionModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Session Details</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {selectedSession && (
              <>
                <p><strong>Session ID:</strong> {selectedSession.session}</p>
                <p><strong>Platform:</strong> {selectedSession.platform}</p>
                <p><strong>Total Messages:</strong> {selectedSession.messages}</p>
                <p><strong>Duration:</strong> {selectedSession.duration}</p>
                <p><strong>Intents Triggered:</strong> {selectedSession.intents}</p>
                <p><strong>Resolution Status:</strong> {selectedSession.status}</p>
                <p><strong>Satisfaction:</strong> {selectedSession.satisfaction}</p>
                <p><strong>Last Active:</strong> {selectedSession.lastActive}</p>
              </>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowSessionModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Col md={12}>
          <Card className="rounded-4 shadow-sm analytics-card mt-3">
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
                  <Form.Label>Format</Form.Label>

                  <div className="d-flex flex-column flex-sm-row flex-wrap gap-2 mt-2">
                    {["pdf", "csv", "excel", "json"].map((fmt) => (
                      <Form.Check
                        key={`format-${fmt}`}
                        type="radio"
                        label={fmt.toUpperCase()}
                        name="export-format"
                        checked={exportFormat === fmt}
                        onChange={() => setExportFormat(fmt)}
                      />
                    ))}
                  </div>
                </Col>

                {/* Generate Button */}
                <Col md={12} className="text-end">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={generateReport}
                    disabled={generating || (scheduleEnabled && !emailTo)}
                  >
                    {generating ? "Generating..." : "Generate Report"}
                  </Button>
                </Col>

                {/* Schedule Toggle */}
                <Col md={12}>
                  <Form.Check
                    type="switch"
                    label="Schedule Report"
                    checked={scheduleEnabled}
                    onChange={(e) => setScheduleEnabled(e.target.checked)}
                  />
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
          <Card className="rounded-4 shadow-sm analytics-card mt-3">
            <Card.Body className="analytics-card-body">
              <h5 className="mb-3">Real-time Metrics</h5>

              <Row className="g-3">

                {/* Live Users */}
                <Col md={3}>
                  <Card className="h-100 border-0 bg-light">
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


export default Analytics;