export function setupThemeChange() {
  const modeToggle = document.querySelector(".btn-theme-change");
  
  if (!modeToggle) return;

  modeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark-theme");
    modeToggle.classList.toggle("active");
  });
}