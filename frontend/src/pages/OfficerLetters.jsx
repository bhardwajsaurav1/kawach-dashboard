import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { api } from '../api'

export default function OfficerLetters() {
  const [workforce, setWorkforce] = useState([])
  const [inventory, setInventory] = useState([])
  const [tanks, setTanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Active Tab: 'leave' | 'quotation' | 'memo'
  const [activeTab, setActiveTab] = useState('leave')

  // Common Document State
  const [refNo, setRefNo] = useState(`KAVACH/ERG/2026/${Math.floor(1000 + Math.random() * 9000)}`)
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0])
  const [signatoryName, setSignatoryName] = useState('Col. Sandeep Mehta')
  const [signatoryTitle, setSignatoryTitle] = useState('Dy GM (ERG), Overhaul Centre')
  const [securityClassification, setSecurityClassification] = useState('RESTRICTED')

  // Leave Form State
  const [selectedWorkerId, setSelectedWorkerId] = useState('')
  const [leaveStart, setLeaveStart] = useState('')
  const [leaveEnd, setLeaveEnd] = useState('')
  const [leaveDays, setLeaveDays] = useState(3)
  const [leaveType, setLeaveType] = useState('Casual Leave')
  const [leaveReason, setLeaveReason] = useState('Domestic affairs and family emergency')
  const [leaveAddress, setLeaveAddress] = useState('Quarter 42B, Sector-3, Garrison Station')

  // Quotation Form State
  const [selectedPartId, setSelectedPartId] = useState('')
  const [selectedTankId, setSelectedTankId] = useState('')
  const [vendorName, setVendorName] = useState('Tata Advanced Systems')
  const [quotationNo, setQuotationNo] = useState(`QT-${Math.floor(10000 + Math.random() * 90000)}`)
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0])
  const [quotationItems, setQuotationItems] = useState([
    { desc: 'Gasket Set Engine Cover', qty: 2, rate: 4500, total: 9000 }
  ])
  const [justification, setJustification] = useState('Critical engine block sealing requirement for ongoing overhaul schedule.')

  // Memo Form State
  const [memoSubject, setMemoSubject] = useState('SANCTION ORDER FOR EXTRA SHIFT INSTRUCTION')
  const [memoTo, setMemoTo] = useState('All Workshop Supervisors & Section Leads')
  const [memoBody, setMemoBody] = useState(
    'In view of the upcoming operational deadlines for the T-90 battle vehicle assembly, it is hereby ordered that an extra shift be scheduled for all technical personnel in Sub-Assembly and Machine Shop sections.\n\nAll safety regulations must be strictly complied with.'
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [wData, iData, tData] = await Promise.all([
          api.getWorkforce(),
          api.getInventory(),
          api.getTanks()
        ])
        setWorkforce(wData)
        setInventory(iData)
        setTanks(tData)
        if (wData.length > 0) setSelectedWorkerId(wData[0]._id)
        if (iData.length > 0) {
          const item = iData[0]
          setSelectedPartId(item._id)
          setQuotationItems([{ desc: item.partName, qty: 1, rate: 8500, total: 8500 }])
        }
        if (tData.length > 0) setSelectedTankId(tData[0]._id)
      } catch (err) {
        setError('Failed to fetch master data: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Auto-fill worker details when selected worker changes
  const handleWorkerChange = (e) => {
    const wId = e.target.value
    setSelectedWorkerId(wId)
  }

  // Auto-fill part details when selected part changes
  const handlePartChange = (e) => {
    const pId = e.target.value
    setSelectedPartId(pId)
    const selectedItem = inventory.find(i => i._id === pId)
    if (selectedItem) {
      setVendorName(selectedItem.supplierInfo || 'Tata Advanced Systems')
      setQuotationItems([
        { desc: selectedItem.partName, qty: 1, rate: 12500, total: 12500 }
      ])
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Calculate totals for quotation
  const totalAmount = quotationItems.reduce((sum, item) => sum + item.total, 0)

  // Get selected objects
  const currentWorker = workforce.find(w => w._id === selectedWorkerId)
  const currentTank = tanks.find(t => t._id === selectedTankId)

  return (
    <div className="flex flex-col md:flex-row min-h-screen md:h-screen w-full relative bg-background text-on-surface font-body-base overflow-x-hidden md:overflow-hidden">
      <style>{`
        .tactical-glass { background: rgba(22, 23, 17, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(145, 146, 131, 0.25); }
        .tab-btn { transition: all 0.2s ease-in-out; }
        .tab-btn.active { border-bottom: 2px solid #d6c692; color: #d6c692; font-weight: bold; }
        
        @media print {
          body * { visibility: hidden; }
          #printable-letter, #printable-letter * { visibility: visible; }
          #printable-letter {
            display: block !important;
            position: fixed;
            left: 0;
            top: 0;
            width: 111.11% !important;
            transform: scale(0.90);
            transform-origin: top left;
            height: auto !important;
            overflow: visible !important;
            color: #000000 !important;
            background: #ffffff !important;
            padding: 30px !important;
            box-shadow: none !important;
            border: none !important;
            font-family: 'Courier New', Courier, monospace !important;
            font-size: 13px !important;
            line-height: 1.6 !important;
          }
          #printable-letter .text-khaki {
            color: #111111 !important;
          }
          #printable-letter .text-dark-grey, #printable-letter .text-outline {
            color: #333333 !important;
          }
          #printable-letter .border, #printable-letter border, #printable-letter td, #printable-letter th {
            border-color: #333333 !important;
          }
          /* Ensure signature border lines are strictly black and visible */
          #printable-letter .sig-line {
            border-bottom: 2px solid #000000 !important;
            margin-top: 50px !important;
            display: inline-block !important;
            width: 180px !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Sidebar Navigation */}
      <Sidebar className="no-print" />

      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-surface-dim min-w-0 pt-14 md:pt-0">
        
        {/* Header bar */}
        <header className="bg-surface-container/60 backdrop-blur-xl border-b border-outline-variant/30 min-h-16 py-3 md:py-0 flex flex-wrap md:flex-nowrap items-center justify-between px-4 sm:px-6 md:px-8 gap-3 z-30 shadow-lg no-print">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <h2 className="font-headline-md text-base sm:text-lg md:text-headline-md font-bold uppercase tracking-wider text-primary">OFFICER DOCUMENT GENERATOR</h2>
            <span className="text-[10px] font-mono bg-khaki/10 text-khaki border border-khaki/25 px-2 py-0.5 rounded">
              ADMIN CONTROL PANEL
            </span>
          </div>
          <div>
            <button
              onClick={handlePrint}
              className="border border-khaki/50 bg-khaki/10 hover:bg-khaki/20 text-khaki font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm text-xs tracking-widest flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              PRINT DOCUMENT
            </button>
          </div>
        </header>

        {/* Content Canvas */}
        <main className="flex-1 overflow-y-auto flex flex-col md:flex-row no-print max-w-full">
          
          {/* Left Panel: Form controls */}
          <div className="w-full md:w-1/2 p-6 border-r border-outline-variant/20 overflow-y-auto space-y-6">
            
            {/* Tabs selector */}
            <div className="flex border-b border-outline-variant/20 gap-4 sm:gap-6 text-sm overflow-x-auto custom-scrollbar flex-nowrap whitespace-nowrap min-w-0 max-w-full">
              <button
                onClick={() => setActiveTab('leave')}
                className={`tab-btn pb-3 text-xs tracking-wider uppercase flex-shrink-0 ${activeTab === 'leave' ? 'active text-khaki' : 'text-on-surface-variant'}`}
              >
                LEAVE APPROVAL
              </button>
              <button
                onClick={() => setActiveTab('quotation')}
                className={`tab-btn pb-3 text-xs tracking-wider uppercase flex-shrink-0 ${activeTab === 'quotation' ? 'active text-khaki' : 'text-on-surface-variant'}`}
              >
                QUOTATION SANCTION
              </button>
              <button
                onClick={() => setActiveTab('memo')}
                className={`tab-btn pb-3 text-xs tracking-wider uppercase flex-shrink-0 ${activeTab === 'memo' ? 'active text-khaki' : 'text-on-surface-variant'}`}
              >
                OFFICIAL MEMORANDUM
              </button>
            </div>

            {/* Common Document Metadata */}
            <div className="tactical-glass p-4 rounded border border-outline-variant/20 space-y-4">
              <h4 className="text-khaki text-[11px] font-bold uppercase tracking-wider">[ DOCUMENT METADATA ]</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-outline uppercase mb-1">Reference Number</label>
                  <input
                    type="text"
                    value={refNo}
                    onChange={(e) => setRefNo(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-2.5 rounded-sm font-mono focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-outline uppercase mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={docDate}
                    onChange={(e) => setDocDate(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-2.5 rounded-sm font-mono focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-outline uppercase mb-1">Signatory Authority</label>
                  <input
                    type="text"
                    value={signatoryName}
                    onChange={(e) => setSignatoryName(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-2.5 rounded-sm focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-outline uppercase mb-1">Signatory Title</label>
                  <input
                    type="text"
                    value={signatoryTitle}
                    onChange={(e) => setSignatoryTitle(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-2.5 rounded-sm focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] text-outline uppercase mb-1">Security Marking</label>
                  <select
                    value={securityClassification}
                    onChange={(e) => setSecurityClassification(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-2.5 rounded-sm focus:ring-1 focus:ring-primary"
                  >
                    <option value="UNCLASSIFIED">UNCLASSIFIED</option>
                    <option value="RESTRICTED">RESTRICTED</option>
                    <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                    <option value="SECRET">SECRET // CLASSIFIED</option>
                  </select>
                </div>
              </div>
            </div>

            {/* TAB 1: Leave Approval Controls */}
            {activeTab === 'leave' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-primary uppercase">[ LEAVE DISPENSATION DATA ]</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-outline uppercase mb-1">Select Workshop Personnel</label>
                    <select
                      value={selectedWorkerId}
                      onChange={handleWorkerChange}
                      className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 rounded-sm focus:ring-1 focus:ring-primary"
                    >
                      {workforce.map(w => (
                        <option key={w._id} value={w._id}>
                          {w.name} - {w.designation || w.trade} ({w.department})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-outline uppercase mb-1">Leave Commences</label>
                      <input
                        type="date"
                        value={leaveStart}
                        onChange={(e) => setLeaveStart(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-2.5 rounded-sm focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-outline uppercase mb-1">Duration (Days)</label>
                      <input
                        type="number"
                        value={leaveDays}
                        onChange={(e) => setLeaveDays(parseInt(e.target.value) || 1)}
                        className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-2.5 rounded-sm focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-outline uppercase mb-1">Leave Classification</label>
                      <select
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-2.5 rounded-sm focus:ring-1 focus:ring-primary"
                      >
                        <option value="Casual Leave">Casual Leave (CL)</option>
                        <option value="Earned Leave">Earned Leave (EL)</option>
                        <option value="Medical Leave">Medical Leave (ML)</option>
                        <option value="Station Leave">Station Leave</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-outline uppercase mb-1">Station Leave Address</label>
                      <input
                        type="text"
                        value={leaveAddress}
                        onChange={(e) => setLeaveAddress(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-2.5 rounded-sm focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-outline uppercase mb-1">Justification / Reason</label>
                    <textarea
                      rows="3"
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 rounded-sm focus:ring-1 focus:ring-primary"
                      placeholder="Specify reason..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Quotation Approval Controls */}
            {activeTab === 'quotation' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-primary uppercase">[ QUOTATION SANCTION DATA ]</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-outline uppercase mb-1">Target Combat Vehicle</label>
                      <select
                        value={selectedTankId}
                        onChange={(e) => setSelectedTankId(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 rounded-sm focus:ring-1 focus:ring-primary"
                      >
                        {tanks.map(t => (
                          <option key={t._id} value={t._id}>
                            {t.tankId} ({t.registrationNumber}) - {t.tankModel}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-outline uppercase mb-1">Link Inventory Part</label>
                      <select
                        value={selectedPartId}
                        onChange={handlePartChange}
                        className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 rounded-sm focus:ring-1 focus:ring-primary"
                      >
                        {inventory.map(i => (
                          <option key={i._id} value={i._id}>
                            {i.partId} - {i.partName} (Qty: {i.availableQuantity})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-outline uppercase mb-1">Vendor/Supplier</label>
                      <input
                        type="text"
                        value={vendorName}
                        onChange={(e) => setVendorName(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-2.5 rounded-sm focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-outline uppercase mb-1">Quotation Ref No</label>
                      <input
                        type="text"
                        value={quotationNo}
                        onChange={(e) => setQuotationNo(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-2.5 rounded-sm focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-outline uppercase mb-1">Item Description</label>
                    <input
                      type="text"
                      value={quotationItems[0]?.desc || ''}
                      onChange={(e) => {
                        const updated = [...quotationItems]
                        updated[0].desc = e.target.value
                        setQuotationItems(updated)
                      }}
                      className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-2.5 rounded-sm focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-outline uppercase mb-1">Quantity</label>
                      <input
                        type="number"
                        value={quotationItems[0]?.qty || 0}
                        onChange={(e) => {
                          const qtyVal = parseInt(e.target.value) || 0
                          const updated = [...quotationItems]
                          updated[0].qty = qtyVal
                          updated[0].total = qtyVal * updated[0].rate
                          setQuotationItems(updated)
                        }}
                        className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-2.5 rounded-sm focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-outline uppercase mb-1">Estimated Unit Rate (₹)</label>
                      <input
                        type="number"
                        value={quotationItems[0]?.rate || 0}
                        onChange={(e) => {
                          const rateVal = parseInt(e.target.value) || 0
                          const updated = [...quotationItems]
                          updated[0].rate = rateVal
                          updated[0].total = updated[0].qty * rateVal
                          setQuotationItems(updated)
                        }}
                        className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-2.5 rounded-sm focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-outline uppercase mb-1">Justification</label>
                    <textarea
                      rows="3"
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 rounded-sm focus:ring-1 focus:ring-primary"
                      placeholder="Why is this purchase required?"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Custom Memo Controls */}
            {activeTab === 'memo' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-primary uppercase">[ OFFICIAL MEMORANDUM DATA ]</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-outline uppercase mb-1">Addressed To / Distribution List</label>
                    <input
                      type="text"
                      value={memoTo}
                      onChange={(e) => setMemoTo(e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-2.5 rounded-sm focus:ring-1 focus:ring-primary"
                      placeholder="e.g. All Section Chiefs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-outline uppercase mb-1">Subject</label>
                    <input
                      type="text"
                      value={memoSubject}
                      onChange={(e) => setMemoSubject(e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-2.5 rounded-sm focus:ring-1 focus:ring-primary"
                      placeholder="Enter subject heading..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-outline uppercase mb-1">Memorandum Body</label>
                    <textarea
                      rows="8"
                      value={memoBody}
                      onChange={(e) => setMemoBody(e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 rounded-sm focus:ring-1 focus:ring-primary font-mono"
                      placeholder="Type official communication body here..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Simulated physical sheet preview */}
          <div className="w-full md:w-1/2 p-2 sm:p-6 bg-surface-container-low/20 overflow-x-auto overflow-y-auto flex justify-start sm:justify-center items-start custom-scrollbar max-w-full">
            <div className="w-full min-w-[320px] max-w-[21cm] bg-white text-black p-4 sm:p-8 md:p-12 shadow-2xl border border-outline/10 text-xs font-mono min-h-[29.7cm] flex flex-col justify-between">
              
              {/* Official Letterhead Header */}
              <div>
                <div className="text-center space-y-1 mb-8 border-b-2 border-double border-black pb-4">
                  <h2 className="font-bold text-sm tracking-wider uppercase">GOVERNMENT OF INDIA // MINISTRY OF DEFENCE</h2>
                  <h3 className="font-bold text-[11px] tracking-wide uppercase">ENGINEERING AND REPAIR GROUP (ERG), CENTRAL OVERHAUL CENTRE</h3>
                  <p className="text-[10px] text-gray-600">GARRISON RANGE, FIELD STATION AREA // TEL: 011-2301928</p>
                  <div className="flex justify-between items-center pt-2 text-[9px] font-bold text-red-650">
                    <span>REF: {refNo}</span>
                    <span className="text-[10px] border border-black px-2 py-0.5 rounded font-black tracking-widest">{securityClassification}</span>
                    <span>DATE: {new Date(docDate).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>

                {/* TAB 1 PREVIEW: Leave Approval Letter */}
                {activeTab === 'leave' && currentWorker && (
                  <div className="space-y-6 leading-relaxed">
                    <div className="font-bold">
                      TO:<br />
                      Personnel File of: {currentWorker.name}<br />
                      Designation/Rank: {currentWorker.designation || currentWorker.trade}<br />
                      Department: {currentWorker.department}
                    </div>

                    <div className="text-center font-bold underline my-4">
                      SUBJECT: SANCTION OF LEAVE AND DISPENSATION ORDER
                    </div>

                    <p>
                      1. Reference application dated <b>{new Date(docDate).toLocaleDateString('en-GB')}</b> submitted by the official listed above. Sanction of the Competent Authority is hereby accorded for the grant of <b>{leaveDays} days</b> of <b>{leaveType}</b> with effect from <b>{leaveStart ? new Date(leaveStart).toLocaleDateString('en-GB') : 'N/A'}</b> to <b>{leaveEnd ? new Date(leaveEnd).toLocaleDateString('en-GB') : 'N/A'}</b>.
                    </p>

                    <p>
                      2. The official is permitted to leave the station and reside at the following registered address during the duration of leave:
                      <div className="mt-2 pl-4 border-l border-gray-400 italic">
                        "{leaveAddress}"
                      </div>
                    </p>

                    <p>
                      3. The official is ordered to report back for duty on the forenoon of the day following leave expiration. Certified that the leave is required due to: <i>{leaveReason}</i>.
                    </p>
                  </div>
                )}

                {/* TAB 2 PREVIEW: Quotation Approval Letter */}
                {activeTab === 'quotation' && (
                  <div className="space-y-6 leading-relaxed">
                    <div className="font-bold">
                      SUBJECT: SANCTION FOR OUTSOURCING OF SPARES &amp; VEHICLE REPAIR WORKS
                    </div>

                    <p>
                      1. Administrative Approval and Financial Sanction (AAFS) of the Dy GM (ERG) is hereby conveyed for the procurement of spare parts/repair works as detailed below:
                    </p>

                    <table className="w-full border-collapse border border-black my-4 text-xs">
                      <thead>
                        <tr className="bg-gray-100 border-b border-black font-bold">
                          <th className="border border-black p-2 text-left">Item Description</th>
                          <th className="border border-black p-2 text-center">Qty</th>
                          <th className="border border-black p-2 text-right">Unit Rate (₹)</th>
                          <th className="border border-black p-2 text-right">Total (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotationItems.map((item, index) => (
                          <tr key={index}>
                            <td className="border border-black p-2">{item.desc}</td>
                            <td className="border border-black p-2 text-center">{item.qty}</td>
                            <td className="border border-black p-2 text-right">₹{item.rate.toLocaleString('en-IN')}</td>
                            <td className="border border-black p-2 text-right font-bold">₹{item.total.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-bold">
                          <td colSpan="3" className="border border-black p-2 text-right">Aggregate Sanction Amount:</td>
                          <td className="border border-black p-2 text-right">₹{totalAmount.toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>

                    <p>
                      2. <b>Justification of Procurement:</b> {justification}
                    </p>

                    <p>
                      3. The expenditure is debitable to Head of Account <b>"CO-LOGISTICS-SPARES"</b>. Procurement must be executed through registered vendor <b>{vendorName}</b> against Quotation reference <b>{quotationNo}</b> dated <b>{new Date(quotationDate).toLocaleDateString('en-GB')}</b>.
                    </p>
                  </div>
                )}

                {/* TAB 3 PREVIEW: Custom Memo */}
                {activeTab === 'memo' && (
                  <div className="space-y-6 leading-relaxed">
                    <div className="font-bold">
                      MEMORANDUM TO: {memoTo}<br />
                      FROM: OFFICE OF THE Dy GM (ERG), COC
                    </div>

                    <div className="text-center font-bold underline my-4 uppercase">
                      SUBJECT: {memoSubject}
                    </div>

                    <div className="whitespace-pre-wrap leading-relaxed">
                      {memoBody}
                    </div>
                  </div>
                )}
              </div>

              {/* Strict Signature Blocks for Printout */}
              <div className="mt-16 border-t border-gray-300 pt-6">
                <div className="text-left mb-4">
                  <p className="text-[10px] text-gray-500">Document Security Code:</p>
                  <p className="font-bold font-mono">KV-{Math.floor(100000 + Math.random() * 900000)}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-[150px] border-b-2 border-black h-10 mb-1"></div>
                    <p className="font-bold text-[10px] uppercase">PREPARED BY</p>
                    <p className="text-[9px] text-gray-600 uppercase">OFFICE CLERK / ADJT</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-[150px] border-b-2 border-black h-10 mb-1"></div>
                    <p className="font-bold text-[10px] uppercase">CHECKED BY</p>
                    <p className="text-[9px] text-gray-600 uppercase">QA & COMPLIANCE LEAD</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-[150px] border-b-2 border-black h-10 mb-1"></div>
                    <p className="font-bold text-[10px] uppercase">{signatoryName}</p>
                    <p className="text-[9px] text-gray-600 uppercase">{signatoryTitle}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>

        {/* Printable Document (only renders during print mode) */}
        <div id="printable-letter" className="hidden">
          <div className="text-center space-y-1 mb-8 border-b-2 border-black pb-4">
            <h2 className="font-bold text-sm tracking-wider uppercase">GOVERNMENT OF INDIA // MINISTRY OF DEFENCE</h2>
            <h3 className="font-bold text-[11px] tracking-wide uppercase">ENGINEERING AND REPAIR GROUP (ERG), CENTRAL OVERHAUL CENTRE</h3>
            <p className="text-[10px] text-gray-600">GARRISON RANGE, FIELD STATION AREA // TEL: 011-2301928</p>
            <div className="flex justify-between items-center pt-2 text-[9px] font-bold">
              <span>REF: {refNo}</span>
              <span className="text-[10px] border border-black px-2 py-0.5 rounded font-black tracking-widest">{securityClassification}</span>
              <span>DATE: {new Date(docDate).toLocaleDateString('en-GB')}</span>
            </div>
          </div>

          {activeTab === 'leave' && currentWorker && (
            <div className="space-y-6 leading-relaxed">
              <div className="font-bold">
                TO:<br />
                Personnel File of: {currentWorker.name}<br />
                Designation/Rank: {currentWorker.designation || currentWorker.trade}<br />
                Department: {currentWorker.department}
              </div>

              <div className="text-center font-bold underline my-4">
                SUBJECT: SANCTION OF LEAVE AND DISPENSATION ORDER
              </div>

              <p>
                1. Reference application dated <b>{new Date(docDate).toLocaleDateString('en-GB')}</b> submitted by the official listed above. Sanction of the Competent Authority is hereby accorded for the grant of <b>{leaveDays} days</b> of <b>{leaveType}</b> with effect from <b>{leaveStart ? new Date(leaveStart).toLocaleDateString('en-GB') : 'N/A'}</b> to <b>{leaveEnd ? new Date(leaveEnd).toLocaleDateString('en-GB') : 'N/A'}</b>.
              </p>

              <p>
                2. The official is permitted to leave the station and reside at the following registered address during the duration of leave:
                <div className="mt-2 pl-4 border-l border-gray-400 italic">
                  "{leaveAddress}"
                </div>
              </p>

              <p>
                3. The official is ordered to report back for duty on the forenoon of the day following leave expiration. Certified that the leave is required due to: <i>{leaveReason}</i>.
              </p>
            </div>
          )}

          {activeTab === 'quotation' && (
            <div className="space-y-6 leading-relaxed">
              <div className="font-bold">
                SUBJECT: SANCTION FOR OUTSOURCING OF SPARES &amp; VEHICLE REPAIR WORKS
              </div>

              <p>
                1. Administrative Approval and Financial Sanction (AAFS) of the Dy GM (ERG) is hereby conveyed for the procurement of spare parts/repair works as detailed below:
              </p>

              <table className="w-full border-collapse border border-black my-4 text-xs">
                <thead>
                  <tr className="bg-gray-100 border-b border-black font-bold">
                    <th className="border border-black p-2 text-left">Item Description</th>
                    <th className="border border-black p-2 text-center">Qty</th>
                    <th className="border border-black p-2 text-right">Unit Rate (₹)</th>
                    <th className="border border-black p-2 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {quotationItems.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-black p-2">{item.desc}</td>
                      <td className="border border-black p-2 text-center">{item.qty}</td>
                      <td className="border border-black p-2 text-right">₹{item.rate.toLocaleString('en-IN')}</td>
                      <td className="border border-black p-2 text-right font-bold">₹{item.total.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold">
                    <td colSpan="3" className="border border-black p-2 text-right">Aggregate Sanction Amount:</td>
                    <td className="border border-black p-2 text-right">₹{totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>

              <p>
                2. <b>Justification of Procurement:</b> {justification}
              </p>

              <p>
                3. The expenditure is debitable to Head of Account <b>"CO-LOGISTICS-SPARES"</b>. Procurement must be executed through registered vendor <b>{vendorName}</b> against Quotation reference <b>{quotationNo}</b> dated <b>{new Date(quotationDate).toLocaleDateString('en-GB')}</b>.
              </p>
            </div>
          )}

          {activeTab === 'memo' && (
            <div className="space-y-6 leading-relaxed">
              <div className="font-bold">
                MEMORANDUM TO: {memoTo}<br />
                FROM: OFFICE OF THE Dy GM (ERG), COC
              </div>

              <div className="text-center font-bold underline my-4 uppercase">
                SUBJECT: {memoSubject}
              </div>

              <div className="whitespace-pre-wrap leading-relaxed">
                {memoBody}
              </div>
            </div>
          )}

          <div className="mt-20">
            <div className="text-left mb-4">
              <p className="text-[10px] text-gray-500">Document Security Code:</p>
              <p className="font-bold font-mono">KV-{Math.floor(100000 + Math.random() * 900000)}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <div className="w-[150px] border-b-2 border-black h-10 mb-1"></div>
                <p className="font-bold text-[10px] uppercase">PREPARED BY</p>
                <p className="text-[9px] text-gray-600 uppercase">OFFICE CLERK / ADJT</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-[150px] border-b-2 border-black h-10 mb-1"></div>
                <p className="font-bold text-[10px] uppercase">CHECKED BY</p>
                <p className="text-[9px] text-gray-600 uppercase">QA & COMPLIANCE LEAD</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-[150px] border-b-2 border-black h-10 mb-1"></div>
                <p className="font-bold text-[10px] uppercase">{signatoryName}</p>
                <p className="text-[9px] text-gray-600 uppercase">{signatoryTitle}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
