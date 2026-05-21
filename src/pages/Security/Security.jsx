/**
 * Security.jsx — Audit Logs + GDPR compliance centre.
 *
 * Tabs:
 *   1. Audit Logs  — filterable log table with CSV export
 *   2. GDPR        — session data export, erasure request, consent records
 */
import { Download, Search, Shield, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Alert, Badge, Button, Card, Col, Form,
  Modal, Row, Spinner, Table
} from "react-bootstrap";
import APICall, { baseURL } from "../../APICalls/APICall";
import TabComponent from "../../components/TabComponent";
import { useToast } from "../../components/useToast";

// ─── Tab 1: Audit Logs ───────────────────────────────────────────────────────

function AuditLogsTab() {
  const [logs, setLogs]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [filters, setFilters]   = useState({
    action: "", resource_type: "", user_email: "", from_date: "", to_date: ""
  });

  const PER_PAGE = 25;

  const load = useCallback(async (p = page) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: p, per_page: PER_PAGE });
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await APICall.getT(`/audit/logs?${params}`);
      setLogs(res?.logs || []);
      setTotal(res?.total || 0);
    } catch {
      setError("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { load(1); setPage(1); }, [filters]);
  useEffect(() => { load(page); }, [page]);

  const [exporting, setExporting] = useState(false);

  const exportCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (filters.action)        params.append("action",        filters.action);
      if (filters.resource_type) params.append("resource_type", filters.resource_type);
      if (filters.user_email)    params.append("user_email",    filters.user_email);
      if (filters.from_date)     params.append("from_date",     filters.from_date);
      if (filters.to_date)       params.append("to_date",       filters.to_date);

      const response = await fetch(
        `${baseURL}/admin/audit/logs/export?${params}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`CSV export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const STATUS_VARIANT = { SUCCESS: "success", FAILURE: "danger", WARNING: "warning" };
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  if (loading && logs.length === 0) return <div className="text-center py-5"><Spinner /></div>;

  return (
    <div className="p-3">
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="border-0 shadow-sm mb-3">
        <Card.Body className="py-2">
          <Row className="g-2 align-items-end">
            <Col md={3}>
              <Form.Control size="sm" placeholder="Filter by action…"
                value={filters.action}
                onChange={e => setFilters({ ...filters, action: e.target.value })} />
            </Col>
            <Col md={2}>
              <Form.Control size="sm" placeholder="Resource type"
                value={filters.resource_type}
                onChange={e => setFilters({ ...filters, resource_type: e.target.value })} />
            </Col>
            <Col md={3}>
              <Form.Control size="sm" placeholder="User email"
                value={filters.user_email}
                onChange={e => setFilters({ ...filters, user_email: e.target.value })} />
            </Col>
            <Col md={2}>
              <Form.Control size="sm" type="date" value={filters.from_date}
                onChange={e => setFilters({ ...filters, from_date: e.target.value })} />
            </Col>
            <Col md={2}>
              <Form.Control size="sm" type="date" value={filters.to_date}
                onChange={e => setFilters({ ...filters, to_date: e.target.value })} />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <small className="text-muted">{total} records found</small>
        <Button size="sm" variant="outline-secondary" onClick={exportCSV} disabled={exporting}>
          {exporting
            ? <><Spinner size="sm" className="me-1" />Exporting…</>
            : <><Download size={13} className="me-1" />Export CSV</>
          }
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Table hover responsive className="mb-0 align-middle" style={{ fontSize: "0.85rem" }}>
          <thead className="table-light">
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Resource ID</th>
              <th>IP</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td colSpan={7} className="text-center text-muted py-4">No logs found.</td></tr>
            )}
            {logs.map(l => (
              <tr key={l.id}>
                <td className="text-nowrap">{l.created_at?.replace("T", " ").slice(0, 19)}</td>
                <td>{l.user_email || "—"}</td>
                <td><code style={{ fontSize: "0.8rem" }}>{l.action}</code></td>
                <td>{l.resource_type || "—"}</td>
                <td>{l.resource_id || "—"}</td>
                <td>{l.ip_address || "—"}</td>
                <td>
                  <Badge bg={STATUS_VARIANT[l.status] || "secondary"}>{l.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top">
            <small className="text-muted">Page {page} of {totalPages}</small>
            <div className="d-flex gap-1">
              <Button size="sm" variant="outline-secondary" disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}>Prev</Button>
              <Button size="sm" variant="outline-secondary" disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Tab 2: GDPR ─────────────────────────────────────────────────────────────

function GDPRTab() {
  const { showToast, ToastContainer } = useToast();
  const [sessionKey, setSessionKey] = useState("");
  const [busy, setBusy]             = useState({ export: false, erase: false });
  const [result, setResult]         = useState(null);
  const [eraseModal, setEraseModal] = useState(false);
  const [consentList, setConsentList] = useState([]);
  const [consentLoading, setConsentLoading] = useState(false);
  const [consentPage, setConsentPage] = useState(1);
  const [consentTotal, setConsentTotal] = useState(0);

  const loadConsent = useCallback(async (p = 1) => {
    setConsentLoading(true);
    try {
      const res = await APICall.getT(`/gdpr/consent?page=${p}&per_page=20`);
      setConsentList(res?.records || res?.data || []);
      setConsentTotal(res?.total || 0);
      setConsentPage(p);
    } catch {
      setConsentList([]);
    } finally {
      setConsentLoading(false);
    }
  }, []);

  useEffect(() => { loadConsent(); }, [loadConsent]);

  const handleExport = async () => {
    if (!sessionKey.trim()) { showToast("Please enter a session key.", "warning"); return; }
    setBusy(b => ({ ...b, export: true }));
    setResult(null);
    try {
      const data = await APICall.getT(`/gdpr/export/${sessionKey.trim()}`);
      
      // Trigger a browser file download of the exported JSON data
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gdpr_export_${sessionKey.trim()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setResult({ type: "success", message: "Data exported successfully. Check your browser downloads.", data });
    } catch {
      setResult({ type: "danger", message: "Export failed. Check the session key." });
    } finally {
      setBusy(b => ({ ...b, export: false }));
    }
  };

  const handleErase = async (hard = false) => {
    setBusy(b => ({ ...b, erase: true }));
    setEraseModal(false);
    setResult(null);
    try {
      const res = await APICall.postT(`/gdpr/erase/${sessionKey.trim()}`, { hard });
      setResult({ type: "success", message: res?.message || "Data erased successfully." });
    } catch {
      setResult({ type: "danger", message: "Erasure failed." });
    } finally {
      setBusy(b => ({ ...b, erase: false }));
    }
  };

  const consentPages = Math.max(1, Math.ceil(consentTotal / 20));

  return (
    <div className="p-3">
      <ToastContainer />
      {/* Info banner */}
      <Alert variant="info" className="d-flex align-items-center gap-2">
        <Shield size={16} />
        <span>GDPR tools allow you to fulfil data access and erasure requests from customers.</span>
      </Alert>

      {/* Data Access & Erasure */}
      <Card className="border-0 shadow-sm mb-3">
        <Card.Header className="bg-white fw-semibold">Data Subject Requests</Card.Header>
        <Card.Body>
          <Row className="g-2 align-items-end">
            <Col md={6}>
              <Form.Label className="small fw-semibold">Session Key</Form.Label>
              <div className="input-group input-group-sm">
                <span className="input-group-text"><Search size={13} /></span>
                <Form.Control placeholder="Enter session key…" value={sessionKey}
                  onChange={e => setSessionKey(e.target.value)} />
              </div>
            </Col>
            <Col md={3}>
              <Button size="sm" variant="outline-primary" className="w-100"
                onClick={handleExport} disabled={busy.export}>
                {busy.export ? <Spinner size="sm" /> : <><Download size={13} className="me-1" />Export Data</>}
              </Button>
            </Col>
            <Col md={3}>
              <Button size="sm" variant="outline-danger" className="w-100"
                onClick={() => setEraseModal(true)} disabled={busy.erase || !sessionKey.trim()}>
                {busy.erase ? <Spinner size="sm" /> : <><Trash2 size={13} className="me-1" />Erase Data</>}
              </Button>
            </Col>
          </Row>
          {result && (
            <Alert variant={result.type} className="mt-3 mb-0 py-2 small">{result.message}</Alert>
          )}
        </Card.Body>
      </Card>

      {/* Consent Records */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white fw-semibold d-flex justify-content-between align-items-center">
          Consent Records
          <Button size="sm" variant="outline-secondary" onClick={() => loadConsent(1)}>Refresh</Button>
        </Card.Header>
        <Card.Body className="p-0">
          {consentLoading ? (
            <div className="text-center py-3"><Spinner size="sm" /></div>
          ) : (
            <Table hover responsive className="mb-0 align-middle" style={{ fontSize: "0.85rem" }}>
              <thead className="table-light">
                <tr>
                  <th>Session Key</th>
                  <th>Consent Type</th>
                  <th>Accepted</th>
                  <th>IP</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {consentList.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-muted py-3">No consent records.</td></tr>
                )}
                {consentList.map(c => (
                  <tr key={c.id}>
                    <td><code style={{ fontSize: "0.8rem" }}>{c.session_key || "—"}</code></td>
                    <td>{c.consent_type}</td>
                    <td>
                      <Badge bg={c.accepted ? "success" : "danger"}>
                        {c.accepted ? "Accepted" : "Rejected"}
                      </Badge>
                    </td>
                    <td>{c.ip_address || "—"}</td>
                    <td>{c.created_at?.replace("T", " ").slice(0, 19)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          {consentPages > 1 && (
            <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top">
              <small className="text-muted">Page {consentPage} of {consentPages}</small>
              <div className="d-flex gap-1">
                <Button size="sm" variant="outline-secondary" disabled={consentPage <= 1}
                  onClick={() => loadConsent(consentPage - 1)}>Prev</Button>
                <Button size="sm" variant="outline-secondary" disabled={consentPage >= consentPages}
                  onClick={() => loadConsent(consentPage + 1)}>Next</Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Erase Confirmation Modal */}
      <Modal show={eraseModal} onHide={() => setEraseModal(false)} centered fullscreen="sm-down">
        <Modal.Header closeButton>
          <Modal.Title>Confirm Data Erasure</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning" className="mb-2">
            <strong>This action cannot be undone.</strong> All personal data for session{" "}
            <code>{sessionKey}</code> will be anonymised or deleted.
          </Alert>
          <p className="mb-0 small">Choose erasure type:</p>
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <Button variant="secondary" onClick={() => setEraseModal(false)}>Cancel</Button>
          <div className="d-flex gap-2">
            <Button variant="warning" onClick={() => handleErase(false)}>
              Anonymise (soft)
            </Button>
            <Button variant="danger" onClick={() => handleErase(true)}>
              Delete (hard)
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const Security = () => {
  const pageContent = {
    title: "Security & Compliance",
    subTitle: "Audit logs and GDPR data management",
    tabs: [
      { tabTitle: "Audit Logs", tabKey: "audit", tabContent: <AuditLogsTab /> },
      { tabTitle: "GDPR",       tabKey: "gdpr",  tabContent: <GDPRTab /> },
    ],
  };

  return (
    <div className="h-100">
      <TabComponent pageContent={pageContent} />
    </div>
  );
};

export default Security;
