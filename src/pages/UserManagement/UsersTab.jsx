import "bootstrap/dist/css/bootstrap.min.css";
import { Edit2, Eye, EyeOff, Plus, RefreshCw, Search, Trash2, } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, Button, Card, Col, Form, Image, Modal, Row, Table } from "react-bootstrap";
import APICall from "../../APICalls/APICall";
import "./UserMgmt.css";



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

const roles = [
  { id: 1, name: "Super Admin" },
  { id: 2, name: "Admin" },
  { id: 3, name: "Editor" },
  { id: 4, name: "Viewer" },
  { id: 5, name: "Custom" },
];


const fileToBase64 = (file) => {
  if (!(file instanceof File)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
};


export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [sortBy, setSortBy] = useState("");

  const [form, setForm] = useState({
    avatar: null,
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: 0,
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
  })
    .sort((a, b) => {
      if (sortBy === "AZ") {
        return a.name.localeCompare(b.name);
      }
      return b.name.localeCompare(a.name);
    });


  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await APICall.postT(`/hrms/delete_user/${id}`);
      await fetchUsers();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete user");
    }
  };


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



  // fetch user



  const fetchUsers = async () => {
    try {
      const response = await APICall.getT("/hrms/users");
      console.log("Fetched users:", response);

      const mappedUsers = response.map((u) => ({
        id: u.id,
        avatar: u.profile_image || null,
        name: u.fullname,
        email: u.email,
        role: u.role,
        lastLogin: u.last_login || "-",
        status: u.status,
        emailNotifications: u.email_notification,
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error("Fetch users failed:", error);
      alert("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);



  const saveUser = async () => {
    try {
      let avatarBase64 = null;

      if (form.avatarFile instanceof File) {
        avatarBase64 = await fileToBase64(form.avatarFile);
      }

      const payload = {
        fullname: form.name,
        email: form.email,
        role: form.role,
        email_notification: form.emailNotifications,
      };

      if (!editingUser) {
        payload.password = form.password;
      }

      if (avatarBase64) {
        payload.profile_image = avatarBase64;
      }

      let response;

      if (editingUser) {
        response = await APICall.postT(`/hrms/update_user/${editingUser.id}`, payload);
      } else {
        response = await APICall.postT("/hrms/user", payload);
      }

      console.log("User saved:", response);

      setShowModal(false);
      resetForm();
      await fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      alert(error.message || "Failed to save user");
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
    setForm({ ...form, role });
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
            <Col
              xs={12}
              lg={8}
              className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-lg-end gap-2 mt-2 mt-lg-0">
              <Col xs={12} md className="p-0">
                <Form className="position-relative searchForm w-100 ">
                  <Search className="searchIcon" size={14} />
                  <Form.Control
                    size="sm"
                    placeholder="    Search users"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="ps-4 w-100"
                  />
                </Form>
              </Col>

              <Form.Select size="sm" className="w-auto flex-shrink-0" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Form.Select>
              <Form.Select
                size="sm"
                className="w-auto flex-shrink-0"
                value={sortBy}

                onChange={(e) => setSortBy(e.target.value)}
              >
                <option>Sort By Name</option>
                <option value="AZ">Ascending</option>
                <option value="ZA">Descending</option>
              </Form.Select>

              <Button size="sm" className="primaryBtn flex-shrink-0" onClick={openAddUser}>
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
              <th>Last Login</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>
                  <Image
                    src={u.avatar && u.avatar.trim() ? u.avatar : "src/layout/assets/dpPlaceholder.png"}
                    roundedCircle
                    width={32}
                    height={32}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/dummy-avatar.png";
                    }}
                  />

                </td>

                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><Badge bg="info">{u.role}</Badge></td>
                <td>{u.lastLogin}</td>
                <td>
                  <Form.Check
                    type="switch"
                    checked={u.status}
                    onChange={() => setUsers(users.map(x => x.id === u.id ? { ...x, status: !x.status } : x))}
                  />
                </td>
                <td>
                  <div className="d-flex flex-wrap justify-content-center align-items-center gap-2">
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
            <Col xs={12} md={4} className="text-center pt-3">
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
                    setForm((prev) => ({
                      ...prev,
                      avatarFile: file,
                      avatar: URL.createObjectURL(file),
                    }));
                  }
                }}
              />

              {form.avatar && (
                <Button
                  size="sm"
                  variant="link"
                  className="text-danger p-0 mt-1"
                  onClick={() => setForm((prev) => ({
                    ...prev,
                    avatar: null,
                    avatarFile: null,
                  }))}
                >
                  Remove
                </Button>
              )}
            </Col>

            <Col xs={12} md={8}>
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

                    <div className="d-flex flex-wrap gap-2">
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
                {roles.map((role) => (
                  <Form.Check
                    key={role.id}
                    type="radio"
                    name="role"
                    id={`role-${role.id}`}
                    label={role.name}
                    checked={form.role === role.id}
                    onChange={() => handleRoleChange(role.id)}
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
