import { Modal } from "react-bootstrap";
import ArticleEditor from "../editor/ArticleEditor";
import "../dialog/new-article-dialog.css";

const NewArticleDialog = ({ onClose, article, onSave, onDelete }) => {
  const handleSave   = (data) => { onSave?.(data);   onClose(); };
  const handleDelete = (id)   => { onDelete?.(id);   onClose(); };

  return (
    <Modal
      show
      onHide={onClose}
      size="xl"
      scrollable
      centered
      className="kb-article-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold" style={{ fontSize: "1rem" }}>
          {article ? "Edit Article" : "New Article"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0">
        <ArticleEditor
          article={article}
          onCancel={onClose}
          onSave={handleSave}
          onDelete={handleDelete}
          inDialog
        />
      </Modal.Body>
    </Modal>
  );
};

export default NewArticleDialog;
