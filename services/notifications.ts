/**
 * Notification Service with Hindi and English support
 * Schedules notifications every 8 hours
 */

import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface NotificationMessage {
  title: string;
  body: string;
}

// Notification messages in both languages
const NOTIFICATION_MESSAGES: NotificationMessage[] = [
  // English messages
  {
    title: '🐕 Find My Puppy',
    body: 'Time to find some hidden puppies! Can you beat your high score?'
  },
  {
    title: '🎮 Daily Challenge',
    body: 'Your daily check-in is waiting! Feed your puppy and earn rewards!'
  },
  {
    title: '🏆 New Levels Unlocked',
    body: 'New levels are waiting for you! Come back and discover more puppies!'
  },
  {
    title: '💡 Free Hints Available',
    body: 'Claim your free hints and make finding puppies easier!'
  },
  {
    title: '⭐ Level Up!',
    body: 'You\'re doing great! Come back and unlock more achievements!'
  },
  {
    title: '🎯 Weekly Challenge',
    body: 'Complete your weekly challenge and earn bonus rewards!'
  },
  // Hindi messages
  {
    title: '🐕 Find My Puppy',
    body: 'कुछ छुपे हुए पिल्लों को खोजने का समय! क्या आप अपना हाई स्कोर हरा सकते हैं?'
  },
  {
    title: '🎮 दैनिक चुनौती',
    body: 'आपकी दैनिक जांच प्रतीक्षा कर रही है! अपने पिल्ले को खिलाएं और इनाम कमाएं!'
  },
  {
    title: '🏆 नए स्तर अनलॉक',
    body: 'नए स्तर आपका इंतजार कर रहे हैं! वापस आएं और अधिक पिल्ले खोजें!'
  },
  {
    title: '💡 मुफ्त संकेत उपलब्ध',
    body: 'अपने मुफ्त संकेत प्राप्त करें और पिल्लों को खोजना आसान बनाएं!'
  },
  {
    title: '⭐ स्तर बढ़ाएं!',
    body: 'आप बहुत अच्छा कर रहे हैं! वापस आएं और अधिक उपलब्धियां अनलॉक करें!'
  },
  {
    title: '🎯 साप्ताहिक चुनौती',
    body: 'अपनी साप्ताहिक चुनौती पूरी करें और बोनस इनाम कमाएं!'
  }
];

// Get user's preferred language (defaults to English)
function getUserLanguage(): 'en' | 'hi' {
  if (typeof window === 'undefined') return 'en';
  
  // Check localStorage preference
  const savedLang = localStorage.getItem('findMyPuppy_language');
  if (savedLang === 'hi' || savedLang === 'en') {
    return savedLang;
  }
  
  // Check browser language
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  if (browserLang.startsWith('hi')) {
    return 'hi';
  }
  
  return 'en';
}

// Get a random notification message based on language
function getRandomNotificationMessage(): NotificationMessage {
  const lang = getUserLanguage();
  const isHindi = lang === 'hi';
  
  // Filter messages by language (first 6 are English, last 6 are Hindi)
  const messages = isHindi 
    ? NOTIFICATION_MESSAGES.slice(6) // Hindi messages
    : NOTIFICATION_MESSAGES.slice(0, 6); // English messages
  
  // Return a random message
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

// Check if notifications are supported
export function isNotificationSupported(): boolean {
  return Capacitor.isNativePlatform();
}

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.log('[Notifications] Not supported on web platform');
    return false;
  }

  try {
    const status = await LocalNotifications.checkPermissions();
    
    if (status.display === 'granted') {
      console.log('[Notifications] Permissions already granted');
      return true;
    }

    if (status.display === 'prompt') {
      const result = await LocalNotifications.requestPermissions();
      if (result.display === 'granted') {
        console.log('[Notifications] Permissions granted');
        return true;
      }
    }

    console.warn('[Notifications] Permissions denied');
    return false;
  } catch (error) {
    console.error('[Notifications] Error requesting permissions:', error);
    return false;
  }
}

// Cancel all existing notifications
export async function cancelAllNotifications(): Promise<void> {
  if (!isNotificationSupported()) return;

  try {
    await LocalNotifications.cancel({ notifications: [] });
    console.log('[Notifications] All notifications cancelled');
  } catch (error) {
    console.error('[Notifications] Error cancelling notifications:', error);
  }
}

