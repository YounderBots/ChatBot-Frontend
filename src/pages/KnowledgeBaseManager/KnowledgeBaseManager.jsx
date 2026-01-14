import { useState } from "react";
import KnowledgeBaseLayout from "./layout/KnowledgeBaseLayout.jsx";
import ArticlesPanel from "./articles/ArticlesPanel.jsx";
import NewArticleDialog from "./dialog/NewArticleDialog.jsx";

const KnowledgeBaseManager = () => {
  const [openEditor, setOpenEditor] = useState(false);
  const [editArticle, setEditArticle] = useState(null);

  return (
    <>
      <KnowledgeBaseLayout>
        <ArticlesPanel
          onNewArticle={() => {
            setEditArticle(null);
            setOpenEditor(true);
          }}
          onEdit={(article) => {
            setEditArticle(article);
            setOpenEditor(true);
          }}
        />
      </KnowledgeBaseLayout>

      {openEditor && (
        <NewArticleDialog
          article={editArticle}
          onClose={() => setOpenEditor(false)}
        />
      )}
    </>
  );
};

export default KnowledgeBaseManager;
