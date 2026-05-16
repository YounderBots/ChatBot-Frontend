import { Edit2, Eye, EyeOff, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import APICall, { baseURL } from "../../APICalls/APICall";
import { usePermission } from "../../Context/AuthContext";
import { useToast } from "../../components/useToast";
import { useConfirm } from "../../components/useConfirm";
import "./UserMgmt.css";

const getStrength = (pw) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { label: "Weak",   pct: 25,  color: "#ef4444" };
  if (s === 2) return { label: "Fair",   pct: 55,  color: "#f59e0b" };
  return             { label: "Strong", pct: 100, color: "#22c55e" };
};

const genPassword = () => Math.random().toString(36).slice(-10) + "@A1";

const DEMO_USERS = [
  { name: "Alice Thompson",  email: "alice.thompson@example.com",  password: "Demo@12345" },
  { name: "James Patel",     email: "james.patel@example.com",     password: "Demo@12345" },
  { name: "Sofia Martinez",  email: "sofia.martinez@example.com",  password: "Demo@12345" },
  { name: "Liam O'Brien",    email: "liam.obrien@example.com",     password: "Demo@12345" },
  { name: "Priya Nair",      email: "priya.nair@example.com",      password: "Demo@12345" },
];

const fileToBase64 = (file) => {
  if (!(file instanceof File)) return Promise.resolve(null);
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.readAsDataURL(file);
    r.onload  = () => res(r.result);
    r.onerror = rej;
  });
};

