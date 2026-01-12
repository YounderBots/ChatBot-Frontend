import React, { useEffect, useRef, useState } from 'react'
import menuList from './menulist'
import { ChevronLeft, ChevronRight, ChevronRightIcon, ChevronsLeft, User } from 'lucide-react'
import favIconChatViq from './assets/favIconChatViq.png'
import ChatViq from './assets/ChatViq.png'
import dpPlaceholder from './assets/dpPlaceholder.png'
import { Outlet, useNavigate } from "react-router-dom";
import './AppLayout.css'






const RenderMenu = ({ isExpanded, isMobile, activeMenu, setActiveMenu }) => {
  const navigate = useNavigate();
  return (
    <div className={`d-flex w-100 flex-column ${isMobile ? '' : 'h-75'} justify-content-around gap-2 py-2 ${(!isMobile && !isExpanded) ? 'align-items-center' : ''}`} >
      {
        menuList.map(menu => {
          const Icon = menu.icon
          return (
            <div className={`d-flex align-items-center cursorPointer sidebar-item ${activeMenu === menu.name ? 'active' : ''}`} onClick={() => {
              navigate(menu.path);
              setActiveMenu(menu.name);
            }}>
              <Icon size={24} />
              {(isMobile || isExpanded) && <>
                <div className='px-1'>{menu.name}</div>
                <div className='ms-auto'> <ChevronRight /> </div>
              </>}
            </div>
          )
        })
      }
    </div>
  )
}

const TopBar = ({ isMobile, toggleSidebar, activeMenu, setActiveMenu }) => {

  const [dpImage, setDpImage] = useState();
  const navigate = useNavigate();
  useEffect(() => {
    setDpImage(dpPlaceholder)
  }, [])

  return (
    <div>

      <nav className={`d-flex   justify-content-between ${isMobile ? 'bgLogoLightColor' : ''}`} >
        {isMobile &&
          <div className='d-flex'>
            <div onClick={toggleSidebar}><ChevronsLeft /></div>
          </div>
        }
        <div>{isMobile ? <img src={ChatViq} alt="ChatViq" className='topBarLogo' onClick={()=>{navigate('/'); setActiveMenu('Dashboard')}} /> : <h3 className='activeMenuHeading'>{activeMenu}</h3>}</div>
        <div className='userIcon'>{dpImage ? <img src={dpImage} alt="" /> : <User />}</div>
      </nav>
      {
        isMobile && <div className='activeMenuHeading'>
          {activeMenu}
        </div>
      }

    </div>
  )
}

const SmallScreenSideBar = ({ isMobile, setSideBarOpen, activeMenu, setActiveMenu }) => {
  const navigate = useNavigate();
  return (
    <div className="offcanvas show offcanvas-start" tabIndex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
      <div className="offcanvas-header">
        {/* <h5 className="offcanvas-title" id="offcanvasExampleLabel">Logo</h5> */}
        <img src={ChatViq} alt="ChatViq" onClick={()=>{navigate('/'); setActiveMenu('Dashboard')}} />
        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close" onClick={() => { setSideBarOpen(false) }}></button>
      </div>
      <div className="offcanvas-body">
        <RenderMenu isMobile={isMobile} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      </div>
      <div className='offcanvas-footer'>
        SiebarFooter
      </div>
    </div>
  )
}

const BigScreenSideBar = ({ isExpanded, setIsExpanded, activeMenu, setActiveMenu }) => {

  const sideBarRef = useRef(null);
  const navigage = useNavigate();

  useEffect(() => {
    const sidebar = sideBarRef.current;
    if (!sidebar) return;
    sidebar.addEventListener("mouseenter", () => { setIsExpanded(true) })


    return sidebar.removeEventListener("mouseenter", () => { setIsExpanded(true) })
  }, [isExpanded])






  return (
    <>

      <div className='sidebar-containerActual d-flex h-100 justify-content-between flex-column' onClick={() => { setIsExpanded(true) }} >
        <div className={`sidebarHeader ${!isExpanded ? 'sidebar-collapsed' : ''}`}>
          <div className="logo-wrapper" onClick={()=>{navigage('/'); setActiveMenu('Dashboard')}}>
            <img src={ChatViq} className="logo logo-big" />
            <img src={favIconChatViq} className="logo logo-small" />
          </div>
        </div>

        <div className='my-3 d-flex   flex-column justify-content-start flex-grow-1  gap-1' ref={sideBarRef} >

          <RenderMenu isExpanded={isExpanded} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

        </div>
        {
          isExpanded && <div  >Footer Space</div>
        }



      </div>


    </>
  )
}


const ContentArea = () => {
  return (
    <Outlet />
  )
}


const FooterNote = () => {
  return (
    <>
      Footer Content
    </>
  )
}

const AppLayout = () => {
  const [isMobile, setIsMobile] = useState(true);
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setSideBarOpen(!sideBarOpen)
  };

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <div>
      {
        isMobile ?
          // Mobile App Layout 
          <div className='mobileMenu'>
            {sideBarOpen ? <aside>
              <SmallScreenSideBar isMobile={isMobile} setSideBarOpen={setSideBarOpen} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

            </aside> : <></>}
            {/* Backdrop */}
            {isMobile && sideBarOpen && (
              <div
                className="mobile-backdrop"
                onClick={() => setSideBarOpen(false)}
              />
            )}

            <header><TopBar toggleSidebar={toggleSidebar} isMobile={isMobile} activeMenu={activeMenu} setActiveMenu={setActiveMenu} /></header>
            <section className='flex-grow-1'>
              <ContentArea />
            </section>
            <footer>
              <FooterNote />
            </footer>
          </div>
          :
          // Desktop Layout
          <div className="app-shell  gap-5">
            <div className="sidebar-wrapper">
              <aside className={`sidebar-container  ${!isExpanded ? 'minimized' : ''}`}>
                <BigScreenSideBar isExpanded={isExpanded} setIsExpanded={setIsExpanded} activeMenu={activeMenu} setActiveMenu={setActiveMenu} className='position-relative' />
              </aside>
              <div className={`sidebar-expansionButton rounded ${isExpanded ? 'sidebar-expansionButtonExpanded' : ''}`}>
                {!isExpanded ? <ChevronRightIcon onClick={() => {
                  setIsExpanded(true);
                }} /> : <ChevronLeft onClick={() => {
                  setIsExpanded(false);
                }} />}
              </div>

            </div>
            <div className="main-area">
              <header><TopBar toggleSidebar={toggleSidebar} activeMenu={activeMenu} /></header>
              <section className="content">
                <ContentArea />
              </section>
              <footer ><FooterNote /></footer>
            </div>
          </div>
      }
    </div>
  )
}

export default AppLayout