import { useState, useMemo } from "react";
import { Edit, Copy, Trash2 } from "lucide-react";
import NewArticleDialog from "../dialog/NewArticleDialog";

/* ================= MOCK DATA ================= */
const MOCK_ARTICLES = Array.from({ length: 18 }).map((_, i) => ({
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
  updatedAt: `2026-01-${String((i % 28) + 1).padStart(2, "0")}`,
  author: i % 2 === 0 ? "Admin" : "Support",
}));

const PAGE_SIZE = 5;

const ArticlesPanel = () => {
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
      return matchSearch && matchStatus;
    });

    if (sort === "updated")
      data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    if (sort === "views") data.sort((a, b) => b.views - a.views);

    return data;
  }, [articles, search, statusFilter, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  /* ================= ACTION HANDLERS ================= */
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
        {/* HEADER */}
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
            <option>All</option>
            <option>Published</option>
            <option>Draft</option>
            <option>Archived</option>
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="updated">Recently Updated</option>
            <option value="views">Most Viewed</option>
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

        {/* TABLE */}
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

                {/* ✅ WORKING ACTION ICONS */}
                <td className="actions">
                  <button
                    title="Edit"
                    onClick={() => handleEdit(a)}
                  >
                    <Edit size={16} />
                  </button>

                  <button
                    title="Duplicate"
                    onClick={() => handleDuplicate(a)}
                  >
                    <Copy size={16} />
                  </button>

                  <button
                    className="danger"
                    title="Delete"
                    onClick={() => handleDelete(a.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="pagination-bar">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={page === i + 1 ? "active" : ""}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
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

      {/* MODAL */}
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
};

export default ArticlesPanel;