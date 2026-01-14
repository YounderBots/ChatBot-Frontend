
const ArticleRow = ({ article }) => {
  return (
    <tr>
      <td><input type="checkbox" /></td>
      <td style={{ cursor: "pointer", color: "#1e7bd9" }}>
        {article.title}
      </td>
      <td>{article.category}</td>
      <td>{article.status}</td>
      <td>{article.views}</td>
      <td>👍 {article.helpful}</td>
      <td>{article.updatedAt}</td>
      <td>{article.author}</td>
      <td>
        <span style={{ cursor: "pointer" }}>Edit</span> |{" "}
        <span style={{ cursor: "pointer" }}>Duplicate</span> |{" "}
        <span style={{ cursor: "pointer", color: "red" }}>Delete</span>
      </td>
    </tr>
  );
};

export default ArticleRow;
