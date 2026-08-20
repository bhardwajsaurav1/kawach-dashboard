import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { api } from '../api'

export default function Frontline() {
  const [workforce, setWorkforce] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Search & Filter State
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [attendanceFilter, setAttendanceFilter] = useState('All')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [sortField, setSortField] = useState('employeeId')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('add') // 'add' | 'edit'
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [selectedWorkerForReport, setSelectedWorkerForReport] = useState(null)
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    department: 'Engine Bay',
    designation: 'Technician',
    trade: 'Mechanic',
    skillLevel: 'Senior',
    experience: 5,
    shift: 'Morning',
    supervisor: 'Col. Sandeep Mehta',
    contactNumber: '',
    email: '',
    availability: 'Available',
    attendanceStatus: 'Present',
    checkInTime: '08:30',
    checkOutTime: '17:30',
    totalWorkingHours: 9,
    remarks: ''
  })

  // Role authentication
  const user = JSON.parse(localStorage.getItem('kavachUser')) || { role: 'User' }
  const isAdmin = user.role === 'Admin'

  const fetchWorkforce = async () => {
    try {
      setLoading(true)
      const data = await api.getWorkforce()
      setWorkforce(data)
    } catch (err) {
      setError('Failed to fetch workforce data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkforce()
  }, [])

  const handleOpenAddForm = () => {
    setFormMode('add')
    setFormData({
      employeeId: '',
      name: '',
      department: 'Engine Bay',
      designation: 'Technician',
      trade: 'Mechanic',
      skillLevel: 'Senior',
      experience: 5,
      shift: 'Morning',
      supervisor: 'Col. Sandeep Mehta',
      contactNumber: '',
      email: '',
      availability: 'Available',
      attendanceStatus: 'Present',
      checkInTime: '08:30',
      checkOutTime: '17:30',
      totalWorkingHours: 9,
      remarks: ''
    })
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (worker) => {
    setFormMode('edit')
    setFormData({ ...worker })
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    try {
      if (formMode === 'add') {
        await api.createWorkforce(formData)
      } else {
        await api.updateWorkforce(formData._id, formData)
      }
      setIsFormOpen(false)
      fetchWorkforce()
    } catch (err) {
      alert('Error saving workforce data: ' + err.message)
    }
  }

  const handleDeleteWorker = async (id) => {
    if (window.confirm('Are you sure you want to remove this employee from the workforce database?')) {
      try {
        await api.deleteWorkforce(id)
        fetchWorkforce()
      } catch (err) {
        alert('Error removing employee: ' + err.message)
      }
    }
  }

  // Attendance quick switch
  const handleQuickAttendanceUpdate = async (worker, status) => {
    if (!isAdmin) return
    try {
      const checkIn = status === 'Present' ? '08:30' : ''
      const checkOut = status === 'Present' ? '17:30' : ''
      const hrs = status === 'Present' ? 9 : 0
      await api.updateWorkforce(worker._id, {
        ...worker,
        attendanceStatus: status,
        checkInTime: checkIn,
        checkOutTime: checkOut,
        totalWorkingHours: hrs
      })
      fetchWorkforce()
    } catch (err) {
      alert('Error updating attendance: ' + err.message)
    }
  }

  // Calculations
  const totalCount = workforce.length
  const presentCount = workforce.filter(w => w.attendanceStatus === 'Present').length
  const absentCount = workforce.filter(w => w.attendanceStatus === 'Absent').length
  const leaveCount = workforce.filter(w => w.attendanceStatus === 'On Leave').length
  const attendanceRate = totalCount ? ((presentCount / totalCount) * 100).toFixed(1) : 0
  const leaveRate = totalCount ? ((leaveCount / totalCount) * 100).toFixed(1) : 0

  // Filter & Search
  const filteredWorkforce = workforce.filter(worker => {
    const matchesSearch = 
      (worker.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (worker.employeeId || '').toLowerCase().includes(search.toLowerCase()) ||
      (worker.designation || '').toLowerCase().includes(search.toLowerCase())
    const matchesDept = deptFilter === 'All' || worker.department === deptFilter
    const matchesAttendance = attendanceFilter === 'All' || worker.attendanceStatus === attendanceFilter
    return matchesSearch && matchesDept && matchesAttendance
  })

  // Sort
  const sortedWorkforce = [...filteredWorkforce].sort((a, b) => {
    const valA = a[sortField] || ''
    const valB = b[sortField] || ''
    if (typeof valA === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
    }
    return sortOrder === 'asc' ? valA - valB : valB - valA
  })

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentWorkforce = sortedWorkforce.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedWorkforce.length / itemsPerPage)

  return (
    <div className="flex flex-col md:flex-row min-h-screen md:h-screen w-full relative bg-background text-on-surface font-body-base overflow-x-hidden md:overflow-hidden">
      <style>{`
        .tactical-glass { background:rgba(32,32,27,0.6); backdrop-filter:blur(12px); border:1px solid rgba(145,146,131,0.2); }
        .neon-glow-green { box-shadow:0 0 8px rgba(195,204,140,0.3); }
        .neon-glow-amber { box-shadow:0 0 8px rgba(214,198,146,0.3); }
        .neon-glow-red { box-shadow:0 0 8px rgba(255,180,171,0.3); }
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
            <h2 className="font-headline-md text-base sm:text-lg md:text-headline-md font-bold uppercase tracking-wider text-primary">Workforce &amp; Attendance</h2>
          </div>
          <div>
            {isAdmin && (
              <button
                onClick={handleOpenAddForm}
                className="bg-primary hover:bg-primary/95 text-on-primary font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm text-xs tracking-widest flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                ENLIST WORKER
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 no-print max-w-full">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {[
                { label: 'TOTAL WORKFORCE', value: totalCount, sub: 'Enlisted Personnel', color: 'text-primary' },
                { label: 'PRESENT TODAY', value: presentCount, sub: `${attendanceRate}% Attendance`, color: 'text-[#00ff41]' },
                { label: 'ABSENT TODAY', value: absentCount, sub: 'Action Required', color: 'text-red-400' },
                { label: 'ON LEAVE', value: leaveCount, sub: `${leaveRate}% Off-duty`, color: 'text-amber-400' },
                { label: 'ATTENDANCE RATE', value: `${attendanceRate}%`, sub: 'Target: >90%', color: 'text-cyan-400' },
                { label: 'LEAVE RATE', value: `${leaveRate}%`, sub: 'Target: <10%', color: 'text-purple-400' }
              ].map(card => (
                <div key={card.label} className="tactical-glass p-4 rounded border border-outline-variant/20">
                  <p className="font-label-caps text-[9px] text-on-surface-variant tracking-wider">{card.label}</p>
                  <h3 className={`font-headline-md text-2xl font-bold mt-1 ${card.color}`}>{card.value}</h3>
                  <p className="text-[10px] text-outline font-mono mt-1">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Filter controls */}
            <div className="tactical-glass p-4 rounded border border-outline-variant/20 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline/50">search</span>
                  <input
                    type="text"
                    placeholder="Search ID, Name, Designation..."
                    className="bg-surface-container-highest/60 border-none text-on-surface font-body-base text-xs pl-10 pr-4 py-2 w-full focus:ring-1 focus:ring-primary rounded-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-label-caps text-on-surface-variant">DEPT:</span>
                  <select
                    className="bg-surface-container-highest/60 border-none text-on-surface text-xs rounded-sm focus:ring-1 focus:ring-primary py-1 px-3"
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                  >
                    <option value="All">All Departments</option>
                    <option value="Engine Bay">Engine Bay</option>
                    <option value="Avionics">Avionics</option>
                    <option value="Transmission">Transmission</option>
                    <option value="Weapon Systems">Weapon Systems</option>
                    <option value="Armor">Armor</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-label-caps text-on-surface-variant">ATTENDANCE:</span>
                  <select
                    className="bg-surface-container-highest/60 border-none text-on-surface text-xs rounded-sm focus:ring-1 focus:ring-primary py-1.5 px-3"
                    value={attendanceFilter}
                    onChange={(e) => setAttendanceFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-label-caps text-on-surface-variant">DATE:</span>
                <input
                  type="date"
                  className="bg-surface-container-highest/60 border-none text-on-surface text-xs rounded-sm focus:ring-1 focus:ring-primary py-1 px-3"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            {/* Workforce Table */}
            <div className="md:hidden flex items-center gap-2 text-[11px] text-primary/90 font-label-caps bg-primary/10 border border-primary/30 p-2 rounded">
              <span className="material-symbols-outlined text-sm animate-pulse">swipe</span>
              <span>SWIPE HORIZONTALLY TO VIEW ALL WORKFORCE RECORDS &rarr;</span>
            </div>
            <div className="tactical-glass rounded border border-outline-variant/20 overflow-x-auto touch-scroll mobile-swipe-container custom-scrollbar w-full">
              {loading ? (
                <div className="p-8 text-center text-primary animate-pulse">Synchronizing Workforce Records...</div>
              ) : (
                <table className="w-full min-w-[850px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high/80 border-b border-outline-variant/30 text-on-surface-variant font-label-caps text-[10px]">
                      <th className="p-4 cursor-pointer hover:text-primary" onClick={() => { setSortField('employeeId'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>Employee ID ↕</th>
                      <th className="p-4 cursor-pointer hover:text-primary" onClick={() => { setSortField('name'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>Name ↕</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Designation</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Check-In</th>
                      <th className="p-4 text-center">Check-Out</th>
                      <th className="p-4 text-center font-mono">Working Hours</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {currentWorkforce.map((worker) => (
                      <tr key={worker._id} className="hover:bg-primary/5 transition-colors">
                        <td className="p-4 font-mono text-primary font-bold">{worker.employeeId}</td>
                        <td className="p-4 font-bold">{worker.name}</td>
                        <td className="p-4">{worker.department}</td>
                        <td className="p-4">{worker.designation || worker.trade}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            worker.attendanceStatus === 'Present' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                            worker.attendanceStatus === 'Absent' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}>
                            {worker.attendanceStatus}
                          </span>
                        </td>
                        <td className="p-4 text-center font-mono text-on-surface-variant">{worker.checkInTime || '--:--'}</td>
                        <td className="p-4 text-center font-mono text-on-surface-variant">{worker.checkOutTime || '--:--'}</td>
                        <td className="p-4 text-center font-mono font-bold text-primary">{worker.totalWorkingHours || 0} hrs</td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedWorkerForReport(worker);
                                setIsReportOpen(true);
                              }}
                              className="p-1 hover:text-khaki transition-colors"
                              title="Worker Tactical Report"
                            >
                              <span className="material-symbols-outlined text-base text-khaki">contact_page</span>
                            </button>
                            {isAdmin && (
                              <>
                                {/* Quick status toggles */}
                                <button
                                  onClick={() => handleQuickAttendanceUpdate(worker, 'Present')}
                                  className="p-1 hover:text-green-400 transition-colors"
                                  title="Mark Present"
                                >
                                  <span className="material-symbols-outlined text-base">check_circle</span>
                                </button>
                                <button
                                  onClick={() => handleQuickAttendanceUpdate(worker, 'Absent')}
                                  className="p-1 hover:text-red-400 transition-colors"
                                  title="Mark Absent"
                                >
                                  <span className="material-symbols-outlined text-base">cancel</span>
                                </button>
                                <button
                                  onClick={() => handleOpenEditForm(worker)}
                                  className="p-1 hover:text-secondary transition-colors"
                                  title="Edit Worker Profile"
                                >
                                  <span className="material-symbols-outlined text-base">edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteWorker(worker._id)}
                                  className="p-1 hover:text-error transition-colors"
                                  title="Decommission/Delete"
                                >
                                  <span className="material-symbols-outlined text-base">person_remove</span>
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
                <span className="text-on-surface-variant font-mono">Showing {currentWorkforce.length} of {sortedWorkforce.length} personnel</span>
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

      {/* Worker Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#181912] border border-outline-variant/40 rounded w-full max-w-xl p-8 shadow-2xl text-on-surface">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4 mb-6">
              <h3 className="font-headline-md text-xl font-bold text-primary uppercase">
                {formMode === 'add' ? 'Enlist New Workshop Worker' : 'Update Worker Parameters'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-on-surface hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">EMPLOYEE ID</label>
                  <input
                    type="text"
                    required
                    disabled={formMode === 'edit'}
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm disabled:opacity-50"
                    placeholder="e.g. WF-101"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">FULL NAME</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">DEPARTMENT</label>
                  <select
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                  >
                    <option value="Engine Bay">Engine Bay</option>
                    <option value="Avionics">Avionics</option>
                    <option value="Transmission">Transmission</option>
                    <option value="Weapon Systems">Weapon Systems</option>
                    <option value="Armor">Armor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">DESIGNATION</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    placeholder="e.g. Senior Technician"
                    value={formData.designation}
                    onChange={(e) => setFormData({...formData, designation: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">ATTENDANCE STATUS</label>
                  <select
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.attendanceStatus}
                    onChange={(e) => {
                      const status = e.target.value
                      const inTime = status === 'Present' ? '08:30' : ''
                      const outTime = status === 'Present' ? '17:30' : ''
                      const hrs = status === 'Present' ? 9 : 0
                      setFormData({...formData, attendanceStatus: status, checkInTime: inTime, checkOutTime: outTime, totalWorkingHours: hrs})
                    }}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">CHECK-IN TIME</label>
                  <input
                    type="text"
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    placeholder="08:30"
                    value={formData.checkInTime}
                    onChange={(e) => setFormData({...formData, checkInTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">CHECK-OUT TIME</label>
                  <input
                    type="text"
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    placeholder="17:30"
                    value={formData.checkOutTime}
                    onChange={(e) => setFormData({...formData, checkOutTime: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">TOTAL HOURS WORKED</label>
                  <input
                    type="number"
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.totalWorkingHours}
                    onChange={(e) => setFormData({...formData, totalWorkingHours: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">CONTACT NUMBER</label>
                  <input
                    type="text"
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  />
                </div>
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

      {/* Modal - Formal Worker Dossier & Profile Report */}
      {isReportOpen && selectedWorkerForReport && (
        <div className="fixed inset-0 bg-[#0d0e0a]/90 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto report-modal-backdrop">
          <div id="printable-report" className="bg-[#191a14] border border-[#919283]/30 rounded w-full max-w-3xl p-8 my-8 shadow-2xl text-[#e2e2da] font-mono relative">
            
            {/* Top Security Header */}
            <div className="flex justify-between items-start border-b-2 border-khaki pb-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-khaki mb-1">
                  <span className="material-symbols-outlined">shield</span>
                  <span className="text-xs font-bold uppercase tracking-widest">SECRET // CLASSIFIED DOCUMENT</span>
                </div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-[#e2e2da]">MILITARY OVERHAUL CENTRE // PERSONNEL DOSSIER</h3>
                <p className="text-[10px] text-dark-grey uppercase mt-0.5">GENERATED SECURELY BY KAVACH WORKFORCE REGISTRY // {new Date().toLocaleString()}</p>
              </div>
              <div className="text-right">
                <div className="text-[10px] bg-red-950/40 text-red-400 border border-red-950 px-2 py-0.5 rounded font-bold inline-block mb-1">
                  FOR OFFICIAL USE ONLY
                </div>
                <p className="text-[10px] text-dark-grey">REF ID: KAVACH-WF-{selectedWorkerForReport.employeeId}</p>
              </div>
            </div>

            {/* Report Body */}
            <div className="space-y-6">
              
              {/* 1. General Info & Professional Profile */}
              <div>
                <h4 className="text-khaki text-xs font-bold uppercase tracking-widest border-b border-[#919283]/20 pb-1 mb-3">
                  [ SECTION I : PROFESSIONAL PROFILE ]
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-dark-grey block">EMPLOYEE ID</span>
                    <span className="font-bold text-[#e2e2da]">{selectedWorkerForReport.employeeId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-grey block">FULL NAME</span>
                    <span className="font-bold text-[#e2e2da]">{selectedWorkerForReport.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-grey block">DESIGNATION</span>
                    <span className="font-bold text-[#e2e2da]">{selectedWorkerForReport.designation}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-grey block">DEPARTMENT</span>
                    <span className="font-bold text-[#e2e2da]">{selectedWorkerForReport.department}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-grey block">TRADE / SPECIALIZATION</span>
                    <span className="font-bold text-[#e2e2da]">{selectedWorkerForReport.trade || 'Mechanic'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-grey block">SKILL RATING</span>
                    <span className="font-bold text-khaki">{selectedWorkerForReport.skillLevel || 'Senior'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-grey block">EXPERIENCE</span>
                    <span className="font-bold text-khaki">{selectedWorkerForReport.experience || 0} YEARS</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-grey block">JOINING DATE</span>
                    <span className="font-bold text-[#e2e2da]">{selectedWorkerForReport.joiningDate ? new Date(selectedWorkerForReport.joiningDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-dark-grey block">CONTACT NUMBER</span>
                    <span className="font-bold text-[#e2e2da]">{selectedWorkerForReport.contactNumber || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-dark-grey block">EMAIL ADDRESS</span>
                    <span className="font-bold text-[#e2e2da]">{selectedWorkerForReport.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Daily Operations & Attendance */}
              <div>
                <h4 className="text-khaki text-xs font-bold uppercase tracking-widest border-b border-[#919283]/20 pb-1 mb-3">
                  [ SECTION II : OPERATIONS &amp; ATTENDANCE ]
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-dark-grey block">SUPERVISOR</span>
                    <span className="font-bold text-[#e2e2da]">{selectedWorkerForReport.supervisor || 'Col. Sandeep Mehta'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-grey block">ASSIGNED WORKSHOP</span>
                    <span className="font-bold text-[#e2e2da]">{selectedWorkerForReport.assignedWorkshop || 'Workshop 1'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-grey block">SHIFT ASSIGNMENT</span>
                    <span className="font-bold text-[#e2e2da]">{selectedWorkerForReport.shift || 'Morning'} Shift</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-grey block">AVAILABILITY STATUS</span>
                    <span className={`font-bold ${selectedWorkerForReport.availability === 'Available' ? 'text-green-400' : 'text-amber-400'}`}>
                      {selectedWorkerForReport.availability || 'Available'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-grey block">TODAY ATTENDANCE</span>
                    <span className={`font-bold ${
                      selectedWorkerForReport.attendanceStatus === 'Present' ? 'text-green-400' :
                      selectedWorkerForReport.attendanceStatus === 'Absent' ? 'text-red-400' :
                      'text-amber-400'
                    }`}>
                      {selectedWorkerForReport.attendanceStatus || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-grey block">CHECK-IN TIME</span>
                    <span className="font-bold text-[#e2e2da]">{selectedWorkerForReport.checkInTime || '--:--'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-grey block">CHECK-OUT TIME</span>
                    <span className="font-bold text-[#e2e2da]">{selectedWorkerForReport.checkOutTime || '--:--'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-grey block">HOURS LOGGED</span>
                    <span className="font-bold text-khaki">{selectedWorkerForReport.totalWorkingHours || 0} HRS</span>
                  </div>
                </div>
              </div>

              {/* 3. Operational Assignment status */}
              <div>
                <h4 className="text-khaki text-xs font-bold uppercase tracking-widest border-b border-[#919283]/20 pb-1 mb-3">
                  [ SECTION III : OPERATIONAL ALLOCATION ]
                </h4>
                {selectedWorkerForReport.currentAssignment ? (
                  <div className="bg-[#12130e] border border-khaki/20 p-4 rounded-sm flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-dark-grey block mb-0.5">CURRENTLY ASSIGNED ASSET:</span>
                      <span className="font-bold text-[#e2e2da]">
                        {selectedWorkerForReport.currentAssignment.tankModel || 'Tank'} ({selectedWorkerForReport.currentAssignment.registrationNumber})
                      </span>
                    </div>
                    <span className="text-green-400 bg-green-950/40 border border-green-800 px-3 py-1 rounded text-[10px] font-bold">
                      ACTIVE ALLOCATION
                    </span>
                  </div>
                ) : (
                  <div className="bg-[#12130e] border border-[#919283]/15 p-4 rounded-sm flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-dark-grey block mb-0.5 font-bold text-amber-400">UNASSIGNED / STANDBY</span>
                      <span className="text-dark-grey text-[10px]">Ready for assignment to maintenance pipelines or engine overhaul lines.</span>
                    </div>
                    <span className="text-amber-400 bg-amber-950/40 border border-amber-800 px-3 py-1 rounded text-[10px] font-bold">
                      BENCH / ACTIVE STANDBY
                    </span>
                  </div>
                )}
              </div>

              {/* 4. Supervisor notes & safety record */}
              <div>
                <h4 className="text-khaki text-xs font-bold uppercase tracking-widest border-b border-[#919283]/20 pb-1 mb-3">
                  [ SECTION IV : COMMAND &amp; SAFETY REMARKS ]
                </h4>
                <div className="p-3 bg-[#12130e] border border-[#919283]/15 rounded-sm">
                  <p className="text-xs italic text-[#e2e2da] leading-relaxed">
                    {selectedWorkerForReport.remarks || 'No negative remarks. Worker complies fully with all security clearances, occupational safety protocols, and standard operational procedures.'}
                  </p>
                </div>
              </div>

              {/* 5. Command Sign-off */}
              <div className="pt-6 grid grid-cols-3 gap-6 text-center text-xs mt-6 border-t border-[#919283]/20">
                <div>
                  <div className="h-10 border-b border-[#919283]/40 w-48 mx-auto"></div>
                  <span className="text-[9px] text-dark-grey block mt-1 uppercase">PREPARED BY: DIVISION SUPERVISOR</span>
                </div>
                <div>
                  <div className="h-10 border-b border-[#919283]/40 w-48 mx-auto"></div>
                  <span className="text-[9px] text-dark-grey block mt-1 uppercase">REVIEWED BY: HUMAN RESOURCES</span>
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
                Print Dossier
              </button>
              <button
                type="button"
                onClick={() => setIsReportOpen(false)}
                className="px-4 py-2 bg-khaki/10 border border-khaki/30 text-khaki hover:bg-khaki/20 text-xs transition-all uppercase"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
