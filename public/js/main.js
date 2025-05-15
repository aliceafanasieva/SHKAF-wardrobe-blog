import { setupFavorites } from './favorites.js';
import { setupCategoryFilter } from './filter.js';
import { setupThemeChange } from './theme.js';
import './welcome.js'; 

function setupMobileMenu() {
  const toggle = document.querySelector(".mobile-menu-toggle");
  const menu = document.querySelector(".nav-links");

  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupFavorites();
  setupCategoryFilter();
  setupThemeChange();
  setupMobileMenu();
});
