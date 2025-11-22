# 🎯 Discord Live Chat Widget Setup Guide

## Overview
Connect your website's live chat directly to your Discord server! Customer messages appear in Discord, and you can respond from there.

---

## ✅ Step 1: Create Discord Webhook

### 1.1 Open Your Discord Server
- Go to your Discord server where you want chat messages
- Right-click on the channel (create a new one called `#website-chat` if needed)

### 1.2 Create Webhook
1. Click **Edit Channel** (gear icon)
2. Go to **Integrations** tab
3. Click **Create Webhook** or **View Webhooks**
4. Click **New Webhook**
5. Name it: `Website Live Chat`
6. Choose the channel (e.g., `#website-chat`)
7. Click **Copy Webhook URL** (save this!)
8. Click **Save Changes**

Your webhook URL looks like:
```
https://discord.com/api/webhooks/123456789/abcdefghijk...
```

---

## ✅ Step 2: Add Chat Widget to Your Website

### 2.1 Add Files to Your Site
The widget consists of 2 files (already created):
- `discord-chat.css` - Styling
- `discord-chat.js` - Functionality

### 2.2 Update index.html
Add these lines before the closing `</body>` tag:

```html
<!-- Discord Live Chat Widget -->
<link rel="stylesheet" href="discord-chat.css">
<script src="discord-chat.js"></script>
<script>
  // Initialize Discord chat after page loads
  document.addEventListener('DOMContentLoaded', function() {
    window.discordChat = new DiscordChatWidget({
      webhookUrl: 'YOUR_DISCORD_WEBHOOK_URL_HERE', // Paste your webhook URL
      businessName: 'Cupcakes on the Avenue'
    });
  });
</script>
```

### 2.3 Configure Webhook URL
In the `discord-chat.js` file, replace:
```javascript
webhookUrl: 'YOUR_DISCORD_WEBHOOK_URL_HERE'
```

With your actual webhook URL:
```javascript
webhookUrl: 'https://discord.com/api/webhooks/123456789/abcdefghijk...'
```

---

## ✅ Step 3: Test the Chat

### 3.1 Test on Your Website
1. Open your website
2. Look for the Discord logo button in bottom-right corner
3. Click to open chat window
4. Send a test message: "Testing live chat!"

### 3.2 Check Discord
1. Go to your Discord channel
2. You should see a message appear with:
   - 💬 New Customer Chat Message
   - The message content
   - Session ID, time, and page
   - Timestamp

---

## 🎨 Features Included

### Customer Side:
✅ **Floating Chat Button** - Discord-branded button in bottom-right
✅ **Modern Chat Interface** - Beautiful purple Discord colors
✅ **Quick Replies** - Pre-written common questions
✅ **Auto-responses** - Instant acknowledgment with your contact info
✅ **Session Tracking** - Each conversation has unique ID
✅ **Message History** - Saves chat in browser
✅ **Typing Indicators** - Shows when "support" is typing
✅ **Mobile Responsive** - Works perfectly on phones

### Your Side (Discord):
✅ **Instant Notifications** - All messages appear in Discord
✅ **Rich Embeds** - Formatted with customer info
✅ **Session IDs** - Track conversations
✅ **Timestamps** - Know when messages were sent
✅ **Page Tracking** - See which page customer is on

---

## 💡 How to Use

### When Customer Sends Message:
1. Customer clicks chat button on your site
2. They type and send a message
3. Message instantly appears in your Discord channel
4. They get auto-response: "Thanks for your message! We'll respond shortly..."

### How You Respond:
**Option A: Via Phone/Email (Current Setup)**
- Customer gets your phone number (07842817789) and email in auto-response
- You can call or email them directly

**Option B: Two-Way Discord Chat (Advanced Setup - Optional)**
- Requires Discord bot setup
- You can reply directly in Discord
- Message appears on customer's website chat
- See "Advanced Setup" section below

---

## 🎯 Quick Replies Included

Your chat has 4 pre-configured quick replies:
1. **⏰ Opening Hours** - "What are your opening hours?"
2. **🛒 How to Order** - "How do I place an order?"
3. **📍 Location** - "Where are you located?"
4. **🎂 Custom Cakes** - "Do you do custom cakes?"

### Customize Quick Replies:
Edit in `discord-chat.js`:
```javascript
<button class="quick-reply-btn" data-message="Your custom question">
  🆕 Your Button Text
</button>
```

