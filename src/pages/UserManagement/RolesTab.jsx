import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Card, Row, Col } from "react-bootstrap";
import { Edit2, Trash2 } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import APICall from "../../APICalls/APICall";

/* =======================
   PERMISSION MATRIX
======================= */

const MENU_ID_MAP = {
    dashboard: 1,
    conversations: 2,
    intents: 3,
    knowledgeBase: 4,
    settings: 5,
    users: 6,
};


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
   COMPONENT
======================= */

export default function RolesTab() {
    const [roles, setRoles] = useState([]);
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



    // fetch roles from API (if needed)



    const mapBackendPermissions = (permissionsArray) => {
        const result = {};

        permissionsArray.forEach((perm) => {
            const menuKey = MENU_ID_MAP[perm.menu];
            if (!menuKey) return;

            result[menuKey] = [];

            if (perm.view) result[menuKey].push("view");
            if (perm.add) result[menuKey].push("add");
            if (perm.edit) result[menuKey].push("edit");
            if (perm.delete) result[menuKey].push("delete");
        });

        return result;
    };



    const fetchRoles = async () => {
        try {
            const response = await APICall.getT("/hrms/roles");
            console.log("Fetched rolesssssssss:", response);


            const rolesArray = Array.isArray(response) ? response : [];

            const formattedRoles = rolesArray.map((role) => ({
                key: role.id,
                name: role.name,
                status: role.status === "ACTIVE",
                permissions: mapBackendPermissions(role.permissions || []),
            }));

            setRoles(formattedRoles);
        } catch (error) {
            console.error("Failed to fetch roles:", error);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);


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

    const buildPermissionsPayload = () => {
        return Object.entries(tempPermissions)
            .map(([menuKey, actions]) => ({
                menu: MENU_ID_MAP[menuKey],
                view: actions.some(a => a.toLowerCase().includes("view")),
                add: actions.some(a => a.toLowerCase().includes("add")),
                edit: actions.some(a => a.toLowerCase().includes("edit")),
                delete: actions.some(a => a.toLowerCase().includes("delete")),
            }))
            .filter(p => p.menu); // remove invalid menus
    };


    const savePermissions = async () => {
        if (!editingRole?.name?.trim()) {
            alert("Role name is required");
            return;
        }

        const payload = {
            name: editingRole.name,
            permissions: buildPermissionsPayload()
        };

        try {
            // 👉 API call
            const response = await APICall.postT("/hrms/role", payload);
            console.log("Payload sent:", payload);
            console.log("Save role response:", response);

           

             await fetchRoles();
                setShowModal(false);
            
        } catch (error) {
            console.error("Save role failed:", error);
            alert("Failed to save role");
        }
    };





    const deleteRole = async (roleKey) => {
        if (!window.confirm("Are you sure you want to delete this role?")) return;

        try {
            const response = await APICall.postT(`/hrms/delete_role/${roleKey}`);
            console.log("Delete response:", response);

            await fetchRoles();
        } catch (error) {
            console.error("Delete role failed:", error);
            alert("Failed to delete role");
        }
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

            {/* ===== ROLES HEADER ===== */}
            <Card className="mb-3 shadow-sm border-0">
                <Card.Body>
                    <Row className="align-items-center g-2">
                        <Col md={6}>
                            <h5 className="mb-0 text-primary">Roles</h5>
                        </Col>

                        <Col md={6} className="d-flex justify-content-end">
                            <Button size="sm" className="primaryBtn" onClick={openAddRole}>
                                Add Role
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>



            {/* ===== ROLES TABLE ===== */}
            {/* ===== ROLES TABLE ===== */}
            <Card className="shadow-sm border-0">
                <Table hover responsive className="mb-0 align-middle">
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
            </Card>




            {/* ===== EDIT MODAL ===== */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {roles.some(r => r.key === editingRole?.key)
                            ? `Edit Role & Permissions – ${editingRole?.name}`
                            : "Add Role & Permissions"}
                    </Modal.Title>

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
