import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { api } from '../api'

export default function TankOverhaul() {
  const [tanks, setTanks] = useState([])
  const [workforce, setWorkforce] = useState([])
  const [testing, setTesting] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Search & Filter State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [modelFilter, setModelFilter] = useState('All')
  const [sortField, setSortField] = useState('tankId')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Modal states
  const [selectedTank, setSelectedTank] = useState(null)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isMinimalReportOpen, setIsMinimalReportOpen] = useState(false)
  const [selectedTankForMinReport, setSelectedTankForMinReport] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('add') // 'add' | 'edit'
  const [formData, setFormData] = useState({
    tankId: '',
    registrationNumber: '',
    tankModel: 'T-90',
    manufacturer: '',
    manufacturingYear: new Date().getFullYear(),
    engineNumber: '',
    chassisNumber: '',
    unitAssignment: '',
    currentLocation: '',
    operationalStatus: 'Active',
    lastServiceDate: '',
    nextScheduledService: '',
    engineHours: 0,
    kilometersCovered: 0,
    weaponSystemDetails: '',
    ammunitionCapacity: 40,
    fuelCapacity: 1000,
    maintenanceNotes: ''
  })

  // Role authentication
  const user = JSON.parse(localStorage.getItem('kavachUser')) || { role: 'User' }
  const isAdmin = user.role === 'Admin'

  const fetchData = async () => {
    try {
      setLoading(true)
      const [tanksData, wfData, testData] = await Promise.all([
        api.getTanks(),
        api.getWorkforce(),
        api.getTesting()
      ])
      setTanks(tanksData)
      setWorkforce(wfData)
      setTesting(testData)
    } catch (err) {
      setError('Failed to fetch data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenAddForm = () => {
    setFormMode('add')
    setFormData({
      tankId: '',
      registrationNumber: '',
      tankModel: 'T-90',
      manufacturer: 'Heavy Vehicles Factory',
      manufacturingYear: new Date().getFullYear(),
      engineNumber: '',
      chassisNumber: '',
      unitAssignment: '',
      currentLocation: '',
      operationalStatus: 'Active',
      lastServiceDate: new Date().toISOString().split('T')[0],
      nextScheduledService: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      engineHours: 0,
      kilometersCovered: 0,
      weaponSystemDetails: '125mm Smoothbore Gun, PKT 7.62mm Machine Gun',
      ammunitionCapacity: 43,
      fuelCapacity: 1600,
      maintenanceNotes: ''
    })
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (tank) => {
    setFormMode('edit')
    setFormData({
      ...tank,
      lastServiceDate: tank.lastServiceDate ? new Date(tank.lastServiceDate).toISOString().split('T')[0] : '',
      nextScheduledService: tank.nextScheduledService ? new Date(tank.nextScheduledService).toISOString().split('T')[0] : '',
    })
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    try {
      if (formMode === 'add') {
        await api.registerTank(formData)
      } else {
        await api.updateTank(formData._id, formData)
      }
      setIsFormOpen(false)
      fetchData()
    } catch (err) {
      alert('Error saving tank: ' + err.message)
    }
  }

  const handleDeleteTank = async (id) => {
    if (window.confirm('Are you sure you want to decommission/delete this tank?')) {
      try {
        await api.deleteTank(id)
        fetchData()
      } catch (err) {
        alert('Error deleting tank: ' + err.message)
      }
    }
  }

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc'
    setSortField(field)
    setSortOrder(isAsc ? 'desc' : 'asc')
  }

  // Filter & Search Logic
  const filteredTanks = tanks.filter(tank => {
    const matchesSearch = 
      (tank.tankId || '').toLowerCase().includes(search.toLowerCase()) ||
      (tank.registrationNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (tank.unitAssignment || '').toLowerCase().includes(search.toLowerCase()) ||
      (tank.currentLocation || '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || tank.operationalStatus === statusFilter
    const matchesModel = modelFilter === 'All' || tank.tankModel === modelFilter
    return matchesSearch && matchesStatus && matchesModel
  })

  // Sort Logic
  const sortedTanks = [...filteredTanks].sort((a, b) => {
    let valA = a[sortField] || ''
    let valB = b[sortField] || ''
    if (typeof valA === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
    }
    return sortOrder === 'asc' ? valA - valB : valB - valA
  })

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTanks = sortedTanks.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedTanks.length / itemsPerPage)

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active': return 'bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/30'
      case 'Under Maintenance': return 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
      case 'Overhaul': return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
      case 'Reserved': return 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
      case 'Decommissioned': return 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
      default: return 'bg-outline-variant/20 text-on-surface-variant'
    }
  }

  // Select tank for Detailed Report
  const handleSelectTankForReport = (tank) => {
    setSelectedTank(tank)
    setIsReportOpen(true)
  }

  const handlePrint = () => {
    window.print()
  }

  // Relate workforce to the selected tank
  const assignedCrew = selectedTank ? workforce.filter(w => w.currentAssignment && (w.currentAssignment._id === selectedTank._id || w.currentAssignment === selectedTank._id)) : []
  // Relate tests to selected tank
  const tankTests = selectedTank ? testing.filter(t => t.tankId === selectedTank._id || t.tankNumber === selectedTank.registrationNumber) : []

  return (
    <div className="flex flex-col md:flex-row min-h-screen md:h-screen w-full relative bg-background text-on-surface font-body-base overflow-x-hidden md:overflow-hidden">
      <style>{`
        .tactical-glass { background:rgba(32,32,27,0.6); backdrop-filter:blur(12px); border:1px solid rgba(145,146,131,0.2); }
        .neon-glow-green { box-shadow: 0 0 10px rgba(195,204,140,0.2); }
        @media print {
          body * { visibility: hidden; }
          #printable-report, #printable-report * { visibility: visible; }
          #printable-report { 
            position: fixed; 
            left: 0; 
            top: 0; 
            width: 111.11% !important; 
            transform: scale(0.90);
            transform-origin: top left;
            color: #000000 !important; 
            background: #ffffff !important; 
            padding: 24px;
            box-shadow: none !important;
            border: none !important;
          }
          #printable-report .text-khaki {
            color: #4a3e21 !important;
          }
          #printable-report .text-dark-grey, #printable-report .text-outline {
            color: #555555 !important;
          }
          #printable-report .border, #printable-report border, #printable-report td, #printable-report th {
            border-color: #888888 !important;
          }
          #printable-report div[class*='border-b'] {
            border-bottom: 1.5px solid #333333 !important;
          }
          #printable-report div[class*='border-t'] {
            border-top: 1px solid #666666 !important;
          }
          #printable-report .bg-\\[\\#12130e\\], #printable-report .bg-\\[\\#191a14\\] {
            background: #f8f8f6 !important;
          }
          .report-modal-backdrop { background: transparent !important; backdrop-filter: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Side Navigation */}
      <Sidebar className="no-print" />

      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-surface-dim min-w-0 pt-14 md:pt-0">
        {/* Top App Bar */}
        <header className="bg-surface-container/60 backdrop-blur-xl border-b border-outline-variant/30 min-h-16 py-3 md:py-0 flex flex-wrap md:flex-nowrap items-center justify-between px-4 sm:px-6 md:px-8 gap-3 z-30 shadow-lg shadow-primary/5 no-print">
          <div className="flex items-center gap-3 sm:gap-6">
            <h2 className="font-headline-md text-base sm:text-lg md:text-headline-md font-bold uppercase tracking-wider text-primary">Fleet Overview</h2>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <button
                onClick={handleOpenAddForm}
                className="bg-primary hover:bg-primary/95 text-on-primary font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm text-xs tracking-widest flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                ADD TANK
              </button>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 no-print max-w-full">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'TOTAL FLEET', val: tanks.length, color: 'text-primary' },
                { label: 'ACTIVE', val: tanks.filter(t => t.operationalStatus === 'Active').length, color: 'text-[#00ff41]' },
                { label: 'UNDER OVERHAUL', val: tanks.filter(t => t.operationalStatus === 'Overhaul').length, color: 'text-cyan-400' },
                { label: 'MAINTENANCE', val: tanks.filter(t => t.operationalStatus === 'Under Maintenance').length, color: 'text-amber-400' },
                { label: 'RESERVED', val: tanks.filter(t => t.operationalStatus === 'Reserved').length, color: 'text-blue-400' },
              ].map(card => (
                <div key={card.label} className="tactical-glass p-4 rounded border border-outline-variant/20">
                  <p className="font-label-caps text-[10px] text-on-surface-variant tracking-wider">{card.label}</p>
                  <h3 className={`font-headline-md text-2xl font-bold mt-1 ${card.color}`}>{card.val}</h3>
                </div>
              ))}
            </div>

            {/* Filters and Controls */}
            <div className="tactical-glass p-4 rounded border border-outline-variant/20 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline/50">search</span>
                <input
                  type="text"
                  placeholder="Search Asset ID, Reg, Unit, Location..."
                  className="bg-surface-container-highest/60 border-none text-on-surface font-body-base text-xs pl-10 pr-4 py-2 w-full focus:ring-1 focus:ring-primary rounded-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-label-caps text-on-surface-variant">STATUS:</span>
                  <select
                    className="bg-surface-container-highest/60 border-none text-on-surface text-xs rounded-sm focus:ring-1 focus:ring-primary py-1 px-3"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Overhaul">Overhaul</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Decommissioned">Decommissioned</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-label-caps text-on-surface-variant">MODEL:</span>
                  <select
                    className="bg-surface-container-highest/60 border-none text-on-surface text-xs rounded-sm focus:ring-1 focus:ring-primary py-1 px-3"
                    value={modelFilter}
                    onChange={(e) => setModelFilter(e.target.value)}
                  >
                    <option value="All">All Models</option>
                    <option value="T-72">T-72</option>
                    <option value="T-90">T-90</option>
                    <option value="T-72 Ajeya">T-72 Ajeya</option>
                    <option value="Arjun">Arjun</option>
                    <option value="Arjun MK1A">Arjun MK1A</option>
                    <option value="BMP-2 Sarath">BMP-2 Sarath</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dashboard Table */}
            <div className="md:hidden flex items-center gap-2 text-[11px] text-primary/90 font-label-caps bg-primary/10 border border-primary/30 p-2 rounded">
              <span className="material-symbols-outlined text-sm animate-pulse">swipe</span>
              <span>SWIPE HORIZONTALLY TO VIEW ALL TANK RECORDS &rarr;</span>
            </div>
            <div className="tactical-glass rounded border border-outline-variant/20 overflow-x-auto touch-scroll mobile-swipe-container custom-scrollbar w-full">
              {loading ? (
                <div className="p-8 text-center text-primary animate-pulse">Retreiving Secure Database Records...</div>
              ) : (
                <table className="w-full min-w-[900px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high/80 border-b border-outline-variant/30 text-on-surface-variant font-label-caps text-[10px]">
                      <th className="p-4 cursor-pointer hover:text-primary" onClick={() => handleSort('tankId')}>Tank ID ↕</th>
                      <th className="p-4 cursor-pointer hover:text-primary" onClick={() => handleSort('registrationNumber')}>Reg Number ↕</th>
                      <th className="p-4 cursor-pointer hover:text-primary" onClick={() => handleSort('tankModel')}>Model ↕</th>
                      <th className="p-4">Unit Assignment</th>
                      <th className="p-4">Current Location</th>
                      <th className="p-4 cursor-pointer hover:text-primary" onClick={() => handleSort('operationalStatus')}>Status ↕</th>
                      <th className="p-4">Last Maint</th>
                      <th className="p-4">Next Scheduled</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {currentTanks.map((tank) => (
                      <tr key={tank._id} className="hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => handleSelectTankForReport(tank)}>
                        <td className="p-4 font-mono font-bold text-primary">{tank.tankId}</td>
                        <td className="p-4 font-mono">{tank.registrationNumber}</td>
                        <td className="p-4">{tank.tankModel}</td>
                        <td className="p-4">{tank.unitAssignment || 'Unassigned'}</td>
                        <td className="p-4">{tank.currentLocation || 'Unknown'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadgeClass(tank.operationalStatus)}`}>
                            {tank.operationalStatus}
                          </span>
                        </td>
                        <td className="p-4 font-mono">{tank.lastServiceDate ? new Date(tank.lastServiceDate).toLocaleDateString() : 'N/A'}</td>
                        <td className="p-4 font-mono">{tank.nextScheduledService ? new Date(tank.nextScheduledService).toLocaleDateString() : 'N/A'}</td>
                        <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleSelectTankForReport(tank)}
                              className="p-1 hover:text-primary transition-colors"
                              title="View Command Center"
                            >
                              <span className="material-symbols-outlined text-base">analytics</span>
                            </button>
                             <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTankForMinReport(tank);
                                setIsMinimalReportOpen(true);
                              }}
                              className="p-1 hover:text-khaki transition-colors"
                              title="Formal Overhaul & Cost Report"
                            >
                              <span className="material-symbols-outlined text-base text-khaki">receipt_long</span>
                            </button>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => handleOpenEditForm(tank)}
                                  className="p-1 hover:text-secondary transition-colors"
                                  title="Edit"
                                >
                                  <span className="material-symbols-outlined text-base">edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteTank(tank._id)}
                                  className="p-1 hover:text-error transition-colors"
                                  title="Decommission/Delete"
                                >
                                  <span className="material-symbols-outlined text-base">delete</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Pagination */}
              <div className="p-4 bg-surface-container-high/40 border-t border-outline-variant/20 flex justify-between items-center text-xs">
                <span className="text-on-surface-variant font-mono">Showing {currentTanks.length} of {sortedTanks.length} tanks</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-outline-variant/30 hover:bg-primary/5 rounded disabled:opacity-50"
                  >
                    PREV
                  </button>
                  <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/40 rounded font-bold font-mono">{currentPage} / {totalPages || 1}</span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 border border-outline-variant/30 hover:bg-primary/5 rounded disabled:opacity-50"
                  >
                    NEXT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal - Tank Command Center (Detailed Report) */}
      {isReportOpen && selectedTank && (
        <div className="fixed inset-0 bg-[#12130e] text-[#e2e2da] z-50 overflow-y-auto p-6 sm:p-8 report-modal-backdrop">
          <style>{`
            .command-panel { bg: #191a14; border: 1px solid rgba(145, 146, 131, 0.2); }
            .timeline-line { width: 1px; background: rgba(145, 146, 131, 0.2); }
            .text-khaki { color: #d6c692; }
            .border-khaki { border-color: #d6c692; }
            .bg-khaki { background-color: #d6c692; }
            .text-dark-grey { color: #919283; }
            .border-dark-grey { border-color: #919283; }
            @media print {
              body * { visibility: hidden; }
              #printable-command-center, #printable-command-center * { visibility: visible; }
              #printable-command-center { position: absolute; left: 0; top: 0; width: 100%; color: black !important; background: white !important; }
              .no-print { display: none !important; }
            }
          `}</style>
          
          <div id="printable-command-center" className="w-full max-w-7xl mx-auto flex flex-col gap-6 font-mono">
            {/* Top Minimal HUD Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#919283]/20 pb-4 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-khaki text-lg font-bold tracking-widest uppercase">OVERHAUL TRACKING</h3>
                  <span className="text-[10px] text-dark-grey">// COMMAND_SECURE_LINK</span>
                </div>
                <div className="flex flex-wrap gap-x-6 mt-1 text-[11px] text-dark-grey uppercase">
                  <span>UNIT: <b className="text-[#e2e2da]">{selectedTank.unitAssignment || '14 REGT (DESERT RATS)'}</b></span>
                  <span>CHASSIS: <b className="text-[#e2e2da]">{selectedTank.chassisNumber}</b></span>
                  <span>REG: <b className="text-[#e2e2da]">{selectedTank.registrationNumber}</b></span>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto justify-end no-print">
                <div className="relative hidden sm:block">
                  <input
                    type="text"
                    disabled
                    placeholder="COMMAND_SYNC..."
                    className="bg-[#191a14] border border-[#919283]/30 text-xs px-3 py-1.5 w-48 text-[#e2e2da] focus:outline-none"
                  />
                  <span className="material-symbols-outlined absolute right-2 top-2 text-[12px] text-dark-grey">satellite_alt</span>
                </div>
                <button
                  onClick={() => setIsReportOpen(false)}
                  className="border border-[#919283]/40 hover:border-khaki text-[#e2e2da] px-3 py-1 text-xs uppercase transition-colors"
                >
                  [ CLOSE ]
                </button>
              </div>
            </div>

            {/* Top minimal KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'CURRENT STAGE', val: selectedTank.operationalStatus === 'Active' ? 'STAGE 07 / 07' : 'STAGE 03 / 07', sub: selectedTank.operationalStatus === 'Active' ? 'DEPLOYMENT READY' : 'ENGINE OVERHAUL IN-PROGRESS' },
                { label: 'TOTAL DOWNTIME', val: selectedTank.operationalStatus === 'Active' ? '0.0 DAYS' : '14.5 DAYS', sub: selectedTank.operationalStatus === 'Active' ? 'EST. REMAINING: 00 DAYS' : 'EST. REMAINING: 09 DAYS' },
                { label: 'RESOURCES ACTIVE', val: '12 TECHS', sub: '3 WORKSHOP TEAMS ASSIGNED' },
                { label: 'SYSTEM HEALTH', val: selectedTank.operationalStatus === 'Active' ? 'OPTIMAL' : 'DEGRADED', sub: 'NO CRITICAL BLOCKERS' }
              ].map((card, idx) => (
                <div key={idx} className="bg-[#191a14] border border-[#919283]/20 p-4 relative">
                  {idx === 3 && (
                    <div className="absolute right-3 top-3 w-8 h-8 opacity-25 border border-dashed border-khaki rounded-full animate-spin"></div>
                  )}
                  <span className="text-[10px] text-dark-grey block tracking-wider">{card.label}</span>
                  <h4 className="text-xl font-bold text-khaki mt-1 tracking-wide">{card.val}</h4>
                  <span className="text-[9px] text-dark-grey block mt-1 tracking-widest">{card.sub}</span>
                </div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Column: Overhaul Sequence Log */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div>
                  <h4 className="text-khaki text-xs font-bold tracking-widest mb-4">OVERHAUL SEQUENCE LOG</h4>
                  
                  <div className="space-y-4">
                    {/* Active & Completed Cards */}
                    {[
                      { num: 1, name: 'Arrival & Strip-down', status: 'Completed', team: 'LOG_SEC_BRAVO', date: '02 OCT 2023' },
                      { num: 2, name: 'Component De-greasing & Inspection', status: 'Completed', team: 'CHEM_SPEC_7', date: '05 OCT 2023' },
                      { num: 3, name: 'Engine/Transmission Overhaul', status: selectedTank.operationalStatus === 'Active' ? 'Completed' : 'In Progress', team: 'HVY_MECH_E1', date: selectedTank.operationalStatus === 'Active' ? '12 OCT 2023' : '18 OCT 2023' },
                      { num: 4, name: 'Hull Repair & Painting', status: selectedTank.operationalStatus === 'Active' ? 'Completed' : 'Pending', team: 'ARMOR_CORPS_TECH', date: selectedTank.operationalStatus === 'Active' ? '18 OCT 2023' : '28 OCT 2023' }
                    ].map((step, i) => {
                      const isActive = step.status === 'In Progress';
                      const isComp = step.status === 'Completed';
                      return (
                        <div
                          key={i}
                          className={`bg-[#191a14] border p-4 flex gap-4 items-center justify-between ${
                            isActive ? 'border-khaki' : 'border-[#919283]/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                              isComp ? 'border-green-500 text-green-400 bg-green-500/5' :
                              isActive ? 'border-khaki text-khaki bg-khaki/5' : 'border-dark-grey text-dark-grey'
                            }`}>
                              <span className="material-symbols-outlined text-sm">
                                {isComp ? 'check' : isActive ? 'settings_suggest' : 'hourglass_empty'}
                              </span>
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-[#e2e2da]">{step.num}. {step.name}</h5>
                              <div className="flex gap-4 mt-1 text-[10px] text-dark-grey">
                                <span>WORKSHOP TEAM: <b className="text-[#e2e2da]">{step.team}</b></span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border inline-block ${
                              isComp ? 'bg-green-500/5 text-green-400 border-green-500/20' :
                              isActive ? 'bg-khaki/5 text-khaki border-khaki/30' : 'bg-gray-500/5 text-dark-grey border-[#919283]/20'
                            }`}>
                              {step.status.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-dark-grey block mt-1">
                              {isComp ? 'FINALIZED' : isActive ? 'EST. COMPLETION' : 'EST. START'}: <b>{step.date}</b>
                            </span>
                          </div>
                        </div>
                      )
                    })}

                    {/* Pending Simple list items to match the mockup */}
                    <div className="bg-[#191a14] border border-[#919283]/20 p-4 divide-y divide-[#919283]/10">
                      {[
                        { num: 5, name: 'Re-assembly' },
                        { num: 6, name: 'Test Track Trials' },
                        { num: 7, name: 'Final Quality Inspection' }
                      ].map((step, i) => (
                        <div key={i} className="flex justify-between items-center py-2.5 text-xs text-dark-grey">
                          <div className="flex items-center gap-4">
                            <span className="w-5 h-5 rounded-full border border-dark-grey/30 flex items-center justify-center text-[10px]">{step.num}</span>
                            <span>{step.name}</span>
                          </div>
                          <span>TBD</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Camera feed, Telemetry & Logs */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {/* 1. Grayscale Live Camera Feed Frame */}
                <div className="bg-[#191a14] border border-[#919283]/20 p-4">
                  <div className="flex justify-between items-center text-[10px] text-dark-grey mb-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                      LIVE_SEC_404
                    </span>
                    <span>FRAME: 884-X9</span>
                  </div>
                  <div className="h-44 bg-[#12130e] border border-[#919283]/10 relative overflow-hidden">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJtUDdafy0AlezasdQRoY2hfsVUnA28lj-TibCmEtkaDnJsygYwPSGNPTO0BgQnsicE4PD0NgOL0qGR05rD650fK3XRrVjAoN1lV9QQRkRcKjNpjms7LVkyOMEhD2P49GtadwTruZyG0z1noDwR839utLJebabPmD4Vx6gn-0se1ueqTL_pBIWyLqCxYVzHx653JI2LxeMXOVi5zddE85MCaujqJj8WNhfziqKH2OYVIt-RwNF7mvLHlQG5GG8swahH1tUBgFlEmA"
                      alt="Tank feed"
                      className="w-full h-full object-cover grayscale opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#191a14] to-transparent pointer-events-none"></div>
                    <button
                      onClick={() => alert('Secure camera feed expanded.')}
                      className="absolute bottom-2 right-2 bg-[#191a14]/80 border border-[#919283]/30 text-[9px] px-2 py-1 uppercase text-dark-grey hover:text-khaki"
                    >
                      [ EXPAND FEED ]
                    </button>
                  </div>
                </div>

                {/* 2. Flat System Telemetry progress bars */}
                <div className="bg-[#191a14] border border-[#919283]/20 p-4">
                  <h4 className="text-khaki text-xs font-bold tracking-widest mb-3">SYSTEM TELEMETRY</h4>
                  <div className="space-y-3.5">
                    {[
                      { label: 'ENGINE_REBUILD_INTEGRITY', val: 74 },
                      { label: 'HULL_STRESS_TOLERANCE', val: 92 },
                      { label: 'AMMUNITION_SYSTEM_CHECK', val: 0 }
                    ].map(bar => (
                      <div key={bar.label}>
                        <div className="flex justify-between text-[10px] text-dark-grey font-mono mb-1">
                          <span>{bar.label}</span>
                          <span>{bar.val < 10 ? `0${bar.val}%` : `${bar.val}%`}</span>
                        </div>
                        <div className="w-full bg-[#12130e] h-1 border border-[#919283]/20">
                          <div className="h-full bg-khaki" style={{ width: `${bar.val}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Commander's Log with warm borders */}
                <div className="bg-[#191a14] border border-[#919283]/20 p-4">
                  <h4 className="text-khaki text-xs font-bold tracking-widest mb-2">COMMANDER&apos;S LOG</h4>
                  <div className="border-l-2 border-khaki pl-3 py-1 my-2">
                    <p className="text-xs italic text-[#e2e2da] leading-relaxed">
                      &quot;Engine block 4A requires specialized gaskets from central armory. Logistics delay expected: 24hrs. Priority shifted to hull sandblasting in parallel.&quot;
                    </p>
                  </div>
                  <span className="text-[9px] text-dark-grey block text-right">TIMESTAMP: 12:44:09Z</span>
                </div>

                {/* 4. Secure Action Exports */}
                <div className="bg-[#191a14] border border-[#919283]/20 p-4 flex flex-col gap-2">
                  <h4 className="text-khaki text-xs font-bold tracking-widest mb-1">REPORTING &amp; DOCUMENTATION</h4>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <button
                      onClick={() => window.print()}
                      className="border border-[#919283]/40 hover:border-khaki p-2 transition-all uppercase"
                    >
                      Print Report
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="border border-[#919283]/40 hover:border-khaki p-2 transition-all uppercase"
                    >
                      Export PDF
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom encrypt footer */}
            <div className="border-t border-[#919283]/20 pt-4 flex justify-between text-[10px] text-dark-grey">
              <span>AUTHORIZED COMMAND LINK // ENCRYPTED GCM-256</span>
              <span>VERIFIED: {user.fullName} ({user.role})</span>
            </div>
          </div>
        </div>
      )}
      {/* Modal - Formal Overhaul & Fleet Logistics Report */}
      {isMinimalReportOpen && selectedTankForMinReport && (() => {
        const minCrew = workforce.filter(w => w.currentAssignment && (w.currentAssignment._id === selectedTankForMinReport._id || w.currentAssignment === selectedTankForMinReport._id));
        const serviceHistory = selectedTankForMinReport.serviceHistory || [];
        const totalCost = serviceHistory.reduce((sum, h) => sum + (h.cost || 0), 0);
        
        // Find testing records matching this tank
        const tankTests = testing.filter(t => 
          t.tankId === selectedTankForMinReport._id || 
          t.tankId === selectedTankForMinReport.tankId ||
          t.tankNumber === selectedTankForMinReport.registrationNumber
        );

        return (
          <div className="fixed inset-0 bg-[#0d0e0a]/90 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto report-modal-backdrop">
            <div id="printable-report" className="bg-[#191a14] border border-[#919283]/30 rounded w-full max-w-4xl p-8 my-8 shadow-2xl text-[#e2e2da] font-mono relative">
              
              {/* Top Security Header */}
              <div className="flex justify-between items-start border-b-2 border-khaki pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 text-khaki mb-1">
                    <span className="material-symbols-outlined">shield</span>
                    <span className="text-xs font-bold uppercase tracking-widest">SECRET // CLASSIFIED DOCUMENT</span>
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-wider text-[#e2e2da]">MILITARY TANK OVERHAUL &amp; FLEET LOGISTICS REPORT</h3>
                  <p className="text-[10px] text-dark-grey uppercase mt-0.5">GENERATED SECURELY BY KAVACH COMMAND SYSTEM // {new Date().toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] bg-red-950/40 text-red-400 border border-red-950 px-2 py-0.5 rounded font-bold inline-block mb-1">
                    FOR OFFICIAL USE ONLY
                  </div>
                  <p className="text-[10px] text-dark-grey">REF NO: KAVACH-TNK-{selectedTankForMinReport.tankId}</p>
                </div>
              </div>

              {/* Report Body */}
              <div className="space-y-6">
                
                {/* 1. Tank Technical Specs Grid */}
                <div>
                  <h4 className="text-khaki text-xs font-bold uppercase tracking-widest border-b border-[#919283]/20 pb-1 mb-3">
                    [ SECTION I : TANK SPECIFICATIONS &amp; FLEET DATA ]
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-dark-grey block">TANK ID</span>
                      <span className="font-bold text-[#e2e2da]">{selectedTankForMinReport.tankId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-dark-grey block">REGISTRATION NO</span>
                      <span className="font-bold text-[#e2e2da]">{selectedTankForMinReport.registrationNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-dark-grey block">TANK MODEL</span>
                      <span className="font-bold text-[#e2e2da]">{selectedTankForMinReport.tankModel}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-dark-grey block">MANUFACTURER</span>
                      <span className="font-bold text-[#e2e2da]">{selectedTankForMinReport.manufacturer || 'Heavy Vehicles Factory'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-dark-grey block">MANUFACTURING YEAR</span>
                      <span className="font-bold text-[#e2e2da]">{selectedTankForMinReport.manufacturingYear || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-dark-grey block">ENGINE NUMBER</span>
                      <span className="font-bold text-[#e2e2da]">{selectedTankForMinReport.engineNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-dark-grey block">CHASSIS NUMBER</span>
                      <span className="font-bold text-[#e2e2da]">{selectedTankForMinReport.chassisNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-dark-grey block">UNIT ASSIGNMENT</span>
                      <span className="font-bold text-[#e2e2da]">{selectedTankForMinReport.unitAssignment || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-dark-grey block">ENGINE HOURS</span>
                      <span className="font-bold text-khaki">{selectedTankForMinReport.engineHours || 0} HRS</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-dark-grey block">KILOMETERS COVERED</span>
                      <span className="font-bold text-khaki">{selectedTankForMinReport.kilometersCovered || 0} KM</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-dark-grey block">FUEL CAPACITY</span>
                      <span className="font-bold text-[#e2e2da]">{selectedTankForMinReport.fuelCapacity || 0} L</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-dark-grey block">WEAPON DETAILS</span>
                      <span className="font-bold text-[#e2e2da] truncate block" title={selectedTankForMinReport.weaponSystemDetails}>{selectedTankForMinReport.weaponSystemDetails || 'N/A'}</span>
                    </div>
                  </div>
                  {selectedTankForMinReport.maintenanceNotes && (
                    <div className="mt-3 p-2 bg-[#12130e] border border-[#919283]/15 rounded-sm">
                      <span className="text-[10px] text-dark-grey block mb-0.5">MAINTENANCE NOTES / LOGS:</span>
                      <p className="text-xs italic text-[#e2e2da]">{selectedTankForMinReport.maintenanceNotes}</p>
                    </div>
                  )}
                </div>

                {/* 2. Workforce Personnel details */}
                <div>
                  <h4 className="text-khaki text-xs font-bold uppercase tracking-widest border-b border-[#919283]/20 pb-1 mb-3">
                    [ SECTION II : DEDICATED WORKSHOP PERSONNEL ]
                  </h4>
                  {minCrew.length > 0 ? (
                    <div className="border border-[#919283]/20 rounded overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-khaki/10 text-khaki border-b border-[#919283]/20 font-bold">
                            <th className="p-2">EMPLOYEE ID</th>
                            <th className="p-2">NAME / RANK</th>
                            <th className="p-2">DEPARTMENT</th>
                            <th className="p-2">SKILL LEVEL</th>
                            <th className="p-2">SHIFT / AVAILABILITY</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#919283]/10">
                          {minCrew.map((worker) => (
                            <tr key={worker.employeeId} className="hover:bg-surface-container/10">
                              <td className="p-2 font-bold text-khaki">{worker.employeeId}</td>
                              <td className="p-2">
                                <span className="font-bold block text-[#e2e2da]">{worker.name}</span>
                                <span className="text-[10px] text-dark-grey">{worker.designation || worker.trade}</span>
                              </td>
                              <td className="p-2">{worker.department}</td>
                              <td className="p-2"><span className="bg-surface-container-high px-1.5 py-0.5 rounded text-[10px]">{worker.skillLevel || 'Senior'}</span></td>
                              <td className="p-2">
                                <span className="block">{worker.shift} Shift</span>
                                <span className={`text-[10px] font-bold ${worker.attendanceStatus === 'Present' ? 'text-green-400' : 'text-amber-400'}`}>
                                  {worker.attendanceStatus || 'Active'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-dark-grey italic">No dedicated workshop crew currently assigned to this asset.</p>
                  )}
                </div>

                {/* 3. Testing and Calibration History */}
                <div>
                  <h4 className="text-khaki text-xs font-bold uppercase tracking-widest border-b border-[#919283]/20 pb-1 mb-3">
                    [ SECTION III : SYSTEM CALIBRATION &amp; TESTING HISTORY ]
                  </h4>
                  {tankTests.length > 0 ? (
                    <div className="border border-[#919283]/20 rounded overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-khaki/10 text-khaki border-b border-[#919283]/20 font-bold">
                            <th className="p-2">TEST STAGE</th>
                            <th className="p-2">CONDUCTED DATE</th>
                            <th className="p-2">OFFICER IN CHARGE</th>
                            <th className="p-2">RESULT STATUS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#919283]/10">
                          {tankTests.map((test, index) => (
                            <tr key={index} className="hover:bg-surface-container/10">
                              <td className="p-2 font-bold text-[#e2e2da]">{test.testType || test.testStage}</td>
                              <td className="p-2">{test.conductedDate ? new Date(test.conductedDate).toLocaleDateString() : 'N/A'}</td>
                              <td className="p-2">{test.conductingOfficer || 'N/A'}</td>
                              <td className="p-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  test.testResult === 'Pass' ? 'bg-green-950 text-green-400 border border-green-800' :
                                  test.testResult === 'Fail' ? 'bg-red-950 text-red-400 border border-red-800' :
                                  'bg-amber-950 text-amber-400 border border-amber-800'
                                }`}>
                                  {test.testResult || 'In Progress'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-dark-grey italic">No testing or calibration events on record for this asset.</p>
                  )}
                </div>

                {/* 4. Financial Cost & Ledger */}
                <div>
                  <h4 className="text-khaki text-xs font-bold uppercase tracking-widest border-b border-[#919283]/20 pb-1 mb-3">
                    [ SECTION IV : MAINTENANCE LEDGER &amp; FINANCIAL EXPENDITURE ]
                  </h4>
                  {serviceHistory.length > 0 ? (
                    <div className="border border-[#919283]/20 rounded overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-khaki/10 text-khaki border-b border-[#919283]/20 font-bold">
                            <th className="p-2">DATE</th>
                            <th className="p-2">WORK TYPE</th>
                            <th className="p-2">DESCRIPTION</th>
                            <th className="p-2 text-right">EXPENDITURE</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#919283]/10">
                          {serviceHistory.map((history, idx) => (
                            <tr key={idx} className="hover:bg-surface-container/10">
                              <td className="p-2 text-dark-grey">{new Date(history.date).toLocaleDateString()}</td>
                              <td className="p-2 font-bold text-[#e2e2da]">{history.type}</td>
                              <td className="p-2 text-dark-grey">{history.description}</td>
                              <td className="p-2 text-right font-bold text-khaki">₹{history.cost?.toLocaleString() || '0'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-dark-grey italic">No individual ledger items on record.</p>
                  )}
                  <div className="mt-3 p-3 bg-[#12130e] border border-khaki/20 flex justify-between items-center text-xs">
                    <span className="text-dark-grey font-bold uppercase tracking-wider">AGGREGATE OVERHAUL EXPENDITURE:</span>
                    <span className="text-green-400 font-bold text-sm">₹{totalCost.toLocaleString()}</span>
                  </div>
                </div>

                {/* 5. Command Sign-off */}
                <div className="pt-6 grid grid-cols-3 gap-6 text-center text-xs mt-6 border-t border-[#919283]/20">
                  <div>
                    <div className="h-10 border-b border-[#919283]/40 w-48 mx-auto"></div>
                    <span className="text-[9px] text-dark-grey block mt-1 uppercase">PREPARED BY: WORKSHOP SUPERVISOR</span>
                  </div>
                  <div>
                    <div className="h-10 border-b border-[#919283]/40 w-48 mx-auto"></div>
                    <span className="text-[9px] text-dark-grey block mt-1 uppercase">REVIEWED BY: CHIEF ENGINEER</span>
                  </div>
                  <div>
                    <div className="h-10 border-b border-[#919283]/40 w-48 mx-auto"></div>
                    <span className="text-[9px] text-dark-grey block mt-1 uppercase">APPROVED BY: COMMANDING OFFICER</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-[#919283]/20 no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-[#919283]/40 hover:border-khaki text-xs transition-all uppercase flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-xs">print</span>
                  Print Document
                </button>
                <button
                  type="button"
                  onClick={() => setIsMinimalReportOpen(false)}
                  className="px-4 py-2 bg-khaki/10 border border-khaki/30 text-khaki hover:bg-khaki/20 text-xs transition-all uppercase"
                >
                  Close Report
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Form Modal - Add / Edit Tank */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#181912] border border-outline-variant/40 rounded w-full max-w-2xl p-8 shadow-2xl text-on-surface max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4 mb-6">
              <h3 className="font-headline-md text-xl font-bold text-primary uppercase">
                {formMode === 'add' ? 'Register New Tank' : 'Update Tank Parameters'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-on-surface hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">TANK ID (Unique)</label>
                  <input
                    type="text"
                    required
                    disabled={formMode === 'edit'}
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm disabled:opacity-50"
                    placeholder="e.g. TNK-10001"
                    value={formData.tankId}
                    onChange={(e) => setFormData({...formData, tankId: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">REGISTRATION NUMBER (Unique)</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    placeholder="e.g. ARJ-2026-101"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">TANK MODEL</label>
                  <select
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.tankModel}
                    onChange={(e) => setFormData({...formData, tankModel: e.target.value})}
                  >
                    <option value="T-72">T-72</option>
                    <option value="T-90">T-90</option>
                    <option value="T-72 Ajeya">T-72 Ajeya</option>
                    <option value="Arjun">Arjun</option>
                    <option value="Arjun MK1A">Arjun MK1A</option>
                    <option value="BMP-2 Sarath">BMP-2 Sarath</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">MANUFACTURER</label>
                  <input
                    type="text"
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">MANUFACTURING YEAR</label>
                  <input
                    type="number"
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.manufacturingYear}
                    onChange={(e) => setFormData({...formData, manufacturingYear: parseInt(e.target.value) || 2020})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">ENGINE NUMBER</label>
                  <input
                    type="text"
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.engineNumber}
                    onChange={(e) => setFormData({...formData, engineNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">CHASSIS NUMBER</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.chassisNumber}
                    onChange={(e) => setFormData({...formData, chassisNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">UNIT ASSIGNMENT</label>
                  <input
                    type="text"
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.unitAssignment}
                    onChange={(e) => setFormData({...formData, unitAssignment: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">CURRENT LOCATION</label>
                  <input
                    type="text"
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.currentLocation}
                    onChange={(e) => setFormData({...formData, currentLocation: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">OPERATIONAL STATUS</label>
                  <select
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.operationalStatus}
                    onChange={(e) => setFormData({...formData, operationalStatus: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Overhaul">Overhaul</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Decommissioned">Decommissioned</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">LAST SERVICE DATE</label>
                  <input
                    type="date"
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.lastServiceDate}
                    onChange={(e) => setFormData({...formData, lastServiceDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">NEXT SCHEDULED SERVICE</label>
                  <input
                    type="date"
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.nextScheduledService}
                    onChange={(e) => setFormData({...formData, nextScheduledService: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">INSPECTION / MAINTENANCE NOTES</label>
                <textarea
                  rows="3"
                  className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                  value={formData.maintenanceNotes}
                  onChange={(e) => setFormData({...formData, maintenanceNotes: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-outline-variant/40 hover:bg-outline-variant/10 text-on-surface text-xs font-bold rounded"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/95 text-on-primary text-xs font-bold rounded"
                >
                  SAVE RECORD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
