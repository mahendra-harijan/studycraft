self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  let data;
  try {
    data = event.data.json();
  } catch (error) {
    data = { title: 'Study Craft', message: event.data.text(), type: 'general' };
  }

  const notificationOptions = {
    body: data.message || 'New notification',
    icon: '/public/favicon.png',
    badge: '/public/favicon.png',
    tag: data.type || 'study-craft-push',
    requireInteraction: false,
    data: {
      url: getUrlForNotificationType(data.type),
      timestamp: data.timestamp || new Date().toISOString()
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Study Craft', notificationOptions)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const targetUrl = event.notification.data?.url || '/dashboard';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(targetUrl.split('?')[0]) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

function getUrlForNotificationType(type) {
  switch (type) {
    case 'task-created':
    case 'task-reminder':
      return '/tasks';
    case 'class-reminder':
    case 'class-start':
    case 'schedule-created':
      return '/scheduler';
    case 'daily-summary':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}