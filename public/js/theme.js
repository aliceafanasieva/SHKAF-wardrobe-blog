export function setupThemeChange() {
  const body = document.querySelector("body");
  const modeToggle = document.querySelector(".btn-theme-change");

  
  if (!modeToggle) return;

  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add("dark");
    body.classList.add("dark");
    modeToggle.classList.add("active");
  }


  modeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    body.classList.toggle("dark");
    modeToggle.classList.toggle("active");

    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}