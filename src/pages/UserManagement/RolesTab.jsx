import "bootstrap/dist/css/bootstrap.min.css";
import { Edit2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Modal, Row, Table } from "react-bootstrap";
import APICall from "../../APICalls/APICall";


/* =======================
   COMPONENT
======================= */

export default function RolesTab() {
    const [roles, setRoles] = useState([]);
    const [editingRole, setEditingRole] = useState(null);
    const [tempPermissions, setTempPermissions] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [menus, setMenus] = useState([]);



    /* ---------- OPEN EDIT ---------- */
    const openEdit = (role) => {
        const permissions = role.permissions || {};


        setEditingRole({
            id: role.id,
            key: role.key,
            name: role.name,
            status: role.status ?? true,
        });

        // IMPORTANT: clone permissions so switches work independently
        setTempPermissions(JSON.parse(JSON.stringify(permissions)));

        setShowModal(true);
    };

    const mapBackendPermissions = (permissions = []) => {
        const result = {};

        permissions.forEach((perm) => {
            // ✅ ALWAYS USE menu_id
            const menuId = Number(perm.menu_id);
            if (!menuId) return;

            result[menuId] = [];

            if (perm.view) result[menuId].push("view");
            if (perm.add) result[menuId].push("add");
            if (perm.edit) result[menuId].push("edit");
            if (perm.delete) result[menuId].push("delete");
        });

        return result;
    };






    const fetchRoles = async () => {
        try {
            const response = await APICall.getT("/hrms/roles");

            const rolesArray = Array.isArray(response) ? response : [];

            const formattedRoles = rolesArray.map((role) => ({
                id: role.id,
                key: role.id,
                name: role.name,
                status: role.status === "ACTIVE",
                permissions: mapBackendPermissions(role.permission || []),
            }));


            setRoles(formattedRoles);
        } catch (error) {
            console.error("Failed to fetch roles:", error);
        }
    };
    const fetchMenus = async () => {
        try {
            const response = await APICall.getT("/hrms/menus");
            setMenus(Array.isArray(response) ? response : []);
        } catch (err) {
            console.error("Failed to fetch menus", err);
        }
    };


    useEffect(() => {
        fetchRoles();
        fetchMenus();
    }, []);


    /* ---------- TOGGLE PERMISSION ---------- */
    const togglePermission = (menuId, type) => {
        setTempPermissions((prev) => {
            const current = prev[menuId] || [];

            const updated = current.includes(type)
                ? current.filter((p) => p !== type)
                : [...current, type];

            return { ...prev, [menuId]: updated };
        });
    };


    /* ---------- SAVE ---------- */

    const buildPermissionsPayload = () => {
        return Object.entries(tempPermissions).map(([menuId, actions]) => ({
            menu: Number(menuId),
            view: actions.includes("view"),
            add: actions.includes("add"),
            edit: actions.includes("edit"),
            delete: actions.includes("delete"),
        }));
    };



    const savePermissions = async () => {
        if (!editingRole?.name?.trim()) {
            alert("Role name is required");
            return;
        }

        const payload = {
            name: editingRole.name,
            permissions: buildPermissionsPayload(),
        };

        try {
            if (editingRole.id) {
                await APICall.postT(`/hrms/update_role/${editingRole.id}`, payload);
            } else {
                await APICall.postT("/hrms/role", payload);
            }

            await fetchRoles();
            setShowModal(false);
            setEditingRole(null);
        } catch (error) {
            console.error("Save role failed:", error);
            alert("Failed to save role");
        }
    };








    const deleteRole = async (roleKey) => {
        if (!window.confirm("Are you sure you want to delete this role?")) return;

        try {
            const response = await APICall.postT(`/hrms/delete_role/${roleKey}`);

            await fetchRoles();
        } catch (error) {
            console.error("Delete role failed:", error);
            alert("Failed to delete role");
        }
    };


    const openAddRole = () => {
        setEditingRole({
            id: null,
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
                            {menus.map((menu) => (
                                <tr key={menu.id}>
                                    <td><strong>{menu.menu}</strong></td>

                                    {["view", "add", "edit", "delete"].map((type) => (
                                        <td key={type} className="text-center">
                                            <Form.Check
                                                type="switch"
                                                checked={Array.isArray(tempPermissions[menu.id]) &&
                                                    tempPermissions[menu.id].includes(type)}
                                                onChange={() => togglePermission(menu.id, type)}
                                            />
                                        </td>
                                    ))}
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
