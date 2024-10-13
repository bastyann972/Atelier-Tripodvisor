const theme = {
  init: function () {
    // init darkmode
    const themeSwitchElement = document.querySelector("#theme-switch");
    themeSwitchElement.addEventListener("click", theme.toggleDark);

    theme.initLocalState();
  },
  // change dark mode
  toggleDark: function () {
    document.body.classList.toggle("theme-dark");
    theme.saveToLocalStorage();
  },

  initLocalState: function () {
    const localSave = localStorage.getItem("darkMode");
    const isDark = JSON.parse(localSave);

    if (isDark) {
      document.body.classList.add("theme-dark");
    }
  },

  saveToLocalStorage: function () {
    const isDark = document.body.classList.contains("theme-dark");
    const newLocalSave = JSON.stringify(isDark);
    localStorage.setItem("darkMode", newLocalSave);
  },
};

const slider = {
  position: 0,

  init: function () {
    slider.element = document.querySelector(".slider");
    slider.slidesElements = slider.element.querySelectorAll(".slider__img");
    slider.slidesNumber = slider.slidesElements.length;

    const buttons = slider.element.querySelectorAll(".slider__btn");
    buttons[0].addEventListener("click", slider.previous);
    buttons[1].addEventListener("click", slider.next);

    document.addEventListener("keyup", (event) => {
      if (event.code === "ArrowLeft") {
        slider.previous();
      } else if (event.code === "ArrowRight") {
        slider.next();
      }
    });
  },

  previous: function () {
    let previousPosition;
    // on détermine la position du slide précédent
    if (slider.position - 1 >= 0) {
      previousPosition = slider.position - 1;
    } else {
      previousPosition = slider.slidesNumber - 1;
    }
    // on va à la nouvelle position
    slider.goto(previousPosition);
  },

  next: function () {
    let nextPosition;
    // on détermine la position du slide suivant
    if (slider.position + 1 < slider.slidesNumber) {
      nextPosition = slider.position + 1;
    } else {
      nextPosition = 0;
    }
    // on va à la nouvelle position
    slider.goto(nextPosition);
  },

  goto: function (newPosition) {
    // ancien slide courant
    const oldSlide = slider.slidesElements[slider.position];
    oldSlide.classList.remove("slider__img--current");
    oldSlide.setAttribute("aria-hidden", "true");
    // on mémorise la position du nouveau slide courant
    slider.position = newPosition;
    // nouveau slide courant
    const currentSlide = slider.slidesElements[slider.position];
    currentSlide.classList.add("slider__img--current");
    currentSlide.removeAttribute("aria-hidden");
    currentSlide.setAttribute("tabindex", "-1");
    currentSlide.focus();
  },
};

const messages = {
  init: function () {
    // au clic sur un coeur
    const likeElements = document.querySelectorAll(".btn__like");
    for (const likeElement of likeElements) {
      likeElement.addEventListener("click", messages.handleLikeClick);
    }
  },

  // création d'une erreur dans la carte la plus proche
  handleLikeClick: function (event) {
    const parent = event.target.closest(".card");
    const sentence = "Vous devez être connecté pour gérer vos favoris";
    messages.addMessageToElement(sentence, parent);
  },

  addMessageToElement: function (messageContent, parentElement) {
    // suppression des messages existants
    const oldMessages = parentElement.querySelectorAll(".message");
    for (const oldMessage of oldMessages) {
      oldMessage.remove();
    }
    // nouveau message
    const messageElement = document.createElement("p");
    messageElement.className = "message";
    messageElement.textContent = messageContent;
    parentElement.prepend(messageElement);
  },
};

