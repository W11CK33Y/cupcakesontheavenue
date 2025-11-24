/**
 * Discord Live Chat Widget
 * Cupcakes on the Avenue - Customer Support Chat
 */

class DiscordChatWidget {
  constructor(options = {}) {
    this.options = {
      businessName: options.businessName || 'Cupcakes on the Avenue',
      backendUrl: options.backendUrl || 'https://sumup-backend.vercel.app',
      phoneNumber: options.phoneNumber || '07842817789',
      email: options.email || 'cupcakesontheavenue@gmail.com',
      marketInfo: options.marketInfo || 'Saturdays 8am-2pm at Highworth Market',
      ...options
    };

    this.isOpen = false;
    this.sessionId = this.generateSessionId();
    this.messages = this.loadMessages();
    this.lastPollTime = null;
    this.pollInterval = null;
    
    this.init();
  }

  generateSessionId() {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  init() {
    this.createWidget();
    this.attachEventListeners();
    this.restoreMessages();
    
    // Show welcome message for new sessions
    if (this.messages.length === 0) {
      this.showWelcomeMessage();
    }

    // Start polling for new messages every 3 seconds
    this.startPolling();
  }

  startPolling() {
    // Poll for new messages from support
    this.pollInterval = setInterval(() => {
      this.checkForNewMessages();
    }, 3000); // Check every 3 seconds
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  async checkForNewMessages() {
    try {
      const after = this.lastPollTime || new Date(Date.now() - 60000).toISOString();
      const response = await fetch(
        `${this.options.backendUrl}/api/chat-messages?sessionId=${this.sessionId}&after=${after}`
      );
      
      if (!response.ok) return;
      
      const data = await response.json();
      
      if (data.messages && data.messages.length > 0) {
        data.messages.forEach(msg => {
          if (msg.isSupport) {
            // Support message - add to UI
            this.addMessageToUI(msg.message, false, new Date(msg.timestamp).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit' 
            }), true);
            
            // Save to local storage
            this.saveMessage(msg.message, false);
          }
        });
        
        // Update last poll time
        this.lastPollTime = new Date().toISOString();
        
        // Show notification if chat is closed
        if (!this.isOpen && data.messages.length > 0) {
          this.showNotificationBadge();
        }
      }
    } catch (error) {
      console.error('Failed to check for new messages:', error);
    }
  }

  showNotificationBadge() {
    const toggle = this.widget.querySelector('.discord-chat-toggle');
    if (!toggle.querySelector('.chat-notification-badge')) {
      const badge = document.createElement('div');
      badge.className = 'chat-notification-badge';
      badge.textContent = '!';
      toggle.appendChild(badge);
    }
  }

  hideNotificationBadge() {
    const badge = this.widget.querySelector('.chat-notification-badge');
    if (badge) {
      badge.remove();
    }
  }

