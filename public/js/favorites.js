export function setupFavorites() {
  const buttons = document.querySelectorAll('.favorite-btn');
  const userEmail = new URLSearchParams(window.location.search).get('user');

  if (!userEmail) {
    return;
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', async function () {
      const postId = this.dataset.id;
      const iconUse = this.querySelector('use');

      if (!iconUse) {
        return;
      }

      const currentIcon = iconUse.getAttribute('href');
      const isFull = currentIcon === '#icon-heart-full';
      const url = isFull ? '/favorites/remove' : '/favorites';

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: postId,
            userEmail: userEmail
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(function () {
            return {};
          });

          console.error('Favorite request failed:', errorData);
          return;
        }

        iconUse.setAttribute(
          'href',
          isFull ? '#icon-heart-empty' : '#icon-heart-full'
        );
      } catch (error) {
        console.error('Error while toggling favorite:', error);
      }
    });
  });
}