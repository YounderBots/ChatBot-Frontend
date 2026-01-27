import { useState, useEffect } from 'react'
import IntentGrid from '../components/IntentGrid/IntentGrid'
import IntentModal from '../components/IntentModel/IntentModel'
import IntentTable from '../components/IntentTable/IntentTable'
import TestPanel from '../components/Testpanel/TestPanel'

import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../Theme.css'

import APICall from '../../../APICalls/APICall'

const IntentContainer = () => {
  const [viewMode, setViewMode] = useState('table')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTestPanelOpen, setIsTestPanelOpen] = useState(false)
  const [selectedIntent, setSelectedIntent] = useState(null)
  const [intents, setIntents] = useState([])
  const [loading, setLoading] = useState(true)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [intentToDelete, setIntentToDelete] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [showBulkMenu, setShowBulkMenu] = useState(false)
  const [bulkMenuPos, setBulkMenuPos] = useState({ top: 0, left: 0 })

  /* ------------------ Fetch ------------------ */

  const fetchIntents = async () => {
    try {
      const res = await APICall.getT("/intents/intents")
      setIntents(res || [])
      console.log(res);

    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIntents()
  }, [])

  /* Close bulk menu on outside click */
  useEffect(() => {
    const close = () => setShowBulkMenu(false)
    document.addEventListener("click", close)
    return () => document.removeEventListener("click", close)
  }, [])

  /* ------------------ Actions ------------------ */

  const handleAdd = () => {
    setSelectedIntent(null)
    setIsModalOpen(true)
  }

  const handleEdit = (intent) => {
    setSelectedIntent(intent)
    setIsModalOpen(true)
  }

  const handleDelete = (intent) => {
    setIntentToDelete(intent)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!intentToDelete?.id) return
    try {
      await APICall.postT(`/intents/deleteintent/${intentToDelete.id}`)
      fetchIntents()
      setShowDeleteModal(false)
      setIntentToDelete(null)
    } catch (err) {
      alert(err.message)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setIntentToDelete(null)
  }

  // UI-only duplicate
  const handleDuplicate = (intent) => {
    const duplicated = {
      ...intent,
      id: Date.now(),
      usage: 0,
      confidence: 0,
      status: 'Inactive',
      lastModified: new Date().toISOString().split('T')[0]
    }
    setIntents(prev => [...prev, duplicated])
  }

  /* ------------------ Selection ------------------ */

  const isAllSelected =
    intents.length > 0 && selectedIds.length === intents.length

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : intents.map(i => i.id))
  }

  const toggleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }

  /* ------------------ Bulk ------------------ */

  const bulkDelete = async () => {
    try {
      await Promise.all(
        selectedIds.map(id =>
          APICall.postT(`/intents/deleteintent/${id}`)
        )
      )
      fetchIntents()
      setSelectedIds([])
      setShowBulkMenu(false)
    } catch (err) {
      alert(err.message)
    }
  }

  const bulkUpdateStatus = (status) => {
    setIntents(prev =>
      prev.map(i =>
        selectedIds.includes(i.id)
          ? { ...i, status }
          : i
      )
    )
    setSelectedIds([])
    setShowBulkMenu(false)
  }

  /* ------------------ UI ------------------ */

  if (loading) {
    return <div className="text-center p-5">Loading intents...</div>
  }

  /* ------------------ UI ------------------ */

  return (
    <div className="h-100 d-flex flex-column gap-3">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        {/* <h3 className="fw-bold text-cvq-blue-900 mb-0">Intents</h3> */}

        <div className="intent-header-actions d-flex align-items-center gap-3">

          {/* Search */}
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

          {/* Status Filter */}
          <div className="input-group bg-white border rounded-3 shadow-sm px-2 py-1">
            <select className="form-select form-select-sm border-0 bg-transparent">
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          {/* Sort */}
          <div className="input-group bg-white border rounded-3 shadow-sm px-2 py-1">
            <select className="form-select form-select-sm border-0 bg-transparent">
              <option>Sort by Name</option>
              <option>Sort by Usage</option>
              <option>Sort by Date</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="input-group bg-white border rounded-3 shadow-sm px-2 py-1 position-relative">
              <button
                className="form-select form-select-sm border-0 bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();   // ← THIS LINE FIXES EVERYTHING
                  const rect = e.currentTarget.getBoundingClientRect()
                  setBulkMenuPos({
                    top: rect.bottom + 6,
                    left: rect.left
                  })
                  setShowBulkMenu(prev => !prev)
                }}
              >
                Bulk actions
              </button>

              {showBulkMenu && (
                <ul
                  className="dropdown-menu show shadow-sm"
                  style={{
                    position: 'fixed',
                    top: bulkMenuPos.top,
                    left: bulkMenuPos.left,
                    zIndex: 3000
                  }}
                >
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={() => {
                        bulkDelete()
                        setShowBulkMenu(false)
                      }}
                    >
                      <i className="bi bi-trash me-2"></i> Delete
                    </button>
                  </li>

                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        bulkUpdateStatus('Active')
                        setShowBulkMenu(false)
                      }}
                    >
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Activate
                    </button>
                  </li>

                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        bulkUpdateStatus('Inactive')
                        setShowBulkMenu(false)
                      }}
                    >
                      <i className="bi bi-slash-circle text-warning me-2"></i>
                      Deactivate
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}


          {/* View Toggle */}
          <div className="btn-group bg-light rounded-2">
            <button
              className={`btn btn-sm ${viewMode === 'grid'
                ? 'bg-white shadow-sm text-primary'
                : 'text-secondary'
                }`}
              onClick={() => setViewMode('grid')}
            >
              <i className="bi bi-grid"></i>
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'table'
                ? 'bg-white shadow-sm text-primary'
                : 'text-secondary'
                }`}
              onClick={() => setViewMode('table')}
            >
              <i className="bi bi-layout-three-columns"></i>
            </button>
          </div>

          {/* Add Button */}
          <button
            className="btn btn-primary d-inline-flex align-items-center fw-semibold add-intent-btn"
            onClick={handleAdd}
          >
            <i className="bi bi-plus-lg me-1"></i> Add Intent
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-4 shadow flex-grow-1 overflow-auto">
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
      </div>


      {/* Delete Modal */}
      {showDeleteModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block">
            <div className="modal-dialog modal-dialog-centered modal-sm">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0">
                  <h5 className="modal-title fw-semibold">Confirm Delete</h5>
                  <button className="btn-close" onClick={cancelDelete} />
                </div>
                <div className="modal-body text-center">
                  <p>
                    <strong>{intentToDelete?.displayName}</strong> will be
                    permanently removed.
                  </p>
                </div>
                <div className="modal-footer border-0 justify-content-center">
                  <button className="btn btn-light" onClick={cancelDelete}>
                    Cancel
                  </button>
                  <button className="btn btn-danger" onClick={confirmDelete}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <IntentModal
        isOpen={isModalOpen}
        intent={selectedIntent}
        onClose={() => setIsModalOpen(false)}
        onSaveAndTest={() => {
          setIsModalOpen(false)
          setIsTestPanelOpen(true)
        }}
      />

      <TestPanel
        isOpen={isTestPanelOpen}
        onClose={() => setIsTestPanelOpen(false)}
      />
    </div>
  )
}

export default IntentContainer