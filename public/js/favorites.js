export function setupFavorites() {
  const buttons = document.querySelectorAll(".favorite-btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", async function () {
      const postId = this.dataset.id;
      const icon = this.querySelector("img");
      const isFull = icon.src.includes("heart-full.svg");

      try {
        const url = isFull ? "/favorites/remove" : "/favorites";
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: postId })
        });

        if (res.ok) {
          icon.src = isFull
            ? "/assets/icons/heart-empty.svg"
            : "/assets/icons/heart-full.svg";
        }
      } catch (err) {
        console.error("Fout bij favoriet toevoegen/verwijderen:", err);
      }
    });
  });
}