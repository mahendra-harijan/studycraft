const classList = document.getElementById('classList');
const taskList = document.getElementById('taskList');
const unreadCount = document.getElementById('unreadCount');
const storageBar = document.getElementById('storageBar');
const notificationList = document.getElementById('notificationList');
const markNotificationsRead = document.getElementById('markNotificationsRead');
const themeToggle = document.getElementById('themeToggle');
const classLoader = document.getElementById('classLoader');
const taskLoader = document.getElementById('taskLoader');
const notificationLoader = document.getElementById('notificationLoader');
const dashboardAlert = document.getElementById('dashboardAlert');
const classCount = document.getElementById('classCount');
const taskCount = document.getElementById('taskCount');
const upcomingCount = document.getElementById('upcomingCount');
const storageText = document.getElementById('storageText');
const dateElement = document.getElementById('currentDate');
const timeElement = document.getElementById('currentTime');
const btnAddClassTop = document.getElementById('btnAddClassTop');
const btnAddTaskTop = document.getElementById('btnAddTaskTop');
const quickAddClassBtn = document.getElementById('quickAddClassBtn');
const quickAddTaskBtn = document.getElementById('quickAddTaskBtn');
const quickCalculatorBtn = document.getElementById('quickCalculatorBtn');
const AUTO_REFRESH_MS = 60 * 1000;

const requestDashboardJSON = async (url, options = {}) => {
  if (window.EngineerHub && typeof window.EngineerHub.requestJSON === 'function') {
    return window.EngineerHub.requestJSON(url, options);
  }

  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'csrf-token': csrfToken,
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
};

const showAlert = (type, message) => {
  if (!dashboardAlert) return;
  dashboardAlert.className = `alert alert-${type}`;
  dashboardAlert.textContent = message;
  dashboardAlert.classList.remove('d-none');
};

const hideAlert = () => {
  if (!dashboardAlert) return;
  dashboardAlert.classList.add('d-none');
};

const toggleLoader = (loader, visible) => {
  if (!loader) return;
  loader.classList.toggle('d-none', !visible);
};