  createWidget() {
    const widget = document.createElement('div');
    widget.className = 'discord-chat-widget';
    widget.innerHTML = `
      <!-- Chat Toggle Button -->
      <button class="discord-chat-toggle" aria-label="Open chat">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      </button>

      <!-- Chat Window -->
      <div class="discord-chat-window">
        <!-- Header -->
        <div class="chat-header">
          <div class="chat-header-avatar">🧁</div>
          <div class="chat-header-info">
            <h3 class="chat-header-title">${this.options.businessName}</h3>
            <div class="chat-header-status">
              <span class="status-indicator"></span>
              <span>We're here to help!</span>
            </div>
          </div>
          <button class="chat-close-btn" aria-label="Close chat">×</button>
        </div>

        <!-- Messages -->
        <div class="chat-messages" id="chatMessages"></div>

        <!-- Quick Replies -->
        <div class="quick-replies">
          <button class="quick-reply-btn" data-message="What are your opening hours?">
            ⏰ Opening Hours
          </button>
          <button class="quick-reply-btn" data-message="How do I place an order?">
            🛒 How to Order
          </button>
          <button class="quick-reply-btn" data-message="Where are you located?">
            📍 Location
          </button>
          <button class="quick-reply-btn" data-message="Do you do custom cakes?">
            🎂 Custom Cakes
          </button>
        </div>

        <!-- Input -->
        <div class="chat-input-container">
          <div class="chat-input-wrapper">
            <textarea 
              class="chat-input" 
              id="chatInput" 
              placeholder="Type your message..."
              rows="1"
            ></textarea>
          </div>
          <button class="chat-send-btn" id="chatSendBtn" aria-label="Send message">
            ➤
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(widget);
    this.widget = widget;
    this.messagesContainer = widget.querySelector('#chatMessages');
    this.input = widget.querySelector('#chatInput');
  }

  attachEventListeners() {
    // Toggle chat
    this.widget.querySelector('.discord-chat-toggle').addEventListener('click', () => {
      this.toggleChat();
    });

    // Close chat
    this.widget.querySelector('.chat-close-btn').addEventListener('click', () => {
      this.closeChat();
    });

    // Send message
    this.widget.querySelector('#chatSendBtn').addEventListener('click', () => {
      this.sendMessage();
    });

    // Send on Enter (but Shift+Enter for new line)
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea
    this.input.addEventListener('input', () => {
      this.input.style.height = 'auto';
      this.input.style.height = Math.min(this.input.scrollHeight, 120) + 'px';
    });

    // Quick replies
    this.widget.querySelectorAll('.quick-reply-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const message = btn.getAttribute('data-message');
        this.input.value = message;
        this.sendMessage();
      });
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const chatWindow = this.widget.querySelector('.discord-chat-window');
    
    if (this.isOpen) {
      chatWindow.classList.add('open');
      this.input.focus();
      this.scrollToBottom();
      this.hideNotificationBadge();
      // Check for messages when opening
      this.checkForNewMessages();
    } else {
      chatWindow.classList.remove('open');
    }
  }

  closeChat() {
    this.isOpen = false;
    this.widget.querySelector('.discord-chat-window').classList.remove('open');
  }

  showWelcomeMessage() {
    const welcomeHtml = `
      <div class="welcome-message">
        <h3>👋 Welcome to ${this.options.businessName}!</h3>
        <p>Ask us anything about our delicious cupcakes, custom orders, or delivery options. We're here to help!</p>
      </div>
      <div class="contact-info">
        <strong>📞 Quick Contact:</strong><br>
        Phone: ${this.options.phoneNumber}<br>
        Email: ${this.options.email}<br>
        Market: ${this.options.marketInfo}
      </div>
    `;
    
    this.messagesContainer.innerHTML = welcomeHtml;
  }

  restoreMessages() {
    this.messages.forEach(msg => {
      this.addMessageToUI(msg.text, msg.isUser, msg.timestamp, false);
    });
    this.scrollToBottom();
  }

  async sendMessage() {
    const message = this.input.value.trim();
    if (!message) return;

    // Add to UI immediately
    this.addMessageToUI(message, true);
    this.input.value = '';
    this.input.style.height = 'auto';

    // Save message
    this.saveMessage(message, true);

    // Show typing indicator
    this.showTyping();

    try {
      // Send to Discord via backend
      await this.sendToDiscord(message);

      // Hide typing and show confirmation
      setTimeout(() => {
        this.hideTyping();
        const response = `✅ Message sent! We'll reply here in a moment.\n\n📞 Or call: ${this.options.phoneNumber}`;
        this.addMessageToUI(response, false);
        this.saveMessage(response, false);
      }, 800);

    } catch (error) {
      console.error('Failed to send message:', error);
      this.hideTyping();
      this.addMessageToUI('Sorry, we couldn\'t send your message. Please try calling us at ' + this.options.phoneNumber, false);
    }
  }

  async sendToDiscord(message) {
    const payload = {
      message: message,
      sessionId: this.sessionId,
      page: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    const response = await fetch(`${this.options.backendUrl}/api/send-chat-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Failed to send message to Discord');
    }

    return response.json();
  }

  addMessageToUI(text, isUser = false, timestamp = null, scroll = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user' : 'bot'}`;
    
    const time = timestamp || new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });

    messageDiv.innerHTML = `
      <div class="message-avatar">${isUser ? '👤' : '🧁'}</div>
      <div class="message-content">
        <div class="message-author">${isUser ? 'You' : this.options.businessName}</div>
        <div class="message-text">${this.escapeHtml(text).replace(/\n/g, '<br>')}</div>
        <div class="message-time">${time}</div>
      </div>
    `;

    this.messagesContainer.appendChild(messageDiv);
    
    if (scroll) {
      this.scrollToBottom();
    }
  }

  showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot typing-message';
    typingDiv.innerHTML = `
      <div class="message-avatar">🧁</div>
      <div class="message-content">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    
    this.messagesContainer.appendChild(typingDiv);
    this.scrollToBottom();
  }

  hideTyping() {
    const typingMsg = this.messagesContainer.querySelector('.typing-message');
    if (typingMsg) {
      typingMsg.remove();
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }, 100);
  }

  saveMessage(text, isUser) {
    this.messages.push({
      text,
      isUser,
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      })
    });

    // Save to localStorage (keep last 50 messages)
    if (this.messages.length > 50) {
      this.messages = this.messages.slice(-50);
    }
    
    try {
      localStorage.setItem('discord_chat_messages', JSON.stringify(this.messages));
      localStorage.setItem('discord_chat_session', this.sessionId);
    } catch (e) {
      console.warn('Failed to save messages to localStorage');
    }
  }

  loadMessages() {
    try {
      const saved = localStorage.getItem('discord_chat_messages');
      const savedSession = localStorage.getItem('discord_chat_session');
      
      // Start new session if more than 24 hours old
      if (savedSession) {
        const sessionAge = Date.now() - parseInt(savedSession.split('_')[1]);
        if (sessionAge > 24 * 60 * 60 * 1000) {
          localStorage.removeItem('discord_chat_messages');
          localStorage.removeItem('discord_chat_session');
          return [];
        }
        this.sessionId = savedSession;
      }
      
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Public API
  open() {
    if (!this.isOpen) {
      this.toggleChat();
    }
  }

  close() {
    if (this.isOpen) {
      this.toggleChat();
    }
  }

  clearHistory() {
    this.messages = [];
    localStorage.removeItem('discord_chat_messages');
    this.messagesContainer.innerHTML = '';
    this.showWelcomeMessage();
  }
}

// Auto-initialize if configuration exists
if (typeof window !== 'undefined') {
  window.DiscordChatWidget = DiscordChatWidget;
}
