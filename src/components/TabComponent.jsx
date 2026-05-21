import { useState } from 'react'
import { Card, Container, Nav } from 'react-bootstrap'

import './assets/TabComponent.css'

const TabComponent = ({ pageContent }) => {
  const [internalActiveTab, setInternalActiveTab] = useState(pageContent.tabs[0].tabKey)

  // Use controlled state if provided by pageContent, otherwise use internal state
  const isControlled = pageContent.activeTab !== undefined && pageContent.onTabChange !== undefined
  const activeTab = isControlled ? pageContent.activeTab : internalActiveTab
  const handleTabChange = (key) => {
    if (isControlled) {
      pageContent.onTabChange(key)
    } else {
      setInternalActiveTab(key)
    }
  }

  return (
    <Container fluid className="h-100 d-flex flex-column" style={{paddingLeft:'0', paddingRight:'0'}}>
      <Card className="tab-card border-0 rounded-4 shadow h-100">
        <Card.Body className="tab-card-body">

          {/* Tabs Header – FIXED */}
          <Nav
            variant="tabs"
            activeKey={activeTab}
            onSelect={handleTabChange}
            className="tab-header"
          >
            {pageContent.tabs.map((tab) => (
              <Nav.Item key={tab.tabKey}>
                <Nav.Link eventKey={tab.tabKey}>{tab.tabTitle}</Nav.Link>
              </Nav.Item>
            ))}
          </Nav>

          {/* Scrollable Content */}
          <div className="tab-content-scroll">
            {pageContent.tabs.find(tab => tab.tabKey === activeTab)?.tabContent}
          </div>

        </Card.Body>
      </Card>
    </Container>
  )
}

export default TabComponent
