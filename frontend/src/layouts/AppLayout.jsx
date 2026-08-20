import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { to: '/', icon: 'grid_view', label: 'Fleet Overview' },
  { to: '/dashboard', icon: 'precision_manufacturing', label: 'Digital Twin' },
  { to: '/telemetry', icon: 'monitor_heart', label: 'Health Monitoring' },
  { to: '/engine-telemetry', icon: 'psychology', label: 'AI Assistant' },
  { to: '/dynamometer', icon: 'notifications_active', label: 'Alerts' },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="flex flex-col h-full w-64 bg-surface-container-low/80 backdrop-blur-xl border-r border-outline-variant/30 z-50">
      <div className="p-6 flex flex-col gap-1 border-b border-outline-variant/20">
        <div className="font-headline-md text-headline-md text-primary font-black tracking-tighter">TANK ARJUN-MK1A</div>
        <div className="flex items-center gap-2">
          <span className="led-indicator bg-[#00ff41] text-[#00ff41]"></span>
          <span className="font-label-caps text-label-caps text-on-surface-variant">OP_STATUS: ACTIVE</span>
        </div>
      </div>
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={isActive
                    ? 'bg-primary/20 text-primary border-l-4 border-primary px-4 py-3 flex items-center gap-3'
                    : 'text-on-surface-variant hover:text-primary px-4 py-3 flex items-center gap-3 transition-all hover:bg-primary/5'}
                >
                  <span className="material-symbols-outlined">{link.icon}</span>
                  <span className="font-body-base">{link.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-outline-variant/20">
        <button className="w-full bg-primary-container text-on-primary-container py-3 rounded-lg font-label-caps text-label-caps flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-sm">settings_suggest</span>
          SYSTEM_DIAGNOSTIC
        </button>
        <div className="mt-4 flex flex-col gap-1">
          <a className="text-on-surface-variant text-sm px-2 py-1 flex items-center gap-2 hover:text-primary" href="#">
            <span className="material-symbols-outlined text-sm">settings</span>
            Settings
          </a>
          <a className="text-on-surface-variant text-sm px-2 py-1 flex items-center gap-2 hover:text-primary" href="#">
            <span className="material-symbols-outlined text-sm">help</span>
            Support
          </a>
        </div>
      </div>
    </aside>
  )
}

export default function AppLayout({ children, title, subtitle, topRight }) {
  return (
    <div className="flex h-screen w-full relative bg-background text-on-surface font-body-base selection:bg-primary/30">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-background">
        <header className="bg-surface-container/60 backdrop-blur-xl border-b border-outline-variant/30 flex justify-between items-center w-full px-8 h-16 sticky top-0 z-40 shadow-lg shadow-primary/5">
          <div className="flex flex-col">
            <h2 className="font-headline-md text-headline-md font-bold uppercase tracking-wider text-primary">{title}</h2>
            {subtitle && <span className="font-label-caps text-[10px] text-on-surface-variant">{subtitle}</span>}
          </div>
          {topRight}
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
