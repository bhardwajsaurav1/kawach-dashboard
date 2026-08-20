import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function EngineTelemetry() {
  const [oilPress, setOilPress] = useState('4.5')
  const [coolantTemp, setCoolantTemp] = useState(85)

  useEffect(() => {
    const timer = setInterval(() => {
      setOilPress((4.4 + Math.random() * 0.2).toFixed(1))
      setCoolantTemp(Math.floor(84 + Math.random() * 3))
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-background text-on-surface font-body-base overflow-hidden selection:bg-primary/30">
      {/* HUD Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-full scanline-effect opacity-20"></div>
        <div className="absolute top-4 left-4 w-32 h-32 border border-outline/20 rounded-full opacity-30 flex items-center justify-center">
          <div className="w-24 h-24 border-t-2 border-primary rounded-full animate-spin" style={{ animationDuration: '10s' }}></div>
          <span className="absolute text-[8px] font-label-caps text-primary">N 35.42°</span>
        </div>
        <div className="absolute bottom-4 right-4 w-48 h-12 flex items-end justify-between px-4 border-b border-outline/20 opacity-40">
          <div className="w-1 h-4 bg-primary"></div>
          <div className="w-1 h-2 bg-outline"></div>
          <div className="w-1 h-2 bg-outline"></div>
          <div className="w-1 h-2 bg-outline"></div>
          <div className="w-1 h-6 bg-primary"></div>
          <span className="text-[10px] font-label-caps text-primary absolute -top-4 right-0">SIGNAL: CALIBRATED</span>
        </div>
      </div>
      <div className="flex flex-col md:flex-row h-screen w-full relative z-10 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto min-w-0 pt-14 md:pt-0">
          <header className="flex flex-wrap md:flex-nowrap justify-between items-center w-full px-4 sm:px-6 md:px-8 min-h-16 py-3 md:py-0 bg-surface-container/60 backdrop-blur-xl sticky top-0 border-b border-outline-variant/30 shadow-lg shadow-primary/5 gap-3 z-30">
            <div className="flex flex-col">
              <h2 className="font-headline-md text-base sm:text-lg md:text-headline-md font-bold uppercase tracking-wider text-primary">505 ARMY BASE WORKSHOP</h2>
              <span className="font-label-caps text-[10px] text-on-surface-variant">TEL_SESSION: 2023-ABW-04-A</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6">
              <div className="hidden lg:flex items-center gap-4 bg-surface-container-highest/40 px-4 py-1.5 rounded-full border border-outline-variant/30">
                <span className="text-[10px] font-label-caps text-on-surface-variant">ENGINE TEST STAND #04</span>
                <div className="h-4 w-[1px] bg-outline-variant/50"></div>
                <span className="text-[10px] font-label-caps text-primary">MODE: BENCH_TEST</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button className="p-2 text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all active:scale-95"><span className="material-symbols-outlined">satellite_alt</span></button>
                <button className="p-2 text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all active:scale-95"><span className="material-symbols-outlined">security</span></button>
                <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-primary/10 border border-primary/20 active:scale-95 transition-transform">
                  <span className="text-[10px] font-label-caps text-primary px-2">CMD_SYNC</span>
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/40">
                    <img className="w-full h-full object-cover" alt="Military officer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWGx9qsi6kF8Okpp83R5GNxwIzYR_Tzt2UCYu9cFud_C0P4_X4WdTOmspGDA3gHr6z-prmvNZGlmANF2c5INwGMgRNQrxgaq53MGikIcJqAPl21h0nFMGMl7vjv51uMBekDfRdWmEMUIZhw0wEwODwT5Igxe4s0L5GnMv6PETTGn-D9wMHbMoEIvK3yC55XLZXGZbytboly6bhhEeC_1XX-8EY500eTUkpjVE__2C_GdPQD5CQgf0jqJgk8FiTHqSVEH1r70qkblU" />
                  </div>
                </button>
              </div>
            </div>
          </header>
          <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar max-w-full">
            <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
              {/* Core Telemetry Hero */}
              <div className="col-span-12 lg:col-span-8 glass-panel p-6 rounded-xl relative overflow-hidden flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-label-caps text-xs text-primary mb-1">CORE TELEMETRY</h3>
                    <p className="text-on-surface-variant text-sm max-w-md">Real-time data streaming from Test Stand #04. All sensors calibrated to military grade-A standards.</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-data-numeric text-primary text-lg">02:45:12</span>
                    <span className="font-label-caps text-[10px] text-on-surface-variant">TEST_DURATION</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 py-4">
                  {/* Oil Pressure Gauge */}
                  <div className="flex flex-col items-center justify-center p-4 bg-surface-container-lowest/40 rounded-lg border border-outline-variant/10">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full gauge-svg" viewBox="0 0 100 100">
                        <circle className="text-outline-variant/20" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                        <circle className="text-primary gauge-path" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="100.48" strokeWidth="8"></circle>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-data-numeric text-3xl text-primary">{oilPress}</span>
                        <span className="font-label-caps text-[10px] text-on-surface-variant">BAR</span>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <h4 className="font-label-caps text-xs text-on-surface">OIL PRESSURE</h4>
                      <div className="flex gap-2 mt-2 items-center">
                        <span className="text-[9px] font-label-caps text-on-surface-variant">2.0</span>
                        <div className="w-24 h-1 bg-surface-variant rounded-full overflow-hidden relative self-center">
                          <div className="absolute inset-0 bg-primary w-[62%]"></div>
                        </div>
                        <span className="text-[9px] font-label-caps text-on-surface-variant">6.0</span>
                      </div>
                      <span className="text-[10px] font-label-caps text-primary mt-1 block">STATUS: NOMINAL</span>
                    </div>
                  </div>
                  {/* Coolant Temp Gauge */}
                  <div className="flex flex-col items-center justify-center p-4 bg-surface-container-lowest/40 rounded-lg border border-outline-variant/10">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full gauge-svg" viewBox="0 0 100 100">
                        <circle className="text-outline-variant/20" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                        <circle className="text-secondary gauge-path" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="140.7" strokeWidth="8"></circle>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-data-numeric text-3xl text-secondary">{coolantTemp}</span>
                        <span className="font-label-caps text-[10px] text-on-surface-variant">°C</span>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <h4 className="font-label-caps text-xs text-on-surface">COOLANT TEMP</h4>
                      <div className="flex gap-2 mt-2 items-center">
                        <span className="text-[9px] font-label-caps text-on-surface-variant">70°</span>
                        <div className="w-24 h-1 bg-surface-variant rounded-full overflow-hidden relative self-center">
                          <div className="absolute inset-0 bg-secondary w-[45%]"></div>
                        </div>
                        <span className="text-[9px] font-label-caps text-on-surface-variant">105°</span>
                      </div>
                      <span className="text-[10px] font-label-caps text-secondary mt-1 block">STATUS: OPTIMAL</span>
                    </div>
                  </div>
                </div>
                {/* Sparklines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-3 bg-surface-container-lowest/20 border-l-2 border-primary">
                    <div className="flex-1">
                      <span className="font-label-caps text-[9px] text-on-surface-variant block">WATER INLET PRESSURE</span>
                      <span className="font-data-numeric text-lg text-primary">2.1 <span className="text-[10px]">BAR</span></span>
                    </div>
                    <div className="w-32 h-8 flex items-end gap-[2px]">
                      {[60,65,58,62,70,75,68,72].map((h,i) => (
                        <div key={i} className={`${i === 7 ? 'bg-primary' : 'bg-primary/40'} w-full`} style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-surface-container-lowest/20 border-l-2 border-secondary">
                    <div className="flex-1">
                      <span className="font-label-caps text-[9px] text-on-surface-variant block">WATER OUTLET TEMP</span>
                      <span className="font-data-numeric text-lg text-secondary">82 <span className="text-[10px]">°C</span></span>
                    </div>
                    <div className="w-32 h-8 flex items-end gap-[2px]">
                      {[40,45,48,52,50,55,60,58].map((h,i) => (
                        <div key={i} className={`${i === 7 ? 'bg-secondary' : 'bg-secondary/40'} w-full`} style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Right Sidebar */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                <div className="glass-panel h-64 rounded-xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10 pointer-events-none"></div>
                  <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Military tank engine on test rig" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVoUyKUKSBZmPhTFFNstHPBoPi8Rk7eIPip9ADWy-JEhCZPFOLNtbcmEPV_teLA_jzWoBKGgWbPUpsr_tUb6qM5eTqRMXTD2IZlZ-c-_9kKAJJAYHvXtAK711jgT4weYDIvFdlJ3DE0ymFsdxQbsv6Dm5PTb3K5xfqBcjAebTrusQNoigdCHi11_kpXZTrP5AAPj8LzWmGnzeGUd-EJbThnzy4ao9cRCKf__3owwKNFsTLUx1csfRGjdlLqClqTtX-5D7gFfiyEHE" />
                  <div className="absolute bottom-4 left-4 z-20">
                    <span className="font-label-caps text-[10px] text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">videocam</span> LIVE_FEED: CHAMBER_04
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 z-20 flex gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full neon-glow-primary animate-pulse"></div>
                  </div>
                </div>
                <div className="glass-panel flex-1 rounded-xl p-4 flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                    <h3 className="font-label-caps text-xs text-on-surface">WORKSHOP_LOGS</h3>
                    <span className="material-symbols-outlined text-on-surface-variant text-sm">filter_list</span>
                  </div>
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-64 pr-2 custom-scrollbar">
                    {[
                      { time: '09:42:12', code: 'CALIB_OK', text: 'Oil pressure stabilized at 4.5 bar after 15m warm-up.', color: 'primary', bg: 'bg-surface-container-lowest/40' },
                      { time: '09:38:05', code: 'FLOW_MOD', text: 'Coolant flow adjusted. Inlet pressure constant at 2.1 bar.', color: 'secondary', bg: 'bg-surface-container-lowest/40' },
                      { time: '09:30:11', code: 'WARN_CLR', text: 'Vibration sensor #02 recalibrated. Baseline normalized.', color: 'error', bg: 'bg-error/10' },
                      { time: '09:15:00', code: 'INIT_SEQ', text: 'Main test sequence initiated by Operator #402.', color: 'on-surface-variant', bg: 'bg-surface-container-lowest/40' },
                    ].map((log) => (
                      <div key={log.time} className={`p-2 ${log.bg} rounded border-l-2 border-${log.color}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-label-caps text-[8px] text-${log.color}`}>{log.time}</span>
                          <span className="font-label-caps text-[8px] text-on-surface-variant">{log.code}</span>
                        </div>
                        <p className={`text-[10px] font-body-base text-${log.color === 'error' ? 'error' : 'on-surface'}`}>{log.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Bottom Technical Panel */}
              <div className="col-span-12 glass-panel p-4 rounded-xl flex flex-wrap gap-8 items-center justify-between">
                <div className="flex items-center gap-6">
                  {[['ENGINE_MODEL','MTU-MB838-KA501','text-primary'],['RPM_PEAK','2450','text-on-surface'],['THERMAL_EFFICIENCY','38.4%','text-on-surface']].map(([k,v,c]) => (
                    <div key={k} className="flex flex-col">
                      <span className="font-label-caps text-[9px] text-on-surface-variant">{k}</span>
                      <span className={`font-data-numeric text-sm ${c}`}>{v}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button className="px-6 py-2 bg-surface-container-highest border border-primary/40 text-primary font-label-caps text-[10px] hover:bg-primary/20 transition-all active:scale-95">DOWNLOAD_REPORT</button>
                  <button className="px-6 py-2 bg-error text-on-error font-label-caps text-[10px] neon-glow-error animate-pulse hover:bg-error-container transition-all active:scale-95">EMERGENCY_ABORT</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
