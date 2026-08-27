(function () {
  if (window.top !== window.self || document.getElementById('chat-gpt-quickly-host')) {
    return;
  }

  const host = document.createElement('div');
  host.id = 'chat-gpt-quickly-host';
  document.documentElement.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: 'closed' });
  const widget = new window.ChatGPTQuicklyWidget(shadowRoot);
  widget.mount();
})();(function () {
  if (window.top !== window.self || document.getElementById('chat-gpt-quickly-host')) {
    return;
  }

  const host = document.createElement('div');
  host.id = 'chat-gpt-quickly-host';
  document.documentElement.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: 'closed' });
  shadowRoot.innerHTML = `
    <style>
      :host { all: initial; }
      .widget, .widget * { box-sizing: border-box; }
      .widget {
        color: #17202a;
        font-family: "Segoe UI", system-ui, sans-serif;
        font-size: 14px;
        line-height: 1.4;
      }
      .launcher {
        align-items: center;
        background: #1e6f5c;
        border: 0;
        border-radius: 50%;
        bottom: 30px;
        box-shadow: 0 8px 22px rgba(16, 45, 38, .25);
        color: #fff;
        cursor: pointer;
        display: flex;
        font-size: 12px;
        font-weight: 700;
        height: 56px;
        justify-content: center;
        position: fixed;
        right: 30px;
        transition: transform .2s ease, background .2s ease;
        width: 56px;
        z-index: 2147483647;
      }
      .launcher:hover { background: #185b4b; transform: translateY(-2px); }
      .launcher:focus-visible, .send:focus-visible, .close:focus-visible, textarea:focus-visible {
        outline: 3px solid #f2c14e;
        outline-offset: 2px;
      }
      .launcher::before {
        border: 2px solid currentColor;
        border-radius: 7px;
        content: "";
        height: 22px;
        position: absolute;
        width: 27px;
      }
      .launcher::after {
        border-bottom: 2px solid currentColor;
        border-left: 2px solid currentColor;
        bottom: 15px;
        content: "";
        height: 7px;
        left: 17px;
        position: absolute;
        transform: skew(-25deg);
        width: 7px;
      }
      .launcher-label { margin-top: 1px; position: relative; z-index: 1; }
      .chat {
        background: #fbfaf7;
        border: 1px solid #dce5df;
        border-radius: 16px;
        bottom: 30px;
        box-shadow: 0 18px 50px rgba(23, 32, 42, .22);
        display: flex;
        flex-direction: column;
        height: 600px;
        overflow: hidden;
        position: fixed;
        right: 30px;
        width: 420px;
        z-index: 2147483647;
      }
      .chat[hidden] { display: none; }
      .chat-header {
        align-items: center;
        background: #1e6f5c;
        color: #fff;
        display: flex;
        justify-content: space-between;
        min-height: 70px;
        padding: 16px 18px;
      }
      .eyebrow { color: #c8e4d9; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
      .title { font-size: 18px; font-weight: 700; margin: 2px 0 0; }
      .close { background: transparent; border: 0; color: #fff; cursor: pointer; font-size: 26px; line-height: 1; padding: 6px; }
      .messages { display: flex; flex: 1; flex-direction: column; gap: 12px; overflow-y: auto; padding: 20px 16px; }
      .message { border-radius: 12px; max-width: 85%; padding: 10px 12px; white-space: pre-wrap; }
      .message.assistant { align-self: flex-start; background: #e8f1ed; }
      .message.user { align-self: flex-end; background: #f2c14e; }
      .composer { background: #fff; border-top: 1px solid #e1e7e3; padding: 12px; }
      .composer-row { align-items: flex-end; display: flex; gap: 8px; }
      textarea { border: 1px solid #c9d5ce; border-radius: 10px; color: #17202a; flex: 1; font: inherit; min-height: 44px; max-height: 110px; padding: 11px; resize: none; }
      textarea::placeholder { color: #7b8982; }
      .send { background: #1e6f5c; border: 0; border-radius: 10px; color: #fff; cursor: pointer; font-weight: 700; min-height: 44px; padding: 0 14px; }
      .send:hover { background: #185b4b; }
      .status { color: #7b8982; font-size: 11px; margin: 7px 2px 0; }
      @media (max-width: 480px) {
        .chat { bottom: 16px; height: min(600px, calc(100vh - 32px)); right: 16px; width: calc(100vw - 32px); }
        .launcher { bottom: 20px; right: 20px; }
      }
    </style>
    <div class="widget">
      <button class="launcher" type="button" aria-label="Mo Chat GPT Quickly" title="Mo Chat GPT Quickly">
        <span class="launcher-label">AI</span>
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

  const launcher = shadowRoot.querySelector('.launcher');
  const chat = shadowRoot.querySelector('.chat');
  const close = shadowRoot.querySelector('.close');
  const form = shadowRoot.querySelector('.composer');
  const textarea = shadowRoot.querySelector('textarea');
  const messages = shadowRoot.querySelector('.messages');

  function setOpen(isOpen) {
    chat.hidden = !isOpen;
    launcher.hidden = isOpen;
    if (isOpen) textarea.focus();
  }

  launcher.addEventListener('click', function () { setOpen(true); });
  close.addEventListener('click', function () { setOpen(false); launcher.focus(); });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const text = textarea.value.trim();
    if (!text) return;

    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.textContent = text;
    messages.appendChild(userMessage);
    textarea.value = '';
    messages.scrollTop = messages.scrollHeight;
  });
})();