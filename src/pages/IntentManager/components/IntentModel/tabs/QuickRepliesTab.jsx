
const MAX_BUTTONS = 5;

const QuickRepliesTab = ({
  responses,
  setResponses,
  activeResponseId,
  onSelectQuickResponse, // 🔹 OPTIONAL (safe)
}) => {

  // 🔹 NEW: all quick reply responses
  const quickResponses = responses.filter(
    r => r.type === "quick"
  );

  // Find active response (unchanged)
  const activeResponse = responses.find(
    r => r.id === activeResponseId
  );

  const buttons = activeResponse?.quickReplies || [];

  /* ---------- HELPERS ---------- */
  const updateButtons = (newButtons) => {
    setResponses(prev =>
      prev.map(r =>
        r.id === activeResponseId
          ? { ...r, quickReplies: newButtons }
          : r
      )
    );
  };

  const addButton = () => {
    if (!activeResponse || buttons.length >= MAX_BUTTONS) return;

    updateButtons([
      ...buttons,
      {
        id: Date.now() + "-" + Math.random().toString(36).slice(2),
        text: "",
        actionType: "message",
        value: "",
      },
    ]);
  };

  const updateButton = (id, field, value) => {
    updateButtons(
      buttons.map(btn =>
        btn.id === id ? { ...btn, [field]: value } : btn
      )
    );
  };

  const deleteButton = (id) => {
    updateButtons(buttons.filter(btn => btn.id !== id));
  };

  /* ---------- EMPTY STATE ---------- */
  if (!activeResponseId) {
    return (
      <div className="alert alert-warning">
        <strong>No Quick Reply Response Selected</strong>
        <br />
        Please go to the <b>Responses</b> tab and select a response
        with <b>Quick Replies</b> type.
      </div>
    );
  }

  if (activeResponse?.type !== "quick") {
    return (
      <div className="alert alert-info">
        Selected response is not a <b>Quick Replies</b> type.
      </div>
    );
  }

  /* ---------- RENDER ---------- */
  return (
    <div className="container-fluid px-0">

      {/* 🔹 NEW: QUICK RESPONSE SELECTOR */}
      {quickResponses.length > 1 && (
        <div className="mb-3">
          <label className="fw-semibold mb-1">
            Quick Reply Responses
          </label>
          <div className="d-flex flex-wrap gap-2">
            {quickResponses.map((r, index) => (
              <button
                key={r.id}
                className={`btn btn-sm ${r.id === activeResponseId
                  ? "btn-primary"
                  : "btn-outline-primary"
                  }`}
                onClick={() =>
                  onSelectQuickResponse?.(r.id)
                }
              >
                Response {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* HEADER (unchanged) */}
      <div className="mb-3">
        <h6 className="fw-semibold mb-1">
          Quick Replies
        </h6>
        <small className="text-muted">
          Linked Response ID:
          <code className="ms-2">{activeResponseId}</code>
        </small>
      </div>

      {/* BUTTON LIST (unchanged) */}
      <div className="mb-4">
        {buttons.map((btn, index) => (
          <div
            key={btn.id}
            className="card mb-3 shadow-sm border-0"
          >
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">
                  Button {index + 1}
                </h6>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => deleteButton(btn.id)}
                >
                  Delete
                </button>
              </div>

              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">
                    Button Text
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={btn.text}
                    onChange={(e) =>
                      updateButton(btn.id, "text", e.target.value)
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Action Type
                  </label>
                  <select
                    className="form-select"
                    value={btn.actionType}
                    onChange={(e) =>
                      updateButton(btn.id, "actionType", e.target.value)
                    }
                  >
                    <option value="message">Send Message</option>
                    <option value="url">Open URL</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    {btn.actionType === "url" ? "URL" : "Message Value"}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={btn.value}
                    onChange={(e) =>
                      updateButton(btn.id, "value", e.target.value)
                    }
                  />
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* ADD BUTTON (unchanged) */}
      <button
        className="btn btn-primary mb-3"
        onClick={addButton}
        disabled={buttons.length >= MAX_BUTTONS}
      >
        + Add Button
      </button>

      {buttons.length >= MAX_BUTTONS && (
        <div className="text-danger small mb-3">
          Maximum of {MAX_BUTTONS} quick replies allowed.
        </div>
      )}

      {/* PREVIEW (unchanged) */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-light fw-semibold">
          Preview
        </div>
        <div className="card-body">
          {buttons.length === 0 ? (
            <p className="text-muted mb-0">
              No quick replies added yet.
            </p>
          ) : (
            <div className="d-flex flex-wrap gap-2">
              {buttons.map(btn => (
                <button
                  key={btn.id}
                  className="btn btn-outline-primary btn-sm"
                  disabled
                >
                  {btn.text || "Button"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default QuickRepliesTab;
