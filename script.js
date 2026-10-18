import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";
import { db } from "./firebase.js";

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

  const reviewsQuery = query(
    collection(db, "feedbacks"),
    orderBy("data", "desc"),
  );

  onSnapshot(
    reviewsQuery,
    (snapshot) => {
      const reviews = snapshot.docs
        .map((reviewDocument) => {
          const data = reviewDocument.data();
          const createdAt = data.data?.toDate?.();

          return {
            name: data.nome,
            rating: data.pontuacao,
            comment: data.mensagem,
            createdAt: createdAt?.toISOString(),
          };
        })
        .filter(isStoredReview);

      renderReviews(reviews);
    },
    (error) => {
      reviewStatus.textContent =
        "Não foi possível carregar as avaliações. Tente novamente mais tarde.";
      console.error("Falha ao carregar avaliações do Firestore:", error);
    },
  );

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

  reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(reviewForm);
    const name = String(formData.get("name") || "").trim();
    const rating = Number(formData.get("rating"));
    const comment = String(formData.get("comment") || "").trim();

    if (!name || !comment || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      reviewStatus.textContent = "Informe seu nome, escolha uma nota e escreva um comentário.";
      return;
    }

    const submitButton = reviewForm.querySelector('button[type="submit"]');
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
    }
    reviewStatus.textContent = "Enviando sua avaliação...";
    try {
      await addDoc(collection(db, "feedbacks"), {
        nome: name,
        mensagem: comment,
        pontuacao: rating,
        data: new Date(),
      });
      reviewForm.reset();
      updateRatingStars(0);
      reviewStatus.textContent = "Obrigado pelo seu feedback!";
    } catch (error) {
      reviewStatus.textContent =
        "Não foi possível enviar sua avaliação. Tente novamente mais tarde.";
      console.error("Falha ao enviar avaliação para o Firestore:", error);
    } finally {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
      }
    }
  });
}