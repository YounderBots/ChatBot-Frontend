import React, { useState, useRef, useEffect } from "react";
import { Card, Row, Col, Form, Button, Modal, Badge, Table, } from "react-bootstrap";
import { FaSortUp, FaSortDown, FaFileCsv, FaEye } from "react-icons/fa";
import '../Analytics.css'

const intentData = [
    {
        intent: "Order Status",
        uses: 820,
        confidence: 0.92,
        successRate: 88,
        avgTime: 1.2,
        feedback: 4.5,
        trend: 6.8,
    },
    {
        intent: "Refund",
        uses: 610,
        confidence: 0.81,
        successRate: 79,
        avgTime: 1.6,
        feedback: 4.1,
        trend: -1.9,
    },
    {
        intent: "Cancel Order",
        uses: 540,
        confidence: 0.75,
        successRate: 72,
        avgTime: 1.9,
        feedback: 3.9,
        trend: -3.4,
    },
    {
        intent: "Delivery Delay",
        uses: 430,
        confidence: 0.68,
        successRate: 64,
        avgTime: 2.3,
        feedback: 3.6,
        trend: 2.1,
    },
];

const userEngagementData = [
    {
        session: "S-9832",
        platform: "Web",
        messages: 14,
        duration: "6m 12s",
        intents: 5,
        status: "Resolved",
        satisfaction: "Satisfied",
        lastActive: "2 mins ago",
    },
    {
        session: "S-9838",
        platform: "Mobile",
        messages: 6,
        duration: "2m 45s",
        intents: 2,
        status: "Escalated",
        satisfaction: "Neutral",
        lastActive: "5 mins ago",
    },
];

const tableColumns = [
    { key: "intent", label: "Intent Name" },
    { key: "uses", label: "Total Uses" },
    { key: "confidence", label: "Avg Confidence (%)" },
    { key: "successRate", label: "Success Rate (%)" },
    { key: "avgTime", label: "Avg Response Time (s)" },
    { key: "feedback", label: "Feedback Score" },
    { key: "trend", label: "Trend (7d %)" },
];

const defaultSort = {
    key: "uses",
    direction: "desc",
};

