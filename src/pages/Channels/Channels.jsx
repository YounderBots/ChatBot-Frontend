import { CheckCircle, Copy, Key, Mail, MessageCircle, MessageSquare, RefreshCw, Smartphone, Slack, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Alert, Badge, Button, Card, Col, Form, InputGroup,
  Modal, Row, Spinner, Table,
} from 'react-bootstrap';
import APICall from '../../APICalls/APICall';
import TabComponent from '../../components/TabComponent';
import { useToast } from '../../components/useToast';

const CHAT_SVC = import.meta.env.VITE_CHAT_SERVICE_URL;

/* ── Channel metadata ─────────────────────────────────────── */
const CHANNELS = {
  whatsapp: {
    label:   'WhatsApp Business',
    icon:    Smartphone,
    color:   '#25d366',
    fields: [
      { key: 'phone_number_id',     label: 'Phone Number ID',     type: 'text',     help: 'Found in Meta Business → WhatsApp → Phone Numbers' },
      { key: 'access_token',        label: 'Access Token',        type: 'password', help: 'Permanent System User access token from Meta' },
      { key: 'verify_token',        label: 'Verify Token',        type: 'text',     help: 'A secret string you choose — paste this in Meta console too' },
      { key: 'business_account_id', label: 'Business Account ID', type: 'text',     help: 'Your WhatsApp Business Account ID' },
    ],
    webhook: `${CHAT_SVC}/chat/webhooks/whatsapp`,
  },
  facebook: {
    label:   'Facebook Messenger',
    icon:    MessageCircle,
    color:   '#1877f2',
    fields: [
      { key: 'page_id',           label: 'Page ID',             type: 'text',     help: 'Your Facebook Page ID' },
      { key: 'page_access_token', label: 'Page Access Token',   type: 'password', help: 'Generated in Facebook Developer console' },
      { key: 'verify_token',      label: 'Verify Token',        type: 'text',     help: 'A secret string you choose' },
      { key: 'app_secret',        label: 'App Secret',          type: 'password', help: 'Meta App → Basic Information → App Secret' },
    ],
    webhook: `${CHAT_SVC}/chat/webhooks/facebook`,
  },
  slack: {
    label:   'Slack',
    icon:    Slack,
    color:   '#4a154b',
    fields: [
      { key: 'bot_token',      label: 'Bot Token',          type: 'password', help: 'Starts with xoxb- from Slack App OAuth settings' },
      { key: 'signing_secret', label: 'Signing Secret',     type: 'password', help: 'Slack App → Basic Information → Signing Secret' },
      { key: 'channel_id',     label: 'Default Channel ID', type: 'text',     help: 'Slack channel ID (e.g. C0123ABCDEF)' },
      { key: 'app_id',         label: 'App ID',             type: 'text',     help: 'Your Slack App ID' },
    ],
    webhook: `${CHAT_SVC}/chat/webhooks/slack`,
  },
  sms: {
    label:   'SMS (Twilio)',
    icon:    MessageSquare,
    color:   '#f22f46',
    fields: [
      { key: 'account_sid',  label: 'Account SID',      type: 'text',     help: 'From Twilio console dashboard' },
      { key: 'auth_token',   label: 'Auth Token',       type: 'password', help: 'From Twilio console dashboard' },
      { key: 'from_number',  label: 'From Number',      type: 'text',     help: 'Your Twilio phone number (e.g. +15551234567)' },
    ],
    webhook: `${CHAT_SVC}/chat/webhooks/sms`,
  },
  email: {
    label:   'Email',
    icon:    Mail,
    color:   '#6366f1',
    fields: [
      { key: 'smtp_host',   label: 'SMTP Host',      type: 'text',     help: 'e.g. smtp.gmail.com' },
      { key: 'smtp_port',   label: 'SMTP Port',      type: 'text',     help: 'Usually 587 for TLS' },
      { key: 'smtp_user',   label: 'SMTP Username',  type: 'text',     help: 'Email address' },
      { key: 'smtp_pass',   label: 'SMTP Password',  type: 'password', help: 'App password (not login password)' },
      { key: 'imap_host',   label: 'IMAP Host',      type: 'text',     help: 'e.g. imap.gmail.com' },
      { key: 'imap_port',   label: 'IMAP Port',      type: 'text',     help: 'Usually 993 for SSL' },
      { key: 'from_email',  label: 'From Email',     type: 'text',     help: 'Address shown to customers' },
    ],
    webhook: null,
  },
};

