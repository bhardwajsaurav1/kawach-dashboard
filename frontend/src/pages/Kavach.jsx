import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Kavach() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background" style={{ fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        :root { --glass-bg: rgba(75,83,32,0.15); --glass-border: rgba(145,146,131,0.3); }
        .tactical-glass { background:var(--glass-bg); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border:1px solid var(--glass-border); box-shadow:inset 0 1px 0 rgba(255,255,255,0.05); }
        .status-led { width:8px; height:8px; border-radius:50%; box-shadow:0 0 8px currentColor; }
        .kavach-scanline { width:100%; height:100px; z-index:5; background:linear-gradient(0deg,rgba(0,0,0,0) 0%,rgba(195,204,140,0.05) 50%,rgba(0,0,0,0) 100%); opacity:0.1; position:absolute; bottom:100%; animation:kavachScan 8s linear infinite; }
        @keyframes kavachScan { 0%{bottom:100%} 100%{bottom:-100px} }
        .hud-border { clip-path:polygon(0 0,100% 0,100% 100%,20px 100%,0 calc(100% - 20px)); }
        .glitch-hover:hover { animation:glitch 0.3s cubic-bezier(.25,.46,.45,.94) both infinite; }
        @keyframes glitch { 0%{transform:translate(0)} 20%{transform:translate(-2px,1px)} 40%{transform:translate(-2px,-1px)} 60%{transform:translate(2px,1px)} 80%{transform:translate(2px,-1px)} 100%{transform:translate(0)} }
      `}</style>

      {/* TopNavBar */}
      <header className="bg-background/90 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 border-b border-outline-variant/30 shadow-sm">
        <div className="flex justify-between items-center w-full px-4 sm:px-8 h-16 sm:h-20 max-w-container-max mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded bg-primary/10 border border-primary/30 text-primary flex items-center justify-center"
              aria-label="Toggle Mobile Menu"
            >
              <span className="material-symbols-outlined text-2xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
            <img alt="KAVACH Shield Logo" className="h-8 sm:h-10 w-8 sm:w-10 object-contain" src="/shield-logo.png" />
            <span className="font-display-lg text-2xl sm:text-display-lg font-black tracking-tighter text-primary uppercase">KAVACH</span>
          </div>

          <nav className="hidden md:flex gap-8">
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors text-body-base cursor-pointer" onClick={() => navigate('/telemetry')}>Telemetry</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors text-body-base cursor-pointer" onClick={() => navigate('/tank-overhaul')}>Maintenance</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors text-body-base cursor-pointer" onClick={() => navigate('/frontline')}>Readiness</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors text-body-base cursor-pointer" onClick={() => navigate('/engine-telemetry')}>Support</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => navigate("/enlistment")} className="hidden sm:inline-block px-4 sm:px-6 py-1.5 sm:py-2 border border-secondary text-secondary font-medium hover:bg-secondary/10 transition-all rounded text-xs sm:text-body-base">Registration</button>
            <button onClick={() => navigate("/login")} className="px-4 sm:px-6 py-1.5 sm:py-2 bg-primary text-on-primary font-bold hover:brightness-110 transition-all rounded text-xs sm:text-body-base shadow-[0_0_15px_rgba(195,204,140,0.3)]">Login</button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#13140f]/95 border-b border-outline-variant/30 px-6 py-4 flex flex-col gap-4 animate-in slide-in-from-top duration-200">
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm py-1 cursor-pointer flex items-center gap-2" onClick={() => { setMobileMenuOpen(false); navigate('/telemetry') }}>
              <span className="material-symbols-outlined text-primary text-sm">biotech</span> Telemetry &amp; Testing
            </a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm py-1 cursor-pointer flex items-center gap-2" onClick={() => { setMobileMenuOpen(false); navigate('/tank-overhaul') }}>
              <span className="material-symbols-outlined text-primary text-sm">grid_view</span> Fleet Maintenance
            </a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm py-1 cursor-pointer flex items-center gap-2" onClick={() => { setMobileMenuOpen(false); navigate('/frontline') }}>
              <span className="material-symbols-outlined text-primary text-sm">engineering</span> Workforce Readiness
            </a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm py-1 cursor-pointer flex items-center gap-2" onClick={() => { setMobileMenuOpen(false); navigate('/engine-telemetry') }}>
              <span className="material-symbols-outlined text-primary text-sm">psychology</span> AI Engine Assistant
            </a>
            <div className="pt-2 border-t border-outline-variant/20 flex flex-col gap-2">
              <button onClick={() => { setMobileMenuOpen(false); navigate("/enlistment") }} className="w-full py-2 border border-secondary text-secondary font-medium text-xs rounded">Enlistment Registration</button>
              <button onClick={() => { setMobileMenuOpen(false); navigate("/login") }} className="w-full py-2 bg-primary text-on-primary font-bold text-xs rounded">Command Login</button>
            </div>
          </div>
        )}
      </header>
      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-margin-mobile md:px-margin-desktop">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10"></div>
            <img alt="Arjun Hybrid Tank Systems" className="w-full h-full object-cover opacity-60" src="/hero-bg.png" />
            <div className="kavach-scanline"></div>
          </div>
          <div className="relative z-20 max-w-container-max mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary font-label-caps text-label-caps">
                <span className="status-led text-primary bg-primary"></span>
                SYSTEM STATUS: OPERATIONAL
              </div>
              <h1 className="font-display-lg text-[64px] leading-tight font-black tracking-tight text-on-surface drop-shadow-2xl">
                KAVACH <br />
                <span className="text-primary">ARMOURED HEALTH</span>
              </h1>
              <p className="font-body-base text-headline-md text-on-surface-variant max-w-xl">
                AI-Based Armoured Vehicle Health Monitoring Dashboard. Real-time diagnostic data and predictive maintenance for modern battlefield superiority.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button className="glitch-hover px-8 py-4 bg-primary text-on-primary font-bold rounded-lg shadow-lg flex items-center gap-3">
                  <span className="material-symbols-outlined">shield</span>
                  INITIALIZE SYSTEM
                </button>
                <button className="px-8 py-4 bg-surface-container-highest border border-outline/30 text-on-surface font-medium rounded-lg hover:bg-surface-bright transition-colors flex items-center gap-3">
                  <span className="material-symbols-outlined">terminal</span>
                  TACTICAL FEED
                </button>
              </div>
            </div>
            {/* HUD Decorative */}
            <div className="hidden lg:block">
              <div className="tactical-glass p-8 rounded-xl relative border-l-4 border-primary">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-label-caps text-label-caps text-primary">UNIT-77: ARJUN MK1A HYBRID</span>
                  <span className="font-data-numeric text-data-numeric text-secondary">POS: 28.6139° N, 77.2090° E</span>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <span className="text-label-caps text-on-surface-variant opacity-60">ENGINE TEMP</span>
                    <div className="flex justify-between items-end">
                      <span className="font-data-numeric text-headline-md text-primary">94°C</span>
                      <span className="text-xs text-primary/50 mb-1">STABLE</span>
                    </div>
                    <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-3/4"></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-label-caps text-on-surface-variant opacity-60">ARMOR INTEGRITY</span>
                    <div className="flex justify-between items-end">
                      <span className="font-data-numeric text-headline-md text-secondary">98%</span>
                      <span className="text-xs text-secondary/50 mb-1">OPTIMAL</span>
                    </div>
                    <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-secondary w-[98%] shadow-[0_0_8px_rgba(214,198,146,0.5)]"></div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 border-t border-outline-variant/30 pt-4">
                  <div className="flex gap-4 overflow-hidden">
                    <div className="flex-shrink-0 w-24 h-16 bg-surface-container-low border border-outline-variant/20 rounded flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>sensors</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-label-caps text-on-surface">AI ANALYSIS IN PROGRESS...</p>
                      <p className="text-[10px] text-on-surface-variant font-data-numeric">DETECTING MINOR ANOMALY IN TRACK TENSION. MAINTENANCE RECOMMENDED POST-OP.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Features Grid */}
        <section className="py-24 bg-surface-container-lowest px-margin-mobile md:px-margin-desktop">
          <div className="max-w-container-max mx-auto">
            <div className="mb-16 text-center">
              <h2 className="font-display-lg text-display-lg text-on-surface mb-4">COMMAND CAPABILITIES</h2>
              <p className="text-body-base text-on-surface-variant max-w-2xl mx-auto">Advanced telemetry systems providing millisecond-precision data across the entire armored fleet.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="tactical-glass p-8 rounded-lg group hover:border-primary transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded border border-primary/30 text-primary mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">satellite_alt</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-3">Real-time Telemetry</h3>
                <p className="text-body-base text-on-surface-variant leading-relaxed">Continuous data streaming from engine sensors, transmission units, and ammunition levels via encrypted tactical links.</p>
                <div className="mt-6 pt-6 border-t border-outline-variant/20 flex items-center gap-2 text-primary font-label-caps text-[10px]">
                  <span className="status-led bg-primary"></span> ACTIVE LINK: 4.2GBPS
                </div>
              </div>
              <div className="tactical-glass p-8 rounded-lg group hover:border-secondary transition-all duration-300">
                <div className="w-12 h-12 bg-secondary/10 flex items-center justify-center rounded border border-secondary/30 text-secondary mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">psychology</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-3">AI Predictive Fault Analysis</h3>
                <p className="text-body-base text-on-surface-variant leading-relaxed">Machine learning models analyze vibration and thermal signatures to predict mechanical failures before they occur in the field.</p>
                <div className="mt-6 pt-6 border-t border-outline-variant/20 flex items-center gap-2 text-secondary font-label-caps text-[10px]">
                  <span className="status-led bg-secondary"></span> CORE: NEURAL ENGINE V4
                </div>
              </div>
              <div className="tactical-glass p-8 rounded-lg group hover:border-primary transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded border border-primary/30 text-primary mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">view_quilt</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-3">Fleet Readiness Tracking</h3>
                <p className="text-body-base text-on-surface-variant leading-relaxed">Comprehensive dashboard providing high-level situational awareness of division-wide combat readiness and logistic status.</p>
                <div className="mt-6 pt-6 border-t border-outline-variant/20 flex items-center gap-2 text-primary font-label-caps text-[10px]">
                  <span className="status-led bg-primary"></span> SYNC: REGIMENT LEVEL
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Readiness Visualization */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop bg-background relative overflow-hidden">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <svg height="600" viewBox="0 0 100 100" width="600">
              <circle cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="0.5"></circle>
              <circle cx="50" cy="50" fill="none" r="35" stroke="currentColor" strokeDasharray="2 2" strokeWidth="0.5"></circle>
              <line stroke="currentColor" strokeWidth="0.5" x1="50" x2="50" y1="5" y2="95"></line>
              <line stroke="currentColor" strokeWidth="0.5" x1="5" x2="95" y1="50" y2="50"></line>
            </svg>
          </div>
          <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                {[['ACTIVE UNITS', '142', 'text-primary', '+12% vs last cycle'], ['MAINTENANCE', '08', 'text-secondary', '3 scheduled today'], ['READINESS', '94%', 'text-primary', 'Combat effective'], ['ALERTS', '02', 'text-error', 'Immediate action']].map(([label, val, color, sub]) => (
                  <div key={label} className="bg-surface-container p-6 rounded border border-outline-variant/20">
                    <span className="text-label-caps text-on-surface-variant">{label}</span>
                    <div className={`text-display-lg font-data-numeric ${color} mt-2`}>{val}</div>
                    <p className={`text-xs ${color}/60 mt-1`}>{sub}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="font-display-lg text-display-lg text-on-surface">OPTIMIZED COMMANDER EXPERIENCE</h2>
              <p className="text-body-base text-on-surface-variant">Our interface is designed for the high-stress environment of frontline command. High-contrast typography and data-dense layouts ensure that vital information is never more than a glance away.</p>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary mt-1">verified_user</span>
                  <div>
                    <h4 className="font-bold text-on-surface">Military-Grade Encryption</h4>
                    <p className="text-sm text-on-surface-variant">All data is secured using quantum-resistant encryption protocols for maximum operational security.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary mt-1">cloud_sync</span>
                  <div>
                    <h4 className="font-bold text-on-surface">Seamless Cloud Sync</h4>
                    <p className="text-sm text-on-surface-variant">Local first architecture with automatic command center synchronization when a secure link is established.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>
        {/* CTA Section */}
        <section className="py-20 px-margin-mobile md:px-margin-desktop">
          <div className="max-w-4xl mx-auto text-center tactical-glass p-12 rounded-2xl relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">DEPLOY KAVACH TO YOUR DIVISION</h2>
            <p className="text-body-base text-on-surface-variant mb-10 max-w-xl mx-auto">Contact the Armoured Corps Command technical wing to initiate integration for your specific fleet configuration.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-10 py-4 bg-primary text-on-primary font-bold rounded hover:brightness-110 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">contact_emergency</span>
                CONTACT COMMAND
              </button>
              <button className="px-10 py-4 border border-outline text-on-surface font-medium rounded hover:bg-surface-variant/30 transition-all">TECHNICAL GUIDELINES</button>
            </div>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/20">
        <div className="flex flex-col md:flex-row justify-between items-center w-full py-8 px-margin-desktop max-w-container-max mx-auto">
          <div className="flex flex-col md:items-start items-center gap-2 mb-6 md:mb-0">
            <span className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
              <img alt="Footer Logo" className="h-6 w-6 grayscale opacity-50" src="/footer-logo.png" />
              KAVACH SYSTEMS
            </span>
            <span className="font-label-caps text-label-caps text-secondary">© 2024 ARMOURED CORPS COMMAND. CLASSIFIED INFORMATION.</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {['Operational Security', 'Command Contact', 'Privacy Policy', 'Tactical Guidelines'].map(l => (
              <a key={l} className="font-label-caps text-label-caps text-on-tertiary-fixed-variant hover:text-primary transition-colors" href="#">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
