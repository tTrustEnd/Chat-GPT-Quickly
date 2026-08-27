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
          <div class="composer-footer"><span>Enter de gui</span><span>Chat GPT Quickly</span></div>
        </form>
      </section>
    </div>
  `;

  class ChatGPTQuicklyWidget {
    constructor(shadowRoot) {
      this.shadowRoot = shadowRoot;
      this.elements = {};
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

    sendMessage(event) {
      event.preventDefault();
      const text = this.elements.textarea.value.trim();
      if (!text) return;

      const userMessage = document.createElement('div');
      userMessage.className = 'message user';
      userMessage.textContent = text;
      this.elements.messages.appendChild(userMessage);
      this.elements.textarea.value = '';
      this.resizeTextarea();
      this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }
  }

  window.ChatGPTQuicklyWidget = ChatGPTQuicklyWidget;
})();