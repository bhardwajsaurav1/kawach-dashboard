import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import Sidebar from '../components/Sidebar'

export default function Dashboard() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  // Core Data States
  const [stats, setStats] = useState({
    totalTanks: 0,
    operationalTanks: 0,
    maintenanceTanks: 0,
    totalPersonnel: 0,
    totalWorkforce: 0,
    readiness: 94
  })
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [spareRequests, setSpareRequests] = useState([])
  const [workOrders, setWorkOrders] = useState([])
  const [issues, setIssues] = useState([])
  const [userMessages, setUserMessages] = useState([])
  const [events, setEvents] = useState([])
  const [documents, setDocuments] = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  const [announcements, setAnnouncements] = useState([])

  // User Search & Filters
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('ALL')
  const [taskFilterStatus, setTaskFilterStatus] = useState('ALL')

  // Modals & Forms State
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [taskForm, setTaskForm] = useState({ id: '', title: '', description: '', priority: 'Medium', status: 'Pending', dueDate: '' })

  const [showUserModal, setShowUserModal] = useState(false)
  const [userForm, setUserForm] = useState({ id: '', username: '', fullName: '', email: '', role: 'Operator', password: '', isActive: true })

  const [showActionModal, setShowActionModal] = useState(null) // 'leave' | 'spare' | 'workorder' | 'issue' | 'report' | 'message'
  const [leaveForm, setLeaveForm] = useState({ duration: '12 Aug - 22 Aug (10 Days)', reason: 'Annual leave cycle request', priority: 'Medium' })
  const [spareForm, setSpareForm] = useState({ item: 'Synthetic Lubricant 50L', qty: '2 barrels', dept: 'Mechanical Div', priority: 'High' })
  const [workorderForm, setWorkorderForm] = useState({ title: 'Engine Calibration Hangar 4', desc: 'Perform manual calibration check of fuel injectors.', dept: 'Mechanical Div', priority: 'High' })
  const [issueForm, setIssueForm] = useState({ title: 'Compressor Pressure Drop', desc: 'Main pressure drops below 10 bar under load.', dept: 'Mechanical Div', priority: 'High' })
  const [reportForm, setReportForm] = useState({ title: 'Arjun Telemetry Calibration Report', category: 'Calibration' })
  const [messageForm, setMessageForm] = useState({ text: '' })
  const [replyInput, setReplyInput] = useState({ id: null, text: '' })

  const [adminAnnouncement, setAdminAnnouncement] = useState('')
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [resetPasswordForm, setResetPasswordForm] = useState({ userId: '', newPassword: '' })
  const [showAuditModal, setShowAuditModal] = useState(false)
  const [compiledReportPreview, setCompiledReportPreview] = useState(null)

  // Created Items & Requests Tracker State
  const [createdItemCategory, setCreatedItemCategory] = useState('ALL')
  const [createdItemStatus, setCreatedItemStatus] = useState('ALL')
  const [createdItemSearch, setCreatedItemSearch] = useState('')
  const [selectedRequestDetail, setSelectedRequestDetail] = useState(null)

  // 1. Initial Data Loading
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('kavachUser'))
    setCurrentUser(user)

    async function loadData() {
      try {
        setLoading(true)
        const statsData = await api.getStats()
        if (statsData) {
          setStats(prev => ({
            ...prev,
            ...statsData,
            readiness: statsData.readiness || 94
          }))
        }

        const tasksData = await api.getTasks()
        if (tasksData.length === 0) {
          const defaultTasks = [
            { title: 'Fleet Readiness Review', description: 'Inspect Arjun MK1A maintenance schedules for hangar bay 3.', priority: 'Critical', dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0] },
            { title: 'Weapon Calibration', description: 'Oversee regular barrel calibration testing on Arjun Unit #04.', priority: 'High', dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0] },
            { title: 'Submit Ammo Report', description: 'Compile weekly APFSDS munitions expenditure logs.', priority: 'Medium', dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0] }
          ]
          const createdTasks = []
          for (const dt of defaultTasks) {
            const task = await api.createTask(dt)
            createdTasks.push(task)
          }
          setTasks(createdTasks)
        } else {
          setTasks(tasksData)
        }

        const dbData = await api.getDashboardData()
        if (dbData) {
          setLeaveRequests(dbData.leaveRequests || [])
          setSpareRequests(dbData.spareRequests || [])
          setWorkOrders(dbData.workOrders || [])
          setIssues(dbData.issues || [])
          setUserMessages(dbData.messages || [])
          setEvents(dbData.events || [])
          setDocuments(dbData.documents || [])
          setActivityLogs(dbData.activityLogs || [])
          setAnnouncements(dbData.announcements || [])
        }

        if (user && user.role === 'Admin') {
          const usersData = await api.getUsers()
          setUsers(usersData)
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setErrorMsg('System initialization failed. Could not fetch security logs.')
      } finally {
        setLoading(false)
      }
    }

    loadData()

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Auto-dismiss notification toasts
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [errorMsg])

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMsg])

  // Refresh DB state helper
  const refreshDbData = async () => {
    try {
      const dbData = await api.getDashboardData()
      if (dbData) {
        setLeaveRequests(dbData.leaveRequests || [])
        setSpareRequests(dbData.spareRequests || [])
        setWorkOrders(dbData.workOrders || [])
        setIssues(dbData.issues || [])
        setUserMessages(dbData.messages || [])
        setActivityLogs(dbData.activityLogs || [])
        setAnnouncements(dbData.announcements || [])
      }
    } catch (e) {
      console.error('Failed to refresh data', e)
    }
  }

  // --- Task Operations ---
  const handleTaskSubmit = async (e) => {
    e.preventDefault()
    try {
      if (taskForm.id) {
        const updated = await api.updateTask(taskForm.id, {
          title: taskForm.title,
          description: taskForm.description,
          priority: taskForm.priority,
          status: taskForm.status,
          dueDate: taskForm.dueDate
        })
        setTasks(tasks.map(t => t._id === taskForm.id ? updated : t))
        setSuccessMsg('Tactical task updated in database.')
      } else {
        const created = await api.createTask(taskForm)
        setTasks([created, ...tasks])
        setSuccessMsg('New duty assigned to command log.')
      }
      setShowTaskModal(false)
      setTaskForm({ id: '', title: '', description: '', priority: 'Medium', status: 'Pending', dueDate: '' })
      refreshDbData()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sync task changes.')
    }
  }

  const handleEditTask = (task) => {
    setTaskForm({
      id: task._id,
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    })
    setShowTaskModal(true)
  }

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Confirm deletion of this tactical task?')) return
    try {
      await api.deleteTask(id)
      setTasks(tasks.filter(t => t._id !== id))
      setSuccessMsg('Task removed from tactical directory.')
      refreshDbData()
    } catch (err) {
      setErrorMsg('Failed to purge task.')
    }
  }

  const toggleTaskStatus = async (task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed'
      const updated = await api.updateTask(task._id, { status: newStatus })
      setTasks(tasks.map(t => t._id === task._id ? updated : t))
      setSuccessMsg(newStatus === 'Completed' ? 'Task marked COMPLETED.' : 'Task reverted to PENDING.')
      refreshDbData()
    } catch (err) {
      setErrorMsg('Failed to toggle task status.')
    }
  }

  // --- User Operations (Admin Only) ---
  const handleUserSubmit = async (e) => {
    e.preventDefault()
    try {
      if (userForm.id) {
        const payload = {
          username: userForm.username,
          fullName: userForm.fullName,
          email: userForm.email,
          role: userForm.role,
          isActive: userForm.isActive
        }
        if (userForm.password) payload.password = userForm.password

        const updated = await api.updateUser(userForm.id, payload)
        setUsers(users.map(u => u._id === userForm.id ? updated : u))
        setSuccessMsg(`Officer '${updated.username}' profile updated.`)
      } else {
        if (!userForm.password) {
          setErrorMsg('Initial passcode is required for new accounts.')
          return
        }
        const created = await api.createUser(userForm)
        setUsers([created, ...users])
        setSuccessMsg(`New officer '${created.username}' enlisted successfully.`)
      }
      setShowUserModal(false)
      setUserForm({ id: '', username: '', fullName: '', email: '', role: 'Operator', password: '', isActive: true })
      refreshDbData()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update credentials database.')
    }
  }

  const handleEditUser = (user) => {
    setUserForm({
      id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      password: '',
      isActive: user.isActive
    })
    setShowUserModal(true)
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('DANGER: Permanent action. Revoke credentials and purge officer profile?')) return
    try {
      await api.deleteUser(id)
      setUsers(users.filter(u => u._id !== id))
      setSuccessMsg('Security credentials revoked and profile purged.')
      refreshDbData()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to revoke user credentials.')
    }
  }

  const toggleUserActiveStatus = async (user) => {
    try {
      const updated = await api.updateUser(user._id, { isActive: !user.isActive })
      setUsers(users.map(u => u._id === user._id ? updated : u))
      setSuccessMsg(`Officer status modified: ${updated.isActive ? 'AUTHORIZED' : 'LOCKED'}`)
      refreshDbData()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to alter operational status.')
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!resetPasswordForm.userId || !resetPasswordForm.newPassword) {
      setErrorMsg('Select an officer and enter a new password.')
      return
    }
    try {
      await api.updateUser(resetPasswordForm.userId, { password: resetPasswordForm.newPassword })
      setSuccessMsg('Officer password reset successfully.')
      setShowResetPasswordModal(false)
      setResetPasswordForm({ userId: '', newPassword: '' })
      refreshDbData()
    } catch (err) {
      setErrorMsg(err.message || 'Password reset failed.')
    }
  }

  // --- Quick Action Router ---
  const handleQuickAction = (actionName) => {
    if (actionName === 'My requests view' || actionName === 'My Created Requests') {
      const el = document.getElementById('my-created-requests')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (actionName === 'Tasks view') {
      const el = document.getElementById('active-duties-list')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (actionName === 'Division scheduler' || actionName === 'Open Calendar') {
      const el = document.getElementById('tactical-calendar')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (actionName === 'Directives library') {
      const el = document.getElementById('directives-library')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (actionName === 'Arjun telemetry workbench') {
      const el = document.getElementById('active-duties-list')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      return
    }

    if (actionName === 'Leave application') { setShowActionModal('leave'); return }
    if (actionName === 'Inventory store request') { setShowActionModal('spare'); return }
    if (actionName === 'Hangar work order creation') { setShowActionModal('workorder'); return }
    if (actionName === 'Fault ticket creation') { setShowActionModal('issue'); return }
    if (actionName === 'Telemetry report compilation') { setShowActionModal('report'); return }
    if (actionName === 'Secure radio link') { setShowActionModal('message'); return }

    if (actionName === 'Edit User registry') {
      const el = document.getElementById('officer-registry')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (actionName === 'Reset Passcodes') { setShowResetPasswordModal(true); return }
    if (actionName === 'Assign Roles') {
      const el = document.getElementById('officer-registry')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      setSuccessMsg('Click EDIT on any officer in the registry to change their role.')
      return
    }
    if (actionName === 'Generate System Report') { setShowActionModal('report'); return }
    if (actionName === 'Audit Logs') { setShowAuditModal(true); return }

    const navMap = {
      'Navigate to Fleet': '/tank-overhaul',
      'Navigate to Inventory': '/registration',
      'Navigate to Personnel': '/frontline',
      'Navigate to Testing': '/telemetry',
      'Navigate to Reports': '/dygm-office',
      'Navigate to Notifications': '/dynamometer',
      'Navigate to Settings': '/dashboard'
    }
    if (navMap[actionName]) { navigate(navMap[actionName]); return }

    if (actionName.startsWith('Download ')) {
      setSuccessMsg(`Initiated secure download of ${actionName.replace('Download ', '')}`)
      return
    }

    if (['Pending Admin Approvals', 'Delayed Work Orders', 'Critical Maintenance', 'Pending User Requests', 'New Leave Applications'].includes(actionName)) {
      const el = document.getElementById('approval-queue')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (actionName === 'Documents Awaiting Approval') {
      const el = document.getElementById('directives-library')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (actionName === 'Pending Account Requests') {
      const el = document.getElementById('officer-registry')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (actionName === 'Recent Escalations') {
      const el = document.getElementById('tactical-faults')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      return
    }

    setSuccessMsg(`Executed directive: ${actionName}`)
  }

  // Submissions for Action Modals
  const handleLeaveSubmit = async (e) => {
    e.preventDefault()
    try {
      const created = await api.createLeaveRequest(leaveForm)
      setLeaveRequests([created, ...leaveRequests])
      setSuccessMsg('Leave application transmitted to HQ queue.')
      setShowActionModal(null)
      setLeaveForm({ duration: '12 Aug - 22 Aug (10 Days)', reason: 'Annual leave cycle request', priority: 'Medium' })
      refreshDbData()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit leave request.')
    }
  }

  const handleSpareSubmit = async (e) => {
    e.preventDefault()
    try {
      const created = await api.createSpareRequest(spareForm)
      setSpareRequests([created, ...spareRequests])
      setSuccessMsg('Parts requisition logged in inventory database.')
      setShowActionModal(null)
      setSpareForm({ item: 'Synthetic Lubricant 50L', qty: '2 barrels', dept: 'Mechanical Div', priority: 'High' })
      refreshDbData()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit spares request.')
    }
  }

  const handleWorkorderSubmit = async (e) => {
    e.preventDefault()
    try {
      const created = await api.createWorkOrder(workorderForm)
      setWorkOrders([created, ...workOrders])
      setSuccessMsg('Hangar work order successfully registered.')
      setShowActionModal(null)
      setWorkorderForm({ title: 'Engine Calibration Hangar 4', desc: 'Perform manual calibration check of fuel injectors.', dept: 'Mechanical Div', priority: 'High' })
      refreshDbData()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to log work order.')
    }
  }

  const handleIssueSubmit = async (e) => {
    e.preventDefault()
    try {
      const created = await api.createIssue(issueForm)
      setIssues([created, ...issues])
      setSuccessMsg('Fault ticket broadcasted to command dispatch.')
      setShowActionModal(null)
      setIssueForm({ title: 'Compressor Pressure Drop', desc: 'Main pressure drops below 10 bar under load.', dept: 'Mechanical Div', priority: 'High' })
      refreshDbData()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to log fault ticket.')
    }
  }

  const handleMessageReplySubmit = async (e, messageId) => {
    e.preventDefault()
    const inputVal = replyInput.text.trim()
    if (!inputVal) return
    try {
      const updated = await api.replyToMessage(messageId, inputVal)
      setUserMessages(userMessages.map(m => m._id === messageId ? updated : m))
      setReplyInput({ id: null, text: '' })
      setSuccessMsg('Secure message response transmitted.')
      refreshDbData()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send reply.')
    }
  }

  const handleRadioMessageSubmit = async (e) => {
    e.preventDefault()
    if (!messageForm.text.trim()) return
    try {
      const created = await api.createMessage({
        senderName: currentUser?.fullName || 'Capt. Rajesh Sharma',
        senderRole: currentUser?.role || 'Officer',
        text: messageForm.text
      })
      setUserMessages([created, ...userMessages])
      setSuccessMsg('Radio broadcast dispatched.')
      setShowActionModal(null)
      setMessageForm({ text: '' })
      refreshDbData()
    } catch (err) {
      setErrorMsg(err.message || 'Radio link error.')
    }
  }

  const handleReportSubmit = async (e) => {
    e.preventDefault()
    try {
      const titleName = reportForm.title || 'TECHNICAL TELEMETRY & MAINTENANCE DIRECTIVE'
      const title = `${titleName.replace(/\s+/g, '_').toUpperCase()}_${Date.now()}.pdf`
      const desc = `${reportForm.category} telemetry & fleet readiness report compiled.`
      const size = `${(Math.random() * 5 + 1).toFixed(1)} MB`
      const state = 'Signed off just now'

      const created = await api.createDocument({ title, desc, size, state })
      setDocuments([created, ...documents])
      
      const reportPayload = {
        title: titleName.toUpperCase(),
        reportId: `REP-505-${Math.floor(10000 + Math.random() * 90000)}`,
        timestamp: new Date().toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'medium' }),
        authorizingOfficer: currentUser?.fullName || 'Capt. Rajesh Sharma',
        role: currentUser?.role || 'Officer',
        category: reportForm.category,
        readiness: stats.readiness || 94,
        operationalTanks: stats.operationalTanks || 18,
        totalTanks: stats.totalTanks || 20,
        activeTasks: tasks.filter(t => t.status !== 'Completed').length,
        openIssues: issues.filter(i => i.status === 'Open').length,
        pendingApprovals: leaveRequests.filter(l => l.status === 'Pending').length + spareRequests.filter(s => s.status === 'Pending').length
      }

      setCompiledReportPreview(reportPayload)
      setShowActionModal(null)
      setSuccessMsg('Tactical Technical Report compiled and signed off.')
      refreshDbData()
    } catch (err) {
      setErrorMsg(err.message || 'Report compilation error.')
    }
  }

  const resolveApproval = async (type, id, status) => {
    try {
      await api.updateApproval(type, id, status)
      setSuccessMsg(`Request state updated to ${status.toUpperCase()}.`)
      refreshDbData()
    } catch (err) {
      setErrorMsg(err.message || 'Approval resolution failed.')
    }
  }

  const handleBroadcast = async (e) => {
    e.preventDefault()
    if (!adminAnnouncement.trim()) return
    try {
      const created = await api.broadcastAnnouncement(adminAnnouncement)
      setAnnouncements([created, ...announcements])
      setSuccessMsg('HQ DIRECTIVE BROADCASTED SUCCESSFULLY.')
      setAdminAnnouncement('')
      refreshDbData()
    } catch (err) {
      setErrorMsg(err.message || 'Broadcast failed.')
    }
  }

  const handleResolveIssue = async (id) => {
    try {
      const updated = await api.resolveIssue(id)
      setIssues(issues.map(i => i._id === id ? updated : i))
      setSuccessMsg('Fault ticket resolved.')
      refreshDbData()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resolve fault ticket.')
    }
  }

  // --- Dynamic Computations ---
  const getDeptHealth = useMemo(() => {
    const depts = [
      { name: 'Mechanical Division', key: 'Mechanical Div' },
      { name: 'Armor & Hull Wing', key: 'Armor & Hull' },
      { name: 'Munitions & Weapons', key: 'Munitions & Weapons' },
      { name: 'Optronics & Radar', key: 'Optronics & Radar' }
    ]

    return depts.map(d => {
      const deptOrders = (workOrders || []).filter(w => w.dept === d.key || w.dept?.includes(d.key.split(' ')[0]))
      const total = deptOrders.length
      const completed = deptOrders.filter(w => w.status === 'Approved' || w.status === 'Completed').length
      const pending = deptOrders.filter(w => w.status === 'Pending').length
      const rate = total > 0 ? Math.round((completed / total) * 100) : 95

      return {
        name: d.name,
        totalOrders: total,
        completedOrders: completed,
        pendingOrders: pending,
        completionRate: rate,
        status: rate >= 80 ? 'Optimal' : rate >= 50 ? 'Warning' : 'Critical'
      }
    })
  }, [workOrders])

  const combinedApprovals = useMemo(() => [
    ...(leaveRequests || []).filter(l => l.status === 'Pending').map(l => ({
      id: l._id,
      type: 'Leave Request',
      dept: 'HQ Command',
      priority: l.priority || 'Medium',
      requestedBy: l.fullName,
      duration: l.duration,
      dbType: 'leave'
    })),
    ...(spareRequests || []).filter(s => s.status === 'Pending').map(s => ({
      id: s._id,
      type: 'Parts Requisition',
      dept: s.dept,
      priority: s.priority || 'Medium',
      requestedBy: s.fullName,
      item: s.item,
      qty: s.qty,
      dbType: 'spare'
    })),
    ...(workOrders || []).filter(w => w.status === 'Pending').map(w => ({
      id: w._id,
      type: 'Work Order Approval',
      dept: w.dept,
      priority: w.priority || 'Medium',
      requestedBy: w.fullName,
      item: w.title,
      qty: w.desc,
      dbType: 'workorder'
    }))
  ], [leaveRequests, spareRequests, workOrders])

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.fullName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
      const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter
      return matchesSearch && matchesRole
    })
  }, [users, userSearchQuery, userRoleFilter])

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (taskFilterStatus === 'PENDING') return t.status !== 'Completed'
      if (taskFilterStatus === 'COMPLETED') return t.status === 'Completed'
      return true
    })
  }, [tasks, taskFilterStatus])

  const myCreatedItems = useMemo(() => {
    const allItems = [
      ...(workOrders || []).map(w => ({
        id: w._id,
        category: 'Work Order',
        icon: 'build',
        title: w.title,
        desc: w.desc,
        dept: w.dept,
        status: w.status,
        priority: w.priority || 'Medium',
        requester: w.fullName,
        createdAt: w.createdAt,
        dbType: 'workorder',
        raw: w
      })),
      ...(spareRequests || []).map(s => ({
        id: s._id,
        category: 'Spare Request',
        icon: 'inventory_2',
        title: s.item,
        desc: `Quantity: ${s.qty}`,
        dept: s.dept,
        status: s.status,
        priority: s.priority || 'Medium',
        requester: s.fullName,
        createdAt: s.createdAt,
        dbType: 'spare',
        raw: s
      })),
      ...(leaveRequests || []).map(l => ({
        id: l._id,
        category: 'Leave Request',
        icon: 'event_busy',
        title: `Leave (${l.duration})`,
        desc: l.reason || 'Annual leave application',
        dept: 'HQ Command',
        status: l.status,
        priority: l.priority || 'Medium',
        requester: l.fullName,
        createdAt: l.createdAt,
        dbType: 'leave',
        raw: l
      })),
      ...(issues || []).map(i => ({
        id: i._id,
        category: 'Fault Ticket',
        icon: 'warning',
        title: i.title,
        desc: i.desc,
        dept: i.dept,
        status: i.status,
        priority: i.priority || 'High',
        requester: i.fullName,
        createdAt: i.createdAt,
        dbType: 'issue',
        raw: i
      })),
      ...(tasks || []).map(t => ({
        id: t._id,
        category: 'Tactical Duty',
        icon: 'task_alt',
        title: t.title,
        desc: t.description || 'Command duty assignment',
        dept: 'Operations',
        status: t.status,
        priority: t.priority || 'Medium',
        requester: currentUser?.fullName || 'Self',
        createdAt: t.createdAt,
        dbType: 'task',
        raw: t
      })),
      ...(documents || []).map(d => ({
        id: d._id,
        category: 'Tech Report',
        icon: 'description',
        title: d.title,
        desc: `${d.desc || 'Technical Report'} (${d.size || 'Doc'})`,
        dept: 'Technical Div',
        status: d.state || 'Cataloged',
        priority: 'Medium',
        requester: currentUser?.fullName || 'Command HQ',
        createdAt: d.createdAt,
        dbType: 'document',
        raw: d
      }))
    ]

    return allItems.filter(item => {
      if (createdItemCategory !== 'ALL' && item.dbType !== createdItemCategory) return false

      if (createdItemStatus === 'PENDING' && !['Pending', 'Open'].includes(item.status)) return false
      if (createdItemStatus === 'APPROVED' && !['Approved', 'Resolved', 'Completed', 'Pinned', 'Signed off just now'].includes(item.status)) return false
      if (createdItemStatus === 'REJECTED' && item.status !== 'Rejected') return false

      if (createdItemSearch.trim()) {
        const q = createdItemSearch.toLowerCase()
        const matchTitle = item.title?.toLowerCase().includes(q)
        const matchDesc = item.desc?.toLowerCase().includes(q)
        const matchDept = item.dept?.toLowerCase().includes(q)
        const matchCat = item.category?.toLowerCase().includes(q)
        const matchReq = item.requester?.toLowerCase().includes(q)
        if (!matchTitle && !matchDesc && !matchDept && !matchCat && !matchReq) return false
      }

      return true
    }).sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()))
  }, [workOrders, spareRequests, leaveRequests, issues, tasks, documents, createdItemCategory, createdItemStatus, createdItemSearch, currentUser])

  const handleWithdrawRequest = async (item) => {
    if (!window.confirm(`Are you sure you want to withdraw / delete this ${item.category}: "${item.title}"?`)) return
    try {
      if (item.dbType === 'task') {
        await api.deleteTask(item.id)
        setTasks(prev => prev.filter(t => t._id !== item.id))
      } else {
        await api.deleteDashboardRequest(item.dbType, item.id)
        if (item.dbType === 'workorder') setWorkOrders(prev => prev.filter(w => w._id !== item.id))
        else if (item.dbType === 'spare') setSpareRequests(prev => prev.filter(s => s._id !== item.id))
        else if (item.dbType === 'leave') setLeaveRequests(prev => prev.filter(l => l._id !== item.id))
        else if (item.dbType === 'issue') setIssues(prev => prev.filter(i => i._id !== item.id))
        else if (item.dbType === 'document') setDocuments(prev => prev.filter(d => d._id !== item.id))
      }
      setSuccessMsg(`Successfully withdrawn ${item.category} request.`)
      if (selectedRequestDetail?.id === item.id) setSelectedRequestDetail(null)
      refreshDbData()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to withdraw request.')
    }
  }

  const renderStatusBadge = (status) => {
    if (status === 'Pending') {
      return (
        <span className="px-2 py-0.5 rounded text-[9px] font-label-caps font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> PENDING APPROVAL
        </span>
      )
    }
    if (status === 'Approved') {
      return (
        <span className="px-2 py-0.5 rounded text-[9px] font-label-caps font-bold bg-[#00ff41]/15 text-[#00ff41] border border-[#00ff41]/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41]"></span> APPROVED
        </span>
      )
    }
    if (status === 'Rejected') {
      return (
        <span className="px-2 py-0.5 rounded text-[9px] font-label-caps font-bold bg-error/20 text-error border border-error/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-error"></span> REJECTED
        </span>
      )
    }
    if (status === 'Open') {
      return (
        <span className="px-2 py-0.5 rounded text-[9px] font-label-caps font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span> OPEN FAULT
        </span>
      )
    }
    if (status === 'Resolved') {
      return (
        <span className="px-2 py-0.5 rounded text-[9px] font-label-caps font-bold bg-[#00ff41]/15 text-[#00ff41] border border-[#00ff41]/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41]"></span> RESOLVED
        </span>
      )
    }
    if (status === 'Completed') {
      return (
        <span className="px-2 py-0.5 rounded text-[9px] font-label-caps font-bold bg-[#00ff41]/15 text-[#00ff41] border border-[#00ff41]/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41]"></span> COMPLETED
        </span>
      )
    }
    return (
      <span className="px-2 py-0.5 rounded text-[9px] font-label-caps font-bold bg-primary/15 text-primary border border-primary/30 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> {status?.toUpperCase() || 'REGISTERED'}
      </span>
    )
  }

  // --- Created Requests & Orders Tracker Section ---
  const renderCreatedRequestsTracker = () => (
    <div id="my-created-requests" className="glass-panel p-5 rounded-lg border border-primary/30 space-y-4 shadow-xl">
      {/* Header & Quick Creation Launchers */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 pb-3">
        <div>
          <h3 className="text-xs sm:text-sm font-label-caps text-primary uppercase font-bold tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-primary animate-pulse">pending_actions</span>
            MY CREATED ORDERS & REQUESTS STATUS ({myCreatedItems.length})
          </h3>
          <p className="text-[10px] font-label-caps text-outline mt-0.5">
            TRACK ALL WORK ORDERS, SPARE REQUISITIONS, LEAVE APPLICATIONS, FAULT TICKETS, DUTIES & REPORTS CREATED BY YOU
          </p>
        </div>
      </div>

      {/* Category Counter Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
        {[
          { label: 'ALL ITEMS', key: 'ALL', count: (workOrders.length + spareRequests.length + leaveRequests.length + issues.length + tasks.length + documents.length), icon: 'apps' },
          { label: 'WORK ORDERS', key: 'workorder', count: workOrders.length, icon: 'build' },
          { label: 'SPARES REQ', key: 'spare', count: spareRequests.length, icon: 'inventory_2' },
          { label: 'LEAVE APPS', key: 'leave', count: leaveRequests.length, icon: 'event_busy' },
          { label: 'FAULT TICKETS', key: 'issue', count: issues.length, icon: 'warning' },
          { label: 'DUTY TASKS', key: 'task', count: tasks.length, icon: 'task_alt' },
          { label: 'TECH REPORTS', key: 'document', count: documents.length, icon: 'description' }
        ].map(cat => (
          <button
            key={cat.key}
            onClick={() => setCreatedItemCategory(cat.key)}
            className={`p-2 rounded border text-left transition-all ${createdItemCategory === cat.key ? 'bg-primary/20 border-primary text-primary font-bold shadow-md' : 'bg-surface-container-low/60 border-outline-variant/20 text-on-surface hover:border-primary/30'}`}
          >
            <div className="flex justify-between items-center text-[9px] font-label-caps text-outline">
              <span className="material-symbols-outlined text-xs">{cat.icon}</span>
              <span className="font-data-numeric text-xs font-bold text-on-surface">{cat.count}</span>
            </div>
            <div className="text-[10px] font-label-caps font-bold truncate mt-1">{cat.label}</div>
          </button>
        ))}
      </div>

      {/* Search & Status Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low/40 p-2.5 rounded border border-outline-variant/20">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-label-caps text-outline font-bold">STATUS FILTER:</span>
          <div className="flex bg-surface-container rounded p-0.5 border border-outline-variant/30 text-[10px] font-label-caps">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(st => (
              <button
                key={st}
                onClick={() => setCreatedItemStatus(st)}
                className={`px-2.5 py-0.5 rounded transition-all ${createdItemStatus === st ? 'bg-primary text-on-primary font-bold' : 'text-outline hover:text-on-surface'}`}
              >
                {st === 'PENDING' ? 'PENDING / OPEN' : st === 'APPROVED' ? 'APPROVED / RESOLVED' : st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <span className="material-symbols-outlined text-outline text-sm">search</span>
          <input
            type="text"
            placeholder="Filter by title, dept, item..."
            value={createdItemSearch}
            onChange={(e) => setCreatedItemSearch(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/30 text-xs px-2.5 py-1 rounded outline-none focus:border-primary text-on-surface"
          />
          {createdItemSearch && (
            <button onClick={() => setCreatedItemSearch('')} className="material-symbols-outlined text-xs text-outline hover:text-primary">close</button>
          )}
        </div>
      </div>

      {/* Items List Table View */}
      {myCreatedItems.length === 0 ? (
        <div className="py-12 text-center text-xs font-label-caps text-outline italic bg-surface-container-low/20 rounded border border-dashed border-outline-variant/30">
          NO CREATED ORDERS OR REQUESTS MATCHING THE CURRENT FILTERS.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
          {myCreatedItems.map(item => (
            <div
              key={`${item.dbType}-${item.id}`}
              className="p-3.5 bg-surface-container-low/60 hover:bg-surface-container-low border border-outline-variant/30 hover:border-primary/40 rounded-lg transition-all flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 group"
            >
              {/* Left info */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-label-caps font-bold px-2 py-0.5 bg-secondary/15 text-secondary border border-secondary/30 rounded">
                      {item.category.toUpperCase()}
                    </span>
                    <span className={`text-[8px] font-label-caps font-bold px-1.5 py-0.2 rounded ${
                      item.priority === 'Critical' ? 'bg-error/20 text-error border border-error/30' :
                      item.priority === 'High' ? 'bg-secondary/20 text-secondary border border-secondary/30' : 'bg-primary/10 text-primary'
                    }`}>
                      {item.priority} PRIORITY
                    </span>
                    <span className="text-[9px] font-label-caps text-outline font-data-numeric">
                      [{item.dept}]
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant line-clamp-1">{item.desc}</p>

                  <div className="text-[9px] font-label-caps text-outline font-data-numeric flex items-center gap-3">
                    <span>REQUESTER: {item.requester}</span>
                    {item.createdAt && (
                      <span>SUBMITTED: {new Date(item.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Status Badge & Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {renderStatusBadge(item.status)}

                <button
                  onClick={() => setSelectedRequestDetail(item)}
                  className="p-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface hover:text-primary rounded border border-outline-variant/30 transition-all flex items-center gap-1 text-[10px] font-label-caps"
                  title="Inspect Details"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  <span className="hidden sm:inline">VIEW</span>
                </button>

                <button
                  onClick={() => handleWithdrawRequest(item)}
                  className="p-1.5 bg-error/10 hover:bg-error/20 text-outline hover:text-error rounded border border-error/20 transition-all"
                  title="Withdraw / Delete Request"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background text-on-background overflow-hidden font-body w-full">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-container-low via-background to-background w-full pt-14 md:pt-0">

        {/* Top Operational Status Header */}
        <header className="min-h-16 py-3 md:py-0 border-b border-outline-variant/30 px-4 sm:px-6 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 bg-surface-container-lowest/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-xl sm:text-2xl animate-pulse">shield</span>
            <div>
              <h1 className="text-xs sm:text-sm font-label-caps text-on-surface font-bold tracking-wider uppercase">
                {currentUser?.role === 'Admin' ? 'HQ COMMAND DIRECTORATE // GENERAL DASHBOARD' : 'OFFICER TACTICAL COMMAND DESK'}
              </h1>
              <p className="text-[9px] sm:text-[10px] font-label-caps text-outline flex items-center gap-2">
                <span>505 ARMY BASE WORKSHOP</span> • <span>TACTICAL DIVISION</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-data-numeric">
            {/* Live Clock & DEFCON */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-surface-container-low rounded border border-outline-variant/30">
              <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-ping"></span>
              <span className="text-primary font-bold">{currentTime.toLocaleTimeString()} IST</span>
              <span className="text-outline font-label-caps text-[9px] ml-1">({currentTime.toISOString().split('T')[0]})</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[9px] sm:text-[10px] font-label-caps px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 font-bold">
                {currentUser?.role === 'Admin' ? 'ACCESS LEVEL: DIRECTORY ADMIN' : `DUTY ROLE: ${currentUser?.role?.toUpperCase() || 'OFFICER'}`}
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-primary text-xs">
                {currentUser?.username ? currentUser.username.substring(0, 2).toUpperCase() : 'CO'}
              </div>
            </div>
          </div>
        </header>

        {/* Global Toast Messages */}
        {errorMsg && (
          <div className="bg-error-container text-on-error-container text-xs px-4 py-2 border-b border-error/40 flex justify-between items-center animate-fadeIn">
            <span className="flex items-center gap-2 font-bold"><span className="material-symbols-outlined text-base">error</span> {errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="material-symbols-outlined text-sm">close</button>
          </div>
        )}
        {successMsg && (
          <div className="bg-primary-container text-on-primary-container text-xs px-4 py-2 border-b border-primary/40 flex justify-between items-center animate-fadeIn">
            <span className="flex items-center gap-2 font-bold"><span className="material-symbols-outlined text-base">check_circle</span> {successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="material-symbols-outlined text-sm">close</button>
          </div>
        )}

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">

          {/* ========================================================================================= */}
          {/* ADMIN DASHBOARD VIEW                                                                      */}
          {/* ========================================================================================= */}
          {currentUser?.role === 'Admin' ? (
            <div className="space-y-6">

              {/* Executive Summary Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="glass-panel p-4 rounded-lg border border-outline-variant/30 hover:border-primary/40 transition-all">
                  <div className="flex justify-between items-start text-outline text-[10px] font-label-caps">
                    <span>FLEET READINESS</span>
                    <span className="material-symbols-outlined text-primary text-lg">verified</span>
                  </div>
                  <div className="text-2xl font-bold font-data-numeric text-primary mt-1">{stats.readiness}%</div>
                  <div className="text-[10px] text-outline mt-1 font-label-caps flex justify-between">
                    <span>{stats.operationalTanks} Operational</span>
                    <span>{stats.totalTanks} Fleet Total</span>
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-lg border border-outline-variant/30 hover:border-secondary/40 transition-all">
                  <div className="flex justify-between items-start text-outline text-[10px] font-label-caps">
                    <span>ACTIVE WORK ORDERS</span>
                    <span className="material-symbols-outlined text-secondary text-lg">build</span>
                  </div>
                  <div className="text-2xl font-bold font-data-numeric text-secondary mt-1">{workOrders.length}</div>
                  <div className="text-[10px] text-outline mt-1 font-label-caps flex justify-between">
                    <span>{workOrders.filter(w => w.status === 'Pending').length} Pending Approval</span>
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-lg border border-outline-variant/30 hover:border-error/40 transition-all">
                  <div className="flex justify-between items-start text-outline text-[10px] font-label-caps">
                    <span>SYSTEM FAULTS</span>
                    <span className="material-symbols-outlined text-error text-lg">warning</span>
                  </div>
                  <div className="text-2xl font-bold font-data-numeric text-error mt-1">{issues.filter(i => i.status === 'Open').length}</div>
                  <div className="text-[10px] text-outline mt-1 font-label-caps flex justify-between">
                    <span>{issues.filter(i => i.status === 'Resolved').length} Resolved</span>
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-lg border border-outline-variant/30 hover:border-primary/40 transition-all">
                  <div className="flex justify-between items-start text-outline text-[10px] font-label-caps">
                    <span>ENROLLED OFFICERS</span>
                    <span className="material-symbols-outlined text-primary text-lg">group</span>
                  </div>
                  <div className="text-2xl font-bold font-data-numeric text-on-surface mt-1">{users.length}</div>
                  <div className="text-[10px] text-outline mt-1 font-label-caps flex justify-between">
                    <span>{users.filter(u => u.isActive).length} Active Personnel</span>
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-lg border border-outline-variant/30 hover:border-secondary/40 transition-all">
                  <div className="flex justify-between items-start text-outline text-[10px] font-label-caps">
                    <span>DIRECTIVES & SPECS</span>
                    <span className="material-symbols-outlined text-secondary text-lg">description</span>
                  </div>
                  <div className="text-2xl font-bold font-data-numeric text-secondary mt-1">{documents.length}</div>
                  <div className="text-[10px] text-outline mt-1 font-label-caps flex justify-between">
                    <span>Library Cataloged</span>
                  </div>
                </div>
              </div>

              {/* Admin Command Quick Action Bar */}
              <div className="glass-panel p-4 rounded-lg border border-outline-variant/30 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-label-caps text-primary font-bold">
                  <span className="material-symbols-outlined text-base">flash_on</span> ADMIN DIRECTIVES QUICK ACTION LAUNCHER:
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => { setUserForm({ id: '', username: '', fullName: '', email: '', role: 'Operator', password: '', isActive: true }); setShowUserModal(true) }} className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/40 text-primary text-xs font-label-caps rounded font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">person_add</span> ENLIST OFFICER
                  </button>
                  <button onClick={() => setShowResetPasswordModal(true)} className="px-3 py-1.5 bg-secondary/10 hover:bg-secondary/20 border border-secondary/40 text-secondary text-xs font-label-caps rounded font-bold flex items-center gap-1 cursor-pointer">
                    <span className="material-symbols-outlined text-sm">lock_reset</span> RESET PASSCODE
                  </button>
                  <button onClick={() => setShowAuditModal(true)} className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface text-xs font-label-caps rounded font-bold flex items-center gap-1 cursor-pointer">
                    <span className="material-symbols-outlined text-sm">history</span> AUDIT LOGS
                  </button>
                </div>
              </div>

              {/* Department Health Overview */}
              {/* <div className="glass-panel p-5 rounded-lg border border-outline-variant/30">
                <h3 className="text-xs font-label-caps text-primary uppercase font-bold tracking-widest border-b border-outline-variant/20 pb-3 mb-4 flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">monitor_heart</span> DEPARTMENT DIVISIONAL HEALTH
                  </span>
                  <span className="text-[9px] text-outline">LIVE DATABASE COMPUTATION</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {getDeptHealth.map((dept, idx) => (
                    <div key={idx} className="bg-surface-container-low/60 p-4 rounded border border-outline-variant/20 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-on-surface">{dept.name}</span>
                        <span className={`text-[9px] font-label-caps px-1.5 py-0.5 rounded font-bold ${dept.status === 'Optimal' ? 'bg-[#00ff41]/15 text-[#00ff41]' :
                          dept.status === 'Warning' ? 'bg-secondary/15 text-secondary' : 'bg-error/15 text-error'
                          }`}>{dept.status}</span>
                      </div>
                      <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${dept.completionRate >= 80 ? 'bg-[#00ff41]' : dept.completionRate >= 50 ? 'bg-secondary' : 'bg-error'
                          }`} style={{ width: `${dept.completionRate}%` }}></div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-outline font-data-numeric">
                        <span>{dept.completionRate}% Readiness</span>
                        <span>{dept.pendingOrders} Pending Work Orders</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div> */}

              {/* Created Requests & Orders Status Tracker */}
              {renderCreatedRequestsTracker()}

              {/* Two Column Layout: Approvals Queue & User Registry */}
              <div className="grid grid-cols-12 gap-6">

                {/* Left: Organization Approvals Queue */}
                <div id="approval-queue" className="col-span-12 lg:col-span-6 glass-panel p-5 rounded-lg border border-outline-variant/30 flex flex-col">
                  <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3 mb-4">
                    <h3 className="text-xs font-label-caps text-primary uppercase font-bold tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">assignment_turned_in</span> PENDING COMMAND APPROVALS ({combinedApprovals.length})
                    </h3>
                  </div>

                  {combinedApprovals.length === 0 ? (
                    <div className="py-12 text-center text-xs font-label-caps text-outline italic">ALL PENDING APPROVAL QUEUES ARE CLEAR.</div>
                  ) : (
                    <div className="space-y-3 max-h-[360px] overflow-y-auto custom-scrollbar pr-1 flex-1">
                      {combinedApprovals.map(req => (
                        <div key={req.id} className="p-3 bg-surface-container-low border border-outline-variant/20 rounded flex justify-between items-center text-xs hover:border-primary/30 transition-all">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-on-surface">{req.requestedBy}</span>
                              <span className="text-[9px] font-label-caps px-1.5 py-0.2 bg-primary/10 text-primary border border-primary/30 rounded">{req.type}</span>
                              <span className="text-[9px] font-label-caps text-outline font-data-numeric">[{req.dept}]</span>
                            </div>
                            <p className="text-[11px] text-on-surface-variant">
                              {req.item ? `${req.item} (${req.qty})` : req.duration}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button onClick={() => resolveApproval(req.dbType, req.id, 'Approved')} className="px-2.5 py-1 bg-primary/20 hover:bg-primary/30 text-primary font-label-caps text-[10px] font-bold rounded border border-primary/40 transition-colors">
                              APPROVE
                            </button>
                            <button onClick={() => resolveApproval(req.dbType, req.id, 'Rejected')} className="px-2.5 py-1 bg-error/20 hover:bg-error/30 text-error font-label-caps text-[10px] font-bold rounded border border-error/40 transition-colors">
                              REJECT
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: User/Officer Registry */}
                <div id="officer-registry" className="col-span-12 lg:col-span-6 glass-panel p-5 rounded-lg border border-outline-variant/30 flex flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-3 mb-4">
                    <h3 className="text-xs font-label-caps text-primary uppercase font-bold tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">account_tree</span> OFFICER REGISTRY ({filteredUsers.length})
                    </h3>

                    {/* Search & Role Filter */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Search officer..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="bg-surface-container-low border border-outline-variant/30 text-[11px] px-2 py-1 rounded outline-none focus:border-primary text-on-surface w-28 sm:w-36"
                      />
                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="bg-surface-container-low border border-outline-variant/30 text-[11px] px-2 py-1 rounded outline-none focus:border-primary text-on-surface"
                      >
                        <option value="ALL">ALL ROLES</option>
                        <option value="Admin">Admin</option>
                        <option value="Officer">Officer</option>
                        <option value="Operator">Operator</option>
                        <option value="User">User</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[360px] overflow-y-auto custom-scrollbar pr-1 flex-1">
                    {filteredUsers.length === 0 ? (
                      <div className="py-8 text-center text-xs font-label-caps text-outline italic">NO OFFICERS MATCHING QUERY.</div>
                    ) : (
                      filteredUsers.map(u => (
                        <div key={u._id} className="p-3 bg-surface-container-low border border-outline-variant/20 rounded flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-on-surface">{u.fullName || u.username}</span>
                              <span className="text-[9px] font-label-caps px-1.5 py-0.2 bg-secondary/15 text-secondary rounded">{u.role}</span>
                              <span className={`text-[8px] font-label-caps px-1 rounded ${u.isActive ? 'bg-[#00ff41]/20 text-[#00ff41]' : 'bg-error/20 text-error'}`}>
                                {u.isActive ? 'AUTHORIZED' : 'LOCKED'}
                              </span>
                            </div>
                            <div className="text-[10px] text-outline font-data-numeric">ID: {u.username} • {u.email}</div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setResetPasswordForm({ userId: u._id, newPassword: '' })
                                setShowResetPasswordModal(true)
                              }}
                              className="p-1 hover:bg-secondary/20 rounded text-secondary hover:text-secondary-fixed transition-colors cursor-pointer"
                              title={`Reset Passcode for ${u.fullName || u.username}`}
                            >
                              <span className="material-symbols-outlined text-sm">lock_reset</span>
                            </button>
                            <button onClick={() => toggleUserActiveStatus(u)} className="p-1 hover:bg-surface-container-high rounded text-outline hover:text-primary transition-colors cursor-pointer" title={u.isActive ? 'Lock Account' : 'Authorize Account'}>
                              <span className="material-symbols-outlined text-sm">{u.isActive ? 'lock' : 'lock_open'}</span>
                            </button>
                            <button onClick={() => handleEditUser(u)} className="p-1 hover:bg-surface-container-high rounded text-outline hover:text-primary transition-colors cursor-pointer" title="Edit Profile & Role">
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                            <button onClick={() => handleDeleteUser(u._id)} className="p-1 hover:bg-error/20 rounded text-outline hover:text-error transition-colors cursor-pointer" title="Purge Profile">
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom Section: Faults & Announcement Broadcast */}
              <div className="grid grid-cols-12 gap-6">

                {/* Left: Tactical Fault Tickets */}
                <div id="tactical-faults" className="col-span-12 lg:col-span-7 glass-panel p-5 rounded-lg border border-outline-variant/30">
                  <h3 className="text-xs font-label-caps text-primary uppercase font-bold tracking-widest border-b border-outline-variant/20 pb-3 mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">report_problem</span> REPORTED EQUIPMENT FAULTS ({issues.filter(i => i.status === 'Open').length})
                    </span>
                    <button onClick={() => setShowActionModal('issue')} className="text-[9px] font-label-caps text-primary hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">add</span> REPORT FAULT
                    </button>
                  </h3>

                  {issues.length === 0 ? (
                    <div className="py-8 text-center text-xs font-label-caps text-outline italic">NO ACTIVE FAULT TICKETS IN SYSTEM REGISTRY.</div>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                      {issues.map(issue => (
                        <div key={issue._id} className="p-3 bg-surface-container-low border border-outline-variant/20 rounded flex justify-between items-center text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[8px] font-label-caps px-1.5 py-0.2 rounded font-bold ${issue.status === 'Open' ? 'bg-error/20 text-error' : 'bg-[#00ff41]/20 text-[#00ff41]'
                                }`}>{issue.status.toUpperCase()}</span>
                              <span className="font-bold text-on-surface">{issue.title}</span>
                              <span className="text-[9px] font-label-caps text-outline">[{issue.dept}]</span>
                            </div>
                            <p className="text-[11px] text-on-surface-variant mt-0.5">{issue.desc}</p>
                          </div>

                          {issue.status === 'Open' && (
                            <button onClick={() => handleResolveIssue(issue._id)} className="px-2.5 py-1 bg-[#00ff41]/20 hover:bg-[#00ff41]/30 text-[#00ff41] font-label-caps text-[9px] font-bold rounded border border-[#00ff41]/40">
                              MARK RESOLVED
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Broadcast HQ Directive */}
                <div className="col-span-12 lg:col-span-5 glass-panel p-5 rounded-lg border border-outline-variant/30 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-label-caps text-primary uppercase font-bold tracking-widest border-b border-outline-variant/20 pb-3 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">campaign</span> BROADCAST HQ COMMAND DIRECTIVE
                    </h3>
                    <form onSubmit={handleBroadcast} className="space-y-3">
                      <textarea
                        rows="3"
                        required
                        value={adminAnnouncement}
                        onChange={(e) => setAdminAnnouncement(e.target.value)}
                        placeholder="Type urgent directive to broadcast across all officer dashboards..."
                        className="w-full bg-surface-container-low border border-outline-variant/30 text-xs p-3 rounded focus:border-primary outline-none text-on-surface resize-none"
                      />
                      <button type="submit" className="w-full py-2 bg-primary hover:bg-primary/90 text-on-primary font-label-caps text-xs font-bold tracking-widest rounded transition-all flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-sm">send</span> TRANSMIT BROADCAST
                      </button>
                    </form>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* ========================================================================================= */
            /* USER / OFFICER DASHBOARD VIEW                                                             */
            /* ========================================================================================= */
            <div className="space-y-6">

              {/* Personalized Officer Header */}
              <div className="glass-panel p-6 rounded-lg border border-outline-variant/30 relative overflow-hidden">
                <div className="flex flex-wrap justify-between items-center gap-4 relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-label-caps text-primary font-bold">
                      <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-ping"></span> ON ACTIVE SHIFT // DUTY ACCESS GRANTED
                    </div>
                    <h2 className="text-xl font-bold text-on-surface tracking-wide">
                      Welcome, {currentUser?.fullName || 'Capt. Rajesh Sharma'}
                    </h2>
                    <p className="text-xs text-outline font-label-caps">
                      505 ARMY BASE WORKSHOP • MECHANICAL DIVISION • SHIFT ALPHA
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs bg-surface-container-low/60 px-4 py-2.5 rounded border border-outline-variant/20">
                    <span className="material-symbols-outlined text-primary text-xl">military_tech</span>
                    <div>
                      <div className="font-bold text-primary font-data-numeric">{tasks.filter(t => t.status !== 'Completed').length} DUTIES DUE</div>
                      <div className="text-[9px] text-outline font-label-caps">TODAY SCHED</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-outline-variant/20 text-xs italic text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">stars</span>
                  <span>"Duty, Honor, Country. Those three hallowed words reverently dictate what you ought to be." — Gen. Douglas MacArthur</span>
                </div>
              </div>

              {/* Real Data User Operational KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="glass-panel p-4 rounded-lg border border-outline-variant/30 hover:border-primary/40 transition-all">
                  <div className="flex justify-between items-start text-outline text-[10px] font-label-caps">
                    <span>FLEET READINESS</span>
                    <span className="material-symbols-outlined text-primary text-lg">verified</span>
                  </div>
                  <div className="text-2xl font-bold font-data-numeric text-primary mt-1">{stats.readiness}%</div>
                  <div className="text-[10px] text-outline mt-1 font-label-caps flex justify-between">
                    <span>{stats.operationalTanks} / {stats.totalTanks} Operational</span>
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-lg border border-outline-variant/30 hover:border-secondary/40 transition-all">
                  <div className="flex justify-between items-start text-outline text-[10px] font-label-caps">
                    <span>ACTIVE DUTIES</span>
                    <span className="material-symbols-outlined text-secondary text-lg">task_alt</span>
                  </div>
                  <div className="text-2xl font-bold font-data-numeric text-secondary mt-1">
                    {tasks.filter(t => t.status !== 'Completed').length}
                  </div>
                  <div className="text-[10px] text-outline mt-1 font-label-caps flex justify-between">
                    <span>{tasks.filter(t => t.status === 'Completed').length} Completed Today</span>
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-lg border border-outline-variant/30 hover:border-primary/40 transition-all">
                  <div className="flex justify-between items-start text-outline text-[10px] font-label-caps">
                    <span>WORK ORDERS</span>
                    <span className="material-symbols-outlined text-primary text-lg">build</span>
                  </div>
                  <div className="text-2xl font-bold font-data-numeric text-on-surface mt-1">
                    {workOrders.filter(w => w.status === 'Pending' || w.status === 'In Progress').length}
                  </div>
                  <div className="text-[10px] text-outline mt-1 font-label-caps flex justify-between">
                    <span>{workOrders.length} Total Hangar Orders</span>
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-lg border border-outline-variant/30 hover:border-secondary/40 transition-all">
                  <div className="flex justify-between items-start text-outline text-[10px] font-label-caps">
                    <span>PENDING REQUISITIONS</span>
                    <span className="material-symbols-outlined text-secondary text-lg">pending_actions</span>
                  </div>
                  <div className="text-2xl font-bold font-data-numeric text-secondary mt-1">
                    {leaveRequests.filter(l => l.status === 'Pending').length + spareRequests.filter(s => s.status === 'Pending').length}
                  </div>
                  <div className="text-[10px] text-outline mt-1 font-label-caps flex justify-between">
                    <span>{spareRequests.length} Spares • {leaveRequests.length} Leaves</span>
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-lg border border-outline-variant/30 hover:border-error/40 transition-all">
                  <div className="flex justify-between items-start text-outline text-[10px] font-label-caps">
                    <span>OPEN SYSTEM FAULTS</span>
                    <span className="material-symbols-outlined text-error text-lg">warning</span>
                  </div>
                  <div className="text-2xl font-bold font-data-numeric text-error mt-1">
                    {issues.filter(i => i.status === 'Open').length}
                  </div>
                  <div className="text-[10px] text-outline mt-1 font-label-caps flex justify-between">
                    <span>{issues.filter(i => i.status === 'Resolved').length} Resolved</span>
                  </div>
                </div>
              </div>

              {/* Quick Action Launcher Grid */}
              <div className="glass-panel p-5 rounded-lg border border-outline-variant/30">
                <h3 className="text-xs font-label-caps text-secondary uppercase font-bold tracking-widest border-b border-outline-variant/20 pb-3 mb-4">
                  COMMAND QUICK ACTIONS LAUNCHER
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: 'View Tasks', icon: 'list_alt', action: 'Tasks view' },
                    { label: 'Create Order', icon: 'build', action: 'Hangar work order creation' },
                    { label: 'Request Spares', icon: 'shopping_cart', action: 'Inventory store request' },
                    { label: 'Apply Leave', icon: 'calendar_today', action: 'Leave application' },
                    { label: 'Report Fault', icon: 'warning', action: 'Fault ticket creation' },
                    { label: 'Radio Transmission', icon: 'chat', action: 'Secure radio link' },
                    { label: 'Directives', icon: 'folder_open', action: 'Directives library' },
                    { label: 'Division Calendar', icon: 'event', action: 'Division scheduler' },
                    { label: 'My Requests Status', icon: 'pending_actions', action: 'My requests view' },
                    { label: 'Fleet Digital Twin', icon: 'grid_view', action: 'Navigate to Fleet' }
                  ].map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(act.action)}
                      className="p-3 bg-surface-container/60 hover:bg-surface-container-high border border-outline-variant/30 hover:border-primary/40 rounded flex flex-col items-center text-center gap-2 group transition-all"
                    >
                      <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">{act.icon}</span>
                      <span className="font-label-caps text-[9px] text-on-surface uppercase tracking-wider font-semibold leading-tight">{act.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Created Requests & Orders Status Tracker */}
              {renderCreatedRequestsTracker()}

              {/* Main Content Split: Left (Tasks + Directives) / Right (Schedule, Messages, Activity) */}
              <div className="grid grid-cols-12 gap-6">

                {/* Left Column (8 cols): Tasks & Directives */}
                <div className="col-span-12 lg:col-span-8 space-y-6">

                  {/* Active Duties List (Interactive CRUD) */}
                  <div id="active-duties-list" className="glass-panel p-5 rounded-lg border border-outline-variant/30">
                    <div className="flex flex-wrap justify-between items-center gap-2 border-b border-outline-variant/20 pb-3 mb-4">
                      <h3 className="text-xs font-label-caps text-primary uppercase font-bold tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">assignment_turned_in</span> ACTIVE COMMAND DUTIES ({filteredTasks.length})
                      </h3>

                      <div className="flex items-center gap-3">
                        {/* Task Status Filter */}
                        <div className="flex bg-surface-container-low rounded p-0.5 border border-outline-variant/30 text-[10px] font-label-caps">
                          {['ALL', 'PENDING', 'COMPLETED'].map(st => (
                            <button
                              key={st}
                              onClick={() => setTaskFilterStatus(st)}
                              className={`px-2 py-0.5 rounded transition-all ${taskFilterStatus === st ? 'bg-primary text-on-primary font-bold' : 'text-outline hover:text-on-surface'}`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            setTaskForm({ id: '', title: '', description: '', priority: 'Medium', status: 'Pending', dueDate: '' })
                            setShowTaskModal(true)
                          }}
                          className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 border border-primary/35 hover:border-primary/50 text-primary font-label-caps text-[10px] tracking-wider rounded transition-all flex items-center gap-1 font-bold"
                        >
                          <span className="material-symbols-outlined text-xs">add</span> ASSIGN DUTY
                        </button>
                      </div>
                    </div>

                    {filteredTasks.length === 0 ? (
                      <div className="py-8 text-center text-xs font-label-caps text-outline italic">NO COMMAND DUTIES MATCHING FILTER.</div>
                    ) : (
                      <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                        {filteredTasks.map(task => (
                          <div
                            key={task._id}
                            className={`p-3 border rounded transition-all flex items-start gap-3 ${task.status === 'Completed'
                              ? 'bg-surface-container-lowest/30 border-outline-variant/20 opacity-60'
                              : 'bg-surface-container-low/50 border-outline-variant/30 hover:border-primary/30'
                              }`}
                          >
                            <button
                              onClick={() => toggleTaskStatus(task)}
                              className="mt-0.5 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded border border-primary/40 hover:bg-primary/10 text-primary"
                            >
                              {task.status === 'Completed' && <span className="material-symbols-outlined text-xs font-black">done</span>}
                            </button>

                            <div className="flex-1 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className={`text-xs font-bold ${task.status === 'Completed' ? 'line-through text-outline' : 'text-on-surface'}`}>
                                  {task.title}
                                </h4>
                                <span className={`px-1.5 py-0.2 text-[8px] font-label-caps font-bold rounded ${task.priority === 'Critical' ? 'bg-error/20 text-error border border-error/30' :
                                  task.priority === 'High' ? 'bg-secondary/20 text-secondary border border-secondary/30' : 'bg-primary/10 text-primary'
                                  }`}>{task.priority}</span>
                              </div>
                              {task.description && <p className="text-[11px] text-on-surface-variant">{task.description}</p>}
                              {task.dueDate && (
                                <div className="text-[9px] font-label-caps text-outline flex items-center gap-1 font-data-numeric">
                                  <span className="material-symbols-outlined text-[10px]">calendar_today</span> DUE: {new Date(task.dueDate).toLocaleDateString('en-GB')}
                                </div>
                              )}
                            </div>

                            <div className="flex gap-1">
                              <button onClick={() => handleEditTask(task)} className="p-1 hover:bg-surface-container-high rounded text-outline hover:text-primary">
                                <span className="material-symbols-outlined text-xs">edit</span>
                              </button>
                              <button onClick={() => handleDeleteTask(task._id)} className="p-1 hover:bg-error/20 rounded text-outline hover:text-error">
                                <span className="material-symbols-outlined text-xs">delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Technical Directives & Specs Library */}
                  <div id="directives-library" className="glass-panel p-5 rounded-lg border border-outline-variant/30">
                    <h3 className="text-xs font-label-caps text-primary uppercase font-bold tracking-widest border-b border-outline-variant/20 pb-3 mb-3 flex justify-between items-center">
                      <span>TECHNICAL DIRECTIVES & MANUALS CATALOG</span>
                      <span className="text-[9px] font-label-caps text-outline">{documents.length} CATALOGED</span>
                    </h3>
                    <div className="space-y-2 text-xs">
                      {documents.map(doc => (
                        <div key={doc._id} className="p-2.5 bg-surface-container-low/50 border border-outline-variant/20 rounded flex justify-between items-center hover:border-primary/20 transition-all">
                          <div className="flex gap-3 items-center overflow-hidden">
                            <span className="material-symbols-outlined text-primary text-xl flex-shrink-0">description</span>
                            <div className="overflow-hidden">
                              <span className="font-bold text-on-surface block truncate">{doc.title}</span>
                              <span className="text-[9px] text-outline font-label-caps block truncate">{doc.desc} // {doc.size}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[8px] font-label-caps bg-surface-container-high px-1.5 py-0.5 text-primary rounded">{doc.state}</span>
                            <button onClick={() => handleQuickAction(`Download ${doc.title}`)} className="p-1 hover:bg-surface-container rounded text-outline hover:text-primary">
                              <span className="material-symbols-outlined text-base">download</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Column (4 cols): Schedule, Messages, Activity */}
                <div className="col-span-12 lg:col-span-4 space-y-6">

                  {/* Tactical Calendar Schedule */}
                  <div id="tactical-calendar" className="glass-panel p-5 rounded-lg border border-outline-variant/30">
                    <h3 className="text-xs font-label-caps text-primary uppercase font-bold tracking-widest border-b border-outline-variant/20 pb-3 mb-3">
                      TODAY'S SCHEDULE & AUDITS
                    </h3>
                    <div className="space-y-2 text-xs">
                      {events.length === 0 ? (
                        <div className="text-[11px] text-outline italic">No calendar events scheduled today.</div>
                      ) : (
                        events.map((ev, idx) => (
                          <div key={ev._id || idx} className="p-2 bg-surface-container-low/50 border-l-2 border-primary rounded flex justify-between items-center text-xs font-data-numeric">
                            <div>
                              <span className="font-bold text-primary mr-1">[{ev.time}]</span>
                              <span className="text-on-surface font-body">{ev.title}</span>
                            </div>
                            <span className="text-[9px] font-label-caps px-1 bg-surface-container-high text-outline rounded">{ev.status}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Internal Radio Transmission & Messages */}
                  <div className="glass-panel p-5 rounded-lg border border-outline-variant/30">
                    <h3 className="text-xs font-label-caps text-primary uppercase font-bold tracking-widest border-b border-outline-variant/20 pb-3 mb-3 flex justify-between items-center">
                      <span>INTERNAL MESSAGES</span>
                      <span className="px-1.5 py-0.5 bg-secondary/15 text-secondary text-[9px] font-label-caps rounded">
                        {userMessages.filter(m => m.unread).length} UNREAD
                      </span>
                    </h3>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                      {userMessages.map(msg => (
                        <div key={msg._id} className={`p-3 rounded border text-xs space-y-2 ${msg.unread ? 'bg-secondary/5 border-secondary/30' : 'bg-surface-container-low/40 border-outline-variant/20'}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-on-surface uppercase block">{msg.senderName}</span>
                              <span className="text-[9px] text-outline font-label-caps">{msg.senderRole}</span>
                            </div>
                            {msg.unread && <span className="w-2 h-2 bg-secondary rounded-full inline-block animate-pulse"></span>}
                          </div>
                          <p className="text-[11px] text-on-surface-variant">{msg.text}</p>

                          {(msg.replies || []).map((rep, rIdx) => (
                            <div key={rIdx} className="bg-black/20 p-2 rounded border border-outline-variant/10 text-[10px] ml-3">
                              <span className="text-primary font-bold">{rep.senderName}: </span>
                              <span className="text-on-surface-variant">{rep.text}</span>
                            </div>
                          ))}

                          {replyInput.id === msg._id ? (
                            <form onSubmit={(e) => handleMessageReplySubmit(e, msg._id)} className="flex gap-2">
                              <input
                                value={replyInput.text}
                                onChange={(e) => setReplyInput({ ...replyInput, text: e.target.value })}
                                placeholder="Type secure reply..."
                                className="flex-1 bg-surface-container-low border border-outline-variant/30 text-[11px] px-2 py-1 rounded outline-none focus:border-secondary text-on-surface"
                                type="text"
                                autoFocus
                              />
                              <button type="submit" className="px-2 py-1 bg-secondary text-on-secondary font-label-caps text-[9px] font-bold rounded">SEND</button>
                              <button type="button" onClick={() => setReplyInput({ id: null, text: '' })} className="p-1 text-outline"><span className="material-symbols-outlined text-[11px]">close</span></button>
                            </form>
                          ) : (
                            <button onClick={() => setReplyInput({ id: msg._id, text: '' })} className="text-[9px] font-label-caps text-secondary flex items-center gap-1 hover:underline">
                              <span className="material-symbols-outlined text-[10px]">reply</span> SECURE REPLY
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Personal Activity Timeline (Fixed Flex Spacing) */}
                  <div className="glass-panel p-5 rounded-lg border border-outline-variant/30">
                    <h3 className="text-xs font-label-caps text-primary uppercase font-bold tracking-widest border-b border-outline-variant/20 pb-3 mb-3">
                      MY RECENT ACTIVITY TIMELINE
                    </h3>
                    <div className="space-y-3">
                      {activityLogs.length === 0 ? (
                        <div className="text-[11px] text-outline italic">No activity logged.</div>
                      ) : (
                        activityLogs.slice(0, 5).map(act => (
                          <div key={act._id} className="flex items-start gap-3 text-xs bg-surface-container-low/40 p-2.5 rounded border border-outline-variant/20 hover:border-primary/30 transition-all">
                            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                              <span className="material-symbols-outlined text-sm">{act.icon || 'history'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-on-surface leading-snug">{act.text}</div>
                              <div className="text-[9px] text-outline font-data-numeric mt-0.5">
                                {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </main>
      </div>

      {/* ========================================================================================= */}
      {/* ALL MODAL WINDOWS                                                                         */}
      {/* ========================================================================================= */}

      {/* 1. Task Modal (Create / Edit) */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-lg border border-primary/30 relative">
            <button onClick={() => setShowTaskModal(false)} className="absolute top-4 right-4 text-outline hover:text-primary">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-sm font-label-caps text-primary uppercase font-bold tracking-widest border-b border-outline-variant/20 pb-2 mb-4">
              {taskForm.id ? 'Modify Command Duty' : 'Assign New Command Duty'}
            </h3>
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-label-caps text-outline block">DUTY TITLE</label>
                <input required value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Review fleet logs..." className="w-full bg-surface-container-low border border-outline-variant/30 text-xs px-3 py-2 rounded focus:border-primary outline-none text-on-surface" type="text" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-label-caps text-outline block">DESCRIPTION</label>
                <textarea rows="3" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Task details..." className="w-full bg-surface-container-low border border-outline-variant/30 text-xs px-3 py-2 rounded focus:border-primary outline-none text-on-surface resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-label-caps text-outline block">PRIORITY</label>
                  <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} className="w-full bg-surface-container-low border border-outline-variant/30 text-xs px-3 py-2 rounded focus:border-primary outline-none text-on-surface">
                    <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-label-caps text-outline block">DUE DATE</label>
                  <input value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="w-full bg-surface-container-low border border-outline-variant/30 text-xs px-3 py-2 rounded focus:border-primary outline-none text-on-surface font-data-numeric" type="date" />
                </div>
              </div>
              <button type="submit" className="w-full py-2 bg-primary hover:bg-primary/90 text-on-primary font-label-caps text-xs tracking-widest rounded transition-all font-bold">SAVE DUTY ASSIGNMENT</button>
            </form>
          </div>
        </div>
      )}

      {/* 2. User Enlistment Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-lg border border-secondary/30 relative">
            <button onClick={() => setShowUserModal(false)} className="absolute top-4 right-4 text-outline hover:text-secondary">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-sm font-label-caps text-secondary uppercase font-bold tracking-widest border-b border-outline-variant/20 pb-2 mb-4">
              {userForm.id ? 'Modify Officer Profile' : 'Enlist New Officer / Operator'}
            </h3>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-label-caps text-outline block">FULL NAME</label>
                <input required value={userForm.fullName} onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })} placeholder="EX: Capt. Amit Rawat" className="w-full bg-surface-container-low border border-outline-variant/30 text-xs px-3 py-2 rounded focus:border-secondary outline-none text-on-surface" type="text" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-label-caps text-outline block">SERVICE ID / USERNAME</label>
                <input required value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} placeholder="EX: rawat" className="w-full bg-surface-container-low border border-outline-variant/30 text-xs px-3 py-2 rounded focus:border-secondary outline-none text-on-surface font-data-numeric" type="text" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-label-caps text-outline block">EMAIL ADDRESS</label>
                <input required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} placeholder="EX: rawat@base.mil" className="w-full bg-surface-container-low border border-outline-variant/30 text-xs px-3 py-2 rounded focus:border-secondary outline-none text-on-surface" type="email" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-label-caps text-outline block">ASSIGNED ROLE</label>
                  <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="w-full bg-surface-container-low border border-outline-variant/30 text-xs px-3 py-2 rounded focus:border-secondary outline-none text-on-surface">
                    <option value="Operator">Operator</option><option value="User">User</option><option value="Officer">Officer</option><option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-label-caps text-outline block">{userForm.id ? 'PASSCODE (OPTIONAL)' : 'PASSCODE'}</label>
                  <input required={!userForm.id} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} placeholder="••••••••" className="w-full bg-surface-container-low border border-outline-variant/30 text-xs px-3 py-2 rounded focus:border-secondary outline-none text-on-surface" type="password" />
                </div>
              </div>
              <div className="flex items-center gap-2 py-1">
                <input id="user-active" checked={userForm.isActive} onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })} type="checkbox" className="rounded bg-surface-container-low text-secondary focus:ring-0" />
                <label htmlFor="user-active" className="text-xs font-label-caps text-on-surface">AUTHORIZED FOR SYSTEM ACCESS</label>
              </div>
              <button type="submit" className="w-full py-2 bg-secondary hover:bg-secondary/90 text-on-secondary font-label-caps text-xs tracking-widest rounded transition-all font-bold">SAVE OFFICER CREDENTIALS</button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Action Modals (Leave / Spare / WorkOrder / Issue / Report / Message) */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-lg border border-primary/30 relative">
            <button onClick={() => setShowActionModal(null)} className="absolute top-4 right-4 text-outline hover:text-primary">
              <span className="material-symbols-outlined">close</span>
            </button>

            {showActionModal === 'leave' && (
              <>
                <h3 className="text-sm font-label-caps text-primary uppercase font-bold tracking-widest border-b border-outline-variant/20 pb-2 mb-4">Submit Leave Application</h3>
                <form onSubmit={handleLeaveSubmit} className="space-y-4">
                  <div className="space-y-1"><label className="text-[10px] font-label-caps text-outline block">DURATION</label><input required value={leaveForm.duration} onChange={(e) => setLeaveForm({ ...leaveForm, duration: e.target.value })} className="w-full bg-surface-container-low border border-outline-variant/30 text-xs px-3 py-2 rounded outline-none text-on-surface" type="text" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-label-caps text-outline block">REASON</label><textarea rows="2" value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} className="w-full bg-surface-container-low border border-outline-variant/30 text-xs px-3 py-2 rounded outline-none text-on-surface resize-none" /></div>
                  <button type="submit" className="w-full py-2 bg-primary text-on-primary font-label-caps text-xs font-bold rounded">SUBMIT LEAVE APPLICATION</button>
                </form>
              </>
            )}

            {showActionModal === 'spare' && (
              <>
                <h3 className="text-sm font-label-caps text-primary uppercase font-bold tracking-widest border-b border-outline-variant/20 pb-2 mb-4">Requisition Inventory Spares</h3>
                <form onSubmit={handleSpareSubmit} className="space-y-4">
                  <div className="space-y-1"><label className="text-[10px] font-label-caps text-outline block">ITEM</label><input required value={spareForm.item} onChange={(e) => setSpareForm({ ...spareForm, item: e.target.value })} className="w-full bg-surface-container-low border border-outline-variant/30 text-xs px-3 py-2 rounded outline-none text-on-surface" type="text" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] font-label-caps text-outline block">QUANTITY</label><input required value={spareForm.qty} onChange={(e) => setSpareForm({ ...spareForm, qty: e.target.value })} className="w-full bg-surface-container-low border border-outline-variant/30 text-xs px-3 py-2 rounded outline-none text-on-surface" type="text" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-label-caps text-outline block">DEPARTMENT</label><input required value={spareForm.dept} onChange={(e) => setSpareForm({ ...spareForm, dept: e.target.value })} className="w-full bg-surface-container-low border border-outline-variant/30 text-xs px-3 py-2 rounded outline-none text-on-surface" type="text" /></div>
                  </div>
                  <button type="submit" className="w-full py-2 bg-primary text-on-primary font-label-caps text-xs font-bold rounded">TRANSMIT REQUISITION</button>
                </form>
              </>
            )}

            {showActionModal === 'workorder' && (
              <>
                <h3 className="text-sm font-label-caps text-primary uppercase font-bold tracking-widest border-b border-outline-variant/20 pb-2 mb-4">Create Maintenance Work Order</h3>
                <form onSubmit={handleWorkorderSubmit} className="space-y-4">
                  <div className="space-y-1"><label className="text-[10px] font-label-caps text-outline block">ORDER TITLE</label><input required value={workorderForm.title} onChange={(e) => setWorkorderForm({ ...workorderForm, title: e.target.value })} className="w-full bg-surface-container-low border border-outline-variant/30 text-xs px-3 py-2 rounded outline-none text-on-surface" type="text" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-label-caps text-outline block">DESCRIPTION</label><textarea rows="2" value={workorderForm.desc} onChange={(e) => setWorkorderForm({ ...workorderForm, desc: e.target.value })} className="w-full bg-surface-container-low border border-outline-variant/30 text-xs px-3 py-2 rounded outline-none text-on-surface resize-none" /></div>
                  <button type="submit" className="w-full py-2 bg-primary text-on-primary font-label-caps text-xs font-bold rounded">REGISTER WORK ORDER</button>
                </form>
              </>
            )}

            {showActionModal === 'issue' && (
              <>
                <h3 className="text-sm font-label-caps text-error uppercase font-bold tracking-widest border-b border-outline-variant/20 pb-2 mb-4">Report System Fault</h3>
                <form onSubmit={handleIssueSubmit} className="space-y-4">
                  <div className="space-y-1"><label className="text-[10px] font-label-caps text-outline block">FAULT TITLE</label><input required value={issueForm.title} onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })} className="w-full bg-surface-container-low border border-outline-variant/30 text-xs px-3 py-2 rounded outline-none text-on-surface" type="text" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-label-caps text-outline block">DETAILS</label><textarea rows="2" value={issueForm.desc} onChange={(e) => setIssueForm({ ...issueForm, desc: e.target.value })} className="w-full bg-surface-container-low border border-outline-variant/30 text-xs px-3 py-2 rounded outline-none text-on-surface resize-none" /></div>
                  <button type="submit" className="w-full py-2 bg-error text-on-error font-label-caps text-xs font-bold rounded">DISPATCH FAULT TICKET</button>
                </form>
              </>
            )}



            {showActionModal === 'message' && (
              <>
                <h3 className="text-sm font-label-caps text-secondary uppercase font-bold tracking-widest border-b border-outline-variant/20 pb-2 mb-4">Transmit Radio Message</h3>
                <form onSubmit={handleRadioMessageSubmit} className="space-y-4">
                  <div className="space-y-1"><label className="text-[10px] font-label-caps text-outline block">MESSAGE TEXT</label><textarea rows="3" required value={messageForm.text} onChange={(e) => setMessageForm({ ...messageForm, text: e.target.value })} placeholder="Type radio transmission..." className="w-full bg-surface-container-low border border-outline-variant/30 text-xs px-3 py-2 rounded outline-none text-on-surface resize-none" /></div>
                  <button type="submit" className="w-full py-2 bg-secondary text-on-secondary font-label-caps text-xs font-bold rounded">DISPATCH BROADCAST</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* 4. Password Reset Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-lg border border-secondary/30 relative">
            <button onClick={() => setShowResetPasswordModal(false)} className="absolute top-4 right-4 text-outline hover:text-secondary">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-sm font-label-caps text-secondary uppercase font-bold tracking-widest border-b border-outline-variant/20 pb-2 mb-4">Reset Officer Passcode</h3>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-label-caps text-outline block">SELECT OFFICER</label>
                <select value={resetPasswordForm.userId} onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, userId: e.target.value })} className="w-full bg-surface-container-low border border-outline-variant/30 text-xs px-3 py-2 rounded focus:border-secondary outline-none text-on-surface">
                  <option value="">-- Select Officer --</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.fullName} ({u.username})</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-label-caps text-outline block">NEW PASSCODE</label>
                <input required value={resetPasswordForm.newPassword} onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, newPassword: e.target.value })} className="w-full bg-surface-container-low border border-outline-variant/30 text-xs px-3 py-2 rounded focus:border-secondary outline-none text-on-surface" type="password" placeholder="Enter new passcode..." />
              </div>
              <button type="submit" className="w-full py-2 bg-secondary hover:bg-secondary/90 text-on-secondary font-label-caps text-xs tracking-widest rounded transition-all font-bold">SAVE PASSCODE</button>
            </form>
          </div>
        </div>
      )}

      {/* 5. Audit Log Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-2xl p-6 rounded-lg border border-primary/30 relative max-h-[80vh] flex flex-col">
            <button onClick={() => setShowAuditModal(false)} className="absolute top-4 right-4 text-outline hover:text-primary">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-sm font-label-caps text-primary uppercase font-bold tracking-widest border-b border-outline-variant/20 pb-2 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">history</span> SYSTEM AUDIT TRAIL LOGS
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {activityLogs.length === 0 ? (
                <div className="py-8 text-center text-xs font-label-caps text-outline italic">NO AUDIT LOGS RECORDED.</div>
              ) : (
                activityLogs.map((log) => (
                  <div key={log._id} className="p-3 bg-surface-container-low border border-outline-variant/20 rounded flex items-start gap-3 text-xs">
                    <span className="material-symbols-outlined text-primary text-base mt-0.5">{log.icon || 'history'}</span>
                    <div className="flex-1">
                      <div className="font-bold text-on-surface">{log.text}</div>
                      <div className="text-[10px] text-outline font-label-caps mt-0.5 font-data-numeric">
                        By {log.fullName || log.username} • {log.type || 'System'} • {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Request Detail Inspector Modal */}
      {selectedRequestDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass-panel w-full max-w-lg p-6 rounded-lg border border-primary/40 relative space-y-4 shadow-2xl">
            <button onClick={() => setSelectedRequestDetail(null)} className="absolute top-4 right-4 text-outline hover:text-primary">
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="border-b border-outline-variant/20 pb-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-xl">{selectedRequestDetail.icon}</span>
              </div>
              <div>
                <span className="text-[9px] font-label-caps text-secondary font-bold uppercase tracking-wider block">
                  {selectedRequestDetail.category} INSPECTOR
                </span>
                <h3 className="text-sm font-bold text-on-surface">{selectedRequestDetail.title}</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-surface-container-low p-3 rounded border border-outline-variant/20">
                <div>
                  <span className="text-[9px] font-label-caps text-outline block">CURRENT LIVE STATUS</span>
                  <div className="mt-1">{renderStatusBadge(selectedRequestDetail.status)}</div>
                </div>
                <div>
                  <span className="text-[9px] font-label-caps text-outline block">PRIORITY LEVEL</span>
                  <span className="font-bold text-on-surface text-xs block mt-1">{selectedRequestDetail.priority}</span>
                </div>
                <div>
                  <span className="text-[9px] font-label-caps text-outline block">DEPARTMENT / DIVISION</span>
                  <span className="font-bold text-on-surface text-xs block mt-1">{selectedRequestDetail.dept}</span>
                </div>
                <div>
                  <span className="text-[9px] font-label-caps text-outline block">SUBMITTED BY</span>
                  <span className="font-bold text-on-surface text-xs block mt-1">{selectedRequestDetail.requester}</span>
                </div>
              </div>

              <div className="bg-surface-container-low p-3 rounded border border-outline-variant/20 space-y-1">
                <span className="text-[9px] font-label-caps text-outline block">FULL DETAILS / SPECIFICATIONS</span>
                <p className="text-xs text-on-surface whitespace-pre-wrap">{selectedRequestDetail.desc}</p>
              </div>

              {selectedRequestDetail.createdAt && (
                <div className="text-[10px] font-label-caps text-outline font-data-numeric">
                  RECORD CREATED: {new Date(selectedRequestDetail.createdAt).toLocaleString()}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-outline-variant/20 flex justify-between items-center">
              <button
                onClick={() => handleWithdrawRequest(selectedRequestDetail)}
                className="px-3 py-1.5 bg-error/20 hover:bg-error/30 text-error font-label-caps text-xs font-bold rounded border border-error/40 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">delete</span> WITHDRAW REQUEST
              </button>

              <button
                onClick={() => setSelectedRequestDetail(null)}
                className="px-4 py-1.5 bg-primary text-on-primary font-label-caps text-xs font-bold rounded"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
