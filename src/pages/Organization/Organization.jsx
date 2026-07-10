import { Building2, Crown, Plus, Trash2, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Alert, Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table,
} from 'react-bootstrap';
import APICall from '../../APICalls/APICall';
import TabComponent from '../../components/TabComponent';
import { useToast } from '../../components/useToast';
import { useConfirm } from '../../components/useConfirm';

/* ═══════════════════════════════════════════
   TAB 1 — Org Details
═══════════════════════════════════════════ */
function OrgDetailsTab() {
  const [org,     setOrg]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [alert,   setAlert]   = useState(null);
  const [form,    setForm]    = useState({
    name: '', website: '', industry: '', timezone: 'UTC',
  });
  // Chat-widget appearance (shared with the Settings → Appearance tab).
  const [appearance, setAppearance] = useState({ primaryColor: '#6366f1', position: 'bottom-right' });
  const [appSaving,  setAppSaving]  = useState(false);

  const INDUSTRIES = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'E-Commerce',
    'Retail', 'Manufacturing', 'Hospitality', 'Media', 'Real Estate', 'Other',
  ];
  const TIMEZONES = [
    'UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago',
    'Europe/London', 'Europe/Paris', 'Asia/Dubai', 'Asia/Kolkata',
    'Asia/Singapore', 'Australia/Sydney',
  ];

  useEffect(() => {
    (async () => {
      try {
        const data = await APICall.getT(`/org/me`);
        setOrg(data.org);
        setForm({
          name:     data.org.name     || '',
          website:  data.org.website  || '',
          industry: data.org.industry || '',
          timezone: data.org.timezone || 'UTC',
        });
      } catch (e) {
        setAlert({ variant: 'danger', msg: e.message });
      } finally {
        setLoading(false);
      }
    })();
    (async () => {
      try {
        const a = await APICall.getT('/settings/appearance');
        if (a && typeof a === 'object') {
          setAppearance(p => ({
            primaryColor: a.primaryColor || p.primaryColor,
            position:     a.position     || p.position,
          }));
        }
      } catch { /* keep defaults */ }
    })();
  }, []);

  const saveAppearance = async () => {
    setAppSaving(true);
    setAlert(null);
    try {
      // Merge so we don't clobber the richer fields the Appearance tab manages.
      const current = await APICall.getT('/settings/appearance').catch(() => ({}));
      await APICall.postT('/settings/appearance', { ...(current || {}), ...appearance });
      setAlert({ variant: 'success', msg: 'Widget appearance saved.' });
    } catch (e) {
      setAlert({ variant: 'danger', msg: e.message });
    } finally {
      setAppSaving(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setAlert(null);
    try {
      await APICall.postT(`/org/update`, form);
      setAlert({ variant: 'success', msg: 'Organization details saved.' });
    } catch (e) {
      setAlert({ variant: 'danger', msg: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="p-3">
      {/* Org banner */}
      {org && (
        <div className="rounded-4 mb-4 p-4 text-white"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-3 p-3"
              style={{ background: 'rgba(255,255,255,.18)', lineHeight: 1, display: 'flex' }}>
              <Building2 size={28} />
            </div>
            <div>
              <h5 className="mb-0 fw-bold">{org.name}</h5>
              <small className="opacity-75">{org.slug} · {org.status}</small>
            </div>
          </div>
        </div>
      )}

      {alert && (
        <Alert variant={alert.variant} dismissible onClose={() => setAlert(null)} className="py-2 px-3">{alert.msg}</Alert>
      )}

      <Row className="g-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label className="fw-semibold small">Organization Name</Form.Label>
            <Form.Control value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Acme Corp" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label className="fw-semibold small">Website</Form.Label>
            <Form.Control type="url" value={form.website}
              onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
              placeholder="https://example.com" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label className="fw-semibold small">Industry</Form.Label>
            <Form.Select value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))}>
              <option value="">Select industry…</option>
              {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label className="fw-semibold small">Timezone</Form.Label>
            <Form.Select value={form.timezone} onChange={e => setForm(p => ({ ...p, timezone: e.target.value }))}>
              {TIMEZONES.map(t => <option key={t}>{t}</option>)}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <div className="mt-4 d-flex justify-content-end">
        <Button className="primaryBtn" onClick={save} disabled={saving}>
          {saving ? <><Spinner size="sm" className="me-2" />Saving…</> : 'Save Changes'}
        </Button>
      </div>

      {/* Chat widget appearance — quick controls (full set lives in Settings → Appearance) */}
      <Card className="mt-4 border-0 shadow-sm">
        <Card.Body>
          <h6 className="fw-bold mb-1">Chat Widget Appearance</h6>
          <small className="text-muted d-block mb-3">
            Theme the embeddable chat widget. The full set of options lives in Settings → Appearance.
          </small>
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Primary Color</Form.Label>
                <Form.Control type="color" value={appearance.primaryColor}
                  onChange={e => setAppearance(p => ({ ...p, primaryColor: e.target.value }))}
                  title="Widget accent color" />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Launcher Position</Form.Label>
                <Form.Select value={appearance.position}
                  onChange={e => setAppearance(p => ({ ...p, position: e.target.value }))}>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex justify-content-end">
              <Button className="primaryBtn" onClick={saveAppearance} disabled={appSaving}>
                {appSaving ? <><Spinner size="sm" className="me-2" />Saving…</> : 'Save Appearance'}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
}


/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function Organization() {
  return (
    <TabComponent
      pageContent={{
        title:    'Organization',
        subTitle: 'Manage your workspace',
        tabs: [
          { tabTitle: 'Details',  tabKey: 'details',  tabContent: <OrgDetailsTab /> },
        ],
      }}
    />
  );
}
