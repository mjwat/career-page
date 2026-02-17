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

  if (typeof window.initAccordion === "function") {
    window.initAccordion();
  }
}

function renderProfile(container, profile) {
  if (!container) {
    return;
  }

  const name = profile?.name || "";
  const extraFields = Object.entries(profile || {})
    .filter(([key]) => key !== "name")
    .map(([, value]) => `<p>${escapeHtml(value)}</p>`)
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
        return `<li><strong>${escapeHtml(label)}:</strong> <a href="${escapeAttr(value)}" target="_blank" rel="noopener noreferrer">${escapeHtml(value)}</a></li>`;
      }
      return `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</li>`;
    })
    .join("");

  container.innerHTML = `
    <h2>${escapeHtml(contactBlock?.title || "contact")}</h2>
    <ul>${entries}</ul>
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
    <h2>${escapeHtml(title)}</h2>
    ${paragraphs}
  `;
}

function renderListBlock(container, block) {
  if (!container) {
    return;
  }

  container.innerHTML = `
    <h2>${escapeHtml(block?.title || "")}</h2>
    ${renderList(block?.items)}
  `;
}

function renderKeySkills(container, block) {
  if (!container) {
    return;
  }

  const categories = Object.entries(block?.categories || {})
    .map(([categoryKey, category]) => {
      const accordionId = `keyskills-${categoryKey}`;
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
          <article class="accordion-item" data-id="${escapeAttr(accordionId)}">
            <div class="accordion-header" role="button" tabindex="0" aria-expanded="false">
              <h3>${escapeHtml(category?.title || "")}</h3>
              <span class="accordion-icon" aria-hidden="true">+</span>
            </div>
            <div class="accordion-content">
              <ul>${lines}</ul>
            </div>
          </article>
        `;
      }

      return `
        <article class="accordion-item" data-id="${escapeAttr(accordionId)}">
          <div class="accordion-header" role="button" tabindex="0" aria-expanded="false">
            <h3>${escapeHtml(category?.title || "")}</h3>
            <span class="accordion-icon" aria-hidden="true">+</span>
          </div>
          <div class="accordion-content">
            ${renderList(category?.items)}
          </div>
        </article>
      `;
    })
    .join("");

  container.innerHTML = `
    <h2>${escapeHtml(block?.title || "")}</h2>
    ${categories}
  `;
}

function renderExperience(container, block) {
  if (!container) {
    return;
  }

  const labels = block?.labels || {};
  const articles = (block?.items || [])
    .map((item, index) => {
      const jobId = `experience-job-${index}`;
      const companyParts = [];
      if (item?.company) {
        companyParts.push(
          item.companyType ? `${item.company} (${item.companyType})` : item.company
        );
      }
      if (item?.period) {
        companyParts.push(item.period);
      }
      const headerPosition = item?.position ? escapeHtml(item.position) : "";
      const headerCompany = companyParts.length ? escapeHtml(companyParts.join(", ")) : "";
      const header = `<h3>${headerPosition}<br>${headerCompany}</h3>`;

      const projects = item?.projects
        ? `<p><strong>${escapeHtml(labels.projects || "projects")}:</strong> ${escapeHtml(item.projects)}</p>`
        : "";
      const stack = item?.stack
        ? `<p><strong>${escapeHtml(labels.stack || "stack")}:</strong> ${escapeHtml(item.stack)}</p>`
        : "";

      const responsibilities = renderExpGroupAccordion(
        labels.responsibilities || "responsibilities",
        item?.responsibilities,
        labels,
        `${jobId}-responsibilities`
      );
      const achievements = renderExpGroupAccordion(
        labels.achievements || "achievements",
        item?.achievements,
        labels,
        `${jobId}-achievements`
      );

      return `
        <article class="experience-item accordion-item accordion-level-1" data-id="${escapeAttr(jobId)}">
          <div class="accordion-header" role="button" tabindex="0" aria-expanded="false">
            ${header}
            <span class="accordion-icon" aria-hidden="true">+</span>
          </div>
          <div class="accordion-content">
            <div class="experience-content">
              ${projects}
              ${stack}
              ${responsibilities}
              ${achievements}
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  container.innerHTML = `
    <h2>${escapeHtml(block?.title || "")}</h2>
    <section class="experience-list">
      ${articles}
    </section>
  `;
}

function renderExpGroupAccordion(title, group, labels, baseId) {
  if (!group || typeof group !== "object") {
    return "";
  }

  const projectRelated = Array.isArray(group.projectRelated) ? group.projectRelated : [];
  const nonProjectRelated = Array.isArray(group.nonProjectRelated)
    ? group.nonProjectRelated
    : [];

  const hasProjectRelated = projectRelated.length > 0;
  const hasNonProjectRelated = nonProjectRelated.length > 0;
  const hasBothGroupedSections = hasProjectRelated && hasNonProjectRelated;

  if (!hasProjectRelated && !hasNonProjectRelated) {
    return "";
  }

  let nestedContent = "";
  if (hasBothGroupedSections) {
    nestedContent = `
      <section class="accordion-item accordion-level-3" data-id="${escapeAttr(`${baseId}-project-related`)}">
        <div class="accordion-header" role="button" tabindex="0" aria-expanded="false">
          <h5>${escapeHtml(labels.projectRelated || "projectRelated")}</h5>
          <span class="accordion-icon" aria-hidden="true">+</span>
        </div>
        <div class="accordion-content">
          ${renderList(projectRelated)}
        </div>
      </section>
      <section class="accordion-item accordion-level-3" data-id="${escapeAttr(`${baseId}-non-project-related`)}">
        <div class="accordion-header" role="button" tabindex="0" aria-expanded="false">
          <h5>${escapeHtml(labels.nonProjectRelated || "nonProjectRelated")}</h5>
          <span class="accordion-icon" aria-hidden="true">+</span>
        </div>
        <div class="accordion-content">
          ${renderList(nonProjectRelated)}
        </div>
      </section>
    `;
  } else {
    nestedContent = renderList([...projectRelated, ...nonProjectRelated]);
  }

  return `
    <section class="accordion-item accordion-level-2" data-id="${escapeAttr(baseId)}">
      <div class="accordion-header" role="button" tabindex="0" aria-expanded="false">
        <h4>${escapeHtml(title)}</h4>
        <span class="accordion-icon" aria-hidden="true">+</span>
      </div>
      <div class="accordion-content">
        ${nestedContent}
      </div>
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
