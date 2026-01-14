import { useState } from "react";
import Sidebar from "./components/sidebar/Sidebar";
import ArticlesPanel from "./components/articles/ArticlesPanel";

const KnowledgeBaseDashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "280px", borderRight: "1px solid #ddd" }}>
        <Sidebar onCategorySelect={setSelectedCategory} />
      </div>

      <div style={{ flex: 1, padding: "16px" }}>
        <ArticlesPanel selectedCategory={selectedCategory} />
      </div>
    </div>
  );
};

export default KnowledgeBaseDashboard;
