# Notifications Feature Setup

## Overview
The app now includes a comprehensive notification system with:
- **Bilingual Support**: Hindi and English notifications
- **8-Hour Schedule**: Notifications appear every 8 hours (8 AM, 4 PM, 12 AM)
- **Customized Messages**: 6 different messages per language (12 total)

## Features

### 1. Language Detection
- Automatically detects user's language preference from:
  - Browser/system language
  - Saved preference in localStorage (`findMyPuppy_language`)
- Supports: English (`en`) and Hindi (`hi`)

### 2. Notification Schedule
Notifications are scheduled at:
- **8:00 AM** - Morning reminder
- **4:00 PM** - Afternoon reminder  
- **12:00 AM (Midnight)** - Evening reminder

These times ensure notifications appear every 8 hours.

### 3. Notification Messages

#### English Messages:
1. "🐕 Find My Puppy - Time to find some hidden puppies! Can you beat your high score?"
2. "🎮 Daily Challenge - Your daily check-in is waiting! Feed your puppy and earn rewards!"
3. "🏆 New Levels Unlocked - New levels are waiting for you! Come back and discover more puppies!"
4. "💡 Free Hints Available - Claim your free hints and make finding puppies easier!"
5. "⭐ Level Up! - You're doing great! Come back and unlock more achievements!"
6. "🎯 Weekly Challenge - Complete your weekly challenge and earn bonus rewards!"

#### Hindi Messages:
1. "🐕 Find My Puppy - कुछ छुपे हुए पिल्लों को खोजने का समय! क्या आप अपना हाई स्कोर हरा सकते हैं?"
2. "🎮 दैनिक चुनौती - आपकी दैनिक जांच प्रतीक्षा कर रही है! अपने पिल्ले को खिलाएं और इनाम कमाएं!"
3. "🏆 नए स्तर अनलॉक - नए स्तर आपका इंतजार कर रहे हैं! वापस आएं और अधिक पिल्ले खोजें!"
4. "💡 मुफ्त संकेत उपलब्ध - अपने मुफ्त संकेत प्राप्त करें और पिल्लों को खोजना आसान बनाएं!"
5. "⭐ स्तर बढ़ाएं! - आप बहुत अच्छा कर रहे हैं! वापस आएं और अधिक उपलब्धियां अनलॉक करें!"
6. "🎯 साप्ताहिक चुनौती - अपनी साप्ताहिक चुनौती पूरी करें और बोनस इनाम कमाएं!"

## Technical Implementation

### Files Modified/Created:
1. **`services/notifications.ts`** - Main notification service
2. **`App.tsx`** - Integrated notification initialization
3. **`android/app/src/main/AndroidManifest.xml`** - Added notification permissions
4. **`package.json`** - Added `@capacitor/local-notifications` plugin

### Permissions Added:
- `POST_NOTIFICATIONS` - Required for Android 13+
- `SCHEDULE_EXACT_ALARM` - For precise scheduling
- `USE_EXACT_ALARM` - For exact alarm scheduling

### How It Works:
1. **On App Start**: 
   - Requests notification permissions
   - Schedules 3 daily recurring notifications (8 AM, 4 PM, 12 AM)
   - Each notification uses a random message from the appropriate language

2. **Language Selection**:
   - Checks localStorage for saved preference
   - Falls back to browser language
   - Defaults to English if Hindi not detected

3. **Notification Click**:
   - When user taps a notification, app opens to HOME screen
   - Handled via `setupNotificationListeners`

## Usage

### Setting Language Preference (Optional):
Users can set their preferred language by adding to localStorage:
```javascript
localStorage.setItem('findMyPuppy_language', 'hi'); // For Hindi
localStorage.setItem('findMyPuppy_language', 'en'); // For English
```

### Testing Notifications:
1. Build and install the app on Android device/emulator
2. Grant notification permissions when prompted
3. Notifications will appear at scheduled times (8 AM, 4 PM, 12 AM)
4. For testing, you can manually trigger by modifying the schedule times temporarily

## API Functions

### `initializeNotifications()`
Initializes and schedules all notifications. Called automatically on app start.

### `requestNotificationPermissions()`
Requests notification permissions from user. Returns `true` if granted.

### `scheduleRecurringNotifications()`
Schedules daily recurring notifications at 8-hour intervals.

### `cancelAllNotifications()`
Cancels all scheduled notifications.

### `setupNotificationListeners(onNotificationClick?)`
Sets up listeners for notification events (click, receive).

## Notes

- Notifications only work on native platforms (Android/iOS), not on web
- Users must grant notification permissions for notifications to work
- Notifications are scheduled daily and repeat automatically
- Each notification uses a random message to keep content fresh
- Language is detected automatically but can be overridden via localStorage

## Future Enhancements

Potential improvements:
- Add notification settings in Settings modal
- Allow users to enable/disable notifications
- Add more notification messages
- Support more languages
- Add notification preferences (frequency, times)
