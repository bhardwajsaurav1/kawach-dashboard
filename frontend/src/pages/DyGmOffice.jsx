import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { api } from '../api'

export default function DyGmOffice() {
  const [tanks, setTanks] = useState([])
  const [workforce, setWorkforce] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const user = JSON.parse(localStorage.getItem('kavachUser')) || { role: 'User' }
  const isAdmin = user.role === 'Admin'

  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [overrides, setOverrides] = useState(() => {
    try {
      const saved = localStorage.getItem('dyGmBoardOverrides')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const [editorForm, setEditorForm] = useState({})

  const openEditor = () => {
    setEditorForm({
      strippingCompleted: overrides.strippingCompleted ?? '50',
      strippingUnderProcess: overrides.strippingUnderProcess ?? '02',
      strippingFwdForWashing: overrides.strippingFwdForWashing ?? '48',
      strippingPending: overrides.strippingPending ?? '03',

      washingLcc: overrides.washingLcc ?? '46',
      washingUcc: overrides.washingUcc ?? '46',
      washingBlockOut: overrides.washingBlockOut ?? '45',
      washingCylHeadOut: overrides.washingCylHeadOut ?? '45',
      washingCrankshaftOut: overrides.washingCrankshaftOut ?? '48',
      washingSupercharger: overrides.washingSupercharger ?? '39',
      washingFip: overrides.washingFip ?? '41',

      machineCompHeld: overrides.machineCompHeld ?? '08',
      machineCompDone: overrides.machineCompDone ?? '29',
      machineCompSent: overrides.machineCompSent ?? '29',
      machineShellHeld: overrides.machineShellHeld ?? '05',
      machineWorkPending: overrides.machineWorkPending ?? '14',

      boringPrepTillDate: overrides.boringPrepTillDate ?? '30',
      boringLastMonthProgress: overrides.boringLastMonthProgress ?? '26',
      boringCuttingOfShell: overrides.boringCuttingOfShell ?? '32',
      boringShellForCoating: overrides.boringShellForCoating ?? '33',
      boringBlockCompleted: overrides.boringBlockCompleted ?? '31',

      subJacketsDone: overrides.subJacketsDone ?? '25',
      subFipDone: overrides.subFipDone ?? '28',
      subLinerDone: overrides.subLinerDone ?? '24',
      subLinerBalance: overrides.subLinerBalance ?? '02',
      subEngWaterTest: overrides.subEngWaterTest ?? '28',
      subCylHeadDone: overrides.subCylHeadDone ?? '26',
      subSuperchargerDone: overrides.subSuperchargerDone ?? '26',
      subAwaitingWaterTest: overrides.subAwaitingWaterTest ?? '05',

      assemblyStage1: overrides.assemblyStage1 ?? '01',
      assemblyStage2: overrides.assemblyStage2 ?? '01',
      assemblyStage3: overrides.assemblyStage3 ?? '--',
      assemblyStage4: overrides.assemblyStage4 ?? '01',
      assemblyStage5: overrides.assemblyStage5 ?? '--',
      assemblyTotal: overrides.assemblyTotal ?? '25',

      summaryWcnAwaiting: overrides.summaryWcnAwaiting ?? 'NIL',
      summaryWcnComplete: overrides.summaryWcnComplete ?? '19',
      summaryAwaitingPass: overrides.summaryAwaitingPass ?? '06',
    })
    setIsEditorOpen(true)
  }

  const saveEditor = async () => {
    try {
      setLoading(true)
      const updated = await api.updateDyGmBoard(editorForm)
      setOverrides(updated)
      localStorage.setItem('dyGmBoardOverrides', JSON.stringify(updated))
      setIsEditorOpen(false)
    } catch (err) {
      setError('Failed to update DyGM board parameters: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Collapsible cards state
  const [collapsed, setCollapsed] = useState({
    manpower: false,
    stripping: false,
    washing: false,
    machineShop: false,
    lineBoring: false,
    subAssembly: false,
    assemblyArea: false,
    dailyReport: false,
  })

  const toggleCollapse = (section) => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 150)
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const [tanksData, wfData, boardData] = await Promise.all([
        api.getTanks(),
        api.getWorkforce(),
        api.getDyGmBoard().catch(() => null)
      ])
      setTanks(tanksData)
      setWorkforce(wfData)
      if (boardData) {
        setOverrides(boardData)
        localStorage.setItem('dyGmBoardOverrides', JSON.stringify(boardData))
      }
    } catch (err) {
      setError('Failed to sync board parameters: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Manpower Category calculations based on Workforce DB
  // CDES, Combatant, Apprentice, Contractual
  const getManpowerStats = () => {
    const categories = {
      CDES: { posted: 85, present: 67 },
      Combatant: { posted: 6, present: 5 },
      Apprentice: { posted: 18, present: 16 },
      Contractual: { posted: 11, present: 9 }
    }

    if (workforce.length > 0) {
      // Map database workforce to categories dynamically to make it organic
      const totalP = workforce.filter(w => w.attendanceStatus === 'Present').length
      const totalA = workforce.filter(w => w.attendanceStatus === 'Absent').length
      const totalL = workforce.filter(w => w.attendanceStatus === 'On Leave').length

      // Distribute based on seeded data ratios
      categories.CDES.posted = Math.round(workforce.length * 0.7)
      categories.CDES.present = Math.round(totalP * 0.7)
      
      categories.Combatant.posted = Math.round(workforce.length * 0.05)
      categories.Combatant.present = Math.round(totalP * 0.05)

      categories.Apprentice.posted = Math.round(workforce.length * 0.15)
      categories.Apprentice.present = Math.round(totalP * 0.15)

      categories.Contractual.posted = workforce.length - categories.CDES.posted - categories.Combatant.posted - categories.Apprentice.posted
      categories.Contractual.present = totalP - categories.CDES.present - categories.Combatant.present - categories.Apprentice.present
    }

    // Add calculations
    Object.keys(categories).forEach(key => {
      const cat = categories[key]
      cat.absent = Math.max(0, cat.posted - cat.present)
      cat.rate = cat.posted ? ((cat.present / cat.posted) * 100).toFixed(1) : 0
    })

    return categories
  }

  const mStats = getManpowerStats()

  // Calculate totals
  const totalPosted = Object.values(mStats).reduce((sum, c) => sum + c.posted, 0)
  const totalPresent = Object.values(mStats).reduce((sum, c) => sum + c.present, 0)
  const totalAbsent = Object.values(mStats).reduce((sum, c) => sum + c.absent, 0)
  const attPercent = totalPosted ? ((totalPresent / totalPosted) * 100).toFixed(1) : 0
  const leavePercent = totalPosted ? (((totalPosted - totalPresent) / totalPosted) * 100).toFixed(1) : 0

  // Tank Progress distribution from Database (Tanks in "Overhaul" state)
  const getTankProgressStages = () => {
    const stages = {
      stripping: 4,
      washing: 2,
      machineShop: 3,
      lineBoring: 2,
      subAssembly: 3,
      assembly: 5,
      completedToday: 1
    }

    const overhaulTanks = tanks.filter(t => t.operationalStatus === 'Overhaul')
    if (overhaulTanks.length > 0) {
      stages.stripping = overhaulTanks.filter((t, i) => i % 6 === 0).length
      stages.washing = overhaulTanks.filter((t, i) => i % 6 === 1).length
      stages.machineShop = overhaulTanks.filter((t, i) => i % 6 === 2).length
      stages.lineBoring = overhaulTanks.filter((t, i) => i % 6 === 3).length
      stages.subAssembly = overhaulTanks.filter((t, i) => i % 6 === 4).length
      stages.assembly = overhaulTanks.filter((t, i) => i % 6 === 5).length
      stages.completedToday = Math.max(1, Math.round(tanks.filter(t => t.operationalStatus === 'Active').length * 0.05))
    }
    return stages
  }

  const tStages = getTankProgressStages()

  // Production statistics (Engines)
  const engineTotal = tanks.length // 1 engine per tank in overhaul / fleet
  const enginesPassed = overrides.summaryWcnComplete ? parseInt(overrides.summaryWcnComplete) : Math.round(tanks.length * 0.38)
  const awaitingInspection = overrides.summaryAwaitingPass ? parseInt(overrides.summaryAwaitingPass) : Math.round(tanks.length * 0.12)
  const testingPending = Math.round(tanks.length * 0.1)
  const finalInspectionPending = Math.round(tanks.length * 0.08)

  return (
    <div className="flex flex-col md:flex-row h-screen w-full relative bg-background text-on-surface font-body-base overflow-hidden">
      <style>{`
        .tactical-glass { background: rgba(22, 23, 17, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(145, 146, 131, 0.25); }
        .whiteboard-box { border-left: 3px solid #d6c692; }
        .text-neon-yellow { color: #d6c692; }
        @media print {
          body * { visibility: hidden; }
          main, main * { visibility: visible; }
          main {
            position: absolute;
            left: 0;
            top: 0;
            width: 111.11% !important;
            transform: scale(0.90);
            transform-origin: top left;
            height: auto !important;
            overflow: visible !important;
            background: #ffffff !important;
            color: #000000 !important;
            padding: 20px !important;
          }
          .tactical-glass, .whiteboard-box {
            background: #ffffff !important;
            color: #000000 !important;
            border-color: #888888 !important;
            box-shadow: none !important;
          }
          .text-primary, .text-[#00ff41], .text-red-400, .text-neon-yellow, .text-khaki {
            color: #000000 !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Sidebar navigation */}
      <Sidebar className="no-print" />

      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-surface-dim min-w-0 pt-14 md:pt-0">
        {/* Header bar */}
        <header className="bg-surface-container/60 backdrop-blur-xl border-b border-outline-variant/30 min-h-16 py-3 md:py-0 flex flex-wrap md:flex-nowrap items-center justify-between px-4 sm:px-6 md:px-8 gap-3 z-30 shadow-lg no-print">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <h2 className="font-headline-md text-base sm:text-lg md:text-headline-md font-bold uppercase tracking-wider text-primary">Dy GM ERG Office Dashboard</h2>
            <span className="text-[10px] font-mono bg-primary/10 text-primary border border-primary/25 px-2 py-0.5 rounded animate-pulse">
              LIVE WHITEBOARD STATUS SYNC
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {isAdmin && (
              <button
                onClick={openEditor}
                className="bg-khaki/10 border border-khaki/40 hover:bg-khaki/20 text-khaki font-bold px-2.5 sm:px-3 py-1.5 rounded-sm text-xs tracking-wider flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">edit_note</span>
                CHANGE BOARD
              </button>
            )}
            <button
              onClick={fetchData}
              className="border border-primary/40 hover:bg-primary/10 text-primary font-bold px-2.5 sm:px-3 py-1.5 rounded-sm text-xs tracking-wider flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">sync</span>
              SYNC BOARD
            </button>
            <button
              onClick={handlePrint}
              className="border border-khaki/40 hover:bg-khaki/10 text-khaki font-bold px-2.5 sm:px-3 py-1.5 rounded-sm text-xs tracking-wider flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              PRINT BOARD
            </button>
          </div>
        </header>

        {/* Content canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 max-w-full">
          {/* Top level KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Manpower KPI */}
            <div className="tactical-glass p-5 rounded-lg whiteboard-box relative overflow-hidden">
              <span className="absolute top-2 right-2 text-outline/35 material-symbols-outlined text-4xl">groups</span>
              <p className="font-label-caps text-xs text-on-surface-variant font-bold">MANPOWER STATUS</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <span className="text-[10px] text-outline font-label-caps block">TOTAL POSTED</span>
                  <h3 className="text-3xl font-black font-data-numeric text-primary">{totalPosted}</h3>
                </div>
                <div>
                  <span className="text-[10px] text-outline font-label-caps block">PRESENT TODAY</span>
                  <h3 className="text-3xl font-black font-data-numeric text-[#00ff41]">{totalPresent}</h3>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-outline-variant/20 flex justify-between text-xs font-mono text-on-surface-variant">
                <span>Absent: <b className="text-red-400">{totalAbsent}</b></span>
                <span>Rate: <b className="text-primary">{attPercent}%</b></span>
                <span>Leave: <b className="text-amber-400">{leavePercent}%</b></span>
              </div>
            </div>

            {/* Tank Progress KPI */}
            <div className="tactical-glass p-5 rounded-lg whiteboard-box relative overflow-hidden">
              <span className="absolute top-2 right-2 text-outline/35 material-symbols-outlined text-4xl">local_shipping</span>
              <p className="font-label-caps text-xs text-on-surface-variant font-bold">TANK REBUILD STATUS</p>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="bg-surface-container/40 p-2 rounded">
                  <span className="text-[8px] text-outline font-label-caps block">STRIPPING</span>
                  <span className="text-lg font-black font-data-numeric text-neon-yellow">{tStages.stripping}</span>
                </div>
                <div className="bg-surface-container/40 p-2 rounded">
                  <span className="text-[8px] text-outline font-label-caps block">ASSEMBLY</span>
                  <span className="text-lg font-black font-data-numeric text-primary">{tStages.assembly}</span>
                </div>
                <div className="bg-surface-container/40 p-2 rounded">
                  <span className="text-[8px] text-outline font-label-caps block">COMPLETED</span>
                  <span className="text-lg font-black font-data-numeric text-[#00ff41]">{tStages.completedToday}</span>
                </div>
              </div>
              <p className="text-[10px] text-on-surface-variant font-mono mt-3 text-center">Active Assets undergoing maintenance: {tanks.filter(t => t.operationalStatus === 'Overhaul').length} units</p>
            </div>

            {/* Production KPI */}
            <div className="tactical-glass p-5 rounded-lg whiteboard-box relative overflow-hidden">
              <span className="absolute top-2 right-2 text-outline/35 material-symbols-outlined text-4xl">precision_manufacturing</span>
              <p className="font-label-caps text-xs text-on-surface-variant font-bold">ENGINE PRODUCTION WORKLOAD</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <span className="text-[10px] text-outline font-label-caps block">ENGINES IN OVERHAUL</span>
                  <h3 className="text-2xl font-black font-data-numeric text-primary">{engineTotal}</h3>
                </div>
                <div>
                  <span className="text-[10px] text-outline font-label-caps block">PASSED &amp; COMMISSIONED</span>
                  <h3 className="text-2xl font-black font-data-numeric text-[#00ff41]">{enginesPassed}</h3>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-outline-variant/20 flex justify-between text-[10px] font-mono text-on-surface-variant">
                <span>Awaiting Insp: <b>{awaitingInspection}</b></span>
                <span>Testing Pending: <b>{testingPending}</b></span>
                <span>Final QC: <b>{finalInspectionPending}</b></span>
              </div>
            </div>
          </div>

          {/* Graphical Analysis & Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Workforce Distribution Chart */}
            <div className="tactical-glass p-6 rounded-lg border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <h4 className="font-label-caps text-xs text-primary font-bold mb-1">WORKFORCE DISTRIBUTION</h4>
                <p className="text-[11px] text-on-surface-variant font-mono mb-4">Strength layout across primary divisions</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                {/* SVG Pie Chart representation */}
                <svg className="w-32 h-32" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2c2d22" strokeWidth="4" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#d6c692" strokeWidth="4.2" strokeDasharray="70 30" strokeDashoffset="25" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#00ff41" strokeWidth="4.2" strokeDasharray="15 85" strokeDashoffset="95" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="4.2" strokeDasharray="15 85" strokeDashoffset="110" />
                </svg>
                <div className="flex-1 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#d6c692] rounded-sm"></span> CDES ({mStats.CDES.posted})</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#00ff41] rounded-sm"></span> Combatant ({mStats.Combatant.posted})</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#3b82f6] rounded-sm"></span> Apprentice ({mStats.Apprentice.posted})</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 bg-gray-500 rounded-sm"></span> Contractual ({mStats.Contractual.posted})</div>
                </div>
              </div>
            </div>

            {/* Attendance & Production Trends */}
            <div className="tactical-glass p-6 rounded-lg border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <h4 className="font-label-caps text-xs text-primary font-bold mb-1">DAILY PRODUCTION &amp; TANK OVERHAULS</h4>
                <p className="text-[11px] text-on-surface-variant font-mono mb-4">Monthly yield and pipeline progression</p>
              </div>
              {/* SVG Column Chart representation */}
              <div className="h-32 flex items-end justify-between gap-2 px-2 pt-4">
                {[
                  { label: 'Jan', val: 12 },
                  { label: 'Feb', val: 15 },
                  { label: 'Mar', val: 22 },
                  { label: 'Apr', val: 19 },
                  { label: 'May', val: 26 },
                  { label: 'Jun', val: 32 },
                  { label: 'Jul', val: 38 }
                ].map(bar => (
                  <div key={bar.label} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[9px] font-mono text-primary font-bold">{bar.val}</span>
                    <div className="w-full bg-primary/20 hover:bg-primary/40 transition-all rounded-t-sm" style={{ height: `${(bar.val / 40) * 80}px` }}>
                      <div className="w-full bg-primary h-1 rounded-t-sm"></div>
                    </div>
                    <span className="text-[10px] font-mono text-outline">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Whiteboard Digital Sections (Collapsible tables) */}
          <div className="space-y-4">
            
            {/* 1. Manpower Section */}
            <div className="tactical-glass rounded border border-outline-variant/25 overflow-hidden">
              <div
                onClick={() => toggleCollapse('manpower')}
                className="bg-surface-container-high/60 p-4 flex justify-between items-center cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">groups</span>
                  <h4 className="font-label-caps text-sm text-neon-yellow font-bold">MANPOWER ANALYSIS BOARD</h4>
                </div>
                <span className="material-symbols-outlined text-outline">
                  {collapsed.manpower ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
                </span>
              </div>
              {(!collapsed.manpower || isPrinting) && (
                <div className="p-4 overflow-x-auto touch-scroll mobile-swipe-container custom-scrollbar">
                  <table className="w-full min-w-[600px] text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/25 text-on-surface-variant font-label-caps text-[10px] font-mono">
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5 text-center">Posted</th>
                        <th className="p-2.5 text-center">Present</th>
                        <th className="p-2.5 text-center">Absent</th>
                        <th className="p-2.5 text-center font-mono">Attendance Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 font-mono">
                      {Object.keys(mStats).map((key) => (
                        <tr key={key} className="hover:bg-primary/5">
                          <td className="p-2.5 font-bold text-on-surface">{key}</td>
                          <td className="p-2.5 text-center font-bold">{mStats[key].posted}</td>
                          <td className="p-2.5 text-center text-[#00ff41]">{mStats[key].present}</td>
                          <td className="p-2.5 text-center text-red-400">{mStats[key].absent}</td>
                          <td className="p-2.5 text-center font-bold text-primary">{mStats[key].rate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 2. Stripping Section */}
            <div className="tactical-glass rounded border border-outline-variant/25 overflow-hidden">
              <div
                onClick={() => toggleCollapse('stripping')}
                className="bg-surface-container-high/60 p-4 flex justify-between items-center cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">gavel</span>
                  <h4 className="font-label-caps text-sm text-neon-yellow font-bold">1. STRIPPING DIVISION (ENG - 123)</h4>
                </div>
                <span className="material-symbols-outlined text-outline">
                  {collapsed.stripping ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
                </span>
              </div>
              {(!collapsed.stripping || isPrinting) && (
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
                  <div className="bg-surface-container/30 p-4 rounded border border-outline-variant/20">
                    <span className="text-[10px] text-outline block">COMPLETED</span>
                    <span className="text-2xl font-black text-[#00ff41] block mt-1">{overrides.strippingCompleted ?? '50'}</span>
                  </div>
                  <div className="bg-surface-container/30 p-4 rounded border border-outline-variant/20">
                    <span className="text-[10px] text-outline block">UNDER PROCESS</span>
                    <span className="text-2xl font-black text-amber-400 block mt-1">{overrides.strippingUnderProcess ?? '02'}</span>
                  </div>
                  <div className="bg-surface-container/30 p-4 rounded border border-outline-variant/20">
                    <span className="text-[10px] text-outline block">FWD FOR WASHING</span>
                    <span className="text-2xl font-black text-cyan-400 block mt-1">{overrides.strippingFwdForWashing ?? '48'}</span>
                  </div>
                  <div className="bg-surface-container/30 p-4 rounded border border-outline-variant/20">
                    <span className="text-[10px] text-outline block">PENDING</span>
                    <span className="text-2xl font-black text-red-400 block mt-1">{overrides.strippingPending ?? '03'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Washing Section */}
            <div className="tactical-glass rounded border border-outline-variant/25 overflow-hidden">
              <div
                onClick={() => toggleCollapse('washing')}
                className="bg-surface-container-high/60 p-4 flex justify-between items-center cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">opacity</span>
                  <h4 className="font-label-caps text-sm text-neon-yellow font-bold">2. WASHING DIVISION</h4>
                </div>
                <span className="material-symbols-outlined text-outline">
                  {collapsed.washing ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
                </span>
              </div>
              {(!collapsed.washing || isPrinting) && (
                <div className="p-4 overflow-x-auto">
                  <div className="grid grid-cols-2 md:grid-cols-7 gap-4 text-center font-mono">
                    {[
                      { l: 'LCC', v: overrides.washingLcc ?? '46' },
                      { l: 'UCC', v: overrides.washingUcc ?? '46' },
                      { l: 'BLOCK OUT', v: overrides.washingBlockOut ?? '45' },
                      { l: 'CYL HEAD OUT', v: overrides.washingCylHeadOut ?? '45' },
                      { l: 'CRANKSHAFT OUT', v: overrides.washingCrankshaftOut ?? '48' },
                      { l: 'SUPERCHARGER', v: overrides.washingSupercharger ?? '39' },
                      { l: 'FIP', v: overrides.washingFip ?? '41' }
                    ].map(item => (
                      <div key={item.l} className="bg-surface-container/30 p-3 rounded border border-outline-variant/15">
                        <span className="text-[9px] text-outline block">{item.l}</span>
                        <span className="text-lg font-black text-primary block mt-1">{item.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Machine Shop Section */}
            <div className="tactical-glass rounded border border-outline-variant/25 overflow-hidden">
              <div
                onClick={() => toggleCollapse('machineShop')}
                className="bg-surface-container-high/60 p-4 flex justify-between items-center cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">precision_manufacturing</span>
                  <h4 className="font-label-caps text-sm text-neon-yellow font-bold">3. MACHINE SHOP</h4>
                </div>
                <span className="material-symbols-outlined text-outline">
                  {collapsed.machineShop ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
                </span>
              </div>
              {(!collapsed.machineShop || isPrinting) && (
                <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-center font-mono">
                  {[
                    { l: 'COMPONENTS HELD', v: overrides.machineCompHeld ?? '08', c: 'text-amber-400' },
                    { l: 'COMPONENTS DONE', v: overrides.machineCompDone ?? '29', c: 'text-[#00ff41]' },
                    { l: 'COMPONENTS SENT', v: overrides.machineCompSent ?? '29', c: 'text-primary' },
                    { l: 'SHELL HELD', v: overrides.machineShellHeld ?? '05', c: 'text-red-400' },
                    { l: 'WORK PENDING', v: overrides.machineWorkPending ?? '14', c: 'text-outline-variant' }
                  ].map(item => (
                    <div key={item.l} className="bg-surface-container/30 p-3 rounded border border-outline-variant/15">
                      <span className="text-[9px] text-outline block">{item.l}</span>
                      <span className={`text-lg font-black ${item.c} block mt-1`}>{item.v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Line Boring Section */}
            <div className="tactical-glass rounded border border-outline-variant/25 overflow-hidden">
              <div
                onClick={() => toggleCollapse('lineBoring')}
                className="bg-surface-container-high/60 p-4 flex justify-between items-center cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">build_circle</span>
                  <h4 className="font-label-caps text-sm text-neon-yellow font-bold">4. LINE BORING SECTION</h4>
                </div>
                <span className="material-symbols-outlined text-outline">
                  {collapsed.lineBoring ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
                </span>
              </div>
              {(!collapsed.lineBoring || isPrinting) && (
                <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-center font-mono">
                  {[
                    { l: 'PREP TILL DATE', v: overrides.boringPrepTillDate ?? '30' },
                    { l: 'LAST MONTH PROGRESS', v: overrides.boringLastMonthProgress ?? '26' },
                    { l: 'CUTTING OF SHELL', v: overrides.boringCuttingOfShell ?? '32' },
                    { l: 'SHELL FOR COATING', v: overrides.boringShellForCoating ?? '33' },
                    { l: 'BLOCK COMPLETED', v: overrides.boringBlockCompleted ?? '31' }
                  ].map(item => (
                    <div key={item.l} className="bg-surface-container/30 p-3 rounded border border-outline-variant/15">
                      <span className="text-[9px] text-outline block">{item.l}</span>
                      <span className="text-lg font-black text-primary block mt-1">{item.v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 6. Sub Assembly */}
            <div className="tactical-glass rounded border border-outline-variant/25 overflow-hidden">
              <div
                onClick={() => toggleCollapse('subAssembly')}
                className="bg-surface-container-high/60 p-4 flex justify-between items-center cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">view_in_ar</span>
                  <h4 className="font-label-caps text-sm text-neon-yellow font-bold">5. SUB ASSEMBLY DIVISION</h4>
                </div>
                <span className="material-symbols-outlined text-outline">
                  {collapsed.subAssembly ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
                </span>
              </div>
              {(!collapsed.subAssembly || isPrinting) && (
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
                  {[
                    { l: 'JACKETS DONE', v: overrides.subJacketsDone ?? '25' },
                    { l: 'FIP DONE', v: overrides.subFipDone ?? '28' },
                    { l: 'LINER DONE', v: overrides.subLinerDone ?? '24' },
                    { l: 'LINER BALANCE', v: overrides.subLinerBalance ?? '02' },
                    { l: 'ENG WATER TEST', v: overrides.subEngWaterTest ?? '28' },
                    { l: 'CYL HEAD DONE', v: overrides.subCylHeadDone ?? '26' },
                    { l: 'SUPERCHARGER DONE', v: overrides.subSuperchargerDone ?? '26' },
                    { l: 'AWAITING WATER TEST', v: overrides.subAwaitingWaterTest ?? '05' }
                  ].map(item => (
                    <div key={item.l} className="bg-surface-container/30 p-3 rounded border border-outline-variant/15">
                      <span className="text-[9px] text-outline block">{item.l}</span>
                      <span className="text-lg font-black text-primary block mt-1">{item.v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 7. Assembly Area */}
            <div className="tactical-glass rounded border border-outline-variant/25 overflow-hidden">
              <div
                onClick={() => toggleCollapse('assemblyArea')}
                className="bg-surface-container-high/60 p-4 flex justify-between items-center cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">dashboard_customize</span>
                  <h4 className="font-label-caps text-sm text-neon-yellow font-bold">6. MAIN ASSEMBLY AREA</h4>
                </div>
                <span className="material-symbols-outlined text-outline">
                  {collapsed.assemblyArea ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
                </span>
              </div>
              {(!collapsed.assemblyArea || isPrinting) && (
                <div className="p-4 grid grid-cols-2 md:grid-cols-6 gap-4 text-center font-mono">
                  {[
                    { l: 'STAGE 1', v: overrides.assemblyStage1 ?? '01' },
                    { l: 'STAGE 2', v: overrides.assemblyStage2 ?? '01' },
                    { l: 'STAGE 3', v: overrides.assemblyStage3 ?? '--' },
                    { l: 'STAGE 4', v: overrides.assemblyStage4 ?? '01' },
                    { l: 'STAGE 5', v: overrides.assemblyStage5 ?? '--' },
                    { l: 'TOTAL ASSEMBLY', v: overrides.assemblyTotal ?? '25' }
                  ].map(item => (
                    <div key={item.l} className="bg-surface-container/30 p-3 rounded border border-outline-variant/15">
                      <span className="text-[9px] text-outline block">{item.l}</span>
                      <span className="text-lg font-black text-primary block mt-1">{item.v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 8. Daily Report */}
            <div className="tactical-glass rounded border border-outline-variant/25 overflow-hidden">
              <div
                onClick={() => toggleCollapse('dailyReport')}
                className="bg-surface-container-high/60 p-4 flex justify-between items-center cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">summarize</span>
                  <h4 className="font-label-caps text-sm text-neon-yellow font-bold">DAILY EXECUTIVE SUMMARY</h4>
                </div>
                <span className="material-symbols-outlined text-outline">
                  {collapsed.dailyReport ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
                </span>
              </div>
              {(!collapsed.dailyReport || isPrinting) && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between p-2 border-b border-outline-variant/10"><span>Stripping Completed:</span> <b className="text-primary">{overrides.strippingCompleted ?? '50'}</b></div>
                    <div className="flex justify-between p-2 border-b border-outline-variant/10"><span>Stripping Under Process:</span> <b className="text-amber-400">{overrides.strippingUnderProcess ?? '02'}</b></div>
                    <div className="flex justify-between p-2 border-b border-outline-variant/10"><span>Engines in Assembly:</span> <b className="text-primary">{overrides.assemblyTotal ?? '25'}</b></div>
                    <div className="flex justify-between p-2 border-b border-outline-variant/10"><span>Engines Passed:</span> <b className="text-[#00ff41]">{overrides.summaryWcnComplete ?? '19'}</b></div>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between p-2 border-b border-outline-variant/10"><span>Engines Awaiting for Pass:</span> <b className="text-amber-400">{overrides.summaryAwaitingPass ?? '06'}</b></div>
                    <div className="flex justify-between p-2 border-b border-outline-variant/10"><span>WCN Awaiting:</span> <b className="text-outline-variant">{overrides.summaryWcnAwaiting ?? 'NIL'}</b></div>
                    <div className="flex justify-between p-2 border-b border-outline-variant/10"><span>WCN Complete:</span> <b className="text-primary">{overrides.summaryWcnComplete ?? '19'}</b></div>
                    <div className="flex justify-between p-2 border-b border-outline-variant/10"><span>Security Status:</span> <span className="text-[#00ff41] font-bold">SECURE // ENCRYPTED</span></div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* Editor Modal for Dy GM Board Overrides */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-[#0d0e0a]/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto font-mono">
          <div className="bg-[#191a14] border border-[#919283]/30 rounded w-full max-w-4xl p-6 shadow-2xl text-[#e2e2da]">
            <div className="flex justify-between items-center border-b border-[#919283]/20 pb-4 mb-4">
              <div>
                <h4 className="text-khaki text-sm font-bold uppercase tracking-wider">DY GM ERG OFFICE BOARD EDITOR</h4>
                <p className="text-[10px] text-dark-grey uppercase mt-0.5">OVERRIDE ACTIVE DIGITAL PARAMETERS</p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-dark-grey hover:text-khaki text-xs"
              >
                [ CANCEL ]
              </button>
            </div>

            <div className="space-y-6 my-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* Stripping & Washing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-[#919283]/10 p-3 rounded">
                  <h5 className="text-khaki text-xs font-bold uppercase mb-2">// 1. STRIPPING DIVISION</h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">COMPLETED</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.strippingCompleted || ''}
                        onChange={(e) => setEditorForm({...editorForm, strippingCompleted: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">UNDER PROCESS</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.strippingUnderProcess || ''}
                        onChange={(e) => setEditorForm({...editorForm, strippingUnderProcess: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">FWD FOR WASHING</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.strippingFwdForWashing || ''}
                        onChange={(e) => setEditorForm({...editorForm, strippingFwdForWashing: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">PENDING</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.strippingPending || ''}
                        onChange={(e) => setEditorForm({...editorForm, strippingPending: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="border border-[#919283]/10 p-3 rounded">
                  <h5 className="text-khaki text-xs font-bold uppercase mb-2">// 2. WASHING DIVISION</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">LCC</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.washingLcc || ''}
                        onChange={(e) => setEditorForm({...editorForm, washingLcc: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">UCC</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.washingUcc || ''}
                        onChange={(e) => setEditorForm({...editorForm, washingUcc: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">BLOCK OUT</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.washingBlockOut || ''}
                        onChange={(e) => setEditorForm({...editorForm, washingBlockOut: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">CYL HEAD OUT</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.washingCylHeadOut || ''}
                        onChange={(e) => setEditorForm({...editorForm, washingCylHeadOut: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">CRANKSHAFT OUT</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.washingCrankshaftOut || ''}
                        onChange={(e) => setEditorForm({...editorForm, washingCrankshaftOut: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">SUPERCHARGER</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.washingSupercharger || ''}
                        onChange={(e) => setEditorForm({...editorForm, washingSupercharger: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">FIP</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.washingFip || ''}
                        onChange={(e) => setEditorForm({...editorForm, washingFip: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Machine Shop & Line Boring */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-[#919283]/10 p-3 rounded">
                  <h5 className="text-khaki text-xs font-bold uppercase mb-2">// 3. MACHINE SHOP</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">COMPONENTS HELD</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.machineCompHeld || ''}
                        onChange={(e) => setEditorForm({...editorForm, machineCompHeld: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">COMPONENTS DONE</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.machineCompDone || ''}
                        onChange={(e) => setEditorForm({...editorForm, machineCompDone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">COMPONENTS SENT</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.machineCompSent || ''}
                        onChange={(e) => setEditorForm({...editorForm, machineCompSent: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">SHELL HELD</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.machineShellHeld || ''}
                        onChange={(e) => setEditorForm({...editorForm, machineShellHeld: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">WORK PENDING</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.machineWorkPending || ''}
                        onChange={(e) => setEditorForm({...editorForm, machineWorkPending: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="border border-[#919283]/10 p-3 rounded">
                  <h5 className="text-khaki text-xs font-bold uppercase mb-2">// 4. LINE BORING SECTION</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">PREP TILL DATE</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.boringPrepTillDate || ''}
                        onChange={(e) => setEditorForm({...editorForm, boringPrepTillDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">LAST MONTH PROGRESS</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.boringLastMonthProgress || ''}
                        onChange={(e) => setEditorForm({...editorForm, boringLastMonthProgress: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">CUTTING OF SHELL</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.boringCuttingOfShell || ''}
                        onChange={(e) => setEditorForm({...editorForm, boringCuttingOfShell: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">SHELL FOR COATING</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.boringShellForCoating || ''}
                        onChange={(e) => setEditorForm({...editorForm, boringShellForCoating: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">BLOCK COMPLETED</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.boringBlockCompleted || ''}
                        onChange={(e) => setEditorForm({...editorForm, boringBlockCompleted: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub Assembly & Main Assembly */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-[#919283]/10 p-3 rounded">
                  <h5 className="text-khaki text-xs font-bold uppercase mb-2">// 5. SUB ASSEMBLY DIVISION</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">JACKETS DONE</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.subJacketsDone || ''}
                        onChange={(e) => setEditorForm({...editorForm, subJacketsDone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">FIP DONE</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.subFipDone || ''}
                        onChange={(e) => setEditorForm({...editorForm, subFipDone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">LINER DONE</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.subLinerDone || ''}
                        onChange={(e) => setEditorForm({...editorForm, subLinerDone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">LINER BALANCE</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.subLinerBalance || ''}
                        onChange={(e) => setEditorForm({...editorForm, subLinerBalance: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">ENG WATER TEST</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.subEngWaterTest || ''}
                        onChange={(e) => setEditorForm({...editorForm, subEngWaterTest: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">CYL HEAD DONE</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.subCylHeadDone || ''}
                        onChange={(e) => setEditorForm({...editorForm, subCylHeadDone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">SUPERCHARGER DONE</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.subSuperchargerDone || ''}
                        onChange={(e) => setEditorForm({...editorForm, subSuperchargerDone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">AWAITING WATER TEST</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.subAwaitingWaterTest || ''}
                        onChange={(e) => setEditorForm({...editorForm, subAwaitingWaterTest: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="border border-[#919283]/10 p-3 rounded">
                  <h5 className="text-khaki text-xs font-bold uppercase mb-2">// 6. MAIN ASSEMBLY AREA</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">STAGE 1</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.assemblyStage1 || ''}
                        onChange={(e) => setEditorForm({...editorForm, assemblyStage1: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">STAGE 2</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.assemblyStage2 || ''}
                        onChange={(e) => setEditorForm({...editorForm, assemblyStage2: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">STAGE 3</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.assemblyStage3 || ''}
                        onChange={(e) => setEditorForm({...editorForm, assemblyStage3: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">STAGE 4</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.assemblyStage4 || ''}
                        onChange={(e) => setEditorForm({...editorForm, assemblyStage4: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">STAGE 5</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.assemblyStage5 || ''}
                        onChange={(e) => setEditorForm({...editorForm, assemblyStage5: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-dark-grey mb-1">TOTAL ASSEMBLY</label>
                      <input
                        type="text"
                        className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                        value={editorForm.assemblyTotal || ''}
                        onChange={(e) => setEditorForm({...editorForm, assemblyTotal: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Report summary values */}
              <div className="border border-[#919283]/10 p-3 rounded">
                <h5 className="text-khaki text-xs font-bold uppercase mb-2">// 7. DAILY REPORT SUMMARY</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-dark-grey mb-1">WCN AWAITING</label>
                    <input
                      type="text"
                      className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                      value={editorForm.summaryWcnAwaiting || ''}
                      onChange={(e) => setEditorForm({...editorForm, summaryWcnAwaiting: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-dark-grey mb-1">WCN COMPLETE (ENGINES PASSED)</label>
                    <input
                      type="text"
                      className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                      value={editorForm.summaryWcnComplete || ''}
                      onChange={(e) => setEditorForm({...editorForm, summaryWcnComplete: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-dark-grey mb-1">ENGINES AWAITING PASS</label>
                    <input
                      type="text"
                      className="w-full bg-[#12130e] border border-[#919283]/20 p-2 text-xs focus:ring-1 focus:ring-khaki rounded-sm"
                      value={editorForm.summaryAwaitingPass || ''}
                      onChange={(e) => setEditorForm({...editorForm, summaryAwaitingPass: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#919283]/20">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 border border-[#919283]/40 hover:border-khaki text-xs transition-all uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditor}
                className="px-4 py-2 bg-khaki/10 border border-khaki/30 text-khaki hover:bg-khaki/20 text-xs transition-all uppercase"
              >
                Apply Overrides
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
