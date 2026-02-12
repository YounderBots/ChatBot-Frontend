import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Brain, Edit2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Form, ProgressBar } from "react-bootstrap";
import APICall from "../../../APICalls/APICall";


/* ================= COMPONENT ================= */

const IntentDomainContainer = () => {
  const [intentDomain, setIntentDomain] = useState([])
  const [activeIntentDomain, setActiveIntentDomain] = useState(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [intentDomainToDelete, setIntentDomainToDelete] = useState(null)

  const [loading, setLoading] = useState(true)

  /* ================= API LAYER ================= */

  const IntentDomainAPI = {
    fetchAll: async () => {
      const res = await APICall.getT("/intents/intent_domain")
      return res || []
    },

    create: async payload => {
      const res = await APICall.postT("/intents/intent_domain", payload)
      return res
    },

    update: async payload => {
      const res = await APICall.postT(
        `/intents/update_intent_domain/${payload.id}`,
        payload
      )
      return res
    },

    remove: async id => {
      await APICall.postT(`/intents/delete_intent_domain/${id}`)
      return true
    },
    train: async id => {
      return await APICall.postT(`/nlp/train/${id}`)
    }
  }

  /* ================= FETCH ================= */

  const loadIntentDomain = useCallback(async () => {
    try {
      setLoading(true)
      const data = await IntentDomainAPI.fetchAll()
      setIntentDomain(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to load intent Domains", err)
      setIntentDomain([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadIntentDomain()
  }, [loadIntentDomain])

  /* ================= ADD / EDIT ================= */

  const handleAdd = () => {
    setActiveIntentDomain({
      name: "",
      description: "",
      rasa_endpoint: "",
      rasa_port: "",
      auto_reload_enabled: true,
      confidence_threshold: 60
    })
    setIsModalOpen(true)
  }

  const handleEdit = intent_domains => {

    setActiveIntentDomain(intent_domains)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!activeIntentDomain?.name?.trim()) return

    try {
      setLoading(true)

      if (activeIntentDomain.id) {
        await IntentDomainAPI.update(activeIntentDomain)
      } else {
        await IntentDomainAPI.create(activeIntentDomain)
      }

      await loadIntentDomain()
      setIsModalOpen(false)
      setActiveIntentDomain(null)
    } catch (err) {
      console.error("Save failed", err)
    } finally {
      setLoading(false)
    }
  }


  /* ================= DELETE ================= */

  const handleDelete = intent_domains => {
    setIntentDomainToDelete(intent_domains)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!intentDomainToDelete) return

    try {
      setLoading(true)
      await IntentDomainAPI.remove(intentDomainToDelete.id)
      setIntentDomain(prev =>
        prev.filter(c => c.id !== intentDomainToDelete.id)
      )
    } catch (err) {
      console.error("Delete failed", err)
    } finally {
      setShowDeleteModal(false)
      setIntentDomainToDelete(null)
      setLoading(false)
    }
  }

  const handleTrain = async domain => {
    try {
      setLoading(true)
      await IntentDomainAPI.train(domain.id)
      alert(`Training started for ${domain.name}`)
    } catch (err) {
      console.error("Training failed", err)
      alert("Training failed")
    } finally {
      setLoading(false)
    }
  }


  /* ================= UI ================= */

  return (
    <div className="p-4 h-100 d-flex flex-column gap-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="fw-bold mb-0">Domains</h1>

        <button
          className="btn btn-primary"
          onClick={handleAdd}
          disabled={loading}
        >
          <i className="bi bi-plus-lg me-1" />
          Add Domains
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
            ) : intentDomain.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-muted">
                  No intent Domains found
                </td>
              </tr>
            ) : (
              intentDomain.map((cat, index) => (
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
                      <Brain
                        size={18}
                        className="text-primary cursor-pointer"
                        title="Train Model"
                        onClick={() => handleTrain(cat)}
                      />
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
                    {activeIntentDomain?.id
                      ? "Edit Intent Domains"
                      : "Add Intent Domains"}
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
                    value={activeIntentDomain?.name || ""}
                    onChange={e =>
                      setActiveIntentDomain(prev => ({
                        ...prev,
                        name: e.target.value
                      }))
                    }
                  />

                  <textarea
                    className="form-control mb-3"
                    rows={3}
                    placeholder="Description"
                    value={activeIntentDomain?.description || ""}
                    onChange={e =>
                      setActiveIntentDomain(prev => ({
                        ...prev,
                        description: e.target.value
                      }))
                    }
                  />
                  <input
                    className="form-control mb-3"
                    placeholder="Rasa Endpoint (http://localhost:5005)"
                    value={activeIntentDomain?.rasa_endpoint || ""}
                    onChange={e =>
                      setActiveIntentDomain(prev => ({
                        ...prev,
                        rasa_endpoint: e.target.value
                      }))
                    }
                  />
                  <input
                    type="number"
                    className="form-control mb-3"
                    placeholder="Rasa Port"
                    value={activeIntentDomain?.rasa_port || ""}
                    onChange={e =>
                      setActiveIntentDomain(prev => ({
                        ...prev,
                        rasa_port: e.target.value
                      }))
                    }
                  />
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={activeIntentDomain?.auto_reload_enabled || false}
                      onChange={e =>
                        setActiveIntentDomain(prev => ({
                          ...prev,
                          auto_reload_enabled: e.target.checked
                        }))
                      }
                    />
                    <label className="form-check-label">
                      Auto Reload Model
                    </label>
                  </div>


                  {/* Confidence Threshold */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold small text-secondary">
                      Confidence Threshold ({activeIntentDomain?.confidence_threshold ?? 60}%)
                    </Form.Label>

                    <Form.Range
                      min={0}
                      max={100}
                      value={activeIntentDomain?.confidence_threshold ?? 60}
                      onChange={e =>
                        setActiveIntentDomain(prev => ({
                          ...prev,
                          confidence_threshold: Number(e.target.value)
                        }))
                      }
                    />

                    <ProgressBar
                      now={activeIntentDomain?.confidence_threshold ?? 60}
                      variant={
                        (activeIntentDomain?.confidence_threshold ?? 60) < 60
                          ? "danger"
                          : "success"
                      }
                    />
                  </Form.Group>



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
                    <strong>{intentDomainToDelete?.name}</strong>{" "}
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

export default IntentDomainContainer;
