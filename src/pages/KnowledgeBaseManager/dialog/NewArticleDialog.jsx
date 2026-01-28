import ArticleEditor from "../editor/ArticleEditor";
import "./new-article-dialog.css";


const NewArticleDialog = ({ onClose, article, onSave, onDelete }) => {
  const handleSave = (data) => {
    onSave?.(data);
    onClose();
  };
  const handleDelete = (data) => {
    onDelete?.(data);
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
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default NewArticleDialog;
