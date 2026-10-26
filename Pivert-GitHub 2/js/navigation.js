// Navigation and catalog tabs share a single selected category.
Pivert.initNavigation = () => {
  const links = [...document.querySelectorAll('header nav a')];
  const select = (selected) => links.forEach(link => {
    link.classList.toggle('selected', link === selected);
    if (link === selected) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });

  document.querySelectorAll('[data-category]').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelector(`[data-filter="${link.dataset.category}"]`).click();
    });
  });

  links.forEach(link => link.addEventListener('click', () => {
    if (link.dataset.navFilter) {
      document.querySelector(`[data-filter="${link.dataset.navFilter}"]`).click();
    } else select(link);
  }));

  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      select(links.find(link => link.dataset.navFilter === button.dataset.filter));
    });
  });
};
