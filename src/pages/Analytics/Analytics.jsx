import { Row, Col, Card, CardBody } from "react-bootstrap";
import { useState } from "react";

import KeymetricsGird from "./components/KeymetricsGrid";
import NormalLayout from "../../components/NormalLayout";
import AnalyticsCharts from "./components/Analyticscharts";
import AnalyticsTables from "./components/AnalyticsTables";
import AnalyticsFilter from "./components/AnalyticsFilter";
import AnalyticsReport from "./components/AnalyticsReporet";
import AnalyticsMetrics from "./components/AnalyticsMetrics";

const AnalyticsContent = () => {
  const [filters, setFilters] = useState(null);

  return (
    <div className="p-2 P-100">
      <Row>
        <Col md={12} className="mb-3">
          <AnalyticsFilter onApply={setFilters} />
        </Col>
      <Col md={12} className="mb-3">
          <KeymetricsGird />
        </Col>
        <Col md={12} className="mb-3">
          <AnalyticsCharts />
        </Col>

        <Col md={12} className="mb-3">
          <AnalyticsTables />
        </Col>

        <Col md={12} className="mb-3">
          <AnalyticsReport />
        </Col>

        <Col md={12} className="mb-3">
          <AnalyticsMetrics />
        </Col>
      </Row>
    </div>
  );
};

const Analytics = () => {
  return (
    <NormalLayout>
      <AnalyticsContent />
    </NormalLayout>
  );
};

export default Analytics;
