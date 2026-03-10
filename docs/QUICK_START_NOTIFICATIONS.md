# Quick Start - Push Notifications

## ⚡ Quick Setup (3 Steps)

### 1. Generate VAPID Keys
```bash
npm run vapid:keys
```

Copy the output to your `.env` file.

### 2. Start Server
```bash
npm run dev
```

### 3. Test It
1. Open http://localhost:4000
2. Login to your account
3. **Allow notifications** when browser prompts
4. Go to Tasks page → Add a new task
5. 🎉 You'll receive a notification instantly!

---

## 🎯 What's Working Now

| Action | Notification | When | Opens Page |
|--------|-------------|------|------------|
| Create Task | ✅ Task Created | Immediately | Tasks |
| Create Class | ✅ Schedule Created | Immediately | Scheduler |
| Task Reminder | ✅ Task Reminder | At reminder time | Tasks |
| Class Coming | ✅ Class in 10 min | 10 min before | Scheduler |
| Class Starting | ✅ Class Starting | At start time | Scheduler |
| Daily Summary | ✅ Daily Summary | 7:00 AM | Dashboard |

---

## 🔧 Quick Troubleshooting

### No Notifications?

**Check 1:** Browser permissions
- Click the 🔒 lock icon in address bar
- Ensure "Notifications" is set to "Allow"

**Check 2:** Service Worker
- Press F12 → Application tab → Service Workers
- Should show "sw.js" as activated

**Check 3:** VAPID Keys
- Check `.env` has VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY
- Run `npm run vapid:keys` if missing

**Check 4:** Console Errors
- Press F12 → Console tab
- Look for any red errors

---

## 📱 Test Notifications

### Test 1: Immediate Notification (Task)
```
1. Go to Tasks page
2. Fill out task form:
   - Title: "Test Task"
   - Priority: "high"
   - Deadline: Tomorrow
   - Reminder: 1 hour before deadline
3. Click "Add Task"
4. ✨ Notification should appear immediately
```

### Test 2: Immediate Notification (Class)
```
1. Go to Scheduler page
2. Fill out schedule form:
   - Subject: "Test Class"
   - Day: Today
   - Start Time: Any time
   - End Time: 1 hour later
   - Venue: "Room 101"
3. Click "Add Class"
4. ✨ Notification should appear immediately
```

### Test 3: Scheduled Notification (Reminder)
```
1. Go to Tasks page
2. Create task with reminder in 2 minutes
3. Wait 2 minutes
4. ✨ Reminder notification should appear
```

---

## 🎨 Notification Format

### Task Created
```
Title: "New Task Created"
Message: 'Task "Your Task Title" has been added with deadline [date]'
Icon: Site favicon
Opens: /tasks
```

### Schedule Created
```
Title: "New Class Scheduled"
Message: "[Subject] scheduled for [Day] at [Time] in [Venue]"
Icon: Site favicon
Opens: /scheduler
```

---

## 💡 Pro Tips

1. **Multiple Devices:** Same user can be subscribed on phone, tablet, and desktop
2. **Offline:** Service worker works even when browser tab is closed
3. **Battery:** Polling runs every 60 seconds (battery-friendly)
4. **Privacy:** Notifications only visible to logged-in user
5. **Security:** HTTPS required in production (localhost works with HTTP)

---

## 🐛 Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| "Web push not configured" | Add VAPID keys to `.env` |
| Service worker not loading | Change path to `/sw.js` ✅ (Fixed) |
| Notifications not clickable | Ensure service worker is registered ✅ (Fixed) |
| Duplicate notifications | System prevents this automatically ✅ |
| Wrong page opens | Check notification type routing ✅ (Fixed) |

---

## 📚 More Info

- Full documentation: [docs/NOTIFICATIONS.md](NOTIFICATIONS.md)
- All changes explained: [docs/NOTIFICATION_FIXES.md](NOTIFICATION_FIXES.md)
- API documentation: [docs/API.md](../docs/API.md)

---

## ✅ Verify Everything Works

Run this checklist:

- [ ] Server starts without errors
- [ ] Browser allows notifications
- [ ] Service worker registered (check DevTools)
- [ ] Creating task shows notification
- [ ] Creating class shows notification
- [ ] Clicking notification opens correct page
- [ ] Multiple notifications don't interfere

**All checked? You're good to go! 🚀**
