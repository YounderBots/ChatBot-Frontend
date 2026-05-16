import { useEffect, useState, useCallback } from "react";
import { BrainCircuit, ShieldCheck, Terminal, Globe, HardDrive } from "lucide-react";
import APICall from "../../APICalls/APICall";
import { useToast } from "../../components/useToast";

const Toggle = ({ checked, onChange, disabled }) => (
  <label className="s-switch">
    <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
    <span className="s-switch-track" />
  </label>
);

const defaultSettings = {
  enableLearning: true, autoAddToTraining: false,
  autoAddConfidence: 60, reviewQueueThreshold: 40,
  dataRetentionDays: 90, enableDataExport: true,
  enableDataDeletion: true, showPrivacyLink: false,
  privacyPolicyUrl: "",
  logLevel: "INFO", enableConsoleLogs: true, enableDatabaseLogs: false,
  language: "English", dateFormat: "DD/MM/YYYY", timeFormat: "24H",
};

const SettingsAdvanced = () => {
  const { showToast, ToastContainer } = useToast();
  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved]       = useState(defaultSettings);
  const [hasChanges, setChanges]= useState(false);
  const [lastSaved, setLastSaved]= useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [apiError, setApiError] = useState(null);
  const [retentionErr, setRetErr]= useState("");
  const [importFile, setImportFile]= useState(null);
  const [showReset, setShowReset]  = useState(false);

  useEffect(() => { setChanges(JSON.stringify(settings) !== JSON.stringify(saved)); }, [settings, saved]);

  useEffect(() => {
    (async () => {
      try {
        const data = await APICall.getT("/settings/advanced_settings");
        const t = data.training_learning || {};
        const p = data.data_privacy || {};
        const l = data.logging || {};
        const s = data.system || {};
        const loaded = {
          enableLearning:        t.enable_continuous_learning ?? defaultSettings.enableLearning,
          autoAddToTraining:     t.auto_add_to_training       ?? defaultSettings.autoAddToTraining,
          autoAddConfidence:     t.auto_add_confidence        ?? defaultSettings.autoAddConfidence,
          reviewQueueThreshold:  t.review_queue_threshold     ?? defaultSettings.reviewQueueThreshold,
          dataRetentionDays:     p.data_retention_days        ?? defaultSettings.dataRetentionDays,
          enableDataExport:      p.enable_data_export         ?? defaultSettings.enableDataExport,
          enableDataDeletion:    p.enable_data_deletion       ?? defaultSettings.enableDataDeletion,
          showPrivacyLink:       p.show_privacy_policy_link   ?? defaultSettings.showPrivacyLink,
          privacyPolicyUrl:      p.privacy_policy_url         || defaultSettings.privacyPolicyUrl,
          logLevel:              l.log_level                  || defaultSettings.logLevel,
          enableConsoleLogs:     l.enable_console_logs        ?? defaultSettings.enableConsoleLogs,
          enableDatabaseLogs:    l.enable_database_logs       ?? defaultSettings.enableDatabaseLogs,
          language:              s.language                   || defaultSettings.language,
          dateFormat:            s.date_format                || defaultSettings.dateFormat,
          timeFormat:            s.time_format                || defaultSettings.timeFormat,
        };
        setSettings(loaded); setSaved(loaded);
        document.documentElement.lang = { English: "en", Spanish: "es", French: "fr" }[loaded.language] || "en";
      } catch (err) {
        if (!err.message?.includes("404")) setApiError(err.message);
      } finally { setLoading(false); }
    })();
  }, []);

  const set = (patch) => setSettings((s) => ({ ...s, ...patch }));

  const handleSave = async () => {
    if (retentionErr) return;
    setSaving(true); setApiError(null);
    try {
      await APICall.postT("/settings/advanced_settings", {
        training_learning: { enable_continuous_learning: settings.enableLearning, auto_add_to_training: settings.autoAddToTraining, review_queue_threshold: settings.reviewQueueThreshold },
        data_privacy: { data_retention_days: Number(settings.dataRetentionDays), enable_data_export: settings.enableDataExport, enable_data_deletion: settings.enableDataDeletion, show_privacy_policy_link: settings.showPrivacyLink, privacy_policy_url: settings.privacyPolicyUrl },
        logging: { log_level: settings.logLevel, enable_console_logs: settings.enableConsoleLogs, enable_database_logs: settings.enableDatabaseLogs },
        system: { language: settings.language, date_format: settings.dateFormat, time_format: settings.timeFormat },
      });
      document.documentElement.lang = { English: "en", Spanish: "es", French: "fr" }[settings.language] || "en";
      setSaved(settings); setLastSaved(new Date()); setChanges(false);
    } catch (err) { setApiError(err.message); }
    finally { setSaving(false); }
  };

  const exportSettings = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" }));
    a.download = "settings-backup.json"; a.click();
  };

  const importSettings = () => {
    if (!importFile) return;
    const r = new FileReader();
    r.onload = (e) => {
      try { setSettings(JSON.parse(e.target.result)); showToast("Settings imported.", "success"); }
      catch { showToast("Invalid JSON file.", "danger"); }
    };
    r.readAsText(importFile);
  };

  if (loading) return <div className="s-loading"><div className="s-spin" /></div>;

  return (
    <>
      <ToastContainer />
      {apiError && <div className="s-alert s-alert-danger">{apiError}</div>}

      {/* ── Training ────────────────────────────────── */}
      <div className="s-section">
        <div className="s-section-head">
          <div className="s-section-icon"><BrainCircuit size={14} /></div>
          <div>
            <p className="s-section-title">Training & Learning</p>
            <p className="s-section-desc">Control how the bot improves over time</p>
          </div>
        </div>

        <div className="s-card">
          <div className="s-toggle-row">
            <div className="s-toggle-text">
              <h4>Continuous Learning</h4>
              <p>Automatically learn from resolved conversations</p>
            </div>
            <Toggle checked={settings.enableLearning} onChange={(e) => set({ enableLearning: e.target.checked })} />
          </div>

          <div className="s-toggle-row">
            <div className="s-toggle-text">
              <h4>Auto-add to Training</h4>
              <p>Automatically add high-confidence interactions to training data</p>
            </div>
            <Toggle checked={settings.autoAddToTraining} onChange={(e) => set({ autoAddToTraining: e.target.checked })} />
          </div>

          {settings.autoAddToTraining && (
            <div style={{ padding: "12px 0 4px" }}>
              <div className="s-range-wrap">
                <div className="s-range-top">
                  <label className="s-label">Auto-add Confidence Threshold</label>
                  <span className="s-range-val">{settings.autoAddConfidence}%</span>
                </div>
                <input type="range" className="s-range" min={0} max={100}
                  value={settings.autoAddConfidence}
                  onChange={(e) => set({ autoAddConfidence: Number(e.target.value) })} />
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--s-text-3)", marginTop:2 }}>
                  <span>0%</span><span>100%</span>
                </div>
              </div>
            </div>
          )}

          <div style={{ padding: "12px 0 4px" }}>
            <div className="s-range-wrap">
              <div className="s-range-top">
                <label className="s-label">Review Queue Threshold</label>
                <span className="s-range-val">{settings.reviewQueueThreshold}%</span>
              </div>
              <input type="range" className="s-range" min={0} max={100}
                value={settings.reviewQueueThreshold}
                onChange={(e) => set({ reviewQueueThreshold: Number(e.target.value) })} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Data & Privacy ──────────────────────────── */}
      <div className="s-section">
        <div className="s-section-head">
          <div className="s-section-icon"><ShieldCheck size={14} /></div>
          <div>
            <p className="s-section-title">Data & Privacy</p>
            <p className="s-section-desc">GDPR compliance and data retention settings</p>
          </div>
        </div>

        <div className="s-card">
          <div className="s-grid-2" style={{ marginBottom: 16 }}>
            <div className="s-field">
              <label className="s-label">Data Retention <span className="s-hint">(days)</span></label>
              <input type="number" className={`s-input ${retentionErr ? "is-error" : ""}`}
                value={settings.dataRetentionDays}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  set({ dataRetentionDays: e.target.value });
                  setRetErr(n < 30 ? "Min 30 days" : n > 365 ? "Max 365 days" : "");
                }} />
              {retentionErr && <span className="s-field-error">{retentionErr}</span>}
            </div>
          </div>

          {[
            { key: "enableDataExport",   label: "Enable Data Export (GDPR)",      desc: "Allow visitors to download their conversation data" },
            { key: "enableDataDeletion", label: "Enable Data Deletion (GDPR)",    desc: "Allow visitors to request deletion of their data" },
            { key: "showPrivacyLink",    label: "Show Privacy Policy Link",       desc: "Display a link in the chat widget" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="s-toggle-row">
              <div className="s-toggle-text"><h4>{label}</h4><p>{desc}</p></div>
              <Toggle checked={settings[key]} onChange={(e) => set({ [key]: e.target.checked })} />
            </div>
          ))}

          {settings.showPrivacyLink && (
            <div className="s-field" style={{ marginTop: 12 }}>
              <label className="s-label">Privacy Policy URL</label>
              <input type="text" className="s-input" value={settings.privacyPolicyUrl}
                placeholder="https://yourcompany.com/privacy"
                onChange={(e) => set({ privacyPolicyUrl: e.target.value })} />
            </div>
          )}
        </div>
      </div>

      {/* ── Logging ─────────────────────────────────── */}
      <div className="s-section">
        <div className="s-section-head">
          <div className="s-section-icon"><Terminal size={14} /></div>
          <div>
            <p className="s-section-title">Logging</p>
            <p className="s-section-desc">Verbosity and output targets for system logs</p>
          </div>
        </div>

        <div className="s-card">
          <div className="s-field" style={{ maxWidth: 240, marginBottom: 16 }}>
            <label className="s-label">Log Level</label>
            <select className="s-select" value={settings.logLevel}
              onChange={(e) => set({ logLevel: e.target.value })}>
              {["DEBUG","INFO","WARNING","ERROR"].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>

          <div className="s-toggle-row">
            <div className="s-toggle-text"><h4>Console Logs</h4><p>Output logs to the server console</p></div>
            <Toggle checked={settings.enableConsoleLogs} onChange={(e) => set({ enableConsoleLogs: e.target.checked })} />
          </div>
          <div className="s-toggle-row">
            <div className="s-toggle-text"><h4>Database Logs</h4><p>Persist logs to the database for auditing</p></div>
            <Toggle checked={settings.enableDatabaseLogs} onChange={(e) => set({ enableDatabaseLogs: e.target.checked })} />
          </div>
        </div>
      </div>

      {/* ── System ──────────────────────────────────── */}
      <div className="s-section">
        <div className="s-section-head">
          <div className="s-section-icon"><Globe size={14} /></div>
          <div>
            <p className="s-section-title">System</p>
            <p className="s-section-desc">Language, date format and time display</p>
          </div>
        </div>

        <div className="s-card">
          <div className="s-grid-3">
            <div className="s-field">
              <label className="s-label">Language</label>
              <select className="s-select" value={settings.language}
                onChange={(e) => set({ language: e.target.value })}>
                {["English","Spanish","French","Arabic","German","Hindi","Portuguese"].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="s-field">
              <label className="s-label">Date Format</label>
              <select className="s-select" value={settings.dateFormat}
                onChange={(e) => set({ dateFormat: e.target.value })}>
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
            <div className="s-field">
              <label className="s-label">Time Format</label>
              <div className="s-pill-group" style={{ marginTop: 4 }}>
                {[{ v: "24H", l: "24-hour" }, { v: "12H", l: "12-hour" }].map(({ v, l }) => (
                  <div key={v} className={`s-pill ${settings.timeFormat === v ? "is-active" : ""}`}
                    onClick={() => set({ timeFormat: v })}>{l}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Backup ──────────────────────────────────── */}
      <div className="s-section">
        <div className="s-section-head">
          <div className="s-section-icon"><HardDrive size={14} /></div>
          <div>
            <p className="s-section-title">Backup & Restore</p>
            <p className="s-section-desc">Export or import your settings as JSON</p>
          </div>
        </div>

        <div className="s-card">
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center", marginBottom:16 }}>
            <button className="s-btn s-btn-ghost" onClick={exportSettings}>Export settings</button>
            <input type="file" accept="application/json" style={{ fontSize:13, fontFamily:"var(--s-font)" }}
              onChange={(e) => setImportFile(e.target.files[0])} />
            <button className="s-btn s-btn-ghost" onClick={importSettings} disabled={!importFile}>Import</button>
          </div>

          <button className="s-btn s-btn-danger s-btn-sm" onClick={() => setShowReset(true)}>
            Reset to defaults
          </button>
        </div>
      </div>

      {/* ── Reset modal ─────────────────────────────── */}
      {showReset && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
          <div style={{ background:"#fff", borderRadius:12, padding:28, maxWidth:380, width:"90%", boxShadow:"0 20px 60px rgba(0,0,0,.2)" }}>
            <h3 style={{ fontFamily:"var(--s-font)", fontWeight:600, fontSize:16, marginBottom:8 }}>Reset to defaults?</h3>
            <p style={{ fontFamily:"var(--s-font)", color:"var(--s-text-2)", fontSize:13.5, lineHeight:1.5 }}>
              This will reset all advanced settings to their default values. This action cannot be undone.
            </p>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:20 }}>
              <button className="s-btn s-btn-ghost" onClick={() => setShowReset(false)}>Cancel</button>
              <button className="s-btn s-btn-danger"
                onClick={() => { setSettings({ ...defaultSettings }); setShowReset(false); }}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Save bar ────────────────────────────────── */}
      {hasChanges && (
        <div className="s-save-bar">
          <span className="s-save-bar-left">
            {lastSaved ? <>Last saved {lastSaved.toLocaleTimeString()}</> : "Unsaved changes"}
          </span>
          <div className="s-save-bar-right">
            <button className="s-btn s-btn-ghost" onClick={() => { setSettings(saved); setChanges(false); }}>
              Discard
            </button>
            <button className="s-btn s-btn-primary" onClick={handleSave} disabled={saving || !!retentionErr}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsAdvanced;
