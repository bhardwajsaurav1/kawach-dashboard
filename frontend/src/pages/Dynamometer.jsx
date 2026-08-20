import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { api } from '../api'

export default function Dynamometer() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Search & Filter
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('add') // 'add' | 'edit'
  const [formData, setFormData] = useState({
    title: '',
    type: 'Announcement',
    content: '',
    date: ''
  })

  // Role authentication
  const user = JSON.parse(localStorage.getItem('kavachUser')) || { role: 'User' }
  const isAdmin = user.role === 'Admin'

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await api.getNotifications()
      setNotifications(data)
    } catch (err) {
      setError('Failed to fetch notifications: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleOpenAddForm = () => {
    setFormMode('add')
    setFormData({
      title: '',
      type: 'Announcement',
      content: '',
      date: new Date().toISOString().split('T')[0]
    })
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (notif) => {
    setFormMode('edit')
    setFormData({
      ...notif,
      date: notif.date ? new Date(notif.date).toISOString().split('T')[0] : ''
    })
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    try {
      if (formMode === 'add') {
        await api.createNotification(formData)
      } else {
        await api.updateNotification(formData._id, formData)
      }
      setIsFormOpen(false)
      fetchNotifications()
    } catch (err) {
      alert('Error saving notification: ' + err.message)
    }
  }

  const handleDeleteNotification = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification broadcast?')) {
      try {
        await api.deleteNotification(id)
        fetchNotifications()
      } catch (err) {
        alert('Error deleting notification: ' + err.message)
      }
    }
  }

  // Filter & Search Logic
  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = 
      (notif.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (notif.content || '').toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'All' || notif.type === typeFilter
    return matchesSearch && matchesType
  })

  const getNotifTypeStyle = (type) => {
    switch (type) {
      case 'Conference': return { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: 'settings_voice' }
      case 'Meeting': return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'groups' }
      case 'Deadline': return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: 'warning' }
      case 'Announcement': return { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-[#00ff41]', icon: 'campaign' }
      default: return { bg: 'bg-outline-variant/10', border: 'border-outline-variant/30', text: 'text-on-surface-variant', icon: 'info' }
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full relative bg-background text-on-surface font-body-base overflow-hidden">
      <style>{`
        .tactical-glass { background:rgba(32,32,27,0.6); backdrop-filter:blur(12px); border:1px solid rgba(145,146,131,0.2); }
      `}</style>
      
      {/* Side Navigation */}
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-surface-dim min-w-0 pt-14 md:pt-0">
        {/* Top App Bar */}
        <header className="bg-surface-container/60 backdrop-blur-xl border-b border-outline-variant/30 min-h-16 py-3 md:py-0 flex flex-wrap md:flex-nowrap items-center justify-between px-4 sm:px-6 md:px-8 gap-3 z-30 shadow-lg shadow-primary/5">
          <div className="flex items-center gap-3 sm:gap-6">
            <h2 className="font-headline-md text-base sm:text-lg md:text-headline-md font-bold uppercase tracking-wider text-primary">Command Announcements &amp; Schedules</h2>
          </div>
          <div>
            {isAdmin && (
              <button
                onClick={handleOpenAddForm}
                className="bg-primary hover:bg-primary/95 text-on-primary font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm text-xs tracking-widest flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">campaign</span>
                CREATE BROADCAST
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-full">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Quick Filter Bar */}
            <div className="tactical-glass p-4 rounded border border-outline-variant/20 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline/50">search</span>
                <input
                  type="text"
                  placeholder="Search broadcast contents..."
                  className="bg-surface-container-highest/60 border-none text-on-surface font-body-base text-xs pl-10 pr-4 py-2 w-full focus:ring-1 focus:ring-primary rounded-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-label-caps text-on-surface-variant">CATEGORY:</span>
                <div className="flex gap-2">
                  {['All', 'Announcement', 'Deadline', 'Meeting', 'Conference'].map(t => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`px-3 py-1 text-xs font-label-caps border rounded-sm transition-all ${
                        typeFilter === t
                          ? 'bg-primary/20 text-primary border-primary'
                          : 'border-outline-variant/30 hover:bg-primary/5 text-on-surface-variant'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Broadcast lists */}
            {loading ? (
              <div className="p-8 text-center text-primary animate-pulse">Establishing secure network connection to Command HQ...</div>
            ) : filteredNotifications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNotifications.map((notif) => {
                  const style = getNotifTypeStyle(notif.type)
                  return (
                    <div
                      key={notif._id}
                      className={`tactical-glass p-6 rounded border ${style.border} flex flex-col justify-between space-y-4`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${style.bg} ${style.text} flex items-center gap-1`}>
                            <span className="material-symbols-outlined text-[10px]">{style.icon}</span>
                            {notif.type.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono text-outline">{new Date(notif.date).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-headline-md text-base font-bold text-on-surface">{notif.title}</h3>
                        <p className="text-xs text-on-surface-variant leading-relaxed font-mono">{notif.content}</p>
                      </div>

                      {isAdmin && (
                        <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/10">
                          <button
                            onClick={() => handleOpenEditForm(notif)}
                            className="p-1 hover:text-secondary transition-colors"
                            title="Edit Broadcast"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteNotification(notif._id)}
                            className="p-1 hover:text-error transition-colors"
                            title="Recall Broadcast"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-on-surface-variant italic">No broadcasts or notifications matching parameters found.</div>
            )}
          </div>
        </main>
      </div>

      {/* Broadcast Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#181912] border border-outline-variant/40 rounded w-full max-w-lg p-8 shadow-2xl text-on-surface">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4 mb-6">
              <h3 className="font-headline-md text-xl font-bold text-primary uppercase">
                {formMode === 'add' ? 'Broadcast New Command Notice' : 'Edit Broadcast parameters'}
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
                <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">BROADCAST TITLE</label>
                <input
                  type="text"
                  required
                  className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                  placeholder="e.g. Annual Fleet Readiness Review"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">BROADCAST CATEGORY</label>
                  <select
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Announcement">Announcement</option>
                    <option value="Deadline">Deadline</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Conference">Conference</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">BROADCAST DATE</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-label-caps text-on-surface-variant mb-1">BROADCAST CONTENT</label>
                <textarea
                  rows="4"
                  required
                  className="w-full bg-surface-container border border-outline-variant/30 text-on-surface text-xs p-3 focus:ring-1 focus:ring-primary rounded-sm"
                  placeholder="Enter full notice / announcement text..."
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
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
                  BROADCAST
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
