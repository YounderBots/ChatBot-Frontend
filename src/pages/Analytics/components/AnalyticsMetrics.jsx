import { Activity, CheckCircle, MessageCircle, Radio, Users, XCircle, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
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
    liveUsers:    pulse(50, 250),
    activeConvs:  pulse(20, 140),
    msgPerMin:    pulse(100, 600),
    health:       "Healthy",
  });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMetrics({
        liveUsers:   pulse(50, 250),
        activeConvs: pulse(20, 140),
        msgPerMin:   pulse(100, 600),
        health:      ["Healthy", "Healthy", "Healthy", "Degraded", "Down"][
          Math.floor(Math.random() * 5)
        ],
      });
      setTick(t => t + 1);
    }, 5000);
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
          label="Messages / Minute"
          value={metrics.msgPerMin.toLocaleString()}
          sub="Throughput"
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

      {/* Activity bar */}
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
