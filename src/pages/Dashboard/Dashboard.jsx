import 'bootstrap/dist/css/bootstrap.min.css';
import html2canvas from "html2canvas";
import { CheckCircle, MessageSquare, Timer, Users } from "lucide-react";
import { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Modal, ProgressBar, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Area, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import NormalLayout from '../../components/NormalLayout';
import "./Dashboard.css";
import PeakHoursHeatmap from './components/PeakHoursHeatmap';
import { heatmapData } from './components/heatmapData';

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

// ================= Dashboard Card =================
const DashboardCard = ({ title, value, subtitle, icon, extra, progress, progressVariant }) => (
  <Card className="rounded-4 shadow-sm dashboard-card">
    <Card.Body className="dashboard-card-body">
      <div className="kpi-top d-flex justify-content-between align-items-start">
        <div>
          <div className="text-muted small">{title}</div>
          <h3 className="fw-bold mt-2">{value}</h3>
          {subtitle && <div className="text-muted small">{subtitle}</div>}
        </div>
        <div className="dashboard-icon">{icon}</div>
      </div>
      <div className="kpi-bottom">{extra}</div>
      {progress !== undefined && <ProgressBar now={progress} variant={progressVariant} className="mt-3" style={{ height: 8 }} />}
    </Card.Body>
  </Card>
);

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

  const getResponseColor = time => time < 1 ? 'success' : time <= 3 ? 'warning' : 'danger';
  const handleView = conversation => { setSelectedConversation(conversation); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setSelectedConversation(null); };

  return (
    <div className="p-3">

      {/* KPI CARDS */}
      <div className="row g-3 mb-4 align-items-stretch kpi-row">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="kpi-card-wrapper" onClick={() => navigate("/conversations")}>
            <DashboardCard
              title="Total Conversations"
              value={totalConversations}
              subtitle="↑ 12% vs yesterday"
              icon={<MessageSquare size={26} />}
              extra={<Form.Select size="sm" onClick={e => e.stopPropagation()} onChange={e => e.stopPropagation()}>
                <option>Today</option><option>Week</option><option>Month</option>
              </Form.Select>}
            />
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <DashboardCard title="Active Users" value={activeUsers} subtitle="Right now" icon={<Users size={26} />} />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <DashboardCard title="Avg Response Time" value={`${avgResponseTime}s`} icon={<Timer size={26} />} progress={Math.min(avgResponseTime * 20, 100)} progressVariant={getResponseColor(avgResponseTime)} />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <Card className="rounded-4 shadow-sm text-center resolution-card">
            <Card.Body>
              <div className="resolution-progress" style={{ background: `conic-gradient(#198754 ${resolutionRate * 3.6}deg, #e9ecef 0deg)` }}>
                <div className="resolution-inner">
                  <CheckCircle size={20} className="text mb-1" />
                  <div className="resolution-value">{resolutionRate}%</div>
                </div>
              </div>
              <div className="mt-3 fw-medium">Resolution Rate</div>
              <div className="text-muted small">Target: 90%</div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Conversation Trends */}
      <div className="chart-section">

        {/* Conversation Trends */}
        <Row className="mb-4">
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
        <Row className="mb-4">
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
        <Row className="mb-4">
          <Col xs={12}>
            <Card className="rounded-4 shadow-sm chart-card h-100">
              <Card.Body>
                <PeakHoursHeatmap data={heatmapData} />
              </Card.Body>
            </Card>
          </Col>
        </Row>

      </div>




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
