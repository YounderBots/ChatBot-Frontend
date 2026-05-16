import React, { useState, useEffect } from "react";
import { Mail, Smartphone, Monitor } from "lucide-react";
import APICall from "../../APICalls/APICall";

const EVENT_LABELS = {
  newConversation:       { label: "New Conversation",       desc: "When a visitor starts a new chat" },
  escalatedConversation: { label: "Escalated Conversation", desc: "When a chat is escalated to an agent" },
  lowConfidence:         { label: "Low Confidence Warning", desc: "When the bot is unsure about a response" },
  failedConversation:    { label: "Failed Conversation",    desc: "When a conversation ends without resolution" },
  negativeFeedback:      { label: "Negative Feedback",      desc: "When a visitor rates the chat poorly" },
  dailySummary:          { label: "Daily Summary",          desc: "A recap of activity sent each morning" },
  weeklyReport:          { label: "Weekly Report",          desc: "A comprehensive weekly digest" },
};

const defaultSettings = {
  enableEmail: true,  adminEmail: "", emailFrequency: "REALTIME",
  emailEvents: { newConversation:true, escalatedConversation:true, lowConfidence:false, failedConversation:true, negativeFeedback:true, dailySummary:false, weeklyReport:false },
  enablePush: false,
  pushEvents:  { newConversation:false, escalatedConversation:false, lowConfidence:false, failedConversation:false, negativeFeedback:false, dailySummary:false, weeklyReport:false },
  enableInApp: true, sound: "default",
};

const Toggle = ({ checked, onChange, disabled }) => (
  <label className="s-switch">
    <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
    <span className="s-switch-track" />
  </label>
);

const EventToggles = ({ events, onChange }) => (
  <>
    {Object.entries(EVENT_LABELS).map(([key, { label, desc }]) => (
      <div key={key} className="s-toggle-row">
        <div className="s-toggle-text">
          <h4>{label}</h4>
          <p>{desc}</p>
        </div>
        <Toggle checked={events[key]} onChange={() => onChange(key)} />
      </div>
    ))}
  </>
);

