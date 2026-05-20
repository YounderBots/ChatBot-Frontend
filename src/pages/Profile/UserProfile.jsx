import { useEffect, useState, useRef } from "react";
import { Alert, Badge, Button, Card, Form, Image, Spinner } from "react-bootstrap";
import { Camera, Eye, EyeOff, Save } from "lucide-react";
import NormalLayout from "../../components/NormalLayout";
import { useAuth } from "../../Context/AuthContext";
import APICall from "../../APICalls/APICall";
import dpPlaceholder from "../../layout/assets/dpPlaceholder.png";

const Profile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new_: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!authUser?.id) return;
    const fetchUser = async () => {
      try {
        const data = await APICall.getT(`/hrms/user/${authUser.id}`);
        setUser(data);
        setForm({ name: data.fullname || data.name || "", email: data.email || "" });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [authUser?.id]);

  const handleSaveProfile = async () => {
    setError(null);
    setSuccess(null);
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("A valid email is required.");
      return;
    }
    setSaving(true);
    try {
      await APICall.putT(`/hrms/users/${authUser.id}`, {
        fullname: form.name.trim(),
        email: form.email.trim(),
      });
      setUser((prev) => ({ ...prev, fullname: form.name.trim(), email: form.email.trim() }));
      setSuccess("Profile updated successfully.");
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(null);
    const { current_password, new_password, confirm_password } = passwordForm;
    if (!current_password || !new_password || !confirm_password) {
      setError("All password fields are required.");
      return;
    }
    if (new_password.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (new_password !== confirm_password) {
      setError("New password and confirmation do not match.");
      return;
    }
    setSaving(true);
    try {
      await APICall.postT(`/hrms/users/${authUser.id}/change_password`, {
        current_password,
        new_password,
      });
      setSuccess("Password changed successfully.");
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
      setChangingPassword(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const data = await APICall.postfileT("/settings/upload_avatar", formData);
      setUser((prev) => ({ ...prev, profile_image: data.url || data.profile_image }));
      setSuccess("Photo updated.");
    } catch (err) {
      setError(err.message);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 560 }}>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card className="shadow-sm rounded-4 p-4">
        {/* Avatar */}
        <div className="d-flex justify-content-center mb-3 position-relative" style={{ width: "fit-content", margin: "0 auto" }}>
          <Image
            src={user?.profile_image || dpPlaceholder}
            roundedCircle
            width={100}
            height={100}
            onError={(e) => { e.target.src = dpPlaceholder; }}
          />
          <Button
            variant="light"
            size="sm"
            className="position-absolute bottom-0 end-0 rounded-circle p-1 border"
            onClick={() => fileInputRef.current?.click()}
            title="Change photo"
          >
            <Camera size={14} />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="d-none"
            onChange={handleAvatarUpload}
          />
        </div>

        {/* Profile info */}
        {!editing ? (
          <>
            <h4 className="text-center mb-1">{user?.fullname || user?.name || "—"}</h4>
            <p className="text-muted text-center mb-3">{user?.email || "—"}</p>

            <div className="d-flex justify-content-between mt-2">
              <span>Account Status</span>
              <Badge bg={user?.status === "ACTIVE" ? "success" : "danger"}>
                {user?.status === "ACTIVE" ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="d-flex justify-content-between mt-2 mb-3">
              <span>Email Notifications</span>
              <Badge bg={user?.email_notification ? "primary" : "secondary"}>
                {user?.email_notification ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            <div className="d-flex gap-2 mt-2">
              <Button variant="outline-primary" size="sm" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => { setChangingPassword(!changingPassword); setError(null); }}
              >
                Change Password
              </Button>
            </div>
          </>
        ) : (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Form.Group>
            <div className="d-flex gap-2">
              <Button variant="primary" size="sm" disabled={saving} onClick={handleSaveProfile}>
                {saving ? <Spinner size="sm" animation="border" /> : <><Save size={14} className="me-1" /> Save</>}
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={() => { setEditing(false); setError(null); }}>
                Cancel
              </Button>
            </div>
          </>
        )}

        {/* Password change */}
        {changingPassword && !editing && (
          <div className="mt-4 pt-3 border-top">
            <h6>Change Password</h6>
            {[
              { key: "current_password", label: "Current Password", vis: "current" },
              { key: "new_password", label: "New Password", vis: "new_" },
              { key: "confirm_password", label: "Confirm New Password", vis: "confirm" },
            ].map(({ key, label, vis }) => (
              <Form.Group className="mb-2" key={key}>
                <Form.Label className="small">{label}</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPasswords[vis] ? "text" : "password"}
                    value={passwordForm[key]}
                    onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                  />
                  <Button
                    variant="link"
                    size="sm"
                    className="position-absolute top-50 end-0 translate-middle-y pe-2"
                    style={{ textDecoration: "none" }}
                    onClick={() => togglePasswordVisibility(vis)}
                  >
                    {showPasswords[vis] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </Form.Group>
            ))}
            <div className="d-flex gap-2 mt-2">
              <Button variant="primary" size="sm" disabled={saving} onClick={handleChangePassword}>
                {saving ? <Spinner size="sm" animation="border" /> : "Update Password"}
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setChangingPassword(false);
                  setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

const UserProfile = () => (
  <NormalLayout>
    <Profile />
  </NormalLayout>
);

export default UserProfile;
