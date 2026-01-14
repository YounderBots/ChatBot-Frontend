const EditorActions = ({ onCancel }) => {
  return (
    <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
      <button>Save Draft</button>
      <button style={{ background: "#1e7bd9", color: "#fff" }}>
        Publish
      </button>
      <button onClick={onCancel}>Cancel</button>
      <button style={{ color: "red" }}>Delete</button>
    </div>
  );
};

export default EditorActions;
