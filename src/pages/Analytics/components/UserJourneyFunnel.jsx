import { useEffect, useRef, useState } from "react";
import { ArrowDown, CheckCircle2, MessageSquare, Search, Sparkles, Star, Zap } from "lucide-react";

const STAGES = [
  { label: "Session Started",  value: 12000, icon: Zap,           color: "#e8710a" },
  { label: "Message Sent",     value: 9400,  icon: MessageSquare, color: "#f97316" },
  { label: "Intent Matched",   value: 7100,  icon: Search,        color: "#fb923c" },
  { label: "Resolved",         value: 5200,  icon: CheckCircle2,  color: "#22c55e" },
  { label: "Feedback Given",   value: 3100,  icon: Star,          color: "#3b82f6" },
];

const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toLocaleString();
const pct = (a, b) => ((a / b) * 100).toFixed(1);

export default function UserJourneyFunnel() {
  const max = STAGES[0].value;
  const total = STAGES[0].value;
  const containerRef = useRef(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true); },
      { threshold: 0.2 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="uf-root">
      {/* Header */}
      <div className="uf-header">
        <div className="uf-header-left">
          <Sparkles size={15} className="uf-header-icon" />
          <span>User Journey Funnel</span>
        </div>
        <div className="uf-overall">
          <span className="uf-overall-label">Overall conversion</span>
          <span className="uf-overall-value">
            {pct(STAGES[STAGES.length - 1].value, total)}%
          </span>
        </div>
      </div>

      {/* Funnel */}
      <div className="uf-funnel">
        {STAGES.map((stage, i) => {
          const barPct     = (stage.value / max) * 100;
          const prevVal    = i > 0 ? STAGES[i - 1].value : null;
          const dropPct    = prevVal ? (((prevVal - stage.value) / prevVal) * 100).toFixed(1) : null;
          const ofTotal    = pct(stage.value, total);
          const Icon       = stage.icon;

          return (
            <div key={stage.label}>
              {/* Drop-off connector */}
              {dropPct && (
                <div className="uf-connector">
                  <div className="uf-connector-line" />
                  <div className="uf-drop-badge">
                    <ArrowDown size={10} />
                    <span>{dropPct}% drop-off</span>
                  </div>
                  <div className="uf-connector-line" />
                </div>
              )}

              {/* Stage row */}
              <div className="uf-stage">
                {/* Step number */}
                <div className="uf-step-num" style={{ color: stage.color }}>
                  {String(i + 1).padStart(2, "0")}
                </div>

                {/* Bar + label block */}
                <div className="uf-bar-block">
                  {/* Stage name row */}
                  <div className="uf-stage-meta">
                    <div className="uf-stage-icon" style={{ background: `${stage.color}22`, color: stage.color }}>
                      <Icon size={13} />
                    </div>
                    <span className="uf-stage-label">{stage.label}</span>
                    <span className="uf-stage-pct" style={{ color: stage.color }}>{ofTotal}%</span>
                  </div>

                  {/* Bar */}
                  <div className="uf-bar-track">
                    <div
                      className="uf-bar-fill"
                      style={{
                        width: animated ? `${barPct}%` : "0%",
                        background: `linear-gradient(90deg, ${stage.color}, ${stage.color}88)`,
                        transitionDelay: `${i * 0.12}s`,
                      }}
                    >
                      <div className="uf-bar-shine" />
                    </div>
                  </div>
                </div>

                {/* Value */}
                <div className="uf-stage-value">
                  <span className="uf-value-num">{fmt(stage.value)}</span>
                  <span className="uf-value-label">users</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div className="uf-summary">
        {STAGES.map((s, i) => (
          <div key={s.label} className="uf-summary-item">
            <div className="uf-summary-dot" style={{ background: s.color }} />
            <span className="uf-summary-name">{s.label}</span>
            <span className="uf-summary-val">{fmt(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
