import React, { useState, useRef, useEffect } from "react";
import { Card, Row, Col, Form, Button } from "react-bootstrap";
import {
    LineChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Legend,
    Cell,
    FunnelChart,
    Funnel,
    LabelList,

} from "recharts";
import html2canvas from "html2canvas";
import { Tooltip as BootstrapTooltip } from "bootstrap";

const conversationTrendData = [
    { time: "Mon", total: 420, resolved: 310, escalated: 70, failed: 40 },
    { time: "Tue", total: 520, resolved: 390, escalated: 80, failed: 50 },
    { time: "Wed", total: 610, resolved: 470, escalated: 90, failed: 50 },
    { time: "Thu", total: 680, resolved: 540, escalated: 80, failed: 60 },
    { time: "Fri", total: 720, resolved: 580, escalated: 90, failed: 50 },
    { time: "Sat", total: 420, resolved: 310, escalated: 70, failed: 40 },
];

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

const confidenceHistogram = [
    { range: "0-20%", count: 120 },
    { range: "20-40%", count: 260 },
    { range: "40-60%", count: 380 },
    { range: "60-80%", count: 520 },
    { range: "80-100%", count: 710 },
];

const sentimentData = [
    { day: "Mon", positive: 60, neutral: 25, negative: 15 },
    { day: "Tue", positive: 62, neutral: 23, negative: 15 },
    { day: "Wed", positive: 58, neutral: 27, negative: 15 },
    { day: "Thu", positive: 64, neutral: 22, negative: 14 },
    { day: "Fri", positive: 44, neutral: 27, negative: 15 },
    { day: "Sat", positive: 70, neutral: 27, negative: 15 },
];

const FunnelData = [
    { stage: "Session Started", value: 12000 },
    { stage: "Message Sent", value: 9400 },
    { stage: "Intent Matched", value: 7100 },
    { stage: "Resolved", value: 5200 },
    { stage: "Feedback Given", value: 3100 },
];


const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 24 }, (_, i) => i);

/* Heatmap volume data */
const heatmapData = {
    Mon: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)),
    Tue: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)),
    Wed: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)),
    Thu: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)),
    Fri: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)),
    Sat: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)),
    Sun: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)),
};

