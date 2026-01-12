### References


- What are all the Layouts we have ?
1. Tab Based Components
2. Normal Layout

##  Tab Based Component : 

- How to use that ? 

#### Javascript



```javascript

// Consider the Dashboard is your page
import React from 'react'
import TabComponent from '../../components/TabComponent'


const Dashboard = () => {

  const pageContent = {
    'title': 'Dashboard',
    'subTitle':'Dashboard is All about the contents',
    'tabs':[
      {
        'tabTitle':'All Owners',
        'tabKey':'allOwners',
        'tabContent':<>Your Component Here</>
      },
      {
        'tabTitle':'All Properties',
        'tabKey':'allProperties',
        'tabContent':<>'Hello'</>
      },
      // List of Tabs Goes Here
    ]
  }




  return (
    <div className='h-100'>
      <TabComponent pageContent={pageContent}  />
    </div>
  )
}

export default Dashboard
```

##  Normal Layout Component : 

- How to use that ? 

#### Javascript



```javascript
import React from 'react'
import NormalLayout from '../../components/NormalLayout'

import { Card, Row, Col } from 'react-bootstrap'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'



 const salesData = [
  { month: 'Jan', revenue: 42000, users: 1200 },
  { month: 'Feb', revenue: 48000, users: 1500 },
  { month: 'Mar', revenue: 53000, users: 1800 },
  { month: 'Apr', revenue: 61000, users: 2100 },
  { month: 'May', revenue: 68000, users: 2600 }
]

const trafficData = [
  { source: 'Organic', value: 45 },
  { source: 'Paid Ads', value: 25 },
  { source: 'Social', value: 18 },
  { source: 'Referral', value: 12 }
]

const SampleNormalPageModel = () => {
  return (
    <div className="p-3 h-100">

      {/* KPI ROW */}
      <Row className="g-3 mb-3">
        <Col md={4}>
          <Card className="rounded-4 shadow-sm h-100">
            <Card.Body>
              <div className="text-muted small">Total Revenue</div>
              <h3 className="fw-bold mt-2">₹2.72M</h3>
              <div className="text-success small">▲ 18% vs last month</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="rounded-4 shadow-sm h-100">
            <Card.Body>
              <div className="text-muted small">Active Users</div>
              <h3 className="fw-bold mt-2">9,340</h3>
              <div className="text-success small">▲ 11% growth</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="rounded-4 shadow-sm h-100">
            <Card.Body>
              <div className="text-muted small">Conversion Rate</div>
              <h3 className="fw-bold mt-2">4.8%</h3>
              <div className="text-danger small">▼ 0.6%</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* CHARTS ROW */}
      <Row className="g-3">

        {/* LINE CHART */}
        <Col md={8}>
          <Card className="rounded-4 shadow-sm h-100">
            <Card.Body style={{ height: 320 }}>
              <h6 className="fw-semibold mb-3">Revenue & User Growth</h6>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" strokeWidth={3} />
                  <Line type="monotone" dataKey="users" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* PIE CHART */}
        <Col md={4}>
          <Card className="rounded-4 shadow-sm h-100">
            <Card.Body style={{ height: 320 }}>
              <h6 className="fw-semibold mb-3">Traffic Sources</h6>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficData}
                    dataKey="value"
                    nameKey="source"
                    innerRadius={55}
                    outerRadius={85}
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* BAR CHART */}
        <Col md={12}>
          <Card className="rounded-4 shadow-sm">
            <Card.Body style={{ height: 300 }}>
              <h6 className="fw-semibold mb-3">Monthly Revenue Breakdown</h6>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

      </Row>
    </div>
  )
}


const Dashboard = () => {
  return (
    <div className='h-100'>
      <NormalLayout>
        <SampleNormalPageModel />
      </NormalLayout>
    </div>
  )
}

export default Dashboard
```


