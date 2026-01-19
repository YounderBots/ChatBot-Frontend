import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./components/sidebar/Sidebar";
import ArticlesPanel from "./components/articles/ArticlesPanel";

const KnowledgeBaseDashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const location = useLocation();

  const isEditorPage =
    location.pathname.includes("/articles/new") ||
    (location.pathname.includes("/articles/") &&
      location.pathname.includes("/edit"));

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {!isEditorPage && (
        <div style={{ width: "280px", borderRight: "1px solid #ddd" }}>
          <Sidebar onCategorySelect={setSelectedCategory} />
        </div>
      )}

      <div style={{ flex: 1, padding: "16px" }}>
        <ArticlesPanel selectedCategory={selectedCategory} />
      </div>
    </div>
  );
};

export default KnowledgeBaseDashboard;