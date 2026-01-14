import React, { useState } from 'react';

const QuickRepliesTab = () => {
    const MAX_BUTTONS = 5;

    const [buttons, setButtons] = useState([]);

    const addButton = () => {
        if (buttons.length >= MAX_BUTTONS) return;

        setButtons([
            ...buttons,
            {
                id: Date.now(),
                text: '',
                actionType: 'message',
                value: '',
            },
        ]);
    };

    const updateButton = (id, field, value) => {
        setButtons(prev =>
            prev.map(btn =>
                btn.id === id ? { ...btn, [field]: value } : btn
            )
        );
    };

    const deleteButton = id => {
        setButtons(prev => prev.filter(btn => btn.id !== id));
    };

    return (
        <div className="container-fluid px-0">
            <p className="text-secondary mb-3 fs-6">
                Add quick reply buttons to this response.
            </p>

            <div className="mb-4">
                {buttons.map((btn, index) => (
                    <div
                        key={btn.id}
                        className="card mb-3 shadow-sm border-0"
                    >
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0">
                                    Button {index + 1}
                                </h6>
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => deleteButton(btn.id)}
                                >
                                    Delete
                                </button>
                            </div>

                            <div className="row g-3">
                                {/* Button Text */}
                                <div className="col-md-4">
                                    <label className="form-label">
                                        Button Text
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. Check Balance"
                                        value={btn.text}
                                        onChange={e =>
                                            updateButton(
                                                btn.id,
                                                'text',
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                {/* Action Type */}
                                <div className="col-md-4">
                                    <label className="form-label">
                                        Action Type
                                    </label>
                                    <select
                                        className="form-select"
                                        value={btn.actionType}
                                        onChange={e =>
                                            updateButton(
                                                btn.id,
                                                'actionType',
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="message">
                                            Send Message
                                        </option>
                                        <option value="url">
                                            Open URL
                                        </option>
                                    </select>
                                </div>

                                {/* Value */}
                                <div className="col-md-4">
                                    <label className="form-label">
                                        {btn.actionType === 'url'
                                            ? 'URL'
                                            : 'Message Value'}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={
                                            btn.actionType === 'url'
                                                ? 'https://example.com'
                                                : 'Message to send'
                                        }
                                        value={btn.value}
                                        onChange={e =>
                                            updateButton(
                                                btn.id,
                                                'value',
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                className="btn btn-primary mb-4"
                onClick={addButton}
                disabled={buttons.length >= MAX_BUTTONS}
            >
                + Add Button
            </button>

            {buttons.length >= MAX_BUTTONS && (
                <div className="text-danger small mb-3">
                    Maximum of {MAX_BUTTONS} quick replies allowed.
                </div>
            )}

            <div className="card shadow-sm border-0">
                <div className="card-header bg-light fw-semibold">
                    Preview
                </div>
                <div className="card-body">
                    {buttons.length === 0 ? (
                        <p className="text-muted mb-0">
                            No quick replies added yet.
                        </p>
                    ) : (
                        <div className="d-flex flex-wrap gap-2">
                            {buttons.map(btn => (
                                <button
                                    key={btn.id}
                                    className="btn btn-outline-primary btn-sm"
                                    disabled
                                >
                                    {btn.text || 'Button'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuickRepliesTab;
