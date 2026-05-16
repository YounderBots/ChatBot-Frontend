import { useEffect, useState } from "react";
import APICall from "../../../APICalls/APICall";
import ArticleContentSection from "./ArticleContentSection";
import ArticleInfoSection from "./ArticleInfoSection";
import ArticleSEOSection from "./ArticleSEOSection";
import RelatedQuestions from "./RelatedQuestions";

const TABS = {
  INFO: "info",
  CONTENT: "content",
  SEO: "seo",
};

const DEMO_ARTICLES = [
  {
    title: "How to Reset Your Password",
    slug: "how-to-reset-password",
    tags: ["login", "password", "account"],
    content: "<h2>Resetting Your Password</h2><p>If you've forgotten your password, follow these simple steps to regain access to your account.</p><h3>Steps</h3><ol><li>Go to the login page and click <strong>Forgot Password</strong>.</li><li>Enter your registered email address and click <strong>Send Reset Link</strong>.</li><li>Check your inbox for an email from noreply@chatviq.com.</li><li>Click the reset link in the email (valid for 30 minutes).</li><li>Choose a new secure password and confirm it.</li></ol><p>If you don't receive the email within 5 minutes, check your spam folder or contact support.</p>",
    metaDescription: "Step-by-step guide to reset your ChatViq account password and regain access.",
    status: "Published",
  },
  {
    title: "Getting Started: Deploying Your First Chatbot",
    slug: "deploy-first-chatbot",
    tags: ["setup", "onboarding", "widget"],
    content: "<h2>Deploy Your First Chatbot in 5 Minutes</h2><p>This guide walks you through the minimum steps needed to get a working chatbot live on your website.</p><h3>Prerequisites</h3><ul><li>An active ChatViq account</li><li>Access to your website's HTML</li></ul><h3>Step 1 — Configure your bot</h3><p>Go to <strong>Settings → General</strong> and fill in your bot name, welcome message, and business hours.</p><h3>Step 2 — Add intents</h3><p>Navigate to <strong>Intent Manager</strong> and create at least 5 intents. Add 10+ training phrases per intent for best accuracy.</p><h3>Step 3 — Embed the widget</h3><p>Go to <strong>Channels → Chat Widget</strong>, copy the embed snippet, and paste it before the closing <code>&lt;/body&gt;</code> tag on your website.</p>",
    metaDescription: "A 5-minute guide to configuring and deploying your first ChatViq chatbot on your website.",
    status: "Published",
  },
  {
    title: "Understanding Analytics & KPI Metrics",
    slug: "analytics-kpi-guide",
    tags: ["analytics", "reporting", "metrics"],
    content: "<h2>Analytics Dashboard Overview</h2><p>The Analytics page gives you a real-time view of your chatbot's performance. Here's what each metric means.</p><h3>Key Metrics</h3><ul><li><strong>Total Conversations</strong> — All chat sessions in the selected period.</li><li><strong>Resolution Rate</strong> — Percentage of conversations resolved by the bot without escalation.</li><li><strong>CSAT Score</strong> — Average customer satisfaction rating (1–5 stars).</li><li><strong>Escalation Rate</strong> — Percentage of conversations handed off to a live agent.</li><li><strong>Avg. Response Time</strong> — Average time the bot takes to respond.</li></ul><h3>Filtering data</h3><p>Use the date range picker to filter by day, week, month, or custom range. You can also export data as CSV or PDF.</p>",
    metaDescription: "Understand what each metric means in the ChatViq analytics dashboard and how to use filters.",
    status: "Draft",
  },
];

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
  relatedQuestions: [],
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

  const [categories, setCategories] = useState([]);

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

  useEffect(() => {
    fetchCategory();
  }, []);

  /* ---------- SLUG AUTO ---------- */
  useEffect(() => {
    if (form.title && !form.slugTouched) {
      setForm((p) => ({ ...p, slug: generateSlug(p.title) }));
    }
  }, [form.title, form.slugTouched]);

  const fetchCategory = async () => {
    try {

      const res = await APICall.getT("/knowledgebase/category");
      const sortedCategories = [...res].sort(
        (a, b) => a.order - b.order
      );

      setCategories(sortedCategories)

    } catch (err) {
      alert(err.message || "Failed to add category");
    }
  };
  /* ---------- VALIDATION ---------- */
  const validate = () => {
    const err = {};
    if (!form.title.trim()) err.title = "Title is required";
    if (!form.category) err.category = "Category is required";
    // Content is now optional based on user preference
    // if (!form.content.replace(/<[^>]+>/g, "").trim())
    //   err.content = "Content is required";
    if (form.metaDescription.length > 160)
      err.meta = "Max 160 characters";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const fillDemo = () => {
    const demo = DEMO_ARTICLES[Math.floor(Math.random() * DEMO_ARTICLES.length)];
    setForm((prev) => ({
      ...EMPTY_FORM,
      ...demo,
      category: categories.length > 0 ? categories[0].id : "",
      slugTouched: true,
      relatedQuestions: prev.relatedQuestions,
    }));
    setErrors({});
  };

  const handlePublish = () => {
    if (!validate()) return;
    onSave?.({
      ...form,
      relatedQuestions: form.relatedQuestions,
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
      <div className="editor-tabs" style={{ display: "flex", alignItems: "center" }}>
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
        {!article && (
          <button
            type="button"
            onClick={fillDemo}
            title="Fill form with demo article data for quick testing"
            style={{
              marginLeft: "auto", fontSize: 12, padding: "4px 10px",
              background: "transparent", border: "1px solid #aaa",
              borderRadius: 5, cursor: "pointer", color: "#555",
            }}
          >
            Fill Demo Data
          </button>
        )}
      </div>

      {/* TAB CONTENT */}
      <div className="editor-card">
        {activeTab === TABS.INFO && (
          <ArticleInfoSection
            form={form}
            setForm={setForm}
            errors={errors}
            categories={categories}
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
              form={form}
              setForm={setForm}
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
