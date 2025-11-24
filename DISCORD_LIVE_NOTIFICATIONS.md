# Discord Bot Live Notifications Integration

## Overview
This system displays live updates from your Discord bot on the website in real-time.

## Features

### 1. Market Status Banner
- **Command**: `!market live` or `!market closed`
- **Display**: Fixed banner at top of page showing market status
- **Styles**: Green gradient for OPEN, gray for CLOSED

### 2. Announcements
- **Command**: `!announce [message]`
- **Display**: Toast notification that slides from top
- **Duration**: Shows for 8 seconds, then auto-hides
- **Example**: `!announce Fresh batch ready at 2pm!`

### 3. Flavor Polls
- **Command**: `!poll flavors Option1,Option2,Option3`
- **Display**: Fixed poll widget in bottom-right corner
- **Features**:
  - Users click to vote
  - Real-time vote counts and percentages
  - Progress bars
  - One vote per user (stored in localStorage)
- **Close**: `!poll close`

## Backend API Endpoints

### Required Endpoints (add to sumup-backend)

```javascript
// Add to your main router
const liveStatusRouter = require('./api/live-status');
app.use('/api', liveStatusRouter);
```

**Endpoints:**
- `GET /api/live-status` - Frontend polls this every 5 seconds
- `POST /api/market-status` - Discord bot calls when `!market` used
- `POST /api/announcement` - Discord bot calls when `!announce` used
- `POST /api/poll` - Discord bot calls when `!poll` used
- `POST /api/poll-vote` - Frontend calls when user votes
- `GET /api/poll/results` - Discord bot gets results

## Discord Bot Integration

### Example Discord Bot Code (Node.js)

```javascript
const fetch = require('node-fetch');
const BACKEND_URL = 'https://sumup-backend.vercel.app';

// Market commands
client.on('messageCreate', async (message) => {
  if (!message.content.startsWith('!')) return;
  
  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  
  // Market status
  if (command === 'market') {
    const status = args[0]; // 'live' or 'closed'
    
    if (!['live', 'closed'].includes(status)) {
      return message.reply('Usage: `!market live` or `!market closed`');
    }
    
    const actualStatus = status === 'live' ? 'open' : 'closed';
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/market-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: actualStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        message.reply(`✅ Market status updated to **${actualStatus.toUpperCase()}** on website!`);
      }
    } catch (error) {
      message.reply('❌ Failed to update market status');
    }
  }
  
  // Announcements
  if (command === 'announce') {
    const announcement = args.join(' ');
    
    if (!announcement) {
      return message.reply('Usage: `!announce [your message]`');
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/announcement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: announcement,
          important: false 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        message.reply(`📢 Announcement posted to website:\n"${announcement}"`);
      }
    } catch (error) {
      message.reply('❌ Failed to post announcement');
    }
  }
  
  // Polls
  if (command === 'poll') {
    const subcommand = args[0];
    
    if (subcommand === 'close') {
      try {
        const response = await fetch(`${BACKEND_URL}/api/poll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: false })
        });
        
        // Get results
        const resultsRes = await fetch(`${BACKEND_URL}/api/poll/results`);
        const results = await resultsRes.json();
        
        if (results.success) {
          let resultText = `📊 **Poll Results** (${results.totalVotes} total votes)\n\n`;
          results.results.forEach((r, i) => {
            const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '▫️';
            resultText += `${emoji} **${r.option}**: ${r.votes} votes (${r.percentage}%)\n`;
          });
          
          message.reply(resultText);
        }
      } catch (error) {
        message.reply('❌ Failed to close poll');
      }
    }
    
    if (subcommand === 'flavors') {
      const flavorsStr = args.slice(1).join(' ');
      const flavors = flavorsStr.split(',').map(f => f.trim()).filter(f => f);
      
      if (flavors.length < 2) {
        return message.reply('Usage: `!poll flavors Option1,Option2,Option3`\nProvide at least 2 options separated by commas.');
      }
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/poll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: 'Vote for Next Flavor!',
            options: flavors,
            active: true
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          let pollText = '🍰 **New Poll Created on Website!**\n\nOptions:\n';
          flavors.forEach((f, i) => {
            pollText += `${i + 1}. ${f}\n`;
          });
          pollText += '\nVisit the website to vote!';
          
          message.reply(pollText);
        }
      } catch (error) {
        message.reply('❌ Failed to create poll');
      }
    }
  }
});
```

## Setup Instructions

### 1. Add Backend Files
Copy these files to your backend:
- `backend-api-live-status.js` → `sumup-backend/api/live-status.js`

### 2. Update Backend Main File
```javascript
// In your index.js or app.js
const liveStatusRouter = require('./api/live-status');
app.use('/api', liveStatusRouter);
```

### 3. Update Discord Bot
Add the command handlers from the example above to your Discord bot.

### 4. Deploy
```bash
# Deploy backend
cd sumup-backend
vercel --prod

# The frontend (index.html) already has the polling code!
```

## Testing

### Test Market Status
```bash
# In Discord
!market live

# Check website - you should see green "WE'RE OPEN!" banner
```

### Test Announcement
```bash
# In Discord
!announce Fresh cupcakes available now!

# Check website - toast notification appears
```

### Test Poll
```bash
# In Discord
!poll flavors Lemon,Caramel,Strawberry

# Check website - poll widget appears in bottom-right
# Click an option to vote
# In Discord: !poll close to see results
```

## How It Works

1. **Discord Bot** receives command (`!market live`)
2. **Bot** makes POST request to backend API
3. **Backend** stores status in memory/database
4. **Website** polls `/api/live-status` every 5 seconds
5. **Website** displays notification/banner/poll based on status
6. **Users** interact with polls on website
7. **Discord Bot** can fetch poll results

## Customization

### Change Poll Duration
In `index.html`, line ~2977:
```javascript
setInterval(checkForLiveUpdates, 5000); // 5 seconds
```

### Change Notification Duration
In `index.html`, line ~3043:
```javascript
setTimeout(() => {
  notification.classList.remove('show');
}, 8000); // 8 seconds
```

### Change Announcement Auto-Clear
In `backend-api-live-status.js`, line ~84:
```javascript
setTimeout(() => {
  liveStatus.announcement = null;
}, 30 * 60 * 1000); // 30 minutes
```

## Features Summary

✅ Market status banner (persistent)
✅ Toast notifications (auto-hide after 8s)
✅ Live polling widget with voting
✅ Real-time vote counts
✅ Mobile responsive
✅ Local storage prevents duplicate votes
✅ Smooth animations
✅ Purple/winter theme styling

All updates are instant and sync across all users viewing the website!
