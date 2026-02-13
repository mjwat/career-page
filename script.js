async function loadData() {
  const response = await fetch("data/en.json");
  const data = await response.json();
  console.log(data);
}

loadData();
