# Live Status API Documentation

## Overview
The live status API provides real-time updates for market status, announcements, and polls on the website. The website polls this API every 5 seconds to display live updates.

## ✅ Current Status
- **Backend API**: `api/live-status.js` deployed to Vercel
- **Frontend Integration**: Website automatically polls for updates
- **API Endpoint**: https://sumup-backend-ffjh8xkwc-jack-wicks-projects.vercel.app/api/live-status

## Features

### 1. Market Status Banner
- **Display**: Fixed banner at top of page showing market status
- **Styles**: Green gradient for OPEN, gray for CLOSED
- **API Action**: `market` with data `{ status: 'open' | 'closed' }`

### 2. Announcements
- **Display**: Toast notification that slides from top
- **Duration**: Shows for 8 seconds, then auto-hides
- **API Action**: `announcement` with data `{ message: string, important: boolean }`

### 3. Flavor Polls
- **Display**: Fixed poll widget in bottom-right corner
- **Features**:
  - Users click to vote
  - Real-time vote counts and percentages
  - Progress bars
  - One vote per user (stored in localStorage)
- **API Actions**:
  - Create: `poll` with data `{ question: string, options: string[], active: true }`
  - Close: `poll` with data `{ active: false }`
  - Vote: `vote` with data `{ optionIndex: number }`

## API Usage

### GET /api/live-status
Returns current live status data:
```json
{
  "success": true,
  "marketStatus": "open" | "closed" | null,
  "announcement": { "message": "string", "timestamp": number, "important": boolean } | null,
  "poll": {
    "question": "string",
    "options": ["Option 1", "Option 2", "Option 3"],
    "votes": [5, 3, 2],
    "active": true,
    "userVoted": false
  } | null
}
```

### POST /api/live-status
Update live status (requires authentication in production):
```json
{
  "action": "market" | "announcement" | "poll" | "vote",
  "data": { /* action-specific data */ }
}
```

## Testing the API

### Verify API is working:
```bash
curl https://sumup-backend.vercel.app/api/live-status
```

Should return initial state with null values.

### Manual testing (development only):
You can test updates by making POST requests to the API endpoint with the appropriate action and data.

## Troubleshooting

### If notifications don't show:
1. **Check browser console** (F12):
   - Look for errors
   - Should see polls every 5 seconds: `Checking for live updates...`

2. **Verify API works**:
   ```bash
   curl https://sumup-backend.vercel.app/api/live-status
   ```

3. **Clear browser cache**: Ctrl+Shift+Delete

### Common Issues

**"No notifications appearing"**
- Check website is polling (F12 > Network tab > should see requests every 5s)
- Make sure you're on the live site, not local file

**"Poll not working"**
- Votes go through `/api/live-status` with action "vote"
- Check localStorage for previous votes: F12 > Application > Local Storage

## Success Checklist

- [ ] API endpoint responding correctly
- [ ] Website polling every 5 seconds
- [ ] Market status banner working
- [ ] Announcement toasts working
- [ ] Poll widget functional
- [ ] Voting system working

The live status API is now standalone and can be updated programmatically or through a web interface.