const newsletter = {
  forbiddenEmailExtensions: [
    "@yopmail.com",
    "@yopmail.fr",
    "@yopmail.net",
    "@cool.fr.nf",
    "@jetable.fr.nf",
    "@courriel.fr.nf",
    "@moncourrier.fr.nf",
    "@monemail.fr.nf",
    "@monmail.fr.nf",
    "@hide.biz.st",
    "@mymail.infos.st",
  ],
  init: function () {
    // on mémorise les élements qui nous intéresse
    newsletter.element = document.querySelector(".newsletter");
    newsletter.inputElement = document.querySelector("#subscriber-email");

    // clic sur l'item de menu newsletter
    const menuitemElement = document.querySelector("#newsletter-btn");
    menuitemElement.addEventListener("click", newsletter.handleClick);

    // écoute du scroll
    window.addEventListener("scroll", newsletter.handleScroll);

    // petite croix pour fermer
    const closeElement = document.querySelector(".newsletter__close");
    closeElement.addEventListener("click", newsletter.hide);

    // écoute de la soumission du formulaire
    newsletter.formElement = newsletter.element.querySelector("form");
    newsletter.formElement.addEventListener("submit", newsletter.handleSubmit);
  },

  // ajout d'une classe pour passer en display:block
  show: function () {
    newsletter.element.classList.add("newsletter--on");
  },

  // suppression d'une classe pour repasser en display:none
  hide: function () {
    newsletter.element.classList.remove("newsletter--on");
  },

  // au clic on va afficher la newsletter et cibler le champ
  handleClick: function (event) {
    event.preventDefault();
    newsletter.show();
    newsletter.inputElement.focus(); // on cible le champ, cool pour l'ux
  },

  // à partir d'un certain niveau de scroll on affiche le bloc
  handleScroll: function () {
    if (window.scrollY > 250) {
      newsletter.show();
      // on peut arrêter d'écouter, ça ne s'affichera plus au scroll
      window.removeEventListener("scroll", newsletter.handleScroll);
    }
  },

  // méthode de validation avec valeur de retour *_*
  checkBadEmail: function (email) {
    for (const extension of newsletter.forbiddenEmailExtensions) {
      if (email.includes(extension)) {
        return true;
      }
    }
    return false;
  },

  // pour un email jetable on empeche la soumission
  handleSubmit: function (event) {
    // if (newsletter.inputElement.value.includes('@yopmail.com')) { // version simple pour commencer
    if (newsletter.checkBadEmail(newsletter.inputElement.value)) {
      event.preventDefault();
      // on a accès aux autres modules définis globalement
      messages.addMessageToElement(
        "Les adresses jetables ne sont pas admises",
        newsletter.element
      );
    }
  },
};

const filters = {
  init: function () {
    // tous les articles à filtrer
    filters.articlesElements = document.querySelectorAll(".grade");
    // toutes les checkboxes pour filtrer
    filters.checkboxesElements = document.querySelectorAll(
      'input[name="grade"]'
    ); // ou bien ajouter une classe sur les checkboxes
    for (const checkboxElement of filters.checkboxesElements) {
      checkboxElement.addEventListener("click", filters.handleCheckboxClick);
    }
  },

  // au clic on va regarder si c'est cocher ou pas
  handleCheckboxClick: function (event) {
    const checkboxElement = event.target;
    if (checkboxElement.checked) {
      // pour afficher en fonction de la note
      filters.showByGrade(checkboxElement.value);
    } else {
      // ou cacher
      filters.hideByGrade(checkboxElement.value);
    }
  },

  showByGrade: function (grade) {
    for (const articleElement of filters.articlesElements) {
      if (articleElement.dataset.grade === grade) {
        articleElement.classList.remove("grade--hidden");
      }
    }
  },

  hideByGrade: function (grade) {
    for (const articleElement of filters.articlesElements) {
      if (articleElement.dataset.grade === grade) {
        articleElement.classList.add("grade--hidden");
      }
    }
  },
};

// pour la gestion du mode sombre
theme.init();
// gestion du slider
slider.init();
// gestions des messages
messages.init();
// formulaire de newsletter
newsletter.init();
// gestion des filtres par note
filters.init();
