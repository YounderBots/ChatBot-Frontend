import React, { useEffect, useState, useCallback } from "react";
import { Edit2, Trash2 } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import APICall from "../../../APICalls/APICall";


/* ================= COMPONENT ================= */

const CategoryContainer = () => {
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)

  const [loading, setLoading] = useState(true)

  /* ================= API LAYER ================= */

  const CategoryAPI = {
    fetchAll: async () => {
      const res = await APICall.getT("/intents/category")
      return res || []
    },

    create: async payload => {
      const res = await APICall.postT("/intents/category", payload)
      return res 
    },

    update: async payload => {
      const res = await APICall.postT(
        `/intents/updatecategory/${payload.id}`,
        payload
      )
      return res
    },

    remove: async id => {
      await APICall.postT(`/intents/deletecategory/${id}`)
      return true
    }
  }

  /* ================= FETCH ================= */

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true)
      const data = await CategoryAPI.fetchAll()
      // console.log("API DATA:", data)
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to load categories", err)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  /* ================= ADD / EDIT ================= */

  const handleAdd = () => {
    setActiveCategory({ name: "", description: "" })
    setIsModalOpen(true)
  }

  const handleEdit = category => {
    setActiveCategory(category)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
  if (!activeCategory?.name?.trim()) return

  try {
    setLoading(true)

    if (activeCategory.id) {
      await CategoryAPI.update(activeCategory)
    } else {
      await CategoryAPI.create(activeCategory)
    }

    await loadCategories()
    setIsModalOpen(false)
    setActiveCategory(null)
  } catch (err) {
    console.error("Save failed", err)
  } finally {
    setLoading(false)
  }
}


  /* ================= DELETE ================= */

  const handleDelete = category => {
    setCategoryToDelete(category)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) return

    try {
      setLoading(true)
      await CategoryAPI.remove(categoryToDelete.id)
      setCategories(prev =>
        prev.filter(c => c.id !== categoryToDelete.id)
      )
    } catch (err) {
      console.error("Delete failed", err)
    } finally {
      setShowDeleteModal(false)
      setCategoryToDelete(null)
      setLoading(false)
    }
  }

  /* ================= UI ================= */

  return (
    <div className="p-4 h-100 d-flex flex-column gap-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="fw-bold mb-0">Categories</h1>

        <button
          className="btn btn-primary"
          onClick={handleAdd}
          disabled={loading}
        >
          <i className="bi bi-plus-lg me-1" />
          Add Category
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
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-muted">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((cat, index) => (
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
                    {activeCategory?.id
                      ? "Edit Category"
                      : "Add Category"}
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
                    value={activeCategory?.name || ""}
                    onChange={e =>
                      setActiveCategory(prev => ({
                        ...prev,
                        name: e.target.value
                      }))
                    }
                  />

                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Description"
                    value={activeCategory?.description || ""}
                    onChange={e =>
                      setActiveCategory(prev => ({
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
                    <strong>{categoryToDelete?.name}</strong>{" "}
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

export default CategoryContainer;
