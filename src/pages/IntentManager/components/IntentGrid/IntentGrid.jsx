import React from 'react';


const IntentGrid = ({ intents, onEdit, onDelete, onDuplicate }) => {
    return (
        <div className="row g-4">
            {intents.map(intent => (
                <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={intent.id}>
                    <div className="card h-100 shadow border-0 rounded-4 transition-hover">
                        <div className="card-body d-flex flex-column p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <div className="fw-bold fs-6 text-dark mb-1">{intent.displayName}</div>
                                    <div className="small font-monospace text-muted">{intent.name}</div>
                                </div>
                                <span className={`badge ${intent.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                                    {intent.status}
                                </span>
                            </div>

                            <p className="card-text text-secondary small mb-3 flex-fill" style={{ lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {intent.description}
                            </p>

                            <div className="d-flex gap-3 pt-3 border-top mb-3">
                                <div className="d-flex flex-column">
                                    <span className="fw-bold text-dark">{intent.trainingPhrases}</span>
                                    <span className="small text-muted" style={{ fontSize: '11px' }}>Phrases</span>
                                </div>
                                <div className="d-flex flex-column">
                                    <span className="fw-bold text-dark">{intent.responses}</span>
                                    <span className="small text-muted" style={{ fontSize: '11px' }}>Responses</span>
                                </div>
                                <div className="d-flex flex-column">
                                    <span className="fw-bold text-dark">{intent.usage}</span>
                                    <span className="small text-muted" style={{ fontSize: '11px' }}>Usage</span>
                                </div>
                                <div className="d-flex flex-column">
                                    <span className="fw-bold text-dark">{intent.confidence}%</span>
                                    <span className="small text-muted" style={{ fontSize: '11px' }}>Conf.</span>
                                </div>
                            </div>

                            <div className="d-flex gap-2 mt-auto">
                                <button className="btn btn-secondary w-100 fw-semibold" onClick={() => onEdit(intent)}><i className="bi bi-pencil"></i></button>
                                <button className="btn btn-secondary w-100 fw-semibold" onClick={() => onDuplicate(intent)}><i className="bi bi-copy"></i></button>
                                <button className="btn btn-secondary w-100 fw-semibold" onClick={() => onDelete(intent)}><i className="bi bi-trash"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default IntentGrid;
