import React, { useState } from 'react';
import IntentTable from './components/IntentTable/IntentTable';
import IntentGrid from './components/IntentGrid/IntentGrid';
import IntentModal from './components/IntentModel/IntentModel';
import TestPanel from './components/Testpanel/TestPanel';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Theme.css';

// Data
const INITIAL_INTENTS = [
    {
        id: 1,
        name: 'greeting',
        displayName: 'Greeting',
        category: 'General',
        trainingPhrases: 12,
        responses: 3,
        usage: 1250,
        confidence: 98,
        status: 'Active',
        lastModified: '2023-10-15',
        description: 'Handles user greetings like hello, hi, etc.'
    },
    {
        id: 2,
        name: 'check_balance',
        displayName: 'Check Balance',
        category: 'Account',
        trainingPhrases: 25,
        responses: 2,
        usage: 850,
        confidence: 92,
        status: 'Active',
        lastModified: '2023-10-14',
        description: 'Allows users to check their current account balance.'
    },
    {
        id: 3,
        name: 'transfer_funds',
        displayName: 'Transfer Funds',
        category: 'Payments',
        trainingPhrases: 40,
        responses: 5,
        usage: 600,
        confidence: 88,
        status: 'Inactive',
        lastModified: '2023-10-10',
        description: 'Initiates a fund transfer process between accounts.'
    },
    {
        id: 4,
        name: 'support_contact',
        displayName: 'Contact Support',
        category: 'Support',
        trainingPhrases: 15,
        responses: 1,
        usage: 300,
        confidence: 95,
        status: 'Active',
        lastModified: '2023-10-12',
        description: 'Provides contact information for customer support.'
    },{
        id: 5,
        name: 'contact',
        displayName: 'Contact',
        category: 'Support',
        trainingPhrases: 5,
        responses: 1,
        usage: 320,
        confidence: 96,
        status: 'Active',
        lastModified: '2023-10-12',
        description: 'Provides information for customer support.'
    }
];

const IntentManager = () => {
    const [viewMode, setViewMode] = useState('table');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTestPanelOpen, setIsTestPanelOpen] = useState(false);
    const [selectedIntent, setSelectedIntent] = useState(null);
    const [intents, setIntents] = useState(INITIAL_INTENTS);


    const handleEdit = (intent) => {
        setSelectedIntent(intent);
        setIsModalOpen(true);
    };

    const handleDelete = (intent) => {
    setIntents((prevIntents) =>
        prevIntents.filter((item) => item.id !== intent.id));
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
                        </select>
                    </div>

                    <div className="input-group bg-white border rounded-3 shadow-sm px-2 py-1">
                        <select className="form-select form-select-sm border-0 bg-transparent text-cvq-text">
                            <option>Sort by Name</option>
                            <option>Sort by Usage</option>
                            <option>Sort by Date</option>
                        </select>
                    </div>

                    <div className="btn-group bg-light p-1 rounded-2">
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
                        className="btn btn-primary d-inline-flex align-items-center fw-semibold px-4 py-1"
                        onClick={handleAdd}
                        style={{ borderRadius: '8px', gap: '3px', fontSize: '11px' }}
                    >
                        <i className="bi bi-plus-lg"></i> Add Intent
                    </button>
                </div>
            </div>

            {/* Content */}
            {viewMode === 'table' ? (
                <IntentTable
                    intents={intents}
                    onEdit={handleEdit}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                />
            ) : (
                <IntentGrid
                    intents={intents}
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
