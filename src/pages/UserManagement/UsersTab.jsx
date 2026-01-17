import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Table, Badge, Card, Modal, Image, } from "react-bootstrap";
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, RefreshCw, } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./UserMgmt.css";

// Dummy API calls (replace with real endpoints later)
const apiCreateUser = async (userData) => {
  console.log("Creating user on server:", userData);
  return new Promise((resolve) => setTimeout(() => resolve({ ...userData, id: Date.now() }), 500));
};

const apiUpdateUser = async (id, userData) => {
  console.log("Updating user on server:", id, userData);
  return new Promise((resolve) => setTimeout(() => resolve({ ...userData, id }), 500));
};

const apiDeleteUser = async (id) => {
  console.log("Deleting user on server:", id);
  return new Promise((resolve) => setTimeout(() => resolve(true), 500));
};

const getPasswordStrength = (password) => {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: "Weak", value: 25, variant: "danger" };
  if (score === 2) return { label: "Medium", value: 60, variant: "warning" };
  return { label: "Strong", value: 100, variant: "success" };
};

const generatePassword = () =>
  Math.random().toString(36).slice(-10) + "@A1";

const PERMISSIONS = {
  dashboard: {
    label: "Dashboard",
    children: {
      viewAnalytics: "View analytics",
      exportReports: "Export reports",
    },
  },
  conversations: {
    label: "Conversations",
    children: {
      viewConversations: "View conversations",
      exportConversations: "Export conversations",
      deleteConversations: "Delete conversations",
    },
  },
  intents: {
    label: "Intents",
    children: {
      viewIntents: "View intents",
      editIntents: "Create/edit intents",
      deleteIntents: "Delete intents",
      trainModel: "Train model",
    },
  },
  knowledgeBase: {
    label: "Knowledge Base",
    children: {
      viewArticles: "View articles",
      editArticles: "Create/edit articles",
      publishArticles: "Publish articles",
    },
  },
  settings: {
    label: "Settings",
    children: {
      viewSettings: "View settings",
      modifySettings: "Modify settings",
    },
  },
  users: {
    label: "Users",
    children: {
      viewUsers: "View users",
      editUsers: "Create/edit users",
      deleteUsers: "Delete users",
    },
  },
};

const ROLE_PRESETS = {
  "Super Admin": "ALL",
  Admin: ["dashboard", "conversations", "intents", "knowledgeBase"],
  Editor: ["intents", "knowledgeBase"],
  Viewer: [],
};

const initialUsers = [
  {
    id: 1,
    avatar: "https://i.pravatar.cc/40?img=1",
    name: "Admin One",
    email: "admin1@mail.com",
    role: "Admin",
    permissions: 12,
    lastLogin: "2026-01-12",
    status: true,
  },
  {
    id: 2,
    avatar: "https://i.pravatar.cc/40?img=2",
    name: "Admin Two",
    email: "admin2@mail.com",
    role: "Viewer",
    permissions: 4,
    lastLogin: "2026-01-10",
    status: false,
  },
];
const deleteUser = async (id) => {
  try {
    await apiDeleteUser(id);
    setUsers(users.filter((u) => u.id !== id));
  } catch (error) {
    console.error("Error deleting user:", error);
    alert("Failed to delete user. Check console.");
  }
};

