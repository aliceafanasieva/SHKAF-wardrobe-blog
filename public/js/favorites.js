export function setupFavorites() {
  const buttons = document.querySelectorAll(".favorite-btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", async function () {
      const postId = this.dataset.id;
      const icon = this.querySelector("use");
      const isFull = icon.getAttribute("href").includes("icon-heart-full");

      try {
        const url = isFull ? "/favorites/remove" : "/favorites";
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: postId })
        });

        if (res.ok) {
          icon.setAttribute("href", isFull ? "#icon-heart-empty" : "#icon-heart-full");
        }
      } catch (err) {
        console.error("Fout bij favoriet toevoegen/verwijderen:", err);
      }
    });
  });
}