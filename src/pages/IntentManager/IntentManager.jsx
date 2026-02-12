// pages/Intents/IntentDashboard.jsx
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import TabComponent from "../../components/TabComponent";
import CategoryContainer from './Intent tab/CategoryContainer';
import IntentContainer from './Intent tab/IntentContainer';
import IntentTypeContainer from './Intent tab/IntentTypeContainer';


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
      {
        tabTitle: "Intent Types",
        tabKey: "IntentTypes",
        tabContent: <IntentTypeContainer />,
      },
    ],
  };
  return <TabComponent pageContent={pageContent} />;
}

export default IntentDashboard
