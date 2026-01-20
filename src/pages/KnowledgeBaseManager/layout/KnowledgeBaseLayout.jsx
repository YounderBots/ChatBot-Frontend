import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArticlesPanel from "../articles/ArticlesPanel";
import ManageCategoriesDialog from "../dialog/ManageCategoriesDialog";

import "./kb-layout.css";

export default function KnowledgeBaseLayout() {
  const navigate = useNavigate();

  /* ================= CATEGORIES STATE ================= */
  const [categories, setCategories] = useState([
    { name: "Getting Started", count: 12 },
    { name: "Account & Billing", count: 8 },
    { name: "Technical Support", count: 15 },
    { name: "Product Info", count: 6 },
    { name: "Policies", count: 3 },
  ]);

  const [activeCategory, setActiveCategory] = useState("All");
  const [manageOpen, setManageOpen] = useState(false);

  const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

  /* ================= RENDER ================= */
  return (
    <div className="kb-page-wrapper">
      {/* ================= GRID LAYOUT ================= */}
      <div className="kb-layout">
        {/* ================= SIDEBAR ================= */}
        <aside className="kb-sidebar">
          {/* All Articles */}
          <div
            className={`all-articles ${
              activeCategory === "All" ? "active" : ""
            }`}
            onClick={() => setActiveCategory("All")}
          >
            All Articles <span className="count">({totalCount})</span>
          </div>

          {/* Categories */}
          {categories.map((c) => (
            <div
              key={c.name}
              className={`category-row ${
                activeCategory === c.name ? "active" : ""
              }`}
              onClick={() => setActiveCategory(c.name)}
            >
              <span>{c.name}</span>
              <span className="count">{c.count}</span>
            </div>
          ))}

          {/* Manage Categories */}
          <button
            className="manage-btn"
            onClick={() => setManageOpen(true)}
          >
            Manage Categories
          </button>
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        {/* 🔥 Wrapper ensures correct height sync with sidebar */}
        <div className="kb-main">
          <ArticlesPanel
            activeCategory={activeCategory}
            onNewArticle={() => navigate("/articles/new")}
            onEdit={(a) => navigate(`/articles/${a.id}/edit`)}
          />
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {manageOpen && (
        <ManageCategoriesDialog
          categories={categories}
          setCategories={setCategories}
          onClose={() => setManageOpen(false)}
        />
      )}
    </div>
  );
}
