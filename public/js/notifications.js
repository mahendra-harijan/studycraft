let knownNotificationIds = new Set();

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }
  return outputArray;
};

const ensureNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const result = await Notification.requestPermission();
    return result === 'granted';
  }
  return false;
};

const ensureServiceWorkerRegistration = async () => {
  if (!('serviceWorker' in navigator)) return null;

  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) return existing;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    return registration;
  } catch (error) {
    return null;
  }
};

const subscribeForWebPush = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  const permissionAllowed = await ensureNotificationPermission();
  if (!permissionAllowed) return;

  const registration = (await ensureServiceWorkerRegistration()) || (await navigator.serviceWorker.ready);
  if (!registration) return;

  const { data } = await window.EngineerHub.requestJSON('/api/notifications/push/public-key');
  const existingSubscription = await registration.pushManager.getSubscription();

  if (existingSubscription) {
    await window.EngineerHub.requestJSON('/api/notifications/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({ subscription: existingSubscription.toJSON() })
    });
    return;
  }

  const newSubscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(data.publicKey)
  });

  await window.EngineerHub.requestJSON('/api/notifications/push/subscribe', {
    method: 'POST',
    body: JSON.stringify({ subscription: newSubscription.toJSON() })
  });
};

const pushBrowserNotification = async (notification) => {
  try {
    const registration = await navigator.serviceWorker.ready;
    if (registration) {
      await registration.showNotification(notification.title, {
        body: notification.message,
        icon: '/public/favicon.png',
        badge: '/public/favicon.png',
        tag: notification.id,
        requireInteraction: false
      });
    }
  } catch (error) {
    // Fallback to browser notification API if service worker fails
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/public/favicon.png'
      });
    }
  }
};

const pollNotifications = async () => {
  try {
    const allowed = await ensureNotificationPermission();
    if (!allowed) return;

    const { data } = await window.EngineerHub.requestJSON('/api/notifications');
    for (const n of data.slice(0, 5)) {
      const id = String(n._id || n.id);
      if (!knownNotificationIds.has(id) && !n.read) {
        knownNotificationIds.add(id);
        pushBrowserNotification({ id, title: n.title, message: n.message });
      }
    }
  } catch (error) {
    // ignore polling errors
  }
};

setInterval(pollNotifications, 60 * 1000);
pollNotifications();
subscribeForWebPush().catch(() => {});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    subscribeForWebPush().catch(() => {});
  }
});