import React, { useState, useRef, useEffect } from "react";
import { User, Clock, Bot } from "lucide-react";
import Select from "react-select";
import APICall from "../../APICalls/APICall";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const defaultForm = {
  botName: "Aria",
  welcomeMessage: "Hi there! I'm Aria, your virtual assistant. How can I help you today?",
  fallbackMessage: "I'm sorry, I didn't quite understand that. Could you rephrase or choose from the options below?",
  offlineMessage: "We're currently offline. Our team is available Mon–Fri 9 AM–6 PM IST. Leave a message and we'll get back to you!",
  timezone: "Asia/Kolkata",
  outsideBehavior: "offline",
  businessHours: DAYS.map((day) => ({
    day,
    enabled: day !== "Saturday" && day !== "Sunday",
    start: "09:00",
    end: "18:00",
  })),
};

const TZ_OPTIONS = [
  { value: "Asia/Kolkata",    label: "Asia / Kolkata (IST)" },
  { value: "UTC",             label: "UTC" },
  { value: "America/New_York",label: "America / New York (EST)" },
  { value: "Europe/London",   label: "Europe / London (GMT)" },
  { value: "Asia/Dubai",      label: "Asia / Dubai (GST)" },
  { value: "Asia/Singapore",  label: "Asia / Singapore (SGT)" },
];

