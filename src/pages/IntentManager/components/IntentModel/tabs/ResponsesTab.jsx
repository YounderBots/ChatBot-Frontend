import React, { useState } from "react";

const ResponsesTab = () => {
  const [responses, setResponses] = useState([
    {
      id: 1,
      text: "Your current balance is {balance}.",
      type: "text",
      priority: 1,
      preview: false,
    },
  ]);

  const variables = [
    "{user_name}",
    "{product_name}",
    "{current_time}",
    "{balance}",
  ];

  const addResponse = () => {
    setResponses((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: "",
        type: "text",
        priority: prev.length + 1,
        preview: false,
      },
    ]);
  };

  const updateResponse = (id, field, value) => {
    setResponses((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const deleteResponse = (id) => {
    setResponses((prev) => prev.filter((r) => r.id !== id));
  };

  const moveResponse = (index, direction) => {
    const updated = [...responses];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= updated.length) return;
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setResponses(updated);
  };

  return (
    <div className="d-flex gap-4">
      {/* LEFT PANEL */}
      <div className="flex-grow-1">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0 text-dark fw-semibold">Responses</h5>
          <button
            className="btn btn-sm text-white"
            style={{ background: "var(--cvq-blue-600)" }}
            onClick={addResponse}
          >
            <i className="bi bi-plus-lg me-1"></i> Add Response
          </button>
        </div>

        {/* Response List */}
        {responses.map((res, index) => (
          <div
            key={res.id}
            className="mb-3 p-3 rounded-3"
            style={{
              background: "var(--cvq-white)",
              boxShadow: "var(--cvq-shadow-sm)",
              border: "1px solid var(--cvq-gray-200)",
            }}
          >
            {/* Card Header */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-semibold text-secondary">
                Response #{index + 1}
              </span>

              <div className="btn-group btn-group-sm">
                <button
                  className="btn btn-light"
                  onClick={() => moveResponse(index, "up")}
                >
                  <i className="bi bi-arrow-up"></i>
                </button>
                <button
                  className="btn btn-light"
                  onClick={() => moveResponse(index, "down")}
                >
                  <i className="bi bi-arrow-down"></i>
                </button>
                <button
                  className="btn btn-light text-danger"
                  onClick={() => deleteResponse(res.id)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              <div className="btn-group btn-group-sm shadow-sm">
                <button className="btn btn-light fw-bold">B</button>
                <button className="btn btn-light fst-italic">I</button>
                <button className="btn btn-light text-decoration-underline">
                  U
                </button>
                <button className="btn btn-light">
                  <i className="bi bi-link"></i>
                </button>
              </div>

              <select
                className="form-select form-select-sm w-auto"
                onChange={(e) =>
                  updateResponse(res.id, "text", res.text + " " + e.target.value)
                }
              >
                <option value="">Insert Variable</option>
                {variables.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>

              <select
                className="form-select form-select-sm w-auto"
                value={res.type}
                onChange={(e) =>
                  updateResponse(res.id, "type", e.target.value)
                }
              >
                <option value="text">Text Only</option>
                <option value="quick">Quick Replies</option>
                <option value="buttons">Buttons</option>
                <option value="card">Card</option>
              </select>

              <div className="form-check form-switch ms-auto">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={res.preview}
                  onChange={(e) =>
                    updateResponse(res.id, "preview", e.target.checked)
                  }
                />
                <label className="form-check-label small">Preview</label>
              </div>
            </div>

            {/* Editor / Preview */}
            {!res.preview ? (
              <textarea
                className="form-control mb-2"
                rows="3"
                value={res.text}
                onChange={(e) =>
                  updateResponse(res.id, "text", e.target.value)
                }
              />
            ) : (
              <div
                className="p-2 rounded-2 mb-2"
                style={{
                  background: "var(--cvq-gray-50)",
                  border: "1px dashed var(--cvq-gray-300)",
                }}
              >
                {res.text || <em className="text-muted">No content</em>}
              </div>
            )}

            {/* Footer */}
            <div className="d-flex align-items-center gap-2">
              <label className="small text-secondary">Priority</label>
              <input
                type="number"
                className="form-control form-control-sm w-25"
                value={res.priority}
                onChange={(e) =>
                  updateResponse(res.id, "priority", e.target.value)
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResponsesTab;
