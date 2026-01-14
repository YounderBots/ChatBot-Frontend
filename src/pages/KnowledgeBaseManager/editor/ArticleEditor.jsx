import { useState, useEffect } from "react";
import ArticleContentSection from "./ArticleContentSection";
import RelatedQuestions from "./RelatedQuestions";
import ArticleSEOSection from "./ArticleSEOSection";
import "./editor.css";

const TABS = {
  INFO: "info",
  CONTENT: "content",
  SEO: "seo",
};

const generateSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const ArticleEditor = () => {
  const [activeTab, setActiveTab] = useState(TABS.INFO);

  /* ---------- MASTER FORM STATE ---------- */
  const [form, setForm] = useState({
    title: "",
    slug: "",
    slugTouched: false,
    category: "",
    tags: [],
    content: "",
    metaDescription: "",
    featuredImage: null,
    status: "Draft",
    featured: false,
    publishDate: "",
  });

  const [categories, setCategories] = useState([
    "Getting Started",
    "Account & Billing",
    "Technical Support",
  ]);

  const existingTags = [
    "login",
    "billing",
    "api",
    "setup",
    "pricing",
    "error",
  ];

  const [tagInput, setTagInput] = useState("");
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [errors, setErrors] = useState({});

  /* ---------- SLUG AUTO‑GEN ---------- */
  useEffect(() => {
    if (form.title && !form.slugTouched) {
      setForm((p) => ({ ...p, slug: generateSlug(p.title) }));
    }
  }, [form.title]);

  /* ---------- VALIDATION ---------- */
  const validate = () => {
    const err = {};
    if (!form.title.trim()) err.title = "Title is required";
    if (form.title.length > 200) err.title = "Max 200 characters";
    if (!form.content.replace(/<[^>]+>/g, "").trim())
      err.content = "Content is required";
    if (form.metaDescription.length > 160)
      err.meta = "Max 160 characters";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const onPublish = () => {
    if (!validate()) return alert("Fix validation errors");
    console.log("FINAL ARTICLE PAYLOAD", {
      ...form,
      relatedQuestions,
    });
    alert("Article payload logged in console");
  };

  /* ---------- TAG HANDLERS ---------- */
  const addTag = (val) => {
    const tag = val.toLowerCase().trim();
    if (!tag || form.tags.includes(tag) || form.tags.length >= 10) return;
    setForm({ ...form, tags: [...form.tags, tag] });
    setTagInput("");
  };

  const removeTag = (tag) =>
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });

  const filteredTags = existingTags.filter(
    (t) => t.includes(tagInput) && !form.tags.includes(t)
  );

  return (
    <div className="editor-page">
      {/* HEADER */}
      <div className="editor-header">
        <h2>New Article</h2>
      </div>

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

      {/* CARD */}
      <div className="editor-card">
        {/* ================= SECTION‑1 ================= */}
        {activeTab === TABS.INFO && (
          <>
            <h4>Article Info</h4>

            <div className="article-info-grid">
              {/* TITLE */}
              <div className="field">
                <input
                  placeholder="Article title"
                  maxLength={200}
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
                <div className="field-meta">
                  <small>{form.title.length}/200</small>
                  {errors.title && (
                    <small className="error">{errors.title}</small>
                  )}
                </div>
              </div>

              {/* SLUG */}
              <div className="field">
                <input
                  placeholder="URL Slug"
                  value={form.slug}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      slug: e.target.value,
                      slugTouched: true,
                    })
                  }
                />
                <small className="slug-preview">
                  Preview: yoursite.com/help/{form.slug || "your-slug"}
                </small>
              </div>

              {/* CATEGORY */}
              <div className="field">
                <select
                  value={form.category}
                  onChange={(e) => {
                    if (e.target.value === "__new__") {
                      const name = prompt("New category name");
                      if (name) {
                        setCategories([...categories, name]);
                        setForm({ ...form, category: name });
                      }
                    } else {
                      setForm({ ...form, category: e.target.value });
                    }
                  }}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                  <option value="__new__">+ Create new category</option>
                </select>
              </div>

              {/* TAGS */}
              <div className="field tag-field">
                <div className="tag-input-wrapper">
                  {form.tags.map((tag) => (
                    <span key={tag} className="tag-chip">
                      {tag}
                      <button onClick={() => removeTag(tag)}>×</button>
                    </span>
                  ))}
                  <input
                    placeholder="Add tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addTag(tagInput);
                      }
                    }}
                  />
                </div>

                {tagInput && filteredTags.length > 0 && (
                  <div className="tag-suggestions">
                    {filteredTags.map((t) => (
                      <div key={t} onClick={() => addTag(t)}>
                        {t}
                      </div>
                    ))}
                  </div>
                )}

                <small>{form.tags.length}/10 tags</small>
              </div>
            </div>
          </>
        )}

        {/* ================= SECTION‑2 ================= */}
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

        {/* ================= SECTION‑3 ================= */}
        {activeTab === TABS.SEO && (
          <ArticleSEOSection
            form={form}
            setForm={setForm}
            errors={errors}
            onPreview={() => alert("Preview mode")}
            onDelete={() => {
              if (confirm("Delete this article?")) alert("Deleted");
            }}
          />
        )}
      </div>

      {/* ACTION BAR */}
      <div className="editor-actions">
        <button className="btn ghost">Cancel</button>
        <button className="btn secondary">Save Draft</button>
        <button className="btn primary" onClick={onPublish}>
          Publish
        </button>
      </div>
    </div>
  );
};

export default ArticleEditor;
