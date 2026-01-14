import React, { useState, useMemo } from 'react';

const ITEMS_PER_PAGE = 10;

const IntentTable = ({ intents, selectedIds,onToggleAll,onToggleOne,onEdit, onDelete, onDuplicate }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(intents.length / ITEMS_PER_PAGE);

    const paginatedIntents = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return intents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [intents, currentPage]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="bg-white rounded-16 shadow">

            <div
                className="table-responsive overflow-auto">
                <table className="table table-hover mb-0">
                    <thead className="table-light sticky-top">
                        <tr>
                            <th style={{ width: '40px' }}>
                                 <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={intents.length > 0 && selectedIds.length === intents.length}
                                    onChange={onToggleAll}
                                />
                            </th>
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

                    <tbody>
                        {paginatedIntents.map(intent => (
                            <tr key={intent.id}>
                                <td>
                                    <input type="checkbox"
                                    className="form-check-input"
                                    checked={selectedIds.includes(intent.id)}
                                    onChange={() => onToggleOne(intent.id)}
                                    />
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
                                    <div
                                        className="form-check form-switch"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            role="switch"
                                            checked={intent.status === 'Active'}
                                            onChange={() => {}}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <label className="form-check-label small ms-1 text-secondary">
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
                                            onClick={() => onDelete(intent)}
                                        >
                                            <i className="bi bi-trash" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {paginatedIntents.length === 0 && (
                            <tr>
                                <td colSpan="11" className="text-center py-4 text-muted">
                                    No intents found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top">
                    <small className="text-muted">
                        Page {currentPage} of {totalPages}
                    </small>

                    <nav>
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                >
                                    Prev
                                </button>
                            </li>

                            {[...Array(totalPages)].map((_, i) => (
                                <li
                                    key={i}
                                    className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                </li>
                            ))}

                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                >
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default IntentTable;
