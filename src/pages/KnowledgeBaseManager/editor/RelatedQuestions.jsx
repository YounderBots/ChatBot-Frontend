const RelatedQuestions = ({ questions, setQuestions }) => {
  const addQuestion = () => {
    setQuestions((prev) => [...prev, ""]);
  };

  const updateQuestion = (index, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? value : q))
    );
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
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
          <button type="button" onClick={() => removeQuestion(i)}>
            ❌
          </button>
        </div>
      ))}

      <button type="button" className="add-question-btn" onClick={addQuestion}>
        + Add Question
      </button>
    </section>
  );
};

export default RelatedQuestions;
