import React, { useState } from 'react';
import { Edit2, Trash2, Copy } from "lucide-react";

const ITEMS_PER_PAGE = 12;

const IntentGrid = ({ intents, selectedIds, onToggleOne, onEdit, onDelete, onDuplicate }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(intents.length / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentIntents = intents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const PAGE_WINDOW = 3;

    const getPageNumbers = () => {
        let start = Math.max(1, currentPage - 1);
        let end = start + PAGE_WINDOW - 1;

        // Fix overflow on last pages
        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - PAGE_WINDOW + 1);
        }

        return Array.from(
            { length: end - start + 1 },
            (_, i) => start + i
        );
    };


    return (
        <>
            {/* Grid */}
            <div className="row g-4">
                {currentIntents.map(intent => (
                    <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={intent.id}>
                        <div className="card h-100 shadow border-0 rounded-4 transition-hover">
                            <div className="card-body d-flex flex-column p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <div className="fw-bold fs-6 text-dark mb-1">
                                            {intent.displayName}
                                        </div>
                                        <div className="small font-monospace text-muted">
                                            {intent.name}
                                        </div>
                                    </div>
                                    <span
                                        className={`badge ${intent.status === 'Active'
                                                ? 'badge-active'
                                                : 'badge-inactive'
                                            }`}
                                    >
                                        {intent.status}
                                    </span>
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={selectedIds.includes(intent.id)}
                                        onChange={() => onToggleOne(intent.id)}
                                    />

                                </div>

                                <p
                                    className="card-text text-secondary small mb-3 flex-fill"
                                    style={{
                                        lineHeight: 1.5,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {intent.description}
                                </p>

                                <div className="d-flex gap-3 pt-3 border-top mb-3">
                                    <div className="d-flex flex-column">
                                        <span className="fw-bold text-dark">
                                            {intent.trainingPhrases}
                                        </span>
                                        <span className="small text-muted" style={{ fontSize: '11px' }}>
                                            Phrases
                                        </span>
                                    </div>
                                    <div className="d-flex flex-column">
                                        <span className="fw-bold text-dark">
                                            {intent.responses}
                                        </span>
                                        <span className="small text-muted" style={{ fontSize: '11px' }}>
                                            Responses
                                        </span>
                                    </div>
                                    <div className="d-flex flex-column">
                                        <span className="fw-bold text-dark">
                                            {intent.usage}
                                        </span>
                                        <span className="small text-muted" style={{ fontSize: '11px' }}>
                                            Usage
                                        </span>
                                    </div>
                                    <div className="d-flex flex-column">
                                        <span className="fw-bold text-dark">
                                            {intent.confidence}%
                                        </span>
                                        <span className="small text-muted" style={{ fontSize: '11px' }}>
                                            Conf.
                                        </span>
                                    </div>
                                </div>

                                <div className="d-flex gap-5 mt-auto">
                                    <Edit2
                                        size={16}
                                        className="cursorPointer"
                                        onClick={() => onEdit(intent)}
                                    />
                                    <Copy
                                        size={16}
                                        className="cursorPointer"
                                        onClick={() => onDuplicate?.(intent)}
                                    />

                                    <Trash2
                                        size={16}
                                        className="cursorPointer text-danger"
                                        onClick={() => onDelete(intent)}
                                    />
                                    {/* <button
                                            className="btn btn-secondary w-100 fw-semibold"
                                            onClick={() => onDuplicate(intent)}
                                        >
                                            <i className="bi bi-copy"></i>
                                        </button> */}
                                    {/* <button
                                            className="btn btn-secondary w-100 fw-semibold"
                                            onClick={() => onDelete(intent)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="grid-pagination-wrapper mt-5">

                    {/* Page info */}
                    <div className="text-center mb-2">
                        <small className="text-muted">
                            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                        </small>
                    </div>

                    {/* Pagination */}
                    <nav className="custom-pagination d-flex justify-content-center">
                        <ul className="pagination pagination-sm mb-0 align-items-center">

                            {/* Prev */}
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                    className="page-link pill prev"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                >
                                    Prev
                                </button>
                            </li>

                            {/* Page Numbers */}
                            {getPageNumbers().map(page => (
                                <li
                                    key={page}
                                    className={`page-item ${currentPage === page ? 'active' : ''}`}
                                >
                                    <button
                                        className="page-link pill"
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </button>
                                </li>
                            ))}

                            {/* Next */}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button
                                    className="page-link pill next"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                >
                                    Next
                                </button>
                            </li>

                        </ul>
                    </nav>
                </div>
            )}

        </>
    );
};

export default IntentGrid;
