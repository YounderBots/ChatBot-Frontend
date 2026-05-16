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
  }, []);

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
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB 2 — Team Members
═══════════════════════════════════════════ */
function MembersTab() {
  const [members,  setMembers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [alert,    setAlert]    = useState(null);
  const [invite,   setInvite]   = useState({ email: '', fullname: '', org_role: 'member' });
  const { showToast, ToastContainer } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await APICall.getT(`/org/members`);
      setMembers(data.members || []);
    } catch (e) {
      showToast(e.message || 'Failed to load members.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const sendInvite = async () => {
    if (!invite.email || !invite.fullname) return;
    setInviting(true);
    setAlert(null);
    try {
      await APICall.postT(`/org/members/invite`, invite);
      setAlert({ variant: 'success', msg: `Invitation sent to ${invite.email}` });
      setShowModal(false);
      setInvite({ email: '', fullname: '', org_role: 'member' });
      fetchMembers();
    } catch (e) {
      setAlert({ variant: 'danger', msg: e.message });
    } finally {
      setInviting(false);
    }
  };

  const removeMember = async (uid) => {
    if (!await confirm('Remove this member from your organization?', { confirmLabel: 'Remove', variant: 'danger' })) return;
    try {
      await APICall.postT(`/org/members/${uid}/remove`, {});
      fetchMembers();
      showToast('Member removed.', 'success');
    } catch (e) {
      showToast(e.message || 'Failed to remove member.', 'danger');
    }
  };

  const roleVariant = { owner: 'primary', admin: 'info', member: 'secondary' };

  return (
    <div className="p-3">
      <ToastContainer /><ConfirmDialog />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="mb-0 fw-bold">Team Members</h6>
          <small className="text-muted">Manage who has access to this workspace</small>
        </div>
        <Button className="primaryBtn" size="sm" onClick={() => setShowModal(true)}>
          <UserPlus size={14} className="me-1" /> Invite Member
        </Button>
      </div>

      {alert && <Alert variant={alert.variant} dismissible onClose={() => setAlert(null)} className="py-2 px-3 mb-3">{alert.msg}</Alert>}

      {loading ? (
        <div className="d-flex justify-content-center py-4"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <Table hover responsive className="align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 && (
              <tr><td colSpan={5} className="text-center text-muted py-4">No members found</td></tr>
            )}
            {members.map(m => (
              <tr key={m.user_id}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center
                      justify-content-center fw-bold" style={{ width: 34, height: 34, fontSize: 14 }}>
                      {m.fullname?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="fw-semibold">{m.fullname}</span>
                  </div>
                </td>
                <td className="text-muted small">{m.email}</td>
                <td>
                  <Badge bg={roleVariant[m.org_role] || 'secondary'} className="d-inline-flex align-items-center gap-1">
                    {m.org_role === 'owner' && <Crown size={10} />}
                    {m.org_role}
                  </Badge>
                </td>
                <td>
                  <Badge bg={m.status === 'ACTIVE' ? 'success' : 'warning'} className="text-capitalize">
                    {m.status?.toLowerCase()}
                  </Badge>
                </td>
                <td className="text-end">
                  {m.org_role !== 'owner' && (
                    <Button variant="outline-danger" size="sm" onClick={() => removeMember(m.user_id)}>
                      <Trash2 size={13} />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Invite Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">Invite Team Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">Full Name *</Form.Label>
            <Form.Control placeholder="Jane Smith"
              value={invite.fullname}
              onChange={e => setInvite(p => ({ ...p, fullname: e.target.value }))} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">Email Address *</Form.Label>
            <Form.Control type="email" placeholder="jane@company.com"
              value={invite.email}
              onChange={e => setInvite(p => ({ ...p, email: e.target.value }))} />
          </Form.Group>
          <Form.Group>
            <Form.Label className="fw-semibold small">Role</Form.Label>
            <Form.Select value={invite.org_role}
              onChange={e => setInvite(p => ({ ...p, org_role: e.target.value }))}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button className="primaryBtn" size="sm" onClick={sendInvite} disabled={inviting}>
            {inviting ? <><Spinner size="sm" className="me-1" />Inviting…</> : 'Send Invite'}
          </Button>
        </Modal.Footer>
      </Modal>
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
        subTitle: 'Manage your workspace and team',
        tabs: [
          { tabTitle: 'Details',  tabKey: 'details',  tabContent: <OrgDetailsTab /> },
          { tabTitle: 'Members',  tabKey: 'members',  tabContent: <MembersTab /> },
        ],
      }}
    />
  );
}