const escapeDashboardHtml = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const formatNotificationType = (type) => {
  if (!type) return 'General';
  return String(type).replace(/-/g, ' ');
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const formatStatus = (row) => {
  if (row?.details?.status) return String(row.details.status);
  return row.read ? 'read' : 'unread';
};

const getDescription = (row) => row?.details?.description || row.message || '-';
const getReminderTime = (row) => row?.details?.reminderTime || (row.type?.includes('reminder') ? row.deliveredAt : null);
const getDeadline = (row) => row?.details?.deadline || null;
const getTitle = (row) => row?.details?.title || row.title || 'Notification';

const renderListOrEmpty = (element, rows, renderer, emptyHtml) => {
  if (!element) return;
  element.innerHTML = '';
  if (!rows.length) {
    element.innerHTML = emptyHtml;
    return;
  }
  rows.forEach((row) => {
    const item = document.createElement('div');
    item.innerHTML = renderer(row);
    element.appendChild(item);
  });
};

const loadOverview = async () => {
  toggleLoader(classLoader, true);
  toggleLoader(taskLoader, true);
  hideAlert();
  try {
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const response = await requestDashboardJSON(`/api/dashboard/overview?day=${encodeURIComponent(todayName)}`);
    const data = response?.data || {};

    const classesToday = Array.isArray(data?.classesToday) ? data.classesToday : [];
    const upcomingTasks = Array.isArray(data?.upcomingTasks) ? data.upcomingTasks : [];

    renderListOrEmpty(
      classList,
      classesToday,
      (row) => `<div class="class-item"><div class="class-info"><h4>${escapeDashboardHtml(row.subject)}</h4><p>${escapeDashboardHtml(row.time)} • ${escapeDashboardHtml(row.venue)}</p></div></div>`,
      `<div class="empty-state"><i class="fas fa-calendar-times"></i><p>No classes scheduled for ${escapeDashboardHtml(todayName)}</p></div>`
    );
    renderListOrEmpty(
      taskList,
      upcomingTasks,
      (row) => `<div class="task-item"><div class="task-info"><h4>${escapeDashboardHtml(row.title)}</h4><p>${escapeDashboardHtml(formatDateTime(row.deadline))}</p></div></div>`,
      '<div class="empty-state"><i class="fas fa-check-circle"></i><p>No pending tasks</p></div>'
    );
    if (unreadCount) unreadCount.textContent = String(data?.unreadCount || 0);
    if (classCount) classCount.textContent = String(classesToday.length);
    if (taskCount) taskCount.textContent = String(data?.pendingTasksCount || 0);
    if (upcomingCount) upcomingCount.textContent = String(data?.todayDeadlineCount || 0);
    const storagePercent = Number(data?.storageUsagePercent || 0);
    if (storageBar) {
      storageBar.style.width = `${storagePercent}%`;
      storageBar.textContent = `${storagePercent}%`;
    }
    if (storageText) storageText.textContent = `${storagePercent}%`;
  } catch (error) {
    showAlert('danger', error.message || 'Failed to load dashboard overview');
  } finally {
    toggleLoader(classLoader, false);
    toggleLoader(taskLoader, false);
  }
};

const loadNotifications = async () => {
  if (!notificationList) return;
  toggleLoader(notificationLoader, true);
  try {
    const response = await requestDashboardJSON('/api/notifications');
    const data = Array.isArray(response?.data) ? response.data : [];
    notificationList.innerHTML = '';

    const visibleRows = data.filter((row) => row && !row.read);

    if (!visibleRows.length) {
      notificationList.innerHTML = '<li class="notification-empty">No notifications available</li>';
      return;
    }

    visibleRows.slice(0, 20).forEach((row) => {
      const item = document.createElement('li');
      item.className = `notification-item ${row.read ? '' : 'unread'}`.trim();
      item.dataset.notificationId = row._id ? String(row._id) : '';
      const deliveredAt = new Date(row.deliveredAt || row.createdAt || Date.now()).toLocaleString();
      const taskId = row?.details?.taskId ? String(row.details.taskId) : '';
      const statusText = formatStatus(row);
      const isCompleted = statusText.toLowerCase() === 'completed';
      const showTaskAction = row.type?.startsWith('task') && taskId;

      item.innerHTML = `
        <div class="notification-head">
          <div class="notification-title">${escapeDashboardHtml(row.title || 'Notification')}</div>
          <button class="notification-delete-btn" type="button" data-notification-id="${escapeDashboardHtml(row._id || '')}">Delete</button>
        </div>
        <div class="notification-detail-grid">
          <div class="notification-detail-row"><span class="notification-label">Title</span><span class="notification-value">${escapeDashboardHtml(getTitle(row))}</span></div>
          <div class="notification-detail-row"><span class="notification-label">Description</span><span class="notification-value">${escapeDashboardHtml(getDescription(row))}</span></div>
          <div class="notification-detail-row"><span class="notification-label">Reminder Time</span><span class="notification-value">${escapeDashboardHtml(formatDateTime(getReminderTime(row)))}</span></div>
          <div class="notification-detail-row"><span class="notification-label">Deadline</span><span class="notification-value">${escapeDashboardHtml(formatDateTime(getDeadline(row)))}</span></div>
          <div class="notification-detail-row"><span class="notification-label">Status</span><span class="notification-value status-chip">${escapeDashboardHtml(formatStatus(row))}</span></div>
        </div>
        ${showTaskAction ? `<div class="notification-actions"><button class="notification-action-btn" data-task-id="${escapeDashboardHtml(taskId)}" data-next-status="${isCompleted ? 'pending' : 'completed'}">${isCompleted ? 'Mark Pending' : 'Mark Completed'}</button></div>` : ''}
        <div class="notification-meta">
          <span class="notification-type">${escapeDashboardHtml(formatNotificationType(row.type))}</span>
          <span class="notification-time">${escapeDashboardHtml(deliveredAt)}</span>
        </div>
      `;

      notificationList.appendChild(item);
    });

    if (!notificationList.children.length) {
      notificationList.innerHTML = '<li class="notification-empty">No notifications available</li>';
    }
  } catch (error) {
    showAlert('danger', error.message || 'Failed to load notifications');
    notificationList.innerHTML = '<li class="notification-empty">Unable to load notifications right now</li>';
  } finally {
    toggleLoader(notificationLoader, false);
  }
};

if (notificationList) {
  notificationList.addEventListener('click', async (event) => {
    const deleteBtn = event.target.closest('.notification-delete-btn');
    if (deleteBtn) {
      const notificationId = deleteBtn.getAttribute('data-notification-id');
      if (!notificationId) return;
      try {
        await requestDashboardJSON(`/api/notifications/${notificationId}`, { method: 'DELETE' });
        const item = deleteBtn.closest('.notification-item');
        if (item) item.remove();
        if (!notificationList.children.length) {
          notificationList.innerHTML = '<li class="notification-empty">No notifications available</li>';
        }
      } catch (error) {
        showAlert('danger', error.message || 'Failed to delete notification');
      }
      return;
    }

    const button = event.target.closest('.notification-action-btn');
    if (!button) return;
    const taskId = button.getAttribute('data-task-id');
    const nextStatus = button.getAttribute('data-next-status');
    if (!taskId) return;

    try {
      await requestDashboardJSON(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: nextStatus === 'completed' })
      });
      loadNotifications();
    } catch (error) {
      showAlert('danger', error.message || 'Failed to update task status');
    }
  });
}

