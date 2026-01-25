import {
  Check,
  GripVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

export default function ManageCategoriesDialog({
  categories,
  setCategories,
  onClose,
}) {
  const [newCategory, setNewCategory] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [dragIndex, setDragIndex] = useState(null);

  /* ================= ADD ================= */
  const handleAdd = () => {
    if (!newCategory.trim()) return;
    setCategories((prev) => [
      ...prev,
      { name: newCategory.trim(), count: 0 },
    ]);
    setNewCategory("");
  };

  /* ================= DELETE ================= */
  const handleDelete = (index) => {
    if (categories[index].count > 0) return;
    setCategories((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= RENAME ================= */
  const startEdit = (i, name) => {
    setEditingIndex(i);
    setEditingValue(name);
  };

  const saveEdit = (i) => {
    if (!editingValue.trim()) return;
    setCategories((prev) =>
      prev.map((c, idx) =>
        idx === i ? { ...c, name: editingValue.trim() } : c
      )
    );
    setEditingIndex(null);
  };

  /* ================= DRAG & DROP ================= */
  const onDragStart = (index) => setDragIndex(index);

  const onDrop = (index) => {
    if (dragIndex === null || dragIndex === index) return;
    const updated = [...categories];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    setCategories(updated);
    setDragIndex(null);
  };

  return createPortal(
    <>
      {/* ================= ICON CSS ================= */}
      <style>
        {`
          .mc-icon {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            border: 1px solid #e5e7eb;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #0f172a;
            transition: background 0.15s ease, border-color 0.15s ease;
          }

          .mc-icon:hover {
            background: #f8fafc;
          }

          .mc-icon.danger {
            color: #ef4444;
          }

          .mc-icon.danger:hover {
            background: #fef2f2;
            border-color: #fecaca;
          }

          .mc-icon.success {
            color: #16a34a;
          }

          .mc-icon.success:hover {
            background: #ecfdf5;
            border-color: #bbf7d0;
          }

          .mc-icon:disabled {
            opacity: 0.4;
            cursor: not-allowed;
          }
        `}
      </style>

      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,23,42,0.45)",
          zIndex: 100000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 480,
            background: "#ffffff",
            borderRadius: 18,
            padding: 20,
            boxShadow: "0 30px 80px rgba(15,23,42,0.35)",
            border: "1px solid #e5e7eb",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18 }}>
              Manage Categories
            </h2>
            <button className="mc-icon" onClick={onClose}>
              <X size={16} />
            </button>
          </div>

          <hr style={{ borderColor: "#e5e7eb" }} />

          {/* CATEGORY LIST */}
          <div style={{ marginTop: 12 }}>
            {categories.map((c, i) => (
              <div
                key={i}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  marginBottom: 8,
                  background:
                    dragIndex === i ? "#eaf2ff" : "#f8fafc",
                }}
              >
                {/* DRAG */}
                <GripVertical size={16} color="#64748b" />

                {/* NAME */}
                {editingIndex === i ? (
                  <input
                    value={editingValue}
                    onChange={(e) =>
                      setEditingValue(e.target.value)
                    }
                    style={{
                      flex: 1,
                      padding: 6,
                      borderRadius: 8,
                      border: "1px solid #d1d5db",
                    }}
                  />
                ) : (
                  <span style={{ flex: 1 }}>{c.name}</span>
                )}

                {/* COUNT */}
                <span
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    minWidth: 28,
                    textAlign: "right",
                  }}
                >
                  {c.count}
                </span>

                {/* EDIT / SAVE */}
                {editingIndex === i ? (
                  <button
                    className="mc-icon success"
                    onClick={() => saveEdit(i)}
                  >
                    <Check size={16} />
                  </button>
                ) : (
                  <button
                    className="mc-icon"
                    onClick={() => startEdit(i, c.name)}
                  >
                    <Pencil size={16} />
                  </button>
                )}

                {/* DELETE */}
                <button
                  className="mc-icon danger"
                  disabled={c.count > 0}
                  onClick={() => handleDelete(i)}
                  title={
                    c.count > 0
                      ? "Cannot delete category with articles"
                      : "Delete"
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* ADD CATEGORY */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 16,
            }}
          >
            <input
              placeholder="New category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 12,
                border: "1px solid #d1d5db",
              }}
            />
            <button
              className="btn btn-primary"
              style={{
                color: "#ffffff",
                padding: "10px 16px",
                borderRadius: 12,
                border: "none",
                fontWeight: 600,
              }}
              onClick={handleAdd}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
