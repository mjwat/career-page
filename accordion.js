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

  function getDirectHeader(item) {
    return Array.from(item.children).find((el) =>
      el.classList.contains("accordion-header")
    );
  }

  function getDirectContent(item) {
    return Array.from(item.children).find((el) =>
      el.classList.contains("accordion-content")
    );
  }

  function recalculateAncestorHeights(fromItem) {
    let parentItem = fromItem.parentElement
      ? fromItem.parentElement.closest(".accordion-item")
      : null;

    while (parentItem) {
      const parentContent = getDirectContent(parentItem);
      if (!parentContent) {
        break;
      }

      const isExpanded = parentItem.getAttribute("data-expanded") === "true";
      if (isExpanded) {
        if (parentContent.style.maxHeight !== "none") {
          parentContent.style.maxHeight = `${parentContent.scrollHeight}px`;
        }
      }

      parentItem = parentItem.parentElement
        ? parentItem.parentElement.closest(".accordion-item")
        : null;
    }
  }

  function bindContentLifecycle(item, content) {
    if (content.dataset.accordionBound === "true") {
      return;
    }

    content.addEventListener("transitionend", (event) => {
      if (event.propertyName !== "max-height") {
        return;
      }

      const isExpanded = item.getAttribute("data-expanded") === "true";
      if (isExpanded) {
        // Keep expanded panels unconstrained so nested changes never clip content.
        content.style.maxHeight = "none";
      }
    });

    content.dataset.accordionBound = "true";
  }

  function setExpanded(item, expanded) {
    const header = getDirectHeader(item);
    const content = getDirectContent(item);
    const icon = header ? header.querySelector(".accordion-icon") : null;

    if (!header || !content || !icon) {
      return;
    }

    item.setAttribute("data-expanded", expanded ? "true" : "false");
    header.setAttribute("aria-expanded", expanded ? "true" : "false");
    icon.textContent = expanded ? "−" : "+";
    bindContentLifecycle(item, content);

    if (expanded) {
      if (content.style.maxHeight === "none") {
        return;
      }
      content.style.maxHeight = `${content.scrollHeight}px`;
    } else {
      // If expanded panel was unconstrained, measure first to animate close smoothly.
      if (content.style.maxHeight === "none") {
        content.style.maxHeight = `${content.scrollHeight}px`;
        void content.offsetHeight;
      }
      content.style.maxHeight = "0px";
    }

    recalculateAncestorHeights(item);
  }

  function recalculateAllExpandedHeights() {
    const expandedItems = document.querySelectorAll(
      ".accordion-item[data-expanded='true']"
    );
    expandedItems.forEach((item) => {
      const content = getDirectContent(item);
      if (content) {
        content.style.maxHeight = "none";
      }
    });
  }

  function toggleItem(item, state) {
    const id = item.getAttribute("data-id");
    if (!id) {
      return;
    }

    const isExpanded = item.getAttribute("data-expanded") === "true";
    const nextExpanded = !isExpanded;

    setExpanded(item, nextExpanded);
    state[id] = nextExpanded;
    writeState(state);
  }

  window.initAccordion = function initAccordion() {
    const state = readState();
    const items = document.querySelectorAll(".accordion-item[data-id]");

    items.forEach((item) => {
      const id = item.getAttribute("data-id");
      const header = getDirectHeader(item);
      const content = getDirectContent(item);

      if (!id || !header || !content) {
        return;
      }

      content.style.maxHeight = "0px";
      setExpanded(item, state[id] === true);

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

    requestAnimationFrame(recalculateAllExpandedHeights);
  };

  window.addEventListener("resize", () => {
    recalculateAllExpandedHeights();
  });
})();
