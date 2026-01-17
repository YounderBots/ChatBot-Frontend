import React, { useState } from "react";
import '../Analytics.css'
import { Card, Row, Col, Button, Modal, } from "react-bootstrap";
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

/* ================= MOCK DATA ================= */
const totalConversations = 18420;
const previousConversations = 15400;
const yesterdayConversations = 5060;
const todayConversations = 7834;

const avgMessagesTrend = [
    { v: 5.4 },
    { v: 5.8 },
    { v: 5.0 },
    { v: 4.2 },
    { v: 2.4 },
];

const sparkData = [
    { v: 120 },
    { v: 160 },
    { v: 200 },
    { v: 240 },
    { v: 300 },
];

const uniqueUsersData = [
    { name: "New Users", value: 62 },
    { name: "Returning Users", value: 38 },
];

const responseDist = [
    { name: "<1s", value: 45 },
    { name: "1-3s", value: 35 },
    { name: ">3s", value: 20 },
];

const resolutionData = [
    { name: "Auto-resolved", value: 68 },
    { name: "Escalated", value: 16 },
];

const conversationTrendData = [
    { time: "Mon", total: 420, resolved: 310, escalated: 70, failed: 40 },
    { time: "Tue", total: 520, resolved: 390, escalated: 80, failed: 50 },
    { time: "Wed", total: 610, resolved: 470, escalated: 90, failed: 50 },
    { time: "Thu", total: 680, resolved: 540, escalated: 80, failed: 60 },
    { time: "Fri", total: 720, resolved: 580, escalated: 90, failed: 50 },
    { time: "Sat", total: 420, resolved: 310, escalated: 70, failed: 40 },
];

