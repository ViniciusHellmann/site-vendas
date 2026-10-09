/* WebForge AI Chat - integração segura via Supabase Edge Function.
   Configure apenas a URL do projeto e a chave PUBLICÁVEL do Supabase abaixo.
   Nunca coloque a chave da API Gemini neste arquivo. */
(() => {
  "use strict";

  const CONFIG = {
    supabaseUrl: "https://voclgnvagmpkvmdknjti.supabase.co",
    publishableKey: "sb_publishable_wA7Zqo4Bc7rRsDZyh2osyA_ngX1ryMe"
  };

  const isConfigured =
    CONFIG.supabaseUrl.startsWith("https://") &&
    CONFIG.supabaseUrl.endsWith(".supabase.co") &&
    CONFIG.publishableKey.startsWith("sb_publishable_") &&
    !CONFIG.supabaseUrl.includes("COLE_AQUI") &&
    !CONFIG.publishableKey.includes("COLE_AQUI");

  const css = `
    #wfai-launcher{position:fixed;right:22px;bottom:92px;z-index:9998;border:0;border-radius:999px;padding:14px 18px;background:linear-gradient(135deg,#7c5cff,#5f83ff);color:#fff;font:700 14px/1.2 system-ui,sans-serif;box-shadow:0 12px 35px #0006;cursor:pointer;display:flex;align-items:center;gap:9px}
    #wfai-launcher:hover{filter:brightness(1.08);transform:translateY(-1px)}
    #wfai-panel{position:fixed;right:22px;bottom:154px;width:min(370px,calc(100vw - 28px));height:min(530px,calc(100dvh - 190px));z-index:9999;display:none;flex-direction:column;overflow:hidden;border:1px solid rgba(255,255,255,.13);border-radius:18px;background:#0d1320;color:#f7f8fc;box-shadow:0 24px 70px #0008;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    #wfai-panel.wfai-open{display:flex}
    .wfai-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 17px;background:linear-gradient(135deg,#171c32,#11182a);border-bottom:1px solid #ffffff15}
    .wfai-brand{display:flex;align-items:center;gap:10px}.wfai-avatar{width:38px;height:38px;display:grid;place-items:center;border-radius:12px;background:linear-gradient(135deg,#7c5cff,#5f83ff);font-size:20px}.wfai-title{font-size:14px;font-weight:800}.wfai-subtitle{font-size:11px;color:#a8b1c5;margin-top:3px}.wfai-close{border:0;background:transparent;color:#c7cce0;font-size:24px;cursor:pointer;padding:4px 8px}
    #wfai-messages{display:flex;flex:1;flex-direction:column;gap:12px;overflow:auto;padding:16px;background:radial-gradient(circle at top right,#171a36 0,transparent 45%),#0d1320}
    .wfai-message{max-width:88%;white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px;line-height:1.5;padding:11px 13px;border-radius:14px}.wfai-bot{align-self:flex-start;background:#171f30;border:1px solid #ffffff0e;color:#e7eaf4;border-bottom-left-radius:5px}.wfai-user{align-self:flex-end;background:linear-gradient(135deg,#6e51e8,#536fe0);color:white;border-bottom-right-radius:5px}.wfai-error{color:#ffb4b4}.wfai-typing{color:#9da8bd;font-size:12px;padding:2px 3px}
    .wfai-quick{display:flex;gap:7px;flex-wrap:wrap;padding:0 13px 10px;background:#0d1320}.wfai-chip{border:1px solid #ffffff1c;border-radius:999px;background:#131b2b;color:#cbd3e5;font-size:11px;padding:7px 10px;cursor:pointer}.wfai-chip:hover{border-color:#8c78ff;color:white}
    .wfai-compose{display:flex;gap:8px;padding:12px;border-top:1px solid #ffffff12;background:#0a101b}.wfai-input{min-width:0;flex:1;resize:none;max-height:90px;border:1px solid #ffffff17;border-radius:11px;background:#111827;color:#fff;padding:11px;font:13px/1.4 system-ui,sans-serif;outline:none}.wfai-input:focus{border-color:#7c5cff}.wfai-send{width:43px;min-width:43px;border:0;border-radius:11px;background:#7c5cff;color:white;font-size:18px;cursor:pointer}.wfai-send:disabled{opacity:.45;cursor:wait}.wfai-footnote{font-size:9px;color:#66738a;text-align:center;padding:0 10px 10px;background:#0a101b}
    @media(max-width:480px){#wfai-launcher{right:14px;bottom:88px;padding:13px 15px}#wfai-panel{right:8px;bottom:145px;width:calc(100vw - 16px);height:min(560px,calc(100dvh - 165px))}}
  `;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const launcher = document.createElement("button");
  launcher.id = "wfai-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Conversar com a assistente virtual");
  launcher.innerHTML = '<span aria-hidden="true">✦</span><span>Fale com a IA</span>';

  const panel = document.createElement("section");
  panel.id = "wfai-panel";
  panel.setAttribute("aria-label", "Assistente virtual WebForge");
  panel.innerHTML = `
    <header class="wfai-head">
      <div class="wfai-brand"><div class="wfai-avatar" aria-hidden="true">✦</div><div><div class="wfai-title">Assistente WebForge</div><div class="wfai-subtitle">Tire dúvidas sobre seu site</div></div></div>
      <button class="wfai-close" type="button" aria-label="Fechar chat">×</button>
    </header>
    <div id="wfai-messages" aria-live="polite"></div>
    <div class="wfai-quick">
      <button class="wfai-chip" type="button">Quanto custa um site?</button>
      <button class="wfai-chip" type="button">Quero uma landing page</button>
      <button class="wfai-chip" type="button">Como funciona?</button>
    </div>
    <form class="wfai-compose" id="wfai-form">
      <textarea class="wfai-input" id="wfai-input" rows="1" maxlength="1200" placeholder="Digite sua pergunta..." aria-label="Sua mensagem" required></textarea>
      <button class="wfai-send" id="wfai-send" type="submit" aria-label="Enviar mensagem">➤</button>
    </form>
    <div class="wfai-footnote">Respostas geradas por IA. Não envie informações sensíveis.</div>
  `;
  document.body.append(launcher, panel);

  const messagesEl = panel.querySelector("#wfai-messages");
  const form = panel.querySelector("#wfai-form");
  const input = panel.querySelector("#wfai-input");
  const sendButton = panel.querySelector("#wfai-send");
  const closeButton = panel.querySelector(".wfai-close");
  const history = [];
  let pending = false;

  function addMessage(text, role, extraClass = "") {
    const bubble = document.createElement("div");
    bubble.className = `wfai-message ${role === "user" ? "wfai-user" : "wfai-bot"} ${extraClass}`.trim();
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubble;
  }

  function openPanel() {
    panel.classList.add("wfai-open");
    launcher.setAttribute("aria-expanded", "true");
    if (!messagesEl.dataset.greeted) {
      addMessage("Olá! 👋 Sou a assistente virtual da WebForge. Posso explicar nossos sites, landing pages e opções de orçamento. Como posso ajudar?", "assistant");
      messagesEl.dataset.greeted = "true";
    }
    input.focus();
  }

  function closePanel() {
    panel.classList.remove("wfai-open");
    launcher.setAttribute("aria-expanded", "false");
  }

  launcher.addEventListener("click", () => panel.classList.contains("wfai-open") ? closePanel() : openPanel());
  closeButton.addEventListener("click", closePanel);
  panel.querySelectorAll(".wfai-chip").forEach(chip => chip.addEventListener("click", () => {
    input.value = chip.textContent;
    form.requestSubmit();
  }));

  async function sendMessage(rawText) {
    const text = rawText.trim();
    if (!text || pending) return;
    if (!isConfigured) {
      addMessage("A assistente ainda não foi configurada. Falta preencher a URL e a chave pública do Supabase no arquivo ai-chat.js.", "assistant", "wfai-error");
      return;
    }

    pending = true;
    sendButton.disabled = true;
    input.disabled = true;
    addMessage(text, "user");
    history.push({ role: "user", content: text });
    const typing = addMessage("Pensando...", "assistant");
    typing.classList.add("wfai-typing");

    try {
      const response = await fetch(`${CONFIG.supabaseUrl}/functions/v1/webforge-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": CONFIG.publishableKey
        },
        body: JSON.stringify({ messages: (() => {
          const recent = history.slice(-8);
          if (recent[0]?.role === "assistant") recent.shift();
          return recent;
        })() })
      });
      const data = await response.json().catch(() => ({}));
      typing.remove();
      if (!response.ok) {
        const errorText = response.status === 429
          ? "A assistente recebeu muitas mensagens em pouco tempo. Aguarde um minuto e tente novamente."
          : (data.error || "Não consegui responder agora. Tente novamente em instantes.");
        addMessage(errorText, "assistant", "wfai-error");
        history.pop();
        return;
      }
      const answer = typeof data.reply === "string" && data.reply.trim()
        ? data.reply.trim()
        : "Não recebi uma resposta válida. Tente perguntar de outra forma.";
      history.push({ role: "assistant", content: answer });
      addMessage(answer, "assistant");
    } catch (error) {
      typing.remove();
      history.pop();
      addMessage("Não consegui conectar à assistente. Verifique sua conexão ou tente novamente mais tarde.", "assistant", "wfai-error");
      console.error("WebForge AI request failed:", error);
    } finally {
      pending = false;
      sendButton.disabled = false;
      input.disabled = false;
      input.value = "";
      input.focus();
    }
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    sendMessage(input.value);
  });
  input.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
})();
