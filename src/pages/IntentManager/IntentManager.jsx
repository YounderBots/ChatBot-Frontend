import React, { useState } from 'react';
import IntentTable from './components/IntentTable/IntentTable';
import IntentGrid from './components/IntentGrid/IntentGrid';
import IntentModal from './components/IntentModel/IntentModel';
import TestPanel from './components/Testpanel/TestPanel';
import { INITIAL_INTENTS } from './Dummy';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Theme.css';

const IntentManager = () => {
    const [viewMode, setViewMode] = useState('table');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTestPanelOpen, setIsTestPanelOpen] = useState(false);
    const [selectedIntent, setSelectedIntent] = useState(null);
    const [intents, setIntents] = useState(INITIAL_INTENTS);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [intentToDelete, setIntentToDelete] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);



    const handleEdit = (intent) => {
        setSelectedIntent(intent);
        setIsModalOpen(true);
    };

    const handleDelete = (intent) => {
    setIntentToDelete(intent);
    setShowDeleteModal(true);
    };

    const confirmDelete = () => {
    setIntents((prevIntents) =>
        prevIntents.filter((item) => item.id !== intentToDelete.id)
    );

    setShowDeleteModal(false);
    setIntentToDelete(null);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setIntentToDelete(null);
    };



    const handleDuplicate = (intent) => {
    const timestamp = Date.now();

    const duplicatedIntent = {
        ...intent,
        id: timestamp,
        name: `${intent.name}`,
        displayName: `${intent.displayName}`,
        usage: 0,
        confidence: 0,
        status: 'Inactive',
        lastModified: new Date().toISOString().split('T')[0]
    };

    setIntents((prev) => [...prev, duplicatedIntent]);
    };

    const handleAdd = () => {
        setSelectedIntent(null);
        setIsModalOpen(true);
    };

    const isAllSelected = intents.length > 0 && selectedIds.length === intents.length;

    const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : intents.map(i => i.id));
    };

    const toggleSelectOne = (id) => {
    setSelectedIds(prev =>
        prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
    };

    const bulkDelete = () => {
        setIntents(prev => prev.filter(i => !selectedIds.includes(i.id)));
        setSelectedIds([]);
    };

    const bulkUpdateStatus = (status) => {
        setIntents(prev =>
            prev.map(i =>
            selectedIds.includes(i.id)
                ? { ...i, status }
                : i
            )
    );
        setSelectedIds([]);
    };



    return (
        <div className="p-4 h-100 d-flex flex-column gap-4 bg-cvq-bg overflow-auto">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <h1 className="font-weight-bold text-cvq-blue-900 mb-0">Intents</h1>

                <div className="d-flex align-items-center gap-3">
                    <div className="input-group bg-white border rounded-3 shadow-sm px-2 py-0.10">
                        <span className="input-group-text bg-white border-0">
                            <i className="bi bi-search text-muted"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control border-0 shadow-none text-cvq-text"
                            placeholder="Search intents..."
                        />
                    </div>

                    <div className="input-group bg-white border rounded-3 shadow-sm px-2 py-1">
                        <select className="form-select form-select-sm border-0 bg-transparent text-cvq-text">
                            <option>All</option>
                            <option>Active</option>
                            <option>Inactive</option>
                            <option>Inactive</option>
                        </select>
                    </div>

                    <div className="input-group bg-white border rounded-3 shadow-sm px-2 py-1">
                        <select className="form-select form-select-sm border-0 bg-transparent text-cvq-text">
                            <option>Sort by Name</option>
                            <option>Sort by Usage</option>
                            <option>Sort by Date</option>
                        </select>
                    </div>
                    {selectedIds.length > 0 && (
                        <div className="input-group bg-white border rounded-3 shadow-sm px-2 py-1">
                            <button
                            className="form-select form-select-sm border-0 bg-transparent text-cvq-text d-flex align-items-center justify-content-between"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            >
                            Bulk actions
                            </button>

                            <ul className="dropdown-menu shadow-sm">
                            <li>
                                <button
                                className="dropdown-item text-danger d-flex align-items-center gap-2"
                                onClick={bulkDelete}
                                >
                                <i className="bi bi-trash"></i>
                                Delete
                                </button>
                            </li>

                            <li>
                                <button
                                className="dropdown-item d-flex align-items-center gap-2"
                                onClick={() => bulkUpdateStatus('Active')}
                                >
                                <i className="bi bi-check-circle text-success"></i>
                                Activate
                                </button>
                            </li>

                            <li>
                                <button
                                className="dropdown-item d-flex align-items-center gap-2"
                                onClick={() => bulkUpdateStatus('Inactive')}
                                >
                                <i className="bi bi-slash-circle text-warning"></i>
                                Deactivate
                                </button>
                            </li>
                            </ul>
                        </div>
                        )}
                    <div className="btn-group bg-light rounded-2">
                        <button
                            className={`btn btn-sm border-0 rounded ${viewMode === 'grid'
                                ? 'bg-white shadow-sm text-primary'
                                : 'text-secondary'
                                }`}
                            onClick={() => setViewMode('grid')}
                            title="Grid View"
                        >
                            <i className="bi bi-grid"></i>
                        </button>

                        <button
                            className={`btn btn-sm border-0 rounded ${viewMode === 'table'
                                ? 'bg-white shadow-sm text-primary'
                                : 'text-secondary'
                                }`}
                            onClick={() => setViewMode('table')}
                            title="Table View"
                        >
                            <i className="bi bi-layout-three-columns"></i>
                        </button>
                    </div>

                    <button
                        className="btn btn-primary d-inline-flex align-items-center fw-semibold "
                        onClick={handleAdd}
                        style={{ borderRadius: '8px', fontSize: '11px',whiteSpace: 'nowrap' }}
                    >
                        <i className="bi bi-plus-lg me-1"></i>   Add Intent
                    </button>
                </div>

            {showDeleteModal && (
                <>
                    {/* Backdrop */}
                    <div className="modal-backdrop fade show"></div>

                    {/* Modal */}
                    <div
                        className="modal fade show d-block"
                        tabIndex="-1"
                        role="dialog"
                    >
                        <div className="modal-dialog modal-dialog-centered modal-sm">
                            <div className="modal-content border-0 shadow-lg rounded-4">

                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title text-cvq-blue-900 fw-semibold">
                                        Confirm Delete
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={cancelDelete}
                                    />
                                </div>
                                <div className="modal-body text-center px-4">
                                    <div
                                        className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                                        style={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: '50%',
                                            border: '1px solid #f21c32',
                                            color: '#f21c32', 
                                            fontSize: 22
                                        }}
                                    >
                                        <i className="bi bi-x-lg icon-danger"></i>

                                    </div>

                                    <p className="mb-1 fw-medium text-cvq-text">
                                        Are you sure you want to delete this intent?
                                    </p>

                                    <p className="small text-muted mb-0">
                                        <strong>{intentToDelete?.displayName}</strong> will be permanently removed.
                                    </p>
                                </div>
                                <div className="modal-footer border-0 pt-0 d-flex gap-2 justify-content-center">
                                    <button
                                        className="btn btn-light px-4"
                                        onClick={cancelDelete}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="btn btn-danger px-4"
                                        onClick={confirmDelete}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}


            </div>

            {/* Content */}
            {viewMode === 'table' ? (
                <IntentTable
                    intents={intents}
                    selectedIds={selectedIds}
                    onToggleAll={toggleSelectAll}
                    onToggleOne={toggleSelectOne}
                    onEdit={handleEdit}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                />
            ) : (
                <IntentGrid
                    intents={intents}
                    selectedIds={selectedIds}
                    onToggleOne={toggleSelectOne}
                    onEdit={handleEdit}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                />
            )}

            <IntentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                intent={selectedIntent}
                onSaveAndTest={() => {
                    setIsModalOpen(false);
                    setIsTestPanelOpen(true);
                }}
            />

            <TestPanel
                isOpen={isTestPanelOpen}
                onClose={() => setIsTestPanelOpen(false)}
            />
        </div>
    );
};

export default IntentManager;
