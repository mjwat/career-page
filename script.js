async function loadData() {
  const response = await fetch("data/en.json");
  const data = await response.json();

  const app = document.getElementById("app");

  const profileEl = ensureSection(app, "profile");
  const summaryEl = ensureSection(app, "summary");
  const contactEl = ensureSection(app, "contact");
  const experienceEl = ensureSection(app, "experience");
  const educationEl = ensureSection(app, "education");
  const languagesEl = ensureSection(app, "languages");
  const preferencesEl = ensureSection(app, "preferences");
  const aboutEl = ensureSection(app, "about");
  const keySkillsEl = ensureSection(app, "keySkills");

  renderProfile(profileEl, data.profile);
  console.log("Profile", data.profile);

  renderSummary(summaryEl, data.summary);
  console.log("Summary rendered");

  renderContact(contactEl, data.contact);
  console.log("Contact", data.contact);

  renderExperience(experienceEl, data.professionalExperience);
  console.log("Experience", data.professionalExperience);

  renderEducation(educationEl, data.education);
  console.log("Education", data.education);

  renderLanguages(languagesEl, data.languages);
  console.log("Languages", data.languages);

  const preferencesText = data.preferences ?? data.workPreferences;
  renderPreferences(preferencesEl, preferencesText);
  console.log("Preferences", preferencesText);

  renderAbout(aboutEl, data.about);
  console.log("About", data.about);

  renderKeySkills(keySkillsEl, data.keySkills);
  console.log("Key Skills", data.keySkills);
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

function renderSummary(container, summary) {
  container.innerHTML = `
    <section>
      <h2>Summary</h2>
      ${renderParagraphs(summary)}
    </section>
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

function renderExperience(container, items = []) {
  let articles = "";
  items.forEach((item) => {
    const responsibilities = renderGroupedOrFlatList("Responsibilities", item.responsibilities);
    const achievements = renderGroupedOrFlatList("Achievements", item.achievements);

    articles += `
      <article>
        <p>${escapeHtml(item.position || "")}</p>
        <p>${escapeHtml(item.company || "")} (${escapeHtml(item.companyType || "")}), ${escapeHtml(item.period || "")}</p>
        ${item.projects ? `<p>Projects: ${escapeHtml(item.projects)}</p>` : ""}
        ${item.stack ? `<p>Stack: ${escapeHtml(item.stack)}</p>` : ""}
        ${responsibilities}
        ${achievements}
      </article>
    `;

    console.log(`Experience entry rendered: ${item.company}`);
  });

  container.innerHTML = `
    <section>
      <h2>Experience</h2>
      ${articles}
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

function renderPreferences(container, workPreferences) {
  const paragraphs = splitIntoParagraphs(workPreferences)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");

  container.innerHTML = `
    <section>
      <h2>Preferences</h2>
      ${paragraphs}
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

function renderKeySkills(container, keySkills) {
  if (!keySkills) {
    container.innerHTML = `
      <section>
        <h2>Key Skills</h2>
      </section>
    `;
    return;
  }

  let categories = "";
  Object.entries(keySkills).forEach(([category, items]) => {
    if (category === "Tools & Technologies" && items && typeof items === "object") {
      const subcategories = Object.entries(items)
        .map(([subCategory, subItems]) => {
          const line = Array.isArray(subItems) ? subItems.join(", ") : "";
          return `<li>${escapeHtml(subCategory)}: ${escapeHtml(line)}</li>`;
        })
        .join("");

      categories += `
        <section>
          <h3>${escapeHtml(category)}</h3>
          <ul>${subcategories}</ul>
        </section>
      `;
      console.log(`Key Skills category rendered: ${category}`);
      return;
    }

    categories += `
      <section>
        <h3>${escapeHtml(category)}</h3>
        ${renderList(items)}
      </section>
    `;
    console.log(`Key Skills category rendered: ${category}`);
  });

  container.innerHTML = `
    <section>
      <h2>Key Skills</h2>
      ${categories}
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
  const hasNonProjectRelated =
    Array.isArray(nonProjectRelated) && nonProjectRelated.length > 0;

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

  const flatItems = hasProjectRelated ? projectRelated : nonProjectRelated;
  if (!flatItems) {
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
  const listItems = items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
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

  return text
    .split(/(?<=[.!?])\s+/)
    .filter((line) => line.trim().length > 0);
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

loadData();
