// pages/Intents/IntentDashboard.jsx
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import TabComponent from "../../components/TabComponent";
import CategoryContainer from './Intent tab/CategoryContainer';
import IntentContainer from './Intent tab/IntentContainer';
import IntentDomainContainer from './Intent tab/IntentDomainContainer';


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
        tabTitle: "Domains",
        tabKey: "Domains",
        tabContent: <IntentDomainContainer />,
      },
    ],
  };
  return <TabComponent pageContent={pageContent} />;
}

export default IntentDashboard
