(function () {
  const WIDGET_TEMPLATE = `
    <div class="widget">
      <button class="launcher" type="button" aria-label="Mo Chat GPT Quickly" title="Mo Chat GPT Quickly">
        <img class="launcher-icon" src="${chrome.runtime.getURL('extension_icon.png')}" alt="">
      </button>
      <section class="chat" aria-label="Khung chat" hidden>
        <header class="chat-header">
          <div><div class="eyebrow">Truc tro ly</div><div class="title">Chat GPT Quickly</div></div>
          <button class="close" type="button" aria-label="Dong khung chat" title="Dong">&times;</button>
        </header>
        <div class="messages" aria-live="polite">
          <div class="message assistant">Xin chao! Toi co the giup gi cho ban?</div>
        </div>
        <form class="composer">
          <div class="composer-row">
            <textarea rows="1" aria-label="Noi dung tin nhan" placeholder="Nhap noi dung..." required></textarea>
            <button class="send" type="submit">Gui</button>
          </div>
          <div class="status">Ban co the ket noi API AI o buoc tiep theo.</div>
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

    sendMessage(event) {
      event.preventDefault();
      const text = this.elements.textarea.value.trim();
      if (!text) return;

      const userMessage = document.createElement('div');
      userMessage.className = 'message user';
      userMessage.textContent = text;
      this.elements.messages.appendChild(userMessage);
      this.elements.textarea.value = '';
      this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }
  }

  window.ChatGPTQuicklyWidget = ChatGPTQuicklyWidget;
})();