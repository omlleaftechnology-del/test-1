// Screenshots captured from Leaf Technology's resident demo, without redrawing UI.
document.querySelectorAll('[data-unitly-screen]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelector('#unitly-screenshot').src = button.dataset.unitlyScreen;
    document.querySelectorAll('[data-unitly-screen]').forEach(tab => {
      tab.setAttribute('aria-pressed', tab === button);
    });
  });
});
