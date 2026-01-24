import { Row, Col, } from "react-bootstrap";
import NormalLayout from "../../components/NormalLayout";

const Profile = () => {
    return (
        <div className="p-2 P-100">
            <h6 className="mb-3">Basic Info</h6>
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
