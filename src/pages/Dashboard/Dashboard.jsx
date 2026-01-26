import 'bootstrap/dist/css/bootstrap.min.css';
import html2canvas from "html2canvas";
import { CheckCircle, CheckCircle2, MessageSquare, Timer, Users } from "lucide-react";
import { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Modal, ProgressBar, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Area, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import NormalLayout from '../../components/NormalLayout';
import "./Dashboard.css";
import PeakHoursHeatmap from './components/PeakHoursHeatmap';



// ================= API PLACEHOLDERS =================
const apiGetKpiMetrics = async () => ({
  totalConversations: Math.floor(Math.random() * 5000) + 100,
  activeUsers: Math.floor(Math.random() * 120) + 1,
  avgResponseTime: parseFloat((Math.random() * 5).toFixed(2)),
  resolutionRate: Math.floor(Math.random() * 40) + 60,
});

const apiGetConversationTrends = async (range) => {
  if (range === "30") {
    return Array.from({ length: 30 }, (_, i) => ({
      date: `Day ${i + 1}`,
      total: Math.floor(Math.random() * 300) + 100,
      resolved: Math.floor(Math.random() * 250) + 80,
      escalated: Math.floor(Math.random() * 60) + 20,
    }));
  }
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
  { id: 1, message: "I want to cancel my booking for tomorrow", intent: "Cancellation", confidence: 92, timeAgo: "2 mins ago" },
  { id: 2, message: "What is the pricing for premium plan?", intent: "Pricing", confidence: 88, timeAgo: "5 mins ago" },
  { id: 3, message: "I want to upgrade my account", intent: "Upgrade", confidence: 80, timeAgo: "10 mins ago" },
  { id: 4, message: "I need a refund for my last purchase", intent: "Refund", confidence: 95, timeAgo: "15 mins ago" },
  { id: 5, message: "The support response is too slow", intent: "Complaint", confidence: 70, timeAgo: "20 mins ago" },
  { id: 6, message: "How do I book a new service?", intent: "Booking", confidence: 85, timeAgo: "25 mins ago" },
  { id: 7, message: "Feedback for your last update", intent: "Feedback", confidence: 60, timeAgo: "30 mins ago" },
  { id: 8, message: "Can I downgrade my plan?", intent: "Downgrade", confidence: 75, timeAgo: "40 mins ago" },
]);

// ================= Colors =================
const INTENT_COLORS = [
  "#0d6efd", "#198754", "#fd7e14", "#dc3545", "#6f42c1", "#20c997", "#ffc107", "#0dcaf0", "#adb5bd", "#343a40",
];

const intentVariant = (intent) => {
  switch (intent) {
    case "Cancellation": return "danger";
    case "Pricing": return "primary";
    case "Complaint": return "warning";
    case "Upgrade": return "success";
    case "Refund": return "info";
    case "Booking": return "secondary";
    case "Feedback": return "dark";
    case "Downgrade": return "info";
    default: return "secondary";
  }
};

// ================= Download Chart =================
const downloadChart = async () => {
  const chart = document.getElementById("conversation-trends-chart");
  if (!chart) return;
  const canvas = await html2canvas(chart, { backgroundColor: "#ffffff" });
  const link = document.createElement("a");
  link.download = "conversation-trends.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
};

