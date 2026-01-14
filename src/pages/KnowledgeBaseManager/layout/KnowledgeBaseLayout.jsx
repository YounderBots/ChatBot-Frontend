import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArticlesPanel from "../articles/ArticlesPanel";

import "./kb-layout.css";

const categories = [
  { name: "Getting Started", count: 12 },
  { name: "Account & Billing", count: 8 },
  { name: "Technical Support", count: 15 },
  { name: "Product Info", count: 6 },
  { name: "Policies", count: 3 },
];

export default function KnowledgeBaseLayout() {
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();

  return (
    <div className="kb-layout">
      <aside className="kb-sidebar">
        <div
          className={`all-articles ${activeCategory === "All" ? "active" : ""}`}
          onClick={() => setActiveCategory("All")}
        >
          All Articles <span className="count">(44)</span>
        </div>

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

        <button className="manage-btn">Manage Categories</button>
      </aside>

      <ArticlesPanel
        activeCategory={activeCategory}
        onNewArticle={() => navigate("/articles/new")}
        onEdit={(a) => navigate(`/articles/${a.id}/edit`)}
      />
    </div>
  );
}
