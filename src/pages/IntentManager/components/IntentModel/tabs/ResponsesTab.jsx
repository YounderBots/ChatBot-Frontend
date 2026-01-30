
const VARIABLES = [
  "{user_name}",
  "{product_name}",
  "{current_time}",
  "{balance}",
];

const RESPONSE_TYPES = [
  { value: "text", label: "Text Only" },
  { value: "quick", label: "Quick Replies" },
  { value: "buttons", label: "Buttons" },
  { value: "card", label: "Card" },
];



const ResponsesTab = ({
  responses,
  setResponses,
  onSelectQuickResponse,
}) => {

  // const safeResponses = Array.isArray(responses) ? responses : [];
  // console.log("safeResponses", safeResponses);


const normalizedResponses = responses.map(r => ({
  id: r.id,
  content: r.response_text,     // map text
  type: r.response_type,        // 🔥 THIS FIXES DROPDOWN
  preview: false,
  priority: r.priority,
  quickReplies: [],
}));

setResponses(normalizedResponses);

  /* ---------- HELPERS ---------- */
  const normalizePriority = (list) =>
    list.map((r, i) => ({ ...r, priority: i + 1 }));

  const updateResponse = (id, key, value) => {
    setResponses(prev =>
      prev.map(r =>
        r.id === id ? { ...r, [key]: value } : r
      )
    );
  };

  const addResponse = () => {
    setResponses(prev =>
      normalizePriority([
        ...prev,
        {
          id: Date.now() + "-" + Math.random().toString(36).slice(2),
          content: "",
          type: "text",
          preview: false,
          priority: prev.length + 1,
          quickReplies: [],
        },
      ])
    );
  };
  

  const deleteResponse = (id) => {
    setResponses(prev =>
      normalizePriority(prev.filter(r => r.id !== id))
    );
  };

  const moveResponse = (index, direction) => {
    setResponses(prev => {
      const updated = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= updated.length) return prev;
      [updated[index], updated[target]] = [updated[target], updated[index]];
      return normalizePriority(updated);
    });
  };

  const insertVariable = (variable) => {
    document.execCommand("insertText", false, variable);
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  /* ---------- RENDER ---------- */
  return (
    <div className="d-flex gap-4">
      <div className="flex-grow-1">

        {/* HEADER */}
        <div className="d-flex justify-content-between mb-3">
          <h5 className="fw-semibold">Responses</h5>
          <button
            className="btn btn-sm btn-primary"
            onClick={addResponse}
          >
            <i className="bi bi-plus-lg me-1" /> Add Response
          </button>
        </div>

        {/* RESPONSES */}
        {responses.map((res, index) => (
          <div
            key={res.id}
            className="p-3 mb-3 border rounded shadow-sm bg-white"
          >
            {/* HEADER */}
            <div className="d-flex justify-content-between mb-2">
              <strong>Response #{index + 1}</strong>
              <div className="btn-group btn-group-sm">
                <button
                  className="btn btn-light"
                  onClick={() => moveResponse(index, "up")}
                >
                  ↑
                </button>
                <button
                  className="btn btn-light"
                  onClick={() => moveResponse(index, "down")}
                >
                  ↓
                </button>
                <button
                  className="btn btn-light text-danger"
                  onClick={() => deleteResponse(res.id)}
                >
                  🗑
                </button>
              </div>
            </div>

            {/* TOOLBAR */}
            <div className="d-flex flex-wrap gap-2 mb-2">

              <div className="btn-group btn-group-sm">
                <button
                  className="btn btn-light fw-bold"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => formatText("bold")}
                >
                  B
                </button>
                <button
                  className="btn btn-light fst-italic"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => formatText("italic")}
                >
                  I
                </button>
                <button
                  className="btn btn-light"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => {
                    const url = prompt("Enter URL");
                    if (url) formatText("createLink", url);
                  }}
                >
                  🔗
                </button>
              </div>

              <select
                className="form-select form-select-sm w-auto"
                onChange={(e) => insertVariable(e.target.value)}
              >
                <option value="">Insert Variable</option>
                {VARIABLES.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>

              <select
                className="form-select form-select-sm w-auto"
                value={res.type}
                onChange={(e) => {
                  const newType = e.target.value;

                  updateResponse(res.id, "type", newType);

                  // 🔹 ADDITION: sync quick reply selection
                  if (newType === "quick") {
                    onSelectQuickResponse(res.id);
                  } else {
                    onSelectQuickResponse?.(null);
                  }
                }}
              >
                {RESPONSE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
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
                <label className="form-check-label small">
                  Preview
                </label>
              </div>
            </div>

            {/* EDITOR / PREVIEW */}
            {!res.preview ? (
              <div
                contentEditable
                className="form-control mb-2"
                style={{ minHeight: "90px" }}
                suppressContentEditableWarning
                onInput={(e) =>
                  updateResponse(res.id, "content", e.currentTarget.innerHTML)
                }
              />
            ) : (
              <div className="border rounded p-2 bg-light mb-2">
                <div
                  dangerouslySetInnerHTML={{
                    __html: res.content || "<em>No content</em>",
                  }}
                />
              </div>
            )}

            {/* FOOTER */}
            <div className="d-flex align-items-center gap-2">
              <small className="text-muted">Priority</small>
              <input
                className="form-control form-control-sm w-25"
                value={res.priority}
                disabled
              />
            </div>

            {/* QUICK INFO */}
            {res.type === "quick" && (
              <div className="small text-primary mt-2">
                Quick replies linked to response ID:
                <code className="ms-1">{res.id}</code>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResponsesTab;
