import React, { useState, useEffect } from "react";
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
    Cell
} from "recharts";

const INTENT_COLORS = [
    "#0d6efd", // blue
    "#198754", // green
    "#fd7e14", // orange
    "#dc3545", // red
    "#6f42c1", // purple
    "#20c997", // teal
    "#ffc107", // yellow
    "#0dcaf0", // cyan
    "#adb5bd", // gray
    "#343a40", // dark
];


const KeymetricsGird = () => {
    const [showDrillModal, setShowDrillModal] = useState(false);
    const [drillMetric, setDrillMetric] = useState(null);
    const [filters, setFilters] = useState(null);

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        setFilters({ startDate: today, endDate: today });
    }, []);

    /* ================= HELPERS ================= */

    const filterByDate = (data = [], startDate, endDate) => {
        if (!startDate || !endDate) return [];

        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);

        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);

        return data.filter(d => {
            const x = new Date(d.date);
            x.setHours(12, 0, 0, 0);
            return x >= s && x <= e;
        });
    };


    const sumCounts = (arr = []) =>
        arr.reduce((a, b) => a + (b.count || 0), 0);

    const getPreviousRange = (startDate, endDate) => {
        if (!startDate || !endDate) return null;

        const s = new Date(startDate);
        const e = new Date(endDate);

        if (isNaN(s.getTime()) || isNaN(e.getTime())) {
            return null;
        }

        const days =
            Math.round((e.getTime() - s.getTime()) / 86400000) + 1;

        const prevEnd = new Date(s);
        prevEnd.setDate(s.getDate() - 1);

        const prevStart = new Date(prevEnd);
        prevStart.setDate(prevEnd.getDate() - days + 1);

        return {
            startDate: prevStart.toISOString().split("T")[0],
            endDate: prevEnd.toISOString().split("T")[0],
        };
    };


    /* ================= DATA ================= */

    const today = new Date();
    const DUMMY_USERS = Array.from({ length: 10 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        return {
            date: d.toISOString().split("T")[0],
            newUsers: 100 + i * 20,
            returningUsers: 80 + i * 10,
        };
    });

    const previousRange = filters
        ? getPreviousRange(filters.startDate, filters.endDate)
        : null;

    /* ================= RANGE LOGIC ================= */

    const getRangeDays = (startDate, endDate) => {
        const s = new Date(startDate);
        const e = new Date(endDate);
        return Math.ceil((e - s) / 86400000) + 1;
    };

    const rangeDays = filters
        ? getRangeDays(filters.startDate, filters.endDate)
        : 0;

    const isTimestampView = rangeDays < 2;

    const DUMMY_CONVERSATIONS_DAILY = Array.from({ length: 60 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        return {
            date: d.toISOString().split("T")[0],
            count: Math.floor(50 + Math.random() * 150),
        };
    });

    const hourlyBaseDate = filters
        ? new Date(filters.startDate)
        : new Date();

    const DUMMY_CONVERSATIONS_HOURLY = Array.from({ length: 24 }, (_, h) => {
        const d = new Date(hourlyBaseDate);
        d.setHours(h, 0, 0, 0);

        return {
            timestamp: d.toISOString(),
            count: Math.floor(5 + Math.random() * 20),
        };
    });

    const conversationChartData = isTimestampView
        ? DUMMY_CONVERSATIONS_HOURLY
        : DUMMY_CONVERSATIONS_DAILY;

    const filterConversations = (data, startDate, endDate) => {
        if (!startDate || !endDate) return [];

        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);

        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);

        return data.filter(d => {
            const x = new Date(d.timestamp || d.date);
            return x >= s && x <= e;
        });
    };

    /* ---------- CURRENT USERS ---------- */

    const currentUsers = filters
        ? filterByDate(DUMMY_USERS, filters.startDate, filters.endDate)
        : [];

    const currentNewUsers = currentUsers.reduce(
        (sum, u) => sum + (u.newUsers || 0),
        0
    );

    const currentReturningUsers = currentUsers.reduce(
        (sum, u) => sum + (u.returningUsers || 0),
        0
    );

    const currentTotalUsers =
        currentNewUsers + currentReturningUsers;

    /* ✅ REQUIRED FLAG */
    const hasUserData = currentTotalUsers > 0;  

    /* ---------- PREVIOUS USERS (AUTO COMPARE) ---------- */

    const previousUsers = previousRange
        ? filterByDate(
            DUMMY_USERS,
            previousRange.startDate,
            previousRange.endDate
        )
        : [];

    const previousTotalUsers = previousUsers.reduce(
        (sum, u) =>
            sum + (u.newUsers || 0) + (u.returningUsers || 0),
        0
    );

    /* ---------- USER TREND ---------- */

    const userTrendPercent =
        previousTotalUsers > 0
            ? (
                ((currentTotalUsers - previousTotalUsers) /
                    previousTotalUsers) *
                100
            ).toFixed(1)
            : 0;

    const isUserIncrease =
        currentTotalUsers >= previousTotalUsers;

    /* ---------- SAFE % ---------- */

    const safePercent = (value, total) =>
        total > 0 ? Math.round((value / total) * 100) : 0;

    /* ---------- PIE DATA ---------- */

    const uniqueUsersData = hasUserData
        ? [
            { name: "New Users", value: currentNewUsers },
            { name: "Returning Users", value: currentReturningUsers },
        ]
        : [];

    const handleDrillDown = (metric) => {
        setDrillMetric(metric);
        setShowDrillModal(true);
    };

    /* ================= CONVERSATIONS ================= */
    /* 1️⃣ CURRENT CONVERSATIONS */
    const currentConversations = filters
        ? filterConversations(
            conversationChartData,
            filters.startDate,
            filters.endDate
        )
        : [];

    /* 2️⃣ PREVIOUS CONVERSATIONS */
    const previousConversations = previousRange
        ? filterConversations(
            conversationChartData,
            previousRange.startDate,
            previousRange.endDate
        )
        : [];

    /* 3️⃣ TOTALS (NUMBERS) */
    const currentTotalConversations = sumCounts(currentConversations);
    const previousTotalConversations = sumCounts(previousConversations);

    /* 4️⃣ FLAGS */
    const hasConversationData =
        currentTotalConversations > 0 ||
        previousTotalConversations > 0;

    /* 5️⃣ SPARKLINE (USES ARRAYS) */
    const conversationSparkData =
        currentConversations.length > 0
            ? currentConversations.map(d => ({ v: d.count }))
            : previousConversations.map(d => ({ v: d.count }));

    /* 6️⃣ TREND (USES TOTALS) */
    const conversationTrendPercent =
        previousTotalConversations > 0
            ? (
                ((currentTotalConversations - previousTotalConversations) /
                    previousTotalConversations) *
                100
            ).toFixed(1)
            : 0;

    // simulate messages per conversation (4–8 messages)
    const currentTotalMessages = currentConversations.reduce(
        (sum, c) => sum + c.count * (4 + Math.random() * 4),
        0
    );

    const previousTotalMessages = previousConversations.reduce(
        (sum, c) => sum + c.count * (4 + Math.random() * 4),
        0
    );
    /* ---------- TREND DIRECTION FLAGS ---------- */
    const currentAvgMessages =
        currentTotalConversations > 0
            ? (currentTotalMessages / currentTotalConversations).toFixed(1)
            : "—";

    const previousAvgMessages =
        previousTotalConversations > 0
            ? (previousTotalMessages / previousTotalConversations).toFixed(1)
            : "—";

    const hasConversationForAvg =
        currentTotalConversations > 0 &&
        previousTotalConversations > 0;

    const avgIsIncrease =
        Number(currentAvgMessages) > Number(previousAvgMessages);

    const avgIsDecrease =
        Number(currentAvgMessages) < Number(previousAvgMessages);

    const avgIsNoChange =
        Number(currentAvgMessages) === Number(previousAvgMessages);

    const avgChangePercent =
        hasConversationForAvg
            ? (
                ((currentAvgMessages - previousAvgMessages) /
                    previousAvgMessages) *
                100
            ).toFixed(1)
            : 0;


    // sparkline data
    const avgMessagesTrend = conversationSparkData.map(d => ({
        v: d.v / Math.max(1, currentTotalConversations),
    }));

    /* ---------- RESOLUTION RATE LOGIC ---------- */

    // current period
    const resolvedCurrent =
        currentTotalConversations > 0
            ? Math.round(currentTotalConversations * 0.84) // temp dummy logic
            : 0;

    const unresolvedCurrent =
        currentTotalConversations - resolvedCurrent;

    // previous period
    const resolvedPrevious =
        previousTotalConversations > 0
            ? Math.round(previousTotalConversations * 0.78) // temp dummy logic
            : 0;


    const isIncrease =
        currentTotalConversations > previousTotalConversations;

    const isDecrease =
        currentTotalConversations < previousTotalConversations;

    const isNoChange =
        currentTotalConversations === previousTotalConversations;

    const resolutionRate = currentTotalConversations > 0
        ? Math.round((resolvedCurrent / currentTotalConversations) * 100)
        : null;

    const previousResolutionRate = previousTotalConversations > 0
        ? Math.round((resolvedPrevious / previousTotalConversations) * 100)
        : null;

    const resolutionTrendPercent =
        previousResolutionRate !== null
            ? (resolutionRate - previousResolutionRate).toFixed(1)
            : 0;

    const resolutionIncrease =
        previousResolutionRate !== null &&
        resolutionRate > previousResolutionRate;

    const resolutionDecrease =
        previousResolutionRate !== null &&
        resolutionRate < previousResolutionRate;

    const resolutionNoChange =
        previousResolutionRate !== null &&
        resolutionRate === previousResolutionRate;

    const resolutionData =
        currentTotalConversations > 0
            ? [
                { name: "Resolved", value: resolvedCurrent },
                { name: "Unresolved", value: unresolvedCurrent },
            ]
            : [];

    // simulate response time per conversation (seconds)
    const currentTotalResponseTime = currentConversations.reduce(
        (sum, c) => sum + c.count * (0.8 + Math.random() * 1.2),
        0
    );

    const previousTotalResponseTime = previousConversations.reduce(
        (sum, c) => sum + c.count * (1.0 + Math.random() * 1.5),
        0
    );

    const currentAvgResponseTime =
        currentTotalConversations > 0
            ? (currentTotalResponseTime / currentTotalConversations).toFixed(2)
            : "—";

    const previousAvgResponseTime =
        previousTotalConversations > 0
            ? (previousTotalResponseTime / previousTotalConversations).toFixed(2)
            : "—";

    const responseIsFaster =
        Number(currentAvgResponseTime) < Number(previousAvgResponseTime);

    const responseIsSlower =
        Number(currentAvgResponseTime) > Number(previousAvgResponseTime);

    const responseNoChange =
        Number(currentAvgResponseTime) === Number(previousAvgResponseTime);

    const responseStatus =
        currentAvgResponseTime === "—"
            ? "No data"
            : Number(currentAvgResponseTime) < 1
                ? "Fast"
                : Number(currentAvgResponseTime) < 2
                    ? "Normal"
                    : "Slow";

                    const responseDist =
    currentTotalConversations > 0
        ? [
              { name: "< 1s", value: Math.round(currentTotalConversations * 0.45) },
              { name: "1-2s", value: Math.round(currentTotalConversations * 0.35) },
              { name: "> 2s", value: Math.round(currentTotalConversations * 0.20) },
          ]
        : [];


    return (
        <div className="g-3 h-100">
            <Row className="g-2">

                {/* TOTAL CONVERSATIONS */}                
                <Col md={4}>
                    <Card
                        className="rounded-4 shadow-sm mt-2 analytics-card h-100 cursor-pointer"
                        onClick={() => handleDrillDown("total_conversations")}
                    >
                        <Card.Body>

                            {/* TITLE */}
                            <div className="text-muted small">
                                Total Conversations
                            </div>

                            {/* LARGE NUMBER */}
                            <h3 className="fw-bold mt-2">
                                {hasConversationData
                                    ? currentTotalConversations.toLocaleString()
                                    : "--"}
                            </h3>

                            {/* TREND VS PREVIOUS */}
                            {hasConversationData && (
                                <div
                                    className={`small fw-semibold p-2 mb-4 ${isIncrease
                                        ? "text-success"
                                        : isDecrease
                                            ? "text-danger"
                                            : "text-muted"
                                        }`}
                                >
                                    {isIncrease && "▲ "}
                                    {isDecrease && "▼ "}
                                    {isNoChange && "— "}
                                    {Math.abs(conversationTrendPercent)}% vs previous period
                                </div>
                            )}

                            {/* SPARKLINE */}
                            {conversationSparkData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={80}>
                                    <LineChart data={conversationSparkData}>
                                        <Line
                                            dataKey="v"
                                            stroke={
                                                isIncrease
                                                    ? "#198754"
                                                    : isDecrease
                                                        ? "#dc3545"
                                                        : "#6c757d"
                                            }
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div
                                    className="d-flex align-items-center justify-content-center text-muted"
                                    style={{ height: 80 }}
                                >
                                    No data available
                                </div>
                            )}

                        </Card.Body>
                    </Card>
                </Col>


                <Modal
                    show={showDrillModal}
                    onHide={() => setShowDrillModal(false)}
                    size="lg"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Total Conversations – Drill Down
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {/* SUMMARY */}
                        <Row className="mb-3 text-center text-md-start">
                            <Col xs={12} md={4} className="mb-2 mb-md-0">
                                <div className="text-muted small">Current Period</div>
                                <h5 className="fw-bold">
                                    {currentTotalConversations.toLocaleString()}
                                </h5>
                            </Col>

                            <Col xs={12} md={4} className="mb-2 mb-md-0">
                                <div className="text-muted small">Previous Period</div>
                                <h5 className="fw-bold">
                                    {previousTotalConversations > 0
                                        ? previousTotalConversations.toLocaleString()
                                        : "—"}
                                </h5>
                            </Col>
                            <Col xs={12} md={4}>
                                <div className="text-muted small">Change</div>
                                <h5
                                    className={`fw-bold ${isIncrease
                                        ? "text-success"
                                        : isDecrease
                                            ? "text-danger"
                                            : "text-muted"
                                        }`}
                                >
                                    {isIncrease && "▲ "}
                                    {isDecrease && "▼ "}
                                    {isNoChange && "— "}
                                    {Math.abs(conversationTrendPercent)}%
                                </h5>
                            </Col>
                        </Row>

                        {/* DRILL-DOWN CHART */}
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                                data={currentConversations.map(d => ({
                                    x: d.timestamp || d.date,
                                    total: d.count,
                                }))}
                            >
                                <XAxis
                                    dataKey="x"
                                    tickFormatter={(v) =>
                                        isTimestampView
                                            ? new Date(v).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })
                                            : v
                                    }
                                />
                                <YAxis />
                                <Tooltip
                                    labelFormatter={(v) =>
                                        isTimestampView
                                            ? new Date(v).toLocaleString()
                                            : v
                                    }
                                />
                                <Line
                                    dataKey="total"
                                    stroke="#0d6efd"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setShowDrillModal(false)}
                        >
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>


                {/* UNIQUE USERS */}
                <Col md={4}>
                    <Card className="rounded-4 shadow-sm mt-2 analytics-card h-100">
                        <Card.Body>

                            <div className="text-muted small">Unique Users</div>

                            {/* TOTAL */}
                            <h3 className="fw-bold mt-2">
                                {hasUserData ? currentTotalUsers.toLocaleString() : "--"}
                            </h3>

                            {/* SPLIT */}
                            {hasUserData ? (
                                <div className="small text-muted mb-1">
                                    New <strong>{safePercent(currentNewUsers, currentTotalUsers)}%</strong>
                                    {" · "}
                                    Returning <strong>
                                        {safePercent(currentReturningUsers, currentTotalUsers)}%
                                    </strong>
                                </div>
                            ) : (
                                <div className="small text-muted mb-1">
                                    No user data available
                                </div>
                            )}

                            {/* ✅ ALWAYS COMPARE */}
                            {hasUserData && previousTotalUsers > 0 && (
                                <div
                                    className={`small fw-semibold mb-2 ${isUserIncrease ? "text-success" : "text-danger"
                                        }`}
                                >
                                    {isUserIncrease ? "▲" : "▼"}{" "}
                                    {Math.abs(userTrendPercent)}% vs previous period
                                </div>
                            )}

                            {/* PIE */}
                            <div className="pie-chart-wrapper">
                                {hasUserData ? (
                                    <ResponsiveContainer width="100%" height={120}>
                                        <PieChart>
                                            <Pie
                                                data={uniqueUsersData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={30}
                                                outerRadius={45}
                                                paddingAngle={2}
                                            >
                                                {uniqueUsersData.map((_, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={INTENT_COLORS[index]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div
                                        className="d-flex align-items-center justify-content-center text-muted"
                                        style={{ height: 120 }}
                                    >
                                        No data available
                                    </div>
                                )}
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

                            <h3 className="fw-bold mt-2">
                                {currentAvgMessages}
                            </h3>

                            {hasConversationForAvg ? (
                                <div
                                    className={`small fw-semibold ${avgIsIncrease
                                        ? "text-success"
                                        : avgIsDecrease
                                            ? "text-danger"
                                            : "text-muted"
                                        }`}
                                >
                                    {avgIsIncrease && "▲ "}
                                    {avgIsDecrease && "▼ "}
                                    {avgIsNoChange && "— "}
                                    {Math.abs(avgChangePercent)}% vs previous period
                                </div>
                            ) : (
                                <div className="small fw-semibold text-muted">
                                    No previous data
                                </div>
                            )}

                            {avgMessagesTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height={120}>
                                    <LineChart data={avgMessagesTrend}>
                                        <Line
                                            dataKey="v"
                                            stroke={
                                                avgIsIncrease
                                                    ? "#198754"
                                                    : avgIsDecrease
                                                        ? "#dc3545"
                                                        : "#6c757d"
                                            }
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div
                                    className="d-flex align-items-center justify-content-center text-muted"
                                    style={{ height: 120 }}
                                >
                                    No data available
                                </div>
                            )}

                        </Card.Body>
                    </Card>
                </Col>

                {/* RESOLUTION RATE */}
                <Col md={4}>
                    <Card className="rounded-4 shadow-sm mt-2 analytics-card h-100">
                        <Card.Body>

                            {/* TITLE */}
                            <div className="text-muted small">
                                Resolution Rate
                            </div>

                            {/* BIG NUMBER */}
                            <h3 className="fw-bold mt-2">
                                {resolutionRate !== null ? `${resolutionRate}%` : "—"}
                            </h3>

                            {/* TREND */}
                            {previousResolutionRate !== null ? (
                                <div
                                    className={`small fw-semibold ${resolutionIncrease
                                        ? "text-success"
                                        : resolutionDecrease
                                            ? "text-danger"
                                            : "text-muted"
                                        }`}
                                >
                                    {resolutionIncrease && "▲ "}
                                    {resolutionDecrease && "▼ "}
                                    {resolutionNoChange && "— "}
                                    {Math.abs(resolutionTrendPercent)}% vs previous period
                                </div>
                            ) : (
                                <div className="small fw-semibold text-muted">
                                    No previous data
                                </div>
                            )}

                            {/* DONUT */}
                            {resolutionData.length > 0 ? (
                                <Row className="align-items-center mt-2">
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
                                                >
                                                    {resolutionData.map((_, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={INTENT_COLORS[index]}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Col>

                                    <Col xs={7}>
                                        <div className="small text-muted">
                                            Resolved: {resolvedCurrent}
                                        </div>
                                        <div className="small text-muted">
                                            Unresolved: {unresolvedCurrent}
                                        </div>
                                    </Col>
                                </Row>
                            ) : (
                                <div className="small text-muted mt-3">
                                    No data available
                                </div>
                            )}

                        </Card.Body>
                    </Card>
                </Col>

                {/* AVG RESPONSE TIME */}
                <Col md={4}>
                    <Card className="rounded-4 shadow-sm mt-2 analytics-card h-100">
                        <Card.Body>

                            <div className="text-muted small">
                                Avg Response Time
                            </div>

                            <h3
                                className={`fw-bold mt-2 ${responseIsFaster
                                    ? "text-success"
                                    : responseIsSlower
                                        ? "text-danger"
                                        : "text-muted"
                                    }`}
                            >
                                {currentAvgResponseTime !== "—"
                                    ? `${currentAvgResponseTime}s`
                                    : "—"}
                            </h3>

                            <div className="small text-muted">
                                {responseStatus}
                            </div>

                            {responseDist.length > 0 ? (
                                <ResponsiveContainer width="100%" height={120}>
                                    <PieChart>
                                        <Pie
                                            data={responseDist}
                                            dataKey="value"
                                            innerRadius={30}
                                            outerRadius={45}
                                        >
                                            {responseDist.map((_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={INTENT_COLORS[index]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="small text-muted mt-3">
                                    No data available
                                </div>
                            )}

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