const initials = (name) => (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

export default function UsersTab() {
  const { canAdd, canEdit, canDelete } = usePermission('/User-Management');
  const { showToast, ToastContainer } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [users,        setUsers]        = useState([]);
  const [roles,        setRoles]        = useState([]);
  const [search,       setSearch]       = useState("");
  const [filter,       setFilter]       = useState("All");
  const [sortBy,       setSortBy]       = useState("");
  const [showModal,    setShowModal]    = useState(false);
  const [editingUser,  setEditingUser]  = useState(null);
  const [showPw,       setShowPw]       = useState(false);
  const [saving,       setSaving]       = useState(false);

  const [form, setForm] = useState({
    avatar: null, avatarFile: null, name: "", email: "",
    password: "", confirmPassword: "", role: 0,
    status: true, emailNotifications: false,
  });

  const strength = getStrength(form.password);

  const filtered = users
    .filter(u => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "All" || (filter === "Active" && u.status === "ACTIVE") || (filter === "Inactive" && u.status !== "ACTIVE");
      return matchSearch && matchFilter;
    })
    .sort((a, b) => sortBy === "AZ" ? a.name.localeCompare(b.name) : sortBy === "ZA" ? b.name.localeCompare(a.name) : 0);

  const fetchUsers = async () => {
    try {
      const res = await APICall.getT("/hrms/users");
      setUsers(res.map(u => ({
        id: u.id, avatar: u.profile_image || null, name: u.fullname,
        email: u.email, role: u.role, roleName: u.roleName,
        lastLogin: u.last_login || "—", status: u.status,
        emailNotifications: u.email_notification,
      })));
    } catch { showToast("Failed to load users.", "danger"); }
  };

  const fetchRoles = async () => {
    try {
      const res = await APICall.getT("/hrms/roles");
      setRoles((Array.isArray(res) ? res : []).map(r => ({
        id: r.id, name: r.name, status: r.status === "ACTIVE",
      })));
    } catch (e) { showToast(e.message || "Failed to load roles.", "danger"); }
  };

  useEffect(() => { fetchUsers(); fetchRoles(); }, []);

  const resetForm = () => {
    setEditingUser(null); setShowPw(false);
    setForm({ avatar: null, avatarFile: null, name: "", email: "", password: "", confirmPassword: "", role: 0, status: true, emailNotifications: false });
  };

  const openAdd  = () => { resetForm(); setShowModal(true); };

  const fillDemoUser = () => {
    const demo = DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)];
    setF({ name: demo.name, email: demo.email, password: demo.password, confirmPassword: demo.password });
  };
  const openEdit = (u) => {
    setEditingUser(u);
    setForm({ avatar: u.avatar || null, avatarFile: null, name: u.name, email: u.email, password: "", confirmPassword: "", role: u.role, status: u.status, emailNotifications: u.emailNotifications ?? false });
    setShowModal(true);
  };

  const saveUser = async () => {
    if (!form.name.trim()) { alert("Full name is required."); return; }
    if (!form.email.trim()) { alert("Email address is required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { alert("Please enter a valid email address."); return; }
    if (!editingUser && !form.password) { alert("Password is required for new users."); return; }

    setSaving(true);
    try {
      const avatarBase64 = form.avatarFile instanceof File ? await fileToBase64(form.avatarFile) : null;
      const payload = {
        fullname: form.name, email: form.email, role: form.role,
        status: form.status, email_notification: form.emailNotifications,
      };
      if (!editingUser) payload.password = form.password;
      if (avatarBase64) payload.profile_image = avatarBase64;

      if (editingUser) await APICall.postT(`/hrms/update_user/${editingUser.id}`, payload);
      else             await APICall.postT("/hrms/user", payload);

      setShowModal(false); resetForm(); await fetchUsers();
    } catch (err) { showToast(err.message || "Failed to save user.", "danger"); }
    finally { setSaving(false); }
  };

  const deleteUser = async (id) => {
    if (!await confirm("Delete this user? This cannot be undone.")) return;
    try { await APICall.postT(`/hrms/delete_user/${id}`); await fetchUsers(); showToast("User deleted.", "success"); }
    catch { showToast("Failed to delete user.", "danger"); }
  };

  const toggleStatus = async (u) => {
    const newStatus = u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: newStatus } : x));
    try { await APICall.postT(`/hrms/update_user_status/${u.id}`, { status: newStatus }); }
    catch { setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: u.status } : x)); showToast("Failed to update status.", "danger"); }
  };

  const setF = (patch) => setForm(f => ({ ...f, ...patch }));

  return (
    <>
      <ToastContainer />
      <ConfirmDialog />
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="um-toolbar">
        <div className="um-search-wrap">
          <Search size={14} className="um-search-icon" />
          <input className="um-input with-icon" placeholder="Search users…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <select className="um-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="All">All users</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <select className="um-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="">Sort by name</option>
          <option value="AZ">A → Z</option>
          <option value="ZA">Z → A</option>
        </select>

        {canAdd && (
          <button className="um-btn um-btn-primary" style={{ marginLeft: "auto" }} onClick={openAdd}>
            <Plus size={14} /> Add User
          </button>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────── */}
      <div className="um-table-card">
        <table className="um-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Last Login</th>
              <th>Status</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6}><div className="um-empty">No users found.</div></td></tr>
            )}
            {filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {u.avatar
                      ? <img className="um-avatar"
                          src={`${baseURL}/admin/${u.avatar.replace(/^\.\/?/, "")}`}
                          alt={u.name}
                          onError={e => { e.target.onerror = null; e.target.style.display = "none"; }} />
                      : <div className="um-avatar-placeholder">{initials(u.name)}</div>
                    }
                    <span style={{ fontWeight: 500 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ color: "var(--um-text2)" }}>{u.email}</td>
                <td><span className="um-badge um-badge-role">{u.roleName || "—"}</span></td>
                <td style={{ color: "var(--um-text3)", fontSize: 12.5 }}>{u.lastLogin}</td>
                <td>
                  <label className="um-switch">
                    <input type="checkbox" checked={u.status === "ACTIVE"}
                      onChange={canEdit ? () => toggleStatus(u) : undefined}
                      disabled={!canEdit} />
                    <span className="um-switch-track" />
                  </label>
                </td>
                <td>
                  <div className="um-actions">
                    {canEdit   && <button className="um-action-btn" onClick={() => openEdit(u)} title="Edit"><Edit2 size={15} /></button>}
                    {canDelete && <button className="um-action-btn danger" onClick={() => deleteUser(u.id)} title="Delete"><Trash2 size={15} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Modal ───────────────────────────────────────────── */}
      <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }}
        centered size="lg" dialogClassName="um-modal">
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? "Edit User" : "Add User"}</Modal.Title>
          {!editingUser && (
            <button
              className="um-btn um-btn-ghost um-btn-sm"
              style={{ marginLeft: 12, fontSize: 12 }}
              onClick={fillDemoUser}
              title="Prefill with demo user data for quick testing"
            >
              Fill Demo Data
            </button>
          )}
        </Modal.Header>
        <Modal.Body>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Left: avatar */}
            <div>
              <div className="um-section-title">Avatar</div>
              <label className="um-avatar-upload" style={{ cursor: "pointer" }}>
                {form.avatar
                  ? <img className="um-avatar-lg" src={form.avatar.startsWith("blob:") ? form.avatar : `${baseURL}/admin/${form.avatar.replace(/^\.\/?/, "")}`} alt="avatar" />
                  : <div className="um-avatar-lg-placeholder">{initials(form.name) || "+"}</div>
                }
                <span style={{ fontSize: 12.5, color: "var(--um-text2)", fontFamily: "var(--um-font)" }}>Click to upload photo</span>
                <input type="file" accept="image/*" style={{ display: "none" }}
                  onChange={e => {
                    const f = e.target.files[0];
                    if (f) setF({ avatarFile: f, avatar: URL.createObjectURL(f) });
                  }} />
              </label>
              {form.avatar && (
                <button className="um-btn um-btn-ghost um-btn-sm" style={{ marginTop: 8, width: "100%", justifyContent: "center" }}
                  onClick={() => setF({ avatar: null, avatarFile: null })}>
                  Remove photo
                </button>
              )}
            </div>

            {/* Right: fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label className="um-form-label">Full Name *</label>
                <input className="um-form-control" value={form.name}
                  onChange={e => setF({ name: e.target.value })} />
              </div>
              <div>
                <label className="um-form-label">Email *</label>
                <input type="email" className="um-form-control" value={form.email}
                  onChange={e => setF({ email: e.target.value })} />
              </div>

              {!editingUser && (
                <>
                  <div>
                    <label className="um-form-label">Password</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input type={showPw ? "text" : "password"} className="um-form-control"
                        value={form.password} onChange={e => setF({ password: e.target.value })} />
                      <button className="um-btn um-btn-ghost um-btn-sm" style={{ flexShrink: 0 }}
                        onClick={() => setShowPw(!showPw)}>
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button className="um-btn um-btn-ghost um-btn-sm" style={{ flexShrink: 0 }}
                        onClick={() => setF({ password: genPassword() })} title="Generate">
                        <RefreshCw size={14} />
                      </button>
                    </div>
                    {form.password && (
                      <>
                        <div className="um-strength-bar">
                          <div className="um-strength-fill" style={{ width: `${strength.pct}%`, background: strength.color }} />
                        </div>
                        <span style={{ fontSize: 11.5, color: strength.color, fontFamily: "var(--um-font)" }}>{strength.label}</span>
                      </>
                    )}
                  </div>
                  <div>
                    <label className="um-form-label">Confirm Password</label>
                    <input type="password" className="um-form-control"
                      style={form.confirmPassword && form.password !== form.confirmPassword ? { borderColor: "#ef4444" } : {}}
                      value={form.confirmPassword} onChange={e => setF({ confirmPassword: e.target.value })} />
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                      <span style={{ fontSize: 11.5, color: "#ef4444", fontFamily: "var(--um-font)" }}>Passwords don't match</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Role */}
          <div className="um-section-title">Role</div>
          <div className="um-role-options">
            {roles.map(r => (
              <label key={r.id} className={`um-role-option ${form.role === r.id ? "is-selected" : ""}`}>
                <input type="radio" name="role" checked={form.role === r.id}
                  onChange={() => setF({ role: r.id })} style={{ display: "none" }} />
                {r.name}
              </label>
            ))}
          </div>

          {/* Status */}
          <div className="um-section-title">Preferences</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { key: "status", label: "Account active", checked: form.status === true || form.status === "ACTIVE", onChange: e => setF({ status: e.target.checked }) },
              { key: "emailNotifications", label: "Email notifications", checked: !!form.emailNotifications, onChange: e => setF({ emailNotifications: e.target.checked }) },
            ].map(({ key, label, checked, onChange }) => (
              <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--um-font)", fontSize: 13.5, color: "var(--um-text1)" }}>{label}</span>
                <label className="um-switch">
                  <input type="checkbox" checked={checked} onChange={onChange} />
                  <span className="um-switch-track" />
                </label>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="um-btn um-btn-ghost" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
          <button className="um-btn um-btn-primary" onClick={saveUser} disabled={saving}>
            {saving ? <Spinner size="sm" /> : (editingUser ? "Save changes" : "Add user")}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