// ================= Dashboard Content =================
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
  const [trendRange, setTrendRange] = useState("7");
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [chartRadius, setChartRadius] = useState({ inner: 70, outer: 110 });

  const navigate = useNavigate();

  // Handle responsive pie chart radius
  useEffect(() => {
    const updateRadius = () => {
      if (window.innerWidth < 576) setChartRadius({ inner: 45, outer: 80 });
      else setChartRadius({ inner: 70, outer: 110 });
    };
    updateRadius();
    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, []);

  // Load dashboard data
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
      heatmap.forEach(d => d.hours.forEach((count, hour) => scatter.push({ day: d.day, dayIndex: d.dayIndex + 1, hour: hour + 1, count })));
      setScatterData(scatter);

      setRecentConversations(await apiGetRecentConversations());
    };
    loadDashboard();
  }, [trendRange]);

  // Active users refresh every 5s
  useEffect(() => {
    const interval = setInterval(async () => {
      const kpi = await apiGetKpiMetrics();
      setActiveUsers(kpi.activeUsers);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleView = conversation => { setSelectedConversation(conversation); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setSelectedConversation(null); };
  const handleViewAll = () => setShowAllActivities(true);
  const handleViewLess = () => setShowAllActivities(false);
  const getResponseCircleColor = (time) => {
    if (time < 1) return "#198754";
    if (time < 2) return "#ffc107";
    return "#dc3545";
  };

  return (
    <div className='g-2 h-100'>
      <Row className='g-2 mb-3'>
        <Col lg={3} sm={6}>
          <Card
            className="rounded-4 shadow-sm analytics-card h-100 cursor-pointer"
            onClick={() => navigate("/conversations")}
          >
            <Card.Body className="d-flex flex-column">

              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="text-muted small">Total Conversations</div>
                <MessageSquare size={26} />
              </div>

              <h3 className="fw-bold flex-grow-1">
                {totalConversations.toLocaleString()}
              </h3>

              <Col className="text-success small mb-2">
                ↑ 12% vs yesterday
              </Col>

              <Col md={12} className="text-end">
                <Form.Select
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => e.stopPropagation()}
                >
                  <option>Today</option>
                  <option>Week</option>
                  <option>Month</option>
                </Form.Select>
              </Col>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} sm={6}>
          <Card className="rounded-4 shadow-sm analytics-card h-100 cursor-pointer">
            <Card.Body className="d-flex flex-column">

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="text-muted small">Active Users</div>
                <Users size={26} />
              </div>

              <h3 className="fw-bold flex-grow-1">
                {activeUsers.toLocaleString()}
              </h3>

              <Col className="text-success small mb-2">
                Right now
              </Col>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} sm={6}>
          <Card className="rounded-4 shadow-sm analytics-card h-100 cursor-pointer">
            <Card.Body className="d-flex flex-column justify-content-center">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="text-muted small">Avg Response Time</div>
                <Timer size={26} />
              </div>
              <div
                className="resolution-progress"
                style={{
                  background: `conic-gradient(
                  ${getResponseCircleColor(avgResponseTime)} 
                  ${Math.min(avgResponseTime * 20, 100) * 3.6}deg,
                  #e9ecef 0deg
                )`
                }}
              >
                <div className="resolution-inner">
                  <Timer size={20} className="mb-1" />
                  <div className="resolution-value">
                    {avgResponseTime}s
                  </div>
                </div>
              </div>
              <div className="text-muted small">Last 24 hours</div>

            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} sm={6}>
          <Card className="rounded-4 shadow-sm analytics-card h-100 cursor-pointer">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="text-muted small">Resolution Rate</div>
                <CheckCircle size={26} />
              </div>

              <div
                className="resolution-progress mt-2 mb-"
                style={{
                  background: `conic-gradient(
                    #198754 ${Math.min(resolutionRate, 100) * 3.6}deg,
                    #e9ecef 0deg
                  )`
                }}
              >
                <div className="resolution-inner">
                  <CheckCircle size={20} className="text-success mb-1" />
                  <div className="resolution-value">
                    {Math.round(resolutionRate)}%
                  </div>
                </div>
              </div>

              <div className="text-muted small">Target: 90%</div>

            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Conversation Trends */}
      <div className="chart-section">

        {/* Conversation Trends */}
        <Row className="mb-3">
          <Col xs={12}>
            <Card className="rounded-4 shadow-sm chart-card h-100">
              <Card.Body className="chart-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-semibold">Conversation Trends</h6>
                  <div className="d-flex gap-2">
                    <Form.Select size="sm" value={trendRange} onChange={e => setTrendRange(e.target.value)}>
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="custom">Custom</option>
                    </Form.Select>
                    <Button size="sm" variant="primary" onClick={downloadChart}>Download</Button>
                  </div>
                </div>
                <div id="conversation-trends-chart" style={{ width: '100%', height: '300px', minHeight: '240px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="total" fill="#1e7bd933" stroke="#1e7bd9" />
                      <Line type="monotone" dataKey="resolved" stroke="#198754" strokeWidth={3} />
                      <Line type="monotone" dataKey="escalated" stroke="#fd7e14" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Intent Distribution */}
        <Row className="mb-3">
          <Col xs={12}>
            <Card className="rounded-4 shadow-sm chart-card h-100">
              <Card.Body>
                <h6 className="fw-semibold mb-3">Intent Distribution</h6>
                <div style={{ width: '100%', height: '360px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={intentData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={chartRadius.inner}
                        outerRadius={chartRadius.outer}
                        cx="50%"
                        cy="50%"
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {intentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={INTENT_COLORS[index % INTENT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Peak Hours Heatmap */}
        <Row className="mb-3">
          <Col xs={12}>
            <PeakHoursHeatmap />
          </Col>
        </Row>


        <Card className="rounded-4 shadow-sm mt-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-semibold mb-0">Recent Activity</h6>

              {!showAllActivities && recentConversations.length > 4 && (
                <Button size="sm" variant="primary" onClick={handleViewAll}>
                  View All
                </Button>
              )}

              {showAllActivities && (
                <Button size="sm" variant="primary" onClick={handleViewLess}>
                  View Less
                </Button>
              )}
            </div>

            {(showAllActivities ? recentConversations : recentConversations.slice(0, 4)).map((item) => (
              <div
                key={item.id}
                className="activity-item d-flex flex-column flex-lg-row align-items-start align-items-lg-center mb-3"
              >
                {/* LEFT */}
                <div className="flex-grow-1 me-lg-3">
                  <div className="small text-muted">{item.timeAgo}</div>

                  <div className="fw-medium text-truncate activity-message">
                    {item.message}
                  </div>

                  <div className="d-flex align-items-center gap-2 mt-1">
                    <span className={`badge bg-${intentVariant(item.intent)}`}>
                      {item.intent}
                    </span>

                    <div className="confidence-bar flex-grow-1">
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

                {/* RIGHT */}
                <div className="mt-2 mt-lg-0">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleView(item)}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
            <Modal
              show={showModal}
              onHide={handleClose}
              centered
              size="md"
            >
              <Modal.Header closeButton>
                <Modal.Title>Conversation Details</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                {selectedConversation && (
                  <>
                    <div className="mb-3">
                      <div className="text-muted small">Message</div>
                      <div className="fw-medium">
                        {selectedConversation.message}
                      </div>
                    </div>

                    <div className="mb-2">
                      <strong>Intent:</strong>{" "}
                      <span className={`badge bg-${intentVariant(selectedConversation.intent)}`}>
                        {selectedConversation.intent}
                      </span>
                    </div>

                    <div className="mb-2">
                      <strong>Confidence:</strong> {selectedConversation.confidence}%
                      <ProgressBar
                        now={selectedConversation.confidence}
                        variant="success"
                        className="mt-1"
                        style={{ height: 6 }}
                      />
                    </div>

                    <div className="mb-2">
                      <strong>Received:</strong> {selectedConversation.timeAgo}
                    </div>
                  </>
                )}
              </Modal.Body>

              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>

          </Card.Body>
        </Card>

      </div >
    </div>
  
  );
};

// ================= Dashboard Wrapper =================
const Dashboard = () => (
  <NormalLayout>
    <DashboardContent />
  </NormalLayout>
);

export default Dashboard;