const selectStyles = {
  control: (b, s) => ({
    ...b,
    fontFamily: "var(--s-font,'Outfit',sans-serif)",
    fontSize: 13.5,
    borderRadius: 7,
    borderColor: s.isFocused ? "#e8710a" : "#e2e4e8",
    boxShadow: s.isFocused ? "0 0 0 3px rgba(232,113,10,.12)" : "none",
    background: s.isFocused ? "#fff" : "#fafafa",
    borderWidth: 1.5,
    minHeight: 36,
    "&:hover": { borderColor: "#e8710a" },
  }),
  option: (b, s) => ({
    ...b,
    fontFamily: "var(--s-font,'Outfit',sans-serif)",
    fontSize: 13,
    background: s.isSelected ? "#e8710a" : s.isFocused ? "rgba(232,113,10,.08)" : "#fff",
    color: s.isSelected ? "#fff" : "#111318",
  }),
  singleValue: (b) => ({ ...b, fontFamily: "var(--s-font,'Outfit',sans-serif)", color: "#111318" }),
  menu: (b) => ({ ...b, borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,.12)" }),
};

const SettingsGeneral = () => {
  const fileRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile]       = useState(null);
  const [botNameError, setBotNameError]   = useState("");
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [loadError, setLoadError]         = useState(null);
  const [formData, setFormData]           = useState(defaultForm);
  const [savedData, setSavedData]         = useState(defaultForm);
  const [lastSaved, setLastSaved]         = useState(null);
  const [hasChanges, setHasChanges]       = useState(false);

  /* ── Load ── */
  useEffect(() => {
    (async () => {
      try {
        const data = await APICall.getT("/settings/general_settings");
        const g = data.general || {};
        const bh = data.business_hours || {};
        const hours = bh.hours || [];
        const businessHours = DAYS.map((day) => {
          const m = hours.find((h) => h.day?.toLowerCase() === day.toLowerCase());
          return m
            ? { day, enabled: true, start: m.start_time, end: m.end_time }
            : { day, enabled: false, start: "09:00", end: "18:00" };
        });
        const loaded = {
          botName:         g.bot_name         || "",
          welcomeMessage:  g.welcome_message  || "",
          fallbackMessage: g.fallback_message || "",
          offlineMessage:  g.offline_message  || "",
          outsideBehavior: g.outside_business_hour || "offline",
          timezone:        bh.timezone || "Asia/Kolkata",
          businessHours,
        };
        setFormData(loaded);
        setSavedData(loaded);
      } catch (err) {
        if (!err.message?.includes("404")) setLoadError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setHasChanges(JSON.stringify(formData) !== JSON.stringify(savedData));
  }, [formData, savedData]);

  /* ── Handlers ── */
  const set = (patch) => setFormData((f) => ({ ...f, ...patch }));

  const updateHour = (i, key, val) => {
    const bh = [...formData.businessHours];
    bh[i] = { ...bh[i], [key]: val };
    set({ businessHours: bh });
  };

  const copyFirst = () => {
    const src = formData.businessHours[0];
    set({ businessHours: formData.businessHours.map((d) => ({ ...d, enabled: src.enabled, start: src.start, end: src.end })) });
  };

  const handleAvatar = (e) => {
    const f = e.target.files[0];
    if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); }
  };

  const handleSave = async () => {
    if (botNameError) return;
    setSaving(true);
    try {
      let avatarUrl = formData.botAvatar || null;
      if (avatarFile) {
        const fd = new FormData();
        fd.append("file", avatarFile);
        const r = await APICall.postfileT("/settings/upload_avatar", fd);
        avatarUrl = r.url || r.path || avatarUrl;
        setAvatarFile(null);
      }
      await APICall.postT("/settings/general_settings", {
        bot_configuration: {
          bot_name:              formData.botName,
          bot_avatar:            avatarUrl,
          welcome_message:       formData.welcomeMessage,
          fallback_message:      formData.fallbackMessage,
          offline_message:       formData.offlineMessage,
          outside_business_hour: formData.outsideBehavior,
        },
        business_hours: {
          timezone: formData.timezone,
          hours: formData.businessHours
            .filter((h) => h.enabled)
            .map((h) => ({ day: h.day, start_time: h.start, end_time: h.end })),
        },
      });
      setSavedData({ ...formData, botAvatar: avatarUrl });
      setLastSaved(new Date());
      setHasChanges(false);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="s-loading"><div className="s-spin" /></div>;
  if (loadError) return <div className="s-alert s-alert-danger">{loadError}</div>;

  return (
    <>
      {/* ── Bot identity ───────────────────────────── */}
      <div className="s-section">
        <div className="s-section-head">
          <div className="s-section-icon"><Bot size={14} /></div>
          <div>
            <p className="s-section-title">Bot Identity</p>
            <p className="s-section-desc">Name, avatar and conversation messages</p>
          </div>
        </div>

        <div className="s-card">
          <div className="s-grid-2" style={{ marginBottom: 20 }}>
            {/* Bot name */}
            <div className="s-field">
              <label className="s-label">Bot Name</label>
              <input
                className={`s-input ${botNameError ? "is-error" : ""}`}
                value={formData.botName}
                placeholder="e.g. Aria"
                onChange={(e) => {
                  const v = e.target.value;
                  setBotNameError(v.length > 50 ? "Max 50 characters" : "");
                  if (v.length <= 50) set({ botName: v });
                }}
              />
              {botNameError && <span className="s-field-error">{botNameError}</span>}
            </div>

            {/* Avatar */}
            <div className="s-field">
              <label className="s-label">Avatar</label>
              <div className="s-avatar-wrap">
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" className="s-avatar-img" />
                  : <div className="s-avatar-empty"><User size={22} /></div>
                }
                <div className="s-avatar-btns">
                  <button className="s-btn s-btn-ghost s-btn-sm" onClick={() => fileRef.current?.click()}>
                    Upload photo
                  </button>
                  {avatarPreview && (
                    <button className="s-btn s-btn-danger s-btn-sm"
                      onClick={() => { setAvatarPreview(null); setAvatarFile(null); if (fileRef.current) fileRef.current.value = ""; }}>
                      Remove
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatar} />
              </div>
            </div>
          </div>

          <div className="s-grid-3">
            <div className="s-field">
              <label className="s-label">Welcome Message</label>
              <textarea className="s-textarea" rows={3} maxLength={500} value={formData.welcomeMessage}
                placeholder="Hi! How can I help you today?"
                onChange={(e) => set({ welcomeMessage: e.target.value })} />
            </div>
            <div className="s-field">
              <label className="s-label">Fallback Message</label>
              <textarea className="s-textarea" rows={3} maxLength={300} value={formData.fallbackMessage}
                placeholder="Sorry, I didn't understand that."
                onChange={(e) => set({ fallbackMessage: e.target.value })} />
            </div>
            <div className="s-field">
              <label className="s-label">Offline Message</label>
              <textarea className="s-textarea" rows={3} maxLength={300} value={formData.offlineMessage}
                placeholder="We're offline right now. Leave a message!"
                onChange={(e) => set({ offlineMessage: e.target.value })} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Business hours ─────────────────────────── */}
      <div className="s-section">
        <div className="s-section-head">
          <div className="s-section-icon"><Clock size={14} /></div>
          <div>
            <p className="s-section-title">Business Hours</p>
            <p className="s-section-desc">When your team is available to respond</p>
          </div>
        </div>

        <div className="s-card">
          <div style={{ marginBottom: 16, maxWidth: 320 }}>
            <label className="s-label" style={{ marginBottom: 6, display: "block" }}>Timezone</label>
            <Select
              options={TZ_OPTIONS}
              styles={selectStyles}
              isSearchable
              value={TZ_OPTIONS.find((o) => o.value === formData.timezone)}
              onChange={(s) => set({ timezone: s.value })}
            />
          </div>

          {formData.businessHours.map((item, i) => (
            <div key={item.day} className="s-biz-grid">
              <label className="s-biz-day">
                <input type="checkbox" checked={item.enabled}
                  onChange={(e) => updateHour(i, "enabled", e.target.checked)} />
                {item.day}
              </label>
              <input type="time" className="s-biz-time" disabled={!item.enabled}
                value={item.start} onChange={(e) => updateHour(i, "start", e.target.value)} />
              <input type="time" className="s-biz-time" disabled={!item.enabled}
                value={item.end} onChange={(e) => updateHour(i, "end", e.target.value)} />
              <button className="s-btn s-btn-ghost s-btn-sm"
                style={{ fontSize: 11 }} onClick={() => copyFirst()}>
                Copy to all
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Outside hours ──────────────────────────── */}
      <div className="s-section">
        <div className="s-section-head">
          <div className="s-section-icon"><Clock size={14} /></div>
          <div>
            <p className="s-section-title">Outside Business Hours</p>
            <p className="s-section-desc">How the bot behaves after hours</p>
          </div>
        </div>

        <div className="s-card">
          <div className="s-option-group">
            {[
              { value: "offline",  label: "Show Offline Message", desc: "Display the offline message and pause the bot" },
              { value: "bot",      label: "Continue with Bot",    desc: "Keep the bot active around the clock" },
              { value: "contact",  label: "Show Contact Form",    desc: "Offer visitors a form to leave their details" },
            ].map(({ value, label, desc }) => (
              <label key={value} className="s-option" style={{ alignItems: "flex-start", padding: "8px 0" }}>
                <input type="radio" name="outside" style={{ marginTop: 2 }}
                  checked={formData.outsideBehavior === value}
                  onChange={() => set({ outsideBehavior: value })} />
                <div>
                  <div style={{ fontWeight: 500 }}>{label}</div>
                  <div style={{ fontSize: 12, color: "var(--s-text-2)", marginTop: 1 }}>{desc}</div>
                </div>
              </label>
            ))}
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
            <button className="s-btn s-btn-ghost" onClick={() => { setFormData(savedData); setHasChanges(false); }}>
              Discard
            </button>
            <button className="s-btn s-btn-primary" onClick={handleSave} disabled={saving || !!botNameError}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsGeneral;
