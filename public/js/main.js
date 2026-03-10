const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
const notificationPromptKey = 'eh_notification_prompted_v1';

const requestJSON = async (url, options = {}, retry = true) => {
  const headers = {
    'Content-Type': 'application/json',
    'csrf-token': csrfToken,
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers
  });

  if (response.status === 401 && retry) {
    const refreshed = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: { 'csrf-token': csrfToken }
    });
    if (refreshed.ok) {
      return requestJSON(url, options, false);
    }
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

window.EngineerHub = { requestJSON, csrfToken };

const promptNotificationPermissionForFirstVisit = async () => {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission !== 'default') {
    return;
  }

  // Ask only once per browser profile to avoid repeatedly nagging first-time visitors.
  if (localStorage.getItem(notificationPromptKey) === 'true') {
    return;
  }

  localStorage.setItem(notificationPromptKey, 'true');

  try {
    await Notification.requestPermission();
  } catch (error) {
    // ignored intentionally
  }
};

const savedTheme = localStorage.getItem('eh_theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark-mode');
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await requestJSON('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      // ignored intentionally
    }
    window.location.href = '/login';
  });
}

const updateNotificationBadge = (count) => {
  const badge = document.getElementById('navbarNotificationCount');
  if (!badge) return;

  if (count > 0) {
    badge.textContent = count > 9 ? '9+' : count;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
};

const escapeHtml = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const loadNotifications = async () => {
  try {
    const response = await fetch('/api/notifications?limit=5');
    const data = await response.json();
    if (!data.success || !data.data) return;

    const unreadCount = data.data.filter((item) => !item.read).length;
    updateNotificationBadge(unreadCount);

    const list = document.getElementById('navbarNotificationList');
    if (!list) return;

    if (!data.data.length) {
      list.innerHTML = '<li class="notification-empty text-center py-3 text-muted"><i class="fa-regular fa-bell-slash me-2"></i>No notifications</li>';
      return;
    }

    list.innerHTML = data.data
      .slice(0, 5)
      .map((item) => `
        <li class="notification-item ${item.read ? '' : 'unread'}" data-id="${escapeHtml(item._id || '')}">
          <div class="notification-item-title">${escapeHtml(item.title || 'Notification')}</div>
          <div class="notification-item-message">${escapeHtml(item.message || '')}</div>
          <div class="notification-item-time">${new Date(item.deliveredAt || item.createdAt).toLocaleString()}</div>
        </li>
      `)
      .join('');
  } catch (error) {
    console.error(error);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  promptNotificationPermissionForFirstVisit().catch(() => {});

  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.modern-navbar');
    if (!navbar) return;

    if (window.scrollY > 50) {
      navbar.style.padding = '0.5rem 0';
      navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.15)';
    } else {
      navbar.style.padding = '0.8rem 0';
      navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
    }
  });

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const icon = themeToggle.querySelector('i');
      if (!icon) return;
      if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-regular', 'fa-moon');
        icon.classList.add('fa-regular', 'fa-sun');
      } else {
        icon.classList.remove('fa-regular', 'fa-sun');
        icon.classList.add('fa-regular', 'fa-moon');
      }
    });
  }

  const markAllRead = document.getElementById('navbarMarkAllRead');
  if (markAllRead) {
    markAllRead.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();

      try {
        await fetch('/api/notifications/read', {
          method: 'PATCH',
          credentials: 'same-origin',
          headers: {
            'csrf-token': csrfToken
          }
        });
        await loadNotifications();
      } catch (error) {
        console.error(error);
      }
    });
  }

  if (document.getElementById('notificationBell')) {
    loadNotifications();
  }

  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const button = newsletterForm.querySelector('.btn-subscribe');
      const emailInput = newsletterForm.querySelector('input[type="email"]');

      if (!button || !emailInput || !emailInput.value) return;

      const originalHtml = button.innerHTML;
      button.innerHTML = '<i class="fa-regular fa-check"></i>';
      button.style.background = '#10b981';

      setTimeout(() => {
        button.innerHTML = originalHtml;
        button.style.background = '#4361ee';
      }, 2000);

      emailInput.value = '';
    });
  }
});