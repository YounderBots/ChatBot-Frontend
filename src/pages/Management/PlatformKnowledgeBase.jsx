import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagementAPI from "./managementAPI";

const ARTICLE_STATUS_OPTIONS = ["", "PUBLISHED", "DRAFT", "ARCHIVED"];

const ARTICLE_STATUS_COLORS = {
    PUBLISHED: { color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
    DRAFT:     { color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
    ARCHIVED:  { color: "#64748b", bg: "rgba(100,116,139,0.1)" },
};

export default function PlatformKnowledgeBase() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [total,    setTotal]    = useState(0);
    const [page,     setPage]     = useState(1);
    const [search,   setSearch]   = useState("");
    const [orgId,    setOrgId]    = useState("");
    const [status,   setStatus]   = useState("");
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState("");

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const params = { page };
            if (search) params.search         = search;
            if (orgId)  params.org_id         = orgId;
            if (status) params.article_status = status;
            const data = await ManagementAPI.listKnowledgeBase(params);
            setArticles(data.articles);
            setTotal(data.total);
        } catch (err) {
            if (err.message?.includes("401")) navigate("/management/login");
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [page, search, orgId, status]);

    const resetFilters = () => { setSearch(""); setOrgId(""); setStatus(""); setPage(1); };
    const hasFilters = search || orgId || status;

    return (
        <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div>
                    <div style={labelStyle}>Search</div>
                    <input
                        placeholder="Title or tags…"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        style={{ ...inputStyle, width: 220 }}
                    />
                </div>
                <div>
                    <div style={labelStyle}>Org ID</div>
                    <input
                        placeholder="All orgs"
                        value={orgId}
                        onChange={e => { setOrgId(e.target.value); setPage(1); }}
                        style={{ ...inputStyle, width: 120 }}
                    />
                </div>
                <div>
                    <div style={labelStyle}>Status</div>
                    <select
                        value={status}
                        onChange={e => { setStatus(e.target.value); setPage(1); }}
                        style={{ ...inputStyle, width: 140 }}
                    >
                        {ARTICLE_STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s || "All statuses"}</option>
                        ))}
                    </select>
                </div>
                {hasFilters && (
                    <button onClick={resetFilters} style={clearBtnStyle}>Clear</button>
                )}
                <span style={{ color: "#64748b", fontSize: 12, marginLeft: "auto", alignSelf: "flex-end", paddingBottom: 2 }}>
                    {total} result{total !== 1 ? "s" : ""}
                </span>
            </div>

            {error && <div style={{ color: "#ef4444", marginBottom: 16, fontSize: 13 }}>{error}</div>}

            {loading ? (
                <div style={{ color: "#64748b", padding: "2rem", textAlign: "center" }}>Loading…</div>
            ) : (
                <div style={{ background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                        <thead>
                            <tr style={{ background: "#f8fafc" }}>
                                {["ID", "Org ID", "Title", "Tags", "Status", "Featured", "Published"].map(h => (
                                    <th key={h} style={thStyle}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {articles.length === 0 && (
                                <tr><td colSpan={7} style={{ ...tdStyle, color: "#64748b", textAlign: "center", padding: "2rem" }}>No articles found</td></tr>
                            )}
                            {articles.map(a => {
                                const sc = ARTICLE_STATUS_COLORS[a.article_status] || { color: "#64748b", bg: "rgba(100,116,139,0.1)" };
                                return (
                                    <tr key={a.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                                        <td style={tdStyle}>{a.id}</td>
                                        <td style={tdStyle}>
                                            <button
                                                onClick={() => navigate(`/management/org/${a.organization_id}`)}
                                                style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", padding: 0, fontSize: 13 }}
                                            >
                                                {a.organization_id || "—"}
                                            </button>
                                        </td>
                                        <td style={{ ...tdStyle, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>
                                            {a.title}
                                        </td>
                                        <td style={{ ...tdStyle, color: "#64748b", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {a.tags || "—"}
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ color: sc.color, background: sc.bg, padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                                                {a.article_status}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            {a.featured_article
                                                ? <span style={{ color: "#f59e0b", fontSize: 12 }}>★ Featured</span>
                                                : <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>
                                            }
                                        </td>
                                        <td style={{ ...tdStyle, color: "#64748b", whiteSpace: "nowrap" }}>
                                            {a.publish_date || "—"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end", alignItems: "center" }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={pageBtnStyle}>← Prev</button>
                <span style={{ color: "#64748b", fontSize: 13 }}>Page {page}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={articles.length < 20} style={pageBtnStyle}>Next →</button>
            </div>
        </div>
    );
}

const labelStyle    = { color: "#64748b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 };
const inputStyle    = { padding: "7px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#ffffff", color: "#0f172a", fontSize: 13 };
const clearBtnStyle = { padding: "7px 14px", borderRadius: 6, border: "1px solid #e2e8f0", background: "none", color: "#64748b", cursor: "pointer", fontSize: 13, alignSelf: "flex-end" };
const thStyle       = { padding: "10px 14px", textAlign: "left", color: "#64748b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" };
const tdStyle       = { padding: "11px 14px", fontSize: 13, color: "#0f172a" };
const pageBtnStyle  = { padding: "5px 14px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#ffffff", color: "#0f172a", cursor: "pointer", fontSize: 13 };
