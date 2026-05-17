/**
 * AnalyticsExport.jsx — One-click CSV downloads for conversations and escalations.
 *
 * Uses fetch with Authorization header + Blob URL so the token is never
 * exposed in the browser address bar or server access logs.
 */
import { Download } from "lucide-react";
import { useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { baseURL } from "../../../APICalls/APICall";

const downloadCSV = async (path, filename, setError, setLoading) => {
  setError("");
  setLoading(filename);
  try {
    const token = sessionStorage.getItem("token");
    const res = await fetch(`${baseURL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Export failed (${res.status})`);
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    setError(e.message);
  } finally {
    setLoading(null);
  }
};

const AnalyticsExport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate,   setToDate]   = useState("");
  const [loading,  setLoading]  = useState(null);
  const [error,    setError]    = useState("");

  const params = () => {
    const p = new URLSearchParams();
    if (fromDate) p.append("from_date", fromDate);
    if (toDate)   p.append("to_date",   toDate);
    return p.toString() ? `?${p}` : "";
  };

  const dl = (path, filename) =>
    downloadCSV(`${path}${params()}`, filename, setError, setLoading);

  return (
    <Card className="rounded-4 shadow-sm mb-3">
      <Card.Body>
        <h5 className="mb-3">Data Exports</h5>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")} className="py-2">
            {error}
          </Alert>
        )}

        <Row className="g-2 align-items-end mb-3">
          <Col md={3}>
            <Form.Label className="small fw-semibold">From Date</Form.Label>
            <Form.Control type="date" size="sm" value={fromDate}
              onChange={e => setFromDate(e.target.value)} />
          </Col>
          <Col md={3}>
            <Form.Label className="small fw-semibold">To Date</Form.Label>
            <Form.Control type="date" size="sm" value={toDate}
              onChange={e => setToDate(e.target.value)} />
          </Col>
        </Row>

        <div className="d-flex flex-wrap gap-2">
          {[
            { path: "/export/conversations",     file: "conversations.csv",   label: "Conversations", variant: "outline-primary",   fmt: "CSV" },
            { path: "/export/conversations/pdf", file: "conversations.pdf",   label: "Conversations", variant: "outline-info",      fmt: "PDF" },
            { path: "/export/escalations",       file: "escalations.csv",     label: "Escalations",   variant: "outline-success",   fmt: "CSV" },
            { path: "/export/analytics",         file: "analytics.csv",       label: "Analytics",     variant: "outline-secondary", fmt: "CSV" },
            { path: "/audit/logs/export",        file: "audit_logs.csv",      label: "Audit Logs",    variant: "outline-dark",      fmt: "CSV" },
          ].map(({ path, file, label, variant, fmt }) => (
            <Button key={file} size="sm" variant={variant}
              onClick={() => dl(path, file)}
              disabled={loading === file}>
              {loading === file
                ? <><Spinner size="sm" className="me-1" />Downloading…</>
                : <><Download size={13} className="me-1" />{label} {fmt}</>}
            </Button>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default AnalyticsExport;
