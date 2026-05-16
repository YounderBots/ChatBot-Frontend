import { useState } from "react";
import TabComponent from "../../components/TabComponent";
import AnalyticsCSAT from "./components/AnalyticsCSAT";
import AnalyticsExport from "./components/AnalyticsExport";
import AnalyticsMetrics from "./components/AnalyticsMetrics";
import AnalyticsReport from "./components/AnalyticsReporet";
import AnalyticsTables from "./components/AnalyticsTables";
import AnalyticsCharts from "./components/Analyticscharts";
import KeymetricsGrid from "./components/KeymetricsGrid";
import "./Analytics.css";

const Analytics = () => {
  const pageContent = {
    title: "Analytics & Reports",
    subTitle: "Performance insights and data exports",
    tabs: [
      {
        tabTitle: "Overview",
        tabKey: "overview",
        tabContent: (
          <div className="analytics-tab-pane">
            <KeymetricsGrid />
          </div>
        ),
      },
      {
        tabTitle: "Charts",
        tabKey: "charts",
        tabContent: (
          <div className="analytics-tab-pane">
            <AnalyticsCharts />
          </div>
        ),
      },
      {
        tabTitle: "Real-time",
        tabKey: "realtime",
        tabContent: (
          <div className="analytics-tab-pane">
            <AnalyticsMetrics />
          </div>
        ),
      },
      {
        tabTitle: "CSAT",
        tabKey: "csat",
        tabContent: (
          <div className="analytics-tab-pane">
            <AnalyticsCSAT />
          </div>
        ),
      },
      {
        tabTitle: "Reports",
        tabKey: "reports",
        tabContent: (
          <div className="analytics-tab-pane">
            <AnalyticsTables />
            <AnalyticsReport />
            <AnalyticsExport />
          </div>
        ),
      },
    ],
  };

  return <TabComponent pageContent={pageContent} />;
};

export default Analytics;