const AnalyticsCharts = () => {
    const [sortBy, setSortBy] = useState("usage");
    const [confidenceFilter, setConfidenceFilter] = useState(null);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        const tooltipElements = document.querySelectorAll(
            '[data-bs-toggle="tooltip"]'
        );

        tooltipElements.forEach(el => {
            if (el._bsTooltip) return;

            el._bsTooltip = new BootstrapTooltip(el, {
                html: true,
                placement: "top",
                container: "body",
                boundary: "window",
                trigger: window.innerWidth < 768 ? "click" : "hover",
            });
        });

        return () => {
            tooltipElements.forEach(el => {
                el._bsTooltip?.dispose();
                el._bsTooltip = null;
            });
        };
    }, []);

    const sortedIntentData = [...intentData]
        .sort((a, b) => {
            if (sortBy === "usage") return b.uses - a.uses;
            if (sortBy === "confidence") return b.confidence - a.confidence;
            if (sortBy === "name") return a.intent.localeCompare(b.intent);
            return 0;
        })
        .slice(0, 20);

    /* Color by confidence */
    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.85) return "#198754";
        if (confidence >= 0.65) return "#fd7e14";
        return "#dc3545";
    };


    const exportPNG = async () => {
        if (!chartRef.current) {
            console.error("Export failed: chartRef is null");
            return;
        }

        setExporting(true);

        try {
            const canvas = await html2canvas(chartRef.current, {
                useCORS: true,
                backgroundColor: "#ffffff",
            });

            const link = document.createElement("a");
            link.download = "conversation-volume.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (err) {
            console.error("Export error:", err);
        } finally {
            setExporting(false);
        }
    };


    const handleConfidenceFilter = (range) => {
        setConfidenceFilter(range);
    };

    const getHeatClass = (count) => {
        if (count >= 70) return "heatmap-peak";
        if (count <= 25) return "heatmap-offpeak";
        return "heatmap-normal";
    };
    const chartRef = useRef(null);

    return (
        <div className="g-2 p-100" >
            {/* ================== CHART 1 (12 COL) ================== */}
            <Row className="g-2">
                <Col sm={12}>
                    <Card className="rounded-4 shadow-sm mt-2 analytics-card">
                        <Card.Body className="analytics-chart-body">
                            {/* Header */}
                            <div className="analytics-chart-header">
                                <h6 className="fw-semibold mb-0">
                                    Conversation Volume Trend
                                </h6>
                                <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={exportPNG}
                                    disabled={exporting}
                                >
                                    {exporting ? "Exporting..." : "Export PNG"}
                                </Button>
                            </div>

                            {/* Chart */}
                            <div ref={chartRef} className="analytics-chart-container">
                                <ResponsiveContainer width="100%" height={420}>
                                    <LineChart
                                        data={conversationTrendData}
                                        margin={{ top: 10, right: 20, left: 10, bottom: 55 }}
                                    >
                                        <XAxis dataKey="time" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={40}
                                            iconSize={8}
                                        />

                                        <Line dataKey="total" stroke="#0d6efd" strokeWidth={2} dot={false} />
                                        <Line dataKey="resolved" stroke="#198754" strokeWidth={2} dot={false} />
                                        <Line dataKey="escalated" stroke="#fd7e14" strokeWidth={2} dot={false} />
                                        <Line dataKey="failed" stroke="#dc3545" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col >

                {/* ================== CHART 2 (6 COL) ================== */}
                <Col lg={6} sm={12}>
                    <Card className="rounded-4 shadow-sm analytics-card mt-2">
                        <Card.Body>
                            {/* Header */}
                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                                <h6 className="fw-semibold mb-0">
                                    Intent Performance
                                </h6>
                                <Form.Select
                                    size="sm"
                                    className="w-auto"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="usage">Sort by Usage</option>
                                    <option value="confidence">Sort by Confidence</option>
                                    <option value="name">Sort by Name</option>
                                </Form.Select>
                            </div>

                            {/* Chart */}
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart layout="vertical" data={sortedIntentData}>
                                    <XAxis type="number" />
                                    <YAxis dataKey="intent" type="category" width={140} />
                                    <Tooltip />
                                    <Bar
                                        dataKey="uses"
                                        radius={[0, 6, 6, 0]}
                                    >
                                        {sortedIntentData.map((entry, index) => (
                                            <Cell
                                                key={index}
                                                fill={getConfidenceColor(entry.confidence)}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                {/* ================== CHART 3 (6 COL) ================== */}
                <Col lg={6} sm={12}>
                    <Card className="rounded-4 shadow-sm analytics-card mt-2" style={{ height: "98%" }}>
                        <Card.Body className="analytics-card-body">

                            <h6 className="fw-semibold mb-3 analytics-card-title">
                                Confidence Distribution
                            </h6>

                            <div className="analytics-chart-container">
                                <ResponsiveContainer width="100%" height={314}>

                                    <BarChart data={confidenceHistogram}>
                                        <XAxis dataKey="range" />
                                        <YAxis />
                                        <Tooltip />

                                        <Bar
                                            dataKey="count"
                                            radius={[6, 6, 0, 0]}
                                            onClick={(data) =>
                                                handleConfidenceFilter(data.range)
                                            }
                                        >
                                            {confidenceHistogram.map((entry, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={
                                                        entry.range.startsWith("0") ||
                                                            entry.range.startsWith("20") ||
                                                            entry.range.startsWith("40")
                                                            ? "#dc3545"
                                                            : "#0d6efd"
                                                    }
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                        </Card.Body>
                    </Card>
                </Col>

                {/* ================== CHART 4 (12 COL) ================== */}
                <Col sm={12}>
                    <Card className="rounded-4 shadow-sm analytics-card mt-2">
                        <Card.Body className="analytics-card-body">

                            <h6 className="analytics-card-title mt-2 ">
                                Sentiment Analysis
                            </h6>

                            <div className="analytics-chart-container">
                                <ResponsiveContainer width="100%" height={320}>
                                    <AreaChart
                                        data={sentimentData}
                                        stackOffset="expand"
                                    >
                                        <XAxis dataKey="day" />
                                        <YAxis
                                            tickFormatter={(v) => `${Math.round(v * 100)}%`}
                                        />
                                        <Tooltip
                                            formatter={(value) =>
                                                `${Math.round(value * 100)}%`
                                            }
                                        />
                                        <Legend />

                                        <Area
                                            dataKey="positive"
                                            stackId="1"
                                            stroke="#198754"
                                            fill="#198754"
                                        />
                                        <Area
                                            dataKey="neutral"
                                            stackId="1"
                                            stroke="#adb5bd"
                                            fill="#adb5bd"
                                        />
                                        <Area
                                            dataKey="negative"
                                            stackId="1"
                                            stroke="#dc3545"
                                            fill="#dc3545"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                        </Card.Body>
                    </Card>
                </Col>

                {/* ================== CHART 5 (6 COL) ================== */}
                <Col sm={12}>
                    <Card className="rounded-4 shadow-sm analytics-card mt-2 ">
                        <Card.Body className="d-flex flex-column p-3 p-md-4">

                            {/* TITLE */}
                            <h6 className="fw-semibold mb-3 mb-md-4">
                                Peak Hours Heatmap
                            </h6>

                            {/* HEATMAP LAYOUT */}
                            <div className="analytics-heatmap-layout flex-grow-1">
                                {/* DAYS */}
                                <div className="heatmap-days">
                                    {days.map((day) => (
                                        <span key={day}>
                                            <span className="d-md-none">
                                                {day.slice(0, 3)}
                                            </span>

                                            <span className="d-none d-md-inline">
                                                {day}
                                            </span>
                                        </span>
                                    ))}
                                </div>

                                {/* SCROLLABLE AREA */}
                                <div className="heatmap-scroll flex-grow-1">
                                    <div className="heatmap-hours d-md-none">
                                        {hours.map((h) => (
                                            <span key={h}>{h}</span>
                                        ))}
                                    </div>
                                    <div className="heatmap-hours d-none d-md-grid">
                                        {hours.map((h) => (
                                            <span key={h}>{h}</span>
                                        ))}
                                    </div>

                                    {/* GRID */}
                                    <div className="heatmap-grid w-100 h-100">
                                        {days.map((day) =>
                                            hours.map((hour) => {
                                                const count = heatmapData?.[day]?.[hour] ?? 0;

                                                return (
                                                    <div
                                                        key={`${day}-${hour}`}
                                                        className={`heatmap-cell ${getHeatClass(count)}`}
                                                        data-bs-toggle="tooltip"
                                                        data-bs-placement="top"
                                                        data-bs-html="true"
                                                        data-bs-title={`
                                            <strong>${day}</strong><br/>
                                            <strong>Time:</strong> ${hour}:00<br/>
                                            <strong>Count:</strong> ${count}
                                        `}
                                                    />
                                                );
                                            })
                                        )}
                                    </div>

                                </div>
                            </div>

                        </Card.Body>
                    </Card>
                </Col>



                {/* ================== CHART 6 (6 COL) ================== */}
                <Col sm={12}>
                    <Card className="rounded-4 shadow-sm analytics-card mt-2">
                        <Card.Body>
                            <h6 className="fw-semibold mb-3"> User Journey Funnel </h6>
                            <ResponsiveContainer width="100%" height={360}>
                                <FunnelChart>
                                    <Tooltip />
                                    <
                                        Funnel data={FunnelData} dataKey="value" isAnimationActive={false} >
                                        <LabelList
                                            dataKey="stage"
                                            position="center"
                                            fill="#ffffffff"
                                        />
                                    </Funnel>
                                </FunnelChart>
                            </ResponsiveContainer>
                            <div className="mt-3">
                                {FunnelData.slice(0, -1).map((step, index) => {
                                    const next = FunnelData[index + 1];
                                    const conversion = Math.round((next.value / step.value) * 100);
                                    return (
                                        <div key={step.stage} className="d-flex justify-content-between small text-muted mb-1" >
                                            <span> {step.stage} → {next.stage} → {conversion}% conversion </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>

    );
};

export default AnalyticsCharts