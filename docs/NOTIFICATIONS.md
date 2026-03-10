# Push Notifications System

## Overview
The EngineerHub application includes a comprehensive push notification system that alerts users about tasks, class schedules, and other important events.

## Features

### Notification Types
1. **task-created** - Sent immediately when a new task is added
2. **task-reminder** - Sent at the scheduled reminder time before task deadline
3. **schedule-created** - Sent immediately when a new class is scheduled
4. **class-reminder** - Sent 10 minutes before a class starts
5. **class-start** - Sent when a class is starting
6. **daily-summary** - Sent at 7:00 AM with the day's schedule

## Architecture

### Backend Components

#### 1. Web Push Service (`src/services/webPushService.js`)
- Manages VAPID keys configuration
- Handles push subscription storage and removal
- Sends push notifications to subscribed devices
- Automatically removes expired/invalid subscriptions

#### 2. Notification Service (`src/services/notificationService.js`)
- Runs cron jobs for scheduled notifications
- Creates notification records in database
- Triggers web push notifications
- Provides `createImmediateNotification()` for instant notifications

#### 3. Models
- **Notification** - Stores notification history
- **PushSubscription** - Stores user device subscriptions

#### 4. Controllers
- Task Controller - Sends notification on task creation
- Schedule Controller - Sends notification on class creation
- Notification Controller - Manages notification API endpoints

### Frontend Components

#### 1. Service Worker (`public/sw.js`)
- Receives and displays push notifications
- Routes notification clicks to appropriate pages
- Runs in background even when app is closed

#### 2. Notification Client (`public/js/notifications.js`)
- Requests notification permissions
- Subscribes to push notifications
- Polls for new notifications every minute
- Displays browser notifications for unread items

## Setup Instructions

### 1. Generate VAPID Keys
Run the following command to generate VAPID keys:
```bash
npm run vapid:keys
```

### 2. Configure Environment Variables
Add the following to your `.env` file:
```env
VAPID_SUBJECT=mailto:your-email@example.com
VAPID_PUBLIC_KEY=<generated-public-key>
VAPID_PRIVATE_KEY=<generated-private-key>
```

### 3. Grant Permissions
When users first visit the application, they'll be prompted to allow notifications. Users must accept to receive push notifications.

## How It Works

### Immediate Notifications (Task/Schedule Creation)
1. User creates a task or schedule
2. Controller calls `createImmediateNotification()`
3. Notification is saved to database
4. Web push is sent to all user's subscribed devices
5. Service worker displays the notification
6. Clicking notification opens the relevant page (tasks/scheduler)

### Scheduled Notifications (Reminders)
1. Cron job runs every minute
2. Service checks for upcoming classes and task reminders
3. If match found, notification is created and pushed
4. Service worker displays the notification

### Daily Summary
1. Cron job runs at 7:00 AM daily
2. Service aggregates the day's schedule
3. Notification sent with class count
4. Opens dashboard on click

## Notification Flow

```
User Action (Create Task/Schedule)
    ↓
Controller validates and saves
    ↓
createImmediateNotification() called
    ↓
Notification saved to database
    ↓
sendPushToUser() sends to all devices
    ↓
Service Worker receives push event
    ↓
Browser displays notification
    ↓
User clicks notification
    ↓
Opens relevant page (tasks/scheduler/dashboard)
```

## Testing Push Notifications

### 1. Enable Notifications
- Open the application in browser
- Allow notification permissions when prompted
- Check browser settings to ensure notifications are enabled

### 2. Test Task Creation
- Navigate to Tasks page
- Create a new task
- You should receive an immediate notification
- Click the notification to verify it opens Tasks page

### 3. Test Schedule Creation
- Navigate to Scheduler page
- Create a new class
- You should receive an immediate notification
- Click the notification to verify it opens Scheduler page

### 4. Test Reminders
- Create a task with reminder in next 2 minutes
- Wait for reminder time
- You should receive notification at scheduled time

### 5. Test Class Reminders
- Create a class scheduled for current day and time
- Set time to 10 minutes from now
- You should receive notification 10 minutes before
- You should receive another notification at start time

## Troubleshooting

### Notifications Not Appearing

1. **Check Browser Support**
   - Push notifications require modern browser
   - Check if service worker is registered: DevTools → Application → Service Workers

2. **Check Permissions**
   - Browser must have granted notification permission
   - Check site settings in browser

3. **Check VAPID Configuration**
   - Ensure VAPID keys are set in `.env`
   - Keys must match between backend and frontend

4. **Check Service Worker**
   - Open DevTools → Application → Service Workers
   - Verify service worker is active
   - Check for errors in console

5. **Check Database**
   - Verify PushSubscription exists for user
   - Check Notification records are being created

### Common Issues

**Error: "Web push is not configured"**
- VAPID keys missing from `.env`
- Run `npm run vapid:keys` to generate keys

**Service Worker Not Registering**
- Check path: should be `/sw.js` not `/public/sw.js`
- Ensure HTTPS in production (localhost works with HTTP)

**Notifications Not Clickable**
- Check service worker `notificationclick` event handler
- Verify URL routing in `getUrlForNotificationType()`

**Multiple Notifications for Same Event**
- System uses `eventKey` to prevent duplicates
- Check `createNotificationIfNotExists()` logic

## Browser Compatibility

- ✅ Chrome 50+
- ✅ Firefox 44+
- ✅ Edge 17+
- ✅ Safari 16+ (macOS 13+, iOS 16.4+)
- ❌ Internet Explorer (not supported)

## Security Considerations

1. **VAPID Keys** - Keep private key secret, never expose in client code
2. **Permissions** - Users must explicitly grant notification permission
3. **HTTPS Required** - Push notifications require HTTPS in production
4. **Origin Validation** - Service worker validates origin
5. **Content Sanitization** - Notification content is sanitized before display

## Performance Notes

- Polling interval: 60 seconds
- Cron job interval: 1 minute for reminders
- Push subscriptions auto-cleanup on 404/410 errors
- Notification limit: 50 most recent per user
- Browser local storage used to prevent duplicate alerts

## Future Enhancements

- [ ] Add notification preferences (enable/disable by type)
- [ ] Support for custom notification sounds
- [ ] Rich notifications with actions (mark as done, snooze)
- [ ] Push notification analytics
- [ ] Multi-language notification support
- [ ] Batch notifications to reduce noise
