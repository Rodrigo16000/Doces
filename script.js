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
      `WhatsApp: ${contact}`,
      "",
      "Mensagem:",
      message,
    ].join("\n");
    const whatsapp = new URL("https://wa.me/5527997511735");
    whatsapp.searchParams.set("text", `${subject}\n\n${body}`);

    statusMessage.textContent =
      "Abrindo o WhatsApp para você revisar e enviar a mensagem.";
    window.location.href = whatsapp.toString();
  });
}

const reviewForm = document.querySelector("#review-form");
const reviewToggle = document.querySelector("#toggle-review-form");
const reviewStatus = document.querySelector("#review-status");
const reviewsList = document.querySelector("#reviews-list");
const reviewsEmptyMessage = document.querySelector("#reviews-empty");
const reviewsStorageKey = "doces-product-reviews";

if (
  reviewForm instanceof HTMLFormElement &&
  reviewToggle instanceof HTMLButtonElement &&
  reviewStatus instanceof HTMLElement &&
  reviewsList instanceof HTMLElement &&
  reviewsEmptyMessage instanceof HTMLElement
) {
  const isStoredReview = (value) =>
    value &&
    typeof value.name === "string" &&
    value.name.length <= 60 &&
    Number.isInteger(value.rating) &&
    value.rating >= 1 &&
    value.rating <= 5 &&
    typeof value.comment === "string" &&
    value.comment.length <= 500 &&
    typeof value.createdAt === "string" &&
    !Number.isNaN(Date.parse(value.createdAt));

  const renderReviews = (reviews) => {
    reviewsList.replaceChildren();
    reviewsEmptyMessage.hidden = reviews.length > 0;

    for (const review of reviews) {
      const article = document.createElement("article");
      article.className = "review-entry";

      const header = document.createElement("div");
      header.className = "review-entry-header";

      const name = document.createElement("h4");
      name.textContent = review.name;

      const date = document.createElement("time");
      date.dateTime = review.createdAt;
      date.textContent = new Date(review.createdAt).toLocaleDateString("pt-BR");
      header.append(name, date);

      const rating = document.createElement("div");
      rating.className = "review-entry-rating";
      rating.setAttribute("aria-label", `${review.rating} de 5 estrelas`);
      rating.textContent = `${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`;

      const comment = document.createElement("p");
      comment.textContent = review.comment;

      article.append(header, rating, comment);
      reviewsList.append(article);
    }
  };

  const ratingInputs = Array.from(
    reviewForm.querySelectorAll('input[name="rating"]'),
  );
  const updateRatingStars = (selectedRating) => {
    for (const input of ratingInputs) {
      input.nextElementSibling.classList.toggle(
        "is-active",
        Number(input.value) <= selectedRating,
      );
    }
  };

  for (const input of ratingInputs) {
    input.addEventListener("change", () => {
      updateRatingStars(Number(input.value));
    });
  }

  let reviews = [];
  let storageAvailable = true;

  try {
    const savedReviews = localStorage.getItem(reviewsStorageKey);
    if (savedReviews) {
      const parsedReviews = JSON.parse(savedReviews);
      if (!Array.isArray(parsedReviews) || !parsedReviews.every(isStoredReview)) {
        throw new Error("Os dados salvos não estão no formato esperado.");
      }
      reviews = parsedReviews;
    }
  } catch (error) {
    storageAvailable = false;
    reviewStatus.textContent =
      "Não foi possível carregar as avaliações salvas neste navegador.";
    console.error("Falha ao carregar avaliações locais:", error);
  }

  renderReviews(reviews);

  reviewToggle.addEventListener("click", () => {
    const isOpening = reviewForm.hidden;
    reviewForm.hidden = !isOpening;
    reviewToggle.setAttribute("aria-expanded", String(isOpening));
    reviewToggle.textContent = isOpening ? "Fechar avaliação" : "Avaliar produto";

    if (isOpening) {
      reviewForm.querySelector("#review-name").focus();
      reviewForm.scrollIntoView({ block: "center" });
    }
  });

  reviewForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!storageAvailable) {
      reviewStatus.textContent =
        "Não é possível salvar uma avaliação até que o armazenamento deste navegador esteja disponível.";
      return;
    }

    const formData = new FormData(reviewForm);
    const name = String(formData.get("name") || "").trim();
    const rating = Number(formData.get("rating"));
    const comment = String(formData.get("comment") || "").trim();

    if (!name || !comment || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      reviewStatus.textContent = "Informe seu nome, escolha uma nota e escreva um comentário.";
      return;
    }

    const newReview = {
      name,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    const updatedReviews = [newReview, ...reviews];

    try {
      localStorage.setItem(reviewsStorageKey, JSON.stringify(updatedReviews));
    } catch (error) {
      reviewStatus.textContent =
        "Não foi possível salvar sua avaliação. Verifique o armazenamento do navegador e tente novamente.";
      console.error("Falha ao salvar avaliação local:", error);
      return;
    }

    reviews = updatedReviews;
    renderReviews(reviews);
    reviewForm.reset();
    updateRatingStars(0);
    reviewStatus.textContent = "Sua avaliação foi salva neste navegador.";
  });
}