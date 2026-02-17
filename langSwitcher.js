(() => {
  const LANGUAGE_STORAGE_KEY = "cvLanguage";
  const SUPPORTED_LANGUAGES = ["en", "ru"];

  document.addEventListener("DOMContentLoaded", () => {
    const initialLanguage = getStoredLanguage();
    window.currentLanguage = initialLanguage;
    setActiveLanguageButton(initialLanguage);
    bindLanguageButtons();
    notifyLanguageChange(initialLanguage);
  });

  function bindLanguageButtons() {
    const buttons = document.querySelectorAll("[data-lang]");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const selectedLanguage = button.dataset.lang;
        if (!SUPPORTED_LANGUAGES.includes(selectedLanguage)) {
          return;
        }

        window.currentLanguage = selectedLanguage;
        localStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLanguage);
        setActiveLanguageButton(selectedLanguage);
        notifyLanguageChange(selectedLanguage);
      });
    });
  }

  function getStoredLanguage() {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return SUPPORTED_LANGUAGES.includes(savedLanguage) ? savedLanguage : "en";
  }

  function setActiveLanguageButton(language) {
    const buttons = document.querySelectorAll("[data-lang]");
    buttons.forEach((button) => {
      const isActive = button.dataset.lang === language;
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function notifyLanguageChange(language) {
    document.dispatchEvent(
      new CustomEvent("resume-language-change", {
        detail: { language },
      })
    );
  }
})();
