import { useEffect, useState } from "react";
import APICall from "../../../../../APICalls/APICall";

const BasicInfoTab = ({ intent, onChange }) => {
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [nameError, setNameError] = useState("");

  const isActive = intent.status !== "Inactive";

  /* ---------- Helpers ---------- */

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
    update("intent_name", name);
  };

  /* ---------- Fetch categories ---------- */

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await APICall.getT("/intents/category");
        setCategories(res || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  /* ---------- Category logic ---------- */

  const handleCategoryChange = (e) => {
    const value = e.target.value;

    if (value === "add-new") {
      setShowAddCategoryModal(true);
    } else {
      update("category", value);
    }
  };

  const handleSaveNewCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      await APICall.postT("/intents/category", {
        name: newCategory,
        description: ""
      });

      const res = await APICall.getT("/intents/category");
      setCategories(res || []);
      update("category", newCategory);

      setNewCategory("");
      setShowAddCategoryModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------- UI ---------- */

  return (
    <>
      {/* -------- Form -------- */}

      <div className="mb-3">
        <label className="form-label fw-bold small">Intent Name</label>
        <input
          className={`form-control ${nameError ? "is-invalid" : ""}`}
          value={intent.intent_name || ""}
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
          value={intent.displayName || ""}
          onChange={(e) => update("displayName", e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold small">Description</label>
        <textarea
          className="form-control"
          rows="3"
          value={intent.description || ""}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold small">Category</label>
        <select
          className="form-select"
          value={intent.category || ""}
          onChange={handleCategoryChange}
        >
          <option value="">Select</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold small">Priority</label>
        <select
          className="form-select"
          value={intent.priority || "Medium"}
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
          <span className={!isActive ? "text-danger" : "text-muted"}>
            Inactive
          </span>
          <input
            type="checkbox"
            className="form-check-input"
            checked={isActive}
            onChange={(e) =>
              update("status", e.target.checked ? "Active" : "Inactive")
            }
          />
          <span className={isActive ? "text-success" : "text-muted"}>
            Active
          </span>
        </div>
      </div>
    </>
  );
};

export default BasicInfoTab;
