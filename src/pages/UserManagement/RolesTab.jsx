import { Edit2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import APICall from "../../APICalls/APICall";
import { usePermission } from "../../Context/AuthContext";
import { useConfirm } from "../../components/useConfirm";
import { useToast } from "../../components/useToast";
import "./UserMgmt.css";

export default function RolesTab() {
    const { canAdd, canEdit, canDelete } = usePermission('/User-Management');
    const { showToast, ToastContainer } = useToast();
    const { confirm, ConfirmDialog } = useConfirm();
    const [roles,            setRoles]           = useState([]);
    const [menus,            setMenus]           = useState([]);
    const [editingRole,      setEditingRole]     = useState(null);
    const [tempPermissions,  setTempPerms]       = useState({});
    const [showModal,        setShowModal]       = useState(false);
    const [saving,           setSaving]          = useState(false);

    const mapBackendPermissions = (permissions = []) => {
        const result = {};
        permissions.forEach((p) => {
            const menuId = Number(p.menu_id);
            if (!menuId) return;
            result[menuId] = [];
            if (p.view)   result[menuId].push("view");
            if (p.add)    result[menuId].push("add");
            if (p.edit)   result[menuId].push("edit");
            if (p.delete) result[menuId].push("delete");
        });
        return result;
    };

    const fetchRoles = async () => {
        try {
            const res = await APICall.getT("/hrms/roles");
            setRoles((Array.isArray(res) ? res : []).map(r => ({
                id: r.id, key: r.id, name: r.name, status: r.status === "ACTIVE",
                permissions: mapBackendPermissions(r.permissions || r.permission || []),
            })));
        } catch (e) { showToast(e.message || "Failed to load roles.", "danger"); }
    };

    const fetchMenus = async () => {
        try {
            const res = await APICall.getT("/hrms/menus");
            setMenus(Array.isArray(res) ? res : []);
        } catch (e) { showToast(e.message || "Failed to load menus.", "danger"); }
    };

    useEffect(() => { fetchRoles(); fetchMenus(); }, []);

    const openEdit = (role) => {
        setEditingRole({ id: role.id, key: role.key, name: role.name, status: role.status ?? true });
        setTempPerms(JSON.parse(JSON.stringify(role.permissions || {})));
        setShowModal(true);
    };

    const DEMO_ROLE_NAMES = [
        "Content Editor", "Analytics Viewer", "Support Lead", "Bot Trainer",
    ];

    const openAdd = () => {
        setEditingRole({ id: null, name: "", permissions: {}, status: true });
        setTempPerms({});
        setShowModal(true);
    };

    const fillDemoRole = () => {
        const name = DEMO_ROLE_NAMES[Math.floor(Math.random() * DEMO_ROLE_NAMES.length)];
        setEditingRole(prev => ({ ...prev, name }));
        const viewOnlyMenus = menus.slice(0, 3).reduce((acc, m) => {
            acc[m.id] = ["view"];
            return acc;
        }, {});
        setTempPerms(viewOnlyMenus);
    };

    const togglePermission = (menuId, type) => {
        setTempPerms(prev => {
            const curr = prev[menuId] || [];
            return { ...prev, [menuId]: curr.includes(type) ? curr.filter(p => p !== type) : [...curr, type] };
        });
    };

    const savePermissions = async () => {
        if (!editingRole?.name?.trim()) { showToast("Role name is required.", "warning"); return; }
        setSaving(true);
        const payload = {
            name: editingRole.name,
            menus: Object.entries(tempPermissions).map(([menuId, actions]) => ({
                menu: Number(menuId),
                view:   actions.includes("view"),
                add:    actions.includes("add"),
                edit:   actions.includes("edit"),
                delete: actions.includes("delete"),
            })),
        };
        try {
            if (editingRole.id) await APICall.postT(`/hrms/update_role/${editingRole.id}`, payload);
            else                await APICall.postT("/hrms/role", payload);
            await fetchRoles(); setShowModal(false); setEditingRole(null);
            showToast("Role saved.", "success");
        } catch (err) { showToast(err.message || "Failed to save role.", "danger"); }
        finally { setSaving(false); }
    };

    const deleteRole = async (key) => {
        if (!await confirm("Delete this role? This cannot be undone.")) return;
        try { await APICall.postT(`/hrms/delete_role/${key}`); await fetchRoles(); showToast("Role deleted.", "success"); }
        catch (err) { showToast(err.message || "Failed to delete role.", "danger"); }
    };

    const PERMS = ["view", "add", "edit", "delete"];

    return (
        <>
            <ToastContainer />
            <ConfirmDialog />
            {/* ── Toolbar ─────────────────────────────────────── */}
            <div className="um-toolbar">
                <span style={{ fontFamily: "var(--um-font)", fontSize: 13.5, fontWeight: 500, color: "var(--um-text1)" }}>
                    {roles.length} role{roles.length !== 1 ? "s" : ""}
                </span>
                {canAdd && (
                    <button className="um-btn um-btn-primary" style={{ marginLeft: "auto" }} onClick={openAdd}>
                        <Plus size={14} /> Add Role
                    </button>
                )}
            </div>

            {/* ── Table ───────────────────────────────────────── */}
            <div className="um-table-card">
                <table className="um-table">
                    <thead>
                        <tr>
                            <th>Role Name</th>
                            <th style={{ textAlign: "center" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.length === 0 && (
                            <tr><td colSpan={2}><div className="um-empty">No roles defined yet.</div></td></tr>
                        )}
                        {roles.map(role => (
                            <tr key={role.key}>
                                <td style={{ fontWeight: 500 }}>{role.name}</td>
                                <td>
                                    <div className="um-actions">
                                        {canEdit   && <button className="um-action-btn" onClick={() => openEdit(role)} title="Edit"><Edit2 size={15} /></button>}
                                        {canDelete && <button className="um-action-btn danger" onClick={() => deleteRole(role.key)} title="Delete"><Trash2 size={15} /></button>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Modal ───────────────────────────────────────── */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered dialogClassName="um-modal">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {roles.some(r => r.key === editingRole?.key) ? `Edit Role — ${editingRole?.name}` : "Add Role"}
                    </Modal.Title>
                    {!editingRole?.id && (
                        <button
                            className="um-btn um-btn-ghost um-btn-sm"
                            style={{ marginLeft: 12, fontSize: 12 }}
                            onClick={fillDemoRole}
                            title="Prefill with a demo role name and basic view permissions"
                        >
                            Fill Demo Data
                        </button>
                    )}
                </Modal.Header>
                <Modal.Body>
                    <div style={{ marginBottom: 20 }}>
                        <label className="um-form-label">Role Name *</label>
                        <input className="um-form-control" style={{ maxWidth: 320 }}
                            value={editingRole?.name || ""}
                            onChange={e => setEditingRole({ ...editingRole, name: e.target.value })} />
                    </div>

                    <div className="um-section-title">Permissions</div>

                    <div className="um-table-card" style={{ overflow: "auto", maxHeight: 440 }}>
                        <table className="um-perm-table">
                            <thead>
                                <tr>
                                    <th>Module</th>
                                    {PERMS.map(p => <th key={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {menus.map(menu => (
                                    <tr key={menu.id}>
                                        <td>{menu.menu}</td>
                                        {PERMS.map(type => (
                                            <td key={type}>
                                                <input type="checkbox" className="form-check-input"
                                                    style={{ accentColor: "var(--um-accent)", width: 15, height: 15, cursor: "pointer" }}
                                                    checked={Array.isArray(tempPermissions[menu.id]) && tempPermissions[menu.id].includes(type)}
                                                    onChange={() => togglePermission(menu.id, type)} />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button className="um-btn um-btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                    <button className="um-btn um-btn-primary" onClick={savePermissions} disabled={saving}>
                        {saving ? <Spinner size="sm" /> : "Save changes"}
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
