import { BrainCircuit, Copy, Edit, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Badge, Button, Form, InputGroup, Pagination, Table,
} from "react-bootstrap";
import APICall from "../../../APICalls/APICall";
import { usePermission } from "../../../Context/AuthContext";
import DuplicateArticleDialog from "../dialog/DuplicateArticleDialog";
import NewArticleDialog from "../dialog/NewArticleDialog";

const PAGE_SIZE = 10;

const STATUS_VARIANT = { published: "success", draft: "warning", archived: "secondary" };

export default function ArticlesPanel({ activeCategory = "All", onCategoryRefresh }) {
  const { canAdd, canEdit, canDelete } = usePermission("/Knowledge-Base");

  const [articles,             setArticles]             = useState([]);
  const [search,               setSearch]               = useState("");
  const [statusFilter,         setStatusFilter]         = useState("All");
  const [sort,                 setSort]                 = useState("updated");
  const [page,                 setPage]                 = useState(1);
  const [dialogOpen,           setDialogOpen]           = useState(false);
  const [duplicateDialogOpen,  setDuplicateDialogOpen]  = useState(false);
  const [editingArticle,       setEditingArticle]       = useState(null);
  const [articleToDuplicate,   setArticleToDuplicate]   = useState(null);

  /* ── AI semantic search ── */
  const [aiSearch,    setAiSearch]    = useState(false);
  const [aiResults,   setAiResults]   = useState(null);
  const [aiLoading,   setAiLoading]   = useState(false);
  const aiDebounceRef                 = useRef(null);

  const runSemanticSearch = useCallback(async (query) => {
    if (!query.trim()) { setAiResults(null); return; }
    setAiLoading(true);
    try {
      const res = await APICall.getT(
        `/knowledgebase/semantic_search?q=${encodeURIComponent(query)}&limit=20`
      );
      setAiResults(res?.results ?? []);
    } catch {
      setAiResults([]);
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!aiSearch) { setAiResults(null); return; }
    clearTimeout(aiDebounceRef.current);
    aiDebounceRef.current = setTimeout(() => runSemanticSearch(search), 400);
    return () => clearTimeout(aiDebounceRef.current);
  }, [search, aiSearch, runSemanticSearch]);

  /* ── filter + sort ── */
  const filtered = useMemo(() => {
    let data = articles.filter((a) => {
      const matchSearch   = a.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus   = statusFilter === "All" || a.status === statusFilter;
      const matchCategory = activeCategory === "All" ||
        a.category === activeCategory || a.categoryName === activeCategory;
      return matchSearch && matchStatus && matchCategory;
    });
    if (sort === "updated") data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    if (sort === "az")      data.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "views")   data.sort((a, b) => b.views - a.views);
    return data;
  }, [articles, search, statusFilter, sort, activeCategory]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── data fetching ── */
  const fetchArticles = async () => {
    try {
      const res = await APICall.getT("/knowledgebase/article");
      setArticles(res.map((item) => ({
        id:               item.id,
        title:            item.title         ?? "",
        slug:             item.url           ?? "",
        slugTouched:      true,
        category:         item.category_id   ?? "",
        categoryName:     item.category      ?? "",
        tags:             Array.isArray(item.tags)
                            ? item.tags
                            : (item.tags ?? "").split(",").map(t => t.trim()).filter(Boolean),
        content:          item.contents      ?? "",
        metaDescription:  item.meta_description ?? "",
        featuredImage:    item.featured_image   ?? "",
        status:           item.article_status   ?? "Draft",
        featured:         Boolean(item.featured_article),
        publishDate:      item.publish_date  ?? "",
        relatedQuestions: (item.questions ?? []).map(q =>
          typeof q === "string" ? q : q.question
        ),
        updatedAt: item.updated_at,
        author:    item.author,
        views:     247,
      })));
    } catch (err) {
      console.error("Failed to fetch articles:", err.message);
    }
  };

  useEffect(() => { fetchArticles(); }, []);

  /* ── actions ── */
  const handleEdit      = (a) => { setEditingArticle(a); setDialogOpen(true); };
  const handleDuplicate = (a) => { setArticleToDuplicate(a); setDuplicateDialogOpen(true); };

  const handleSave = async (data) => {
    try {
      const payload = {
        title:             data.title,
        url:               data.slug,
        category_id:       parseInt(data.category),
        tags:              data.tags ?? "",
        contents:          data.content ?? "",
        meta_description:  data.metaDescription ?? "",
        featured_image:    data.featuredImage ?? null,
        featured_article:  data.featured ?? false,
        publish_date:      data.publishDate ?? null,
        article_status:    data.status ?? "DRAFT",
        related_questions: (data.relatedQuestions ?? []).map(q => ({
          question: q.question ?? q,
        })),
      };
      if (data.id) {
        await APICall.postT(`/knowledgebase/article/${data.id}`, payload);
      } else {
        await APICall.postT("/knowledgebase/article", payload);
      }
      fetchArticles();
      onCategoryRefresh?.();
      setDialogOpen(false);
      setEditingArticle(null);
    } catch (err) {
      alert(err.message ?? "Failed to save article");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this article?")) return;
    await APICall.postT(`/knowledgebase/article/delete/${id}`);
    fetchArticles();
    onCategoryRefresh?.();
    setDialogOpen(false);
  };

  /* ── pagination helper ── */
  const pageItems = useMemo(() => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    return Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i).filter(p => p <= totalPages);
  }, [page, totalPages]);

  /* ── render ── */
  return (
    <div className="d-flex flex-column h-100" style={{ overflow: "hidden" }}>

      {/* ── Toolbar ── */}
      <div className="kb-toolbar">
        <InputGroup size="sm" style={{ maxWidth: 260, flex: "1 1 200px" }}>
          <Form.Control
            placeholder="Search articles…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <Button variant="outline-secondary" size="sm" onClick={() => setSearch("")}>
              <X size={13} />
            </Button>
          )}
        </InputGroup>

        <Form.Select
          size="sm"
          style={{ width: 130, flex: "0 0 auto" }}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="All">All Status</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
          <option value="Archived">Archived</option>
        </Form.Select>

        <Form.Select
          size="sm"
          style={{ width: 160, flex: "0 0 auto" }}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="updated">Recently Updated</option>
          <option value="az">Title A–Z</option>
          <option value="views">Most Viewed</option>
        </Form.Select>

        <Button
          size="sm"
          variant={aiSearch ? "primary" : "outline-secondary"}
          onClick={() => { setAiSearch(v => !v); setAiResults(null); }}
          className="d-flex align-items-center gap-1 flex-shrink-0"
        >
          <BrainCircuit size={13} />
          {aiSearch ? "AI On" : "AI Search"}
        </Button>

        {canAdd && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => { setEditingArticle(null); setDialogOpen(true); }}
            className="d-flex align-items-center gap-1 ms-auto flex-shrink-0"
          >
            <Plus size={14} />
            New Article
          </Button>
        )}
      </div>

      {/* ── AI banner ── */}
      {aiSearch && aiResults !== null && (
        <div className="kb-ai-banner">
          <BrainCircuit size={13} style={{ color: "#60a5fa" }} />
          <span>
            {aiLoading
              ? "Searching…"
              : `${aiResults.length} AI-matched article${aiResults.length !== 1 ? "s" : ""}`}
          </span>
          <button onClick={() => { setAiResults(null); setSearch(""); }}>
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="kb-table-wrap">
        <Table hover responsive className="align-middle mb-0" style={{ minWidth: 700 }}>
          <thead className="table-light">
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>{aiSearch && aiResults ? "Relevance" : "Views"}</th>
              <th>Updated</th>
              <th>Author</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {aiSearch && aiResults !== null ? (
              aiResults.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    No relevant articles found.
                  </td>
                </tr>
              ) : (
                aiResults.map((r) => {
                  const a = articles.find(x => x.id === r.article_id);
                  return (
                    <tr key={r.article_id}>
                      <td>
                        <button
                          className="btn btn-link p-0 text-start"
                          onClick={() => a && handleEdit(a)}
                        >
                          {r.title}
                        </button>
                      </td>
                      <td>
                        <Badge pill bg="secondary">{a?.categoryName || "—"}</Badge>
                      </td>
                      <td>
                        <Badge pill bg={STATUS_VARIANT[r.status?.toLowerCase()] ?? "secondary"}>
                          {r.status || "—"}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{
                            width: 48, height: 4,
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: 2, overflow: "hidden",
                          }}>
                            <div style={{
                              width: `${Math.round((r.relevance ?? 0) * 100)}%`,
                              height: "100%",
                              background: "#3b82f6",
                              borderRadius: 2,
                            }} />
                          </div>
                          <small className="text-muted">
                            {Math.round((r.relevance ?? 0) * 100)}%
                          </small>
                        </div>
                      </td>
                      <td className="small text-muted">{a?.updatedAt || "—"}</td>
                      <td className="small">{a?.author || "—"}</td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1">
                          {a && canEdit   && <Button size="sm" variant="outline-secondary" onClick={() => handleEdit(a)}><Edit size={13} /></Button>}
                          {a && canEdit   && <Button size="sm" variant="outline-secondary" onClick={() => handleDuplicate(a)}><Copy size={13} /></Button>}
                          {a && canDelete && <Button size="sm" variant="outline-danger"    onClick={() => handleDelete(a.id)}><Trash2 size={13} /></Button>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-5 text-muted">
                  No articles found.
                </td>
              </tr>
            ) : (
              paginated.map((a) => (
                <tr key={a.id}>
                  <td>
                    <button
                      className="btn btn-link p-0 text-start"
                      onClick={() => handleEdit(a)}
                    >
                      {a.title}
                    </button>
                  </td>
                  <td>
                    <Badge
                      pill
                      style={{
                        background: "rgba(232,113,10,0.15)",
                        color: "#fb923c",
                        border: "1px solid rgba(232,113,10,0.25)",
                      }}
                    >
                      {a.categoryName || "—"}
                    </Badge>
                  </td>
                  <td>
                    <Badge pill bg={STATUS_VARIANT[a.status?.toLowerCase()] ?? "secondary"}>
                      {a.status}
                    </Badge>
                  </td>
                  <td className="small text-muted">{a.views}</td>
                  <td className="small text-muted">{a.updatedAt}</td>
                  <td className="small">{a.author}</td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-1">
                      {canEdit   && <Button size="sm" variant="outline-secondary" onClick={() => handleEdit(a)}><Edit size={13} /></Button>}
                      {canEdit   && <Button size="sm" variant="outline-secondary" onClick={() => handleDuplicate(a)}><Copy size={13} /></Button>}
                      {canDelete && <Button size="sm" variant="outline-danger"    onClick={() => handleDelete(a.id)}><Trash2 size={13} /></Button>}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="kb-pagination-bar">
          <small className="text-muted">
            Page {page} of {totalPages} · {filtered.length} articles
          </small>
          <Pagination size="sm" className="mb-0">
            <Pagination.Prev disabled={page === 1} onClick={() => setPage(p => p - 1)} />
            {pageItems.map(p => (
              <Pagination.Item key={p} active={p === page} onClick={() => setPage(p)}>
                {p}
              </Pagination.Item>
            ))}
            <Pagination.Next disabled={page === totalPages} onClick={() => setPage(p => p + 1)} />
          </Pagination>
        </div>
      )}

      {/* ── Dialogs ── */}
      {dialogOpen && (
        <NewArticleDialog
          article={editingArticle}
          onClose={() => { setDialogOpen(false); setEditingArticle(null); }}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
      {duplicateDialogOpen && (
        <DuplicateArticleDialog
          article={articleToDuplicate}
          onClose={() => { setDuplicateDialogOpen(false); setArticleToDuplicate(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
