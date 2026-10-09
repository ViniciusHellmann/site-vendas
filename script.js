// CONFIGURAÇÕES DO WEBFORGE
// Cole aqui o Project URL e a Publishable key do seu projeto Supabase.
// Use somente a chave publishable/anon no navegador. NUNCA coloque a secret/service_role aqui.
const SUPABASE_URL = "https://voclgnvagmpkvmdknjti.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_wA7Zqo4Bc7rRsDZyh2osyA_ngX1ryMe";

// Número do WhatsApp que recebe os pedidos (formato: país + DDD + número).
const WHATSAPP = "5548998457338";

const isSupabaseConfigured =
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("voclgnvagmpkvmdknjti.supabase.co") &&
  SUPABASE_PUBLISHABLE_KEY &&
  !SUPABASE_PUBLISHABLE_KEY.includes("sb_publishable_wA7Zqo4Bc7rRsDZyh2osyA_ngX1ryMe");

const supabaseClient =
  isSupabaseConfigured && window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
    : null;

const menuToggle = document.getElementById("menuToggle");
const menu = document.getElementById("menu");

if (menuToggle && menu) {
  menuToggle.addEventListener("click", () => menu.classList.toggle("open"));
  document.querySelectorAll(".menu a").forEach(link => {
    link.addEventListener("click", () => menu.classList.remove("open"));
  });
}

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const whatsappUrl = () => `https://wa.me/${WHATSAPP}`;
const whatsappFloat = document.getElementById("whatsappFloat");
const footerWhatsapp = document.getElementById("footerWhatsapp");
if (whatsappFloat) whatsappFloat.href = whatsappUrl();
if (footerWhatsapp) footerWhatsapp.href = whatsappUrl();

const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => observer.observe(el));
} else {
  reveals.forEach(el => el.classList.add("show"));
}

const quoteForm = document.getElementById("quoteForm");
const formStatus = document.getElementById("formStatus");

function setFormStatus(message, kind = "info") {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.dataset.kind = kind;
}

function openWhatsAppRequest({ name, phone, type, message }, tab = null) {
  const text = `Olá! Meu nome é ${name}.\n\nQuero solicitar um orçamento para:\n${type}\n\nMeu WhatsApp:\n${phone}\n\nDetalhes do projeto:\n${message || "Gostaria de saber mais detalhes."}`;
  const url = `${whatsappUrl()}?text=${encodeURIComponent(text)}`;
  if (tab && !tab.closed) {
    tab.opener = null;
    tab.location.href = url;
  } else {
    window.location.href = url;
  }
}

if (quoteForm) {
  quoteForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!quoteForm.reportValidity()) return;

    const submitButton = quoteForm.querySelector('button[type="submit"]');
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const type = document.getElementById("type").value;
    const message = document.getElementById("message").value.trim();
    const request = { name, phone, type, message };

    if (name.length < 2 || phone.length < 8 || !type) {
      setFormStatus("Confira seu nome, WhatsApp e tipo de projeto.", "error");
      return;
    }

    // Abre a aba imediatamente no clique para evitar bloqueio após a gravação assíncrona.
    const whatsappTab = window.open("about:blank", "_blank");
    if (whatsappTab) whatsappTab.opener = null;

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Enviando solicitação...";
    }

    try {
      if (!supabaseClient) {
        setFormStatus("O armazenamento ainda não foi configurado. O WhatsApp será aberto, mas este pedido não será salvo na nuvem.", "error");
        openWhatsAppRequest(request, whatsappTab);
        return;
      }

      const { error } = await supabaseClient.from("orcamentos").insert({
        nome: name,
        whatsapp: phone,
        tipo_projeto: type,
        mensagem: message || null
      });

      if (error) throw error;

      setFormStatus("Solicitação salva com sucesso! Abrindo o WhatsApp...", "success");
      openWhatsAppRequest(request, whatsappTab);
      quoteForm.reset();
    } catch (error) {
      console.error("Falha ao salvar orçamento no Supabase:", error);
      setFormStatus("Não foi possível salvar na nuvem. Vamos abrir o WhatsApp para você não perder sua solicitação.", "error");
      openWhatsAppRequest(request, whatsappTab);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Enviar pelo WhatsApp →";
      }
    }
  });
}
