export function setupThemeChange() {
  const body = document.querySelector("body");
  const modeToggle = document.querySelector(".btn-theme-change");

  
  if (!modeToggle) return;

  modeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    modeToggle.classList.toggle("active");
    body.classList.toggle("dark");
  });
}