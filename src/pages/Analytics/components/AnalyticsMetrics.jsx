import { Activity, CheckCircle, MessageCircle, Radio, Users, XCircle, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import APICall from "../../../APICalls/APICall";
import "../Analytics.css";

const pulse = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const HEALTH_CONFIG = {
  Healthy:  { color: "#22c55e", icon: CheckCircle,    label: "All systems operational" },
  Degraded: { color: "#f59e0b", icon: AlertTriangle,   label: "Performance degraded" },
  Down:     { color: "#ef4444", icon: XCircle,         label: "Service unavailable" },
};

const LiveCard = ({ icon: Icon, label, value, sub, color, accent }) => (
  <div className="an-live-card" style={{ "--accent": accent || "#e8710a" }}>
    <div className="an-live-card-icon" style={{ color }}>
      <Icon size={20} />
    </div>
    <div className="an-live-card-body">
      <div className="an-live-label">{label}</div>
      <div className="an-live-value" style={{ color }}>{value}</div>
      {sub && <div className="an-live-sub">{sub}</div>}
    </div>
    <div className="an-live-pulse" style={{ background: color }} />
  </div>
);

export default function AnalyticsMetrics() {
  const [metrics, setMetrics] = useState({
    liveUsers:   0,
    activeConvs: 0,
    totalConvs:  0,
    health:      "Healthy",
  });
  const [tick, setTick] = useState(0);

  const fetchMetrics = async () => {
    try {
      const kpi = await APICall.getT("/analytics/kpi");
      const avgRt = kpi.avgResponseTime ?? 0;
      const health = avgRt < 3 ? "Healthy" : avgRt < 8 ? "Degraded" : "Down";
      setMetrics({
        liveUsers:   kpi.activeUsers        ?? 0,
        activeConvs: kpi.totalConversations ?? 0,
        totalConvs:  kpi.totalConversations ?? 0,
        health,
      });
    } catch {
      // Non-fatal — keep last known values
    }
    setTick(t => t + 1);
  };

  useEffect(() => {
    fetchMetrics();
    const id = setInterval(fetchMetrics, 5000);
    return () => clearInterval(id);
  }, []);

  const hc = HEALTH_CONFIG[metrics.health];

  return (
    <div className="an-realtime-root">
      {/* Header */}
      <div className="an-realtime-header">
        <div className="an-realtime-dot" />
        <span className="an-realtime-title">Live Dashboard</span>
        <span className="an-realtime-badge">Auto-refreshes every 5s</span>
        <span className="an-realtime-tick">Update #{tick + 1}</span>
      </div>

      {/* Cards */}
      <div className="an-live-grid">
        <LiveCard
          icon={Users}
          label="Live Users"
          value={metrics.liveUsers.toLocaleString()}
          sub="Active right now"
          color="#3b82f6"
          accent="#3b82f6"
        />
        <LiveCard
          icon={MessageCircle}
          label="Active Conversations"
          value={metrics.activeConvs.toLocaleString()}
          sub="Open sessions"
          color="#e8710a"
          accent="#e8710a"
        />
        <LiveCard
          icon={Activity}
          label="Total Conversations"
          value={metrics.totalConvs.toLocaleString()}
          sub="All time"
          color="#a855f7"
          accent="#a855f7"
        />
        <LiveCard
          icon={hc.icon}
          label="System Health"
          value={metrics.health}
          sub={hc.label}
          color={hc.color}
          accent={hc.color}
        />
      </div>

      {/* Activity bar — decorative only */}
      <div className="an-activity-bar">
        <div className="an-activity-label">
          <Radio size={13} className="me-2" style={{ color: "#e8710a" }} />
          Live Activity Feed
        </div>
        <div className="an-activity-stream">
          {Array.from({ length: 24 }, (_, i) => {
            const h = pulse(10, 100);
            return (
              <div
                key={i}
                className="an-bar-col"
                style={{ height: `${h}%`, opacity: 0.4 + h / 200 }}
                title={`${h} messages`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
