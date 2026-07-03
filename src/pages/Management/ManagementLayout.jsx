import {
    BarChart3, ChevronLeft, ChevronRight, ChevronsLeft,
    CreditCard, Cpu, Database, FileText, Globe,
    LayoutDashboard, LogOut, Search, Shield, UserCog, Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import dpPlaceholder from "../../layout/assets/dpPlaceholder.png";
import "./ManagementLayout.css";

const ChatViq      = "/assets/images/chatviq.png";

const NAV_SECTIONS = [
    {
        label: "OVERVIEW",
        items: [
            { label: "Dashboard",      path: "/management/dashboard",      icon: LayoutDashboard },
            { label: "Analytics",      path: "/management/analytics",      icon: BarChart3 },
        ],
    },
    {
        label: "INTELLIGENCE",
        items: [
            { label: "Intents",        path: "/management/intents",        icon: Cpu },
            { label: "Knowledge Base", path: "/management/knowledge-base", icon: Database },
        ],
    },
    {
        label: "PLATFORM",
        items: [
            { label: "Users",          path: "/management/users",          icon: Users },
            { label: "Billing",        path: "/management/billing",        icon: CreditCard },
            { label: "Channels",       path: "/management/channels",       icon: Globe },
        ],
    },
    {
        label: "AUDIT & ACCESS",
        items: [
            { label: "Audit Logs",     path: "/management/audit-logs",     icon: FileText },
            { label: "Admin Users",    path: "/management/admins",         icon: UserCog },
            { label: "Admin Roles",    path: "/management/admin-roles",    icon: Shield },
        ],
    },
];

function getActiveNavPath(pathname) {
    if (pathname.startsWith("/management/org/")) return "/management/dashboard";
    const flat = NAV_SECTIONS.flatMap(s => s.items);
    return [...flat].sort((a, b) => b.path.length - a.path.length)
        .find(n => pathname.startsWith(n.path))?.path || "";
}

function getPageTitle(pathname) {
    if (pathname.startsWith("/management/org/")) return "Organization Detail";
    const flat = NAV_SECTIONS.flatMap(s => s.items);
    // longest match first to avoid /management/knowledge-base matching /management/knowledge
    return [...flat].sort((a, b) => b.path.length - a.path.length)
        .find(n => pathname.startsWith(n.path))?.label || "Management";
}

/* ─── Sidebar menu ─── */
const SidebarMenu = ({ isExpanded, isMobile, activePath, navigate }) => (
    <div className={`mg-menu ${!isMobile && !isExpanded ? "collapsed" : ""}`}>
        {NAV_SECTIONS.map(section => (
            <div key={section.label} className="mg-section">
                {(isMobile || isExpanded) && (
                    <div className="mg-section-label">{section.label}</div>
                )}
                {section.items.map(item => {
                    const Icon     = item.icon;
                    const isActive = activePath === item.path;
                    return (
                        <div
                            key={item.label}
                            className={`mg-item ${isActive ? "active" : ""}`}
                            onClick={() => navigate(item.path)}
                            role="button"
                            tabIndex={0}
                            aria-label={item.label}
                            aria-current={isActive ? "page" : undefined}
                            title={!isExpanded && !isMobile ? item.label : ""}
                            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") navigate(item.path); }}
                        >
                            <div className="mg-icon-box"><Icon size={17} /></div>
                            {(isMobile || isExpanded) && (
                                <span className="mg-item-label">{item.label}</span>
                            )}
                            {(isMobile || isExpanded) && isActive && (
                                <span className="mg-active-pip" />
                            )}
                        </div>
                    );
                })}
            </div>
        ))}
    </div>
);

/* ─── Topbar ─── */
const Topbar = ({ isMobile, toggleSidebar, pageTitle, saUser, onLogout, className = "" }) => {
    const [showMenu,    setShowMenu]    = useState(false);
    const [searchFocus, setSearchFocus] = useState(false);
    const navigate  = useNavigate();
    const location  = useLocation();
    const searchRef = useRef(null);

    const isOrgDetail = location.pathname.startsWith("/management/org/");

    useEffect(() => {
        const close = e => {
            if (!e.target?.closest?.(".mg-user-section")) setShowMenu(false);
            if (!e.target?.closest?.(".mg-search"))       setSearchFocus(false);
        };
        window.addEventListener("click", close);
        return () => window.removeEventListener("click", close);
    }, []);

    useEffect(() => {
        const onKey = e => { if (e.key === "Escape") { setSearchFocus(false); setShowMenu(false); } };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <nav className={`mg-topbar ${className}`}>

            {/* LEFT */}
            {isMobile ? (
                <button className="mg-icon-btn" onClick={toggleSidebar} aria-label="Menu">
                    <ChevronsLeft size={20} />
                </button>
            ) : (
                <div className="mg-topbar-left">
                    <h4 className="mg-page-title">{pageTitle}</h4>
                    <span className="mg-breadcrumb">Platform Management</span>
                </div>
            )}

            {isMobile && (
                <img
                    src={ChatViq}
                    alt="ChatVIQ"
                    className="mg-mobile-logo"
                    onClick={() => navigate("/management/dashboard")}
                />
            )}

            {/* Back link for org detail */}
            {isOrgDetail && !isMobile && (
                <button
                    onClick={() => navigate("/management/dashboard")}
                    style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: 13, marginLeft: 4 }}
                >
                    ← Back to Dashboard
                </button>
            )}

            {/* CENTER — search (desktop only) */}
            {!isMobile && (
                <div
                    className={`mg-search ${searchFocus ? "focused" : ""}`}
                    onClick={e => { e.stopPropagation(); setSearchFocus(true); searchRef.current?.focus(); }}
                >
                    <Search size={15} className="mg-search-icon" />
                    <input
                        ref={searchRef}
                        type="search"
                        placeholder="Search orgs, users, audit logs…"
                        aria-label="Search"
                        onFocus={() => setSearchFocus(true)}
                    />
                    {searchFocus && <kbd className="mg-search-kbd">ESC</kbd>}
                </div>
            )}

            {/* RIGHT */}
            <div className="mg-topbar-right">
                <div
                    className="mg-user-section"
                    onClick={e => { e.stopPropagation(); setShowMenu(s => !s); }}
                >
                    <div className="mg-avatar-wrap">
                        <img src={dpPlaceholder} alt="Admin" className="mg-avatar" />
                        <span className="mg-online-dot" />
                    </div>
                    {!isMobile && (
                        <span className="mg-user-name">
                            {saUser?.full_name?.split(" ")[0] || "Admin"}
                        </span>
                    )}

                    {showMenu && (
                        <div className="mg-dp-menu">
                            <div className="mg-dp-header">
                                <div className="mg-dp-name">{saUser?.full_name || "Administrator"}</div>
                                {saUser?.admin_role_name && (
                                    <div className="mg-dp-role">{saUser.admin_role_name}</div>
                                )}
                                <div className="mg-dp-email">{saUser?.email}</div>
                            </div>
                            <button
                                className="mg-dp-item danger"
                                onClick={() => { setShowMenu(false); onLogout(); }}
                            >
                                <LogOut size={13} /> Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

/* ─── Desktop sidebar ─── */
const DesktopSidebar = ({ isExpanded, setIsExpanded, activePath, navigate }) => {
    const navRef = useRef(null);

    useEffect(() => {
        const el = navRef.current;
        if (!el) return;
        const expand = () => setIsExpanded(true);
        el.addEventListener("mouseenter", expand);
        return () => el.removeEventListener("mouseenter", expand);
    }, [setIsExpanded]);

    return (
        <div className="mg-sidebar-inner">
            <div
                className="mg-sidebar-header"
                onClick={() => navigate("/management/dashboard")}
            >
                <div className="mg-brand-mark">C</div>
                <div className="mg-brand-text">
                    <span className="mg-brand-name">ChatViq</span>
                    <span className="mg-brand-tag">PLATFORM</span>
                </div>
            </div>

            <div className="mg-nav-area" ref={navRef}>
                <SidebarMenu
                    isExpanded={isExpanded}
                    activePath={activePath}
                    navigate={navigate}
                />
            </div>


        </div>
    );
};

/* ─── Mobile sidebar (offcanvas) ─── */
const MobileSidebar = ({ open, onClose, activePath, navigate }) => (
    <>
        <div className={`mg-offcanvas ${open ? "show" : ""}`}>
            <div className="mg-offcanvas-header">
                <div
                    className="mg-sidebar-header"
                    style={{ margin: 0 }}
                    onClick={() => { navigate("/management/dashboard"); onClose(); }}
                >
                    <div className="mg-brand-mark">C</div>
                    <div className="mg-brand-text">
                        <span className="mg-brand-name">ChatViq</span>
                        <span className="mg-brand-tag">PLATFORM</span>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 20, lineHeight: 1 }}
                    aria-label="Close menu"
                >
                    ✕
                </button>
            </div>
            <div className="mg-offcanvas-body">
                <SidebarMenu isMobile activePath={activePath} navigate={navigate} />
            </div>
        </div>
        {open && <div className="mg-backdrop" onClick={onClose} />}
    </>
);

/* ─── Root layout ─── */
export default function ManagementLayout() {
    const [isMobile,    setIsMobile]    = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isExpanded,  setIsExpanded]  = useState(true);

    const navigate  = useNavigate();
    const location  = useLocation();
    const saUser    = JSON.parse(sessionStorage.getItem("sa_user") || "{}");
    const activePath = getActiveNavPath(location.pathname);
    const pageTitle  = getPageTitle(location.pathname);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const logout = () => {
        sessionStorage.removeItem("sa_token");
        sessionStorage.removeItem("sa_user");
        navigate("/management/login");
    };

    /* ── Mobile layout ── */
    if (isMobile) {
        return (
            <div className="mg-mobile-shell">
                <MobileSidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    activePath={activePath}
                    navigate={navigate}
                />
                <header>
                    <Topbar
                        isMobile
                        className="mg-mobile-topbar"
                        toggleSidebar={() => setSidebarOpen(p => !p)}
                        pageTitle={pageTitle}
                        saUser={saUser}
                        onLogout={logout}
                    />
                </header>
                <section className="mg-mobile-content">
                    <Outlet />
                </section>
            </div>
        );
    }

    /* ── Desktop layout ── */
    return (
        <div className="mg-shell">
            <div className="mg-sidebar-wrapper">
                <aside className={`mg-sidebar-container ${!isExpanded ? "minimized" : ""}`}>
                    <DesktopSidebar
                        isExpanded={isExpanded}
                        setIsExpanded={setIsExpanded}
                        activePath={activePath}
                        navigate={navigate}
                    />
                </aside>
                <div className="mg-toggle-btn" onClick={() => setIsExpanded(e => !e)}>
                    {isExpanded
                        ? <ChevronLeft  size={13} />
                        : <ChevronRight size={13} />
                    }
                </div>
            </div>

            <div className="mg-main-area">
                <header>
                    <Topbar
                        pageTitle={pageTitle}
                        saUser={saUser}
                        onLogout={logout}
                    />
                </header>
                <section className="mg-content">
                    <Outlet />
                </section>
            </div>
        </div>
    );
}
