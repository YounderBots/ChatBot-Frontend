import React, { useState, useEffect } from 'react';
import NormalLayout from '../../components/NormalLayout';
import { Button, Card, ProgressBar, Form, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ComposedChart, ScatterChart, Scatter, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, PieChart, Pie, Legend, Cell } from "recharts";
import "./Dashboard.css";
import html2canvas from "html2canvas";
import { MessageSquare, Users, Timer, CheckCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';

// ================= API PLACEHOLDERS =================
// Later: replace body with real API calls

const apiGetKpiMetrics = async () => {
  return {
    totalConversations: Math.floor(Math.random() * 5000) + 100,
    activeUsers: Math.floor(Math.random() * 120) + 1,
    avgResponseTime: parseFloat((Math.random() * 5).toFixed(2)),
    resolutionRate: Math.floor(Math.random() * 40) + 60,
  };
};

const apiGetConversationTrends = async (range) => {
  if (range === "30") {
    return Array.from({ length: 30 }, (_, i) => ({
      date: `Day ${i + 1}`,
      total: Math.floor(Math.random() * 300) + 100,
      resolved: Math.floor(Math.random() * 250) + 80,
      escalated: Math.floor(Math.random() * 60) + 20,
    }));
  }

  // Default: last 7 days
  return [
    { date: "Mon", total: 120, resolved: 90, escalated: 30 },
    { date: "Tue", total: 180, resolved: 140, escalated: 40 },
    { date: "Wed", total: 220, resolved: 170, escalated: 50 },
    { date: "Thu", total: 200, resolved: 160, escalated: 40 },
    { date: "Fri", total: 260, resolved: 210, escalated: 50 },
    { date: "Sat", total: 190, resolved: 150, escalated: 40 },
    { date: "Sun", total: 230, resolved: 180, escalated: 50 },
  ];
};


const apiGetIntentDistribution = async () => ([
  { name: "Booking", value: 320 },
  { name: "Pricing", value: 260 },
  { name: "Support", value: 210 },
  { name: "Cancellation", value: 180 },
  { name: "Complaint", value: 140 },
  { name: "Refund", value: 120 },
  { name: "Upgrade", value: 90 },
  { name: "Downgrade", value: 70 },
  { name: "Feedback", value: 60 },
  { name: "Other", value: 40 },
]);

const apiGetPeakHours = async () => {
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, dayIndex) => ({
    day,
    dayIndex,
    hours: Array.from({ length: 24 }, () => Math.floor(Math.random() * 50)),
  }));
};

const apiGetRecentConversations = async () => ([
  {
    id: 1,
    message: "I want to cancel my booking for tomorrow",
    intent: "Cancellation",
    confidence: 92,
    timeAgo: "2 mins ago",
  },
  {
    id: 2,
    message: "What is the pricing for premium plan?",
    intent: "Pricing",
    confidence: 88,
    timeAgo: "5 mins ago",
  },
]);

const DashboardCard = ({
  title,
  value,
  subtitle,
  icon,
  extra,
  progress,
  progressVariant,
}) => (
  <Card
    className="rounded-4 shadow-sm dashboard-card"
  >
    <Card.Body className="dashboard-card-body">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="text-muted small">{title}</div>
          <h3 className="fw-bold mt-2">{value}</h3>
          {subtitle && (
            <div className="text-muted small">{subtitle}</div>
          )}
        </div>
        <div className="dashboard-icon">{icon}</div>
      </div>

      {extra && <div className="mt-3">{extra}</div>}

      {progress !== undefined && (
        <ProgressBar
          now={progress}
          variant={progressVariant}
          className="mt-3"
          style={{ height: 8 }}
        />
      )}
    </Card.Body>
  </Card>
);
const ResolutionCard = ({ value }) => (
  <Card
    className="rounded-4 shadow-sm d-flex align-items-center justify-content-center"
    style={{ minHeight: 170 }}
  >
    <Card.Body className="text-center">
      <div className="resolution-circle">
        {value}%
      </div>

      <div className="mt-2 text-muted small">
        Resolution Rate
      </div>
      <div className="text-muted small">
        Target: 90%
      </div>
    </Card.Body>
  </Card>
);

