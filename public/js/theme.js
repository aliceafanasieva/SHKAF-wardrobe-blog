export function setupThemeChange() {
  const body = document.querySelector("body");
  const modeToggle = document.querySelector(".btn-theme-change");


  const updateLogos = () => {
    const isDark = body.classList.contains("dark");
    const logoSrc = isDark 
      ? "/assets/logo/logo_pink.svg" 
      : "/assets/logo/logo_red.svg";

    document.querySelectorAll("[data-theme-logo]").forEach(img => {
      img.src = logoSrc;
    });
  };

  updateLogos();
  
  if (!modeToggle) return;

  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add("dark");
    body.classList.add("dark");
    modeToggle.classList.add("active");
    updateLogos();
  }


  modeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    body.classList.toggle("dark");
    modeToggle.classList.toggle("active");

    updateLogos();
    localStorage.setItem("theme", isDark ? "dark" : "light");

  });
}