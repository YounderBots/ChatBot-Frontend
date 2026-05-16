import { Calendar, RefreshCw } from "lucide-react";
import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";

const PRESETS = ["Today", "Yesterday", "Last 7 days", "Last 30 days", "This month"];

const AnalyticsFilter = ({ onApply }) => {
  const fmt = (d) => d.toISOString().split("T")[0];
  const today = fmt(new Date());

  const [preset,    setPreset]    = useState("Today");
  const [startDate, setStartDate] = useState(today);
  const [endDate,   setEndDate]   = useState(today);

  React.useEffect(() => { fire("Today", today, today); }, []);

  const fire = (p, s, e) => {
    const start = new Date(s);
    const end   = new Date(e);
    const diff  = Math.ceil((end - start) / 86400000) + 1;
    const prevEnd   = new Date(start); prevEnd.setDate(start.getDate() - 1);
    const prevStart = new Date(prevEnd); prevStart.setDate(prevEnd.getDate() - diff + 1);
    onApply?.({ preset: p, startDate: s, endDate: e,
      compareRange: { startDate: fmt(prevStart), endDate: fmt(prevEnd) } });
  };

  const applyPreset = (value) => {
    const today = new Date();
    let s, e;
    switch (value) {
      case "Today":        s = e = new Date(); break;
      case "Yesterday":    s = e = new Date(); s.setDate(s.getDate() - 1); e = new Date(s); break;
      case "Last 7 days":  e = new Date(); s = new Date(); s.setDate(e.getDate() - 6); break;
      case "Last 30 days": e = new Date(); s = new Date(); s.setDate(e.getDate() - 29); break;
      case "This month":   s = new Date(today.getFullYear(), today.getMonth(), 1); e = new Date(); break;
      default: return;
    }
    const sf = fmt(s), ef = fmt(e);
    setStartDate(sf); setEndDate(ef); setPreset(value);
    fire(value, sf, ef);
  };

  const handleApply = () => fire(preset, startDate, endDate);

  return (
    <div className="an-filter">
      {/* Preset chips */}
      <div className="an-filter-presets">
        {PRESETS.map(p => (
          <button
            key={p}
            className={`an-preset-btn ${preset === p ? "active" : ""}`}
            onClick={() => applyPreset(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="an-filter-divider" />

      {/* Date range */}
      <div className="an-filter-dates">
        <Calendar size={14} className="an-filter-icon" />
        <Form.Control
          type="date"
          size="sm"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPreset("Custom"); }}
          className="an-date-input"
        />
        <span className="an-filter-sep">–</span>
        <Form.Control
          type="date"
          size="sm"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPreset("Custom"); }}
          className="an-date-input"
        />
        <Button size="sm" variant="primary" onClick={handleApply} className="an-apply-btn">
          <RefreshCw size={12} className="me-1" />
          Apply
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsFilter;
