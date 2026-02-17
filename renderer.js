const LANGUAGE_STORAGE_KEY = "cvLanguage";
const SUPPORTED_LANGUAGES = ["en", "ru"];
let currentRenderId = 0;

document.addEventListener("DOMContentLoaded", () => {
  renderLanguage(getCurrentLanguage());
});

document.addEventListener("resume-language-change", () => {
  renderLanguage(getCurrentLanguage());
});

function getCurrentLanguage() {
  if (SUPPORTED_LANGUAGES.includes(window.currentLanguage)) {
    return window.currentLanguage;
  }

  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return SUPPORTED_LANGUAGES.includes(savedLanguage) ? savedLanguage : "en";
}

async function renderLanguage(language) {
  const safeLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : "en";
  const renderId = ++currentRenderId;
  const data = await fetchLanguageData(safeLanguage);
  if (renderId !== currentRenderId) {
    return;
  }

  document.documentElement.lang = safeLanguage;
  renderCv(data);
}

async function fetchLanguageData(language) {
  const response = await fetch(`data/${language}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load language file: ${language}`);
  }
  return response.json();
}

function renderCv(data) {
  renderProfile(document.getElementById("profile"), data.profile);
  renderContact(document.getElementById("contact"), data.contact);
  renderTextBlock(document.getElementById("summary"), data.summary);
  renderKeySkills(document.getElementById("keySkills"), data.keySkills);
  renderExperience(
    document.getElementById("experience"),
    data.professionalExperience
  );
  renderListBlock(document.getElementById("education"), data.education);
  renderListBlock(document.getElementById("languages"), data.languages);
  renderTextBlock(document.getElementById("about"), data.about);
  renderTextBlock(document.getElementById("preferences"), data.workPreferences);
}

function renderProfile(container, profile) {
  if (!container) {
    return;
  }

  const name = profile?.name || "";
  const extraFields = Object.entries(profile || {})
    .filter(([key]) => key !== "name")
    .map(([key, value]) => `<p><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value)}</p>`)
    .join("");

  container.innerHTML = `
    <header>
      <h1>${escapeHtml(name)}</h1>
      ${extraFields}
    </header>
  `;
}

function renderContact(container, contactBlock) {
  if (!container) {
    return;
  }

  const labels = contactBlock?.labels || {};
  const entries = Object.entries(contactBlock || {})
    .filter(([key]) => key !== "title" && key !== "labels")
    .map(([key, value]) => {
      const label = labels[key] || key;
      if (key === "email") {
        return `<li><strong>${escapeHtml(label)}:</strong> <a href="mailto:${escapeAttr(value)}">${escapeHtml(value)}</a></li>`;
      }
      if (key === "linkedin") {
        return `<li><strong>${escapeHtml(label)}:</strong> <a href="${escapeAttr(value)}">${escapeHtml(value)}</a></li>`;
      }
      return `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</li>`;
    })
    .join("");

  container.innerHTML = `
    <section>
      <h2>${escapeHtml(contactBlock?.title || "contact")}</h2>
      <ul>${entries}</ul>
    </section>
  `;
}

function renderTextBlock(container, block) {
  if (!container) {
    return;
  }

  const title = block?.title || "";
  const paragraphs = splitIntoParagraphs(block?.text)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");

  container.innerHTML = `
    <section>
      <h2>${escapeHtml(title)}</h2>
      ${paragraphs}
    </section>
  `;
}

function renderListBlock(container, block) {
  if (!container) {
    return;
  }

  container.innerHTML = `
    <section>
      <h2>${escapeHtml(block?.title || "")}</h2>
      ${renderList(block?.items)}
    </section>
  `;
}

