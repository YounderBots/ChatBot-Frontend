// Settings Page (same pattern as ConversationManager)
import React from "react";
import TabComponent from "../../components/TabComponent";
import SettingsGeneral from "./SettingsGeneral";
import SettingsConversation from "./SettingsConversation";
import SettingsNotifications from "./SettingsNotifications";
import SettingsIntegrations from "./SettingsIntegrations";
import SettingsAppearance from "./SettingsAppearance";
import SettingsAdvanced from "./SettingsAdvanced";

const SettingsManager = () => {

  const pageContent = {
    title: "Settings",
    subTitle: "Manage chatbot configuration and system preferences",
    tabs: [
      {
        tabTitle: "General",
        tabKey: "general",
        tabContent: <SettingsGeneral />,
      },
      {
        tabTitle: "Conversation",
        tabKey: "conversation",
        tabContent: <SettingsConversation />,
      },
      {
        tabTitle: "Notifications",
        tabKey: "notifications",
        tabContent: <SettingsNotifications />,
      },
      {
        tabTitle: "Integrations",
        tabKey: "integrations",
        tabContent: <SettingsIntegrations />,
      },
      {
        tabTitle: "Appearance",
        tabKey: "appearance",
        tabContent: <SettingsAppearance />,
      },
      {
        tabTitle: "Advanced",
        tabKey: "advanced",
        tabContent: <SettingsAdvanced />,
      },
    ],
  };

  return (
    <div className="h-100">
      <TabComponent pageContent={pageContent} />
    </div>
  );
};

export default SettingsManager;
