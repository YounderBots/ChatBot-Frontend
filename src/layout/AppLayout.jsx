import {
  BarChart3, Bell, Building2, ChevronLeft, ChevronRightIcon, ChevronsLeft,
  CreditCard, Cpu, Database, GitBranch, Globe, LayoutDashboard, MessagesSquare,
  Moon, Search, Settings, Shield, Sun, Ticket, User, Users, Zap
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import APICall from "../APICalls/APICall";
import { useAuth } from "../Context/AuthContext";
import { useTheme } from "../Context/ThemeContext";
import dpPlaceholder from "./assets/dpPlaceholder.png";

import "./AppLayout.css";

const ChatViq = "/assets/images/chatviq.png";
const favIconChatViq = "/assets/images/favIconChatViq.svg";

export const ICON_MAP = {
  dashboard:     LayoutDashboard,
  conversation:  MessagesSquare,
  intent:        Cpu,
  knowledgebase: Database,
  analytics:     BarChart3,
  settings:      Settings,
  users:         Users,
  ticket:        Ticket,
  // ── Market-launch additions ──────────────────────────────────────────
  organization:  Building2,
  billing:       CreditCard,
  channels:      Globe,
  // ── Operations & security additions ─────────────────────────────────
  liveagent:     Zap,
  security:      Shield,
  // ── AI / NLP additions ───────────────────────────────────────────────
  flowbuilder:   GitBranch,
};

const SECTION_MAP = {
  dashboard:     "OVERVIEW",
  conversation:  "OVERVIEW",
  intent:        "INTELLIGENCE",
  knowledgebase: "INTELLIGENCE",
  analytics:     "INTELLIGENCE",
  users:         "MANAGEMENT",
  ticket:        "MANAGEMENT",
  settings:      "MANAGEMENT",
  // ── Market-launch additions ──────────────────────────────────────────
  organization:  "WORKSPACE",
  billing:       "WORKSPACE",
  channels:      "WORKSPACE",
  // ── Operations & security additions ─────────────────────────────────
  liveagent:     "OPERATIONS",
  security:      "OPERATIONS",
  // ── AI / NLP additions ───────────────────────────────────────────────
  flowbuilder:   "INTELLIGENCE",
};

const SECTION_ORDER = ["OVERVIEW", "INTELLIGENCE", "MANAGEMENT", "WORKSPACE", "OPERATIONS"];

/* ─────────────────────────────────────────
   SIDEBAR MENU
───────────────────────────────────────── */
const RenderMenu = ({ isExpanded, isMobile, activeMenu, setActiveMenu }) => {
  const { menus } = useAuth();
  const navigate  = useNavigate();

  const sections = {};
  menus.forEach(m => {
    const s = SECTION_MAP[m.icon] || "OVERVIEW";
    (sections[s] = sections[s] || []).push(m);
  });
  const orderedSections = SECTION_ORDER.filter(s => sections[s]);

  return (
    <div className={`sidebar-menu ${!isMobile && !isExpanded ? "menu-collapsed" : ""}`}>
      {orderedSections.map(section => (
        <div key={section} className="menu-section">
          {(isMobile || isExpanded) && (
            <div className="menu-section-label">{section}</div>
          )}
          {sections[section].map(menu => {
            const Icon = ICON_MAP[menu.icon] || LayoutDashboard;
            const isActive = activeMenu === menu.name;
            return (
              <div
                key={menu.name}
                className={`sidebar-item ${isActive ? "active" : ""}`}
                onClick={() => { navigate(menu.path); setActiveMenu(menu.name); }}
                title={!isExpanded && !isMobile ? menu.name : ""}
                role="button"
                tabIndex={0}
                aria-label={menu.name}
                aria-current={isActive ? "page" : undefined}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { navigate(menu.path); setActiveMenu(menu.name); } }}
              >
                <div className="sidebar-icon-box">
                  <Icon size={17} />
                </div>
                {(isMobile || isExpanded) && (
                  <span className="sidebar-label">{menu.name}</span>
                )}
                {(isMobile || isExpanded) && isActive && (
                  <span className="sidebar-active-pip" />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────
   TOP BAR
───────────────────────────────────────── */
const TopBar = ({ isMobile, toggleSidebar, activeMenu, setActiveMenu }) => {
  const [dpImage,      setDpImage]      = useState(null);
  const [showMenu,     setShowMenu]     = useState(false);
  const [searchFocus,  setSearchFocus]  = useState(false);
  const [notifications, setNotifications] = useState(0);
  const navigate    = useNavigate();
  const { user, org, roleName, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const searchRef   = useRef(null);

  useEffect(() => { setDpImage(dpPlaceholder); }, []);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const data = await APICall.getT("/conversation/notifications/count");
        setNotifications(data?.count ?? 0);
      } catch {
        // Badge must never crash the shell — leave count unchanged on error.
      }
    };
    fetchCount();
    const id = setInterval(fetchCount, 15_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const close = e => {
      if (!e.target?.closest?.(".user-section"))  setShowMenu(false);
      if (!e.target?.closest?.(".topbar-search")) setSearchFocus(false);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") { setSearchFocus(false); setShowMenu(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <nav className={`topbar ${isMobile ? "mobile-topbar" : ""}`}>

      {/* LEFT */}
      {isMobile ? (
        <button className="topbar-icon-btn" onClick={toggleSidebar} aria-label="Menu">
          <ChevronsLeft size={20} />
        </button>
      ) : (
        <div className="topbar-left">
          <h4 className="topbar-page-title">{activeMenu}</h4>
          <span className="topbar-breadcrumb">{org?.name || "ChatViq Admin"}</span>
        </div>
      )}

      {isMobile && (
        <img
          src={ChatViq}
          alt="ChatViq"
          className="topBarLogo"
          onClick={() => { navigate("/"); setActiveMenu("Dashboard"); }}
        />
      )}

      {/* CENTER – search (desktop only) */}
      {!isMobile && (
        <div
          className={`topbar-search ${searchFocus ? "focused" : ""}`}
          onClick={e => { e.stopPropagation(); setSearchFocus(true); searchRef.current?.focus(); }}
        >
          <Search size={15} className="search-icon" />
          <input
            ref={searchRef}
            type="search"
            placeholder="Search pages, data, settings…"
            aria-label="Search"
            onFocus={() => setSearchFocus(true)}
          />
          {searchFocus && <kbd className="search-kbd">ESC</kbd>}
        </div>
      )}

      {/* RIGHT */}
      <div className="topbar-right">
        <button className="topbar-icon-btn notif-btn"
          aria-label={notifications > 0 ? `${notifications} notifications` : "Notifications"}>
          <Bell size={18} aria-hidden="true" />
          {notifications > 0 && (
            <span className="notif-badge" aria-hidden="true">{notifications}</span>
          )}
        </button>

        <button
          className="topbar-icon-btn theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <div
          className="user-section"
          onClick={e => { e.stopPropagation(); setShowMenu(s => !s); }}
        >
          <div className="user-avatar-wrap">
            {dpImage
              ? <img src={dpImage} alt="User" className="user-avatar" />
              : <User size={20} />
            }
            <span className="online-dot" />
          </div>
          {!isMobile && <span className="user-display-name">{user?.fullname?.split(" ")[0] || "Admin"}</span>}

          {showMenu && (
            <div className="dp-menu">
              <div className="dp-menu-header">
                {dpImage && <img src={dpImage} alt="User" className="dp-menu-avatar" />}
                <div>
                  <div className="dp-menu-name">{user?.fullname || "Administrator"}</div>
                  <div className="dp-menu-role">{roleName || "Admin"}</div>
                </div>
              </div>
              <div className="dp-menu-divider" />
              <button
                className="dp-menu-item"
                onClick={() => { navigate("/Profile"); setShowMenu(false); }}
              >
                <User size={13} /> View Profile
              </button>
              <button
                className="dp-menu-item danger"
                onClick={() => { navigate("/login"); setShowMenu(false); logout(); }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

/* ─────────────────────────────────────────
   MOBILE SIDEBAR
───────────────────────────────────────── */
const SmallScreenSideBar = ({ isMobile, setSideBarOpen, activeMenu, setActiveMenu }) => {
  const navigate = useNavigate();
  return (
    <div className="offcanvas show offcanvas-start">
      <div className="offcanvas-header">
        <img
          src={ChatViq}
          alt="ChatViq"
          onClick={() => { navigate("/"); setActiveMenu("Dashboard"); }}
        />
        <button type="button" className="btn-close" onClick={() => setSideBarOpen(false)} />
      </div>
      <div className="offcanvas-body">
        <RenderMenu isMobile={isMobile} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   DESKTOP SIDEBAR
───────────────────────────────────────── */
const BigScreenSideBar = ({ isExpanded, setIsExpanded, activeMenu, setActiveMenu }) => {
  const sideBarRef = useRef(null);
  const navigate   = useNavigate();

  useEffect(() => {
    const el = sideBarRef.current;
    if (!el) return;
    const expand = () => setIsExpanded(true);
    el.addEventListener("mouseenter", expand);
    return () => el.removeEventListener("mouseenter", expand);
  }, [setIsExpanded]);

  return (
    <div className="sidebar-inner">
      <div
        className={`sidebarHeader ${!isExpanded ? "sidebar-collapsed" : ""}`}
        onClick={() => { navigate("/"); setActiveMenu("Dashboard"); }}
      >
        <div className="logo-wrapper">
          <img src={ChatViq}        className="logo logo-big"   alt="ChatViq" />
          <img src={favIconChatViq} className="logo logo-small" alt="CV"     />
        </div>
      </div>

      <div className="sidebar-nav-area" ref={sideBarRef}>
        <RenderMenu
          isExpanded={isExpanded}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />
      </div>

      {isExpanded && (
        <div className="sidebar-footer">
          <span className="status-dot pulse" />
          <span className="status-text">All systems online</span>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   APP LAYOUT ROOT
───────────────────────────────────────── */
const AppLayout = () => {
  const [isMobile,    setIsMobile]    = useState(true);
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [activeMenu,  setActiveMenu]  = useState("Dashboard");
  const [isExpanded,  setIsExpanded]  = useState(true);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div>
      {isMobile ? (
        <div className="mobileMenu">
          {sideBarOpen && (
            <aside>
              <SmallScreenSideBar
                isMobile={isMobile}
                setSideBarOpen={setSideBarOpen}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
              />
            </aside>
          )}
          {sideBarOpen && (
            <div className="mobile-backdrop" onClick={() => setSideBarOpen(false)} />
          )}
          <header>
            <TopBar
              isMobile={isMobile}
              toggleSidebar={() => setSideBarOpen(p => !p)}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
            />
          </header>
          <section className="mobile-content">
            <Outlet />
          </section>
        </div>
      ) : (
        <div className="app-shell">
          <div className="sidebar-wrapper">
            <aside className={`sidebar-container ${!isExpanded ? "minimized" : ""}`}>
              <BigScreenSideBar
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
              />
            </aside>
            <div className={`sidebar-toggle-btn ${isExpanded ? "expanded" : ""}`}>
              {isExpanded
                ? <ChevronLeft     size={13} onClick={() => setIsExpanded(false)} />
                : <ChevronRightIcon size={13} onClick={() => setIsExpanded(true)} />
              }
            </div>
          </div>

          <div className="main-area">
            <header>
              <TopBar
                toggleSidebar={() => setSideBarOpen(p => !p)}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
              />
            </header>
            <section className="content">
              <Outlet />
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
