import {
  Activity, ArrowDownRight, ArrowUpRight,
  MessageSquare, ThumbsUp, Timer, TrendingUp, Users,
} from "lucide-react";
import { useCallback, useState } from "react";
import {
  Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Button, Col, Modal, Row } from "react-bootstrap";
import AnalyticsFilter from "./AnalyticsFilter";
import "../Analytics.css";

/* ── brand palette ── */
const ORANGE = "#e8710a";
const COLORS  = ["#e8710a", "#fb923c", "#22c55e", "#3b82f6", "#a855f7"];

/* ── mini sparkline ── */
const Spark = ({ data, color = ORANGE, height = 56 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data}>
      <Line dataKey="v" stroke={color} strokeWidth={2} dot={false} strokeLinecap="round" />
    </LineChart>
  </ResponsiveContainer>
);

/* ── trend badge ── */
const Trend = ({ value }) => {
  const n = parseFloat(value);
  const up = n >= 0;
  return (
    <span className={`an-trend ${up ? "up" : "down"}`}>
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {Math.abs(n)}%
    </span>
  );
};

/* ── KPI card ── */
const KpiCard = ({ icon: Icon, label, value, trend, sub, chart, chartType = "line",
  chartData, chartColor, onClick, accent }) => (
  <div className={`an-kpi-card${onClick ? " clickable" : ""}`} onClick={onClick}
    style={{ "--accent": accent || ORANGE }}>
    <div className="an-kpi-top">
      <div className="an-kpi-icon">
        <Icon size={16} />
      </div>
      <div className="an-kpi-label">{label}</div>
      {trend !== undefined && <Trend value={trend} />}
    </div>
    <div className="an-kpi-value">{value}</div>
    {sub && <div className="an-kpi-sub">{sub}</div>}
    {chartData && chartData.length > 1 && (
      <div className="an-kpi-chart">
        {chartType === "pie" ? (
          <ResponsiveContainer width="100%" height={56}>
            <PieChart>
              <Pie data={chartData} dataKey="value" innerRadius={16} outerRadius={26} stroke="none">
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`]} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Spark data={chartData} color={chartColor || ORANGE} />
        )}
      </div>
    )}
  </div>
);

/* ══════════════════════════════════════════════════════════ */

const filterByDate = (data, s, e) => {
  if (!s || !e) return [];
  const start = new Date(s); start.setHours(0, 0, 0, 0);
  const end   = new Date(e); end.setHours(23, 59, 59, 999);
  return data.filter(item => {
    const d = new Date(item.date || item.timestamp);
    d.setHours(12, 0, 0, 0);
    return d >= start && d <= end;
  });
};

const genYear = (fn) => {
  const today = new Date();
  return Array.from({ length: 365 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - i);
    return { date: d.toISOString().split("T")[0], ...fn() };
  });
};

const usersData         = genYear(() => ({ newUsers: 50 + Math.floor(Math.random() * 100), returningUsers: 30 + Math.floor(Math.random() * 70) }));
const conversationsData = genYear(() => ({ count: Math.floor(100 + Math.random() * 300) }));

/* ══════════════════════════════════════════════════════════ */

export default function KeymetricsGrid() {
  const [filters, setFilters] = useState({
    preset: "Today",
    startDate: new Date().toISOString().split("T")[0],
    endDate:   new Date().toISOString().split("T")[0],
    compareRange: null,
  });
  const [drillOpen, setDrillOpen] = useState(false);

  const curConvs = filterByDate(conversationsData, filters.startDate, filters.endDate);
  const prevConvs = filters.compareRange
    ? filterByDate(conversationsData, filters.compareRange.startDate, filters.compareRange.endDate)
    : [];
  const curUsers = filterByDate(usersData, filters.startDate, filters.endDate);
  const prevUsers = filters.compareRange
    ? filterByDate(usersData, filters.compareRange.startDate, filters.compareRange.endDate)
    : [];

  const totalConv  = curConvs.reduce((s, c) => s + c.count, 0);
  const prevConv   = prevConvs.reduce((s, c) => s + c.count, 0);
  const convTrend  = prevConv > 0 ? (((totalConv - prevConv) / prevConv) * 100).toFixed(1) : "0";

  const totalUsers  = curUsers.reduce((s, u) => s + u.newUsers + u.returningUsers, 0);
  const newUsers    = curUsers.reduce((s, u) => s + u.newUsers, 0);
  const retUsers    = curUsers.reduce((s, u) => s + u.returningUsers, 0);
  const prevTotUsers = prevUsers.reduce((s, u) => s + u.newUsers + u.returningUsers, 0);
  const userTrend   = prevTotUsers > 0 ? (((totalUsers - prevTotUsers) / prevTotUsers) * 100).toFixed(1) : "0";

  const totalMsgs   = curConvs.reduce((s, c) => s + c.count * (4 + Math.random() * 3), 0);
  const avgMsgs     = totalConv > 0 ? (totalMsgs / totalConv).toFixed(1) : "—";

  const resolved    = Math.round(totalConv * 0.84);
  const resRate     = totalConv > 0 ? Math.round((resolved / totalConv) * 100) + "%" : "—";

  const sparkConv = curConvs.length > 1
    ? curConvs.slice(-14).map((c, i) => ({ v: c.count, i }))
    : Array.from({ length: 8 }, (_, i) => ({ v: Math.floor(80 + Math.random() * 120), i }));

  const sparkUsers = curUsers.length > 1
    ? curUsers.slice(-14).map((u, i) => ({ v: u.newUsers + u.returningUsers, i }))
    : Array.from({ length: 8 }, (_, i) => ({ v: Math.floor(60 + Math.random() * 80), i }));

  const pieUsers = totalUsers > 0 ? [
    { name: "New",       value: Math.round((newUsers / totalUsers) * 100) },
    { name: "Returning", value: Math.round((retUsers / totalUsers) * 100) },
  ] : [{ name: "New", value: 50 }, { name: "Returning", value: 50 }];

  const drillData = curConvs.slice(-30);

  return (
    <div className="an-grid-root">
      {/* ── Filter bar ── */}
      <AnalyticsFilter onApply={setFilters} />

      {/* ── KPI grid ── */}
      <div className="an-kpi-grid">
        <KpiCard
          icon={MessageSquare}
          label="Total Conversations"
          value={totalConv.toLocaleString()}
          trend={convTrend}
          sub={`${filters.preset}`}
          chartData={sparkConv}
          chartColor={parseFloat(convTrend) >= 0 ? "#22c55e" : "#ef4444"}
          onClick={() => setDrillOpen(true)}
        />
        <KpiCard
          icon={Users}
          label="Unique Users"
          value={totalUsers.toLocaleString()}
          trend={userTrend}
          sub={`${Math.round((newUsers / (totalUsers || 1)) * 100)}% new · ${Math.round((retUsers / (totalUsers || 1)) * 100)}% returning`}
          chartData={pieUsers}
          chartType="pie"
        />
        <KpiCard
          icon={Activity}
          label="Avg Messages / Conv"
          value={avgMsgs}
          trend={convTrend}
          chartData={sparkConv.slice(-8)}
          chartColor="#3b82f6"
          accent="#3b82f6"
        />
        <KpiCard
          icon={ThumbsUp}
          label="Resolution Rate"
          value={resRate}
          sub={`${resolved.toLocaleString()} resolved`}
          chartData={[
            { value: resolved },
            { value: totalConv - resolved },
          ]}
          chartType="pie"
          accent="#22c55e"
        />
        <KpiCard
          icon={Timer}
          label="Avg Response Time"
          value="1.4s"
          sub="Fast"
          chartData={Array.from({ length: 8 }, (_, i) => ({ v: 1 + Math.random() * 2, i }))}
          chartColor="#a855f7"
          accent="#a855f7"
        />
        <KpiCard
          icon={TrendingUp}
          label="Customer Satisfaction"
          value="4.5 / 5"
          sub="★★★★½ · 3,240 responses"
          chartData={Array.from({ length: 8 }, (_, i) => ({ v: 4 + Math.random(), i }))}
          chartColor="#f59e0b"
          accent="#f59e0b"
        />
      </div>

      {/* ── Drill-down modal ── */}
      <Modal show={drillOpen} onHide={() => setDrillOpen(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold fs-6">Total Conversations — {filters.preset}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3 mb-4 text-center">
            {[
              { label: "Current",  value: totalConv.toLocaleString() },
              { label: "Previous", value: prevConv.toLocaleString() },
              { label: "Change",   value: <span className={parseFloat(convTrend) >= 0 ? "text-success" : "text-danger"}>{convTrend}%</span> },
            ].map(({ label, value }) => (
              <Col md={4} key={label}>
                <div className="small text-muted mb-1">{label}</div>
                <div className="fw-bold fs-5">{value}</div>
              </Col>
            ))}
          </Row>
          {drillData.length > 1 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={drillData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => new Date(v).toLocaleDateString()} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={v => new Date(v).toLocaleDateString()} />
                <Line dataKey="count" stroke={ORANGE} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted py-5 small">Single-day view — select a longer range to see the trend</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button size="sm" variant="outline-secondary" onClick={() => setDrillOpen(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
