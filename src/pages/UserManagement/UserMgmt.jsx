import React from "react";
import TabComponent from "../../components/TabComponent";
import UsersTab from "./UsersTab";
import RolesTab from "./RolesTab";

const UserManagement = () => {
  const pageContent = {
    title: "User Management",
    subTitle: "Manage users and roles",
    tabs: [
      {
        tabTitle: "Users",
        tabKey: "users",
        tabContent: <UsersTab />,
      },
      {
        tabTitle: "Roles",
        tabKey: "roles",
        tabContent: <RolesTab />,
      },
    ],
  };

  return <TabComponent pageContent={pageContent} />;
};

export default UserManagement;
