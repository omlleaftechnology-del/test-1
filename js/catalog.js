// Property filters, detail dialog and service shortcuts.
Pivert.initCatalog = () => {
  const dialog = document.querySelector('#detail');
  const request = document.querySelector('#request');
  const cards = [...document.querySelectorAll('.property')];
  let activePhotos = [];
  let photoIndex = 0;
  let realPhotos = false;
  let imageLabel = "Photo d’ambiance";
  const imageUrl = (id, width = 1200) => id.startsWith("assets/") || id.startsWith("data:") ? id : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
  const showPhoto = (index) => {
    photoIndex = (index + activePhotos.length) % activePhotos.length;
    const image = document.querySelector('#gallery-image');
    image.src = imageUrl(activePhotos[photoIndex]);
    image.alt = Pivert.t(imageLabel) + ' ' + (photoIndex + 1);
    document.querySelector('#gallery-counter').textContent = `${photoIndex + 1} / ${activePhotos.length}`;
    document.querySelectorAll('#gallery-thumbnails button').forEach((button, i) => button.setAttribute('aria-pressed', i === photoIndex));
  };
  document.querySelector('.gallery-arrow.previous').onclick = () => showPhoto(photoIndex - 1);
  document.querySelector('.gallery-arrow.next').onclick = () => showPhoto(photoIndex + 1);
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(photoIndex + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });

  const filters = [...document.querySelectorAll('[data-filter]')];

  Pivert.updateCount = () => {
    const count = cards.filter(card => !card.hidden).length;
    const labels = {
      fr: `${count} espace${count > 1 ? 's' : ''} à découvrir`,
      en: `${count} ${count === 1 ? 'property' : 'properties'} to explore`,
      ru: `Вариантов: ${count}`,
      es: `${count} ${count === 1 ? 'inmueble' : 'inmuebles'} para explorar`
    };
    document.querySelector('#result-count').textContent = labels[Pivert.language];
  };

  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(filter => {
      const active = filter === button;
      filter.classList.toggle('active', active);
      filter.setAttribute('aria-pressed', active);
    });
    cards.forEach(card => {
      card.hidden = button.dataset.filter !== 'all'
        && card.dataset.type !== button.dataset.filter;
    });
    Pivert.updateCount();
  }));

  document.querySelectorAll('[data-detail]').forEach(button => {
    button.addEventListener('click', () => {
      const [type, title, copy, value] = Pivert.details[button.dataset.detail];
      Pivert.setText(document.querySelector('#detail-type'), type);
      Pivert.setText(document.querySelector('#detail-title'), title);
      Pivert.setText(document.querySelector('#detail-copy'), copy);
      document.querySelector('#detail-cta').onclick = () => {
        request.value = value;
        dialog.close();
      };
      const property = Pivert.properties[button.dataset.detail];
      Pivert.setText(document.querySelector('#detail-area'), property.area);
      Pivert.setText(document.querySelector('#detail-address'), property.address);
      Pivert.setText(document.querySelector('#detail-price'), property.price);
      Pivert.setModelAvailable(button.dataset.detail === 'foucault' || !!property.model, property.model);
      realPhotos = Boolean(property.realPhotos);
      imageLabel = property.imageLabel || (realPhotos ? "Photo du local" : "Photo d’ambiance");
      const disclaimer = document.querySelector('.gallery-disclaimer');
      disclaimer.hidden = realPhotos;
      Pivert.setText(disclaimer, property.galleryNote || 'Photos d’ambiance — non contractuelles');
      const availability = document.querySelector('#detail-availability');
      availability.hidden = !property.availability;
      if (property.availability) Pivert.setText(availability, property.availability);
      document.querySelector('#detail-extra').hidden = !property.features;
      document.querySelector('#detail-uses-heading').hidden = !property.uses?.length;
      document.querySelector('#detail-uses').hidden = !property.uses?.length;
      Pivert.setText(document.querySelector('#detail-extra .rent-note'), property.rentNote || 'Période de facturation et conditions du loyer à préciser.');
      [['detail-features', property.features], ['detail-uses', property.uses]].forEach(([id, items]) => {
        const list = document.getElementById(id);
        list.replaceChildren();
        (items || []).forEach(text => {
          const li = document.createElement('li');
          Pivert.setText(li, text);
          list.append(li);
        });
      });
      activePhotos = property.photos;
      const thumbnails = document.querySelector('#gallery-thumbnails');
      thumbnails.replaceChildren();
      activePhotos.forEach((id, index) => {
        const thumb = document.createElement('button');
        thumb.type = 'button';
        thumb.setAttribute('aria-label', Pivert.t(imageLabel) + ' ' + (index + 1));
        const image = document.createElement('img');
        image.src = imageUrl(id, 180);
        image.alt = '';
        thumb.append(image);
        thumb.onclick = () => showPhoto(index);
        thumbnails.append(thumb);
      });
      showPhoto(0);
      dialog.setAttribute("tabindex", "-1");
      dialog.showModal();
      dialog.scrollTop = 0;
      dialog.focus({preventScroll:true});
    });
  });

  document.querySelector('.close').onclick = () => dialog.close();
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right
      || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });

  document.querySelectorAll('[data-service]').forEach(button => {
    button.addEventListener('click', () => {
      request.value = button.dataset.service;
      document.querySelector('#contact').scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
      request.focus({ preventScroll: true });
    });
  });
};
