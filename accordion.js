(function () {
  const ACCORDION_STATE_KEY = "accordionState";

  function readState() {
    try {
      const raw = localStorage.getItem(ACCORDION_STATE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function writeState(state) {
    localStorage.setItem(ACCORDION_STATE_KEY, JSON.stringify(state));
  }

  function setItemState(item, expanded) {
    const header = item.querySelector(".accordion-header");
    const content = item.querySelector(".accordion-content");
    const icon = item.querySelector(".accordion-icon");

    if (!header || !content || !icon) {
      return;
    }

    item.setAttribute("data-expanded", expanded ? "true" : "false");
    header.setAttribute("aria-expanded", expanded ? "true" : "false");
    icon.textContent = expanded ? "−" : "+";

    if (expanded) {
      content.style.maxHeight = `${content.scrollHeight}px`;
    } else {
      content.style.maxHeight = "0px";
    }
  }

  function toggleItem(item, state) {
    const id = item.getAttribute("data-id");
    if (!id) {
      return;
    }
    const isExpanded = item.getAttribute("data-expanded") === "true";
    const next = !isExpanded;
    setItemState(item, next);
    state[id] = next;
    writeState(state);
  }

  window.initAccordion = function initAccordion() {
    const state = readState();
    const items = document.querySelectorAll(".accordion-item[data-id]");

    items.forEach((item) => {
      const id = item.getAttribute("data-id");
      const header = item.querySelector(".accordion-header");
      const content = item.querySelector(".accordion-content");

      if (!id || !header || !content) {
        return;
      }

      content.style.maxHeight = "0px";
      const expanded = state[id] === true;
      setItemState(item, expanded);

      header.addEventListener("click", () => {
        toggleItem(item, state);
      });

      header.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleItem(item, state);
        }
      });
    });
  };
})();
