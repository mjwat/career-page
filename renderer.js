const LANGUAGE_STORAGE_KEY = "cvLanguage";
const SUPPORTED_LANGUAGES = ["en", "ru"];
let currentRenderId = 0;

document.addEventListener("DOMContentLoaded", () => {
  renderFromStorage();
});

document.addEventListener("resume-language-change", (event) => {
  const language = event.detail?.language;
  renderLanguage(language);
});

function getStoredLanguage() {
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return SUPPORTED_LANGUAGES.includes(savedLanguage) ? savedLanguage : "en";
}

function renderFromStorage() {
  renderLanguage(getStoredLanguage());
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
  const app = document.getElementById("app");
  const profileEl = ensureSection(app, "profile");
  const contactEl = ensureSection(app, "contact");
  const summaryEl = ensureSection(app, "summary");
  const keySkillsEl = ensureSection(app, "keySkills");
  const experienceEl = ensureSection(app, "experience");
  const educationEl = ensureSection(app, "education");
  const languagesEl = ensureSection(app, "languages");
  const aboutEl = ensureSection(app, "about");
  const preferencesEl = ensureSection(app, "preferences");

  renderProfile(profileEl, data.profile);
  renderContact(contactEl, data.contact);
  renderSummary(summaryEl, data.summary);
  renderKeySkills(keySkillsEl, data.keySkills);
  renderExperience(experienceEl, data.professionalExperience);
  renderEducation(educationEl, data.education);
  renderLanguages(languagesEl, data.languages);
  renderAbout(aboutEl, data.about);
  renderPreferences(preferencesEl, data.preferences ?? data.workPreferences);
}

function ensureSection(parent, id) {
  let section = document.getElementById(id);
  if (!section) {
    section = document.createElement("section");
    section.id = id;
    parent.append(section);
  }
  return section;
}

function renderProfile(container, profile) {
  container.innerHTML = `
    <header>
      <h1>${escapeHtml(profile?.name || "")}</h1>
      <p>${escapeHtml(profile?.title || "")}</p>
    </header>
  `;
}

function renderContact(container, contact) {
  container.innerHTML = `
    <section>
      <h2>Contact</h2>
      <ul>
        ${contact?.email ? `<li>Email: <a href="mailto:${escapeAttr(contact.email)}">${escapeHtml(contact.email)}</a></li>` : ""}
        ${contact?.linkedin ? `<li>LinkedIn: <a href="${escapeAttr(contact.linkedin)}">${escapeHtml(contact.linkedin)}</a></li>` : ""}
        ${contact?.location ? `<li>Location: ${escapeHtml(contact.location)}</li>` : ""}
      </ul>
    </section>
  `;
}

function renderSummary(container, summary) {
  container.innerHTML = `
    <section>
      <h2>Summary</h2>
      ${renderParagraphs(summary)}
    </section>
  `;
}

function renderKeySkills(container, keySkills) {
  if (!keySkills || typeof keySkills !== "object") {
    container.innerHTML = `
      <section>
        <h2>Key Skills</h2>
      </section>
    `;
    return;
  }

  const categories = Object.entries(keySkills)
    .map(([category, value]) => renderSkillCategory(category, value))
    .join("");

  container.innerHTML = `
    <section>
      <h2>Key Skills</h2>
      ${categories}
    </section>
  `;
}

function renderSkillCategory(name, value) {
  if (name === "Tools & Technologies" && value && typeof value === "object") {
    const lines = Object.entries(value)
      .map(([subName, subItems]) => {
        const itemLine = Array.isArray(subItems) ? subItems.join(", ") : "";
        const isPrioritySubcategory =
          subName === "Tasks & defect tracking" || subName === "Test management";
        const label = isPrioritySubcategory
          ? `<strong>${escapeHtml(subName)}:</strong>`
          : `${escapeHtml(subName)}:`;
        return `<li>${label} ${escapeHtml(itemLine)}</li>`;
      })
      .join("");

    return `
      <section>
        <h3>${escapeHtml(name)}</h3>
        <ul>${lines}</ul>
      </section>
    `;
  }

  if (Array.isArray(value)) {
    return `
      <section>
        <h3>${escapeHtml(name)}</h3>
        ${renderList(value)}
      </section>
    `;
  }

  if (value && typeof value === "object") {
    const nested = Object.entries(value)
      .map(([subName, subValue]) => {
        if (Array.isArray(subValue)) {
          return `
            <li>
              <h4>${escapeHtml(subName)}</h4>
              ${renderList(subValue)}
            </li>
          `;
        }

        return `
          <li>
            <h4>${escapeHtml(subName)}</h4>
            ${renderObjectAsList(subValue)}
          </li>
        `;
      })
      .join("");

    return `
      <section>
        <h3>${escapeHtml(name)}</h3>
        <ul>${nested}</ul>
      </section>
    `;
  }

  return `
    <section>
      <h3>${escapeHtml(name)}</h3>
      <p>${escapeHtml(value ?? "")}</p>
    </section>
  `;
}

