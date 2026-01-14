
import { articles } from "./articles.mock";
import ArticleRow from "./ArticleRow";

const ArticlesTable = ({ category, status, search, sort }) => {
  let filtered = [...articles];

  if (category !== "All" && category !== "All Articles") {
    filtered = filtered.filter(a => a.category === category);
  }

  if (status !== "All") {
    filtered = filtered.filter(a => a.status === status);
  }

  if (search) {
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (sort === "az") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }
  if (sort === "views") {
    filtered.sort((a, b) => b.views - a.views);
  }
  if (sort === "helpful") {
    filtered.sort((a, b) => b.helpful - a.helpful);
  }

  return (
    <table width="100%" cellPadding="8">
      <thead style={{ background: "#f1f5f9" }}>
        <tr>
          <th></th>
          <th>Title</th>
          <th>Category</th>
          <th>Status</th>
          <th>Views</th>
          <th>Helpful</th>
          <th>Updated</th>
          <th>Author</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {filtered.length === 0 ? (
          <tr>
            <td colSpan="9" style={{ textAlign: "center", padding: 20 }}>
              No articles found
            </td>
          </tr>
        ) : (
          filtered.map(article => (
            <ArticleRow key={article.id} article={article} />
          ))
        )}
      </tbody>
    </table>
  );
};

export default ArticlesTable;
