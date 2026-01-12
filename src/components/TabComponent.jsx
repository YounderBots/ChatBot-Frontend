import { useState } from 'react'
import { Card, Container } from 'react-bootstrap'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'

import './assets/TabComponent.css'

const TabComponent = ({ pageContent }) => {
  const [activeTab, setActiveTab] = useState(pageContent.tabs[0].tabKey)

  return (
    <Container fluid className="h-100 d-flex flex-column">
      <Card className="tab-card border-0 rounded-4 shadow h-100">
        <Card.Body className="tab-card-body">

          {/* Tabs Header – FIXED */}
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="tab-header"
          >
            {pageContent.tabs.map((tab) => (
              <Tab
                key={tab.tabKey}
                eventKey={tab.tabKey}
                title={tab.tabTitle}
              />
            ))}
          </Tabs>

          {/* Scrollable Content */}
          <div className="tab-content-scroll">
            {
              pageContent.tabs.find(tab => tab.tabKey === activeTab)?.tabContent
            }
          </div>

        </Card.Body>
      </Card>
    </Container>
  )
}

export default TabComponent