if (markNotificationsRead) {
  markNotificationsRead.addEventListener('click', async () => {
    try {
      await requestDashboardJSON('/api/notifications/read', { method: 'PATCH' });
      loadOverview();
      loadNotifications();
      if (notificationList) {
        notificationList.innerHTML = '<li class="notification-empty">No notifications available</li>';
      }
    } catch (error) {
      showAlert('danger', error.message || 'Failed to mark notifications as read');
    }
  });
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('span');
    if (icon) {
      if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        if (text) text.textContent = 'Light';
      } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        if (text) text.textContent = 'Dark';
      }
    }
    localStorage.setItem('eh_theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  });

  const icon = themeToggle.querySelector('i');
  const text = themeToggle.querySelector('span');
  if (icon && document.body.classList.contains('dark-mode')) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
    if (text) text.textContent = 'Light';
  }
}

const initClock = () => {
  if (!dateElement || !timeElement) return;

  const renderClock = () => {
    const now = new Date();
    dateElement.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    timeElement.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  renderClock();
  setInterval(renderClock, 1000);
};

const bindNavigationButtons = () => {
  if (btnAddClassTop) {
    btnAddClassTop.addEventListener('click', () => {
      window.location.href = '/scheduler';
    });
  }

  if (btnAddTaskTop) {
    btnAddTaskTop.addEventListener('click', () => {
      window.location.href = '/tasks';
    });
  }

  if (quickAddClassBtn) {
    quickAddClassBtn.addEventListener('click', () => {
      window.location.href = '/scheduler';
    });
  }

  if (quickAddTaskBtn) {
    quickAddTaskBtn.addEventListener('click', () => {
      window.location.href = '/tasks';
    });
  }

  if (quickCalculatorBtn) {
    quickCalculatorBtn.addEventListener('click', () => {
      window.location.href = '/calculator';
    });
  }
};

bindNavigationButtons();
initClock();
loadOverview();
loadNotifications();
setInterval(() => {
  loadOverview();
  loadNotifications();
}, AUTO_REFRESH_MS);