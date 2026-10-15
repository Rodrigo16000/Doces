const contactForm = document.querySelector(".form-contato");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
    navLinks.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
    navLinks.classList.toggle("is-open", !isOpen);
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

if (contactForm) {
  const statusMessage = contactForm.querySelector(".form-status");

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = contactForm.querySelector("#nome").value.trim();
    const contact = contactForm.querySelector("#whatsapp").value.trim();
    const message = contactForm.querySelector("#mensagem").value.trim();

    if (!name || !contact || !message) {
      statusMessage.textContent = "Preencha todos os campos antes de continuar.";
      return;
    }

    const subject = `Contato pelo site - ${name}`;
    const body = [
      `Nome: ${name}`,
      `WhatsApp ou e-mail: ${contact}`,
      "",
      "Mensagem:",
      message,
    ].join("\n");
    const mailto = new URL("mailto:contato@doces.com.br");
    mailto.searchParams.set("subject", subject);
    mailto.searchParams.set("body", body);

    statusMessage.textContent =
      "Abrindo seu aplicativo de e-mail para você revisar e enviar a mensagem.";
    window.location.href = mailto.toString();
  });
}