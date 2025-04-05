const name = new URLSearchParams(window.location.search).get("name");

if (name) {
  const welcomeText = document.querySelector('.dynamic-welcome');
  if (welcomeText) {
    welcomeText.innerHTML = `Welcome dear ${name}!`;
  }
}