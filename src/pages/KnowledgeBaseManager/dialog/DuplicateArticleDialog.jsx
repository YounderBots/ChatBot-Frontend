import { useMemo } from "react";
import ArticleEditor from "../editor/ArticleEditor";
import "./new-article-dialog.css";

const DuplicateArticleDialog = ({ onClose, article, onSave }) => {
    // We prepare the article data with the -copy suffix
    // Use useMemo so that the 'article' prop passed to ArticleEditor 
    // doesn't change on every render, which prevents resetting the form.
    const duplicatedData = useMemo(() => {
        if (!article) return null;
        return {
            ...article,
            id: undefined, // Clear ID so it's treated as a new article
            title: `${article.title}-copy`,
            status: "Draft",
        };
    }, [article]);

    return (
        <div className="kb-dialog-overlay">
            <div className="kb-dialog">
                {/* HEADER */}
                <div className="kb-dialog-header">
                    <h3>Duplicate Article</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {/* BODY */}
                <div className="kb-dialog-body">
                    {duplicatedData && (
                        <ArticleEditor
                            article={duplicatedData}
                            onCancel={onClose}
                            onSave={(data) => {
                                onSave(data);
                                onClose();
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DuplicateArticleDialog;
