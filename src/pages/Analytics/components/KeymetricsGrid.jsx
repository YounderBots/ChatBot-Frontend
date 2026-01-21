import React, { useState, useCallback } from "react";
import '../Analytics.css';
import { Card, Row, Col, Button, Modal, Form, } from "react-bootstrap";
import {
    LineChart, Line, PieChart, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell
} from "recharts";
import AnalyticsFilter from "./AnalyticsFilter";

const INTENT_COLORS = ["#0d6efd", "#198754", "#fd7e14", "#dc3545", "#6f42c1"];

const KeymetricsGird = () => {
    // ============================================================
    // STATE MANAGEMENT
    // ============================================================
    const [filters, setFilters] = useState({
        preset: "Today",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        compareRange: null
    });
    const [showDrillModal, setShowDrillModal] = useState(false);
    const [drillMetric, setDrillMetric] = useState(null);

    // ============================================================
    // DATA INITIALIZATION
    // ============================================================
    const [usersData] = useState(() => {
        const today = new Date();
        return Array.from({ length: 365 }, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            return {
                date: date.toISOString().split('T')[0],
                newUsers: 50 + Math.floor(Math.random() * 100),
                returningUsers: 30 + Math.floor(Math.random() * 70)
            };
        });
    });

    const [conversationsData] = useState(() => {
        const today = new Date();
        return Array.from({ length: 365 }, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            return {
                date: date.toISOString().split('T')[0],
                count: Math.floor(100 + Math.random() * 300)
            };
        });
    });

    const [hourlyData] = useState(() => {
        const today = new Date().toISOString().split('T')[0];
        return Array.from({ length: 24 }, (_, h) => {
            const date = new Date(today);
            date.setHours(h, 0, 0, 0);
            return {
                timestamp: date.toISOString(),
                date: today,
                count: Math.floor(20 + Math.random() * 80),
                hour: h
            };
        });
    });

    // ============================================================
    // UTILITY FUNCTIONS
    // ============================================================
    const filterDataByDate = useCallback((data, startDate, endDate) => {
        if (!startDate || !endDate) return [];
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return data.filter(item => {
            const itemDate = new Date(item.date || item.timestamp);
            itemDate.setHours(12, 0, 0, 0);
            return itemDate >= start && itemDate <= end;
        });
    }, []);

    // ============================================================
    // EVENT HANDLERS
    // ============================================================
    const handleApplyFilter = (payload) => {
        setFilters(payload);
    };

    const handleDrillDown = (metric) => {
        setDrillMetric(metric);
        setShowDrillModal(true);
    };

    // ============================================================
    // FILTERED DATA COMPUTATION
    // ============================================================
    const currentUsers = filterDataByDate(usersData, filters.startDate, filters.endDate);
    const previousUsers = filters.compareRange
        ? filterDataByDate(usersData, filters.compareRange.startDate, filters.compareRange.endDate)
        : [];

    const currentConversations = filterDataByDate(conversationsData, filters.startDate, filters.endDate);
    const previousConversations = filters.compareRange
        ? filterDataByDate(conversationsData, filters.compareRange.startDate, filters.compareRange.endDate)
        : [];

    // ============================================================
    // AGGREGATED METRICS
    // ============================================================
    const currentTotalUsers = currentUsers.reduce((sum, u) => sum + u.newUsers + u.returningUsers, 0);
    const currentNewUsers = currentUsers.reduce((sum, u) => sum + u.newUsers, 0);
    const currentReturningUsers = currentUsers.reduce((sum, u) => sum + u.returningUsers, 0);
    const previousTotalUsers = previousUsers.reduce((sum, u) => sum + u.newUsers + u.returningUsers, 0);

    const currentTotalConversations = currentConversations.reduce((sum, c) => sum + c.count, 0);
    const previousTotalConversations = previousConversations.reduce((sum, c) => sum + c.count, 0);

    const userTrend = previousTotalUsers > 0
        ? (((currentTotalUsers - previousTotalUsers) / previousTotalUsers) * 100).toFixed(1)
        : "0";
    const convTrend = previousTotalConversations > 0
        ? (((currentTotalConversations - previousTotalConversations) / previousTotalConversations) * 100).toFixed(1)
        : "0";

    // ============================================================
    // CHART DATA PREPARATION
    // ============================================================
    const rangeDays = filters.startDate && filters.endDate
        ? Math.ceil((new Date(filters.endDate) - new Date(filters.startDate)) / (1000 * 60 * 60 * 24))
        : 0;

    let sparkData = [];
    if (filters.preset === "Today") {
        sparkData = Array.from({ length: 24 }, (_, hour) => ({
            hour,
            v: Math.floor(20 + Math.random() * 60)
        }));
    } else if (filters.preset === "Yesterday") {
        sparkData = Array.from({ length: 24 }, (_, hour) => ({
            hour,
            v: Math.floor(15 + Math.random() * 70)
        }));
    } else {
        sparkData = currentConversations.slice(-7).map((c, i) => ({
            day: i + 1,
            v: c.count
        }));
    }

    const uniqueUsersData = currentTotalUsers > 0 ? [
        { name: "New Users", value: Math.round((currentNewUsers / currentTotalUsers) * 100) },
        { name: "Returning Users", value: Math.round((currentReturningUsers / currentTotalUsers) * 100) }
    ] : [{ name: "New Users", value: 0 }, { name: "Returning Users", value: 0 }];

    const drillDownData = currentConversations.length > 1 ? currentConversations.slice(-30) : [];

    // ============================================================
    // MESSAGE METRICS
    // ============================================================
    const currentTotalMessages = currentConversations.reduce((sum, c) => sum + c.count * (4 + Math.random() * 3), 0);
    const previousTotalMessages = previousConversations.reduce((sum, c) => sum + c.count * (4 + Math.random() * 3), 0);
    const avgMessages = currentTotalConversations > 0 ? (currentTotalMessages / currentTotalConversations).toFixed(1) : '—';
    const avgMessagesTrend = previousTotalConversations > 0
        ? (((currentTotalMessages / currentTotalConversations) - (previousTotalMessages / previousTotalConversations)) * 100).toFixed(1)
        : "0";

    // ============================================================
    // RESOLUTION METRICS
    // ============================================================
    const resolutionData = [
        { name: "Resolved", value: Math.round(currentTotalConversations * Math.random()) },
        { name: "Unresolved", value: Math.round(currentTotalConversations * Math.random()) }
    ];

    const totalResolved = resolutionData[0]?.value || 0;
    const totalUnresolved = resolutionData[1]?.value || 0;
    const totalConversations = totalResolved + totalUnresolved;
    const resolutionPercentage = totalConversations > 0
        ? Math.round((totalResolved / totalConversations) * 100) + '%'
        : '0%';

    // ============================================================
    // RESPONSE TIME METRICS
    // ============================================================
    const responseDist = currentTotalConversations > 0 ? [
        { name: "<1s", value: Math.round(currentTotalConversations * Math.random()) },
        { name: "1-3s", value: Math.round(currentTotalConversations * Math.random()) },
        { name: ">3s", value: Math.round(currentTotalConversations * Math.random()) }
    ] : [];

    const totalResponses = responseDist.reduce((sum, item) => sum + item.value, 0);

    const weightedSum = responseDist.reduce((sum, item, index) => {
        const timeValue = index === 0 ? 0.5 : index === 1 ? 2 : 5;
        return sum + (item.value * timeValue);
    }, 0);

    const avgResponseTime = totalResponses > 0
        ? (weightedSum / totalResponses).toFixed(1) + 's'
        : '0s';

    const slowPercentage = responseDist.find(item => item.name === ">3s")?.value / totalResponses || 0;
    const responseStatus = slowPercentage < 0.3 ? 'Fast' : slowPercentage > 0.5 ? 'Slow' : 'Medium';
    const statusClass = slowPercentage < 0.3 ? 'text-success' : slowPercentage > 0.5 ? 'text-danger' : 'text-warning';
    const statusColor = slowPercentage < 0.3 ? '#198754' : slowPercentage > 0.5 ? '#dc3545' : '#fd7e14';


    return (
        <div className="g-2 h-100">

            <Row className="g-3">
                <Col md={12}>
                    <AnalyticsFilter onApply={handleApplyFilter} />
                </Col>

                {/* TOTAL CONVERSATIONS */}
                <Col lg={4} sm={6}>
                    <Card className="rounded-4 shadow-sm analytics-card h-100 cursor-pointer"
                        onClick={() => handleDrillDown("total_conversations")}>
                        <Card.Body className="d-flex flex-column">
                            <div className="text-muted small mb-2">Total Conversations</div>
                            <h3 className="fw-bold flex-grow-1">{currentTotalConversations.toLocaleString()}</h3>
                            <div className={`small fw-semibold ${parseFloat(convTrend) >= 0 ? "text-success" : "text-danger"}`}>
                                {parseFloat(convTrend) >= 0 ? "▲" : "▼"} {Math.abs(parseFloat(convTrend))}% vs previous
                            </div>
                            {sparkData.length > 0 && (
                                <ResponsiveContainer height={100} className="mt-2">
                                    <LineChart data={sparkData}>
                                        <defs>
                                            <linearGradient id="sparkGradient" x1="0" y1="0" x2="1" y2="1">
                                                <stop offset="0%" stopColor={parseFloat(convTrend) >= 0 ? "#198754" : "#dc3545"} stopOpacity={0.8} />
                                                <stop offset="100%" stopColor={parseFloat(convTrend) >= 0 ? "#198754" : "#dc3545"} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Line
                                            dataKey="v"
                                            stroke={parseFloat(convTrend) >= 0 ? "#198754" : "#dc3545"}
                                            strokeWidth={2.5}
                                            dot={false}
                                            strokeLinecap="round"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* UNIQUE USERS */}
                <Col lg={4} sm={6}>
                    <Card className="rounded-4 shadow-sm analytics-card h-100">
                        <Card.Body className="d-flex flex-column">
                            <div className="text-muted small mb-2">Unique Users</div>
                            <h3 className="fw-bold flex-grow-1">{currentTotalUsers.toLocaleString()}</h3>
                            {currentTotalUsers > 0 && (
                                <div className="small text-muted mb-2">
                                    New <strong>{Math.round((currentNewUsers / currentTotalUsers) * 100)}%</strong> ·
                                    Returning <strong>{Math.round((currentReturningUsers / currentTotalUsers) * 100)}%</strong>
                                </div>
                            )}
                            <div className={`small fw-semibold mb-2 ${parseFloat(userTrend) >= 0 ? "text-success" : "text-danger"}`}>
                                {parseFloat(userTrend) >= 0 ? "▲" : "▼"} {Math.abs(parseFloat(userTrend))}% vs previous
                            </div>
                            <ResponsiveContainer height={100}>
                                <PieChart>
                                    <Pie data={uniqueUsersData} dataKey="value" nameKey="name" innerRadius={25} outerRadius={40}>
                                        {uniqueUsersData.map((_, i) => <Cell key={i} fill={INTENT_COLORS[i % 5]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                {/* AVG MESSAGES - FIXED comparison to previous */}
                <Col lg={4} sm={6}>
                    <Card className="rounded-4 shadow-sm analytics-card h-100">
                        <Card.Body className="d-flex flex-column">
                            <div className="text-muted small mb-2">Avg Messages/Conv</div>
                            <h3 className="fw-bold flex-grow-1">{avgMessages}</h3>
                            <div className={`small fw-semibold ${parseFloat(avgMessagesTrend) >= 0 ? "text-success" : "text-danger"}`}>
                                {parseFloat(avgMessagesTrend) >= 0 ? "▲" : "▼"} {Math.abs(parseFloat(avgMessagesTrend))}% vs previous
                            </div>
                            <ResponsiveContainer height={100}>
                                <LineChart data={sparkData.slice(-5)}>
                                    <Line dataKey="v" stroke="#198754" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                {/* RESOLUTION RATE - FIXED always 84% */}
                <Col lg={4} sm={6}>
                    <Card className="rounded-4 shadow-sm analytics-card h-100">
                        <Card.Body className="d-flex flex-column">
                            <div className="text-muted small mb-2">Resolution Rate</div>
                            <h3 className={`fw-bold mb-2 ${totalResolved / totalConversations > 0.8 ? 'text-success' : 'text-warning'}`}>
                                {resolutionPercentage}
                            </h3>
                            <Row className="align-items-center g-2 flex-grow-1">
                                <Col xs={6}>
                                    <ResponsiveContainer height={90}>
                                        <PieChart>
                                            <Pie
                                                data={resolutionData}
                                                dataKey="value"
                                                innerRadius={22}
                                                outerRadius={32}
                                                startAngle={90}
                                                endAngle={-270}
                                                stroke="none"
                                            >
                                                {INTENT_COLORS.map((color, i) => (
                                                    <Cell key={`resolution-${i}`} fill={color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => [value.toLocaleString(), 'Conversations']}
                                                labelFormatter={() => ''}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Col>
                                <Col xs={6} className="ps-3">
                                    <div className="small text-muted">
                                        Resolved: <strong className="text-success">{totalResolved.toLocaleString()}</strong>
                                    </div>
                                    <div className="small text-muted">
                                        Unresolved: <strong className="text-danger">{totalUnresolved.toLocaleString()}</strong>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                {/* AVG RESPONSE TIME */}
                <Col lg={4} sm={6}>
                    <Card className="rounded-4 shadow-sm analytics-card h-100">
                        <Card.Body className="d-flex flex-column">
                            <div className="text-muted small mb-2">Avg Response Time</div>
                            <h3 className="fw-bold flex-grow-1" style={{ color: statusColor }}>
                                {avgResponseTime}
                            </h3>
                            <div className={`small fw-semibold mb-2 ${statusClass}`}>
                                {responseStatus}
                            </div>
                            <ResponsiveContainer height={100}>
                                <PieChart>
                                    <Pie
                                        data={responseDist}
                                        dataKey="value"
                                        innerRadius={25}
                                        outerRadius={40}
                                        stroke="none"
                                    >
                                        {responseDist.map((_, i) => (
                                            <Cell key={`cell-${i}`} fill={INTENT_COLORS[i % INTENT_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name) => [value.toLocaleString(), `${name} responses`]}
                                        labelFormatter={() => ''}
                                    />

                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                {/* CUSTOMER SATISFACTION */}
                <Col lg={4} sm={6}>
                    <Card className="rounded-4 shadow-sm analytics-card h-100">
                        <Card.Body>
                            <div className="text-muted small mb-2">Customer Satisfaction</div>
                            <h3 className="fw-bold">4.5 / 5</h3>
                            <div className="text-warning fs-5 mb-2">★★★★☆</div>
                            <div className="small text-muted mb-3">3,240 responses</div>
                            <div className="d-flex justify-content-between">
                                <div className="text-center">
                                    <div className="fw-bold text-success">72%</div>
                                    <small>Positive</small>
                                </div>
                                <div className="text-center">
                                    <div className="fw-bold text-secondary">18%</div>
                                    <small>Neutral</small>
                                </div>
                                <div className="text-center">
                                    <div className="fw-bold text-danger">10%</div>
                                    <small>Negative</small>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* DRILL DOWN MODAL */}
            <Modal show={showDrillModal} onHide={() => setShowDrillModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Total Conversations</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="mb-3 text-center text-md-start">
                        <Col md={4}>
                            <div className="text-muted small">Current: {filters.preset}</div>
                            <h5 className="fw-bold">{currentTotalConversations.toLocaleString()}</h5>
                        </Col>
                        <Col md={4}>
                            <div className="text-muted small">Previous Period</div>
                            <h5 className="fw-bold">{previousTotalConversations.toLocaleString()}</h5>
                        </Col>
                        <Col md={4}>
                            <div className="text-muted small">Change</div>
                            <h5 className={`fw-bold ${parseFloat(convTrend) >= 0 ? "text-success" : "text-danger"}`}>
                                {parseFloat(convTrend) >= 0 ? "▲" : "▼"} {Math.abs(parseFloat(convTrend))}%
                            </h5>
                        </Col>
                    </Row>
                    {drillDownData.length > 1 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={drillDownData}>
                                <XAxis dataKey="date" tickFormatter={v => new Date(v).toLocaleDateString()} />
                                <YAxis />
                                <Tooltip />
                                <Line dataKey="count" stroke="#0d6efd" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-5">
                            <h5 className="text-muted">Single day selected</h5>
                            <p className="small text-muted">Line chart not available for single day view</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button size="sm" variant="danger" onClick={() => setShowDrillModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default KeymetricsGird;