const SettingsNotifications = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved]       = useState(defaultSettings);
  const [hasChanges, setChanges]= useState(false);
  const [lastSaved, setLastSaved]= useState(null);
  const [emailError, setEmailErr]= useState("");
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => { setChanges(JSON.stringify(settings) !== JSON.stringify(saved)); }, [settings, saved]);

  useEffect(() => {
    (async () => {
      try {
        const data = await APICall.getT("/settings/notification_settings");
        const n = data.notification || {};
        const emailKeys = Array.isArray(n.notification_events) ? n.notification_events : (n.notification_events || "").split(",").filter(Boolean);
        const pushKeys  = Array.isArray(n.push_notification_events) ? n.push_notification_events : (n.push_notification_events || "").split(",").filter(Boolean);
        const base = { newConversation:false, escalatedConversation:false, lowConfidence:false, failedConversation:false, negativeFeedback:false, dailySummary:false, weeklyReport:false };
        const emailEvents = { ...base }; emailKeys.forEach(k => { if (k in emailEvents) emailEvents[k] = true; });
        const pushEvents  = { ...base }; pushKeys.forEach(k  => { if (k in pushEvents)  pushEvents[k]  = true; });
        const loaded = {
          enableEmail: n.email_notifications_enabled ?? true,
          adminEmail:  n.admin_email || "",
          emailFrequency: n.frequency || "REALTIME",
          emailEvents,
          enablePush: n.push_notifications_admin ?? false,
          pushEvents,
          enableInApp: n.in_app_notifications ?? true,
          sound: "default",
        };
        setSettings(loaded); setSaved(loaded);
      } catch (err) {
        if (!err.message?.includes("404")) setApiError(err.message);
      } finally { setLoading(false); }
    })();
  }, []);

  const set = (patch) => setSettings((s) => ({ ...s, ...patch }));
  const toggleEmail = (k) => set({ emailEvents: { ...settings.emailEvents, [k]: !settings.emailEvents[k] } });
  const togglePush  = (k) => set({ pushEvents:  { ...settings.pushEvents,  [k]: !settings.pushEvents[k]  } });

  const handleSave = async () => {
    if (emailError) return;
    setSaving(true); setApiError(null);
    try {
      await APICall.postT("/settings/notification_settings", {
        notification: {
          email_notifications: {
            email_notification: settings.enableEmail,
            admin_email: settings.adminEmail,
            notification_events: Object.entries(settings.emailEvents).filter(([,v])=>v).map(([k])=>k),
            frequency: settings.emailFrequency,
          },
          push_notifications: {
            push_notifications: settings.enablePush,
            notification_events: Object.entries(settings.pushEvents).filter(([,v])=>v).map(([k])=>k),
          },
          in_app: settings.enableInApp,
        },
      });
      setSaved(settings); setLastSaved(new Date()); setChanges(false);
    } catch (err) { setApiError(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="s-loading"><div className="s-spin" /></div>;

  return (
    <>
      {apiError && <div className="s-alert s-alert-danger">{apiError}</div>}

      {/* ── Email ──────────────────────────────────── */}
      <div className="s-section">
        <div className="s-section-head">
          <div className="s-section-icon"><Mail size={14} /></div>
          <div>
            <p className="s-section-title">Email Notifications</p>
            <p className="s-section-desc">Alerts delivered to your inbox</p>
          </div>
        </div>

        <div className="s-card">
          <div className="s-toggle-row" style={{ borderBottom: "1px solid #f3f4f6", marginBottom: 16 }}>
            <div className="s-toggle-text">
              <h4>Enable Email Notifications</h4>
              <p>Send event alerts to the admin email address</p>
            </div>
            <Toggle checked={settings.enableEmail} onChange={(e) => set({ enableEmail: e.target.checked })} />
          </div>

          <div className="s-grid-2" style={{ marginBottom: 20 }}>
            <div className="s-field">
              <label className="s-label">Admin Email</label>
              <input type="email" className={`s-input ${emailError ? "is-error" : ""}`}
                value={settings.adminEmail}
                disabled={!settings.enableEmail}
                placeholder="admin@yourcompany.com"
                onChange={(e) => {
                  const v = e.target.value;
                  set({ adminEmail: v });
                  setEmailErr(!v ? "Required" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Invalid email" : "");
                }} />
              {emailError && <span className="s-field-error">{emailError}</span>}
            </div>

            <div className="s-field">
              <label className="s-label">Send Frequency</label>
              <div className="s-pill-group" style={{ marginTop: 4 }}>
                {[
                  { v: "REALTIME", l: "Real-time" },
                  { v: "HOURLY",   l: "Hourly" },
                  { v: "DAILY",    l: "Daily digest" },
                ].map(({ v, l }) => (
                  <div key={v} className={`s-pill ${settings.emailFrequency === v ? "is-active" : ""}`}
                    onClick={() => settings.enableEmail && set({ emailFrequency: v })}>
                    {l}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="s-label" style={{ marginBottom: 8 }}>Notify me when…</p>
          <EventToggles events={settings.emailEvents} onChange={toggleEmail} />
        </div>
      </div>

      {/* ── Push ───────────────────────────────────── */}
      <div className="s-section">
        <div className="s-section-head">
          <div className="s-section-icon"><Smartphone size={14} /></div>
          <div>
            <p className="s-section-title">Push Notifications</p>
            <p className="s-section-desc">Browser & device push alerts for admins</p>
          </div>
        </div>

        <div className="s-card">
          <div className="s-toggle-row" style={{ borderBottom: "1px solid #f3f4f6", marginBottom: 16 }}>
            <div className="s-toggle-text">
              <h4>Enable Push Notifications</h4>
              <p>Requires browser permission to send notifications</p>
            </div>
            <Toggle checked={settings.enablePush} onChange={(e) => set({ enablePush: e.target.checked })} />
          </div>
          <EventToggles events={settings.pushEvents} onChange={togglePush} />
        </div>
      </div>

      {/* ── In-app ─────────────────────────────────── */}
      <div className="s-section">
        <div className="s-section-head">
          <div className="s-section-icon"><Monitor size={14} /></div>
          <div>
            <p className="s-section-title">In-App Notifications</p>
            <p className="s-section-desc">Alerts displayed inside the admin dashboard</p>
          </div>
        </div>

        <div className="s-card">
          <div className="s-toggle-row">
            <div className="s-toggle-text">
              <h4>Show In-App Alerts</h4>
              <p>Toast notifications for key events while you're logged in</p>
            </div>
            <Toggle checked={settings.enableInApp} onChange={(e) => set({ enableInApp: e.target.checked })} />
          </div>

          <div className="s-field" style={{ marginTop: 16, maxWidth: 240 }}>
            <label className="s-label">Notification Sound</label>
            <select className="s-select" value={settings.sound}
              onChange={(e) => set({ sound: e.target.value })}>
              <option value="default">Default</option>
              <option value="chime">Chime</option>
              <option value="alert">Alert</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Save bar ───────────────────────────────── */}
      {hasChanges && (
        <div className="s-save-bar">
          <span className="s-save-bar-left">
            {lastSaved ? <>Last saved {lastSaved.toLocaleTimeString()}</> : "Unsaved changes"}
          </span>
          <div className="s-save-bar-right">
            <button className="s-btn s-btn-ghost" onClick={() => { setSettings(saved); setChanges(false); }}>
              Discard
            </button>
            <button className="s-btn s-btn-primary" onClick={handleSave} disabled={saving || !!emailError}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsNotifications;
