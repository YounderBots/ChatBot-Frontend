import { useEffect, useState } from 'react'
import IntentGrid from '../components/IntentGrid/IntentGrid'
import IntentModal from '../components/IntentModel/IntentModel'
import IntentTable from '../components/IntentTable/IntentTable'
import TestPanel from '../components/Testpanel/TestPanel'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../Theme.css'

import APICall from '../../../APICalls/APICall'
import { usePermission } from '../../../Context/AuthContext'
import { useToast } from '../../../components/useToast'

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
  const [intentMode, setIntentMode] = useState("add");
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [sortBy, setSortBy] = useState("Newest")
  const { canAdd, canEdit, canDelete } = usePermission('/Intents');
  const { showToast, ToastContainer } = useToast();

  /* ------------------ Fetch ------------------ */

  const fetchIntents = async () => {
    try {
      const res = await APICall.getT("/intents/intents")
      let list = res || []

      // Merge real 30-day usage counts from analytics (grouped by
      // Conversation.intent_detected). Best-effort — if the caller lacks
      // analytics permission or the service is down, usage stays 0.
      try {
        const usage = await APICall.getT("/analytics/intents?range=30&limit=50")
        if (Array.isArray(usage) && usage.length) {
          const byName = new Map(usage.map(u => [u.name, u.value]))
          list = list.map(i => ({ ...i, usage: byName.get(i.intent_name) ?? 0 }))
        }
      } catch (_) {
        /* usage is optional; leave as-is */
      }

      setIntents(list)
    } catch (err) {
      showToast(err.message || "Failed to load intents.", "danger")
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
    setIntentMode("add");
  }

  const handleEdit = (intent) => {
    setSelectedIntent(intent)
    setIsModalOpen(true)
    setIntentMode("edit");
  }

  const handleDelete = (intent) => {
    setIntentToDelete(intent)
    setShowDeleteModal(true)
    setIntentMode("delete");
  }

  const confirmDelete = async () => {
    if (!intentToDelete?.id) return
    try {
      await APICall.postT(`/intents/deleteintent/${intentToDelete.id}`)
      fetchIntents()
      setShowDeleteModal(false)
      setIntentToDelete(null)
    } catch (err) {
      showToast(err.message || "Failed to delete intent.", "danger")
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setIntentToDelete(null)
  }

  /* ------------------ Approval ------------------ */
  // New/edited intents default to approval_status=PENDING and are excluded from
  // model training (the NLP export only ships APPROVED intents). Approving flips
  // them to APPROVED so the next domain retrain picks them up.

  const handleApprove = async (intent) => {
    if (!intent?.id) return
    try {
      await APICall.postT(`/intents/${intent.id}/approve`, {})
      showToast(`Approved "${intent.intent_name}". Retrain the domain to include it in the model.`, "success")
      fetchIntents()
    } catch (err) {
      showToast(err.message || "Failed to approve intent.", "danger")
    }
  }

  const handleApproveAll = async () => {
    try {
      const res = await APICall.postT("/intents/approve-all", {})
      showToast(res?.message || "Pending intents approved. Retrain to apply.", "success")
      fetchIntents()
    } catch (err) {
      showToast(err.message || "Failed to approve intents.", "danger")
    }
  }

  const pendingCount = intents.filter(
    i => i.approval_status && i.approval_status !== "APPROVED" && i.status !== "DELETED"
  ).length

  // UI-only duplicate
  const handleDuplicate = (intent) => {
    const duplicatedIntent = {
      ...intent,
      id: undefined,
      name: `${intent.name} - Copy`,
      displayName: `${intent.displayName} - Copy`,
      intent_name: `${intent.intent_name}_copy`,
      status: "Inactive",
    };

    setSelectedIntent(duplicatedIntent);
    setIntentMode("duplicate");
    setIsModalOpen(true);
  };




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
      showToast(err.message || "Bulk delete failed.", "danger")
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

  /* ------------------ Import / Export ------------------ */

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(
        `${import.meta.env.VITE_ADMIN_BASE_URL || ""}/intents/export`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!resp.ok) throw new Error("Export failed");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "intents.json";
      a.click();
      URL.revokeObjectURL(url);
      showToast("Intents exported.", "success");
    } catch {
      showToast("Export failed.", "danger");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = await APICall.postT("/intents/bulk", data);
      const created = result?.created ?? 0;
      const updated = result?.updated ?? 0;
      showToast(`Imported ${created + updated} intents (${created} created, ${updated} updated).`, "success");
      loadIntents();
    } catch {
      showToast("Import failed — check file format.", "danger");
    }
  };

  /* ------------------ Filtered / sorted list ------------------ */

  const displayedIntents = intents
    .filter(i => {
      const matchSearch = !search ||
        i.name?.toLowerCase().includes(search.toLowerCase()) ||
        i.intent_name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" ||
        (statusFilter === "Active"   && i.status === "ACTIVE") ||
        (statusFilter === "Inactive" && i.status !== "ACTIVE");
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "Name")  return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "Usage") return (b.usage || 0) - (a.usage || 0);
      // Newest first: prefer created_at, fall back to id (higher id = later).
      return (new Date(b.created_at || 0) - new Date(a.created_at || 0))
        || ((b.id || 0) - (a.id || 0));
    });

  /* ------------------ UI ------------------ */

  if (loading) {
    return <div className="text-center p-5">Loading intents...</div>
  }

  /* ------------------ UI ------------------ */

  return (
    <div className="h-100 d-flex flex-column gap-3">
      <ToastContainer />

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="btn btn-sm border-0 bg-transparent" onClick={() => setSearch("")}>
                <i className="bi bi-x text-muted"></i>
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="input-group bg-white border rounded-3 shadow-sm px-2 py-1">
            <select
              className="form-select form-select-sm border-0 bg-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Sort */}
          <div className="input-group bg-white border rounded-3 shadow-sm px-2 py-1">
            <select
              className="form-select form-select-sm border-0 bg-transparent"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Newest">Sort by Newest</option>
              <option value="Name">Sort by Name</option>
              <option value="Usage">Sort by Usage</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && canDelete && (
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

          {/* Import / Export */}
          <button
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center"
            onClick={handleExport}
            title="Export intents as JSON"
          >
            <i className="bi bi-download me-1"></i> Export
          </button>
          <label
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center mb-0"
            title="Import intents from JSON"
            style={{ cursor: "pointer" }}
          >
            <i className="bi bi-upload me-1"></i> Import
            <input
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={handleImport}
            />
          </label>

          {/* Approve all (visible only when intents await approval) */}
          {canEdit && pendingCount > 0 && (
            <button
              className="btn btn-sm btn-warning d-inline-flex align-items-center fw-semibold"
              onClick={handleApproveAll}
              title="Approve all pending intents so they get included in the next training run"
            >
              <i className="bi bi-check2-all me-1"></i> Approve all ({pendingCount})
            </button>
          )}

          {/* Add Button */}
          {canAdd && (
            <button
              className="btn btn-primary d-inline-flex align-items-center fw-semibold add-intent-btn"
              onClick={handleAdd}
            >
              <i className="bi bi-plus-lg me-1"></i> Add Intent
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-4 shadow flex-grow-1 overflow-auto">
        {viewMode === 'table' ? (
          <IntentTable
            intents={displayedIntents}
            selectedIds={selectedIds}
            onToggleAll={toggleSelectAll}
            onToggleOne={toggleSelectOne}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onApprove={handleApprove}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        ) : (
          <IntentGrid
            intents={displayedIntents}
            selectedIds={selectedIds}
            onToggleOne={toggleSelectOne}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onApprove={handleApprove}
            canEdit={canEdit}
            canDelete={canDelete}
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
                    <strong>{intentToDelete?.name}</strong> intent will be
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
        intents={intents}
        mode={intentMode}
        onClose={() => setIsModalOpen(false)}
        fetchIntents={fetchIntents}
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