const SENSITIVE = new Set(['access_token','page_access_token','bot_token','auth_token','smtp_pass','app_secret','signing_secret']);

/* ── Copy button ─────────────────────────────────────────────── */
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };
  return (
    <Button variant="outline-secondary" size="sm" onClick={doCopy} className="ms-2">
      {copied ? <CheckCircle size={13} className="text-success" /> : <Copy size={13} />}
    </Button>
  );
}

/* ══════════════════════════════════════════
   TAB 1 — Channel Integrations
══════════════════════════════════════════ */
function ChannelsTab() {
  const { showToast, ToastContainer } = useToast();
  const [configs,   setConfigs]   = useState({});
  const [loading,   setLoading]   = useState(true);
  const [active,    setActive]    = useState('whatsapp');
  const [creds,     setCreds]     = useState({});
  const [saving,    setSaving]    = useState(false);
  const [testing,   setTesting]   = useState(false);
  const [testTo,    setTestTo]    = useState('');
  const [toggling,  setToggling]  = useState(false);
  const [alert,     setAlert]     = useState(null);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const data = await APICall.getT(`/channels`);
      const map  = {};
      (data.channels || []).forEach(c => { map[c.channel_type] = c; });
      setConfigs(map);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfigs(); }, []);

  useEffect(() => {
    setAlert(null);
    setTestTo('');
    const existing = configs[active];
    setCreds(existing?.credentials ? { ...existing.credentials } : {});
  }, [active, configs]);

  const meta     = CHANNELS[active];
  const existing = configs[active];

  const save = async () => {
    setSaving(true);
    setAlert(null);
    try {
      await APICall.postT(`/channels`, { channel_type: active, credentials: creds });
      setAlert({ variant: 'success', msg: 'Configuration saved.' });
      fetchConfigs();
    } catch (e) {
      setAlert({ variant: 'danger', msg: e.message });
    } finally {
      setSaving(false);
    }
  };

  const toggleEnable = async () => {
    if (!existing?.id) return;
    setToggling(true);
    try {
      await APICall.postT(`/channels/${existing.id}/toggle`, {});
      fetchConfigs();
    } catch (e) {
      setAlert({ variant: 'danger', msg: e.message });
    } finally {
      setToggling(false);
    }
  };

  const deleteChannel = async () => {
    if (!existing?.id || !window.confirm('Delete this channel configuration?')) return;
    try {
      await APICall.postT(`/channels/${existing.id}/delete`, {});
      fetchConfigs();
    } catch (e) {
      setAlert({ variant: 'danger', msg: e.message });
    }
  };

  const testChannel = async () => {
    if (!existing?.id) return;
    setTesting(true);
    try {
      const data = await APICall.postT(`/channels/${existing.id}/test`, { to: testTo });
      setAlert({ variant: data.success ? 'success' : 'danger', msg: data.success ? 'Test message sent!' : data.error });
    } catch (e) {
      setAlert({ variant: 'danger', msg: e.message });
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="p-3">
      <Row className="g-3">
        {/* Channel selector sidebar */}
        <Col md={3}>
          <div className="d-flex flex-column gap-2">
            {Object.entries(CHANNELS).map(([type, meta]) => {
              const cfg = configs[type];
              return (
                <div
                  key={type}
                  onClick={() => setActive(type)}
                  className={`p-3 rounded-3 d-flex align-items-center gap-2 cursor-pointer
                    ${active === type ? 'bg-primary bg-opacity-10 border border-primary border-opacity-25' : 'bg-light border border-transparent'}`}
                  style={{ cursor: 'pointer' }}
                >
                  <meta.icon size={20} style={{ color: meta.color }} />
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="fw-semibold small text-truncate">{meta.label}</div>
                    {cfg ? (
                      <Badge bg={cfg.is_enabled ? 'success' : 'secondary'} className="small">
                        {cfg.is_enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    ) : (
                      <span className="text-muted" style={{ fontSize: 11 }}>Not set up</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Col>

        {/* Config panel */}
        <Col md={9}>
          <Card className="border-0 rounded-4 shadow-sm h-100">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  {meta?.icon && <meta.icon size={24} style={{ color: meta.color }} />}
                  <div>
                    <h6 className="mb-0 fw-bold">{meta?.label}</h6>
                    {existing && (
                      <Badge bg={existing.is_enabled ? 'success' : 'secondary'}>
                        {existing.is_enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    )}
                  </div>
                </div>
                {existing && (
                  <div className="d-flex gap-2">
                    <Button size="sm" variant={existing.is_enabled ? 'outline-warning' : 'outline-success'}
                      onClick={toggleEnable} disabled={toggling}>
                      {toggling ? <Spinner size="sm" /> : existing.is_enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={deleteChannel}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                )}
              </div>

              {alert && <Alert variant={alert.variant} dismissible onClose={() => setAlert(null)} className="py-2">{alert.msg}</Alert>}

              {/* Webhook URL */}
              {meta?.webhook && (
                <Alert variant="info" className="py-2 small mb-3">
                  <strong>Webhook URL</strong> — set this in your provider console:
                  <div className="d-flex align-items-center mt-1 gap-1">
                    <code className="flex-grow-1 text-break">{meta.webhook}</code>
                    <CopyBtn text={meta.webhook} />
                  </div>
                </Alert>
              )}

              {/* Credential fields */}
              <Row className="g-3">
                {meta?.fields.map(f => (
                  <Col md={6} key={f.key}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">{f.label}</Form.Label>
                      <Form.Control
                        type={f.type}
                        placeholder={f.help}
                        value={creds[f.key] || ''}
                        onChange={e => setCreds(p => ({ ...p, [f.key]: e.target.value }))}
                        size="sm"
                      />
                      <Form.Text className="text-muted" style={{ fontSize: 11 }}>{f.help}</Form.Text>
                    </Form.Group>
                  </Col>
                ))}
              </Row>

              <div className="d-flex align-items-center gap-2 mt-4 flex-wrap">
                <Button className="primaryBtn" size="sm" onClick={save} disabled={saving}>
                  {saving ? <><Spinner size="sm" className="me-1" />Saving…</> : 'Save Configuration'}
                </Button>

                {existing?.id && active !== 'facebook' && (
                  <>
                    <Form.Control
                      size="sm"
                      style={{ width: 180 }}
                      placeholder={active === 'email' ? 'test@email.com' : '+15551234567'}
                      value={testTo}
                      onChange={e => setTestTo(e.target.value)}
                    />
                    <Button variant="outline-secondary" size="sm" onClick={testChannel} disabled={testing}>
                      {testing ? <Spinner size="sm" /> : 'Send Test'}
                    </Button>
                  </>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB 2 — Embeddable Widget Keys
══════════════════════════════════════════ */
function WidgetTab() {
  const { showToast, ToastContainer: WidgetToast } = useToast();
  const [keys,    setKeys]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating]  = useState(false);
  const [alert,   setAlert]   = useState(null);
  const [newKey,  setNewKey]  = useState(null);
  const [form,    setForm]    = useState({ key_name: 'Website Widget', allowed_origins: '*' });

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const data = await APICall.getT(`/widget/keys`);
      setKeys(data.keys || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKeys(); }, []);

  const createKey = async () => {
    setCreating(true);
    setAlert(null);
    try {
      const data = await APICall.postT(`/widget/keys`, form);
      setNewKey(data);
      setShowModal(false);
      fetchKeys();
    } catch (e) {
      setAlert({ variant: 'danger', msg: e.message });
    } finally {
      setCreating(false);
    }
  };

  const rotateKey = async (id) => {
    if (!window.confirm('Rotate this key? The old key will stop working immediately.')) return;
    try {
      const data = await APICall.postT(`/widget/keys/${id}/rotate`, {});
      setNewKey(data);
      fetchKeys();
    } catch (e) {
      showToast(e.message || 'Failed to rotate key.', 'danger');
    }
  };

  const deleteKey = async (id) => {
    if (!window.confirm('Delete this widget key?')) return;
    try {
      await APICall.postT(`/widget/keys/${id}/delete`, {});
      if (newKey?.key?.id === id) setNewKey(null);
      fetchKeys();
      showToast('Key deleted.', 'success');
    } catch (e) {
      showToast(e.message || 'Failed to delete key.', 'danger');
    }
  };

  if (loading) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h6 className="fw-bold mb-0">Embeddable Widget Keys</h6>
          <small className="text-muted">Generate an API key to embed ChatViq on any website</small>
        </div>
        <Button className="primaryBtn" size="sm" onClick={() => setShowModal(true)}>
          + Create Key
        </Button>
      </div>

      {/* New key snippet */}
      {newKey && (
        <Alert variant="success" className="mb-3">
          <Alert.Heading className="fs-6">Widget key ready — copy your embed snippet</Alert.Heading>
          <pre className="bg-white p-2 rounded small text-break mb-2" style={{ whiteSpace: 'pre-wrap' }}>
            {newKey.embed_snippet}
          </pre>
          <Button size="sm" variant="success" onClick={() => navigator.clipboard.writeText(newKey.embed_snippet)}>
            <Copy size={13} className="me-1" /> Copy Snippet
          </Button>
          <Button size="sm" variant="outline-secondary" className="ms-2" onClick={() => setNewKey(null)}>
            Dismiss
          </Button>
        </Alert>
      )}

      {keys.length === 0 ? (
        <div className="text-center text-muted py-5">
          <Key size={40} className="mb-2 text-muted" />
          <div>No widget keys yet. Create one to embed the chat widget on your website.</div>
        </div>
      ) : (
        <Table hover responsive className="align-middle">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>API Key</th>
              <th>Allowed Origins</th>
              <th>Last Used</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map(k => (
              <tr key={k.id}>
                <td className="fw-semibold">{k.key_name}</td>
                <td><code className="small">{k.api_key}</code></td>
                <td className="small text-muted">{k.allowed_origins || '*'}</td>
                <td className="small text-muted">
                  {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'}
                </td>
                <td className="text-end">
                  <Button variant="outline-secondary" size="sm" className="me-1" onClick={() => rotateKey(k.id)}>
                    <RefreshCw size={13} />
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => deleteKey(k.id)}>
                    <Trash2 size={13} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Create key modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">Create Widget Key</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {alert && <Alert variant={alert.variant} className="py-2">{alert.msg}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">Key Name</Form.Label>
            <Form.Control placeholder="e.g. Website Widget"
              value={form.key_name}
              onChange={e => setForm(p => ({ ...p, key_name: e.target.value }))} />
          </Form.Group>
          <Form.Group>
            <Form.Label className="fw-semibold small">Allowed Origins</Form.Label>
            <Form.Control placeholder="* or https://yoursite.com,https://app.yoursite.com"
              value={form.allowed_origins}
              onChange={e => setForm(p => ({ ...p, allowed_origins: e.target.value }))} />
            <Form.Text className="text-muted">Use * to allow all origins, or specify comma-separated domains.</Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button className="primaryBtn" size="sm" onClick={createKey} disabled={creating}>
            {creating ? <><Spinner size="sm" className="me-1" />Creating…</> : 'Create Key'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function Channels() {
  return (
    <TabComponent
      pageContent={{
        title:    'Channels',
        subTitle: 'Connect WhatsApp, Facebook, Slack, SMS, Email, and embed the chat widget',
        tabs: [
          { tabTitle: 'Channel Integrations', tabKey: 'channels', tabContent: <ChannelsTab /> },
          { tabTitle: 'Embeddable Widget',    tabKey: 'widget',   tabContent: <WidgetTab /> },
        ],
      }}
    />
  );
}
