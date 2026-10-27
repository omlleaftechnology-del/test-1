// Translation keeps original DOM text, so switching back never loses content.
(() => {
  const originals = new WeakMap();
  const attributes = new WeakMap();
  Pivert.language = 'fr';
  Pivert.t = text => Pivert.locales[Pivert.language]?.[text] || text;

  Pivert.setText = (element, french) => {
    element.textContent = french;
    Pivert.translate(element);
  };

  Pivert.translate = (root = document.body) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement.closest('script, style, .language-switch')) continue;
      if (!originals.has(node)) originals.set(node, node.textContent);
      const original = originals.get(node);
      const key = original.trim();
      if (Pivert.translations[key] || Pivert.locales.en[key] || Pivert.locales.es[key]) {
        node.textContent = original.replace(key, Pivert.t(key));
      }
    }
    root.querySelectorAll('[placeholder], [aria-label], img[alt]').forEach(element => {
      if (!attributes.has(element)) {
        attributes.set(element, ['placeholder', 'aria-label', 'alt']
          .filter(name => element.hasAttribute(name))
          .map(name => [name, element.getAttribute(name)]));
      }
      attributes.get(element).forEach(([name, value]) => {
        element.setAttribute(name, Pivert.t(value));
      });
    });
  };

  Pivert.setLanguage = (language) => {
    Pivert.language = ['fr','en','ru','es'].includes(language) ? language : 'fr';
    document.documentElement.lang = Pivert.language;
    document.title = Pivert.t('Pivert — Trouvez votre espace');
    const descriptions = {
      fr:'Pivert : gestion immobilière pour propriétaires, conciergerie pour locataires et déménagement.',
      en:'Pivert: property management for owners, tenant concierge and moving services.',
      ru:'Pivert: управление недвижимостью, поддержка жильцов и переезд.',
      es:'Pivert: gestión inmobiliaria, conserjería para inquilinos y mudanzas.'
    };
    document.querySelector('meta[name="description"]').content = descriptions[Pivert.language];
    Pivert.translate();
    document.querySelectorAll('[data-language]').forEach(button => {
      button.setAttribute('aria-pressed', button.dataset.language === Pivert.language);
    });
    Pivert.updateCount?.();
    Pivert.refreshModelLanguage?.();
    try { localStorage.setItem('pivert-language-v3', Pivert.language); } catch {}
  };
})();
