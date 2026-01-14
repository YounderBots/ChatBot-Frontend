
const ArticlesHeader = ({
  search,
  setSearch,
  status,
  setStatus,
  sort,
  setSort,
  onNewArticle,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      {/* Search */}
      <input
        type="text"
        placeholder="Search articles..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ flex: 1, padding: 8 }}
      />

      {/* Status */}
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="All">All Status</option>
        <option value="Published">Published</option>
        <option value="Draft">Draft</option>
        <option value="Archived">Archived</option>
      </select>

      {/* Sort */}
      <select value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="updated">Recently Updated</option>
        <option value="az">Title A–Z</option>
        <option value="views">Most Viewed</option>
        <option value="helpful">Most Helpful</option>
      </select>

      {/* New */}
      <button
        onClick={onNewArticle}
        style={{
          background: "#1e7bd9",
          color: "#fff",
          padding: "8px 14px",
          borderRadius: 6,
          border: "none",
        }}
      >
        New Article
      </button>
    </div>
  );
};

export default ArticlesHeader;
