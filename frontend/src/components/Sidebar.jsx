import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { to: '/dashboard', icon: 'space_dashboard', label: 'Command Dashboard' },
  { to: '/predictive-ai', icon: 'psychology', label: 'Predictive AI' },
  { to: '/tank-overhaul', icon: 'grid_view', label: 'Fleet Overview' },
  { to: '/dygm-office', icon: 'dashboard', label: 'Dy GM ERG Office' },
  { to: '/frontline', icon: 'engineering', label: 'Workforce' },
  { to: '/telemetry', icon: 'biotech', label: 'Testing' },
  { to: '/registration', icon: 'inventory', label: 'Inventory' },
  { to: '/dynamometer', icon: 'notifications', label: 'Notifications' },
]

export default function Sidebar({ className }) {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const user = JSON.parse(localStorage.getItem('kavachUser')) || { fullName: 'OPERATOR', role: 'User' }

  const handleLogout = () => {
    localStorage.removeItem('kavachUser')
    window.location.href = '/login'
  }

  // Prevent scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileOpen])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <>
      {/* Mobile Top Navbar Bar with Menu Trigger Button (Visible only on < md screens) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-[#13140f]/95 backdrop-blur-xl border-b border-outline-variant/30 text-primary w-full h-14 shadow-lg no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Open Mobile Menu"
            className="p-2 rounded-md bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">precision_manufacturing</span>
              <span className="font-headline-md text-sm font-black tracking-tight text-primary">EPMS Portal</span>
            </div>
            <span className="text-[9px] font-label-caps text-on-surface-variant tracking-wider">505 Army Base Workshop</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-label-caps bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded uppercase font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#00ff41] rounded-full animate-pulse"></span>
            {user.role}
          </span>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-[100] flex">
          {/* Backdrop blur overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setMobileOpen(false)}
          ></div>

          {/* Drawer container */}
          <div className="relative w-4/5 max-w-xs bg-[#13140f] border-r border-outline-variant/30 h-full flex flex-col shadow-2xl z-10 overflow-y-auto animate-in slide-in-from-left duration-300">
            <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/60">
              <div>
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-lg">precision_manufacturing</span>
                  <span className="font-headline-md text-base font-black tracking-tight">EPMS Portal</span>
                </div>
                <span className="text-[10px] font-label-caps text-primary flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 bg-[#00ff41] rounded-full animate-pulse"></span> OP_STATUS: ACTIVE
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-full bg-outline-variant/20 text-on-surface hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="p-3 bg-primary/5 border-b border-outline-variant/15 flex justify-between items-center text-xs">
              <span className="text-[11px] text-on-surface-variant font-mono">
                User: <b className="text-primary">{user.fullName}</b>
              </span>
              <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded uppercase font-bold">
                {user.role}
              </span>
            </div>

            <nav className="flex-1 py-3 overflow-y-auto">
              <ul className="space-y-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.to
                  return (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        onClick={() => setMobileOpen(false)}
                        className={isActive
                          ? 'bg-primary/20 text-primary border-l-4 border-primary px-5 py-3 flex items-center gap-3 font-bold transition-all text-sm'
                          : 'text-on-surface-variant hover:text-primary px-5 py-3 flex items-center gap-3 transition-colors hover:bg-primary/5 text-sm'}
                      >
                        <span className="material-symbols-outlined text-xl">{link.icon}</span>
                        <span className="font-body-md">{link.label}</span>
                      </Link>
                    </li>
                  )
                })}
                {user.role === 'Admin' && (
                  <li>
                    <Link
                      to="/officer-letters"
                      onClick={() => setMobileOpen(false)}
                      className={location.pathname === '/officer-letters'
                        ? 'bg-[#d6c692]/20 text-[#d6c692] border-l-4 border-[#d6c692] px-5 py-3 flex items-center gap-3 font-bold transition-all text-sm'
                        : 'text-on-surface-variant hover:text-[#d6c692] px-5 py-3 flex items-center gap-3 transition-colors hover:bg-[#d6c692]/5 text-sm'}
                    >
                      <span className="material-symbols-outlined text-xl">description</span>
                      <span className="font-body-md">Officer Letters</span>
                    </Link>
                  </li>
                )}
              </ul>
            </nav>

            <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low/40">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 bg-error/20 border border-error/40 hover:bg-error/30 text-error font-label-caps text-xs tracking-widest rounded transition-all flex items-center justify-center gap-2 font-bold"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                LOGOUT COMMAND
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Visible on md and larger screens) */}
      <aside className={`hidden md:flex flex-col h-full w-64 bg-surface-container-low/80 backdrop-blur-xl border-r border-outline-variant/30 shadow-2xl shadow-black/40 z-50 flex-shrink-0 ${className || ''}`}>
        <div className="p-6 border-b border-outline-variant/20">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary">precision_manufacturing</span>
            <h1 className="font-headline-md text-headline-md text-primary font-black tracking-tighter">EPMS Portal</h1>
          </div>
          <span className="font-headline-md text-primary font-black uppercase text-sm tracking-widest">505 Army Base Workshop</span>
          <span className="text-[10px] font-label-caps text-primary flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 bg-[#00ff41] rounded-full animate-pulse"></span> OP_STATUS: ACTIVE
          </span>
          <div className="mt-3 text-[11px] bg-primary/10 border border-primary/20 rounded p-1.5 text-primary uppercase font-bold flex justify-between items-center">
            <span>ROLE: {user.role}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
          </div>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={isActive
                      ? 'bg-primary/20 text-primary border-l-4 border-primary px-6 py-3 flex items-center gap-3 font-bold transition-all'
                      : 'text-on-surface-variant hover:text-primary px-6 py-3 flex items-center gap-3 transition-colors hover:bg-primary/5 hover:translate-x-1 duration-200'}
                  >
                    <span className="material-symbols-outlined">{link.icon}</span>
                    <span className="font-body-md text-sm">{link.label}</span>
                  </Link>
                </li>
              )
            })}
            {user.role === 'Admin' && (
              <li>
                <Link
                  to="/officer-letters"
                  className={location.pathname === '/officer-letters'
                    ? 'bg-[#d6c692]/20 text-[#d6c692] border-l-4 border-[#d6c692] px-6 py-3 flex items-center gap-3 font-bold transition-all'
                    : 'text-on-surface-variant hover:text-[#d6c692] px-6 py-3 flex items-center gap-3 transition-colors hover:bg-[#d6c692]/5 hover:translate-x-1 duration-200'}
                >
                  <span className="material-symbols-outlined">description</span>
                  <span className="font-body-md text-sm">Officer Letters</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>
        <div className="p-6 space-y-4 border-t border-outline-variant/20">
          <div className="text-[11px] text-on-surface-variant truncate">
            User: <span className="font-bold text-primary">{user.fullName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-error/20 border border-error/40 hover:bg-error/30 text-error font-label-caps text-xs tracking-widest rounded transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            LOGOUT
          </button>
        </div>
      </aside>
    </>
  )
}
