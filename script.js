async function loadData() {
  const response = await fetch("data/en.json");
  const data = await response.json();

  const profileEl = document.getElementById("profile");
  profileEl.innerHTML = `
    <h1>${data.profile.name}</h1>
    <p>${data.profile.role}</p>
  `;
}

loadData();
