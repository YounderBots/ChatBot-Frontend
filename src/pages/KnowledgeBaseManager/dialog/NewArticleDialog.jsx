import ArticleEditor from "../editor/ArticleEditor";
import "./new-article-dialog.css";

const NewArticleDialog = ({ onClose, article }) => {
  const handleSave = (data) => {
    console.log("ARTICLE PAYLOAD", data);
    onClose();
  };

  return (
    <div className="kb-dialog-overlay">
      <div className="kb-dialog">
        {/* HEADER */}
        <div className="kb-dialog-header">
          <h3>{article ? "Edit Article" : "Add Article"}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* BODY */}
        <div className="kb-dialog-body">
          <ArticleEditor
            article={article}
            onCancel={onClose}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
};

export default NewArticleDialog;