// Schedule notifications every 8 hours
export async function scheduleNotifications(): Promise<void> {
  if (!isNotificationSupported()) {
    console.log('[Notifications] Not supported on web platform');
    return;
  }

  try {
    // Request permissions first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('[Notifications] Cannot schedule: permissions not granted');
      return;
    }

    // Cancel existing notifications
    await cancelAllNotifications();

    // Schedule 3 notifications per day (every 8 hours)
    const notifications = [];
    const now = new Date();
    
    // Calculate next 8-hour intervals
    for (let i = 0; i < 7; i++) { // Schedule for next 7 days (3 per day = 21 notifications)
      const hoursToAdd = i * 8;
      const notificationTime = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
      
      // Ensure notification is in the future
      if (notificationTime <= now) {
        notificationTime.setTime(notificationTime.getTime() + 8 * 60 * 60 * 1000);
      }

      const message = getRandomNotificationMessage();
      
      notifications.push({
        id: 1000 + i, // Unique ID for each notification
        title: message.title,
        body: message.body,
        schedule: {
          at: notificationTime,
          repeats: false
        },
        sound: 'default',
        smallIcon: 'ic_notification',
        iconColor: '#943DDC'
      });
    }

    // Schedule all notifications
    await LocalNotifications.schedule({
      notifications: notifications
    });

    console.log(`[Notifications] Scheduled ${notifications.length} notifications`);
  } catch (error) {
    console.error('[Notifications] Error scheduling notifications:', error);
  }
}

// Schedule recurring notifications every 8 hours
export async function scheduleRecurringNotifications(): Promise<void> {
  if (!isNotificationSupported()) {
    console.log('[Notifications] Not supported on web platform');
    return;
  }

  try {
    // Request permissions first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('[Notifications] Cannot schedule: permissions not granted');
      return;
    }

    // Cancel existing notifications
    await cancelAllNotifications();

    const now = new Date();
    const notifications = [];

    // Calculate next 8-hour interval from current time
    const currentHour = now.getHours();
    const nextHour = Math.ceil(currentHour / 8) * 8; // Round up to next 8-hour mark
    
    // Schedule notifications at 8-hour intervals: 8 AM, 4 PM, 12 AM (midnight)
    // This ensures notifications appear every 8 hours
    const times = [
      { hour: 8, minute: 0 },   // 8 AM
      { hour: 16, minute: 0 },  // 4 PM
      { hour: 0, minute: 0 }    // 12 AM (midnight)
    ];

    times.forEach((time, index) => {
      const notificationTime = new Date(now);
      notificationTime.setHours(time.hour, time.minute, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (notificationTime <= now) {
        notificationTime.setDate(notificationTime.getDate() + 1);
      }

      const message = getRandomNotificationMessage();
      
      notifications.push({
        id: 2000 + index, // Unique ID
        title: message.title,
        body: message.body,
        schedule: {
          at: notificationTime,
          repeats: true,
          every: 'day'
        },
        sound: 'default',
        smallIcon: 'ic_notification',
        iconColor: '#943DDC'
      });
    });

    // Schedule all notifications
    await LocalNotifications.schedule({
      notifications: notifications
    });

    console.log(`[Notifications] Scheduled ${notifications.length} recurring daily notifications (every 8 hours)`);
    console.log(`[Notifications] Notification times: 8:00 AM, 4:00 PM, 12:00 AM`);
  } catch (error) {
    console.error('[Notifications] Error scheduling recurring notifications:', error);
  }
}

// Initialize notifications (call this when app starts)
export async function initializeNotifications(): Promise<void> {
  if (!isNotificationSupported()) {
    return;
  }

  try {
    // Use recurring notifications (every 8 hours via daily schedule)
    await scheduleRecurringNotifications();
  } catch (error) {
    console.error('[Notifications] Error initializing notifications:', error);
  }
}

// Handle notification click (when user taps notification)
export function setupNotificationListeners(onNotificationClick?: () => void): void {
  if (!isNotificationSupported()) return;

  LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
    console.log('[Notifications] Notification clicked:', notification);
    if (onNotificationClick) {
      onNotificationClick();
    }
  });

  LocalNotifications.addListener('localNotificationReceived', (notification) => {
    console.log('[Notifications] Notification received:', notification);
  });
}
