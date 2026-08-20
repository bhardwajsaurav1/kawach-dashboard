import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { api } from '../api'

export default function Registration() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Search & Filter State
  const [search, setSearch] = useState('')
  const [lowStockFilter, setLowStockFilter] = useState(false)
  const [isLedgerOpen, setIsLedgerOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState('partId')
  const [sortOrder, setSortOrder] = useState('asc')
  const itemsPerPage = 10

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('add') // 'add' | 'edit'
  const [formData, setFormData] = useState({
    partId: '',
    partName: '',
    availableQuantity: 0,
    minimumStockLevel: 0,
    supplierInfo: '',
    partsIssued: 0,
    partsReturned: 0
  })

  // Role authentication
  const user = JSON.parse(localStorage.getItem('kavachUser')) || { role: 'User' }
  const isAdmin = user.role === 'Admin'

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const data = await api.getInventory()
      setInventory(data)
    } catch (err) {
      setError('Failed to fetch inventory records: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const handleOpenAddForm = () => {
    setFormMode('add')
    setFormData({
      partId: '',
      partName: '',
      availableQuantity: 10,
      minimumStockLevel: 5,
      supplierInfo: 'Tata Advanced Systems',
      partsIssued: 0,
      partsReturned: 0
    })
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (item) => {
    setFormMode('edit')
    setFormData({ ...item })
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    try {
      if (formMode === 'add') {
        await api.createInventory(formData)
      } else {
        await api.updateInventory(formData._id, formData)
      }
      setIsFormOpen(false)
      fetchInventory()
    } catch (err) {
      alert('Error saving inventory part: ' + err.message)
    }
  }

  const handleDeletePart = async (id) => {
    if (window.confirm('Are you sure you want to remove this spare part from the inventory?')) {
      try {
        await api.deleteInventory(id)
        fetchInventory()
      } catch (err) {
        alert('Error deleting spare part: ' + err.message)
      }
    }
  }

  // Filter & Search Logic
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      (item.partName || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.partId || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.supplierInfo || '').toLowerCase().includes(search.toLowerCase())
    
    const isLow = item.availableQuantity < item.minimumStockLevel
    const matchesLowStock = !lowStockFilter || isLow
    return matchesSearch && matchesLowStock
  })

  // Sort
  const sortedInventory = [...filteredInventory].sort((a, b) => {
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
  const currentInventory = sortedInventory.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedInventory.length / itemsPerPage)

  return (
    <div className="flex flex-col md:flex-row min-h-screen md:h-screen w-full relative bg-background text-on-surface font-body-base overflow-x-hidden md:overflow-hidden">
      <style>{`
        .tactical-glass { background:rgba(32,32,27,0.6); backdrop-filter:blur(12px); border:1px solid rgba(145,146,131,0.2); }
        .low-stock-row { background: rgba(255, 180, 171, 0.05); }
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
            <h2 className="font-headline-md text-base sm:text-lg md:text-headline-md font-bold uppercase tracking-wider text-primary">Command Inventory &amp; Spares</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsLedgerOpen(true)}
              className="bg-khaki/10 border border-khaki/40 hover:bg-khaki/20 text-khaki font-bold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-sm text-xs tracking-widest flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              GENERATE LEDGER REPORT
            </button>
            {isAdmin && (
              <button
                onClick={handleOpenAddForm}
                className="bg-primary hover:bg-primary/95 text-on-primary font-bold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-sm text-xs tracking-widest flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                ADD SPARE PART
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 no-print max-w-full">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* KPI metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'TOTAL INVENTORY ITEMS', val: inventory.length, color: 'text-primary' },
                { label: 'LOW STOCK PARTS', val: inventory.filter(t => t.availableQuantity < t.minimumStockLevel).length, color: 'text-red-400 font-bold' },
                { label: 'IN STOCK', val: inventory.filter(t => t.availableQuantity >= t.minimumStockLevel).length, color: 'text-[#00ff41]' },
                { label: 'PARTS ISSUED (TOTAL)', val: inventory.reduce((acc, curr) => acc + (curr.partsIssued || 0), 0), color: 'text-cyan-400 font-mono' },
                { label: 'PARTS RETURNED (TOTAL)', val: inventory.reduce((acc, curr) => acc + (curr.partsReturned || 0), 0), color: 'text-amber-400 font-mono' }
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
                  placeholder="Search Part Name, ID, Supplier..."
                  className="bg-surface-container-highest/60 border-none text-on-surface font-body-base text-xs pl-10 pr-4 py-2 w-full focus:ring-1 focus:ring-primary rounded-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-label-caps text-on-surface-variant">
                  <input
                    type="checkbox"
                    checked={lowStockFilter}
                    onChange={(e) => setLowStockFilter(e.target.checked)}
                    className="form-checkbox text-primary focus:ring-primary bg-surface-container-highest border-none h-4 w-4 rounded-sm"
                  />
                  <span>SHOW LOW STOCK ALERTS ONLY</span>
                </label>
              </div>
            </div>

            {/* Inventory table */}
            <div className="md:hidden flex items-center gap-2 text-[11px] text-primary/90 font-label-caps bg-primary/10 border border-primary/30 p-2 rounded">
              <span className="material-symbols-outlined text-sm animate-pulse">swipe</span>
              <span>SWIPE HORIZONTALLY TO VIEW ALL RECORD DETAILS &rarr;</span>
            </div>
            <div className="tactical-glass rounded border border-outline-variant/20 overflow-x-auto touch-scroll mobile-swipe-container custom-scrollbar w-full">
              {loading ? (
                <div className="p-8 text-center text-primary animate-pulse">Retreiving Command Inventory Records...</div>
              ) : (
                <table className="w-full min-w-[850px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high/80 border-b border-outline-variant/30 text-on-surface-variant font-label-caps text-[10px]">
                      <th className="p-4 cursor-pointer hover:text-primary" onClick={() => { setSortField('partId'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>Part ID ↕</th>
                      <th className="p-4 cursor-pointer hover:text-primary" onClick={() => { setSortField('partName'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>Spare Part Name ↕</th>
                      <th className="p-4 text-center cursor-pointer hover:text-primary" onClick={() => { setSortField('availableQuantity'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>Available Qty ↕</th>
                      <th className="p-4 text-center">Min Level</th>
                      <th className="p-4">Stock Status</th>
                      <th className="p-4 text-center font-mono">Issued</th>
                      <th className="p-4 text-center font-mono">Returned</th>
                      <th className="p-4">Supplier Information</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {currentInventory.map((item) => {
                      const isLow = item.availableQuantity < item.minimumStockLevel
                      return (
                        <tr key={item._id} className={`hover:bg-primary/5 transition-colors ${isLow ? 'low-stock-row border-l-4 border-l-red-500' : ''}`}>
                          <td className="p-4 font-mono text-primary font-bold">{item.partId}</td>
                          <td className="p-4 font-bold">{item.partName}</td>
                          <td className="p-4 text-center font-mono font-bold">{item.availableQuantity}</td>
                          <td className="p-4 text-center font-mono text-on-surface-variant">{item.minimumStockLevel}</td>
                          <td className="p-4">
                            {isLow ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse">
                                LOW STOCK ALERT
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/30">
                                IN STOCK
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center font-mono text-on-surface-variant">{item.partsIssued || 0}</td>
                          <td className="p-4 text-center font-mono text-on-surface-variant">{item.partsReturned || 0}</td>
                          <td className="p-4">{item.supplierInfo || 'OFB India'}</td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {isAdmin ? (
                                <>
                                  <button
                                    onClick={() => handleOpenEditForm(item)}
                                    className="p-1 hover:text-secondary transition-colors"
                                    title="Edit Quantity/Details"
                                  >
                                    <span className="material-symbols-outlined text-base">edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeletePart(item._id)}
                                    className="p-1 hover:text-error transition-colors"
                                    title="Delete/Decommission"
                                  >
                                    <span className="material-symbols-outlined text-base">delete</span>
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] text-outline font-mono">View Only</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}

              {/* Pagination */}
              <div className="p-4 bg-surface-container-high/40 border-t border-outline-variant/20 flex justify-between items-center text-xs">
                <span className="text-on-surface-variant font-mono">Showing {currentInventory.length} of {sortedInventory.length} items</span>
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

      {/* Part Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#181912] border border-outline-variant/40 rounded w-full max-w-lg p-8 shadow-2xl text-on-surface">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4 mb-6">
              <h3 className="font-headline-md text-xl font-bold text-primary uppercase">
                {formMode === 'add' ? 'Add Inventory Spare Part' : 'Modify Spare Part details'}
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
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">PART ID</label>
                  <input
                    type="text"
                    required
                    disabled={formMode === 'edit'}
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm disabled:opacity-50"
                    placeholder="e.g. PRT-1001"
                    value={formData.partId}
                    onChange={(e) => setFormData({...formData, partId: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">SPARE PART NAME</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    placeholder="e.g. Engine Valve Assembly"
                    value={formData.partName}
                    onChange={(e) => setFormData({...formData, partName: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">AVAILABLE QUANTITY</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.availableQuantity}
                    onChange={(e) => setFormData({...formData, availableQuantity: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">MINIMUM STOCK LEVEL</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.minimumStockLevel}
                    onChange={(e) => setFormData({...formData, minimumStockLevel: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">PARTS ISSUED (TOTAL)</label>
                  <input
                    type="number"
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.partsIssued}
                    onChange={(e) => setFormData({...formData, partsIssued: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">PARTS RETURNED (TOTAL)</label>
                  <input
                    type="number"
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.partsReturned}
                    onChange={(e) => setFormData({...formData, partsReturned: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">SUPPLIER INFORMATION</label>
                <input
                  type="text"
                  required
                  className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                  placeholder="e.g. Tata Advanced Systems"
                  value={formData.supplierInfo}
                  onChange={(e) => setFormData({...formData, supplierInfo: e.target.value})}
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

      {/* Modal - Command Spares & Inventory Ledger Sheet */}
      {isLedgerOpen && (
        <div className="fixed inset-0 bg-[#0d0e0a]/90 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto report-modal-backdrop">
          <div id="printable-report" className="bg-[#191a14] border border-[#919283]/30 rounded w-full max-w-4xl p-8 my-8 shadow-2xl text-[#e2e2da] font-mono relative">
            
            {/* Top Security Header */}
            <div className="flex justify-between items-start border-b-2 border-khaki pb-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-khaki mb-1">
                  <span className="material-symbols-outlined">shield</span>
                  <span className="text-xs font-bold uppercase tracking-widest">SECRET // LOGISTICS DIVISION</span>
                </div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-[#e2e2da]">KAVACH FLEET REGISTRY // STOCK LEDGER</h3>
                <p className="text-[10px] text-dark-grey uppercase mt-0.5">GENERATED SECURELY BY COMMAND LOGISTICS PORTAL // {new Date().toLocaleString()}</p>
              </div>
              <div className="text-right">
                <div className="text-[10px] bg-red-950/40 text-red-400 border border-red-950 px-2 py-0.5 rounded font-bold inline-block mb-1">
                  FOR OFFICIAL USE ONLY
                </div>
                <p className="text-[10px] text-dark-grey">RECORD REF: CO-LEDGER-{new Date().getFullYear()}</p>
              </div>
            </div>

            {/* Ledger content */}
            <div className="space-y-6">
              
              {/* 1. Core Summary Stats */}
              <div className="grid grid-cols-3 gap-4 text-xs bg-[#12130e] p-4 border border-[#919283]/15 rounded-sm">
                <div>
                  <span className="text-[10px] text-dark-grey block">TOTAL REGISTERED ITEMS</span>
                  <span className="font-bold text-khaki">{inventory.length}</span>
                </div>
                <div>
                  <span className="text-[10px] text-dark-grey block">CRITICAL LOW STOCK DEVIATIONS</span>
                  <span className="font-bold text-red-400">{inventory.filter(t => t.availableQuantity < t.minimumStockLevel).length}</span>
                </div>
                <div>
                  <span className="text-[10px] text-dark-grey block">NOMINAL STATUS RATIO</span>
                  <span className="font-bold text-[#00ff41]">
                    {inventory.length ? ((inventory.filter(t => t.availableQuantity >= t.minimumStockLevel).length / inventory.length) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>

              {/* 2. Full Ledger Table */}
              <div>
                <h4 className="text-khaki text-xs font-bold uppercase tracking-widest border-b border-[#919283]/20 pb-1 mb-3">
                  [ SECTION II : STOCK BALANCE RECORD ]
                </h4>
                <div className="border border-[#919283]/20 rounded overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#12130e] border-b border-[#919283]/30 text-khaki font-label-caps text-[10px]">
                        <th className="p-3">Part ID</th>
                        <th className="p-3">Part Name</th>
                        <th className="p-3">Supplier</th>
                        <th className="p-3 text-center">Issued</th>
                        <th className="p-3 text-center">Returned</th>
                        <th className="p-3 text-center">Min. Stock</th>
                        <th className="p-3 text-right">Available Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#919283]/10">
                      {inventory.map((item) => {
                        const isLow = item.availableQuantity < item.minimumStockLevel;
                        return (
                          <tr key={item._id} className="hover:bg-primary/5">
                            <td className="p-3 font-bold font-mono text-[#e2e2da]">{item.partId}</td>
                            <td className="p-3 text-[#e2e2da]">{item.partName}</td>
                            <td className="p-3 text-dark-grey">{item.supplierInfo}</td>
                            <td className="p-3 text-center text-dark-grey font-mono">{item.partsIssued || 0}</td>
                            <td className="p-3 text-center text-dark-grey font-mono">{item.partsReturned || 0}</td>
                            <td className="p-3 text-center text-dark-grey font-mono">{item.minimumStockLevel}</td>
                            <td className={`p-3 text-right font-bold font-mono ${isLow ? 'text-red-400' : 'text-[#00ff41]'}`}>
                              {item.availableQuantity} {isLow ? '(LOW)' : ''}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Command Validation & Ledger Handover */}
              <div className="pt-6 grid grid-cols-3 gap-6 text-center text-xs mt-6 border-t border-[#919283]/20">
                <div>
                  <div className="h-10 border-b border-[#919283]/40 w-48 mx-auto"></div>
                  <span className="text-[9px] text-dark-grey block mt-1 uppercase">PREPARED BY: QUARTERMASTER LOGISTICS</span>
                </div>
                <div>
                  <div className="h-10 border-b border-[#919283]/40 w-48 mx-auto"></div>
                  <span className="text-[9px] text-dark-grey block mt-1 uppercase">VERIFIED BY: STORES AUDITOR</span>
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
                Print Ledger Report
              </button>
              <button
                type="button"
                onClick={() => setIsLedgerOpen(false)}
                className="px-4 py-2 bg-khaki/10 border border-khaki/30 text-khaki hover:bg-khaki/20 text-xs transition-all uppercase"
              >
                Close Ledger
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
