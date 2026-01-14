import React from 'react';

const IntentTable = ({ intents, onEdit, onDelete, onDuplicate }) => {
    return (
        <div className="bg-white rounded-16 shadow">

            <div
                className="table-responsive overflow-auto"
                style={{ maxHeight: '90vh' }}
            >
                <table className="table table-hover mb-0">
                    <thead className="table-light sticky-top">
                        <tr>
                            <th style={{ width: '40px' }}></th>
                            <th>Intent Name</th>
                            <th>Display Name</th>
                            <th>Category</th>
                            <th>Phrases</th>
                            <th>Responses</th>
                            <th>Usage (30d)</th>
                            <th>Confidence</th>
                            <th>Status</th>
                            <th>Last Modified</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody >
                        {intents.map(intent => (
                            <tr key={intent.id}>
                                <td>
                                    <input type="checkbox" className="form-check-input" />
                                </td>

                                <td
                                    className="text-primary fw-bold cursor-pointer"
                                    onClick={() => onEdit(intent)}
                                >
                                    {intent.name}
                                </td>

                                <td>{intent.displayName}</td>

                                <td>
                                    <span className="badge badge-category">
                                        {intent.category}
                                    </span>
                                </td>

                                <td>{intent.trainingPhrases}</td>
                                <td>{intent.responses}</td>
                                <td>{intent.usage}</td>
                                <td>{intent.confidence}%</td>

                                <td>
                                    <div className="form-check form-switch" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            role="switch"
                                            checked={intent.status === 'Active'}
                                            onChange={() => { }} // Read-only for mock
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <label className="form-check-label small ms-1 text-secondary" style={{ fontSize: '0.85em' }}>
                                            {intent.status}
                                        </label>
                                    </div>
                                </td>

                                <td>{intent.lastModified}</td>

                                <td>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => onEdit(intent)}
                                        >
                                            <i className="bi bi-pencil" />
                                        </button>

                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => onDuplicate?.(intent)}
                                        >
                                            <i className="bi bi-copy" />
                                        </button>

                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => onDelete(intent)}>
                                            <i className="bi bi-trash" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default IntentTable;