const AnalyticsTables = () => {
    const [sortConfig, setSortConfig] = useState(defaultSort);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [pendingSort, setPendingSort] = useState(defaultSort);
    const [selectedIntent, setSelectedIntent] = useState(null);
    const [showIntentModal, setShowIntentModal] = useState(false);
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);

    const exportCSV = () => {
        const headers = [
            "Intent Name",
            "Total Uses",
            "Avg Confidence",
            "Success Rate",
            "Avg Response Time",
            "Feedback Score",
            "Trend (7d %)",
        ];

        const rows = sortedData.map((i) => [
            i.intent,
            i.uses,
            i.confidence,
            i.successRate,
            i.avgTime,
            i.feedback,
            i.trend,
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers, ...rows].map((e) => e.join(",")).join("\n");

        const link = document.createElement("a");
        link.href = encodeURI(csvContent);
        link.download = `intent_performance_${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;
        link.click();
    };

    const sortedData = [...intentData].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
            return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
            return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
    });

    const applyTableFilter = () => {
        setSortConfig(pendingSort);
        setShowFilterModal(false);
    };

    const handleViewDetails = (row) => {
        const intentDetails = intentData.find(
            (item) => item.intent === row.intent
        );

        setSelectedIntent(intentDetails);
        setShowIntentModal(true);
    };

    return (
        <div className="g-2 p-100" >
            <Row className="g-2">
                <Col md={12}>
                    <Card className="rounded-4 shadow-sm analytics-card">
                        <Card.Body className="analytics-card-body">
                            <div className="d-flex justify-content-between align-items-center h-100">
                                <h5 className="mb-0">Intent Performance</h5>

                                <div className="d-flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline-secondary"
                                        className="border border-secondary"
                                        onClick={() => setShowFilterModal(true)}
                                    >
                                        Apply Filter
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline-secondary"
                                        className="border border-secondary"
                                        onClick={exportCSV}
                                    >
                                        Export CSV
                                    </Button>
                                </div>
                            </div>
                            <Card.Body className="p-2 ">
                                <Table responsive hover className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            {[
                                                { key: "intent", label: "Intent Name" },
                                                { key: "uses", label: "Total Uses" },
                                                { key: "confidence", label: "Avg Confidence (%)" },
                                                { key: "successRate", label: "Success Rate (%)" },
                                                { key: "avgTime", label: "Avg Response Time (s)" },
                                                { key: "feedback", label: "Feedback Score" },
                                                { key: "trend", label: "Trend (7d %)" },
                                            ].map((col) => (
                                                <th
                                                    key={col.key}
                                                >
                                                    {col.label}{" "}
                                                    {sortConfig.key === col.key &&
                                                        (sortConfig.direction === "asc" ? (
                                                            <FaSortUp />
                                                        ) : (
                                                            <FaSortDown />
                                                        ))}
                                                </th>
                                            ))}
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {sortedData.map((row, index) => (
                                            <tr key={index}>
                                                <td>{row.intent}</td>
                                                <td>{row.uses}</td>
                                                <td>{row.confidence}%</td>
                                                <td>{row.successRate}%</td>
                                                <td>{row.avgTime}s</td>
                                                <td>{row.feedback}</td>
                                                <td>  {row.trend <= 0 ? "-" : " "}
                                                    {Math.abs(row.trend)}%</td>
                                                <td>
                                                    <Button
                                                        size="sm"
                                                        variant="outline-secondary"
                                                        className="border border-secondary"
                                                        onClick={() => handleViewDetails(row)}
                                                    >
                                                        View
                                                    </Button>

                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card.Body>
                    </Card>
                </Col>

                {/*--------------- Table Filter ---------------*/}
                <Modal
                    show={showFilterModal}
                    onHide={() => setShowFilterModal(false)}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Apply Table Filter</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {tableColumns.map((col) => (
                            <Row key={col.key} className="align-items-center mb-3">
                                <Col md={5}>
                                    <strong>{col.label}</strong>
                                </Col>
                                <Col md={7} className="d-flex gap-4">
                                    <Form.Check
                                        type="radio"
                                        name={`sort-${col.key}`}
                                        checked={
                                            pendingSort.key === col.key &&
                                            pendingSort.direction === "asc"
                                        }
                                        onChange={() =>
                                            setPendingSort({ key: col.key, direction: "asc" })
                                        }
                                        label={
                                            <span className="small fw-medium ms-2 mt-2">
                                                ASC
                                            </span>
                                        }
                                    />

                                    <Form.Check
                                        type="radio"
                                        name={`sort-${col.key}`}
                                        checked={
                                            pendingSort.key === col.key &&
                                            pendingSort.direction === "desc"
                                        }
                                        onChange={() =>
                                            setPendingSort({ key: col.key, direction: "desc" })
                                        }
                                        label={
                                            <span className="small fw-medium ms-2 mt-2">
                                                DESC
                                            </span>
                                        }
                                    />
                                </Col>
                            </Row>
                        ))}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            size="sm"
                            variant="outline-danger"
                            className="px-3 border border-danger"
                            onClick={() => setShowFilterModal(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            size="sm"
                            variant="outline-success"
                            className="px-3 border border-success"
                            onClick={applyTableFilter}
                        >
                            Apply
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* ------------------ Intent Details -------------------- */}
                <Modal
                    show={!!selectedIntent}
                    onHide={() => setSelectedIntent(null)}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Intent Details</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {selectedIntent ? (
                            <>
                                <p><strong>Intent Name:</strong> {selectedIntent.intent}</p>
                                <p><strong>Total Uses:</strong> {selectedIntent.uses}</p>
                                <p>
                                    <strong>Avg Confidence:</strong>{" "}
                                    {Math.round(selectedIntent.confidence * 100)}%
                                </p>
                                <p>
                                    <strong>Success Rate:</strong> {selectedIntent.successRate}%
                                </p>
                                <p>
                                    <strong>Avg Response Time:</strong> {selectedIntent.avgTime}s
                                </p>
                                <p>
                                    <strong>Feedback Score:</strong> {selectedIntent.feedback}
                                </p>
                                <p>
                                    <strong>7-Day Trend:</strong>{" "}
                                    {selectedIntent.trend >= 0 ? "▲" : "▼"}{" "}
                                    {Math.abs(selectedIntent.trend)}%
                                </p>
                            </>
                        ) : (
                            <div className="text-muted">No data available</div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            size="sm"
                            variant="outline-danger"
                            className="px-3 border border-danger"
                            onClick={() => setSelectedIntent(null)}
                        >
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Col md={12}>
                    <Card className="rounded-4 shadow-sm analytics-card">
                        <Card.Body className="analytics-card-body">
                            <h5 className="mb-3">User Engagement</h5>

                            <Table responsive hover className="mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>User / Session ID</th>
                                        <th>Platform</th>
                                        <th>Total Messages</th>
                                        <th>Duration</th>
                                        <th>Intents Triggered</th>
                                        <th>Resolution Status</th>
                                        <th>Satisfaction</th>
                                        <th>Last Active</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {userEngagementData.map((row, index) => (
                                        <tr key={index}>
                                            <td>{row.session}</td>
                                            <td>{row.platform}</td>
                                            <td>{row.messages}</td>
                                            <td>{row.duration}</td>
                                            <td>{row.intents}</td>
                                            <td>
                                                <Badge
                                                    bg={
                                                        row.status === "Resolved"
                                                            ? "success"
                                                            : row.status === "Escalated"
                                                                ? "warning"
                                                                : "secondary"
                                                    }
                                                >
                                                    {row.status}
                                                </Badge>
                                            </td>
                                            <td>{row.satisfaction}</td>
                                            <td>{row.lastActive}</td>
                                            <td>
                                                <Button
                                                    size="sm"
                                                    variant="outline-secondary"
                                                    className=" border border-secondary"
                                                    onClick={() => {
                                                        setSelectedSession(row);
                                                        setShowSessionModal(true);
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                <Modal
                    show={showSessionModal}
                    onHide={() => setShowSessionModal(false)}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Session Details</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {selectedSession && (
                            <>
                                <p><strong>Session ID:</strong> {selectedSession.session}</p>
                                <p><strong>Platform:</strong> {selectedSession.platform}</p>
                                <p><strong>Total Messages:</strong> {selectedSession.messages}</p>
                                <p><strong>Duration:</strong> {selectedSession.duration}</p>
                                <p><strong>Intents Triggered:</strong> {selectedSession.intents}</p>
                                <p><strong>Resolution Status:</strong> {selectedSession.status}</p>
                                <p><strong>Satisfaction:</strong> {selectedSession.satisfaction}</p>
                                <p><strong>Last Active:</strong> {selectedSession.lastActive}</p>
                            </>
                        )}
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            size="sm"
                            variant="outline-danger"
                            className="px-3 border border-danger"
                            onClick={() => setShowSessionModal(false)}
                        >
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Row>
        </div>
    )
}

export default AnalyticsTables