// crudkit.jsx — shared CRUD building blocks for the platform-management pages.
// Class-driven (see ManagementLayout.css) so pages declare fields, not styling.

export function Alert({ type, msg, onClose }) {
    if (!msg) return null;
    return (
        <div className={`mg-alert ${type === "success" ? "ok" : "error"}`}>
            <span>{msg}</span>
            <button className="mg-alert-x" onClick={onClose} aria-label="Dismiss">×</button>
        </div>
    );
}

// Page header: title/subtitle on the left, optional "+ Add" button on the right.
export function PageHeader({ title, subtitle, addLabel, onAdd }) {
    return (
        <div className="mg-page-head">
            <div>
                {title && <h1 className="mg-h1">{title}</h1>}
                {subtitle && <p className="mg-sub">{subtitle}</p>}
            </div>
            {onAdd && (
                <div className="mg-head-actions">
                    <button className="mg-btn mg-btn-primary" onClick={onAdd}>{addLabel || "+ Add"}</button>
                </div>
            )}
        </div>
    );
}

// Modal shell: title, optional error banner, field children, Cancel/Save footer.
export function Modal({ title, onClose, onSave, saving, error, saveLabel, children }) {
    return (
        <div className="mg-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="mg-modal">
                <div className="mg-modal-head">
                    <h3 className="mg-modal-title">{title}</h3>
                    <button className="mg-modal-close" onClick={onClose} aria-label="Close">×</button>
                </div>
                <div className="mg-modal-body">
                    {error && <div className="mg-form-error">{error}</div>}
                    {children}
                </div>
                <div className="mg-modal-foot">
                    <button className="mg-btn mg-btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
                    <button className="mg-btn mg-btn-primary" onClick={onSave} disabled={saving}>{saving ? "Saving…" : (saveLabel || "Save")}</button>
                </div>
            </div>
        </div>
    );
}

export function TextField({ label, value, onChange, placeholder, type = "text" }) {
    return (
        <>
            <label className="mg-form-label">{label}</label>
            <input className="mg-input" type={type} value={value ?? ""} placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)} />
        </>
    );
}

export function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
    return (
        <>
            <label className="mg-form-label">{label}</label>
            <textarea className="mg-textarea" rows={rows} value={value ?? ""} placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)} />
        </>
    );
}

export function SelectField({ label, value, onChange, options }) {
    return (
        <>
            <label className="mg-form-label">{label}</label>
            <select className="mg-select" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
                {options.map((o) => {
                    const val = typeof o === "object" ? o.value : o;
                    const lbl = typeof o === "object" ? o.label : o;
                    return <option key={String(val)} value={val}>{lbl}</option>;
                })}
            </select>
        </>
    );
}

export function CheckboxField({ label, checked, onChange }) {
    return (
        <label className="mg-check">
            <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
            {label}
        </label>
    );
}

// Edit + Delete buttons for an Actions cell. `onDelete` runs after a confirm().
export function RowActions({ onEdit, onDelete, deleteLabel = "this item", disableDelete = false }) {
    return (
        <div className="mg-actions">
            {onEdit && <button className="mg-rowbtn" onClick={onEdit}>Edit</button>}
            {onDelete && (
                <button className="mg-rowbtn danger" disabled={disableDelete}
                    onClick={() => { if (confirm(`Delete ${deleteLabel}? This cannot be undone.`)) onDelete(); }}>
                    Delete
                </button>
            )}
        </div>
    );
}
