import html2canvas from "html2canvas";
import {
  ArrowDownRight, ArrowUpRight, CheckCircle2,
  Clock, Download, MessageSquare, RefreshCw,
  TrendingUp, Users, Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, Button, Modal, ProgressBar } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  Area, AreaChart, CartesianGrid, Cell, Legend,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import APICall from "../../APICalls/APICall";
import NormalLayout from "../../components/NormalLayout";
import PeakHoursHeatmap from "./components/PeakHoursHeatmap";
import {
  mockGetIntents, mockGetKpi, mockGetPeakHours,
  mockGetRecentConvs, mockGetTrends,
} from "./mockData";
import "./Dashboard.css";

/* ─── Data source ─── */
const USE_MOCK = false;

/* ─── Real API calls ─── */
const _apiGetKpi     = (range) => APICall.getT(`/analytics/kpi?range=${range}`);
const _apiGetTrends  = (range) => APICall.getT(`/analytics/trends?range=${range}`);
const _apiGetIntents = (range) => APICall.getT(`/analytics/intents?range=${range}`);
const _apiGetPeakHrs = (range) => APICall.getT(`/analytics/peak_hours?range=${range}`);
const _apiGetRecent  = ()      => APICall.getT("/analytics/recent_conversations?limit=10");

/* ─── Active data functions (mock or real) ─── */
const apiGetKpiMetrics         = (range) => USE_MOCK ? mockGetKpi()         : _apiGetKpi(range);
const apiGetConversationTrends = (range) => USE_MOCK ? mockGetTrends(range) : _apiGetTrends(range);
const apiGetIntentDistribution = (range) => USE_MOCK ? mockGetIntents()     : _apiGetIntents(range);
const apiGetPeakHours          = (range) => USE_MOCK ? mockGetPeakHours()   : _apiGetPeakHrs(range);
const apiGetRecentConversations = ()     => USE_MOCK ? mockGetRecentConvs() : _apiGetRecent();

/* ─── Palettes ─── */
const INTENT_COLORS = [
  "#f97316","#22c55e","#fb923c","#ef4444","#a855f7",
  "#10b981","#eab308","#06b6d4","#94a3b8","#64748b",
];

const INTENT_BADGE_COLOR = {
  Cancellation:"#ef4444", Pricing:"#fb923c", Complaint:"#eab308",
  Upgrade:"#22c55e", Refund:"#06b6d4", Booking:"#a855f7",
  Feedback:"#94a3b8", Downgrade:"#3b82f6", Support:"#10b981", Other:"#64748b",
};

/* ─── Custom Recharts tooltip ─── */
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="chart-tooltip-row">
          <span className="chart-tooltip-dot" style={{ background: p.color }} />
          <span>{p.name}:</span>
          <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

/* ─── Download chart ─── */
const downloadChart = async () => {
  const el = document.getElementById("trends-chart-container");
  if (!el) return;
  const canvas = await html2canvas(el, { backgroundColor: "#0b1528" });
  const link = document.createElement("a");
  link.download = "conversation-trends.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
};

/* ════════════════════════════════════════════════
   KPI CARD
════════════════════════════════════════════════ */
const KpiCard = ({ icon: Icon, iconColor, iconBg, label, value, trend, trendUp, sub, onClick }) => (
  <div className={`kpi-card ${onClick ? "clickable" : ""}`} onClick={onClick}>
    <div className="kpi-top-row">
      <div className="kpi-icon-box" style={{ background: iconBg, borderColor: iconColor + "33" }}>
        <Icon size={20} style={{ color: iconColor }} />
      </div>
      <span className={`kpi-trend-badge ${trendUp ? "up" : "neutral"}`}>
        {trendUp ? <ArrowUpRight size={12} /> : <RefreshCw size={11} />}
        {trend}
      </span>
    </div>
    <div className="kpi-value">{value}</div>
    <div className="kpi-label">{label}</div>
    {sub && <div className="kpi-sub">{sub}</div>}
  </div>
);

/* ════════════════════════════════════════════════
   ACTIVITY ITEM
════════════════════════════════════════════════ */
const ActivityItem = ({ item, onView }) => (
  <div className="activity-item">
    <div className="activity-timeline-dot" style={{ background: INTENT_BADGE_COLOR[item.intent] || "#64748b" }} />
    <div className="activity-content">
      <div className="activity-header-row">
        <span
          className="intent-badge"
          style={{
            background: (INTENT_BADGE_COLOR[item.intent] || "#64748b") + "22",
            color: INTENT_BADGE_COLOR[item.intent] || "#94a3b8",
            border: `1px solid ${(INTENT_BADGE_COLOR[item.intent] || "#64748b")}44`,
          }}
        >
          {item.intent}
        </span>
        <span className="activity-time">{item.timeAgo}</span>
      </div>
      <p className="activity-message">{item.message}</p>
      <div className="activity-confidence-row">
        <div className="confidence-track">
          <div
            className="confidence-fill"
            style={{ width: `${item.confidence}%`, background: INTENT_BADGE_COLOR[item.intent] || "#64748b" }}
          />
        </div>
        <span className="confidence-value">{item.confidence}%</span>
      </div>
    </div>
    <button className="activity-view-btn" onClick={() => onView(item)}>View</button>
  </div>
);

