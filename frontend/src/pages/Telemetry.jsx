import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { api } from '../api'

export default function Telemetry() {
  const [tests, setTests] = useState([])
  const [tanks, setTanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('All')
  const [isCertificateOpen, setIsCertificateOpen] = useState(false)
  const [selectedTestForCertificate, setSelectedTestForCertificate] = useState(null)
  const [resultFilter, setResultFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('add') // 'add' | 'edit'
  const [formData, setFormData] = useState({
    tankId: '',
    tankNumber: '',
    testingSchedule: '',
    testingStage: 'Engine Bench Test',
    testResult: 'In Progress',
    assignedOfficer: '',
    completionDate: ''
  })

  // Role authentication
  const user = JSON.parse(localStorage.getItem('kavachUser')) || { role: 'User' }
  const isAdmin = user.role === 'Admin'

  const fetchTestData = async () => {
    try {
      setLoading(true)
      const [testData, tankData] = await Promise.all([
        api.getTesting(),
        api.getTanks()
      ])
      setTests(testData)
      setTanks(tankData)
    } catch (err) {
      setError('Failed to fetch testing records: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTestData()
  }, [])

  const handleOpenAddForm = () => {
    setFormMode('add')
    setFormData({
      tankId: tanks[0]?._id || '',
      tankNumber: tanks[0]?.registrationNumber || '',
      testingSchedule: new Date().toISOString().split('T')[0],
      testingStage: 'Engine Bench Test',
      testResult: 'In Progress',
      assignedOfficer: 'Lt. Col. Rajat Sharma',
      completionDate: ''
    })
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (test) => {
    setFormMode('edit')
    setFormData({
      ...test,
      testingSchedule: test.testingSchedule ? new Date(test.testingSchedule).toISOString().split('T')[0] : '',
      completionDate: test.completionDate ? new Date(test.completionDate).toISOString().split('T')[0] : '',
    })
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    try {
      // Find tank registration number based on selected tankId
      const targetTank = tanks.find(t => t._id === formData.tankId)
      const submissionData = {
        ...formData,
        tankNumber: targetTank ? targetTank.registrationNumber : formData.tankNumber
      }

      if (formMode === 'add') {
        await api.createTesting(submissionData)
      } else {
        await api.updateTesting(formData._id, submissionData)
      }
      setIsFormOpen(false)
      fetchTestData()
    } catch (err) {
      alert('Error saving test record: ' + err.message)
    }
  }

  const handleDeleteTest = async (id) => {
    if (window.confirm('Are you sure you want to delete this testing record?')) {
      try {
        await api.deleteTesting(id)
        fetchTestData()
      } catch (err) {
        alert('Error deleting test record: ' + err.message)
      }
    }
  }

  // Filter & Search Logic
  const filteredTests = tests.filter(test => {
    const matchesSearch = 
      (test.tankNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (test.assignedOfficer || '').toLowerCase().includes(search.toLowerCase()) ||
      (test.testingStage || '').toLowerCase().includes(search.toLowerCase())
    const matchesStage = stageFilter === 'All' || test.testingStage === stageFilter
    const matchesResult = resultFilter === 'All' || test.testResult === resultFilter
    return matchesSearch && matchesStage && matchesResult
  })

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTests = filteredTests.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredTests.length / itemsPerPage)

  const getResultBadgeClass = (result) => {
    switch (result) {
      case 'Pass': return 'bg-green-500/10 text-green-400 border border-green-500/30'
      case 'Fail': return 'bg-red-500/10 text-red-400 border border-red-500/30'
      case 'In Progress': return 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
      default: return 'bg-outline-variant/20 text-on-surface-variant'
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen md:h-screen w-full relative bg-background text-on-surface font-body-base overflow-x-hidden md:overflow-hidden">
      <style>{`
        .tactical-glass { background:rgba(32,32,27,0.6); backdrop-filter:blur(12px); border:1px solid rgba(145,146,131,0.2); }
        .neon-glow-green { box-shadow:0 0 8px rgba(195,204,140,0.3); }
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
          main, main * { visibility: visible; }
          main {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            background: white !important;
            color: black !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
      
      {/* Side Navigation */}
      <Sidebar className="no-print" />

      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-surface-dim min-w-0 pt-14 md:pt-0">
        {/* Top App Bar */}
        <header className="bg-surface-container/60 backdrop-blur-xl border-b border-outline-variant/30 min-h-16 py-3 md:py-0 flex flex-wrap md:flex-nowrap items-center justify-between px-4 sm:px-6 md:px-8 gap-3 z-30 shadow-lg shadow-primary/5 no-print">
          <div className="flex items-center gap-3 sm:gap-6">
            <h2 className="font-headline-md text-base sm:text-lg md:text-headline-md font-bold uppercase tracking-wider text-primary">Tanks Testing &amp; Trials</h2>
          </div>
          <div>
            {isAdmin && (
              <button
                onClick={handleOpenAddForm}
                className="bg-primary hover:bg-primary/95 text-on-primary font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm text-xs tracking-widest flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">science</span>
                SCHEDULE NEW TEST
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 no-print max-w-full">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* KPI Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'TOTAL TESTS CONDUCTED', val: tests.length, color: 'text-primary' },
                { label: 'PASSED TRIALS', val: tests.filter(t => t.testResult === 'Pass').length, color: 'text-[#00ff41]' },
                { label: 'FAILED TRIALS', val: tests.filter(t => t.testResult === 'Fail').length, color: 'text-red-400' },
                { label: 'UNDER TESTING', val: tests.filter(t => t.testResult === 'In Progress').length, color: 'text-amber-400' }
              ].map(card => (
                <div key={card.label} className="tactical-glass p-4 rounded border border-outline-variant/20">
                  <p className="font-label-caps text-[10px] text-on-surface-variant tracking-wider">{card.label}</p>
                  <h3 className={`font-headline-md text-2xl font-bold mt-1 ${card.color}`}>{card.val}</h3>
                </div>
              ))}
            </div>

            {/* Filter controls */}
            <div className="tactical-glass p-4 rounded border border-outline-variant/20 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline/50">search</span>
                <input
                  type="text"
                  placeholder="Search Tank Number, Officer, Stage..."
                  className="bg-surface-container-highest/60 border-none text-on-surface font-body-base text-xs pl-10 pr-4 py-2 w-full focus:ring-1 focus:ring-primary rounded-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-label-caps text-on-surface-variant">STAGE:</span>
                  <select
                    className="bg-surface-container-highest/60 border-none text-on-surface text-xs rounded-sm focus:ring-1 focus:ring-primary py-1 px-3"
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                  >
                    <option value="All">All Stages</option>
                    <option value="Engine Bench Test">Engine Bench Test</option>
                    <option value="Transmission Load Test">Transmission Load Test</option>
                    <option value="Armor Integrity Scan">Armor Integrity Scan</option>
                    <option value="Weapon Systems Calibration">Weapon Systems Calibration</option>
                    <option value="Suspension Stress Test">Suspension Stress Test</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-label-caps text-on-surface-variant">RESULT:</span>
                  <select
                    className="bg-surface-container-highest/60 border-none text-on-surface text-xs rounded-sm focus:ring-1 focus:ring-primary py-1 px-3"
                    value={resultFilter}
                    onChange={(e) => setResultFilter(e.target.value)}
                  >
                    <option value="All">All Results</option>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Testing Records Table */}
            <div className="md:hidden flex items-center gap-2 text-[11px] text-primary/90 font-label-caps bg-primary/10 border border-primary/30 p-2 rounded">
              <span className="material-symbols-outlined text-sm animate-pulse">swipe</span>
              <span>SWIPE HORIZONTALLY TO VIEW ALL TEST TRIAL RECORDS &rarr;</span>
            </div>
            <div className="tactical-glass rounded border border-outline-variant/20 overflow-x-auto touch-scroll mobile-swipe-container custom-scrollbar w-full">
              {loading ? (
                <div className="p-8 text-center text-primary animate-pulse">Running Secure Trial System Diagnostics...</div>
              ) : (
                <table className="w-full min-w-[800px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high/80 border-b border-outline-variant/30 text-on-surface-variant font-label-caps text-[10px]">
                      <th className="p-4">Tank Number</th>
                      <th className="p-4">Testing Stage</th>
                      <th className="p-4">Schedule Date</th>
                      <th className="p-4">Test Result</th>
                      <th className="p-4">Assigned Officer</th>
                      <th className="p-4">Completion Date</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {currentTests.map((test) => (
                      <tr key={test._id} className="hover:bg-primary/5 transition-colors">
                        <td className="p-4 font-mono text-primary font-bold">{test.tankNumber}</td>
                        <td className="p-4 font-bold">{test.testingStage}</td>
                        <td className="p-4 font-mono">{new Date(test.testingSchedule).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getResultBadgeClass(test.testResult)}`}>
                            {test.testResult}
                          </span>
                        </td>
                        <td className="p-4">{test.assignedOfficer}</td>
                        <td className="p-4 font-mono">{test.completionDate ? new Date(test.completionDate).toLocaleDateString() : 'Pending'}</td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* <button
                              onClick={() => {
                                setSelectedTestForCertificate(test);
                                setIsCertificateOpen(true);
                              }}
                              className="p-1 hover:text-khaki transition-colors"
                              title="Print Trial Certificate"
                            >
                              <span className="material-symbols-outlined text-base text-khaki">contact_page</span>
                            </button> */}
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => handleOpenEditForm(test)}
                                  className="p-1 hover:text-secondary transition-colors"
                                  title="Edit Test Log"
                                >
                                  <span className="material-symbols-outlined text-base">edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteTest(test._id)}
                                  className="p-1 hover:text-error transition-colors"
                                  title="Delete Test Log"
                                >
                                  <span className="material-symbols-outlined text-base">delete</span>
                                </button>
                              </>
                            )}
                            {!isAdmin && (
                              <span className="text-[10px] text-outline font-mono">View Only</span>
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
                <span className="text-on-surface-variant font-mono">Showing {currentTests.length} of {filteredTests.length} trials</span>
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

      {/* Test Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#181912] border border-outline-variant/40 rounded w-full max-w-lg p-8 shadow-2xl text-on-surface">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4 mb-6">
              <h3 className="font-headline-md text-xl font-bold text-primary uppercase">
                {formMode === 'add' ? 'Schedule New Tactical Test' : 'Modify Test Log'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-on-surface hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">SELECT TARGET TANK</label>
                <select
                  required
                  className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                  value={formData.tankId}
                  onChange={(e) => setFormData({...formData, tankId: e.target.value})}
                >
                  {tanks.map(t => (
                    <option key={t._id} value={t._id}>{t.tankId} // {t.registrationNumber} ({t.tankModel})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">TESTING STAGE</label>
                  <select
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.testingStage}
                    onChange={(e) => setFormData({...formData, testingStage: e.target.value})}
                  >
                    <option value="Engine Bench Test">Engine Bench Test</option>
                    <option value="Transmission Load Test">Transmission Load Test</option>
                    <option value="Armor Integrity Scan">Armor Integrity Scan</option>
                    <option value="Weapon Systems Calibration">Weapon Systems Calibration</option>
                    <option value="Suspension Stress Test">Suspension Stress Test</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">TEST RESULT</label>
                  <select
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.testResult}
                    onChange={(e) => setFormData({...formData, testResult: e.target.value})}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">SCHEDULE DATE</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.testingSchedule}
                    onChange={(e) => setFormData({...formData, testingSchedule: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">COMPLETION DATE (Optional)</label>
                  <input
                    type="date"
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.completionDate}
                    onChange={(e) => setFormData({...formData, completionDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">ASSIGNED TESTING OFFICER</label>
                <input
                  type="text"
                  required
                  className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                  placeholder="e.g. Lt. Col. Rajat Sharma"
                  value={formData.assignedOfficer}
                  onChange={(e) => setFormData({...formData, assignedOfficer: e.target.value})}
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

      {/* Modal - Military Trial & System Calibration Record Certificate */}
      {isCertificateOpen && selectedTestForCertificate && (
        <div className="fixed inset-0 bg-[#0d0e0a]/90 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto report-modal-backdrop">
          <div id="printable-report" className="bg-[#191a14] border border-[#919283]/30 rounded w-full max-w-2xl p-8 my-8 shadow-2xl text-[#e2e2da] font-mono relative">
            
            {/* Top Security Header */}
            <div className="flex justify-between items-start border-b-2 border-khaki pb-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-khaki mb-1">
                  <span className="material-symbols-outlined">shield</span>
                  <span className="text-xs font-bold uppercase tracking-widest">RESTRICTED // TECHNICAL DATA</span>
                </div>
                <h3 className="text-lg font-bold uppercase tracking-wider text-[#e2e2da]">MILITARY TRIAL &amp; CALIBRATION RECORD</h3>
                <p className="text-[10px] text-dark-grey uppercase mt-0.5">GENERATED SECURELY BY KAVACH DIAGNOSTIC SYSTEM // {new Date().toLocaleString()}</p>
              </div>
              <div className="text-right">
                <div className="text-[10px] bg-amber-950/40 text-amber-400 border border-amber-950 px-2 py-0.5 rounded font-bold inline-block mb-1">
                  OFFICIAL USE ONLY
                </div>
                <p className="text-[10px] text-dark-grey">LOG REF ID: KAVACH-TRIAL-{selectedTestForCertificate._id}</p>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="space-y-6">
              
              {/* 1. Combat Asset Identity */}
              <div>
                <h4 className="text-khaki text-xs font-bold uppercase tracking-widest border-b border-[#919283]/20 pb-1 mb-3">
                  [ SECTION I : COMBAT ASSET DATA ]
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-dark-grey block">COMBAT ASSET ID</span>
                    <span className="font-bold text-[#e2e2da]">{selectedTestForCertificate.tankId || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-grey block">REGISTRATION NO</span>
                    <span className="font-bold text-[#e2e2da]">{selectedTestForCertificate.tankNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Trial Parameters */}
              <div>
                <h4 className="text-khaki text-xs font-bold uppercase tracking-widest border-b border-[#919283]/20 pb-1 mb-3">
                  [ SECTION II : TRIAL &amp; CALIBRATION PARAMETERS ]
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-dark-grey block">TRIAL TYPE / STAGE</span>
                    <span className="font-bold text-khaki">{selectedTestForCertificate.testingStage}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-grey block">TEST OFFICER IN CHARGE</span>
                    <span className="font-bold text-[#e2e2da]">{selectedTestForCertificate.assignedOfficer}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-grey block">TRIAL SCHEDULE DATE</span>
                    <span className="font-bold text-[#e2e2da]">{selectedTestForCertificate.testingSchedule ? new Date(selectedTestForCertificate.testingSchedule).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-grey block">TRIAL COMPLETION DATE</span>
                    <span className="font-bold text-[#e2e2da]">{selectedTestForCertificate.completionDate ? new Date(selectedTestForCertificate.completionDate).toLocaleDateString() : 'PENDING'}</span>
                  </div>
                </div>
              </div>

              {/* 3. Performance Results & Verdict */}
              <div>
                <h4 className="text-khaki text-xs font-bold uppercase tracking-widest border-b border-[#919283]/20 pb-1 mb-3">
                  [ SECTION III : DIAGNOSTIC VERDICT ]
                </h4>
                <div className="bg-[#12130e] border border-khaki/20 p-4 rounded-sm flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-dark-grey block mb-0.5">CALIBRATION RESULTS STATUS:</span>
                    <span className={`font-bold uppercase ${
                      selectedTestForCertificate.testResult === 'Pass' ? 'text-green-400' :
                      selectedTestForCertificate.testResult === 'Fail' ? 'text-red-400' :
                      'text-amber-400'
                    }`}>
                      {selectedTestForCertificate.testResult}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded text-[10px] font-bold border ${
                    selectedTestForCertificate.testResult === 'Pass' ? 'text-green-400 bg-green-950/40 border-green-800' :
                    selectedTestForCertificate.testResult === 'Fail' ? 'text-red-400 bg-red-950/40 border-red-800' :
                    'text-amber-400 bg-amber-950/40 border-amber-800'
                  }`}>
                    {selectedTestForCertificate.testResult === 'Pass' ? 'STATUS: NOMINAL' : (selectedTestForCertificate.testResult === 'Fail' ? 'STATUS: DEFECTIVE' : 'STATUS: PENDING')}
                  </span>
                </div>
                <div className="mt-3 p-3 bg-[#12130e] border border-[#919283]/15 rounded-sm">
                  <p className="text-xs italic text-[#e2e2da] leading-relaxed">
                    {selectedTestForCertificate.testResult === 'Pass' ? 
                      'Verdict: The combat vehicle has successfully cleared all parameters for this milestone. Calibration tolerances conform to Indian Army Workshop regulations. Clear for deployment.' : 
                      (selectedTestForCertificate.testResult === 'Fail' ? 
                        'Verdict: Critical malfunction or variance outside of acceptable bounds detected. Asset fails to pass technical standards. Maintenance and re-calibration mandated.' : 
                        'Verdict: Test is currently in progress. Complete system diagnostics and data stream telemetry verification are undergoing officer validation.')}
                  </p>
                </div>
              </div>

              {/* 4. Command Sign-off */}
              <div className="pt-6 grid grid-cols-3 gap-6 text-center text-xs mt-6 border-t border-[#919283]/20">
                <div>
                  <div className="h-10 border-b border-[#919283]/40 w-48 mx-auto"></div>
                  <span className="text-[9px] text-dark-grey block mt-1 uppercase">PREPARED BY: DIAGNOSTIC ENGINEER</span>
                </div>
                <div>
                  <div className="h-10 border-b border-[#919283]/40 w-48 mx-auto"></div>
                  <span className="text-[9px] text-dark-grey block mt-1 uppercase">VERIFIED BY: TELEMETRY LEAD</span>
                </div>
                <div>
                  <div className="h-10 border-b border-[#919283]/40 w-48 mx-auto"></div>
                  <span className="text-[9px] text-dark-grey block mt-1 uppercase">APPROVED BY: TRIAL COMMANDER</span>
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
                Print Trial Certificate
              </button>
              <button
                type="button"
                onClick={() => setIsCertificateOpen(false)}
                className="px-4 py-2 bg-khaki/10 border border-khaki/30 text-khaki hover:bg-khaki/20 text-xs transition-all uppercase"
              >
                Close Certificate
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
