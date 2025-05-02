import { setupFavorites } from './favorites.js';
import { setupCategoryFilter } from './filter.js';
import './welcome.js'; 


document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".mobile-menu-toggle");
  const menu = document.querySelector(".nav-links");

  toggle.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  setupFavorites();
  setupCategoryFilter();
});