import { useState } from "react";

const MOCK_ARTICLES = [
  {
    id: 1,
    title: "Getting Started with API",
    category: "Getting Started",
    status: "Published",
    views: 120,
    helpful: 32,
    updatedAt: "2026-01-10",
    author: "Admin",
  },
  {
    id: 2,
    title: "Billing FAQ",
    category: "Account & Billing",
    status: "Draft",
    views: 45,
    helpful: 10,
    updatedAt: "2026-01-08",
    author: "Support",
  },
  {
    id: 3,
    title: "Password Reset Issues",
    category: "Technical Support",
    status: "Archived",
    views: 300,
    helpful: 85,
    updatedAt: "2025-12-29",
    author: "Admin",
  },
];

const ArticlesPanel = ({
  activeCategory,
  onNewArticle,
  onEdit,
}) => {
  const [articles, setArticles] = useState(MOCK_ARTICLES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sort, setSort] = useState("updated");
  const [selected, setSelected] = useState([]);

  let filtered = articles.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "All" || a.status === statusFilter;

    const matchCategory =
      activeCategory === "All" ||
      a.category === activeCategory;

    return matchSearch && matchStatus && matchCategory;
  });

  if (sort === "title") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }
  if (sort === "updated") {
    filtered.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
  }
  if (sort === "views") {
    filtered.sort((a, b) => b.views - a.views);
  }
  if (sort === "helpful") {
    filtered.sort((a, b) => b.helpful - a.helpful);
  }

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const duplicateArticle = (article) => {
    setArticles((prev) => [
      {
        ...article,
        id: Date.now(),
        title: article.title + " (Copy)",
        status: "Draft",
        updatedAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
  };

  const deleteArticle = (id) => {
    if (!confirm("Delete this article?")) return;
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <section className="articles-panel">
      <div className="articles-header">
        <input
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All</option>
          <option>Published</option>
          <option>Draft</option>
          <option>Archived</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="title">Title A-Z</option>
          <option value="updated">Recently Updated</option>
          <option value="views">Most Viewed</option>
          <option value="helpful">Most Helpful</option>
        </select>

        <button className="btn primary" onClick={onNewArticle}>
          New Article
        </button>
      </div>

      <table className="articles-table">
        <thead>
          <tr>
            <th>
              <input type="checkbox" />
            </th>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Views</th>
            <th>👍 Helpful</th>
            <th>Last Updated</th>
            <th>Author</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((a) => (
            <tr key={a.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(a.id)}
                  onChange={() => toggleSelect(a.id)}
                />
              </td>

              <td>
                <button
                  className="link-btn"
                  onClick={() => onEdit(a)}
                >
                  {a.title}
                </button>
              </td>

              <td>
                <span className="category-badge">
                  {a.category}
                </span>
              </td>

              <td>
                <span
                  className={`status ${a.status.toLowerCase()}`}
                >
                  {a.status}
                </span>
              </td>

              <td>{a.views}</td>
              <td>{a.helpful}</td>
              <td>{a.updatedAt}</td>
              <td>{a.author}</td>

              <td className="actions">
                <button onClick={() => onEdit(a)}>Edit</button>
                <button onClick={() => duplicateArticle(a)}>
                  Duplicate
                </button>
                <button onClick={() => deleteArticle(a.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {filtered.length === 0 && (
            <tr>
              <td colSpan={9} style={{ textAlign: "center" }}>
                No articles found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
};

export default ArticlesPanel;