import React from "react";
import TabComponent from "../../components/TabComponent";
import SettingsGeneral       from "./SettingsGeneral";
import SettingsConversation  from "./SettingsConversation";
import SettingsNotifications from "./SettingsNotifications";
import SettingsIntegrations  from "./SettingsIntegrations";
import SettingsAppearance    from "./SettingsAppearance";
import SettingsAdvanced      from "./SettingsAdvanced";
import SettingsSLA           from "./SettingsSLA";
import SettingsProactive     from "./SettingsProactive";
import "./Settings.css";

const SettingsManager = () => {
  const pageContent = {
    title: "Settings",
    subTitle: "Manage chatbot configuration and system preferences",
    tabs: [
      { tabTitle: "General",            tabKey: "general",       tabContent: <SettingsGeneral /> },
      { tabTitle: "Conversation",       tabKey: "conversation",  tabContent: <SettingsConversation /> },
      { tabTitle: "Appearance",         tabKey: "appearance",    tabContent: <SettingsAppearance /> },
      { tabTitle: "Notifications",      tabKey: "notifications", tabContent: <SettingsNotifications /> },
      { tabTitle: "Integrations",       tabKey: "integrations",  tabContent: <SettingsIntegrations /> },
      { tabTitle: "SLA Policies",       tabKey: "sla",           tabContent: <SettingsSLA /> },
      { tabTitle: "Proactive Triggers", tabKey: "proactive",     tabContent: <SettingsProactive /> },
      { tabTitle: "Advanced",           tabKey: "advanced",      tabContent: <SettingsAdvanced /> },
    ],
  };

  return (
    <div className="h-100">
      <TabComponent pageContent={pageContent} />
    </div>
  );
};

export default SettingsManager;
