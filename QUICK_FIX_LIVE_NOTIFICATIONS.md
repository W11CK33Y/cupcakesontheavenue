# Quick Fix: Live Notifications Not Showing

## ✅ What's Done
1. **Backend API Created**: `api/live-status.js` deployed to Vercel
2. **Frontend Updated**: Website polls for updates every 5 seconds
3. **API Working**: https://sumup-backend-ffjh8xkwc-jack-wicks-projects.vercel.app/api/live-status

## 🔧 Next Steps

### Step 1: Update Discord Bot (5 minutes)

Open `C:\Users\jack\Downloads\sumup-backend\discord-bot\bot.js` and:

**Add this helper function after `postState()` (around line 45):**

```javascript
// Helper to update live website notifications
async function updateLiveStatus(action, data) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/live-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, data })
    });
    if (!res.ok) {
      console.error('Live status API error:', res.status);
      return { error: `Failed to update live status (${res.status})` };
    }
    return await res.json();
  } catch (e) {
    console.error('Live status update error:', e);
    return { error: e.message };
  }
}
```

**Update `handleMarket()` function (around line 461):**

Add this after the existing `postState` call:

```javascript
// Update live-status API (for website notifications)
const liveResult = await updateLiveStatus('market', { 
  status: arg === 'live' ? 'open' : 'closed' 
});
if (liveResult.error) {
  console.error('Warning: Failed to update website live status:', liveResult.error);
}
```

**Update `handleAnnounce()` function (around line 486):**

Add this after the existing `postState` call:

```javascript
// Update live-status API (for website notifications)
const liveResult = await updateLiveStatus('announcement', { 
  message: text,
  important: false
});
if (liveResult.error) {
  console.error('Warning: Failed to update website live status:', liveResult.error);
}
```

**Update `handleFlavorPoll()` function (around line 508):**

Add this after the existing `postState` call:

```javascript
// Update live-status API (for website notifications)
const liveResult = await updateLiveStatus('poll', {
  question: 'Vote for Next Flavor!',
  options: options,
  active: true
});
if (liveResult.error) {
  console.error('Warning: Failed to update website live status:', liveResult.error);
}
```

**Update `handlePollClose()` function (around line 545):**

Add this after the existing `postState` call:

```javascript
// Close poll on live-status API (for website)
const liveResult = await updateLiveStatus('poll', { active: false });
if (liveResult.error) {
  console.error('Warning: Failed to close website poll:', liveResult.error);
}
```

### Step 2: Restart Discord Bot

```bash
cd C:\Users\jack\Downloads\sumup-backend\discord-bot
node bot.js
```

### Step 3: Test Commands

In Discord bot-commands channel:

```
!market live
```

Then check your website - you should see a green "WE'RE OPEN!" banner!

```
!announce Fresh batch ready at 2pm!
```

You should see a toast notification slide down!

```
!poll flavors Vanilla,Chocolate,Strawberry
```

You should see a poll widget in the bottom-right corner!

## 🐛 Troubleshooting

### If notifications still don't show:

1. **Check browser console** (F12):
   - Look for errors in console
   - Should see polls every 5 seconds: `Checking for live updates...`

2. **Check bot console**:
   - Should see "Live status updated" messages
   - If you see errors, check `BACKEND_URL` is correct

3. **Verify API works**:
   ```bash
   curl https://sumup-backend.vercel.app/api/live-status
   ```
   
   Should return:
   ```json
   {"success":true,"marketStatus":null,"announcement":null,"poll":null}
   ```

4. **Clear browser cache**: Ctrl+Shift+Delete

### Common Issues

**"The page could not be found"**
- Vercel domain might be caching. Wait 2-3 minutes and try again.
- Or use direct deployment URL temporarily in bot.js:
  ```javascript
  const BACKEND_URL = 'https://sumup-backend-ffjh8xkwc-jack-wicks-projects.vercel.app';
  ```

**"No notifications appearing"**
- Check bot is actually calling the API (console.log in bot)
- Check website is polling (F12 > Network tab > should see requests every 5s)
- Make sure you're on the live site, not local file

**"Poll not working"**
- Votes go through `/api/live-status` with action "vote"
- Check localStorage for previous votes: F12 > Application > Local Storage

## 📊 What Each Command Does

| Command | Discord Channel | Website Effect |
|---------|----------------|----------------|
| `!market live` | #market | Green "WE'RE OPEN!" banner at top |
| `!market closed` | #market | Gray "CURRENTLY CLOSED" banner |
| `!announce [msg]` | #announcements | Orange toast notification (8s) |
| `!poll flavors a,b,c` | #polls | Poll widget bottom-right with voting |
| `!poll close` | #polls | Closes poll on website |

## 🎯 Success Checklist

- [ ] Added `updateLiveStatus()` helper function to bot
- [ ] Updated all 4 handler functions (market, announce, poll, poll close)
- [ ] Restarted Discord bot
- [ ] Tested `!market live` - saw banner on website
- [ ] Tested `!announce` - saw toast notification
- [ ] Tested `!poll flavors` - saw poll widget
- [ ] Voted on poll - vote counted
- [ ] Tested `!poll close` - poll closed on site

All working? Congratulations! 🎉

If you see **bot-live-status-updates.txt** in your workspace, that has the full updated functions ready to copy/paste!