function renderObjectAsList(value) {
  if (!value || typeof value !== "object") {
    return "";
  }

  const items = Object.entries(value)
    .map(([name, nestedValue]) => {
      if (Array.isArray(nestedValue)) {
        return `
          <li>
            <h5>${escapeHtml(name)}</h5>
            ${renderList(nestedValue)}
          </li>
        `;
      }

      return `
        <li>
          <h5>${escapeHtml(name)}</h5>
          ${renderObjectAsList(nestedValue)}
        </li>
      `;
    })
    .join("");

  return `<ul>${items}</ul>`;
}

function renderExperience(container, items = []) {
  const articles = items
    .map((item) => {
      const responsibilities = renderGroupedOrFlatList("Responsibilities", item.responsibilities);
      const achievements = renderGroupedOrFlatList("Achievements", item.achievements);

      return `
        <article>
          <p>${escapeHtml(item.position || "")}</p>
          <p>${escapeHtml(item.company || "")} (${escapeHtml(item.companyType || "")}), ${escapeHtml(item.period || "")}</p>
          ${item.projects ? `<p>Projects: ${escapeHtml(item.projects)}</p>` : ""}
          ${item.stack ? `<p>Stack: ${escapeHtml(item.stack)}</p>` : ""}
          ${responsibilities}
          ${achievements}
        </article>
      `;
    })
    .join("");

  container.innerHTML = `
    <section>
      <h2>Professional Experience</h2>
      ${articles}
    </section>
  `;
}

function renderGroupedOrFlatList(title, groups) {
  if (!groups || typeof groups !== "object") {
    return "";
  }

  const projectRelated = groups["Project-related"];
  const nonProjectRelated = groups["Non-project-related"];
  const hasProjectRelated = Array.isArray(projectRelated) && projectRelated.length > 0;
  const hasNonProjectRelated = Array.isArray(nonProjectRelated) && nonProjectRelated.length > 0;

  if (hasProjectRelated && hasNonProjectRelated) {
    return `
      <section>
        <h4>${escapeHtml(title)}</h4>
        <section>
          <h5>Project-related</h5>
          ${renderList(projectRelated)}
        </section>
        <section>
          <h5>Non-project-related</h5>
          ${renderList(nonProjectRelated)}
        </section>
      </section>
    `;
  }

  const flatItems = hasProjectRelated ? projectRelated : hasNonProjectRelated ? nonProjectRelated : [];
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

function renderEducation(container, items = []) {
  container.innerHTML = `
    <section>
      <h2>Education</h2>
      ${renderList(items)}
    </section>
  `;
}

function renderLanguages(container, items = []) {
  container.innerHTML = `
    <section>
      <h2>Languages</h2>
      ${renderList(items)}
    </section>
  `;
}

function renderAbout(container, about) {
  container.innerHTML = `
    <section>
      <h2>About</h2>
      ${renderParagraphs(about)}
    </section>
  `;
}

function renderPreferences(container, text) {
  const paragraphs = splitIntoParagraphs(text)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");

  container.innerHTML = `
    <section>
      <h2>Work Preferences</h2>
      ${paragraphs}
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

function renderParagraphs(text) {
  if (!text) {
    return "";
  }
  return text
    .split("\n\n")
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function splitIntoParagraphs(text) {
  if (!text) {
    return [];
  }

  if (text.includes("\n")) {
    return text.split(/\r?\n+/).filter((line) => line.trim().length > 0);
  }

  return text.split(/(?<=[.!?])\s+/).filter((line) => line.trim().length > 0);
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
