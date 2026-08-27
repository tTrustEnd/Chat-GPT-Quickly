(function () {
  const WIDGET_TEMPLATE = `
    <div class="widget">
      <button class="launcher" type="button" aria-label="Mo Chat GPT Quickly" title="Mo Chat GPT Quickly">
        <img class="launcher-icon" src="${chrome.runtime.getURL('extension_icon.png')}" alt="">
      </button>
      <section class="chat" aria-label="Khung chat" hidden>
        <header class="chat-header">
          <div class="identity">
            <div class="avatar"><img src="${chrome.runtime.getURL('extension_icon.png')}" alt=""></div>
            <div><div class="title">Chat GPT Quickly</div><div class="presence"><span></span> San sang ho tro</div></div>
          </div>
          <button class="close" type="button" aria-label="Dong khung chat" title="Dong">&times;</button>
        </header>
        <div class="messages" aria-live="polite">
          <div class="welcome">
            <div class="welcome-mark">AI</div>
            <h2>Xin chao!</h2>
            <p>Toi co the giup ban tim y tuong, giai dap cau hoi hoac viet noi dung.</p>
          </div>
        </div>
        <form class="composer">
          <div class="composer-row">
            <textarea rows="1" aria-label="Noi dung tin nhan" placeholder="Nhan tin cho Chat GPT..." required></textarea>
            <button class="send" type="submit" aria-label="Gui tin nhan" title="Gui tin nhan">&#8593;</button>
          </div>
          <div class="composer-footer"><span class="composer-status">Enter de gui</span><span>Chat GPT Quickly</span></div>
        </form>
      </section>
    </div>
  `;

  class ChatGPTQuicklyWidget {
    constructor(shadowRoot) {
      this.shadowRoot = shadowRoot;
      this.elements = {};
      this.conversation = [];
      this.isSending = false;
    }

    mount() {
      this.shadowRoot.innerHTML = WIDGET_TEMPLATE;
      this.loadStylesheet();
      this.cacheElements();
      this.bindEvents();
    }

    loadStylesheet() {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = chrome.runtime.getURL('chat-widget.css');
      this.shadowRoot.prepend(stylesheet);
    }

    cacheElements() {
      this.elements.launcher = this.shadowRoot.querySelector('.launcher');
      this.elements.chat = this.shadowRoot.querySelector('.chat');
      this.elements.close = this.shadowRoot.querySelector('.close');
      this.elements.form = this.shadowRoot.querySelector('.composer');
      this.elements.textarea = this.shadowRoot.querySelector('textarea');
      this.elements.messages = this.shadowRoot.querySelector('.messages');
      this.elements.status = this.shadowRoot.querySelector('.composer-status');
    }

    bindEvents() {
      this.elements.launcher.addEventListener('click', () => this.setOpen(true));
      this.elements.close.addEventListener('click', () => this.closeChat());
      this.elements.form.addEventListener('submit', (event) => this.sendMessage(event));
      this.elements.textarea.addEventListener('input', () => this.resizeTextarea());
      this.elements.textarea.addEventListener('keydown', (event) => this.handleTextareaKeydown(event));
    }

    setOpen(isOpen) {
      this.elements.chat.hidden = !isOpen;
      this.elements.launcher.hidden = isOpen;
      if (isOpen) this.elements.textarea.focus();
    }

    closeChat() {
      this.setOpen(false);
      this.elements.launcher.focus();
    }

    resizeTextarea() {
      this.elements.textarea.style.height = 'auto';
      this.elements.textarea.style.height = `${Math.min(this.elements.textarea.scrollHeight, 110)}px`;
    }

    handleTextareaKeydown(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.elements.form.requestSubmit();
      }
    }

    async sendMessage(event) {
      event.preventDefault();
      const text = this.elements.textarea.value.trim();
      if (!text || this.isSending) return;

      const apiKey = await this.getApiKey();
      if (!apiKey) return;

      const userMessage = document.createElement('div');
      userMessage.className = 'message user';
      userMessage.textContent = text;
      this.elements.messages.appendChild(userMessage);
      this.conversation.push({ role: 'user', content: text });
      this.elements.textarea.value = '';
      this.resizeTextarea();
      this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
      this.setSending(true);
      console.log('[Chat GPT Quickly] Sending message', { messageCount: this.conversation.length });

      try {
        const reply = await this.streamReply(apiKey);
        this.conversation.push({ role: 'assistant', content: reply });
      } catch (error) {
        console.error('[Chat GPT Quickly] Widget request failed', error);
        this.addAssistantMessage(`Gemini: ${error.message}`);
      } finally {
        this.setSending(false);
      }
    }

    streamReply(apiKey) {
      return new Promise((resolve, reject) => {
        const port = chrome.runtime.connect({ name: 'gemini-chat' });
        const assistantMessage = this.addAssistantMessage('');
        let reply = '';
        let pendingText = '';
        let streamFinished = false;
        let isTyping = false;
        let settled = false;

        const typeNextCharacter = () => {
          if (pendingText) {
            assistantMessage.textContent += pendingText[0];
            pendingText = pendingText.slice(1);
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
            window.setTimeout(typeNextCharacter, 12);
            return;
          }
          isTyping = false;
          if (streamFinished && !settled) {
            settled = true;
            resolve(reply);
          }
        };

        port.onMessage.addListener((message) => {
          if (message.type === 'chunk') {
            reply += message.text;
            pendingText += message.text;
            if (!isTyping) {
              isTyping = true;
              typeNextCharacter();
            }
          }
          if (message.type === 'done') {
            streamFinished = true;
            if (!isTyping && !settled) {
              settled = true;
              resolve(reply);
            }
          }
          if (message.type === 'error' && !settled) {
            settled = true;
            reject(new Error(message.error));
          }
        });
        port.onDisconnect.addListener(() => {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        });
        port.postMessage({ type: 'chat', apiKey, messages: this.conversation });
      });
    }

    async getApiKey() {
      const stored = await chrome.storage.local.get('geminiApiKey');
      if (stored.geminiApiKey) return stored.geminiApiKey;

      const apiKey = window.prompt('Nhap Gemini API key:');
      if (!apiKey || !apiKey.trim()) return '';
      const trimmedKey = apiKey.trim();
      await chrome.storage.local.set({ geminiApiKey: trimmedKey });
      return trimmedKey;
    }

    addAssistantMessage(text) {
      const assistantMessage = document.createElement('div');
      assistantMessage.className = 'message assistant';
      assistantMessage.textContent = text;
      this.elements.messages.appendChild(assistantMessage);
      this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
      return assistantMessage;
    }

    setSending(isSending) {
      this.isSending = isSending;
      this.elements.textarea.disabled = isSending;
      this.elements.status.textContent = isSending ? 'GPT dang tra loi...' : 'Enter de gui';
    }
  }

  window.ChatGPTQuicklyWidget = ChatGPTQuicklyWidget;
})();