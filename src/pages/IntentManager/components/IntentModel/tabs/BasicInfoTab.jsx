import React, { useState } from "react";

const BasicInfoTab = ({ intent, onChange }) => {
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([
    "General",
    "Account",
    "Payments",
    "Support",
  ]);
  const [nameError, setNameError] = useState("");

  const isActive = intent.status !== "Inactive";

  const update = (key, value) => {
    onChange(prev => ({ ...prev, [key]: value }));
  };

  const validateName = (name) => {
    const regex = /^[a-z0-9_]+$/;
    if (!name) {
      setNameError("Intent name is required");
      return;
    }
    if (!regex.test(name)) {
      setNameError("Only lowercase letters, numbers, and underscores allowed");
      return;
    }
    setNameError("");
    update("name", name);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;

    if (value === "add-new") {
      setShowAddCategoryModal(true);
    } else {
      update("category", value);
    }
  };

  const handleSaveNewCategory = () => {
    if (!newCategory.trim()) return;

    setCategories(prev => [...prev, newCategory]);
    update("category", newCategory);
    setNewCategory("");
    setShowAddCategoryModal(false);
  };

  return (
    <>
      {/* -------- Add Category Modal -------- */}
      {showAddCategoryModal && (
        <>
          <div className="modal-backdrop show" style={{ opacity: 0.5 }} />
          <div className="modal d-block">
            <div className="modal-dialog modal-dialog-centered modal-sm">
              <div className="modal-content rounded-4">
                <div className="modal-header">
                  <h6 className="fw-bold">Add New Category</h6>
                  <button
                    className="btn-close"
                    onClick={() => setShowAddCategoryModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <input
                    className="form-control"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowAddCategoryModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleSaveNewCategory}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* -------- Form -------- */}
      <div className="mb-3">
        <label className="form-label fw-bold small">Intent Name</label>
        <input
          className={`form-control ${nameError ? "is-invalid" : ""}`}
          value={intent.name}
          onChange={(e) => validateName(e.target.value)}
        />
        {nameError && (
          <div className="invalid-feedback">{nameError}</div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold small">Display Name</label>
        <input
          className="form-control"
          value={intent.displayName}
          onChange={(e) => update("displayName", e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold small">Description</label>
        <textarea
          className="form-control"
          rows="3"
          value={intent.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold small">Category</label>
        <select
          className="form-select"
          value={intent.category}
          onChange={handleCategoryChange}
        >
          <option value="">Select</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
          <option value="add-new">+ Add New</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold small">Priority</label>
        <select
          className="form-select"
          value={intent.priority}
          onChange={(e) => update("priority", e.target.value)}
        >
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold small mb-2">Status</label>
        <div className="d-flex align-items-center gap-3">
          <span className={!isActive ? "text-danger" : "text-muted"}>Inactive</span>
          <input
            type="checkbox"
            className="form-check-input"
            checked={isActive}
            onChange={(e) =>
              update("status", e.target.checked ? "Active" : "Inactive")
            }
          />
          <span className={isActive ? "text-success" : "text-muted"}>Active</span>
        </div>
      </div>
    </>
  );
};

export default BasicInfoTab;
