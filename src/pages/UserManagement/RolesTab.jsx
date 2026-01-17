import React, { useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { Edit2, Trash2 } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

/* =======================
   PERMISSION MATRIX
======================= */

const PERMISSION_MATRIX = {
    dashboard: {
        label: "Dashboard",
        actions: ["viewAnalytics", "exportReports"],
    },
    conversations: {
        label: "Conversations",
        actions: ["viewConversations", "exportConversations", "deleteConversations"],
    },
    intents: {
        label: "Intents",
        actions: ["viewIntents", "editIntents", "deleteIntents", "trainModel"],
    },
    knowledgeBase: {
        label: "Knowledge Base",
        actions: ["viewArticles", "editArticles", "publishArticles"],
    },
    settings: {
        label: "Settings",
        actions: ["viewSettings", "modifySettings"],
    },
    users: {
        label: "Users",
        actions: ["viewUsers", "editUsers", "deleteUsers"],
    },
};

/* =======================
   PREDEFINED ROLES
======================= */

const INITIAL_ROLES = [
    {
        key: "SUPER_ADMIN",
        name: "Super Admin",
        permissions: {
            dashboard: ["viewAnalytics", "exportReports"],
            conversations: ["viewConversations", "exportConversations", "deleteConversations"],
            intents: ["viewIntents", "editIntents", "deleteIntents", "trainModel"],
            knowledgeBase: ["viewArticles", "editArticles", "publishArticles"],
            settings: ["viewSettings", "modifySettings"],
            users: ["viewUsers", "editUsers", "deleteUsers"],
        },
    },
    {
        key: "ADMIN",
        name: "Admin",
        permissions: {
            dashboard: ["viewAnalytics", "exportReports"],
            conversations: ["viewConversations", "exportConversations", "deleteConversations"],
            intents: ["viewIntents", "editIntents", "deleteIntents", "trainModel"],
            knowledgeBase: ["viewArticles", "editArticles", "publishArticles"],
            settings: ["viewSettings"],
            users: ["viewUsers", "editUsers"],
        },
    },
    {
        key: "EDITOR",
        name: "Editor",
        permissions: {
            intents: ["viewIntents", "editIntents"],
            knowledgeBase: ["viewArticles", "editArticles"],
        },
    },
    {
        key: "VIEWER",
        name: "Viewer",
        permissions: {
            dashboard: ["viewAnalytics"],
            conversations: ["viewConversations"],
            intents: ["viewIntents"],
            knowledgeBase: ["viewArticles"],
            settings: ["viewSettings"],
            users: ["viewUsers"],
        },
    },
];

/* =======================
   COMPONENT
======================= */

export default function RolesTab() {
    const [roles, setRoles] = useState(INITIAL_ROLES);
    const [editingRole, setEditingRole] = useState(null);
    const [tempPermissions, setTempPermissions] = useState({});
    const [showModal, setShowModal] = useState(false);

    /* ---------- OPEN EDIT ---------- */
    const openEdit = (role) => {
        if (!role.permissions) role.permissions = {}; // safety
        setEditingRole({
            ...role,
            status: role.status ?? true,
            emailNotifications: role.emailNotifications ?? false,
        });
        setTempPermissions(JSON.parse(JSON.stringify(role.permissions)));
        setShowModal(true);
    };


    /* ---------- TOGGLE PERMISSION ---------- */
    const togglePermission = (menu, action) => {
        setTempPermissions((prev) => {
            const current = prev[menu] || [];
            const updated = current.includes(action)
                ? current.filter((p) => p !== action)
                : [...current, action];

            return { ...prev, [menu]: updated };
        });
    };

    /* ---------- SAVE ---------- */
    const savePermissions = () => {
        setRoles((prev) => {
            const roleExists = prev.some(r => r.key === editingRole.key);

            if (roleExists) {
                // Update existing role
                return prev.map((r) =>
                    r.key === editingRole.key
                        ? {
                            ...r,
                            name: editingRole.name,
                            permissions: tempPermissions,
                            status: editingRole.status,
                            emailNotifications: editingRole.emailNotifications,
                        }
                        : r
                );
            } else {
                // Add new role
                return [
                    ...prev,
                    {
                        key: editingRole.key,
                        name: editingRole.name,
                        permissions: tempPermissions,
                        status: editingRole.status,
                        emailNotifications: editingRole.emailNotifications,
                    }
                ];
            }
        });

        setShowModal(false);
    };




    /* ---------- DELETE ROLE ---------- */
    const deleteRole = (roleKey) => {
        if (!window.confirm("Are you sure you want to delete this role?")) return;
        setRoles((prev) => prev.filter((r) => r.key !== roleKey));
    };


    const openAddRole = () => {
        setEditingRole({
            key: Date.now(), // temporary key
            name: "",
            permissions: {},
            status: true,
            emailNotifications: false,
        });
        setTempPermissions({});
        setShowModal(true);
    };





    return (
        <>
            <div className="mt-2 d-flex justify-content-end">
                <Button className="primaryBtn" onClick={() => openAddRole()}>
                    Add Role
                </Button>
            </div>

            {/* ===== ROLES TABLE ===== */}
            <Table bordered hover responsive className="mt-3">
                <thead className="table-light">
                    <tr>
                        <th>Role</th>
                        <th className="text-center">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {roles.map((role) => (
                        <tr key={role.key}>
                            <td>
                                <strong>{role.name}</strong>
                            </td>
                            <td className="text-center">
                                <div className="d-flex justify-content-center gap-3">
                                    <Edit2
                                        size={16}
                                        className="cursorPointer"
                                        onClick={() => openEdit(role)}
                                    />
                                    <Trash2
                                        size={16}
                                        className="cursorPointer text-danger"
                                        onClick={() => deleteRole(role.key)}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            


            {/* ===== EDIT MODAL ===== */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Permissions – {editingRole?.name}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Role Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={editingRole?.name || ""}
                            onChange={(e) =>
                                setEditingRole({ ...editingRole, name: e.target.value })
                            }
                        />
                    </Form.Group>

                    <Table bordered>
                        <thead className="table-light">
                            <tr>
                                <th>Menu</th>
                                <th className="text-center">View</th>
                                <th className="text-center">Add</th>
                                <th className="text-center">Edit</th>
                                <th className="text-center">Delete</th>
                            </tr>
                        </thead>

                        <tbody>
                            {Object.entries(PERMISSION_MATRIX).map(([menuKey, menu]) => (
                                <tr key={menuKey}>
                                    <td><strong>{menu.label}</strong></td>

                                    {["view", "add", "edit", "delete"].map((type) => {
                                        // All actions of this type for this menu
                                        let actionsOfType = menu.actions.filter(a => a.toLowerCase().includes(type));

                                        // Always allow toggle, even if no existing actions
                                        if (actionsOfType.length === 0) {
                                            // create a placeholder action
                                            actionsOfType = [type + "Custom"];
                                            // Also add it to PERMISSION_MATRIX dynamically if needed
                                            if (!menu.actions.includes(actionsOfType[0])) menu.actions.push(actionsOfType[0]);
                                        }

                                        // Initialize menu permissions if missing
                                        if (!tempPermissions[menuKey]) tempPermissions[menuKey] = [];

                                        const currentPerms = tempPermissions[menuKey];

                                        // Toggle ON if any action of this type is present
                                        const isChecked = actionsOfType.some(a => currentPerms.includes(a));

                                        const handleToggle = () => {
                                            setTempPermissions(prev => {
                                                const current = prev[menuKey] || [];
                                                let updated;
                                                if (isChecked) {
                                                    // Remove all actions of this type
                                                    updated = current.filter(a => !actionsOfType.includes(a));
                                                } else {
                                                    // Add all actions of this type
                                                    updated = Array.from(new Set([...current, ...actionsOfType]));
                                                }
                                                return { ...prev, [menuKey]: updated };
                                            });
                                        };

                                        return (
                                            <td key={type} className="text-center">
                                                <Form.Check
                                                    type="switch"
                                                    checked={isChecked}
                                                    onChange={handleToggle}
                                                />
                                            </td>
                                        );
                                    })}

                                </tr>
                            ))}
                        </tbody>

                    </Table>
                    

                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button className="primaryBtn" onClick={savePermissions}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