/* ════════════════════════════════════════════════
   DASHBOARD CONTENT
════════════════════════════════════════════════ */
const DashboardContent = () => {
  const [totalConversations, setTotalConversations] = useState(0);
  const [activeUsers,        setActiveUsers]        = useState(0);
  const [avgResponseTime,    setAvgResponseTime]    = useState(0);
  const [resolutionRate,     setResolutionRate]     = useState(0);
  const [trendsData,         setTrendsData]         = useState([]);
  const [intentData,         setIntentData]         = useState([]);
  const [peakHoursData,      setPeakHoursData]      = useState([]);
  const [recentConversations,setRecentConversations]= useState([]);
  const [showModal,          setShowModal]          = useState(false);
  const [selectedConv,       setSelectedConv]       = useState(null);
  const [trendRange,         setTrendRange]         = useState("7");
  const [showAll,            setShowAll]            = useState(false);
  const [chartRadius,        setChartRadius]        = useState({ inner:65, outer:105 });
  const [dashboardError,     setDashboardError]     = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 576) setChartRadius({ inner:40, outer:75 });
      else setChartRadius({ inner:65, outer:105 });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [kpi, trends, intents, peakHours, recent] = await Promise.all([
          apiGetKpiMetrics(trendRange),
          apiGetConversationTrends(trendRange),
          apiGetIntentDistribution(trendRange),
          apiGetPeakHours(trendRange),
          apiGetRecentConversations(),
        ]);
        setTotalConversations(kpi.totalConversations);
        setActiveUsers(kpi.activeUsers);
        setAvgResponseTime(kpi.avgResponseTime);
        setResolutionRate(kpi.resolutionRate);
        setTrendsData(trends);
        setIntentData(intents);
        setPeakHoursData(peakHours);
        setRecentConversations(recent);
      } catch (err) {
        setDashboardError("Failed to load dashboard data. Please refresh the page.");
      }
    };
    load();
  }, [trendRange]);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const kpi = await apiGetKpiMetrics(trendRange);
        setActiveUsers(kpi.activeUsers);
      } catch (err) {
        // Polling failure is non-fatal; the last known value remains displayed.
        // Avoid overwriting dashboardError — that is reserved for the initial load.
        console.warn("[Dashboard] Live poll failed:", err?.message);
      }
    }, 30000); // 30s polling — avoid hammering the server
    return () => clearInterval(id);
  }, [trendRange]);

  const handleView  = c => { setSelectedConv(c); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setSelectedConv(null); };

  const displayed = showAll ? recentConversations : recentConversations.slice(0, 4);

  return (
    <div className="dashboard-root">

      {dashboardError && (
        <Alert variant="danger" dismissible onClose={() => setDashboardError(null)} className="mb-3">
          {dashboardError}
        </Alert>
      )}

      {/* ── KPI GRID ── */}
      <div className="kpi-grid">
        <KpiCard
          icon={MessageSquare}
          iconColor="#fb923c"
          iconBg="rgba(232,113,10,0.12)"
          label="Total Conversations"
          value={totalConversations.toLocaleString()}
          trend="↑ 12% vs yesterday"
          trendUp
          sub="Across all channels"
          onClick={() => navigate("/conversations")}
        />
        <KpiCard
          icon={Users}
          iconColor="#22c55e"
          iconBg="rgba(34,197,94,0.12)"
          label="Active Users"
          value={activeUsers.toLocaleString()}
          trend="Live now"
          trendUp
          sub="Refreshes every 5s"
        />
        <KpiCard
          icon={Clock}
          iconColor="#06b6d4"
          iconBg="rgba(6,182,212,0.12)"
          label="Avg Response Time"
          value={`${avgResponseTime}s`}
          trend="Last 24 hours"
          sub={avgResponseTime < 2 ? "Excellent performance" : "Needs improvement"}
        />
        <KpiCard
          icon={CheckCircle2}
          iconColor="#a855f7"
          iconBg="rgba(168,85,247,0.12)"
          label="Resolution Rate"
          value={`${Math.round(resolutionRate)}%`}
          trend={`Target: 90%`}
          trendUp={resolutionRate >= 80}
          sub={resolutionRate >= 90 ? "Target achieved" : "Below target"}
        />
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="charts-row">

        {/* Conversation Trends */}
        <div className="chart-panel panel-wide">
          <div className="panel-header">
            <div>
              <h6 className="panel-title">Conversation Trends</h6>
              <span className="panel-subtitle">Volume over time</span>
            </div>
            <div className="panel-actions">
              <div className="segmented-control">
                {["7","30"].map(v => (
                  <button
                    key={v}
                    className={`seg-btn ${trendRange === v ? "active" : ""}`}
                    onClick={() => setTrendRange(v)}
                  >{v === "7" ? "7 days" : "30 days"}</button>
                ))}
              </div>
              <button className="icon-action-btn" onClick={downloadChart} title="Download">
                <Download size={14} />
              </button>
            </div>
          </div>
          <div id="trends-chart-container" className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendsData} margin={{ top:10, right:10, left:-10, bottom:0 }}>
                <defs>
                  <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f97316" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.20} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill:"rgba(255,255,255,0.35)", fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"rgba(255,255,255,0.35)", fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize:12, color:"rgba(255,255,255,0.45)", paddingTop:8 }}
                  iconType="circle" iconSize={8}
                />
                <Area type="monotone" dataKey="total"     name="Total"     stroke="#f97316" strokeWidth={2} fill="url(#gTotal)"   dot={false} />
                <Area type="monotone" dataKey="resolved"  name="Resolved"  stroke="#22c55e" strokeWidth={2} fill="url(#gResolved)" dot={false} />
                <Area type="monotone" dataKey="escalated" name="Escalated" stroke="#fb923c" strokeWidth={2} fill="none" strokeDasharray="4 3" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intent Distribution */}
        <div className="chart-panel panel-narrow">
          <div className="panel-header">
            <div>
              <h6 className="panel-title">Intent Distribution</h6>
              <span className="panel-subtitle">Top intents this week</span>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={intentData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={chartRadius.inner}
                  outerRadius={chartRadius.outer}
                  cx="50%"
                  cy="45%"
                  paddingAngle={2}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {intentData.map((_, i) => (
                    <Cell key={i} fill={INTENT_COLORS[i % INTENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{ fontSize:11, color:"rgba(255,255,255,0.45)", lineHeight:"1.8" }}
                  iconType="circle" iconSize={7}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── PEAK HOURS HEATMAP ── */}
      <div className="chart-panel full-width mb-section">
        <div className="panel-header">
          <div>
            <h6 className="panel-title">Peak Hours</h6>
            <span className="panel-subtitle">Conversation volume by hour · day</span>
          </div>
        </div>
        <div style={{ padding: "0 8px 8px" }}>
          <PeakHoursHeatmap data={peakHoursData} />
        </div>
      </div>

      {/* ── ACTIVITY FEED ── */}
      <div className="chart-panel full-width">
        <div className="panel-header">
          <div>
            <h6 className="panel-title">
              <TrendingUp size={15} style={{ marginRight:6, color:"#fb923c", verticalAlign:"middle" }} />
              Recent Activity
            </h6>
            <span className="panel-subtitle">{recentConversations.length} conversations</span>
          </div>
          <div className="panel-actions">
            {recentConversations.length > 4 && (
              <button className="text-action-btn" onClick={() => setShowAll(s => !s)}>
                {showAll ? "View Less" : "View All"}
              </button>
            )}
          </div>
        </div>

        <div className="activity-list">
          {displayed.map(item => (
            <ActivityItem key={item.id} item={item} onView={handleView} />
          ))}
        </div>
      </div>

      {/* ── MODAL ── */}
      <Modal show={showModal} onHide={handleClose} centered size="md">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize:"1rem", fontWeight:700 }}>
            Conversation Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedConv && (
            <>
              <div className="modal-field">
                <div className="modal-field-label">Message</div>
                <div className="modal-field-value">{selectedConv.message}</div>
              </div>
              <div className="modal-field">
                <div className="modal-field-label">Intent</div>
                <span
                  className="intent-badge"
                  style={{
                    background: (INTENT_BADGE_COLOR[selectedConv.intent] || "#64748b") + "22",
                    color: INTENT_BADGE_COLOR[selectedConv.intent] || "#94a3b8",
                    border: `1px solid ${(INTENT_BADGE_COLOR[selectedConv.intent] || "#64748b")}44`,
                  }}
                >
                  {selectedConv.intent}
                </span>
              </div>
              <div className="modal-field">
                <div className="modal-field-label">
                  Confidence — <strong style={{ color:"#ffffff" }}>{selectedConv.confidence}%</strong>
                </div>
                <ProgressBar
                  now={selectedConv.confidence}
                  style={{ height:6, borderRadius:4, background:"rgba(255,255,255,0.06)" }}
                />
              </div>
              <div className="modal-field">
                <div className="modal-field-label">Received</div>
                <div className="modal-field-value">{selectedConv.timeAgo}</div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

/* ─── Dashboard wrapper ─── */
const Dashboard = () => (
  <NormalLayout>
    <DashboardContent />
  </NormalLayout>
);

export default Dashboard;
