import { useEffect, useState } from "react";
import { Badge, Card, Image, Spinner } from "react-bootstrap";
import NormalLayout from "../../components/NormalLayout";
import { useAuth } from "../../Context/AuthContext";
import APICall from "../../APICalls/APICall";
import dpPlaceholder from "../../layout/assets/dpPlaceholder.png";

const Profile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authUser?.id) return;

    const fetchUser = async () => {
      try {
        const data = await APICall.getT(`/hrms/user/${authUser.id}`);
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [authUser?.id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <p className="text-danger text-center mt-5">{error}</p>;
  }

  return (
    <div className="container mt-5" style={{ maxWidth: 500 }}>
      <Card className="shadow-sm rounded-4 text-center p-4">
        <div className="d-flex justify-content-center mb-3">
          {user?.profile_image ? (
            <Image
              src={user.profile_image}
              roundedCircle
              width={100}
              height={100}
              onError={(e) => { e.target.src = dpPlaceholder; }}
            />
          ) : (
            <Image
              src={dpPlaceholder}
              roundedCircle
              width={100}
              height={100}
            />
          )}
        </div>

        <h4 className="mb-1">{user?.name || "—"}</h4>
        <p className="text-muted mb-3">{user?.email || "—"}</p>

        <div className="d-flex justify-content-between mt-3">
          <span>Account Status</span>
          <Badge bg={user?.status === "ACTIVE" ? "success" : "danger"}>
            {user?.status === "ACTIVE" ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="d-flex justify-content-between mt-2">
          <span>Email Notifications</span>
          <Badge bg={user?.email_notification ? "primary" : "secondary"}>
            {user?.email_notification ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </Card>
    </div>
  );
};


const UserProfile = () => {
    return (
        <NormalLayout>
            <Profile />
        </NormalLayout>
    );
};

export default UserProfile;
