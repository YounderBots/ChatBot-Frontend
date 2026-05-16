/**
 * AnalyticsCSAT.jsx — CSAT score trends and distribution pulled from chat_service.
 *
 * Note: chat_service CSAT endpoint is at /chat/csat/analytics (no auth header
 * needed from the backend's perspective, but APICall adds the token anyway).
 * We proxy through admin_service analytics or call chat_service directly.
 * Since we only have admin_service as the baseURL, we fetch through the
 * admin analytics proxy if available, or fallback to a static state.
 */
import { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Card, Col, ProgressBar, Row, Spinner } from "react-bootstrap";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import APICall from "../../../APICalls/APICall";

const STAR_COLORS = ["#dc3545", "#fd7e14", "#ffc107", "#20c997", "#0d6efd"];

const AnalyticsCSAT = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Try chat_service CSAT analytics via admin analytics proxy
      const res = await APICall.getT("/analytics/csat?range=30");
      setData(res);
    } catch {
      try {
        // Fallback: direct call (if admin_service proxies it)
        const res = await APICall.getT("/analytics/csat");
        setData(res);
      } catch {
        setError("CSAT analytics unavailable — ensure chat_service is running.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="text-center py-4"><Spinner size="sm" /></div>;
  if (error)   return <Alert variant="warning" className="py-2">{error}</Alert>;
  if (!data)   return null;

  const dist    = data.distribution || {};
  const maxDist = Math.max(...Object.values(dist), 1);
  const trend   = data.daily_trend  || [];

  return (
    <Card className="rounded-4 shadow-sm mb-3">
      <Card.Body>
        <h5 className="mb-3">Customer Satisfaction (CSAT)</h5>

        <Row className="g-3">
          {/* Score summary */}
          <Col md={3}>
            <div className="text-center py-3">
              <div style={{ fontSize: "3rem", fontWeight: 700, color: "#0d6efd" }}>
                {data.avg_score ?? "—"}
              </div>
              <div className="text-muted small">Avg Score (out of 5)</div>
              <div className="mt-1">
                {[1,2,3,4,5].map(i => (
                  <span key={i} style={{ color: i <= Math.round(data.avg_score || 0) ? "#ffc107" : "#dee2e6", fontSize: "1.2rem" }}>★</span>
                ))}
              </div>
              <Badge bg="light" text="dark" className="mt-2">
                {data.total_responses} responses
              </Badge>
            </div>
          </Col>

          {/* Distribution */}
          <Col md={3}>
            <div className="pt-2">
              {[5,4,3,2,1].map(star => (
                <div key={star} className="d-flex align-items-center gap-2 mb-1">
                  <span className="small" style={{ width: 16, textAlign: "right" }}>{star}★</span>
                  <ProgressBar
                    now={((dist[String(star)] || 0) / maxDist) * 100}
                    style={{ flex: 1, height: 10 }}
                    variant={star >= 4 ? "success" : star === 3 ? "warning" : "danger"}
                  />
                  <span className="small text-muted" style={{ width: 24 }}>{dist[String(star)] || 0}</span>
                </div>
              ))}
            </div>
          </Col>

          {/* Sentiment breakdown */}
          <Col md={2}>
            <div className="pt-2">
              {Object.entries(data.sentiment || {}).map(([s, cnt]) => (
                <div key={s} className="d-flex justify-content-between align-items-center mb-2">
                  <Badge bg={s === "positive" ? "success" : s === "neutral" ? "secondary" : "danger"}>
                    {s}
                  </Badge>
                  <span className="fw-semibold">{cnt}</span>
                </div>
              ))}
            </div>
          </Col>

          {/* Daily trend chart */}
          <Col md={4}>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="avg_score" stroke="#0d6efd" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="text-center small text-muted mt-1">Daily avg score (30 days)</div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default AnalyticsCSAT;
