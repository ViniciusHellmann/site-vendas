// CONFIGURE AQUI O SEU WHATSAPP
const WHATSAPP = "5548998457338";

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

if (quoteForm) {
  quoteForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const type = document.getElementById("type").value;
    const message = document.getElementById("message").value.trim();

    const text = `Olá! Meu nome é ${name}.

Quero solicitar um orçamento para:
${type}

Meu WhatsApp:
${phone}

Detalhes do projeto:
${message || "Gostaria de saber mais detalhes."}`;

    window.open(
      `${whatsappUrl()}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  });
}
