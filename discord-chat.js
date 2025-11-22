// Discord Live Chat Widget
// Integrates with Discord webhook for customer support

class DiscordChatWidget {
  constructor(config) {
    this.webhookUrl = config.webhookUrl;
    this.channelId = config.channelId;
    this.botToken = config.botToken;
    this.businessName = config.businessName || 'Cupcakes on the Avenue';
    this.messages = [];
    this.isOpen = false;
    this.sessionId = this.generateSessionId();
    
    this.init();
  }

  generateSessionId() {
    return 'CHAT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  init() {
    this.injectStyles();
    this.createWidget();
    this.attachEventListeners();
    this.loadWelcomeMessage();
  }

  injectStyles() {
    if (!document.getElementById('discord-chat-styles')) {
      const link = document.createElement('link');
      link.id = 'discord-chat-styles';
      link.rel = 'stylesheet';
      link.href = 'discord-chat.css';
      document.head.appendChild(link);
    }
  }

  createWidget() {
    const widget = document.createElement('div');
    widget.className = 'discord-chat-widget';
    widget.innerHTML = `
      <button class="chat-button" id="chatToggleBtn" aria-label="Open chat">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      </button>

      <div class="chat-window" id="chatWindow">
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-header-avatar">🧁</div>
            <div class="chat-header-text">
              <h3>${this.businessName}</h3>
              <p>Usually replies instantly</p>
            </div>
          </div>
          <button class="chat-close" id="chatCloseBtn" aria-label="Close chat">×</button>
        </div>

        <div class="chat-messages" id="chatMessages">
          <div class="chat-welcome">
            <h4>👋 Welcome to ${this.businessName}!</h4>
            <p>Ask us anything about our cupcakes, cakes, or orders.</p>
          </div>
        </div>

        <div class="chat-typing" id="chatTyping">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div class="chat-input-area">
          <div class="chat-quick-replies" id="quickReplies">
            <button class="quick-reply-btn" data-message="What are your opening hours?">⏰ Opening Hours</button>
            <button class="quick-reply-btn" data-message="How do I place an order?">🛒 How to Order</button>
            <button class="quick-reply-btn" data-message="Where are you located?">📍 Location</button>
            <button class="quick-reply-btn" data-message="Do you do custom cakes?">🎂 Custom Cakes</button>
          </div>
          
          <div class="chat-input-wrapper">
            <textarea 
              class="chat-input" 
              id="chatInput" 
              placeholder="Type your message..."
              rows="1"
            ></textarea>
            <button class="chat-send-btn" id="chatSendBtn" aria-label="Send message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="chat-powered-by">
          Powered by <a href="https://discord.com" target="_blank">Discord</a>
        </div>
      </div>
    `;

    document.body.appendChild(widget);
  }

  attachEventListeners() {
    const toggleBtn = document.getElementById('chatToggleBtn');
    const closeBtn = document.getElementById('chatCloseBtn');
    const sendBtn = document.getElementById('chatSendBtn');
    const input = document.getElementById('chatInput');
    const quickReplies = document.querySelectorAll('.quick-reply-btn');

    toggleBtn.addEventListener('click', () => this.toggleChat());
    closeBtn.addEventListener('click', () => this.closeChat());
    sendBtn.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea
    input.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });

    // Quick replies
    quickReplies.forEach(btn => {
      btn.addEventListener('click', () => {
        const message = btn.dataset.message;
        input.value = message;
        this.sendMessage();
      });
    });
  }

  toggleChat() {
    const window = document.getElementById('chatWindow');
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      window.classList.add('open');
      document.getElementById('chatInput').focus();
      
      // Send session start notification to Discord
      this.sendSystemMessage('🟢 New chat session started');
    } else {
      window.classList.remove('open');
    }
  }

  closeChat() {
    const window = document.getElementById('chatWindow');
    window.classList.remove('open');
    this.isOpen = false;
  }

  loadWelcomeMessage() {
    // Load previous messages from localStorage if available
    const savedMessages = localStorage.getItem(`discord_chat_${this.sessionId}`);
    if (savedMessages) {
      this.messages = JSON.parse(savedMessages);
      this.renderMessages();
    }
  }

  async sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;

    // Add customer message to UI
    this.addMessage(message, 'customer');
    input.value = '';
    input.style.height = 'auto';

    // Show typing indicator
    this.showTyping();

    // Send to Discord webhook
    try {
      await this.sendToDiscord(message);
      
      // Auto-reply with acknowledgment
      setTimeout(() => {
        this.hideTyping();
        this.addMessage(
          "Thanks for your message! We'll respond shortly. For immediate assistance, call us at 07842817789 or visit us at Highworth Market on Saturdays! 🧁",
          'support'
        );
      }, 1500);

    } catch (error) {
      console.error('Error sending to Discord:', error);
      this.hideTyping();
      this.addMessage(
        "Sorry, there was an issue sending your message. Please try calling us at 07842817789 or email cupcakesontheavenue@gmail.com",
        'support'
      );
    }
  }

  async sendToDiscord(message) {
    const embed = {
      embeds: [{
        title: '💬 New Customer Chat Message',
        description: message,
        color: 0x667eea,
        fields: [
          {
            name: '🆔 Session ID',
            value: this.sessionId,
            inline: true
          },
          {
            name: '⏰ Time',
            value: new Date().toLocaleString(),
            inline: true
          },
          {
            name: '🌐 Page',
            value: window.location.pathname,
            inline: true
          }
        ],
        footer: {
          text: 'Reply in Discord to respond to customer'
        },
        timestamp: new Date().toISOString()
      }]
    };

    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(embed)
    });

    if (!response.ok) {
      throw new Error('Failed to send to Discord');
    }
  }

  async sendSystemMessage(message) {
    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `${message} - Session: ${this.sessionId}`
        })
      });
    } catch (error) {
      console.error('Error sending system message:', error);
    }
  }

  addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
      ${text}
      <div class="chat-message-time">${time}</div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Save to messages array and localStorage
    this.messages.push({ text, sender, time });
    localStorage.setItem(`discord_chat_${this.sessionId}`, JSON.stringify(this.messages));
  }

  renderMessages() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '';
    
    this.messages.forEach(msg => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `chat-message ${msg.sender}`;
      messageDiv.innerHTML = `
        ${msg.text}
        <div class="chat-message-time">${msg.time}</div>
      `;
      messagesContainer.appendChild(messageDiv);
    });
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  showTyping() {
    document.getElementById('chatTyping').classList.add('active');
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTyping() {
    document.getElementById('chatTyping').classList.remove('active');
  }
}

// Initialize the chat widget when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Configure your Discord webhook URL here
  const discordChat = new DiscordChatWidget({
    webhookUrl: 'YOUR_DISCORD_WEBHOOK_URL_HERE', // Replace with your Discord webhook URL
    businessName: 'Cupcakes on the Avenue',
    channelId: 'YOUR_CHANNEL_ID', // Optional: for advanced features
    botToken: 'YOUR_BOT_TOKEN' // Optional: for two-way communication
  });

  // Make it globally accessible for debugging
  window.discordChat = discordChat;
});