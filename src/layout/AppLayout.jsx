import { ChevronLeft, ChevronRight, ChevronRightIcon, ChevronsLeft, Ticket, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate, } from "react-router-dom";

import { useAuth } from "../Context/AuthContext";
import ChatViq from "./assets/chatviq.png";
import dpPlaceholder from "./assets/dpPlaceholder.png";
import favIconChatViq from "./assets/favIconChatViq.png";

import "./AppLayout.css";


import {
  BarChart3,
  Cpu,
  Database,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  Users
} from "lucide-react";

export const ICON_MAP = {
  "dashboard": LayoutDashboard,
  "conversation": MessagesSquare,
  "intent": Cpu,
  "knowledgebase": Database,
  "analytics": BarChart3,
  "settings": Settings,
  "users": Users,
  "ticket": Ticket
};


/* -------------------- Render Menu -------------------- */
const RenderMenu = ({ isExpanded, isMobile, activeMenu, setActiveMenu }) => {
  const { menus } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      className={`d-flex w-100 flex-column ${isMobile ? "" : "h-75"
        } justify-content-around gap-2 py-2 ${!isMobile && !isExpanded ? "align-items-center" : ""
        }`}
    >
      {menus.map((menu) => {
        const Icon = ICON_MAP[menu.icon];
        return (
          <div
            key={menu.name}
            className={`d-flex align-items-center cursorPointer sidebar-item ${activeMenu === menu.name ? "active" : ""
              }`}
            onClick={() => {
              navigate(menu.path);
              setActiveMenu(menu.name);
            }}
          >
            <Icon size={24} />
            {(isMobile || isExpanded) && (
              <>
                <div className="px-1">{menu.name}</div>
                <div className="ms-auto">
                  <ChevronRight />
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* -------------------- Top Bar -------------------- */
const TopBar = ({ isMobile, toggleSidebar, activeMenu, setActiveMenu }) => {
  const [dpImage, setDpImage] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    setDpImage(dpPlaceholder);
  }, []);


  useEffect(() => {
    const close = () => setShowMenu(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <nav className={`d-flex justify-content-between ${isMobile ? "bgLogoLightColor" : ""}`}>
      {isMobile && (
        <div className="d-flex" onClick={toggleSidebar}>
          <ChevronsLeft />
        </div>
      )}

      <div>
        {isMobile ? (
          <img
            src={ChatViq}
            alt="ChatViq"
            className="topBarLogo"
            onClick={() => {
              navigate("/");
              setActiveMenu("Dashboard");
            }}
          />
        ) : (
          <h3 className="activeMenuHeading">{activeMenu}</h3>
        )}
      </div>

      {/* DP SECTION */}
      <div
        className="userIcon"
        style={{ position: "relative" }}
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
      >
        {dpImage ? <img src={dpImage} alt="User" /> : <User />}

        {showMenu && (
          <div className="dp-menu">
            <div
              onClick={() => {
                navigate("/Profile");
                setShowMenu(true);
              }}
            >
              View Profile
            </div>

            <div
              onClick={() => {
                navigate("/login");
                setShowMenu(false);
                logout();
              }}
            >
              Logout
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

/* -------------------- Small Screen Sidebar -------------------- */
const SmallScreenSideBar = ({ isMobile, setSideBarOpen, activeMenu, setActiveMenu }) => {
  const navigate = useNavigate();

  return (
    <div className="offcanvas show offcanvas-start">
      <div className="offcanvas-header">
        <img
          src={ChatViq}
          alt="ChatViq"
          onClick={() => {
            navigate("/");
            setActiveMenu("Dashboard");
          }}
        />
        <button
          type="button"
          className="btn-close"
          onClick={() => setSideBarOpen(false)}
        />
      </div>

      <div className="offcanvas-body">
        <RenderMenu isMobile={isMobile} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      </div>

      <div className="offcanvas-footer">Sidebar Footer</div>
    </div>
  );
};

/* -------------------- Big Screen Sidebar -------------------- */
const BigScreenSideBar = ({ isExpanded, setIsExpanded, activeMenu, setActiveMenu }) => {
  const sideBarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const sidebar = sideBarRef.current;
    if (!sidebar) return;

    const expand = () => setIsExpanded(true);
    sidebar.addEventListener("mouseenter", expand);

    return () => sidebar.removeEventListener("mouseenter", expand);
  }, [setIsExpanded]);

  return (
    <div className="sidebar-containerActual d-flex h-100 justify-content-between flex-column">
      <div className={`sidebarHeader ${!isExpanded ? "sidebar-collapsed" : ""}`}>
        <div
          className="logo-wrapper"
          onClick={() => {
            navigate("/");
            setActiveMenu("Dashboard");
          }}
        >
          <img src={ChatViq} className="logo logo-big" />
          <img src={favIconChatViq} className="logo logo-small" />
        </div>
      </div>

      <div
        className="my-3 d-flex flex-column flex-grow-1 gap-1"
        ref={sideBarRef}
      >
        <RenderMenu
          isExpanded={isExpanded}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />
      </div>

      {isExpanded && <div></div>}
    </div>
  );
};

/* -------------------- Content Area -------------------- */
const ContentArea = () => <Outlet />;

/* -------------------- Footer -------------------- */
const FooterNote = () => <></>;

/* -------------------- App Layout -------------------- */
const AppLayout = () => {
  const [isMobile, setIsMobile] = useState(true);
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => setSideBarOpen((prev) => !prev);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
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

          {sideBarOpen && <div className="mobile-backdrop" onClick={() => setSideBarOpen(false)} />}

          <header>
            <TopBar
              toggleSidebar={toggleSidebar}
              isMobile={isMobile}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
            />
          </header>

          <section className="flex-grow-1">
            <ContentArea />
          </section>

          <footer>
            <FooterNote />
          </footer>
        </div>
      ) : (
        <div className="app-shell gap-5">
          <div className="sidebar-wrapper">
            <aside className={`sidebar-container ${!isExpanded ? "minimized" : ""}`}>
              <BigScreenSideBar
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
              />
            </aside>

            <div className={`sidebar-expansionButton rounded ${isExpanded ? "sidebar-expansionButtonExpanded" : ""}`}>
              {isExpanded ? (
                <ChevronLeft onClick={() => setIsExpanded(false)} />
              ) : (
                <ChevronRightIcon onClick={() => setIsExpanded(true)} />
              )}
            </div>
          </div>

          <div className="main-area">
            <header>
              <TopBar toggleSidebar={toggleSidebar} activeMenu={activeMenu} />
            </header>

            <section className="content">
              <ContentArea />
            </section>

            <footer>
              <FooterNote />
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
