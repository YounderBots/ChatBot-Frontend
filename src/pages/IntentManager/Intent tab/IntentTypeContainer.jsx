import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Edit2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import APICall from "../../../APICalls/APICall";


/* ================= COMPONENT ================= */

const IntentTypeContainer = () => {
  const [intentTypes, setIntentTypes] = useState([])
  const [activeIntentTypes, setActiveIntentTypes] = useState(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [intentTypesToDelete, setIntentTypesToDelete] = useState(null)

  const [loading, setLoading] = useState(true)

  /* ================= API LAYER ================= */

  const IntentTypesAPI = {
    fetchAll: async () => {
      const res = await APICall.getT("/intents/intent_types")
      return res || []
    },

    create: async payload => {
      const res = await APICall.postT("/intents/intent_type", payload)
      return res
    },

    update: async payload => {
      const res = await APICall.postT(
        `/intents/update_intent_types/${payload.id}`,
        payload
      )
      return res
    },

    remove: async id => {
      await APICall.postT(`/intents/delete_intent_types/${id}`)
      return true
    }
  }

  /* ================= FETCH ================= */

  const loadIntentTypes = useCallback(async () => {
    try {
      setLoading(true)
      const data = await IntentTypesAPI.fetchAll()
      // console.log("API DATA:", data)
      setIntentTypes(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to load intent Types", err)
      setIntentTypes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadIntentTypes()
  }, [loadIntentTypes])

  /* ================= ADD / EDIT ================= */

  const handleAdd = () => {
    setActiveIntentTypes({ name: "", description: "" })
    setIsModalOpen(true)
  }

  const handleEdit = intent_types => {
    setActiveIntentTypes(intent_types)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!activeIntentTypes?.name?.trim()) return

    try {
      setLoading(true)

      if (activeIntentTypes.id) {
        await IntentTypesAPI.update(activeIntentTypes)
      } else {
        await IntentTypesAPI.create(activeIntentTypes)
      }

      await loadIntentTypes()
      setIsModalOpen(false)
      setActiveIntentTypes(null)
    } catch (err) {
      console.error("Save failed", err)
    } finally {
      setLoading(false)
    }
  }


  /* ================= DELETE ================= */

  const handleDelete = intent_types => {
    setIntentTypesToDelete(intent_types)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!intentTypesToDelete) return

    try {
      setLoading(true)
      await IntentTypesAPI.remove(intentTypesToDelete.id)
      setIntentTypes(prev =>
        prev.filter(c => c.id !== intentTypesToDelete.id)
      )
    } catch (err) {
      console.error("Delete failed", err)
    } finally {
      setShowDeleteModal(false)
      setIntentTypesToDelete(null)
      setLoading(false)
    }
  }

  /* ================= UI ================= */

  return (
    <div className="p-4 h-100 d-flex flex-column gap-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="fw-bold mb-0">Intent Types</h1>

        <button
          className="btn btn-primary"
          onClick={handleAdd}
          disabled={loading}
        >
          <i className="bi bi-plus-lg me-1" />
          Add Intent Types
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-4 shadow overflow-auto">
        <table className="table mb-0 table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ width: "60px" }}>S.No</th>
              <th>Name</th>
              <th>Description</th>
              <th>Last Modified</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : intentTypes.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-muted">
                  No intent Types found
                </td>
              </tr>
            ) : (
              intentTypes.map((cat, index) => (
                <tr key={cat.id}>
                  <td className="fw-semibold text-muted">
                    {index + 1}
                  </td>

                  <td className="fw-semibold">
                    {cat.name}
                  </td>

                  <td className="Description">
                    {cat.description}
                  </td>

                  <td>
                    {cat.last_modified
                      ? new Date(cat.last_modified).toLocaleString()
                      : cat.lastModified}
                  </td>

                  <td className="text-end">
                    <div className="d-flex gap-4 justify-content-end">
                      <Edit2
                        size={16}
                        className="cursor-pointer"
                        onClick={() => handleEdit(cat)}
                      />
                      <Trash2
                        size={16}
                        className="text-danger cursor-pointer"
                        onClick={() => handleDelete(cat)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <>
          <div className="modal-backdrop fade show" />
          <div className="modal fade show d-block">
            <div className="modal-dialog modal-dialog-centered modal-sm">
              <div className="modal-content rounded-4 shadow-lg">
                <div className="modal-header border-0">
                  <h5 className="fw-semibold">
                    {activeIntentTypes?.id
                      ? "Edit Intent Types"
                      : "Add Intent Types"}
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setIsModalOpen(false)}
                  />
                </div>

                <div className="modal-body">
                  <input
                    className="form-control mb-3"
                    placeholder="Name"
                    value={activeIntentTypes?.name || ""}
                    onChange={e =>
                      setActiveIntentTypes(prev => ({
                        ...prev,
                        name: e.target.value
                      }))
                    }
                  />

                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Description"
                    value={activeIntentTypes?.description || ""}
                    onChange={e =>
                      setActiveIntentTypes(prev => ({
                        ...prev,
                        description: e.target.value
                      }))
                    }
                  />
                </div>

                <div className="modal-footer border-0">
                  <button
                    className="btn btn-light"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* DELETE CONFIRMATION */}
      {showDeleteModal && (
        <>
          <div className="modal-backdrop fade show" />
          <div className="modal fade show d-block">
            <div className="modal-dialog modal-dialog-centered modal-sm">
              <div className="modal-content rounded-4">
                <div className="modal-body text-center">
                  <p>
                    <strong>{intentTypesToDelete?.name}</strong>{" "}
                    will be deleted.
                  </p>

                  <div className="d-flex justify-content-center gap-3">
                    <button
                      className="btn btn-light"
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={confirmDelete}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default IntentTypeContainer;
