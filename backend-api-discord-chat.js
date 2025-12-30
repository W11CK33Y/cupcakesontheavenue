/**
 * Discord Chat API Endpoint
 * Add this to your sumup-backend on Vercel
 * 
 * Deployment Instructions:
 * 1. Copy this to your Vercel backend project at: api/discord-chat.js
 * 2. Make sure it's exported as a serverless function (if using Vercel)
 * 3. The endpoint will be: https://sumup-backend.vercel.app/api/send-chat-message
 */

const fetch = require('node-fetch');

// Store chat messages in memory (use database in production)
const chatMessages = [];

/**
 * POST /api/send-chat-message
 * Receives message from website and sends to Discord webhook
 */
async function handleSendChatMessage(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, sessionId, page, timestamp, userAgent, webhookUrl } = req.body;

    // Validate inputs
    if (!message || !sessionId || !webhookUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: message, sessionId, webhookUrl'
      });
    }

    // Store message
    const chatMessage = {
      id: Date.now(),
      message,
      sessionId,
      page,
      timestamp: timestamp || new Date().toISOString(),
      userAgent,
      isUser: true,
      createdAt: new Date()
    };
    chatMessages.push(chatMessage);

    // Send to Discord webhook
    const discordPayload = {
      content: `**💬 New Customer Message**\n\n"${message}"\n\n**Session:** \`${sessionId}\`\n**Page:** ${page}\n**Time:** ${new Date(timestamp || Date.now()).toLocaleString()}`
    };

    console.log('Sending to Discord webhook:', webhookUrl);
    console.log('Payload:', discordPayload);

    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(discordPayload)
    });

    if (!discordResponse.ok) {
      console.error('Discord webhook error:', discordResponse.status, discordResponse.statusText);
      const errorText = await discordResponse.text();
      console.error('Discord error response:', errorText);
      
      return res.status(502).json({
        success: false,
        error: 'Failed to send message to Discord',
        details: errorText
      });
    }

    console.log('Message sent to Discord successfully');

    res.json({
      success: true,
      message: 'Message sent to Discord',
      messageId: chatMessage.id
    });

  } catch (error) {
    console.error('Error in send-chat-message:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}

/**
 * GET /api/chat-messages
 * Retrieve chat messages for a session
 */
async function handleGetChatMessages(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { sessionId, after } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionId parameter'
      });
    }

    let messages = chatMessages.filter(m => m.sessionId === sessionId);

    if (after) {
      const afterTime = new Date(after);
      messages = messages.filter(m => new Date(m.createdAt) > afterTime);
    }

    res.json({
      success: true,
      messages
    });

  } catch (error) {
    console.error('Error in get-chat-messages:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Main handler for Vercel serverless function
 */
async function handler(req, res) {
  if (req.url.includes('/api/send-chat-message')) {
    return handleSendChatMessage(req, res);
  } else if (req.url.includes('/api/chat-messages')) {
    return handleGetChatMessages(req, res);
  }
  
  res.status(404).json({ error: 'Not found' });
}

module.exports = handler;

// For local Express server, export the functions separately:
module.exports.sendChatMessage = handleSendChatMessage;
module.exports.getChatMessages = handleGetChatMessages;
