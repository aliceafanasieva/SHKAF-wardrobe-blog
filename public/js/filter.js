export function setupCategoryFilter() {
  const filterButtons = document.querySelectorAll(".categories-list button");
  const blogPosts = document.querySelectorAll(".blog-post-card");

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const selectedCategory = button.dataset.filter;

      // Zet actieve knop
      filterButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      // Filteren van posts
      blogPosts.forEach(post => {
        const category = post.dataset.category;
        post.style.display = (selectedCategory === "all" || category === selectedCategory)
          ? "flex"
          : "none";
      });
    });
  });
}