---

## 🎨 Customization Options

### Change Colors:
In `discord-chat.css`, modify:
```css
background: linear-gradient(135deg, #5865F2 0%, #7289DA 100%);
```
Change to your brand colors (e.g., purple cupcake gradient):
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Change Position:
Move chat button to left side:
```css
.discord-chat-widget {
  right: auto;
  left: 20px;
}
```

### Change Business Name:
```javascript
businessName: 'Cupcakes on the Avenue' // Change this
```

### Change Icon:
Replace the 🧁 emoji in the header:
```html
<div class="chat-header-avatar">🎂</div> <!-- Change emoji -->
```

---

## 📱 Mobile Optimization

The chat automatically adapts to mobile screens:
- Full-width on phones
- Smooth animations
- Touch-friendly buttons
- Scrollable message area

---

## 🚀 Advanced: Two-Way Communication (Optional)

For replies to appear on customer's website, you need a Discord bot:

### Step 1: Create Discord Bot
1. Go to https://discord.com/developers/applications
2. Create new application
3. Go to "Bot" → Add Bot
4. Copy bot token
5. Invite bot to your server

### Step 2: Set Up Bot Server
Create a simple server that:
- Listens to Discord messages in your channel
- Sends them back to website via WebSocket or polling
- Updates customer's chat window in real-time

### Step 3: Update Widget
Add bot token and channel ID:
```javascript
botToken: 'YOUR_BOT_TOKEN_HERE',
channelId: 'YOUR_CHANNEL_ID_HERE'
```

This is more complex and requires hosting a small Node.js server.

---

## 🔒 Security Best Practices

### Webhook URL Protection:
⚠️ **Important**: Don't expose your webhook URL in public GitHub repos!

**Solution 1: Environment Variables (Recommended)**
```javascript
webhookUrl: process.env.DISCORD_WEBHOOK_URL // Server-side only
```

**Solution 2: Backend Proxy**
Send messages through your backend instead:
```javascript
// In discord-chat.js, change sendToDiscord to:
await fetch('/api/send-chat-message', {
  method: 'POST',
  body: JSON.stringify({ message })
});

// In your backend, forward to Discord:
app.post('/api/send-chat-message', async (req, res) => {
  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify(req.body)
  });
});
```

### Rate Limiting:
Discord webhooks are limited to 30 messages per minute. The widget handles this automatically.

---

## 🐛 Troubleshooting

### Chat Button Not Appearing:
- Check browser console for errors
- Verify CSS and JS files are loaded
- Check file paths are correct

### Messages Not Reaching Discord:
- Verify webhook URL is correct
- Check Discord channel permissions
- Open browser console to see error messages
- Test webhook URL with curl:
```bash
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message"}'
```

### Chat Window Not Opening:
- Check JavaScript errors in console
- Verify DiscordChatWidget is initialized
- Try refreshing the page

### Mobile Issues:
- Clear browser cache
- Test in incognito mode
- Check viewport meta tag is present

---

## 📊 Analytics & Tracking

### Track Chat Usage:
Add to `sendMessage()` function:
```javascript
// Google Analytics
if (window.gtag) {
  gtag('event', 'chat_message_sent', {
    session_id: this.sessionId,
    message_length: message.length
  });
}
```

### Monitor Response Times:
Check Discord message timestamps to see how fast you respond.

---

## 🎁 Pro Tips

1. **Set Up Discord Mobile App** - Get push notifications on your phone
2. **Create #website-chat Channel** - Keep chat organized
3. **Use Discord Bot Commands** - Auto-categorize messages
4. **Pin Important Info** - Pin common responses in Discord
5. **Set Up Discord Roles** - Assign team members to handle chats
6. **Schedule Auto-responses** - Use Discord bots for after-hours

---

## 📞 Contact Methods in Auto-Response

Current auto-response includes:
- ☎️ Phone: 07842817789
- 📧 Email: cupcakesontheavenue@gmail.com
- 🏪 Market: Saturdays 8am-2pm at Highworth Market

Customers can reach you immediately while you prepare a detailed response!

---

## 🆘 Support

If you need help setting this up:
1. Check Discord webhook is working with test message
2. Verify JavaScript console for errors
3. Test on different browsers
4. Contact me for additional customization

---

Perfect for managing customer inquiries for **Cupcakes on the Avenue**! 🧁💬✨