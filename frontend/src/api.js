const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('kavachUser'));
  if (user && user.token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`
    };
  }
  return { 'Content-Type': 'application/json' };
};

export const api = {
  login: async (credentials) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Tanks CRUD
  getTanks: async () => {
    const res = await fetch(`${BASE_URL}/tanks`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  getTankById: async (id) => {
    const res = await fetch(`${BASE_URL}/tanks/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  registerTank: async (data) => {
    const res = await fetch(`${BASE_URL}/tanks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  updateTank: async (id, data) => {
    const res = await fetch(`${BASE_URL}/tanks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  deleteTank: async (id) => {
    const res = await fetch(`${BASE_URL}/tanks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Workforce CRUD
  getWorkforce: async () => {
    const res = await fetch(`${BASE_URL}/workforce`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  createWorkforce: async (data) => {
    const res = await fetch(`${BASE_URL}/workforce`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  updateWorkforce: async (id, data) => {
    const res = await fetch(`${BASE_URL}/workforce/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  deleteWorkforce: async (id) => {
    const res = await fetch(`${BASE_URL}/workforce/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Testing CRUD
  getTesting: async () => {
    const res = await fetch(`${BASE_URL}/testing`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  createTesting: async (data) => {
    const res = await fetch(`${BASE_URL}/testing`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  updateTesting: async (id, data) => {
    const res = await fetch(`${BASE_URL}/testing/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  deleteTesting: async (id) => {
    const res = await fetch(`${BASE_URL}/testing/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Inventory CRUD
  getInventory: async () => {
    const res = await fetch(`${BASE_URL}/inventory`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  createInventory: async (data) => {
    const res = await fetch(`${BASE_URL}/inventory`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  updateInventory: async (id, data) => {
    const res = await fetch(`${BASE_URL}/inventory/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  deleteInventory: async (id) => {
    const res = await fetch(`${BASE_URL}/inventory/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Notifications CRUD
  getNotifications: async () => {
    const res = await fetch(`${BASE_URL}/notifications`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  createNotification: async (data) => {
    const res = await fetch(`${BASE_URL}/notifications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  updateNotification: async (id, data) => {
    const res = await fetch(`${BASE_URL}/notifications/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  deleteNotification: async (id) => {
    const res = await fetch(`${BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Extra dashboard API
  getStats: async () => {
    const res = await fetch(`${BASE_URL}/dashboard/stats`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Users (Admin only)
  getUsers: async () => {
    const res = await fetch(`${BASE_URL}/users`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  createUser: async (data) => {
    const res = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  updateUser: async (id, data) => {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  deleteUser: async (id) => {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Tasks (All logged-in officers)
  getTasks: async () => {
    const res = await fetch(`${BASE_URL}/tasks`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  createTask: async (data) => {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  updateTask: async (id, data) => {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  deleteTask: async (id) => {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Dashboard Custom Data CRUD
  getDashboardData: async () => {
    const res = await fetch(`${BASE_URL}/dashboard-data`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  createLeaveRequest: async (data) => {
    const res = await fetch(`${BASE_URL}/dashboard-data/leave`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  createSpareRequest: async (data) => {
    const res = await fetch(`${BASE_URL}/dashboard-data/spare`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  createWorkOrder: async (data) => {
    const res = await fetch(`${BASE_URL}/dashboard-data/workorder`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  createIssue: async (data) => {
    const res = await fetch(`${BASE_URL}/dashboard-data/issue`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  replyToMessage: async (id, text) => {
    const res = await fetch(`${BASE_URL}/dashboard-data/message/${id}/reply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  updateApproval: async (type, id, status) => {
    const res = await fetch(`${BASE_URL}/dashboard-data/approval/${type}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  broadcastAnnouncement: async (content) => {
    const res = await fetch(`${BASE_URL}/dashboard-data/announcement`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  createMessage: async (data) => {
    const res = await fetch(`${BASE_URL}/dashboard-data/message`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  createDocument: async (data) => {
    const res = await fetch(`${BASE_URL}/dashboard-data/document`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  resolveIssue: async (id) => {
    const res = await fetch(`${BASE_URL}/dashboard-data/issue/${id}/resolve`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  deleteDashboardRequest: async (type, id) => {
    const res = await fetch(`${BASE_URL}/dashboard-data/request/${type}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Predictive AI
  getPredictiveLogs: async () => {
    const res = await fetch(`${BASE_URL}/predictive-ai/logs`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  savePredictiveLog: async (data) => {
    const res = await fetch(`${BASE_URL}/predictive-ai/logs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // DyGM Board
  getDyGmBoard: async () => {
    const res = await fetch(`${BASE_URL}/dygm`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  updateDyGmBoard: async (data) => {
    const res = await fetch(`${BASE_URL}/dygm`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};



