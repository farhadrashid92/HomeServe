import webpush from 'web-push';
import fs from 'fs';
import path from 'path';

// Self-healing VAPID generator if environment variables are missing
export const initializePushService = () => {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.log('⚠️ VAPID keys missing. Generating new cryptographic keys...');
    const vapidKeys = webpush.generateVAPIDKeys();
    
    process.env.VAPID_PUBLIC_KEY = vapidKeys.publicKey;
    process.env.VAPID_PRIVATE_KEY = vapidKeys.privateKey;
    
    try {
      fs.appendFileSync('.env', `\n# Generated VAPID Keys\nVAPID_PUBLIC_KEY=${vapidKeys.publicKey}\nVAPID_PRIVATE_KEY=${vapidKeys.privateKey}\n`);
      console.log('✅ VAPID Keys generated and appended to .env');
    } catch (err) {
      console.warn('⚠️ Could not write to .env, keys are injected into memory only.');
    }
  }

  webpush.setVapidDetails(
    'mailto:homeservewebapp@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
};

export const sendPushNotification = async (subscription, payload) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (error) {
    console.error('Push Notification Delivery Error:', error.statusCode || error);
    throw error;
  }
};
