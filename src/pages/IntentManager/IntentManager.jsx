// pages/Intents/IntentDashboard.jsx
import React from 'react'
import TabComponent from "../../components/TabComponent";
import IntentContainer from './Intent tab/IntentContainer'
import CategoryContainer from './Intent tab/CategoryContainer'

const IntentDashboard = () => {

    const pageContent = {
        title: "Intent Management",
        subTitle: "Manage intents and categories",
        tabs: [
          {
            tabTitle: "Intent",
            tabKey: "users",
            tabContent: <IntentContainer />,
          },
          {
            tabTitle: "Category",
            tabKey: "Category",
            tabContent: <CategoryContainer />,
          },
        ],
      };
      return <TabComponent pageContent={pageContent} />;
}

export default IntentDashboard
