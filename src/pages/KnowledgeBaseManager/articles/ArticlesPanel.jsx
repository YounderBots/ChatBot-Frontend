import { useState, useMemo } from "react";
import { Edit, Copy, Trash2 } from "lucide-react";
import NewArticleDialog from "../dialog/NewArticleDialog";

/* ================= MOCK DATA ================= */
const MOCK_ARTICLES = Array.from({ length: 50 }).map((_, i) => ({
  id: i + 1,
  title: `Sample Article ${i + 1}`,
  category:
    i % 3 === 0
      ? "Getting Started"
      : i % 3 === 1
      ? "Account & Billing"
      : "Technical Support",
  status:
    i % 3 === 0 ? "Published" : i % 3 === 1 ? "Draft" : "Archived",
  views: Math.floor(Math.random() * 500),
  helpful: Math.floor(Math.random() * 100),
  updatedAt: `2026-01-${String((i % 28) + 1).padStart(2, "0")}`,
  author: i % 2 === 0 ? "Admin" : "Support",
}));

const PAGE_SIZE = 5;

export default function ArticlesPanel({ activeCategory = "All" }) {
  const [articles, setArticles] = useState(MOCK_ARTICLES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sort, setSort] = useState("updated");
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  /* ================= FILTER + SORT ================= */
  const filtered = useMemo(() => {
    let data = articles.filter((a) => {
      const matchSearch = a.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "All" || a.status === statusFilter;

      const matchCategory =
        activeCategory === "All" || a.category === activeCategory;

      return matchSearch && matchStatus && matchCategory;
    });

    switch (sort) {
      case "updated":
        data.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        break;
      case "az":
        data.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "views":
        data.sort((a, b) => b.views - a.views);
        break;
      case "helpful":
        data.sort((a, b) => b.helpful - a.helpful);
        break;
      default:
        break;
    }

    return data;
  }, [articles, search, statusFilter, sort, activeCategory]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const visiblePages = Array.from(
    { length: Math.min(3, totalPages - page + 1) },
    (_, i) => page + i
  );

  /* ================= ACTIONS ================= */
  const handleEdit = (article) => {
    setEditingArticle(article);
    setDialogOpen(true);
  };

  const handleDuplicate = (article) => {
    setArticles((prev) => [
      {
        ...article,
        id: Date.now(),
        title: `${article.title} (Copy)`,
        status: "Draft",
        updatedAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this article?")) return;
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  /* ================= RENDER ================= */
  return (
    <>
      <section className="articles-panel">
        {/* ================= HEADER ================= */}
        <div className="articles-header">
          <input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="updated">Recently Updated</option>
            <option value="az">Title A–Z</option>
            <option value="views">Most Viewed</option>
            <option value="helpful">Most Helpful</option>
          </select>

          <button
            className="btn primary"
            onClick={() => {
              setEditingArticle(null);
              setDialogOpen(true);
            }}
          >
            New Article
          </button>
        </div>

        {/* ================= TABLE (HEIGHT SOURCE) ================= */}
        <div className="kb-table-card">
          <table className="articles-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Views</th>
                <th>Last Updated</th>
                <th>Author</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((a) => (
                <tr key={a.id}>
                  <td>
                    <button
                      className="link-btn"
                      onClick={() => handleEdit(a)}
                    >
                      {a.title}
                    </button>
                  </td>
                  <td>
                    <span className="category-badge">{a.category}</span>
                  </td>
                  <td>
                    <span className={`status ${a.status.toLowerCase()}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>{a.views}</td>
                  <td>{a.updatedAt}</td>
                  <td>{a.author}</td>
                  <td className="actions">
                    <button onClick={() => handleEdit(a)}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDuplicate(a)}>
                      <Copy size={16} />
                    </button>
                    <button
                      className="danger"
                      onClick={() => handleDelete(a.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center" }}>
                    No articles found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION (OUTSIDE TABLE) ================= */}
        {totalPages > 1 && (
          <div className="pagination-bar">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>

            {visiblePages.map((p) => (
              <button
                key={p}
                className={p === page ? "active" : ""}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* ================= MODAL ================= */}
      {dialogOpen && (
        <NewArticleDialog
          article={editingArticle}
          onClose={() => {
            setDialogOpen(false);
            setEditingArticle(null);
          }}
        />
      )}
    </>
  );
}
