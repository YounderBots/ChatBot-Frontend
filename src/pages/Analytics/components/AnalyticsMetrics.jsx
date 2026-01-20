import React, { useState, useEffect } from "react";
import '../Analytics.css'
import { Card, Row, Col, } from "react-bootstrap";

const AnalyticsMetrics = () => {
    const [liveUsers, setLiveUsers] = useState(0);
    const [activeConversations, setActiveConversations] = useState(0);
    const [messagesPerMinute, setMessagesPerMinute] = useState(0);
    const [systemHealth, setSystemHealth] = useState("Healthy");

    useEffect(() => {
        const updateMetrics = () => {
            setLiveUsers(Math.floor(Math.random() * 200) + 50);
            setActiveConversations(Math.floor(Math.random() * 120) + 20);
            setMessagesPerMinute(Math.floor(Math.random() * 500) + 100);

            const healthStates = ["Healthy", "Degraded", "Down"];
            setSystemHealth(healthStates[Math.floor(Math.random() * healthStates.length)]);
        };

        updateMetrics();
        const interval = setInterval(updateMetrics, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="g-2 P-100">
            <Row>
                <Col md={12}>
                    <Card className="rounded-4 shadow-sm analytics-card">
                        <Card.Body className="analytics-card-body">
                            <h5 className="mb-2">Real-time Metrics</h5>
                            <Row className="g-3">

                                {/* Live Users */}
                                <Col md={3}>
                                    <Card className="h-100 border-0 bg-light">
                                        <Card.Body>
                                            <div className="text-muted small">Live Users</div>
                                            <h3 className="fw-bold mt-1">{liveUsers}</h3>
                                            <div className="small text-muted">Updated every 5s</div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Active Conversations */}
                                <Col md={3}>
                                    <Card className="h-100 border-0 bg-light">
                                        <Card.Body>
                                            <div className="text-muted small">Active Conversations</div>
                                            <h3 className="fw-bold mt-1">{activeConversations}</h3>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Messages per Minute */}
                                <Col md={3}>
                                    <Card className="h-100 border-0 bg-light">
                                        <Card.Body>
                                            <div className="text-muted small">Messages / Minute</div>
                                            <h3 className="fw-bold mt-1">{messagesPerMinute}</h3>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* System Health */}
                                <Col md={3}>
                                    <Card className="h-100 border-0 bg-light">
                                        <Card.Body>
                                            <div className="text-muted small">System Health</div>
                                            <h5
                                                className={`fw-semibold mt-2 ${systemHealth === "Healthy"
                                                    ? "text-success"
                                                    : systemHealth === "Degraded"
                                                        ? "text-warning"
                                                        : "text-danger"
                                                    }`}
                                            >
                                                {systemHealth}
                                            </h5>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row >
        </div >
    );
}


export default AnalyticsMetrics