const KeymetricsGird = () => {
    const [showDrillModal, setShowDrillModal] = useState(false);
    const [drillMetric, setDrillMetric] = useState(null);

    const trendPercent = (
        ((totalConversations - previousConversations) / previousConversations) *
        100
    ).toFixed(1);

    const isPositive = trendPercent >= 0;

    const changePercent = (
        ((todayConversations - yesterdayConversations) / yesterdayConversations) *
        100
    ).toFixed(1);

    const isIncrease = changePercent >= 0;

    const handleDrillDown = (metric) => {
        setDrillMetric(metric);
        setShowDrillModal(true);
    };

    return (
        <div className="g-3 h-100">
            <Row className="g-2">
                {/* TOTAL CONVERSATIONS */}
                <Col md={4}>
                    <Card
                        className="rounded-4 shadow-sm mt-2 analytics-card h-100"
                        onClick={() => handleDrillDown("total_conversations")}
                    >
                        <Card.Body>
                            <div className="text-muted small">Total Conversations</div>
                            <h3 className="fw-bold mt-2">
                                {totalConversations.toLocaleString()}
                            </h3>
                            <div
                                className={`small fw-semibold ${isPositive ? "text-success" : "text-danger"
                                    }`}
                            >
                                {isPositive ? "▲" : "▼"} {Math.abs(trendPercent)}% vs previous
                            </div>
                            <ResponsiveContainer width="100%" height={120}>
                                <LineChart data={sparkData}>
                                    <Line
                                        dataKey="v"
                                        stroke={isPositive ? "#198754" : "#dc3545"}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                    <Modal
                        show={showDrillModal}
                        onHide={() => setShowDrillModal(false)}
                        size="lg"
                        centered
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>
                                {drillMetric === "total_conversations"
                                    ? "Total Conversations - Drill Down"
                                    : "Metric Details"}
                            </Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            {drillMetric === "total_conversations" && (
                                <>
                                    <Row className="mb-3 text-center text-md-start">
                                        <Col xs={12} md={4} className="mb-2 mb-md-0">
                                            <div className="text-muted small">Today</div>
                                            <h5 className="fw-bold">
                                                {todayConversations.toLocaleString()}
                                            </h5>
                                        </Col>

                                        <Col xs={12} md={4} className="mb-2 mb-md-0">
                                            <div className="text-muted small">Yesterday</div>
                                            <h5 className="fw-bold">
                                                {yesterdayConversations.toLocaleString()}
                                            </h5>
                                        </Col>

                                        <Col xs={12} md={4}>
                                            <div className="text-muted small">Change</div>
                                            <h5
                                                className={`fw-bold ${isIncrease ? "text-success" : "text-danger"
                                                    }`}
                                            >
                                                {isIncrease ? "▲" : "▼"} {Math.abs(changePercent)}%
                                            </h5>
                                        </Col>
                                    </Row>

                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={conversationTrendData}>
                                            <XAxis dataKey="time" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line
                                                dataKey="total"
                                                stroke="#0d6efd"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </>
                            )}
                        </Modal.Body>

                        <Modal.Footer>
                            <Button
                                size="sm"
                                variant="outline-danger"
                                className="px-3 border border-danger"
                                onClick={() => setShowDrillModal(false)}
                            >
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Col>


                {/* UNIQUE USERS */}
                <Col md={4}>
                    <Card className="rounded-4 shadow-sm mt-2 analytics-card h-100">
                        <Card.Body>
                            <div className="text-muted small">Unique Users</div>
                            <h3 className="fw-bold mt-2">6,850</h3>
                            <div className="small text-muted mb-2">
                                New <strong>62%</strong> · Returning <strong>38%</strong>
                            </div>

                            <div className="pie-chart-wrapper">
                                <ResponsiveContainer width="100%" height={120}>
                                    <PieChart>
                                        <Pie
                                            data={uniqueUsersData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={30}
                                            outerRadius={45}
                                        />
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* AVG MESSAGES */}
                <Col md={4}>
                    <Card className="rounded-4 shadow-sm mt-2 analytics-card h-100">
                        <Card.Body>
                            <div className="text-muted small">
                                Avg Messages / Conversation
                            </div>
                            <h3 className="fw-bold mt-2">6.4</h3>
                            <div className="small fw-semibold text-success">
                                ▲ Above target (5)
                            </div>

                            {/* Mini Line Chart */}
                            <ResponsiveContainer width="100%" height={120}>
                                <LineChart data={avgMessagesTrend}>
                                    <Line
                                        dataKey="v"
                                        stroke="#198754"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                {/* RESOLUTION RATE */}
                <Col md={4}>
                    <Card className="rounded-4 shadow-sm mt-2 analytics-card h-100">
                        <Card.Body>
                            <div className="text-muted small">Resolution Rate</div>
                            <h3 className="fw-bold mt-2">84%</h3>

                            <Row className="align-items-center">
                                <Col xs={5} style={{ height: 90 }}>
                                    <ResponsiveContainer width="100%" height={120}>
                                        <PieChart>
                                            <Pie
                                                data={resolutionData}
                                                dataKey="value"
                                                innerRadius={28}
                                                outerRadius={40}
                                                startAngle={90}
                                                endAngle={-270}
                                            />
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Col>

                                <Col xs={7}>
                                    <div className="small text-muted mb-1">
                                        Auto-resolved: <strong>68%</strong>
                                    </div>
                                    <div className="small text-muted">
                                        Escalated: <strong>16%</strong>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                {/* AVG RESPONSE TIME */}
                <Col md={4}>
                    <Card className="rounded-4 shadow-sm mt-2 analytics-card h-100">
                        <Card.Body>
                            <div className="text-muted small">Avg Response Time</div>
                            <h3 className="fw-bold mt-2 text-success">1.2s</h3>
                            <div className="small text-muted">Fast</div>

                            <ResponsiveContainer width="100%" height={120}>
                                <PieChart>
                                    <Pie
                                        data={responseDist}
                                        dataKey="value"
                                        innerRadius={30}
                                        outerRadius={45}
                                    />
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                {/* CUSTOMER SATISFACTION */}
                <Col md={4}>
                    <Card className="rounded-4 shadow-sm mt-2 analytics-card h-100">
                        <Card.Body>

                            <div className="text-muted small">
                                Customer Satisfaction
                            </div>

                            <h3 className="fw-bold mt-2">4.5 / 5</h3>

                            <div className="text-warning fs-5">
                                ★★★★☆
                            </div>

                            <div className="small text-muted">
                                3,240 responses
                            </div>

                            {/* Sentiment breakdown */}
                            <div className="d-flex flex-wrap justify-content-between gap-3 mt-4">
                                <div className="text-center flex-fill">
                                    <div className="fw-bold text-success">72%</div>
                                    <small className="text-muted">Positive</small>
                                </div>

                                <div className="text-center flex-fill">
                                    <div className="fw-bold text-secondary">18%</div>
                                    <small className="text-muted">Neutral</small>
                                </div>

                                <div className="text-center flex-fill">
                                    <div className="fw-bold text-danger">10%</div>
                                    <small className="text-muted">Negative</small>
                                </div>
                            </div>

                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}


export default KeymetricsGird