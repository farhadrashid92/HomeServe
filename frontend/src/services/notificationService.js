import api from './api';

// Utility securely handling UInt8Array byte conversions required by the VAPID architecture
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const enablePushNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push messaging is not supported by your device browser.');
  }

  // Gracefully request strict OS-level permissions
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission denied by user.');
  }

  // Verify the Service Worker is strongly locked onto the DOM
  const registration = await navigator.serviceWorker.ready;

  // Retrieve our public VAPID key securely from Express
  const response = await api.get('/notifications/vapid-key');
  const publicVapidKey = response.data.publicKey;
  const applicationServerKey = urlBase64ToUint8Array(publicVapidKey);

  // Detect if an old subscription bound to a different VAPID key exists (common in dev), and safely drop it.
  let subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
  }

  // Negotiate local subscription binding with the OS Push Service against our latest key
  subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey
  });

  // Permanently save the generated Endpoint + Keys against the logged-in User
  await api.post('/notifications/subscribe', { subscription });
  
  return true;
};
