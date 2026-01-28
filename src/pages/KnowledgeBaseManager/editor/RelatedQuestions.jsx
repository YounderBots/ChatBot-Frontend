import { Trash2 } from "lucide-react";

const RelatedQuestions = ({ form, setForm }) => {
  const questions = form.relatedQuestions || [];

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      relatedQuestions: [...questions, ""],
    }));
  };

  const updateQuestion = (index, value) => {
    setForm((prev) => ({
      ...prev,
      relatedQuestions: questions.map((q, i) =>
        i === index ? value : q
      ),
    }));
  };

  const removeQuestion = (index) => {
    setForm((prev) => ({
      ...prev,
      relatedQuestions: questions.filter((_, i) => i !== index),
    }));
  };

  return (
    <section className="related-questions">
      <h4>Related Questions</h4>

      {questions.length === 0 && (
        <p className="empty-preview">No related questions yet.</p>
      )}

      {questions.map((q, i) => (
        <div key={`rq-${i}`} className="related-question-item">
          <input
            value={q}
            placeholder="Alternate user question"
            onChange={(e) => updateQuestion(i, e.target.value)}
          />
          <div
            className="btn-danger p-2 rounded mc-icon danger"
            onClick={() => removeQuestion(i)}>
            <Trash2 size={16} />
          </div>
        </div>
      ))}

      <button
        type="button"
        className="add-question-btn"
        onClick={addQuestion}
      >
        + Add Question
      </button>
    </section>
  );
};

export default RelatedQuestions;
