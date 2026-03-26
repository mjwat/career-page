document.addEventListener("DOMContentLoaded", () => {
  const switcher = document.querySelector(".language-switcher");
  const egg = document.getElementById("egg-trigger");
  const overlay = document.getElementById("egg-modal-overlay");
  const closeButton = document.getElementById("egg-modal-close");

  if (!switcher || !egg || !overlay || !closeButton) {
    return;
  }

  let hideTimerId = null;

  const showEgg = () => {
    egg.classList.add("is-visible");
    if (hideTimerId) {
      clearTimeout(hideTimerId);
    }
    hideTimerId = setTimeout(() => {
      egg.classList.remove("is-visible");
      hideTimerId = null;
    }, 10000);
  };

  switcher.addEventListener("mouseenter", showEgg);
  switcher.addEventListener("focusin", showEgg);
  switcher.addEventListener("click", showEgg);

  const openModal = () => {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
  };

  egg.addEventListener("click", (event) => {
    event.stopPropagation();
    openModal();
  });

  closeButton.addEventListener("click", closeModal);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });
});
