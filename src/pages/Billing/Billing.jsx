import { Check, ExternalLink, Receipt, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Alert, Badge, Button, Card, Col, ProgressBar, Row, Spinner, Table,
} from 'react-bootstrap';
import APICall from '../../APICalls/APICall';
import TabComponent from '../../components/TabComponent';

/* ── helpers ── */
const usd = (cents) => `$${(cents / 100).toFixed(0)}`;
const fmt  = (n)    => (n === -1 ? '∞' : n?.toLocaleString() ?? '—');
const pct  = (used, limit) => (limit === -1 || limit === 0 ? 5 : Math.min(100, Math.round((used / limit) * 100)));

/* ══════════════════════════════════════
   TAB 1 — Current Plan + Usage
══════════════════════════════════════ */
function OverviewTab() {
  const [sub,     setSub]     = useState(null);
  const [plan,    setPlan]    = useState(null);
  const [usage,   setUsage]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert,   setAlert]   = useState(null);
  const [acting,  setActing]  = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success'))  setAlert({ variant: 'success', msg: 'Subscription activated! Your new plan is live.' });
    if (params.get('canceled')) setAlert({ variant: 'warning', msg: 'Checkout canceled. Your plan was not changed.' });
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await APICall.getT(`/billing/subscription`);
      setSub(data.subscription);
      setPlan(data.plan);
      setUsage(data.usage_this_month);
    } catch (e) {
      setAlert({ variant: 'danger', msg: e.message });
    } finally {
      setLoading(false);
    }
  };

  const cancel = async () => {
    if (!window.confirm('Cancel at end of billing period?')) return;
    setActing('cancel');
    try {
      await APICall.postT(`/billing/cancel`, {});
      setAlert({ variant: 'info', msg: 'Subscription will cancel at period end.' });
      fetchData();
    } catch (e) {
      setAlert({ variant: 'danger', msg: e.message });
    } finally {
      setActing('');
    }
  };

  const reactivate = async () => {
    setActing('reactivate');
    try {
      await APICall.postT(`/billing/reactivate`, {});
      setAlert({ variant: 'success', msg: 'Subscription reactivated!' });
      fetchData();
    } catch (e) {
      setAlert({ variant: 'danger', msg: e.message });
    } finally {
      setActing('');
    }
  };

  if (loading) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" variant="primary" /></div>;

  const usageBars = plan ? [
    { label: 'Conversations',  used: usage?.conversations ?? 0, limit: plan.max_conversations_month },
    { label: 'Messages',       used: usage?.messages ?? 0,      limit: plan.max_conversations_month === -1 ? -1 : plan.max_conversations_month * 5 },
    { label: 'API Calls',      used: usage?.api_calls ?? 0,     limit: plan.allow_api_access ? (plan.max_conversations_month === -1 ? -1 : plan.max_conversations_month * 10) : 0 },
  ] : [];

  return (
    <div className="p-3">
      {alert && <Alert variant={alert.variant} dismissible onClose={() => setAlert(null)}>{alert.msg}</Alert>}

      {/* Plan banner — plain div avoids the global .card background !important override */}
      {plan && (
        <div className="rounded-4 mb-4 p-4 text-white"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-3 p-2" style={{ background: 'rgba(255,255,255,.2)' }}>
                <Zap size={22} />
              </div>
              <div>
                <h5 className="mb-0 fw-bold">{plan.display_name} Plan</h5>
                <small className="opacity-75">
                  {sub?.cancel_at_period_end
                    ? `Cancels ${sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : 'soon'}`
                    : sub?.current_period_end
                      ? `Renews ${new Date(sub.current_period_end).toLocaleDateString()}`
                      : 'Active'}
                </small>
              </div>
            </div>
            <div className="d-flex gap-2">
              {sub?.cancel_at_period_end ? (
                <Button variant="light" size="sm" onClick={reactivate} disabled={acting === 'reactivate'}>
                  {acting === 'reactivate' ? <Spinner size="sm" /> : 'Reactivate'}
                </Button>
              ) : plan.name !== 'free' && (
                <Button variant="outline-light" size="sm" onClick={cancel} disabled={acting === 'cancel'}>
                  {acting === 'cancel' ? <Spinner size="sm" /> : 'Cancel Subscription'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Usage */}
      {usageBars.length > 0 && (
        <Card className="border-0 rounded-4 shadow-sm mb-4">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-primary" />
              <h6 className="mb-0 fw-bold">This Month's Usage</h6>
            </div>
            {usageBars.map(({ label, used, limit }) => {
              const p     = pct(used, limit);
              const color = p > 90 ? 'danger' : p > 70 ? 'warning' : 'primary';
              return (
                <div key={label} className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="fw-semibold">{label}</span>
                    <span className="text-muted">{used.toLocaleString()} / {fmt(limit)}</span>
                  </div>
                  <ProgressBar now={p} variant={color} style={{ height: 6 }} />
                </div>
              );
            })}
          </Card.Body>
        </Card>
      )}

      {/* Plan limits summary */}
      {plan && (
        <Card className="border-0 rounded-4 shadow-sm">
          <Card.Body className="p-4">
            <h6 className="fw-bold mb-3">Plan Limits</h6>
            <Row className="g-3 text-center">
              {[
                { label: 'Conversations/mo', value: fmt(plan.max_conversations_month) },
                { label: 'Agents',           value: fmt(plan.max_agents) },
                { label: 'Intents',          value: fmt(plan.max_intents) },
                { label: 'Channels',         value: fmt(plan.max_channels) },
              ].map(({ label, value }) => (
                <Col xs={6} md={3} key={label}>
                  <div className="p-3 rounded-3" style={{ background: '#f8f9ff' }}>
                    <div className="fs-4 fw-bold text-primary">{value}</div>
                    <div className="small text-muted">{label}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   TAB 2 — Upgrade Plans
══════════════════════════════════════ */
function PlansTab() {
  const [plans,    setPlans]    = useState([]);
  const [current,  setCurrent]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [upgrading,setUpgrading]= useState(null);
  const [alert,    setAlert]    = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [plansData, subData] = await Promise.all([
          APICall.getWT(`/billing/plans`),
          APICall.getT(`/billing/subscription`),
        ]);
        setPlans((plansData.plans || []).filter(p => p.name !== 'free'));
        setCurrent(subData.plan?.name);
      } catch (e) {
        setAlert({ variant: 'danger', msg: e.message });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const upgrade = async (planId, cycle = 'monthly') => {
    setUpgrading(planId);
    setAlert(null);
    try {
      const data = await APICall.postT(`/billing/checkout`, {
        plan_id:       planId,
        billing_cycle: cycle,
        success_url:   `${window.location.origin}/admin/Billing?success=1`,
        cancel_url:    `${window.location.origin}/admin/Billing?canceled=1`,
      });
      if (data.checkout_url) {
        const parsed = new URL(data.checkout_url);
        if (!["https:", "http:"].includes(parsed.protocol)) {
          throw new Error("Invalid checkout URL returned from server");
        }
        window.location.href = data.checkout_url;
      } else {
        setAlert({ variant: 'danger', msg: data.detail || 'Stripe not configured. Set STRIPE_SECRET_KEY.' });
      }
    } catch (e) {
      setAlert({ variant: 'danger', msg: e.message });
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="p-3">
      {alert && <Alert variant={alert.variant} dismissible onClose={() => setAlert(null)}>{alert.msg}</Alert>}

      <Row className="g-5 justify-content-center py-3">
        {plans.map(p => {
          const isCurrent = p.name === current;
          const isPopular = p.name === 'pro';
          return (
            <Col md={plans.length === 2 ? 5 : 4} key={p.id}>
              <Card className={`h-100 border-2 rounded-4 ${isCurrent ? 'border-primary' : isPopular ? 'border-primary border-opacity-25' : ''}`}
                style={{ boxShadow: isPopular ? '0 4px 20px rgba(99,102,241,.15)' : undefined }}>
                {isPopular && (
                  <div className="text-center" style={{ marginTop: -13 }}>
                    <Badge bg="primary" className="px-3 py-1">MOST POPULAR</Badge>
                  </div>
                )}
                <Card.Body className="p-4 d-flex flex-column">
                  <div className="mb-1 fw-bold">{p.display_name}</div>
                  <div className="mb-3">
                    <span className="fs-2 fw-bold">{usd(p.price_monthly_usd)}</span>
                    <span className="text-muted small">/mo</span>
                    {p.price_yearly_usd > 0 && (
                      <div className="small text-success">{usd(p.price_yearly_usd)}/yr (save 20%)</div>
                    )}
                  </div>

                  <ul className="list-unstyled flex-grow-1 mb-4">
                    {[
                      `${fmt(p.max_conversations_month)} conversations/mo`,
                      `${fmt(p.max_agents)} agents`,
                      `${fmt(p.max_intents)} intents`,
                      `${fmt(p.max_channels)} channels`,
                      p.allow_custom_branding && 'Custom branding',
                      p.allow_api_access      && 'API access',
                      p.allow_sso             && 'SSO / SAML',
                    ].filter(Boolean).map(f => (
                      <li key={f} className="d-flex align-items-center gap-2 mb-2 small">
                        <Check size={14} className="text-success flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={isCurrent ? 'outline-secondary' : undefined}
                    className={`w-100${isCurrent ? '' : ' primaryBtn'}`}
                    disabled={isCurrent || upgrading === p.id}
                    onClick={() => upgrade(p.id)}
                  >
                    {upgrading === p.id
                      ? <><Spinner size="sm" className="me-2" />Redirecting…</>
                      : isCurrent ? 'Current Plan'
                        : p.price_monthly_usd === 0 ? 'Downgrade to Free'
                          : 'Upgrade'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}

/* ══════════════════════════════════════
   TAB 3 — Payment History
══════════════════════════════════════ */
function InvoicesTab() {
  const [invoices, setInvoices] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await APICall.getT(`/billing/invoices`);
        setInvoices(data.invoices || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="p-3">
      {invoices.length === 0 ? (
        <div className="text-center text-muted py-5">
          <Receipt size={40} className="mb-2 text-muted" />
          <div>No invoices yet. Payments will appear here after your first billing cycle.</div>
        </div>
      ) : (
        <Table hover responsive className="align-middle">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Period</th>
              <th className="text-end">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td className="small">{new Date(inv.created_at).toLocaleDateString()}</td>
                <td className="fw-semibold">
                  ${(inv.amount_cents / 100).toFixed(2)} {inv.currency?.toUpperCase()}
                </td>
                <td>
                  <Badge bg={inv.status === 'paid' ? 'success' : 'danger'}>
                    {inv.status?.toUpperCase()}
                  </Badge>
                </td>
                <td className="small text-muted">
                  {inv.period_start && inv.period_end
                    ? `${new Date(inv.period_start).toLocaleDateString()} – ${new Date(inv.period_end).toLocaleDateString()}`
                    : '—'}
                </td>
                <td className="text-end">
                  {inv.invoice_pdf_url
                    ? <a href={inv.invoice_pdf_url} target="_blank" rel="noreferrer" className="text-primary small">
                        <ExternalLink size={14} className="me-1" />PDF
                      </a>
                    : <span className="text-muted small">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */
export default function Billing() {
  return (
    <TabComponent
      pageContent={{
        title:    'Billing',
        subTitle: 'Manage subscription, usage, and invoices',
        tabs: [
          { tabTitle: 'Overview',  tabKey: 'overview',  tabContent: <OverviewTab /> },
          { tabTitle: 'Plans',     tabKey: 'plans',     tabContent: <PlansTab /> },
          { tabTitle: 'Invoices',  tabKey: 'invoices',  tabContent: <InvoicesTab /> },
        ],
      }}
    />
  );
}
