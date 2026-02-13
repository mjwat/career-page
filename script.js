async function loadData() {
  const response = await fetch("data/en.json");
  const data = await response.json();

  const app = document.getElementById("app");

  const profileEl = ensureSection(app, "profile");
  const summaryEl = ensureSection(app, "summary");
  const contactEl = ensureSection(app, "contact");
  const experienceEl = ensureSection(app, "experience");
  const educationEl = ensureSection(app, "education");
  const certificationsEl = ensureSection(app, "certifications");
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

  renderCertifications(certificationsEl, data.certifications);
  console.log("Certifications", data.certifications);

  renderLanguages(languagesEl, data.languages);
  console.log("Languages", data.languages);

  renderPreferences(preferencesEl, data.workPreferences);
  console.log("Preferences", data.workPreferences);

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
  const articles = items
    .map((item) => {
      const responsibilities = renderGroupedList("Responsibilities", item.responsibilities);
      const achievements = renderGroupedList("Achievements", item.achievements);

      return `
        <article>
          <h3>${escapeHtml(item.company)}</h3>
          <p>${escapeHtml(item.companyType || "")}</p>
          <p>${escapeHtml(item.position || "")}</p>
          <p>${escapeHtml(item.period || "")}</p>
          ${item.projects ? `<p>${escapeHtml(item.projects)}</p>` : ""}
          ${item.stack ? `<p>${escapeHtml(item.stack)}</p>` : ""}
          ${responsibilities}
          ${achievements}
        </article>
      `;
    })
    .join("");

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

function renderCertifications(container, items = []) {
  container.innerHTML = `
    <section>
      <h2>Certifications</h2>
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
  container.innerHTML = `
    <section>
      <h2>Preferences</h2>
      ${workPreferences ? `<p>${escapeHtml(workPreferences)}</p>` : ""}
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

  const categories = Object.entries(keySkills)
    .map(([category, items]) => {
      if (category === "Tools & Technologies" && items && typeof items === "object") {
        const subcategories = Object.entries(items)
          .map(([subCategory, subItems]) => {
            return `
              <li>
                ${escapeHtml(subCategory)}
                ${renderList(subItems)}
              </li>
            `;
          })
          .join("");

        return `
          <section>
            <h3>${escapeHtml(category)}</h3>
            <ul>${subcategories}</ul>
          </section>
        `;
      }

      return `
        <section>
          <h3>${escapeHtml(category)}</h3>
          ${renderList(items)}
        </section>
      `;
    })
    .join("");

  container.innerHTML = `
    <section>
      <h2>Key Skills</h2>
      ${categories}
    </section>
  `;
}

function renderGroupedList(title, groups) {
  if (!groups || typeof groups !== "object") {
    return "";
  }

  const entries = Object.entries(groups)
    .map(([groupName, items]) => {
      return `
        <section>
          <h4>${escapeHtml(groupName)}</h4>
          ${renderList(items)}
        </section>
      `;
    })
    .join("");

  return `
    <section>
      <h4>${escapeHtml(title)}</h4>
      ${entries}
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
