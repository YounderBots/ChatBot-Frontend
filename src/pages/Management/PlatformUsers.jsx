import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagementAPI from "./managementAPI";

export default function PlatformUsers() {
    const navigate = useNavigate();
    const [users,   setUsers]   = useState([]);
    const [total,   setTotal]   = useState(0);
    const [page,    setPage]    = useState(1);
    const [search,  setSearch]  = useState("");
    const [orgId,   setOrgId]   = useState("");
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState("");

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const params = { page };
            if (search) params.email  = search;
            if (orgId)  params.org_id = orgId;
            const data = await ManagementAPI.listUsers(params);
            setUsers(data.users);
            setTotal(data.total);
        } catch (err) {
            if (err.message?.includes("401")) navigate("/management/login");
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [page, search, orgId]);

    const resetFilters = () => { setSearch(""); setOrgId(""); setPage(1); };
    const hasFilters = search || orgId;

    return (
        <div>
            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div>
                    <div style={labelStyle}>Email</div>
                    <input
                        placeholder="Search by email…"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        style={{ ...inputStyle, width: 220 }}
                    />
                </div>
                <div>
                    <div style={labelStyle}>Org ID</div>
                    <input
                        placeholder="Filter by org…"
                        value={orgId}
                        onChange={e => { setOrgId(e.target.value); setPage(1); }}
                        style={{ ...inputStyle, width: 120 }}
                    />
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
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f8fafc" }}>
                                {["ID", "Name", "Email", "Org ID", "Status", "Joined"].map(h => (
                                    <th key={h} style={thStyle}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 && (
                                <tr><td colSpan={6} style={{ ...tdStyle, color: "#64748b", textAlign: "center", padding: "2rem" }}>No users found</td></tr>
                            )}
                            {users.map(u => (
                                <tr key={u.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                                    <td style={tdStyle}>{u.id}</td>
                                    <td style={{ ...tdStyle, fontWeight: 500 }}>{u.fullname || "—"}</td>
                                    <td style={{ ...tdStyle, color: "#64748b" }}>{u.email}</td>
                                    <td style={tdStyle}>
                                        <button
                                            onClick={() => navigate(`/management/org/${u.organization_id}`)}
                                            style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", padding: 0, fontSize: 13 }}
                                        >
                                            {u.organization_id}
                                        </button>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            color: u.status === "ACTIVE" ? "#22c55e" : "#64748b",
                                            background: u.status === "ACTIVE" ? "rgba(34,197,94,0.1)" : "rgba(100,116,139,0.1)",
                                            padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                                        }}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, color: "#64748b", whiteSpace: "nowrap" }}>
                                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end", alignItems: "center" }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={pageBtnStyle}>← Prev</button>
                <span style={{ color: "#64748b", fontSize: 13 }}>Page {page}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={users.length < 20} style={pageBtnStyle}>Next →</button>
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
