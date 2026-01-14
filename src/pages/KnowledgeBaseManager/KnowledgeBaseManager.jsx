import { useState } from "react";

import ArticlesHeader from "./articles/ArticlesHeader";
import ArticlesTable from "./articles/ArticlesTable";
import ArticleEditor from "./editor/ArticleEditor";

const KnowledgeBaseManager = () => {
  const [category, setCategory] = useState("All Articles");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("updated");

  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      {isEditing ? (
        <ArticleEditor onClose={() => setIsEditing(false)} />
      ) : (
        <>
          <ArticlesHeader
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            sort={sort}
            setSort={setSort}
            onNewArticle={() => setIsEditing(true)}
          />

          <ArticlesTable
            category={category}
            status={status}
            search={search}
            sort={sort}
          />
        </>
      )}
    </>
  );
};

export default KnowledgeBaseManager;