const downloadChart = async () => {
  const chart = document.getElementById("conversation-trends-chart");
  if (!chart) return;

  const canvas = await html2canvas(chart, {
    backgroundColor: "#ffffff", // ensures white background
    scale: 2, // higher quality
  });

  const link = document.createElement("a");
  link.download = "conversation-trends.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
};

const INTENT_COLORS = [
  "#0d6efd", // blue
  "#198754", // green
  "#fd7e14", // orange
  "#dc3545", // red
  "#6f42c1", // purple
  "#20c997", // teal
  "#ffc107", // yellow
  "#0dcaf0", // cyan
  "#adb5bd", // gray
  "#343a40", // dark
];

const intentVariant = (intent) => {
  switch (intent) {
    case "Cancellation":
      return "danger";
    case "Pricing":
      return "primary";
    case "Complaint":
      return "warning";
    case "Upgrade":
      return "success";
    case "Refund":
      return "info";
    default:
      return "secondary";
  }
};

const DashboardContent = () => {
  const [totalConversations, setTotalConversations] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [avgResponseTime, setAvgResponseTime] = useState(0);
  const [resolutionRate, setResolutionRate] = useState(0);
  const [trendsData, setTrendsData] = useState([]);
  const [intentData, setIntentData] = useState([]);
  const [scatterData, setScatterData] = useState([]);
  const [recentConversations, setRecentConversations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const navigate = useNavigate();
  const [trendRange, setTrendRange] = useState("7");


  const handleView = (conversation) => {
    setSelectedConversation(conversation);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedConversation(null);
  };
  useEffect(() => {
    const loadDashboard = async () => {
      const kpi = await apiGetKpiMetrics();
      setTotalConversations(kpi.totalConversations);
      setActiveUsers(kpi.activeUsers);
      setAvgResponseTime(kpi.avgResponseTime);
      setResolutionRate(kpi.resolutionRate);

      setTrendsData(await apiGetConversationTrends(trendRange));
      setIntentData(await apiGetIntentDistribution());

      const heatmap = await apiGetPeakHours();
      const scatter = [];
      heatmap.forEach(d => {
        d.hours.forEach((count, hour) => {
          scatter.push({ day: d.day, dayIndex: d.dayIndex + 1, hour: hour + 1, count });
        });
      });
      setScatterData(scatter);

      setRecentConversations(await apiGetRecentConversations());
    };

    loadDashboard();


  }, []);
  useEffect(() => {
    const loadTrends = async () => {
      const data = await apiGetConversationTrends(trendRange);
      setTrendsData(data);
    };

    loadTrends();
  }, [trendRange]);

  useEffect(() => {
    // Update only Active Users every 5 seconds
    let isMounted = true;
    const fetchActiveUsers = async () => {
      const kpi = await apiGetKpiMetrics();
      if (isMounted) setActiveUsers(kpi.activeUsers);
    };

    const interval = setInterval(fetchActiveUsers, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getResponseColor = (time) => {
    if (time < 1) return 'success';
    if (time <= 3) return 'warning';
    return 'danger';
  };

  return (
    <div className="p-3">


      {/* ================= KPI CARDS ================= */}
      <div className="row g-3 mb-4">

        {/* Card 1: Total Conversations */}
        <div className="col-12 col-md-6 col-lg-3">
          <div
            style={{ cursor: "pointer" }}
            onClick={() => {
              navigate("/conversations");
            }}
          >
            <DashboardCard
              title="Total Conversations"
              value={totalConversations}
              subtitle="↑ 12% vs yesterday"
              icon={<MessageSquare size={26} />}

              extra={
                <Form.Select
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => e.stopPropagation()}
                >
                  <option>Today</option>
                  <option>Week</option>
                  <option>Month</option>
                </Form.Select>
              }

            />
          </div>
        </div>

        {/* Card 2: Active Users */}
        <div className="col-12 col-md-6 col-lg-3">
          <DashboardCard
            title="Active Users"
            value={activeUsers}
            subtitle="Right now"
            icon={<Users size={26} />}

          />
        </div>

        {/* Card 3: Avg Response Time */}
        <div className="col-12 col-md-6 col-lg-3">
          <DashboardCard
            title="Avg Response Time"
            value={`${avgResponseTime}s`}
            icon={<Timer size={26} />}

            progress={Math.min(avgResponseTime * 20, 100)}
            progressVariant={getResponseColor(avgResponseTime)}
          />
        </div>

        {/* Card 4: Resolution Rate */}
        <div className="col-12 col-md-6 col-lg-3">
          <Card className="rounded-4 shadow-sm text-center resolution-card">
            <Card.Body>

              {/* Circular Progress */}
              <div
                className="resolution-progress"
                style={{
                  background: `conic-gradient(
            #198754 ${resolutionRate * 3.6}deg,
            #e9ecef 0deg
          )`,
                }}
              >
                <div className="resolution-inner">
                  <CheckCircle size={20} className="text mb-1" />
                  <div className="resolution-value">
                    {resolutionRate}%
                  </div>
                </div>
              </div>

              <div className="mt-3 fw-medium">
                Resolution Rate
              </div>

              <div className="text-muted small">
                Target: 90%
              </div>

            </Card.Body>
          </Card>
        </div>

      </div>



      {/* ================= CHART SECTION ================= */}
      <Card className="rounded-4 shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-semibold">Conversation Trends</h6>

            <div className="d-flex gap-2">
              <Form.Select
                size="sm"
                value={trendRange}
                onChange={(e) => setTrendRange(e.target.value)}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="custom">Custom</option>
              </Form.Select>


              <Button size="sm" variant="outline-primary" onClick={downloadChart}>
                Download
              </Button>
            </div>
          </div>

          <div id="conversation-trends-chart" className="trend-chart">

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="total"
                  fill="#1e7bd933"
                  stroke="#1e7bd9"
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#198754"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="escalated"
                  stroke="#fd7e14"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card.Body>
      </Card>
      <Card className="rounded-4 shadow-sm mb-4">
        <Card.Body>
          <h6 className="fw-semibold mb-3">Intent Distribution</h6>
          <div id="trend-chart" style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={intentData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {intentData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={INTENT_COLORS[index % INTENT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </Card.Body>
      </Card>

      <Card className="rounded-4 shadow-sm mb-4">
        <Card.Body>
          <h6 className="fw-semibold mb-3">Peak Hours Heatmap</h6>
          <div id="trend-chart" style={{ width: "100%", height: 300 }}>
            {/* ================= Old Version of heat map ================= */}
            {/* <ResponsiveContainer width="100%" height={320}>
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 40, left: 60 }}
              >
                <XAxis
                  type="number"
                  dataKey="hour"
                  domain={[0.5, 24.5]}
                  ticks={[1, 4, 8, 12, 16, 20, 24]}
                  label={{ value: "Hour", position: "insideBottom", offset: -5 }}
                />

                <YAxis
                  type="number"
                  dataKey="dayIndex"
                  domain={[0.5, 7.5]}
                  ticks={[1, 2, 3, 4, 5, 6, 7]}
                  tickFormatter={(v) =>
                    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][v - 1]
                  }
                  tickMargin={10}
                  label={{ value: "Day", angle: -90, position: "insideLeft" }}
                />

                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(value, name, props) => [
                    `${props.payload.count} conversations`,
                    `Hour ${props.payload.hour}`,
                  ]}
                />

                <Scatter
                  data={scatterData}
                  shape={({ cx, cy, payload }) => {
                    const count = payload.count;

                    // 1️⃣ Handle no data
                    if (count === 0) {
                      return (
                        <rect
                          x={cx - 10}
                          y={cy - 10}
                          width={20}
                          height={20}
                          rx={3}
                          fill="#dee2e6" // grey for empty
                        />
                      );
                    }

                    // 2️⃣ Enhanced color scaling
                    const minOpacity = 0.35; // ensures 2–3 are visible
                    const maxCount = 50;    // expected peak
                    const opacity =
                      minOpacity + Math.min(count / maxCount, 1) * (1 - minOpacity);

                    return (
                      <rect
                        x={cx - 10}
                        y={cy - 10}
                        width={20}
                        height={20}
                        rx={3}
                        fill={`rgba(30,123,217, ${opacity})`}
                      />
                    );
                  }}
                />


              </ScatterChart>
            </ResponsiveContainer> */}
            {/* ================= New Version of heat map (Swapped Axes) ================= */}
            <ResponsiveContainer width="100%" height={320}>
              <ScatterChart
                margin={{ top: 40, right: 20, bottom: 20, left: 60 }} 
              >
                {/* X Axis: Days on Top */}
                <XAxis
                  type="number"
                  dataKey="dayIndex"
                  domain={[0.5, 7.5]}
                  ticks={[1, 2, 3, 4, 5, 6, 7]}
                  tickFormatter={(v) =>
                    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][v - 1]
                  }
                  orientation="top"
                  axisLine={{ stroke: "#ced4da" }}
                  tickLine={false}
                  label={{ value: "Day", position: "top", offset: 20 }}
                />

                {/* Y Axis: Hours */}
                <YAxis
                  type="number"
                  dataKey="hour"
                  domain={[0.5, 24.5]}
                  ticks={[1, 4, 8, 12, 16, 20, 24]}
                  axisLine={{ stroke: "#ced4da" }}
                  tickLine={false}
                  label={{ value: "Hour", angle: -90, position: "insideLeft" }}
                />

                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(value, name, props) => [
                    `${props.payload.count} conversations`,
                    `Day ${props.payload.day}, Hour ${props.payload.hour}`,
                  ]}
                />

                <Scatter
                  data={scatterData}
                  shape={({ cx, cy, payload }) => {
                    const count = payload.count;

                    const size = 18; // square size
                    const gap = 2;   // gap between squares

                    if (count === 0) {
                      return (
                        <rect
                          x={cx - size / 2 + gap / 2}
                          y={cy - size / 2 + gap / 2}
                          width={size - gap}
                          height={size - gap}
                          rx={3}
                          fill="#dee2e6"
                        />
                      );
                    }

                    const minOpacity = 0.35;
                    const maxCount = 50;
                    const opacity =
                      minOpacity + Math.min(count / maxCount, 1) * (1 - minOpacity);

                    return (
                      <rect
                        x={cx - size / 2 + gap / 2}
                        y={cy - size / 2 + gap / 2}
                        width={size - gap}
                        height={size - gap}
                        rx={3}
                        fill={`rgba(30,123,217, ${opacity})`}
                      />
                    );
                  }}
                />

              </ScatterChart>
            </ResponsiveContainer>

          </div>

        </Card.Body>
      </Card>

      <Card className="rounded-4 shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-semibold mb-0">Recent Activity</h6>
            <Button variant="link" size="sm" className="p-0">
              View all
            </Button>
          </div>

          {recentConversations.slice(0, 10).map((item) => (
            <div
              key={item.id}
              className="d-flex align-items-center justify-content-between py-2 border-bottom"
            >
              {/* Left */}
              <div className="flex-grow-1 me-3">
                <div className="small text-muted">{item.timeAgo}</div>
                <div className="fw-medium text-truncate activity-message">
                  {item.message}
                </div>

                <div className="d-flex align-items-center gap-2 mt-1">
                  <span
                    className={`badge bg-${intentVariant(item.intent)}`}
                  >
                    {item.intent}
                  </span>

                  <div className="confidence-bar">
                    <ProgressBar
                      now={item.confidence}
                      variant="success"
                      style={{ height: 6 }}
                    />
                  </div>

                  <small className="text-muted">
                    {item.confidence}%
                  </small>
                </div>
              </div>

              {/* Right */}
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => handleView(item)}
              >
                View
              </Button>

            </div>
          ))}
        </Card.Body>
      </Card>
      {selectedConversation && (
        <Modal show={showModal} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Conversation Details</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <div className="mb-3">
              <small className="text-muted">Time</small>
              <div className="fw-medium">
                {selectedConversation.timeAgo}
              </div>
            </div>

            <div className="mb-3">
              <small className="text-muted">User Message</small>
              <div className="modal-message">
                {selectedConversation.message}
              </div>
            </div>

            <div className="mb-3 d-flex align-items-center gap-2">
              <span
                className={`badge bg-${intentVariant(
                  selectedConversation.intent
                )}`}
              >
                {selectedConversation.intent}
              </span>

              <span className="text-muted small">
                Confidence: {selectedConversation.confidence}%
              </span>
            </div>

            <ProgressBar
              now={selectedConversation.confidence}
              variant="success"
            />
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary">
              Open Full Conversation
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

const Dashboard = () => {
  return (
    <NormalLayout>
      <DashboardContent />
    </NormalLayout>
  );
};

export default Dashboard;
