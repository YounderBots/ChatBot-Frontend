import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ArticlesPanel from "../articles/ArticlesPanel";
import ManageCategoriesDialog from "../dialog/ManageCategoriesDialog";

import "./kb-layout.css";

export default function KnowledgeBaseLayout() {
  const navigate = useNavigate();
  const location = useLocation();

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

  const totalCount = categories.reduce(
    (sum, c) => sum + c.count,
    0
  );

  /* ================= ROUTE CHECK ================= */
  const isEditorPage =
    location.pathname.includes("/articles/new") ||
    location.pathname.includes("/articles/") &&
      location.pathname.includes("/edit");

  /* ================= RENDER ================= */
  return (
    <div className="kb-layout">
      {/* ================= SIDEBAR (HIDDEN ON EDIT / NEW) ================= */}
      {!isEditorPage && (
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
      )}

      {/* ================= CONTENT ================= */}
      <div className="kb-content">
        <ArticlesPanel
          activeCategory={activeCategory}
          onNewArticle={() => navigate("/articles/new")}
          onEdit={(a) => navigate(`/articles/${a.id}/edit`)}
        />
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
