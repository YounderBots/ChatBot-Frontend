import React, { useState } from "react";

const MIN_PHRASES = 10;
const MAX_CHARS = 100;

const TrainingPhrasesTab = ({ phrases, setPhrases }) => {
  const [newPhrase, setNewPhrase] = useState("");
  const [newLanguage, setNewLanguage] = useState("en");
  const [error, setError] = useState("");
  const [dragIndex, setDragIndex] = useState(null);

  const handleAddPhrase = () => {
    if (!newPhrase.trim()) return;

    const duplicate = phrases.some(
      (p) => p.text.toLowerCase() === newPhrase.toLowerCase()
    );

    if (duplicate) {
      setError("Duplicate phrase detected.");
      return;
    }

    setPhrases(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: newPhrase,
        language: newLanguage,
      },
    ]);

    setNewPhrase("");
    setError("");
  };

  const handleDelete = (id) => {
    setPhrases(prev => prev.filter(p => p.id !== id));
  };

  const handleDragStart = (index) => setDragIndex(index);

  const handleDrop = (index) => {
    if (dragIndex === null) return;

    setPhrases(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(index, 0, moved);
      return updated;
    });

    setDragIndex(null);
  };

  return (
    <div className="h-100 d-flex flex-column">

      {/* ACTION BAR */}
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-secondary btn-sm">
          Import CSV
        </button>
      </div>

      {/* ADD PHRASE */}
      <div className="input-group mb-4 shadow-sm">
        <input
          type="text"
          className="form-control"
          value={newPhrase}
          maxLength={MAX_CHARS}
          placeholder="Enter training phrase"
          onChange={(e) => setNewPhrase(e.target.value)}
        />

        <select
          className="form-select"
          style={{ maxWidth: "80px" }}
          value={newLanguage}
          onChange={(e) => setNewLanguage(e.target.value)}
        >
          <option value="en">EN</option>
          <option value="hi">HI</option>
          <option value="ta">TA</option>
        </select>

        <button
          className="btn btn-primary"
          onClick={handleAddPhrase}
        >
          + Add
        </button>
      </div>

      {/* WARNINGS */}
      {error && (
        <div className="alert alert-warning py-2 mb-3 small">
          {error}
        </div>
      )}

      {phrases.length < MIN_PHRASES && (
        <div className="alert alert-info py-2 mb-3 small">
          Minimum {MIN_PHRASES} phrases required.
        </div>
      )}

      {/* PHRASE LIST */}
      <div className="flex-fill overflow-auto">
        {phrases.map((phrase, index) => (
          <div
            key={phrase.id}
            className="input-group mb-2 p-1 border rounded align-items-center bg-light"
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
          >
            <span className="input-group-text bg-transparent border-0 text-muted">
              ⋮⋮
            </span>

            <input
              type="text"
              className="form-control border-0 bg-transparent shadow-none"
              value={phrase.text}
              maxLength={MAX_CHARS}
              onChange={(e) => {
                const updated = [...phrases];
                updated[index].text = e.target.value;
                setPhrases(updated);
              }}
            />

            <span className="badge bg-white text-secondary border me-2">
              {phrase.language.toUpperCase()}
            </span>

            <span className="text-muted small me-3">
              {phrase.text.length}/{MAX_CHARS}
            </span>

            <button
              className="btn btn-link text-secondary p-0 px-2"
              onClick={() => handleDelete(phrase.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainingPhrasesTab;