function renderKeySkills(container, block) {
  if (!container) {
    return;
  }

  const categories = Object.values(block?.categories || {})
    .map((category) => {
      if (category?.categories) {
        const lines = Object.values(category.categories)
          .map((toolCategory) => {
            const items = Array.isArray(toolCategory?.items)
              ? toolCategory.items.join(", ")
              : "";
            return `<li><strong>${escapeHtml(toolCategory?.title || "")}:</strong> ${escapeHtml(items)}</li>`;
          })
          .join("");

        return `
          <section>
            <h3>${escapeHtml(category?.title || "")}</h3>
            <ul>${lines}</ul>
          </section>
        `;
      }

      return `
        <section>
          <h3>${escapeHtml(category?.title || "")}</h3>
          ${renderList(category?.items)}
        </section>
      `;
    })
    .join("");

  container.innerHTML = `
    <section>
      <h2>${escapeHtml(block?.title || "")}</h2>
      ${categories}
    </section>
  `;
}

function renderExperience(container, block) {
  if (!container) {
    return;
  }

  const labels = block?.labels || {};
  const articles = (block?.items || [])
    .map((item) => {
      const position = item?.position
        ? `<p><strong>${escapeHtml(labels.position || "position")}:</strong> ${escapeHtml(item.position)}</p>`
        : "";

      const companyParts = [];
      if (item?.company) {
        companyParts.push(
          item.companyType ? `${item.company} (${item.companyType})` : item.company
        );
      }
      if (item?.period) {
        companyParts.push(item.period);
      }
      const company = companyParts.length
        ? `<p><strong>${escapeHtml(labels.company || "company")}:</strong> ${escapeHtml(companyParts.join(", "))}</p>`
        : "";

      const projects = item?.projects
        ? `<p><strong>${escapeHtml(labels.projects || "projects")}:</strong> ${escapeHtml(item.projects)}</p>`
        : "";
      const stack = item?.stack
        ? `<p><strong>${escapeHtml(labels.stack || "stack")}:</strong> ${escapeHtml(item.stack)}</p>`
        : "";

      const responsibilities = renderExpGroup(
        labels.responsibilities || "responsibilities",
        item?.responsibilities,
        labels
      );
      const achievements = renderExpGroup(
        labels.achievements || "achievements",
        item?.achievements,
        labels
      );

      return `
        <article>
          ${position}
          ${company}
          ${projects}
          ${stack}
          ${responsibilities}
          ${achievements}
        </article>
      `;
    })
    .join("");

  container.innerHTML = `
    <section>
      <h2>${escapeHtml(block?.title || "")}</h2>
      ${articles}
    </section>
  `;
}

function renderExpGroup(title, group, labels) {
  if (!group || typeof group !== "object") {
    return "";
  }

  const projectRelated = Array.isArray(group.projectRelated) ? group.projectRelated : [];
  const nonProjectRelated = Array.isArray(group.nonProjectRelated)
    ? group.nonProjectRelated
    : [];

  if (projectRelated.length && nonProjectRelated.length) {
    return `
      <section>
        <h4>${escapeHtml(title)}</h4>
        <section>
          <h5>${escapeHtml(labels.projectRelated || "projectRelated")}</h5>
          ${renderList(projectRelated)}
        </section>
        <section>
          <h5>${escapeHtml(labels.nonProjectRelated || "nonProjectRelated")}</h5>
          ${renderList(nonProjectRelated)}
        </section>
      </section>
    `;
  }

  const flatItems = [...projectRelated, ...nonProjectRelated];
  if (!flatItems.length) {
    return "";
  }

  return `
    <section>
      <h4>${escapeHtml(title)}</h4>
      ${renderList(flatItems)}
    </section>
  `;
}

function renderList(items = []) {
  if (!Array.isArray(items)) {
    return "";
  }
  const listItems = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  return `<ul>${listItems}</ul>`;
}

function splitIntoParagraphs(text) {
  const value = typeof text === "string" ? text : "";
  if (!value) {
    return [];
  }

  if (value.includes("\n")) {
    return value.split(/\r?\n+/).filter((line) => line.trim().length > 0);
  }

  return value.split(/(?<=[.!?])\s+/).filter((line) => line.trim().length > 0);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}