export default function UsersTab() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    avatar: null,
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Admin",
    permissions: {},
    status: true,
    emailNotifications: false
  });
  const passwordStrength = getPasswordStrength(form.password);



  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "All" ||
      (filter === "Active" && u.status) ||
      (filter === "Inactive" && !u.status);
    return matchesSearch && matchesFilter;
  });

  // const openAddUser = () => {
  //   setEditingUser(null);
  //   setForm({ avatar: "", name: "", email: "", password: "", confirmPassword: "", role: "Admin" });
  //   setShowModal(true);
  // };

  const openAddUser = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditUser = (user) => {
    setEditingUser(user);
    setForm({
      avatar: user.avatar || null,
      name: user.name,
      email: user.email,
      password: "",
      confirmPassword: "",
      role: user.role,
      status: user.status ?? true,                     // ✅ ADD
      emailNotifications: user.emailNotifications ?? false // ✅ ADD
    });
    setShowModal(true);
  };

  const saveUser = async () => {
    try {
      let userData = {
        avatar: form.avatar || null,
        name: form.name,
        email: form.email,
        role: form.role,
        permissions: form.role === "Custom" ? {} : form.permissions,
        lastLogin: editingUser ? editingUser.lastLogin : "-",
        // status: editingUser ? editingUser.status : true,
        status: form.status,                       // ✅ ADD
        emailNotifications: form.emailNotifications, // ✅ ADD
      };

      if (editingUser) {
        // Call dummy update API
        const updatedUser = await apiUpdateUser(editingUser.id, userData);
        setUsers(users.map((u) => (u.id === editingUser.id ? updatedUser : u)));
      } else {
        // Call dummy create API
        const newUser = await apiCreateUser(userData);
        setUsers([...users, newUser]);
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Failed to save user. Check console.");
    }
  };


  const resetForm = () => {
    setEditingUser(null);
    setShowPassword(false);
    setForm({
      avatar: null,
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "Admin",
    });
  };
  const handleRoleChange = (role) => {
    if (role === "Custom") {
      // Just save role as Custom, no permission tree
      setForm({ ...form, role, permissions: {} });
      return;
    }

    if (ROLE_PRESETS[role] === "ALL") {
      // Super Admin: all permissions
      const allPerms = {};
      Object.keys(PERMISSIONS).forEach((key) => {
        allPerms[key] = Object.keys(PERMISSIONS[key].children);
      });
      setForm({ ...form, role, permissions: allPerms });
    } else {
      // Predefined roles: some permissions
      const perms = {};
      ROLE_PRESETS[role].forEach((key) => {
        perms[key] = Object.keys(PERMISSIONS[key].children);
      });
      setForm({ ...form, role, permissions: perms });
    }
  };




  return (
    <div>
      {/* Header */}
      <Card className="mb-3 shadow-sm border-0">
        <Card.Body>
          <Row className="align-items-center g-2">
            <Col md={4}>
              <h5 className="mb-0 text-primary">Users</h5>
            </Col>
            <Col md={8} className="d-flex justify-content-end gap-2">
              <Form className="position-relative searchForm">
                <Search className="searchIcon" size={14} />
                <Form.Control
                  size="sm"
                  placeholder="Search users"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ps-4"
                />
              </Form>
              <Form.Select size="sm" className="w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Form.Select>
              <Button size="sm" className="primaryBtn" onClick={openAddUser}>
                <Plus size={14} /> Add User
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card className="shadow-sm border-0">
        <Table hover responsive className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Permissions</th>
              <th>Last Login</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.avatar ? (
                    <Image src={u.avatar} roundedCircle width={32} height={32} />
                  ) : (
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#e2e8f0",
                      }}
                    />
                  )}
                </td>

                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><Badge bg="info">{u.role}</Badge></td>
                <td>{typeof u.permissions === "object" ? Object.values(u.permissions).flat().length : u.permissions}</td>

                <td>{u.lastLogin}</td>
                <td>
                  <Form.Check
                    type="switch"
                    checked={u.status}
                    onChange={() => setUsers(users.map(x => x.id === u.id ? { ...x, status: !x.status } : x))}
                  />
                </td>
                <td>
                  <div className="d-flex justify-content-center align-items-center gap-2 h-100 w-100">

                    <Edit2 size={16} className="cursorPointer" onClick={() => openEditUser(u)} />
                    <Trash2
                      size={16}
                      className="cursorPointer text-danger"
                      onClick={() => deleteUser(u.id)}
                    />
                  </div>

                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* Add/Edit User Modal */}
      {/* <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg"> */}
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          resetForm();
        }}
        centered
        size="lg"
      >

        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? "Edit User" : "Add User"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6 className="mb-3">Basic Info</h6>
          <Row className="g-3">
            <Col md={4} className="text-center pt-3">
              <div className="mb-2 d-flex justify-content-center ">
                {form.avatar ? (
                  <Image
                    src={form.avatar}
                    roundedCircle
                    width={80}
                    height={80}
                  />
                ) : (
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      backgroundColor: "#e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      color: "#64748b",
                      
                    }}
                  >
                    
                  </div>
                )}
              </div>


              <Form.Control
                size="sm"
                type="file"
                accept="image/*"
                className="mt-2"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setForm({ ...form, avatar: URL.createObjectURL(file) });
                  }
                }}
              />

              {form.avatar && (
                <Button
                  size="sm"
                  variant="link"
                  className="text-danger p-0 mt-1"
                  onClick={() => setForm({ ...form, avatar: null })}
                >
                  Remove
                </Button>
              )}
            </Col>

            <Col md={8}>
              <Form.Group className="mb-2">
                <Form.Label>Full Name *</Form.Label>
                <Form.Control size="sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Email *</Form.Label>
                <Form.Control size="sm" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Form.Group>
              {!editingUser && (
                <>
                  <Form.Group className="mb-2">
                    <Form.Label>Password</Form.Label>

                    <div className="d-flex gap-2">
                      <Form.Control
                        size="sm"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) =>
                          setForm({ ...form, password: e.target.value })
                        }
                        isInvalid={
                          form.password &&
                          passwordStrength.label === "Weak"
                        }
                      />

                      {/* Show / Hide */}
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>

                      {/* Generate */}
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() =>
                          setForm({
                            ...form,
                            password: generatePassword(),
                          })
                        }
                      >
                        <RefreshCw size={14} />
                      </Button>
                    </div>

                    {/* Strength Indicator */}
                    {form.password && (
                      <>
                        <div className="mt-1 small">
                          Strength:{" "}
                          <span className={`text-${passwordStrength.variant}`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="progress mt-1" style={{ height: "5px" }}>
                          <div
                            className={`progress-bar bg-${passwordStrength.variant}`}
                            style={{ width: `${passwordStrength.value}%` }}
                          />
                        </div>
                      </>
                    )}
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      size="sm"
                      type="password"
                      value={form.confirmPassword}
                      isInvalid={
                        form.confirmPassword &&
                        form.password !== form.confirmPassword
                      }
                      onChange={(e) =>
                        setForm({ ...form, confirmPassword: e.target.value })
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      Passwords do not match
                    </Form.Control.Feedback>
                  </Form.Group>

                </>
              )}
            </Col>
          </Row>
          <hr className="my-4" />
          <h6 className="mb-3">Role </h6>

          <Row className="g-3">
            <Col md={12}>
              <Form.Group className="mb-3 roleSelection">
                {["Super Admin", "Admin", "Editor", "Viewer", "Custom"].map((role) => (
                  <Form.Check
                    key={role}
                    type="radio"
                    name="role"
                    label={role}
                    checked={form.role === role}
                    onChange={() => handleRoleChange(role)}
                    className="mb-1"
                  />
                ))}
              </Form.Group>
              <hr className="my-4" />

              <h6 className="mb-3">Status</h6>

              <Form.Group className="mb-3 d-flex justify-content-between align-items-center">
                <Form.Label className="mb-0">Account Status</Form.Label>
                <Form.Check
                  type="switch"
                  checked={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.checked })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-2 d-flex justify-content-between align-items-center">
                <Form.Label className="mb-0">Email Notifications</Form.Label>
                <Form.Check
                  type="checkbox"
                  checked={form.emailNotifications}
                  onChange={(e) =>
                    setForm({ ...form, emailNotifications: e.target.checked })
                  }
                />
              </Form.Group>




            </Col>
          </Row>
        </Modal.Body>



        <Modal.Footer>
          <Button size="sm" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button size="sm" className="primaryBtn" onClick={saveUser}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
