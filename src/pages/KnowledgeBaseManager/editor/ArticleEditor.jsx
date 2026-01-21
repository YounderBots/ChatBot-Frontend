import { useEffect, useState } from "react";
import ArticleContentSection from "./ArticleContentSection";
import ArticleSEOSection from "./ArticleSEOSection";
import ArticleInfoSection from "./ArticleInfoSection";
import RelatedQuestions from "./RelatedQuestions";

const TABS = {
  INFO: "info",
  CONTENT: "content",
  SEO: "seo",
};

const generateSlug = (text = "") =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const EMPTY_FORM = {
  title: "",
  slug: "",
  slugTouched: false,
  category: "",
  tags: [],
  content: "",
  metaDescription: "",
  featuredImage: "",
  status: "Draft",
  featured: false,
  publishDate: "",
};

const ArticleEditor = ({
  article,
  onCancel,
  onSave,
  onDelete,
  inDialog = false,
}) => {
  const [activeTab, setActiveTab] = useState(TABS.INFO);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [relatedQuestions, setRelatedQuestions] = useState([]);

  const [categories, setCategories] = useState([
    "Getting Started",
    "Account & Billing",
    "Technical Support",
  ]);

  const allTags = ["login", "billing", "api", "setup", "pricing", "error"];

  /* ---------- PREFILL FOR EDIT ---------- */
  useEffect(() => {
    if (article) {
      setForm({
        ...EMPTY_FORM,
        ...article,
        slugTouched: true,
      });
    }
  }, [article]);

  /* ---------- SLUG AUTO ---------- */
  useEffect(() => {
    if (form.title && !form.slugTouched) {
      setForm((p) => ({ ...p, slug: generateSlug(p.title) }));
    }
  }, [form.title, form.slugTouched]);

  /* ---------- VALIDATION ---------- */
  const validate = () => {
    const err = {};
    if (!form.title.trim()) err.title = "Title is required";
    if (!form.content.replace(/<[^>]+>/g, "").trim())
      err.content = "Content is required";
    if (form.metaDescription.length > 160)
      err.meta = "Max 160 characters";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handlePublish = () => {
    if (!validate()) return;
    onSave?.({
      ...form,
      relatedQuestions,
    });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      onDelete?.(form.id || article?.id);
    }
  };

  return (
    <div className={`article-editor-body tab-${activeTab}`}>
      {/* TABS */}
      <div className="editor-tabs">
        <button
          className={activeTab === TABS.INFO ? "active" : ""}
          onClick={() => setActiveTab(TABS.INFO)}
        >
          Article Info
        </button>
        <button
          className={activeTab === TABS.CONTENT ? "active" : ""}
          onClick={() => setActiveTab(TABS.CONTENT)}
        >
          Content
        </button>
        <button
          className={activeTab === TABS.SEO ? "active" : ""}
          onClick={() => setActiveTab(TABS.SEO)}
        >
          SEO & Settings
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="editor-card">
        {activeTab === TABS.INFO && (
          <ArticleInfoSection
            form={form}
            setForm={setForm}
            errors={errors}
            categories={categories}
            setCategories={setCategories}
            allTags={allTags}
          />
        )}

        {activeTab === TABS.CONTENT && (
          <>
            <ArticleContentSection form={form} setForm={setForm} />
            {errors.content && (
              <small className="error">{errors.content}</small>
            )}
            <RelatedQuestions
              questions={relatedQuestions}
              setQuestions={setRelatedQuestions}
            />
          </>
        )}

        {activeTab === TABS.SEO && (
          <ArticleSEOSection
            form={form}
            setForm={setForm}
            errors={errors}
          />
        )}
      </div>

      {/* FOOTER AREA */}
      <div className={`editor-actions ${activeTab === TABS.INFO ? "info-tab-actions" : ""}`}>
        <div className="seo-actions-wrapper">
          {activeTab === TABS.SEO && (
            <>
              <button type="button" className="btn-delete" onClick={handleDelete}>
                Delete Article
              </button>
              <button type="button" className="btn-link">Preview</button>
            </>
          )}
        </div>
        <div className="main-actions-wrapper">
          <button className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn primary" onClick={handlePublish}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;
