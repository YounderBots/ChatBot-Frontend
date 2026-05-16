import { useEffect, useState } from "react";
import { Card, Container } from "react-bootstrap";
import { BookOpen, FolderOpen, Settings2 } from "lucide-react";
import APICall from "../../../APICalls/APICall";
import ArticlesPanel from "../articles/ArticlesPanel";
import ManageCategoriesDialog from "../dialog/ManageCategoriesDialog";
import "./kb-layout.css";

export default function KnowledgeBaseLayout() {
  const [categories, setCategories]       = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [manageOpen, setManageOpen]       = useState(false);

  const totalCount = categories.reduce((sum, c) => sum + (c.count ?? 0), 0);

  const fetchCategory = async () => {
    try {
      const res = await APICall.getT("/knowledgebase/category");
      setCategories([...res].sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error("Failed to fetch categories:", err.message);
    }
  };

  useEffect(() => { fetchCategory(); }, []);

  return (
    <Container fluid className="h-100 d-flex flex-column" style={{ paddingLeft: 0, paddingRight: 0 }}>
      <Card className="border-0 rounded-4 shadow h-100 kb-card">
        <Card.Body className="p-0 d-flex kb-card-body">

          {/* ── Sidebar ── */}
          <aside className="kb-sidebar d-flex flex-column">
            <div className="kb-sidebar-header">
              <BookOpen size={16} className="me-2 opacity-75" />
              Knowledge Base
            </div>

            <nav className="kb-nav flex-grow-1">
              <div
                className={`kb-cat-item ${activeCategory === "All" ? "active" : ""}`}
                onClick={() => setActiveCategory("All")}
              >
                <span className="d-flex align-items-center gap-2">
                  <FolderOpen size={13} />
                  All Articles
                </span>
                <span className="kb-count">{totalCount}</span>
              </div>

              {categories.map((c) => (
                <div
                  key={c.id ?? c.name}
                  className={`kb-cat-item ${activeCategory === c.name ? "active" : ""}`}
                  onClick={() => setActiveCategory(c.name)}
                >
                  <span className="kb-cat-name">{c.name}</span>
                  <span className="kb-count">{c.count ?? 0}</span>
                </div>
              ))}
            </nav>

            <button className="kb-manage-btn" onClick={() => setManageOpen(true)}>
              <Settings2 size={13} className="me-2" />
              Manage Categories
            </button>
          </aside>

          {/* ── Main content ── */}
          <div className="kb-main d-flex flex-column">
            <ArticlesPanel
              activeCategory={activeCategory}
              onCategoryRefresh={fetchCategory}
            />
          </div>

        </Card.Body>
      </Card>

      {manageOpen && (
        <ManageCategoriesDialog
          categories={categories}
          setCategories={setCategories}
          fetchCategory={fetchCategory}
          onClose={() => setManageOpen(false)}
        />
      )}
    </Container>
  );
}
