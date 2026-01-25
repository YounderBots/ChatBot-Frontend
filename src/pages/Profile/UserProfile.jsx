import { Card, Image, Badge } from "react-bootstrap";
import NormalLayout from "../../components/NormalLayout";
import dpPlaceholder from "../../layout/assets/dpPlaceholder.png";

const Profile = () => {
  const user = {
    avatar: "../src/layout/assets/dpPlaceholder.png",
    name: "Alan",
    email: "example@gmail.com",
    status: true,
    emailNotifications: false,
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 500 }}>
      <Card className="shadow-sm rounded-4 text-center p-4">
        <div className="d-flex justify-content-center mb-3">
          {user.avatar ? (
            <Image
              src={user.avatar}
              roundedCircle
              width={100}
              height={100}
            />
          ) : (
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                color: "#64748b",
              }}
            >
              {user.name.charAt(0)}
            </div>
          )}
        </div>

        <h4 className="mb-1">{user.name}</h4>
        <p className="text-muted mb-3">{user.email}</p>

        <div className="d-flex justify-content-between mt-3">
          <span>Account Status</span>
          <Badge bg={user.status ? "success" : "danger"}>
            {user.status ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="d-flex justify-content-between mt-2">
          <span>Email Notifications</span>
          <Badge bg={user.emailNotifications ? "primary" : "secondary"}>
            {user.emailNotifications ? "Enabled" : "Disabled"}
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
