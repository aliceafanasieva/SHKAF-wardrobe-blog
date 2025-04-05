import { setupFavorites } from './favorites.js';
import { setupCategoryFilter } from './filter.js';
import './welcome.js'; 

document.addEventListener("DOMContentLoaded", () => {
  setupFavorites();
  setupCategoryFilter();
});