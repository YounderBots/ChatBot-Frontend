import React, { useState } from "react";

const TestPanel = ({ isOpen, onClose }) => {
    const [input, setInput] = useState("");
    const [result, setResult] = useState(null);

    // Mock test execution (replace with real API later)
    const runTest = () => {
        if (!input.trim()) return;

        setResult({
            intent: "balance",
            confidence: 98,
            response: "Your current balance is $1,250.00.",
            entities: [
                { name: "account_type", value: "savings" }
            ],
            contextChanges: {
                balance_checked: true
            }
        });
    };

    const clearTest = () => {
        setInput("");
        setResult(null);
    };

    const confidenceColor =
        result?.confidence >= 80
            ? "text-success"
            : result?.confidence >= 50
            ? "text-warning"
            : "text-danger";

    return (
        <div
            className={`offcanvas offcanvas-end ${isOpen ? "show" : ""}`}
            tabIndex="-1"
            style={{
                visibility: isOpen ? "visible" : "hidden",
                width: "380px"
            }}
        >
            {/* Header */}
            <div className="offcanvas-header bg-primary text-white">
                <h5 className="offcanvas-title fw-bold">Test Bot</h5>
                <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={onClose}
                />
            </div>

            {/* Body */}
            <div className="offcanvas-body bg-light p-3 d-flex flex-column">
                {/* Chat Area */}
                <div className="flex-fill overflow-auto mb-3">
                    {input && (
                        <div className="d-flex justify-content-end mb-3">
                            <div
                                className="bg-primary text-white p-3 shadow-sm"
                                style={{
                                    maxWidth: "85%",
                                    borderRadius: "12px 12px 4px 12px"
                                }}
                            >
                                {input}
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className="d-flex justify-content-start mb-3">
                            <div
                                className="bg-white p-3 shadow-sm"
                                style={{
                                    maxWidth: "85%",
                                    borderRadius: "12px 12px 12px 4px"
                                }}
                            >
                                {/* Intent */}
                                <div className="mb-2">
                                    <span className="badge bg-success">
                                        Matched Intent
                                    </span>
                                    <div className="fw-semibold mt-1">
                                        {result.intent}
                                    </div>
                                </div>

                                <div className={`fs-4 fw-bold ${confidenceColor}`}>
                                    {result.confidence}%
                                </div>

                                <div className="mt-2">
                                    <div className="text-muted small">
                                        Response
                                    </div>
                                    {result.response}
                                </div>

                                <div className="mt-3">
                                    <div className="text-muted small">
                                        Entities Extracted
                                    </div>
                                    {result.entities.length === 0 ? (
                                        <div className="text-muted fst-italic">
                                            None
                                        </div>
                                    ) : (
                                        result.entities.map((e, i) => (
                                            <span
                                                key={i}
                                                className="badge bg-secondary me-1"
                                            >
                                                {e.name}: {e.value}
                                            </span>
                                        ))
                                    )}
                                </div>

                                {/* Context */}
                                <div className="mt-3">
                                    <div className="text-muted small">
                                        Context Changes
                                    </div>
                                    <pre className="bg-light p-2 rounded small mb-0">
                                        {JSON.stringify(
                                            result.contextChanges,
                                            null,
                                            2
                                        )}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Clear Button */}
                {result && (
                    <button
                        className="btn btn-outline-danger btn-sm mb-2"
                        onClick={clearTest}
                    >
                        Clear Test
                    </button>
                )}
            </div>

            {/* Input */}
            <div className="p-3 border-top bg-white d-flex gap-2">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Type a test message"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && runTest()}
                />
                <button className="btn btn-primary px-3" onClick={runTest}>
                    ➤
                </button>
            </div>
        </div>
    );
};

export default TestPanel;
