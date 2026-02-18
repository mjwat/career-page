document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("scroll-top");
  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
